/**
 * Set Configuration for JTL - Jump to Lightspeed
 * Set 4
 */

import { SETS_4_6_CONSTANTS } from '../packConstants.js'

const constants = SETS_4_6_CONSTANTS

export const JTL_CONFIG = {
  setCode: 'JTL',
  setName: 'Jump to Lightspeed',
  setNumber: 4,
  color: '#FFD700', // Yellow

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
    specialInFoilSlot: constants.specialInFoilSlot,  // true for Set 4+
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
    rareToLegendary: constants.rareSlotLegendaryRatio,  // 5:1 for R slot
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
    thirdUCToHyperspaceRL: constants.ucSlot3UpgradeRate,        // ~1/5
    firstUCToHyperspaceUC: constants.uncommonHyperspaceRate,    // ~1/8
    secondUCToHyperspaceUC: constants.uncommonHyperspaceRate,   // ~1/8

    // Common upgrade
    commonToHyperspace: constants.commonHyperspaceRate,         // ~1/3

    // Rare slot upgrade (always 0%)
    rareToHyperspaceRL: constants.rareSlotHyperspaceRate,       // 0%
  }
}
