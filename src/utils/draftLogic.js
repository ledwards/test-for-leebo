/**
 * Draft Logic Utilities
 *
 * Handles pack generation and draft flow logic for multiplayer drafts.
 */

import { generateBoosterPack, clearBeltCache } from './boosterPack.js'

/**
 * Generate draft packs for all players
 * Each player gets 3 packs, with leaders extracted separately
 *
 * @param {string} setCode - Set code (SOR, SHD, etc.)
 * @param {number} playerCount - Number of players (default 8)
 * @returns {Object} { packs: playerPacks[][], leaders: playerLeaders[][] }
 */
export function generateDraftPacks(setCode, playerCount = 8) {
  // console.log('[DRAFT] Generating packs for', playerCount, 'players, set:', setCode)

  // Clear belt cache for fresh generation
  clearBeltCache()

  const packsPerPlayer = 3
  const allPlayerPacks = []
  const allPlayerLeaders = []

  // Global counter for unique instance IDs across the entire draft
  let instanceCounter = 0

  for (let player = 0; player < playerCount; player++) {
    // console.log('[DRAFT] Generating packs for player', player + 1)
    const playerPacks = []
    const playerLeaders = []

    for (let packNum = 0; packNum < packsPerPlayer; packNum++) {
      // console.log('[DRAFT] Player', player + 1, 'pack', packNum + 1, '- starting generation')
      // Generate a pack
      const pack = generateBoosterPack(null, setCode)
      // console.log('[DRAFT] Player', player + 1, 'pack', packNum + 1, '- generation complete')

      // Add unique instance IDs to all cards in the pack
      // This prevents race conditions where the same base card ID exists in multiple packs
      pack.cards.forEach(card => {
        card.instanceId = `${card.id}_${instanceCounter++}`
      })

      // Extract leader from pack
      const leaderIndex = pack.cards.findIndex(c => c.isLeader)
      if (leaderIndex >= 0) {
        playerLeaders.push(pack.cards[leaderIndex])
        // Remove leader from pack for drafting
        pack.cards.splice(leaderIndex, 1)
      }

      // Remove base from pack (bases are not drafted)
      const baseIndex = pack.cards.findIndex(c => c.isBase)
      if (baseIndex >= 0) {
        pack.cards.splice(baseIndex, 1)
      }

      playerPacks.push(pack.cards)
    }

    allPlayerPacks.push(playerPacks)
    allPlayerLeaders.push(playerLeaders)
  }

  return {
    packs: allPlayerPacks,  // [player][packNumber][cards]
    leaders: allPlayerLeaders  // [player][leaders] - 3 leaders per player
  }
}

/**
 * Get pass direction for a pack number
 * Pack 1: pass left, Pack 2: pass right, Pack 3: pass left
 *
 * @param {number} packNumber - 1-indexed pack number
 * @returns {string} 'left' or 'right'
 */
export function getPassDirection(packNumber) {
  return packNumber % 2 === 1 ? 'left' : 'right'
}

/**
 * Calculate next seat in pass direction
 * In a clockwise-seated draft:
 * - Pass LEFT = clockwise = to the player on your left = decreasing seat number (1→8, 2→1)
 * - Pass RIGHT = counter-clockwise = to the player on your right = increasing seat number (1→2, 2→3)
 *
 * @param {number} currentSeat - Current seat number (1-indexed)
 * @param {string} direction - 'left' or 'right'
 * @param {number} totalSeats - Total number of seats (default 8)
 * @returns {number} Next seat number
 */
export function getNextSeat(currentSeat, direction, totalSeats = 8) {
  if (direction === 'left') {
    // Left = clockwise = decreasing seat numbers (1 -> 8 -> 7 -> ... -> 2 -> 1)
    return currentSeat <= 1 ? totalSeats : currentSeat - 1
  } else {
    // Right = counter-clockwise = increasing seat numbers (1 -> 2 -> 3 -> ... -> 8 -> 1)
    return currentSeat >= totalSeats ? 1 : currentSeat + 1
  }
}

/**
 * Check if all players have made their pick
 *
 * @param {Array} players - Array of player objects with pick_status
 * @returns {boolean} True if all players have picked
 */
export function allPlayersPicked(players) {
  return players.every(p => p.pick_status === 'picked')
}

/**
 * Get leader pass direction for leader draft round
 * Leader draft always passes RIGHT
 *
 * @param {number} round - 1-indexed round number
 * @returns {string} 'right'
 */
export function getLeaderPassDirection(round) {
  return 'right'
}

/**
 * Calculate current pick number for timer display
 *
 * @param {number} packNumber - Current pack (1-3)
 * @param {number} pickInPack - Pick number within current pack (1-14)
 * @returns {number} Overall pick number
 */
export function getOverallPickNumber(packNumber, pickInPack) {
  const cardsPerPack = 14 // After removing leader and base
  return (packNumber - 1) * cardsPerPack + pickInPack
}

/**
 * Get the number of cards in each draft pack (after removing leader and base)
 */
export function getCardsPerDraftPack() {
  // Original pack: 16 cards (1 leader + 1 base + 9 commons + 3 uncommons + 1 rare/legendary + 1 foil)
  // After removing leader and base: 14 cards
  return 14
}

/**
 * Rotate seat number to position current user at bottom
 *
 * @param {number} seatNumber - Original seat number (1-8)
 * @param {number} userSeat - Current user's seat number
 * @param {number} totalSeats - Total seats (default 8)
 * @returns {number} Display position (1-8, where user's seat maps to position 1)
 */
export function getDisplayPosition(seatNumber, userSeat, totalSeats = 8) {
  // Calculate how many positions to rotate
  const rotation = userSeat - 1
  // Apply inverse rotation to get display position
  let position = seatNumber - rotation
  if (position <= 0) position += totalSeats
  return position
}

/**
 * Map display position to visual position around the table
 * Position 1 (current user) is at the bottom center
 *
 * Layout:
 *         [4]     [5]
 *     [3]             [6]
 *     [2]             [7]
 *         [1]  YOU
 *
 * Wait, the plan says:
 *         [3]     [4]
 *     [2]             [5]
 *     [1]             [6]
 *         [8]  YOU  [7]
 *
 * So position 1 (current user) should be at bottom, with positions going clockwise
 */
export function getPositionCoordinates(displayPosition, totalSeats = 8) {
  // These are relative positions for a circular layout
  // Position 1 is at the bottom (current user)
  const positions = {
    1: { x: 50, y: 85 },   // Bottom center (YOU)
    2: { x: 15, y: 65 },   // Bottom-left
    3: { x: 10, y: 35 },   // Left
    4: { x: 25, y: 10 },   // Top-left
    5: { x: 75, y: 10 },   // Top-right
    6: { x: 90, y: 35 },   // Right
    7: { x: 85, y: 65 },   // Bottom-right
    8: { x: 50, y: 85 },   // Overlaps with position 1 for 7-player mode
  }

  return positions[displayPosition] || { x: 50, y: 50 }
}
