// @ts-nocheck
'use client'

import { memo } from 'react'
import UserAvatar from './UserAvatar'
import './PlayerSeat.css'

interface Player {
  username?: string
  avatarUrl?: string
  pickStatus?: string
}

export interface PlayerSeatProps {
  player?: Player | null
  seatNumber: number
  isCurrentUser?: boolean
  isEmpty?: boolean
  showStatus?: boolean
  statusColor?: string | null
  isPatron?: boolean
}

function PlayerSeat({
  player,
  seatNumber,
  isCurrentUser,
  isEmpty,
  showStatus = false,
  statusColor = null,
  isPatron = false,
}: PlayerSeatProps) {
  // Status colors
  const getStatusColor = (status?: string): string => {
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

  const displayName = isCurrentUser ? 'You' : player?.username || `Player ${seatNumber}`

  return (
    <div className={`player-seat ${isCurrentUser ? 'current-user' : ''}`}>
      <div
        className="seat-avatar"
        style={{ borderColor }}
      >
        <UserAvatar
          src={player?.avatarUrl}
          alt={player?.username}
          isPatron={isPatron}
          fallback={player?.username?.[0]?.toUpperCase() || '?'}
        />
        {showStatus && player?.pickStatus === 'picked' && (
          <div className="status-check">✓</div>
        )}
      </div>
      {showStatus && (
        <div
          className="seat-status"
          style={{ color: getStatusColor(player?.pickStatus) }}
        >
          {player?.pickStatus === 'picked' ? 'Done' : 'Picking...'}
        </div>
      )}
      <div className="seat-name">{displayName}</div>
    </div>
  )
}

export default memo(PlayerSeat)
