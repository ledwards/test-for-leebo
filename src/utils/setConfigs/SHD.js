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
    specialInFoilRate: 0,
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
