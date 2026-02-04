// @ts-nocheck
/**
 * UncommonBelt
 *
 * A belt that provides uncommon cards for booster packs.
 * Shuffles all uncommons from the set with seam deduplication
 * to ensure no duplicates within 3 slots of each other.
 *
 * One belt serves all 3 uncommon slots in a pack.
 */

import { getCachedCards } from '../utils/cardCache'
import type { RawCard } from '../utils/cardData'
import type { SetCode } from '../types'

/**
 * Shuffle an array in place (Fisher-Yates)
 */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[i]
    arr[i] = arr[j]!
    arr[j] = temp!
  }
  return arr
}

/**
 * Check if two cards are the same (by id or name)
 */
function isSameCard(a: RawCard | undefined, b: RawCard | undefined): boolean {
  if (!a || !b) return false
  return a.id === b.id || a.name === b.name
}

export class UncommonBelt {
  setCode: SetCode
  hopper: RawCard[]
  fillingPool: RawCard[]

  constructor(setCode: SetCode | string) {
    this.setCode = setCode as SetCode
    this.hopper = []
    this.fillingPool = []

    this._initialize()
  }

  /**
   * Initialize the belt by loading cards and setting up the filling pool
   */
  _initialize(): void {
    const cards = getCachedCards(this.setCode)

    // Filter to normal variant uncommons (non-leader, non-base)
    this.fillingPool = cards.filter(c =>
      c.variantType === 'Normal' &&
      c.rarity === 'Uncommon' &&
      !c.isLeader &&
      !c.isBase
    )

    // Initial fill
    this._fillIfNeeded()
  }

  /**
   * Fill the hopper if it needs more cards
   */
  _fillIfNeeded(): void {
    // Safety check: if no cards in filling pool, can't fill
    if (this.fillingPool.length === 0) {
      return
    }
    while (this.hopper.length < this.fillingPool.length) {
      this._fill()
    }
  }

  /**
   * Fill the hopper with a shuffled batch of uncommons
   */
  _fill(): void {
    const wasEmpty = this.hopper.length === 0
    const bootStart = this.hopper.length

    const boot = shuffle([...this.fillingPool])
    this.hopper.push(...boot)

    // Run seam dedup if hopper wasn't empty
    if (!wasEmpty) {
      this._seamDedup(bootStart, boot.length)
    }
  }

  /**
   * Seam deduplication
   * Look at the first 4 cards in the segment (the seam).
   * For each, check if it has a duplicate within 4 slots.
   * If so, swap with a random card from the back half of the segment.
   */
  _seamDedup(segmentStart: number, segmentLength: number, depth = 0): void {
    // Prevent infinite recursion
    if (depth > 10) return

    const seamSize = Math.min(4, segmentLength)
    const backHalfStart = segmentStart + Math.floor(segmentLength / 2)
    const backHalfEnd = segmentStart + segmentLength

    for (let i = 0; i < seamSize; i++) {
      const cardIndex = segmentStart + i
      const card = this.hopper[cardIndex]

      // Check for duplicates within 4 slots (before and after)
      let hasDuplicate = false
      for (let offset = -4; offset <= 4; offset++) {
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
          const temp = this.hopper[cardIndex]
          this.hopper[cardIndex] = this.hopper[swapIndex]!
          this.hopper[swapIndex] = temp!

          // Run dedup again
          this._seamDedup(segmentStart, segmentLength, depth + 1)
          return
        }
      }
    }
  }

  /**
   * Get the next uncommon from the hopper
   */
  next(): RawCard | null {
    this._fillIfNeeded()

    const card = this.hopper.shift()
    return card ? { ...card } : null // Return a copy
  }

  /**
   * Peek at upcoming cards without removing them
   */
  peek(count = 1): RawCard[] {
    this._fillIfNeeded()
    return this.hopper.slice(0, count).map(c => ({ ...c }))
  }

  /**
   * Get current hopper size
   */
  get size(): number {
    return this.hopper.length
  }
}
