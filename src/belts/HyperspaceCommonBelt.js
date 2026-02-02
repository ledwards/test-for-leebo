/**
 * HyperspaceCommonBelt
 *
 * A single belt for Hyperspace variant commons (not split like normal CommonBelt).
 * Seam deduplication ensures no duplicates within 5 slots.
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

export class HyperspaceCommonBelt {
  constructor(setCode) {
    this.setCode = setCode
    this.hopper = []
    this.fillingPool = []

    this._initialize()
  }

  _initialize() {
    const cards = getCachedCards(this.setCode)

    // Filter to Hyperspace variant commons (non-leader, non-base)
    this.fillingPool = cards.filter(c =>
      c.variantType === 'Hyperspace' &&
      c.rarity === 'Common' &&
      !c.isLeader &&
      !c.isBase
    )

    this._fillIfNeeded()
  }

  _fillIfNeeded() {
    // Safety check: if no cards in filling pool, can't fill
    if (this.fillingPool.length === 0) {
      return
    }
    while (this.hopper.length < this.fillingPool.length) {
      this._fill()
    }
  }

  _fill() {
    const wasEmpty = this.hopper.length === 0
    const bootStart = this.hopper.length

    const boot = shuffle([...this.fillingPool])
    this.hopper.push(...boot)

    if (!wasEmpty) {
      this._seamDedup(bootStart, boot.length)
    }
  }

  _seamDedup(segmentStart, segmentLength, depth = 0) {
    if (depth > 10) return

    const seamSize = Math.min(5, segmentLength)
    const backHalfStart = segmentStart + Math.floor(segmentLength / 2)
    const backHalfEnd = segmentStart + segmentLength

    for (let i = 0; i < seamSize; i++) {
      const cardIndex = segmentStart + i
      const card = this.hopper[cardIndex]

      let hasDuplicate = false
      for (let offset = -5; offset <= 5; offset++) {
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
        const backHalfLength = backHalfEnd - backHalfStart
        if (backHalfLength > 0) {
          const swapIndex = backHalfStart + Math.floor(Math.random() * backHalfLength)
          ;[this.hopper[cardIndex], this.hopper[swapIndex]] =
            [this.hopper[swapIndex], this.hopper[cardIndex]]
          this._seamDedup(segmentStart, segmentLength, depth + 1)
          return
        }
      }
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
