/**
 * Agent Toast Notification System
 * Animated toasts for proactive agent messages.
 * Slides in from top-right, auto-dismisses after 6s.
 */
import { useAgent } from '../context/AgentContext'
import { motion, AnimatePresence } from 'framer-motion'

const TYPE_CONFIG = {
  info:        { bg: '#1e1b4b', border: '#4338ca', icon: '🧠', accent: '#818cf8' },
  success:     { bg: '#052e16', border: '#16a34a', icon: '✅', accent: '#22c55e' },
  warning:     { bg: '#431407', border: '#ea580c', icon: '⚡', accent: '#f97316' },
  celebration: { bg: '#3b0764', border: '#a855f7', icon: '🎉', accent: '#c084fc' },
}

export default function AgentToast() {
  const { toasts, dismissToast } = useAgent()

  return (
    <div style={{
      position: 'fixed', top: 16, right: 16, zIndex: 2000,
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none', maxWidth: 340,
    }}>
      <AnimatePresence>
        {toasts.map(toast => {
          const config = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={() => dismissToast(toast.id)}
              style={{
                background: config.bg,
                border: `1px solid ${config.border}`,
                borderRadius: 14,
                padding: '14px 16px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                pointerEvents: 'auto',
                cursor: 'pointer',
                display: 'flex', gap: 12, alignItems: 'flex-start',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{config.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {toast.title && (
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: config.accent,
                    marginBottom: 3, letterSpacing: '0.03em',
                  }}>
                    {toast.title}
                  </div>
                )}
                <div style={{
                  fontSize: 13, color: '#e2e0ff', lineHeight: 1.5,
                }}>
                  {toast.message}
                </div>
              </div>
              <span style={{ fontSize: 10, color: '#6b67a8', flexShrink: 0, marginTop: 2 }}>✕</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
