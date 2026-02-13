// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import { fetchSets } from '@/src/utils/api'
import Button from '@/src/components/Button'
import PackSelector from '@/src/components/PackSelector'
import './page.css'

interface SetData {
  code: string
  name: string
  imageUrl?: string
  beta?: boolean
}

export default function PackBlitzPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [sets, setSets] = useState<SetData[]>([])
  const [selectedSet, setSelectedSet] = useState<string | null>(null)
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

      const response = await fetch('/api/casual/pack-blitz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          setCode: selectedSet
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || data.error || 'Failed to generate pool')
      }

      const result = await response.json()
      router.push(`/casual/pack-blitz/${result.data.shareId}`)
    } catch (err) {
      setError(err.message || 'Failed to generate pool')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="pack-blitz-page">
        <div className="pack-blitz-container">
          <div className="loading">Loading sets...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="pack-blitz-page">
      <div className="pack-blitz-container">
        <h1>Pack Blitz</h1>
        <p className="pack-blitz-subtitle">Open 1 pack, choose your leader, and battle!</p>

        <div className="pack-blitz-rules">
          <h3>How to Play</h3>
          <ul>
            <li>Each player opens 1 pack from the same set</li>
            <li>Choose 1 leader and 1 base per game</li>
            <li>Shuffle all other cards as your deck</li>
            <li>Aspect penalties are ignored</li>
          </ul>
        </div>

        <PackSelector
          sets={sets}
          selectedSet={selectedSet}
          onSelectSet={setSelectedSet}
          title="Select a Set"
        />

        {error && <div className="error-message">{error}</div>}

        <div className="pack-blitz-actions">
          <Button
            variant="danger"
            size="lg"
            onClick={() => router.push('/casual')}
          >
            Peace
          </Button>
          <Button
            variant="primary"
            size="lg"
            disabled={!selectedSet || generating}
            onClick={handleGenerate}
          >
            {generating ? 'Opening...' : 'WAR!'}
          </Button>
        </div>
      </div>
    </div>
  )
}
