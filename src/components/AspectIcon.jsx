/**
 * AspectIcon Component
 *
 * Renders an aspect icon (Vigilance, Command, Aggression, Cunning, Villainy, Heroism)
 *
 * Usage:
 *   <AspectIcon aspect="Vigilance" />
 *   <AspectIcon aspect="Command" size="lg" />
 *   <AspectIcon aspect="Aggression" size="sm" withLabel />
 */

import './AspectIcon.css'

const ASPECT_MAP = {
  'Command': 'command',
  'Villainy': 'villainy',
  'Heroism': 'heroism',
  'Cunning': 'cunning',
  'Vigilance': 'vigilance',
  'Aggression': 'aggression'
}

const SIZE_MAP = {
  'xs': 12,
  'sm': 16,
  'md': 18,
  'lg': 24,
  'xl': 39  // Match cost icon size
}

export function AspectIcon({
  aspect,
  size = 'md',
  withLabel = false,
  className = '',
  style = {}
}) {
  const aspectName = ASPECT_MAP[aspect]
  if (!aspectName) return null

  const iconSize = SIZE_MAP[size] || SIZE_MAP.md

  const icon = (
    <img
      src={`/icons/${aspectName}.png`}
      alt={aspect}
      className={`aspect-icon aspect-icon--${size} ${className}`}
      style={{
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        ...style
      }}
    />
  )

  if (withLabel) {
    return (
      <span className={`aspect-icon-with-label aspect-icon-with-label--${size}`}>
        {icon}
        <span className="aspect-icon-label">{aspect}</span>
      </span>
    )
  }

  return icon
}

// Export constants for use elsewhere
export const ASPECTS = ['Vigilance', 'Command', 'Aggression', 'Cunning', 'Villainy', 'Heroism']
export const ASPECT_NAMES = ASPECT_MAP

export default AspectIcon
