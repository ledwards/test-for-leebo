/**
 * CardPreview Component
 *
 * Renders an enlarged preview of a card on hover.
 * Shows both front and back for leaders with back images.
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

export function CardPreview({
  card,
  x,
  y,
  onMouseEnter,
  onMouseLeave,
}) {
  if (!card) return null

  const hasBackImage = card.backImageUrl && card.isLeader
  const isHorizontal = card.isLeader || card.isBase
  const borderRadius = '12px'

  // Calculate dimensions
  // Leaders and bases are landscape: 168px x 120px, so 3x = 504px x 360px
  // Regular cards are portrait: 120px x 168px, so 3x = 360px x 504px
  let previewWidth, previewHeight
  if (hasBackImage) {
    // Leader with back: side by side (horizontal front + vertical back)
    previewWidth = 504 + 360 + 20 // 504px front + 360px back + 20px gap
    previewHeight = 504 // Max height (vertical back is 504px)
  } else {
    previewWidth = isHorizontal ? 504 : 360
    previewHeight = isHorizontal ? 360 : 504
  }

  const isFoilOrShowcase = (card.isFoil && !card.isLeader) || card.isShowcase

  return (
    <div
      className="card-preview-enlarged"
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 9999,
        pointerEvents: 'none',
        transform: 'translateY(-50%)',
        width: `${previewWidth}px`,
        height: `${previewHeight}px`,
        borderRadius: borderRadius,
        overflow: 'visible',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
        border: 'none',
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {hasBackImage ? (
        // Show both front (horizontal) and back (vertical) side by side for leaders
        <>
          {/* Front - horizontal */}
          <div
            className={isFoilOrShowcase ? 'card-preview-foil' : ''}
            style={{
              width: '504px',
              height: '360px',
              overflow: 'hidden',
              borderRadius: borderRadius,
              boxShadow: isFoilOrShowcase ? '0 0 15px rgba(255, 255, 255, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.8)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
            }}
          >
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={`${card.name || 'Card'} - Front`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'rgba(26, 26, 46, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem',
                color: 'white',
              }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  {card.name || 'Card'} - Front
                </div>
                <div style={{ color: getRarityColor(card.rarity) }}>
                  {card.rarity}
                </div>
              </div>
            )}
          </div>
          {/* Back - vertical */}
          <div
            className={isFoilOrShowcase ? 'card-preview-foil' : ''}
            style={{
              width: '360px',
              height: '504px',
              overflow: 'hidden',
              borderRadius: borderRadius,
              boxShadow: isFoilOrShowcase ? '0 0 15px rgba(255, 255, 255, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.8)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
            }}
          >
            {card.backImageUrl ? (
              <img
                src={card.backImageUrl}
                alt={`${card.name || 'Card'} - Back`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'rgba(26, 26, 46, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem',
                color: 'white',
              }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  {card.name || 'Card'} - Back
                </div>
                <div style={{ color: getRarityColor(card.rarity) }}>
                  {card.rarity}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        // Single card (non-leader, base, or leader without back)
        <div
          className={isFoilOrShowcase ? 'card-preview-foil' : ''}
          style={{
            width: `${previewWidth}px`,
            height: `${previewHeight}px`,
            overflow: 'hidden',
            borderRadius: borderRadius,
            boxShadow: isFoilOrShowcase ? '0 0 15px rgba(255, 255, 255, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.8)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
          }}
        >
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={card.name || 'Card'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'rgba(26, 26, 46, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '1rem',
              color: 'white',
            }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                {card.name || 'Card'}
              </div>
              <div style={{ color: getRarityColor(card.rarity) }}>
                {card.rarity}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CardPreview
