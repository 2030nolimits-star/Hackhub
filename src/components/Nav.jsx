import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const SERIF = "'Playfair Display', Georgia, serif"

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(240,236,226,0.97)' : 'rgba(240,236,226,0.85)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${scrolled ? '#d8d0be' : 'transparent'}`,
      transition: 'all 0.25s',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 40px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: '#1a1710', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#f0ece2' }}>f</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#1a1710', letterSpacing: '-0.5px' }}>fello</span>
        </Link>

        <ul style={{ display: 'flex', gap: 32, listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }}>
          {[['#modes', 'Modes'], ['#features', 'Features'], ['#how', 'How it works'], ['#faq', 'FAQ']].map(([href, label]) => (
            <li key={href}>
              <a href={href} style={{ textDecoration: 'none', color: '#7a7260', fontSize: 14, fontWeight: 500, transition: 'color .15s' }}
                onMouseEnter={e => e.target.style.color = '#1a1710'}
                onMouseLeave={e => e.target.style.color = '#7a7260'}
              >{label}</a>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link to="/signin" style={{ textDecoration: 'none', color: '#7a7260', fontSize: 14, fontWeight: 500, padding: '8px 14px', transition: 'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#1a1710'}
            onMouseLeave={e => e.currentTarget.style.color = '#7a7260'}
          >Log in</Link>
          <Link to="/signup" style={{ background: '#1a1710', color: '#f0ece2', padding: '9px 20px', borderRadius: 9999, fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'opacity .15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >Get started</Link>
        </div>
      </div>
    </nav>
  )
}
