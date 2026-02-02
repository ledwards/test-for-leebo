'use client'

import { memo } from 'react'
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
    <div className={`player-seat ${isCurrentUser ? 'current-user' : ''}`}>
      <div
        className="seat-avatar"
        style={{ borderColor }}
      >
        {player.avatarUrl ? (
          <img src={player.avatarUrl} alt={player.username} />
        ) : (
          <span>{player.username?.[0]?.toUpperCase() || '?'}</span>
        )}
        {showStatus && player.pickStatus === 'picked' && (
          <div className="status-check">✓</div>
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

export default memo(PlayerSeat)
