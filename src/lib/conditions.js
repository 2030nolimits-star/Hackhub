// Condition-specific feature definitions from the DDS system.
// Each condition has a list of tailored features shown on the dashboard.

export const CONDITIONS = {
  adhd: {
    key: 'adhd',
    icon: '/adhd.png',
    title: 'ADHD',
    subtitle: 'Focus & impulse control',
    color: '#f0952a',
    features: [
      { label: 'Pomodoro timer (15/3 intervals)', core: true },
      { label: 'Distraction blocker mode' },
      { label: 'Hyperfocus alert — gentle nudge after 90 min' },
      { label: 'Micro-rewards after each step' },
      { label: 'Body-doubling session timer' },
    ],
  },
  dyslexia: {
    key: 'dyslexia',
    icon: '/dyslexia.png',
    title: 'Dyslexia',
    subtitle: 'Reading & processing',
    color: '#5b9bd5',
    features: [
      { label: 'Dyslexia-friendly font (OpenDyslexic)', core: true },
      { label: 'Text-to-speech for all content' },
      { label: 'AI simplifies complex words automatically' },
      { label: 'Line highlighting while reading' },
      { label: 'Extra spacing between lines & letters' },
    ],
  },
  dyspraxia: {
    key: 'dyspraxia',
    icon: '/dyspraxia.png',
    title: 'Dyspraxia',
    subtitle: 'Motor & sequencing',
    color: '#e06fa0',
    features: [
      { label: 'Larger tap targets everywhere', core: true },
      { label: 'Step-by-step with no decision overload' },
      { label: 'Movement & coordination break reminders' },
      { label: 'Voice-only navigation option' },
      { label: 'Predictable, unchanging layout' },
    ],
  },
  dementia: {
    key: 'dementia',
    icon: '/dementia.png',
    title: 'Dementia',
    subtitle: 'Memory & recall',
    color: '#c084fc',
    features: [
      { label: 'Daily memory prompt journaling', core: true },
      { label: 'AI turns spoken memories into illustrated stories' },
      { label: 'Familiar face & name reminder cards' },
      { label: 'Ultra simple UI — one action per screen' },
      { label: 'Family sharing — loved ones can view entries' },
    ],
  },
  anxiety: {
    key: 'anxiety',
    icon: '/anxiety.png',
    title: 'Anxiety',
    subtitle: 'Emotional regulation',
    color: '#f59e0b',
    features: [
      { label: 'Overwhelmed mode — calm UI instantly', core: true },
      { label: 'Guided box breathing (4-7-8)' },
      { label: '"Just 2 minutes" starter tasks' },
      { label: 'Therapy chatbot with safe escalation' },
      { label: 'Gratitude journal with daily prompts' },
    ],
  },
  depression: {
    key: 'depression',
    icon: '/depression.png',
    title: 'Depression / fatigue',
    subtitle: 'Energy & motivation',
    color: '#2db896',
    features: [
      { label: 'Low energy mode — passive tasks only', core: true },
      { label: 'Tiny wins — celebrate every micro-step' },
      { label: 'Recovery mode — self-care emphasis' },
      { label: 'Mood trend tracker over time' },
      { label: 'Hydration & movement gentle reminders' },
    ],
  },
}

export const ALL_CONDITION_KEYS = Object.keys(CONDITIONS)
