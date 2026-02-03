/**
 * Tooltip Component
 *
 * Renders a positioned tooltip overlay.
 */

import type { CSSProperties } from 'react'

export interface TooltipData {
  show: boolean
  x: number
  y: number
  text: string
  alignLeft?: boolean
  marginRight?: string
}

export interface TooltipProps {
  tooltip: TooltipData
}

export function Tooltip({ tooltip }: TooltipProps) {
  if (!tooltip.show) return null

  const style: CSSProperties = {
    position: 'fixed',
    left: `${tooltip.x}px`,
    top: `${tooltip.y}px`,
    transform: tooltip.alignLeft
      ? 'translateX(-100%) translateY(-50%)'
      : 'translateX(-50%) translateY(-100%)',
    zIndex: 10000,
    pointerEvents: 'none',
    marginTop: tooltip.alignLeft ? '0' : '-8px',
    ...(tooltip.marginRight && { marginRight: tooltip.marginRight })
  }

  return (
    <div className="tooltip" style={style}>
      {tooltip.text}
    </div>
  )
}

export default Tooltip
