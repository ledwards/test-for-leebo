'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

    // Set timeout to show preview after hovering
    previewTimeoutRef.current = setTimeout(() => {
      // Calculate preview dimensions
      const isHorizontal = card.isLeader || card.isBase
      const hasBackImage = card.backImageUrl && card.isLeader
      let previewWidth, previewHeight
      if (hasBackImage) {
        previewWidth = 504 + 360 + 20
        previewHeight = 504
      } else {
        previewWidth = isHorizontal ? 504 : 360
        previewHeight = isHorizontal ? 360 : 504
      }

      // Start centered above the card
      let previewX = rect.left + (rect.width / 2) - (previewWidth / 2)
      let previewY = rect.top - previewHeight - 10

      // Clamp to viewport - NEVER go outside
      const margin = 10
      const maxX = window.innerWidth - previewWidth - margin
      const maxY = window.innerHeight - previewHeight - margin

      if (previewX < margin) previewX = margin
      if (previewX > maxX) previewX = Math.max(margin, maxX)
      if (previewY < margin) previewY = margin
      if (previewY > maxY) previewY = Math.max(margin, maxY)

      setHoveredCardPreview({ card, x: previewX, y: previewY })
    }, 400)
  }

  const handleMouseLeave = () => {
    onHover?.(null)

    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current)
      previewTimeoutRef.current = null
    }
    setHoveredCardPreview(null)
  }

  return (
    <>
      <div
        className={`draftable-card ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''} ${card.isFoil ? 'foil' : ''} ${card.treatment === 'hyperspace' ? 'hyperspace' : ''} ${card.isLeader ? 'leader' : ''} ${card.isBase ? 'base' : ''}`}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
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

      {mounted && hoveredCardPreview && createPortal(
        (() => {
          const previewCard = hoveredCardPreview.card
          const hasBackImage = previewCard.backImageUrl && previewCard.isLeader
          const isHorizontal = previewCard.isLeader || previewCard.isBase
          const borderRadius = '12px'

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
                pointerEvents: 'none',
                width: `${previewWidth}px`,
                height: `${previewHeight}px`,
                borderRadius: borderRadius,
                overflow: 'visible',
              }}
            >
              {hasBackImage ? (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Front - horizontal */}
                  <div className={previewCard.isFoil ? 'card-preview-foil' : ''} style={{
                    width: '504px',
                    height: '360px',
                    overflow: 'hidden',
                    borderRadius: borderRadius,
                    boxShadow: previewCard.isFoil ? '0 0 15px rgba(255, 255, 255, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.8)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    position: 'relative',
                    flexShrink: 0,
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
                    flexShrink: 0,
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
                </div>
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
        })(),
        document.body
      )}
    </>
  )
}

export default DraftableCard
