// Statistical analysis utilities for card generation statistics

import { getSetConfig } from './setConfigs/index.js'

/**
 * Calculate expected number of generations for a card given probability and total opportunities
 *
 * @param {number} probability - Probability of generating this card (0-1)
 * @param {number} totalOpportunities - Total number of times this card could have been generated
 * @returns {number} Expected count
 */
export function calculateExpectedCount(probability, totalOpportunities) {
  return probability * totalOpportunities
}

/**
 * Calculate Z-score for a proportion test
 * Tests whether observed frequency differs significantly from expected
 *
 * @param {number} observed - Observed count
 * @param {number} expected - Expected count
 * @param {number} n - Total trials
 * @param {number} p - Probability (0-1)
 * @returns {number} Z-score
 */
export function calculateZScore(observed, expected, n, p) {
  if (n === 0 || p === 0 || p === 1) return 0

  // Standard error for binomial proportion
  const standardError = Math.sqrt(n * p * (1 - p))

  if (standardError === 0) return 0

  // Z = (observed - expected) / SE
  return (observed - expected) / standardError
}

/**
 * Categorize statistical significance based on Z-score
 *
 * @param {number} zScore - The Z-score
 * @returns {Object} { status: 'expected'|'outlier'|'extreme', color: string, description: string }
 */
export function categorizeSignificance(zScore) {
  const absZ = Math.abs(zScore)

  if (absZ < 1.96) {
    // Within 95% confidence interval
    return {
      status: 'expected',
      color: '#27AE60', // Green
      description: 'Within expected range (95% CI)'
    }
  } else if (absZ < 2.58) {
    // Between 95% and 99% confidence interval
    return {
      status: 'outlier',
      color: '#F39C12', // Yellow/Orange
      description: 'Statistical outlier (95-99% CI)'
    }
  } else {
    // Beyond 99% confidence interval
    return {
      status: 'extreme',
      color: '#E74C3C', // Red
      description: 'Extreme outlier (>99% CI) - possible issue'
    }
  }
}

/**
 * Calculate percentage difference
 *
 * @param {number} observed - Observed count
 * @param {number} expected - Expected count
 * @returns {number} Percentage difference
 */
export function calculatePercentDifference(observed, expected) {
  if (expected === 0) return 0
  return ((observed - expected) / expected) * 100
}

/**
 * Format percentage for display
 *
 * @param {number} percent - Percentage value
 * @returns {string} Formatted string like "+5.2%" or "-3.1%"
 */
export function formatPercent(percent) {
  const sign = percent > 0 ? '+' : ''
  return `${sign}${percent.toFixed(1)}%`
}

/**
 * Get probability for a specific card treatment in a specific slot
 *
 * @param {Object} card - Card object
 * @param {string} treatment - Treatment type ('base', 'hyperspace', 'foil', 'hyperspace_foil', 'showcase')
 * @param {string} setCode - Set code (SOR, SHD, TWI)
 * @returns {number} Probability (0-1)
 */
export function getCardTreatmentProbability(card, treatment, setCode) {
  const setConfig = getSetConfig(setCode)
  if (!setConfig) return 0

  const packConstants = setConfig.packConstants

  // Determine which slot this card can appear in for this treatment
  if (treatment === 'base') {
    // Base treatment appears in regular slots
    if (card.isLeader) {
      return getLeaderProbability(card, setCode)
    } else if (card.isBase) {
      return getBaseProbability(card, setCode)
    } else {
      return getRegularCardProbability(card, setCode, false)
    }
  } else if (treatment === 'hyperspace') {
    // Hyperspace treatment in regular slots (non-foil)
    if (card.variantType !== 'Hyperspace') return 0
    return getRegularCardProbability(card, setCode, false)
  } else if (treatment === 'foil') {
    // Base card as foil
    if (card.variantType !== 'Normal') return 0
    return getFoilProbability(card, setCode)
  } else if (treatment === 'hyperspace_foil') {
    // Hyperspace as foil
    if (card.variantType !== 'Hyperspace') return 0
    return getFoilProbability(card, setCode)
  } else if (treatment === 'showcase') {
    // Showcase cards
    if (card.variantType !== 'Showcase') return 0
    return getShowcaseProbability(card, setCode)
  }

  return 0
}

/**
 * Get probability for a leader card
 */
function getLeaderProbability(card, setCode) {
  const setConfig = getSetConfig(setCode)
  if (!setConfig || !setConfig.cardCounts) return 0

  // Count total leaders in set (Normal variant only)
  const totalLeaders = setConfig.cardCounts.leaders?.total || 16

  // Each pack has 1 leader, uniform distribution
  return 1 / totalLeaders
}

/**
 * Get probability for a base card
 */
function getBaseProbability(card, setCode) {
  const setConfig = getSetConfig(setCode)
  if (!setConfig || !setConfig.cardCounts) return 0

  // Count total bases in set
  const totalBases = setConfig.cardCounts.bases?.total || 16

  // Each pack has 1 base, uniform distribution
  return 1 / totalBases
}

/**
 * Get probability for regular (non-leader, non-base) cards
 */
function getRegularCardProbability(card, setCode, isFoil = false) {
  const setConfig = getSetConfig(setCode)
  if (!setConfig || !setConfig.cardCounts) return 0

  const cardCounts = setConfig.cardCounts
  const rarity = card.rarity

  // Get counts for this rarity
  let totalInRarity = 0
  if (rarity === 'Common') {
    totalInRarity = cardCounts.commons || 90
  } else if (rarity === 'Uncommon') {
    totalInRarity = cardCounts.uncommons || 60
  } else if (rarity === 'Rare') {
    totalInRarity = cardCounts.rares || 47
  } else if (rarity === 'Legendary') {
    totalInRarity = cardCounts.legendaries || 18
  }

  if (totalInRarity === 0) return 0

  // Get upgrade rate from config
  const ucSlot3UpgradeRate = setConfig.packRules?.ucSlot3UpgradeRate || 0.18
  const rareSlotLegendaryRatio = setConfig.packRules?.rareSlotLegendaryRatio || 6
  const legendaryRate = 1 / (rareSlotLegendaryRatio + 1)

  // Calculate based on slot distribution
  if (rarity === 'Common') {
    // 9 common slots per pack, aspect-balanced
    // Each aspect should appear roughly equally, but exact distribution is complex
    // Simplified: uniform distribution within commons
    return (9 / totalInRarity)
  } else if (rarity === 'Uncommon') {
    // 2-3 uncommon slots (3rd can upgrade to rare/legendary)
    const uncommonSlots = 2 + (1 - ucSlot3UpgradeRate)
    return (uncommonSlots / totalInRarity)
  } else if (rarity === 'Rare' || rarity === 'Legendary') {
    // 1-2 rare/legendary slots
    // Base slot: always 1 rare or legendary
    // Upgrade slot: ~18% chance of upgrade from uncommon
    const upgradeChance = ucSlot3UpgradeRate

    if (rarity === 'Legendary') {
      // Legendary can appear in base slot or upgrade slot
      const baseSlotProb = legendaryRate / totalInRarity
      const upgradeSlotProb = upgradeChance * legendaryRate / totalInRarity
      return baseSlotProb + upgradeSlotProb
    } else {
      // Rare appears when legendary doesn't
      const baseSlotProb = (1 - legendaryRate) / totalInRarity
      const upgradeSlotProb = upgradeChance * (1 - legendaryRate) / totalInRarity
      return baseSlotProb + upgradeSlotProb
    }
  }

  return 0
}

/**
 * Get probability for a card in the foil slot
 */
function getFoilProbability(card, setCode) {
  const setConfig = getSetConfig(setCode)
  if (!setConfig || !setConfig.cardCounts) return 0

  const cardCounts = setConfig.cardCounts
  const rarity = card.rarity

  // Foil slot has weighted distribution by rarity
  const foilWeights = setConfig.rarityWeights?.foilSlot || {
    Common: 70,
    Uncommon: 20,
    Rare: 8,
    Legendary: 2
  }

  const rarityRate = (foilWeights[rarity] || 0) / 100

  // Count cards in this rarity (excluding leaders and bases)
  let totalInRarity = 0
  if (rarity === 'Common') {
    totalInRarity = cardCounts.commons || 90
  } else if (rarity === 'Uncommon') {
    totalInRarity = cardCounts.uncommons || 60
  } else if (rarity === 'Rare') {
    totalInRarity = cardCounts.rares || 47
  } else if (rarity === 'Legendary') {
    totalInRarity = cardCounts.legendaries || 18
  }

  if (totalInRarity === 0) return 0

  // Probability = (rarity rate in foil slot) / (number of cards in that rarity)
  return rarityRate / totalInRarity
}

/**
 * Get probability for showcase cards
 */
function getShowcaseProbability(card, setCode) {
  const setConfig = getSetConfig(setCode)
  if (!setConfig || !setConfig.cardCounts) return 0

  // Showcase cards can appear in regular slots or foil slot
  // This is complex and depends on the set's showcase distribution
  // For now, return a simplified probability

  // Showcase cards are treated similarly to hyperspace variants
  return getRegularCardProbability(card, setCode, false) + getFoilProbability(card, setCode)
}

/**
 * Calculate total opportunities for a card to be generated
 * Based on which slots it can appear in and total packs generated
 *
 * @param {string} treatment - Treatment type
 * @param {Object} card - Card object
 * @param {number} totalPacks - Total packs generated
 * @returns {number} Total opportunities
 */
export function calculateTotalOpportunities(treatment, card, totalPacks) {
  // Each pack is one opportunity for cards in regular slots
  // Foil slot is separate

  if (treatment === 'foil' || treatment === 'hyperspace_foil') {
    // Only foil slot
    return totalPacks
  } else if (treatment === 'base' || treatment === 'hyperspace') {
    // Regular slots
    if (card.isLeader || card.isBase) {
      // Leader/base slot - one per pack
      return totalPacks
    } else {
      // Multiple slots per pack depending on rarity
      // But we calculate per-pack probability, so opportunities = packs
      return totalPacks
    }
  } else if (treatment === 'showcase') {
    // Can appear in multiple slots
    return totalPacks
  }

  return totalPacks
}

/**
 * Analyze a single card's generation statistics
 *
 * @param {Object} card - Card object
 * @param {Object} stats - Stats object with counts per treatment
 * @param {number} totalPacks - Total packs generated
 * @param {string} setCode - Set code
 * @returns {Object} Analysis results
 */
export function analyzeCardStats(card, stats, totalPacks, setCode) {
  const treatments = ['base', 'hyperspace', 'foil', 'hyperspace_foil', 'showcase']
  const results = {}

  treatments.forEach(treatment => {
    const observed = stats[treatment] || 0
    const probability = getCardTreatmentProbability(card, treatment, setCode)
    const opportunities = calculateTotalOpportunities(treatment, card, totalPacks)
    const expected = calculateExpectedCount(probability, opportunities)

    const zScore = calculateZScore(observed, expected, opportunities, probability)
    const percentDiff = calculatePercentDifference(observed, expected)
    const significance = categorizeSignificance(zScore)

    results[treatment] = {
      observed,
      expected: Math.round(expected * 10) / 10, // Round to 1 decimal
      probability,
      opportunities,
      zScore: Math.round(zScore * 100) / 100, // Round to 2 decimals
      percentDiff: Math.round(percentDiff * 10) / 10, // Round to 1 decimal
      significance
    }
  })

  return results
}

/**
 * Get reference data for a set
 *
 * @param {string} setCode - Set code
 * @returns {Object} Reference data including pack constants, probabilities, etc.
 */
export function getSetReferenceData(setCode) {
  const setConfig = getSetConfig(setCode)
  if (!setConfig) return null

  const cardCounts = setConfig.cardCounts || {}
  const rarityWeights = setConfig.rarityWeights || {}
  const foilWeights = rarityWeights.foilSlot || {}

  // Calculate legendary rate from rare slot legendary ratio (e.g., 6:1 means 1/(6+1) = 14.3%)
  const rareSlotLegendaryRatio = setConfig.packRules?.rareSlotLegendaryRatio || 6
  const legendaryRate = 1 / (rareSlotLegendaryRatio + 1)

  // Calculate upgrade rate from UC slot 3
  const ucSlot3UpgradeRate = setConfig.packRules?.ucSlot3UpgradeRate || 0.18

  return {
    setCode,
    setName: setConfig.setName,
    packConstruction: {
      totalCards: 16,
      leaders: 1,
      bases: 1,
      commons: 9,
      uncommons: '2-3',
      raresLegendaries: '1-2',
      foils: 1
    },
    cardCounts: {
      leaders: cardCounts.leaders?.total || 16,
      bases: cardCounts.bases?.total || 16,
      commons: cardCounts.commons || 90,
      uncommons: cardCounts.uncommons || 60,
      rares: cardCounts.rares || 47,
      legendaries: cardCounts.legendaries || 18
    },
    dropRates: {
      legendaryInRareLegendarySlot: `${(legendaryRate * 100).toFixed(1)}%`,
      rareLegendaryUpgrade: `${(ucSlot3UpgradeRate * 100).toFixed(1)}%`,
      foilCommon: `${(foilWeights.Common || 70).toFixed(1)}%`,
      foilUncommon: `${(foilWeights.Uncommon || 20).toFixed(1)}%`,
      foilRare: `${(foilWeights.Rare || 8).toFixed(1)}%`,
      foilLegendary: `${(foilWeights.Legendary || 2).toFixed(1)}%`
    },
    hyperspaceRates: rarityWeights.hyperspaceNonFoil || {},
    showcaseRates: {}
  }
}
