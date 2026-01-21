'use client'

import PlayerSeat from './PlayerSeat'
import TimerPanel from './TimerPanel'
import './PlayerCircle.css'

/**
 * Circular layout for draft players
 * Current user is always at the bottom (6 o'clock)
 * Other players arranged clockwise from bottom-left
 */
function PlayerCircle({ players, maxPlayers = 8, currentUserId, showStatus = false, draft, showTimers = false }) {
  // Find current user's seat
  const currentUser = players.find(p => p.id === currentUserId)
  const userSeat = currentUser?.seatNumber || 1

  // Create array of seats (filled or empty)
  const seats = []
  for (let i = 1; i <= maxPlayers; i++) {
    const player = players.find(p => p.seatNumber === i)
    seats.push({
      seatNumber: i,
      player,
      isCurrentUser: player?.id === currentUserId,
    })
  }

  // Calculate display positions relative to current user
  // Current user's seat should be at position 1 (bottom center)
  const getDisplayPosition = (seatNumber) => {
    // Rotate seats so current user is at position 1
    let position = seatNumber - userSeat + 1
    if (position <= 0) position += maxPlayers
    return position
  }

  // Get CSS class for position
  const getPositionClass = (displayPosition) => {
    return `seat-position-${displayPosition}`
  }

  return (
    <div className="player-circle">
      <div className="circle-container">
        {seats.map((seat) => {
          const displayPosition = getDisplayPosition(seat.seatNumber)
          return (
            <div
              key={seat.seatNumber}
              className={`seat-wrapper ${getPositionClass(displayPosition)}`}
            >
              <PlayerSeat
                player={seat.player}
                seatNumber={seat.seatNumber}
                isCurrentUser={seat.isCurrentUser}
                isEmpty={!seat.player}
                showStatus={showStatus}
              />
            </div>
          )
        })}

        {/* Center area */}
        <div className="circle-center">
          {showTimers && draft ? (
            <div className="circle-timers">
              <TimerPanel draft={draft} players={players} compact={true} />
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
