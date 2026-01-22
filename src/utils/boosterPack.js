/**
 * Booster Pack Generation
 *
 * Uses belts to provide cards for pack slots.
 *
 * Pack structure:
 * - 1 Leader (from LeaderBelt)
 * - 1 Base (common)
 * - 9 Commons
 * - 3 Uncommons
 * - 1 Rare or Legendary
 * - 1 Foil (any rarity)
 *
 * Total: 16 cards
 */

import { LeaderBelt } from '../belts/LeaderBelt.js'
import { BaseBelt } from '../belts/BaseBelt.js'
import { FoilBelt } from '../belts/FoilBelt.js'
import { RareLegendaryBelt } from '../belts/RareLegendaryBelt.js'
import { UncommonBelt } from '../belts/UncommonBelt.js'
import { CommonBelt, getCommonPools } from '../belts/CommonBelt.js'
import { ShowcaseLeaderBelt } from '../belts/ShowcaseLeaderBelt.js'
import { HyperfoilBelt } from '../belts/HyperfoilBelt.js'
import { HyperspaceLeaderBelt } from '../belts/HyperspaceLeaderBelt.js'
import { HyperspaceBaseBelt } from '../belts/HyperspaceBaseBelt.js'
import { HyperspaceUncommonBelt } from '../belts/HyperspaceUncommonBelt.js'
import { HyperspaceCommonBelt } from '../belts/HyperspaceCommonBelt.js'
import { HyperspaceRareLegendaryBelt } from '../belts/HyperspaceRareLegendaryBelt.js'
import { getSetConfig } from './setConfigs/index.js'

// Cache belts by set code so we reuse the same belt across pack generation
const beltCache = new Map()

// Track which common belt to start with for alternating (true = start with A)
let startWithBeltA = true

/**
 * Get or create a LeaderBelt for a set
 */
function getLeaderBelt(setCode) {
  const key = `leader-${setCode}`
  if (!beltCache.has(key)) {
    beltCache.set(key, new LeaderBelt(setCode))
  }
  return beltCache.get(key)
}

/**
 * Get or create a BaseBelt for a set
 */
function getBaseBelt(setCode) {
  const key = `base-${setCode}`
  if (!beltCache.has(key)) {
    beltCache.set(key, new BaseBelt(setCode))
  }
  return beltCache.get(key)
}

/**
 * Get or create a FoilBelt for a set
 */
function getFoilBelt(setCode) {
  const key = `foil-${setCode}`
  if (!beltCache.has(key)) {
    beltCache.set(key, new FoilBelt(setCode))
  }
  return beltCache.get(key)
}

/**
 * Get or create a RareLegendaryBelt for a set
 */
function getRareLegendaryBelt(setCode) {
  const key = `rarelegendary-${setCode}`
  if (!beltCache.has(key)) {
    beltCache.set(key, new RareLegendaryBelt(setCode))
  }
  return beltCache.get(key)
}

/**
 * Get or create an UncommonBelt for a set
 */
function getUncommonBelt(setCode) {
  const key = `uncommon-${setCode}`
  if (!beltCache.has(key)) {
    beltCache.set(key, new UncommonBelt(setCode))
  }
  return beltCache.get(key)
}

/**
 * Get or create CommonBelts A and B for a set
 */
function getCommonBelts(setCode) {
  const keyA = `common-a-${setCode}`
  const keyB = `common-b-${setCode}`

  if (!beltCache.has(keyA) || !beltCache.has(keyB)) {
    const { poolA, poolB } = getCommonPools(setCode)
    beltCache.set(keyA, new CommonBelt(setCode, poolA))
    beltCache.set(keyB, new CommonBelt(setCode, poolB))
  }

  return {
    beltA: beltCache.get(keyA),
    beltB: beltCache.get(keyB)
  }
}

// === Variant Belt Getters ===

function getShowcaseLeaderBelt(setCode) {
  const key = `showcase-leader-${setCode}`
  if (!beltCache.has(key)) {
    beltCache.set(key, new ShowcaseLeaderBelt(setCode))
  }
  return beltCache.get(key)
}

function getHyperfoilBelt(setCode) {
  const key = `hyperfoil-${setCode}`
  if (!beltCache.has(key)) {
    beltCache.set(key, new HyperfoilBelt(setCode))
  }
  return beltCache.get(key)
}

function getHyperspaceLeaderBelt(setCode) {
  const key = `hyperspace-leader-${setCode}`
  if (!beltCache.has(key)) {
    beltCache.set(key, new HyperspaceLeaderBelt(setCode))
  }
  return beltCache.get(key)
}

function getHyperspaceBaseBelt(setCode) {
  const key = `hyperspace-base-${setCode}`
  if (!beltCache.has(key)) {
    beltCache.set(key, new HyperspaceBaseBelt(setCode))
  }
  return beltCache.get(key)
}

function getHyperspaceUncommonBelt(setCode) {
  const key = `hyperspace-uncommon-${setCode}`
  if (!beltCache.has(key)) {
    beltCache.set(key, new HyperspaceUncommonBelt(setCode))
  }
  return beltCache.get(key)
}

function getHyperspaceCommonBelt(setCode) {
  const key = `hyperspace-common-${setCode}`
  if (!beltCache.has(key)) {
    beltCache.set(key, new HyperspaceCommonBelt(setCode))
  }
  return beltCache.get(key)
}

function getHyperspaceRareLegendaryBelt(setCode) {
  const key = `hyperspace-rarelegendary-${setCode}`
  if (!beltCache.has(key)) {
    beltCache.set(key, new HyperspaceRareLegendaryBelt(setCode))
  }
  return beltCache.get(key)
}

/**
 * Clear belt cache (useful for testing or resetting state)
 */
export function clearBeltCache() {
  beltCache.clear()
  startWithBeltA = true // Reset alternating state
}

/**
 * Check if an upgrade should happen based on probability
 */
function shouldUpgrade(probability) {
  return Math.random() < probability
}

/**
 * Apply upgrade pass to a pack
 * Checks each slot for possible upgrades based on set-level probabilities
 *
 * @param {Object} pack - Pack with cards array
 * @param {string} setCode - Set code
 * @returns {Object} Pack with upgraded cards
 */
function applyUpgradePass(pack, setCode) {
  const config = getSetConfig(setCode)
  const probs = config?.upgradeProbabilities || {}

  // Find card indices by type
  const leaderIndex = pack.cards.findIndex(c => c.isLeader)
  const baseIndex = pack.cards.findIndex(c => c.isBase)
  const foilIndex = pack.cards.findIndex(c => c.isFoil)

  // Find uncommon indices (cards with Uncommon rarity, not leaders/bases/foils)
  const uncommonIndices = []
  pack.cards.forEach((c, i) => {
    if (c.rarity === 'Uncommon' && !c.isLeader && !c.isBase && !c.isFoil) {
      uncommonIndices.push(i)
    }
  })

  // Find rare/legendary slot (Rare or Legendary, not foil)
  const rareIndex = pack.cards.findIndex(c =>
    (c.rarity === 'Rare' || c.rarity === 'Legendary') &&
    !c.isFoil && !c.isLeader && !c.isBase
  )

  // Find common indices (Common rarity, not leaders/bases)
  const commonIndices = []
  pack.cards.forEach((c, i) => {
    if (c.rarity === 'Common' && !c.isLeader && !c.isBase && !c.isFoil) {
      commonIndices.push(i)
    }
  })

  // 1. Leader upgrades (Showcase takes precedence if both hit)
  if (leaderIndex >= 0) {
    if (probs.leaderToShowcase && shouldUpgrade(probs.leaderToShowcase)) {
      // Upgrade to Showcase leader
      const showcaseBelt = getShowcaseLeaderBelt(setCode)
      const upgraded = showcaseBelt.next()
      if (upgraded) pack.cards[leaderIndex] = upgraded
    } else if (probs.leaderToHyperspace && shouldUpgrade(probs.leaderToHyperspace)) {
      // Upgrade to Hyperspace leader
      const hsBelt = getHyperspaceLeaderBelt(setCode)
      const upgraded = hsBelt.next()
      if (upgraded) pack.cards[leaderIndex] = upgraded
    }
  }

  // 2. Base upgrade
  if (baseIndex >= 0 && probs.baseToHyperspace && shouldUpgrade(probs.baseToHyperspace)) {
    const hsBelt = getHyperspaceBaseBelt(setCode)
    const upgraded = hsBelt.next()
    if (upgraded) pack.cards[baseIndex] = upgraded
  }

  // 3. Rare slot upgrade to Hyperspace R/L
  if (rareIndex >= 0 && probs.rareToHyperspaceRL && shouldUpgrade(probs.rareToHyperspaceRL)) {
    const hsRLBelt = getHyperspaceRareLegendaryBelt(setCode)
    const upgraded = hsRLBelt.next()
    if (upgraded) pack.cards[rareIndex] = upgraded
  }

  // 4. Foil upgrade to Hyperfoil
  if (foilIndex >= 0 && probs.foilToHyperfoil && shouldUpgrade(probs.foilToHyperfoil)) {
    const hyperfoilBelt = getHyperfoilBelt(setCode)
    const upgraded = hyperfoilBelt.next()
    if (upgraded) pack.cards[foilIndex] = upgraded
  }

  // 5. Third UC upgrade to Hyperspace R/L (not UC!)
  if (uncommonIndices.length >= 3 && probs.thirdUCToHyperspaceRL && shouldUpgrade(probs.thirdUCToHyperspaceRL)) {
    const hsRLBelt = getHyperspaceRareLegendaryBelt(setCode)
    const upgraded = hsRLBelt.next()
    if (upgraded) pack.cards[uncommonIndices[2]] = upgraded
  }

  // 6. First UC upgrade to Hyperspace UC
  if (uncommonIndices.length >= 1 && probs.firstUCToHyperspaceUC && shouldUpgrade(probs.firstUCToHyperspaceUC)) {
    const hsUCBelt = getHyperspaceUncommonBelt(setCode)
    const upgraded = hsUCBelt.next()
    if (upgraded) pack.cards[uncommonIndices[0]] = upgraded
  }

  // 7. Second UC upgrade to Hyperspace UC
  if (uncommonIndices.length >= 2 && probs.secondUCToHyperspaceUC && shouldUpgrade(probs.secondUCToHyperspaceUC)) {
    const hsUCBelt = getHyperspaceUncommonBelt(setCode)
    const upgraded = hsUCBelt.next()
    if (upgraded) pack.cards[uncommonIndices[1]] = upgraded
  }

  // 8. Common upgrade (pick one random common and replace with HS common)
  if (commonIndices.length > 0 && probs.commonToHyperspace && shouldUpgrade(probs.commonToHyperspace)) {
    const randomCommonIndex = commonIndices[Math.floor(Math.random() * commonIndices.length)]
    const hsCommonBelt = getHyperspaceCommonBelt(setCode)
    const upgraded = hsCommonBelt.next()
    if (upgraded) pack.cards[randomCommonIndex] = upgraded
  }

  return pack
}

/**
 * Generate a single booster pack
 * @param {Array} cards - All cards
 * @param {string} setCode - Set code (SOR, SHD, etc.)
 * @returns {Object} Pack object with cards array
 */
export function generateBoosterPack(cards, setCode) {
  // Get belts
  const leaderBelt = getLeaderBelt(setCode)
  const baseBelt = getBaseBelt(setCode)
  const foilBelt = getFoilBelt(setCode)
  const rareLegendaryBelt = getRareLegendaryBelt(setCode)
  const uncommonBelt = getUncommonBelt(setCode)
  const { beltA: commonBeltA, beltB: commonBeltB } = getCommonBelts(setCode)

  // Build pack
  const packCards = []

  // 1 Leader (from belt)
  const leader = leaderBelt.next()
  if (leader) packCards.push(leader)

  // 1 Base (from belt)
  const base = baseBelt.next()
  if (base) packCards.push(base)

  // 9 Commons (alternating between Belt A and Belt B)
  // Pattern: A,B,A,B,A,B,A,B,A or B,A,B,A,B,A,B,A,B
  const firstBelt = startWithBeltA ? commonBeltA : commonBeltB
  const secondBelt = startWithBeltA ? commonBeltB : commonBeltA

  for (let i = 0; i < 9; i++) {
    const belt = (i % 2 === 0) ? firstBelt : secondBelt
    const common = belt.next()
    if (common) packCards.push(common)
  }

  // Toggle for next pack
  startWithBeltA = !startWithBeltA

  // 3 Uncommons (from belt)
  for (let i = 0; i < 3; i++) {
    const uncommon = uncommonBelt.next()
    if (uncommon) packCards.push(uncommon)
  }

  // 1 Rare or Legendary (from belt)
  const rareOrLegendary = rareLegendaryBelt.next()
  if (rareOrLegendary) packCards.push(rareOrLegendary)

  // 1 Foil (from belt, already marked as foil)
  const foilCard = foilBelt.next()
  if (foilCard) packCards.push(foilCard)

  // Check for duplicates in pack (for debugging)
  // A duplicate is defined as same ID AND same foil status
  const seen = new Map() // Map of card.id to array of {index, isFoil}
  const duplicates = []

  packCards.forEach((card, index) => {
    const id = card.id

    if (!seen.has(id)) {
      seen.set(id, [])
    }

    // Check if we've seen this card with the same foil status
    const matchingCards = seen.get(id).filter(c => c.isFoil === card.isFoil)

    if (matchingCards.length > 0) {
      // True duplicate found (same ID and same foil status)
      const firstMatch = matchingCards[0]
      duplicates.push({
        id: id,
        name: card.name,
        positions: [firstMatch.index, index],
        isFoil: card.isFoil
      })
    }

    seen.get(id).push({ index: index, isFoil: card.isFoil })
  })



  // Create pack and apply upgrade pass
  const pack = { cards: packCards }
  return applyUpgradePass(pack, setCode)
}

/**
 * Generate a sealed pod (6 booster packs)
 * @param {Array} cards - All cards
 * @param {string} setCode - Set code
 * @param {number} packCount - Number of packs (default 6)
 * @returns {Array} Array of pack objects (each with cards array)
 */
export function generateSealedPod(cards, setCode, packCount = 6) {
  // Clear belt cache for fresh pod generation
  // This ensures each sealed pod starts with a fresh belt at random position
  clearBeltCache()

  const packs = []
  for (let i = 0; i < packCount; i++) {
    packs.push(generateBoosterPack(cards, setCode))
  }
  return packs
}
