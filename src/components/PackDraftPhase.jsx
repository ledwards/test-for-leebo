'use client'

import { useState, useRef } from 'react'
import PlayerCircle from './PlayerCircle'
import DraftableCard from './DraftableCard'
import PassDirectionArrow from './PassDirectionArrow'

import TimerPanel from './TimerPanel'
import DraftReviewModal from './DraftReviewModal'
import './PackDraftPhase.css'

const ReviewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
)

function PackDraftPhase({
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
    previewTimeoutRef.current = setTimeout(() => {
      // Static preview in left half of screen
      setHoveredLeaderPreview({ leader, x: null, y: null })
    }, 500)
  }

  const handleLeaderNameMouseLeave = () => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current)
    }
    setHoveredLeaderPreview(null)
  }

  const currentPack = myPlayer?.currentPack || []
  const draftedCards = myPlayer?.draftedCards || []
  const draftedLeaders = myPlayer?.draftedLeaders || []
  const canPick = myPlayer?.pickStatus === 'picking' && currentPack.length > 0

  const packNumber = draftState?.packNumber || 1
  const pickInPack = draftState?.pickInPack || 1

  // Pack draft: pack 1 & 3 pass left, pack 2 passes right
  const passDirection = packNumber % 2 === 1 ? 'left' : 'right'

  // Sort cards by rarity
  const sortCards = (cards) => {
    const sorted = [...cards]
    const rarityOrder = { 'Legendary': 0, 'Rare': 1, 'Uncommon': 2, 'Common': 3 }
    return sorted.sort(
      (a, b) => (rarityOrder[a.rarity] ?? 4) - (rarityOrder[b.rarity] ?? 4)
    )
  }

  const sortedPack = sortCards(currentPack)

  const handleCardClick = (card) => {
    if (!canPick || loading) return
    onPick(card.id)
  }

  const handleCardRightClick = (e) => {
    e.preventDefault()
  }

  return (
    <div className="pack-draft-phase">
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
          <PassDirectionArrow direction={passDirection} />
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
              <span className="progress-item">
                <span className="info-label">Cards:</span>
                <span className="info-value">{draftedCards.length}/{(draft?.packSize || 14) * 3 - 6}</span>
              </span>
              <button className="review-button" onClick={() => setShowReviewModal(true)}>
                <ReviewIcon />
                <span>Review</span>
              </button>
            </div>
          </div>

          <div className="current-pack">
            {sortedPack.length > 0 ? (
              <div className="pack-grid">
                {sortedPack.map((card) => (
                  <DraftableCard
                    key={card.id}
                    card={card}
                    onClick={() => handleCardClick(card)}
                    onRightClick={(e) => handleCardRightClick(e, card)}
                    disabled={!canPick || loading}
                    useStaticPreview={true}
                  />
                ))}
              </div>
            ) : (
              <p className="no-cards">
                {myPlayer?.pickStatus === 'picked'
                  ? 'Waiting for other players to pick...'
                  : 'No cards in pack'}
              </p>
            )}
          </div>


        </div>
      </div>

      {error && <div className="phase-error">{error}</div>}



      {showReviewModal && (
        <DraftReviewModal
          draftedCards={draftedCards}
          draftedLeaders={draftedLeaders}
          packSize={draft?.packSize || 14}
          draft={draft}
          players={players}
          onClose={() => setShowReviewModal(false)}
        />
      )}

      {hoveredLeaderPreview && (() => {
        const leader = hoveredLeaderPreview.leader
        const hasBackImage = leader.backImageUrl

        // Calculate scaled dimensions for static preview
        const scale = 0.6 // Scale down to 60% for dual images
        const scaledFrontWidth = 504 * scale
        const scaledFrontHeight = 360 * scale
        const scaledBackWidth = 360 * scale
        const scaledBackHeight = 504 * scale

        return (
          <div
            className="card-preview-enlarged"
            style={{
              position: 'fixed',
              left: '0',
              top: '0',
              width: '50vw',
              height: '100vh',
              zIndex: 10000,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {hasBackImage ? (
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {/* Front - horizontal */}
                <div style={{
                  width: `${scaledFrontWidth}px`,
                  height: `${scaledFrontHeight}px`,
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
                  width: `${scaledBackWidth}px`,
                  height: `${scaledBackHeight}px`,
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
              <div style={{
                width: `${504 * 1.5}px`,
                height: `${360 * 1.5}px`,
                overflow: 'hidden',
                borderRadius: '24px',
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
            )}
          </div>
        )
      })()}
    </div>
  )
}

export default PackDraftPhase
