/**
 * Pool API Client
 *
 * API client for card pool operations.
 * Uses httpClient for standardized request handling.
 */
import { httpClient } from '../repositories/httpClient.js'

/**
 * Save a card pool to the database
 * @param {Object} poolData - Pool data
 * @param {string} poolData.setCode - Set code (e.g., 'SOR')
 * @param {Array} poolData.cards - Array of all cards in the pool
 * @param {Array} poolData.packs - Array of pack arrays (for sealed pods)
 * @param {Object} poolData.deckBuilderState - Optional deck builder state
 * @param {boolean} poolData.isPublic - Whether pool is public
 * @returns {Promise<Object>} Saved pool with shareId and shareUrl
 */
export async function savePool(poolData) {
  try {
    return await httpClient.post('/pools', poolData)
  } catch (error) {
    console.error('Failed to save pool:', error)
    throw error
  }
}

/**
 * Load a pool by share ID
 * @param {string} shareId - Share ID of the pool
 * @returns {Promise<Object>} Pool data
 */
export async function loadPool(shareId) {
  try {
    return await httpClient.get(`/pools/${shareId}`)
  } catch (error) {
    console.error('Failed to load pool:', error)
    throw error
  }
}

/**
 * Update a pool (e.g., deck builder state)
 * @param {string} shareId - Share ID of the pool
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated pool data
 */
export async function updatePool(shareId, updates) {
  try {
    return await httpClient.put(`/pools/${shareId}`, updates)
  } catch (error) {
    console.error('Failed to update pool:', error)
    throw error
  }
}

/**
 * Delete a pool
 * @param {string} shareId - Share ID of the pool
 * @returns {Promise<boolean>} Success status
 */
export async function deletePool(shareId) {
  try {
    await httpClient.delete(`/pools/${shareId}`)
    return true
  } catch (error) {
    console.error('Failed to delete pool:', error)
    return false
  }
}

/**
 * Claim an anonymous pool (set user_id to current user)
 * @param {string} shareId - Share ID of the pool
 * @returns {Promise<Object>} Claim result { claimed: boolean, alreadyOwned?: boolean }
 */
export async function claimPool(shareId) {
  try {
    return await httpClient.post(`/pools/${shareId}/claim`)
  } catch (error) {
    console.error('Failed to claim pool:', error)
    throw error
  }
}

/**
 * Fetch all pools for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of pool objects
 */
export async function fetchUserPools(userId) {
  try {
    const data = await httpClient.get(`/pools/user/${userId}`)
    // API returns { pools: [...], total, limit, offset } or just pools array
    return data?.pools || data || []
  } catch (error) {
    console.error('Failed to fetch user pools:', error)
    throw error
  }
}
