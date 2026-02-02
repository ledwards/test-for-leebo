/**
 * Card Filtering Service
 *
 * Pure functions for filtering cards by various criteria.
 * Extracted from DeckBuilder.jsx for testability and reuse.
 */

/**
 * Default label for cards with no aspects (neutral cards)
 */
export const NO_ASPECT_LABEL = 'No Aspect'

/**
 * All possible aspect values
 */
export const ALL_ASPECTS = [
  'Vigilance',
  'Command',
  'Aggression',
  'Cunning',
  'Villainy',
  'Heroism',
]

/**
 * Check if a card matches the enabled aspect filters.
 *
 * @param {Object} card - The card to check
 * @param {Object} enabledAspects - Map of aspect name to boolean (true = enabled)
 * @param {string} neutralLabel - Label used for cards with no aspects
 * @returns {boolean} True if card matches at least one enabled aspect
 *
 * @example
 * matchesAspectFilters(
 *   { aspects: ['Vigilance'] },
 *   { Vigilance: true, Command: false },
 *   'No Aspect'
 * ) // => true
 */
export function matchesAspectFilters(card, enabledAspects, neutralLabel = NO_ASPECT_LABEL) {
  const cardAspects = card.aspects || []

  // If card has no aspects, check the neutral filter
  if (cardAspects.length === 0) {
    return enabledAspects[neutralLabel] === true
  }

  // Card must have at least one aspect that's enabled
  return cardAspects.some(aspect => enabledAspects[aspect] === true)
}

/**
 * Check if a card passes the in-aspect/out-of-aspect filter.
 *
 * @param {number} penalty - The aspect penalty for the card (0 = in-aspect)
 * @param {boolean} inAspectEnabled - Whether to show in-aspect cards
 * @param {boolean} outAspectEnabled - Whether to show out-of-aspect cards
 * @returns {boolean} True if card passes the filter
 *
 * @example
 * matchesPenaltyFilter(0, true, false) // => true (in-aspect card, showing in-aspect)
 * matchesPenaltyFilter(2, true, false) // => false (out-of-aspect card, only showing in-aspect)
 * matchesPenaltyFilter(2, true, true) // => true (out-of-aspect card, showing both)
 */
export function matchesPenaltyFilter(penalty, inAspectEnabled, outAspectEnabled) {
  const isInAspect = penalty === 0
  const isOutOfAspect = penalty > 0

  // If neither filter is enabled, nothing passes
  if (!inAspectEnabled && !outAspectEnabled) {
    return false
  }

  // If only in-aspect is enabled, out-of-aspect cards fail
  if (inAspectEnabled && !outAspectEnabled && isOutOfAspect) {
    return false
  }

  // If only out-of-aspect is enabled, in-aspect cards fail
  if (!inAspectEnabled && outAspectEnabled && isInAspect) {
    return false
  }

  return true
}

/**
 * Filter an array of cards by aspect filters.
 *
 * @param {Object[]} cards - Array of cards to filter
 * @param {Object} enabledAspects - Map of aspect name to boolean
 * @param {string} neutralLabel - Label for cards with no aspects
 * @returns {Object[]} Filtered array of cards
 */
export function filterByAspects(cards, enabledAspects, neutralLabel = NO_ASPECT_LABEL) {
  return cards.filter(card => matchesAspectFilters(card, enabledAspects, neutralLabel))
}

/**
 * Filter cards by type.
 *
 * @param {Object[]} cards - Array of cards to filter
 * @param {string|string[]} types - Type or array of types to include
 * @returns {Object[]} Filtered array of cards
 *
 * @example
 * filterByType(cards, 'Unit') // => cards where type is 'Unit'
 * filterByType(cards, ['Unit', 'Ground Unit']) // => cards where type is 'Unit' or 'Ground Unit'
 */
export function filterByType(cards, types) {
  const typeArray = Array.isArray(types) ? types : [types]
  return cards.filter(card => typeArray.includes(card.type))
}

/**
 * Filter cards by rarity.
 *
 * @param {Object[]} cards - Array of cards to filter
 * @param {string|string[]} rarities - Rarity or array of rarities to include
 * @returns {Object[]} Filtered array of cards
 */
export function filterByRarity(cards, rarities) {
  const rarityArray = Array.isArray(rarities) ? rarities : [rarities]
  return cards.filter(card => rarityArray.includes(card.rarity))
}

/**
 * Filter cards to only include leaders.
 *
 * @param {Object[]} cards - Array of cards to filter
 * @returns {Object[]} Only leader cards
 */
export function filterLeaders(cards) {
  return cards.filter(card => card.isLeader || card.type === 'Leader')
}

/**
 * Filter cards to only include bases.
 *
 * @param {Object[]} cards - Array of cards to filter
 * @returns {Object[]} Only base cards
 */
export function filterBases(cards) {
  return cards.filter(card => card.isBase || card.type === 'Base')
}

/**
 * Filter cards to exclude leaders and bases (main deck cards only).
 *
 * @param {Object[]} cards - Array of cards to filter
 * @returns {Object[]} Cards that are not leaders or bases
 */
export function filterMainDeckCards(cards) {
  return cards.filter(card =>
    !card.isBase &&
    !card.isLeader &&
    card.type !== 'Base' &&
    card.type !== 'Leader'
  )
}

/**
 * Filter cards by cost range.
 *
 * @param {Object[]} cards - Array of cards to filter
 * @param {number} minCost - Minimum cost (inclusive)
 * @param {number} maxCost - Maximum cost (inclusive)
 * @returns {Object[]} Filtered array of cards
 */
export function filterByCostRange(cards, minCost, maxCost) {
  return cards.filter(card => {
    const cost = card.cost
    if (cost === null || cost === undefined) return false
    return cost >= minCost && cost <= maxCost
  })
}

/**
 * Filter cards by name (case-insensitive substring match).
 *
 * @param {Object[]} cards - Array of cards to filter
 * @param {string} searchText - Text to search for in card names
 * @returns {Object[]} Filtered array of cards
 */
export function filterByName(cards, searchText) {
  if (!searchText || searchText.trim() === '') {
    return cards
  }
  const lowerSearch = searchText.toLowerCase()
  return cards.filter(card =>
    (card.name || '').toLowerCase().includes(lowerSearch)
  )
}

/**
 * Create default aspect filter state with all aspects enabled.
 *
 * @param {boolean} defaultEnabled - Whether aspects should be enabled by default
 * @returns {Object} Map of aspect name to boolean
 */
export function createDefaultAspectFilters(defaultEnabled = true) {
  const filters = {}
  for (const aspect of ALL_ASPECTS) {
    filters[aspect] = defaultEnabled
  }
  filters[NO_ASPECT_LABEL] = defaultEnabled
  return filters
}
