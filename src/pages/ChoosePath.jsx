import { useNavigate } from 'react-router-dom'
import { Puzzle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { CONDITIONS, ALL_CONDITION_KEYS } from '../lib/conditions'
import { clearPreferredView, setPreferredView } from '../lib/viewPreference'
import { useAgent } from '../context/AgentContext'
export default function ChoosePath({ onChoose } = {}) {
  const { user, signOut, updateProfile } = useAuth()
  const navigate = useNavigate()

  const { switchCategory } = useAgent()

  async function choose(view) {
    if (onChoose) { onChoose(view); return }
    if (view === 'dashboard') {
      await updateProfile({ condition: null })
      setPreferredView(user?.id, 'dashboard')
      switchCategory('dashboard')
      navigate('/dashboard', { replace: true })
    } else {
      await updateProfile({ condition: view })
      clearPreferredView(user?.id)
      switchCategory(view)
      navigate(`/${view}`, { replace: true })
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'white', borderBottom: '1px solid #e8e4ec',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        padding: '0 28px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 20, fontWeight: 900, color: '#7c6fe0' }}>fello</span>
        <button onClick={signOut} style={{
          background: 'white', border: '1px solid #e8e4ec',
          borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600,
          color: '#7a6f8a', cursor: 'pointer',
        }}>
          Sign out
        </button>
      </nav>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#7a6f8a', letterSpacing: '0.06em', marginBottom: 8 }}>
            CONDITION-SPECIFIC FEATURES
          </p>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, color: '#1a1523', letterSpacing: '-0.5px', marginBottom: 10 }}>
            Choose your experience
          </h1>
          <p style={{ fontSize: 15, color: '#7a6f8a', lineHeight: 1.6 }}>
            Pick the mode that fits you best. Your dashboard will be built around it — you can always change this later.
          </p>
        </div>

        {/* 3-column condition tile grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}>
          {ALL_CONDITION_KEYS.map(key => {
            const cond = CONDITIONS[key]
            return (
              <ConditionCard key={key} cond={cond} onSelect={() => choose(key)} />
            )
          })}
        </div>

        {/* General dashboard option */}
        <div style={{ borderTop: '1px solid #e8e4ec', paddingTop: 28 }}>
          <p style={{ fontSize: 13, color: '#a89fba', marginBottom: 16 }}>
            Prefer to manage everything yourself?
          </p>
          <button
            onClick={() => choose('dashboard')}
            style={{
              background: 'white', border: '1.5px solid #e8e4ec',
              borderRadius: 14, padding: '16px 24px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
              transition: 'all 0.18s', textAlign: 'left', width: '100%', maxWidth: 400,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c6fe0'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e4ec'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: '#f0edf8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}><Puzzle size={22} color="#7c6fe0" /></div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1523' }}>General Dashboard</div>
              <div style={{ fontSize: 13, color: '#7a6f8a', marginTop: 2 }}>All features in one place, your way</div>
            </div>
            <span style={{ marginLeft: 'auto', color: '#c4b5fd', fontSize: 18 }}>→</span>
          </button>
        </div>
      </main>
    </div>
  )
}

function ConditionCard({ cond, onSelect }) {
  const dotColor = cond.color

  return (
    <button
      onClick={onSelect}
      style={{
        background: 'white',
        border: '1px solid #e8e4ec',
        borderRadius: 16, padding: '22px 22px 20px',
        cursor: 'pointer', textAlign: 'left',
        transition: 'border-color 0.18s, box-shadow 0.18s, transform 0.18s',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = cond.color
        e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.09)`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#e8e4ec'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'none'
      }}
    >
      {/* Icon + title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: `rgba(${hexRgb(cond.color)}, 0.12)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src={cond.icon} alt={cond.title} style={{ width: 24, height: 24, objectFit: 'contain' }} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1523', lineHeight: 1.2 }}>
            {cond.title}
          </div>
          <div style={{ fontSize: 12, color: '#7a6f8a', marginTop: 3 }}>
            {cond.subtitle}
          </div>
        </div>
      </div>

      {/* Feature list */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {cond.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: dotColor, opacity: f.core ? 1 : 0.35,
            }} />
            <span style={{ fontSize: 13, color: '#3d3549', flex: 1, lineHeight: 1.4 }}>
              {f.label}
            </span>
            {f.core && (
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: 'white',
                background: cond.color,
                borderRadius: 999, padding: '2px 7px', flexShrink: 0,
              }}>
                core
              </span>
            )}
          </li>
        ))}
      </ul>
    </button>
  )
}

function hexRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}
