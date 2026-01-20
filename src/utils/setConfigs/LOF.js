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
    specialInFoilRate: 0.015,
    hyperspacePackRate: 0.667,
  },

  // Upgrade slot configuration
  upgradeSlot: {
    hyperspaceChance: 0.25,
    rarityDistribution: {
      Common: 0.60,
      Uncommon: 0.25,
      Rare: 0.12,
      Legendary: 0.03,
    }
  }
}
