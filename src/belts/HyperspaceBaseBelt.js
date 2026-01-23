/**
 * HyperspaceBaseBelt
 *
 * Same as BaseBelt but uses Hyperspace variant bases.
 * Aspect-based seam deduplication to prevent adjacent bases with same aspect.
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
  return a.aspects.some(aspect => b.aspects.includes(aspect))
}

export class HyperspaceBaseBelt {
  constructor(setCode) {
    this.setCode = setCode
    this.hopper = []
    this.fillingPool = []
    this.hasLoggedEmptyWarning = false

    this._initialize()
  }

  _initialize() {
    const cards = getCachedCards(this.setCode)

    // Filter to Hyperspace variant common bases
    this.fillingPool = cards.filter(c =>
      c.isBase &&
      c.variantType === 'Hyperspace' &&
      c.rarity === 'Common'
    )

    this._fillIfNeeded()
  }

  _fillIfNeeded() {
    // Safety check: if no cards in filling pool, can't fill
    if (this.fillingPool.length === 0) {
      if (!this.hasLoggedEmptyWarning) {
        this.hasLoggedEmptyWarning = true
      }
      return
    }
    while (this.hopper.length < this.fillingPool.length) {
      this._fill()
    }
  }

  _fill() {
    const boot = shuffle([...this.fillingPool])
    const bootStart = this.hopper.length

    for (let i = 0; i < boot.length; i++) {
      const card = boot[i]
      const prevCard = this.hopper[this.hopper.length - 1]

      if (prevCard && hasSameAspect(card, prevCard)) {
        const remainingStart = i + 1
        const remainingEnd = boot.length
        const backHalfStart = Math.floor((remainingEnd - remainingStart) / 2) + remainingStart

        if (backHalfStart < remainingEnd) {
          const swapIdx = backHalfStart + Math.floor(Math.random() * (remainingEnd - backHalfStart))
          ;[boot[i], boot[swapIdx]] = [boot[swapIdx], boot[i]]
        }
      }

      this.hopper.push(boot[i])
    }
  }

  next() {
    this._fillIfNeeded()
    const card = this.hopper.shift()
    if (!card) return null
    return { ...card, isHyperspace: true }
  }

  peek(count = 1) {
    this._fillIfNeeded()
    return this.hopper.slice(0, count).map(c => ({ ...c, isHyperspace: true }))
  }

  get size() {
    return this.hopper.length
  }
}
