import { Zap, Mic, Timer, Layers, Camera, MessageCircle, BookOpen, BarChart2, Users, Accessibility, CloudRain, AlertTriangle, Globe } from 'lucide-react'

const SERIF = "'Playfair Display', Georgia, serif"

const bento = [
  { Icon: Zap, bg: '#f3e8ff', border: '#d8b4fe', title: 'Task Breakdown Engine', desc: 'Any goal → auto-generated micro-steps with time estimates and dependencies.' },
  { Icon: Mic, bg: '#dcfce7', border: '#86efac', title: 'Voice & Photo Input', desc: 'Say a task or snap a photo. Fello converts it and builds the steps instantly.' },
  { Icon: Timer, bg: '#fef9c3', border: '#fde047', title: 'Adaptive Pomodoro', desc: 'Custom intervals, movement breaks, and weekly analytics built for your brain.' },
  { Icon: Layers, bg: '#fce7f0', border: '#f9a8d4', title: 'Media Conversion', desc: 'Notes→video, audio→notes, whiteboard→checklist. Bridge how you think and work.' },
]

const modules = [
  { Icon: Zap, bg: '#f3e8ff', title: 'Task Breakdown', desc: 'Any goal split into tiny, completable micro-steps automatically.' },
  { Icon: Mic, bg: '#dcfce7', title: 'Voice Input', desc: 'Say a task naturally. Fello parses it and builds the steps.' },
  { Icon: Camera, bg: '#fef9c3', title: 'Image to Tasks', desc: 'Photo or whiteboard → OCR → structured checklist. Instantly.' },
  { Icon: Timer, bg: '#ffedd5', title: 'Pomodoro Timer', desc: 'Customizable intervals, break types, and weekly focus analytics.' },
  { Icon: MessageCircle, bg: '#fce7f0', title: 'Therapy Chatbot', desc: 'Evidence-informed AI support with safety guardrails and crisis detection.' },
  { Icon: BookOpen, bg: '#dcfce7', title: 'Smart Journal', desc: 'Freeform or prompted. Local-first. Share entries with your therapist.' },
  { Icon: BarChart2, bg: '#fef9c3', title: 'Mood Tracker', desc: 'Daily check-ins with emotion tags correlated to focus sessions.' },
  { Icon: Users, bg: '#f3e8ff', title: 'Body Doubling', desc: 'Virtual co-working sessions so you never have to focus alone.' },
  { Icon: Accessibility, bg: '#dbeafe', title: 'Accessibility Suite', desc: 'WCAG 2.2 AA, screen reader, voice commands, haptic feedback.' },
  { Icon: CloudRain, bg: '#dbeafe', title: 'Ambient Sounds', desc: 'Rain, forest sounds, and soft piano — plays during low-energy sessions.' },
  { Icon: AlertTriangle, bg: '#fee2e2', title: 'Crisis Support', desc: 'Real-time safety pathways with escalation to human support.' },
  { Icon: Globe, bg: '#dcfce7', title: '5-4-3-2-1 Grounding', desc: 'Guided sensory grounding to bring you back to the present moment.' },
]

const check = ['Micro-steps — each one ≤ 5 minutes long', 'Voice, text, photo, or audio — any input works', 'Adaptive pacing based on your energy level', 'Progressive feature rollout — never overwhelmed']

export default function Features() {
  return (
    <>
      {/* ── BENTO ── */}
      <section id="features" style={{ background: '#f0ece2', padding: '104px 40px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {bento.map(({ Icon, bg, border, title, desc }) => (
                <div key={title} style={{
                  background: bg, borderRadius: 20, padding: '24px 22px',
                  border: `1.5px solid ${border}50`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><Icon size={20} /></div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1a1710', marginBottom: 6 }}>{title}</h4>
                  <p style={{ fontSize: 12, color: '#7a7260', lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
            <div>
              <span style={{ display: 'inline-block', background: '#1a1710', color: '#f0ece2', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 9999, marginBottom: 22 }}>Core Engine</span>
              <h2 style={{ fontSize: 'clamp(30px, 3.8vw, 50px)', lineHeight: 1.06, marginBottom: 18 }}>
                <span style={{ display: 'block', fontWeight: 900, color: '#1a1710', letterSpacing: '-2px' }}>Designed around</span>
                <span style={{ display: 'block', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, color: '#7B6BC4', letterSpacing: '-1px' }}>how you actually think.</span>
              </h2>
              <p style={{ fontSize: 15, color: '#7a7260', lineHeight: 1.82, marginBottom: 24 }}>Every feature reduces friction instead of adding it. Input the way your brain prefers. Work the way your energy allows.</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {check.map(c => (
                  <li key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1a1710', fontWeight: 500 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#065f46', fontWeight: 700 }}>✓</span>
                    {c}
                  </li>
                ))}
              </ul>
              <a href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7B6BC4', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Get early access →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODULE GRID ── */}
      <section style={{ padding: '104px 40px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ display: 'inline-block', background: '#f0ece2', color: '#7a7260', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 9999, marginBottom: 22 }}>Everything Included</span>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.06, marginBottom: 14 }}>
              <span style={{ fontWeight: 900, color: '#1a1710', letterSpacing: '-2px' }}>One system. </span>
              <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, color: '#7B6BC4', letterSpacing: '-1px' }}>Every tool.</span>
            </h2>
            <p style={{ fontSize: 17, color: '#7a7260', maxWidth: 500, margin: '0 auto', lineHeight: 1.75 }}>The Fello ecosystem covers every dimension of neurodivergent productivity and wellbeing.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {modules.map(({ Icon, bg, title, desc }) => (
              <div key={title} style={{
                background: '#faf8f4', borderRadius: 16, padding: '20px 18px',
                border: '1.5px solid #e6dfc8',
                transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C4B5F4'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e6dfc8'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 13 }}><Icon size={20} /></div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1a1710', marginBottom: 5 }}>{title}</h4>
                <p style={{ fontSize: 12, color: '#7a7260', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
