import { Link } from 'react-router-dom'
import { Users, Star, LayoutGrid, Sparkles } from 'lucide-react'

const SERIF = "'Playfair Display', Georgia, serif"

export default function CTA() {
  return (
    <section style={{ background: '#1a1710', padding: '104px 40px', position: 'relative', overflow: 'hidden' }}>
      {/* Soft purple glow */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 480, height: 480, borderRadius: '50%', background: 'rgba(196,181,244,0.07)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -60, width: 360, height: 360, borderRadius: '50%', background: 'rgba(134,239,172,0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center', position: 'relative', zIndex: 1 }}>

        {/* Left */}
        <div>
          <span style={{
            display: 'inline-block',
            background: 'rgba(240,236,226,0.1)',
            color: '#f0ece2', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '6px 16px', borderRadius: 9999,
            border: '1px solid rgba(240,236,226,0.15)',
            marginBottom: 28,
          }}>Early Access</span>

          <h2 style={{ fontSize: 'clamp(36px, 4.5vw, 58px)', lineHeight: 1.06, marginBottom: 20 }}>
            <span style={{ display: 'block', fontWeight: 900, color: '#f0ece2', letterSpacing: '-2.5px' }}>Ready to work</span>
            <span style={{ display: 'block', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, color: '#C4B5F4', letterSpacing: '-1px' }}>with your brain?</span>
          </h2>

          <p style={{ color: '#9e9484', fontSize: 16, lineHeight: 1.78, marginBottom: 40, maxWidth: 400 }}>
            Join thousands of neurodivergent people who've found a productivity tool that finally gets them.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/signup" style={{
              display: 'inline-block',
              background: '#f0ece2', color: '#1a1710',
              padding: '14px 30px', borderRadius: 10,
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >Get started free</Link>
            <a href="#how" style={{
              display: 'inline-block',
              background: 'rgba(240,236,226,0.07)', color: '#f0ece2',
              padding: '14px 30px', borderRadius: 10,
              fontWeight: 600, fontSize: 14, textDecoration: 'none',
              border: '1.5px solid rgba(240,236,226,0.15)',
            }}>See how it works</a>
          </div>
        </div>

        {/* Right — stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { val: '10k+', label: 'Early sign-ups', Icon: Users,      border: 'rgba(196,181,244,0.2)' },
            { val: '4.9★', label: 'Beta rating',    Icon: Star,       border: 'rgba(253,224,71,0.2)' },
            { val: '6',    label: 'Condition modes', Icon: LayoutGrid, border: 'rgba(134,239,172,0.2)' },
            { val: 'Free', label: 'To get started',  Icon: Sparkles,   border: 'rgba(249,168,212,0.2)' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'rgba(240,236,226,0.04)',
              border: `1.5px solid ${stat.border}`,
              borderRadius: 20, padding: '28px 24px',
            }}>
              <div style={{ marginBottom: 12, color: '#f0ece2' }}><stat.Icon size={22} /></div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#f0ece2', letterSpacing: '-1px', marginBottom: 4 }}>{stat.val}</div>
              <div style={{ fontSize: 13, color: '#7a7260' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
