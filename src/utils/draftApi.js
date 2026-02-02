/**
 * Draft API Client
 *
 * API client for draft pod operations.
 * Uses httpClient for standardized request handling.
 */
import { httpClient, HttpError } from '../repositories/httpClient.js'

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
    return await httpClient.post('/draft', { setCode, ...settings })
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
  if (!shareId || typeof shareId !== 'string') {
    throw new Error('Invalid shareId')
  }
  try {
    return await httpClient.get(`/draft/${shareId}`)
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
    return await httpClient.post(`/draft/${shareId}/join`)
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
    return await httpClient.post(`/draft/${shareId}/leave`)
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
    return await httpClient.post(`/draft/${shareId}/start`)
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
    return await httpClient.post(`/draft/${shareId}/randomize`)
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
    return await httpClient.patch(`/draft/${shareId}/settings`, settings)
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
    return await httpClient.get(`/draft/${shareId}/state?sinceVersion=${sinceVersion}`)
  } catch (error) {
    // Don't log "Draft not found" - it's expected when drafts are cancelled
    if (!error.message?.includes('Draft not found')) {
      console.error('Failed to poll state:', error)
    }
    throw error
  }
}

/**
 * Select a card (staged pick)
 * The pick is finalized when all players have selected
 * @param {string} shareId - Share ID of the draft
 * @param {string|null} cardId - ID of the card to select, or null to unselect
 * @returns {Promise<Object>} Selection result
 */
export async function selectCard(shareId, cardId) {
  if (!shareId || typeof shareId !== 'string') {
    throw new Error('Invalid shareId')
  }
  try {
    return await httpClient.post(`/draft/${shareId}/select`, { cardId })
  } catch (error) {
    // Return special object for 409 (state changed) - caller should refresh
    if (error instanceof HttpError && error.status === 409) {
      return { stateChanged: true, message: error.message }
    }
    console.error('Failed to select card:', error)
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
    return await httpClient.post(`/draft/${shareId}/pick`, { cardId })
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
    // This endpoint returns full response, not just data.data
    return await httpClient.post(`/draft/${shareId}/pause`, undefined, { extractData: false })
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
    await httpClient.delete(`/draft/${shareId}`)
    return true
  } catch (error) {
    console.error('Failed to delete draft:', error)
    return false
  }
}
