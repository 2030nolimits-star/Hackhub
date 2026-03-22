import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGeminiModel } from '../lib/gemini'
import { useAgentLoop } from '../lib/useAgentLoop'
import { useAgent } from '../context/AgentContext'

const D = {
  primary:   '#5b9bd5',
  dark:      '#1e3a5f',
  light:     '#dbeafe',
  bg:        '#f0f6ff',
  card:      '#ffffff',
  text:      '#1e3a5f',
  muted:     '#64748b',
  border:    '#bfdbfe',
  highlight: '#fef08a',
  green:     '#16a34a',
  greenLt:   '#dcfce7',
}

const FEATURES = [
  { icon: '🔡', title: 'OpenDyslexic Font',    desc: 'A typeface designed to reduce letter-flipping and visual stress.' },
  { icon: '🔊', title: 'Read Aloud',            desc: 'Listen to any text with adjustable speed — no reading required.' },
  { icon: '🖍️', title: 'Line Highlighting',     desc: 'Sentences light up one-by-one to guide your eyes.' },
  { icon: '✨', title: 'AI Text Simplification', desc: 'Complex passages rewritten in plain, short sentences instantly.' },
]

const TIPS = [
  'Paste any text — articles, emails, assignments — and simplify it.',
  'Use "Read Aloud" while following the highlighted text for best results.',
  'The OpenDyslexic font makes letters easier to tell apart.',
  'You can adjust reading speed with the slider.',
]

async function simplifyText(text) {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(
      "You are a reading accessibility assistant. Rewrite the given text to be easier for someone with dyslexia to read. Use short sentences (max 15 words each). Replace complex words with simple ones. Avoid unnecessary punctuation. Keep the original meaning. Return only the rewritten text — no preamble, no explanation.\\n\\nText: " + text
    );
    return result.response.text().trim();
  } catch (err) {
    console.error(err);
    return 'Could not simplify text. Please try again.';
  }
}

export default function DyslexiaMode() {
  const navigate = useNavigate()
  const { activeCategory, switchCategory, agentState, updateAgentState } = useAgent()
  const [screen, setScreen]           = useState('home')
  const [inputText, setInputText]     = useState('')
  const [displayText, setDisplayText] = useState('')
  const [sentences, setSentences]     = useState([])
  const [activeIdx, setActiveIdx]     = useState(-1)
  const [isSimplifying, setIsSimplifying] = useState(false)
  const [speechState, setSpeechState] = useState('idle') // idle | playing | paused
  const [readSpeed, setReadSpeed]     = useState(0.9)
  const [useDyslexicFont, setUseDyslexicFont] = useState(true)
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)])

  const utteranceRef = useRef(null)
  const highlightTimerRef = useRef(null)
  const highlightIndexRef = useRef(0)

  // Inject OpenDyslexic font on mount
  useEffect(() => {
    const id = 'opendyslexic-font'
    if (!document.getElementById(id)) {
      const link = document.createElement('link')
      link.id   = id
      link.rel  = 'stylesheet'
      link.href = 'https://fonts.cdnfonts.com/css/opendyslexic'
      document.head.appendChild(link)
    }
  }, [])

  // Clean up speech & timers on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
      clearTimeout(highlightTimerRef.current)
    }
  }, [])

  const DYSLEXIA_AGENT_PROMPT = `You are the Dyslexia Accessibility Agent for "Fello".
  
═══ YOUR PERSONALITY ═══
- Patient, clear, and extremely accessible.
- You use plain language and break things down.

═══ YOUR AUTONOMOUS BEHAVIORS ═══
1. FONT SUGGESTION: If useDyslexicFont is false, use showNotification to suggest switching it on.
2. SIMPLIFICATION: If the user inputs a long text (> 100 words), proactively use showNotification to suggest "Simplify with AI".
3. READING HELP: If the user has been on the same screen for > 5 min, suggest "Read Aloud" via showNotification.
4. MEMORY: storeMemory (dyslexia_preferred_speed).

═══ RULES ═══
- Max 10 words per message.
- Use emojis for visual cues.
`

  const { triggerAgent } = useAgentLoop({
    systemPrompt: DYSLEXIA_AGENT_PROMPT,
    onAction: () => {},
    loopIntervalMs: 40000,
  })

  useEffect(() => {
    if (activeCategory !== 'dyslexia') {
      switchCategory('dyslexia');
    }
  }, [activeCategory, switchCategory]);

  const fontFamily = useDyslexicFont ? "'OpenDyslexic', sans-serif" : 'inherit'

  // ─── Speech ────────────────────────────────────────────────────────────────

  const startSpeech = useCallback((text) => {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate  = readSpeed
    u.pitch = 1.0
    u.onend = () => setSpeechState('idle')
    utteranceRef.current = u
    window.speechSynthesis.speak(u)
    setSpeechState('playing')
  }, [readSpeed])

  function handlePlay() {
    const text = displayText || inputText
    if (!text.trim()) return
    if (speechState === 'paused') {
      window.speechSynthesis.resume()
      setSpeechState('playing')
    } else {
      startSpeech(text)
    }
  }

  function handlePause() {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
      setSpeechState('paused')
    }
  }

  function handleRestart() {
    const text = displayText || inputText
    if (!text.trim()) return
    window.speechSynthesis.cancel()
    startSpeech(text)
  }

  // ─── Highlighting ───────────────────────────────────────────────────────────

  function startHighlight(text) {
    const raw = text.trim()
    if (!raw) return
    const parts = raw.match(/[^.!?]+[.!?]*/g)?.map(s => s.trim()).filter(Boolean) || [raw]
    setSentences(parts)
    setActiveIdx(0)
    highlightIndexRef.current = 0

    clearTimeout(highlightTimerRef.current)
    const step = () => {
      highlightIndexRef.current += 1
      setActiveIdx(highlightIndexRef.current)
      if (highlightIndexRef.current < parts.length) {
        highlightTimerRef.current = setTimeout(step, 2200)
      }
    }
    highlightTimerRef.current = setTimeout(step, 2200)
  }

  function handleHighlight() {
    const text = displayText || inputText
    if (!text.trim()) return
    setDisplayText(text)
    startHighlight(text)
  }

  function stopHighlight() {
    clearTimeout(highlightTimerRef.current)
    setActiveIdx(-1)
    setSentences([])
  }

  // ─── Simplify ──────────────────────────────────────────────────────────────

  async function handleSimplify(textToSimplify) {
    const textTarget = typeof textToSimplify === 'string' ? textToSimplify : inputText;
    if (!textTarget.trim()) return
    setIsSimplifying(true)
    stopHighlight()
    try {
      const result = await simplifyText(textTarget)
      setDisplayText(result)
    } catch {
      setDisplayText('Error simplifying text. Please try again.')
    }
    setIsSimplifying(false)
  }

  // Autonomous Agent Loop Integration
  const systemPrompt = `
You are the Dyslexia assist agent for 'Fello'.
Your user struggles with long, dense paragraphs and complex words.
1. If the user input contains very long words or large blocks of text, you should offer to simplify it, or automatically simplify it if it's very dense.
2. If they change fonts away from OpenDyslexic, remind them it helps if they feel tired.
Respond with JSON: 
{ "message": "Feedback note", "action": "SIMPLIFY" | "NONE" }
  `;

  useAgentLoop({
    systemPrompt,
    onAction: (plan) => {
      // If the agent determines the inputted text is too complex, it aggressively auto-simplifies it.
      if (plan.action === 'SIMPLIFY' && inputText.length > 50 && !isSimplifying) {
        handleSimplify(inputText);
      }
      if (plan.message) {
        console.log("Agent:", plan.message); // In a fuller implementation, display as a toast notification.
      }
    },
    loopIntervalMs: 30000 // Tick every 30s to check active text
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  if (screen === 'home') {
    return (
      <div style={{ minHeight: '100vh', background: D.bg, fontFamily }}>
        {/* Nav */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'white', borderBottom: `1px solid ${D.border}`,
          padding: '0 24px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button
            onClick={() => navigate('/dashboard?stay=1')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: D.muted, fontSize: 14 }}
          >
            ← Dashboard
          </button>
          <span style={{ fontWeight: 700, fontSize: 18, color: D.primary, fontFamily }}>
            Dyslexia Reader
          </span>
          <span style={{ width: 80 }} />
        </nav>

        <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px' }}>
          {/* Hero */}
          <div style={{
            background: D.primary, borderRadius: 20, padding: '36px 32px',
            color: 'white', marginBottom: 32, textAlign: 'center',
          }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📖</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, fontFamily }}>
              Dyslexia-Friendly Reader
            </h1>
            <p style={{ fontSize: 16, opacity: 0.9, lineHeight: 1.7 }}>
              Paste any text and we'll make it easier to read — with the right font, spacing, highlighting, and AI simplification.
            </p>
          </div>

          {/* Tip */}
          <div style={{
            background: D.greenLt, borderRadius: 12, padding: '14px 18px',
            marginBottom: 28, display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 18 }}>💡</span>
            <p style={{ fontSize: 14, color: '#166534', margin: 0, lineHeight: 1.6 }}>{tip}</p>
          </div>

          {/* Features */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 36 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: D.card, borderRadius: 14, padding: '20px 18px',
                border: `1px solid ${D.border}`,
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: D.text, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: D.muted, lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setScreen('reader')}
            style={{
              width: '100%', background: D.primary, color: 'white',
              border: 'none', borderRadius: 14, padding: '18px',
              fontSize: 18, fontWeight: 700, cursor: 'pointer',
              fontFamily,
            }}
          >
            Open Reader →
          </button>
        </div>
      </div>
    )
  }

  // ─── Reader Screen ──────────────────────────────────────────────────────────

  const activeText = displayText || inputText
  const showHighlighted = sentences.length > 0 && activeIdx >= 0

  return (
    <div style={{ minHeight: '100vh', background: D.bg, fontFamily }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'white', borderBottom: `1px solid ${D.border}`,
        padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={() => { stopHighlight(); window.speechSynthesis.cancel(); setScreen('home') }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: D.muted, fontSize: 14 }}
        >
          ← Back
        </button>
        <span style={{ fontWeight: 700, fontSize: 16, color: D.primary, fontFamily }}>
          Text Reader
        </span>

        {/* Font toggle */}
        <button
          onClick={() => setUseDyslexicFont(v => !v)}
          style={{
            background: useDyslexicFont ? D.light : '#f1f5f9',
            border: `1px solid ${useDyslexicFont ? D.primary : '#cbd5e1'}`,
            borderRadius: 8, padding: '4px 10px',
            fontSize: 12, cursor: 'pointer',
            color: useDyslexicFont ? D.primary : D.muted,
          }}
        >
          {useDyslexicFont ? '🔡 Dyslexic font ON' : '🔡 Dyslexic font OFF'}
        </button>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px' }}>

        {/* Input area */}
        <div style={{
          background: D.card, borderRadius: 16, border: `1px solid ${D.border}`,
          padding: '20px', marginBottom: 16,
        }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: D.muted, display: 'block', marginBottom: 8 }}>
            PASTE YOUR TEXT HERE
          </label>
          <textarea
            value={inputText}
            onChange={e => { setInputText(e.target.value); setDisplayText(''); stopHighlight() }}
            placeholder="Paste any text — an article, an email, a document…"
            rows={6}
            style={{
              width: '100%', resize: 'vertical',
              border: `1.5px solid ${D.border}`, borderRadius: 10,
              padding: '12px 14px', fontSize: 16,
              fontFamily, lineHeight: 1.9, letterSpacing: '0.04em',
              background: '#fafcff', color: D.text,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <button
            onClick={handleSimplify}
            disabled={isSimplifying || !inputText.trim()}
            style={{
              flex: '1 1 auto', background: isSimplifying ? D.muted : D.primary,
              color: 'white', border: 'none', borderRadius: 12,
              padding: '14px 18px', fontSize: 15, fontWeight: 700,
              cursor: isSimplifying || !inputText.trim() ? 'not-allowed' : 'pointer',
              fontFamily,
            }}
          >
            {isSimplifying ? '✨ Simplifying…' : '✨ Simplify Text'}
          </button>

          <button
            onClick={handleHighlight}
            disabled={!activeText.trim()}
            style={{
              flex: '1 1 auto',
              background: showHighlighted ? D.highlight : D.light,
              color: D.dark, border: `1px solid ${D.border}`,
              borderRadius: 12, padding: '14px 18px',
              fontSize: 15, fontWeight: 700,
              cursor: !activeText.trim() ? 'not-allowed' : 'pointer',
              fontFamily,
            }}
          >
            🖍️ {showHighlighted ? 'Highlighting…' : 'Highlight Lines'}
          </button>
        </div>

        {/* Speech controls */}
        <div style={{
          background: D.card, borderRadius: 14, border: `1px solid ${D.border}`,
          padding: '16px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: D.muted, marginRight: 4 }}>
            🔊 READ ALOUD
          </span>

          <button
            onClick={handlePlay}
            disabled={!activeText.trim()}
            style={btnStyle(D.primary, !activeText.trim())}
          >
            {speechState === 'playing' ? '▶ Playing' : speechState === 'paused' ? '▶ Resume' : '▶ Play'}
          </button>

          <button
            onClick={handlePause}
            disabled={speechState !== 'playing'}
            style={btnStyle('#64748b', speechState !== 'playing')}
          >
            ⏸ Pause
          </button>

          <button
            onClick={handleRestart}
            disabled={!activeText.trim()}
            style={btnStyle('#64748b', !activeText.trim())}
          >
            ↺ Restart
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <span style={{ fontSize: 12, color: D.muted }}>Speed</span>
            <input
              type="range" min="0.5" max="1.5" step="0.1"
              value={readSpeed}
              onChange={e => setReadSpeed(parseFloat(e.target.value))}
              style={{ width: 80, accentColor: D.primary }}
            />
            <span style={{ fontSize: 12, color: D.muted, width: 28 }}>{readSpeed}x</span>
          </div>
        </div>

        {/* Output / highlighted content */}
        {activeText.trim() && (
          <div style={{
            background: D.card, borderRadius: 16, border: `1px solid ${D.border}`,
            padding: '24px', minHeight: 120,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: D.muted, marginBottom: 14, letterSpacing: '0.05em' }}>
              {displayText ? 'SIMPLIFIED TEXT' : 'YOUR TEXT'} {showHighlighted && '· Highlighting active'}
            </div>

            {showHighlighted ? (
              <p style={{ fontSize: 17, lineHeight: 2, letterSpacing: '0.04em', fontFamily, color: D.text, margin: 0 }}>
                {sentences.map((s, i) => (
                  <span key={i}>
                    {i === activeIdx
                      ? <mark style={{ background: D.highlight, borderRadius: 4, padding: '2px 0' }}>{s}</mark>
                      : <span style={{ opacity: i < activeIdx ? 0.45 : 1 }}>{s}</span>
                    }
                    {' '}
                  </span>
                ))}
              </p>
            ) : (
              <p style={{
                fontSize: 17, lineHeight: 2, letterSpacing: '0.04em',
                fontFamily, color: D.text, margin: 0, whiteSpace: 'pre-wrap',
              }}>
                {activeText}
              </p>
            )}
          </div>
        )}

        {/* Empty state */}
        {!activeText.trim() && (
          <div style={{
            background: D.card, borderRadius: 16, border: `1.5px dashed ${D.border}`,
            padding: '48px 24px', textAlign: 'center', color: D.muted,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
            <p style={{ fontSize: 15, margin: 0 }}>Paste text above to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function btnStyle(bg, disabled) {
  return {
    background: disabled ? '#e2e8f0' : bg,
    color: disabled ? '#94a3b8' : 'white',
    border: 'none', borderRadius: 10,
    padding: '10px 16px', fontSize: 14,
    fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
  }
}
