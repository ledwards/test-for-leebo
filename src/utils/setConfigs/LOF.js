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
  
  // Sheet configuration
  sheetConfig: {
    // 46 R × 2 copies = 92 cards
    // 20 L × 1 copy = 20 cards
    // Total: 112 cards, 9 blanks
    rareLegendary: {
      size: 121,
      layout: {
        rares: { count: 46, copies: 2 },
        legendaries: { count: 20, copies: 1 },
        blanks: 9
      },
      legendaryRate: 0.1667 // ~1 in 6 packs (20 legendaries / 120 total cards on sheet) - HIGHER than sets 1-3!
    },
    
    uncommon: {
      size: 121,
      sheets: 1,
      layout: {
        uncommons: { count: 60, copies: 2 },
        blanks: 1
      }
    },
    
    // 100 commons × 4 copies = 400 cards
    // Need 4 sheets (484 slots) - 84 blanks
    common: {
      size: 121,
      sheets: 4,
      totalCards: 484,
      layout: {
        commons: { count: 100, copies: 4 },
        blanks: 84
      },
      belts: {
        beltA: {
          aspects: ['Vigilance', 'Command', 'Neutral'],
          approximateCount: 48
        },
        beltB: {
          aspects: ['Aggression', 'Cunning'],
          approximateCount: 52
        }
      }
    },
    
    leader: {
      size: 121,
      layout: {
        commonLeaders: { count: 8, copies: 10 },
        rareLeaders: { count: 10, copies: 4 },
        blanks: 1
      },
      rareLeaderRate: 0.167
    },
    
    base: {
      size: 121,
      layout: {
        commonBases: { count: 12, copies: 10 },
        blanks: 1
      }
    },
    
    foil: {
      size: 121,
      layout: {
        commons: { approximate: 80 },
        uncommons: { approximate: 24 },
        rares: { approximate: 12 },
        legendaries: { approximate: 3 },
        specials: { approximate: 2 } // Sets 4-6 include Special rarity in foil slots
      }
    }
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
