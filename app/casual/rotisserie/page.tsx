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

export default function RotisseriePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [sets, setSets] = useState<SetData[]>([])
  const [selectedSets, setSelectedSets] = useState<string[]>([])
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [pickTimerSeconds, setPickTimerSeconds] = useState(60)
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
      return [...prev, setCode]
    })
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
          pickTimerSeconds
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create draft')
      }

      const data = await response.json()
      router.push(`/casual/rotisserie/${data.shareId}`)
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

        <div className="rotisserie-section">
          <h3>Select Sets for Card Pool ({selectedSets.length} selected)</h3>
          <p className="section-hint">Select one or more sets to build the card pool</p>
          <div className="set-grid">
            {sets.map((set) => {
              const isSelected = selectedSets.includes(set.code)
              return (
                <button
                  key={set.code}
                  className={`set-button ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleSetSelection(set.code)}
                >
                  {set.name}
                  {set.beta && <span className="beta-badge">Beta</span>}
                </button>
              )
            })}
          </div>
        </div>

        <div className="rotisserie-section">
          <h3>Draft Settings</h3>
          <div className="options-list">
            <div className="option-item">
              <label>
                <span>Players: {maxPlayers}</span>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                />
              </label>
              <p className="option-hint">Each player drafts 50 cards</p>
            </div>

            <div className="option-item">
              <label>
                <span>Pick Timer: {pickTimerSeconds} seconds</span>
                <input
                  type="range"
                  min="30"
                  max="180"
                  step="30"
                  value={pickTimerSeconds}
                  onChange={(e) => setPickTimerSeconds(parseInt(e.target.value))}
                />
              </label>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="rotisserie-actions">
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
