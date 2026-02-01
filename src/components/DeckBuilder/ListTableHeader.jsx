/**
 * ListTableHeader Component
 *
 * Reusable sortable table headers for the List View.
 * Displays column headers with sort arrows based on current sort state.
 */

/**
 * Table header row with sortable columns.
 *
 * @param {Object} props
 * @param {string} props.sectionId - Section identifier for sorting
 * @param {Object} props.tableSort - Current sort state { field, direction }
 * @param {function} props.onSort - Handler for column sort clicks
 * @param {Object[]} props.columns - Column definitions [{ field, label, className? }]
 * @param {boolean} props.showCheckbox - Whether to show checkbox column
 * @param {boolean} props.checkboxVisible - Whether checkbox is visible (vs hidden placeholder)
 */
export function ListTableHeader({
  sectionId,
  tableSort,
  onSort,
  columns,
  showCheckbox = true,
  checkboxVisible = true,
}) {
  const sectionSort = tableSort[sectionId] || { field: null, direction: 'asc' }

  const getSortArrow = (field) => {
    if (sectionSort.field !== field) {
      return <span className="sort-arrow">↕</span>
    }
    return sectionSort.direction === 'asc'
      ? <span className="sort-arrow">↑</span>
      : <span className="sort-arrow">↓</span>
  }

  return (
    <thead>
      <tr>
        {showCheckbox && (
          <th
            className="checkbox-col"
            style={checkboxVisible ? {} : { visibility: 'hidden' }}
          >
            <input type="checkbox" disabled />
          </th>
        )}
        {columns.map(({ field, label, className }) => (
          <th
            key={field}
            className={`sortable ${className || ''}`}
            onClick={() => onSort(sectionId, field)}
          >
            {label}{getSortArrow(field)}
          </th>
        ))}
      </tr>
    </thead>
  )
}

export default ListTableHeader
