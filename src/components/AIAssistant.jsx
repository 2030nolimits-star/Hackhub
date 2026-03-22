const messages = [
  { role: 'user', text: "I have dyspraxia and get overwhelmed tying my tasks together. I don't know where to begin today 😞" },
  { role: 'ai', text: "I've got you. Based on your energy right now, here's a gentle plan for this morning:", steps: ['Put on comfortable clothes — no buttons needed. (5 min)', 'Make a simple drink and sit somewhere calm. (5 min)', 'Open today\'s task list — just look, don\'t act yet. (2 min)', 'Pick ONE task. Tap "Start" when you\'re ready. (you decide)', 'Take a 3-min movement break after. You\'re doing great. 🌿'] },
  { role: 'user', text: 'That feels so much better. Can it remember my routine?' },
  { role: 'ai', text: 'Yes — I\'ll learn your patterns and pre-fill your morning plan each day. Powered by Gemini.' },
]

const chips = [
  { label: 'Dyspraxia Support', color: '#7B6BC4', bg: 'rgba(196,181,244,0.15)' },
  { label: 'Motor Planning', color: '#4a7ab5', bg: 'rgba(168,216,239,0.18)' },
  { label: 'Routine Builder', color: '#1a6a50', bg: 'rgba(142,237,192,0.15)' },
  { label: 'Voice Input', color: '#8a5a2a', bg: 'rgba(245,176,122,0.15)' },
  { label: 'Sensory Guidance', color: '#8a3020', bg: 'rgba(236,144,128,0.15)' },
  { label: 'Powered by Gemini', color: '#4285F4', bg: 'rgba(66,133,244,0.1)' },
]

export default function AIAssistant() {
  return (
    <section style={{ background: '#ffffff', padding: '104px 40px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>

        {/* left: text */}
        <div>
          <span style={{
            display: 'inline-block', background: 'rgba(196,181,244,0.18)',
            color: '#7B6BC4', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '6px 16px', borderRadius: 9999, marginBottom: 20,
          }}>Dyspraxia AI · Powered by Gemini</span>

          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 900, color: '#0f1923', lineHeight: 1.12, marginBottom: 18, letterSpacing: '-1.5px' }}>
            AI that understands<br />
            <span style={{ background: 'linear-gradient(135deg, #7B6BC4, #8EEDC0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              how you move &amp; think
            </span>
          </h2>

          <p style={{ color: '#6b7685', fontSize: 16, lineHeight: 1.8, marginBottom: 28, maxWidth: 420 }}>
            Powered by <strong style={{ color: '#4285F4' }}>Google Gemini</strong>, Fello's dyspraxia assistant understands motor planning, sequencing, and sensory challenges — turning overwhelming days into gentle, doable steps.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
            {chips.map(c => (
              <span key={c.label} style={{ background: c.bg, color: c.color, fontSize: 12, fontWeight: 600, padding: '6px 13px', borderRadius: 9999 }}>{c.label}</span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 28 }}>
            {[{ val: '6x', label: 'faster task starts' }, { val: '94%', label: 'feel less overwhelmed' }, { val: '<3s', label: 'to a step-by-step plan' }].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0f1923' }}>{s.val}</div>
                <div style={{ fontSize: 12, color: '#6b7685' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* right: chat mockup */}
        <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 8px 48px rgba(0,0,0,0.07)', border: '1.5px solid #e8e2f5', overflow: 'hidden' }}>
          {/* chat header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0ecfc', display: 'flex', alignItems: 'center', gap: 10, background: '#f9f8fd' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #C4B5F4, #8EEDC0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>✦</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0f1923', display: 'flex', alignItems: 'center', gap: 6 }}>
                Fello AI
                <span style={{ fontSize: 10, fontWeight: 600, color: '#4285F4', background: 'rgba(66,133,244,0.1)', padding: '2px 7px', borderRadius: 9999 }}>Gemini</span>
              </div>
              <div style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                Online · Dyspraxia Mode
              </div>
            </div>
          </div>

          {/* messages */}
          <div style={{ padding: '20px 20px 12px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 340, overflowY: 'auto' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-start' }}>
                {msg.role === 'ai' && (
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #C4B5F4, #8EEDC0)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✦</div>
                )}
                <div style={{
                  maxWidth: '78%',
                  background: msg.role === 'user' ? '#0f1923' : '#f9f8fd',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  border: msg.role === 'ai' ? '1px solid #e8e2f5' : 'none',
                  padding: '10px 14px',
                }}>
                  <p style={{ fontSize: 12, color: msg.role === 'user' ? '#fff' : '#1a2332', lineHeight: 1.6, margin: 0 }}>{msg.text}</p>
                  {msg.steps && (
                    <ol style={{ margin: '8px 0 0', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {msg.steps.map((s, j) => (
                        <li key={j} style={{ fontSize: 11, color: '#3d5060', lineHeight: 1.5 }}>{s}</li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* input bar */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f0ecfc', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, background: '#f9f8fd', borderRadius: 9999, padding: '9px 16px', fontSize: 12, color: '#b0bcc8', border: '1px solid #e8e2f5' }}>
              Type, speak, or drop a file...
            </div>
            <button style={{ width: 34, height: 34, borderRadius: '50%', background: '#0f1923', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff' }}>→</button>
          </div>
        </div>
      </div>
    </section>
  )
}
