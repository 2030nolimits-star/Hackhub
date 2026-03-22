import { Lock, WifiOff, CheckCircle2, Scale } from 'lucide-react'

const items = [
  { Icon: Lock,         title: 'End-to-End Encryption', desc: 'Journals, therapy chat, and shared notes are encrypted in transit and at rest. Only you — and who you explicitly allow — can read them.' },
  { Icon: WifiOff,      title: 'Offline-First',          desc: 'Core features work without internet. Your data lives on your device first — cloud sync is optional and encrypted.' },
  { Icon: CheckCircle2, title: 'Consent Management',     desc: 'Granular controls for every data sharing decision. Revoke therapist access anytime. Full data export and deletion on request.' },
  { Icon: Scale,        title: 'GDPR & CCPA Ready',      desc: 'Compliant with EU and California privacy law. HIPAA considerations applied for health data. Legal review per region.' },
]

export default function Privacy() {
  return (
    <section id="privacy" style={{ padding: '100px 24px', background: '#f5f0ff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#7c6fe0', marginBottom: 12 }}>
          Privacy & Security
        </span>
        <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.15, marginBottom: 16, color: '#1a1523' }}>
          Your data. Your control.
        </h2>
        <p style={{ fontSize: 17, color: '#7a6f8a', maxWidth: 520, lineHeight: 1.75, marginBottom: 56 }}>
          Sensitive data — especially therapy content — never leaves your control without explicit consent.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {items.map(({ Icon, title, desc }) => (
            <div key={title} style={{
              background: 'white',
              border: '1px solid #e8e4ec', borderRadius: 16, padding: 26,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{ marginBottom: 14, color: '#7c6fe0' }}><Icon size={28} /></div>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#1a1523' }}>{title}</h4>
              <p style={{ fontSize: 13, color: '#7a6f8a', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
