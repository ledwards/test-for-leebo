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
  
  // Sheet configuration for printer-based pack generation
  sheetConfig: {
    // Rare/Legendary sheet: 11x11 = 121 cards
    // 48 R × 2 copies = 96 cards
    // 16 L × 1 copy = 16 cards
    // Total: 112 cards, 9 blanks
    rareLegendary: {
      size: 121,
      layout: {
        rares: { count: 48, copies: 2 },
        legendaries: { count: 16, copies: 1 },
        blanks: 9
      },
      legendaryRate: 0.1333 // ~1 in 7.5 packs (16 legendaries / 120 total cards on sheet)
    },
    
    // Uncommon sheets: 11x11 = 121 cards
    // 60 U × 2 copies = 120 cards, 1 blank
    uncommon: {
      size: 121,
      sheets: 1,
      layout: {
        uncommons: { count: 60, copies: 2 },
        blanks: 1
      }
    },
    
    // Common sheets (Belt system): 3 sheets × 121 = 363 cards
    // 90 commons × 4 copies = 360 cards, 3 blanks
    // Belt A: Vigilance, Command, Neutral (42 cards)
    // Belt B: Aggression, Cunning (36 cards + 12 multi-aspect) = 48 cards
    common: {
      size: 121,
      sheets: 3,
      totalCards: 363,
      layout: {
        commons: { count: 90, copies: 4 },
        blanks: 3
      },
      belts: {
        beltA: {
          aspects: ['Vigilance', 'Command', 'Neutral'],
          description: 'Vigilance + Command aspects, plus ~50% of Neutral/Hero/Villain cards',
          approximateCount: 45
        },
        beltB: {
          aspects: ['Aggression', 'Cunning', 'Neutral'],
          description: 'Aggression + Cunning aspects, plus ~50% of Neutral/Hero/Villain cards (different from Belt A)',
          approximateCount: 45
        }
      }
    },
    
    // Leader sheet: 11x11 = 121 cards
    // 8 Common leaders × ~10 copies = 80 cards
    // 10 Rare leaders × ~4 copies = 40 cards
    // Total: 120 cards, 1 blank
    leader: {
      size: 121,
      layout: {
        commonLeaders: { count: 8, copies: 10 },
        rareLeaders: { count: 10, copies: 4 },
        blanks: 1
      },
      rareLeaderRate: 0.167 // ~1 in 6 packs
    },
    
    // Base sheet: 11x11 = 121 cards
    // 12 common bases × 10 copies = 120 cards, 1 blank
    base: {
      size: 121,
      layout: {
        commonBases: { count: 12, copies: 10 },
        blanks: 1
      }
    },
    
    // Foil sheet: Contains all rarities at appropriate rates
    // Multiple foil sheet layouts used for proper distribution
    foil: {
      size: 121,
      // Foil distribution matches overall rarity distribution
      // Commons: ~70%, Uncommons: ~20%, Rares: ~8%, Legendaries: ~2%
      layout: {
        commons: { approximate: 85 },
        uncommons: { approximate: 24 },
        rares: { approximate: 10 },
        legendaries: { approximate: 2 }
      }
    }
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
