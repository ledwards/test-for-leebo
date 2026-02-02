/**
 * Card Component
 *
 * Reusable card component for displaying Star Wars: Unlimited cards.
 * Handles all card variants (foil, hyperspace, showcase) and states
 * (selected, disabled, stacked).
 *
 * @param {Object} props
 * @param {Object} props.card - Card data object
 * @param {string} props.card.id - Unique card identifier
 * @param {string} props.card.name - Card name
 * @param {string} [props.card.imageUrl] - Card image URL
 * @param {string} [props.card.rarity] - Card rarity (Common, Uncommon, Rare, Legendary)
 * @param {boolean} [props.card.isLeader] - Is this a leader card (landscape)
 * @param {boolean} [props.card.isBase] - Is this a base card (landscape)
 * @param {boolean} [props.card.isFoil] - Has foil shimmer effect
 * @param {boolean} [props.card.isHyperspace] - Has hyperspace border
 * @param {boolean} [props.card.isShowcase] - Has showcase treatment
 * @param {boolean} [props.selected=false] - Show rainbow selection border
 * @param {boolean} [props.hovered=false] - Apply hover scale effect
 * @param {boolean} [props.active=false] - Mark as active leader/base
 * @param {boolean} [props.disabled=false] - Grayscale disabled state
 * @param {boolean} [props.stacked=false] - Is part of a card stack
 * @param {number} [props.stackIndex=0] - Position in stack (for offset)
 * @param {boolean} [props.showPenalty=false] - Show aspect penalty badge
 * @param {number} [props.penaltyAmount=0] - Penalty amount to display
 * @param {Function} [props.onClick] - Click handler
 * @param {Function} [props.onMouseEnter] - Mouse enter handler
 * @param {Function} [props.onMouseLeave] - Mouse leave handler
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.style] - Additional inline styles
 * @param {React.ReactNode} [props.children] - Badge content
 *
 * @example
 * // Basic card
 * <Card card={cardData} />
 *
 * // Selected card with click handler
 * <Card card={cardData} selected onClick={handleClick} />
 *
 * // Card with aspect penalty
 * <Card card={cardData} showPenalty penaltyAmount={2} />
 *
 * // Disabled card in a stack
 * <Card card={cardData} disabled stacked stackIndex={1} />
 *
 * @see Card.css for styling
 */

import './Card.css'

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
