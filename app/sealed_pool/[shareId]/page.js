'use client'

import { useState, useEffect } from 'react'
import SealedPod from '../../../src/components/SealedPod'
import { loadPool } from '../../../src/utils/poolApi'
import '../../../src/App.css'

export default function SealedPoolPage({ params }) {
  const [pool, setPool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shareId, setShareId] = useState(null)

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      setShareId(resolvedParams.shareId)
    }
    getParams()
  }, [params])

  useEffect(() => {
    let cancelled = false

    async function fetchPool() {
      if (!shareId) return

      let retries = 0
      const maxRetries = 5

      const attemptLoad = async () => {
        if (cancelled) return false

        try {
          setLoading(true)
          const poolData = await loadPool(shareId)

          if (cancelled) return false

          // Redirect to draft_pool if this is actually a draft pool
          if (poolData.poolType === 'draft') {
            window.location.href = `/draft_pool/${shareId}`
            return false
          }

          setPool(poolData)
          setError(null)
          setLoading(false)
          return true
        } catch (err) {
          if (cancelled) return false

          console.error(`Failed to load pool (attempt ${retries + 1}):`, err)

          if ((err.message.includes('not found') || err.message.includes('Pool not found')) && retries < maxRetries) {
            retries++
            await new Promise(resolve => setTimeout(resolve, 1000 * retries))
            return attemptLoad()
          }

          if (!cancelled) {
            setError(err.message || 'Failed to load pool')
            setLoading(false)
          }
          return false
        }
      }

      attemptLoad()

      return () => {
        cancelled = true
      }
    }

    const cleanup = fetchPool()

    return () => {
      cancelled = true
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn())
      }
    }
  }, [shareId])

  useEffect(() => {
    if (error && !loading && !pool) {
      const timer = setTimeout(() => {
        window.location.href = '/sets'
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [error, loading, pool])

  const handleBack = () => {
    window.location.href = '/'
  }

  if (error && !loading && !pool) {
    return (
      <div className="app">
        <div className="loading"></div>
      </div>
    )
  }

  const getInitialPacks = () => {
    if (loading) return null
    if (pool?.packs && pool.packs.length > 0) {
      return pool.packs
    }
    if (pool?.cards && pool.cards.length > 0) {
      return [{ cards: pool.cards }]
    }
    return null
  }

  // Extract pool name from deckBuilderState (source of truth) or fall back to pool.name
  const getPoolName = () => {
    if (pool?.deckBuilderState) {
      const state = typeof pool.deckBuilderState === 'string'
        ? JSON.parse(pool.deckBuilderState)
        : pool.deckBuilderState
      if (state.poolName) return state.poolName
    }
    return pool?.name || null
  }

  return (
    <div className="app">
      <SealedPod
        setCode={pool?.setCode}
        setName={pool?.setName}
        poolType="sealed"
        poolName={getPoolName()}
        createdAt={pool?.createdAt}
        onBack={handleBack}
        onBuildDeck={(cards, setCode) => {
          window.location.href = `/pool/${shareId}/deck`
        }}
        initialPacks={getInitialPacks()}
        shareId={pool?.shareId}
        isLoading={loading}
        poolOwnerId={pool?.owner?.id || pool?.userId}
      />
    </div>
  )
}
