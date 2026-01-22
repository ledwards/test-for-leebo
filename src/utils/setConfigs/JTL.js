/**
 * Set Configuration for JTL - Jump to Lightspeed
 * Set 4
 */

export const JTL_CONFIG = {
  setCode: 'JTL',
  setName: 'Jump to Lightspeed',
  setNumber: 4,
  color: '#FFD700', // Yellow

  // Card counts (Normal variants only)
  cardCounts: {
    leaders: {
      common: 8,
      rare: 10,
      total: 18
    },
    bases: {
      common: 13,
      rare: 0,
      total: 13
    },
    commons: 98,
    uncommons: 60,
    rares: 45,
    legendaries: 20,
    specials: 8
  },

  // Pack construction rules
  packRules: {
    rareBasesInRareSlot: true,
    specialInFoilSlot: true, // Set 4 has Special rarity cards in foil slots
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
