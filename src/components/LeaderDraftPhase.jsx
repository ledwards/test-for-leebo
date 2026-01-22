'use client'

import { useState, useRef } from 'react'
import PlayerCircle from './PlayerCircle'
import DraftableCard from './DraftableCard'
import PassDirectionArrow from './PassDirectionArrow'

import TimerPanel from './TimerPanel'
import DraftReviewModal from './DraftReviewModal'
import './LeaderDraftPhase.css'

const ReviewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
)

function LeaderDraftPhase({
  draft,
  players,
  myPlayer,
  draftState,
  onPick,
  loading,
  error,
  isHost,
  onTogglePause,
}) {

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [hoveredLeaderPreview, setHoveredLeaderPreview] = useState(null)
  const previewTimeoutRef = useRef(null)

  const handleLeaderNameMouseEnter = (e, leader) => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current)
    }
    const rect = e.currentTarget.getBoundingClientRect()
    previewTimeoutRef.current = setTimeout(() => {
      // Calculate preview width based on whether leader has back image
      const hasBackImage = leader.backImageUrl
      const previewWidth = hasBackImage ? 504 + 360 + 20 : 504
      const previewHeight = hasBackImage ? 504 : 360

      let previewX = rect.right + 20
      let previewY = rect.top + rect.height / 2

      // Ensure preview stays within viewport horizontally
      if (previewX + previewWidth > window.innerWidth) {
        previewX = rect.left - previewWidth - 20
        if (previewX < 0) {
          previewX = 10
        }
      }

      // Ensure preview stays within viewport vertically
      const previewTop = previewY - previewHeight / 2
      const previewBottom = previewY + previewHeight / 2
      if (previewTop < 10) {
        previewY = previewHeight / 2 + 10
      } else if (previewBottom > window.innerHeight - 10) {
        previewY = window.innerHeight - previewHeight / 2 - 10
      }

      setHoveredLeaderPreview({ leader, x: previewX, y: previewY })
    }, 500)
  }

  const handleLeaderNameMouseLeave = () => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current)
    }
    setHoveredLeaderPreview(null)
  }

  const leaders = myPlayer?.leaders || []
  const draftedLeaders = myPlayer?.draftedLeaders || []
  const canPick = myPlayer?.pickStatus === 'picking' && leaders.length > 0
  const round = draftState?.leaderRound || 1

  const handleCardClick = (card) => {
    if (!canPick || loading) return
    onPick(card.id)
  }

  const handleCardRightClick = (e) => {
    e.preventDefault()
  }

  // Leader draft: round 1 passes right, round 2 passes left, round 3 no passing
  const passDirection = round === 1 ? 'right' : round === 2 ? 'left' : null

  return (
    <div className="leader-draft-phase">
      <div className="draft-layout">
        <div className="players-section">
          <PlayerCircle
            players={players}
            maxPlayers={draft?.maxPlayers || 8}
            currentUserId={myPlayer?.id}
            showStatus={true}
            draft={draft}
            showTimers={true}
            hideEmptySeats={true}
            isHost={isHost}
            onTogglePause={onTogglePause}
          />
          {passDirection && <PassDirectionArrow direction={passDirection} />}
        </div>

        <div className="cards-section">
          <div className="draft-info-header">
            <div className="my-leaders-info">
              <span className="info-label">Your Leaders:</span>
              {draftedLeaders.length > 0 ? (
                <span className="info-value">
                  {draftedLeaders.map((l, idx) => (
                    <span
                      key={idx}
                      className="leader-name-hoverable"
                      onMouseEnter={(e) => handleLeaderNameMouseEnter(e, l)}
                      onMouseLeave={handleLeaderNameMouseLeave}
                    >
                      {l.name}
                      {idx < draftedLeaders.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="info-value">None</span>
              )}
            </div>
            <div className="draft-progress-info">
              <span className="progress-item">
                <span className="info-label">Leaders:</span>
                <span className="info-value">{draftedLeaders.length}/3</span>
              </span>
              <button className="review-button" onClick={() => setShowReviewModal(true)}>
                <ReviewIcon />
                <span>Review</span>
              </button>
            </div>
          </div>

          <div className="drafted-leaders">
            <h3>Your Drafted Leaders ({draftedLeaders.length}/3)</h3>
            <div className="drafted-leaders-grid">
              {draftedLeaders.map((leader, idx) => (
                <DraftableCard
                  key={idx}
                  card={leader}
                  disabled={true}
                />
              ))}
              {Array(3 - draftedLeaders.length)
                .fill(null)
                .map((_, idx) => (
                  <div key={`empty-${idx}`} className="drafted-leader empty">
                    <span>?</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="available-leaders">
            <h3>
              {canPick
                ? (round === 3 ? 'Confirm Your Final Leader' : 'Select a Leader')
                : 'Waiting for pick...'}
            </h3>
            {leaders.length > 0 ? (
              <div className="leaders-grid">
                {leaders.map((leader) => (
                  <DraftableCard
                    key={leader.id}
                    card={leader}
                    onClick={() => handleCardClick(leader)}
                    onRightClick={(e) => handleCardRightClick(e, leader)}
                    disabled={!canPick || loading}
                    selected={false}
                  />
                ))}
              </div>
            ) : (
              <p className="no-leaders">
                {myPlayer?.pickStatus === 'picked'
                  ? 'Waiting for other players...'
                  : 'No leaders available'}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && <div className="phase-error">{error}</div>}



      {showReviewModal && (
        <DraftReviewModal
          draftedCards={[]}
          draftedLeaders={draftedLeaders}
          packSize={0}
          draft={draft}
          players={players}
          onClose={() => setShowReviewModal(false)}
        />
      )}

      {hoveredLeaderPreview && (() => {
        const leader = hoveredLeaderPreview.leader
        const hasBackImage = leader.backImageUrl
        const previewWidth = hasBackImage ? 504 + 360 + 20 : 504
        const previewHeight = hasBackImage ? 504 : 360

        return (
          <div
            className="card-preview-enlarged"
            style={{
              position: 'fixed',
              left: `${hoveredLeaderPreview.x}px`,
              top: `${hoveredLeaderPreview.y}px`,
              zIndex: 10000,
              pointerEvents: 'none',
              transform: 'translateY(-50%)',
              width: `${previewWidth}px`,
              height: `${previewHeight}px`,
            }}
          >
            {hasBackImage ? (
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {/* Front - horizontal */}
                <div style={{
                  width: '504px',
                  height: '360px',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}>
                  <img
                    src={leader.imageUrl}
                    alt={leader.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
                {/* Back - vertical */}
                <div style={{
                  width: '360px',
                  height: '504px',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}>
                  <img
                    src={leader.backImageUrl}
                    alt={`${leader.name} - Back`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            ) : (
              <img
                src={leader.imageUrl}
                alt={leader.name}
                style={{
                  width: '504px',
                  height: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
              />
            )}
          </div>
        )
      })()}
    </div>
  )
}

export default LeaderDraftPhase
