/**
 * HyperspaceRareLegendaryBelt
 *
 * Same as RareLegendaryBelt but uses Hyperspace variant cards.
 * Includes non-leader Rares and all Legendaries from Hyperspace variant.
 */

import { getCachedCards } from '../utils/cardCache'
import type { RawCard } from '../utils/cardData'
import type { SetCode } from '../types'
import { getSetConfig } from '../utils/setConfigs/index.js'

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

export class HyperspaceRareLegendaryBelt {
  setCode: SetCode
  hopper: RawCard[]
  fillingPool: RawCard[]
  rares: RawCard[]
  legendaries: RawCard[]
  ratio: number

  constructor(setCode: SetCode | string) {
    this.setCode = setCode as SetCode
    this.hopper = []
    this.fillingPool = []
    this.rares = []
    this.legendaries = []
    this.ratio = 6

    this._initialize()
  }

  _initialize(): void {
    const cards = getCachedCards(this.setCode)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = getSetConfig(this.setCode) as any

    // Determine ratio based on set number
    const setNumber = config?.setNumber || 1
    this.ratio = setNumber <= 3 ? 6 : 5

    // Filter to Hyperspace variant non-leader rares and legendaries
    this.rares = cards.filter(c =>
      c.variantType === 'Hyperspace' &&
      c.rarity === 'Rare' &&
      !c.isLeader &&
      !c.isBase
    )

    this.legendaries = cards.filter(c =>
      c.variantType === 'Hyperspace' &&
      c.rarity === 'Legendary' &&
      !c.isLeader &&
      !c.isBase
    )

    this.fillingPool = [...this.rares, ...this.legendaries]

    this._fillIfNeeded()
  }

  _fillIfNeeded(): void {
    // Safety check: if no cards in filling pool, can't fill
    if (this.fillingPool.length === 0) {
      return
    }
    while (this.hopper.length < this.fillingPool.length) {
      this._fill()
    }
  }

  _fill(): void {
    const wasEmpty = this.hopper.length === 0

    const shuffledLegendaries = shuffle([...this.legendaries])
    const legendariesPerSegment = Math.floor(shuffledLegendaries.length / this.ratio)

    for (let i = 0; i < this.ratio; i++) {
      const segmentStart = i * legendariesPerSegment
      const segmentEnd = i === this.ratio - 1
        ? shuffledLegendaries.length
        : segmentStart + legendariesPerSegment
      const segmentLegendaries = shuffledLegendaries.slice(segmentStart, segmentEnd)

      const segment = shuffle([...this.rares, ...segmentLegendaries])

      const hopperStart = this.hopper.length
      this.hopper.push(...segment)

      if (!(i === 0 && wasEmpty)) {
        this._seamDedup(hopperStart, segment.length)
      }
    }
  }

  _seamDedup(segmentStart: number, segmentLength: number, depth = 0): void {
    if (depth > 10) return

    const seamSize = Math.min(5, segmentLength)
    const backHalfStart = segmentStart + Math.floor(segmentLength / 2)
    const backHalfEnd = segmentStart + segmentLength

    for (let i = 0; i < seamSize; i++) {
      const cardIndex = segmentStart + i
      const card = this.hopper[cardIndex]

      let hasDuplicate = false
      for (let offset = -6; offset <= 6; offset++) {
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
          const temp = this.hopper[cardIndex]
          this.hopper[cardIndex] = this.hopper[swapIndex]!
          this.hopper[swapIndex] = temp!
          this._seamDedup(segmentStart, segmentLength, depth + 1)
          return
        }
      }
    }
  }

  next(): RawCard | null {
    this._fillIfNeeded()
    const card = this.hopper.shift()
    if (!card) return null
    return { ...card, isHyperspace: true }
  }

  peek(count = 1): RawCard[] {
    this._fillIfNeeded()
    return this.hopper.slice(0, count).map(c => ({ ...c, isHyperspace: true }))
  }

  get size(): number {
    return this.hopper.length
  }
}
