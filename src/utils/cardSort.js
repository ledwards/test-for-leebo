/**
 * Card Sorting Utilities
 *
 * Helper functions for sorting cards in the deck builder.
 */

/**
 * Get the sort order for a card based on its type.
 * Ground Units: 1, Space Units: 2, Upgrades: 3, Events: 4, Other: 99
 */
export function getCardTypeOrder(card) {
  if (card.type === 'Unit') {
    if (card.arenas && card.arenas.includes('Ground')) return 1
    if (card.arenas && card.arenas.includes('Space')) return 2
    return 1
  }
  if (card.type === 'Upgrade') return 3
  if (card.type === 'Event') return 4
  return 99
}

/**
 * Get the sort order for a type string (legacy format).
 * Used when only the type string is available.
 */
export function getTypeStringOrder(type) {
  if (type === 'Unit' || type === 'Ground Unit') return 1
  if (type === 'Space Unit') return 2
  if (type === 'Upgrade') return 3
  if (type === 'Event') return 4
  return 99
}

/**
 * Sort group keys based on sort option.
 * Handles cost (numeric), type (predefined order), and aspect (complex ordering).
 *
 * @param {string[]} keys - Array of group keys to sort
 * @param {string} sortOption - 'cost', 'type', or 'aspect'
 * @param {string} costThreshold - The cost value that represents "X+" (default '8+')
 * @returns {string[]} Sorted array of group keys
 */
export function sortGroupKeys(keys, sortOption, costThreshold = '8+') {
  const thresholdValue = parseInt(costThreshold, 10) || 8

  return [...keys].sort((a, b) => {
    if (sortOption === 'cost') {
      const costA = a === costThreshold ? thresholdValue : parseInt(a, 10)
      const costB = b === costThreshold ? thresholdValue : parseInt(b, 10)
      return costA - costB
    }

    if (sortOption === 'type') {
      const order = { 'Ground Units': 1, 'Space Units': 2, 'Units': 1.5, 'Upgrades': 3, 'Events': 4, 'Other': 5 }
      return (order[a] || 99) - (order[b] || 99)
    }

    // Aspect sorting
    const getAspectSortOrder = (key) => {
      let aspectName = key
      if (key === 'ZZZ_Neutral') return 999
      const match = key.match(/^[A-Z]_(.+)$/)
      if (match) aspectName = match[1]

      const aspects = aspectName.includes(' ') ? aspectName.split(' ').sort() : [aspectName]
      const isDual = aspects.length === 2
      const primaryOrder = { 'Vigilance': 0, 'Command': 100, 'Aggression': 200, 'Cunning': 300, 'Villainy': 400, 'Heroism': 500 }

      if (isDual) {
        const primary = aspects.find(a => ['Vigilance', 'Command', 'Aggression', 'Cunning'].includes(a))
        const secondary = aspects.find(a => ['Villainy', 'Heroism'].includes(a))
        if (primary && secondary) {
          const secondaryOrder = { 'Villainy': 0, 'Heroism': 1 }
          return primaryOrder[primary] + secondaryOrder[secondary]
        }
        const firstAspect = aspects[0]
        if (['Vigilance', 'Command', 'Aggression', 'Cunning'].includes(firstAspect)) {
          return primaryOrder[firstAspect] + 2
        }
        return primaryOrder[firstAspect] || 999
      } else {
        const aspect = aspects[0]
        if (['Vigilance', 'Command', 'Aggression', 'Cunning'].includes(aspect)) {
          return primaryOrder[aspect] + 3
        }
        return primaryOrder[aspect] || 999
      }
    }

    return getAspectSortOrder(a) - getAspectSortOrder(b)
  })
}

/**
 * Create a function to get the group key for a card based on sort option.
 * Used for grouping cards by cost, type, or aspect.
 *
 * @param {string} sortOption - 'cost', 'type', or 'aspect'
 * @param {Object} options - Configuration options
 * @param {boolean} options.showAspectPenalties - Whether to include aspect penalties in cost
 * @param {Object|null} options.leaderCard - The active leader card
 * @param {Object|null} options.baseCard - The active base card
 * @param {function} options.calculateAspectPenalty - Function to calculate aspect penalty
 * @param {function} options.getAspectKey - Function to get aspect key for grouping
 * @returns {function} Function that returns the group key for a card
 */
export function createGetGroupKey(sortOption, {
  showAspectPenalties = false,
  leaderCard = null,
  baseCard = null,
  calculateAspectPenalty = () => 0,
  getAspectKey = () => 'Other'
} = {}) {
  return (card) => {
    if (sortOption === 'cost') {
      const baseCost = card.cost !== null && card.cost !== undefined ? card.cost : 999
      const penalty = (showAspectPenalties && leaderCard && baseCard)
        ? calculateAspectPenalty(card, leaderCard, baseCard)
        : 0
      const cost = baseCost + penalty
      if (cost >= 8) return '8+'
      return String(cost)
    } else if (sortOption === 'type') {
      if (card.type === 'Unit') {
        if (card.arenas && card.arenas.includes('Ground')) return 'Ground Units'
        if (card.arenas && card.arenas.includes('Space')) return 'Space Units'
        return 'Units'
      }
      if (card.type === 'Upgrade') return 'Upgrades'
      if (card.type === 'Event') return 'Events'
      return 'Other'
    } else {
      // Aspect grouping (default)
      return getAspectKey(card)
    }
  }
}

/**
 * Create a default sort function for flat card display.
 * Sorts by: aspect, then cost, then type, then name.
 *
 * @param {function} getDefaultAspectSortKey - Function to get aspect sort key
 * @returns {function} Comparator function for sorting card entries
 */
export function createDefaultSortFn(getDefaultAspectSortKey) {
  return (a, b) => {
    const cardA = a.position.card
    const cardB = b.position.card
    const aspectKeyA = getDefaultAspectSortKey(cardA)
    const aspectKeyB = getDefaultAspectSortKey(cardB)
    const aspectCompare = aspectKeyA.localeCompare(aspectKeyB)
    if (aspectCompare !== 0) return aspectCompare
    const costA = cardA.cost !== null && cardA.cost !== undefined ? cardA.cost : 999
    const costB = cardB.cost !== null && cardB.cost !== undefined ? cardB.cost : 999
    if (costA !== costB) return costA - costB
    const aOrder = getCardTypeOrder(cardA)
    const bOrder = getCardTypeOrder(cardB)
    if (aOrder !== bOrder) return aOrder - bOrder
    return (cardA.name || '').toLowerCase().localeCompare((cardB.name || '').toLowerCase())
  }
}

/**
 * Create a sort function for cards within groups.
 * Sorts by different criteria based on the sort option.
 *
 * @param {string} sortOption - 'cost', 'type', or 'aspect'
 * @param {function} getDefaultAspectSortKey - Function to get aspect sort key
 * @returns {function} Comparator function for sorting card entries
 */
export function createGroupCardSortFn(sortOption, getDefaultAspectSortKey) {
  return (a, b) => {
    const cardA = a.position.card
    const cardB = b.position.card

    if (sortOption === 'cost') {
      // Within cost group: aspect, type, name
      const aspectKeyA = getDefaultAspectSortKey(cardA)
      const aspectKeyB = getDefaultAspectSortKey(cardB)
      const aspectCompare = aspectKeyA.localeCompare(aspectKeyB)
      if (aspectCompare !== 0) return aspectCompare
      const aOrder = getCardTypeOrder(cardA)
      const bOrder = getCardTypeOrder(cardB)
      if (aOrder !== bOrder) return aOrder - bOrder
    } else if (sortOption === 'type') {
      // Within type group: aspect, cost, name
      const aspectKeyA = getDefaultAspectSortKey(cardA)
      const aspectKeyB = getDefaultAspectSortKey(cardB)
      const aspectCompare = aspectKeyA.localeCompare(aspectKeyB)
      if (aspectCompare !== 0) return aspectCompare
      const costA = cardA.cost !== null && cardA.cost !== undefined ? cardA.cost : 999
      const costB = cardB.cost !== null && cardB.cost !== undefined ? cardB.cost : 999
      if (costA !== costB) return costA - costB
    } else {
      // Within aspect group: cost, type, name
      const costA = cardA.cost !== null && cardA.cost !== undefined ? cardA.cost : 999
      const costB = cardB.cost !== null && cardB.cost !== undefined ? cardB.cost : 999
      if (costA !== costB) return costA - costB
      const aOrder = getCardTypeOrder(cardA)
      const bOrder = getCardTypeOrder(cardB)
      if (aOrder !== bOrder) return aOrder - bOrder
    }
    return (cardA.name || '').toLowerCase().localeCompare((cardB.name || '').toLowerCase())
  }
}
