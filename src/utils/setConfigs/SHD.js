/**
 * Set Configuration for SHD - Shadows of the Galaxy
 * Set 2
 */

import { SETS_1_3_CONSTANTS } from '../packConstants.js'

const constants = SETS_1_3_CONSTANTS

export const SHD_CONFIG = {
  setCode: 'SHD',
  setName: 'Shadows of the Galaxy',
  setNumber: 2,
  color: '#9B59B6', // Purple

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
    specialInFoilSlot: constants.specialInFoilSlot,
  },

  // Rarity weights for different slots (from packConstants)
  rarityWeights: {
    foilSlot: constants.foilSlotWeights,
    hyperfoil: constants.hyperfoilWeights,
    ucSlot3Upgraded: constants.ucSlot3UpgradedWeights,
    hyperspaceNonFoil: constants.hyperspaceNonFoilWeights,
  },

  // Belt ratios
  beltRatios: {
    rareToLegendary: constants.rareSlotLegendaryRatio,  // 6:1 for R slot
  },

  // Upgrade probabilities (chance for slot to be upgraded)
  upgradeProbabilities: {
    // Leader upgrades
    leaderToHyperspace: constants.leaderHyperspaceRate,         // ~1/6
    leaderToShowcase: constants.showcaseLeaderRate,             // ~1/288

    // Base upgrade
    baseToHyperspace: constants.baseHyperspaceRate,             // ~1/4

    // Foil upgrade
    foilToHyperfoil: constants.hyperfoilRate,                   // ~1/50

    // UC slot upgrades
    thirdUCToHyperspaceRL: constants.ucSlot3UpgradeRate,        // ~1/5.5
    firstUCToHyperspaceUC: constants.uncommonHyperspaceRate,    // ~1/8.5
    secondUCToHyperspaceUC: constants.uncommonHyperspaceRate,   // ~1/8.5

    // Common upgrade
    commonToHyperspace: constants.commonHyperspaceRate,         // ~1/3

    // Rare slot upgrade (always 0%)
    rareToHyperspaceRL: constants.rareSlotHyperspaceRate,       // 0%
  }
}
