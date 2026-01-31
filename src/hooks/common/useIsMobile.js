/**
 * useIsMobile Hook
 *
 * Detects if the current device is mobile based on screen width and touch capability.
 * Replaces the repeated pattern:
 * window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0
 *
 * @returns {boolean} True if device is mobile/touch-enabled
 */

import { useState, useEffect } from 'react'

/**
 * Check if current device is mobile
 * Uses screen width and touch capability detection
 *
 * @returns {boolean} True if mobile device
 */
function checkIsMobile() {
  if (typeof window === 'undefined') return false

  return (
    window.innerWidth <= 768 ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  )
}

/**
 * Hook to detect mobile device
 *
 * @param {Object} options - Options
 * @param {boolean} options.watchResize - Re-check on window resize (default: true)
 * @returns {boolean} True if mobile device
 *
 * @example
 * function MyComponent() {
 *   const isMobile = useIsMobile()
 *
 *   return (
 *     <div>
 *       {isMobile ? 'Mobile view' : 'Desktop view'}
 *     </div>
 *   )
 * }
 */
export function useIsMobile(options = {}) {
  const { watchResize = true } = options
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Initial check
    setIsMobile(checkIsMobile())

    if (!watchResize) return

    // Watch for resize
    const handleResize = () => {
      setIsMobile(checkIsMobile())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [watchResize])

  return isMobile
}

/**
 * Non-hook version for use outside of React components
 * Use this when you need to check mobile status in event handlers
 *
 * @returns {boolean} True if mobile device
 */
export function isMobileDevice() {
  return checkIsMobile()
}

export default useIsMobile
