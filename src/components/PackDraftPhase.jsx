'use client'

import { useState, useRef, useEffect } from 'react'
import PlayerCircle from './PlayerCircle'
import DraftableCard from './DraftableCard'
import TimerPanel from './TimerPanel'
import DraftReviewModal from './DraftReviewModal'
import { getSingleAspectColor, NO_ASPECT_COLOR } from '../utils/aspectColors'
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
  onSelect,
  loading,
  error,
  isHost,
  onTogglePause,
  shareId,
  onTimerExpire,
}) {

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [hoveredLeaderPreview, setHoveredLeaderPreview] = useState(null)
  const [selectedCardId, setSelectedCardId] = useState(null)
  const [showPassing, setShowPassing] = useState(false)
  const [lastPackSize, setLastPackSize] = useState(0)
  const previewTimeoutRef = useRef(null)
  const passingTimeoutRef = useRef(null)

  const handleLeaderNameMouseEnter = (e, leader) => {
    // Disable hover preview on mobile
    if (window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return
    }

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
  const canSelect = (myPlayer?.pickStatus === 'picking' || myPlayer?.pickStatus === 'selected') && currentPack.length > 0
  const hasSelected = myPlayer?.pickStatus === 'selected'

  const packNumber = draftState?.packNumber || 1
  const pickInPack = draftState?.pickInPack || 1

  // Local selection state, persisted to localStorage
  const storageKey = `draft-selection-${shareId}-pack-${packNumber}-${pickInPack}`

  // Load selection from localStorage on mount and when pick changes
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored && currentPack.some(c => (c.instanceId || c.id) === stored)) {
      setSelectedCardId(stored)
    } else {
      setSelectedCardId(null)
    }
  }, [storageKey, currentPack])

  // Sync localStorage selection with server on mount (in case of refresh)
  // Only re-send if the stored card is still in the current pack
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored && canSelect && myPlayer?.pickStatus === 'picking') {
      // Verify the stored card is still available before re-sending
      const cardStillAvailable = currentPack.some(c => (c.instanceId || c.id) === stored)
      if (cardStillAvailable) {
        onSelect(stored)
      } else {
        // Clear stale selection
        localStorage.removeItem(storageKey)
        setSelectedCardId(null)
      }
    }
  }, []) // Only on mount

  // Clear localStorage when pick advances (currentPack changes)
  useEffect(() => {
    if (myPlayer?.pickStatus === 'picking' && !hasSelected) {
      // New pick started, clear old selection if card no longer in pack
      const stored = localStorage.getItem(storageKey)
      if (stored && !currentPack.some(c => (c.instanceId || c.id) === stored)) {
        localStorage.removeItem(storageKey)
        setSelectedCardId(null)
      }
    }
  }, [currentPack, myPlayer?.pickStatus, hasSelected, storageKey])

  // Clear old pack selections when pack/pick changes
  useEffect(() => {
    // Clean up selections from previous picks in localStorage
    // This prevents stale selections from being re-sent after pause/unpause
    const keysToCheck = []
    for (let p = 1; p <= 3; p++) {
      for (let pick = 1; pick <= 16; pick++) {
        const key = `draft-selection-${shareId}-pack-${p}-${pick}`
        if (key !== storageKey) {
          keysToCheck.push(key)
        }
      }
    }
    keysToCheck.forEach(key => localStorage.removeItem(key))
  }, [packNumber, pickInPack, shareId, storageKey])

  // Manage "passing" state - show skeleton cards for minimum time
  useEffect(() => {
    const isPicked = hasSelected || myPlayer?.pickStatus === 'picked'

    if (isPicked && currentPack.length > 0) {
      // Start showing passing state
      setShowPassing(true)
      setLastPackSize(currentPack.length)

      // Clear any existing timeout
      if (passingTimeoutRef.current) {
        clearTimeout(passingTimeoutRef.current)
      }
    } else if (!isPicked && showPassing) {
      // Pick completed, hide after brief delay to ensure smooth transition
      passingTimeoutRef.current = setTimeout(() => {
        setShowPassing(false)
      }, 300)
    }

    return () => {
      if (passingTimeoutRef.current) {
        clearTimeout(passingTimeoutRef.current)
      }
    }
  }, [hasSelected, myPlayer?.pickStatus, currentPack.length, showPassing])

  // Pack draft: pack 1 & 3 pass left, pack 2 passes right
  const passDirection = packNumber % 2 === 1 ? 'left' : 'right'

  // Sort cards by rarity (common first, then uncommon, rare, legendary), foil always last
  const sortCards = (cards) => {
    const sorted = [...cards]
    const rarityOrder = { 'Common': 0, 'Uncommon': 1, 'Rare': 2, 'Legendary': 3 }
    return sorted.sort((a, b) => {
      // Foils always go last
      if (a.isFoil && !b.isFoil) return 1
      if (!a.isFoil && b.isFoil) return -1
      // Then sort by rarity
      return (rarityOrder[a.rarity] ?? 4) - (rarityOrder[b.rarity] ?? 4)
    })
  }

  const sortedPack = sortCards(currentPack)

  const handleCardClick = (card) => {
    if (loading || !canSelect) return

    const cardId = card.instanceId || card.id

    // Validate card is still in current pack before selecting
    // This prevents race conditions where pack changed between render and click
    const cardStillInPack = currentPack.some(c => (c.instanceId || c.id) === cardId)
    if (!cardStillInPack && selectedCardId !== cardId) {
      console.warn('Card no longer in pack, ignoring click')
      return
    }

    if (selectedCardId === cardId) {
      // Unselect
      localStorage.removeItem(storageKey)
      setSelectedCardId(null)
      onSelect(null)
    } else {
      // Select new card
      localStorage.setItem(storageKey, cardId)
      setSelectedCardId(cardId)
      onSelect(cardId)
    }
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
            passDirection={passDirection}
            showLeaderInfo="simple"
          />
        </div>

        <div className="cards-section">
          {/* Timer bar above pick area - TimerPanel handles its own visibility */}
          <TimerPanel
            draft={draft}
            players={players}
            compact={false}
            isHost={isHost}
            onTogglePause={onTogglePause}
            draftState={draftState}
          />

          <div className="draft-info-header">
            <div className="my-leaders-info">
              <span className="info-label">Your Leaders:</span>
              {draftedLeaders.length > 0 ? (
                <div className="leader-thumbnails">
                  {draftedLeaders.map((l, idx) => (
                    <div
                      key={idx}
                      className="leader-thumbnail"
                      onMouseEnter={(e) => handleLeaderNameMouseEnter(e, l)}
                      onMouseLeave={handleLeaderNameMouseLeave}
                    >
                      <img
                        src={l.imageUrl}
                        alt={l.name}
                        className="leader-thumbnail-img"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <span className="info-value">None</span>
              )}
            </div>
            <div className="draft-progress-info">
              <span className="progress-item">
                <span className="info-label">Cards:</span>
                <span className="info-value">{draftedCards.length}/{(draft?.packSize || 14) * 3}</span>
              </span>
              <button className="review-button" onClick={() => setShowReviewModal(true)}>
                <ReviewIcon />
                <span>Your Cards</span>
              </button>
            </div>
          </div>

          {/* Selection confirmation banner */}
          {selectedCardId && (() => {
            const selectedCard = currentPack.find(c => (c.instanceId || c.id) === selectedCardId)
            if (!selectedCard) return null
            const firstAspect = selectedCard.aspects?.[0]
            const aspectColor = firstAspect ? getSingleAspectColor(firstAspect) : NO_ASPECT_COLOR
            const handleDeselect = () => {
              localStorage.removeItem(storageKey)
              setSelectedCardId(null)
              onSelect(null)
            }
            return (
              <div
                className="selection-confirmation-banner"
                style={{
                  background: `linear-gradient(135deg, ${aspectColor}33 0%, ${aspectColor}22 100%)`,
                  borderColor: aspectColor,
                }}
              >
                <div className="selection-info">
                  <span className="selection-label">Selected:</span>
                  <span className="selection-card-name" style={{ color: aspectColor }}>{selectedCard.name}</span>
                  {selectedCard.subtitle && (
                    <span className="selection-card-subtitle">{selectedCard.subtitle}</span>
                  )}
                </div>
                {hasSelected ? (
                  <div className="selection-status-text">Waiting for other players...</div>
                ) : (
                  <button className="deselect-button" onClick={handleDeselect} title="Deselect">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            )
          })()}

          <div className="current-pack">
            {/* Show skeleton cards when waiting for next pack */}
            {showPassing && (lastPackSize > 0 || currentPack.length > 0) ? (
              <>
                <div className="passing-message">
                  Passing {passDirection === 'left' ? 'Left' : 'Right'}...
                </div>
                <div className="pack-grid">
                  {Array.from({ length: lastPackSize || currentPack.length }).map((_, idx) => (
                    <div key={`skeleton-${idx}`} className="skeleton-card">
                      <div className="skeleton-shimmer"></div>
                    </div>
                  ))}
                </div>
              </>
            ) : sortedPack.length > 0 ? (
              <div className="pack-grid">
                {sortedPack.map((card) => {
                  const cardId = card.instanceId || card.id
                  return (
                    <DraftableCard
                      key={cardId}
                      card={card}
                      onClick={() => handleCardClick(card)}
                      onRightClick={(e) => handleCardRightClick(e, card)}
                      disabled={loading}
                      selected={selectedCardId === cardId}
                      dimmed={!!(selectedCardId && selectedCardId !== cardId)}
                      useStaticPreview={true}
                    />
                  )
                })}
              </div>
            ) : (
              <p className="no-cards">
                {myPlayer?.pickStatus === 'picked'
                  ? 'Waiting for other players...'
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
          isHost={isHost}
          onTogglePause={onTogglePause}
          onTimerExpire={onTimerExpire}
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
              right: '0',
              top: '0',
              width: '50vw',
              height: '100vh',
              zIndex: 9999,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingLeft: '20px',
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
