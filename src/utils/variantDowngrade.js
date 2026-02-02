/**
 * Variant Downgrade Utilities
 *
 * Converts variant cards (Hyperspace, Foil, Showcase, Hyperspace Foil) to their
 * Normal/base equivalents for export to external tools like swudb.com.
 *
 * Key concepts:
 * - Each card has multiple variants (Normal, Hyperspace, Foil, Showcase, etc.)
 * - All variants share the same name and type, but have different variantType
 * - For export, we need the Normal variant's cardId in SWUDB format (e.g., "SOR_011")
 * - SWUDB expects 3-digit zero-padded card numbers (SEC_012, not SEC_12)
 * - We use name+type as the key to find the base card, because some characters
 *   (like Leia Organa) exist as both Leaders and Units
 */

import { getCachedCards } from './cardCache.js'

/**
 * Format a cardId for SWUDB export.
 * Converts "SEC-12" to "SEC_012" (underscore + 3-digit zero-padded number).
 *
 * @param {string} cardId - The card ID (e.g., "SEC-12" or "SOR-200")
 * @returns {string} SWUDB-formatted ID (e.g., "SEC_012" or "SOR_200")
 */
function formatCardIdForExport(cardId) {
  if (!cardId) return null

  // Split on hyphen to get set code and number
  const parts = cardId.split('-')
  if (parts.length !== 2) {
    // Fallback: just replace hyphen with underscore
    return cardId.replace(/-/g, '_')
  }

  const [setCode, numberStr] = parts
  const number = parseInt(numberStr, 10)

  // Zero-pad to 3 digits for SWUDB compatibility
  const paddedNumber = number.toString().padStart(3, '0')

  return `${setCode}_${paddedNumber}`
}

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
 * Converts any variant card to its Normal equivalent's cardId in SWUDB format.
 * For example:
 * - Hyperspace "Leia Organa" Leader -> "SOR_008" (the Normal Leader's cardId)
 * - Foil "TIE Fighter" Unit -> "SOR_045" (the Normal Unit's cardId)
 *
 * @param {Object} card - The card to get the base ID for
 * @param {Map<string, Object>} baseCardMap - Map from buildBaseCardMap()
 * @returns {string|null} The base card ID in SWUDB format (SET_XXX), or null if not found
 */
export function getBaseCardId(card, baseCardMap) {
  if (!card) return null

  // Look up the Normal variant by name + type
  const key = `${card.name}|${card.type}`
  const baseCard = baseCardMap?.get(key)

  if (baseCard && baseCard.cardId) {
    // Return cardId in SWUDB format (e.g., "SOR_011" with zero-padding)
    return formatCardIdForExport(baseCard.cardId)
  }

  // Fallback: use the card's own cardId if available
  if (card.cardId) {
    return formatCardIdForExport(card.cardId)
  }

  // Last resort: return null
  return null
}
