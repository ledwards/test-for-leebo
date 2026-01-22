/**
 * Runtime Card Fixes
 * Applies corrections to card data at runtime
 *
 * This module imports fixes from scripts/cardFixes.js and applies them
 * when card data is loaded, ensuring all code uses corrected data.
 */

import { cardFixes, batchFixes, customTransforms } from '../../scripts/cardFixes.js'

/**
 * Apply individual card fixes
 * @param {Array} cards - Array of card objects
 * @returns {number} Number of fixes applied
 */
function applyIndividualFixes(cards) {
  let fixCount = 0

  cardFixes.forEach(fix => {
    const card = cards.find(c => c.id === fix.id)
    if (card) {
      const oldValue = card[fix.field]
      card[fix.field] = fix.value
      fixCount++

      if (process.env.NODE_ENV === 'development') {
        console.log(`  [Fix] ${fix.id} (${card.name}): ${fix.field} = ${fix.value} (was: ${oldValue})`)
      }
    } else if (process.env.NODE_ENV === 'development') {
      console.warn(`  [Fix Warning] Card not found: ${fix.id}`)
    }
  })

  return fixCount
}

/**
 * Apply batch fixes based on conditions
 * @param {Array} cards - Array of card objects
 * @returns {number} Number of fixes applied
 */
function applyBatchFixes(cards) {
  let fixCount = 0

  batchFixes.forEach(batchFix => {
    cards.forEach(card => {
      if (batchFix.condition(card)) {
        const oldValue = card[batchFix.field]
        card[batchFix.field] = batchFix.value
        fixCount++


      }
    })
  })



  return fixCount
}

/**
 * Apply custom transformation functions
 * @param {Array} cards - Array of card objects
 * @returns {number} Number of cards transformed
 */
function applyCustomTransforms(cards) {
  let transformCount = 0

  customTransforms.forEach(transform => {


    cards.forEach((card, index) => {
      const original = JSON.stringify(card)
      const transformed = transform.transform(card)
      const modified = JSON.stringify(transformed)

      if (original !== modified) {
        cards[index] = transformed
        transformCount++
      }
    })


  })

  return transformCount
}

/**
 * Apply all fixes to card data
 * This is the main entry point called by cardData.js
 *
 * @param {Object} cardData - Raw card data from JSON { cards: [], metadata: {} }
 * @returns {Object} Fixed card data with same structure
 */
export function applyCardFixes(cardData) {
  // Handle both formats: { cards: [...] } or just [...]
  const rawCards = Array.isArray(cardData) ? cardData : (cardData.cards || [])
  const metadata = Array.isArray(cardData) ? {} : (cardData.metadata || {})

  // Clone the data to avoid mutations of the imported module
  const cards = JSON.parse(JSON.stringify(rawCards))

  if (cards.length === 0) {
    console.warn('[CardFixes] No cards to process')
    return { cards, metadata }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[CardFixes] Processing ${cards.length} cards...`)
  }

  // Track total fixes
  let totalFixes = 0

  // Apply individual fixes
  const individualFixCount = applyIndividualFixes(cards)
  totalFixes += individualFixCount

  // Apply batch fixes
  const batchFixCount = applyBatchFixes(cards)
  totalFixes += batchFixCount

  // Apply custom transforms
  const transformCount = applyCustomTransforms(cards)

  // Log summary
  console.log(`[CardFixes] Applied ${totalFixes} fixes (${individualFixCount} individual, ${batchFixCount} batch, ${transformCount} custom transforms) to ${cards.length} cards`)

  return {
    cards,
    metadata: {
      ...metadata,
      fixesAppliedAtRuntime: totalFixes,
      processedAt: new Date().toISOString(),
    }
  }
}

/**
 * Get statistics about available fixes (useful for debugging)
 * @returns {Object} Stats about configured fixes
 */
export function getFixStats() {
  return {
    individualFixes: cardFixes.length,
    batchFixes: batchFixes.length,
    customTransforms: customTransforms.length,
    total: cardFixes.length + batchFixes.length + customTransforms.length,
  }
}
