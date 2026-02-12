// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import { fetchSets } from '@/src/utils/api'
import Button from '@/src/components/Button'
import './page.css'

interface SetData {
  code: string
  name: string
  imageUrl?: string
  beta?: boolean
}

export default function ChaosSealedPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [sets, setSets] = useState<SetData[]>([])
  const [selectedSets, setSelectedSets] = useState<string[]>([])
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

  const toggleSetSelection = (setCode: string) => {
    setSelectedSets(prev => {
      if (prev.includes(setCode)) {
        return prev.filter(s => s !== setCode)
      }
      if (prev.length >= 3) {
        // Replace oldest selection
        return [...prev.slice(1), setCode]
      }
      return [...prev, setCode]
    })
  }

  const handleGenerate = async () => {
    if (selectedSets.length !== 3) return

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
        <Button variant="back" onClick={() => router.push('/casual')}>
          Back to Casual Formats
        </Button>
        <h1>Chaos Sealed</h1>
        <p className="chaos-sealed-subtitle">Open 6 packs from 3 different sets!</p>

        <div className="chaos-sealed-section">
          <h3>Select 3 Sets ({selectedSets.length}/3)</h3>
          <p className="section-hint">You'll open 2 packs from each set (6 total)</p>
          <div className="set-grid">
            {sets.map((set) => {
              const selectionIndex = selectedSets.indexOf(set.code)
              const isSelected = selectionIndex !== -1
              return (
                <button
                  key={set.code}
                  className={`set-button ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleSetSelection(set.code)}
                >
                  {isSelected && (
                    <span className="selection-number">{selectionIndex + 1}</span>
                  )}
                  {set.name}
                  {set.beta && <span className="beta-badge">Beta</span>}
                </button>
              )
            })}
          </div>
          {selectedSets.length === 3 && (
            <div className="selected-sets-order">
              <p>Your sets:</p>
              <ul>
                {selectedSets.map((setCode) => {
                  const set = sets.find(s => s.code === setCode)
                  return <li key={setCode}>{set?.name || setCode} (2 packs)</li>
                })}
              </ul>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="chaos-sealed-actions">
          <Button
            variant="primary"
            size="lg"
            disabled={selectedSets.length !== 3 || generating}
            onClick={handleGenerate}
          >
            {generating ? 'Generating...' : 'Generate Chaos Sealed Pool'}
          </Button>
        </div>
      </div>
    </div>
  )
}
