/**
 * useCardPreview Hook
 *
 * Handles the enlarged card preview that appears on hover.
 */

import { useState, useRef, useEffect, useCallback } from 'react'

export function useCardPreview() {
  const [hoveredCardPreview, setHoveredCardPreview] = useState(null)
  const previewTimeoutRef = useRef(null)
  const previewHideTimeoutRef = useRef(null)

  // Clear preview on visibility change (tab switch) or scroll
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setHoveredCardPreview(null)
        if (previewTimeoutRef.current) {
          clearTimeout(previewTimeoutRef.current)
          previewTimeoutRef.current = null
        }
      }
    }

    const handleScroll = () => {
      setHoveredCardPreview(null)
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current)
        previewTimeoutRef.current = null
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [])

  const handleCardMouseEnter = useCallback((card, event) => {
    if (!event) return

    // DISABLE enlarged preview on mobile/touch devices
    if (window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return
    }

    // Clear any existing show timeout
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current)
    }
    // Cancel any pending hide timeout
    if (previewHideTimeoutRef.current) {
      clearTimeout(previewHideTimeoutRef.current)
      previewHideTimeoutRef.current = null
    }

    // Capture the rect immediately (before timeout)
    const rect = event.currentTarget.getBoundingClientRect()

    // Set timeout to show preview after hovering
    previewTimeoutRef.current = setTimeout(() => {
      // Position the preview near the card (to the right, or left if too close to right edge)
      let previewX = rect.right + 20
      const previewY = rect.top

      // Calculate preview dimensions based on card type
      const isHorizontal = card.isLeader || card.isBase
      const hasBackImage = card.backImageUrl && card.isLeader
      let previewWidth, previewHeight
      if (hasBackImage) {
        previewWidth = 504 + 360 + 20 // 504px front + 360px back + 20px gap
        previewHeight = 504
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
    }, 400)
  }, [])

  const handleCardMouseLeave = useCallback(() => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current)
      previewTimeoutRef.current = null
    }
    setHoveredCardPreview(null)
  }, [])

  const handlePreviewMouseEnter = useCallback(() => {
    if (previewHideTimeoutRef.current) {
      clearTimeout(previewHideTimeoutRef.current)
      previewHideTimeoutRef.current = null
    }
  }, [])

  const handlePreviewMouseLeave = useCallback(() => {
    if (previewHideTimeoutRef.current) {
      clearTimeout(previewHideTimeoutRef.current)
      previewHideTimeoutRef.current = null
    }
    setHoveredCardPreview(null)
  }, [])

  return {
    hoveredCardPreview,
    handleCardMouseEnter,
    handleCardMouseLeave,
    handlePreviewMouseEnter,
    handlePreviewMouseLeave,
  }
}

export default useCardPreview
