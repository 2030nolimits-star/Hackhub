import { Smile, Frown, Meh } from 'lucide-react'

const SERIF = "'Playfair Display', Georgia, serif"

const steps = [
  {
    num: '01', tag: '2 minutes',
    title: 'Set up your profile',
    desc: 'Answer 4 quick questions about your condition, energy patterns, and goals. Fello builds your personalised dashboard instantly — no long forms, no overwhelm.',
    preview: (
      <div style={{ background: '#ffffff', borderRadius: 16, padding: '18px', border: '1px solid #e6dfc8' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#b0a890', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Onboarding</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {[
            ['Which condition fits you?', true],
            ['What are your biggest challenges?', false],
            ['How do you prefer to work?', false],
          ].map(([q, done]) => (
            <div key={q} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: done ? '#7B6BC4' : '#f0ece2',
                border: `1.5px solid ${done ? '#7B6BC4' : '#d8d0be'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {done && <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: 12, color: done ? '#1a1710' : '#b0a890', fontWeight: done ? 600 : 400 }}>{q}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: '02', tag: 'Voice · Text · Photo',
    title: 'Add your first task',
    desc: 'Type it, say it aloud, or snap a photo. Fello breaks any goal into micro-steps — each one small enough that starting feels easy, even on your hardest days.',
    preview: (
      <div style={{ background: '#ffffff', borderRadius: 16, padding: '18px', border: '1px solid #e6dfc8' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#b0a890', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Task Breakdown</div>
        {[
          ['Write essay intro', 'Done', 'rgba(142,208,192,0.3)', '#2d8a70'],
          ['Research sources', 'Active', 'rgba(196,181,244,0.3)', '#7B6BC4'],
          ['Add citations', 'Next', '#f0ece2', '#9e94c4'],
        ].map(([t, s, bg, c]) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0ece2' }}>
            <span style={{ fontSize: 12, color: '#1a1710' }}>{t}</span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 9px', borderRadius: 4, background: bg, color: c }}>{s}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    num: '03', tag: 'Always available',
    title: 'Stay supported every day',
    desc: 'Breathing exercises, mood tracking, crisis support, and a therapy chatbot are built into your daily flow — not in a separate app you have to remember to open.',
    preview: (
      <div style={{ background: '#ffffff', borderRadius: 16, padding: '18px', border: '1px solid #e6dfc8' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#b0a890', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Wellbeing check-in</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {[[Smile, 'Good', true], [Meh, 'Calm', false], [Frown, 'Stressed', false]].map(([MoodIcon, l, sel]) => (
            <div key={l} style={{ flex: 1, padding: '9px 6px', borderRadius: 12, background: sel ? 'rgba(196,181,244,0.2)' : '#f0ece2', border: `1.5px solid ${sel ? '#C4B5F4' : '#e6dfc8'}`, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}><MoodIcon size={18} color={sel ? '#7B6BC4' : '#b0a890'} /></div>
              <div style={{ fontSize: 10, fontWeight: 600, color: sel ? '#7B6BC4' : '#b0a890' }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#b0a890', textAlign: 'center' }}>How are you feeling right now?</div>
      </div>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section id="how" style={{ background: '#f0ece2', padding: '104px 40px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 80, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <span style={{ display: 'inline-block', background: '#1a1710', color: '#f0ece2', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 9999, marginBottom: 22 }}>
              How it works
            </span>
            <h2 style={{ fontSize: 'clamp(36px, 4.5vw, 58px)', lineHeight: 1.04 }}>
              <span style={{ display: 'block', fontWeight: 900, color: '#1a1710', letterSpacing: '-2.5px' }}>Up and running</span>
              <span style={{ display: 'block', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, color: '#7B6BC4', letterSpacing: '-1px' }}>in minutes.</span>
            </h2>
          </div>
          <p style={{ fontSize: 16, color: '#7a7260', maxWidth: 340, lineHeight: 1.75, marginBottom: 4 }}>
            No complicated setup. No jargon. A quick start that meets you exactly where you are.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {steps.map(({ num, title, desc, tag, preview }, idx) => (
            <div key={num} style={{
              display: 'grid', gridTemplateColumns: '120px 1fr 1.1fr',
              gap: 40, alignItems: 'center',
              padding: '56px 0',
              borderBottom: idx < steps.length - 1 ? '1px solid #d8d0be' : 'none',
            }}>
              {/* Large outline number */}
              <div style={{
                fontSize: 'clamp(80px, 9vw, 118px)',
                fontWeight: 900, lineHeight: 1, letterSpacing: '-4px',
                color: 'transparent',
                WebkitTextStroke: '2.5px',
                WebkitTextStrokeColor: '#C4B5F4',
                userSelect: 'none',
              }}>{num}</div>

              {/* Text */}
              <div>
                <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, color: '#7B6BC4', background: 'rgba(196,181,244,0.18)', padding: '4px 12px', borderRadius: 9999, marginBottom: 16 }}>{tag}</span>
                <h3 style={{ fontSize: 'clamp(20px, 2.2vw, 26px)', fontWeight: 800, color: '#1a1710', marginBottom: 14, letterSpacing: '-0.5px', lineHeight: 1.2 }}>{title}</h3>
                <p style={{ fontSize: 15, color: '#7a7260', lineHeight: 1.8, maxWidth: 360 }}>{desc}</p>
              </div>

              {/* Preview */}
              <div>{preview}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
