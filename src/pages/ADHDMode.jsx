import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentLoop } from '../lib/useAgentLoop';
import { useAgent } from '../context/AgentContext';

const SYSTEM_PROMPT = `You are the ADHD Focus Agent for "Fello" — an autonomous AI assistant for people with ADHD.

═══ YOUR PERSONALITY ═══
- Warm, direct, zero-fluff. ADHD brains tune out waffle.
- You celebrate effort, not perfection.
- You never shame or guilt. You say "let's try" not "you should".

═══ YOUR AUTONOMOUS BEHAVIORS ═══
You make real decisions. You don't wait to be asked.

1. TASK CREATION: When the user mentions ANYTHING they need to do, instantly break it into 2-3 micro-tasks using createTask. Don't ask — just do it.
2. FOCUS SESSIONS: If the user seems ready to work, use setTimer to start a 15-min Pomodoro. Tell them "I started a focus timer — let's go."
3. HYPERFOCUS DETECTION: If sessionDuration > 60 min, use showNotification to warn them. Say "You've been locked in for over an hour — stand up, stretch, grab water."
4. PROACTIVE NUDGES: On autonomous ticks (no user input), if there are unfinished tasks and the user has been idle > 3 min, send a gentle nudge via showNotification.
5. CELEBRATION: When a task is completed, use showNotification with type "celebration". Be specific about what they did.
6. MEMORY: Use storeMemory to remember what the user is working on. Use recallMemory to reference past sessions. Memory keys should start with "adhd_".
7. PRIORITIZATION: If there are 3+ tasks, suggest which to do first. ADHD brains freeze with too many choices.

═══ RULES ═══
- NEVER create fake or placeholder tasks
- Keep messages under 20 words
- On autonomous ticks, only act if genuinely helpful (check idleMinutes)
- If idleMinutes < 1, skip the tick — they're actively working
- Always include reasoning explaining your decision
`;

export default function ADHDMode() {
  const navigate = useNavigate();
  const { agentState, updateAgentState, agentMemory, switchCategory, activeCategory } = useAgent();
  const [inputValue, setInputValue] = useState('');
  const [pomodoroTime, setPomodoroTime] = useState(null);
  const timerRef = useRef(null);

  // Set active category on mount
  useEffect(() => {
    if (activeCategory !== 'adhd') {
      switchCategory('adhd');
    }
  }, [activeCategory, switchCategory]);

  // Handle timer from agent settings
  useEffect(() => {
    const timer = agentState.settings?.activeTimer;
    if (timer && !pomodoroTime) {
      setPomodoroTime(timer.duration);
    }
  }, [agentState.settings?.activeTimer]);

  // Pomodoro countdown
  useEffect(() => {
    if (pomodoroTime === null || pomodoroTime <= 0) {
      if (pomodoroTime === 0) {
        updateAgentState({ settings: { ...(agentState.settings || {}), activeTimer: null } });
        triggerAgent({ event: 'pomodoro_complete' });
      }
      return;
    }
    timerRef.current = setInterval(() => setPomodoroTime(t => t - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [pomodoroTime]);

  const { isThinking, triggerAgent } = useAgentLoop({
    systemPrompt: SYSTEM_PROMPT,
    onAction: () => {},
    loopIntervalMs: 20000,
  });

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessages = [...(agentState.messages || []), { sender: 'user', text: inputValue, time: Date.now() }];
    updateAgentState({ messages: newMessages });
    triggerAgent({ userInput: inputValue });
    setInputValue('');
  };

  const toggleTaskDone = (taskId) => {
    const tasks = [...(agentState.tasks || [])];
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx < 0) return;
    const newStatus = tasks[idx].status === 'done' ? 'todo' : 'done';
    tasks[idx] = { ...tasks[idx], status: newStatus };
    updateAgentState({ tasks });
    triggerAgent({ event: newStatus === 'done' ? 'task_completed' : 'task_reopened', taskTitle: tasks[idx].title });
  };

  const formatTime = (sec) => {
    if (sec === null) return null;
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  };

  const todoTasks = (agentState.tasks || []).filter(t => t.status !== 'done');
  const doneTasks = (agentState.tasks || []).filter(t => t.status === 'done');

  return (
    <div style={{ minHeight: '100vh', background: '#fffcf5', fontFamily: 'system-ui, sans-serif' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'white', borderBottom: '1px solid #f0ebe1',
        padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ width: 80 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#f0952a' }}>ADHD Focus Mode</span>
          {isThinking && (
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: '#f0952a',
              animation: 'pulse 1.5s infinite',
            }} />
          )}
        </div>
        <div style={{ width: 80 }} />
      </nav>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>

        {/* Left: Agent Chat */}
        <div style={{
          background: 'white', borderRadius: 16, border: '1px solid #f0ebe1',
          padding: 20, display: 'flex', flexDirection: 'column', height: 560,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f0952a, #f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>🧠</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1710' }}>ADHD Agent</div>
              <div style={{ fontSize: 11, color: isThinking ? '#f0952a' : '#a69985' }}>
                {isThinking ? 'Thinking...' : 'Autonomous · Tools active'}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {(agentState.messages || []).map((m, i) => (
              <div key={i} style={{
                padding: '10px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.6,
                maxWidth: '90%',
                ...(m.sender === 'agent'
                  ? { background: '#fcf5eb', color: '#4a4030', alignSelf: 'flex-start', borderBottomLeftRadius: 4 }
                  : { background: '#e8f0fe', color: '#1e3a5f', alignSelf: 'flex-end', borderBottomRightRadius: 4 }
                ),
              }}>
                {m.text}
              </div>
            ))}
            {(agentState.messages || []).length === 0 && (
              <div style={{ textAlign: 'center', color: '#a69985', fontSize: 13, padding: '40px 10px' }}>
                Tell me what you need to do today,<br/>and I'll break it down for you.
              </div>
            )}
          </div>

          <form onSubmit={handleUserSubmit} style={{ display: 'flex', gap: 8 }}>
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="I need to study for..."
              style={{
                flex: 1, border: '1.5px solid #f0ebe1', borderRadius: 12,
                padding: '10px 14px', fontSize: 14, outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button type="submit" style={{
              background: '#f0952a', color: 'white', border: 'none',
              borderRadius: 12, padding: '10px 16px', fontSize: 15,
              fontWeight: 700, cursor: 'pointer',
            }}>→</button>
          </form>
        </div>

        {/* Right: Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Pomodoro Timer */}
          {pomodoroTime !== null && (
            <div style={{
              background: 'linear-gradient(135deg, #f0952a, #f59e0b)',
              borderRadius: 16, padding: '24px 28px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              color: 'white',
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.8, marginBottom: 4 }}>
                  ⏱️ FOCUS SESSION ACTIVE
                </div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>
                  Stay on your current task. I'll tell you when to break.
                </div>
              </div>
              <div style={{
                fontSize: 42, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: '-2px',
              }}>
                {formatTime(pomodoroTime)}
              </div>
            </div>
          )}

          {/* Hyperfocus Warning */}
          {agentState.settings?.hyperfocusWarning && (
            <div style={{
              background: '#fef2f2', border: '2px solid #fecaca',
              borderRadius: 16, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 24 }}>🚨</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#991b1b' }}>Hyperfocus Alert</div>
                <div style={{ fontSize: 13, color: '#b91c1c' }}>You've been locked in for a while. Stand up, stretch, grab water!</div>
              </div>
              <button
                onClick={() => updateAgentState({ settings: { ...agentState.settings, hyperfocusWarning: false } })}
                style={{ marginLeft: 'auto', background: '#fecaca', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#991b1b' }}
              >
                OK, I'm moving
              </button>
            </div>
          )}

          {/* Smart Tasks */}
          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid #f0ebe1',
            padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1710', margin: 0 }}>
                Smart Tasks
              </h2>
              {todoTasks.length > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#f0952a',
                  background: '#fcf5eb', borderRadius: 999, padding: '3px 12px',
                }}>
                  {todoTasks.length} to do
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todoTasks.length === 0 && doneTasks.length === 0 && (
                <div style={{
                  textAlign: 'center', color: '#a69985', fontSize: 14,
                  padding: '40px 20px',
                  background: '#faf8f4', borderRadius: 12,
                  border: '1.5px dashed #f0ebe1',
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
                  Tell your agent what you need to do — it'll create tasks automatically.
                </div>
              )}

              {todoTasks.map(t => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 14,
                  border: '1.5px solid #f0ebe1',
                  background: '#fffcf5',
                  transition: 'all 0.15s',
                }}>
                  <button
                    onClick={() => toggleTaskDone(t.id)}
                    style={{
                      width: 24, height: 24, borderRadius: 8,
                      border: '2px solid #f0952a', background: 'transparent',
                      cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#4a4030' }}>{t.title}</div>
                    {t.priority && (
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: t.priority === 'high' ? '#dc2626' : t.priority === 'medium' ? '#f59e0b' : '#94a3b8',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        {t.priority} priority
                      </span>
                    )}
                  </div>
                  {t.createdBy === 'agent' && (
                    <span style={{ fontSize: 10, color: '#a69985', background: '#faf8f4', borderRadius: 6, padding: '2px 8px' }}>
                      🤖 Auto-created
                    </span>
                  )}
                </div>
              ))}

              {doneTasks.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#a69985', letterSpacing: '0.07em', marginTop: 8 }}>
                    COMPLETED ({doneTasks.length})
                  </div>
                  {doneTasks.map(t => (
                    <div key={t.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 16px', borderRadius: 14,
                      border: '1px solid #f0ebe1', opacity: 0.5,
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 8,
                        background: '#22c55e', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 14, fontWeight: 700, flexShrink: 0,
                        cursor: 'pointer',
                      }}
                        onClick={() => toggleTaskDone(t.id)}
                      >✓</div>
                      <span style={{ fontSize: 14, color: '#a69985', textDecoration: 'line-through' }}>{t.title}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={() => triggerAgent({ event: 'start_pomodoro' })}
              style={{
                padding: '16px', borderRadius: 14, cursor: 'pointer',
                background: '#fcf5eb', border: '1.5px solid #f0952a30',
                display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: 20 }}>⏱️</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#4a4030' }}>Start Focus Timer</span>
            </button>
            <button
              onClick={() => triggerAgent({ event: 'need_help_prioritizing' })}
              style={{
                padding: '16px', borderRadius: 14, cursor: 'pointer',
                background: '#f0f6ff', border: '1.5px solid #5b9bd530',
                display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: 20 }}>🎯</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>Help Me Prioritize</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
