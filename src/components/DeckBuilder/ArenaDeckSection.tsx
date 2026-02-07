// @ts-nocheck
/**
 * ArenaDeckSection Component
 *
 * Bottom half of the arena view.
 * Shows deck cards in 8 cost columns (1-7, 8+) with two stacks per column:
 * - Units (top)
 * - Non-units (bottom)
 */

import { useMemo, useCallback, type MouseEvent } from 'react'
import { useDeckBuilder } from '../../contexts/DeckBuilderContext'
import { ArenaCardStack } from './ArenaCardStack'
import { calculateAspectPenalty } from '../../services/cards/aspectPenalties'
import type { CardData } from '../Card'

interface PoolCardEntry {
  cardId: string
  position: {
    card: CardData
    section: string
    visible: boolean
    enabled?: boolean
  }
}

interface CardPosition {
  card: CardData
  section: string
  visible: boolean
  enabled?: boolean
  [key: string]: unknown
}

interface CardEntry {
  cardId: string
  position: CardPosition
}

interface GroupedCardEntry {
  cardId: string  // First card's ID (for click handling)
  cardIds: string[]  // All card IDs in this group
  position: CardPosition
  quantity: number
}

export interface ArenaDeckSectionProps {
  onCardClick?: (cardId: string, e: MouseEvent) => void
  onCardMouseEnter?: (cardId: string, card: CardData, e: MouseEvent) => void
  onCardMouseLeave?: () => void
}

// Cost columns: 1-7 and 8+
const COST_BUCKETS = ['1', '2', '3', '4', '5', '6', '7', '8+']

export function ArenaDeckSection({
  onCardClick,
  onCardMouseEnter,
  onCardMouseLeave,
}: ArenaDeckSectionProps) {
  const {
    cardPositions,
    leaderCard,
    baseCard,
    showAspectPenalties,
    setShowAspectPenalties,
    hoveredCard,
    selectedCards,
    toggleCardSection,
  } = useDeckBuilder()

  // Get deck cards (not leaders/bases)
  const deckCards = useMemo((): CardEntry[] => {
    return Object.entries(cardPositions)
      .filter(([_, pos]) =>
        pos.section === 'deck' &&
        pos.visible &&
        !pos.card.isBase &&
        !pos.card.isLeader &&
        pos.enabled !== false
      )
      .map(([cardId, position]) => ({ cardId, position }))
  }, [cardPositions])

  // Calculate effective cost for a card
  const getEffectiveCost = useCallback((card: CardData): number => {
    const baseCost = card.cost ?? 0
    if (!showAspectPenalties || !leaderCard || !baseCard) {
      return baseCost
    }
    const penalty = calculateAspectPenalty(card, leaderCard, baseCard)
    return baseCost + penalty
  }, [showAspectPenalties, leaderCard, baseCard])

  // Get cost bucket for a card
  const getCostBucket = useCallback((card: CardData): string => {
    const effectiveCost = getEffectiveCost(card)
    if (effectiveCost >= 8) return '8+'
    if (effectiveCost < 1) return '1'
    return String(effectiveCost)
  }, [getEffectiveCost])

  // Check if card is a unit
  const isUnit = (card: CardData): boolean => {
    return card.type === 'Unit'
  }

  // Group cards by cost bucket, then by unit/non-unit, then by name (for quantities)
  const cardsByBucket = useMemo(() => {
    const buckets: Record<string, { units: GroupedCardEntry[]; nonUnits: GroupedCardEntry[] }> = {}
    COST_BUCKETS.forEach(bucket => {
      buckets[bucket] = { units: [], nonUnits: [] }
    })

    // First, collect all cards by bucket and type
    const tempBuckets: Record<string, { units: CardEntry[]; nonUnits: CardEntry[] }> = {}
    COST_BUCKETS.forEach(bucket => {
      tempBuckets[bucket] = { units: [], nonUnits: [] }
    })

    deckCards.forEach(entry => {
      const bucket = getCostBucket(entry.position.card)
      if (tempBuckets[bucket]) {
        if (isUnit(entry.position.card)) {
          tempBuckets[bucket].units.push(entry)
        } else {
          tempBuckets[bucket].nonUnits.push(entry)
        }
      }
    })

    // Group by card name and create grouped entries
    const groupByName = (cards: CardEntry[]): GroupedCardEntry[] => {
      const grouped = new Map<string, CardEntry[]>()
      cards.forEach(entry => {
        const name = entry.position.card.name || entry.cardId
        if (!grouped.has(name)) {
          grouped.set(name, [])
        }
        grouped.get(name)!.push(entry)
      })

      const result: GroupedCardEntry[] = []
      grouped.forEach((entries) => {
        result.push({
          cardId: entries[0].cardId,
          cardIds: entries.map(e => e.cardId),
          position: entries[0].position,
          quantity: entries.length,
        })
      })

      // Sort by name
      result.sort((a, b) =>
        (a.position.card.name || '').localeCompare(b.position.card.name || '')
      )

      return result
    }

    // Process each bucket
    Object.keys(tempBuckets).forEach(bucket => {
      buckets[bucket].units = groupByName(tempBuckets[bucket].units)
      buckets[bucket].nonUnits = groupByName(tempBuckets[bucket].nonUnits)
    })

    return buckets
  }, [deckCards, getCostBucket])

  // Calculate penalty for display
  const calculatePenalty = useCallback((card: CardData): number => {
    if (!leaderCard || !baseCard) return 0
    return calculateAspectPenalty(card, leaderCard, baseCard)
  }, [leaderCard, baseCard])

  // Handle card click - toggle between deck and pool
  const handleCardClick = useCallback((cardId: string, e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.shiftKey) {
      toggleCardSection(cardId)
    }
    onCardClick?.(cardId, e)
  }, [toggleCardSection, onCardClick])

  // Get pool cards for utility functions
  const poolCards = useMemo((): PoolCardEntry[] => {
    return Object.entries(cardPositions)
      .filter(([_, pos]) =>
        (pos.section === 'sideboard' || pos.enabled === false) &&
        pos.visible &&
        !pos.card.isBase &&
        !pos.card.isLeader
      )
      .map(([cardId, position]) => ({ cardId, position: position as PoolCardEntry['position'] }))
  }, [cardPositions])

  // Move all pool cards to deck
  const handleAddAll = useCallback(() => {
    poolCards.forEach(({ cardId }) => {
      toggleCardSection(cardId)
    })
  }, [poolCards, toggleCardSection])

  // Move all deck cards to pool
  const handleRemoveAll = useCallback(() => {
    deckCards.forEach(({ cardId }) => {
      toggleCardSection(cardId)
    })
  }, [deckCards, toggleCardSection])

  // Swap pool and deck
  const handleSwap = useCallback(() => {
    const poolCardIds = poolCards.map(({ cardId }) => cardId)
    const deckCardIds = deckCards.map(({ cardId }) => cardId)
    poolCardIds.forEach(cardId => toggleCardSection(cardId))
    deckCardIds.forEach(cardId => toggleCardSection(cardId))
  }, [poolCards, deckCards, toggleCardSection])

  // Add all in-aspect cards to deck
  const handleAddInAspect = useCallback(() => {
    poolCards.forEach(({ cardId, position }) => {
      const penalty = calculatePenalty(position.card)
      if (penalty === 0) {
        toggleCardSection(cardId)
      }
    })
  }, [poolCards, calculatePenalty, toggleCardSection])

  // Remove all out-of-aspect cards from deck
  const handleRemoveOutOfAspect = useCallback(() => {
    deckCards.forEach(({ cardId, position }) => {
      const penalty = calculatePenalty(position.card)
      if (penalty > 0) {
        toggleCardSection(cardId)
      }
    })
  }, [deckCards, calculatePenalty, toggleCardSection])

  const hasLeaderAndBase = leaderCard && baseCard

  return (
    <div className="arena-deck-section">
      <div className="arena-deck-header">
        <h3 className="arena-deck-title">Deck</h3>
        <span className="arena-deck-count">({deckCards.length} cards)</span>

        {/* Utility buttons */}
        <div className="arena-utility-buttons">
          <button
            className="arena-utility-button primary"
            onClick={handleAddAll}
            title="Move all pool cards to deck"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            All
          </button>
          <button
            className="arena-utility-button danger"
            onClick={handleRemoveAll}
            title="Move all deck cards to pool"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
            </svg>
            All
          </button>
          <button
            className="arena-utility-button"
            onClick={handleSwap}
            title="Swap pool and deck"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16l-4-4 4-4M17 8l4 4-4 4M3 12h18" />
            </svg>
            Swap
          </button>

          <div className="arena-utility-separator" />
          <button
            className={`arena-utility-button toggle ${hasLeaderAndBase ? (showAspectPenalties ? 'active' : '') : 'disabled-red'}`}
            onClick={() => hasLeaderAndBase && setShowAspectPenalties(!showAspectPenalties)}
            title={hasLeaderAndBase ? "Toggle aspect penalty display" : "Select leader and base to enable penalties"}
            disabled={!hasLeaderAndBase}
          >
            {showAspectPenalties ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
            Aspect Penalties
          </button>

          {hasLeaderAndBase && (
            <>
              <button
                className="arena-utility-button primary"
                onClick={handleAddInAspect}
                title="Add all in-aspect cards to deck"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                In Aspect
              </button>
              <button
                className="arena-utility-button danger"
                onClick={handleRemoveOutOfAspect}
                title="Remove all out-of-aspect cards from deck"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                Out of Aspect
              </button>
            </>
          )}
        </div>
      </div>

      <div className="arena-cost-columns">
        {COST_BUCKETS.map(bucket => {
          const { units, nonUnits } = cardsByBucket[bucket]
          // Calculate total quantities (sum of all quantities, not just group count)
          const unitsQty = units.reduce((sum, entry) => sum + (entry.quantity || 1), 0)
          const nonUnitsQty = nonUnits.reduce((sum, entry) => sum + (entry.quantity || 1), 0)
          const totalCount = unitsQty + nonUnitsQty
          return (
            <div key={bucket} className="arena-cost-column">
              <div className="arena-cost-header">
                {bucket}
                {totalCount > 0 && (
                  <span className="cost-count">({totalCount})</span>
                )}
              </div>
              {/* Units stack - only show if has units */}
              {unitsQty > 0 && (
                <>
                  <div className="arena-stack-label">Unit ({unitsQty})</div>
                  <ArenaCardStack
                    cards={units}
                    showPenalty={showAspectPenalties}
                    leaderCard={leaderCard}
                    baseCard={baseCard}
                    calculatePenalty={calculatePenalty}
                    onCardClick={handleCardClick}
                    onCardMouseEnter={onCardMouseEnter}
                    onCardMouseLeave={onCardMouseLeave}
                    hoveredCard={hoveredCard}
                    selectedCards={selectedCards}
                  />
                </>
              )}
              {/* Non-units stack - only show if has non-units */}
              {nonUnitsQty > 0 && (
                <div className={`arena-nonunits-stack ${unitsQty === 0 ? 'no-units-above' : ''}`}>
                  <div className="arena-stack-label">Non-Unit ({nonUnitsQty})</div>
                  <ArenaCardStack
                    cards={nonUnits}
                    showPenalty={showAspectPenalties}
                    leaderCard={leaderCard}
                    baseCard={baseCard}
                    calculatePenalty={calculatePenalty}
                    onCardClick={handleCardClick}
                    onCardMouseEnter={onCardMouseEnter}
                    onCardMouseLeave={onCardMouseLeave}
                    hoveredCard={hoveredCard}
                    selectedCards={selectedCards}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ArenaDeckSection
