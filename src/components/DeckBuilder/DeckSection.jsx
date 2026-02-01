/**
 * DeckSection Component
 *
 * Renders the Deck section in grid view.
 * Shows cards currently in the deck, grouped by sort option.
 * Uses DeckBuilderContext for shared state.
 */

import { useDeckBuilder } from '../../contexts/DeckBuilderContext'
import { SectionHeader } from './SectionHeader'
import { GroupHeader } from './GroupHeader'
import { CardGrid } from './CardGrid'
import Button from '../Button'
import { sortGroupKeys, createGetGroupKey, createDefaultSortFn, createGroupCardSortFn } from '../../utils/cardSort'
import { calculateAspectPenalty } from '../../services/cards/aspectPenalties'

export function DeckSection({
  // Required props
  getDeckCards,
  getPoolCards,
  groupCardsByName,
  renderCardStack,
  createCardRenderer,
  getAspectSymbol,
  getDefaultAspectSortKey,
  getAspectKey,
  // Expansion state
  deckExpanded,
  setDeckExpanded,
  deckGroupsExpanded,
  setDeckGroupsExpanded,
  // Filter state (not in context)
  deckFilterOpen,
  setDeckFilterOpen,
  setPoolFilterOpen,
  setFilterAspectsExpanded,
  // Ref for scroll
  deckBlocksRowRef,
}) {
  // Get values from context
  const {
    deckSortOption,
    setDeckSortOption,
    leaderCard,
    baseCard,
    showAspectPenalties,
    moveCardsToDeck,
    moveCardsToPool,
  } = useDeckBuilder()

  const deckCards = getDeckCards()

  // Toggle group expanded state
  const toggleDeckGroupExpanded = (key) => {
    setDeckGroupsExpanded(prev => ({
      ...prev,
      [key]: prev[key] === false ? true : false
    }))
  }

  // Check if group is expanded (default true)
  const isDeckGroupExpanded = (key) => deckGroupsExpanded[key] !== false

  // Helper to determine if a group key is a mono-aspect
  const isMonoAspect = (key) => {
    if (deckSortOption !== 'aspect') return false
    return key === 'A_Vigilance' || key === 'B_Command' || key === 'C_Aggression' || key === 'D_Cunning'
  }

  // Render content based on sort option
  const renderDeckContent = () => {
    if (deckCards.length === 0 && !deckExpanded) {
      return null
    }

    // Default sort - flat container
    if (deckSortOption === 'default') {
      const sortedDeckCards = [...deckCards].sort(createDefaultSortFn(getDefaultAspectSortKey))
      const groupedCards = groupCardsByName(sortedDeckCards)

      return (
        <div className="card-block deck-flat-container" style={{ width: '100%' }}>
          <div className="card-block-content">
            <CardGrid
              groups={groupedCards}
              renderCardStack={renderCardStack}
              renderCard={createCardRenderer(leaderCard, baseCard, { showDisabled: true })}
            />
          </div>
        </div>
      )
    }

    // Grouped view
    const getGroupKey = createGetGroupKey(deckSortOption, {
      showAspectPenalties,
      leaderCard,
      baseCard,
      calculateAspectPenalty,
      getAspectKey
    })

    const cardSortFn = createGroupCardSortFn(deckSortOption, getDefaultAspectSortKey)

    // Group deck cards
    const groups = {}
    deckCards.forEach(({ cardId, position }) => {
      const key = getGroupKey(position.card)
      if (!groups[key]) groups[key] = []
      groups[key].push({ cardId, position })
    })

    // Group pool cards for +All button
    const poolCardsAll = getPoolCards()
    const poolGroups = {}
    poolCardsAll.forEach(({ cardId, position }) => {
      const key = getGroupKey(position.card)
      if (!poolGroups[key]) poolGroups[key] = []
      poolGroups[key].push({ cardId, position })
    })

    const sortedKeys = sortGroupKeys(Object.keys(groups), deckSortOption, '8+')

    return (
      <>
        {sortedKeys.map(groupKey => {
          const groupCards = groups[groupKey].sort(cardSortFn)
          const groupedByName = groupCardsByName(groupCards)
          const monoAspect = isMonoAspect(groupKey)
          const expanded = isDeckGroupExpanded(groupKey)
          const blockTypeClass = deckSortOption === 'type' ? 'type-block' : deckSortOption === 'cost' ? 'cost-block' : 'aspect-block'
          const matchingPoolCards = poolGroups[groupKey] || []

          return (
            <div key={groupKey} className={`card-block deck-group-block ${monoAspect ? 'mono-aspect' : ''} ${blockTypeClass} ${!expanded ? 'collapsed' : ''}`}>
              <div className="card-block-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{ marginRight: '0.25rem', fontSize: '0.8rem', cursor: 'pointer' }}
                  onClick={() => toggleDeckGroupExpanded(groupKey)}
                >{expanded ? '▼' : '▶'}</span>
                <span style={{ cursor: 'pointer', marginRight: '0.5rem' }} onClick={() => toggleDeckGroupExpanded(groupKey)}>
                  <GroupHeader groupKey={groupKey} count={groupCards.length} sortOption={deckSortOption} getAspectSymbol={getAspectSymbol} />
                </span>
                <Button
                  variant="danger"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    moveCardsToPool(groupCards.map(({ cardId }) => cardId))
                  }}
                  className="remove-all-button"
                  disabled={groupCards.length === 0}
                >
                  - All
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    moveCardsToDeck(matchingPoolCards.map(({ cardId }) => cardId))
                  }}
                  className="add-all-button"
                  disabled={matchingPoolCards.length === 0}
                >
                  + All
                </Button>
              </div>
              {expanded && <div className="card-block-content">
                <CardGrid
                  groups={groupedByName}
                  renderCardStack={renderCardStack}
                  renderCard={createCardRenderer(leaderCard, baseCard, { showDisabled: true })}
                />
              </div>}
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div style={{ order: 1 }}>
      <SectionHeader
        id="deck-header"
        title="Deck"
        mode="deck"
        cardCount={deckCards.length}
        expanded={deckExpanded}
        onToggleExpanded={() => setDeckExpanded(!deckExpanded)}
        onSortChange={setDeckSortOption}
        filterOpen={deckFilterOpen}
        onFilterToggle={() => { setDeckFilterOpen(!deckFilterOpen); setPoolFilterOpen(false); }}
        onFilterClose={() => setDeckFilterOpen(false)}
        onFilterAspectsExpandedChange={setFilterAspectsExpanded}
      />
      {deckExpanded && (
        <div className="blocks-deck-row" ref={deckBlocksRowRef}>
          {renderDeckContent()}
        </div>
      )}
    </div>
  )
}

export default DeckSection
