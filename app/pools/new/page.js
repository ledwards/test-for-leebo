'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { generateSealedPod } from '../../../src/utils/boosterPack'
import { getCachedCards, isCacheInitialized, initializeCardCache } from '../../../src/utils/cardCache'
import { fetchSetCards } from '../../../src/utils/api'
import { savePool } from '../../../src/utils/poolApi'
import { getPackImageUrl } from '../../../src/utils/packArt'
import { nanoid } from 'nanoid'
import SealedPod from '../../../src/components/SealedPod'
import PackOpeningAnimation from '../../../src/components/PackOpeningAnimation'
import '../../../src/App.css'

export default function NewPoolPage() {
  const router = useRouter()
  const [pool, setPool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [setCode, setSetCode] = useState(null)
  const [showAnimation, setShowAnimation] = useState(true)
  const [poolReady, setPoolReady] = useState(false)

  useEffect(() => {
    async function createNewPool() {
      try {
        setLoading(true)
        // Get set code from URL query params
        const urlParams = new URLSearchParams(window.location.search)
        const urlSetCode = urlParams.get('set')

        if (!urlSetCode) {
          setError('No set specified')
          setLoading(false)
          setShowAnimation(false)
          return
        }

        // Store set code for animation
        setSetCode(urlSetCode)

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
          cards = getCachedCards(urlSetCode)
        }

        // If no cards from cache, try API
        if (cards.length === 0) {
          try {
            cards = await fetchSetCards(urlSetCode)
          } catch (err) {
            console.error('Failed to fetch cards from API:', err)
          }
        }

        if (cards.length === 0) {
          setError(`No card data available for set ${urlSetCode}. Please ensure cards are loaded in src/data/cards.json or the API is accessible.`)
          setLoading(false)
          setShowAnimation(false)
          return
        }

        // Generate new sealed pod (client-side, fast)
        const generatedPacks = generateSealedPod(cards, urlSetCode)
        const allCards = generatedPacks.flatMap(pack => pack.cards)

        // Generate share ID client-side using nanoid
        const shareId = nanoid(8)

        // Create pool object immediately
        const poolData = {
          shareId,
          setCode: urlSetCode,
          cards: allCards,
          packs: generatedPacks,
          isPublic: false,
        }

        // Update URL immediately without page reload
        window.history.replaceState({}, '', `/pool/${shareId}`)

        // Set pool state - but don't show it yet (wait for animation)
        setPool(poolData)
        setPoolReady(true)
        setLoading(false)

        // Save pool to database in the background (async, don't await)
        // Pass the client-generated shareId so the server uses it
        savePool({
          setCode: urlSetCode,
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

  const handleAnimationComplete = useCallback(() => {
    setShowAnimation(false)
  }, [])

  // Show pack opening animation
  if (showAnimation && setCode) {
    return (
      <PackOpeningAnimation
        packCount={6}
        packImageUrl={getPackImageUrl(setCode)}
        cardBackUrl="/card-images/card-back.png"
        onComplete={handleAnimationComplete}
        setCode={setCode}
        packs={pool?.packs || null}
      />
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

  // Still loading pool data
  if (loading || !poolReady || !pool) {
    return (
      <div className="app">
        {/* Blank screen while loading */}
      </div>
    )
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
