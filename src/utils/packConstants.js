/**
 * Pack Generation Constants
 *
 * Centralized configuration for all pack generation parameters.
 * All probabilities and ratios are defined here for easy auditing.
 *
 * Sources:
 * - FFG official announcements
 * - Community box break analysis
 * - Experimental data from opened packs
 *
 * NOTE: These values are best estimates. Some may be adjusted as more data becomes available.
 */

// ============================================================================
// PACK STRUCTURE (applies to all sets)
// ============================================================================

export const PACK_STRUCTURE = {
  totalCards: 16,
  leaders: 1,
  bases: 1,
  commons: 9,        // Alternating between Belt A and Belt B
  uncommons: 3,      // UC slot 1, 2, and 3 (slot 3 can upgrade)
  rareOrLegendary: 1,
  foils: 1,
}

// ============================================================================
// ASPECT COVERAGE (applies to all sets)
// ============================================================================

export const ASPECT_COVERAGE = {
  // Every pack guarantees all 6 aspects in commons
  requiredAspects: ['Vigilance', 'Command', 'Aggression', 'Cunning', 'Heroism', 'Villainy'],

  // Belt A aspects (draw positions 0, 2, 4, 6, 8)
  beltAAspects: ['Vigilance', 'Command', 'Heroism'],

  // Belt B aspects (draw positions 1, 3, 5, 7)
  beltBAspects: ['Aggression', 'Cunning', 'Villainy'],
}

// ============================================================================
// SETS 1-3 CONSTANTS (SOR, SHD, TWI)
// ============================================================================

export const SETS_1_3_CONSTANTS = {
  // ---------------------------------------------------------------------------
  // Foil Slot Rarity Weights (Question 1)
  // 70% C / 20% U / 8% R / 2% L
  // ---------------------------------------------------------------------------
  foilSlotWeights: {
    Common: 70,
    Uncommon: 20,
    Rare: 8,
    Legendary: 2,
    Special: 0,  // No Special in foil slot for sets 1-3
  },

  // ---------------------------------------------------------------------------
  // Hyperfoil Rate (Question 2)
  // ~1 in 50 packs (approximately 1 per 2 boxes)
  // ---------------------------------------------------------------------------
  hyperfoilRate: 1 / 50,

  // ---------------------------------------------------------------------------
  // Rare Slot Legendary Ratio (Question 15)
  // Standard Legendary rate is 1 in 8 (so 7:1 ratio R:L, or 6 rares per 1 legendary)
  // ---------------------------------------------------------------------------
  rareSlotLegendaryRatio: 6,  // 6:1 means 6 rares for every 1 legendary

  // ---------------------------------------------------------------------------
  // UC Slot 3 Upgrade Rate (Question 3)
  // ~1 in 5.5 packs total HS upgrade rate
  // ---------------------------------------------------------------------------
  ucSlot3UpgradeRate: 1 / 5.5,

  // ---------------------------------------------------------------------------
  // UC Slot 3 Upgraded Rarity Weights (Question 4, 14)
  // ~64% U / 31% R / 5% L
  // ---------------------------------------------------------------------------
  ucSlot3UpgradedWeights: {
    Uncommon: 64,
    Rare: 31,
    Legendary: 5,
    Special: 0,
  },

  // ---------------------------------------------------------------------------
  // Leader Hyperspace Upgrade Rate (Question 5)
  // ~1 in 6 packs (4 per box)
  // ---------------------------------------------------------------------------
  leaderHyperspaceRate: 1 / 6,

  // ---------------------------------------------------------------------------
  // Base Hyperspace Upgrade Rate (Question 6)
  // ~1 in 4 packs (6 per box)
  // ---------------------------------------------------------------------------
  baseHyperspaceRate: 1 / 4,

  // ---------------------------------------------------------------------------
  // Common Hyperspace Upgrade Rate (Question 7)
  // ~1 in 3 packs (replaces a common slot)
  // ---------------------------------------------------------------------------
  commonHyperspaceRate: 1 / 3,

  // ---------------------------------------------------------------------------
  // Uncommon Hyperspace Upgrade Rate (Question 8)
  // ~1 in 8.5 packs (goes in UC Slot 3)
  // ---------------------------------------------------------------------------
  uncommonHyperspaceRate: 1 / 8.5,

  // ---------------------------------------------------------------------------
  // Rare/Legendary Hyperspace Upgrade in R Slot (Questions 9, 10)
  // 0% - R slot is always black-border
  // ---------------------------------------------------------------------------
  rareSlotHyperspaceRate: 0,

  // ---------------------------------------------------------------------------
  // HS Non-Foil Rarity Weights (Question 12)
  // 90% C / 6% U / 3% R / 1% L
  // ---------------------------------------------------------------------------
  hyperspaceNonFoilWeights: {
    Common: 90,
    Uncommon: 6,
    Rare: 3,
    Legendary: 1,
    Special: 0,
  },

  // ---------------------------------------------------------------------------
  // Hyperfoil Rarity Weights (Question 13)
  // Mirrors standard foil (mostly Common)
  // ---------------------------------------------------------------------------
  hyperfoilWeights: {
    Common: 70,
    Uncommon: 20,
    Rare: 8,
    Legendary: 2,
    Special: 0,
  },

  // ---------------------------------------------------------------------------
  // Showcase Leader Rate
  // Very rare - approximately 1 in 288 packs
  // ---------------------------------------------------------------------------
  showcaseLeaderRate: 1 / 288,

  // ---------------------------------------------------------------------------
  // Special Rarity Handling
  // Sets 1-3: No Special rarity cards in packs (Question 11)
  // ---------------------------------------------------------------------------
  specialInFoilSlot: false,
  specialInHyperspaceSlot: false,
}

// ============================================================================
// SETS 4-6 CONSTANTS (JTL, LOF, SEC)
// ============================================================================

export const SETS_4_6_CONSTANTS = {
  // ---------------------------------------------------------------------------
  // Foil Slot Rarity Weights (Questions 1, 11)
  // 65% C / 20% U / 8% R / 4% S / 3% L
  // ---------------------------------------------------------------------------
  foilSlotWeights: {
    Common: 65,
    Uncommon: 20,
    Rare: 8,
    Special: 4,
    Legendary: 3,
  },

  // ---------------------------------------------------------------------------
  // Hyperfoil Rate (Question 2)
  // ~1 in 50 packs (remains the "chase")
  // ---------------------------------------------------------------------------
  hyperfoilRate: 1 / 50,

  // ---------------------------------------------------------------------------
  // Rare Slot Legendary Ratio (Question 15)
  // Standard Legendary rate is 1 in 5 (so 4:1 ratio R:L, or 5 rares per 1 legendary)
  // ---------------------------------------------------------------------------
  rareSlotLegendaryRatio: 5,  // 5:1 means 5 rares for every 1 legendary

  // ---------------------------------------------------------------------------
  // UC Slot 3 Upgrade Rate (Question 3)
  // ~1 in 5 packs (slightly more frequent than sets 1-3)
  // ---------------------------------------------------------------------------
  ucSlot3UpgradeRate: 1 / 5,

  // ---------------------------------------------------------------------------
  // UC Slot 3 Upgraded Rarity Weights (Question 4, 14)
  // ~60% U / 25% R / 10% S / 5% L
  // ---------------------------------------------------------------------------
  ucSlot3UpgradedWeights: {
    Uncommon: 60,
    Rare: 25,
    Special: 10,
    Legendary: 5,
  },

  // ---------------------------------------------------------------------------
  // Leader Hyperspace Upgrade Rate (Question 5)
  // ~1 in 6 packs (4 per box)
  // ---------------------------------------------------------------------------
  leaderHyperspaceRate: 1 / 6,

  // ---------------------------------------------------------------------------
  // Base Hyperspace Upgrade Rate (Question 6)
  // ~1 in 4 packs (6 per box)
  // ---------------------------------------------------------------------------
  baseHyperspaceRate: 1 / 4,

  // ---------------------------------------------------------------------------
  // Common Hyperspace Upgrade Rate (Question 7)
  // ~1 in 3 packs (replaces a common slot)
  // ---------------------------------------------------------------------------
  commonHyperspaceRate: 1 / 3,

  // ---------------------------------------------------------------------------
  // Uncommon Hyperspace Upgrade Rate (Question 8)
  // ~1 in 8 packs (goes in UC Slot 3)
  // ---------------------------------------------------------------------------
  uncommonHyperspaceRate: 1 / 8,

  // ---------------------------------------------------------------------------
  // Rare/Legendary Hyperspace Upgrade in R Slot (Questions 9, 10)
  // 0% - R slot is always black-border
  // ---------------------------------------------------------------------------
  rareSlotHyperspaceRate: 0,

  // ---------------------------------------------------------------------------
  // HS Non-Foil Rarity Weights (Question 12)
  // 85% C / 7% U / 4% R / 3% S / 1% L
  // ---------------------------------------------------------------------------
  hyperspaceNonFoilWeights: {
    Common: 85,
    Uncommon: 7,
    Rare: 4,
    Special: 3,
    Legendary: 1,
  },

  // ---------------------------------------------------------------------------
  // Hyperfoil Rarity Weights (Question 13)
  // Mirrors standard foil (mostly Common)
  // ---------------------------------------------------------------------------
  hyperfoilWeights: {
    Common: 65,
    Uncommon: 20,
    Rare: 8,
    Special: 4,
    Legendary: 3,
  },

  // ---------------------------------------------------------------------------
  // Showcase Leader Rate
  // Very rare - approximately 1 in 288 packs
  // ---------------------------------------------------------------------------
  showcaseLeaderRate: 1 / 288,

  // ---------------------------------------------------------------------------
  // Special Rarity Handling
  // Sets 4-6: Special rarity cards appear in packs
  // ---------------------------------------------------------------------------
  specialInFoilSlot: true,
  specialInHyperspaceSlot: true,
}

// ============================================================================
// HELPER FUNCTION TO GET CONSTANTS BY SET
// ============================================================================

/**
 * Get pack constants for a specific set number
 * @param {number} setNumber - The set number (1-6)
 * @returns {Object} The constants for that set group
 */
export function getPackConstants(setNumber) {
  if (setNumber >= 1 && setNumber <= 3) {
    return SETS_1_3_CONSTANTS
  } else if (setNumber >= 4 && setNumber <= 6) {
    return SETS_4_6_CONSTANTS
  }
  // Default to sets 1-3 for unknown sets
  return SETS_1_3_CONSTANTS
}

/**
 * Convert rarity weights object to an array suitable for belt filling
 * @param {Object} weights - Object with rarity keys and weight values
 * @returns {Array} Array of {rarity, weight} objects, sorted by weight descending
 */
export function weightsToArray(weights) {
  return Object.entries(weights)
    .filter(([_, weight]) => weight > 0)
    .map(([rarity, weight]) => ({ rarity, weight }))
    .sort((a, b) => b.weight - a.weight)
}

/**
 * Calculate the total weight from a weights object
 * @param {Object} weights - Object with rarity keys and weight values
 * @returns {number} Total weight
 */
export function totalWeight(weights) {
  return Object.values(weights).reduce((sum, w) => sum + w, 0)
}
