// @ts-nocheck
/**
 * CardWithPreview Component
 *
 * Wraps Card with built-in enlarged preview behavior:
 * - Desktop: hover to show preview
 * - iPad/tablet: tap to show preview
 * - Mobile: long-press to show preview
 *
 * Use this instead of Card when you want preview functionality
 * without manually wiring up useCardPreview.
 */

import { useState, useRef, useCallback, type MouseEvent, type TouchEvent } from 'react'
import Card, { type CardProps, type CardData } from './Card'
import { CardPreview } from './DeckBuilder/CardPreview'

// Detect tablet (touch + larger screen)
function isTablet(): boolean {
  if (typeof window === 'undefined') return false
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isLargeScreen = window.innerWidth >= 768 && window.innerHeight >= 500
  return hasTouch && isLargeScreen
}

// Detect small viewport (phones)
function isSmallViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerHeight <= 500 || window.innerWidth <= 768
}

export interface CardWithPreviewProps extends Omit<CardProps, 'onMouseEnter' | 'onMouseLeave' | 'onTouchStart' | 'onTouchEnd'> {
  /** Additional handler called on click (preview handlers are automatic) */
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
}

export function CardWithPreview({ card, onClick, ...rest }: CardWithPreviewProps) {
  const [preview, setPreview] = useState<{ card: CardData; x: number; y: number; isMobile: boolean } | null>(null)
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTriggeredRef = useRef(false)

  // Desktop hover
  const handleMouseEnter = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!card || isSmallViewport()) return

    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current)

    const rect = e.currentTarget.getBoundingClientRect()

    previewTimeoutRef.current = setTimeout(() => {
      const isHorizontal = card.isLeader || card.isBase
      const previewWidth = isHorizontal ? 504 : 360
      const previewHeight = isHorizontal ? 360 : 504

      let previewX = rect.right + 20
      if (previewX + previewWidth > window.innerWidth) {
        previewX = rect.left - previewWidth - 20
        if (previewX < 0) previewX = 10
      }

      let previewY = rect.top + rect.height / 2
      if (previewY - previewHeight / 2 < 10) previewY = previewHeight / 2 + 10
      if (previewY + previewHeight / 2 > window.innerHeight - 10) previewY = window.innerHeight - previewHeight / 2 - 10

      setPreview({ card, x: previewX, y: previewY, isMobile: false })
    }, 400)
  }, [card])

  const handleMouseLeave = useCallback(() => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current)
      previewTimeoutRef.current = null
    }
    setPreview(null)
  }, [])

  // Touch handling (tablet tap / mobile long-press)
  const handleTouchStart = useCallback(() => {
    if (!card) return
    longPressTriggeredRef.current = false

    if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current)

    // Tablet: instant tap
    if (isTablet()) {
      longPressTriggeredRef.current = true
      setPreview({ card, x: 0, y: 0, isMobile: true })
      return
    }

    // Phone: long press
    longPressTimeoutRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true
      setPreview({ card, x: 0, y: 0, isMobile: true })
    }, 500)
  }, [card])

  const handleTouchEnd = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current)
      longPressTimeoutRef.current = null
    }
    if (longPressTriggeredRef.current) {
      e.preventDefault()
      longPressTriggeredRef.current = false
    }
  }, [])

  const dismissPreview = useCallback(() => {
    setPreview(null)
  }, [])

  if (!card) return null

  return (
    <>
      <Card
        card={card}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        {...rest}
      />
      {preview && (
        <CardPreview
          card={preview.card}
          x={preview.x}
          y={preview.y}
          isMobile={preview.isMobile}
          onDismiss={dismissPreview}
        />
      )}
    </>
  )
}

export default CardWithPreview
