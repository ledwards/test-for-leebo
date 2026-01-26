'use client'

import { useState, useEffect } from 'react'
import PlayerCircle from './PlayerCircle'
import DraftableCard from './DraftableCard'
import TimerPanel from './TimerPanel'
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
}) {
  const leaders = myPlayer?.leaders || []
  const draftedLeaders = myPlayer?.draftedLeaders || []
  const canSelect = (myPlayer?.pickStatus === 'picking' || myPlayer?.pickStatus === 'selected') && leaders.length > 0
  const hasSelected = myPlayer?.pickStatus === 'selected'
  const round = draftState?.leaderRound || 1

  // Local selection state, persisted to localStorage
  const storageKey = `draft-selection-${shareId}-leader-${round}`
  const [selectedCardId, setSelectedCardId] = useState(null)

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
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored && canSelect && myPlayer?.pickStatus === 'picking') {
      // Re-send selection to server after refresh
      onSelect(stored)
    }
  }, []) // Only on mount

  // Clear localStorage when round advances (leaders array changes after pick)
  useEffect(() => {
    if (myPlayer?.pickStatus === 'picking' && !hasSelected) {
      // New round started, clear old selection
      const stored = localStorage.getItem(storageKey)
      if (stored && !leaders.some(l => (l.instanceId || l.id) === stored)) {
        localStorage.removeItem(storageKey)
        setSelectedCardId(null)
      }
    }
  }, [leaders, myPlayer?.pickStatus, hasSelected, storageKey])

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

          <div className="available-leaders">
            <h3>
              {hasSelected
                ? 'Waiting for other players...'
                : canSelect
                  ? (round === 3 ? 'Select Your Final Leader' : 'Select a Leader')
                  : 'Waiting...'}
            </h3>
            {leaders.length > 0 ? (
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
