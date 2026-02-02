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
import { CommonBelt } from '../belts/CommonBelt.js'
import { getBlockForSet, getBeltConfig } from '../belts/data/commonBeltAssignments.js'
import { ShowcaseLeaderBelt } from '../belts/ShowcaseLeaderBelt.js'
import { HyperfoilBelt } from '../belts/HyperfoilBelt.js'
import { HyperspaceLeaderBelt } from '../belts/HyperspaceLeaderBelt.js'
import { HyperspaceBaseBelt } from '../belts/HyperspaceBaseBelt.js'
import { HyperspaceUncommonBelt } from '../belts/HyperspaceUncommonBelt.js'
import { HyperspaceCommonBelt } from '../belts/HyperspaceCommonBelt.js'
import { HyperspaceRareLegendaryBelt } from '../belts/HyperspaceRareLegendaryBelt.js'
import { getSetConfig } from './setConfigs/index.js'
import { getCachedCards } from './cardCache.js'

/**
 * Find the Hyperspace variant of a specific card
 * Returns the HS version if found, null otherwise
 */
function findHyperspaceVariant(card, setCode) {
  if (!card || !card.name) return null

  const allCards = getCachedCards(setCode)

  // Find a card with the same name but Hyperspace variantType
  // Must also match type to avoid Leader/Unit confusion (e.g., "Leia Organa" exists as both)
  const hsVariant = allCards.find(c =>
    c.name === card.name &&
    c.variantType === 'Hyperspace' &&
    c.rarity === card.rarity && // Same rarity (Common leaders stay Common, etc.)
    c.type === card.type // Same type to avoid Leader/Unit confusion
  )

  if (hsVariant) {
    return { ...hsVariant, isHyperspace: true }
  }
  return null
}

/**
 * Find the Showcase variant of a specific card
 * Returns the Showcase version if found, null otherwise
 */
function findShowcaseVariant(card, setCode) {
  if (!card || !card.name) return null

  const allCards = getCachedCards(setCode)

  // Must also match type to avoid Leader/Unit confusion
  const showcaseVariant = allCards.find(c =>
    c.name === card.name &&
    c.variantType === 'Showcase' &&
    c.type === card.type
  )

  if (showcaseVariant) {
    return { ...showcaseVariant, isShowcase: true }
  }
  return null
}

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
 *
 * Block 0 (SOR, SHD, TWI):
 * - Belt A: Vigilance, Command, Aggression (60 cards)
 * - Belt B: Cunning, Villainy, Heroism, Neutral (30 cards)
 *
 * Block A (JTL, LOF, SEC):
 * - Belt A: Vigilance, Command, Villainy (50 cards)
 * - Belt B: Aggression, Cunning, Heroism, Neutral (50 cards)
 */
function getCommonBelts(setCode) {
  const keyA = `common-a-${setCode}`
  const keyB = `common-b-${setCode}`

  if (!beltCache.has(keyA) || !beltCache.has(keyB)) {
    beltCache.set(keyA, new CommonBelt(setCode, 'A'))
    beltCache.set(keyB, new CommonBelt(setCode, 'B'))
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
  // IMPORTANT: Upgrades must find the variant of the SAME leader, not a random one!
  // This prevents getting both HS and Normal versions of the same leader in a pod.
  if (leaderIndex >= 0) {
    const currentLeader = pack.cards[leaderIndex]
    if (probs.leaderToShowcase && shouldUpgrade(probs.leaderToShowcase)) {
      // Upgrade to Showcase version of THIS leader
      const upgraded = findShowcaseVariant(currentLeader, setCode)
      if (upgraded) pack.cards[leaderIndex] = upgraded
    } else if (probs.leaderToHyperspace && shouldUpgrade(probs.leaderToHyperspace)) {
      // Upgrade to Hyperspace version of THIS leader
      const upgraded = findHyperspaceVariant(currentLeader, setCode)
      if (upgraded) pack.cards[leaderIndex] = upgraded
    }
  }

  // 2. Base upgrade - find HS version of THIS base
  if (baseIndex >= 0 && probs.baseToHyperspace && shouldUpgrade(probs.baseToHyperspace)) {
    const currentBase = pack.cards[baseIndex]
    const upgraded = findHyperspaceVariant(currentBase, setCode)
    if (upgraded) pack.cards[baseIndex] = upgraded
  }

  // 3. Rare slot upgrade to Hyperspace R/L - find HS version of THIS card
  if (rareIndex >= 0 && probs.rareToHyperspaceRL && shouldUpgrade(probs.rareToHyperspaceRL)) {
    const currentRare = pack.cards[rareIndex]
    const upgraded = findHyperspaceVariant(currentRare, setCode)
    if (upgraded) pack.cards[rareIndex] = upgraded
  }

  // 4. Foil upgrade to Hyperfoil - replace with a Hyperspace Foil card from belt
  if (foilIndex >= 0 && probs.foilToHyperfoil && shouldUpgrade(probs.foilToHyperfoil)) {
    const hyperfoilBelt = getHyperfoilBelt(setCode)
    const upgraded = hyperfoilBelt.next()
    if (upgraded) {
      pack.cards[foilIndex] = upgraded
    }
  }

  // 5. First UC upgrade to Hyperspace UC - find HS version of THIS uncommon
  // IMPORTANT: Apply UC->HS_UC upgrades BEFORE UC->HS_R/L to avoid index corruption
  if (uncommonIndices.length >= 1 && probs.firstUCToHyperspaceUC && shouldUpgrade(probs.firstUCToHyperspaceUC)) {
    const currentUC = pack.cards[uncommonIndices[0]]
    const upgraded = findHyperspaceVariant(currentUC, setCode)
    if (upgraded) pack.cards[uncommonIndices[0]] = upgraded
  }

  // 6. Second UC upgrade to Hyperspace UC - find HS version of THIS uncommon
  if (uncommonIndices.length >= 2 && probs.secondUCToHyperspaceUC && shouldUpgrade(probs.secondUCToHyperspaceUC)) {
    const currentUC = pack.cards[uncommonIndices[1]]
    const upgraded = findHyperspaceVariant(currentUC, setCode)
    if (upgraded) pack.cards[uncommonIndices[1]] = upgraded
  }

  // 7. Third UC upgrade to Hyperspace R/L (RARITY change - uses belt for random R/L)
  // This is intentionally a random R/L card, not the same UC in HS form
  // This MUST happen after UC->HS_UC upgrades since it changes rarity and corrupts uncommonIndices
  // IMPORTANT: Must avoid picking a card whose Normal version is already in the pack (e.g., the Rare slot)
  if (uncommonIndices.length >= 3 && probs.thirdUCToHyperspaceRL && shouldUpgrade(probs.thirdUCToHyperspaceRL)) {
    const hsRLBelt = getHyperspaceRareLegendaryBelt(setCode)
    // Get names of all non-foil cards already in the pack to avoid duplicates
    const existingNames = new Set(pack.cards.filter(c => !c.isFoil).map(c => c.name))

    // Try to get a HS R/L card that isn't already in the pack (up to 5 attempts)
    let upgraded = null
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = hsRLBelt.next()
      if (candidate && !existingNames.has(candidate.name)) {
        upgraded = candidate
        break
      }
    }
    if (upgraded) pack.cards[uncommonIndices[2]] = upgraded
  }

  // 8. Common upgrade - find HS version of the card in the specific hyperspace slot
  // Block 0: Slot 6 (index 7 = leader + base + 5 more)
  // Block A: Slot 4 (index 5 = leader + base + 3 more)
  if (probs.commonToHyperspace && shouldUpgrade(probs.commonToHyperspace)) {
    const block = getBlockForSet(setCode)
    const config = getBeltConfig(block)
    // hyperspaceSlot is 1-indexed, convert to pack index (after leader and base)
    const hyperspaceIndex = 1 + config.hyperspaceSlot // +1 for leader, slot is 1-indexed
    if (hyperspaceIndex < pack.cards.length) {
      const currentCommon = pack.cards[hyperspaceIndex]
      if (currentCommon && currentCommon.rarity === 'Common' && !currentCommon.isLeader && !currentCommon.isBase) {
        const upgraded = findHyperspaceVariant(currentCommon, setCode)
        if (upgraded) pack.cards[hyperspaceIndex] = upgraded
      }
    }
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
  const currentStartWithA = startWithBeltA

  // 1 Leader (from belt)
  const leader = leaderBelt.next()
  if (leader) packCards.push(leader)

  // 1 Base (from belt)
  const base = baseBelt.next()
  if (base) packCards.push(base)

  // 9 Commons - slot pattern depends on block
  // Block 0 (SOR, SHD, TWI): Belt A for slots 1-6, Belt B for slots 7-9
  // Block A (JTL, LOF, SEC): Belt A for slots 1-4, slot 5 alternates, Belt B for slots 6-9
  const block = getBlockForSet(setCode)
  const config = getBeltConfig(block)

  for (let slot = 1; slot <= 9; slot++) {
    let belt
    if (block === 0) {
      // Block 0: Belt A for slots 1-6, Belt B for slots 7-9
      belt = (slot <= 6) ? commonBeltA : commonBeltB
    } else {
      // Block A: Belt A for slots 1-4, slot 5 alternates, Belt B for slots 6-9
      if (slot <= 4) {
        belt = commonBeltA
      } else if (slot === 5) {
        // Slot 5 alternates between Belt A and Belt B
        belt = startWithBeltA ? commonBeltA : commonBeltB
      } else {
        belt = commonBeltB
      }
    }
    const common = belt.next()
    if (common) packCards.push(common)
  }

  // Toggle alternating slot for next pack
  startWithBeltA = !startWithBeltA

  // Dedup commons - belt cycling can rarely produce duplicates
  // Replace any duplicate commons with fresh cards from the appropriate belt
  const commonNames = new Set()
  for (let i = 2; i < 11; i++) { // Commons are at indices 2-10 (after leader/base)
    const card = packCards[i]
    if (!card) continue

    if (commonNames.has(card.name)) {
      // Duplicate found - get a replacement from the belt this slot came from
      const slot = i - 1 // Convert index to slot (1-indexed)
      let replacementBelt
      if (block === 0) {
        replacementBelt = (slot <= 6) ? commonBeltA : commonBeltB
      } else {
        if (slot <= 4) {
          replacementBelt = commonBeltA
        } else if (slot === 5) {
          replacementBelt = currentStartWithA ? commonBeltA : commonBeltB
        } else {
          replacementBelt = commonBeltB
        }
      }

      // Try to find a non-duplicate replacement
      for (let attempt = 0; attempt < 10; attempt++) {
        const replacement = replacementBelt.next()
        if (replacement && !commonNames.has(replacement.name)) {
          packCards[i] = replacement
          commonNames.add(replacement.name)
          break
        }
      }
    } else {
      commonNames.add(card.name)
    }
  }

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
  const upgradedPack = applyUpgradePass(pack, setCode)

  return upgradedPack
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
