'use client'

import './PlayerSeat.css'

function PlayerSeat({
  player,
  seatNumber,
  isCurrentUser,
  isEmpty,
  showStatus = false,
  statusColor = null
}) {
  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'picked':
        return '#4CAF50' // Green
      case 'picking':
        return '#FFC107' // Yellow
      case 'timeout':
        return '#F44336' // Red
      default:
        return '#444' // Gray (default border)
    }
  }

  // Use passed statusColor or derive from player status
  const borderColor = statusColor || (player?.pickStatus ? getStatusColor(player.pickStatus) : undefined)

  // Check if player is disconnected
  const isDisconnected = player?.isOnline === false

  if (isEmpty) {
    return (
      <div className="player-seat empty">
        <div className="seat-avatar empty-avatar">
          <span>{seatNumber}</span>
        </div>
        <div className="seat-name">Empty</div>
      </div>
    )
  }

  const displayName = isCurrentUser ? 'You' : player.username || `Player ${seatNumber}`

  return (
    <div className={`player-seat ${isCurrentUser ? 'current-user' : ''} ${isDisconnected ? 'disconnected' : ''}`}>
      <div
        className={`seat-avatar ${isDisconnected ? 'disconnected' : ''}`}
        style={{
          borderColor: isDisconnected ? '#ff4444' : borderColor
        }}
      >
        {player.avatarUrl ? (
          <img src={player.avatarUrl} alt={player.username} />
        ) : (
          <span>{player.username?.[0]?.toUpperCase() || '?'}</span>
        )}
        {showStatus && player.pickStatus === 'picked' && (
          <div className="status-check">✓</div>
        )}
        {isDisconnected && (
          <div className="disconnect-overlay">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        )}
      </div>
      {showStatus && (
        <div
          className="seat-status"
          style={{ color: getStatusColor(player.pickStatus) }}
        >
          {player.pickStatus === 'picked' ? 'Done' : 'Picking...'}
        </div>
      )}
      <div className="seat-name">{displayName}</div>
    </div>
  )
}

export default PlayerSeat
