'use client'

import { useState } from 'react'
import PlayerCircle from './PlayerCircle'
import DraftableCard from './DraftableCard'
import PassDirectionArrow from './PassDirectionArrow'
import DraftTimer from './DraftTimer'
import CardModal from './CardModal'
import TimerPanel from './TimerPanel'
import DraftReviewModal from './DraftReviewModal'
import './PackDraftPhase.css'

function PackDraftPhase({
  draft,
  players,
  myPlayer,
  draftState,
  onPick,
  loading,
  error,
}) {
  const [selectedCard, setSelectedCard] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const currentPack = myPlayer?.currentPack || []
  const draftedCards = myPlayer?.draftedCards || []
  const draftedLeaders = myPlayer?.draftedLeaders || []
  const canPick = myPlayer?.pickStatus === 'picking' && currentPack.length > 0

  const packNumber = draftState?.packNumber || 1
  const pickInPack = draftState?.pickInPack || 1

  // Pack draft: pack 1 & 3 pass left, pack 2 passes right
  const passDirection = packNumber % 2 === 1 ? 'left' : 'right'

  // Check if only one player is left picking (for timer)
  const playersStillPicking = players.filter(p => p.pickStatus === 'picking').length
  const showTimer = draft?.timerEnabled && playersStillPicking === 1 && canPick

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

  const handleCardRightClick = (e, card) => {
    e.preventDefault()
    setSelectedCard(card)
  }

  return (
    <div className="pack-draft-phase">
      <div className="phase-header">
        <h2>Pack {packNumber} - Pick {pickInPack}</h2>
        <p className="phase-description">
          Select a card from the pack. Cards pass to the {passDirection}.
        </p>
      </div>

      <div className="draft-layout">
        <div className="players-section">
          <PlayerCircle
            players={players}
            maxPlayers={draft?.maxPlayers || 8}
            currentUserId={myPlayer?.id}
            showStatus={true}
            draft={draft}
            showTimers={true}
          />
          <PassDirectionArrow direction={passDirection} />
          {showTimer && (
            <DraftTimer
              seconds={draft?.timerSeconds || 30}
              onTimeout={() => {
                // Server handles timeout
              }}
            />
          )}
        </div>

        <div className="cards-section">
          <div className="draft-info-header">
            <div className="my-leaders-info">
              <span className="info-label">Your Leaders:</span>
              {draftedLeaders.length > 0 ? (
                <span className="info-value">
                  {draftedLeaders.map((l, idx) => (
                    <span key={idx}>
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
                Review
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

      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}

      {showReviewModal && (
        <DraftReviewModal
          draftedCards={draftedCards}
          draftedLeaders={draftedLeaders}
          packSize={draft?.packSize || 14}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  )
}

export default PackDraftPhase
