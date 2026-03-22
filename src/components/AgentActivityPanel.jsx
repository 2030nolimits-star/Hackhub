/**
 * Agent Activity Panel
 * Collapsible panel that shows the agent's reasoning, tool calls,
 * and memory in real-time. Makes autonomy VISIBLE to users and judges.
 */
import { useState } from 'react'
import { useAgent } from '../context/AgentContext'
import { motion, AnimatePresence } from 'framer-motion'

const STATUS_CONFIG = {
  idle:     { color: '#94a3b8', label: 'Idle',     dot: '⚪', pulse: false },
  thinking: { color: '#f59e0b', label: 'Thinking', dot: '🧠', pulse: true },
  acting:   { color: '#22c55e', label: 'Acting',   dot: '⚡', pulse: true },
  error:    { color: '#ef4444', label: 'Error',    dot: '⚠️', pulse: false },
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function AgentActivityPanel() {
  const { agentLog, agentStatus, agentMemory, activeCategory } = useAgent()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('log') // log | memory

  const status = STATUS_CONFIG[agentStatus] || STATUS_CONFIG.idle
  const recentLog = [...agentLog].reverse().slice(0, 20)

  // Count category memories
  const memoryEntries = Object.entries(agentMemory || {}).filter(
    ([k]) => k.startsWith((activeCategory || '') + '_') || k.startsWith('global_')
  )

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 1000,
          width: 52, height: 52, borderRadius: '50%',
          background: open ? '#1e1b4b' : '#312e81',
          border: `2px solid ${status.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 22,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={status.pulse ? { boxShadow: ['0 0 0 0 rgba(245,158,11,0.4)', '0 0 0 12px rgba(245,158,11,0)', '0 0 0 0 rgba(245,158,11,0.4)'] } : {}}
        transition={status.pulse ? { duration: 1.8, repeat: Infinity } : {}}
      >
        {status.dot}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed', bottom: 80, right: 20, zIndex: 999,
              width: 360, maxHeight: 480,
              background: '#0f0e1a', borderRadius: 16,
              border: '1px solid #2d2b5e',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden', fontFamily: 'system-ui, sans-serif',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid #1e1b4b',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: status.color,
                animation: status.pulse ? 'pulse 1.5s infinite' : 'none',
              }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e0ff', flex: 1 }}>
                Agent Brain — {status.label}
              </span>
              <span style={{ fontSize: 11, color: '#6b67a8' }}>
                {agentLog.length} actions
              </span>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #1e1b4b' }}>
              {[
                { id: 'log', label: '📋 Activity', count: agentLog.length },
                { id: 'memory', label: '💾 Memory', count: memoryEntries.length },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    flex: 1, padding: '10px', fontSize: 12, fontWeight: 600,
                    background: tab === t.id ? '#1e1b4b' : 'transparent',
                    color: tab === t.id ? '#c4b5fd' : '#6b67a8',
                    border: 'none', cursor: 'pointer',
                    borderBottom: tab === t.id ? '2px solid #7c3aed' : '2px solid transparent',
                    fontFamily: 'inherit',
                  }}
                >
                  {t.label} ({t.count})
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
              {tab === 'log' && (
                recentLog.length === 0 ? (
                  <p style={{ color: '#6b67a8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                    Agent starting up...
                  </p>
                ) : (
                  recentLog.map((entry, i) => (
                    <LogEntry key={i} entry={entry} />
                  ))
                )
              )}

              {tab === 'memory' && (
                memoryEntries.length === 0 ? (
                  <p style={{ color: '#6b67a8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                    No memories stored yet
                  </p>
                ) : (
                  memoryEntries.map(([key, val]) => (
                    <div key={key} style={{
                      padding: '8px 10px', marginBottom: 6,
                      background: '#161430', borderRadius: 8,
                      border: '1px solid #2d2b5e',
                    }}>
                      <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600, marginBottom: 2 }}>
                        {key.replace(activeCategory + '_', '').replace('global_', '🌐 ')}
                      </div>
                      <div style={{ fontSize: 12, color: '#c4b5fd' }}>
                        {typeof val.value === 'object' ? JSON.stringify(val.value) : String(val.value)}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  )
}

function LogEntry({ entry }) {
  const [expanded, setExpanded] = useState(false)

  const typeIcons = {
    tick: '🔄',
    retry: '🔁',
    error: '⚠️',
  }

  const toolIcons = {
    createTask: '📝',
    updateTask: '✅',
    sendMessage: '💬',
    setTimer: '⏱️',
    triggerBreathing: '🌬️',
    playAmbient: '🎵',
    saveMood: '😊',
    readAloud: '🔊',
    storeMemory: '💾',
    recallMemory: '🔍',
    showNotification: '🔔',
    changeUISetting: '🎨',
  }

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        padding: '8px 10px', marginBottom: 4,
        background: expanded ? '#161430' : 'transparent',
        borderRadius: 8, cursor: 'pointer',
        border: expanded ? '1px solid #2d2b5e' : '1px solid transparent',
        transition: 'all 0.15s',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>{typeIcons[entry.type] || '·'}</span>
        <span style={{ fontSize: 12, color: '#e2e0ff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.reasoning || entry.message || entry.error || `${entry.type} event`}
        </span>
        <span style={{ fontSize: 10, color: '#4a487a', flexShrink: 0 }}>
          {formatTime(entry.timestamp)}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #1e1b4b' }}>
          {entry.reasoning && (
            <div style={{ fontSize: 11, color: '#8b87c4', marginBottom: 6, lineHeight: 1.5 }}>
              💭 {entry.reasoning}
            </div>
          )}
          {entry.autonomous !== undefined && (
            <div style={{ fontSize: 11, color: entry.autonomous ? '#7c3aed' : '#22c55e', marginBottom: 4 }}>
              {entry.autonomous ? '🤖 Autonomous tick' : '👤 User-triggered'}
            </div>
          )}
          {entry.toolCalls?.length > 0 && (
            <div style={{ marginTop: 4 }}>
              {entry.toolCalls.map((tc, j) => (
                <div key={j} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 11, color: tc.success ? '#22c55e' : '#ef4444',
                  padding: '3px 0',
                }}>
                  <span>{toolIcons[tc.tool] || '🔧'}</span>
                  <span style={{ fontWeight: 600 }}>{tc.tool}</span>
                  <span style={{ color: '#6b67a8' }}>→ {tc.resultMessage}</span>
                </div>
              ))}
            </div>
          )}
          {entry.error && (
            <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>
              ❌ {entry.error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
