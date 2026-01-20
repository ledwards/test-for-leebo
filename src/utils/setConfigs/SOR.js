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

    // Special rarity rate in foil slot (when applicable)
    specialInFoilRate: 0, // Not applicable for this set

    // Hyperspace rate: ~2/3 of packs have at least one hyperspace card
    hyperspacePackRate: 0.667,
  },

  // Upgrade slot configuration
  upgradeSlot: {
    // Chance for upgrade slot to be hyperspace
    hyperspaceChance: 0.25, // ~25%

    // Rarity distribution when upgrade slot is hyperspace
    rarityDistribution: {
      Common: 0.60,    // ~60%
      Uncommon: 0.25,  // ~25%
      Rare: 0.12,      // ~12%
      Legendary: 0.03, // ~3%
    }
  }
}
