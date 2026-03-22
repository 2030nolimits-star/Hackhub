import { Link } from 'react-router-dom'

const links = {
  Product: ['Features', 'Modes', 'Wellbeing', 'Pricing'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Support: ['Help Centre', 'Accessibility', 'Privacy', 'Terms'],
  Community: ['Discord', 'Newsletter', 'Advocates', 'Research'],
}

export default function Footer() {
  return (
    <footer style={{ background: '#1e2d3d', color: '#b0bcc8' }}>
      {/* main footer */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px 48px', display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr', gap: 40 }}>
        {/* brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #C4B5F4, #8EEDC0)',
              flexShrink: 0,
            }} />
            <span style={{ fontWeight: 800, fontSize: 20, color: '#fff' }}>fello</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.8, maxWidth: 220, marginBottom: 24 }}>
            Productivity built for brains that work differently. ADHD, dyslexia, dyspraxia — all welcome.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            {['𝕏', 'in', 'ig'].map(s => (
              <a key={s} href="#" style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(196,181,244,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#C4B5F4', fontSize: 13, fontWeight: 700,
                textDecoration: 'none',
              }}>{s}</a>
            ))}
          </div>
        </div>

        {/* link columns */}
        {Object.entries(links).map(([col, items]) => (
          <div key={col}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 13, marginBottom: 16, letterSpacing: '0.04em' }}>
              {col}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map(item => (
                <a key={item} href="#" style={{ color: '#728090', fontSize: 14, textDecoration: 'none' }}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 1100,
        margin: '0 auto',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <span style={{ fontSize: 13, color: '#4A6070' }}>
          © 2025 Fello. Made with care for neurodivergent minds.
        </span>
        <div style={{
          background: 'rgba(196,181,244,0.12)',
          border: '1px solid rgba(196,181,244,0.2)',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 12,
          color: '#C4B5F4',
          maxWidth: 480,
          lineHeight: 1.6,
        }}>
          Fello is a productivity tool, not a medical device. It does not diagnose, treat, or replace professional medical or psychological advice.
        </div>
      </div>
    </footer>
  )
}
