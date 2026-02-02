/**
 * ViewModeToggle Component
 *
 * Toggle button between grid (playmat) and list (table) views.
 */

import Button from '../Button'

export function ViewModeToggle({ viewMode, setViewMode, showNavTooltip, hideTooltip }) {
  return (
    <div className="view-controls">
      <Button
        variant="icon"
        className="view-toggle-button"
        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        onMouseEnter={(e) => showNavTooltip(viewMode === 'grid' ? 'Table View' : 'Playmat View', e)}
        onMouseLeave={hideTooltip}
      >
        {viewMode === 'grid' ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="16" height="2" fill="currentColor"/>
            <rect x="2" y="7" width="16" height="2" fill="currentColor"/>
            <rect x="2" y="11" width="16" height="2" fill="currentColor"/>
            <rect x="2" y="15" width="16" height="2" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2H8V8H2V2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M12 2H18V8H12V2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M2 12H8V18H2V12Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M12 12H18V18H12V12Z" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        )}
      </Button>
    </div>
  )
}

export default ViewModeToggle
