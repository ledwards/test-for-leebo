'use client'

import { useState, useEffect } from 'react'
import CountdownTimer from './CountdownTimer'
import './TimerPanel.css'

const PauseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
)

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
)

/**
 * Timer panel shown during active drafting
 * Shows either pick timeout or last player timer (whichever has less time remaining)
 * Both timers can be enabled/disabled independently
 */
function TimerPanel({ draft, players = [], compact = false, isHost = false, onTogglePause }) {
  const [activeTimer, setActiveTimer] = useState('round') // 'round' or 'lastPlayer'

  // Calculate if only one player left to pick (for last player timer)
  const playersStillPicking = players.filter(p => p.pickStatus === 'picking').length
  const isLastPlayer = playersStillPicking === 1

  // Timer settings
  const pickTimeoutSeconds = draft?.pickTimeoutSeconds || 120
  const lastPlayerTimerSeconds = draft?.timerSeconds || 30
  const pickStartedAt = draft?.pickStartedAt
  const isDrafting = draft?.status === 'active'
  const isRoundTimerEnabled = draft?.timed !== false
  const isLastPlayerTimerEnabled = draft?.timerEnabled !== false
  const isPaused = draft?.paused === true
  const pausedDurationSeconds = draft?.pausedDurationSeconds || 0

  // Calculate which timer to show based on remaining time
  useEffect(() => {
    if (!isDrafting || !pickStartedAt) return

    const calculateActiveTimer = () => {
      const startTime = new Date(pickStartedAt).getTime()
      const now = Date.now()
      const timeSinceStart = Math.floor((now - startTime) / 1000)

      // If pausedDurationSeconds exceeds time since pick started, it's stale data - ignore it
      const effectivePausedDuration = pausedDurationSeconds > timeSinceStart ? 0 : pausedDurationSeconds
      const elapsed = timeSinceStart - effectivePausedDuration

      const roundRemaining = isRoundTimerEnabled ? Math.max(0, pickTimeoutSeconds - elapsed) : Infinity
      const lastPlayerRemaining = (isLastPlayerTimerEnabled && isLastPlayer)
        ? Math.max(0, lastPlayerTimerSeconds - elapsed)
        : Infinity

      // Show whichever has less time remaining
      if (lastPlayerRemaining <= roundRemaining && lastPlayerRemaining !== Infinity) {
        setActiveTimer('lastPlayer')
      } else if (roundRemaining !== Infinity) {
        setActiveTimer('round')
      }
    }

    calculateActiveTimer()

    if (!isPaused) {
      const interval = setInterval(calculateActiveTimer, 1000)
      return () => clearInterval(interval)
    }
  }, [isDrafting, pickStartedAt, pausedDurationSeconds, isRoundTimerEnabled, isLastPlayerTimerEnabled, isLastPlayer, pickTimeoutSeconds, lastPlayerTimerSeconds, isPaused])

  // Determine what should be shown
  const showRoundTimer = isRoundTimerEnabled
  const showLastPlayerTimer = isLastPlayerTimerEnabled && isLastPlayer

  // If neither timer should be shown, return null (hides entire container)
  if (!isDrafting || (!showRoundTimer && !showLastPlayerTimer)) return null

  // Determine which timer to display
  const displayLastPlayer = activeTimer === 'lastPlayer' && showLastPlayerTimer

  // Wrapper component - when not compact, include timer-bar wrapper
  const WrapperEl = compact ? 'div' : 'div'
  const wrapperClass = compact ? '' : 'timer-bar'

  // Show paused state
  if (isPaused) {
    return (
      <div className={wrapperClass}>
        <div className={`timer-panel ${compact ? 'compact' : ''} paused`}>
          <div className="paused-display">
            <PauseIcon />
            <span className="paused-text">PAUSED</span>
          </div>
          {isHost && onTogglePause && (
            <button className="pause-button resume" onClick={onTogglePause}>
              <PlayIcon />
              <span>Resume</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      <div className={`timer-panel ${compact ? 'compact' : ''}`}>
        {displayLastPlayer ? (
          <CountdownTimer
            label={compact ? "Last Player" : "Last Player:"}
            totalSeconds={lastPlayerTimerSeconds}
            startedAt={pickStartedAt}
            warningThreshold={30}
            active={true}
            compact={compact}
            paused={isPaused}
            pausedDurationSeconds={pausedDurationSeconds}
          />
        ) : (
          <CountdownTimer
            label={compact ? "Pick" : "Pick Timeout:"}
            totalSeconds={pickTimeoutSeconds}
            startedAt={pickStartedAt}
            warningThreshold={30}
            active={isDrafting}
            compact={compact}
            paused={isPaused}
            pausedDurationSeconds={pausedDurationSeconds}
          />
        )}
        {isHost && onTogglePause && (
          <button className="pause-button" onClick={onTogglePause}>
            <PauseIcon />
          </button>
        )}
      </div>
    </div>
  )
}

export default TimerPanel
