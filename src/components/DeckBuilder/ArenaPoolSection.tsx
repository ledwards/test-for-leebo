// @ts-nocheck
/**
 * ArenaPoolSection Component
 *
 * Top half of the arena view.
 * Shows pool cards in a grid with aspect combo filters and search.
 */

import { useMemo, useCallback, type MouseEvent, type ChangeEvent } from 'react'
import { useDeckBuilder } from '../../contexts/DeckBuilderContext'
import { ResizableCard } from './ResizableCard'
import { calculateAspectPenalty } from '../../services/cards/aspectPenalties'
import type { CardData } from '../Card'

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

export interface ArenaPoolSectionProps {
  onCardClick?: (cardId: string, e: MouseEvent) => void
  onCardMouseEnter?: (cardId: string, card: CardData, e: MouseEvent) => void
  onCardMouseLeave?: () => void
}

// Primary aspects (have their own groups with combos)
const PRIMARY_ASPECTS = ['Vigilance', 'Command', 'Aggression', 'Cunning']

// Secondary aspects
const SECONDARY_ASPECTS = ['Villainy', 'Heroism']

// Get aspect combo key for a card (sorted for consistency)
function getAspectComboKey(card: CardData): string {
  const aspects = card.aspects || []
  if (aspects.length === 0) return 'neutral'
  const sorted = [...aspects].sort()
  return sorted.join('+')
}

// Aspect icon component
function AspectIcon({ aspect }: { aspect: string }) {
  return (
    <img
      src={`/icons/${aspect.toLowerCase()}.png`}
      alt={aspect}
    />
  )
}

export function ArenaPoolSection({
  onCardClick,
  onCardMouseEnter,
  onCardMouseLeave,
}: ArenaPoolSectionProps) {
  const {
    cardPositions,
    leaderCard,
    baseCard,
    showAspectPenalties,
    hoveredCard,
    selectedCards,
    toggleCardSection,
    arenaFilters,
    setArenaFilters,
    arenaSearchQuery,
    setArenaSearchQuery,
  } = useDeckBuilder()

  // Build default filters if arenaFilters is empty
  const activeFilters = useMemo(() => {
    // If we have saved filters, use them
    if (Object.keys(arenaFilters).length > 0) {
      return arenaFilters
    }
    // Default: all filters active
    const initial: Record<string, boolean> = { neutral: true }
    PRIMARY_ASPECTS.forEach(primary => {
      initial[primary] = true
      initial[`${primary}+${primary}`] = true
      SECONDARY_ASPECTS.forEach(secondary => {
        const sorted = [primary, secondary].sort()
        initial[sorted.join('+')] = true
      })
    })
    SECONDARY_ASPECTS.forEach(secondary => {
      initial[secondary] = true
    })
    return initial
  }, [arenaFilters])

  const setActiveFilters = setArenaFilters
  const searchQuery = arenaSearchQuery
  const setSearchQuery = setArenaSearchQuery

  // Get ALL cards (pool + deck) for determining filter visibility
  const allCards = useMemo((): CardEntry[] => {
    return Object.entries(cardPositions)
      .filter(([_, pos]) =>
        pos.visible &&
        !pos.card.isBase &&
        !pos.card.isLeader
      )
      .map(([cardId, position]) => ({ cardId, position }))
  }, [cardPositions])

  // Get pool cards (not leaders/bases, in sideboard/disabled)
  const poolCards = useMemo((): CardEntry[] => {
    return Object.entries(cardPositions)
      .filter(([_, pos]) =>
        (pos.section === 'sideboard' || pos.enabled === false) &&
        pos.visible &&
        !pos.card.isBase &&
        !pos.card.isLeader
      )
      .map(([cardId, position]) => ({ cardId, position }))
  }, [cardPositions])

  // Get all unique aspect combos present in ALL cards (pool + deck)
  // This ensures filters never disappear as cards move between sections
  const presentCombos = useMemo(() => {
    const combos = new Set<string>()
    allCards.forEach(({ position }) => {
      combos.add(getAspectComboKey(position.card))
    })
    return combos
  }, [allCards])

  // Filter cards by aspect combo and search
  const filteredCards = useMemo(() => {
    return poolCards.filter(({ position }) => {
      const card = position.card
      const comboKey = getAspectComboKey(card)

      // Check if this combo is active
      if (!activeFilters[comboKey]) {
        return false
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const name = (card.name || '').toLowerCase()
        const type = (card.type || '').toLowerCase()
        if (!name.includes(query) && !type.includes(query)) {
          return false
        }
      }

      return true
    })
  }, [poolCards, activeFilters, searchQuery])

  // Sort cards by aspect, then cost, then name
  const sortedCards = useMemo(() => {
    return [...filteredCards].sort((a, b) => {
      const cardA = a.position.card
      const cardB = b.position.card

      const aspectA = (cardA.aspects || [])[0] || 'ZZZ'
      const aspectB = (cardB.aspects || [])[0] || 'ZZZ'
      const aspectCompare = aspectA.localeCompare(aspectB)
      if (aspectCompare !== 0) return aspectCompare

      const costA = cardA.cost ?? 0
      const costB = cardB.cost ?? 0
      if (costA !== costB) return costA - costB

      return (cardA.name || '').localeCompare(cardB.name || '')
    })
  }, [filteredCards])

  // Toggle a specific combo filter
  const toggleFilter = useCallback((key: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }, [])

  // Toggle all combos for a primary aspect group
  // If any are active, turn all off. If all are off, turn all on.
  const togglePrimaryAspect = useCallback((primary: string) => {
    setActiveFilters(prev => {
      const combosForPrimary = [
        primary,
        `${primary}+${primary}`,
        ...SECONDARY_ASPECTS.map(s => {
          const sorted = [primary, s].sort()
          return sorted.join('+')
        })
      ]
      const anyActive = combosForPrimary.some(k => prev[k])
      const newState = { ...prev }
      combosForPrimary.forEach(k => {
        newState[k] = !anyActive
      })
      return newState
    })
  }, [])

  // Toggle secondary aspect (and all combos containing it)
  // If any are active, turn all off. If all are off, turn all on.
  const toggleSecondaryAspect = useCallback((secondary: string) => {
    setActiveFilters(prev => {
      const combosWithSecondary = [
        secondary,
        ...PRIMARY_ASPECTS.map(p => {
          const sorted = [p, secondary].sort()
          return sorted.join('+')
        })
      ]
      const anyActive = combosWithSecondary.some(k => prev[k])
      const newState = { ...prev }
      combosWithSecondary.forEach(k => {
        newState[k] = !anyActive
      })
      return newState
    })
  }, [])

  // Check if ANY combo for a primary aspect is active
  // Parent shows as "active" if any child is active
  const isPrimaryAspectActive = useCallback((primary: string) => {
    const combosForPrimary = [
      primary,
      `${primary}+${primary}`,
      ...SECONDARY_ASPECTS.map(s => {
        const sorted = [primary, s].sort()
        return sorted.join('+')
      })
    ]
    return combosForPrimary.some(k => activeFilters[k])
  }, [activeFilters])

  // Check if ANY combo for a secondary aspect is active
  const isSecondaryAspectActive = useCallback((secondary: string) => {
    const combosWithSecondary = [
      secondary,
      ...PRIMARY_ASPECTS.map(p => {
        const sorted = [p, secondary].sort()
        return sorted.join('+')
      })
    ]
    return combosWithSecondary.some(k => activeFilters[k])
  }, [activeFilters])

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const calculatePenalty = useCallback((card: CardData): number => {
    if (!leaderCard || !baseCard) return 0
    return calculateAspectPenalty(card, leaderCard, baseCard)
  }, [leaderCard, baseCard])

  const handleCardClick = useCallback((cardId: string, e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.shiftKey) {
      toggleCardSection(cardId)
    }
    onCardClick?.(cardId, e)
  }, [toggleCardSection, onCardClick])

  // Render a combo filter button
  const renderComboFilter = (comboKey: string, showInactive = false) => {
    const aspects = comboKey === 'neutral' ? [] : comboKey.split('+')
    const isActive = activeFilters[comboKey]
    const isPresent = presentCombos.has(comboKey)

    if (!isPresent && !showInactive) return null

    return (
      <button
        key={comboKey}
        className={`arena-filter-btn arena-aspect-filter ${isActive ? 'active' : 'inactive'}`}
        onClick={() => toggleFilter(comboKey)}
        title={comboKey}
        disabled={!isPresent}
        style={!isPresent ? { display: 'none' } : undefined}
      >
        {aspects.map((aspect, i) => (
          <AspectIcon key={i} aspect={aspect} />
        ))}
      </button>
    )
  }

  // Get all 4 combos for a primary aspect (in order: mono, double, +Villainy, +Heroism)
  const getCombosForPrimary = (primary: string) => {
    const combos = [
      primary, // mono
      `${primary}+${primary}`, // double
    ]
    // Add secondary combos in order
    SECONDARY_ASPECTS.forEach(secondary => {
      const sorted = [primary, secondary].sort()
      combos.push(sorted.join('+'))
    })
    return combos
  }

  return (
    <div className="arena-pool-section">
      <div className="arena-pool-header">
        {/* Pool title on its own row */}
        <h3 className="arena-pool-title">Pool ({sortedCards.length})</h3>

        {/* Search and aspect filters row */}
        <div className="arena-filters-row">
          {/* Search box - separate from filters */}
          <div className="arena-search-container">
            <svg className="arena-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="arena-search-input"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Aspect filters in their own scrollable container */}
          <div className="arena-aspect-filters">
            {/* Primary aspect groups */}
          {PRIMARY_ASPECTS.map(primary => {
            const combos = getCombosForPrimary(primary)
            const hasAnyCombos = combos.some(k => presentCombos.has(k))
            if (!hasAnyCombos) return null

            const isGroupActive = isPrimaryAspectActive(primary)

            return (
              <div key={primary} className={`arena-filter-btn arena-aspect-group ${primary.toLowerCase()}`}>
                <div
                  className={`arena-aspect-group-header ${isGroupActive ? 'active' : 'inactive'}`}
                  onClick={() => togglePrimaryAspect(primary)}
                  title={`Toggle all ${primary} combos`}
                >
                  <AspectIcon aspect={primary} />
                </div>
                <div className="arena-aspect-group-separator" />
                {combos.map(comboKey => renderComboFilter(comboKey))}
              </div>
            )
          })}

          {/* Secondary aspects (Villainy, Heroism) and Neutral in a row */}
          <div className="arena-secondary-aspects">
            {SECONDARY_ASPECTS.map(secondary => {
              const isActive = isSecondaryAspectActive(secondary)
              const hasCards = presentCombos.has(secondary) ||
                PRIMARY_ASPECTS.some(p => {
                  const sorted = [p, secondary].sort()
                  return presentCombos.has(sorted.join('+'))
                })
              if (!hasCards) return null

              return (
                <button
                  key={secondary}
                  className={`arena-filter-btn arena-secondary-aspect ${secondary.toLowerCase()} ${isActive ? 'active' : 'inactive'}`}
                  onClick={() => toggleSecondaryAspect(secondary)}
                  title={`Toggle all ${secondary} cards`}
                >
                  <AspectIcon aspect={secondary} />
                </button>
              )
            })}

            {/* Neutral filter */}
            {presentCombos.has('neutral') && (
              <button
                className={`arena-filter-btn arena-neutral-filter ${activeFilters.neutral ? 'active' : 'inactive'}`}
                onClick={() => toggleFilter('neutral')}
                title="Toggle neutral cards"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(128, 128, 128, 0.7)">
                  <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" />
                </svg>
              </button>
            )}
          </div>
          </div>{/* Close arena-aspect-filters */}
        </div>{/* Close arena-filters-row */}
      </div>

      <div className="arena-pool-cards">
        <div className="arena-pool-grid">
          {sortedCards.map(({ cardId, position }) => {
            const card = position.card
            const isSelected = selectedCards.has(cardId)
            const isHovered = hoveredCard === cardId
            const penalty = showAspectPenalties ? calculatePenalty(card) : 0

            return (
              <ResizableCard
                key={cardId}
                card={card}
                selected={isSelected}
                hovered={isHovered}
                showPenalty={showAspectPenalties && penalty > 0}
                penaltyAmount={penalty}
                onClick={(e) => handleCardClick(cardId, e)}
                onMouseEnter={(e) => onCardMouseEnter?.(cardId, card, e)}
                onMouseLeave={onCardMouseLeave}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ArenaPoolSection
