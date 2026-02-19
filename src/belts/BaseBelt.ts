// @ts-nocheck
/**
 * BaseBelt
 *
 * A belt that provides base cards for booster packs.
 * Cycles through common bases with aspect-based seam deduplication.
 * Rare bases are sprinkled in probabilistically (same pattern as LeaderBelt).
 *
 * Target ratio: 1/6 packs get a Rare base (~16.67%) — configurable via packConstants.rareBaseRate
 */

import { getCachedCards } from '../utils/cardCache';
import { getSetConfig } from '../utils/setConfigs';
import type { RawCard } from '../utils/cardData';
import type { SetCode } from '../types';

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
 * Check if two bases have the same aspect
 */
function hasSameAspect(a: RawCard | undefined, b: RawCard | undefined): boolean {
  if (!a || !b) return false
  if (!a.aspects || !b.aspects) return false
  // Check if any aspect overlaps
  return a.aspects.some(aspect => b.aspects.includes(aspect))
}

export class BaseBelt {
  setCode: SetCode
  hopper: RawCard[]
  fillingPool: RawCard[]
  rareBases: RawCard[]
  rareProbability: number
  lastBaseName: string | null

  constructor(setCode: SetCode | string) {
    this.setCode = setCode as SetCode
    this.hopper = []
    this.fillingPool = []
    this.rareBases = []
    this.rareProbability = 0
    this.lastBaseName = null

    this._initialize()
  }

  /**
   * Initialize the belt by loading cards and setting up the filling pool
   */
  _initialize(): void {
    const cards = getCachedCards(this.setCode)
    const config = getSetConfig(this.setCode)

    // Filter to only normal variant common bases (the cycle pool)
    this.fillingPool = cards.filter(c =>
      c.isBase &&
      c.variantType === 'Normal' &&
      c.rarity === 'Common'
    )

    // Only load rare bases into the base slot when the set config says so.
    // Sets 1-6: rareBasesInRareSlot is true (or undefined) → rare bases go in RareLegendaryBelt
    // Set 7+ (LAW): rareBasesInRareSlot is false → rare bases go here in the base slot
    const rareBasesInBaseSlot = config?.packRules?.rareBasesInRareSlot === false

    if (rareBasesInBaseSlot) {
      this.rareBases = cards.filter(c =>
        c.isBase &&
        c.variantType === 'Normal' &&
        c.rarity === 'Rare'
      )

      // Rate matches LeaderBelt's RARE_PROBABILITY (1/6 ≈ 16.67%)
      if (this.rareBases.length > 0) {
        this.rareProbability = 1 / 6
      }
    }

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
   * Fill the hopper with a new batch of bases
   */
  _fill(): void {
    // Shuffle the bases for this boot
    const boot = shuffle([...this.fillingPool])

    // Add each card, checking for aspect conflicts at the seam
    for (let i = 0; i < boot.length; i++) {
      const card = boot[i]!
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
          const temp = boot[i]
          boot[i] = boot[swapIdx]!
          boot[swapIdx] = temp!
        }
      }

      this.hopper.push(boot[i]!)
    }
  }

  /**
   * Get a random rare base
   */
  _randomRare(): RawCard | null {
    if (this.rareBases.length === 0) return null
    const index = Math.floor(Math.random() * this.rareBases.length)
    return this.rareBases[index] ?? null
  }

  /**
   * Get the next base from the belt
   *
   * Logic (mirrors LeaderBelt):
   * - rareProbability chance to serve a rare base
   * - Otherwise serve the next common from the hopper cycle
   * - If rare would duplicate the last base name, fall back to common
   */
  next(): RawCard | null {
    // Decide: rare or common?
    if (this.rareBases.length > 0 && this.rareProbability > 0 && Math.random() < this.rareProbability) {
      const rare = this._randomRare()
      if (rare && rare.name !== this.lastBaseName) {
        this.lastBaseName = rare.name
        return { ...rare }
      }
      // If rare would duplicate last base, fall through to common
    }

    // Serve from common hopper
    this._fillIfNeeded()
    const card = this.hopper.shift()

    if (card) {
      this.lastBaseName = card.name
      return { ...card }
    }

    return null
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
