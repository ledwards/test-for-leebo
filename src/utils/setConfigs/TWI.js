/**
 * Set Configuration for TWI - Twilight of the Republic
 * Set 3
 */

export const TWI_CONFIG = {
  setCode: 'TWI',
  setName: 'Twilight of the Republic',
  setNumber: 3,
  color: '#6B0000', // Reddish maroon

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
    commons: 90,
    uncommons: 60,
    rares: 48,
    legendaries: 16,
    specials: 13
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
