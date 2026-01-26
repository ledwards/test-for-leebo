// Card cache utility - preloads all cards for fast access

import { getAllCards, getCardsBySet } from './cardData.js'

// Cache for all cards organized by set
const cardCache = new Map()

// Flag to track if cache is initialized
let cacheInitialized = false

/**
 * Initialize the card cache by loading all cards
 * This should be called on app startup
 * Since card data is loaded synchronously from JSON, this is instant
 */
export function initializeCardCache() {
  if (cacheInitialized) {
    return Promise.resolve()
  }

  try {
    const allCards = getAllCards()
    
    // Organize cards by set
    const sets = ['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC']
    sets.forEach(setCode => {
      const setCards = getCardsBySet(setCode)
      cardCache.set(setCode, setCards)
    })
    
    cacheInitialized = true
    // Return resolved promise immediately since data is already loaded
    return Promise.resolve()
  } catch (error) {
    console.error('Failed to initialize card cache:', error)
    return Promise.reject(error)
  }
}

/**
 * Get cards for a specific set from cache
 * @param {string} setCode - The set code
 * @returns {Array} Array of cards from that set
 */
export function getCachedCards(setCode) {
  return cardCache.get(setCode) || []
}

/**
 * Check if cache is initialized
 * @returns {boolean}
 */
export function isCacheInitialized() {
  return cacheInitialized
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
export function getCacheStats() {
  const stats = {
    initialized: cacheInitialized,
    sets: {},
    totalCards: 0,
  }
  
  cardCache.forEach((cards, setCode) => {
    stats.sets[setCode] = cards.length
    stats.totalCards += cards.length
  })
  
  return stats
}
