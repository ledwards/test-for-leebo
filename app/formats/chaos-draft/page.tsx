// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import { fetchSets } from '@/src/utils/api'
import { createDraft } from '@/src/utils/draftApi'
import { getPackImageUrl } from '@/src/utils/packArt'
import Button from '@/src/components/Button'
import PackSelector from '@/src/components/PackSelector'
import './page.css'

interface SetData {
  code: string
  name: string
  imageUrl?: string
  beta?: boolean
}

export default function ChaosDraftPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [sets, setSets] = useState<SetData[]>([])
  const [selectedSets, setSelectedSets] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

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

  const handleCreate = async () => {
    if (selectedSets.length !== 3) return

    // Draft requires authentication for multiplayer tracking
    if (!isAuthenticated) {
      setShowAuthPrompt(true)
      return
    }

    try {
      setCreating(true)
      setError(null)

      // Create a draft pod with chaos settings (use default timer/players)
      const result = await createDraft(selectedSets[0], {
        maxPlayers: 8,
        timerEnabled: true,
        timerSeconds: 30,
        settings: {
          draftMode: 'chaos',
          chaosSets: selectedSets
        }
      })

      router.push(`/draft/${result.shareId}`)
    } catch (err) {
      setError(err.message || 'Failed to create draft')
    } finally {
      setCreating(false)
    }
  }

  const handleLogin = () => {
    // Redirect to Discord login, then back to this page
    const returnUrl = encodeURIComponent('/formats/chaos-draft')
    window.location.href = `/api/auth/signin/discord?return_to=${returnUrl}`
  }

  if (loading) {
    return (
      <div className="chaos-draft-page">
        <div className="chaos-draft-container">
          <div className="loading">Loading sets...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="chaos-draft-page">
      <div className="chaos-draft-container">
        <h1>Chaos Draft</h1>
        <p className="chaos-draft-subtitle">Select 3 packs from any combination of sets!</p>

        <PackSelector
          sets={sets}
          selectedSets={selectedSets}
          onSelectSets={setSelectedSets}
          maxSelections={3}
          showQuantityControls={true}
          title={`Select 3 Packs (${selectedSets.length}/3)`}
        />

        <div className="chaos-draft-section selected-sets-order">
          <h3>Your Chaos Draft ({selectedSets.length}/3)</h3>
          <div className="selected-packs-row">
            {[0, 1, 2].map((slotIndex) => {
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

        {showAuthPrompt && (
          <div className="auth-prompt">
            <p>Draft requires a Discord login to track players in multiplayer.</p>
            <Button variant="primary" onClick={handleLogin}>
              Login with Discord
            </Button>
          </div>
        )}

        <div className="chaos-draft-actions">
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
            disabled={selectedSets.length !== 3 || creating}
            onClick={handleCreate}
          >
            {creating ? 'Creating...' : 'Create Chaos'}
          </Button>
        </div>
      </div>
    </div>
  )
}
