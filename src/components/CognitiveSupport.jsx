import { User, CalendarDays, BookOpen, Puzzle, Music, Image, Compass, AlertTriangle, HeartHandshake } from 'lucide-react'

const faces = [
  { name: 'Sarah', rel: 'Daughter', color: '#C4B5F4', bg: 'rgba(196,181,244,0.25)' },
  { name: 'James', rel: 'Carer',    color: '#7AAAE0', bg: 'rgba(168,216,239,0.25)' },
  { name: 'Mum',   rel: 'Family',   color: '#8EEDC0', bg: 'rgba(142,237,192,0.25)' },
]

const schedule = [
  { time: '08:00', task: 'Morning medication', done: true,  color: '#8EEDC0' },
  { time: '09:30', task: 'Breakfast walk',     done: true,  color: '#8EEDC0' },
  { time: '11:00', task: 'Memory journal',     done: false, color: '#C4B5F4' },
  { time: '13:00', task: 'Video call — Sarah', done: false, color: '#F9DEAE' },
]

const cards = [
  {
    Icon: User,
    title: 'Familiar Faces',
    desc: 'Store photos and relationships for family, carers, and friends. Fello shows who they are and how they help — any time you need a reminder.',
    bg: 'rgba(196,181,244,0.15)', border: '#C4B5F4',
    preview: (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        {faces.map(f => (
          <div key={f.name} style={{ background: f.bg, border: `1px solid ${f.color}`, borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>{f.name[0]}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#2e3d4f' }}>{f.name}</div>
              <div style={{ fontSize: 10, color: '#728090' }}>{f.rel}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    Icon: CalendarDays,
    title: 'Visual Schedule',
    desc: 'A clear daily routine with large text and one-tap task completion. Helps maintain structure and independence throughout the day.',
    bg: 'rgba(142,237,192,0.15)', border: '#8EEDC0',
    preview: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
        {schedule.map(s => (
          <div key={s.time} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 10, background: s.done ? 'rgba(142,237,192,0.2)' : '#fff', border: `1px solid ${s.done ? '#8EEDC0' : '#e8e2f5'}` }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: s.done ? '#8EEDC0' : '#f0ecfc', border: `2px solid ${s.done ? '#8EEDC0' : '#e8e2f5'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>{s.done ? '✓' : ''}</div>
            <span style={{ fontSize: 10, color: '#728090', fontWeight: 600, flexShrink: 0 }}>{s.time}</span>
            <span style={{ fontSize: 11, color: s.done ? '#728090' : '#2e3d4f', textDecoration: s.done ? 'line-through' : 'none', flex: 1 }}>{s.task}</span>
          </div>
        ))}
      </div>
    ),
  },
]

const modules = [
  { Icon: BookOpen,      bg: 'rgba(249,222,174,0.3)', title: 'Memory Journal',    desc: 'AI-generated daily prompts with voice dictation. Capture memories easily — no typing required.' },
  { Icon: Puzzle,        bg: 'rgba(216,237,122,0.3)', title: 'Brain Games',       desc: 'Memory matching and cognitive exercises designed to gently stimulate and engage.' },
  { Icon: Music,         bg: 'rgba(232,154,232,0.3)', title: 'Era Music & Sounds',desc: 'Personalised music from your era and calming nature sounds for mood and memory.' },
  { Icon: Image,         bg: 'rgba(168,216,239,0.3)', title: 'Memory Box',        desc: 'A gallery of your saved memories, displayed with dates and gentle animations.' },
  { Icon: Compass,       bg: 'rgba(196,181,244,0.3)', title: 'Daily Orientation', desc: "Real-time clock, today's date, and weather — always visible to anchor you to the present." },
  { Icon: AlertTriangle, bg: 'rgba(236,144,128,0.22)',title: 'Emergency Alert',   desc: 'One-tap alert screen with medical ID and immediate care circle notification.' },
]

export default function CognitiveSupport() {
  return (
    <section style={{ background: '#f9f8fd', padding: '104px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(196,181,244,0.2)',
            color: '#7B6BC4',
            fontSize: 13, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '6px 16px', borderRadius: 9999, marginBottom: 16,
          }}>Memory & Cognitive Support</span>
          <h2 style={{ fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 900, color: '#0f1923', marginBottom: 12, letterSpacing: '-1.5px' }}>
            Designed for every mind,<br/>at every stage
          </h2>
          <p style={{ color: '#728090', fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Fello's memory and cognitive tools support people with dementia, memory challenges, and age-related changes — and the carers who love them.
          </p>
        </div>

        {/* two bento cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {cards.map(card => (
            <div key={card.title} style={{
              background: card.bg,
              border: `1.5px solid ${card.border}`,
              borderRadius: 24,
              padding: '28px 28px 24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <card.Icon size={22} />
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#2e3d4f' }}>{card.title}</h3>
              </div>
              <p style={{ fontSize: 13, color: '#728090', lineHeight: 1.7 }}>{card.desc}</p>
              {card.preview}
            </div>
          ))}
        </div>

        {/* 6-module grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {modules.map(m => (
            <div key={m.title} style={{
              background: '#fff',
              borderRadius: 18,
              padding: '20px 20px',
              border: '1.5px solid #e8e2f5',
              display: 'flex', gap: 14, alignItems: 'flex-start',
              transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#C4B5F4'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(196,181,244,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e2f5'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 11, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><m.Icon size={20} /></div>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#2e3d4f', marginBottom: 4 }}>{m.title}</h4>
                <p style={{ fontSize: 12, color: '#728090', lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* caregiver callout */}
        <div style={{
          marginTop: 24,
          background: 'linear-gradient(135deg, rgba(196,181,244,0.15), rgba(142,237,192,0.1))',
          border: '1.5px solid #e8e2f5',
          borderRadius: 20,
          padding: '28px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#2e3d4f', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HeartHandshake size={18} /> Built for carers too
            </div>
            <p style={{ fontSize: 14, color: '#728090', maxWidth: 540, lineHeight: 1.7 }}>
              Family members and carers get their own view — track routines, receive emergency alerts, share journals, and stay connected from anywhere.
            </p>
          </div>
          <a href="/signup" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #C4B5F4, #7AAAE0)',
            color: '#fff', padding: '12px 26px',
            borderRadius: 9999, fontWeight: 700, fontSize: 14,
            textDecoration: 'none', flexShrink: 0,
            boxShadow: '0 4px 16px rgba(196,181,244,0.3)',
          }}>Set up a carer profile →</a>
        </div>

      </div>
    </section>
  )
}
