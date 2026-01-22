/**
 * Set Configuration for SEC - Secrets of Power
 * Set 6
 */

export const SEC_CONFIG = {
  setCode: 'SEC',
  setName: 'Secrets of Power',
  setNumber: 6,
  color: '#6A1B9A', // Darker purple

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
    commons: 100,
    uncommons: 60,
    rares: 50,
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
