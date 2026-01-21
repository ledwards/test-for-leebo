'use client'

import { useMemo } from 'react'
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
 * Shows either pick timeout or last player timer (only one at a time)
 */
function TimerPanel({ draft, players = [], compact = false, isHost = false, onTogglePause }) {
  // Calculate if only one player left to pick (for last player timer)
  const playersStillPicking = players.filter(p => p.pickStatus === 'picking').length
  const isLastPlayer = playersStillPicking === 1

  // Timer settings
  const pickTimeoutSeconds = draft?.pickTimeoutSeconds || 120
  const lastPlayerTimerSeconds = draft?.timerSeconds || 30
  const pickStartedAt = draft?.pickStartedAt
  const isDrafting = draft?.status === 'active'
  const isTimed = draft?.timed !== false
  const isPaused = draft?.paused === true
  const pausedDurationSeconds = draft?.pausedDurationSeconds || 0

  // Calculate remaining time on main timer and determine which timer to show
  // This uses a state value that gets updated periodically instead of calling Date.now() during render
  const showLastPlayerTimer = useMemo(() => {
    if (!isLastPlayer || !pickStartedAt || !isDrafting) return false
    // The CountdownTimer component handles the actual time calculation with its own effect
    // We just need to know if we should show it
    return true
  }, [isLastPlayer, pickStartedAt, isDrafting])

  if (!isDrafting || !isTimed) return null

  // Show paused state
  if (isPaused) {
    return (
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
    )
  }

  return (
    <div className={`timer-panel ${compact ? 'compact' : ''}`}>
      {showLastPlayerTimer ? (
        <CountdownTimer
          label={compact ? "Last Player" : "Last Player:"}
          totalSeconds={lastPlayerTimerSeconds}
          startedAt={pickStartedAt}
          warningThreshold={10}
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
  )
}

export default TimerPanel
