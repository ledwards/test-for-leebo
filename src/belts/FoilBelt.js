/**
 * FoilBelt
 *
 * A belt that provides foil cards for booster packs.
 * Includes all non-leader, non-base cards in weighted quantities:
 * - 1 of every Legendary
 * - 6 of every Rare (and Special in sets 4-6)
 * - 18 of every Uncommon
 * - 54 of every Common
 */

import { getCachedCards } from '../utils/cardCache.js'
import { getSetConfig } from '../utils/setConfigs/index.js'

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

// Base quantity multipliers by rarity
const RARITY_QUANTITIES = {
  Legendary: 1,
  Special: 1, // Default, overridden to 6 for sets 4-6
  Rare: 6,
  Uncommon: 18,
  Common: 54
}

export class FoilBelt {
  constructor(setCode) {
    this.setCode = setCode
    this.hopper = []
    this.fillingPool = []
    this.rarityQuantities = { ...RARITY_QUANTITIES }

    this._initialize()
  }

  /**
   * Initialize the belt by loading cards and setting up the filling pool
   */
  _initialize() {
    const cards = getCachedCards(this.setCode)
    const config = getSetConfig(this.setCode)
    const includeSpecial = config?.packRules?.specialInFoilSlot ?? false
    const setNumber = config?.setNumber || 1

    // In sets 4-6, Special uses same rate as Rare (6x)
    if (setNumber >= 4) {
      this.rarityQuantities.Special = 6
    }

    // Filter to normal variant non-leader, non-base cards
    // Exclude Special rarity if not allowed for this set
    this.fillingPool = cards.filter(c =>
      c.variantType === 'Normal' &&
      !c.isLeader &&
      !c.isBase &&
      (includeSpecial || c.rarity !== 'Special')
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
    // Calculate the size of one boot
    const bootSize = this._calculateBootSize()

    while (this.hopper.length < bootSize) {
      this._fill()
    }
  }

  /**
   * Calculate the size of one boot based on rarity quantities
   */
  _calculateBootSize() {
    let size = 0
    for (const card of this.fillingPool) {
      const quantity = this.rarityQuantities[card.rarity] || 1
      size += quantity
    }
    return size
  }

  /**
   * Fill the hopper with a new batch of foils
   */
  _fill() {
    const boot = []

    // Add cards in weighted quantities
    for (const card of this.fillingPool) {
      const quantity = this.rarityQuantities[card.rarity] || 1
      for (let i = 0; i < quantity; i++) {
        boot.push(card)
      }
    }

    // Shuffle and add to hopper
    shuffle(boot)
    this.hopper.push(...boot)
  }

  /**
   * Get the next foil from the hopper
   */
  next() {
    this._fillIfNeeded()

    const card = this.hopper.shift()
    return { ...card, isFoil: true } // Return a copy marked as foil
  }

  /**
   * Peek at upcoming cards without removing them
   */
  peek(count = 1) {
    this._fillIfNeeded()
    return this.hopper.slice(0, count).map(c => ({ ...c, isFoil: true }))
  }

  /**
   * Get current hopper size
   */
  get size() {
    return this.hopper.length
  }
}
