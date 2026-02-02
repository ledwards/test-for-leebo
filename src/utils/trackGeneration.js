// Utility for tracking card generations for statistical analysis
import { query } from '@/lib/db.js'

/**
 * Determine treatment type from card properties
 */
function determineTreatment(card) {
  const isHyperspace = card.variantType === 'Hyperspace'
  const isShowcase = card.variantType === 'Showcase'
  const isFoil = card.isFoil === true

  if (isShowcase) return 'showcase'
  if (isHyperspace && isFoil) return 'hyperspace_foil'
  if (isFoil) return 'foil'
  if (isHyperspace) return 'hyperspace'
  return 'base'
}

/**
 * Determine slot type from card properties and context
 */
function determineSlotType(card, context = {}) {
  if (card.isLeader) return 'leader'
  if (card.isBase) return 'base'
  if (card.isFoil) return 'foil'

  // For non-foil cards, determine by rarity
  if (card.rarity === 'Common') return 'common'
  if (card.rarity === 'Uncommon') return 'uncommon'
  if (card.rarity === 'Rare' || card.rarity === 'Legendary') return 'rare_legendary'

  return 'unknown'
}

/**
 * Track a single card generation
 *
 * @param {Object} card - The card object
 * @param {Object} options - Tracking options
 * @param {string} options.packType - 'booster' or 'leader'
 * @param {string} options.sourceType - 'draft' or 'sealed'
 * @param {number} options.sourceId - ID of the draft_pod or pool
 * @param {string} options.sourceShareId - Share ID
 * @param {string} options.slotType - Optional: override slot type determination
 * @param {number} options.packIndex - Optional: index of the pack within the pool (0-based)
 * @param {string} options.userId - Optional: UUID of the user who generated the card
 */
export async function trackCardGeneration(card, options) {
  const {
    packType,
    sourceType,
    sourceId,
    sourceShareId,
    slotType = null,
    packIndex = null,
    userId = null
  } = options

  try {
    await query(
      `INSERT INTO card_generations (
        card_id,
        set_code,
        card_name,
        card_subtitle,
        card_type,
        rarity,
        aspects,
        treatment,
        variant_type,
        is_foil,
        is_hyperspace,
        is_showcase,
        pack_type,
        slot_type,
        source_type,
        source_id,
        source_share_id,
        pack_index,
        user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        card.id,
        card.set,
        card.name,
        card.subtitle || null,
        card.type,
        card.rarity,
        card.aspects || [],
        determineTreatment(card),
        card.variantType,
        card.isFoil || false,
        card.variantType === 'Hyperspace',
        card.variantType === 'Showcase',
        packType,
        slotType || determineSlotType(card),
        sourceType,
        sourceId,
        sourceShareId,
        packIndex,
        userId
      ]
    )
  } catch (error) {
    // Log error but don't fail pack generation if tracking fails
    console.error('Failed to track card generation:', error)
  }
}

/**
 * Track multiple cards from a pack
 *
 * @param {Array} cards - Array of card objects
 * @param {Object} options - Tracking options (same as trackCardGeneration)
 */
export async function trackPackGeneration(cards, options) {
  // Track cards in parallel but don't wait for completion
  // This ensures pack generation isn't slowed down by tracking
  Promise.all(
    cards.map(card => trackCardGeneration(card, options))
  ).catch(error => {
    console.error('Failed to track pack generation:', error)
  })
}

/**
 * Bulk insert card generations for better performance
 * Use this when generating many packs at once (e.g., sealed pools, draft start)
 *
 * @param {Array} records - Array of {card, options} objects
 * @param {string} options.userId - Optional: UUID of the user who generated the cards
 */
export async function trackBulkGenerations(records) {
  if (!records || records.length === 0) return

  try {
    const values = []
    const placeholders = []

    records.forEach((record, index) => {
      const { card, options } = record
      const baseIndex = index * 19

      placeholders.push(
        `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, ` +
        `$${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, $${baseIndex + 10}, ` +
        `$${baseIndex + 11}, $${baseIndex + 12}, $${baseIndex + 13}, $${baseIndex + 14}, $${baseIndex + 15}, ` +
        `$${baseIndex + 16}, $${baseIndex + 17}, $${baseIndex + 18}, $${baseIndex + 19})`
      )

      values.push(
        card.id,
        card.set,
        card.name,
        card.subtitle || null,
        card.type,
        card.rarity,
        card.aspects || [],
        determineTreatment(card),
        card.variantType,
        card.isFoil || false,
        card.variantType === 'Hyperspace',
        card.variantType === 'Showcase',
        options.packType,
        options.slotType || determineSlotType(card),
        options.sourceType,
        options.sourceId,
        options.sourceShareId,
        options.packIndex ?? null,
        options.userId ?? null
      )
    })

    await query(
      `INSERT INTO card_generations (
        card_id, set_code, card_name, card_subtitle, card_type, rarity, aspects,
        treatment, variant_type, is_foil, is_hyperspace, is_showcase,
        pack_type, slot_type, source_type, source_id, source_share_id, pack_index, user_id
      ) VALUES ${placeholders.join(', ')}`,
      values
    )
  } catch (error) {
    console.error('Failed to track bulk generations:', error)
  }
}
