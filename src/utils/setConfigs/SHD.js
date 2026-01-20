/**
 * Set Configuration for SHD - Shadows of the Galaxy
 * Set 2
 */

export const SHD_CONFIG = {
  setCode: 'SHD',
  setName: 'Shadows of the Galaxy',
  setNumber: 2,
  color: '#9B59B6', // Purple

  // Distribution period
  distributionPeriod: 'pre-lawless-time',

  // Card counts (Normal variants only)
  cardCounts: {
    leaders: {
      common: 8,
      rare: 10,
      total: 18
    },
    bases: {
      common: 8,
      rare: 0,
      total: 8
    },
    commons: 90,
    uncommons: 60,
    rares: 52,
    legendaries: 16,
    specials: 18
  },

  // Pack construction rules
  packRules: {
    rareBasesInRareSlot: true,
    specialInFoilSlot: false,
  },

  // Upgrade probabilities (chance for slot to be upgraded)
  upgradeProbabilities: {
    leaderToHyperspace: 1/6,
    baseToHyperspace: 1/6,
    leaderToShowcase: 1/(2*6*24),
    rareToHyperspaceRL: 1/15,
    foilToHyperfoil: 1/15,
    thirdUCToHyperspaceRL: 1/10,
    firstUCToHyperspaceUC: 1/10,
    secondUCToHyperspaceUC: 1/10,
    commonToHyperspace: 1/6,
  }
}
