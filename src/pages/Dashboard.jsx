import { useState, useEffect } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Settings, RefreshCw, LogOut, Smile, Frown, Meh, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { CONDITIONS } from '../lib/conditions'
import { getPreferredView, setPreferredView, clearPreferredView } from '../lib/viewPreference'

const NO_CONDITION = { key: null, icon: null, title: 'None', subtitle: 'General dashboard' }

const DISPLAY_ORDER = ['adhd', 'dyspraxia', 'dementia', 'depression', 'anxiety', 'dyslexia']

const CARD_TITLES = {
  depression: 'Depression',
}

const CARD_FEATURES = {
  dyspraxia:  ['AI micro-steps', 'Voice input', 'Movement breaks'],
  dementia:   ['Memory journal', 'AI stories', 'Familiar faces'],
  depression: ['Energy modes', 'Tiny wins', 'Mood tracker'],
  anxiety:    ['Breathing', 'Grounding', 'Crisis support'],
  adhd:       ['Pomodoro', 'Focus streaks', 'Body doubling'],
  dyslexia:   ['OpenDyslexic', 'Text-to-speech', 'Line reader'],
}


const CONDITION_ROUTES = {
  dyspraxia:  '/dyspraxia',
  dementia:   '/dementia',
  depression: '/depression',
  anxiety:    '/anxiety',
  dyslexia:   '/dyslexia',
  adhd:       '/adhd',
}

const PREFS_VERSION = 2

function loadPrefs() {
  try {
    const version = JSON.parse(localStorage.getItem('fello_prefs_version'))
    if (version !== PREFS_VERSION) return { order: DISPLAY_ORDER, hidden: [], compact: false }
    return {
      order:   JSON.parse(localStorage.getItem('fello_tile_order'))  || DISPLAY_ORDER,
      hidden:  JSON.parse(localStorage.getItem('fello_hidden_tiles')) || [],
      compact: JSON.parse(localStorage.getItem('fello_compact_mode')) || false,
    }
  } catch {
    return { order: DISPLAY_ORDER, hidden: [], compact: false }
  }
}

function savePrefs(prefs) {
  localStorage.setItem('fello_prefs_version', JSON.stringify(PREFS_VERSION))
  localStorage.setItem('fello_tile_order',   JSON.stringify(prefs.order))
  localStorage.setItem('fello_hidden_tiles', JSON.stringify(prefs.hidden))
  localStorage.setItem('fello_compact_mode', JSON.stringify(prefs.compact))
}

export default function Dashboard() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const [changingCondition, setChangingCondition] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [prefs, setPrefs] = useState(loadPrefs)

  const conditionKey = profile?.condition || user?.user_metadata?.condition
  const condition    = conditionKey ? CONDITIONS[conditionKey] : null

  // Merge any new conditions not yet in saved order
  useEffect(() => {
    setPrefs(p => {
      const merged = [...p.order, ...DISPLAY_ORDER.filter(k => !p.order.includes(k))]
      return { ...p, order: merged }
    })
  }, [])

  useEffect(() => { savePrefs(prefs) }, [prefs])

  if (conditionKey && CONDITION_ROUTES[conditionKey]) {
    const pref = getPreferredView(user.id)
    const wantsToStay = new URLSearchParams(location.search).get('stay') === '1'
    if (wantsToStay && pref !== 'dashboard') {
      // User clicked "← Dashboard" from their mode — remember this
      setPreferredView(user.id, 'dashboard')
    } else if (pref !== 'dashboard') {
      // Default: go straight to their condition mode
      return <Navigate to={CONDITION_ROUTES[conditionKey]} replace />
    }
  }

  const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  const moveUp = (key) => setPrefs(p => {
    const arr = [...p.order]
    const i = arr.indexOf(key)
    if (i <= 0) return p
    ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
    return { ...p, order: arr }
  })

  const moveDown = (key) => setPrefs(p => {
    const arr = [...p.order]
    const i = arr.indexOf(key)
    if (i >= arr.length - 1) return p
    ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
    return { ...p, order: arr }
  })

  const toggleHide = (key) => setPrefs(p => ({
    ...p,
    hidden: p.hidden.includes(key) ? p.hidden.filter(k => k !== key) : [...p.hidden, key],
  }))

  const resetPrefs = () => setPrefs({ order: DISPLAY_ORDER, hidden: [], compact: false })

  const visibleConditions = prefs.order
    .filter(k => CONDITIONS[k])
    .map(k => CONDITIONS[k])

  return (
    <div style={{ minHeight: '100vh', background: '#f7f5f2' }}>

      {/* ── Top nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'white', borderBottom: '1px solid #e8e4ec',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        padding: '0 28px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 20, fontWeight: 900, color: '#7c6fe0' }}>fello</span>

        {/* Single user menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: menuOpen ? '#f5f0ff' : 'white',
              border: '1px solid #e8e4ec', borderRadius: 999,
              padding: '5px 14px 5px 6px', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%', background: '#7c6fe0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: 'white', flexShrink: 0,
            }}>
              {firstName[0].toUpperCase()}
            </div>
            {condition && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: condition.color }}>
                <img src={condition.icon} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                {condition.title}
              </span>
            )}
            {!condition && (
              <span style={{ fontSize: 13, fontWeight: 600, color: '#4a4060' }}>{firstName}</span>
            )}
            <span style={{ fontSize: 10, color: '#a89fba', marginLeft: 2 }}>▾</span>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'white', border: '1px solid #e8e4ec',
                borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                minWidth: 200, zIndex: 50, overflow: 'hidden',
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0ecf8' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1523' }}>{firstName}</div>
                  <div style={{ fontSize: 11, color: '#a89fba', marginTop: 1 }}>{user?.email}</div>
                </div>
                <div style={{ padding: '6px 0' }}>
                  <MenuItem Icon={Settings} label="Dashboard settings" onClick={() => { setMenuOpen(false); setSettingsOpen(true) }} />
                  <MenuItem Icon={RefreshCw} label="Change experience" onClick={() => { setMenuOpen(false); clearPreferredView(user.id); navigate('/choose') }} />
                  <div style={{ height: 1, background: '#f0ecf8', margin: '6px 0' }} />
                  <MenuItem Icon={LogOut} label="Sign out" onClick={() => { setMenuOpen(false); signOut() }} danger />
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* ── Settings drawer ── */}
      {settingsOpen && (
        <>
          {/* Backdrop */}
          <div onClick={() => setSettingsOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100,
          }} />

          {/* Panel */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 360,
            background: 'white', zIndex: 101,
            boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #e8e4ec',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1523', margin: 0 }}>Dashboard Settings</h2>
                <p style={{ fontSize: 12, color: '#a89fba', margin: '2px 0 0' }}>Customise your view</p>
              </div>
              <button onClick={() => setSettingsOpen(false)} style={{
                background: '#f5f0ff', border: 'none', borderRadius: 8,
                width: 34, height: 34, cursor: 'pointer', fontSize: 16, color: '#7c6fe0',
              }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Change condition */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1523', marginBottom: 4 }}>Your condition</div>
                <div style={{ fontSize: 12, color: '#7a6f8a', marginBottom: 12 }}>Changes your condition badge and personalised mode</div>

                {!changingCondition ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#faf9f7', border: '1px solid #e8e4ec', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {condition
                        ? <img src={condition.icon} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                        : <Sparkles size={18} color="#7c6fe0" />
                      }
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1523' }}>{condition ? condition.title : 'None'}</div>
                        <div style={{ fontSize: 11, color: '#7a6f8a' }}>{condition ? condition.subtitle : 'General dashboard'}</div>
                      </div>
                    </div>
                    <button onClick={() => setChangingCondition(true)} style={{
                      fontSize: 12, fontWeight: 600, padding: '5px 12px',
                      borderRadius: 6, border: '1px solid #e8e4ec',
                      background: 'white', color: '#7c6fe0', cursor: 'pointer',
                    }}>
                      Change
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[NO_CONDITION, ...Object.values(CONDITIONS)].map(c => {
                      const active = (conditionKey || null) === c.key
                      return (
                        <button key={c.key ?? 'none'} onClick={async () => {
                          await updateProfile({ condition: c.key })
                          clearPreferredView(user.id)
                          setChangingCondition(false)
                          setSettingsOpen(false)
                          if (c.key && CONDITION_ROUTES[c.key]) {
                            navigate(CONDITION_ROUTES[c.key], { replace: true })
                          }
                        }} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                          border: `1.5px solid ${active ? (c.color || '#7c6fe0') : '#e8e4ec'}`,
                          background: active ? (c.color ? `rgba(${hexToRgb(c.color)}, 0.06)` : '#f5f0ff') : 'white',
                        }}>
                          {c.icon
                            ? <img src={c.icon} alt="" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} />
                            : <Sparkles size={18} color="#7c6fe0" style={{ flexShrink: 0 }} />
                          }
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1523' }}>{c.title}</div>
                            <div style={{ fontSize: 11, color: '#7a6f8a' }}>{c.subtitle}</div>
                          </div>
                          {active && <span style={{ fontSize: 11, fontWeight: 700, color: '#7c6fe0' }}>Current</span>}
                        </button>
                      )
                    })}
                    <button onClick={() => setChangingCondition(false)} style={{
                      fontSize: 12, fontWeight: 600, padding: '8px', borderRadius: 8,
                      border: '1px solid #e8e4ec', background: 'white', color: '#7a6f8a', cursor: 'pointer', marginTop: 4,
                    }}>Cancel</button>
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: '#e8e4ec' }} />

              {/* Compact mode toggle */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1523' }}>Compact view</div>
                    <div style={{ fontSize: 12, color: '#7a6f8a' }}>Hide feature lists, just show titles</div>
                  </div>
                  <button onClick={() => setPrefs(p => ({ ...p, compact: !p.compact }))} style={{
                    width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: prefs.compact ? '#7c6fe0' : '#e8e4ec',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  }}>
                    <div style={{
                      position: 'absolute', top: 2, left: prefs.compact ? 22 : 2,
                      width: 20, height: 20, borderRadius: '50%', background: 'white',
                      transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                </div>
              </div>

              <div style={{ height: 1, background: '#e8e4ec' }} />

              {/* Reorder + show/hide */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1523', marginBottom: 4 }}>Condition tiles</div>
                <div style={{ fontSize: 12, color: '#7a6f8a', marginBottom: 14 }}>Reorder with arrows · toggle to show/hide</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {prefs.order.filter(k => CONDITIONS[k]).map((key, idx) => {
                    const cond    = CONDITIONS[key]
                    const hidden  = prefs.hidden.includes(key)
                    const isFirst = idx === 0
                    const isLast  = idx === prefs.order.filter(k => CONDITIONS[k]).length - 1

                    return (
                      <div key={key} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: hidden ? '#faf9f7' : 'white',
                        border: `1px solid ${hidden ? '#e8e4ec' : `rgba(${hexToRgb(cond.color)}, 0.25)`}`,
                        borderRadius: 12, padding: '10px 12px',
                        opacity: hidden ? 0.5 : 1, transition: 'all 0.15s',
                      }}>
                        {/* Up/down arrows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <button onClick={() => moveUp(key)} disabled={isFirst} style={{
                            width: 24, height: 22, border: '1px solid #e8e4ec', borderRadius: 5,
                            background: isFirst ? '#faf9f7' : 'white', cursor: isFirst ? 'default' : 'pointer',
                            fontSize: 11, color: isFirst ? '#ccc' : '#7a6f8a', lineHeight: 1,
                          }}>▲</button>
                          <button onClick={() => moveDown(key)} disabled={isLast} style={{
                            width: 24, height: 22, border: '1px solid #e8e4ec', borderRadius: 5,
                            background: isLast ? '#faf9f7' : 'white', cursor: isLast ? 'default' : 'pointer',
                            fontSize: 11, color: isLast ? '#ccc' : '#7a6f8a', lineHeight: 1,
                          }}>▼</button>
                        </div>

                        {/* Icon + name */}
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          background: `rgba(${hexToRgb(cond.color)}, 0.12)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <img src={cond.icon} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1523' }}>{cond.title}</div>
                          <div style={{ fontSize: 11, color: '#7a6f8a' }}>{cond.subtitle}</div>
                        </div>

                        {/* Show/hide toggle */}
                        <button onClick={() => toggleHide(key)} style={{
                          fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                          border: '1px solid #e8e4ec', cursor: 'pointer', flexShrink: 0,
                          background: hidden ? 'white' : '#f5f0ff', color: hidden ? '#7a6f8a' : '#7c6fe0',
                        }}>
                          {hidden ? 'Show' : 'Hide'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e8e4ec' }}>
              <button onClick={resetPrefs} style={{
                width: '100%', padding: '10px', borderRadius: 8,
                border: '1px solid #e8e4ec', background: 'white',
                fontSize: 13, fontWeight: 600, color: '#7a6f8a', cursor: 'pointer',
              }}>
                Reset to defaults
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Main content ── */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

        {/* ── Welcome banner ── */}
        <div style={{
          background: 'white', borderRadius: 20, border: '1px solid #ece8f4',
          padding: '24px 28px', marginBottom: 28,
          boxShadow: '0 1px 12px rgba(124,111,224,0.06)',
          display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center',
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1523', marginBottom: 4 }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {firstName} 👋
            </h1>
            <p style={{ fontSize: 13, color: '#7a6f8a', marginBottom: 14 }}>How are you feeling today?</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                [<Frown size={13} />, 'Overwhelmed', '/anxiety'],
                [<Meh size={13} />, 'Low energy', '/depression'],
                [<img src="/dyspraxia.png" alt="" style={{ width: 13, height: 13, objectFit: 'contain' }} />, 'Need structure', '/dyspraxia'],
                [<img src="/dementia.png" alt="" style={{ width: 13, height: 13, objectFit: 'contain' }} />, 'Memory support', '/dementia'],
                [<Smile size={13} />, 'Good to go', null],
              ].map(([icon, label, route]) => (
                <button key={label} onClick={() => route && navigate(route)} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                  borderRadius: 999, border: '1.5px solid #e8e4ec', background: '#faf9f7',
                  fontSize: 12, fontWeight: 600, color: '#4a4060', cursor: route ? 'pointer' : 'default',
                  transition: 'all 0.15s', fontFamily: 'inherit',
                }}
                  onMouseEnter={e => { if (route) { e.currentTarget.style.borderColor = '#7c6fe0'; e.currentTarget.style.color = '#7c6fe0'; e.currentTarget.style.background = '#f5f0ff' }}}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e4ec'; e.currentTarget.style.color = '#4a4060'; e.currentTarget.style.background = '#faf9f7' }}
                >
                  {icon}{label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Active modes quick-launch (right side) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#b0a8c8', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 2 }}>Open a mode</div>
            {Object.entries(CONDITION_ROUTES).map(([key, route]) => {
              const cond = CONDITIONS[key]
              if (!cond) return null
              return (
                <button key={key} onClick={() => navigate(route)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  borderRadius: 10, border: `1.5px solid rgba(${hexToRgb(cond.color)}, 0.25)`,
                  background: `rgba(${hexToRgb(cond.color)}, 0.06)`, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s', textAlign: 'left',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `rgba(${hexToRgb(cond.color)}, 0.14)`; e.currentTarget.style.transform = 'translateX(2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = `rgba(${hexToRgb(cond.color)}, 0.06)`; e.currentTarget.style.transform = 'none' }}
                >
                  <img src={cond.icon} alt="" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1523', flex: 1 }}>{cond.title}</span>
                  <span style={{ fontSize: 11, color: cond.color, fontWeight: 600 }}>→</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Section heading ── */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1a1523', marginBottom: 2 }}>Condition modes</h2>
            <p style={{ fontSize: 12, color: '#a89fba' }}>
              Tap any card to open that mode.{prefs.hidden.length > 0 && ` ${prefs.hidden.length} hidden.`}
            </p>
          </div>
          <button onClick={() => setSettingsOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            background: 'white', border: '1px solid #e8e4ec', borderRadius: 8,
            fontSize: 12, fontWeight: 600, color: '#7a6f8a', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <Settings size={12} /> Customise
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {visibleConditions.filter(c => !prefs.hidden.includes(c.key)).map((cond) => {
            const route = CONDITION_ROUTES[cond.key]
            const isLive = !!route
            const features = CARD_FEATURES[cond.key] || []
            const displayTitle = CARD_TITLES[cond.key] || cond.title
            return (
              <div
                key={cond.key}
                onClick={() => route && navigate(route)}
                style={{
                  background: 'white',
                  borderRadius: 14,
                  border: '1px solid #ece8f4',
                  borderTop: `3px solid ${cond.color}`,
                  padding: '18px 20px 16px',
                  cursor: route ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.15s, transform 0.15s',
                }}
                onMouseEnter={e => { if (route) { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none' }}
              >
                {/* Header: icon + title + status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: `rgba(${hexToRgb(cond.color)}, 0.10)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <img src={cond.icon} alt={cond.title} style={{ width: 22, height: 22, objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1523' }}>{displayTitle}</span>
                      {isLive ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 10, fontWeight: 600, color: '#059669',
                          background: '#d1fae5', padding: '2px 7px', borderRadius: 999,
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
                          Live
                        </span>
                      ) : (
                        <span style={{
                          fontSize: 10, fontWeight: 600, color: '#9987b8',
                          background: '#f3f0f9', padding: '2px 7px', borderRadius: 999,
                        }}>Soon</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#a89fba', marginTop: 1 }}>{cond.subtitle}</div>
                  </div>
                </div>

                {/* Feature list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14, flex: 1 }}>
                  {features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: cond.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#4a4060' }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Action row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #f0ecf8' }}>
                  {isLive ? (
                    <button
                      onClick={e => { e.stopPropagation(); navigate(route) }}
                      style={{
                        padding: '6px 14px', borderRadius: 8,
                        background: `rgba(${hexToRgb(cond.color)}, 0.10)`,
                        border: 'none', fontSize: 12, fontWeight: 700,
                        color: cond.color, cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `rgba(${hexToRgb(cond.color)}, 0.18)` }}
                      onMouseLeave={e => { e.currentTarget.style.background = `rgba(${hexToRgb(cond.color)}, 0.10)` }}
                    >
                      Open mode →
                    </button>
                  ) : (
                    <span style={{ fontSize: 12, color: '#c4b8d8' }}>Coming soon</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {prefs.hidden.length > 0 && (
          <button onClick={() => setSettingsOpen(true)} style={{
            marginTop: 16, background: '#faf9f7', border: '1px dashed #c8c0d8', borderRadius: 16,
            padding: '16px 24px', cursor: 'pointer', color: '#a89fba', width: '100%',
            fontSize: 13, fontWeight: 600, textAlign: 'center',
          }}>
            + {prefs.hidden.length} hidden condition{prefs.hidden.length > 1 ? 's' : ''} — click to show in settings
          </button>
        )}
      </main>
    </div>
  )
}

function MenuItem({ Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '9px 16px',
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
        color: danger ? '#e05252' : '#1a1523', textAlign: 'left',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = danger ? '#fff5f5' : '#f5f0ff' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
    >
      <Icon size={15} />
      {label}
    </button>
  )
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16)
  const g = parseInt(hex.slice(3,5), 16)
  const b = parseInt(hex.slice(5,7), 16)
  return `${r}, ${g}, ${b}`
}
