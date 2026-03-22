import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Textarea } from '@/components/ui/textarea'
import { useSpeechInput, speakText } from '../utils/useSpeech'
import { useBreakTimer } from '../utils/useBreakTimer'
import { supabase } from '../lib/supabase'
import { clearPreferredView } from '../lib/viewPreference'
import { getGeminiModel, getGeminiJsonModel } from '../lib/gemini'
import { useAgentLoop } from '../lib/useAgentLoop'
import { useAgent } from '../context/AgentContext'

const SCREENS = {
  INPUT: 'input',
  LOADING: 'loading',
  OVERVIEW: 'overview',
  STEP: 'step',
  BREAK: 'break',
  DONE: 'done',
}

const LOADING_MSGS = [
  'Thinking of the smallest possible steps...',
  'Breaking your task into tiny pieces...',
  'Making this as easy as possible...',
  'Almost ready...',
]

async function fetchBreakdown(task) {
  try {
    const model = getGeminiJsonModel();
    const prompt = `You are a compassionate AI assistant for people with Dyspraxia (Developmental Coordination Disorder).

Your job is to break tasks into micro-steps that are:
- ONE single physical action only — never combine two things
- Maximum 10 words each — short, clear, plain English
- Zero jargon or complex vocabulary
- Predictable and sequential — no decisions required
- Include a movement or rest break every 3 to 4 steps
- Steps must be SPECIFIC to the task given — not generic

Each step must have:
- "step": the instruction (max 10 words, specific to the task)
- "time": estimated time e.g. "~2 min"
- "type": either "task" or "break"
- "tip": one short encouraging sentence (max 12 words)

For break type steps, use a specific physical movement like "Shake your hands gently for 10 seconds" or "Roll shoulders back 5 times".

Return ONLY a valid JSON array of these step objects.
Generate between 4 and 7 steps total.

Now break this task into micro-steps for someone with Dyspraxia: "${task}"`;

    const result = await model.generateContent(prompt);
    const steps = JSON.parse(result.response.text());
    return { steps };
  } catch (err) {
    console.error('Gemini error:', err);
    return { steps: getFallbackSteps(task), fallback: true };
  }
}

// ── Natural language intent classification ─────────────────────

const SCREEN_INTENTS = {
  [SCREENS.INPUT]:    ['submit_task', 'help', 'unknown'],
  [SCREENS.OVERVIEW]: ['start_steps', 'read_all_steps', 'help', 'unknown'],
  [SCREENS.STEP]:     ['next_step', 'take_break', 'read_step', 'show_overview', 'hear_tip', 'help', 'unknown'],
  [SCREENS.BREAK]:    ['continue_after_break', 'help', 'unknown'],
  [SCREENS.DONE]:     ['save_session', 'new_task', 'help', 'unknown'],
}

// Instant regex fast-path — handles unambiguous short phrases in <1ms
const FAST_PATTERNS = {
  next_step:           /\b(done|next|finish(ed)?|complet(e|ed)|tick(ed)?|check(ed)?)\b/,
  take_break:          /\b(break|rest|pause)\b/,
  read_step:           /\b(read|again|repeat)\b/,
  show_overview:       /\b(overview|back)\b/,
  hear_tip:            /\b(tip|hint)\b/,
  help:                /^help$/,
  submit_task:         /\b(submit)\b/,
  start_steps:         /\b(start|begin)\b/,
  read_all_steps:      /\b(list|hear all|read all)\b/,
  continue_after_break:/\b(ready|continue|resume)\b/,
  save_session:        /\b(save)\b/,
  new_task:            /\b(new task|start over|reset)\b/,
}

const SCREEN_FAST_INTENTS = {
  [SCREENS.INPUT]:    ['submit_task', 'help'],
  [SCREENS.OVERVIEW]: ['start_steps', 'read_all_steps', 'help'],
  [SCREENS.STEP]:     ['next_step', 'take_break', 'read_step', 'show_overview', 'hear_tip', 'help'],
  [SCREENS.BREAK]:    ['continue_after_break', 'help'],
  [SCREENS.DONE]:     ['save_session', 'new_task', 'help'],
}

const INTENT_DESCRIPTIONS = {
  next_step:           'user is done with the current step and wants to move on',
  take_break:          'user needs to pause or take a rest',
  read_step:           'user wants the current step read aloud again',
  show_overview:       'user wants to see or hear all steps listed',
  hear_tip:            'user wants the encouragement tip for this step',
  help:                'user is confused about what commands to use',
  submit_task:         'user wants to submit their task and get it broken down',
  start_steps:         'user wants to begin the current or first step',
  read_all_steps:      'user wants all steps read out in order',
  continue_after_break:'user is ready to continue after the break',
  save_session:        'user wants to save the session and finish',
  new_task:            'user wants to start a completely new task',
  unknown:             'none of the above — ignore the command',
}

async function interpretIntent(transcript, screen) {
  const t = transcript.toLowerCase().trim()

  // 1. Instant fast-path for short unambiguous commands
  for (const intent of (SCREEN_FAST_INTENTS[screen] || [])) {
    if (FAST_PATTERNS[intent]?.test(t)) return intent
  }

  // 2. AI classification for natural free-form speech
  const available = SCREEN_INTENTS[screen] || ['unknown']
  const intentList = available.map(i => `- ${i}: ${INTENT_DESCRIPTIONS[i] || i}`).join('\n')

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(
      `Classify this voice command from a dyspraxia support app into exactly one intent.\n\nUser said: "${transcript}"\n\nAvailable intents:\n${intentList}\n\nReply with ONLY the intent name, nothing else.`
    );
    const intent = result.response.text().trim().toLowerCase().replace(/[^a-z_]/g, '');
    return available.includes(intent) ? intent : 'unknown';
  } catch {
    return 'unknown';
  }
}

function getFallbackSteps(task) {
  return [
    { step: 'Find a quiet space and sit comfortably', time: '~1 min', type: 'task', tip: 'Getting settled really helps your focus.' },
    { step: 'Open exactly one app or document', time: '~1 min', type: 'task', tip: 'One thing at a time is the whole rule.' },
    { step: 'Write down the very first small action', time: '~3 min', type: 'task', tip: 'Just begin — perfection is not needed.' },
    { step: 'Roll your shoulders back five times', time: '~1 min', type: 'break', tip: 'Movement helps your body stay coordinated.' },
    { step: 'Continue with the next small action', time: '~5 min', type: 'task', tip: 'You are already more than halfway there.' },
  ]
}

const DYSPRAXIA_AGENT_PROMPT = `You are the Dyspraxia Support Agent for "Fello".
  
═══ YOUR PERSONALITY ═══
- Encouraging, patient, and very literal. 
- You break everything into physical, single-motion steps.

═══ YOUR AUTONOMOUS BEHAVIORS ═══
1. BREAK REMINDER: If the user has been on the same step for > 5 min, use showNotification to suggest a "Movement break".
2. AUDIO HELP: Proactively use readAloud to read the current step if the user seems stuck (idleMinutes > 3).
3. CELEBRATION: When a task is submitted or steps are completed, use showNotification (celebration).
4. MEMORY: storeMemory (dyspraxia_last_task).

═══ RULES ═══
- Max 10 words per message.
- Be very physical and literal in your advice.
`

export default function DyspraxiaMode() {
  const navigate = useNavigate()
  const { activeCategory, switchCategory, agentState, updateAgentState } = useAgent()
  const [screen, setScreen] = useState(SCREENS.INPUT)
  const [taskText, setTaskText] = useState('')
  const [steps, setSteps] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)

  // Autonomous Agent Loop
  const { triggerAgent } = useAgentLoop({
    systemPrompt: DYSPRAXIA_AGENT_PROMPT,
    onAction: () => {},
    loopIntervalMs: 40000,
  })

  useEffect(() => {
    if (activeCategory !== 'dyspraxia') {
      switchCategory('dyspraxia');
    }
  }, [activeCategory, switchCategory]);
  const [mood, setMood] = useState(null)
  const [loadMsg, setLoadMsg] = useState(LOADING_MSGS[0])
  const [sessions, setSessions] = useState([])
  const [voiceMode, setVoiceMode] = useState(false)
  const [voiceProcessing, setVoiceProcessing] = useState(false)
  const commandRecRef = useRef(null)
  const voiceCmdHandlerRef = useRef(null)
  const voiceProcessingRef = useRef(false) // mirror for use inside closures

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('dyspraxia_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) setSessions(data)
  }

  // Keep voice command handler always fresh (avoids stale closures)
  // Uses AI intent classification for natural language — fast regex path for obvious phrases
  voiceCmdHandlerRef.current = async (transcript) => {
    if (voiceProcessingRef.current) return // ignore if already classifying
    voiceProcessingRef.current = true
    setVoiceProcessing(true)

    let intent
    try {
      intent = await interpretIntent(transcript, screen)
    } finally {
      voiceProcessingRef.current = false
      setVoiceProcessing(false)
    }

    if (intent === 'unknown') return

    // Execute intent
    if (screen === SCREENS.INPUT) {
      if (intent === 'submit_task' && taskText.trim()) submitTask()
      else if (intent === 'help') speakText('Say your task, then say submit when ready.')
    } else if (screen === SCREENS.OVERVIEW) {
      if (intent === 'start_steps') startCurrentStep()
      else if (intent === 'read_all_steps') speakText(steps.map((s, i) => `Step ${i + 1}: ${s.step}`).join('. '))
      else if (intent === 'help') speakText('Say start to begin. Say list to hear all steps.')
    } else if (screen === SCREENS.STEP) {
      if (intent === 'next_step') {
        const nextStep = steps[currentIdx + 1]
        if (nextStep) speakText(`Good job! Next: ${nextStep.step}`)
        else speakText('Amazing — you finished all the steps!')
        completeStep()
      } else if (intent === 'take_break') {
        speakText('Taking a break. Shake out your hands.')
        needBreak()
      } else if (intent === 'read_step') {
        if (steps[currentIdx]) speakText(steps[currentIdx].step)
      } else if (intent === 'show_overview') {
        setScreen(SCREENS.OVERVIEW)
      } else if (intent === 'hear_tip') {
        if (steps[currentIdx]?.tip) speakText(steps[currentIdx].tip)
      } else if (intent === 'help') {
        speakText('Say done to move on, break to rest, read to hear the step again, or overview to see all steps.')
      }
    } else if (screen === SCREENS.BREAK) {
      if (intent === 'continue_after_break') {
        speakText('Great! Back to it.')
        advanceAfterBreak()
      } else if (intent === 'help') {
        speakText('Say ready when you want to continue.')
      }
    } else if (screen === SCREENS.DONE) {
      if (intent === 'save_session') {
        speakText('Saved. Well done!')
        saveSession().then(() => navigate('/dyspraxia'))
      } else if (intent === 'new_task') {
        reset()
      } else if (intent === 'help') {
        speakText('Say save to finish, or new task to start again.')
      }
    }
  }

  // Voice navigation: runs on all screens, auto-restarts, reads screen intro
  useEffect(() => {
    if (!voiceMode || screen === SCREENS.LOADING) {
      commandRecRef.current?.stop()
      commandRecRef.current = null
      return
    }

    // Screen-appropriate audio introduction
    const intros = {
      [SCREENS.INPUT]:    'Voice mode on. Say your task, then say submit.',
      [SCREENS.OVERVIEW]: `You have ${steps.length} step${steps.length !== 1 ? 's' : ''}. Say start to begin, or say help.`,
      [SCREENS.STEP]:     steps[currentIdx] ? steps[currentIdx].step : null,
      [SCREENS.BREAK]:    'Good work! Rest for a moment. Say ready when you want to continue.',
      [SCREENS.DONE]:     'You finished! Say save to complete, or new task to start again.',
    }
    const intro = intros[screen]
    if (intro) speakText(intro)

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    let stopped = false
    let rec = null

    function startRec() {
      if (stopped) return
      rec = new SR()
      rec.continuous = true
      rec.interimResults = false
      rec.lang = 'en-GB'
      rec.onresult = (e) => {
        const cmd = e.results[e.results.length - 1][0].transcript.toLowerCase().trim()
        voiceCmdHandlerRef.current?.(cmd)
      }
      rec.onerror = () => {}
      rec.onend = () => { if (!stopped) setTimeout(startRec, 300) }
      rec.start()
      commandRecRef.current = rec
    }

    startRec()
    return () => {
      stopped = true
      rec?.stop()
      commandRecRef.current = null
    }
  }, [voiceMode, screen, currentIdx])

  const { isRecording, toggle: toggleMic } = useSpeechInput((t) => setTaskText(t))

  async function handleChangeExperience() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) clearPreferredView(user.id)
    navigate('/choose')
  }

  const { display: timerDisplay, start: startTimer } = useBreakTimer(120, () => {
    advanceAfterBreak()
  })

  async function submitTask() {
    if (!taskText.trim()) return
    setScreen(SCREENS.LOADING)
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MSGS.length
      setLoadMsg(LOADING_MSGS[i])
    }, 1800)
    try {
      const { steps: loaded } = await fetchBreakdown(taskText)
      setSteps(loaded)
      setCurrentIdx(0)
    } catch {
      setSteps(getFallbackSteps(taskText))
      setCurrentIdx(0)
    } finally {
      clearInterval(interval)
      setScreen(SCREENS.OVERVIEW)
    }
  }

  function startCurrentStep() {
    if (currentIdx >= steps.length) { setScreen(SCREENS.DONE); return }
    setScreen(SCREENS.STEP)
  }

  function completeStep() {
    const next = currentIdx + 1
    if (next >= steps.length) { setCurrentIdx(next); setScreen(SCREENS.DONE); return }
    setCurrentIdx(next)
    if (steps[next]?.type === 'break') { startTimer(); setScreen(SCREENS.BREAK) }
    else setScreen(SCREENS.STEP)
  }

  function needBreak() { startTimer(); setScreen(SCREENS.BREAK) }

  function advanceAfterBreak() {
    const isBreakStep = steps[currentIdx]?.type === 'break'
    const next = isBreakStep ? currentIdx + 1 : currentIdx
    setCurrentIdx(next)
    if (next >= steps.length) { setScreen(SCREENS.DONE); return }
    setScreen(SCREENS.STEP)
  }

  async function saveSession() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('dyspraxia_sessions').insert({
      user_id: user.id,
      task: taskText,
      mood: mood || null,
      steps_completed: steps.length,
      created_at: new Date().toISOString(),
    })
  }

  function reset() {
    setScreen(SCREENS.INPUT)
    setTaskText('')
    setSteps([])
    setCurrentIdx(0)
    setMood(null)
    loadSessions()
  }

  const current = steps[currentIdx]
  const wide = { width: '100%', maxWidth: 760, margin: '0 auto' }

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#FDFAF5', display: 'flex', flexDirection: 'column' }}>

      {/* ── INPUT ── */}
      {screen === SCREENS.INPUT && (
        <div className="fadein" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <DyspraxiaTopBar eyebrow="· DYSPRAXIA MODE" title="Hi there 👋" subtitle="What do you need to do today?" onChangeExperience={handleChangeExperience} voiceMode={voiceMode} onToggleVoice={() => setVoiceMode(v => !v)} />
          <div style={{ ...wide, flex: 1, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Mic button */}
            <div
              onClick={toggleMic}
              style={{
                background: '#FAEEDA',
                border: `2px dashed ${isRecording ? '#BA7517' : '#FAC775'}`,
                borderRadius: 20, padding: '36px 20px', textAlign: 'center', cursor: 'pointer',
              }}
            >
              <div
                className={isRecording ? 'recording' : ''}
                style={{
                  width: 80, height: 80, borderRadius: '50%', background: '#BA7517',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', cursor: 'pointer',
                }}
              >
                <svg width="34" height="34" viewBox="0 0 30 30" fill="none">
                  <rect x="10" y="3" width="10" height="17" rx="5" fill="white" />
                  <path d="M5 15a10 10 0 0020 0" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="15" y1="25" x2="15" y2="29" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="11" y1="29" x2="19" y2="29" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
              <p style={{ fontSize: 18, fontWeight: 500, color: '#633806', marginBottom: 6 }}>
                {isRecording ? 'Listening... tap to stop' : 'Press to speak your task'}
              </p>
              <p style={{ fontSize: 14, color: '#BA7517' }}>
                {isRecording ? 'Speak your task now' : 'Say it however it comes out — no need to be precise'}
              </p>
            </div>

            <Divider />

            <Textarea
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              rows={4}
              placeholder="Write what you need to do here..."
              className="text-[17px] resize-none bg-white font-[inherit] text-[#1a1a18] focus-visible:border-[#BA7517] focus-visible:ring-[#BA7517]/30"
            />

            <DyspraxiaNotice text="No need to be specific — just say what you need to do and the AI does the rest" />
            {voiceMode && <VoiceIndicator processing={voiceProcessing} commands={['e.g. "break that down for me"', '"help" — list commands']} />}
            <BigBtn label="Break it down for me" onClick={submitTask} disabled={!taskText.trim()} />

            {sessions.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#888780', letterSpacing: '0.06em', marginBottom: 10 }}>
                  RECENT SESSIONS
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sessions.map((s) => (
                    <div key={s.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'white', border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 12, padding: '12px 14px',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a18', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.task}
                        </p>
                        <p style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>
                          {s.steps_completed} steps · {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      {s.mood && (
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: '#BA7517',
                          background: '#FAEEDA', borderRadius: 999, padding: '3px 10px',
                          marginLeft: 10, flexShrink: 0,
                        }}>
                          {s.mood}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LOADING ── */}
      {screen === SCREENS.LOADING && (
        <div className="fadein" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <DyspraxiaTopBar eyebrow="· DYSPRAXIA MODE" title="Got it" subtitle="Creating your steps..." voiceMode={voiceMode} onToggleVoice={() => setVoiceMode(v => !v)} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 40 }}>
            <div className="spinner" style={{ width: 60, height: 60, border: '3px solid #FAEEDA', borderTopColor: '#BA7517', borderRadius: '50%' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 500, color: '#1a1a18', marginBottom: 8 }}>{loadMsg}</p>
              <p style={{ fontSize: 14, color: '#888780' }}>This takes about 5 seconds</p>
            </div>
          </div>
        </div>
      )}

      {/* ── OVERVIEW ── */}
      {screen === SCREENS.OVERVIEW && (
        <div className="fadein" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <DyspraxiaTopBar
            eyebrow="· DYSPRAXIA MODE"
            title={taskText.length > 40 ? taskText.slice(0, 40) + '...' : taskText}
            subtitle={`${steps.length} steps — one at a time, no rush`}
            voiceMode={voiceMode} onToggleVoice={() => setVoiceMode(v => !v)}
          />
          <DyspraxiaProgressBar current={currentIdx} total={steps.length} />
          <div style={{ ...wide, flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
            {steps.map((s, i) => (
              <DyspraxiaStepCard
                key={i}
                step={s}
                index={i}
                status={i < currentIdx ? 'done' : i === currentIdx ? 'active' : 'pending'}
              />
            ))}
            {voiceMode && <VoiceIndicator processing={voiceProcessing} commands={['e.g. "let\'s start", "read all steps"', '"help" — list commands']} />}
            <div style={{ marginTop: 8 }}>
              <BigBtn label="Start current step" onClick={startCurrentStep} />
            </div>
          </div>
        </div>
      )}

      {/* ── STEP ── */}
      {screen === SCREENS.STEP && current && (
        <div className="fadein" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <DyspraxiaTopBar
            eyebrow={`STEP ${currentIdx + 1} OF ${steps.length}`}
            title="Do this one thing"
            subtitle={current.type === 'break' ? 'Movement break — your body needs this' : 'Take your time — no rush'}
            voiceMode={voiceMode} onToggleVoice={() => setVoiceMode(v => !v)}
          />
          <div style={{ ...wide, flex: 1, padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#FAEEDA', border: '2px solid #BA7517', borderRadius: 20, padding: '28px 24px' }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#BA7517', letterSpacing: '0.06em', marginBottom: 12 }}>
                {current.type === 'break' ? 'MOVEMENT BREAK' : 'YOUR CURRENT STEP'}
              </p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 500, color: '#412402', lineHeight: 1.4, marginBottom: 10 }}>
                {current.step}
              </p>
              <p style={{ fontSize: 14, color: '#BA7517' }}>{current.time}</p>
            </div>
            <BigBtn label="🔊 Read this step out loud" variant="ghost" onClick={() => speakText(current.step)} />
            <DyspraxiaNotice text={current.tip || 'Focus on just this one thing. Nothing else matters right now.'} />
            {voiceMode && (
              <VoiceIndicator processing={voiceProcessing} commands={['e.g. "I\'m done", "can you read that again?", "I need a rest"', '"help" — list commands']} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
              <BigBtn label="Done — next step ✓" onClick={completeStep} />
              <BigBtn label="I need a break first" variant="secondary" onClick={needBreak} />
            </div>
          </div>
        </div>
      )}

      {/* ── BREAK ── */}
      {screen === SCREENS.BREAK && (
        <div className="fadein" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <DyspraxiaTopBar eyebrow="MOVEMENT BREAK" title="Good work" subtitle="Your body needs this — it helps your coordination" voiceMode={voiceMode} onToggleVoice={() => setVoiceMode(v => !v)} />
          <div style={{ ...wide, flex: 1, padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <BreakExercise title="Roll your shoulders back" desc="Slowly roll both shoulders backwards 5 times. Breathe in as they go up, out as they come down." />
            <BreakExercise title="Shake out your hands" desc="Let your hands hang loose and shake gently for 10 seconds. Releases tension in fingers and wrists." />
            <AmbientPlayer />
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 48, fontWeight: 600, color: '#BA7517', textAlign: 'center', margin: '8px 0' }}>
              {timerDisplay}
            </p>
            <DyspraxiaNotice text="Movement breaks help your brain reset — especially important for you" />
            {voiceMode && <VoiceIndicator processing={voiceProcessing} commands={['e.g. "I\'m ready to continue", "let\'s go back"', '"help" — list commands']} />}
            <BigBtn label="I'm ready to continue" onClick={() => advanceAfterBreak()} />
          </div>
        </div>
      )}

      {/* ── DONE ── */}
      {screen === SCREENS.DONE && (
        <div className="fadein" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <DyspraxiaTopBar
            eyebrow="SESSION COMPLETE"
            title="All done!"
            subtitle={`"${taskText.length > 50 ? taskText.slice(0, 50) + '...' : taskText}"`}
            voiceMode={voiceMode} onToggleVoice={() => setVoiceMode(v => !v)}
          />
          <div style={{ ...wide, flex: 1, padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ textAlign: 'center', paddingTop: 12 }}>
              <div style={{
                width: 90, height: 90, borderRadius: '50%', background: '#FAEEDA',
                border: '2.5px solid #BA7517', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 20px', fontSize: 40,
              }}>★</div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 600, marginBottom: 10, color: '#1a1a18' }}>
                You finished it!
              </h2>
              <p style={{ fontSize: 16, color: '#5F5E5A', lineHeight: 1.6 }}>
                You completed all {steps.length} steps. That took real focus and effort — well done.
              </p>
            </div>
            <MoodPicker onSelect={setMood} />
            {voiceMode && <VoiceIndicator processing={voiceProcessing} commands={['e.g. "save my session", "I want to do another task"', '"help" — list commands']} />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <BigBtn label="Save and finish" variant="success" onClick={async () => { await saveSession(); navigate('/dyspraxia') }} />
              <BigBtn label="Start another task" variant="ghost" onClick={reset} />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function DyspraxiaTopBar({ eyebrow, title, subtitle, onChangeExperience, voiceMode, onToggleVoice }) {
  return (
    <div style={{ background: '#BA7517', padding: '20px 22px 18px', position: 'relative' }}>
      {onChangeExperience && (
        <button
          onClick={onChangeExperience}
          style={{
            position: 'absolute', top: 16, right: 20,
            background: 'rgba(255,255,255,0.15)', border: 'none',
            borderRadius: 8, padding: '6px 12px', fontSize: 12,
            fontWeight: 600, color: 'white', cursor: 'pointer',
          }}
        >
          Change experience
        </button>
      )}
      {onToggleVoice && (
        <button
          onClick={onToggleVoice}
          style={{
            position: 'absolute', top: 16, right: onChangeExperience ? 160 : 20,
            background: voiceMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)', border: 'none',
            borderRadius: 8, padding: '6px 12px', fontSize: 12,
            fontWeight: 600, color: voiceMode ? '#BA7517' : 'white', cursor: 'pointer',
          }}
        >
          {voiceMode ? '🎤 Voice ON' : '🎤 Voice'}
        </button>
      )}
      {eyebrow && (
        <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em', marginBottom: 4 }}>
          {eyebrow}
        </p>
      )}
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 600, color: 'white', lineHeight: 1.2 }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{subtitle}</p>
      )}
    </div>
  )
}

function DyspraxiaProgressBar({ current, total }) {
  const pct = total ? Math.round((current / total) * 100) : 0
  return (
    <div style={{ background: '#FAEEDA', padding: '10px 22px', borderBottom: '1px solid #FAC775', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 6, background: 'rgba(186,117,23,0.2)', borderRadius: 99, overflow: 'hidden' }}>
        <div className="progress-fill" style={{ height: '100%', width: pct + '%', background: '#BA7517', borderRadius: 99 }} />
      </div>
      <p style={{ fontSize: 12, fontWeight: 500, color: '#633806', whiteSpace: 'nowrap' }}>{current} of {total}</p>
    </div>
  )
}

function DyspraxiaStepCard({ step, index, status }) {
  const isDone = status === 'done'
  const isActive = status === 'active'
  const numStyle = {
    done:    { background: '#E1F5EE', color: '#1D9E75' },
    active:  { background: '#BA7517', color: 'white' },
    pending: { background: '#F5F2EC', color: '#888780' },
  }[status]

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px',
      background: isActive ? '#FAEEDA' : '#FDFAF5',
      border: isActive ? '2px solid #BA7517' : '1px solid rgba(0,0,0,0.08)',
      borderRadius: 16, opacity: isDone ? 0.5 : 1, transition: 'all 0.2s',
    }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 500, flexShrink: 0, ...numStyle }}>
        {isDone ? '✓' : index + 1}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 500, color: isDone ? '#888780' : '#1a1a18', lineHeight: 1.4, textDecoration: isDone ? 'line-through' : 'none' }}>
          {step.step}
        </p>
        <p style={{ fontSize: 12, marginTop: 3, color: isDone ? '#1D9E75' : isActive ? '#BA7517' : '#888780', fontWeight: isActive || isDone ? 500 : 400 }}>
          {isDone ? 'Done' : isActive ? 'Now · ' + step.time : step.time}
        </p>
      </div>
    </div>
  )
}

function VoiceIndicator({ commands, processing }) {
  return (
    <div style={{ background: processing ? '#FFF3DC' : '#FAEEDA', border: `1px solid ${processing ? '#BA7517' : '#FAC775'}`, borderRadius: 12, padding: '12px 16px', transition: 'background 0.2s' }}>
      {processing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="spinner" style={{ width: 14, height: 14, border: '2px solid #FAC775', borderTopColor: '#BA7517', borderRadius: '50%', flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: '#633806', margin: 0, fontWeight: 600 }}>Understanding what you said…</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13, color: '#633806', margin: '0 0 6px', fontWeight: 600 }}>🎤 Listening — speak naturally</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
            {commands.map(cmd => (
              <span key={cmd} style={{ fontSize: 12, color: '#BA7517' }}>{cmd}</span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function DyspraxiaNotice({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#F5F2EC', borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#BA7517', flexShrink: 0, marginTop: 5 }} />
      <p style={{ fontSize: 13, color: '#5F5E5A', lineHeight: 1.5 }}>{text}</p>
    </div>
  )
}

const AMBIENT_TRACKS = [
  { key: 'rain',   label: 'Gentle Rain',   emoji: '🌧️', url: 'https://assets.mixkit.co/active_storage/sfx/2395/2395-preview.mp3' },
  { key: 'forest', label: 'Forest Sounds', emoji: '🌿', url: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3' },
  { key: 'piano',  label: 'Soft Piano',    emoji: '🎵', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
]

function AmbientPlayer() {
  const [playing, setPlaying] = useState(null)
  const audioRef = useRef(null)
  const toggle = (track) => {
    if (playing === track.key) {
      audioRef.current?.pause(); setPlaying(null)
    } else {
      audioRef.current?.pause()
      audioRef.current = new Audio(track.url)
      audioRef.current.loop = true; audioRef.current.volume = 0.4
      audioRef.current.play()
      setPlaying(track.key)
    }
  }
  useEffect(() => () => audioRef.current?.pause(), [])
  return (
    <div style={{ background: '#FDFAF5', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: '14px 16px' }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: '#888780', letterSpacing: '0.07em', marginBottom: 10 }}>RELAXING SOUNDS FOR YOUR BREAK</p>
      <div style={{ display: 'flex', gap: 8 }}>
        {AMBIENT_TRACKS.map(t => (
          <button key={t.key} onClick={() => toggle(t)} style={{
            flex: 1, padding: '12px 6px', borderRadius: 12, cursor: 'pointer',
            background: playing === t.key ? '#FAEEDA' : 'white',
            border: `1.5px solid ${playing === t.key ? '#BA7517' : 'rgba(0,0,0,0.1)'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            fontFamily: 'inherit', transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: 20 }}>{t.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: playing === t.key ? '#633806' : '#5F5E5A' }}>{t.label}</span>
            <span style={{ fontSize: 14, color: playing === t.key ? '#BA7517' : '#888780' }}>{playing === t.key ? '⏸' : '▶'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function BreakExercise({ title, desc }) {
  return (
    <div style={{ background: '#FAEEDA', border: '1px solid #FAC775', borderRadius: 16, padding: '20px 20px' }}>
      <p style={{ fontSize: 17, fontWeight: 500, color: '#633806', marginBottom: 8 }}>{title}</p>
      <p style={{ fontSize: 14, color: '#BA7517', lineHeight: 1.6 }}>{desc}</p>
    </div>
  )
}

function MoodPicker({ onSelect }) {
  const [selected, setSelected] = useState(null)
  const moods = ['Really good', 'Okay', 'Hard work', 'Drained', 'Proud', 'Relieved']
  function pick(mood) { setSelected(mood); onSelect?.(mood) }
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 500, color: '#888780', letterSpacing: '0.06em', marginBottom: 10 }}>HOW DID THAT FEEL?</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {moods.map(mood => (
          <button key={mood} onClick={() => pick(mood)} style={{
            padding: '14px 8px', borderRadius: 14,
            border: selected === mood ? '1.5px solid #BA7517' : '1px solid rgba(0,0,0,0.1)',
            background: selected === mood ? '#FAEEDA' : '#FDFAF5',
            fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
            color: selected === mood ? '#633806' : '#5F5E5A',
            cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
          }}>
            {mood}
          </button>
        ))}
      </div>
    </div>
  )
}

function BigBtn({ label, onClick, variant = 'primary', disabled = false }) {
  const styles = {
    primary:   { background: '#BA7517', color: 'white', border: 'none' },
    secondary: { background: '#FAEEDA', color: '#633806', border: '1.5px solid #FAC775' },
    ghost:     { background: '#F5F2EC', color: '#5F5E5A', border: '1px solid rgba(0,0,0,0.1)' },
    success:   { background: '#1D9E75', color: 'white', border: 'none' },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'block', width: '100%', padding: '18px 20px', borderRadius: 16,
        fontSize: 16, fontWeight: 500, fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'center', lineHeight: 1.3,
        opacity: disabled ? 0.4 : 1,
        transition: 'transform 0.12s, opacity 0.12s',
        ...styles[variant],
      }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)' }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      {label}
    </button>
  )
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
      <span style={{ fontSize: 13, color: '#888780' }}>or type instead</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
    </div>
  )
}
