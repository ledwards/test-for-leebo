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
  
  // Sheet configuration
  sheetConfig: {
    rareLegendary: {
      size: 121,
      layout: {
        rares: { count: 48, copies: 2 },
        legendaries: { count: 16, copies: 1 },
        blanks: 9
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
        commonBases: { count: 12, copies: 10 },
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
