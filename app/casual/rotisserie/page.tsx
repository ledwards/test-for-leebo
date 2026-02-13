// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import type { SyntheticEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import { fetchSets } from '@/src/utils/api'
import { getPackArtUrl } from '@/src/utils/packArt'
import Button from '@/src/components/Button'
import './page.css'

interface SetData {
  code: string
  name: string
  imageUrl?: string
  beta?: boolean
}

// Sort sets chronologically: SOR, SHD, TWI, JTL, LOF, SEC, LAW
const SET_ORDER: Record<string, number> = {
  'SOR': 1, 'SHD': 2, 'TWI': 3, 'JTL': 4, 'LOF': 5, 'SEC': 6, 'LAW': 7,
}

const sortSetsChronologically = (sets: SetData[]): SetData[] => {
  return [...sets].sort((a, b) =>
    (SET_ORDER[a.code] || 999) - (SET_ORDER[b.code] || 999)
  )
}

export default function RotisseriePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [sets, setSets] = useState<SetData[]>([])
  const [selectedSets, setSelectedSets] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [maxPlayers, setMaxPlayers] = useState(8)
  const [imageFallbacks, setImageFallbacks] = useState<Record<string, number>>({})
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const hasBetaAccess = user?.is_beta_tester || user?.is_admin

  useEffect(() => {
    const loadSets = async () => {
      try {
        setLoading(true)
        const setsData = await fetchSets({ includeBeta: hasBetaAccess })
        setSets(sortSetsChronologically(setsData))
        // Select all sets by default
        setSelectedSets(setsData.map(s => s.code))
      } catch (err) {
        setError('Failed to load sets')
      } finally {
        setLoading(false)
      }
    }
    loadSets()
  }, [hasBetaAccess])

  const toggleSetSelection = (setCode: string) => {
    setSelectedSets(prev => {
      if (prev.includes(setCode)) {
        return prev.filter(s => s !== setCode)
      }
      return [...prev, setCode]
    })
  }

  const handleImageError = (setCode: string, e: SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement
    const fallbacks = [
      `https://swudb.com/images/packs/${setCode.toLowerCase()}.jpg`,
      `https://swudb.com/images/booster/${setCode}.jpg`,
      `https://swudb.com/images/sets/${setCode}.jpg`,
    ]

    const currentAttempt = imageFallbacks[setCode] || 0

    if (currentAttempt < fallbacks.length) {
      target.src = fallbacks[currentAttempt]
      setImageFallbacks(prev => ({ ...prev, [setCode]: currentAttempt + 1 }))
    } else {
      setFailedImages(prev => new Set([...prev, setCode]))
      target.style.display = 'none'
    }
  }

  const handleCreate = async () => {
    if (selectedSets.length === 0) return

    try {
      setCreating(true)
      setError(null)

      const response = await fetch('/api/casual/rotisserie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          setCodes: selectedSets,
          maxPlayers,
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || data.error || 'Failed to create draft')
      }

      const result = await response.json()
      router.push(`/casual/rotisserie/${result.data.shareId}`)
    } catch (err) {
      setError(err.message || 'Failed to create draft')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="rotisserie-page">
        <div className="rotisserie-container">
          <div className="loading">Loading sets...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rotisserie-page">
      <div className="rotisserie-container">
        <h1>Rotisserie Draft</h1>
        <p className="rotisserie-subtitle">Snake draft from the entire card pool, face-up!</p>

        <div className="sets-grid">
          {sets.map((set) => {
            const isSelected = selectedSets.includes(set.code)
            const packArtUrl = set.imageUrl || getPackArtUrl(set.code)
            return (
              <div
                key={set.code}
                className={`set-card ${isSelected ? 'selected' : 'unselected'}`}
                onClick={() => toggleSetSelection(set.code)}
              >
                {set.beta && <div className="beta-badge">Beta</div>}
                <div className="set-image-container">
                  {packArtUrl && !failedImages.has(set.code) && (
                    <img
                      src={packArtUrl}
                      alt={`${set.name} booster pack`}
                      className="set-image"
                      onError={(e) => handleImageError(set.code, e)}
                    />
                  )}
                  <div className="set-image-placeholder" style={{ display: (!packArtUrl || failedImages.has(set.code)) ? 'flex' : 'none' }}>
                    <div className="placeholder-text">{set.name}</div>
                    <div className="placeholder-code">{set.code}</div>
                  </div>
                </div>
                <div className="set-info">
                  <h3>{set.name}</h3>
                </div>
              </div>
            )
          })}
        </div>

        <div className="max-players-field">
          <label htmlFor="maxPlayers">Max Players</label>
          <input
            id="maxPlayers"
            type="number"
            min={2}
            max={16}
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Math.max(2, Math.min(16, parseInt(e.target.value) || 2)))}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="rotisserie-actions">
          <Button
            variant="danger"
            size="lg"
            onClick={() => router.push('/casual')}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            disabled={selectedSets.length === 0 || creating}
            onClick={handleCreate}
          >
            {creating ? 'Creating...' : 'Create Rotisserie Draft'}
          </Button>
        </div>
      </div>
    </div>
  )
}
