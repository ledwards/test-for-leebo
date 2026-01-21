// API client for draft pod operations
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

/**
 * Create a new draft pod
 * @param {string} setCode - Set code (e.g., 'SOR')
 * @param {Object} settings - Optional settings
 * @param {number} settings.maxPlayers - Max players (default 8)
 * @param {boolean} settings.timerEnabled - Enable timer (default true)
 * @param {number} settings.timerSeconds - Timer duration (default 30)
 * @returns {Promise<Object>} Created draft with shareId and shareUrl
 */
export async function createDraft(setCode, settings = {}) {
  try {
    const response = await fetch(`${API_BASE}/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        setCode,
        ...settings,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create draft')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Failed to create draft:', error)
    throw error
  }
}

/**
 * Load a draft pod by share ID
 * @param {string} shareId - Share ID of the draft
 * @returns {Promise<Object>} Draft data
 */
export async function loadDraft(shareId) {
  try {
    const response = await fetch(`${API_BASE}/draft/${shareId}`, {
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to load draft')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Failed to load draft:', error)
    throw error
  }
}

/**
 * Join a draft pod
 * @param {string} shareId - Share ID of the draft
 * @returns {Promise<Object>} Join result with seat number
 */
export async function joinDraft(shareId) {
  try {
    const response = await fetch(`${API_BASE}/draft/${shareId}/join`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to join draft')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Failed to join draft:', error)
    throw error
  }
}

/**
 * Leave a draft pod
 * @param {string} shareId - Share ID of the draft
 * @returns {Promise<Object>} Leave result
 */
export async function leaveDraft(shareId) {
  try {
    const response = await fetch(`${API_BASE}/draft/${shareId}/leave`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to leave draft')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Failed to leave draft:', error)
    throw error
  }
}

/**
 * Start the draft (host only)
 * @param {string} shareId - Share ID of the draft
 * @returns {Promise<Object>} Start result
 */
export async function startDraft(shareId) {
  try {
    const response = await fetch(`${API_BASE}/draft/${shareId}/start`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to start draft')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Failed to start draft:', error)
    throw error
  }
}

/**
 * Randomize seat assignments (host only)
 * @param {string} shareId - Share ID of the draft
 * @returns {Promise<Object>} Randomize result
 */
export async function randomizeSeats(shareId) {
  try {
    const response = await fetch(`${API_BASE}/draft/${shareId}/randomize`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to randomize seats')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Failed to randomize seats:', error)
    throw error
  }
}

/**
 * Update draft settings (host only)
 * @param {string} shareId - Share ID of the draft
 * @param {Object} settings - Settings to update
 * @returns {Promise<Object>} Update result
 */
export async function updateSettings(shareId, settings) {
  try {
    const response = await fetch(`${API_BASE}/draft/${shareId}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(settings),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update settings')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Failed to update settings:', error)
    throw error
  }
}

/**
 * Poll for state updates
 * @param {string} shareId - Share ID of the draft
 * @param {number} sinceVersion - Only return if state changed since this version
 * @returns {Promise<Object>} State data
 */
export async function pollState(shareId, sinceVersion = 0) {
  try {
    const response = await fetch(
      `${API_BASE}/draft/${shareId}/state?sinceVersion=${sinceVersion}`,
      {
        credentials: 'include',
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to poll state')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Failed to poll state:', error)
    throw error
  }
}

/**
 * Make a draft pick
 * @param {string} shareId - Share ID of the draft
 * @param {string} cardId - ID of the card to pick
 * @returns {Promise<Object>} Pick result
 */
export async function makePick(shareId, cardId) {
  try {
    const response = await fetch(`${API_BASE}/draft/${shareId}/pick`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ cardId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to make pick')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Failed to make pick:', error)
    throw error
  }
}

/**
 * Toggle pause state (host only)
 * @param {string} shareId - Share ID of the draft
 * @returns {Promise<Object>} Pause result with paused state
 */
export async function togglePause(shareId) {
  try {
    const response = await fetch(`${API_BASE}/draft/${shareId}/pause`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to toggle pause')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to toggle pause:', error)
    throw error
  }
}

/**
 * Delete a draft pod (host only)
 * @param {string} shareId - Share ID of the draft
 * @returns {Promise<boolean>} Success status
 */
export async function deleteDraft(shareId) {
  try {
    const response = await fetch(`${API_BASE}/draft/${shareId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    return response.ok
  } catch (error) {
    console.error('Failed to delete draft:', error)
    return false
  }
}
