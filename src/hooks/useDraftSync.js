'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { pollState, loadDraft } from '@/src/utils/draftApi.js'

/**
 * Hook for syncing draft state with the server
 *
 * @param {string} shareId - Draft share ID
 * @param {Object} options - Options
 * @param {number} options.pollInterval - Polling interval in ms (default 2000)
 * @param {boolean} options.enabled - Whether polling is enabled (default true)
 * @returns {Object} Draft state and controls
 */
export function useDraftSync(shareId, { pollInterval = 2000, enabled = true } = {}) {
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleted, setDeleted] = useState(false)
  const stateVersionRef = useRef(0)
  const pollTimeoutRef = useRef(null)

  // Initial load
  const loadInitial = useCallback(async () => {
    if (!shareId) return

    setLoading(true)
    setError(null)

    try {
      const data = await loadDraft(shareId)
      setDraft(data)
      stateVersionRef.current = data.stateVersion || 0
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [shareId])

  // Poll for updates
  const poll = useCallback(async () => {
    if (!shareId || !enabled || deleted) return

    try {
      const data = await pollState(shareId, stateVersionRef.current)

      if (data.changed) {
        // Update state
        setDraft(prev => ({
          ...prev,
          status: data.status,
          draftState: data.draftState,
          players: data.players,
          myPlayer: data.myPlayer,
          timed: data.timed,
          timerEnabled: data.timerEnabled,
          timerSeconds: data.timerSeconds,
          pickTimeoutSeconds: data.pickTimeoutSeconds,
          startedAt: data.startedAt,
          completedAt: data.completedAt,
          pickStartedAt: data.pickStartedAt,
          stateVersion: data.stateVersion,
          paused: data.paused,
          pausedAt: data.pausedAt,
          pausedDurationSeconds: data.pausedDurationSeconds,
        }))
        stateVersionRef.current = data.stateVersion
      }
    } catch (err) {
      // Check if draft was deleted
      if (err.message === 'Draft not found') {
        setDeleted(true)
        return
      }
      // Don't set error for other poll failures - just retry
    }
  }, [shareId, enabled, deleted])

  // Start polling
  useEffect(() => {
    if (!shareId || !enabled || deleted) return

    const startPolling = () => {
      pollTimeoutRef.current = setTimeout(async () => {
        await poll()
        startPolling()
      }, pollInterval)
    }

    startPolling()

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current)
      }
    }
  }, [shareId, enabled, deleted, pollInterval, poll])

  // Initial load
  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  // Manual refresh
  const refresh = useCallback(async () => {
    await loadInitial()
  }, [loadInitial])

  // Force immediate poll with retry for state changes
  const forcePoll = useCallback(async () => {
    await poll()
    // If state didn't change, retry once after a short delay
    // This handles the case where bot processing is still running
    setTimeout(async () => {
      await poll()
    }, 500)
  }, [poll])

  return {
    draft,
    loading,
    error,
    deleted,
    refresh,
    forcePoll,
    // Convenience accessors
    isHost: draft?.isHost || false,
    isPlayer: draft?.isPlayer || false,
    players: draft?.players || [],
    myPlayer: draft?.myPlayer || null,
    draftState: draft?.draftState || {},
    status: draft?.status || 'loading',
  }
}

export default useDraftSync
