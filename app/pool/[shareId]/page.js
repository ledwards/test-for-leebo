'use client'

import { useState, useEffect } from 'react'
import SealedPod from '../../../src/components/SealedPod'
import { loadPool } from '../../../src/utils/poolApi'
import '../../../src/App.css'

export default function PoolPage({ params }) {
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
          
          setPool(poolData)
          setError(null)
          setLoading(false)
          return true
        } catch (err) {
          if (cancelled) return false
          
          console.error(`Failed to load pool (attempt ${retries + 1}):`, err)
          
          // If pool not found, it might still be saving (async save from /pools/new)
          if ((err.message.includes('not found') || err.message.includes('Pool not found')) && retries < maxRetries) {
            retries++
            await new Promise(resolve => setTimeout(resolve, 1000 * retries))
            return attemptLoad()
          }
          
          // Max retries reached or different error - only set error if not cancelled
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
    // Only redirect if we have an error and pool is definitely not loading
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

  // Don't show error flash - if we have an error but are loading or have a pool, just show the content
  // Only show error redirect if we're definitely not loading and have no pool
  if (error && !loading && !pool && !window.location.pathname.includes('/pools/new')) {
    return (
      <div className="app">
        <div className="loading"></div>
      </div>
    )
  }

  // Show page structure immediately, with loading placeholder for packs
  return (
    <div className="app">
      <SealedPod
        setCode={pool?.setCode}
        setName={pool?.setName}
        poolType={pool?.poolType || 'sealed'}
        onBack={handleBack}
        onBuildDeck={(cards, setCode) => {
          window.location.href = `/pool/${shareId}/deck`
        }}
        initialPacks={loading ? null : (pool?.packs || null)}
        shareId={pool?.shareId}
        isLoading={loading}
      />
    </div>
  )
}
