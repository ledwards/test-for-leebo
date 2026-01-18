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
  
  // Sheet configuration
  sheetConfig: {
    // Rare/Legendary sheet: 11x11 = 121 cards
    // 52 R × 2 copies = 104 cards
    // 16 L × 1 copy = 16 cards
    // Total: 120 cards, 1 blank
    rareLegendary: {
      size: 121,
      layout: {
        rares: { count: 52, copies: 2 },
        legendaries: { count: 16, copies: 1 },
        blanks: 1
      },
      legendaryRate: 0.1333 // ~1 in 7.5 packs (16 legendaries / 120 total cards on sheet)
    },
    
    uncommon: {
      size: 121,
      sheets: 1,
      layout: {
        uncommons: { count: 60, copies: 2 },
        blanks: 1
      }
    },
    
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
          approximateCount: 42
        },
        beltB: {
          aspects: ['Aggression', 'Cunning'],
          approximateCount: 48
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
        commonBases: { count: 8, copies: 15 },
        blanks: 1
      }
    },
    
    foil: {
      size: 121,
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
