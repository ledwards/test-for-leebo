/**
 * Box and Case Filling System
 * 
 * Implements sequential box and case filling to simulate
 * realistic TCG product distribution.
 */

import { generateCompleteSheetSet, initializePointers, generateBoosterPackFromSheets } from './packBuilder.js'

/**
 * Generate a booster box (24 packs)
 * @param {Array} cards - All cards in the set
 * @param {string} setCode - Set code
 * @param {Object} sheets - Pre-generated sheets (optional)
 * @param {Object} pointers - Pointers for sheets (optional)
 * @returns {Object} Box object with packs and metadata
 */
export function generateBoosterBox(cards, setCode, sheets = null, pointers = null) {
  // Generate sheets if not provided
  if (!sheets) {
    sheets = generateCompleteSheetSet(cards, setCode)
  }
  
  // Initialize pointers if not provided
  if (!pointers) {
    pointers = initializePointers(sheets)
  }
  
  const packs = []
  const packsPerBox = 24
  
  // Fill box sequentially (bottom-to-top, left-to-right in retail box)
  for (let i = 0; i < packsPerBox; i++) {
    const pack = generateBoosterPackFromSheets(sheets, pointers, cards, setCode)
    packs.push({
      packNumber: i + 1,
      position: {
        row: Math.floor(i / 6), // 6 packs per row in typical box layout
        col: i % 6
      },
      cards: pack
    })
  }
  
  return {
    type: 'booster-box',
    setCode,
    packCount: packsPerBox,
    packs,
    sheets: sheets, // Keep reference for case generation
    pointers: pointers, // Keep pointers for continued generation
    metadata: {
      generated: new Date().toISOString()
    }
  }
}

/**
 * Generate a case (6 booster boxes)
 * @param {Array} cards - All cards in the set
 * @param {string} setCode - Set code
 * @returns {Object} Case object with boxes
 */
export function generateCase(cards, setCode) {
  const boxesPerCase = 6
  const boxes = []
  
  // Generate sheets once for entire case
  const sheets = generateCompleteSheetSet(cards, setCode)
  const pointers = initializePointers(sheets)
  
  // Fill case with boxes sequentially
  for (let i = 0; i < boxesPerCase; i++) {
    const box = generateBoosterBox(cards, setCode, sheets, pointers)
    boxes.push({
      boxNumber: i + 1,
      ...box
    })
  }
  
  return {
    type: 'case',
    setCode,
    boxCount: boxesPerCase,
    totalPacks: boxesPerCase * 24,
    boxes,
    metadata: {
      generated: new Date().toISOString()
    }
  }
}

/**
 * Open a specific box from a case
 * @param {Object} caseObj - Case object
 * @param {number} boxNumber - Box number (1-6)
 * @returns {Object} Box object
 */
export function openBoxFromCase(caseObj, boxNumber) {
  if (boxNumber < 1 || boxNumber > caseObj.boxCount) {
    throw new Error(`Invalid box number ${boxNumber}. Must be between 1 and ${caseObj.boxCount}`)
  }
  
  return caseObj.boxes[boxNumber - 1]
}

/**
 * Open a specific pack from a box
 * @param {Object} box - Box object
 * @param {number} packNumber - Pack number (1-24)
 * @returns {Object} Pack object
 */
export function openPackFromBox(box, packNumber) {
  if (packNumber < 1 || packNumber > box.packCount) {
    throw new Error(`Invalid pack number ${packNumber}. Must be between 1 and ${box.packCount}`)
  }
  
  return box.packs[packNumber - 1]
}

/**
 * Get all cards from a box (useful for statistics)
 * @param {Object} box - Box object
 * @returns {Array} All cards from all packs in box
 */
export function getAllCardsFromBox(box) {
  const allCards = []
  for (const pack of box.packs) {
    allCards.push(...pack.cards)
  }
  return allCards
}

/**
 * Get all cards from a case (useful for statistics)
 * @param {Object} caseObj - Case object
 * @returns {Array} All cards from all boxes in case
 */
export function getAllCardsFromCase(caseObj) {
  const allCards = []
  for (const box of caseObj.boxes) {
    allCards.push(...getAllCardsFromBox(box))
  }
  return allCards
}

/**
 * Get statistics for a box
 * @param {Object} box - Box object
 * @returns {Object} Statistics object
 */
export function getBoxStatistics(box) {
  const cards = getAllCardsFromBox(box)
  
  const stats = {
    totalCards: cards.length,
    byRarity: {},
    hyperspace: 0,
    foil: 0,
    showcase: 0,
    byAspect: {},
    uniqueCards: new Set()
  }
  
  for (const card of cards) {
    // Rarity
    const rarity = card.rarity || 'Unknown'
    stats.byRarity[rarity] = (stats.byRarity[rarity] || 0) + 1
    
    // Variants
    if (card.isHyperspace) stats.hyperspace++
    if (card.isFoil) stats.foil++
    if (card.isShowcase) stats.showcase++
    
    // Aspects
    if (card.aspects) {
      for (const aspect of card.aspects) {
        stats.byAspect[aspect] = (stats.byAspect[aspect] || 0) + 1
      }
    }
    
    // Unique cards
    stats.uniqueCards.add(`${card.name}-${card.set}`)
  }
  
  stats.uniqueCardCount = stats.uniqueCards.size
  delete stats.uniqueCards // Don't include set in return
  
  return stats
}

/**
 * Get statistics for a case
 * @param {Object} caseObj - Case object
 * @returns {Object} Statistics object
 */
export function getCaseStatistics(caseObj) {
  const cards = getAllCardsFromCase(caseObj)
  
  const stats = {
    totalBoxes: caseObj.boxCount,
    totalPacks: caseObj.totalPacks,
    totalCards: cards.length,
    byRarity: {},
    hyperspace: 0,
    foil: 0,
    showcase: 0,
    byAspect: {},
    uniqueCards: new Set(),
    perBox: []
  }
  
  for (const card of cards) {
    // Rarity
    const rarity = card.rarity || 'Unknown'
    stats.byRarity[rarity] = (stats.byRarity[rarity] || 0) + 1
    
    // Variants
    if (card.isHyperspace) stats.hyperspace++
    if (card.isFoil) stats.foil++
    if (card.isShowcase) stats.showcase++
    
    // Aspects
    if (card.aspects) {
      for (const aspect of card.aspects) {
        stats.byAspect[aspect] = (stats.byAspect[aspect] || 0) + 1
      }
    }
    
    // Unique cards
    stats.uniqueCards.add(`${card.name}-${card.set}`)
  }
  
  stats.uniqueCardCount = stats.uniqueCards.size
  delete stats.uniqueCards
  
  // Per-box statistics
  for (const box of caseObj.boxes) {
    stats.perBox.push(getBoxStatistics(box))
  }
  
  return stats
}
