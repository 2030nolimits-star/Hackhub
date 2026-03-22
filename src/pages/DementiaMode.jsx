import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { getGeminiModel } from '../lib/gemini'
import { useAgentLoop } from '../lib/useAgentLoop'
import { useAgent } from '../context/AgentContext'
import './DementiaMode.css'

// ─── Icons (inline SVG to avoid lucide bundle issues) ─────────────────────────
const Icon = ({ d, size = 28, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)
const HomeIcon  = () => <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />
const CalIcon   = () => <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
const BookIcon  = () => <Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" />
const UsersIcon = () => <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
const MusicIcon = () => <Icon d="M9 18V5l12-2v13 M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
const MicIcon   = () => <Icon d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8" />
const HeartIcon = () => <Icon d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
const AlertIcon = () => <Icon d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01" />
const CheckIcon = () => <Icon d="M20 6L9 17l-5-5" size={22} />
const PlusIcon  = () => <Icon d="M12 5v14M5 12h14" size={22} />
const BackIcon  = () => <Icon d="M19 12H5M12 5l-7 7 7 7" size={22} />
const PauseIcon = () => <Icon d="M6 4h4v16H6zM14 4h4v16h-4z" size={26} />
const PlayIcon  = () => <Icon d="M5 3l14 9-14 9V3z" size={26} />
const GridIcon  = () => <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" size={24} />
const CoffeeIcon= () => <Icon d="M18 8h1a4 4 0 0 1 0 8h-1 M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z M6 1v3M10 1v3M14 1v3" size={26} />

// ─── AI helper ────────────────────────────────────────────────────────────────

async function generateMemoryPrompt() {
  const fallbacks = [
    'What is your favourite meal that someone made for you?',
    'Tell me about a place you loved visiting.',
    'Who made you laugh the most when you were young?',
    'What was your favourite song when you were younger?',
    'Describe a happy birthday or celebration you remember.',
  ]
  try {
    const model = getGeminiModel();
    const result = await model.generateContent('You are a warm, gentle assistant helping someone with dementia reflect on happy memories. Write ONE short, warm memory prompt (max 15 words) to help them recall a positive moment from their life. Return only the prompt, no quotes or extra text.');
    const text = result.response.text().trim();
    return text || fallbacks[Math.floor(Math.random() * fallbacks.length)];
  } catch {
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

async function generateMemoryStory(text, prompt) {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(`You are a warm storyteller helping someone preserve their precious memories. Take the memory they shared and gently expand it into a short, beautifully told story of 3-4 sentences. Add warmth and specific sensory details they might recognise. Use very simple, clear language. Add 2-3 relevant emojis as visual anchors within the story. Return only the story, no titles or extra text.\n\nMemory prompt: "${prompt}"\nTheir memory: "${text}"\n\nWrite their illustrated story:`);
    return result.response.text().trim() || null;
  } catch { return null; }
}

// ─── Audio service ────────────────────────────────────────────────────────────
const sound = {
  ctx: null,
  vol: 0.05,
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)() },
  tone(freq, type, dur) {
    this.init()
    const o = this.ctx.createOscillator(), g = this.ctx.createGain()
    o.type = type; o.frequency.setValueAtTime(freq, this.ctx.currentTime)
    g.gain.setValueAtTime(this.vol, this.ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur)
    o.connect(g); g.connect(this.ctx.destination)
    o.start(); o.stop(this.ctx.currentTime + dur)
  },
  click()   { this.tone(440, 'sine', 0.08) },
  success() { this.tone(523, 'sine', 0.1); setTimeout(() => this.tone(659, 'sine', 0.1), 110); setTimeout(() => this.tone(784, 'sine', 0.18), 220) },
  alert()   { this.tone(220, 'sawtooth', 0.3); setTimeout(() => this.tone(220, 'sawtooth', 0.3), 380) },
}

// ─── Reality Orientation Clock (always on home) ───────────────────────────────
function OrientationClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  const period = now.getHours() < 12 ? '🌅 Morning' : now.getHours() < 17 ? '☀️ Afternoon' : '🌙 Evening'
  return (
    <div className="dm-orientation dm-animate">
      <div className="dm-time">
        {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="dm-date">
        {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
      <div className="dm-period">{period}</div>
    </div>
  )
}

// ─── Page header with back button ─────────────────────────────────────────────
function PageHeader({ title, onBack }) {
  return (
    <div className="dm-page-header dm-animate">
      <button className="dm-back-btn" onClick={() => { sound.click(); onBack() }} aria-label="Go back">
        <BackIcon />
      </button>
      <h1 style={{ fontSize: '1.6rem' }}>{title}</h1>
    </div>
  )
}

const MOODS = ['😢', '😕', '😐', '🙂', '😄']

// ─── SCREEN: Home ─────────────────────────────────────────────────────────────
function HomeScreen({ onGo }) {
  const name = localStorage.getItem('dm_user_name') || ''
  const [mood, setMood] = useState(localStorage.getItem('dm_today_mood') || '')
  const [nextTask, setNextTask] = useState(null)

  useEffect(() => {
    // Load next upcoming incomplete task
    supabase.from('routines').select('*').eq('completed', false).order('order_index').limit(1)
      .then(({ data }) => { if (data?.[0]) setNextTask(data[0]) })
  }, [])

  const pickMood = (m) => {
    setMood(m)
    localStorage.setItem('dm_today_mood', m)
    sound.success()
  }

  const items = [
    { key: 'schedule', icon: <CalIcon />,   label: 'My Daily Plan',   color: '#C96B00' },
    { key: 'journal',  icon: <BookIcon />,  label: 'Memory Journal',  color: '#2E7D32' },
    { key: 'faces',    icon: <UsersIcon />, label: 'Familiar Faces',  color: '#6A3D9A' },
    { key: 'music',    icon: <MusicIcon />, label: 'Music & Calm',    color: '#1565C0' },
    { key: 'games',    icon: <GridIcon />,  label: 'Brain Activities',color: '#C96B00' },
    { key: 'memories', icon: <HeartIcon />, label: 'My Memories',     color: '#AD1457' },
    { key: 'settings', icon: <span style={{fontSize:'1.4rem'}}>⚙️</span>, label: 'Settings', color: '#5D4E37' },
  ]

  return (
    <div className="dm-page dm-animate">
      <OrientationClock />

      {/* Personalised greeting */}
      <div className="dm-card" style={{ padding: '16px 20px' }}>
        <p style={{ margin: 0, fontSize: '1.15rem', color: 'var(--dm-text)', fontWeight: 600 }}>
          {name ? `Welcome back, ${name}. 👋` : 'Welcome back. 👋'}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '1rem', color: 'var(--dm-muted)' }}>
          You are safe. What would you like to do today?
        </p>
      </div>

      {/* Mood check-in */}
      <div className="dm-card">
        <div className="dm-label" style={{ marginBottom: 10 }}>How are you feeling right now?</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          {MOODS.map(m => (
            <button key={m} onClick={() => pickMood(m)} style={{
              flex: 1, height: 56, fontSize: '1.8rem', borderRadius: 14, cursor: 'pointer',
              border: `2px solid ${mood === m ? 'var(--dm-amber)' : 'var(--dm-border)'}`,
              background: mood === m ? 'var(--dm-amber-lt)' : 'transparent',
              transition: 'all 0.15s',
            }}>
              {m}
            </button>
          ))}
        </div>
        {mood && <p style={{ margin: '10px 0 0', fontSize: '0.95rem', color: 'var(--dm-muted)', textAlign: 'center' }}>Thank you for sharing 💛</p>}
      </div>

      {/* Next task widget */}
      {nextTask && (
        <button className="dm-card" onClick={() => { sound.click(); onGo('schedule') }}
          style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: '2px solid var(--dm-amber)', background: 'var(--dm-amber-lt)' }}>
          <div className="dm-label" style={{ marginBottom: 4 }}>⏰ Coming up next</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--dm-text)' }}>{nextTask.task}</div>
          {nextTask.time && <div style={{ fontSize: '1rem', color: 'var(--dm-amber)', marginTop: 2 }}>{nextTask.time}</div>}
          <div style={{ fontSize: '0.9rem', color: 'var(--dm-muted)', marginTop: 6 }}>Tap to see your full plan →</div>
        </button>
      )}

      <div className="dm-menu-grid">
        {items.map(item => (
          <button key={item.key} className="dm-btn dm-btn-outline" style={{ borderColor: item.color, color: item.color }}
            onClick={() => { sound.click(); onGo(item.key) }}>
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── SCREEN: Daily Schedule ───────────────────────────────────────────────────
function ScheduleScreen({ onBack }) {
  const [routines, setRoutines] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newTask, setNewTask] = useState({ time: '', task: '' })

  const load = async () => {
    const { data } = await supabase.from('routines').select('*').order('order_index')
    if (data) setRoutines(data)
  }
  useEffect(() => { load() }, [])

  const toggle = async (id, done) => {
    sound.click()
    setRoutines(r => r.map(x => x.id === id ? { ...x, completed: !done } : x))
    await supabase.from('routines').update({ completed: !done }).eq('id', id)
    if (!done) sound.success()
  }

  const remove = async (id) => {
    sound.click()
    setRoutines(r => r.filter(x => x.id !== id))
    await supabase.from('routines').delete().eq('id', id)
  }

  const add = async () => {
    if (!newTask.time || !newTask.task) return
    const { error } = await supabase.from('routines').insert([{ time: newTask.time, task: newTask.task, order_index: routines.length }])
    if (!error) { sound.success(); setShowForm(false); setNewTask({ time: '', task: '' }); load() }
  }

  const doneCount = routines.filter(r => r.completed).length

  return (
    <div className="dm-page dm-animate">
      <PageHeader title="My Daily Plan" onBack={onBack} />

      {routines.length > 0 && (
        <div className="dm-card" style={{ padding: '16px 20px' }}>
          <div className="dm-label" style={{ marginBottom: 8 }}>Progress today</div>
          <div className="dm-progress-bar">
            <div className="dm-progress-fill" style={{ width: `${(doneCount / routines.length) * 100}%` }} />
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '1rem' }}>{doneCount} of {routines.length} tasks done</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {routines.map(r => (
          <div key={r.id} className={`dm-routine-item ${r.completed ? 'done' : ''}`}>
            <button className="dm-check" onClick={() => toggle(r.id, r.completed)} aria-label={r.completed ? 'Mark undone' : 'Mark done'}>
              {r.completed && <CheckIcon />}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.95rem', color: 'var(--dm-amber)', fontWeight: 700, marginBottom: 2 }}>{r.time}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--dm-text)', textDecoration: r.completed ? 'line-through' : 'none' }}>{r.task}</div>
            </div>
            <button onClick={() => remove(r.id)} aria-label="Delete task"
              style={{ width: 40, height: 40, borderRadius: 10, border: '1.5px solid var(--dm-border)', background: 'transparent', cursor: 'pointer', color: 'var(--dm-muted)', fontSize: '1.1rem', flexShrink: 0 }}>
              ✕
            </button>
          </div>
        ))}

        {routines.length === 0 && !showForm && (
          <div className="dm-card" style={{ textAlign: 'center', padding: 32 }}>
            <p style={{ marginBottom: 20 }}>No tasks yet. Add your first one!</p>
            <button className="dm-btn dm-btn-primary" style={{ maxWidth: 280, margin: '0 auto' }} onClick={() => setShowForm(true)}>
              <PlusIcon /> Add a Task
            </button>
          </div>
        )}

        {!showForm && routines.length > 0 && (
          <button className="dm-btn dm-btn-outline" onClick={() => setShowForm(true)}>
            <PlusIcon /> Add Another Task
          </button>
        )}

        {showForm && (
          <div className="dm-card" style={{ border: '2px solid var(--dm-amber)' }}>
            <h3 style={{ marginBottom: 16 }}>New Task</h3>
            <label className="dm-label" style={{ display: 'block', marginBottom: 6 }}>What time?</label>
            <Input className="mb-3 dm-input-override" placeholder="e.g. 9:00 AM" value={newTask.time} onChange={e => setNewTask({ ...newTask, time: e.target.value })} />
            <label className="dm-label" style={{ display: 'block', marginBottom: 6 }}>What will you do?</label>
            <Input className="mb-5 dm-input-override" placeholder="e.g. Take morning tablets" value={newTask.task} onChange={e => setNewTask({ ...newTask, task: e.target.value })} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="dm-btn dm-btn-green" onClick={add} style={{ flex: 1 }}>Save Task</button>
              <button className="dm-btn dm-btn-outline" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SCREEN: Memory Journal (Reminiscence therapy) ────────────────────────────
function JournalScreen({ onBack }) {
  const [prompt, setPrompt] = useState('')
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generatedStory, setGeneratedStory] = useState(null)
  const recognitionRef = useRef(null)
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition

  useEffect(() => {
    generateMemoryPrompt().then(setPrompt)
    if (SR) {
      recognitionRef.current = new SR()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.onresult = e => {
        let final = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript
        }
        if (final) setText(p => p + (p && !p.endsWith(' ') ? ' ' : '') + final)
      }
      recognitionRef.current.onerror = () => setRecording(false)
    }
    return () => recognitionRef.current?.stop()
  }, [])

  const toggleMic = () => {
    sound.click()
    if (!SR) { alert('Voice recording is not available in this browser. Please type your memory.'); return }
    if (recording) { recognitionRef.current?.stop(); setRecording(false) }
    else { recognitionRef.current?.start(); setRecording(true) }
  }

  const save = async () => {
    if (!text.trim()) return
    setSaving(true)
    sound.success()
    const story = await generateMemoryStory(text.trim(), prompt)
    setGeneratedStory(story)
    const fullContent = story ? `${text.trim()}\n✨STORY✨\n${story}` : text.trim()
    await supabase.from('memories').insert([{ content: fullContent, prompt }])
    setSaving(false)
    setSaved(true)
  }

  if (saved) return (
    <div className="dm-page dm-animate">
      <div className="dm-card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>💛</div>
        <h2 style={{ marginBottom: 12 }}>Memory Saved!</h2>
        <p style={{ marginBottom: 28 }}>Thank you for sharing that beautiful memory.</p>
      </div>
      {generatedStory && (
        <div className="dm-card" style={{ border: '2px solid var(--dm-amber)', background: 'var(--dm-amber-lt)' }}>
          <div className="dm-label" style={{ marginBottom: 10 }}>✨ Your Illustrated Story</div>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.7, color: 'var(--dm-text)', margin: 0 }}>{generatedStory}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--dm-muted)', marginTop: 10 }}>This story is saved in "My Memories" for you to read again.</p>
        </div>
      )}
      <button className="dm-btn dm-btn-primary" onClick={() => { setText(''); setSaved(false); setGeneratedStory(null); generateMemoryPrompt().then(setPrompt) }}>
        <PlusIcon /> Share Another Memory
      </button>
    </div>
  )

  return (
    <div className="dm-page dm-animate">
      <PageHeader title="Memory Journal" onBack={onBack} />

      <div className="dm-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div className="dm-label">Today's memory prompt</div>
          <button onClick={() => generateMemoryPrompt().then(setPrompt)}
            style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dm-amber)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
            Try another ↻
          </button>
        </div>
        <div className="dm-prompt-chip">{prompt || 'Loading your prompt...'}</div>
      </div>

      <div className="dm-card">
        <div className="dm-label" style={{ marginBottom: 10 }}>Your memory</div>
        <Textarea className="dm-input-override resize-none min-h-[120px]" placeholder="Write or speak your memory here..." value={text} onChange={e => setText(e.target.value)} />

        <button
          className={`dm-btn ${recording ? 'dm-btn-red' : 'dm-btn-amber-lt'} ${recording ? 'dm-recording' : ''}`}
          style={{ marginTop: 12 }}
          onClick={toggleMic}
        >
          <MicIcon /> {recording ? 'Listening — tap to stop' : 'Tap to speak your memory'}
        </button>
      </div>

      <button className="dm-btn dm-btn-green" onClick={save} disabled={!text.trim() || saving} style={{ opacity: (text.trim() && !saving) ? 1 : 0.45 }}>
        <CheckIcon /> {saving ? 'Creating your story...' : 'Save This Memory'}
      </button>
    </div>
  )
}

// ─── SCREEN: Familiar Faces ───────────────────────────────────────────────────
function FacesScreen({ onBack }) {
  const [people, setPeople] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newPerson, setNewPerson] = useState({ name: '', relation: '', emoji: '😊', photo_url: '' })
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const load = async () => {
    const { data } = await supabase.from('people').select('*')
    if (data) setPeople(data)
  }
  useEffect(() => { load() }, [])

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    setPreview(URL.createObjectURL(file))

    // Upload to Supabase Storage
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `faces/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('face-photos').upload(path, file, { upsert: true })
    if (error) {
      console.error('Upload error:', error)
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('face-photos').getPublicUrl(path)
    setNewPerson(p => ({ ...p, photo_url: data.publicUrl }))
    setUploading(false)
  }

  const add = async () => {
    if (!newPerson.name || !newPerson.relation) return
    sound.click()
    const { error } = await supabase.from('people').insert([newPerson])
    if (!error) {
      sound.success()
      setShowForm(false)
      setNewPerson({ name: '', relation: '', emoji: '😊', photo_url: '' })
      setPreview(null)
      load()
    }
  }

  const EMOJIS = ['😊', '👨', '👩', '👴', '👵', '👦', '👧', '🧑']

  return (
    <div className="dm-page dm-animate">
      <PageHeader title="Familiar Faces" onBack={onBack} />

      <div className="dm-card" style={{ padding: '14px 20px' }}>
        <p style={{ margin: 0 }}>These are people who love you and care about you.</p>
      </div>

      <div className="dm-face-grid">
        {people.map(p => (
          <div key={p.id} className="dm-face-card">
            {p.photo_url ? (
              <img src={p.photo_url} alt={p.name}
                style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--dm-amber)' }} />
            ) : (
              <div className="dm-face-avatar">{p.emoji || '😊'}</div>
            )}
            <div className="dm-face-name">{p.name}</div>
            <div className="dm-face-rel">{p.relation}</div>
          </div>
        ))}

        {!showForm && (
          <button className="dm-btn dm-btn-outline" style={{ minHeight: 100, flexDirection: 'column', gap: 6, fontSize: '1rem' }} onClick={() => setShowForm(true)}>
            <PlusIcon /> Add Person
          </button>
        )}
      </div>

      {showForm && (
        <div className="dm-card" style={{ border: '2px solid var(--dm-amber)' }}>
          <h3 style={{ marginBottom: 20 }}>Add a Person</h3>

          {/* Photo upload */}
          <div className="dm-label" style={{ marginBottom: 10 }}>Their photo</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', border: '3px solid var(--dm-border)', overflow: 'hidden', flexShrink: 0, background: 'var(--dm-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              {preview
                ? <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (newPerson.emoji || '😊')
              }
            </div>
            <div style={{ flex: 1 }}>
              <button className="dm-btn dm-btn-amber-lt" style={{ minHeight: 56, fontSize: '1rem' }}
                onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? 'Uploading...' : preview ? '📷 Change Photo' : '📷 Add a Photo'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
              {!preview && <p style={{ fontSize: '0.9rem', margin: '8px 0 0', color: 'var(--dm-muted)' }}>Or choose an emoji below</p>}
            </div>
          </div>

          {/* Emoji picker (fallback) */}
          {!preview && (
            <>
              <div className="dm-label" style={{ marginBottom: 8 }}>Choose an emoji instead</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setNewPerson({ ...newPerson, emoji: e })}
                    style={{ width: 48, height: 48, fontSize: '1.8rem', borderRadius: 12, border: `2px solid ${newPerson.emoji === e ? 'var(--dm-amber)' : 'var(--dm-border)'}`, background: newPerson.emoji === e ? 'var(--dm-amber-lt)' : 'transparent', cursor: 'pointer' }}>
                    {e}
                  </button>
                ))}
              </div>
            </>
          )}

          <label className="dm-label" style={{ display: 'block', marginBottom: 6 }}>Their name</label>
          <Input className="mb-3.5 dm-input-override" placeholder="e.g. Sarah" value={newPerson.name} onChange={e => setNewPerson({ ...newPerson, name: e.target.value })} />

          <label className="dm-label" style={{ display: 'block', marginBottom: 6 }}>Who are they to you?</label>
          <Input className="mb-6 dm-input-override" placeholder="e.g. My daughter" value={newPerson.relation} onChange={e => setNewPerson({ ...newPerson, relation: e.target.value })} />

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="dm-btn dm-btn-green" onClick={add} disabled={uploading || !newPerson.name || !newPerson.relation} style={{ flex: 1, opacity: (!newPerson.name || !newPerson.relation) ? 0.5 : 1 }}>Save</button>
            <button className="dm-btn dm-btn-outline" onClick={() => { setShowForm(false); setPreview(null) }} style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SCREEN: Music & Calm ─────────────────────────────────────────────────────
function MusicScreen({ onBack }) {
  const [playing, setPlaying] = useState(null)
  const audioRef = useRef(null)

  const tracks = [
    { key: 'nature',   label: 'Nature Sounds',        desc: 'Gentle forest & birdsong',   emoji: '🌿', url: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3' },
    { key: 'classic',  label: 'Relaxing Music',        desc: 'Calm, peaceful melodies',    emoji: '🎵', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { key: 'rain',     label: 'Gentle Rain',           desc: 'Soft rain for relaxation',   emoji: '🌧️', url: 'https://assets.mixkit.co/active_storage/sfx/2395/2395-preview.mp3' },
  ]

  const toggle = (track) => {
    sound.click()
    if (playing === track.key) {
      audioRef.current?.pause(); setPlaying(null)
    } else {
      audioRef.current?.pause()
      audioRef.current = new Audio(track.url)
      audioRef.current.loop = true
      audioRef.current.volume = 0.7
      audioRef.current.play()
      setPlaying(track.key)
    }
  }
  useEffect(() => () => audioRef.current?.pause(), [])

  return (
    <div className="dm-page dm-animate">
      <PageHeader title="Music & Calm" onBack={onBack} />

      <div className="dm-card" style={{ padding: '14px 20px' }}>
        <p style={{ margin: 0 }}>Music can help you feel calm and bring back happy memories. Choose something to listen to.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tracks.map(t => (
          <div key={t.key} className={`dm-activity-card ${playing === t.key ? 'active' : ''}`} onClick={() => toggle(t)}>
            <div className="dm-activity-icon" style={{ background: playing === t.key ? 'var(--dm-green-lt)' : 'var(--dm-amber-lt)', fontSize: '1.8rem' }}>
              {t.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--dm-text)' }}>{t.label}</div>
              <div style={{ fontSize: '1rem', color: 'var(--dm-muted)' }}>{playing === t.key ? '▶ Now playing...' : t.desc}</div>
            </div>
            {playing === t.key ? <PauseIcon /> : <PlayIcon />}
          </div>
        ))}
      </div>

      <div className="dm-card" style={{ textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>💆</div>
        <h3 style={{ marginBottom: 8 }}>Breathing Exercise</h3>
        <p style={{ marginBottom: 16 }}>Breathe in slowly for 4 counts, hold for 4, breathe out for 6. Repeat 3 times.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, maxWidth: 300, margin: '0 auto' }}>
          {[{ label: 'Breathe in', count: '4 counts', color: 'var(--dm-amber)' }, { label: 'Hold', count: '4 counts', color: 'var(--dm-muted)' }, { label: 'Breathe out', count: '6 counts', color: 'var(--dm-green)' }].map(s => (
            <div key={s.label} style={{ padding: '12px 8px', borderRadius: 12, border: `2px solid ${s.color}`, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: s.color, fontSize: '0.85rem' }}>{s.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--dm-muted)' }}>{s.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── SCREEN: Brain Activities ─────────────────────────────────────────────────
const GAME_EMOJIS = ['🌸', '🌸', '🐶', '🐶', '🌈', '🌈', '☀️', '☀️']

function GamesScreen({ onBack }) {
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)

  const init = () => {
    setCards([...GAME_EMOJIS].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, emoji: e })))
    setFlipped([]); setMatched([]); setMoves(0)
  }
  useEffect(() => init(), [])

  const flip = (id) => {
    if (flipped.length === 2 || matched.includes(id) || flipped.includes(id)) return
    sound.click()
    const next = [...flipped, id]
    setFlipped(next)
    if (next.length === 2) {
      setMoves(m => m + 1)
      const [a, b] = next
      if (cards[a].emoji === cards[b].emoji) {
        setMatched(m => [...m, a, b]); setFlipped([]); sound.success()
      } else {
        setTimeout(() => setFlipped([]), 1000)
      }
    }
  }

  const allDone = matched.length === cards.length && cards.length > 0

  return (
    <div className="dm-page dm-animate">
      <PageHeader title="Brain Activities" onBack={onBack} />

      <div className="dm-card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="dm-label">Memory Matching</div>
          <p style={{ margin: '4px 0 0' }}>Find the matching pairs</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--dm-amber)' }}>{moves}</div>
          <div className="dm-label">moves</div>
        </div>
      </div>

      {allDone ? (
        <div className="dm-card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🎉</div>
          <h2 style={{ marginBottom: 8 }}>Well done!</h2>
          <p style={{ marginBottom: 24 }}>You matched all the pairs in {moves} moves!</p>
          <button className="dm-btn dm-btn-primary" onClick={init}>Play Again</button>
        </div>
      ) : (
        <div className="dm-game-grid">
          {cards.map((card, i) => {
            const isFlipped  = flipped.includes(i)
            const isMatched  = matched.includes(i)
            return (
              <div key={i} className={`dm-game-card ${isMatched ? 'matched' : isFlipped ? 'flipped' : ''}`} onClick={() => flip(i)}>
                {(isFlipped || isMatched) ? <span style={{ fontSize: '2.5rem' }}>{card.emoji}</span> : <span style={{ fontSize: '1.5rem', color: 'var(--dm-border)' }}>?</span>}
              </div>
            )
          })}
        </div>
      )}

      <div className="dm-card" style={{ padding: '14px 20px' }}>
        <p style={{ margin: 0 }}>💡 <strong>Tip:</strong> Remember where you saw each picture. Try to find its pair!</p>
      </div>
    </div>
  )
}

// ─── SCREEN: My Memories ──────────────────────────────────────────────────────
function MemoriesScreen({ onBack }) {
  const [memories, setMemories] = useState([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.from('memories').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setMemories(data)
    })
  }, [])

  const shareMemories = () => {
    const name = localStorage.getItem('dm_user_name') || 'your loved one'
    const recent = memories.slice(0, 3)
    const lines = recent.map(m => {
      const [original] = m.content.split('\n✨STORY✨\n')
      const date = new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
      return `📅 ${date}: "${original}"`
    }).join('\n\n')
    const text = `Here are some recent memories from ${name}:\n\n${lines}\n\n— Shared from Fello`
    navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
  }

  return (
    <div className="dm-page dm-animate">
      <PageHeader title="My Memories" onBack={onBack} />

      {memories.length === 0 ? (
        <div className="dm-card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>💛</div>
          <p>No memories saved yet. Visit "Memory Journal" to record your first memory.</p>
        </div>
      ) : (
        <>
          <button className="dm-btn dm-btn-amber-lt" onClick={shareMemories} style={{ marginBottom: 4 }}>
            📤 {copied ? 'Copied to clipboard!' : 'Share recent memories with family'}
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {memories.map(m => {
              const [original, story] = m.content.split('\n✨STORY✨\n')
              return (
                <div key={m.id} className="dm-memory-card">
                  {m.prompt && <div className="dm-memory-prompt">{m.prompt}</div>}
                  <div className="dm-memory-content">{original}</div>
                  {story && (
                    <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--dm-amber-lt)', borderRadius: 12, border: '1px solid var(--dm-amber)' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--dm-amber)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>✨ Illustrated Story</div>
                      <div style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--dm-text)' }}>{story}</div>
                    </div>
                  )}
                  <div className="dm-memory-date">{new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── SCREEN: Emergency / SOS ──────────────────────────────────────────────────
function SOSScreen({ onBack }) {
  const number = localStorage.getItem('dm_emergency_number') || ''

  useEffect(() => {
    sound.alert()
    const t = setInterval(() => sound.alert(), 2200)
    // Immediately trigger the call
    if (number) window.location.href = `tel:${number}`
    return () => clearInterval(t)
  }, [])

  return (
    <div className="dm-page dm-animate">
      <div className="dm-sos-card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🆘</div>
        <h1 style={{ color: 'var(--dm-red)', marginBottom: 8 }}>Calling for Help</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: 0 }}>
          {number
            ? <>Calling <strong>{number}</strong> now...</>
            : 'No emergency number saved yet. Go to Settings to add one.'}
        </p>
      </div>

      {number && (
        <a href={`tel:${number}`} className="dm-btn dm-btn-red" style={{ textDecoration: 'none', justifyContent: 'center', fontSize: '1.3rem' }}>
          📞 Call Again
        </a>
      )}

      <div className="dm-card">
        <h3 style={{ marginBottom: 12 }}>While you wait:</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {['Sit down in a comfortable chair.', 'Take slow, deep breaths.', 'Stay where you are — do not leave.', 'Help is coming to you.'].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--dm-green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--dm-text)', paddingTop: 2 }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="dm-btn dm-btn-outline" onClick={() => { sound.click(); onBack() }}>
        I am okay — cancel
      </button>
    </div>
  )
}

// ─── SCREEN: Settings ────────────────────────────────────────────────────────
function SettingsScreen({ onBack }) {
  const [number, setNumber] = useState(localStorage.getItem('dm_emergency_number') || '')
  const [name, setName]     = useState(localStorage.getItem('dm_user_name') || '')
  const [saved, setSaved]   = useState(false)

  const save = () => {
    localStorage.setItem('dm_emergency_number', number.trim())
    localStorage.setItem('dm_user_name', name.trim())
    sound.success()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="dm-page dm-animate">
      <PageHeader title="Settings" onBack={onBack} />

      {/* Name */}
      <div className="dm-card">
        <h3 style={{ marginBottom: 6 }}>👤 Your Name</h3>
        <p style={{ marginBottom: 12 }}>We'll use this to greet you on the home screen.</p>
        <label className="dm-label" style={{ display: 'block', marginBottom: 6 }}>First name</label>
        <Input className="dm-input-override" placeholder="e.g. Margaret" value={name}
          onChange={e => { setName(e.target.value); setSaved(false) }} />
      </div>

      {/* Emergency contact */}
      <div className="dm-card" style={{ border: '2px solid var(--dm-red)' }}>
        <h3 style={{ marginBottom: 6 }}>🆘 Emergency Contact</h3>
        <p style={{ marginBottom: 12 }}>When SOS is pressed, this number will be called immediately.</p>
        <label className="dm-label" style={{ display: 'block', marginBottom: 6 }}>Phone number</label>
        <Input className="mb-4 dm-input-override" type="tel" placeholder="e.g. +447911123456" value={number}
          onChange={e => { setNumber(e.target.value); setSaved(false) }} />
        {number && (
          <a href={`tel:${number}`} className="dm-btn dm-btn-outline" style={{ marginBottom: 12, textDecoration: 'none', justifyContent: 'center' }}>
            📞 Test Call
          </a>
        )}
      </div>

      {/* Family sharing */}
      <div className="dm-card" style={{ border: '2px solid var(--dm-border)' }}>
        <h3 style={{ marginBottom: 6 }}>👨‍👩‍👧 Family Sharing</h3>
        <p style={{ marginBottom: 16 }}>Share your memories with family members. Use the "Share recent memories" button in "My Memories" to copy your latest entries — then send them by WhatsApp or text message.</p>
        <div style={{ background: 'var(--dm-amber-lt)', border: '1px solid var(--dm-amber)', borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
          <div className="dm-label" style={{ marginBottom: 4 }}>How to share</div>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>Go to "My Memories" → tap "Share recent memories" → paste into a message to family</p>
        </div>
      </div>

      <button className="dm-btn dm-btn-green" onClick={save}>
        {saved ? '✓ All Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}

// ─── Bottom Navigation ────────────────────────────────────────────────────────
function BottomNav({ current, onGo, onDashboard, onSOS }) {
  const tabs = [
    { key: 'home',     icon: <HomeIcon />,  label: 'Home'    },
    { key: 'schedule', icon: <CalIcon />,   label: 'My Plan' },
    { key: 'journal',  icon: <BookIcon />,  label: 'Journal' },
    { key: 'music',    icon: <MusicIcon />, label: 'Music'   },
  ]
  return (
    <div className="dm-nav">
      {tabs.map(t => (
        <button key={t.key} className={`dm-nav-btn ${current === t.key ? 'active' : ''}`} onClick={() => { sound.click(); onGo(t.key) }}>
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}

      <button className="dm-nav-btn sos" onClick={onSOS}>
        <AlertIcon />
        <span>SOS</span>
      </button>
    </div>
  )
}

const DEMENTIA_AGENT_PROMPT = `You are the Dementia Care Agent for "Fello" — an autonomous AI assistant for people with dementia and their carers.

═══ YOUR PERSONALITY ═══
- Extremely gentle, warm, and reassuring. Simple words only.
- You always orient the person: remind them of the day, time, and place.
- You treat every interaction as if it's the first. No frustration, ever.

═══ YOUR AUTONOMOUS BEHAVIORS ═══
1. ORIENTATION: On first tick, use showNotification to gently remind the user what day and time it is.
2. MEMORY PROMPTS: Use showNotification every few ticks with a gentle memory prompt like "What's your favourite meal?" or "Tell me about a happy place."
3. ROUTINE REMINDER: If idleMinutes > 10, use showNotification to gently remind them to check their daily plan.
4. FAMILIAR FACES: Occasionally use showNotification to remind them about their saved familiar faces.
5. CELEBRATION: When the user completes a routine task, use showNotification (celebration) to praise them.
6. MEMORY: Use storeMemory to remember the user's name (dementia_user_name) and mood patterns.

═══ RULES ═══
- Keep messages under 10 words — clarity is everything
- Use emoji liberally — visual anchors help memory
- Never be confusing or use complex language
- On autonomous ticks, only act if genuinely helpful
- If idleMinutes < 3, skip the tick
`

export default function DementiaMode() {
  const navigate = useNavigate()
  const { activeCategory, switchCategory, agentState: demAgentState, updateAgentState: updateDemAgentState } = useAgent()
  const [screen, setScreen] = useState('home')

  // Autonomous Agent Loop
  const { triggerAgent: triggerDemAgent } = useAgentLoop({
    systemPrompt: DEMENTIA_AGENT_PROMPT,
    onAction: () => {},
    loopIntervalMs: 35000,
  })

  useEffect(() => {
    if (activeCategory !== 'dementia') {
      switchCategory('dementia');
    }
  }, [activeCategory, switchCategory]);

  const go = (s) => setScreen(s)
  const back = () => setScreen('home')

  return (
    <div className="dm">
      {screen === 'home'     && <HomeScreen     onGo={go} />}
      {screen === 'schedule' && <ScheduleScreen onBack={back} />}
      {screen === 'journal'  && <JournalScreen  onBack={back} />}
      {screen === 'faces'    && <FacesScreen    onBack={back} />}
      {screen === 'music'    && <MusicScreen    onBack={back} />}
      {screen === 'games'    && <GamesScreen    onBack={back} />}
      {screen === 'memories' && <MemoriesScreen onBack={back} />}
      {screen === 'settings' && <SettingsScreen onBack={back} />}
      {screen === 'sos'      && <SOSScreen      onBack={back} />}

      <BottomNav
        current={screen}
        onGo={go}
        onDashboard={() => {}}
        onSOS={() => { sound.alert(); go('sos') }}
      />
    </div>
  )
}
