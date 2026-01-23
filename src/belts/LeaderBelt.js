/**
 * LeaderBelt
 *
 * A belt that provides leader cards for booster packs.
 * The hopper is filled with a mix of common and rare leaders,
 * with seam deduplication to prevent adjacent duplicates.
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

export class LeaderBelt {
  constructor(setCode) {
    this.setCode = setCode
    this.hopper = []
    this.fillingPool = []
    this.commonLeaders = []
    this.rareLeaders = []

    this._initialize()
  }

  /**
   * Initialize the belt by loading cards and setting up the filling pool
   */
  _initialize() {
    const cards = getCachedCards(this.setCode)

    // Filter to only normal variant leaders with Common or Rare rarity
    // (Special and Legendary leaders don't appear in booster packs)
    this.fillingPool = cards.filter(c =>
      c.isLeader &&
      c.variantType === 'Normal' &&
      (c.rarity === 'Common' || c.rarity === 'Rare')
    )

    // Separate into common and rare leaders
    // Only Common and Rare rarity leaders appear in booster packs
    this.commonLeaders = this.fillingPool.filter(c => c.rarity === 'Common')
    this.rareLeaders = this.fillingPool.filter(c => c.rarity === 'Rare')

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
   * Fill the hopper with a new batch of leaders
   */
  _fill() {
    const wasEmpty = this.hopper.length === 0

    // Shuffle rare leaders for this fill cycle
    const shuffledRares = shuffle([...this.rareLeaders])
    const raresPerSegment = Math.floor(shuffledRares.length / 3)

    // Segment 1: common leaders + first 1/3 of rare leaders
    const segment1Rares = shuffledRares.slice(0, raresPerSegment)
    const segment1 = shuffle([...this.commonLeaders, ...segment1Rares])

    // Add segment 1 to hopper
    this.hopper.push(...segment1)

    // Run seam dedup only if hopper wasn't empty before
    if (!wasEmpty) {
      this._seamDedup(this.hopper.length - segment1.length, segment1.length)
    }

    // Segment 2: common leaders + next 1/3 of rare leaders
    const segment2Rares = shuffledRares.slice(raresPerSegment, raresPerSegment * 2)
    const segment2 = shuffle([...this.commonLeaders, ...segment2Rares])

    // Add segment 2 to hopper
    const segment2Start = this.hopper.length
    this.hopper.push(...segment2)

    // Run seam dedup
    this._seamDedup(segment2Start, segment2.length)

    // Segment 3: common leaders + remaining rare leaders
    const segment3Rares = shuffledRares.slice(raresPerSegment * 2)
    const segment3 = shuffle([...this.commonLeaders, ...segment3Rares])

    // Add segment 3 to hopper
    const segment3Start = this.hopper.length
    this.hopper.push(...segment3)

    // Run seam dedup
    this._seamDedup(segment3Start, segment3.length)
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
   * Get the next leader from the hopper
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
