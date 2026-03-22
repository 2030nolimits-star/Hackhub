import { Link } from 'react-router-dom'

const SERIF = "'Playfair Display', Georgia, serif"

const modes = [
  { icon: '/adhd.png', bg: '#ffedd5', border: '#fdba74', color: '#7c2d12', title: 'ADHD', tags: ['Pomodoro', 'Focus streaks', 'Smart Tasks'], live: true },
  { icon: '/dyspraxia.png', bg: '#fce7f0', border: '#f9a8d4', color: '#9d174d', title: 'Dyspraxia', tags: ['AI micro-steps', 'Voice input', 'Movement breaks'], live: true },
  { icon: '/dementia.png', bg: '#f3e8ff', border: '#d8b4fe', color: '#6b21a8', title: 'Dementia', tags: ['Memory journal', 'AI stories', 'Familiar faces'], live: true },
  { icon: '/depression.png', bg: '#dcfce7', border: '#86efac', color: '#065f46', title: 'Depression', tags: ['Energy modes', 'Tiny wins', 'Mood tracker'], live: true },
  { icon: '/anxiety.png', bg: '#fef9c3', border: '#fde047', color: '#78350f', title: 'Anxiety', tags: ['Breathing', 'Grounding', 'Crisis support'], live: true },
  { icon: '/dyslexia.png', bg: '#dbeafe', border: '#93c5fd', color: '#1e3a8a', title: 'Dyslexia', tags: ['OpenDyslexic', 'Text-to-speech', 'Line reader'], live: true },
]

export default function Modes() {
  return (
    <section id="modes" style={{ background: '#ffffff', padding: '104px 40px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 68 }}>
          <span style={{ display: 'inline-block', background: '#f0ece2', color: '#7a7260', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 9999, marginBottom: 22 }}>
            6 Condition Modes
          </span>
          <h2 style={{ fontSize: 'clamp(34px, 4.5vw, 56px)', lineHeight: 1.04, marginBottom: 16 }}>
            <span style={{ display: 'inline', fontWeight: 900, color: '#1a1710', letterSpacing: '-2px' }}>One app. </span>
            <span style={{ display: 'inline', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, color: '#7B6BC4', letterSpacing: '-1px' }}>Every condition.</span>
          </h2>
          <p style={{ fontSize: 17, color: '#7a7260', maxWidth: 500, margin: '0 auto', lineHeight: 1.75 }}>
            Fello adapts completely — interface, pacing, AI prompts, and support tools designed from evidence-based care guidelines.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {modes.map(({ icon, bg, border, color, title, tags, live }) => (
            <div key={title} style={{
              background: bg, borderRadius: 24, padding: '28px 26px 24px',
              border: `1.5px solid ${border}40`, position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.09)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {live ? (
                <div style={{ position: 'absolute', top: 18, right: 18, background: '#1a1710', color: '#f0ece2', fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 999, letterSpacing: '0.06em' }}>LIVE</div>
              ) : (
                <div style={{ position: 'absolute', top: 18, right: 18, background: 'rgba(255,255,255,0.7)', color: '#b0a890', fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 999, border: '1px solid #e6dfc8' }}>COMING SOON</div>
              )}
              <img src={icon} alt={title} style={{ width: 36, height: 36, objectFit: 'contain', marginBottom: 18 }} />
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1710', marginBottom: 10, letterSpacing: '-0.3px' }}>{title}</h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                {tags.map(t => (
                  <span key={t} style={{ fontSize: 11, fontWeight: 600, color, background: 'rgba(255,255,255,0.7)', border: `1px solid ${border}80`, borderRadius: 999, padding: '3px 10px' }}>{t}</span>
                ))}
              </div>
              {live && (
                <Link to={`/${title.toLowerCase()}`} style={{ display: 'block', padding: '10px 0', borderRadius: 12, background: 'rgba(255,255,255,0.6)', border: `1.5px solid ${border}60`, textAlign: 'center', fontSize: 13, fontWeight: 700, color, textDecoration: 'none' }}>
                  Try it free →
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
