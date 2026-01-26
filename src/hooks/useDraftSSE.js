'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { loadDraft } from '@/src/utils/draftApi.js'

/**
 * Hook for syncing draft state via Server-Sent Events
 *
 * Uses SSE for real-time push updates instead of polling.
 * Falls back to polling if SSE connection fails.
 *
 * @param {string} shareId - Draft share ID
 * @param {Object} options - Options
 * @param {boolean} options.enabled - Whether sync is enabled (default true)
 * @param {number} options.reconnectDelay - Delay before reconnecting on error (default 2000ms)
 * @returns {Object} Draft state and controls
 */
export function useDraftSSE(shareId, { enabled = true, reconnectDelay = 2000 } = {}) {
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleted, setDeleted] = useState(false)
  const [connected, setConnected] = useState(false)

  const eventSourceRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const stateVersionRef = useRef(0)
  const prevPhaseRef = useRef(null)
  const prevStatusRef = useRef(null)

  // Fetch user-specific data (myPlayer) since SSE broadcasts don't include it
  const fetchMyPlayer = useCallback(async () => {
    if (!shareId) return null

    try {
      const data = await loadDraft(shareId)
      return {
        myPlayer: data.myPlayer,
        isHost: data.isHost,
        isPlayer: data.isPlayer,
      }
    } catch (err) {
      console.error('Error fetching myPlayer:', err)
      return null
    }
  }, [shareId])

  // Handle incoming SSE messages
  const handleMessage = useCallback(async (event) => {
    try {
      const data = JSON.parse(event.data)

      // Handle different message types
      switch (data.type) {
        case 'heartbeat':
          // Just a keepalive, ignore
          break

        case 'error':
          setError(data.message)
          break

        case 'deleted':
          setDeleted(true)
          break

        case 'state':
          // Only update if version is newer
          if (data.stateVersion > stateVersionRef.current) {
            const prevVersion = stateVersionRef.current
            stateVersionRef.current = data.stateVersion

            // Check if we need to refresh myPlayer (using refs for previous state)
            // Include transitions from null to a phase (draft starting)
            const phaseChanged = prevPhaseRef.current !== data.draftState?.phase
            const statusChanged = prevStatusRef.current !== data.status
            const bigVersionJump = data.stateVersion - prevVersion > 1

            // Update refs for next comparison
            prevPhaseRef.current = data.draftState?.phase
            prevStatusRef.current = data.status

            // If myPlayer data is in the message (initial connection), use it directly
            if (data.myPlayer) {
              setDraft(prev => ({
                ...prev,
                status: data.status,
                draftState: data.draftState,
                players: data.players,
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
                myPlayer: data.myPlayer,
                isHost: data.isHost ?? prev?.isHost,
                isPlayer: data.isPlayer ?? prev?.isPlayer,
              }))
            } else {
              // Broadcast without myPlayer - update public state immediately
              setDraft(prev => ({
                ...prev,
                status: data.status,
                draftState: data.draftState,
                players: data.players,
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

              // Fetch myPlayer when:
              // - Phase changes (draft starting, moving to pack phase, etc.)
              // - Status changes (waiting -> active -> completed)
              // - Big version jump (missed updates)
              // - During active drafting phases (leader_draft or pack_draft) to catch
              //   leader/pack rotations that don't change phase but update player data
              const isActiveDraftingPhase = data.draftState?.phase === 'leader_draft' ||
                                            data.draftState?.phase === 'pack_draft'
              if (phaseChanged || statusChanged || bigVersionJump || isActiveDraftingPhase) {
                fetchMyPlayer().then(userData => {
                  if (userData) {
                    setDraft(p => ({ ...p, ...userData }))
                  }
                })
              }
            }
          }
          break

        case 'pick':
        case 'advance':
        case 'timer':
          // For lightweight events, fetch fresh state in background
          fetchMyPlayer().then(userData => {
            if (userData) {
              setDraft(prev => ({ ...prev, ...userData }))
            }
          })
          break

        default:
          console.log('Unknown SSE message type:', data.type)
      }
    } catch (err) {
      console.error('Error parsing SSE message:', err)
    }
  }, [fetchMyPlayer])

  // Connect to SSE stream
  const connect = useCallback(() => {
    if (!shareId || !enabled || deleted) return

    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource(`/api/draft/${shareId}/stream`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setConnected(true)
      setError(null)
      setLoading(false)
    }

    eventSource.onmessage = handleMessage

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err)
      setConnected(false)
      eventSource.close()

      // Reconnect after delay (unless deleted)
      if (!deleted) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, reconnectDelay)
      }
    }
  }, [shareId, enabled, deleted, reconnectDelay, handleMessage])

  // Initial load (before SSE connects)
  // showLoading=false for background refreshes to avoid UI flash
  const loadInitial = useCallback(async (showLoading = true) => {
    if (!shareId) return

    if (showLoading) {
      setLoading(true)
    }
    setError(null)

    try {
      const data = await loadDraft(shareId)
      setDraft(data)
      stateVersionRef.current = data.stateVersion || 0
      prevPhaseRef.current = data.draftState?.phase || null
      prevStatusRef.current = data.status || null
    } catch (err) {
      setError(err.message)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [shareId])

  // Connect on mount
  useEffect(() => {
    if (!shareId || !enabled) return

    // Load initial state first
    loadInitial().then(() => {
      // Then connect to SSE
      connect()
    })

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [shareId, enabled, loadInitial, connect])

  // Manual refresh (silent - no loading spinner)
  const refresh = useCallback(async () => {
    await loadInitial(false)
  }, [loadInitial])

  // Force reconnect
  const reconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    connect()
  }, [connect])

  return {
    draft,
    loading,
    error,
    deleted,
    connected,
    refresh,
    reconnect,
    // Convenience accessors
    isHost: draft?.isHost || false,
    isPlayer: draft?.isPlayer || false,
    players: draft?.players || [],
    myPlayer: draft?.myPlayer || null,
    draftState: draft?.draftState || {},
    status: draft?.status || 'loading',
  }
}

export default useDraftSSE
