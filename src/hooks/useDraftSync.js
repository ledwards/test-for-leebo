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
    if (!shareId || !enabled) return

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
        }))
        stateVersionRef.current = data.stateVersion
      }
    } catch (err) {
      console.error('Poll error:', err)
      // Don't set error for poll failures - just retry
    }
  }, [shareId, enabled])

  // Start polling
  useEffect(() => {
    if (!shareId || !enabled) return

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
  }, [shareId, enabled, pollInterval, poll])

  // Initial load
  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  // Manual refresh
  const refresh = useCallback(async () => {
    await loadInitial()
  }, [loadInitial])

  // Force immediate poll
  const forcePoll = useCallback(async () => {
    await poll()
  }, [poll])

  return {
    draft,
    loading,
    error,
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
