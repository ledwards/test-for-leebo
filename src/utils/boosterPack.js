// Booster pack generation logic based on:
// https://starwarsunlimited.com/articles/boosting-ahead-of-release
//
// IMPORTANT: This file now uses sheet-based pack generation for realistic TCG collation.
// The old random generation system has been replaced with a printer/sheet-based model.

import { generateBoosterPack as generateBoosterPackFromSheets, generateSealedPod as generateSealedPodFromSheets } from './packBuilder.js'

/**
 * Generate a single booster pack according to SWU rules
 * 
 * Pack contents:
 * - 1 Leader card (guaranteed, in leader slot only)
 * - 1 Base card (guaranteed, in base slot only)
 * - 9 Common cards (alternating between Belt A and Belt B)
 * - 3 Uncommon cards (3rd slot can be upgraded)
 * - 1 Rare or Legendary card
 * - 1 Foil card (can be any rarity)
 * 
 * Total: 16 cards
 * 
 * NEW: Uses sheet-based generation system for realistic pack collation.
 * Cards are pulled sequentially from print sheets, simulating actual TCG manufacturing.
 * 
 * Variants:
 * - Hyperspace variant: ~2/3 of packs have at least one hyperspace card
 * - Showcase variant: ~1 in 288 packs for leaders
 * - Foil: Standard foil ~5/6, Hyperspace foil ~1/6
 */
export function generateBoosterPack(cards, setCode) {
  return generateBoosterPackFromSheets(cards, setCode)
}

/**
 * Generate 6 booster packs for a sealed pod
 * 
 * NEW: Uses sheet-based generation with sequential pulls from same sheets,
 * ensuring realistic pack-to-pack variation and proper collation.
 */
export function generateSealedPod(cards, setCode) {
  return generateSealedPodFromSheets(cards, setCode, 6)
}
