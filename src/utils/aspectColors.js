// Global aspect color mappings (SWU standard colors)
const ASPECT_COLORS = {
  'Vigilance': '#4A90E2',    // Blue
  'Command': '#27AE60',      // Green
  'Aggression': '#E74C3C',   // Red
  'Cunning': '#F1C40F',      // Yellow
  'Villainy': '#1a1a1a',     // Black
  'Heroism': '#f0f0f0'       // White
}

// Default color for cards with no aspects
const NO_ASPECT_COLOR = '#888888'  // Grey

/**
 * Converts hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Converts RGB to hex color
 */
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }).join("")
}

/**
 * Lightens a color by a percentage (0-1)
 */
function lightenColor(hex, percent) {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  
  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * percent))
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * percent))
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * percent))
  
  return rgbToHex(r, g, b)
}

/**
 * Darkens a color by a percentage (0-1)
 */
function darkenColor(hex, percent) {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  
  const r = Math.max(0, Math.round(rgb.r * (1 - percent)))
  const g = Math.max(0, Math.round(rgb.g * (1 - percent)))
  const b = Math.max(0, Math.round(rgb.b * (1 - percent)))
  
  return rgbToHex(r, g, b)
}

/**
 * Gets the color for a card based on its aspects
 * - Single aspect: returns the base color
 * - Aspect + Heroism: returns a lighter version (whiteness factor)
 * - Aspect + Villainy: returns a darker version (blackness factor)
 * - Multiple aspects (no Heroism/Villainy): returns the first aspect color
 */
export function getAspectColor(card) {
  if (!card || !card.aspects || card.aspects.length === 0) {
    return NO_ASPECT_COLOR
  }
  
  const aspects = card.aspects
  const hasHeroism = aspects.includes('Heroism')
  const hasVillainy = aspects.includes('Villainy')
  
  // Find the primary aspect (first non-Heroism/Villainy aspect, or first if only Heroism/Villainy)
  const primaryAspect = aspects.find(a => a !== 'Heroism' && a !== 'Villainy') || aspects[0]
  const baseColor = ASPECT_COLORS[primaryAspect] || 'white'
  
  // If only Heroism or Villainy, return their color
  if (aspects.length === 1) {
    return baseColor
  }
  
  // Apply darkening/lightening for combinations
  if (hasVillainy && !hasHeroism) {
    // Villainy combination: darken by 25%
    return darkenColor(baseColor, 0.25)
  } else if (hasHeroism && !hasVillainy) {
    // Heroism combination: lighten by 20%
    return lightenColor(baseColor, 0.20)
  } else if (hasHeroism && hasVillainy) {
    // Both Heroism and Villainy: slight darken (10%) since Villainy takes precedence
    return darkenColor(baseColor, 0.10)
  }
  
  // Multiple aspects but no Heroism/Villainy: return first aspect color
  return baseColor
}

/**
 * Gets the base color for a single aspect
 */
export function getSingleAspectColor(aspect) {
  return ASPECT_COLORS[aspect] || NO_ASPECT_COLOR
}

// Rarity color mappings
const RARITY_COLORS = {
  'Common': '#999',
  'Uncommon': '#4CAF50',
  'Rare': '#2196F3',
  'Legendary': '#FF9800',
}

/**
 * Gets the display color for a card's rarity
 */
export function getRarityColor(rarity) {
  return RARITY_COLORS[rarity] || '#666'
}

export { ASPECT_COLORS, NO_ASPECT_COLOR, RARITY_COLORS }
