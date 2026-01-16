/**
 * Set Configuration for LOF - Legends of the Force
 * Set 5
 */

export const LOF_CONFIG = {
  setCode: 'LOF',
  setName: 'Legends of the Force',
  setNumber: 5,
  
  // Distribution period
  distributionPeriod: 'pre-lawless-time',
  
  // Pack construction rules
  packRules: {
    // Rare bases can appear in rare slot
    rareBasesInRareSlot: true,
    
    // Special rarity cards can appear in foil/hyperfoil slots only
    specialInFoilSlot: true,
    
    // Special rarity rate in foil slot (when applicable)
    // ~1-2% of foils when applicable
    specialInFoilRate: 0.015, // ~1.5% (middle of 1-2% range)
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
