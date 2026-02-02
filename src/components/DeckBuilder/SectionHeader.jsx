/**
 * SectionHeader Component
 *
 * Displays the header for Deck or Pool sections with:
 * - Expand/collapse toggle
 * - Section name with card count
 * - Sort controls
 * - Filter modal button
 * - Aspect penalty toggle
 * - Bulk move buttons
 *
 * Used by both Deck and Pool sections.
 * Can use DeckBuilderContext or receive props directly.
 */

import { SortControls } from './SortControls'
import { FilterWithModal } from './FilterWithModal'
import { AspectPenaltyToggle } from './AspectPenaltyToggle'
import { BulkMoveButtons } from './BulkMoveButtons'
import { useDeckBuilder } from '../../contexts/DeckBuilderContext'

export function SectionHeader({
  id,
  title,
  mode = 'deck',
  cardCount,
  expanded,
  onToggleExpanded,
  sortOption: sortOptionProp,
  onSortChange,
  filterOpen,
  onFilterToggle,
  onFilterClose,
  // Props with context fallback
  cardPositions: cardPositionsProp,
  setCardPositions: setCardPositionsProp,
  activeLeader: activeLeaderProp,
  activeBase: activeBaseProp,
  filterAspectsExpanded: filterAspectsExpandedProp,
  onFilterAspectsExpandedChange,
  showAspectPenalties: showAspectPenaltiesProp,
  setShowAspectPenalties: setShowAspectPenaltiesProp,
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
  const setCardPositions = setCardPositionsProp ?? contextValue?.setCardPositions
  const activeLeader = activeLeaderProp ?? contextValue?.activeLeader
  const activeBase = activeBaseProp ?? contextValue?.activeBase
  const filterAspectsExpanded = filterAspectsExpandedProp ?? contextValue?.filterAspectsExpanded ?? {}
  const showAspectPenalties = showAspectPenaltiesProp ?? contextValue?.showAspectPenalties ?? false
  const setShowAspectPenalties = setShowAspectPenaltiesProp ?? contextValue?.setShowAspectPenalties
  // Sort option uses mode-specific context values
  const sortOption = sortOptionProp ?? (mode === 'deck' ? contextValue?.deckSortOption : contextValue?.poolSortOption)
  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1.5rem',
    marginBottom: '0.75rem',
    fontSize: '1.2rem',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    paddingBottom: '0.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    userSelect: 'none',
  }

  return (
    <div id={id} style={headerStyle}>
      <span
        style={{ cursor: 'pointer' }}
        onClick={onToggleExpanded}
      >
        {expanded ? '▼' : '▶'}
      </span>
      <span
        style={{ cursor: 'pointer' }}
        onClick={onToggleExpanded}
      >
        {title} ({cardCount})
      </span>
      <SortControls
        value={sortOption}
        onChange={onSortChange}
        className={mode === 'pool' ? "marginLeft: '0.5rem'" : ''}
      />
      <FilterWithModal
        isOpen={filterOpen}
        onToggle={onFilterToggle}
        onClose={onFilterClose}
        mode={mode}
        onFilterAspectsExpandedChange={onFilterAspectsExpandedChange}
        cardCount={cardCount}
      />
      <AspectPenaltyToggle sortOption={sortOption} />
      <BulkMoveButtons mode={mode} />
    </div>
  )
}

export default SectionHeader
