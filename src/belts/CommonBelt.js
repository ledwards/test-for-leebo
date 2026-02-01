/**
 * CommonBelt
 *
 * A belt that provides common cards for booster packs using static belt assignments.
 *
 * STATIC ASSIGNMENTS:
 * Each set has a predefined list of cards assigned to Belt A or Belt B.
 * See src/belts/data/commonBeltAssignments.js for the mappings.
 *
 * BLOCK-SPECIFIC BEHAVIOR:
 *
 * Block 0 (Sets 1-3: SOR, SHD, TWI):
 * - Belt A: 60 cards (Vigilance, Command, Aggression)
 * - Belt B: 30 cards (Cunning, Villainy, Heroism, Neutral)
 * - Belt A fills slots 1-6, Belt B fills slots 7-9
 *
 * Block A (Sets 4-6: JTL, LOF, SEC):
 * - Belt A: 50 cards (Vigilance, Command, Villainy)
 * - Belt B: 50 cards (Aggression, Cunning, Heroism, Neutral)
 * - Belt A fills slots 1-4, slot 5 alternates, Belt B fills slots 6-9
 *
 * DUPLICATE PREVENTION:
 * - 12-card deduplication window prevents same card appearing close together
 * - Seam deduplication ensures no duplicates at boot boundaries
 *
 * COLOR PROXIMITY:
 * - Cards are shuffled within their belt
 * - No special aspect ordering is enforced (aspect coverage comes from belt slot assignment)
 */

import { getCachedCards } from '../utils/cardCache.js'
import { COMMON_BELT_ASSIGNMENTS } from './data/commonBeltAssignments.js'

/**
 * Shuffle an array in place (Fisher-Yates)
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Check if two cards are the same (by id or name)
 */
function isSameCard(a, b) {
  if (!a || !b) return false
  return a.id === b.id || a.name === b.name
}

/**
 * Get common cards for a specific belt from static assignments
 *
 * @param {string} setCode - Set code (SOR, SHD, etc.)
 * @param {string} beltId - 'A' or 'B'
 * @returns {Array} Cards assigned to this belt
 */
export function getBeltCards(setCode, beltId) {
  const cards = getCachedCards(setCode)
  const assignments = COMMON_BELT_ASSIGNMENTS[setCode]

  if (!assignments) {
    console.warn(`No belt assignments found for set ${setCode}`)
    return []
  }

  const cardNames = beltId === 'A' ? assignments.beltA : assignments.beltB

  // Map names to card objects
  // Filter to normal variant commons (non-leader, non-base)
  const allCommons = cards.filter(c =>
    c.variantType === 'Normal' &&
    c.rarity === 'Common' &&
    c.type !== 'Leader' &&
    c.type !== 'Base'
  )

  // Create lookup by name
  const cardByName = new Map()
  allCommons.forEach(c => {
    if (!cardByName.has(c.name)) {
      cardByName.set(c.name, c)
    }
  })

  // Get cards in order specified by assignments
  const beltCards = []
  for (const name of cardNames) {
    const card = cardByName.get(name)
    if (card) {
      beltCards.push(card)
    } else {
      console.warn(`Card not found for belt assignment: ${name} in ${setCode}`)
    }
  }

  return beltCards
}

export class CommonBelt {
  /**
   * @param {string} setCode - Set code (SOR, SHD, etc.)
   * @param {string} beltId - 'A' or 'B'
   */
  constructor(setCode, beltId) {
    this.setCode = setCode
    this.beltId = beltId
    this.hopper = []

    // Get cards assigned to this belt
    this.beltCards = getBeltCards(setCode, beltId)

    // Track recently used card IDs across refills to avoid close duplicates
    // This persists between boot fills to handle the seam
    this.recentIds = []
    this.DEDUP_WINDOW = 12  // Slightly larger than max pack draw (9 commons)

    // Track total draws
    this.totalDraws = 0

    this._initialize()
  }

  /**
   * Initialize the belt
   */
  _initialize() {
    // Initial fill
    this._fillIfNeeded()
  }

  /**
   * Fill the hopper if it needs more cards
   */
  _fillIfNeeded() {
    // Safety check: if no cards in belt, can't fill
    if (this.beltCards.length === 0) {
      return
    }
    while (this.hopper.length < this.beltCards.length) {
      this._fill()
    }
  }

  /**
   * Fill the hopper with shuffled cards from this belt
   * Uses deduplication to prevent same card appearing within DEDUP_WINDOW
   */
  _fill() {
    const wasEmpty = this.hopper.length === 0
    const bootStart = this.hopper.length

    // Before building new boot, seed recentIds with remaining hopper cards
    // This ensures continuity across refills and prevents seam duplicates
    if (!wasEmpty && this.hopper.length > 0) {
      // Take the last DEDUP_WINDOW cards from current hopper
      const tailStart = Math.max(0, this.hopper.length - this.DEDUP_WINDOW)
      this.recentIds = this.hopper.slice(tailStart).map(c => c.id)
    }

    // Build shuffled boot with deduplication
    const boot = this._buildShuffledBoot()
    this.hopper.push(...boot)

    // Run seam dedup as additional safety if hopper wasn't empty
    if (!wasEmpty) {
      this._seamDedup(bootStart, boot.length)
    }
  }

  /**
   * Build a shuffled boot of cards with deduplication
   */
  _buildShuffledBoot() {
    // Shuffle a copy of the belt cards
    const shuffled = shuffle([...this.beltCards])

    const boot = []
    const usedInBoot = new Set()

    for (const card of shuffled) {
      // Skip if this card was used recently (dedup window)
      if (this.recentIds.includes(card.id)) {
        continue
      }

      // Skip if already used in this boot
      if (usedInBoot.has(card.id)) {
        continue
      }

      boot.push(card)
      usedInBoot.add(card.id)

      // Update recent IDs window
      this.recentIds.push(card.id)
      if (this.recentIds.length > this.DEDUP_WINDOW) {
        this.recentIds.shift()
      }
    }

    // If we skipped too many due to dedup, add them anyway (better than running out)
    // This handles edge cases where the belt is smaller than DEDUP_WINDOW
    if (boot.length < this.beltCards.length * 0.5) {
      for (const card of shuffled) {
        if (!usedInBoot.has(card.id)) {
          boot.push(card)
          usedInBoot.add(card.id)
        }
      }
    }

    return boot
  }

  /**
   * Seam deduplication
   * Look at the first cards in the segment (the seam).
   * For each, check if it has a duplicate within dedup window.
   * If so, swap with a card from the back half.
   */
  _seamDedup(segmentStart, segmentLength, depth = 0) {
    // Prevent infinite recursion
    if (depth > 10) return

    const seamSize = Math.min(this.DEDUP_WINDOW, segmentLength)
    const backHalfStart = segmentStart + Math.floor(segmentLength / 2)
    const backHalfEnd = segmentStart + segmentLength

    for (let i = 0; i < seamSize; i++) {
      const cardIndex = segmentStart + i
      const card = this.hopper[cardIndex]

      // Check for duplicates within dedup window (before and after)
      let hasDuplicate = false
      for (let offset = -this.DEDUP_WINDOW; offset <= this.DEDUP_WINDOW; offset++) {
        if (offset === 0) continue
        const checkIndex = cardIndex + offset
        if (checkIndex < 0 || checkIndex >= this.hopper.length) continue
        if (checkIndex >= segmentStart + segmentLength) continue

        if (isSameCard(card, this.hopper[checkIndex])) {
          hasDuplicate = true
          break
        }
      }

      if (hasDuplicate) {
        // Find a swap candidate from the back half
        const candidates = []
        for (let j = backHalfStart; j < backHalfEnd; j++) {
          candidates.push(j)
        }

        if (candidates.length > 0) {
          const swapIndex = candidates[Math.floor(Math.random() * candidates.length)]
          ;[this.hopper[cardIndex], this.hopper[swapIndex]] =
            [this.hopper[swapIndex], this.hopper[cardIndex]]

          // Run dedup again
          this._seamDedup(segmentStart, segmentLength, depth + 1)
          return
        }
      }
    }
  }

  /**
   * Get the next common from the hopper
   */
  next() {
    this._fillIfNeeded()

    if (this.hopper.length === 0) {
      console.warn(`CommonBelt ${this.beltId} for ${this.setCode} is empty`)
      return null
    }

    const card = this.hopper.shift()
    this.totalDraws++
    return { ...card } // Return a copy
  }

  /**
   * Peek at upcoming cards without removing them
   */
  peek(count = 1) {
    this._fillIfNeeded()
    return this.hopper.slice(0, count).map(c => ({ ...c }))
  }

  /**
   * Get current hopper size
   */
  get size() {
    return this.hopper.length
  }
}

/**
 * Legacy function for backward compatibility
 * Returns pool objects structured like the old getCommonPools
 * @deprecated Use getBeltCards directly
 */
export function getCommonPools(setCode) {
  const beltACards = getBeltCards(setCode, 'A')
  const beltBCards = getBeltCards(setCode, 'B')

  return {
    poolA: {
      primary1: beltACards,
      primary2: [],
      assigned: [],
      neutral: [],
    },
    poolB: {
      primary1: beltBCards,
      primary2: [],
      assigned: [],
      neutral: [],
    }
  }
}
