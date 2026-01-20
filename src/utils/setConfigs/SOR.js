/**
 * Set Configuration for SOR - Spark of Rebellion
 * Set 1
 */

export const SOR_CONFIG = {
  setCode: 'SOR',
  setName: 'Spark of Rebellion',
  setNumber: 1,
  color: '#CC0000', // Darker red

  // Distribution period
  distributionPeriod: 'pre-lawless-time',

  // Card counts (Normal variants only)
  cardCounts: {
    leaders: {
      common: 8,
      rare: 10, // Includes both Rare and Legendary leaders
      total: 18
    },
    bases: {
      common: 12,
      rare: 0,
      total: 12
    },
    commons: 90,
    uncommons: 60,
    rares: 48,
    legendaries: 16,
    specials: 8
  },

  // Pack construction rules
  packRules: {
    // Rare bases can appear in rare slot
    rareBasesInRareSlot: true,

    // Special rarity cards can appear in foil/hyperfoil slots only
    specialInFoilSlot: false,
  },

  // Upgrade probabilities (chance for slot to be upgraded)
  upgradeProbabilities: {
    leaderToHyperspace: 1/6,           // 1/6 chance
    baseToHyperspace: 1/6,             // 1/6 chance
    leaderToShowcase: 1/(2*6*24),      // 1/288 chance
    rareToHyperspaceRL: 1/15,          // 1/15 chance
    foilToHyperfoil: 1/15,             // 1/15 chance
    thirdUCToHyperspaceRL: 1/10,       // 1/10 chance (upgrades to R/L, not UC)
    firstUCToHyperspaceUC: 1/10,       // 1/10 chance
    secondUCToHyperspaceUC: 1/10,      // 1/10 chance
    commonToHyperspace: 1/6,           // 1/6 chance (picks one random common)
  }
}
