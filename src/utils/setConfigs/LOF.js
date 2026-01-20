/**
 * Set Configuration for LOF - Legends of the Force
 * Set 5
 */

export const LOF_CONFIG = {
  setCode: 'LOF',
  setName: 'Legends of the Force',
  setNumber: 5,
  color: '#5DADE2', // Light blue

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
      common: 12,
      rare: 0,
      total: 12
    },
    commons: 100,
    uncommons: 60,
    rares: 46,
    legendaries: 20,
    specials: 8
  },

  // Pack construction rules
  packRules: {
    rareBasesInRareSlot: true,
    specialInFoilSlot: true,
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
