/**
 * Agent Tool Registry
 * Defines all tools available to the autonomous agents.
 * Each tool has: name, description (for the LLM), parameters schema, and execute().
 * 
 * Tools are the "hands" of the agent — they let it take real actions
 * in the UI, data layer, and user experience.
 */

// ── Tool Definitions ──────────────────────────────────────────────────

export const TOOL_DEFINITIONS = [
  {
    name: 'createTask',
    description: 'Creates a new task card in the user\'s task list. Use when the user mentions something they need to do.',
    parameters: '{ "id": "unique-id", "title": "Task title", "priority": "high|medium|low", "status": "todo" }',
  },
  {
    name: 'updateTask',
    description: 'Updates an existing task status. Use to mark tasks as done or skipped.',
    parameters: '{ "id": "task-id", "status": "done|skipped|todo" }',
  },
  {
    name: 'sendMessage',
    description: 'Sends a message to the user in the chat. Use for nudges, encouragement, and proactive check-ins.',
    parameters: '{ "text": "Message to display", "tone": "gentle|encouraging|urgent|celebratory" }',
  },
  {
    name: 'setTimer',
    description: 'Starts a countdown timer (e.g., Pomodoro, break). Duration in seconds.',
    parameters: '{ "duration": 900, "label": "Focus Session", "type": "pomodoro|break|hydration" }',
  },
  {
    name: 'triggerBreathing',
    description: 'Opens the 4-7-8 breathing exercise screen. Use when user shows high stress or anxiety.',
    parameters: '{}',
  },
  {
    name: 'playAmbient',
    description: 'Starts ambient background sound. Options: rain, forest, piano.',
    parameters: '{ "track": "rain|forest|piano" }',
  },
  {
    name: 'saveMood',
    description: 'Records the user\'s current mood for trend tracking.',
    parameters: '{ "mood": "string", "energy": 1-5 }',
  },
  {
    name: 'readAloud',
    description: 'Speaks text using text-to-speech. Use for accessibility or proactive reading.',
    parameters: '{ "text": "Text to speak" }',
  },
  {
    name: 'storeMemory',
    description: 'Stores a fact about the user in persistent memory. Use to remember preferences, patterns, and important context.',
    parameters: '{ "key": "memory-key", "value": "any value" }',
  },
  {
    name: 'recallMemory',
    description: 'Retrieves a stored memory by key. Returns null if not found.',
    parameters: '{ "key": "memory-key" }',
  },
  {
    name: 'showNotification',
    description: 'Shows a toast notification to the user. Use for proactive nudges and celebrations.',
    parameters: '{ "title": "Notification title", "message": "Body text", "type": "info|success|warning|celebration" }',
  },
  {
    name: 'changeUISetting',
    description: 'Modifies a UI setting like theme, font size, or layout. Use to adapt the interface to user needs.',
    parameters: '{ "setting": "setting-name", "value": "new-value" }',
  },
];

/**
 * Generates the tools description string for the LLM system prompt.
 */
export function getToolsPrompt() {
  return TOOL_DEFINITIONS.map(
    t => `- ${t.name}: ${t.description}\n  Parameters: ${t.parameters}`
  ).join('\n\n');
}

// ── Tool Executors ─────────────────────────────────────────────────────
// Each executor takes (params, context) where context includes
// { updateAgentState, agentState, agentMemory, setAgentMemory, addToast, ... }

const executors = {
  createTask(params, ctx) {
    const id = params.id || `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const task = { id, title: params.title, priority: params.priority || 'medium', status: 'todo', createdAt: Date.now(), createdBy: 'agent' };
    const tasks = [...(ctx.agentState.tasks || []), task];
    ctx.updateAgentState({ tasks });
    return { success: true, taskId: id, message: `Created task: "${params.title}"` };
  },

  updateTask(params, ctx) {
    const tasks = [...(ctx.agentState.tasks || [])];
    const idx = tasks.findIndex(t => t.id === params.id);
    if (idx < 0) return { success: false, message: `Task ${params.id} not found` };
    tasks[idx] = { ...tasks[idx], ...params, updatedAt: Date.now() };
    ctx.updateAgentState({ tasks });
    return { success: true, message: `Updated task ${params.id} to ${params.status}` };
  },

  sendMessage(params, ctx) {
    const messages = [...(ctx.agentState.messages || []), {
      sender: 'agent',
      text: params.text,
      tone: params.tone || 'gentle',
      time: Date.now(),
    }];
    ctx.updateAgentState({ messages });
    return { success: true, message: 'Message sent' };
  },

  setTimer(params, ctx) {
    ctx.updateAgentState({
      settings: {
        ...(ctx.agentState.settings || {}),
        activeTimer: {
          duration: params.duration || 900,
          label: params.label || 'Timer',
          type: params.type || 'pomodoro',
          startedAt: Date.now(),
        },
      },
    });
    return { success: true, message: `Timer started: ${params.label} (${params.duration}s)` };
  },

  triggerBreathing(params, ctx) {
    ctx.updateAgentState({
      settings: { ...(ctx.agentState.settings || {}), breathingActive: true },
    });
    return { success: true, message: 'Breathing exercise triggered' };
  },

  playAmbient(params, ctx) {
    ctx.updateAgentState({
      settings: { ...(ctx.agentState.settings || {}), ambientTrack: params.track || 'rain' },
    });
    return { success: true, message: `Playing ambient: ${params.track}` };
  },

  saveMood(params, ctx) {
    const key = `fello_mood_${ctx.activeCategory}`;
    const log = JSON.parse(localStorage.getItem(key) || '[]');
    const today = new Date().toISOString().slice(0, 10);
    const filtered = log.filter(e => e.date !== today);
    filtered.push({ date: today, mood: params.mood, energy: params.energy, time: Date.now() });
    localStorage.setItem(key, JSON.stringify(filtered.slice(-30)));
    return { success: true, message: `Mood saved: ${params.mood}` };
  },

  readAloud(params) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(params.text);
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
      return { success: true, message: 'Reading aloud' };
    }
    return { success: false, message: 'Speech synthesis not available' };
  },

  storeMemory(params, ctx) {
    const memory = { ...(ctx.agentMemory || {}) };
    memory[params.key] = { value: params.value, storedAt: Date.now() };
    ctx.setAgentMemory(memory);
    return { success: true, message: `Stored memory: ${params.key}` };
  },

  recallMemory(params, ctx) {
    const entry = ctx.agentMemory?.[params.key];
    return { success: true, value: entry?.value ?? null, message: entry ? `Recalled: ${params.key}` : `No memory for: ${params.key}` };
  },

  showNotification(params, ctx) {
    ctx.addToast?.({
      title: params.title || 'Agent',
      message: params.message,
      type: params.type || 'info',
    });
    return { success: true, message: 'Notification shown' };
  },

  changeUISetting(params, ctx) {
    ctx.updateAgentState({
      settings: { ...(ctx.agentState.settings || {}), [params.setting]: params.value },
    });
    return { success: true, message: `UI setting "${params.setting}" → ${params.value}` };
  },
};

/**
 * Executes a tool call from the agent.
 * Returns { success, message, ...result }
 */
export function executeTool(name, params, context) {
  const executor = executors[name];
  if (!executor) {
    return { success: false, message: `Unknown tool: ${name}` };
  }
  try {
    return executor(params, context);
  } catch (err) {
    return { success: false, message: `Tool "${name}" failed: ${err.message}` };
  }
}
