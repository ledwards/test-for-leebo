// @ts-nocheck
/**
 * UncommonBelt
 *
 * A belt that provides uncommon cards for booster packs.
 * One belt serves all 3 uncommon slots in a pack.
 *
 * CONSTRAINTS:
 * - Every card appears exactly once per boot (equal occurrence rate)
 * - No duplicate card within 24 positions (min(24, floor(beltSize/2)))
 * - No adjacent cards share primary aspect (aspects[0])
 * - Seam deduplication ensures constraints hold across boot boundaries
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
 * Get the primary aspect (first listed) of a card, or null if no aspects.
 */
function getPrimaryAspect(card: RawCard): string | null {
  const aspects = card.aspects || []
  return aspects.length > 0 ? aspects[0]! : null
}

/**
 * Build an aspect-interleaved sequence of cards.
 * Groups cards by primary aspect and round-robins through groups (largest first),
 * ensuring no two adjacent cards share primary aspect.
 */
function buildInterleavedSequence(cards: RawCard[], lastAspect: string | null): RawCard[] {
  if (cards.length === 0) return []

  // Group by primary aspect
  const groups = new Map<string | null, RawCard[]>()
  for (const card of cards) {
    const a = getPrimaryAspect(card)
    if (!groups.has(a)) groups.set(a, [])
    groups.get(a)!.push(card)
  }

  // Shuffle within each group
  groups.forEach(pool => shuffle(pool))

  // Sort groups by size descending
  const sortedKeys = [...groups.keys()].sort((a, b) =>
    (groups.get(b)?.length || 0) - (groups.get(a)?.length || 0)
  )

  // Rotate so first group's aspect differs from lastAspect
  if (lastAspect !== null) {
    const startIdx = sortedKeys.findIndex(k => k !== lastAspect)
    if (startIdx > 0) {
      const rotated = [...sortedKeys.slice(startIdx), ...sortedKeys.slice(0, startIdx)]
      sortedKeys.splice(0, sortedKeys.length, ...rotated)
    }
  }

  // Round-robin: pick from each aspect group in turn
  const result: RawCard[] = []
  let prevAspect: string | null = lastAspect
  let totalRemaining = cards.length

  while (totalRemaining > 0) {
    let placed = false
    sortedKeys.sort((a, b) =>
      (groups.get(b)?.length || 0) - (groups.get(a)?.length || 0)
    )

    for (const key of sortedKeys) {
      const pool = groups.get(key)!
      if (pool.length === 0) continue
      if (key === prevAspect) continue

      const card = pool.shift()!
      result.push(card)
      prevAspect = key
      totalRemaining--
      placed = true
      break
    }

    if (!placed) {
      for (const key of sortedKeys) {
        const pool = groups.get(key)!
        if (pool.length > 0) {
          const card = pool.shift()!
          result.push(card)
          prevAspect = key
          totalRemaining--
          break
        }
      }
    }
  }

  return result
}

export class UncommonBelt {
  setCode: SetCode
  hopper: RawCard[]
  fillingPool: RawCard[]
  recentServed: string[]
  lastServedAspect: string | null
  DEDUP_WINDOW: number

  constructor(setCode: SetCode | string) {
    this.setCode = setCode as SetCode
    this.hopper = []
    this.fillingPool = []
    this.recentServed = []
    this.lastServedAspect = null

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

    this.DEDUP_WINDOW = Math.min(24, Math.floor(this.fillingPool.length / 2))

    // Initial fill
    this._fillIfNeeded()
  }

  /**
   * Fill the hopper if it needs more cards
   */
  _fillIfNeeded(): void {
    if (this.fillingPool.length === 0) return
    while (this.hopper.length < this.fillingPool.length) {
      this._fill()
    }
  }

  /**
   * Fill the hopper with a new boot of ALL uncommon cards.
   * Every card appears exactly once per boot (no exclusion).
   */
  _fill(): void {
    const seamCards = [...this.hopper]
    const numSeam = seamCards.length

    // Compute per-card minimum positions
    const cardMinPositions = new Map<string, number>()

    // Seam cards
    for (let i = 0; i < seamCards.length; i++) {
      const distance = numSeam - i
      const minPos = Math.max(0, this.DEDUP_WINDOW - distance)
      const existing = cardMinPositions.get(seamCards[i]!.id) || 0
      cardMinPositions.set(seamCards[i]!.id, Math.max(existing, minPos))
    }

    // Recently served cards
    for (let i = 0; i < this.recentServed.length; i++) {
      const distance = numSeam + (this.recentServed.length - i)
      const minPos = Math.max(0, this.DEDUP_WINDOW - distance)
      if (minPos > 0) {
        const id = this.recentServed[i]!
        const existing = cardMinPositions.get(id) || 0
        cardMinPositions.set(id, Math.max(existing, minPos))
      }
    }

    // Last aspect from seam or last served
    let lastAspect = this.lastServedAspect
    if (seamCards.length > 0) {
      lastAspect = getPrimaryAspect(seamCards[seamCards.length - 1]!)
    }

    // Find max minPosition
    let maxMinPos = 0
    for (const [, minPos] of cardMinPositions) {
      if (minPos > maxMinPos) maxMinPos = minPos
    }

    // Split cards into early-eligible and late-only
    const earlyCards: RawCard[] = []
    const lateCards: RawCard[] = []
    for (const card of this.fillingPool) {
      const minPos = cardMinPositions.get(card.id) || 0
      if (minPos === 0) {
        earlyCards.push(card)
      } else {
        lateCards.push(card)
      }
    }

    // Build early zone
    const earlySequence = buildInterleavedSequence(earlyCards, lastAspect)
    const earlyZoneSize = Math.min(maxMinPos, earlySequence.length)
    const boot: RawCard[] = earlySequence.slice(0, earlyZoneSize)

    // Build late zone with remaining cards
    const usedEarlyIds = new Set(boot.map(c => c.id))
    const remainingCards = [
      ...earlyCards.filter(c => !usedEarlyIds.has(c.id)),
      ...lateCards
    ]
    const prevAspect = boot.length > 0
      ? getPrimaryAspect(boot[boot.length - 1]!)
      : lastAspect
    const lateSequence = buildInterleavedSequence(remainingCards, prevAspect)
    boot.push(...lateSequence)

    this.hopper.push(...boot)
  }

  /**
   * Get the next uncommon from the hopper
   */
  next(): RawCard | null {
    this._fillIfNeeded()

    const card = this.hopper.shift()
    if (card) {
      this.recentServed.push(card.id)
      if (this.recentServed.length > this.DEDUP_WINDOW) {
        this.recentServed.shift()
      }
      this.lastServedAspect = getPrimaryAspect(card)
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
