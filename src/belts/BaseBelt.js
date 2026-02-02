/**
 * BaseBelt
 *
 * A belt that provides base cards for booster packs.
 * Only includes common bases. Uses aspect-based seam deduplication
 * to prevent adjacent bases with the same aspect.
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
 * Check if two bases have the same aspect
 */
function hasSameAspect(a, b) {
  if (!a || !b) return false
  if (!a.aspects || !b.aspects) return false
  // Check if any aspect overlaps
  return a.aspects.some(aspect => b.aspects.includes(aspect))
}

export class BaseBelt {
  constructor(setCode) {
    this.setCode = setCode
    this.hopper = []
    this.fillingPool = []

    this._initialize()
  }

  /**
   * Initialize the belt by loading cards and setting up the filling pool
   */
  _initialize() {
    const cards = getCachedCards(this.setCode)

    // Filter to only normal variant common bases
    this.fillingPool = cards.filter(c =>
      c.isBase &&
      c.variantType === 'Normal' &&
      c.rarity === 'Common'
    )

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
   * Fill the hopper with a new batch of bases
   */
  _fill() {
    // Shuffle the bases for this boot
    const boot = shuffle([...this.fillingPool])
    const bootStart = this.hopper.length

    // Add each card, checking for aspect conflicts at the seam
    for (let i = 0; i < boot.length; i++) {
      const card = boot[i]
      const prevCard = this.hopper[this.hopper.length - 1]

      if (prevCard && hasSameAspect(card, prevCard)) {
        // Move this card to back half of boot (remaining unprocessed cards)
        // and try the next card instead
        const remainingStart = i + 1
        const remainingEnd = boot.length
        const backHalfStart = Math.floor((remainingEnd - remainingStart) / 2) + remainingStart

        if (backHalfStart < remainingEnd) {
          // Swap with a card from the back half of remaining cards
          const swapIdx = backHalfStart + Math.floor(Math.random() * (remainingEnd - backHalfStart))
          ;[boot[i], boot[swapIdx]] = [boot[swapIdx], boot[i]]
        }
      }

      this.hopper.push(boot[i])
    }
  }

  /**
   * Get the next base from the hopper
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
