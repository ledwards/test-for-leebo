// @ts-nocheck
/**
 * CarbonitePrestigeBelt
 *
 * A belt that synthesizes Prestige variant cards from the Normal R/L card pool.
 * No actual Prestige card data exists in cards.json, so we copy Normal cards
 * and set variantType to 'Prestige'.
 *
 * Each card gets a prestigeTier:
 *   - 'tier1': 80% — most common, no foil treatment
 *   - 'tier2': 18% — foil treatment
 *   - 'serialized': 2% — serialized/250, foil treatment
 *
 * Uses standard hopper/filling pool pattern.
 */

import { getCachedCards } from '../utils/cardCache'
import type { RawCard } from '../utils/cardData'
import type { SetCode } from '../types'
import { CARBONITE_CONSTANTS } from '../utils/carboniteConstants'

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
 * Roll a prestige tier based on weights
 */
function rollPrestigeTier(): string {
  const weights = CARBONITE_CONSTANTS.prestigeTierWeights
  const total = weights.tier1 + weights.tier2 + weights.serialized
  const roll = Math.random() * total

  if (roll < weights.tier1) return 'tier1'
  if (roll < weights.tier1 + weights.tier2) return 'tier2'
  return 'serialized'
}

export class CarbonitePrestigeBelt {
  setCode: SetCode
  hopper: RawCard[]
  fillingPool: RawCard[]

  constructor(setCode: SetCode | string) {
    this.setCode = setCode as SetCode
    this.hopper = []
    this.fillingPool = []

    this._initialize()
  }

  _initialize(): void {
    const cards = getCachedCards(this.setCode)

    // Filter to Normal variant R/L cards (source for Prestige synthesis)
    this.fillingPool = cards.filter(c =>
      c.variantType === 'Normal' &&
      !c.isLeader &&
      !c.isBase &&
      (c.rarity === 'Rare' || c.rarity === 'Legendary' || c.rarity === 'Special')
    )

    this._fillIfNeeded()
  }

  _fillIfNeeded(): void {
    if (this.fillingPool.length === 0) return
    while (this.hopper.length < this.fillingPool.length) {
      this._fill()
    }
  }

  _fill(): void {
    const boot = shuffle([...this.fillingPool])
    this.hopper.push(...boot)
  }

  next(): RawCard | null {
    this._fillIfNeeded()
    const card = this.hopper.shift()
    if (!card) return null

    return {
      ...card,
      variantType: 'Prestige',
      isPrestige: true,
      prestigeTier: rollPrestigeTier(),
    }
  }

  peek(count = 1): RawCard[] {
    this._fillIfNeeded()
    return this.hopper.slice(0, count).map(c => ({
      ...c,
      variantType: 'Prestige',
      isPrestige: true,
      prestigeTier: 'tier1', // Peek doesn't roll tier
    }))
  }

  get size(): number {
    return this.hopper.length
  }
}
