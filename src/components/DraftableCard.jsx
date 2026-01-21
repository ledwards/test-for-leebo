'use client'

import { useState, useRef } from 'react'
import './DraftableCard.css'

function DraftableCard({
  card,
  onClick,
  onRightClick,
  onHover,
  disabled = false,
  selected = false
}) {
  const [imageError, setImageError] = useState(false)
  const [hoveredCardPreview, setHoveredCardPreview] = useState(null)
  const previewTimeoutRef = useRef(null)

  const getRarityClass = (rarity) => {
    switch (rarity) {
      case 'Legendary':
        return 'legendary'
      case 'Rare':
        return 'rare'
      case 'Uncommon':
        return 'uncommon'
      default:
        return 'common'
    }
  }

  const handleClick = () => {
    if (disabled) return
    onClick?.(card)
  }

  const handleRightClick = (e) => {
    e.preventDefault()
    onRightClick?.(e, card)
  }

  const handleMouseEnter = (e) => {
    onHover?.(card)

    const rect = e.currentTarget.getBoundingClientRect()

    // Set timeout to show preview after 1 second
    previewTimeoutRef.current = setTimeout(() => {
      // Position the preview near the card (to the right, or left if too close to right edge)
      let previewX = rect.right + 20
      const previewY = rect.top

      // Calculate preview dimensions based on card type
      const isHorizontal = card.isLeader || card.isBase
      const hasBackImage = card.backImageUrl && card.isLeader
      let previewWidth, previewHeight
      if (hasBackImage) {
        // Leader with back: side by side (horizontal front + vertical back)
        previewWidth = 504 + 360 + 20 // 504px front + 360px back + 20px gap
        previewHeight = 504 // Max height (vertical back is 504px)
      } else {
        previewWidth = isHorizontal ? 504 : 360
        previewHeight = isHorizontal ? 360 : 504
      }

      // Ensure preview stays within viewport bounds
      if (previewX + previewWidth > window.innerWidth) {
        previewX = rect.left - previewWidth - 20
        if (previewX < 0) {
          previewX = 10
        }
      }

      if (previewX < 0) {
        previewX = 10
      }

      // Adjust vertical position to keep preview within viewport
      const previewTop = previewY - previewHeight / 2
      const previewBottom = previewY + previewHeight / 2
      let adjustedY = previewY

      if (previewTop < 0) {
        adjustedY = previewHeight / 2 + 10
      }

      if (previewBottom > window.innerHeight) {
        adjustedY = window.innerHeight - previewHeight / 2 - 10
      }

      setHoveredCardPreview({ card, x: previewX, y: adjustedY })
    }, 1000)
  }

  const handleMouseLeave = () => {
    onHover?.(null)

    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current)
      previewTimeoutRef.current = null
    }
  }

  const handlePreviewMouseLeave = () => {
    setHoveredCardPreview(null)
  }

  return (
    <>
      <div
        className={`draftable-card ${getRarityClass(card.rarity)} ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''} ${card.isFoil ? 'foil' : ''} ${card.treatment === 'hyperspace' ? 'hyperspace' : ''}`}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="card-image-container">
          {card.imageUrl && !imageError ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              onError={() => setImageError(true)}
              className="card-image"
            />
          ) : (
            <div className="card-placeholder">
              <div className="placeholder-name">{card.name}</div>
              <div className="placeholder-rarity">{card.rarity}</div>
            </div>
          )}
        </div>

        <div className="card-info">
          <div className="card-name" title={card.name}>
            {card.name}
          </div>
          <div className="card-rarity-badge">{card.rarity}</div>
        </div>
      </div>

      {hoveredCardPreview && (() => {
        const previewCard = hoveredCardPreview.card
        const hasBackImage = previewCard.backImageUrl && previewCard.isLeader
        const isHorizontal = previewCard.isLeader || previewCard.isBase
        const borderRadius = '23px'

        let previewWidth, previewHeight
        if (hasBackImage) {
          previewWidth = 504 + 360 + 20
          previewHeight = 504
        } else {
          previewWidth = isHorizontal ? 504 : 360
          previewHeight = isHorizontal ? 360 : 504
        }

        return (
          <div
            className="card-preview-enlarged"
            style={{
              position: 'fixed',
              left: `${hoveredCardPreview.x}px`,
              top: `${hoveredCardPreview.y}px`,
              zIndex: 10000,
              pointerEvents: 'auto',
              transform: 'translateY(-50%)',
              width: `${previewWidth}px`,
              height: `${previewHeight}px`,
              borderRadius: borderRadius,
              overflow: 'visible',
            }}
            onMouseLeave={handlePreviewMouseLeave}
          >
            {hasBackImage ? (
              <>
                {/* Front - horizontal */}
                <div className={previewCard.isFoil ? 'card-preview-foil' : ''} style={{
                  width: '504px',
                  height: '360px',
                  overflow: 'hidden',
                  borderRadius: borderRadius,
                  boxShadow: previewCard.isFoil ? '0 0 15px rgba(255, 255, 255, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.8)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  position: 'relative',
                  display: 'inline-block',
                  marginRight: '20px',
                }}>
                  <img
                    src={previewCard.imageUrl}
                    alt={previewCard.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
                {/* Back - vertical */}
                <div className={previewCard.isFoil ? 'card-preview-foil' : ''} style={{
                  width: '360px',
                  height: '504px',
                  overflow: 'hidden',
                  borderRadius: borderRadius,
                  boxShadow: previewCard.isFoil ? '0 0 15px rgba(255, 255, 255, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.8)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  position: 'relative',
                  display: 'inline-block',
                  verticalAlign: 'top',
                }}>
                  <img
                    src={previewCard.backImageUrl}
                    alt={`${previewCard.name} (back)`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              </>
            ) : (
              <div className={previewCard.isFoil ? 'card-preview-foil' : ''} style={{
                width: `${previewWidth}px`,
                height: `${previewHeight}px`,
                overflow: 'hidden',
                borderRadius: borderRadius,
                boxShadow: previewCard.isFoil ? '0 0 15px rgba(255, 255, 255, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.8)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                position: 'relative',
              }}>
                <img
                  src={previewCard.imageUrl}
                  alt={previewCard.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
            )}
          </div>
        )
      })()}
    </>
  )
}

export default DraftableCard
