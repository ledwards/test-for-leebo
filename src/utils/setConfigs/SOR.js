/**
 * Set Configuration for SOR - Spark of Rebellion
 * Set 1
 */

import { SETS_1_3_CONSTANTS } from '../packConstants.js'

const constants = SETS_1_3_CONSTANTS

export const SOR_CONFIG = {
  setCode: 'SOR',
  setName: 'Spark of Rebellion',
  setNumber: 1,
  color: '#CC0000', // Darker red

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
  // NOTE: Key names must match what boosterPack.js expects
  upgradeProbabilities: {
    // Leader upgrades
    leaderToHyperspace: constants.leaderHyperspaceRate,         // ~1/6
    leaderToShowcase: constants.showcaseLeaderRate,             // ~1/288

    // Base upgrade
    baseToHyperspace: constants.baseHyperspaceRate,             // ~1/4

    // Foil upgrade
    foilToHyperfoil: constants.hyperfoilRate,                   // ~1/50

    // UC slot upgrades (slot 3 can upgrade to HS R/L)
    // NOTE: thirdUCToHyperspaceRL is the total UC3 upgrade rate
    // The ucSlot3UpgradedWeights determines what rarity within that
    thirdUCToHyperspaceRL: constants.ucSlot3UpgradeRate,        // ~1/5.5
    firstUCToHyperspaceUC: constants.uncommonHyperspaceRate,    // ~1/8.5
    secondUCToHyperspaceUC: constants.uncommonHyperspaceRate,   // ~1/8.5

    // Common upgrade
    commonToHyperspace: constants.commonHyperspaceRate,         // ~1/3

    // Rare slot upgrade (always 0% - R slot is always black-border)
    rareToHyperspaceRL: constants.rareSlotHyperspaceRate,       // 0%
  }
}
