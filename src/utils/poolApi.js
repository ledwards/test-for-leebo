// API client for card pools

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

/**
 * Create a new card pool
 * @param {Object} poolData - Pool data
 * @param {string} poolData.setCode - Set code
 * @param {Array} poolData.cards - Array of cards
 * @param {Array} [poolData.packs] - Array of packs (optional)
 * @param {Object} [poolData.deckBuilderState] - Deck builder state (optional)
 * @param {boolean} [poolData.isPublic] - Whether pool is public
 * @returns {Promise<Object>} Created pool data
 */
export async function createPool(poolData) {
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
    throw new Error(error.message || 'Failed to create pool')
  }

  const data = await response.json()
  return data.data
}

/**
 * Get a card pool by share ID
 * @param {string} shareId - Share ID
 * @returns {Promise<Object>} Pool data
 */
export async function getPool(shareId) {
  const response = await fetch(`${API_BASE}/pools/${shareId}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Pool not found')
    }
    const error = await response.json()
    throw new Error(error.message || 'Failed to get pool')
  }

  const data = await response.json()
  return data.data
}

/**
 * Update a card pool
 * @param {string} shareId - Share ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated pool data
 */
export async function updatePool(shareId, updates) {
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
}

/**
 * Delete a card pool
 * @param {string} shareId - Share ID
 * @returns {Promise<void>}
 */
export async function deletePool(shareId) {
  const response = await fetch(`${API_BASE}/pools/${shareId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete pool')
  }
}

/**
 * Get user's pools (pool history)
 * @param {string} userId - User ID
 * @param {Object} [options] - Query options
 * @param {number} [options.limit] - Number of results (default: 20)
 * @param {number} [options.offset] - Offset for pagination (default: 0)
 * @returns {Promise<Object>} Pools data with pagination
 */
export async function getUserPools(userId, options = {}) {
  const { limit = 20, offset = 0 } = options
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  })

  const response = await fetch(`${API_BASE}/pools/user/${userId}?${params}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to get user pools')
  }

  const data = await response.json()
  return data.data
}
