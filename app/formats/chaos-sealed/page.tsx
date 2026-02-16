// @ts-nocheck
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import { fetchSets } from '@/src/utils/api'
import { getPackImageUrl } from '@/src/utils/packArt'
import Button from '@/src/components/Button'
import PackSelector from '@/src/components/PackSelector'
import PackOpeningAnimation from '@/src/components/PackOpeningAnimation'
import './page.css'

interface SetData {
  code: string
  name: string
  imageUrl?: string
  beta?: boolean
}

interface GeneratedPool {
  shareId: string
  packs: any[]
  packImageUrls: string[]
}

export default function ChaosSealedPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [sets, setSets] = useState<SetData[]>([])
  const [selectedSets, setSelectedSets] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAnimation, setShowAnimation] = useState(false)
  const [generatedPool, setGeneratedPool] = useState<GeneratedPool | null>(null)

  const hasBetaAccess = user?.is_beta_tester || user?.is_admin

  useEffect(() => {
    const loadSets = async () => {
      try {
        setLoading(true)
        const setsData = await fetchSets({ includeBeta: hasBetaAccess })
        setSets(setsData)
      } catch (err) {
        setError('Failed to load sets')
      } finally {
        setLoading(false)
      }
    }
    loadSets()
  }, [hasBetaAccess])

  const handleGenerate = async () => {
    if (selectedSets.length !== 6) return

    try {
      setGenerating(true)
      setError(null)

      const response = await fetch('/api/formats/chaos-sealed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          setCodes: selectedSets
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || data.error || 'Failed to generate pool')
      }

      const result = await response.json()

      // Fetch the full pool data to get the packs
      const poolResponse = await fetch(`/api/pools/${result.data.shareId}`, {
        credentials: 'include'
      })

      if (poolResponse.ok) {
        const poolData = await poolResponse.json()
        const poolInfo = poolData.data
        const packs = typeof poolInfo.packs === 'string' ? JSON.parse(poolInfo.packs) : poolInfo.packs

        // Get pack image URLs for each pack based on their set code
        const packImageUrls = packs.map((pack: any) => getPackImageUrl(pack.setCode))

        setGeneratedPool({
          shareId: result.data.shareId,
          packs,
          packImageUrls
        })
        setShowAnimation(true)
      } else {
        // If we can't fetch pool data, just redirect
        router.push(`/pool/${result.data.shareId}`)
      }
    } catch (err) {
      setError(err.message || 'Failed to generate pool')
    } finally {
      setGenerating(false)
    }
  }

  const handleAnimationComplete = useCallback(() => {
    if (generatedPool) {
      router.push(`/pool/${generatedPool.shareId}`)
    }
  }, [generatedPool, router])

  // Show pack opening animation
  if (showAnimation && generatedPool) {
    return (
      <PackOpeningAnimation
        packCount={6}
        packImageUrls={generatedPool.packImageUrls}
        cardBackUrl="/card-images/card-back.png"
        onComplete={handleAnimationComplete}
        packs={generatedPool.packs}
      />
    )
  }

  if (loading) {
    return (
      <div className="chaos-sealed-page">
        <div className="chaos-sealed-container">
          <div className="loading">Loading sets...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="chaos-sealed-page">
      <div className="chaos-sealed-container">
        <h1>Chaos Sealed</h1>
        <p className="chaos-sealed-subtitle">Open 6 packs from any combination of sets!</p>

        <PackSelector
          sets={sets}
          selectedSets={selectedSets}
          onSelectSets={setSelectedSets}
          maxSelections={6}
          showQuantityControls={true}
          title={`Select 6 Packs (${selectedSets.length}/6)`}
        />

        <div className="chaos-sealed-section selected-sets-order">
          <h3>Your Chaos Sealed ({selectedSets.length}/6)</h3>
          <div className="selected-packs-row">
            {[0, 1, 2, 3, 4, 5].map((slotIndex) => {
              const setCode = selectedSets[slotIndex]
              if (setCode) {
                const packImageUrl = getPackImageUrl(setCode)
                return (
                  <div
                    key={slotIndex}
                    className="selected-pack"
                    onClick={() => {
                      setSelectedSets(prev => [...prev.slice(0, slotIndex), ...prev.slice(slotIndex + 1)])
                    }}
                  >
                    <div className="selected-pack-image">
                      <img src={packImageUrl} alt={setCode} />
                    </div>
                  </div>
                )
              }
              return (
                <div key={slotIndex} className="selected-pack skeleton">
                  <div className="selected-pack-image"></div>
                </div>
              )
            })}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="chaos-sealed-actions">
          <Button
            variant="danger"
            size="lg"
            onClick={() => router.push('/formats')}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            disabled={selectedSets.length !== 6 || generating}
            onClick={handleGenerate}
          >
            {generating ? 'Creating...' : 'Create Chaos'}
          </Button>
        </div>
      </div>
    </div>
  )
}
