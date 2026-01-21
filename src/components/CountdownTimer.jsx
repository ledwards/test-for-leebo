'use client'

import { useState, useEffect } from 'react'
import './CountdownTimer.css'

/**
 * Countdown timer that shows remaining time
 * @param {number} totalSeconds - Total seconds for the timer
 * @param {string} startedAt - ISO timestamp when the timer started
 * @param {number} warningThreshold - Seconds at which to show warning (red/flash)
 * @param {boolean} active - Whether the timer is active
 * @param {string} label - Label to show before the timer
 */
function CountdownTimer({
  totalSeconds,
  startedAt,
  warningThreshold = 30,
  active = true,
  label,
  compact = false,
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds)

  useEffect(() => {
    if (!active || !startedAt) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setRemainingSeconds(totalSeconds)
      return
    }

    const calculateRemaining = () => {
      const startTime = new Date(startedAt).getTime()
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      const remaining = Math.max(0, totalSeconds - elapsed)
      setRemainingSeconds(remaining)
    }

    // Calculate immediately
    calculateRemaining()

    // Update every second
    const interval = setInterval(calculateRemaining, 1000)

    return () => clearInterval(interval)
  }, [totalSeconds, startedAt, active])

  const isWarning = remainingSeconds <= warningThreshold && remainingSeconds > 0
  const isExpired = remainingSeconds === 0

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!active) {
    return (
      <div className={`countdown-timer inactive ${compact ? 'compact' : ''}`}>
        {label && <span className="timer-label">{label}</span>}
        <span className="timer-value">--</span>
      </div>
    )
  }

  return (
    <div className={`countdown-timer ${isWarning ? 'warning' : ''} ${isExpired ? 'expired' : ''} ${compact ? 'compact' : ''}`}>
      {label && <span className="timer-label">{label}</span>}
      <span className="timer-value">{formatTime(remainingSeconds)}</span>
    </div>
  )
}

export default CountdownTimer
