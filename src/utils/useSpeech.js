import { useState, useRef } from 'react'

export function useSpeechInput(onTranscript) {
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef(null)

  function start() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Voice not supported in this browser. Please type your task instead.'); return }

    const r = new SR()
    r.continuous = false
    r.interimResults = true
    r.lang = 'en-GB'

    r.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('')
      onTranscript(transcript)
    }
    r.onend = () => setIsRecording(false)
    r.onerror = () => setIsRecording(false)

    r.start()
    recognitionRef.current = r
    setIsRecording(true)
  }

  function stop() {
    try { recognitionRef.current?.stop() } catch (e) {}
    setIsRecording(false)
  }

  function toggle() {
    isRecording ? stop() : start()
  }

  return { isRecording, toggle, stop }
}

export function speakText(text, rate = 0.9) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = rate
  u.pitch = 1.0
  window.speechSynthesis.speak(u)
}
