// @ts-nocheck
/**
 * ArenaView Component
 *
 * Main arena view mode for the deckbuilder.
 * Split screen layout:
 * - Top: Leader/Base selector (sideways cards, 100% width rows)
 * - Middle: Pool section with filters and grid
 * - Bottom: Deck section with cost columns
 */

import { useCallback, useMemo, type MouseEvent } from 'react'
import './ArenaView.css'
import { useDeckBuilder } from '../../contexts/DeckBuilderContext'
import { ResizableCard } from './ResizableCard'
import { ArenaPoolSection } from './ArenaPoolSection'
import { ArenaDeckSection } from './ArenaDeckSection'
import { compareByAspectTypeCostName } from '../../services/cards/cardSorting'
import type { CardData } from '../Card'

interface CardPosition {
  card: CardData
  section: string
  visible: boolean
  [key: string]: unknown
}

interface CardEntry {
  cardId: string
  position: CardPosition
}

export interface ArenaViewProps {
  onCardMouseEnter?: (card: CardData, e: MouseEvent) => void
  onCardMouseLeave?: () => void
}

export function ArenaView({
  onCardMouseEnter,
  onCardMouseLeave,
}: ArenaViewProps) {
  const {
    cardPositions,
    activeLeader,
    setActiveLeader,
    activeBase,
    setActiveBase,
    selectedCards,
    hoveredCard,
    setHoveredCard,
    setShowAspectPenalties,
    poolSortOption,
    deckSortOption,
  } = useDeckBuilder()

  // Get leaders sorted by default sort
  const leaders = useMemo((): CardEntry[] => {
    return Object.entries(cardPositions)
      .filter(([_, pos]) =>
        pos.section === 'leaders-bases' &&
        pos.visible &&
        pos.card.isLeader
      )
      .map(([cardId, position]) => ({ cardId, position }))
      .sort((a, b) => compareByAspectTypeCostName(a.position.card, b.position.card))
  }, [cardPositions])

  // Get bases sorted by default sort
  const bases = useMemo((): CardEntry[] => {
    return Object.entries(cardPositions)
      .filter(([_, pos]) =>
        pos.section === 'leaders-bases' &&
        pos.visible &&
        pos.card.isBase
      )
      .map(([cardId, position]) => ({ cardId, position }))
      .sort((a, b) => compareByAspectTypeCostName(a.position.card, b.position.card))
  }, [cardPositions])

  // Handle leader click
  const handleLeaderClick = useCallback((cardId: string) => {
    const newActiveLeader = activeLeader === cardId ? null : cardId
    setActiveLeader(newActiveLeader)
    // Show aspect penalties when selecting leader in cost mode
    if (newActiveLeader && (poolSortOption === 'cost' || deckSortOption === 'cost')) {
      setShowAspectPenalties(true)
    }
  }, [activeLeader, setActiveLeader, poolSortOption, deckSortOption, setShowAspectPenalties])

  // Handle base click
  const handleBaseClick = useCallback((cardId: string) => {
    const newActiveBase = activeBase === cardId ? null : cardId
    setActiveBase(newActiveBase)
  }, [activeBase, setActiveBase])

  // Handle hover enter for leader/base
  const handleMouseEnter = useCallback((cardId: string, card: CardData, e: MouseEvent) => {
    setHoveredCard(cardId)
    onCardMouseEnter?.(card, e)
  }, [setHoveredCard, onCardMouseEnter])

  // Handle hover leave
  const handleMouseLeave = useCallback(() => {
    setHoveredCard(null)
    onCardMouseLeave?.()
  }, [setHoveredCard, onCardMouseLeave])

  // Handle card click in pool/deck sections
  const handleCardClick = useCallback((cardId: string, e: MouseEvent) => {
    // Card toggling is handled in ArenaPoolSection and ArenaDeckSection
  }, [])

  // Handle card hover in pool/deck sections
  const handleCardMouseEnter = useCallback((cardId: string, card: CardData, e: MouseEvent) => {
    setHoveredCard(cardId)
    onCardMouseEnter?.(card, e)
  }, [setHoveredCard, onCardMouseEnter])

  return (
    <div className="arena-view">
      {/* Small screen message */}
      <div className="arena-small-screen-message">
        <h3>Arena mode works best in landscape</h3>
        <p>Turn your phone sideways.<br />Or try Playmat or Table mode.</p>
      </div>

      {/* Leader/Base Selector at top */}
      <div className="arena-leader-base-section">
        {/* Leaders row */}
        {leaders.length > 0 && (
          <>
            <div className="arena-leader-base-label">Leaders</div>
            <div className="arena-leader-base-row">
              {leaders.map(({ cardId, position }) => {
                const card = position.card
                const isHovered = hoveredCard === cardId
                const isActiveLeader = activeLeader === cardId
                // In arena mode: show grayscale on non-active leaders when one is selected
                const isInactive = activeLeader !== null && !isActiveLeader

                return (
                  <ResizableCard
                    key={cardId}
                    card={card}
                    selected={false}
                    hovered={isHovered}
                    active={isActiveLeader}
                    inactive={isInactive}
                    noRainbowBorder={true}
                    onClick={() => handleLeaderClick(cardId)}
                    onMouseEnter={(e) => handleMouseEnter(cardId, card, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                )
              })}
            </div>
          </>
        )}

        {/* Bases row */}
        {bases.length > 0 && (
          <>
            <div className="arena-leader-base-label">Bases</div>
            <div className="arena-leader-base-row">
              {bases.map(({ cardId, position }) => {
                const card = position.card
                const isHovered = hoveredCard === cardId
                const isActiveBase = activeBase === cardId
                // In arena mode: show grayscale on non-active bases when one is selected
                const isInactive = activeBase !== null && !isActiveBase

                return (
                  <ResizableCard
                    key={cardId}
                    card={card}
                    selected={false}
                    hovered={isHovered}
                    active={isActiveBase}
                    inactive={isInactive}
                    noRainbowBorder={true}
                    onClick={() => handleBaseClick(cardId)}
                    onMouseEnter={(e) => handleMouseEnter(cardId, card, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Pool Section (top half) */}
      <ArenaPoolSection
        onCardClick={handleCardClick}
        onCardMouseEnter={handleCardMouseEnter}
        onCardMouseLeave={handleMouseLeave}
      />

      {/* Deck Section (bottom half) */}
      <ArenaDeckSection
        onCardClick={handleCardClick}
        onCardMouseEnter={handleCardMouseEnter}
        onCardMouseLeave={handleMouseLeave}
      />
    </div>
  )
}

export default ArenaView
