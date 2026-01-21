'use client'

import { useState } from 'react'
import PlayerCircle from './PlayerCircle'
import DraftableCard from './DraftableCard'
import PassDirectionArrow from './PassDirectionArrow'
import CardModal from './CardModal'
import TimerPanel from './TimerPanel'
import DraftReviewModal from './DraftReviewModal'
import './LeaderDraftPhase.css'

function LeaderDraftPhase({
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

  const leaders = myPlayer?.leaders || []
  const draftedLeaders = myPlayer?.draftedLeaders || []
  const canPick = myPlayer?.pickStatus === 'picking' && leaders.length > 0
  const round = draftState?.leaderRound || 1

  const handleCardClick = (card) => {
    if (!canPick || loading) return
    onPick(card.id)
  }

  const handleCardRightClick = (e, card) => {
    e.preventDefault()
    setSelectedCard(card)
  }

  // Leader draft: round 1 passes right, round 2 passes left
  const passDirection = round === 1 ? 'right' : 'left'

  return (
    <div className="leader-draft-phase">
      <div className="phase-header">
        <h2>Leader Draft - Round {round}/2</h2>
        <p className="phase-description">
          Pick 1 leader from your available options.
          {round === 1 && ' Remaining leaders will pass to the right.'}
          {round === 2 && ' Remaining leader will auto-pick for round 3.'}
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
              <button className="review-button" onClick={() => setShowReviewModal(true)}>
                Review
              </button>
            </div>
          </div>

          <div className="drafted-leaders">
            <h3>Your Drafted Leaders ({draftedLeaders.length}/3)</h3>
            <div className="drafted-leaders-grid">
              {draftedLeaders.map((leader, idx) => (
                <div key={idx} className="drafted-leader">
                  <img
                    src={leader.imageUrl}
                    alt={leader.name}
                    onClick={() => setSelectedCard(leader)}
                  />
                </div>
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
              {canPick ? 'Select a Leader' : 'Waiting for pick...'}
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

      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}

      {showReviewModal && (
        <DraftReviewModal
          draftedCards={[]}
          draftedLeaders={draftedLeaders}
          packSize={0}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  )
}

export default LeaderDraftPhase
