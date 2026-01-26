'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateSealedPod } from '../../../src/utils/boosterPack'
import { getCachedCards, isCacheInitialized, initializeCardCache } from '../../../src/utils/cardCache'
import { fetchSetCards } from '../../../src/utils/api'
import { savePool } from '../../../src/utils/poolApi'
import { nanoid } from 'nanoid'
import SealedPod from '../../../src/components/SealedPod'
import '../../../src/App.css'

export default function NewPoolPage() {
  const router = useRouter()
  const [pool, setPool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function createNewPool() {
      try {
        setLoading(true)
        // Get set code from URL query params
        const urlParams = new URLSearchParams(window.location.search)
        const setCode = urlParams.get('set')
        
        if (!setCode) {
          setError('No set specified')
          setLoading(false)
          return
        }

        // Initialize card cache if not already initialized
        if (!isCacheInitialized()) {
          try {
            await initializeCardCache()
          } catch (err) {
            console.warn('Failed to initialize card cache, will try API:', err)
          }
        }

        // Load cards for the set - try cache first, then API
        let cards = []
        if (isCacheInitialized()) {
          cards = getCachedCards(setCode)
        }
        
        // If no cards from cache, try API
        if (cards.length === 0) {
          try {
            cards = await fetchSetCards(setCode)
          } catch (err) {
            console.error('Failed to fetch cards from API:', err)
          }
        }

        if (cards.length === 0) {
          setError(`No card data available for set ${setCode}. Please ensure cards are loaded in src/data/cards.json or the API is accessible.`)
          setLoading(false)
          return
        }

        // Generate new sealed pod (client-side, fast)
        const generatedPacks = generateSealedPod(cards, setCode)
        const allCards = generatedPacks.flatMap(pack => pack.cards)

        // Generate share ID client-side using nanoid
        const shareId = nanoid(8)

        // Create pool object immediately
        const poolData = {
          shareId,
          setCode,
          cards: allCards,
          packs: generatedPacks,
          isPublic: false,
        }

        // Update URL immediately without page reload
        window.history.replaceState({}, '', `/pool/${shareId}`)

        // Set pool state to show it immediately
        setPool(poolData)
        setLoading(false)

        // Save pool to database in the background (async, don't await)
        // Pass the client-generated shareId so the server uses it
        savePool({
          setCode,
          cards: allCards,
          packs: generatedPacks,
          isPublic: false,
          shareId: shareId, // Pass client-generated shareId
        }).then((saved) => {
          // Server should use the same shareId, but handle mismatch just in case
          if (saved && saved.shareId && saved.shareId !== shareId) {
            window.history.replaceState({}, '', `/pool/${saved.shareId}`)
            setPool(prev => ({ ...prev, shareId: saved.shareId }))
          }
        }).catch((err) => {
          console.error('Failed to save pool to database:', err)
          // Don't show error to user - pool is already displayed
        })
      } catch (err) {
        console.error('Failed to create pool:', err)
        setError(err.message || 'Failed to create pool')
        setLoading(false)
      }
    }

    createNewPool()
  }, [router])

  const handleBack = () => {
    router.push('/sets')
  }

  if (loading) {
    return (
      <div className="app">
        {/* Blank screen while loading - no message */}
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!pool) {
    return null
  }

  return (
    <div className="app">
      <SealedPod
        setCode={pool.setCode}
        onBack={handleBack}
        onBuildDeck={(cards, setCode) => {
          router.push(`/pool/${pool.shareId}/deck`)
        }}
        initialPacks={pool.packs}
        shareId={pool.shareId}
      />
    </div>
  )
}
