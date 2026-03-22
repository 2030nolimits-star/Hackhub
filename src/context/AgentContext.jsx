import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AgentContext = createContext();

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};

// ── Memory persistence helpers ──────────────────────────────────────────
const MEMORY_KEY = 'fello_agent_memory';

function loadMemory() {
  try { return JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}'); }
  catch { return {}; }
}

function persistMemory(memory) {
  try { localStorage.setItem(MEMORY_KEY, JSON.stringify(memory)); }
  catch { /* quota exceeded — silently fail */ }
}

export const AgentProvider = ({ children }) => {
  // Active condition category
  const [activeCategory, setActiveCategory] = useState(null);

  // Core agent state — tasks, messages, settings
  const [agentState, setAgentState] = useState({
    tasks: [],
    messages: [],
    settings: {},
    lastActionTimestamp: Date.now(),
  });

  // Persistent memory — survives page reloads and session changes
  const [agentMemory, setAgentMemoryRaw] = useState(loadMemory);

  // Agent activity log — visible in the Agent Activity Panel
  const [agentLog, setAgentLog] = useState([]);

  // Agent status — drives animated status indicators
  const [agentStatus, setAgentStatus] = useState('idle'); // idle | thinking | acting | error

  // Toast notification queue
  const [toasts, setToasts] = useState([]);

  // Sync memory to localStorage on change
  useEffect(() => { persistMemory(agentMemory); }, [agentMemory]);

  // Memory setter that auto-persists
  const setAgentMemory = useCallback((memoryOrUpdater) => {
    setAgentMemoryRaw(prev => {
      const next = typeof memoryOrUpdater === 'function' ? memoryOrUpdater(prev) : memoryOrUpdater;
      return next;
    });
  }, []);

  // Switch category — resets transient state but preserves memory
  const switchCategory = useCallback((category) => {
    setActiveCategory(category);
    setAgentState({
      tasks: [],
      messages: [],
      settings: {},
      lastActionTimestamp: Date.now(),
    });
    setAgentLog([]);
    setAgentStatus('idle');
  }, []);

  // Agent action dispatch — merges updates into agentState
  const updateAgentState = useCallback((updates) => {
    setAgentState(prev => ({
      ...prev,
      ...updates,
      lastActionTimestamp: Date.now(),
    }));
  }, []);

  // Append to agent log
  const addLogEntry = useCallback((entry) => {
    setAgentLog(prev => [...prev.slice(-49), { // keep last 50 entries
      ...entry,
      timestamp: entry.timestamp || Date.now(),
    }]);
  }, []);

  // Toast management
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
    // Auto-dismiss after 6s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AgentContext.Provider
      value={{
        // Category
        activeCategory,
        switchCategory,
        // State
        agentState,
        updateAgentState,
        // Memory (persistent)
        agentMemory,
        setAgentMemory,
        // Activity log
        agentLog,
        addLogEntry,
        // Status
        agentStatus,
        setAgentStatus,
        // Toasts
        toasts,
        addToast,
        dismissToast,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};
