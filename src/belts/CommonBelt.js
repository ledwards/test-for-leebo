/**
 * CommonBelt
 *
 * A belt that provides common cards for booster packs.
 * Two belts are used: Belt A (Vigilance/Command) and Belt B (Aggression/Cunning).
 * Neutral cards (no matching aspects) are randomly divided to balance the belts.
 *
 * Seam deduplication ensures no duplicates within 10 slots of each other.
 *
 * Packs pull 9 commons alternating between belts: A,B,A,B,A,B,A,B,A
 * Next pack starts with the opposite belt: B,A,B,A,B,A,B,A,B
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
 * Get common cards divided into Belt A and Belt B pools
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

  // Categorize cards
  const beltACards = allCommons.filter(c => hasAnyAspect(c, beltAAspects))
  const beltBCards = allCommons.filter(c => hasAnyAspect(c, beltBAspects))
  const neutralCards = allCommons.filter(c =>
    !hasAnyAspect(c, beltAAspects) && !hasAnyAspect(c, beltBAspects)
  )

  // Randomly divide neutral cards to balance the belts
  const shuffledNeutrals = shuffle([...neutralCards])
  const targetSize = Math.ceil((beltACards.length + beltBCards.length + neutralCards.length) / 2)

  const neutralsForA = []
  const neutralsForB = []

  for (const card of shuffledNeutrals) {
    const aSize = beltACards.length + neutralsForA.length
    const bSize = beltBCards.length + neutralsForB.length

    if (aSize <= bSize) {
      neutralsForA.push(card)
    } else {
      neutralsForB.push(card)
    }
  }

  return {
    poolA: [...beltACards, ...neutralsForA],
    poolB: [...beltBCards, ...neutralsForB]
  }
}

export class CommonBelt {
  constructor(setCode, pool) {
    this.setCode = setCode
    this.hopper = []
    this.fillingPool = pool

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
    // Safety check: if no cards in filling pool, can't fill
    if (this.fillingPool.length === 0) {
      return
    }
    while (this.hopper.length < this.fillingPool.length) {
      this._fill()
    }
  }

  /**
   * Fill the hopper with a shuffled batch of commons
   */
  _fill() {
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
   * Look at the first 10 cards in the segment (the seam).
   * For each, check if it has a duplicate within 10 slots.
   * If so, swap with a random card from the back half of the segment.
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
