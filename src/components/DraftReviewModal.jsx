'use client'

import { useState, useMemo } from 'react'
import './DraftReviewModal.css'

function DraftReviewModal({ draftedCards = [], draftedLeaders = [], onClose, packSize = 14 }) {
  const [sortMode, setSortMode] = useState('pick') // 'pick', 'cost', 'type'

  // Get aspect key for grouping (same logic as DeckBuilder)
  const getAspectKey = (card) => {
    const aspects = card.aspects || []
    if (aspects.length === 0) return 'ZZZ_Neutral'

    if (aspects.length === 1) {
      const aspect = aspects[0]
      const priority = {
        'Vigilance': 'A_Vigilance',
        'Command': 'B_Command',
        'Aggression': 'C_Aggression',
        'Cunning': 'D_Cunning',
      }
      return priority[aspect] || `E_${aspect}`
    }

    // Multi-aspect cards
    const sortedAspects = [...aspects].sort()
    return `F_${sortedAspects.join('/')}`
  }

  const getAspectLabel = (key) => {
    if (key === 'ZZZ_Neutral') return 'Neutral'
    if (key.startsWith('A_')) return 'Vigilance'
    if (key.startsWith('B_')) return 'Command'
    if (key.startsWith('C_')) return 'Aggression'
    if (key.startsWith('D_')) return 'Cunning'
    if (key.startsWith('F_')) return key.substring(2) // Multi-aspect
    return key
  }

  // Calculate pack and pick for each card (reverse chronological = newest first)
  const cardsWithPickInfo = useMemo(() => {
    return draftedCards.map((card, index) => {
      // Total picks = 3 packs × (pack_size - 2) cards each
      // Cards are in order picked, so index 0 = first pick
      const pickNumber = index + 1
      const packNumber = Math.floor(index / (packSize - 2)) + 1
      const pickInPack = (index % (packSize - 2)) + 1

      return {
        ...card,
        pickNumber,
        packNumber,
        pickInPack,
      }
    })
  }, [draftedCards, packSize])

  // Sort and group cards based on mode
  const { groups, sortedCards } = useMemo(() => {
    if (sortMode === 'pick') {
      // Reverse chronological order (newest first)
      const sorted = [...cardsWithPickInfo].reverse()
      return { groups: null, sortedCards: sorted }
    }

    if (sortMode === 'cost') {
      // Group by cost
      const costGroups = {}
      const costSegments = [0, 1, 2, 3, 4, 5, 6, 7, '8+']

      costSegments.forEach(segment => {
        costGroups[segment] = []
      })

      cardsWithPickInfo.forEach(card => {
        const cost = card.cost ?? 0
        let segment = cost
        if (cost >= 8) segment = '8+'
        if (!costGroups[segment]) costGroups[segment] = []
        costGroups[segment].push(card)
      })

      return { groups: costGroups, sortedCards: null }
    }

    if (sortMode === 'type') {
      // Group by aspect
      const aspectGroups = {}

      cardsWithPickInfo.forEach(card => {
        const key = getAspectKey(card)
        if (!aspectGroups[key]) aspectGroups[key] = []
        aspectGroups[key].push(card)
      })

      // Sort groups by key
      const sortedKeys = Object.keys(aspectGroups).sort()
      const sortedGroups = {}
      sortedKeys.forEach(key => {
        sortedGroups[key] = aspectGroups[key].sort((a, b) => (a.cost || 0) - (b.cost || 0))
      })

      return { groups: sortedGroups, sortedCards: null }
    }

    return { groups: null, sortedCards: cardsWithPickInfo }
  }, [cardsWithPickInfo, sortMode])

  const cycleSortMode = () => {
    if (sortMode === 'pick') setSortMode('cost')
    else if (sortMode === 'cost') setSortMode('type')
    else setSortMode('pick')
  }

  const renderCard = (card) => (
    <div key={`${card.id}-${card.pickNumber}`} className="review-card">
      <img src={card.imageUrl} alt={card.name} className="review-card-image" />
      {sortMode === 'pick' && (
        <div className="review-card-pick-label">
          Pack {card.packNumber} Pick {card.pickInPack}
        </div>
      )}
    </div>
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content draft-review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Draft Review</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="review-controls">
          <button className="sort-toggle-button" onClick={cycleSortMode}>
            Sort By: {sortMode === 'pick' ? 'Pick Order' : sortMode === 'cost' ? 'Cost' : 'Type'}
          </button>
        </div>

        <div className="review-content">
          {draftedLeaders.length > 0 && (
            <div className="review-section">
              <h3>Leaders</h3>
              <div className="review-leaders">
                {draftedLeaders.map((leader, idx) => (
                  <div key={idx} className="review-leader">
                    <img src={leader.imageUrl} alt={leader.name} className="review-leader-image" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="review-section">
            <h3>Cards ({draftedCards.length})</h3>
            {sortMode === 'pick' ? (
              <div className="review-cards-grid">
                {sortedCards.map(renderCard)}
              </div>
            ) : (
              <div className="review-groups">
                {Object.entries(groups).map(([groupKey, groupCards]) => {
                  if (groupCards.length === 0) return null

                  const label = sortMode === 'cost'
                    ? groupKey
                    : getAspectLabel(groupKey)

                  return (
                    <div key={groupKey} className="review-group">
                      <div className="review-group-header">
                        <div className="review-group-icon">
                          {sortMode === 'cost' ? (
                            <span className="cost-icon">{label}</span>
                          ) : (
                            <span className="aspect-label">{label}</span>
                          )}
                        </div>
                        <span className="review-group-count">({groupCards.length})</span>
                      </div>
                      <div className="review-cards-grid">
                        {groupCards.map(renderCard)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DraftReviewModal
