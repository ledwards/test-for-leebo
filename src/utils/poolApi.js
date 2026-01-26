// API client for card pool operations
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

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
    const response = await fetch(`${API_BASE}/pools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(poolData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to save pool')
    }

    const data = await response.json()
    return data.data
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
    const response = await fetch(`${API_BASE}/pools/${shareId}`, {
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to load pool')
    }

    const data = await response.json()
    return data.data
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
    const response = await fetch(`${API_BASE}/pools/${shareId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update pool')
    }

    const data = await response.json()
    return data.data
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
    const response = await fetch(`${API_BASE}/pools/${shareId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    return response.ok
  } catch (error) {
    console.error('Failed to delete pool:', error)
    return false
  }
}

/**
 * Fetch all pools for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of pool objects
 */
export async function fetchUserPools(userId) {
  try {
    const response = await fetch(`${API_BASE}/pools/user/${userId}`, {
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch user pools')
    }

    const data = await response.json()
    // API returns { data: { pools: [...], total, limit, offset } } or { pools: [...] }
    const pools = data.data?.pools || data.pools || []
    return pools
  } catch (error) {
    console.error('Failed to fetch user pools:', error)
    throw error
  }
}
