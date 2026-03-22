import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Textarea } from '@/components/ui/textarea'
import { getGeminiJsonModel } from '../lib/gemini'
import { useAgentLoop } from '../lib/useAgentLoop'
import { useAgent } from '../context/AgentContext'

const G = {
  primary: '#639922',
  light:   '#EAF3DE',
  dark:    '#3B6D11',
  deep:    '#173404',
  border:  '#C0DD97',
  bg:      '#F7FBF0',
  muted:   '#888780',
  text:    '#1a1a18',
  sub:     '#5F5E5A',
}

const ENERGY_MODES = [
  { id: 'survival', emoji: '🌱', label: 'Survival mode',  desc: 'Getting through the day is enough',  tip: 'We will keep it extremely small today.' },
  { id: 'low',      emoji: '🔋', label: 'Low energy',     desc: 'Some capacity but exhausted',         tip: 'Gentle pace, tiny steps, no pressure.' },
  { id: 'okay',     emoji: '☀️', label: 'Okay today',     desc: 'Not great but managing',              tip: 'Normal pace with check-ins along the way.' },
  { id: 'recovery', emoji: '🌸', label: 'Recovery mode',  desc: 'Self-care and rebuilding today',      tip: 'We will include rest and comfort steps throughout.' },
]

const AFFIRMATIONS = [
  'Showing up today already took courage.',
  'You do not have to feel okay to move forward.',
  'Small steps count just as much as big ones.',
  'Resting is not giving up.',
  'You are doing better than you think.',
  'One thing at a time is enough.',
  'Being here right now is something.',
  'You are allowed to go slowly.',
]

const BREATH_PATTERN = [
  { label: 'Breathe in', duration: 4000, color: '#7F77DD', size: 140 },
  { label: 'Hold',       duration: 7000, color: '#534AB7', size: 160 },
  { label: 'Breathe out',duration: 8000, color: '#AFA9EC', size: 100 },
  { label: 'Hold',       duration: 2000, color: '#CECBF6', size: 110 },
]

function getFallback(mode) {
  if (mode === 'survival') {
    return [
      { step: 'Sit somewhere you feel safe',    time: '~1 min', tip: 'You do not need to move far at all.' },
      { step: 'Do the very first tiny part',    time: '~3 min', tip: 'Any movement forward counts today.' },
      { step: 'Rest — you did something real',  time: '~2 min', tip: 'That was enough. It really was.' },
    ]
  }
  return [
    { step: 'Sit somewhere comfortable first',   time: '~1 min', tip: 'You do not need to go far.' },
    { step: 'Take three slow breaths',           time: '~1 min', tip: 'This already counts as doing something.' },
    { step: 'Do the first small part',           time: '~3 min', tip: 'Any progress is real progress.' },
    { step: 'Have a sip of water and pause',     time: '~2 min', tip: 'Your body deserves care too.' },
    { step: 'Finish the last small part',        time: '~3 min', tip: 'You are nearly there.' },
  ]
}

async function fetchSteps(task, mode) {
  const isSurvival = mode === 'survival'

  const prompt = `You are a warm, gentle AI assistant for people experiencing depression, low mood or chronic fatigue.

Your job is to break the task into micro-steps. The user is in ${mode || 'low'} energy mode.

Rules for steps:
- Each step is ONE tiny action — never combine two things
- Maximum 8 words per step — short, warm, plain English
- ${isSurvival ? 'SURVIVAL MODE: Absolute minimum. 3 steps only. Incredibly small.' : mode === 'recovery' ? 'RECOVERY MODE: Include rest and self-care steps. Very gentle.' : 'LOW ENERGY MODE: Small but doable. 4-5 steps.'}
- Never use "just", "simply", "quickly", "easy" — these feel dismissive
- Never judge the task size — treat everything as valid and worthwhile
- Steps must be SPECIFIC to the task — not generic
- Include one gentle rest or hydration step in the middle

Each step must have:
- "step": warm, specific instruction (max 8 words)
- "time": estimated time e.g. "~2 min"
- "tip": one warm, honest sentence — no toxic positivity (max 12 words)

Return ONLY a valid JSON array. No preamble, no markdown fences.
Generate ${isSurvival ? '3' : '4 to 6'} steps total.

Now break this task for someone in ${mode || 'low'} energy mode: "${task}"`

  try {
    const model = getGeminiJsonModel();
    const result = await model.generateContent(prompt);
    const steps = JSON.parse(result.response.text());
    return Array.isArray(steps) && steps.length > 0 ? steps : getFallback(mode);
  } catch (err) {
    console.error('Gemini error:', err);
    return getFallback(mode);
  }
}

const AMBIENT_TRACKS = [
  { key: 'rain',    label: 'Gentle Rain',   emoji: '🌧️', url: 'https://assets.mixkit.co/active_storage/sfx/2395/2395-preview.mp3' },
  { key: 'forest',  label: 'Forest & Birds',emoji: '🌿', url: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3' },
  { key: 'piano',   label: 'Soft Piano',    emoji: '🎵', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
]

function AmbientPlayer() {
  const [playing, setPlaying] = useState(null)
  const audioRef = useRef(null)
  const toggle = (track) => {
    if (playing === track.key) {
      audioRef.current?.pause(); setPlaying(null)
    } else {
      audioRef.current?.pause()
      audioRef.current = new Audio(track.url)
      audioRef.current.loop = true; audioRef.current.volume = 0.45
      audioRef.current.play()
      setPlaying(track.key)
    }
  }
  useEffect(() => () => audioRef.current?.pause(), [])
  return (
    <div style={{ background: 'white', border: `1px solid ${G.border}`, borderRadius: 16, padding: '14px 16px' }}>
      <p style={{ fontSize: 12, fontWeight: 500, color: G.muted, letterSpacing: '0.07em', marginBottom: 10 }}>RELAXING SOUNDS</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {AMBIENT_TRACKS.map(t => (
          <div key={t.key} onClick={() => toggle(t)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
            background: playing === t.key ? G.light : G.bg,
            border: `1.5px solid ${playing === t.key ? G.primary : G.border}`,
            transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{t.emoji}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: G.dark }}>{t.label}</span>
            <span style={{ fontSize: 18, color: playing === t.key ? G.primary : G.muted }}>
              {playing === t.key ? '⏸' : '▶'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function saveMoodEntry(mood) {
  if (!mood) return
  try {
    const log = JSON.parse(localStorage.getItem('dep_mood_log') || '[]')
    const today = new Date().toISOString().slice(0, 10)
    const filtered = log.filter(e => e.date !== today)
    filtered.push({ date: today, mood })
    localStorage.setItem('dep_mood_log', JSON.stringify(filtered.slice(-14)))
  } catch {}
}

const MOOD_COLORS = { Better: '#639922', Proud: '#2E7D32', Relieved: '#5B9BD5', Okay: '#aaa', Same: '#888', Tired: '#e06fa0' }

function MoodTrendChart() {
  const log = JSON.parse(localStorage.getItem('dep_mood_log') || '[]')
  if (log.length < 2) return null
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const date = d.toISOString().slice(0, 10)
    const entry = log.find(e => e.date === date)
    return { date, day: d.toLocaleDateString('en-GB', { weekday: 'short' }), mood: entry?.mood }
  })
  return (
    <div style={{ background: 'white', border: `1px solid ${G.border}`, borderRadius: 16, padding: '14px 16px' }}>
      <p style={{ fontSize: 12, fontWeight: 500, color: G.muted, letterSpacing: '0.07em', marginBottom: 10 }}>YOUR WEEK AT A GLANCE</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 4 }}>
        {days.map(d => (
          <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: d.mood ? (MOOD_COLORS[d.mood] || G.primary) : G.border }} title={d.mood || 'No entry'} />
            <span style={{ fontSize: 10, color: G.muted }}>{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const DEPRESSION_AGENT_PROMPT = `You are the Depression & Fatigue Agent for "Fello" — an autonomous AI for people experiencing depression, low mood, or chronic fatigue.

═══ YOUR PERSONALITY ═══
- Warm, honest, validating. You never use toxic positivity.
- You treat every small action as genuinely meaningful.
- You never say "just" or "simply" — these feel dismissive.

═══ YOUR AUTONOMOUS BEHAVIORS ═══
1. STREAK TRACKING: Use storeMemory to track "depression_session_count" and "depression_last_session_date". On session start, recall and celebrate streaks: "You've shown up 3 days in a row."
2. ENERGY MEMORY: Use storeMemory to remember "depression_last_energy_mode". On next visit, suggest it: "Last time you chose Survival mode. How about today?"
3. HYDRATION NUDGE: If idleMinutes > 15, use showNotification to gently remind about water.
4. WIN CELEBRATION: When the user completes a step, use showNotification (celebration).
5. GENTLE CHECK-IN: On autonomous ticks, if tasks exist and user seems stuck, send a soft nudge.

═══ RULES ═══
- On autonomous ticks, only act if genuinely helpful
- If idleMinutes < 2, skip the tick
- Keep messages under 15 words
- Never pressure — always validate resting as an achievement
`

export default function DepressionMode() {
  const navigate = useNavigate()
  const { activeCategory, switchCategory, agentState: depAgentState, updateAgentState: updateDepAgentState } = useAgent()
  const [screen, setScreen] = useState('home')
  const [energyMode, setEnergyMode] = useState(null)
  const [taskText, setTaskText] = useState('')
  const [steps, setSteps] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [wins, setWins] = useState(0)
  const [mood, setMood] = useState(null)
  const [loadMsg, setLoadMsg] = useState('Being gentle with your energy...')
  const [affirmation] = useState(() => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)])
  const [isRecording, setIsRecording] = useState(false)
  const [breathPhase, setBreathPhase] = useState(0)
  const [breathCycle, setBreathCycle] = useState(0)
  const [breathRunning, setBreathRunning] = useState(false)
  const [breathDone, setBreathDone] = useState(false)
  const recognitionRef = useRef(null)
  const loadIntervalRef = useRef(null)

  const loadMsgs = [
    'Being gentle with your energy...',
    'Finding the smallest possible steps...',
    'Making this as manageable as possible...',
    'Almost ready — you got this...',
  ]

  useEffect(() => {
    if (!breathRunning) return
    const phase = BREATH_PATTERN[breathPhase]
    const t = setTimeout(() => {
      const nextPhase = (breathPhase + 1) % BREATH_PATTERN.length
      if (nextPhase === 0) {
        const nextCycle = breathCycle + 1
        if (nextCycle >= 4) { setBreathRunning(false); setBreathDone(true); return }
        setBreathCycle(nextCycle)
      }
      setBreathPhase(nextPhase)
    }, phase.duration)
    return () => clearTimeout(t)
  }, [breathRunning, breathPhase, breathCycle])

  function toggleVoice() {
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Voice not supported — please type instead'); return }
    const r = new SR()
    r.continuous = false; r.interimResults = true; r.lang = 'en-GB'
    r.onresult = (e) => setTaskText(Array.from(e.results).map(r => r[0].transcript).join(''))
    r.onend = () => setIsRecording(false)
    r.onerror = () => setIsRecording(false)
    r.start(); recognitionRef.current = r; setIsRecording(true)
  }

  useEffect(() => {
    if (activeCategory !== 'depression') {
      switchCategory('depression');
    }
  }, [activeCategory, switchCategory]);

  function speakText(text) {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.85; window.speechSynthesis.speak(u)
  }

  function startBreathing() {
    setBreathPhase(0); setBreathCycle(0); setBreathRunning(false); setBreathDone(false)
    setScreen('breathing')
  }

  async function submitTask() {
    if (!taskText.trim()) return
    setScreen('loading')
    let i = 0
    loadIntervalRef.current = setInterval(() => { i = (i + 1) % loadMsgs.length; setLoadMsg(loadMsgs[i]) }, 1800)
    try {
      const result = await fetchSteps(taskText, energyMode?.id || 'low')
      setSteps(Array.isArray(result) && result.length > 0 ? result : getFallback(energyMode?.id))
    } catch {
      setSteps(getFallback(energyMode?.id))
    } finally {
      clearInterval(loadIntervalRef.current)
      setCurrentIdx(0)
      setScreen('overview')
    }
  }

  function completeStep() {
    setWins(w => w + 1)
    const next = currentIdx + 1
    if (next >= steps.length) { setScreen('done'); return }
    setCurrentIdx(next)
    setScreen(next % 3 === 0 ? 'hydration' : 'step')
  }

  // Autonomous Agent Loop
  const { isThinking: depAgentThinking, triggerAgent: triggerDepAgent } = useAgentLoop({
    systemPrompt: DEPRESSION_AGENT_PROMPT,
    onAction: () => {},
    loopIntervalMs: 30000,
  })

  // Notify agent on energy mode selection  
  useEffect(() => {
    if (energyMode) {
      triggerDepAgent({ event: 'energy_mode_selected', mode: energyMode.id })
    }
  }, [energyMode])

  // Notify agent on step completion
  useEffect(() => {
    if (wins > 0) {
      triggerDepAgent({ event: 'step_completed', totalWins: wins })
    }
  }, [wins])

  function reset() {
    setScreen('home'); setTaskText(''); setSteps([]); setCurrentIdx(0); setMood(null); setEnergyMode(null)
  }

  const current = steps[currentIdx]
  const wide = { width: '100%', maxWidth: 720, margin: '0 auto' }

  const Btn = ({ label, onClick, bg = G.primary, color = 'white', border = 'none', disabled = false }) => (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'block', width: '100%', padding: '18px 20px', borderRadius: 14,
      fontSize: 16, fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
      cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'center',
      lineHeight: 1.3, opacity: disabled ? 0.4 : 1, transition: 'transform 0.1s',
      background: bg, color, border,
    }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)' }}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >{label}</button>
  )

  const Header = ({ eyebrow, title, subtitle, bg = G.primary }) => (
    <div style={{ background: bg, padding: '20px 24px 18px', flexShrink: 0, position: 'relative' }}>
      {/* No back button — locked to category */}
      {eyebrow && <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em', marginBottom: 4 }}>{eyebrow}</p>}
      <h1 style={{ fontFamily: 'Lora, serif', fontSize: 24, fontWeight: 600, color: 'white', lineHeight: 1.2, margin: 0 }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 5 }}>{subtitle}</p>}
    </div>
  )

  const Card = ({ children, bg = G.light, border = G.border }) => (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: '18px 20px' }}>{children}</div>
  )

  const Tip = ({ text }) => (
    <div style={{ display: 'flex', gap: 10, background: 'white', border: `1px solid ${G.border}`, borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: G.primary, flexShrink: 0, marginTop: 5 }} />
      <p style={{ fontSize: 13, color: G.dark, lineHeight: 1.5, margin: 0 }}>{text}</p>
    </div>
  )

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: G.bg, display: 'flex', flexDirection: 'column', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {/* HOME */}
      {screen === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Header eyebrow="· DEPRESSION & FATIGUE MODE" title="You showed up today." subtitle="That already counts for something." />
          <div style={{ ...wide, flex: 1, padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {wins > 0 && (
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: G.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', flexShrink: 0 }}>★</div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 500, color: G.dark }}>{wins} win{wins !== 1 ? 's' : ''} today</p>
                    <p style={{ fontSize: 13, color: G.dark, marginTop: 2, opacity: 0.8 }}>Every single one matters.</p>
                  </div>
                </div>
              </Card>
            )}
            <Card bg="white">
              <p style={{ fontSize: 15, color: G.dark, lineHeight: 1.6, fontStyle: 'italic' }}>"{affirmation}"</p>
            </Card>
            <MoodTrendChart />
            <p style={{ fontSize: 12, fontWeight: 500, color: G.muted, letterSpacing: '0.07em' }}>HOW ARE YOU FEELING RIGHT NOW?</p>
            {ENERGY_MODES.map(m => (
              <div key={m.id} onClick={() => { setEnergyMode(m); setScreen('input') }}
                style={{ background: 'white', border: `1.5px solid ${G.border}`, borderRadius: 16, padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{m.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 16, fontWeight: 500, color: G.dark }}>{m.label}</p>
                  <p style={{ fontSize: 13, color: G.sub, marginTop: 2 }}>{m.desc}</p>
                </div>
              </div>
            ))}
            <AmbientPlayer />
            <p style={{ fontSize: 12, fontWeight: 500, color: G.muted, letterSpacing: '0.07em', marginTop: 4 }}>NEED HELP RIGHT NOW?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Btn label="🌬️ Breathing" onClick={startBreathing} bg={G.light} color={G.dark} border={`1px solid ${G.border}`} />
              <Btn label="💧 Hydration" onClick={() => setScreen('hydration')} bg={G.light} color={G.dark} border={`1px solid ${G.border}`} />
            </div>
          </div>
        </div>
      )}

      {/* INPUT */}
      {screen === 'input' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Header eyebrow={`· ${energyMode?.label?.toUpperCase()}`} title="What would feel manageable?" subtitle={energyMode?.tip} />
          <div style={{ ...wide, flex: 1, padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div onClick={toggleVoice} style={{ background: G.light, border: `2px dashed ${isRecording ? G.primary : G.border}`, borderRadius: 20, padding: '32px 20px', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: G.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                  <rect x="10" y="3" width="10" height="17" rx="5" fill="white" />
                  <path d="M5 15a10 10 0 0020 0" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="15" y1="25" x2="15" y2="29" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="11" y1="29" x2="19" y2="29" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
              <p style={{ fontSize: 16, fontWeight: 500, color: G.dark, marginBottom: 4 }}>{isRecording ? 'Listening... tap to stop' : 'Press to speak'}</p>
              <p style={{ fontSize: 13, color: G.primary }}>No pressure — say it however it comes out</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
              <span style={{ fontSize: 12, color: G.muted }}>or type instead</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
            </div>
            <Textarea value={taskText} onChange={e => setTaskText(e.target.value)} rows={4}
              placeholder={'Even "get out of bed" counts.\nAny task — big or tiny — works here.'}
              className="text-base resize-none bg-white font-[inherit] leading-relaxed focus-visible:border-[#16a34a] focus-visible:ring-[#16a34a]/30"
            />
            <Tip text="There is no task too small. Getting dressed is a win. Making tea is a win. Anything counts." />
            <Btn label="Make it manageable for me" onClick={submitTask} disabled={!taskText.trim()} />
            <Btn label="← Back" onClick={() => setScreen('home')} bg="transparent" color={G.sub} border="1px solid rgba(0,0,0,0.12)" />
          </div>
        </div>
      )}

      {/* LOADING */}
      {screen === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Header eyebrow="· DEPRESSION & FATIGUE MODE" title="Got it" subtitle="Creating gentle steps for you..." />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 40 }}>
            <div style={{ width: 56, height: 56, border: `3px solid ${G.light}`, borderTopColor: G.primary, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 17, fontWeight: 500, color: G.text, marginBottom: 8 }}>{loadMsg}</p>
              <p style={{ fontSize: 14, color: G.muted }}>Almost there</p>
            </div>
          </div>
        </div>
      )}

      {/* OVERVIEW */}
      {screen === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Header eyebrow={`· ${energyMode?.label?.toUpperCase()}`} title={taskText.length > 34 ? taskText.slice(0, 34) + '...' : taskText} subtitle={`${steps.length} gentle steps — your pace, your rules`} />
          <div style={{ background: G.light, padding: '10px 24px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 6, background: 'rgba(99,153,34,0.15)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${steps.length ? Math.round((currentIdx / steps.length) * 100) : 0}%`, background: G.primary, borderRadius: 99, transition: 'width 0.5s ease' }} />
            </div>
            <p style={{ fontSize: 12, fontWeight: 500, color: G.dark, whiteSpace: 'nowrap' }}>{currentIdx} of {steps.length}</p>
          </div>
          <div style={{ ...wide, flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
            {steps.map((s, i) => {
              const isDone = i < currentIdx, isActive = i === currentIdx
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', background: isActive ? G.light : 'white', border: `${isActive ? 2 : 1}px solid ${isActive ? G.primary : G.border}`, borderRadius: 16, opacity: isDone ? 0.5 : 1 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, flexShrink: 0, background: isDone ? '#E1F5EE' : isActive ? G.primary : G.light, color: isDone ? '#1D9E75' : isActive ? 'white' : G.muted }}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: isDone ? G.muted : G.text, textDecoration: isDone ? 'line-through' : 'none', lineHeight: 1.4, margin: 0 }}>{s.step}</p>
                    <p style={{ fontSize: 12, color: isActive ? G.primary : G.muted, marginTop: 3, fontWeight: isActive ? 500 : 400 }}>{isDone ? 'Done ✓' : isActive ? 'Now · ' + s.time : s.time}</p>
                  </div>
                </div>
              )
            })}
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Btn label="Start — one step at a time" onClick={() => setScreen('step')} />
              <Btn label="I need breathing first" onClick={startBreathing} bg={G.light} color={G.dark} border={`1px solid ${G.border}`} />
            </div>
          </div>
        </div>
      )}

      {/* STEP */}
      {screen === 'step' && current && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Header eyebrow={`STEP ${currentIdx + 1} OF ${steps.length}`} title="Just this one thing" subtitle="No rush — go at whatever pace feels right" />
          <div style={{ ...wide, flex: 1, padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: G.light, border: `2px solid ${G.primary}`, borderRadius: 20, padding: '28px 24px' }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: G.primary, letterSpacing: '0.07em', marginBottom: 12 }}>YOUR NEXT SMALL WIN</p>
              <p style={{ fontFamily: 'Lora, serif', fontSize: 22, fontWeight: 500, color: G.deep, lineHeight: 1.45, marginBottom: 10 }}>{current.step}</p>
              <p style={{ fontSize: 14, color: G.primary }}>{current.time}</p>
            </div>
            <Tip text={current.tip || 'You are doing something. That matters more than you know.'} />
            <Btn label="🔊 Read this out loud" onClick={() => speakText(current.step)} bg={G.light} color={G.dark} border={`1px solid ${G.border}`} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
              <Btn label="I did it ★" onClick={() => setScreen('win')} />
              <Btn label="I need a breathing break" onClick={startBreathing} bg={G.light} color={G.dark} border={`1px solid ${G.border}`} />
              <Btn label="See all steps" onClick={() => setScreen('overview')} bg="transparent" color={G.sub} border="1px solid rgba(0,0,0,0.12)" />
            </div>
          </div>
        </div>
      )}

      {/* WIN */}
      {screen === 'win' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Header eyebrow="· TINY WIN" title="You did it." subtitle="That was real. That counted." />
          <div style={{ ...wide, flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 110, height: 110, borderRadius: '50%', background: G.light, border: `3px solid ${G.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>★</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Lora, serif', fontSize: 28, fontWeight: 600, color: G.text, marginBottom: 10 }}>Win {wins + 1} today</p>
              <p style={{ fontSize: 15, color: G.sub, lineHeight: 1.7, maxWidth: 340 }}>
                {currentIdx + 1 >= steps.length ? 'That was the last step. You did everything.' : `${steps.length - currentIdx - 1} step${steps.length - currentIdx - 1 !== 1 ? 's' : ''} left — but there is zero pressure to continue.`}
              </p>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentIdx + 1 < steps.length
                ? <Btn label="Keep going — next step" onClick={completeStep} />
                : <Btn label="Finish session" onClick={() => { setWins(w => w + 1); setScreen('done') }} />}
              <Btn label="That is enough for today ✓" onClick={() => { setWins(w => w + 1); setScreen('done') }} bg={G.light} color={G.dark} border={`1px solid ${G.border}`} />
            </div>
          </div>
        </div>
      )}

      {/* HYDRATION */}
      {screen === 'hydration' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Header eyebrow="· HYDRATION CHECK" title="Quick check-in" subtitle="Your body matters too" bg="#185FA5" />
          <div style={{ ...wide, flex: 1, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center' }}>
            <div style={{ background: '#E6F1FB', border: '1px solid #B5D4F4', borderRadius: 20, padding: '32px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 52, marginBottom: 14 }}>💧</p>
              <p style={{ fontFamily: 'Lora, serif', fontSize: 19, fontWeight: 500, color: '#0C447C', lineHeight: 1.5 }}>Have you had any water in the last hour?</p>
            </div>
            <div style={{ background: '#E6F1FB', border: '1px solid #B5D4F4', borderRadius: 14, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#185FA5', lineHeight: 1.6 }}>When you have low mood or fatigue, even mild dehydration makes everything harder. One glass genuinely helps your brain.</p>
            </div>
            <Btn label="I had some water — continue ✓" onClick={() => setScreen('step')} bg="#185FA5" />
            <Btn label="Skip for now" onClick={() => setScreen('step')} bg="transparent" color={G.sub} border="1px solid rgba(0,0,0,0.12)" />
          </div>
        </div>
      )}

      {/* BREATHING */}
      {screen === 'breathing' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Header eyebrow="· BOX BREATHING 4-7-8" title="Just breathe" subtitle="Follow the guide — 4 complete cycles" bg="#534AB7" />
          <div style={{ ...wide, flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: BREATH_PATTERN[breathPhase]?.size || 120, height: BREATH_PATTERN[breathPhase]?.size || 120, borderRadius: '50%', background: BREATH_PATTERN[breathPhase]?.color || '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.8s ease', border: '3px solid rgba(255,255,255,0.3)' }}>
              <p style={{ fontFamily: 'Lora, serif', fontSize: 17, fontWeight: 500, color: 'white', textAlign: 'center', padding: '0 16px', lineHeight: 1.4 }}>
                {breathDone ? 'Well done ✓' : breathRunning ? BREATH_PATTERN[breathPhase]?.label : 'Ready?'}
              </p>
            </div>
            {breathRunning && <p style={{ fontSize: 13, color: '#7F77DD', fontWeight: 500 }}>Cycle {breathCycle + 1} of 4</p>}
            <div style={{ background: '#EEEDFE', border: '1px solid #AFA9EC', borderRadius: 14, padding: '14px 20px', textAlign: 'center', width: '100%' }}>
              <p style={{ fontSize: 13, color: '#534AB7', lineHeight: 1.7 }}>In for 4 · Hold for 7 · Out for 8 · Hold for 2</p>
              <p style={{ fontSize: 12, color: '#7F77DD', marginTop: 4 }}>Activates your parasympathetic nervous system</p>
            </div>
            {!breathRunning && !breathDone && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Btn label="Start breathing exercise" onClick={() => { setBreathRunning(true); setBreathPhase(0); setBreathCycle(0) }} bg="#7F77DD" />
                <Btn label="← Back" onClick={() => setScreen(steps.length > 0 ? 'step' : 'home')} bg="transparent" color={G.sub} border="1px solid rgba(0,0,0,0.12)" />
              </div>
            )}
            {breathDone && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Btn label="I feel calmer — continue" onClick={() => setScreen(steps.length > 0 ? 'step' : 'home')} bg="#7F77DD" />
                <Btn label="Do another round" onClick={() => { setBreathRunning(true); setBreathPhase(0); setBreathCycle(0); setBreathDone(false) }} bg="transparent" color={G.sub} border="1px solid rgba(0,0,0,0.12)" />
              </div>
            )}
            {breathRunning && <Btn label="Stop" onClick={() => { setBreathRunning(false); setBreathDone(false) }} bg="transparent" color={G.sub} border="1px solid rgba(0,0,0,0.12)" />}
          </div>
        </div>
      )}

      {/* DONE */}
      {screen === 'done' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Header eyebrow="· SESSION COMPLETE" title="Session done." subtitle="You showed up and did something. That matters." />
          <div style={{ ...wide, flex: 1, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ textAlign: 'center', paddingTop: 8 }}>
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: G.light, border: `3px solid ${G.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 42 }}>★</div>
              <p style={{ fontFamily: 'Lora, serif', fontSize: 28, fontWeight: 600, color: G.text, marginBottom: 10 }}>{wins} win{wins !== 1 ? 's' : ''} today</p>
              <p style={{ fontSize: 15, color: G.sub, lineHeight: 1.7, maxWidth: 360, margin: '0 auto' }}>On hard days, finishing even one small thing is a real achievement. You did that today.</p>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: G.muted, letterSpacing: '0.07em', marginBottom: 12 }}>HOW DO YOU FEEL NOW?</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {['Better', 'Same', 'Tired', 'Proud', 'Relieved', 'Okay'].map(m => (
                  <button key={m} onClick={() => setMood(m)} style={{ padding: '13px 8px', borderRadius: 14, border: mood === m ? `2px solid ${G.primary}` : `1px solid ${G.border}`, background: mood === m ? G.light : 'white', fontSize: 13, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', color: mood === m ? G.dark : G.sub, cursor: 'pointer' }}>{m}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Btn label="Done for now" onClick={() => { saveMoodEntry(mood); reset() }} />
              <Btn label="Start another task" onClick={() => { setTaskText(''); setSteps([]); setCurrentIdx(0); setMood(null); setScreen('input') }} bg={G.light} color={G.dark} border={`1px solid ${G.border}`} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
