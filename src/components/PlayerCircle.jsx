'use client'

import PlayerSeat from './PlayerSeat'
import TimerPanel from './TimerPanel'
import './PlayerCircle.css'

/**
 * Circular layout for draft players
 * Current user is always at the bottom (6 o'clock)
 * Other players arranged clockwise from bottom-left
 */
function PlayerCircle({ players, maxPlayers = 8, currentUserId, showStatus = false, draft, showTimers = false, enableTooltip = true, hideEmptySeats = false, isHost = false, onTogglePause }) {
  // Find current user's seat
  const currentUser = players.find(p => p.id === currentUserId)
  const userSeat = currentUser?.seatNumber || 1

  // Create array of seats (filled or empty)
  let seats = []
  for (let i = 1; i <= maxPlayers; i++) {
    const player = players.find(p => p.seatNumber === i)
    seats.push({
      seatNumber: i,
      player,
      isCurrentUser: player?.id === currentUserId,
    })
  }

  // Filter to only filled seats if hideEmptySeats is true
  if (hideEmptySeats) {
    seats = seats.filter(seat => seat.player)
  }

  // Calculate position on circle
  // For dynamic positioning, we calculate based on actual number of seats shown
  const getPositionStyle = (index, totalSeats) => {
    // Start from bottom (180 degrees) and go clockwise
    // Current user should be at the bottom
    const currentUserIndex = seats.findIndex(s => s.isCurrentUser)

    // Rotate so current user is at bottom (index 0 position)
    let adjustedIndex = index - currentUserIndex
    if (adjustedIndex < 0) adjustedIndex += totalSeats

    // Calculate angle: start at 180° (bottom), go clockwise
    const angleStep = 360 / totalSeats
    const angle = 180 + (adjustedIndex * angleStep)
    const angleRad = (angle * Math.PI) / 180

    // radius as percentage (42% to keep seats inside container)
    const radius = 42
    const left = 50 + radius * Math.sin(angleRad)
    const top = 50 + radius * Math.cos(angleRad)

    return {
      left: `${left}%`,
      top: `${top}%`
    }
  }

  // Get CSS class for position (only used when not hiding empty seats)
  const getDisplayPosition = (seatNumber) => {
    // Rotate seats so current user is at position 1
    let position = seatNumber - userSeat + 1
    if (position <= 0) position += maxPlayers
    return position
  }

  const getPositionClass = (displayPosition) => {
    return `seat-position-${displayPosition}`
  }

  return (
    <div className="player-circle">
      <div className="circle-container">
        {seats.map((seat, index) => {
          const displayPosition = getDisplayPosition(seat.seatNumber)
          const positionStyle = hideEmptySeats ? getPositionStyle(index, seats.length) : null

          return (
            <div
              key={seat.seatNumber}
              className={`seat-wrapper ${!hideEmptySeats ? getPositionClass(displayPosition) : ''}`}
              style={positionStyle || undefined}
            >
              <PlayerSeat
                player={seat.player}
                seatNumber={seat.seatNumber}
                isCurrentUser={seat.isCurrentUser}
                isEmpty={!seat.player}
                showStatus={showStatus}
                enableTooltip={enableTooltip}
              />
            </div>
          )
        })}

        {/* Center area */}
        <div className={`circle-center ${draft?.paused ? 'paused' : ''}`}>
          {showTimers && draft ? (
            <div className="circle-timers">
              <TimerPanel
                draft={draft}
                players={players}
                compact={true}
                isHost={isHost}
                onTogglePause={onTogglePause}
              />
            </div>
          ) : (
            <div className="center-label">Draft</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlayerCircle
