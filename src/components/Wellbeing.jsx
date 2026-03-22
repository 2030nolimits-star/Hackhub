import { Wind, Sparkles, Flower2, BarChart2 } from 'lucide-react'

const SERIF = "'Playfair Display', Georgia, serif"

const wb = [
  { Icon: Wind, bg: '#dbeafe', border: '#93c5fd', title: 'Breathing Exercises', desc: 'Box breathing, 4-7-8, and resonant breathing with guided animations and audio cues.' },
  { Icon: Sparkles, bg: '#f3e8ff', border: '#d8b4fe', title: 'Guided Meditation', desc: 'Short sessions, body scans, loving-kindness. Offline packs and streak tracking.' },
  { Icon: Flower2, bg: '#fce7f0', border: '#f9a8d4', title: 'Gratitude Journal', desc: 'Daily prompts, gentle reminders, and shareable summaries with your consent.' },
  { Icon: BarChart2, bg: '#fef9c3', border: '#fde047', title: 'Mood & Energy Log', desc: 'Emotion tags, triggers, and trend insights correlated with your focus sessions.' },
]

const check = ['Breathing and meditation built into task flow', 'Mood tracking correlated with productivity data', 'Gratitude and journaling with therapist sharing', "Peer body-doubling — you're not doing this alone"]

export default function Wellbeing() {
  return (
    <section id="wellbeing" style={{ background: '#f0ece2', padding: '104px 40px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
          <div>
            <span style={{ display: 'inline-block', background: '#1a1710', color: '#f0ece2', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 9999, marginBottom: 22 }}>Wellbeing Suite</span>
            <h2 style={{ fontSize: 'clamp(30px, 3.8vw, 50px)', lineHeight: 1.06, marginBottom: 16 }}>
              <span style={{ display: 'block', fontWeight: 900, color: '#1a1710', letterSpacing: '-2px' }}>Productivity without</span>
              <span style={{ display: 'block', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, color: '#7B6BC4', letterSpacing: '-1px' }}>burning out.</span>
            </h2>
            <p style={{ fontSize: 15, color: '#7a7260', lineHeight: 1.82, marginBottom: 24 }}>Wellbeing tools live inside your workflow — not in a separate app you'll forget to open. Rest and recovery are part of the plan.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {check.map(c => (
                <li key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1a1710', fontWeight: 500 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#065f46', fontWeight: 700 }}>✓</span>
                  {c}
                </li>
              ))}
            </ul>
            <a href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7B6BC4', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Start for free →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {wb.map(({ Icon, bg, border, title, desc }) => (
              <div key={title} style={{
                background: bg, borderRadius: 20, padding: '24px 20px',
                border: `1.5px solid ${border}50`,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.07)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><Icon size={18} /></div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1a1710', marginBottom: 6 }}>{title}</h4>
                <p style={{ fontSize: 12, color: '#7a7260', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
