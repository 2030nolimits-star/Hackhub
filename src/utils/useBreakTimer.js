import { useState, useEffect, useRef } from 'react'

export function useBreakTimer(seconds = 120, onComplete) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  function start() {
    setRemaining(seconds)
    setRunning(true)
  }

  function stop() {
    clearInterval(intervalRef.current)
    setRunning(false)
  }

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  const minutes = Math.floor(remaining / 60)
  const secs = remaining % 60
  const display = `${minutes}:${String(secs).padStart(2, '0')}`

  return { display, remaining, running, start, stop }
}
