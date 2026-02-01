/**
 * SelectionListSection Component
 *
 * Renders a list view section for Leaders or Bases with radio selection.
 * Used in List View mode for selecting the active leader or base.
 */

import { ListTableHeader } from './ListTableHeader'
import CostIcon from '../CostIcon'
import { getRarityColor } from '../../utils/aspectColors'

export function SelectionListSection({
  // Section configuration
  title,
  sectionId,
  radioName,
  // Data
  positions,
  selectedId,
  onSelect,
  // Table sorting
  tableSort,
  onSort,
  defaultSort,
  sortTableData,
  // UI state
  expanded,
  onToggleExpanded,
  // Helpers
  getAspectIcons,
  // Hover handlers
  onCardHover,
  onCardLeave,
}) {
  const sectionSort = tableSort[sectionId] || { field: null, direction: 'asc' }

  const sortedPositions = [...positions].sort((a, b) => {
    if (!sectionSort.field) {
      return defaultSort(a.card, b.card)
    }
    return sortTableData(a.card, b.card, sectionSort.field, sectionSort.direction)
  })

  return (
    <div className="list-section">
      <h2
        className="list-section-title"
        onClick={onToggleExpanded}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <span style={{ marginRight: '0.5rem' }}>{expanded ? '▼' : '▶'}</span>
        {title} ({positions.length})
      </h2>
      {expanded && positions.length > 0 && (
        <table className="list-table">
          <ListTableHeader
            sectionId={sectionId}
            tableSort={tableSort}
            onSort={onSort}
            columns={[
              { field: 'name', label: 'Title' },
              { field: 'cost', label: 'Cost' },
              { field: 'aspects', label: 'Aspects' },
              { field: 'rarity', label: 'Rarity' },
            ]}
            checkboxVisible={false}
          />
          <tbody>
            {sortedPositions.map(({ cardId, card }, idx) => {
              const aspectSymbols = getAspectIcons(card)
              const isSelected = selectedId === cardId
              return (
                <tr
                  key={`${sectionId}-${cardId}-${idx}`}
                  onMouseEnter={(e) => onCardHover(cardId, card, e)}
                  onMouseLeave={onCardLeave}
                >
                  <td>
                    <input
                      type="radio"
                      name={radioName}
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onSelect(cardId)
                        } else {
                          onSelect(null)
                        }
                      }}
                    />
                  </td>
                  <td>
                    <div className="card-name-cell">
                      <div
                        className="card-name-main"
                        style={{ cursor: 'pointer' }}
                      >
                        {card.name || 'Unknown'}
                      </div>
                      {card.subtitle && !card.isBase && (
                        <div className="card-name-subtitle">{card.subtitle}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <CostIcon cost={card.cost} size={39} />
                  </td>
                  <td className="aspects-cell">
                    {aspectSymbols && aspectSymbols.length > 0 ? aspectSymbols : <span>Neutral</span>}
                  </td>
                  <td style={{ color: getRarityColor(card.rarity) }}>{card.rarity || 'Unknown'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default SelectionListSection
