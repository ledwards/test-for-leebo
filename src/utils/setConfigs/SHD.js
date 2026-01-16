/**
 * Set Configuration for SHD - Shadows of the Galaxy
 * Set 2
 */

export const SHD_CONFIG = {
  setCode: 'SHD',
  setName: 'Shadows of the Galaxy',
  setNumber: 2,
  
  // Distribution period
  distributionPeriod: 'pre-lawless-time',
  
  // Pack construction rules
  packRules: {
    // Rare bases can appear in rare slot
    rareBasesInRareSlot: true,
    
    // Special rarity cards can appear in foil/hyperfoil slots only
    specialInFoilSlot: false,
    
    // Special rarity rate in foil slot (when applicable)
    specialInFoilRate: 0, // Not applicable for this set
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
