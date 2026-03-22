/**
 * Autonomous Agent Loop — Observe → Plan → Act → Reflect
 * 
 * This is the brain of each Fello agent. Instead of simple API wrappers,
 * agents run a real reasoning loop with tool-use, memory, and error recovery.
 * 
 * Flow per tick:
 * 1. OBSERVE  — gather state (tasks, messages, memory, time, user activity)
 * 2. PLAN     — ask Gemini what to do (returns message + tool calls)
 * 3. ACT      — execute each tool call via the tool registry
 * 4. REFLECT  — log outcomes, update memory, schedule next tick
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { getGeminiJsonModel } from './gemini';
import { useAgent } from '../context/AgentContext';
import { getToolsPrompt, executeTool } from './agentTools';
import { withRetry, getFallbackAction, createErrorLog } from './agentErrorRecovery';

export function useAgentLoop({
  systemPrompt,
  onAction,
  loopIntervalMs = 25000,
  tools = null, // optional tool name whitelist
}) {
  const {
    activeCategory, agentState, updateAgentState,
    agentMemory, setAgentMemory,
    addLogEntry, setAgentStatus, addToast,
  } = useAgent();

  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const thinkingRef = useRef(false);
  const lastUserActivityRef = useRef(Date.now());

  // Track user activity for adaptive intervals
  useEffect(() => {
    if (agentState.messages?.length > 0) {
      lastUserActivityRef.current = Date.now();
    }
  }, [agentState.messages?.length]);

  // ── OBSERVE ──────────────────────────────────────────────────────────
  const observe = useCallback(() => {
    const now = new Date();
    const recentMessages = (agentState.messages || []).slice(-10);
    const taskSummary = (agentState.tasks || []).map(t =>
      `[${t.status}] ${t.title}${t.priority ? ` (${t.priority})` : ''}`
    );

    // Pull relevant memories for this category
    const categoryMemories = {};
    Object.entries(agentMemory || {}).forEach(([k, v]) => {
      if (k.startsWith(activeCategory + '_') || k.startsWith('global_')) {
        categoryMemories[k] = v.value;
      }
    });

    return {
      category: activeCategory,
      time: now.toLocaleTimeString(),
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
      tasks: taskSummary,
      recentMessages: recentMessages.map(m => `${m.sender}: ${m.text}`),
      settings: agentState.settings,
      memories: categoryMemories,
      sessionDuration: Math.round((Date.now() - (agentState.lastActionTimestamp || Date.now())) / 60000),
      idleMinutes: Math.round((Date.now() - lastUserActivityRef.current) / 60000),
    };
  }, [activeCategory, agentState, agentMemory]);

  // ── PLAN (via Gemini) ────────────────────────────────────────────────
  const plan = useCallback(async (observation, userInput) => {
    const model = getGeminiJsonModel(); // uses default gemini-1.5-flash

    const prompt = `${systemPrompt}

═══ AVAILABLE TOOLS ═══
You can call any of these tools to take autonomous action:

${getToolsPrompt()}

═══ CURRENT STATE ═══
${JSON.stringify(observation, null, 2)}

═══ USER INPUT ═══
${userInput ? JSON.stringify(userInput) : 'None — this is an autonomous tick. Decide proactively if any action is needed.'}

═══ INSTRUCTIONS ═══
Based on the system prompt, current state, and user input, respond with a JSON object:
{
  "reasoning": "Brief explanation of your decision (1-2 sentences)",
  "message": "Optional message to show the user (null if none needed)",
  "toolCalls": [
    { "tool": "tool-name", "params": { ... } }
  ]
}

Rules:
- You MUST include "reasoning" explaining WHY you chose these actions
- "toolCalls" can be empty [] if no action is needed
- On autonomous ticks (no user input), only act if genuinely helpful — don't spam
- Use storeMemory to remember important user patterns and preferences
- Use showNotification for proactive nudges instead of sendMessage (less intrusive)
- Be genuinely helpful, not performative
`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }, [systemPrompt]);

  // ── ACT (execute tool calls) ──────────────────────────────────────────
  const act = useCallback((actionPlan) => {
    const results = [];

    // Build tool execution context
    const toolContext = {
      agentState,
      updateAgentState,
      agentMemory,
      setAgentMemory,
      addToast,
      activeCategory,
    };

    // Execute each tool call
    for (const call of (actionPlan.toolCalls || [])) {
      const result = executeTool(call.tool, call.params || {}, toolContext);
      results.push({ tool: call.tool, params: call.params, result });
    }

    // Also handle legacy onAction callback for mode-specific handling
    if (onAction) {
      onAction(actionPlan);
    }

    return results;
  }, [agentState, updateAgentState, agentMemory, setAgentMemory, addToast, activeCategory, onAction]);

  // ── REFLECT (log outcomes) ────────────────────────────────────────────
  const reflect = useCallback((observation, actionPlan, toolResults, isAutonomous) => {
    addLogEntry({
      type: 'tick',
      autonomous: isAutonomous,
      reasoning: actionPlan.reasoning,
      message: actionPlan.message,
      toolCalls: (actionPlan.toolCalls || []).map((c, i) => ({
        tool: c.tool,
        params: c.params,
        success: toolResults[i]?.result?.success,
        resultMessage: toolResults[i]?.result?.message,
      })),
    });
  }, [addLogEntry]);

  // ── TICK: The full Observe → Plan → Act → Reflect cycle ──────────────
  const tick = useCallback(async (userInput = null) => {
    if (!activeCategory || thinkingRef.current) return;
    if (document.visibilityState === 'hidden') return; // Save quota if tab is hidden

    thinkingRef.current = true;
    setIsThinking(true);
    setAgentStatus('thinking');
    setError(null);

    const isAutonomous = !userInput;

    try {
      // 1. OBSERVE
      const observation = observe();

      // 2. PLAN (with retry + error recovery)
      let actionPlan;
      try {
        actionPlan = await withRetry(
          () => plan(observation, userInput),
          {
            maxRetries: 2,
            backoffMs: 1000,
            onRetry: (attempt, err, delay) => {
              addLogEntry({
                type: 'retry',
                attempt,
                error: err.message,
                delayMs: delay,
              });
            },
          }
        );
      } catch (err) {
        // All retries failed — use fallback
        actionPlan = getFallbackAction(activeCategory);
        addLogEntry(createErrorLog(err, { phase: 'plan', recovered: true }));
        setAgentStatus('error');
      }

      // 3. ACT
      setAgentStatus('acting');
      const toolResults = act(actionPlan);

      // Add agent message if present
      if (actionPlan.message) {
        updateAgentState({ 
          messages: [...(agentState.messages || []), {
            sender: 'agent',
            text: actionPlan.message,
            time: Date.now(),
          }]
        });
      }

      // 4. REFLECT
      reflect(observation, actionPlan, toolResults, isAutonomous);

      setAgentStatus('idle');
    } catch (err) {
      console.error('Agent Loop Error:', err);
      setError(err.message);
      setAgentStatus('error');
      addLogEntry(createErrorLog(err, { phase: 'tick' }));
    } finally {
      thinkingRef.current = false;
      setIsThinking(false);
    }
  }, [activeCategory, observe, plan, act, reflect, agentState, updateAgentState, addLogEntry, setAgentStatus]);

  // ── Autonomous Loop with adaptive interval ───────────────────────────
  useEffect(() => {
    if (!activeCategory) return;

    // Initial tick after 2s delay
    const timeout = setTimeout(() => tick(), 2000);

    intervalRef.current = setInterval(() => {
      tick(); // autonomous tick
    }, loopIntervalMs);

    return () => {
      clearTimeout(timeout);
      clearInterval(intervalRef.current);
    };
  }, [activeCategory, loopIntervalMs]); // intentionally exclude tick to avoid re-creating interval

  // Manual trigger for user interactions
  const triggerAgent = useCallback((input) => {
    tick(input);
  }, [tick]);

  return {
    isThinking,
    triggerAgent,
    error,
  };
}
