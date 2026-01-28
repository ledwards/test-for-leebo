'use client'

import { useState, useEffect, useRef } from 'react'
import PlayerCircle from './PlayerCircle'
import DraftableCard from './DraftableCard'
import TimerPanel from './TimerPanel'
import { getSingleAspectColor, NO_ASPECT_COLOR } from '../utils/aspectColors'
import './LeaderDraftPhase.css'

function LeaderDraftPhase({
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
  const leaders = myPlayer?.leaders || []
  const draftedLeaders = myPlayer?.draftedLeaders || []
  const canSelect = (myPlayer?.pickStatus === 'picking' || myPlayer?.pickStatus === 'selected') && leaders.length > 0
  const hasSelected = myPlayer?.pickStatus === 'selected'
  const round = draftState?.leaderRound || 1

  // Local selection state, persisted to localStorage
  const storageKey = `draft-selection-${shareId}-leader-${round}`
  const [selectedCardId, setSelectedCardId] = useState(null)
  const [showPassing, setShowPassing] = useState(false)
  const [lastLeadersCount, setLastLeadersCount] = useState(0)
  const passingTimeoutRef = useRef(null)

  // Load selection from localStorage on mount and when round changes
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored && leaders.some(l => (l.instanceId || l.id) === stored)) {
      setSelectedCardId(stored)
    } else {
      setSelectedCardId(null)
    }
  }, [storageKey, leaders])

  // Sync localStorage selection with server on mount (in case of refresh)
  // Only re-send if the stored leader is still in the current leaders array
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored && canSelect && myPlayer?.pickStatus === 'picking') {
      // Verify the stored leader is still available before re-sending
      const leaderStillAvailable = leaders.some(l => (l.instanceId || l.id) === stored)
      if (leaderStillAvailable) {
        onSelect(stored)
      } else {
        // Clear stale selection
        localStorage.removeItem(storageKey)
        setSelectedCardId(null)
      }
    }
  }, []) // Only on mount

  // Clear localStorage when round advances (leaders array changes after pick)
  useEffect(() => {
    if (myPlayer?.pickStatus === 'picking' && !hasSelected) {
      // New round started, clear old selection if leader no longer available
      const stored = localStorage.getItem(storageKey)
      if (stored && !leaders.some(l => (l.instanceId || l.id) === stored)) {
        localStorage.removeItem(storageKey)
        setSelectedCardId(null)
      }
    }
  }, [leaders, myPlayer?.pickStatus, hasSelected, storageKey])

  // Clear all old leader selections when round changes
  useEffect(() => {
    // Clean up selections from previous rounds
    for (let r = 1; r <= 3; r++) {
      if (r !== round) {
        const oldKey = `draft-selection-${shareId}-leader-${r}`
        localStorage.removeItem(oldKey)
      }
    }
  }, [round, shareId])

  // Manage "passing" state - show skeleton cards for minimum time
  useEffect(() => {
    const isPicked = hasSelected || myPlayer?.pickStatus === 'picked'

    if (isPicked && leaders.length > 0) {
      // Start showing passing state
      setShowPassing(true)
      // Next round will have one fewer leader (the one we just picked)
      setLastLeadersCount(Math.max(0, leaders.length - 1))

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
  }, [hasSelected, myPlayer?.pickStatus, leaders.length, showPassing])

  const handleCardClick = (card) => {
    if (loading || !canSelect) return

    const cardId = card.instanceId || card.id

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

  // Leader draft always passes right
  const passDirection = 'right'

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
            hideEmptySeats={true}
            showLeaderInfo={true}
            passDirection={passDirection}
            leaderRound={round}
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

          <div className="drafted-leaders">
            <h3>Your Drafted Leaders ({draftedLeaders.length}/3)</h3>
            <div className="drafted-leaders-grid">
              {draftedLeaders.map((leader, idx) => (
                <DraftableCard
                  key={idx}
                  card={leader}
                  disabled={true}
                  useStaticPreview={true}
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

          {/* Selection confirmation banner */}
          {selectedCardId && (() => {
            const selectedLeader = leaders.find(l => (l.instanceId || l.id) === selectedCardId)
            if (!selectedLeader) return null
            const firstAspect = selectedLeader.aspects?.[0]
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
                  <span className="selection-card-name" style={{ color: aspectColor }}>{selectedLeader.name}</span>
                  {selectedLeader.subtitle && (
                    <span className="selection-card-subtitle">{selectedLeader.subtitle}</span>
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

          <div className="available-leaders">
            <h3>
              {hasSelected
                ? 'Waiting for other players...'
                : canSelect
                  ? (round === 3 ? 'Select Your Final Leader' : 'Select a Leader')
                  : 'Waiting...'}
            </h3>
            {/* Show skeleton cards when waiting for next round */}
            {showPassing && (lastLeadersCount > 0 || leaders.length > 0) ? (
              <>
                <div className="passing-message">
                  Passing Right...
                </div>
                <div className="leaders-grid">
                  {Array.from({ length: lastLeadersCount || leaders.length }).map((_, idx) => (
                    <div key={`skeleton-${idx}`} className="skeleton-card leader">
                      <div className="skeleton-shimmer"></div>
                    </div>
                  ))}
                </div>
              </>
            ) : leaders.length > 0 ? (
              <div className="leaders-grid">
                {leaders.map((leader) => {
                  const cardId = leader.instanceId || leader.id
                  return (
                    <DraftableCard
                      key={cardId}
                      card={leader}
                      onClick={() => handleCardClick(leader)}
                      onRightClick={(e) => handleCardRightClick(e, leader)}
                      disabled={loading}
                      selected={selectedCardId === cardId}
                      dimmed={selectedCardId && selectedCardId !== cardId}
                      useStaticPreview={true}
                    />
                  )
                })}
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
    </div>
  )
}

export default LeaderDraftPhase
