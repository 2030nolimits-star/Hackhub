import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeOffIcon, CheckIcon, XIcon, Puzzle, Target, Wind, BookOpen, MessageCircle, Users, GraduationCap, Briefcase, Stethoscope, Sparkles, Smartphone, Search, Newspaper } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAuth } from '../context/AuthContext'
import { labelStyle, inputStyle, primaryBtnStyle } from './SignIn'
import { TILE_DEFS, buildTileOrder } from '../lib/tiles'
import { CONDITIONS, ALL_CONDITION_KEYS } from '../lib/conditions'

const PW_REQUIREMENTS = [
  { regex: /.{12,}/, text: 'At least 12 characters' },
  { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
  { regex: /[A-Z]/, text: 'At least 1 uppercase letter' },
  { regex: /[0-9]/, text: 'At least 1 number' },
  { regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, text: 'At least 1 special character' },
]

function getStrengthColor(score) {
  if (score === 0) return '#e8e4ec'
  if (score <= 1) return '#ef4444'
  if (score <= 2) return '#f97316'
  if (score <= 3) return '#f59e0b'
  if (score === 4) return '#eab308'
  return '#22c55e'
}

function getStrengthText(score) {
  if (score === 0) return ''
  if (score <= 2) return 'Weak password'
  if (score <= 3) return 'Medium password'
  if (score === 4) return 'Strong password'
  return 'Very strong password'
}

// 4 onboarding questions (shown after account creation)
const QUESTIONS = [
  {
    id: 'condition',
    heading: 'Which best describes you?',
    sub: 'We\'ll personalise your dashboard around your condition. You can always change this later.',
  },
  {
    id: 'goals',
    heading: 'What would you like help with?',
    sub: 'Choose the areas that matter most to you. Your dashboard will be built around these — tap in order of priority.',
  },
  {
    id: 'user_type',
    heading: 'What best describes you?',
    sub: 'This helps us tailor the experience and content for your situation.',
  },
  {
    id: 'referral',
    heading: 'Where did you hear about Fello?',
    sub: "This helps us understand which communities we're reaching.",
  },
]

const GOAL_OPTIONS = [
  { key: 'tasks',     Icon: Puzzle,        label: 'Break tasks into small steps',       sub: 'Activates Task Breakdown tile' },
  { key: 'focus',     Icon: Target,        label: 'Stay focused and beat distractions',  sub: 'Activates Focus Timer tile' },
  { key: 'wellbeing', Icon: Wind,          label: 'Manage stress and energy',            sub: 'Activates Wellbeing tile' },
  { key: 'journal',   Icon: BookOpen,      label: 'Journal and track my mood',           sub: 'Activates Journal & Mood tile' },
  { key: 'therapy',   Icon: MessageCircle, label: 'Talk through my challenges',          sub: 'Activates Therapy Support tile' },
  { key: 'community', Icon: Users,         label: 'Connect with others like me',         sub: 'Activates Community tile' },
]

const USER_TYPES = [
  { Icon: GraduationCap, label: 'Student',           sub: 'School, college, or university' },
  { Icon: Briefcase,     label: 'Professional',       sub: 'Working full or part time' },
  { Icon: Users,         label: 'Caregiver',          sub: 'Supporting a family member' },
  { Icon: Stethoscope,   label: 'Healthcare worker',  sub: 'Clinical or support role' },
  { Icon: Sparkles,      label: 'Something else',     sub: 'Prefer not to say' },
]

const REFERRAL_SOURCES = [
  { Icon: Smartphone,  label: 'Social media',        sub: 'Instagram, TikTok, X, etc.' },
  { Icon: Users,       label: 'Friend or family',    sub: 'Word of mouth' },
  { Icon: Search,      label: 'Search engine',       sub: 'Google, Bing, etc.' },
  { Icon: Stethoscope, label: 'Healthcare provider', sub: 'Doctor, therapist, or clinic' },
  { Icon: Newspaper,   label: 'Article or blog',     sub: 'Online or print media' },
  { Icon: Sparkles,    label: 'Other',               sub: '' },
]

// step 0 = account, steps 1-4 = onboarding questions
const TOTAL_Q = QUESTIONS.length

export default function SignUp() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)          // 0 = account, 1-3 = questions
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    condition: '',        // selected condition key — becomes the personalised mode
    selected_goals: [],   // ordered by tap — becomes dashboard_tiles
    user_type: '',
    referral_source: '',
  })

  const setField = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setVal = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleGoal = (key) => setForm(f => ({
    ...f,
    selected_goals: f.selected_goals.includes(key)
      ? f.selected_goals.filter(k => k !== key)
      : [...f.selected_goals, key],
  }))

  async function handleGoogle() {
    setError('')
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  async function handleFinish() {
    setError('')
    setLoading(true)
    const dashboard_tiles = buildTileOrder(form.selected_goals)
    const { error } = await signUp(form.email, form.password, {
      full_name: form.name,
      condition: form.condition,
      dashboard_tiles,
      user_type: form.user_type,
      referral_source: form.referral_source,
      onboarding_complete: true,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/signin', { state: { message: 'Check your email to confirm your account!' } })
  }

  const pwRequirements = useMemo(() =>
    PW_REQUIREMENTS.map(req => ({ met: req.regex.test(form.password), text: req.text })),
    [form.password]
  )
  const strengthScore = pwRequirements.filter(r => r.met).length

  // Progress bar — only rendered during questions (step >= 1)
  const ProgressBar = () => (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {Array.from({ length: TOTAL_Q }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: i < step
              ? '#7c6fe0'
              : i === step - 1
                ? '#7c6fe0'
                : '#e8e4ec',
            transition: 'background 0.4s',
          }} />
        ))}
      </div>
      <span style={{ fontSize: 12, color: '#7c6fe0', fontWeight: 600 }}>
        Question {step} of {TOTAL_Q}
      </span>
    </div>
  )

  return (
    <div style={pageStyle}>
      <div style={{ width: '100%', maxWidth: step === 1 || step === 2 ? 520 : 460, transition: 'max-width 0.3s' }}>
        <div style={cardStyle}>

          {/* Logo — always */}
          <div style={{ textAlign: 'center', marginBottom: step === 0 ? 28 : 24 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#7c6fe0' }}>fello</span>
            </Link>
          </div>

          {/* Progress bar only during onboarding questions */}
          {step >= 1 && <ProgressBar />}

          {error && <div style={errorStyle}>{error}</div>}

          {/* ── Step 0: Account creation (no progress) ── */}
          {step === 0 && (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: '#1a1523' }}>Create your account</h1>
              <p style={{ fontSize: 14, color: '#7a6f8a', marginBottom: 24 }}>
                Free to start. No credit card needed.
              </p>

              <button onClick={handleGoogle} style={googleBtnStyle}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f0ff'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <GoogleIcon /> Continue with Google
              </button>

              <Divider />

              <form onSubmit={e => { e.preventDefault(); setStep(1) }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Full name</label>
                  <Input type="text" required value={form.name} onChange={setField('name')}
                    placeholder="Alex Johnson"
                    className="focus-visible:border-[#7c6fe0] focus-visible:ring-[#7c6fe0]/30"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email address</label>
                  <Input type="email" required value={form.email} onChange={setField('email')}
                    placeholder="you@example.com"
                    className="focus-visible:border-[#7c6fe0] focus-visible:ring-[#7c6fe0]/30"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <Input type={showPass ? 'text' : 'password'} required value={form.password}
                      onChange={setField('password')} placeholder="Create a password"
                      className="pr-11 focus-visible:border-[#7c6fe0] focus-visible:ring-[#7c6fe0]/30"
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)} style={eyeBtnStyle}>
                      {showPass
                        ? <EyeOffIcon size={16} />
                        : <EyeIcon size={16} />
                      }
                    </button>
                  </div>
                  {/* 5-bar strength meter */}
                  <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 99,
                        background: i < strengthScore ? getStrengthColor(strengthScore) : '#e8e4ec',
                        transition: 'background 0.4s ease',
                      }} />
                    ))}
                  </div>
                  {form.password && (
                    <p style={{ fontSize: 12, fontWeight: 600, color: getStrengthColor(strengthScore), marginBottom: 8 }}>
                      {getStrengthText(strengthScore)}
                    </p>
                  )}
                  {/* Requirements checklist */}
                  {form.password && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {pwRequirements.map((req, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {req.met
                            ? <CheckIcon size={13} color="#22c55e" />
                            : <XIcon size={13} color="#a89fba" />
                          }
                          <span style={{ fontSize: 11, color: req.met ? '#22c55e' : '#a89fba' }}>
                            {req.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button type="submit" style={{ ...primaryBtnStyle, marginTop: 4 }}>
                  Create account →
                </button>
              </form>

              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#7a6f8a' }}>
                Already have an account?{' '}
                <Link to="/signin" style={{ color: '#7c6fe0', textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
              </p>
            </>
          )}

          {/* ── Step 1: Condition selection ── */}
          {step === 1 && (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#1a1523' }}>
                {QUESTIONS[0].heading}
              </h1>
              <p style={{ fontSize: 14, color: '#7a6f8a', marginBottom: 24, lineHeight: 1.65 }}>
                {QUESTIONS[0].sub}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
                {ALL_CONDITION_KEYS.map(key => {
                  const cond = CONDITIONS[key]
                  const sel = form.condition === key
                  return (
                    <button key={key} onClick={() => setVal('condition', sel ? '' : key)} style={{
                      background: sel ? `rgba(${hexToRgbStr(cond.color)}, 0.08)` : 'white',
                      border: `1.5px solid ${sel ? cond.color : '#e8e4ec'}`,
                      borderRadius: 12, padding: '16px 14px',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
                      transition: 'all 0.18s', textAlign: 'left',
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: `rgba(${hexToRgbStr(cond.color)}, 0.12)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 4,
                      }}>
                        <img src={cond.icon} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: sel ? cond.color : '#1a1523' }}>
                        {cond.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#a89fba', lineHeight: 1.4 }}>{cond.subtitle}</div>
                    </button>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(0)} style={backBtnStyle}>← Back</button>
                <button onClick={() => setStep(2)} style={{ ...primaryBtnStyle, flex: 1 }}>
                  {form.condition ? 'Continue →' : 'Skip →'}
                </button>
              </div>
            </>
          )}

          {/* ── Step 2: Goals → dashboard tiles ── */}
          {step === 2 && (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#1a1523' }}>
                {QUESTIONS[1].heading}
              </h1>
              <p style={{ fontSize: 14, color: '#7a6f8a', marginBottom: 24, lineHeight: 1.65 }}>
                {QUESTIONS[1].sub}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
                {GOAL_OPTIONS.map(({ key, Icon, label, sub }) => {
                  const selectedIdx = form.selected_goals.indexOf(key)
                  const selected = selectedIdx !== -1
                  return (
                    <button key={key} onClick={() => toggleGoal(key)} style={{
                      background: selected ? '#ede9fe' : 'white',
                      border: `1.5px solid ${selected ? '#c4b5fd' : '#e8e4ec'}`,
                      borderRadius: 10, padding: '13px 16px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                      transition: 'all 0.18s', textAlign: 'left',
                    }}>
                      <div style={{ flexShrink: 0, color: selected ? '#7c6fe0' : '#9c96a8' }}><Icon size={22} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: selected ? '#4c3d9e' : '#3d3549' }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 11, color: '#a89fba', marginTop: 2 }}>{sub}</div>
                      </div>
                      {selected && (
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          background: '#7c6fe0', color: 'white',
                          fontSize: 11, fontWeight: 800,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {selectedIdx + 1}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(1)} style={backBtnStyle}>← Back</button>
                <button onClick={() => setStep(3)} style={{ ...primaryBtnStyle, flex: 1 }}>
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* ── Step 3: User type ── */}
          {step === 3 && (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#1a1523' }}>
                {QUESTIONS[2].heading}
              </h1>
              <p style={{ fontSize: 14, color: '#7a6f8a', marginBottom: 24, lineHeight: 1.65 }}>
                {QUESTIONS[2].sub}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {USER_TYPES.map(({ Icon, label, sub }) => {
                  const sel = form.user_type === label
                  return (
                    <button key={label} onClick={() => setVal('user_type', label)} style={{
                      background: sel ? '#ede9fe' : 'white',
                      border: `1.5px solid ${sel ? '#c4b5fd' : '#e8e4ec'}`,
                      borderRadius: 10, padding: '14px 16px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                      transition: 'all 0.18s', textAlign: 'left',
                    }}>
                      <div style={{ flexShrink: 0, color: sel ? '#7c6fe0' : '#9c96a8' }}><Icon size={24} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: sel ? '#4c3d9e' : '#3d3549' }}>
                          {label}
                        </div>
                        {sub && <div style={{ fontSize: 12, color: '#a89fba', marginTop: 2 }}>{sub}</div>}
                      </div>
                      {sel && <CheckIcon size={16} color="#7c6fe0" style={{ flexShrink: 0 }} />}
                    </button>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(2)} style={backBtnStyle}>← Back</button>
                <button onClick={() => setStep(4)} style={{ ...primaryBtnStyle, flex: 1 }}>
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* ── Step 4: Referral source ── */}
          {step === 4 && (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#1a1523' }}>
                {QUESTIONS[3].heading}
              </h1>
              <p style={{ fontSize: 14, color: '#7a6f8a', marginBottom: 24, lineHeight: 1.65 }}>
                {QUESTIONS[3].sub}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {REFERRAL_SOURCES.map(({ Icon, label, sub }) => {
                  const sel = form.referral_source === label
                  return (
                    <button key={label} onClick={() => setVal('referral_source', label)} style={{
                      background: sel ? '#ede9fe' : 'white',
                      border: `1.5px solid ${sel ? '#c4b5fd' : '#e8e4ec'}`,
                      borderRadius: 10, padding: '14px 16px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                      transition: 'all 0.18s', textAlign: 'left',
                    }}>
                      <div style={{ flexShrink: 0, color: sel ? '#7c6fe0' : '#9c96a8' }}><Icon size={24} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: sel ? '#4c3d9e' : '#3d3549' }}>
                          {label}
                        </div>
                        {sub && <div style={{ fontSize: 12, color: '#a89fba', marginTop: 2 }}>{sub}</div>}
                      </div>
                      {sel && <CheckIcon size={16} color="#7c6fe0" style={{ flexShrink: 0 }} />}
                    </button>
                  )
                })}
              </div>

              <p style={{ fontSize: 11, color: '#a89fba', lineHeight: 1.65, marginBottom: 18 }}>
                By continuing you agree to our{' '}
                <a href="#" style={{ color: '#7c6fe0', textDecoration: 'none' }}>Terms</a> and{' '}
                <a href="#" style={{ color: '#7c6fe0', textDecoration: 'none' }}>Privacy Policy</a>.
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(3)} style={backBtnStyle}>← Back</button>
                <button onClick={handleFinish} disabled={loading}
                  style={{ ...primaryBtnStyle, flex: 1, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Creating account…' : 'Finish setup'}
                </button>
              </div>
            </>
          )}

        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/" style={{ fontSize: 13, color: '#a89fba', textDecoration: 'none' }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────
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
      <span style={{ fontSize: 12, color: '#a89fba', fontWeight: 500 }}>or</span>
      <div style={{ flex: 1, height: 1, background: '#f0edf4' }} />
    </div>
  )
}

function hexToRgbStr(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

// ── Styles ─────────────────────────────────────────────────────
const pageStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#faf9f7' }
const cardStyle = { background: 'white', border: '1px solid #e8e4ec', borderRadius: 20, padding: '44px 40px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }
const errorStyle = { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }
const googleBtnStyle = { width: '100%', padding: '13px 20px', borderRadius: 10, background: 'white', border: '1.5px solid #e8e4ec', color: '#1a1523', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'background 0.2s' }
const backBtnStyle = { background: 'white', border: '1.5px solid #e8e4ec', color: '#7a6f8a', padding: '14px 20px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }
const eyeBtnStyle = { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#7a6f8a', fontSize: 16, padding: 0, lineHeight: 1 }
