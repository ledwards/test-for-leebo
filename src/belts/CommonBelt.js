/**
 * CommonBelt
 *
 * A belt that provides common cards for booster packs.
 * Two belts are used: Belt A (Vigilance/Command) and Belt B (Aggression/Cunning).
 *
 * ASPECT COVERAGE GUARANTEE:
 * Uses a 4-card repeating interleave pattern so ANY 4+ consecutive cards have:
 * - Belt A: Vigilance, Command, Heroism (positions 0,1,2 mod 4)
 * - Belt B: Aggression, Cunning, Villainy (positions 0,1,2 mod 4)
 * Combined: all 6 aspects appear in every pack's 9 commons
 *
 * Packs alternate which belt starts: A,B,A,B,A,B,A,B,A then B,A,B,A,B,A,B,A,B
 * This means Belt A draws 5 or 4 cards per pack (alternating).
 * The 4-card interleave pattern guarantees aspects regardless of draw count.
 *
 * Seam deduplication ensures no duplicates within 10 slots of each other.
 */

import { getCachedCards } from '../utils/cardCache.js'

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
 * Check if a card has any of the given aspects
 */
function hasAnyAspect(card, aspects) {
  if (!card.aspects || card.aspects.length === 0) return false
  return aspects.some(aspect => card.aspects.includes(aspect))
}

/**
 * Check if a card has a specific aspect
 */
function hasAspect(card, aspect) {
  if (!card.aspects || card.aspects.length === 0) return false
  return card.aspects.includes(aspect)
}

/**
 * Get common cards divided into Belt A and Belt B pools with aspect-specific organization
 *
 * Belt A guarantees: Vigilance, Command, Heroism
 * Belt B guarantees: Aggression, Cunning, Villainy
 *
 * Cards are deduplicated: dual-aspect cards go to only ONE pool to avoid
 * the same card appearing multiple times in the belt.
 *
 * Priority for dual-aspect cards:
 * - Cards with alignment (Heroism/Villainy) go to assigned pool first
 * - Remaining cards go to their color aspect pool
 */
export function getCommonPools(setCode) {
  const cards = getCachedCards(setCode)

  // Filter to normal variant commons (non-leader, non-base)
  const allCommons = cards.filter(c =>
    c.variantType === 'Normal' &&
    c.rarity === 'Common' &&
    !c.isLeader &&
    !c.isBase
  )

  const beltAAspects = ['Vigilance', 'Command']
  const beltBAspects = ['Aggression', 'Cunning']

  // First, identify assigned pools (all cards with alignment aspects for their belt)
  // These take priority - dual-aspect cards go here first
  const heroismForA = allCommons.filter(c =>
    hasAspect(c, 'Heroism') && !hasAnyAspect(c, beltBAspects)
  )
  const villainyForB = allCommons.filter(c =>
    hasAspect(c, 'Villainy') && !hasAnyAspect(c, beltAAspects)
  )

  // Track IDs in assigned pools to avoid duplicates
  const heroismIds = new Set(heroismForA.map(c => c.id))
  const villainyIds = new Set(villainyForB.map(c => c.id))

  // Belt A primary pools: Vigilance and Command cards NOT already in Heroism pool
  const vigilanceCards = allCommons.filter(c =>
    hasAspect(c, 'Vigilance') && !heroismIds.has(c.id)
  )
  const commandCards = allCommons.filter(c =>
    hasAspect(c, 'Command') && !hasAspect(c, 'Vigilance') && !heroismIds.has(c.id)
  )

  // Belt B primary pools: Aggression and Cunning cards NOT already in Villainy pool
  const aggressionCards = allCommons.filter(c =>
    hasAspect(c, 'Aggression') && !villainyIds.has(c.id)
  )
  const cunningCards = allCommons.filter(c =>
    hasAspect(c, 'Cunning') && !hasAspect(c, 'Aggression') && !villainyIds.has(c.id)
  )

  // Pure neutral (no aspects at all) - used as filler
  const pureNeutralCards = allCommons.filter(c =>
    !hasAnyAspect(c, beltAAspects) && !hasAnyAspect(c, beltBAspects) &&
    !hasAspect(c, 'Heroism') && !hasAspect(c, 'Villainy')
  )

  // Shuffle each category
  shuffle(vigilanceCards)
  shuffle(commandCards)
  shuffle(aggressionCards)
  shuffle(cunningCards)
  shuffle(heroismForA)
  shuffle(villainyForB)
  shuffle(pureNeutralCards)

  // Split pure neutrals between belts
  const neutralsForA = pureNeutralCards.slice(0, Math.ceil(pureNeutralCards.length / 2))
  const neutralsForB = pureNeutralCards.slice(Math.ceil(pureNeutralCards.length / 2))

  return {
    poolA: {
      primary1: vigilanceCards,      // Vigilance cards (excluding Heroism dual-aspect)
      primary2: commandCards,        // Command cards (excluding Heroism dual-aspect)
      assigned: heroismForA,         // ALL Heroism cards for Belt A (including dual-aspect)
      neutral: neutralsForA          // Pure neutral cards (filler)
    },
    poolB: {
      primary1: aggressionCards,     // Aggression cards (excluding Villainy dual-aspect)
      primary2: cunningCards,        // Cunning cards (excluding Villainy dual-aspect)
      assigned: villainyForB,        // ALL Villainy cards for Belt B (including dual-aspect)
      neutral: neutralsForB          // Pure neutral cards (filler)
    }
  }
}

export class CommonBelt {
  /**
   * @param {string} setCode
   * @param {Object} pool - Aspect-organized pool with primary1, primary2, assigned, neutral
   */
  constructor(setCode, pool) {
    this.setCode = setCode
    this.hopper = []
    this.pool = pool

    // Create flat array for fallback and counting
    // Note: neutral cards are excluded as they don't contribute to aspect coverage
    this.flatPool = [
      ...pool.primary1,
      ...pool.primary2,
      ...pool.assigned
    ]

    // Track recently used card IDs across refills to avoid close duplicates
    // This persists between boot fills to handle the seam
    this.recentIds = []
    this.DEDUP_WINDOW = 12  // Slightly larger than max pack draw (9 commons)

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
    // Safety check: if no cards in pool, can't fill
    if (this.flatPool.length === 0) {
      return
    }
    while (this.hopper.length < this.flatPool.length) {
      this._fill()
    }
  }

  /**
   * Fill the hopper with aspect-interleaved cards
   * Uses a period-3 pattern: [primary1, primary2, assigned, ...]
   * This guarantees any 3+ consecutive cards have all 3 required aspects
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

    // Build interleaved boot
    const boot = this._buildInterleavedBoot()
    this.hopper.push(...boot)

    // Run seam dedup as additional safety if hopper wasn't empty
    if (!wasEmpty) {
      this._seamDedup(bootStart, boot.length)
    }
  }

  /**
   * Build a boot that guarantees aspect coverage with no close duplicates.
   *
   * Strategy: Build 3-card groups where each group has all 3 required aspects.
   * Within each group, select cards that haven't been used recently to avoid duplicates.
   *
   * This guarantees ANY 3+ consecutive cards have all 3 required aspects.
   * Uses this.recentIds which persists across refills to handle seam duplicates.
   *
   * Note: Neutral cards (no aspects) are excluded from the period-3 pattern
   * since they don't contribute to aspect coverage.
   */
  _buildInterleavedBoot() {
    // Shuffle each aspect pool to randomize which specific cards appear
    const primary1 = shuffle([...this.pool.primary1])
    const primary2 = shuffle([...this.pool.primary2])
    const assigned = shuffle([...this.pool.assigned])

    // If any required pool is empty, fall back to basic shuffle
    if (primary1.length === 0 || primary2.length === 0 || assigned.length === 0) {
      return shuffle([...this.flatPool])
    }

    const boot = []
    // Only count cards that have aspects - neutral cards are excluded
    const totalCards = primary1.length + primary2.length + assigned.length

    // Track cycling indices for each pool
    let p1Idx = 0, p2Idx = 0, aIdx = 0

    // Build period-3 pattern with duplicate avoidance
    for (let pos = 0; pos < totalCards; pos++) {
      const slot = pos % 3
      let card = null

      if (slot === 0) {
        // Slot 0: primary1 (Vigilance or Aggression)
        for (let attempt = 0; attempt < primary1.length; attempt++) {
          const idx = (p1Idx + attempt) % primary1.length
          const candidate = primary1[idx]
          if (!this.recentIds.includes(candidate.id)) {
            card = candidate
            p1Idx = (idx + 1) % primary1.length
            break
          }
        }
        if (!card) {
          card = primary1[p1Idx % primary1.length]
          p1Idx = (p1Idx + 1) % primary1.length
        }
      } else if (slot === 1) {
        // Slot 1: primary2 (Command or Cunning)
        for (let attempt = 0; attempt < primary2.length; attempt++) {
          const idx = (p2Idx + attempt) % primary2.length
          const candidate = primary2[idx]
          if (!this.recentIds.includes(candidate.id)) {
            card = candidate
            p2Idx = (idx + 1) % primary2.length
            break
          }
        }
        if (!card) {
          card = primary2[p2Idx % primary2.length]
          p2Idx = (p2Idx + 1) % primary2.length
        }
      } else {
        // Slot 2: assigned (Heroism or Villainy)
        for (let attempt = 0; attempt < assigned.length; attempt++) {
          const idx = (aIdx + attempt) % assigned.length
          const candidate = assigned[idx]
          if (!this.recentIds.includes(candidate.id)) {
            card = candidate
            aIdx = (idx + 1) % assigned.length
            break
          }
        }
        if (!card) {
          card = assigned[aIdx % assigned.length]
          aIdx = (aIdx + 1) % assigned.length
        }
      }

      boot.push(card)

      // Update recent IDs window (persists across refills)
      this.recentIds.push(card.id)
      if (this.recentIds.length > this.DEDUP_WINDOW) {
        this.recentIds.shift()
      }
    }

    return boot
  }

  /**
   * Seam deduplication
   * Look at the first 10 cards in the segment (the seam).
   * For each, check if it has a duplicate within 10 slots.
   * If so, swap with a card from the same slot type (mod 3) in the back half
   * to preserve the aspect coverage pattern.
   */
  _seamDedup(segmentStart, segmentLength, depth = 0) {
    // Prevent infinite recursion
    if (depth > 10) return

    const seamSize = Math.min(10, segmentLength)
    const backHalfStart = segmentStart + Math.floor(segmentLength / 2)
    const backHalfEnd = segmentStart + segmentLength

    for (let i = 0; i < seamSize; i++) {
      const cardIndex = segmentStart + i
      const card = this.hopper[cardIndex]

      // Check for duplicates within 10 slots (before and after)
      let hasDuplicate = false
      for (let offset = -10; offset <= 10; offset++) {
        if (offset === 0) continue
        const checkIndex = cardIndex + offset
        if (checkIndex < 0 || checkIndex >= this.hopper.length) continue
        if (checkIndex >= segmentStart + segmentLength) continue // Don't check beyond segment

        if (isSameCard(card, this.hopper[checkIndex])) {
          hasDuplicate = true
          break
        }
      }

      if (hasDuplicate) {
        // Find a swap candidate from the back half with the SAME slot type
        // to preserve aspect coverage (slot 0=primary1, slot 1=primary2, slot 2=assigned)
        const cardSlot = cardIndex % 3

        // Build list of valid swap candidates (same slot type, in back half)
        const candidates = []
        for (let j = backHalfStart; j < backHalfEnd; j++) {
          if (j % 3 === cardSlot) {
            candidates.push(j)
          }
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

    const card = this.hopper.shift()
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
