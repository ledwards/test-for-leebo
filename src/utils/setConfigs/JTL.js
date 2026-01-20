/**
 * Set Configuration for JTL - Jump to Lightspeed
 * Set 4
 */

export const JTL_CONFIG = {
  setCode: 'JTL',
  setName: 'Jump to Lightspeed',
  setNumber: 4,
  color: '#FFD700', // Yellow

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
    specialInFoilRate: 0.015, // ~1.5% of foils
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
