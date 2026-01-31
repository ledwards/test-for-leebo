/**
 * Aspect Penalties Service
 *
 * Pure functions for calculating aspect penalties in Star Wars Unlimited.
 * Extracted from DeckBuilder.jsx for testability and reuse.
 *
 * Game Rules:
 * - Each card has aspects (colors)
 * - Your "relevant aspects" come from your leader + base
 * - For each card aspect NOT covered by your relevant aspects, add +2 cost
 * - Some leaders have special abilities that ignore penalties for certain cards
 */

/**
 * Leader abilities that ignore aspect penalties for specific cards.
 * Key is leader name, value is { check: function, description: string }
 */
const LEADER_PENALTY_ABILITIES = {
  // SOR Hera Syndulla - ignores penalty on SPECTRE cards
  'Hera Syndulla': {
    set: 'SOR',
    check: (card) => {
      const traits = card.traits || []
      return traits.some(t => t.toUpperCase() === 'SPECTRE')
    },
    description: 'Ignores aspect penalty on Spectre cards'
  },
  // SEC Mon Mothma - ignores penalty on non-Villainy Official units
  'Mon Mothma': {
    set: 'SEC',
    check: (card) => {
      // Must be a unit
      if (card.type !== 'Unit') return false
      // Check if card has OFFICIAL trait
      const traits = card.traits || []
      const hasOfficial = traits.some(t => t.toUpperCase() === 'OFFICIAL')
      if (!hasOfficial) return false
      // Must NOT have Villainy aspect
      const aspects = card.aspects || []
      return !aspects.includes('Villainy')
    },
    description: 'Ignores aspect penalty on non-Villainy Official units'
  }
}

/**
 * Check if a leader has a penalty-ignoring ability for a specific card.
 *
 * @param {Object} card - The card to check
 * @param {Object} leaderCard - The leader card
 * @returns {boolean} True if leader ignores penalty for this card
 *
 * @example
 * leaderIgnoresPenalty(spectreCard, sorHera) // => true
 * leaderIgnoresPenalty(regularCard, sorHera) // => false
 */
export function leaderIgnoresPenalty(card, leaderCard) {
  if (!leaderCard || !leaderCard.name) return false

  const ability = LEADER_PENALTY_ABILITIES[leaderCard.name]
  if (!ability) return false

  // Check that the leader is from the correct set
  if (leaderCard.set !== ability.set) return false

  return ability.check(card)
}

/**
 * Get the description of a leader's aspect penalty ability.
 *
 * @param {Object} leaderCard - The leader card
 * @returns {string|null} Description of ability, or null if none
 *
 * @example
 * getLeaderAbilityDescription(sorHera) // => 'Ignores aspect penalty on Spectre cards'
 * getLeaderAbilityDescription(genericLeader) // => null
 */
export function getLeaderAbilityDescription(leaderCard) {
  if (!leaderCard || !leaderCard.name) return null

  const ability = LEADER_PENALTY_ABILITIES[leaderCard.name]
  if (!ability) return null

  // Check that the leader is from the correct set
  if (leaderCard.set !== ability.set) return null

  return ability.description
}

/**
 * Calculate the aspect penalty for playing a card with given leader/base.
 *
 * Game rules:
 * - Your relevant aspects are all aspects from leader + base combined
 * - Each card aspect not covered costs +2
 * - Aspects are matched one-for-one (duplicates matter)
 *
 * @param {Object} card - The card to play
 * @param {Object} leaderCard - The leader card
 * @param {Object} baseCard - The base card
 * @returns {number} The penalty (0, 2, 4, etc.)
 *
 * @example
 * // Leader has [Vigilance, Villainy], Base has [Vigilance]
 * // Card has [Vigilance, Command]
 * // Vigilance covered by leader, Command NOT covered = +2 penalty
 * calculateAspectPenalty(card, leader, base) // => 2
 */
export function calculateAspectPenalty(card, leaderCard, baseCard) {
  // Safety checks
  if (!leaderCard || !baseCard) return 0
  if (!card.aspects || card.aspects.length === 0) return 0

  // Check if leader ignores penalty for this card
  if (leaderIgnoresPenalty(card, leaderCard)) {
    return 0
  }

  // Get my aspects (leader + base) - count each instance
  const myAspects = [
    ...(leaderCard.aspects || []),
    ...(baseCard.aspects || [])
  ]

  // Get card's aspects - count each instance
  const cardAspects = [...(card.aspects || [])]

  // Subtract my aspects from card's aspects (one-for-one)
  const remainingAspects = [...cardAspects]
  for (const myAspect of myAspects) {
    const index = remainingAspects.indexOf(myAspect)
    if (index !== -1) {
      remainingAspects.splice(index, 1)
    }
  }

  // Each remaining aspect (out of aspect) adds +2 to cost
  return remainingAspects.length * 2
}

/**
 * Check if a card is "in aspect" (no penalty) for a leader/base combination.
 *
 * @param {Object} card - The card to check
 * @param {Object} leaderCard - The leader card
 * @param {Object} baseCard - The base card
 * @returns {boolean} True if card has no aspect penalty
 */
export function isInAspect(card, leaderCard, baseCard) {
  return calculateAspectPenalty(card, leaderCard, baseCard) === 0
}

/**
 * Get the effective cost of a card including aspect penalty.
 *
 * @param {Object} card - The card (must have cost property)
 * @param {Object} leaderCard - The leader card
 * @param {Object} baseCard - The base card
 * @returns {number} The effective cost (base cost + penalty)
 */
export function getEffectiveCost(card, leaderCard, baseCard) {
  const baseCost = card.cost !== null && card.cost !== undefined ? card.cost : 0
  const penalty = calculateAspectPenalty(card, leaderCard, baseCard)
  return baseCost + penalty
}

/**
 * Get relevant aspects from a leader and base.
 *
 * @param {Object} leaderCard - The leader card
 * @param {Object} baseCard - The base card
 * @returns {string[]} Combined array of aspects
 */
export function getRelevantAspects(leaderCard, baseCard) {
  return [
    ...(leaderCard?.aspects || []),
    ...(baseCard?.aspects || [])
  ]
}

// Export constants for testing
export const PENALTY_PER_ASPECT = 2
export { LEADER_PENALTY_ABILITIES }
