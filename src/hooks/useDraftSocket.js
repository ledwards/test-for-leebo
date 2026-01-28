'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import { loadDraft } from '@/src/utils/draftApi.js'

/**
 * Hook for syncing draft state via WebSocket (Socket.io)
 *
 * Replaces useDraftSSE for Railway deployment where WebSockets work properly.
 *
 * @param {string} shareId - Draft share ID
 * @param {Object} options - Options
 * @param {boolean} options.enabled - Whether sync is enabled (default true)
 * @returns {Object} Draft state and controls
 */
export function useDraftSocket(shareId, { enabled = true } = {}) {
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleted, setDeleted] = useState(false)
  const [connected, setConnected] = useState(false)

  const socketRef = useRef(null)
  const stateVersionRef = useRef(0)

  // Fetch user-specific data (myPlayer) since broadcasts don't include it
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

  // Initial load
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
    } catch (err) {
      setError(err.message)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [shareId])

  useEffect(() => {
    if (!shareId || !enabled) return

    // Load initial state
    loadInitial()

    // Connect to Socket.io
    const socket = io()
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      setError(null)
      socket.emit('join-draft', shareId)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err)
      setError('Connection error')
    })

    socket.on('state', async (data) => {
      // Only update if version is newer
      if (data.stateVersion > stateVersionRef.current) {
        stateVersionRef.current = data.stateVersion

        // Update public state immediately
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

        // Fetch user-specific data (myPlayer, current pack, etc.)
        const userData = await fetchMyPlayer()
        if (userData) {
          setDraft(p => ({ ...p, ...userData }))
        }
      }
    })

    socket.on('deleted', () => {
      setDeleted(true)
    })

    return () => {
      socket.emit('leave-draft', shareId)
      socket.disconnect()
    }
  }, [shareId, enabled, loadInitial, fetchMyPlayer])

  // Manual refresh (silent - no loading spinner)
  const refresh = useCallback(async () => {
    await loadInitial(false)
  }, [loadInitial])

  // Force reconnect
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current.connect()
    }
  }, [])

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

export default useDraftSocket
