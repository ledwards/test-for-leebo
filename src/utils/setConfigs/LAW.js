/**
 * Set Configuration for LAW - A Lawless Time
 * Set 7 (Beta)
 *
 * Major pack changes for this set (per FFG announcement):
 * - No regular foils - foil slot is ALWAYS Hyperspace Foil
 * - Guaranteed Hyperspace card in every pack (middle common slot)
 * - Prestige cards in standard boosters (~1 in 18 packs)
 * - Showcase leaders are significantly rarer
 * - First set with triple-aspect cards (double primary aspect)
 * - LAST set where rare bases appear in the rare slot
 *
 * Source: https://starwarsunlimited.com/articles/a-shift-from-what-was
 *
 * NOTE: Card counts are preliminary based on partial swuapi.com data.
 * Run `npm run fetch-cards` to update when full data is available.
 */

import { SET_7_PLUS_CONSTANTS } from '../packConstants.js'

const constants = SET_7_PLUS_CONSTANTS

export const LAW_CONFIG = {
  setCode: 'LAW',
  setName: 'A Lawless Time',
  setNumber: 7,
  color: '#8B4513', // Brown/western theme
  beta: true, // Beta-only set, requires beta access to view

  // Card counts (Normal variants only) - from swuapi.com data
  cardCounts: {
    leaders: {
      common: 4,  // Darth Vader, The Client, Han Solo, Hera Syndulla
      rare: 6,    // Sebulba, Lando, Agent Kallus, Jyn Erso, Director Krennic x2
      total: 12   // includes 2 Special leaders (Leia Organa, Jabba)
    },
    bases: {
      common: 4,  // Daimyo's Palace, Aldhani Garrison, Stygeon Spire, Canto Bight
      rare: 3,    // Alliance Outpost, Shipbreaking Yard, Citadel Research Center
      total: 8    // includes 1 Special base (Great Pit of Carkoon)
    },
    commons: 27,
    uncommons: 34,
    rares: 37,
    legendaries: 13,
    specials: 10
  },

  // Pack construction rules - LAW-specific
  packRules: {
    // LAW is the LAST set where rare bases go in the rare slot
    // Future sets (8+) will have rare bases in the base slot
    rareBasesInRareSlot: true,

    // No regular foils - foil slot is always Hyperspace Foil
    foilSlotIsHyperspaceFoil: true,

    // Guaranteed Hyperspace common in every pack
    guaranteedHyperspaceCommon: true,
    hyperspaceCommonSlot: 5, // Middle slot (1-indexed)

    // Prestige cards can appear in standard packs
    prestigeInStandardPacks: true,

    // Special rarity can appear in foil/hyperspace slots
    specialInFoilSlot: constants.specialInFoilSlot,
  },

  // Rarity weights for different slots
  rarityWeights: {
    // Foil slot is now always Hyperspace Foil
    hyperspaceFoilSlot: constants.hyperspaceFoilSlotWeights,
    ucSlot3Upgraded: constants.ucSlot3UpgradedWeights,
    hyperspaceNonFoil: constants.hyperspaceNonFoilWeights,
  },

  // Belt ratios
  beltRatios: {
    rareToLegendary: constants.rareSlotLegendaryRatio,
  },

  // Upgrade probabilities
  upgradeProbabilities: {
    // Leader upgrades
    leaderToHyperspace: constants.leaderHyperspaceRate,
    leaderToShowcase: constants.showcaseLeaderRate,

    // Base upgrade
    baseToHyperspace: constants.baseHyperspaceRate,

    // Foil slot - NO upgrade needed, it's always Hyperspace Foil
    // foilToHyperfoil is effectively 1.0 but handled differently
    foilToHyperfoil: 0, // Handled by foilSlotIsHyperspaceFoil rule

    // UC slot upgrades
    thirdUCToHyperspaceRL: constants.ucSlot3UpgradeRate,
    firstUCToHyperspaceUC: constants.uncommonHyperspaceRate,
    secondUCToHyperspaceUC: constants.uncommonHyperspaceRate,

    // Common upgrades (beyond the guaranteed HS common)
    commonToHyperspace: constants.commonHyperspaceRate,

    // Rare slot - can be replaced by Prestige
    rareToHyperspaceRL: constants.rareSlotHyperspaceRate,
    rareToPrestige: constants.prestigeInRareSlotRate,
  },

  // Triple-aspect card handling
  // LAW introduces cards with double primary aspects (e.g., Vigilance + Command + Heroism)
  // For collation purposes, we assign these to Belt A if they contain any Belt A aspect
  tripleAspect: {
    enabled: true,
    // Belt assignment strategy for triple-aspect cards:
    // - If card has Vigilance, Command, OR their belt aspects -> Belt A
    // - Otherwise -> Belt B
    // This is configurable in case we need to adjust
    beltAssignment: 'primaryAspectPriority', // Options: 'primaryAspectPriority', 'randomBelt', 'splitEvenly'
  },
}
