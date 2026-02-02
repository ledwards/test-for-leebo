/**
 * Tooltip Component
 *
 * Renders a positioned tooltip overlay.
 */

export function Tooltip({ tooltip }) {
  if (!tooltip.show) return null

  return (
    <div
      className="tooltip"
      style={{
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
      }}
    >
      {tooltip.text}
    </div>
  )
}

export default Tooltip
