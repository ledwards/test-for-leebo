/**
 * CardGrid Component
 *
 * Renders a grid of card groups using the provided render function.
 * Standardizes the card grid layout used in DeckSection and PoolSection.
 */

export function CardGrid({ groups, renderCardStack, renderCard, className = '' }) {
  if (!groups || groups.length === 0) {
    return null
  }

  return (
    <div className={`cards-grid ${className}`.trim()}>
      {groups.map(group => renderCardStack(group, renderCard))}
    </div>
  )
}

export default CardGrid
