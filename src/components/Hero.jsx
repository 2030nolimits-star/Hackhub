import { Link } from 'react-router-dom'

const SERIF = "'Playfair Display', Georgia, serif"

const modeCards = [
  { icon: '/dyspraxia.png', title: 'Dyspraxia', tag: 'AI micro-steps', bg: '#fce7f0', dot: '#e06fa0' },
  { icon: '/dementia.png', title: 'Dementia', tag: 'Memory journal', bg: '#f3e8ff', dot: '#c084fc' },
  { icon: '/depression.png', title: 'Depression', tag: 'Energy modes', bg: '#dcfce7', dot: '#2db896' },
  { icon: '/anxiety.png', title: 'Anxiety', tag: 'Breathing + grounding', bg: '#fef9c3', dot: '#f59e0b' },
]

export default function Hero() {
  return (
    <div style={{ background: '#f0ece2' }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '88px 40px 0',
        display: 'grid', gridTemplateColumns: '1fr 1.08fr',
        gap: 52, alignItems: 'center',
      }}>

        {/* LEFT */}
        <div style={{ paddingBottom: 64 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#ffffff', border: '1px solid #d8d0be',
            borderRadius: 9999, padding: '7px 18px 7px 10px', marginBottom: 36,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7B6BC4', display: 'block', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4a4030' }}>Autonomous AI Agent Platform</span>
          </div>

          {/* Headline — mixed bold sans + italic serif */}
          <h1 style={{ marginBottom: 24 }}>
            <span style={{ display: 'block', fontFamily: 'inherit', fontSize: 'clamp(44px, 5.5vw, 70px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-3px', color: '#1a1710' }}>
              Work with
            </span>
            <span style={{ display: 'block', fontFamily: 'inherit', fontSize: 'clamp(44px, 5.5vw, 70px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-3px', color: '#1a1710' }}>
              your brain,
            </span>
            <span style={{ display: 'block', fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(44px, 5.5vw, 70px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-1.5px', color: '#7B6BC4' }}>
              not against it.
            </span>
          </h1>

          <p style={{ fontSize: 16, color: '#7a7260', lineHeight: 1.82, maxWidth: 420, marginBottom: 38 }}>
            A wellbeing platform powered by category-specific, autonomous AI Agents for ADHD, dyslexia, dyspraxia, dementia, anxiety, and depression.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
            <Link to="/signup" style={{
              background: '#1a1710', color: '#f0ece2',
              padding: '14px 28px', borderRadius: 9999,
              fontSize: 14, fontWeight: 700, textDecoration: 'none',
              transition: 'opacity .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >Get started free</Link>
            <a href="#how" style={{
              background: 'transparent', color: '#1a1710',
              padding: '14px 28px', borderRadius: 9999,
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
              border: '1.5px solid #c8bfaa', transition: 'border-color .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#7B6BC4'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#c8bfaa'}
            >See how it works</a>
          </div>

          {/* Avatar + trust */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex' }}>
              {['#C4B5F4', '#8EEDC0', '#EEED82', '#F0A8BC'].map((bg, i) => (
                <span key={i} style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #f0ece2', marginLeft: i === 0 ? 0 : -8, background: bg, display: 'block', flexShrink: 0 }} />
              ))}
            </div>
            <span style={{ fontSize: 13, color: '#7a7260' }}>
              <strong style={{ color: '#1a1710' }}>10,000+</strong> people · <strong style={{ color: '#7B6BC4' }}>★ 4.9</strong> beta rating
            </span>
          </div>
        </div>

        {/* RIGHT — mode card collage */}
        <div style={{ position: 'relative', paddingBottom: 48 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {modeCards.map((mode, i) => (
              <div key={mode.title} style={{
                background: mode.bg,
                borderRadius: 22,
                padding: '24px 22px',
                marginTop: i % 2 === 1 ? 28 : 0,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <img src={mode.icon} alt={mode.title} style={{ width: 30, height: 30, objectFit: 'contain', marginBottom: 12 }} />
                <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1710', marginBottom: 5, letterSpacing: '-0.2px' }}>{mode.title}</div>
                <div style={{ fontSize: 12, color: '#7a7260', marginBottom: 14 }}>{mode.tag}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.7)', borderRadius: 9999, padding: '3px 10px', border: `1px solid ${mode.dot}40` }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'block' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#1a1710' }}>LIVE</span>
                </div>
              </div>
            ))}
          </div>

          {/* "6+ Modes" floating badge */}
          <div style={{
            position: 'absolute', bottom: 0, right: 10,
            background: '#1a1710', color: '#f0ece2',
            borderRadius: 18, padding: '16px 22px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontSize: 10, color: '#8a8070', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Condition modes</div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>6 <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 18, color: '#C4B5F4' }}>& growing</span></div>
          </div>
        </div>

      </div>

      {/* Stats bar */}
      <div style={{ background: '#e6e0d0', borderTop: '1px solid #d8d0be', marginTop: 40 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { val: '10k+', label: 'Active users' },
            { val: '95%', label: 'Feel less overwhelmed' },
            { val: '6', label: 'Condition modes' },
            { val: 'Free', label: 'To get started' },
          ].map((s, i) => (
            <div key={s.label} style={{
              padding: '28px 20px',
              textAlign: 'center',
              borderRight: i < 3 ? '1px solid #cec6b4' : 'none',
            }}>
              <div style={{ fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: 900, color: '#1a1710', letterSpacing: '-1px', marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: '#7a7260', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
