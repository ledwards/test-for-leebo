// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import { fetchSets } from '@/src/utils/api'
import { getPackImageUrl } from '@/src/utils/packArt'
import { getSetConfig } from '@/src/utils/setConfigs'
import Button from '@/src/components/Button'
import './page.css'

interface SetData {
  code: string
  name: string
  imageUrl?: string
  beta?: boolean
}

// Get set color from config
function getSetColor(setCode: string): string {
  const config = getSetConfig(setCode)
  return config?.color || '#ffffff'
}

// Get set number for ordering (1-3, 4-6, 7+)
function getSetNumber(setCode: string): number {
  const setCodeMap: Record<string, number> = {
    'SOR': 1, 'SHD': 2, 'TWI': 3,
    'JTL': 4, 'LOF': 5, 'SEC': 6,
    'LAW': 7,
  }
  return setCodeMap[setCode] || 999
}

// Sort sets for display: 1-3 top, 4-6 middle, 7-9 bottom
function sortSetsForDisplay(sets: SetData[]): { top: SetData[], middle: SetData[], bottom: SetData[] } {
  const top: SetData[] = []
  const middle: SetData[] = []
  const bottom: SetData[] = []

  for (const set of sets) {
    const num = getSetNumber(set.code)
    if (num >= 7) {
      bottom.push(set)
    } else if (num >= 4 && num <= 6) {
      middle.push(set)
    } else {
      top.push(set)
    }
  }

  // Sort each group by set number
  top.sort((a, b) => getSetNumber(a.code) - getSetNumber(b.code))
  middle.sort((a, b) => getSetNumber(a.code) - getSetNumber(b.code))
  bottom.sort((a, b) => getSetNumber(a.code) - getSetNumber(b.code))

  return { top, middle, bottom }
}

export default function ChaosSealedPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [sets, setSets] = useState<SetData[]>([])
  const [selectedSets, setSelectedSets] = useState<string[]>([]) // Can have duplicates
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // Count how many times each set is selected
  const getSetCount = (setCode: string) => {
    return selectedSets.filter(s => s === setCode).length
  }

  const handleSetClick = (setCode: string) => {
    const count = getSetCount(setCode)
    if (count === 0) {
      // First click: add the set
      if (selectedSets.length < 6) {
        setSelectedSets(prev => [...prev, setCode])
      }
    }
    // If already selected, do nothing on main click - use +/- buttons
  }

  const handleAddOne = (setCode: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedSets.length < 6) {
      setSelectedSets(prev => [...prev, setCode])
    }
  }

  const handleRemoveOne = (setCode: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // Remove one instance of this set
    const index = selectedSets.indexOf(setCode)
    if (index > -1) {
      setSelectedSets(prev => [...prev.slice(0, index), ...prev.slice(index + 1)])
    }
  }

  const handleGenerate = async () => {
    if (selectedSets.length !== 6) return

    try {
      setGenerating(true)
      setError(null)

      const response = await fetch('/api/casual/chaos-sealed', {
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
      // Redirect to the standard sealed pool page
      router.push(`/pool/${result.data.shareId}`)
    } catch (err) {
      setError(err.message || 'Failed to generate pool')
    } finally {
      setGenerating(false)
    }
  }

  const sortedSets = sortSetsForDisplay(sets)

  const renderSetButton = (set: SetData) => {
    const count = getSetCount(set.code)
    const isSelected = count > 0
    const canAddMore = selectedSets.length < 6
    const setColor = getSetColor(set.code)
    const packImageUrl = getPackImageUrl(set.code)

    return (
      <button
        key={set.code}
        className={`set-button ${isSelected ? 'selected' : ''}`}
        onClick={() => handleSetClick(set.code)}
        style={{
          '--set-color': setColor,
        } as React.CSSProperties}
      >
        <div className="set-button-image">
          <img src={packImageUrl} alt={set.name} />
          {isSelected && (
            <div className="selection-badge">
              <span
                className="selection-button"
                onClick={(e) => handleRemoveOne(set.code, e)}
              >
                −
              </span>
              <span className="selection-number">{count}</span>
              {canAddMore && (
                <span
                  className="selection-button"
                  onClick={(e) => handleAddOne(set.code, e)}
                >
                  +
                </span>
              )}
            </div>
          )}
        </div>
        <div className="set-button-content">
          <span className="set-name">{set.name}</span>
        </div>
        {set.beta && <span className="beta-badge">Beta</span>}
      </button>
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

        <div className="chaos-sealed-section">
          <h3>Select 6 Packs ({selectedSets.length}/6)</h3>

          {/* Top row (1-3) */}
          {sortedSets.top.length > 0 && (
            <div className="set-grid">
              {sortedSets.top.map(renderSetButton)}
            </div>
          )}

          {/* Middle row (4-6) */}
          {sortedSets.middle.length > 0 && (
            <div className="set-grid">
              {sortedSets.middle.map(renderSetButton)}
            </div>
          )}

          {/* Bottom row (7+) */}
          {sortedSets.bottom.length > 0 && (
            <div className="set-grid">
              {sortedSets.bottom.map(renderSetButton)}
            </div>
          )}

          {selectedSets.length > 0 && (
            <div className="selected-sets-order">
              <p>Your Chaos Sealed ({selectedSets.length}/6):</p>
              <div className="selected-packs-row">
                {selectedSets.map((setCode, index) => {
                  const packImageUrl = getPackImageUrl(setCode)
                  return (
                    <div
                      key={index}
                      className="selected-pack"
                      onClick={() => {
                        setSelectedSets(prev => [...prev.slice(0, index), ...prev.slice(index + 1)])
                      }}
                    >
                      <div className="selected-pack-image">
                        <img src={packImageUrl} alt={setCode} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="chaos-sealed-actions">
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
            disabled={selectedSets.length !== 6 || generating}
            onClick={handleGenerate}
          >
            {generating ? 'Generating...' : 'Generate Chaos Sealed Pool'}
          </Button>
        </div>
      </div>
    </div>
  )
}
