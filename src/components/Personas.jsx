const SERIF = "'Playfair Display', Georgia, serif"

const personas = [
  { name: 'Sarah', role: 'Student · ADHD', quote: 'Fello broke everything down into tiny steps. I finally submitted my dissertation without a single panic attack.', tags: ['Micro-steps', 'Breathing'], dot: '#C4B5F4', bg: '#f3e8ff' },
  { name: 'Marcus', role: 'Freelancer · Dyslexia', quote: 'Voice capture and the audio mode changed everything. I can finally keep track of client work without losing my mind.', tags: ['Audio Mode', 'Focus Timer'], dot: '#93c5fd', bg: '#dbeafe' },
  { name: 'Priya', role: 'Designer · Dyspraxia', quote: 'The low-energy mode on tough days is a lifesaver. It suggests gentle tasks and never makes me feel guilty for resting.', tags: ['Low Energy Mode', 'Rest Reminders'], dot: '#86efac', bg: '#dcfce7' },
  { name: 'Tom', role: 'Engineer · ADHD + Anxiety', quote: 'Body-doubling sessions and focus analytics helped me understand my own patterns for the first time.', tags: ['Body Doubling', 'Analytics'], dot: '#fde047', bg: '#fef9c3' },
  { name: 'Aisha', role: 'Teacher · Sensory Processing', quote: 'The calm interface and gentle notifications mean I can check my tasks without triggering a shutdown.', tags: ['Calm UI', 'Sensory Mode'], dot: '#f9a8d4', bg: '#fce7f0' },
  { name: 'Jamie', role: 'Writer · Executive Dysfunction', quote: "The micro-step generator turns 'write a chapter' into something I can actually start. Game changer.", tags: ['Micro-steps', 'Pomodoro'], dot: '#fdba74', bg: '#ffedd5' },
]

export default function Personas() {
  return (
    <section style={{ background: '#ffffff', padding: '104px 40px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 68 }}>
          <span style={{ display: 'inline-block', background: '#f0ece2', color: '#7a7260', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 9999, marginBottom: 22 }}>Real Stories</span>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.04, marginBottom: 14 }}>
            <span style={{ fontWeight: 900, color: '#1a1710', letterSpacing: '-2px' }}>1800+ </span>
            <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, color: '#7B6BC4', letterSpacing: '-1px' }}>Reviews</span>
          </h2>
          <p style={{ color: '#7a7260', fontSize: 17, maxWidth: 480, margin: '0 auto', lineHeight: 1.75 }}>
            Fello adapts to how your brain works — not the other way around.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {personas.map(p => (
            <div key={p.name} style={{
              background: p.bg,
              border: '1.5px solid rgba(0,0,0,0.06)',
              borderRadius: 22, padding: '28px 24px',
              display: 'flex', flexDirection: 'column', gap: 16,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {/* Stars */}
              <div style={{ display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ fontSize: 13, color: '#f59e0b' }}>★</span>
                ))}
              </div>

              <p style={{ color: '#1a1710', fontSize: 14, lineHeight: 1.75, fontStyle: 'italic', fontFamily: SERIF, margin: 0 }}>
                "{p.quote}"
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: p.dot, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#1a1710', flexShrink: 0 }}>
                  {p.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1a1710', fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#7a7260' }}>{p.role}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {p.tags.map(tag => (
                  <span key={tag} style={{ background: 'rgba(255,255,255,0.65)', color: '#7a7260', fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 9999 }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
