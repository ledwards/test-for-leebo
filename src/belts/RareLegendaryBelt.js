/**
 * RareLegendaryBelt
 *
 * A belt that provides rare and legendary cards for booster packs.
 * Includes non-leader Rares and all Legendaries.
 *
 * Ratio varies by set:
 * - Sets 1-3: 6:1 (Rare:Legendary)
 * - Sets 4-6: 5:1 (Rare:Legendary)
 *
 * Fill algorithm:
 * - Get 1 of each Rare and 1/X of the Legendaries (where X is the ratio)
 * - Shuffle and add to hopper
 * - Repeat X times total with seam dedup between segments
 */

import { getCachedCards } from '../utils/cardCache.js'
import { getSetConfig } from '../utils/setConfigs/index.js'

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

export class RareLegendaryBelt {
  constructor(setCode) {
    this.setCode = setCode
    this.hopper = []
    this.fillingPool = []
    this.rares = []
    this.legendaries = []
    this.ratio = 6 // Default, will be set based on config

    this._initialize()
  }

  /**
   * Initialize the belt by loading cards and setting up the filling pool
   */
  _initialize() {
    const cards = getCachedCards(this.setCode)
    const config = getSetConfig(this.setCode)

    // Determine ratio based on set number
    // Sets 1-3: 6:1, Sets 4-6: 5:1
    const setNumber = config?.setNumber || 1
    this.ratio = setNumber <= 3 ? 6 : 5

    // Filter to normal variant non-leader rares and legendaries
    this.rares = cards.filter(c =>
      c.variantType === 'Normal' &&
      c.rarity === 'Rare' &&
      !c.isLeader &&
      !c.isBase
    )

    this.legendaries = cards.filter(c =>
      c.variantType === 'Normal' &&
      c.rarity === 'Legendary' &&
      !c.isLeader &&
      !c.isBase
    )

    // Filling pool is all rares + legendaries
    this.fillingPool = [...this.rares, ...this.legendaries]

    // Initial fill
    this._fillIfNeeded()
  }

  /**
   * Fill the hopper if it needs more cards
   */
  _fillIfNeeded() {
    // Safety check: if no cards in filling pool, can't fill
    if (this.fillingPool.length === 0) {
      return
    }
    while (this.hopper.length < this.fillingPool.length) {
      this._fill()
    }
  }

  /**
   * Fill the hopper with segments of rares + legendaries
   * Creates X segments where X is the ratio (5 or 6)
   * Each segment has all rares + 1/X of legendaries
   */
  _fill() {
    const wasEmpty = this.hopper.length === 0

    // Shuffle legendaries for this fill cycle
    const shuffledLegendaries = shuffle([...this.legendaries])
    const legendariesPerSegment = Math.floor(shuffledLegendaries.length / this.ratio)

    for (let i = 0; i < this.ratio; i++) {
      // Get legendaries for this segment
      const segmentStart = i * legendariesPerSegment
      const segmentEnd = i === this.ratio - 1
        ? shuffledLegendaries.length  // Last segment gets any remainder
        : segmentStart + legendariesPerSegment
      const segmentLegendaries = shuffledLegendaries.slice(segmentStart, segmentEnd)

      // Create segment with all rares + this segment's legendaries
      const segment = shuffle([...this.rares, ...segmentLegendaries])

      // Add segment to hopper
      const hopperStart = this.hopper.length
      this.hopper.push(...segment)

      // Run seam dedup (skip for first segment if hopper was empty)
      if (!(i === 0 && wasEmpty)) {
        this._seamDedup(hopperStart, segment.length)
      }
    }
  }

  /**
   * Seam deduplication
   * Look at the first 5 cards in the segment (the seam).
   * For each, check if it has a duplicate within 6 slots.
   * If so, swap with a random card from the back half of the segment.
   */
  _seamDedup(segmentStart, segmentLength, depth = 0) {
    // Prevent infinite recursion
    if (depth > 10) return

    const seamSize = Math.min(5, segmentLength)
    const backHalfStart = segmentStart + Math.floor(segmentLength / 2)
    const backHalfEnd = segmentStart + segmentLength

    for (let i = 0; i < seamSize; i++) {
      const cardIndex = segmentStart + i
      const card = this.hopper[cardIndex]

      // Check for duplicates within 6 slots (before and after)
      let hasDuplicate = false
      for (let offset = -6; offset <= 6; offset++) {
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
        // Swap with a random card from the back half of the segment
        const backHalfLength = backHalfEnd - backHalfStart
        if (backHalfLength > 0) {
          const swapIndex = backHalfStart + Math.floor(Math.random() * backHalfLength)
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
   * Get the next rare/legendary from the hopper
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
