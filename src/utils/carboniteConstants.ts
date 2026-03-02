// @ts-nocheck
/**
 * Carbonite Booster Pack Constants
 *
 * Carbonite packs are premium packs where every card is a variant
 * (foil, hyperspace, prestige, or showcase). Available for Sets 4-7.
 *
 * Pack structure differs between pre-LAW and LAW+ sets because
 * LAW eliminated traditional foils entirely.
 */

/**
 * Pre-LAW Carbonite (JTL, LOF, SEC) — 16 cards:
 * [0]     Leader — always Hyperspace (showcase upgrade ~1/20)
 * [1-4]   Common Foil x 4 (from CarboniteSlotBelt)
 * [5-6]   Uncommon Foil x 2 (from CarboniteSlotBelt)
 * [7]     R/L Foil x 1 (from CarboniteFoilRLBelt, weighted 70/20/10)
 * [8]     Prestige (synthesized from R/L pool)
 * [9-11]  Common Hyperspace x 3 (from CarboniteSlotBelt)
 * [12]    Uncommon Hyperspace x 1 (from CarboniteSlotBelt)
 * [13]    R/L Hyperspace x 1 (from CarboniteSlotBelt, weighted 70/20/10)
 * [14-15] Hyperspace Foil x 2 (from HyperfoilBelt)
 *
 * LAW+ Carbonite (LAW) — 16 cards:
 * [0]     Leader — always Hyperspace (showcase upgrade ~1/48)
 * [1]     Prestige (synthesized from R/L pool)
 * [2-9]   Hyperspace non-foil x 8 (weighted rarity)
 * [10-15] Hyperspace Foil x 6 (weighted rarity)
 */

export const CARBONITE_CONSTANTS = {
  // Which sets support Carbonite packs
  supportedSets: ['JTL', 'LOF', 'SEC', 'LAW'] as const,

  // Showcase leader upgrade rates (independent coin flip)
  showcaseRate: {
    preLaw: 1 / 20,   // ~5% per pack
    law: 1 / 48,       // ~2% per pack
  },

  // Prestige tier weights (determines visual tier of prestige card)
  prestigeTierWeights: {
    tier1: 80,
    tier2: 18,
    serialized: 2,
  },

  // Foil R/L belt weights (guaranteed R/L foil slot)
  foilRLWeights: {
    Rare: 70,
    Special: 20,
    Legendary: 10,
  } as Record<string, number>,

  // HS R/L belt weights (same distribution as foil R/L)
  hsRLWeights: {
    Rare: 70,
    Special: 20,
    Legendary: 10,
  } as Record<string, number>,

  // HS non-foil rarity weights for LAW+ Carbonite packs (weighted mixed-rarity belt)
  hsNonFoilWeights: {
    Common: 85,
    Uncommon: 7,
    Rare: 4,
    Special: 3,
    Legendary: 1,
  } as Record<string, number>,

  // Pre-LAW pack slot counts (rarity-specific belts)
  preLaw: {
    commonFoils: 4,     // Common Foil slots
    uncommonFoils: 2,   // Uncommon Foil slots
    foilRL: 1,          // R/L Foil slot (weighted)
    prestige: 1,        // Prestige slot
    commonHS: 3,        // Common Hyperspace slots
    uncommonHS: 1,      // Uncommon Hyperspace slot
    rlHS: 1,            // R/L Hyperspace slot (weighted)
    hsFoil: 2,          // Hyperspace Foil slots
  },

  // LAW+ pack slot counts
  law: {
    prestige: 1,
    hsNonFoil: 8,
    hsFoil: 6,
  },
} as const

/**
 * Check if a set code supports Carbonite packs
 */
export function isCarboniteSupported(baseSetCode: string): boolean {
  return (CARBONITE_CONSTANTS.supportedSets as readonly string[]).includes(baseSetCode)
}

/**
 * Extract the base set code from a composite Carbonite code
 * e.g., 'JTL-CB' -> 'JTL', 'LAW' -> 'LAW'
 */
export function getBaseSetCode(setCode: string): string {
  return setCode.replace('-CB', '')
}

/**
 * Check if a set code is a Carbonite composite code
 */
export function isCarboniteCode(setCode: string): boolean {
  return typeof setCode === 'string' && setCode.endsWith('-CB')
}
