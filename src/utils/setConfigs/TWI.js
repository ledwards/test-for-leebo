/**
 * Set Configuration for TWI - Twilight of the Republic
 * Set 3
 */

export const TWI_CONFIG = {
  setCode: 'TWI',
  setName: 'Twilight of the Republic',
  setNumber: 3,
  color: '#6B0000', // Reddish maroon

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
