// Card data utilities
// This module handles loading and managing card data from the definition file
// Card fixes are applied at runtime to ensure all code uses corrected data

import cardDataRaw from '../data/cards.json' with { type: 'json' }
import { applyCardFixes } from './cardFixes.js'

// Apply fixes once at module load
const processedData = applyCardFixes(cardDataRaw)

/**
 * Get all cards for a specific set
 * @param {string} setCode - The set code (e.g., 'SOR', 'SHD', etc.)
 * @returns {Array} Array of cards from that set
 */
export function getCardsBySet(setCode) {
  if (!processedData.cards || processedData.cards.length === 0) {
    return []
  }
  return processedData.cards.filter((card) => card.set === setCode)
}

/**
 * Get all cards
 * @returns {Array} All cards in the database
 */
export function getAllCards() {
  return processedData.cards || []
}

/**
 * Get metadata about the card data
 * @returns {Object} Metadata including fix count
 */
export function getCardMetadata() {
  return processedData.metadata || {}
}

/**
 * Get cards filtered by rarity
 * @param {Array} cards - Cards to filter
 * @param {string} rarity - Rarity to filter by (Common, Uncommon, Rare, Legendary)
 * @returns {Array} Filtered cards
 */
export function filterByRarity(cards, rarity) {
  return cards.filter((card) => card.rarity === rarity)
}

/**
 * Get cards filtered by type
 * @param {Array} cards - Cards to filter
 * @param {string} type - Type to filter by (Leader, Base, Unit, etc.)
 * @returns {Array} Filtered cards
 */
export function filterByType(cards, type) {
  return cards.filter((card) => card.type === type)
}

/**
 * Get leader cards
 * @param {Array} cards - Cards to filter
 * @returns {Array} Leader cards
 */
export function getLeaders(cards) {
  return cards.filter((card) => card.isLeader === true || card.type === 'Leader')
}

/**
 * Get base cards
 * @param {Array} cards - Cards to filter
 * @returns {Array} Base cards
 */
export function getBases(cards) {
  return cards.filter((card) => card.isBase === true || card.type === 'Base')
}

/**
 * Card schema:
 * {
 *   id: string (unique identifier)
 *   name: string (card name)
 *   set: string (set code: SOR, SHD, TWI, JTL, LOF, SEC)
 *   rarity: string (Common, Uncommon, Rare, Legendary)
 *   type: string (Leader, Base, Unit, Event, Upgrade, etc.)
 *   aspects: Array<string> (e.g., ["Villainy", "Command"])
 *   cost: number (resource cost)
 *   isLeader: boolean
 *   isBase: boolean
 *   imageUrl: string (optional, URL to card image)
 *   // ... other metadata as needed
 * }
 */
