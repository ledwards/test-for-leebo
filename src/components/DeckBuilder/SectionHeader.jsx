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
 */

import { SortControls } from './SortControls'
import { FilterWithModal } from './FilterWithModal'
import { AspectPenaltyToggle } from './AspectPenaltyToggle'
import { BulkMoveButtons } from './BulkMoveButtons'

export function SectionHeader({
  id,
  title,
  mode = 'deck',
  cardCount,
  expanded,
  onToggleExpanded,
  sortOption,
  onSortChange,
  filterOpen,
  onFilterToggle,
  onFilterClose,
  cardPositions,
  setCardPositions,
  activeLeader,
  activeBase,
  filterAspectsExpanded,
  onFilterAspectsExpandedChange,
  showAspectPenalties,
  setShowAspectPenalties,
}) {
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
        cardPositions={cardPositions}
        onMoveCards={setCardPositions}
        activeLeader={activeLeader}
        activeBase={activeBase}
        filterAspectsExpanded={filterAspectsExpanded}
        onFilterAspectsExpandedChange={onFilterAspectsExpandedChange}
        cardCount={cardCount}
      />
      <AspectPenaltyToggle
        sortOption={sortOption}
        activeLeader={activeLeader}
        activeBase={activeBase}
        cardPositions={cardPositions}
        showAspectPenalties={showAspectPenalties}
        setShowAspectPenalties={setShowAspectPenalties}
      />
      <BulkMoveButtons
        cardPositions={cardPositions}
        setCardPositions={setCardPositions}
        mode={mode}
      />
    </div>
  )
}

export default SectionHeader
