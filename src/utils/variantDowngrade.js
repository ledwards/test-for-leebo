/**
 * Variant Downgrade Utilities
 *
 * Converts variant cards (Hyperspace, Foil, Showcase, Hyperspace Foil) to their
 * Normal/base equivalents for export to external tools like swudb.com.
 *
 * Key concepts:
 * - Each card has multiple variants (Normal, Hyperspace, Foil, Showcase, etc.)
 * - All variants share the same name and type, but have different variantType
 * - For export, we need the Normal variant's cardId in underscore format (e.g., "SOR_11")
 * - We use name+type as the key to find the base card, because some characters
 *   (like Leia Organa) exist as both Leaders and Units
 */

import { getCachedCards } from './cardCache.js'

/**
 * Build a map of card name+type -> Normal variant card
 *
 * @param {string} setCode - The set code (e.g., 'SOR')
 * @returns {Map<string, Object>} Map of "name|type" -> Normal variant card
 */
export function buildBaseCardMap(setCode) {
  const cards = getCachedCards(setCode)
  if (!cards || cards.length === 0) return new Map()

  const nameTypeToBaseCard = new Map()

  cards.forEach(card => {
    // Only consider Normal variants as base cards
    if (card.variantType !== 'Normal') return

    // Use name + type as key to distinguish Units from Leaders with same name
    // e.g., "Emperor Palpatine" exists as both a Leader and a Unit
    const key = `${card.name}|${card.type}`

    // Store the Normal variant for this name+type
    // (there should only be one Normal variant per name+type, but if multiple, first wins)
    if (!nameTypeToBaseCard.has(key)) {
      nameTypeToBaseCard.set(key, card)
    }
  })

  return nameTypeToBaseCard
}

/**
 * Get the base card ID for export.
 *
 * Converts any variant card to its Normal equivalent's cardId in underscore format.
 * For example:
 * - Hyperspace "Leia Organa" Leader -> "SOR_8" (the Normal Leader's cardId)
 * - Foil "TIE Fighter" Unit -> "SOR_45" (the Normal Unit's cardId)
 *
 * @param {Object} card - The card to get the base ID for
 * @param {Map<string, Object>} baseCardMap - Map from buildBaseCardMap()
 * @returns {string|null} The base card ID in underscore format, or null if not found
 */
export function getBaseCardId(card, baseCardMap) {
  if (!card) return null

  // Look up the Normal variant by name + type
  const key = `${card.name}|${card.type}`
  const baseCard = baseCardMap?.get(key)

  if (baseCard && baseCard.cardId) {
    // Return cardId in underscore format (e.g., "SOR_11" instead of "SOR-11")
    return baseCard.cardId.replace(/-/g, '_')
  }

  // Fallback: use the card's own cardId if available
  if (card.cardId) {
    return card.cardId.replace(/-/g, '_')
  }

  // Last resort: return null
  return null
}
