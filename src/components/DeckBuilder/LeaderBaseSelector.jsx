/**
 * LeaderBaseSelector Component
 *
 * Displays the Leaders and Bases rows for selection in the deck builder.
 * Shows available leaders and bases from the pool, allows selecting
 * the active leader and base for the deck.
 *
 * Can use DeckBuilderContext or receive props directly.
 */

import { useMemo, useCallback } from 'react'
import Card from '../Card'
import { compareByAspectTypeCostName } from '../../services/cards/cardSorting'
import { useDeckBuilder } from '../../contexts/DeckBuilderContext'

// Get aspect combination key for sorting
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
      'Villainy': 'E_Villainy',
      'Heroism': 'F_Heroism'
    }
    return priority[aspect] || `G_${aspect}`
  }

  const sortedAspects = [...aspects].sort()
  return `H_${sortedAspects.join(' ')}`
}

export function LeaderBaseSelector({
  // Props with context fallback
  cardPositions: cardPositionsProp,
  activeLeader: activeLeaderProp,
  setActiveLeader: setActiveLeaderProp,
  activeBase: activeBaseProp,
  setActiveBase: setActiveBaseProp,
  selectedCards: selectedCardsProp,
  hoveredCard: hoveredCardProp,
  setHoveredCard: setHoveredCardProp,
  // Expansion state
  leadersExpanded = true,
  setLeadersExpanded,
  basesExpanded = true,
  setBasesExpanded,
  // Preview handlers (required as props - not in context)
  onCardMouseEnter,
  onCardMouseLeave,
  // Options
  poolSortOption,
  deckSortOption,
  setShowAspectPenalties,
}) {
  // Try to get values from context
  let contextValue = null
  try {
    contextValue = useDeckBuilder()
  } catch {
    // Not inside a provider
  }

  // Use props if provided, otherwise use context
  const cardPositions = cardPositionsProp ?? contextValue?.cardPositions ?? {}
  const activeLeader = activeLeaderProp ?? contextValue?.activeLeader
  const setActiveLeader = setActiveLeaderProp ?? contextValue?.setActiveLeader
  const activeBase = activeBaseProp ?? contextValue?.activeBase
  const setActiveBase = setActiveBaseProp ?? contextValue?.setActiveBase
  const selectedCards = selectedCardsProp ?? contextValue?.selectedCards ?? new Set()
  const hoveredCard = hoveredCardProp ?? contextValue?.hoveredCard
  const setHoveredCard = setHoveredCardProp ?? contextValue?.setHoveredCard

  // Get leaders cards
  const leadersCards = useMemo(() => {
    return Object.entries(cardPositions)
      .filter(([_, position]) => position.section === 'leaders-bases' && position.visible && position.card.isLeader)
      .map(([cardId, position]) => ({ cardId, position }))
      .sort((a, b) => compareByAspectTypeCostName(a.position.card, b.position.card))
  }, [cardPositions])

  // Get bases cards
  const basesCards = useMemo(() => {
    return Object.entries(cardPositions)
      .filter(([_, position]) => position.section === 'leaders-bases' && position.visible && position.card.isBase)
      .map(([cardId, position]) => ({ cardId, position }))
      .sort((a, b) => {
        // Sort by rarity (rare first)
        const aRarity = a.position.card.rarity
        const bRarity = b.position.card.rarity
        const aIsRare = aRarity === 'Rare' || aRarity === 'Legendary' || aRarity === 'Special'
        const bIsRare = bRarity === 'Rare' || bRarity === 'Legendary' || bRarity === 'Special'

        if (aIsRare && !bIsRare) return -1
        if (!aIsRare && bIsRare) return 1

        // Then by aspect
        const keyA = getAspectKey(a.position.card)
        const keyB = getAspectKey(b.position.card)
        return keyA.localeCompare(keyB)
      })
  }, [cardPositions])

  // Handle leader click
  const handleLeaderClick = useCallback((cardId) => {
    const newActiveLeader = activeLeader === cardId ? null : cardId
    setActiveLeader?.(newActiveLeader)
    // Show aspect penalties when selecting leader in cost mode
    if (newActiveLeader && (poolSortOption === 'cost' || deckSortOption === 'cost')) {
      setShowAspectPenalties?.(true)
    }
  }, [activeLeader, setActiveLeader, poolSortOption, deckSortOption, setShowAspectPenalties])

  // Handle base click
  const handleBaseClick = useCallback((cardId) => {
    const newActiveBase = activeBase === cardId ? null : cardId
    setActiveBase?.(newActiveBase)
  }, [activeBase, setActiveBase])

  // Handle card hover
  const handleMouseEnter = useCallback((cardId, card, e) => {
    setHoveredCard?.(cardId)
    onCardMouseEnter?.(card, e)
  }, [setHoveredCard, onCardMouseEnter])

  const handleMouseLeave = useCallback(() => {
    setHoveredCard?.(null)
    onCardMouseLeave?.()
  }, [setHoveredCard, onCardMouseLeave])

  if (leadersCards.length === 0 && basesCards.length === 0) {
    return null
  }

  return (
    <>
      {/* Leaders Row */}
      {leadersCards.length > 0 && (
        <div className="blocks-leaders-row">
          <div className={`card-block ${!leadersExpanded ? 'collapsed' : ''}`}>
            <h3
              className="card-block-header"
              onClick={(e) => {
                e.stopPropagation()
                setLeadersExpanded?.(!leadersExpanded)
              }}
              style={{ cursor: 'pointer' }}
            >
              <span style={{ marginRight: '0.5rem', fontSize: '0.8rem' }}>
                {leadersExpanded ? '▼' : '▶'}
              </span>
              <span>Leaders ({leadersCards.length})</span>
            </h3>
            {leadersExpanded && (
              <div className="card-block-content">
                <div className="leaders-bases-container">
                  {leadersCards.map(({ cardId, position }) => {
                    const card = position.card
                    const isSelected = selectedCards.has(cardId)
                    const isHovered = hoveredCard === cardId
                    const isActiveLeader = activeLeader === cardId

                    return (
                      <Card
                        key={cardId}
                        card={card}
                        selected={isSelected}
                        hovered={isHovered}
                        active={isActiveLeader}
                        onClick={() => handleLeaderClick(cardId)}
                        onMouseEnter={(e) => handleMouseEnter(cardId, card, e)}
                        onMouseLeave={handleMouseLeave}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bases Row */}
      {basesCards.length > 0 && (
        <div className="blocks-bases-row">
          <div className={`card-block ${!basesExpanded ? 'collapsed' : ''}`}>
            <h3
              className="card-block-header"
              onClick={(e) => {
                e.stopPropagation()
                setBasesExpanded?.(!basesExpanded)
              }}
              style={{ cursor: 'pointer' }}
            >
              <span style={{ marginRight: '0.5rem', fontSize: '0.8rem' }}>
                {basesExpanded ? '▼' : '▶'}
              </span>
              <span>Bases ({basesCards.length})</span>
            </h3>
            {basesExpanded && (
              <div className="card-block-content">
                <div className="leaders-bases-container bases-only">
                  {basesCards.map(({ cardId, position }) => {
                    const card = position.card
                    const isSelected = selectedCards.has(cardId)
                    const isHovered = hoveredCard === cardId
                    const isActiveBase = activeBase === cardId

                    return (
                      <Card
                        key={cardId}
                        card={card}
                        selected={isSelected}
                        hovered={isHovered}
                        active={isActiveBase}
                        onClick={() => handleBaseClick(cardId)}
                        onMouseEnter={(e) => handleMouseEnter(cardId, card, e)}
                        onMouseLeave={handleMouseLeave}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default LeaderBaseSelector
