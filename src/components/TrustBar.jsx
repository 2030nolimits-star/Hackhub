import { Shield, Accessibility, Lock, Stethoscope, Globe } from 'lucide-react'

const items = [
  { Icon: Shield,        label: 'GDPR & HIPAA Aligned' },
  { Icon: Accessibility, label: 'WCAG 2.2 AA Accessible' },
  { Icon: Lock,          label: 'End-to-End Encrypted' },
  { Icon: Stethoscope,   label: 'Clinically-Informed Design' },
  { Icon: Globe,         label: 'Multi-Language Support' },
]

export default function TrustBar() {
  return (
    <div style={{
      background: '#faf9fd',
      borderTop: '1px solid #f0edf7',
      borderBottom: '1px solid #f0edf7',
      padding: '20px 40px',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#b0bcc8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
          Trusted by teams across 33+ countries
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36, flexWrap: 'wrap' }}>
          {items.map(({ Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 500, color: '#9c96a8' }}>
              <Icon size={15} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
