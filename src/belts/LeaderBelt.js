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
   *
   * Target ratio: 1/6 packs get a Rare leader (5:1 Common:Rare)
   * Achieved by adding each common 5 times and each rare 1 time per cycle
   */
  _fill() {
    const wasEmpty = this.hopper.length === 0

    // Create weighted pool: each common appears 5 times, each rare appears 1 time
    // This gives a 5:1 ratio = 1/6 chance of rare = ~16.67% rare
    const weightedPool = []

    // Add each common leader 5 times
    for (const common of this.commonLeaders) {
      for (let i = 0; i < 5; i++) {
        weightedPool.push(common)
      }
    }

    // Add each rare leader 1 time
    for (const rare of this.rareLeaders) {
      weightedPool.push(rare)
    }

    // Shuffle the weighted pool
    const segment = shuffle(weightedPool)

    // Add segment to hopper
    const segmentStart = this.hopper.length
    this.hopper.push(...segment)

    // Run seam dedup - include some cards before the seam to fix boundary
    const dedupStart = wasEmpty ? segmentStart : Math.max(0, segmentStart - 1)
    const dedupLength = this.hopper.length - dedupStart
    this._seamDedup(dedupStart, dedupLength)
  }

  /**
   * Seam deduplication
   * Prevents the same leader from appearing in immediately adjacent slots.
   * With weighted pools (commons appear 5x), we can only guarantee no immediate adjacency.
   */
  _seamDedup(segmentStart, segmentLength, depth = 0) {
    // Prevent infinite recursion
    if (depth > 50) return

    for (let i = segmentStart + 1; i < segmentStart + segmentLength; i++) {
      const card = this.hopper[i]
      const prevCard = this.hopper[i - 1]

      // Check if same leader as previous slot
      if (isSameCard(card, prevCard)) {
        // Try to swap with a non-adjacent card further in the segment
        const swapRangeStart = i + 2
        const swapRangeEnd = segmentStart + segmentLength

        if (swapRangeStart < swapRangeEnd) {
          // Find a card to swap that won't create new adjacency issues
          const candidates = []
          for (let k = swapRangeStart; k < swapRangeEnd; k++) {
            candidates.push(k)
          }
          // Shuffle candidates for randomness
          for (let k = candidates.length - 1; k > 0; k--) {
            const j = Math.floor(Math.random() * (k + 1))
            ;[candidates[k], candidates[j]] = [candidates[j], candidates[k]]
          }

          for (const swapIndex of candidates) {
            const swapCard = this.hopper[swapIndex]
            // Check if swapping would create adjacency conflict at position i or swapIndex
            const wouldConflictAtI = isSameCard(swapCard, prevCard)
            const nextCard = i + 1 < segmentStart + segmentLength ? this.hopper[i + 1] : null
            const wouldConflictAtINext = nextCard && isSameCard(swapCard, nextCard)

            const prevSwap = swapIndex > 0 ? this.hopper[swapIndex - 1] : null
            const nextSwap = swapIndex + 1 < this.hopper.length ? this.hopper[swapIndex + 1] : null
            const wouldConflictAtSwap = (prevSwap && isSameCard(card, prevSwap)) ||
                                        (nextSwap && isSameCard(card, nextSwap))

            if (!wouldConflictAtI && !wouldConflictAtINext && !wouldConflictAtSwap) {
              ;[this.hopper[i], this.hopper[swapIndex]] = [this.hopper[swapIndex], this.hopper[i]]
              // Run dedup again
              this._seamDedup(segmentStart, segmentLength, depth + 1)
              return
            }
          }
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
