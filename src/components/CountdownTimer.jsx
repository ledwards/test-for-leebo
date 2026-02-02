'use client'

import { useState, useEffect, useRef } from 'react'
import './CountdownTimer.css'

/**
 * Countdown timer that shows remaining time
 * @param {number} totalSeconds - Total seconds for the timer
 * @param {string} startedAt - ISO timestamp when the timer started
 * @param {number} warningThreshold - Seconds at which to show warning (red/flash)
 * @param {boolean} active - Whether the timer is active
 * @param {string} label - Label to show before the timer
 * @param {boolean} paused - Whether the timer is paused
 * @param {number} pausedDurationSeconds - Total seconds the timer has been paused
 * @param {function} onExpire - Callback when timer expires (reaches 0)
 */
function CountdownTimer({
  totalSeconds,
  startedAt,
  warningThreshold = 30,
  active = true,
  label,
  compact = false,
  paused = false,
  pausedDurationSeconds = 0,
  onExpire,
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds)
  const hasExpiredRef = useRef(false)

  // Reset expired flag when timer restarts (new startedAt)
  useEffect(() => {
    hasExpiredRef.current = false
  }, [startedAt])

  useEffect(() => {
    if (!active || !startedAt) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setRemainingSeconds(totalSeconds)
      return
    }

    const calculateRemaining = () => {
      const startTime = new Date(startedAt).getTime()
      const now = Date.now()
      const timeSinceStart = Math.floor((now - startTime) / 1000)

      // If pausedDurationSeconds exceeds time since pick started, it's stale data
      // from before a turn advance - ignore it
      const effectivePausedDuration = pausedDurationSeconds > timeSinceStart ? 0 : pausedDurationSeconds
      const elapsed = timeSinceStart - effectivePausedDuration
      const remaining = Math.max(0, totalSeconds - elapsed)
      setRemainingSeconds(remaining)

      // Call onExpire callback when timer hits 0 (only once per timer period)
      if (remaining === 0 && !hasExpiredRef.current && onExpire) {
        hasExpiredRef.current = true
        onExpire()
      }
    }

    // Calculate immediately
    calculateRemaining()

    // Only update every second if not paused
    if (!paused) {
      const interval = setInterval(calculateRemaining, 1000)
      return () => clearInterval(interval)
    }
  }, [totalSeconds, startedAt, active, paused, pausedDurationSeconds, onExpire])

  const isWarning = remainingSeconds <= warningThreshold && remainingSeconds > 0
  const isCaution = remainingSeconds <= totalSeconds * 0.5 && remainingSeconds > warningThreshold
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
    <div className={`countdown-timer ${isExpired ? 'expired' : isWarning ? 'warning' : isCaution ? 'caution' : ''} ${compact ? 'compact' : ''}`}>
      {label && <span className="timer-label">{label}</span>}
      <span className="timer-value">{formatTime(remainingSeconds)}</span>
    </div>
  )
}

export default CountdownTimer
