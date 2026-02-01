/**
 * CommonBelt
 *
 * A belt that provides common cards for booster packs using static belt assignments.
 *
 * MANUFACTURING PRINCIPLE:
 * We mimic a physical card manufacturing process. The belt is a cyclic conveyor
 * that dispenses cards in order. We do NOT use post-hoc fixes or manual corrections.
 * Instead, we ensure the belt is constructed properly from the start.
 *
 * The correct way to guarantee aspect coverage is to ensure that every segment
 * of N cards (where N = number of slots filled from this belt) contains the
 * required aspects. This is handled during belt construction, not after pack generation.
 *
 * STATIC ASSIGNMENTS:
 * Each set has a predefined list of cards assigned to Belt A or Belt B.
 * See src/belts/data/commonBeltAssignments.js for the mappings.
 *
 * BLOCK-SPECIFIC BEHAVIOR:
 *
 * Block 0 (Sets 1-3: SOR, SHD, TWI):
 * - Belt A: 60 cards (Vigilance, Command, Aggression) → fills slots 1-6
 *   CONSTRAINT: Every segment of 6 cards has at least 1 Blue, 1 Green, 1 Red
 * - Belt B: 30 cards (Cunning, Villainy, Heroism, Neutral) → fills slots 7-9
 *   CONSTRAINT: Every segment of 3 cards has at least 1 Yellow
 *
 * Block A (Sets 4-6: JTL, LOF, SEC):
 * - Belt A: 50 cards (Vigilance, Command, Villainy) → fills slots 1-4
 *   CONSTRAINT: Every segment of 4 cards has at least 1 Blue, 1 Green
 * - Belt B: 50 cards (Aggression, Cunning, Heroism, Neutral) → fills slots 6-9
 *   CONSTRAINT: Every segment of 4 cards has at least 1 Red, 1 Yellow
 *
 * DUPLICATE PREVENTION:
 * - 12-card deduplication window prevents same card appearing close together
 * - Seam deduplication ensures no duplicates at boot boundaries
 */

import { getCachedCards } from '../utils/cardCache.js'
import { COMMON_BELT_ASSIGNMENTS, getBlockForSet } from './data/commonBeltAssignments.js'

// Aspect name constants
const BLUE = 'Vigilance'
const GREEN = 'Command'
const RED = 'Aggression'
const YELLOW = 'Cunning'

/**
 * Get segment configuration for a belt based on block and belt ID
 *
 * DRAW SIZE:
 * The drawSize is how many cards are drawn from this belt per pack.
 * This is the constraint window - every drawSize consecutive cards must have required aspects.
 *
 * SEAM-AWARE REFILL:
 * When the hopper has exactly drawSize cards left, we refill. The new boot's first segment
 * is constructed to complement the remaining cards, ensuring the seam satisfies constraints.
 */
function getSegmentConfig(setCode, beltId) {
  const block = getBlockForSet(setCode)

  if (block === 0) {
    if (beltId === 'A') {
      return {
        drawSize: 6,  // Draw 6 cards per pack from Belt A
        requiredAspects: [BLUE, GREEN, RED]
      }
    } else {
      return {
        drawSize: 3,  // Draw 3 cards per pack from Belt B
        requiredAspects: [YELLOW]
      }
    }
  } else {
    // Block A (and future blocks)
    if (beltId === 'A') {
      return {
        drawSize: 4,  // Draw 4 cards per pack from Belt A
        requiredAspects: [BLUE, GREEN]
      }
    } else {
      return {
        drawSize: 4,  // Draw 4 cards per pack from Belt B
        requiredAspects: [RED, YELLOW]
      }
    }
  }
}

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
 * Check if a card has a specific aspect
 */
function cardHasAspect(card, aspect) {
  return card.aspects && card.aspects.includes(aspect)
}

/**
 * Build a constrained boot where any window of N consecutive cards has required aspects.
 *
 * SEAM-AWARE CONSTRUCTION:
 * When seamCards are provided, the first segment of the new boot is constructed
 * to complement them. This ensures draws that span the seam still satisfy constraints.
 *
 * Example: If drawSize=6, seamCards=[B,B,G] (3 cards), and we need B,G,R:
 * - The seam window is [seam0, seam1, seam2, boot0, boot1, boot2]
 * - Seam has B,G but no R
 * - So boot[0:3] must include at least R
 *
 * @param {Array} cards - All cards in the belt
 * @param {number} drawSize - Number of cards drawn per pack from this belt
 * @param {Array} requiredAspects - Aspects that must appear in each window
 * @param {Set} excludedIds - Card IDs to exclude (for deduplication)
 * @param {Array} seamCards - Cards remaining from previous boot (will be drawn first)
 */
function buildConstrainedBoot(cards, drawSize, requiredAspects, excludedIds = new Set(), seamCards = []) {
  if (cards.length === 0) return []

  // Filter out excluded cards first
  const availableCards = cards.filter(c => !excludedIds.has(c.id))

  if (requiredAspects.length === 0 || availableCards.length === 0) {
    return shuffle([...availableCards])
  }

  const beltSize = availableCards.length

  // Categorize cards by their aspect coverage
  const aspectCards = new Map() // aspect -> cards with this aspect
  requiredAspects.forEach(a => aspectCards.set(a, []))
  const otherCards = [] // cards with no required aspects

  for (const card of availableCards) {
    const cardAspects = card.aspects || []
    const matchingRequired = requiredAspects.filter(a => cardAspects.includes(a))

    if (matchingRequired.length === 0) {
      otherCards.push(card)
    } else {
      // Add to each matching aspect's pool
      for (const aspect of matchingRequired) {
        aspectCards.get(aspect).push(card)
      }
    }
  }

  // Shuffle all pools
  shuffle(otherCards)
  aspectCards.forEach(pool => shuffle(pool))

  // Build the belt
  const belt = new Array(beltSize).fill(null)
  const usedCards = new Set() // Track cards already placed (by id)

  // SEAM-AWARE: First, handle the seam window
  // If we have seam cards, figure out what aspects are missing and
  // ensure the first (drawSize - seamCards.length) positions have them
  if (seamCards.length > 0 && seamCards.length < drawSize) {
    // Find which aspects the seam cards already have
    const seamAspects = new Set()
    for (const card of seamCards) {
      const cardAspects = card.aspects || []
      for (const aspect of cardAspects) {
        if (requiredAspects.includes(aspect)) {
          seamAspects.add(aspect)
        }
      }
    }

    // Find missing aspects that must appear in the first part of the boot
    const missingAspects = requiredAspects.filter(a => !seamAspects.has(a))
    const seamWindowSize = drawSize - seamCards.length

    // Place cards with missing aspects in the first seamWindowSize positions
    let pos = 0
    for (const aspect of missingAspects) {
      if (pos >= seamWindowSize) break

      const pool = aspectCards.get(aspect)
      // Find a card with this aspect that hasn't been used
      const card = pool.find(c => !usedCards.has(c.id))
      if (card) {
        belt[pos] = card
        usedCards.add(card.id)
        pos++
      }
    }
  }

  // Now place remaining aspect cards at evenly distributed positions
  // Use a staggered offset for each aspect to avoid clustering
  let aspectIndex = 0
  for (const aspect of requiredAspects) {
    const pool = aspectCards.get(aspect)
    const unusedPool = pool.filter(c => !usedCards.has(c.id))
    if (unusedPool.length === 0) continue

    // Calculate ideal spacing
    const numCards = unusedPool.length
    const idealSpacing = beltSize / numCards

    // Offset each aspect slightly to spread them out
    const offset = Math.floor((aspectIndex * idealSpacing) / requiredAspects.length)

    let poolIdx = 0
    for (let i = 0; i < numCards; i++) {
      // Calculate target position
      const basePos = Math.floor(i * idealSpacing + offset) % beltSize

      // Find the nearest empty slot (search forward)
      let targetPos = basePos
      let attempts = 0
      while (belt[targetPos] !== null && attempts < beltSize) {
        targetPos = (targetPos + 1) % beltSize
        attempts++
      }

      if (belt[targetPos] === null && poolIdx < unusedPool.length) {
        belt[targetPos] = unusedPool[poolIdx]
        usedCards.add(unusedPool[poolIdx].id)
        poolIdx++
      }
    }

    aspectIndex++
  }

  // Fill remaining empty positions with other cards, then leftover aspect cards
  const remainingCards = [
    ...otherCards.filter(c => !usedCards.has(c.id)),
    ...availableCards.filter(c => !usedCards.has(c.id))
  ]
  shuffle(remainingCards)

  let fillIdx = 0
  for (let i = 0; i < beltSize; i++) {
    if (belt[i] === null && fillIdx < remainingCards.length) {
      belt[i] = remainingCards[fillIdx]
      fillIdx++
    }
  }

  // Remove any remaining nulls (shouldn't happen if we have enough cards)
  return belt.filter(c => c !== null)
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

    // Get segment configuration for constrained boot building
    this.segmentConfig = getSegmentConfig(setCode, beltId)

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
   *
   * SEAM-AWARE REFILL:
   * We refill when hopper has exactly drawSize cards left.
   * This means the remaining cards will be drawn as one complete pack,
   * then the new boot starts fresh. The new boot's first segment is
   * constructed to complement the seam cards.
   */
  _fillIfNeeded() {
    // Safety check: if no cards in belt, can't fill
    if (this.beltCards.length === 0) {
      return
    }

    const { drawSize } = this.segmentConfig

    // Refill when we have drawSize or fewer cards left
    if (this.hopper.length <= drawSize) {
      this._fill()
    }
  }

  /**
   * Fill the hopper with constrained shuffled cards from this belt
   *
   * SEAM-AWARE CONSTRUCTION:
   * The remaining cards in the hopper (the "seam cards") will be drawn next.
   * We pass them to the boot builder so it can construct the first segment
   * to complement them - ensuring the seam satisfies aspect constraints.
   */
  _fill() {
    const { drawSize } = this.segmentConfig

    // The seam cards are what's left in the hopper
    // These will be drawn before the new boot's cards
    const seamCards = [...this.hopper]

    // Seed recentIds with seam cards for deduplication
    this.recentIds = seamCards.map(c => c.id)

    // Build constrained boot, aware of seam cards
    const boot = this._buildConstrainedBoot(seamCards)
    this.hopper.push(...boot)
  }

  /**
   * Build a constrained boot where every segment has required aspects.
   *
   * SEAM-AWARE:
   * The first segment is constructed to complement the seam cards,
   * ensuring draws that span the seam still have required aspects.
   */
  _buildConstrainedBoot(seamCards = []) {
    const { drawSize, requiredAspects } = this.segmentConfig

    // Create exclusion set from recent IDs for deduplication
    const excludedIds = new Set(this.recentIds)

    // Build the constrained belt with exclusions and seam awareness
    const boot = buildConstrainedBoot(
      this.beltCards,
      drawSize,
      requiredAspects,
      excludedIds,
      seamCards
    )

    // Update recent IDs with the new boot cards
    for (const card of boot) {
      this.recentIds.push(card.id)
      if (this.recentIds.length > this.DEDUP_WINDOW) {
        this.recentIds.shift()
      }
    }

    return boot
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
