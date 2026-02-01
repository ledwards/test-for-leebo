/**
 * useTooltip Hook
 *
 * Handles tooltip display with delayed show and mobile long press support.
 */

import { useState, useRef, useEffect, useCallback } from 'react'

export function useTooltip() {
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0, alignLeft: false })
  const tooltipTimeoutRef = useRef(null)
  const longPressTimeoutRef = useRef(null)

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current)
      }
    }
  }, [])

  // Show tooltip with delay (for cards)
  const showTooltip = useCallback((text, event) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
    }
    tooltipTimeoutRef.current = setTimeout(() => {
      const rect = event.currentTarget.getBoundingClientRect()
      setTooltip({
        show: true,
        text,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        alignLeft: false
      })
    }, 1000)
  }, [])

  // Show tooltip immediately (for nav buttons)
  const showNavTooltip = useCallback((text, event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({
      show: true,
      text,
      x: rect.left,
      y: rect.top + rect.height / 2,
      alignLeft: true
    })
  }, [])

  // Hide tooltip
  const hideTooltip = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
      tooltipTimeoutRef.current = null
    }
    setTooltip({ show: false, text: '', x: 0, y: 0, alignLeft: false })
  }, [])

  // Mobile long press handler
  const handleLongPress = useCallback((text, event) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (!isMobile) return

    longPressTimeoutRef.current = setTimeout(() => {
      const rect = event.currentTarget.getBoundingClientRect()
      setTooltip({
        show: true,
        text,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        alignLeft: false
      })
    }, 1000)
  }, [])

  // Cancel long press
  const cancelLongPress = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current)
      longPressTimeoutRef.current = null
    }
  }, [])

  return {
    tooltip,
    showTooltip,
    showNavTooltip,
    hideTooltip,
    handleLongPress,
    cancelLongPress,
  }
}

export default useTooltip
