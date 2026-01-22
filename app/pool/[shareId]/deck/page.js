'use client'

import { useState, useEffect } from 'react'
import DeckBuilder from '../../../../src/components/DeckBuilder'
import { loadPool, updatePool } from '../../../../src/utils/poolApi'
import '../../../../src/App.css'

export default function DeckBuilderPage({ params }) {
  const [pool, setPool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shareId, setShareId] = useState(null)

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

  const handleDeckStateChange = async (deckBuilderState) => {
    // Auto-save deck builder state to pool
    if (pool && pool.shareId) {
      try {
        await updatePool(pool.shareId, { deckBuilderState })
      } catch (err) {
        console.error('Failed to save deck builder state:', err)
      }
    }
  }

  // Always render DeckBuilder immediately - show UI structure even while loading
  // Cards will be empty initially and populate once pool data loads
  const allCards = pool ? (pool.packs ? pool.packs.flatMap(pack => pack.cards) : pool.cards) || [] : []
  const setCode = pool?.setCode || null
  // Handle deckBuilderState - it might be a string or object
  const savedState = pool?.deckBuilderState
    ? (typeof pool.deckBuilderState === 'string'
        ? pool.deckBuilderState
        : JSON.stringify(pool.deckBuilderState))
    : null

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
        poolName={pool?.name}
        poolOwnerUsername={pool?.owner?.username}
        poolOwnerId={pool?.owner?.id || pool?.userId}
      />
    </div>
  )
}
