'use client'

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import './PlayerSeat.css'

function PlayerSeat({
  player,
  seatNumber,
  isCurrentUser,
  isEmpty,
  showStatus = false
}) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
  const seatRef = useRef(null)

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
        return '#666' // Gray
    }
  }

  // Format leader aspects for tooltip
  const formatLeaderWithAspects = (leader) => {
    if (!leader.aspects || leader.aspects.length === 0) {
      return leader.name
    }
    return `${leader.name} (${leader.aspects.join('/')})`
  }

  const handleMouseEnter = () => {
    if (seatRef.current) {
      const rect = seatRef.current.getBoundingClientRect()
      setTooltipPos({
        top: rect.top - 10,
        left: rect.left + rect.width / 2
      })
    }
    setShowTooltip(true)
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

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

  const draftedLeaders = player.draftedLeaders || []
  const hasLeaders = draftedLeaders.length > 0
  const displayName = isCurrentUser ? 'You' : player.username || `Player ${seatNumber}`

  // Render tooltip via portal to escape all stacking contexts
  const renderTooltip = () => {
    if (!showTooltip || isCurrentUser || typeof document === 'undefined') return null

    return createPortal(
      <div
        className="player-tooltip-portal"
        style={{
          position: 'fixed',
          top: tooltipPos.top,
          left: tooltipPos.left,
          transform: 'translate(-50%, -100%)',
          zIndex: 999999,
          pointerEvents: 'none'
        }}
      >
        <div
          className="tooltip-content"
          style={{
            background: '#1e1e1e',
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '10px 12px',
            minWidth: '180px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)'
          }}
        >
          <div className="tooltip-username">{player.username}</div>
          {hasLeaders && (
            <>
              <div className="tooltip-header">Leaders</div>
              {draftedLeaders.map((leader, idx) => (
                <div key={idx} className="tooltip-leader">
                  {formatLeaderWithAspects(leader)}
                </div>
              ))}
            </>
          )}
        </div>
      </div>,
      document.body
    )
  }

  return (
    <>
      <div
        ref={seatRef}
        className={`player-seat ${isCurrentUser ? 'current-user' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="seat-avatar"
          style={{
            borderColor: showStatus ? getStatusColor(player.pickStatus) : undefined
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
        </div>
        <div className="seat-name">{displayName}</div>
        {showStatus && (
          <div
            className="seat-status"
            style={{ color: getStatusColor(player.pickStatus) }}
          >
            {player.pickStatus === 'picked' ? 'Done' : 'Picking...'}
          </div>
        )}
      </div>
      {renderTooltip()}
    </>
  )
}

export default PlayerSeat
