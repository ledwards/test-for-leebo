/**
 * Card Sorting Service
 *
 * Pure functions for sorting cards by various criteria.
 * Extracted from app/pool/[shareId]/deck/play/page.js
 *
 * All functions are pure: same input = same output, no side effects.
 */

/**
 * Aspect priority for sorting
 * Lower number = appears first
 */
const ASPECT_PRIORITY = {
  'Vigilance': 1,
  'Command': 2,
  'Aggression': 3,
  'Cunning': 4,
}

const PRIMARY_ASPECTS = ['Vigilance', 'Command', 'Aggression', 'Cunning']

/**
 * Generate a sort key for a card based on its aspects.
 * Used to group cards by aspect combination.
 *
 * Sort order:
 * 1. Primary aspect (Vigilance < Command < Aggression < Cunning)
 * 2. Within primary: single aspect < with Villainy < with Heroism < double primary
 * 3. Neutral/no primary aspect last
 *
 * @param {Object} card - Card object
 * @param {string[]} card.aspects - Array of aspect names
 * @returns {string} Sort key for the card
 *
 * @example
 * getAspectSortKey({ aspects: ['Vigilance'] }) // => "1_04_Vigilance"
 * getAspectSortKey({ aspects: ['Vigilance', 'Villainy'] }) // => "1_01_Vigilance_Villainy"
 * getAspectSortKey({ aspects: ['Villainy'] }) // => "E_01_Villainy"
 */
export function getAspectSortKey(card) {
  const aspects = card.aspects || []

  if (aspects.length === 0) return 'E_99_Neutral'

  const hasVillainy = aspects.includes('Villainy')
  const hasHeroism = aspects.includes('Heroism')
  const primaryAspect = aspects.find(a => PRIMARY_ASPECTS.includes(a))

  // Single aspect
  if (aspects.length === 1) {
    const aspect = aspects[0]
    if (aspect === 'Villainy') return 'E_01_Villainy'
    if (aspect === 'Heroism') return 'E_02_Heroism'
    return `${ASPECT_PRIORITY[aspect] || '9'}_04_${aspect}`
  }

  // Two aspects
  if (aspects.length === 2) {
    if (primaryAspect) {
      const prefix = ASPECT_PRIORITY[primaryAspect] || '9'
      const primaryCount = aspects.filter(a => a === primaryAspect).length
      if (hasVillainy) {
        return `${prefix}_01_${primaryAspect}_Villainy`
      } else if (hasHeroism) {
        return `${prefix}_02_${primaryAspect}_Heroism`
      } else if (primaryCount === 2) {
        return `${prefix}_03_${primaryAspect}_${primaryAspect}`
      }
    } else {
      return 'E_01_Villainy_Heroism'
    }
  }

  // More than 2 aspects
  if (primaryAspect) {
    const prefix = ASPECT_PRIORITY[primaryAspect] || '9'
    const sortedAspects = [...aspects].sort((a, b) => {
      if (a === 'Villainy') return -1
      if (b === 'Villainy') return 1
      if (a === 'Heroism') return -1
      if (b === 'Heroism') return 1
      return a.localeCompare(b)
    })
    let subOrder = '05'
    if (hasVillainy) subOrder = '01'
    else if (hasHeroism) subOrder = '02'
    return `${prefix}_${subOrder}_${sortedAspects.join('_')}`
  }

  if (hasVillainy) return 'E_01_Villainy_Multi'
  if (hasHeroism) return 'E_02_Heroism_Multi'
  return 'E_99_Neutral'
}

/**
 * Get type priority for sorting
 * Ground Unit < Space Unit < Upgrade < Event
 *
 * @param {string} type - Card type
 * @returns {number} Sort priority (lower = first)
 */
export function getTypeOrder(type) {
  if (type === 'Unit' || type === 'Ground Unit') return 1
  if (type === 'Space Unit') return 2
  if (type === 'Upgrade') return 3
  if (type === 'Event') return 4
  return 99
}

/**
 * Compare function for sorting cards by:
 * 1. Aspect combination
 * 2. Type (Ground Unit < Space Unit < Upgrade < Event)
 * 3. Cost (ascending)
 * 4. Name (alphabetical)
 *
 * @param {Object} a - First card
 * @param {Object} b - Second card
 * @returns {number} Comparison result (-1, 0, 1)
 *
 * @example
 * cards.sort(compareByAspectTypeCostName)
 */
export function compareByAspectTypeCostName(a, b) {
  // Aspect combination
  const aspectKeyA = getAspectSortKey(a)
  const aspectKeyB = getAspectSortKey(b)
  const aspectCompare = aspectKeyA.localeCompare(aspectKeyB)
  if (aspectCompare !== 0) return aspectCompare

  // Type
  const aTypeOrder = getTypeOrder(a.type || '')
  const bTypeOrder = getTypeOrder(b.type || '')
  if (aTypeOrder !== bTypeOrder) return aTypeOrder - bTypeOrder

  // Cost (low to high, nullish values last)
  const costA = a.cost !== null && a.cost !== undefined ? a.cost : 999
  const costB = b.cost !== null && b.cost !== undefined ? b.cost : 999
  if (costA !== costB) return costA - costB

  // Alphabetically by name
  const nameA = (a.name || '').toLowerCase()
  const nameB = (b.name || '').toLowerCase()
  return nameA.localeCompare(nameB)
}

/**
 * Compare function for sorting by cost then name
 *
 * @param {Object} a - First card
 * @param {Object} b - Second card
 * @returns {number} Comparison result
 */
export function compareByCostName(a, b) {
  const costA = a.cost !== null && a.cost !== undefined ? a.cost : 999
  const costB = b.cost !== null && b.cost !== undefined ? b.cost : 999
  if (costA !== costB) return costA - costB

  const nameA = (a.name || '').toLowerCase()
  const nameB = (b.name || '').toLowerCase()
  return nameA.localeCompare(nameB)
}

/**
 * Compare function for sorting by name only
 *
 * @param {Object} a - First card
 * @param {Object} b - Second card
 * @returns {number} Comparison result
 */
export function compareByName(a, b) {
  const nameA = (a.name || '').toLowerCase()
  const nameB = (b.name || '').toLowerCase()
  return nameA.localeCompare(nameB)
}

/**
 * Sort cards by aspect, type, cost, and name.
 * Creates a new array (does not mutate input).
 *
 * @param {Object[]} cards - Array of cards to sort
 * @returns {Object[]} New sorted array
 *
 * @example
 * const sorted = sortByAspect(myCards)
 */
export function sortByAspect(cards) {
  return [...cards].sort(compareByAspectTypeCostName)
}

/**
 * Sort cards by cost then name.
 * Creates a new array (does not mutate input).
 *
 * @param {Object[]} cards - Array of cards to sort
 * @returns {Object[]} New sorted array
 */
export function sortByCost(cards) {
  return [...cards].sort(compareByCostName)
}

/**
 * Sort cards alphabetically by name.
 * Creates a new array (does not mutate input).
 *
 * @param {Object[]} cards - Array of cards to sort
 * @returns {Object[]} New sorted array
 */
export function sortByName(cards) {
  return [...cards].sort(compareByName)
}

/**
 * Sort cards using the specified sort option.
 *
 * @param {Object[]} cards - Array of cards to sort
 * @param {'aspect'|'cost'|'name'} sortBy - Sort method
 * @returns {Object[]} New sorted array
 */
export function sortCards(cards, sortBy = 'aspect') {
  switch (sortBy) {
    case 'cost':
      return sortByCost(cards)
    case 'name':
      return sortByName(cards)
    case 'aspect':
    default:
      return sortByAspect(cards)
  }
}

// Aliases for backwards compatibility
export const getDefaultAspectSortKey = getAspectSortKey
export const defaultSort = compareByAspectTypeCostName
