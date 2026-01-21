'use client'

import { useMemo } from 'react'
import CountdownTimer from './CountdownTimer'
import './TimerPanel.css'

/**
 * Timer panel shown during active drafting
 * Shows either pick timeout or last player timer (only one at a time)
 */
function TimerPanel({ draft, players = [], compact = false }) {
  // Calculate if only one player left to pick (for last player timer)
  const playersStillPicking = players.filter(p => p.pickStatus === 'picking').length
  const isLastPlayer = playersStillPicking === 1

  // Timer settings
  const pickTimeoutSeconds = draft?.pickTimeoutSeconds || 120
  const lastPlayerTimerSeconds = draft?.timerSeconds || 30
  const pickStartedAt = draft?.pickStartedAt
  const isDrafting = draft?.status === 'active'
  const isTimed = draft?.timed !== false

  // Calculate remaining time on main timer and determine which timer to show
  // This uses a state value that gets updated periodically instead of calling Date.now() during render
  const showLastPlayerTimer = useMemo(() => {
    if (!isLastPlayer || !pickStartedAt || !isDrafting) return false
    // The CountdownTimer component handles the actual time calculation with its own effect
    // We just need to know if we should show it
    return true
  }, [isLastPlayer, pickStartedAt, isDrafting])

  if (!isDrafting || !isTimed) return null

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
        />
      ) : (
        <CountdownTimer
          label={compact ? "Pick" : "Pick Timeout:"}
          totalSeconds={pickTimeoutSeconds}
          startedAt={pickStartedAt}
          warningThreshold={30}
          active={isDrafting}
          compact={compact}
        />
      )}
    </div>
  )
}

export default TimerPanel
