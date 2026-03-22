const items = [
  'ADHD', 'Dyspraxia', 'Dementia', 'Anxiety', 'Depression', 'Dyslexia',
  'Autism', 'Executive Dysfunction', 'Sensory Processing', 'Memory Challenges',
]

export default function Marquee() {
  const repeated = [...items, ...items, ...items]
  return (
    <div style={{ background: '#1a1710', padding: '16px 0', overflow: 'hidden' }}>
      <div className="marquee-track">
        {repeated.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 20, paddingRight: 20 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#f0ece2', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
              {item}
            </span>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7B6BC4', display: 'block', flexShrink: 0 }} />
          </span>
        ))}
      </div>
    </div>
  )
}
