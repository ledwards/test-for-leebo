/**
 * LeaderBelt
 *
 * A belt that provides leader cards for booster packs.
 *
 * Design: Cycles through all unique common leaders before repeating any,
 * with rare leaders sprinkled in probabilistically (not at fixed intervals).
 *
 * Target ratio: 1/6 packs get a Rare leader (~16.67%)
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

export class LeaderBelt {
  constructor(setCode) {
    this.setCode = setCode
    this.commonLeaders = []
    this.rareLeaders = []
    this.commonCycle = []  // Shuffled cycle of common leaders
    this.commonIndex = 0   // Current position in common cycle
    this.lastLeaderName = null  // Track last served leader to avoid adjacent duplicates

    this._initialize()
  }

  /**
   * Initialize the belt by loading cards
   */
  _initialize() {
    const cards = getCachedCards(this.setCode)

    // Filter to only normal variant leaders with Common or Rare rarity
    const allLeaders = cards.filter(c =>
      c.isLeader &&
      c.variantType === 'Normal' &&
      (c.rarity === 'Common' || c.rarity === 'Rare')
    )

    this.commonLeaders = allLeaders.filter(c => c.rarity === 'Common')
    this.rareLeaders = allLeaders.filter(c => c.rarity === 'Rare')

    // Initialize first common cycle
    this._reshuffleCommonCycle()
  }

  /**
   * Reshuffle the common leader cycle
   * Called when we've gone through all commons once
   */
  _reshuffleCommonCycle() {
    this.commonCycle = shuffle([...this.commonLeaders])
    this.commonIndex = 0
  }

  /**
   * Get the next common leader from the cycle
   * Reshuffles when cycle is exhausted
   */
  _nextCommon() {
    if (this.commonIndex >= this.commonCycle.length) {
      this._reshuffleCommonCycle()
    }
    return this.commonCycle[this.commonIndex++]
  }

  /**
   * Get a random rare leader
   */
  _randomRare() {
    if (this.rareLeaders.length === 0) return null
    const index = Math.floor(Math.random() * this.rareLeaders.length)
    return this.rareLeaders[index]
  }

  /**
   * Get the next leader from the belt
   *
   * Logic:
   * - 1/6 chance (~16.67%) to serve a rare leader
   * - 5/6 chance to serve the next common from the cycle
   * - If rare would duplicate the last leader, fall back to common
   * - If common would duplicate the last leader, try next in cycle
   */
  next() {
    const RARE_PROBABILITY = 1 / 6

    let leader = null

    // Decide: rare or common?
    if (this.rareLeaders.length > 0 && Math.random() < RARE_PROBABILITY) {
      // Try to serve a rare
      const rare = this._randomRare()
      if (rare && rare.name !== this.lastLeaderName) {
        leader = rare
      }
      // If rare would duplicate last leader, fall through to common
    }

    // If no rare selected, serve from common cycle
    if (!leader) {
      // Get next common, but avoid duplicating last leader
      let attempts = 0
      const maxAttempts = this.commonLeaders.length

      while (attempts < maxAttempts) {
        const common = this._nextCommon()
        if (common.name !== this.lastLeaderName) {
          leader = common
          break
        }
        attempts++
      }

      // Fallback: if somehow all commons match last leader (shouldn't happen with 8+ commons)
      if (!leader && this.commonLeaders.length > 0) {
        leader = this._nextCommon()
      }
    }

    if (leader) {
      this.lastLeaderName = leader.name
      return { ...leader }
    }

    return null
  }

  /**
   * Peek at upcoming cards (approximate - doesn't account for rare probability)
   */
  peek(count = 1) {
    const result = []
    const tempIndex = this.commonIndex

    for (let i = 0; i < count && i < this.commonCycle.length; i++) {
      const idx = (tempIndex + i) % this.commonCycle.length
      result.push({ ...this.commonCycle[idx] })
    }

    return result
  }

  /**
   * Get approximate hopper size (commons remaining in current cycle)
   */
  get size() {
    return this.commonCycle.length - this.commonIndex
  }
}
