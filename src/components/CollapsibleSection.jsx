/**
 * CollapsibleSection Component
 *
 * A section with a header that can be expanded/collapsed.
 *
 * Usage:
 *   <CollapsibleSection title="Pool Cards" defaultExpanded>
 *     {children}
 *   </CollapsibleSection>
 *
 *   <CollapsibleSection
 *     title="Leaders"
 *     badge={6}
 *     expanded={leadersExpanded}
 *     onToggle={setLeadersExpanded}
 *     headerActions={<Button>+ All</Button>}
 *   >
 *     {children}
 *   </CollapsibleSection>
 */

import { useState } from 'react'
import './CollapsibleSection.css'

export function CollapsibleSection({
  title,
  badge,
  expanded: controlledExpanded,
  defaultExpanded = true,
  onToggle,
  headerActions,
  headerContent,   // Custom header content (replaces title)
  variant = 'default',  // 'default' | 'block' | 'minimal'
  className = '',
  children,
}) {
  // Support both controlled and uncontrolled modes
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const isControlled = controlledExpanded !== undefined
  const expanded = isControlled ? controlledExpanded : internalExpanded

  const handleToggle = () => {
    if (isControlled) {
      onToggle?.(!expanded)
    } else {
      setInternalExpanded(!expanded)
    }
  }

  const classes = [
    'collapsible-section',
    `collapsible-section--${variant}`,
    expanded ? 'collapsible-section--expanded' : 'collapsible-section--collapsed',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <div className="collapsible-section__header" onClick={handleToggle}>
        <span className="collapsible-section__toggle">
          {expanded ? '▼' : '▶'}
        </span>

        {headerContent || (
          <span className="collapsible-section__title">
            {title}
            {badge !== undefined && (
              <span className="collapsible-section__badge">({badge})</span>
            )}
          </span>
        )}

        {headerActions && (
          <div
            className="collapsible-section__actions"
            onClick={(e) => e.stopPropagation()}
          >
            {headerActions}
          </div>
        )}
      </div>

      {expanded && (
        <div className="collapsible-section__content">
          {children}
        </div>
      )}
    </div>
  )
}

export default CollapsibleSection
