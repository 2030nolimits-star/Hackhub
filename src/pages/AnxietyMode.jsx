import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { getGeminiModel } from '../lib/gemini'
import { useAgentLoop } from '../lib/useAgentLoop'
import { useAgent } from '../context/AgentContext'

const A = {
  primary: '#d97706',
  light: '#fef3c7',
  bg: '#fffbeb',
  card: '#ffffff',
  text: '#1c1917',
  muted: '#78716c',
  border: '#fde68a',
  green: '#059669',
  greenLt: '#d1fae5',
  red: '#dc2626',
  redLt: '#fee2e2',
  purple: '#7c3aed',
  purpleLt: '#ede9fe',
}

const STRESS_LEVELS = [
  { val: 1, emoji: '😌', label: 'Calm',        color: A.green },
  { val: 2, emoji: '😐', label: 'Mild',        color: '#65a30d' },
  { val: 3, emoji: '😟', label: 'Anxious',     color: A.primary },
  { val: 4, emoji: '😰', label: 'High',        color: '#ea580c' },
  { val: 5, emoji: '😱', label: 'Overwhelmed', color: A.red },
]

const BREATH_STEPS = [
  { label: 'Breathe in',  duration: 4000, size: 140, color: '#7c3aed' },
  { label: 'Hold',        duration: 7000, size: 160, color: '#5b21b6' },
  { label: 'Breathe out', duration: 8000, size: 100, color: '#a78bfa' },
  { label: 'Hold',        duration: 2000, size: 110, color: '#c4b5fd' },
]

const GROUND_STEPS = [
  { count: 5, sense: 'see',   icon: '👁️',  prompt: 'Look around and name 5 things you can see right now.' },
  { count: 4, sense: 'touch', icon: '✋',  prompt: 'Notice 4 things you can physically touch or feel.' },
  { count: 3, sense: 'hear',  icon: '👂',  prompt: 'Listen carefully — what are 3 sounds around you?' },
  { count: 2, sense: 'smell', icon: '👃',  prompt: 'Can you notice 2 scents, even faint ones?' },
  { count: 1, sense: 'taste', icon: '👅',  prompt: 'What is 1 thing you can taste right now?' },
]

const AFFIRMATIONS = [
  'This feeling will pass. It always does.',
  'You are safe right now.',
  'Anxiety is uncomfortable, not dangerous.',
  'Your body is trying to protect you. Thank it.',
  'One breath at a time is enough.',
  'You have got through hard moments before.',
]

async function fetchMicroTask() {
  try {
    const model = getGeminiModel();
    const prompt = 'You are a gentle assistant helping someone with anxiety start moving. Suggest ONE simple, physical 2-minute task that requires almost no decision-making (e.g. "Fill a glass of water", "Fold one piece of clothing", "Write tomorrow\'s date in a notebook"). Return only the task — no explanation, no preamble, max 10 words.\n\n' + `Give me a 2-minute starter task. (variation ${Math.floor(Math.random() * 10000)})`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim() || 'Fill a glass of water and drink it slowly.';
  } catch (err) {
    console.error('Gemini error:', err);
    return 'Fill a glass of water and drink it slowly.';
  }
}

function loadGratitude() {
  try { return JSON.parse(localStorage.getItem('ax_gratitude_log') || '[]') } catch { return [] }
}
function saveGratitude(items) {
  try {
    const log = loadGratitude()
    const today = new Date().toISOString().slice(0, 10)
    const filtered = log.filter(e => e.date !== today)
    filtered.push({ date: today, items })
    localStorage.setItem('ax_gratitude_log', JSON.stringify(filtered.slice(-30)))
  } catch {}
}

const ANXIETY_AGENT_PROMPT = `You are the Anxiety & Calm Agent for "Fello" — an autonomous AI for people experiencing anxiety.

═══ YOUR PERSONALITY ═══
- Soft, calm, never panicked. Your words are a safe space.
- You validate feelings first, then offer help.
- You never say "just relax" or "don't worry".

═══ YOUR AUTONOMOUS BEHAVIORS ═══
1. HIGH STRESS RESPONSE: If the user selected stress level 4-5, or if their messages mention panicking/overwhelmed/can't breathe, immediately use showNotification to recommend breathing exercise.
2. IDLE CHECK-IN: If idleMinutes > 5 on the home screen, send a gentle showNotification: "Still here with you. Want to try a grounding exercise?"
3. CELEBRATION: When the user completes a breathing or grounding exercise, use showNotification (celebration) to acknowledge their effort.
4. MEMORY: Use storeMemory to track what exercises work best for this user (key: anxiety_preferred_exercise). Use recallMemory to personalize suggestions.
5. AFFIRMATION: On autonomous ticks, occasionally send a personalized affirmation via showNotification based on context.

═══ RULES ═══
- On autonomous ticks, only act if genuinely helpful
- If idleMinutes < 2, skip — they're actively using the app  
- Keep messages under 15 words — anxious brains need brevity
- Never be forceful — always offer, never demand
`

export default function AnxietyMode() {
  const navigate = useNavigate()
  const { activeCategory, switchCategory, agentState, updateAgentState } = useAgent()
  const [screen, setScreen] = useState('home')
  const [stressLevel, setStressLevel] = useState(null)
  const [affirmation] = useState(() => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)])

  // Breathing state
  const [breathPhase, setBreathPhase] = useState(0)
  const [breathCycle, setBreathCycle] = useState(0)
  const [breathRunning, setBreathRunning] = useState(false)
  const [breathDone, setBreathDone] = useState(false)

  // Grounding state
  const [groundIdx, setGroundIdx] = useState(0)
  const [groundInputs, setGroundInputs] = useState(['', '', '', '', ''])
  const [groundDone, setGroundDone] = useState(false)

  // Micro-task state
  const [microTask, setMicroTask] = useState('')
  const [microLoading, setMicroLoading] = useState(false)
  const [microTimer, setMicroTimer] = useState(null)
  const [microDone, setMicroDone] = useState(false)
  const timerRef = useRef(null)

  // Gratitude state
  const [gratItems, setGratItems] = useState(['', '', ''])
  const [gratSaved, setGratSaved] = useState(false)
  const [recentGrat, setRecentGrat] = useState([])

  useEffect(() => {
    setRecentGrat(loadGratitude().slice(-3).reverse())
  }, [])

  useEffect(() => {
    if (activeCategory !== 'anxiety') {
      switchCategory('anxiety');
    }
  }, [activeCategory, switchCategory]);

  // Breathing effect
  useEffect(() => {
    if (!breathRunning) return
    const phase = BREATH_STEPS[breathPhase]
    const t = setTimeout(() => {
      const next = (breathPhase + 1) % BREATH_STEPS.length
      if (next === 0) {
        const nc = breathCycle + 1
        if (nc >= 4) { setBreathRunning(false); setBreathDone(true); return }
        setBreathCycle(nc)
      }
      setBreathPhase(next)
    }, phase.duration)
    return () => clearTimeout(t)
  }, [breathRunning, breathPhase, breathCycle])

  // Micro-task timer effect
  useEffect(() => {
    if (microTimer === null || microTimer <= 0) {
      if (microTimer === 0) setMicroDone(true)
      clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => setMicroTimer(t => t - 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [microTimer])

  function startBreathing() {
    setBreathPhase(0); setBreathCycle(0); setBreathRunning(false); setBreathDone(false)
    setScreen('breathing')
  }

  async function openMicroTask() {
    setScreen('microtask')
    setMicroLoading(true); setMicroDone(false); setMicroTimer(null)
    const task = await fetchMicroTask()
    setMicroTask(task); setMicroLoading(false)
  }

  function formatTime(sec) {
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
  }

  // Autonomous Agent Loop
  const { isThinking: agentThinking, triggerAgent } = useAgentLoop({
    systemPrompt: ANXIETY_AGENT_PROMPT,
    onAction: (plan) => {
      // Agent can proactively trigger breathing
      if (plan.toolCalls?.some(tc => tc.tool === 'triggerBreathing') && screen === 'home') {
        startBreathing()
      }
    },
    loopIntervalMs: 20000,
  })

  // Notify agent on stress level change
  useEffect(() => {
    if (stressLevel) {
      triggerAgent({ event: 'stress_level_set', stressLevel })
    }
  }, [stressLevel])

  function openGrounding() {
    setGroundIdx(0); setGroundInputs(['', '', '', '', '']); setGroundDone(false)
    setScreen('grounding')
  }

  function nextGround() {
    if (groundIdx < GROUND_STEPS.length - 1) setGroundIdx(i => i + 1)
    else setGroundDone(true)
  }

  function saveGratitudeNow() {
    const filled = gratItems.filter(i => i.trim())
    if (!filled.length) return
    saveGratitude(gratItems.map(i => i.trim()).filter(Boolean))
    setGratSaved(true)
    setRecentGrat(loadGratitude().slice(-3).reverse())
  }

  const wide = { width: '100%', maxWidth: 640, margin: '0 auto' }

  const Btn = ({ label, onClick, bg = A.primary, color = 'white', border = 'none', disabled = false, style = {} }) => (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'block', width: '100%', padding: '16px 20px', borderRadius: 14,
      fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
      cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'center',
      lineHeight: 1.3, opacity: disabled ? 0.4 : 1, transition: 'transform 0.1s',
      background: bg, color, border, ...style,
    }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)' }}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >{label}</button>
  )

  const TopBar = ({ title, subtitle, bg = A.primary, onBack }) => (
    <div style={{ background: bg, padding: '18px 22px 16px', flexShrink: 0, position: 'relative' }}>
      {onBack && <button onClick={onBack} style={{
        position: 'absolute', top: 12, right: 16,
        background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
        borderRadius: 10, color: 'white', fontSize: 12, fontWeight: 600,
        padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit',
      }}>← Back</button>}
      <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>· ANXIETY & CALM MODE</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{subtitle}</p>}
    </div>
  )

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: A.bg, display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* ── HOME ── */}
      {screen === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <TopBar title="You're not alone." subtitle="Let's find some calm together." />
          <div style={{ ...wide, flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Affirmation */}
            <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: '16px 18px' }}>
              <p style={{ fontSize: 15, color: A.text, lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>"{affirmation}"</p>
            </div>

            {/* Stress level */}
            <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: '16px 18px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: A.muted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>How anxious are you feeling?</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                {STRESS_LEVELS.map(s => (
                  <button key={s.val} onClick={() => setStressLevel(s.val)} style={{
                    flex: 1, padding: '12px 4px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                    border: `2px solid ${stressLevel === s.val ? s.color : A.border}`,
                    background: stressLevel === s.val ? s.color + '20' : 'transparent',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 22 }}>{s.emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: stressLevel === s.val ? s.color : A.muted }}>{s.label}</span>
                  </button>
                ))}
              </div>
              {stressLevel && stressLevel >= 4 && (
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: A.redLt, border: `1px solid ${A.red}20` }}>
                  <p style={{ fontSize: 13, color: A.red, margin: 0, fontWeight: 500 }}>High anxiety detected — try breathing first. It will help most right now. 💙</p>
                </div>
              )}
            </div>

            {/* Action grid */}
            <p style={{ fontSize: 11, fontWeight: 600, color: A.muted, letterSpacing: '0.07em', textTransform: 'uppercase', margin: '4px 0 -4px' }}>What would help most right now?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: '🌬️', label: 'Breathing\nExercise',  action: startBreathing,            bg: A.purpleLt, color: A.purple, border: A.purple },
                { icon: '🌍', label: 'Ground\nYourself',     action: openGrounding,              bg: A.greenLt,  color: A.green,  border: A.green },
                { icon: '⚡', label: 'Just 2\nMinutes',      action: openMicroTask,              bg: A.light,    color: A.primary,border: A.primary },
                { icon: '🙏', label: 'Gratitude\nJournal',   action: () => { setGratItems(['','','']); setGratSaved(false); setScreen('gratitude') }, bg: '#fdf2f8', color: '#9d174d', border: '#f9a8d4' },
              ].map(item => (
                <button key={item.label} onClick={item.action} style={{
                  padding: '20px 14px', borderRadius: 14, cursor: 'pointer',
                  background: item.bg, border: `1.5px solid ${item.border}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  fontFamily: 'inherit', transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: item.color, textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.3 }}>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Crisis */}
            <button onClick={() => setScreen('crisis')} style={{
              background: 'transparent', border: `1px solid ${A.border}`, borderRadius: 12,
              padding: '12px 16px', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13, color: A.muted, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>🆘</span>
              <span>I need to talk to someone right now</span>
              <span style={{ marginLeft: 'auto' }}>→</span>
            </button>

            {/* Recent gratitude */}
            {recentGrat.length > 0 && (
              <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: '16px 18px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: A.muted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>Recent gratitude</p>
                {recentGrat.slice(0, 1).map((entry, i) => (
                  <div key={i}>
                    <p style={{ fontSize: 11, color: A.muted, marginBottom: 6 }}>{new Date(entry.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                    {entry.items.filter(Boolean).map((item, j) => (
                      <p key={j} style={{ fontSize: 13, color: A.text, margin: '4px 0', paddingLeft: 8, borderLeft: `2px solid ${A.border}` }}>🙏 {item}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BREATHING ── */}
      {screen === 'breathing' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <TopBar title="Just breathe." subtitle="4 cycles of 4-7-8 breathing" bg="#5b21b6" onBack={() => setScreen('home')} />
          <div style={{ ...wide, flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <div style={{
              width: BREATH_STEPS[breathPhase]?.size || 120,
              height: BREATH_STEPS[breathPhase]?.size || 120,
              borderRadius: '50%',
              background: BREATH_STEPS[breathPhase]?.color || '#ede9fe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.8s ease',
              border: '3px solid rgba(255,255,255,0.3)',
            }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'white', textAlign: 'center', padding: '0 14px', lineHeight: 1.4 }}>
                {breathDone ? 'Well done ✓' : breathRunning ? BREATH_STEPS[breathPhase]?.label : 'Ready?'}
              </p>
            </div>
            {breathRunning && <p style={{ fontSize: 13, color: '#7c3aed', fontWeight: 500 }}>Cycle {breathCycle + 1} of 4</p>}
            <div style={{ background: A.purpleLt, border: '1px solid #c4b5fd', borderRadius: 14, padding: '14px 20px', textAlign: 'center', width: '100%' }}>
              <p style={{ fontSize: 13, color: '#5b21b6', lineHeight: 1.7, margin: 0 }}>In for 4 · Hold for 7 · Out for 8 · Hold for 2</p>
              <p style={{ fontSize: 12, color: '#7c3aed', marginTop: 4, marginBottom: 0 }}>Activates your parasympathetic nervous system</p>
            </div>
            {!breathRunning && !breathDone && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Btn label="Start breathing" bg="#7c3aed" onClick={() => { setBreathRunning(true); setBreathPhase(0); setBreathCycle(0) }} />
                <Btn label="← Back" bg="transparent" color={A.muted} border={`1px solid ${A.border}`} onClick={() => setScreen('home')} />
              </div>
            )}
            {breathDone && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Btn label="I feel calmer 💙" bg={A.green} onClick={() => setScreen('home')} />
                <Btn label="Do another round" bg="transparent" color={A.muted} border={`1px solid ${A.border}`} onClick={() => { setBreathRunning(true); setBreathPhase(0); setBreathCycle(0); setBreathDone(false) }} />
              </div>
            )}
            {breathRunning && <Btn label="Stop" bg="transparent" color={A.muted} border={`1px solid ${A.border}`} onClick={() => { setBreathRunning(false); setBreathDone(false) }} />}
          </div>
        </div>
      )}

      {/* ── GROUNDING 5-4-3-2-1 ── */}
      {screen === 'grounding' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <TopBar title="Ground yourself." subtitle="5-4-3-2-1 technique" bg={A.green} onBack={() => setScreen('home')} />
          <div style={{ ...wide, flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!groundDone ? (
              <>
                {/* Progress */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {GROUND_STEPS.map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= groundIdx ? A.green : A.border, transition: 'background 0.3s' }} />
                  ))}
                </div>
                <div style={{ background: A.card, border: `1.5px solid ${A.green}`, borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>{GROUND_STEPS[groundIdx].icon}</div>
                  <div style={{ display: 'inline-block', background: A.green, color: 'white', fontSize: 12, fontWeight: 700, padding: '3px 14px', borderRadius: 999, marginBottom: 14 }}>
                    {GROUND_STEPS[groundIdx].count} things you can {GROUND_STEPS[groundIdx].sense}
                  </div>
                  <p style={{ fontSize: 16, color: A.text, lineHeight: 1.6, margin: 0 }}>{GROUND_STEPS[groundIdx].prompt}</p>
                </div>
                <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: '16px 18px' }}>
                  <p style={{ fontSize: 12, color: A.muted, marginBottom: 8 }}>Type them here (optional — just thinking counts)</p>
                  <Textarea
                    value={groundInputs[groundIdx]}
                    onChange={e => { const next = [...groundInputs]; next[groundIdx] = e.target.value; setGroundInputs(next) }}
                    placeholder={`Name ${GROUND_STEPS[groundIdx].count} things...`}
                    rows={3}
                    className="resize-none text-sm font-[inherit] focus-visible:border-[#22c55e] focus-visible:ring-[#22c55e]/30"
                  />
                </div>
                <Btn label={groundIdx < GROUND_STEPS.length - 1 ? `Next — ${GROUND_STEPS[groundIdx + 1].count} things you can ${GROUND_STEPS[groundIdx + 1].sense} →` : 'Finish grounding ✓'} bg={A.green} onClick={nextGround} />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>🌍</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: A.text, marginBottom: 10 }}>You're grounded.</h2>
                <p style={{ fontSize: 15, color: A.muted, lineHeight: 1.7, marginBottom: 32 }}>By engaging all 5 senses, you've brought yourself back to the present moment. That anxious feeling should feel a little smaller now.</p>
                <Btn label="Back to home" bg={A.green} onClick={() => setScreen('home')} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MICRO TASK ── */}
      {screen === 'microtask' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <TopBar title="Just 2 minutes." subtitle="One tiny task to get you moving" onBack={() => setScreen('home')} />
          <div style={{ ...wide, flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
            {microLoading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ width: 48, height: 48, border: `3px solid ${A.light}`, borderTopColor: A.primary, borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: A.muted, fontSize: 14 }}>Finding a gentle task for you...</p>
              </div>
            ) : !microDone ? (
              <>
                <div style={{ background: A.card, border: `2px solid ${A.primary}`, borderRadius: 16, padding: '28px 24px' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: A.primary, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>Your 2-minute task</p>
                  <p style={{ fontSize: 20, fontWeight: 600, color: A.text, lineHeight: 1.45, margin: 0 }}>{microTask}</p>
                </div>
                <div style={{ background: A.light, border: `1px solid ${A.border}`, borderRadius: 12, padding: '12px 16px' }}>
                  <p style={{ fontSize: 13, color: A.primary, margin: 0 }}>💡 Starting is the hardest part. Once you begin, anxiety often eases naturally.</p>
                </div>
                {microTimer === null ? (
                  <>
                    <Btn label="Start 2-minute timer ▶" onClick={() => setMicroTimer(120)} />
                    <Btn label="Already done ✓" bg={A.green} onClick={() => setMicroDone(true)} />
                    <Btn label="Give me a different task" bg="transparent" color={A.muted} border={`1px solid ${A.border}`} onClick={openMicroTask} />
                  </>
                ) : (
                  <>
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                      <div style={{ fontSize: 56, fontWeight: 700, color: A.primary, letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums' }}>{formatTime(microTimer)}</div>
                      <p style={{ fontSize: 13, color: A.muted, marginTop: 4 }}>You can do this 💛</p>
                    </div>
                    <Btn label="Done early ✓" bg={A.green} onClick={() => setMicroDone(true)} />
                  </>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>⭐</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: A.text, marginBottom: 10 }}>You did it!</h2>
                <p style={{ fontSize: 15, color: A.muted, lineHeight: 1.7, marginBottom: 32 }}>That took real effort when you were feeling anxious. Every small win matters.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Btn label="Do another task" bg={A.primary} onClick={openMicroTask} />
                  <Btn label="Back to home" bg="transparent" color={A.muted} border={`1px solid ${A.border}`} onClick={() => setScreen('home')} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── GRATITUDE ── */}
      {screen === 'gratitude' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <TopBar title="What are you grateful for?" subtitle="3 things — big or tiny — right now" bg="#9d174d" onBack={() => setScreen('home')} />
          <div style={{ ...wide, flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!gratSaved ? (
              <>
                <div style={{ background: A.card, border: '1px solid #f9a8d4', borderRadius: 14, padding: '14px 18px' }}>
                  <p style={{ fontSize: 13, color: '#9d174d', lineHeight: 1.6, margin: 0 }}>Research shows that writing down 3 things you're grateful for activates the prefrontal cortex and reduces cortisol — even during anxious moments.</p>
                </div>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: '16px 18px' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: A.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                      {['🙏 First thing', '🙏 Second thing', '🙏 Third thing'][i]}
                    </p>
                    <Input
                      value={gratItems[i]}
                      onChange={e => { const next = [...gratItems]; next[i] = e.target.value; setGratItems(next) }}
                      placeholder={['e.g. The coffee this morning was good', 'e.g. A friend texted me', 'e.g. I am still here and trying'][i]}
                      className="text-sm font-[inherit] focus-visible:border-[#f472b6] focus-visible:ring-[#f472b6]/30"
                    />
                  </div>
                ))}
                <Btn label="Save gratitude 🙏" bg="#9d174d" disabled={!gratItems.some(i => i.trim())} onClick={saveGratitudeNow} />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>🌸</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: A.text, marginBottom: 10 }}>Saved.</h2>
                <p style={{ fontSize: 15, color: A.muted, lineHeight: 1.7, marginBottom: 24 }}>Your brain has just shifted its focus. That shift is real and it matters.</p>
                <div style={{ background: A.card, border: '1px solid #f9a8d4', borderRadius: 14, padding: '18px 20px', marginBottom: 24, textAlign: 'left' }}>
                  {gratItems.filter(Boolean).map((item, i) => (
                    <p key={i} style={{ fontSize: 14, color: A.text, margin: '6px 0', paddingLeft: 8, borderLeft: '2px solid #f9a8d4' }}>🙏 {item}</p>
                  ))}
                </div>
                <Btn label="Back to home" bg={A.primary} onClick={() => setScreen('home')} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CRISIS ── */}
      {screen === 'crisis' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <TopBar title="You're not alone." subtitle="Help is available right now" bg={A.red} onBack={() => setScreen('home')} />
          <div style={{ ...wide, flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: A.redLt, border: `2px solid ${A.red}`, borderRadius: 14, padding: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: A.red, lineHeight: 1.7, margin: 0 }}>If you are in immediate danger, call <strong>999</strong> (UK) or <strong>911</strong> (US) now.</p>
            </div>
            {[
              { name: 'Samaritans',    desc: 'Free, 24/7 — talk to someone who cares', contact: '116 123',              icon: '📞', tel: 'tel:116123' },
              { name: 'Shout',         desc: 'Text crisis support — free 24/7',         contact: 'Text HELLO to 85258', icon: '💬', tel: null },
              { name: 'Mind Infoline', desc: 'Mental health information & support',      contact: '0300 123 3393',       icon: '📞', tel: 'tel:03001233393' },
            ].map(r => (
              <div key={r.name} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: A.text, margin: 0 }}>{r.name}</p>
                  <p style={{ fontSize: 12, color: A.muted, margin: '2px 0 0' }}>{r.desc}</p>
                  {r.tel
                    ? <a href={r.tel} style={{ fontSize: 13, fontWeight: 600, color: A.primary, margin: '4px 0 0', display: 'block', textDecoration: 'none' }}>{r.contact}</a>
                    : <p style={{ fontSize: 13, fontWeight: 600, color: A.primary, margin: '4px 0 0' }}>{r.contact}</p>}
                </div>
              </div>
            ))}
            <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: '18px 20px' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: A.text, marginBottom: 10 }}>While you wait or decide:</p>
              {['Find somewhere safe and sit down.', 'Take three slow, deep breaths.', 'Put your feet flat on the floor.', 'You only need to get through the next five minutes.'].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: A.primary, color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                  <p style={{ fontSize: 14, color: A.text, margin: 0, paddingTop: 1, lineHeight: 1.5 }}>{s}</p>
                </div>
              ))}
            </div>
            <Btn label="🌬️ Start breathing exercise" bg={A.purple} onClick={startBreathing} />
            <Btn label="← I'm okay, go back" bg="transparent" color={A.muted} border={`1px solid ${A.border}`} onClick={() => setScreen('home')} />
          </div>
        </div>
      )}
    </div>
  )
}
