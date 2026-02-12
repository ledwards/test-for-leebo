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

export default function PackWarsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [sets, setSets] = useState<SetData[]>([])
  const [selectedSet, setSelectedSet] = useState<string | null>(null)
  const [ignoreAspectPenalties, setIgnoreAspectPenalties] = useState(true)
  const [resourceBufferCount, setResourceBufferCount] = useState(0)
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

  const handleGenerate = async () => {
    if (!selectedSet) return

    try {
      setGenerating(true)
      setError(null)

      const response = await fetch('/api/casual/pack-wars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          setCode: selectedSet,
          ignoreAspectPenalties,
          resourceBufferCount
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || data.error || 'Failed to generate pool')
      }

      const result = await response.json()
      router.push(`/casual/pack-wars/${result.data.shareId}`)
    } catch (err) {
      setError(err.message || 'Failed to generate pool')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="pack-wars-page">
        <div className="pack-wars-container">
          <div className="loading">Loading sets...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="pack-wars-page">
      <div className="pack-wars-container">
        <Button variant="back" onClick={() => router.push('/casual')}>
          Back to Casual Formats
        </Button>
        <h1>Pack Wars</h1>
        <p className="pack-wars-subtitle">Open 2 packs, choose your leader, and battle!</p>

        <div className="pack-wars-section">
          <h3>Select a Set</h3>
          <div className="set-grid">
            {sets.map((set) => (
              <button
                key={set.code}
                className={`set-button ${selectedSet === set.code ? 'selected' : ''}`}
                onClick={() => setSelectedSet(set.code)}
              >
                {set.name}
                {set.beta && <span className="beta-badge">Beta</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="pack-wars-section">
          <h3>Options</h3>
          <div className="options-list">
            <label className="option-item">
              <input
                type="checkbox"
                checked={ignoreAspectPenalties}
                onChange={(e) => setIgnoreAspectPenalties(e.target.checked)}
              />
              <span>Ignore Aspect Penalties</span>
            </label>

            <div className="option-item">
              <label>
                <span>Resource Buffer Cards: {resourceBufferCount}</span>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={resourceBufferCount}
                  onChange={(e) => setResourceBufferCount(parseInt(e.target.value))}
                />
              </label>
              <p className="option-hint">Add blank cards as guaranteed resources</p>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="pack-wars-actions">
          <Button
            variant="primary"
            size="lg"
            disabled={!selectedSet || generating}
            onClick={handleGenerate}
          >
            {generating ? 'Generating...' : 'Generate Packs'}
          </Button>
        </div>
      </div>
    </div>
  )
}
