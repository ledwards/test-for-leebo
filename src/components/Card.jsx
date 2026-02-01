/**
 * Card Component
 *
 * Renders a card using existing canvas-card styles from DeckBuilder.css.
 * This component only manages class names - all styles come from DeckBuilder.css.
 *
 * Usage:
 *   <Card card={cardData} />
 *   <Card card={cardData} selected onClick={handleClick} />
 *   <Card card={cardData} active showPenalty penaltyAmount={2} />
 */

// Helper to get rarity color for placeholder cards
const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'Common': return '#999'
    case 'Uncommon': return '#4CAF50'
    case 'Rare': return '#2196F3'
    case 'Legendary': return '#FF9800'
    default: return '#666'
  }
}

export function Card({
  card,
  selected = false,
  hovered = false,
  active = false,
  disabled = false,
  stacked = false,
  stackIndex = 0,
  showPenalty = false,
  penaltyAmount = 0,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = '',
  style = {},
  children,
  ...rest
}) {
  if (!card) return null

  // Build class list using DeckBuilder.css class names
  const classes = [
    'canvas-card',
    card.isLeader && 'leader',
    card.isBase && 'base',
    card.isFoil && 'foil',
    card.isHyperspace && 'hyperspace',
    card.isShowcase && 'showcase',
    selected && 'selected',
    hovered && 'hovered',
    active && card.isLeader && 'active-leader',
    active && card.isBase && 'active-base',
    disabled && 'disabled',
    stacked && 'stacked',
    className,
  ].filter(Boolean).join(' ')

  // Build inline style
  const cardStyle = {
    cursor: 'pointer',
    position: 'relative',
    ...(stacked && stackIndex ? {
      left: `${stackIndex * 24}px`,
      zIndex: stackIndex
    } : {}),
    ...style
  }

  return (
    <div
      className={classes}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-card-id={card.id}
      {...rest}
    >
      {card.imageUrl ? (
        <img
          src={card.imageUrl}
          alt={card.name || 'Card'}
          className="card-image"
          draggable={false}
        />
      ) : (
        <div className="card-placeholder">
          <div className="card-name">{card.name || 'Card'}</div>
          <div className="card-rarity" style={{ color: getRarityColor(card.rarity) }}>
            {card.rarity}
          </div>
        </div>
      )}

      {/* Badges container */}
      <div className="card-badges">
        {children}
      </div>

      {/* Aspect penalty badge */}
      {showPenalty && penaltyAmount > 0 && (
        <div className="aspect-penalty-badge">
          <div className="penalty-icon">
            <img src="/icons/cost.png" alt="Cost" />
            <span className="penalty-text">+{penaltyAmount}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Card
