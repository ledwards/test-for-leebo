// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import { fetchSets } from '@/src/utils/api'
import { createDraft } from '@/src/utils/draftApi'
import Button from '@/src/components/Button'
import './page.css'

interface SetData {
  code: string
  name: string
  imageUrl?: string
  beta?: boolean
}

export default function ChaosDraftPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [sets, setSets] = useState<SetData[]>([])
  const [selectedSets, setSelectedSets] = useState<string[]>([])
  const [maxPlayers, setMaxPlayers] = useState(8)
  const [timerEnabled, setTimerEnabled] = useState(true)
  const [timerSeconds, setTimerSeconds] = useState(30)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
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

  const handleCreate = async () => {
    if (selectedSets.length !== 3) return

    try {
      setCreating(true)
      setError(null)

      // Create a draft pod with chaos settings
      const result = await createDraft(selectedSets[0], {
        maxPlayers,
        timerEnabled,
        timerSeconds,
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
        <Button variant="back" onClick={() => router.push('/casual')}>
          Back to Casual Formats
        </Button>
        <h1>Chaos Draft</h1>
        <p className="chaos-draft-subtitle">Select 3 sets - each pack round uses a different set!</p>

        <div className="chaos-draft-section">
          <h3>Select 3 Sets ({selectedSets.length}/3)</h3>
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
              <p>Pack order:</p>
              <ol>
                {selectedSets.map((setCode, index) => {
                  const set = sets.find(s => s.code === setCode)
                  return <li key={setCode}>Pack {index + 1}: {set?.name || setCode}</li>
                })}
              </ol>
            </div>
          )}
        </div>

        <div className="chaos-draft-section">
          <h3>Draft Settings</h3>
          <div className="options-list">
            <div className="option-item">
              <label>
                <span>Max Players: {maxPlayers}</span>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                />
              </label>
            </div>

            <label className="option-item checkbox">
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={(e) => setTimerEnabled(e.target.checked)}
              />
              <span>Enable Pick Timer</span>
            </label>

            {timerEnabled && (
              <div className="option-item">
                <label>
                  <span>Timer: {timerSeconds} seconds</span>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="15"
                    value={timerSeconds}
                    onChange={(e) => setTimerSeconds(parseInt(e.target.value))}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="chaos-draft-actions">
          <Button
            variant="primary"
            size="lg"
            disabled={selectedSets.length !== 3 || creating}
            onClick={handleCreate}
          >
            {creating ? 'Creating...' : 'Create Chaos Draft'}
          </Button>
        </div>
      </div>
    </div>
  )
}
