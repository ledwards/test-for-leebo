/**
 * Aspect Combination Utilities
 *
 * Functions for working with card aspect combinations (grouping keys, display names, icons).
 */

/**
 * Get aspect combination grouping key for a card.
 * Used for grouping cards by aspect combination in list view.
 */
export function getAspectCombinationKey(card) {
  const aspects = card.aspects || []
  if (aspects.length === 0) return 'neutral'

  const hasVillainy = aspects.includes('Villainy')
  const hasHeroism = aspects.includes('Heroism')
  const primaryAspects = ['Vigilance', 'Command', 'Aggression', 'Cunning']
  const primaryAspect = aspects.find(a => primaryAspects.includes(a))

  // Single aspect
  if (aspects.length === 1) {
    const aspect = aspects[0]
    // Single primary aspect (includes double primary like Vig Vig)
    if (primaryAspects.includes(aspect)) {
      return aspect.toLowerCase() // e.g., "vigilance", "command"
    }
    if (aspect === 'Villainy') return 'villainy'
    if (aspect === 'Heroism') return 'heroism'
    return 'neutral'
  }

  // Two aspects
  if (aspects.length === 2) {
    if (primaryAspect) {
      // Check if it's double primary (e.g., Vigilance Vigilance)
      const primaryCount = aspects.filter(a => a === primaryAspect).length
      if (primaryCount === 2) {
        // Double primary - separate key (e.g., "command_command")
        return `${primaryAspect.toLowerCase()}_${primaryAspect.toLowerCase()}`
      }
      if (hasVillainy) {
        return `${primaryAspect.toLowerCase()}_villainy` // e.g., "vigilance_villainy"
      }
      if (hasHeroism) {
        return `${primaryAspect.toLowerCase()}_heroism` // e.g., "vigilance_heroism"
      }
    } else {
      // Villainy + Heroism
      return 'villainy_heroism'
    }
  }

  // More than 2 aspects - use first primary aspect
  if (primaryAspect) {
    const sortedAspects = [...aspects].sort()
    return sortedAspects.join('_').toLowerCase()
  }

  return 'neutral'
}

/**
 * Get display name for an aspect combination key.
 * Converts keys like "vigilance_villainy" to "Vigilance Villainy".
 */
export function getAspectCombinationDisplayName(key) {
  const displayNames = {
    'vigilance': 'Vigilance',
    'command': 'Command',
    'aggression': 'Aggression',
    'cunning': 'Cunning',
    'villainy': 'Villainy',
    'heroism': 'Heroism',
    'neutral': 'Neutral'
  }

  const parts = key.split('_')
  if (parts.length === 1) {
    // Single aspect
    return displayNames[parts[0]] || parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  } else if (parts.length === 2) {
    // Two aspects
    const firstDisplay = displayNames[parts[0]] || parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    const secondDisplay = displayNames[parts[1]] || parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
    return `${firstDisplay} ${secondDisplay}`
  }
  // More than 2 aspects - capitalize each part
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
}

/**
 * Get aspect key for sorting (legacy, used for 'aspect' sort option).
 * Returns a sortable key like "A_Vigilance" or "B_Command".
 */
export function getAspectKey(card) {
  const aspects = card.aspects || []
  if (aspects.length === 0) return 'ZZZ_Neutral'

  // Single aspects - sort by priority (alphabetical of colors: Blue, Green, Red, Yellow)
  if (aspects.length === 1) {
    const aspect = aspects[0]
    const priority = {
      'Vigilance': 'A_Vigilance',      // Blue
      'Command': 'B_Command',          // Green
      'Aggression': 'C_Aggression',    // Red
      'Cunning': 'D_Cunning',          // Yellow
      'Villainy': 'E_Villainy',
      'Heroism': 'F_Heroism'
    }
    return priority[aspect] || `G_${aspect}`
  }

  // Two aspects - return sorted combination with prefix
  const sortedAspects = [...aspects].sort()
  return `H_${sortedAspects.join(' ')}`
}
