import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAuth } from '../context/AuthContext'

export default function SignIn() {
  const { signInWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Message passed from signup (e.g. "check your email")
  const notice = location.state?.message

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signInWithEmail(form.email, form.password)
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/dashboard', { replace: true })
  }

  async function handleGoogle() {
    setError('')
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
    // Google OAuth redirects the browser, no need to navigate manually
  }

  return (
    <div style={pageStyle}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={cardStyle}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#7c6fe0' }}>fello</span>
            </Link>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 20, marginBottom: 6, color: '#1a1523' }}>Welcome back</h1>
            <p style={{ fontSize: 14, color: '#7a6f8a' }}>Sign in to your account</p>
          </div>

          {/* Notice (e.g. from signup) */}
          {notice && (
            <div style={{ background: '#f0faf5', border: '1px solid #a7f3d0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#065f46', marginBottom: 16 }}>
              {notice}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={errorStyle}>{error}</div>
          )}

          {/* Google */}
          <button onClick={handleGoogle} style={googleBtnStyle}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f0ff'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <Divider />

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Email address</label>
              <Input type="email" required value={form.email} onChange={set('email')}
                placeholder="you@example.com"
                className="focus-visible:border-[#7c6fe0] focus-visible:ring-[#7c6fe0]/30"
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: '#7c6fe0', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <Input type={showPass ? 'text' : 'password'} required value={form.password} onChange={set('password')}
                  placeholder="••••••••"
                  className="pr-11 focus-visible:border-[#7c6fe0] focus-visible:ring-[#7c6fe0]/30"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} style={eyeBtnStyle}>
                  {showPass ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ ...primaryBtnStyle, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#7a6f8a' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#7c6fe0', textDecoration: 'none', fontWeight: 700 }}>Create one</Link>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/" style={{ fontSize: 13, color: '#a89fba', textDecoration: 'none' }}>← Back to home</Link>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: '#f0edf4' }} />
      <span style={{ fontSize: 12, color: '#a89fba', fontWeight: 500 }}>or continue with email</span>
      <div style={{ flex: 1, height: 1, background: '#f0edf4' }} />
    </div>
  )
}

// ── Shared styles ──────────────────────────────────────────────
const pageStyle = {
  minHeight: '100vh', display: 'flex', alignItems: 'center',
  justifyContent: 'center', padding: 24, background: '#faf9f7',
}

const cardStyle = {
  background: 'white',
  border: '1px solid #e8e4ec', borderRadius: 20,
  padding: '44px 40px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
}

const errorStyle = {
  background: '#fef2f2', border: '1px solid #fecaca',
  borderRadius: 10, padding: '10px 14px', fontSize: 13,
  color: '#dc2626', marginBottom: 16,
}

const googleBtnStyle = {
  width: '100%', padding: '13px 20px', borderRadius: 10,
  background: 'white', border: '1.5px solid #e8e4ec',
  color: '#1a1523', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  transition: 'background 0.2s',
}

export const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 7, color: '#7a6f8a',
}

export const inputStyle = {
  width: '100%', background: '#faf9f7',
  border: '1.5px solid #e8e4ec', borderRadius: 10,
  padding: '13px 16px', fontSize: 15, color: '#1a1523', outline: 'none',
  transition: 'border-color 0.2s',
}

export const primaryBtnStyle = {
  background: '#7c6fe0',
  color: 'white', padding: 14, borderRadius: 10,
  fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
  boxShadow: '0 2px 0 #5b51c4', transition: 'opacity 0.2s',
}

const eyeBtnStyle = {
  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#7a6f8a', fontSize: 16, padding: 0, lineHeight: 1,
}
