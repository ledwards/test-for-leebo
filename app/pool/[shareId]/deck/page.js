'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import DeckBuilder from '../../../../src/components/DeckBuilder'
import { loadPool, updatePool } from '../../../../src/utils/poolApi'
import '../../../../src/App.css'

export default function DeckBuilderPage({ params }) {
  const [pool, setPool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shareId, setShareId] = useState(null)
  const saveTimeoutRef = useRef(null)
  const pendingStateRef = useRef(null)

  useEffect(() => {
    // Handle async params in Next.js 15+
    async function getParams() {
      const resolvedParams = await params
      setShareId(resolvedParams.shareId)
    }
    getParams()
  }, [params])

  useEffect(() => {
    async function fetchPool() {
      if (!shareId) return

      try {
        setLoading(true)
        const poolData = await loadPool(shareId)
        setPool(poolData)
      } catch (err) {
        console.error('Failed to load pool:', err)
        setError(err.message || 'Failed to load pool')
      } finally {
        setLoading(false)
      }
    }

    fetchPool()

    // Refresh pool data when window regains focus (in case name was changed elsewhere)
    const handleFocus = () => {
      if (shareId) {
        loadPool(shareId).then(setPool).catch(console.error)
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [shareId])

  useEffect(() => {
    if (error || (!loading && !pool)) {
      // Redirect to set selection page
      window.location.href = '/sets'
    }
  }, [error, loading, pool])

  const handleBack = () => {
    if (shareId) {
      window.location.href = `/pool/${shareId}`
    }
  }

  const handleDeckStateChange = useCallback((deckBuilderState) => {
    // Debounced auto-save - only save after 2 seconds of no changes
    pendingStateRef.current = deckBuilderState

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (pool && pool.shareId && pendingStateRef.current) {
        try {
          await updatePool(pool.shareId, { deckBuilderState: pendingStateRef.current })
        } catch (err) {
          console.error('Failed to save deck builder state:', err)
        }
      }
    }, 2000)
  }, [pool])

  // Save pending state on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      // Flush any pending save immediately on unmount
      if (pendingStateRef.current && pool?.shareId) {
        updatePool(pool.shareId, { deckBuilderState: pendingStateRef.current }).catch(() => {})
      }
    }
  }, [pool])

  // Save pending state on page refresh/close using sendBeacon
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingStateRef.current && pool?.shareId) {
        // Use sendBeacon for reliable delivery during page unload
        const data = JSON.stringify({
          shareId: pool.shareId,
          deckBuilderState: pendingStateRef.current
        })
        navigator.sendBeacon('/api/pools/save-state', data)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [pool])

  // Always render DeckBuilder immediately - show UI structure even while loading
  // Cards will be empty initially and populate once pool data loads
  // For draft pools, use pool.cards (drafted cards including leaders) not pool.packs (original pack cards)
  const allCards = pool
    ? (pool.poolType === 'draft'
        ? pool.cards || []
        : (pool.packs ? pool.packs.flatMap(pack => pack.cards) : pool.cards) || [])
    : []
  const setCode = pool?.setCode || null
  // Handle deckBuilderState - it might be a string or object
  const savedState = pool?.deckBuilderState
    ? (typeof pool.deckBuilderState === 'string'
        ? pool.deckBuilderState
        : JSON.stringify(pool.deckBuilderState))
    : null

  // Extract pool name from deckBuilderState (source of truth) or fall back to pool.name
  const getPoolNameFromState = () => {
    if (pool?.deckBuilderState) {
      const state = typeof pool.deckBuilderState === 'string'
        ? JSON.parse(pool.deckBuilderState)
        : pool.deckBuilderState
      if (state.poolName) return state.poolName
    }
    return pool?.name || null
  }
  const poolName = getPoolNameFromState()

  // Only redirect on error after loading completes
  useEffect(() => {
    if (error || (!loading && !pool)) {
      window.location.href = '/sets'
    }
  }, [error, loading, pool])

  return (
    <div className="app">
      <DeckBuilder
        cards={allCards}
        setCode={setCode}
        onBack={handleBack}
        savedState={savedState}
        onStateChange={handleDeckStateChange}
        shareId={shareId}
        poolCreatedAt={pool?.createdAt}
        poolType={pool?.poolType}
        poolName={poolName}
        poolOwnerUsername={pool?.owner?.username}
        poolOwnerId={pool?.owner?.id || pool?.userId}
      />
    </div>
  )
}
