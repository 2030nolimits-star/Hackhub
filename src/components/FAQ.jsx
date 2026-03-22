import { useState } from 'react'

const SERIF = "'Playfair Display', Georgia, serif"

const faqs = [
  {
    q: "Who is Fello designed for?",
    a: "Fello is built for people with ADHD, dyslexia, dyspraxia, dementia, anxiety, depression, autism, and other forms of neurodivergence. Each condition has its own dedicated mode — designed from evidence-based care guidelines, not generic productivity advice.",
  },
  {
    q: "How does Fello adapt to my needs?",
    a: "After a short onboarding questionnaire, Fello personalises your dashboard, recommended features, and interface style based on your challenges and preferences. It continues to adapt as it learns your patterns.",
  },
  {
    q: "What accessibility features does Fello include?",
    a: "Fello supports adjustable text sizes (S/M/L/XL), high-contrast and dark modes, screen-reader compatibility, voice control, and audio-only interaction modes — all configurable from day one.",
  },
  {
    q: "Is my data private and secure?",
    a: "Absolutely. You choose your consent level: basic (recommendations only), enhanced (pattern learning), or full (anonymous contribution). You can export or delete your data at any time.",
  },
  {
    q: "Can I switch modes throughout the day?",
    a: "Yes — that's the point. All 6 condition modes (Dyspraxia, Dementia, Depression/Fatigue, Anxiety, ADHD, Dyslexia) are accessible from the dashboard at any time. Switch based on how you're feeling. No friction, no judgment.",
  },
  {
    q: "What does the Dementia mode include?",
    a: "The Dementia mode features a reality orientation clock, daily memory journal with AI-illustrated stories, familiar faces gallery with photo upload, music therapy, brain activity games, SOS emergency calling, and family sharing of memories.",
  },
  {
    q: "How does the Anxiety mode help?",
    a: "Anxiety mode guides you through 4-7-8 breathing exercises, the 5-4-3-2-1 grounding technique, AI-generated 2-minute starter tasks to break paralysis, a gratitude journal, and direct links to crisis support lines.",
  },
  {
    q: "Is there a free plan?",
    a: "Fello launches with a free tier that includes core features. Premium unlocks advanced analytics, body-doubling sessions, and the full wellbeing suite. Early access users get extended free trials.",
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section id="faq" style={{ background: '#f0ece2', padding: '104px 40px' }}>
      <div style={{ maxWidth: 740, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{
            display: 'inline-block', background: '#1a1710',
            color: '#f0ece2', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '6px 16px', borderRadius: 9999, marginBottom: 22,
          }}>FAQ</span>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.04, marginBottom: 14 }}>
            <span style={{ fontWeight: 900, color: '#1a1710', letterSpacing: '-2px' }}>Questions &amp; </span>
            <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, color: '#7B6BC4', letterSpacing: '-1px' }}>answers.</span>
          </h2>
          <p style={{ color: '#7a7260', fontSize: 17, lineHeight: 1.75 }}>
            Everything you need to know before you start.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((item, i) => (
            <div key={i} style={{
              background: open === i ? '#ffffff' : '#e8e3d6',
              border: `1.5px solid ${open === i ? '#C4B5F4' : 'transparent'}`,
              borderRadius: 18,
              overflow: 'hidden',
              transition: 'background 0.2s, border-color 0.2s',
            }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '20px 24px',
                  background: 'none',
                  border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1710', lineHeight: 1.4 }}>
                  {item.q}
                </span>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: open === i ? '#1a1710' : 'rgba(26,23,16,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: 16,
                  color: open === i ? '#f0ece2' : '#1a1710',
                  fontWeight: 700, transition: 'all 0.2s',
                }}>
                  {open === i ? '−' : '+'}
                </span>
              </button>
              {open === i && (
                <div style={{ padding: '0 24px 22px', color: '#7a7260', fontSize: 14, lineHeight: 1.8 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
