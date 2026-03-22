import { useState } from 'react'
import { PartyPopper } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'

export default function Waitlist() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section id="waitlist" style={{ padding: '100px 24px', background: '#faf9f7', textAlign: 'center' }}>
      <div>
        <h2 style={{ fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 18, color: '#1a1523' }}>
          Ready to work with your brain,<br />
          <span style={{ color: '#7c6fe0' }}>
            not against it?
          </span>
        </h2>
        <p style={{ fontSize: 17, color: '#7a6f8a', maxWidth: 460, margin: '0 auto 48px', lineHeight: 1.75 }}>
          Join the waitlist for early access. Free to start. No credit card required.
        </p>

        {submitted ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: '#f0faf5',
            border: '1px solid #a7f3d0', borderRadius: 16,
            padding: '16px 32px', fontSize: 16, fontWeight: 600, color: '#065f46',
          }}>
            <PartyPopper size={20} /> You're on the list! We'll be in touch soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
            maxWidth: 500, margin: '0 auto',
          }}>
            <Input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 min-w-[220px] text-[15px] focus-visible:border-[#7c6fe0] focus-visible:ring-[#7c6fe0]/30"
            />
            <button type="submit" style={{
              background: '#7c6fe0',
              color: 'white', padding: '13px 28px', borderRadius: 10,
              fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
              boxShadow: '0 2px 0 #5b51c4', whiteSpace: 'nowrap',
            }}>
              Get Early Access
            </button>
          </form>
        )}

        <p style={{ marginTop: 20, fontSize: 13, color: '#a89fba' }}>
          Already have an account?{' '}
          <Link to="/signin" style={{ color: '#7c6fe0', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </section>
  )
}
