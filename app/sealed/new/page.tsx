// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../src/contexts/AuthContext'
import { initializeCardCache } from '../../../src/utils/cardCache'
import SetSelection from '../../../src/components/SetSelection'
import '../../../src/App.css'

export default function NewSealedPodPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(false)

  useEffect(() => {
    initializeCardCache().catch((error) => {
      console.error('Failed to load cards:', error)
    })
  }, [])

  const handleLogin = () => {
    const returnUrl = encodeURIComponent('/sealed/new')
    window.location.href = `/api/auth/signin/discord?return_to=${returnUrl}`
  }

  const handleSetSelect = async (setCode: string) => {
    if (creating) return
    setCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/sealed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ setCode, isPublic }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to create sealed pod')
      }

      const json = await response.json()
      const result = json.data || json
      router.push(`/sealed/${result.shareId}`)
    } catch (err) {
      console.error('Failed to create sealed pod:', err)
      setError(err instanceof Error ? err.message : 'Failed to create sealed pod')
      setCreating(false)
    }
  }

  const handleBack = () => {
    router.push('/multiplayer')
  }

  if (authLoading) {
    return (
      <div className="draft-page-bg">
        <div className="loading"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="draft-page-bg">
        <div className="auth-prompt-container">
          <h2>Login Required</h2>
          <p>Sealed with Friends requires a Discord login to track players.</p>
          <button className="primary-button" onClick={handleLogin}>
            Login with Discord
          </button>
          <button className="secondary-button" onClick={handleBack}>
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (creating) {
    return (
      <div className="draft-page-bg">
        <div className="loading-container">
          <div className="loading"></div>
          <p>Creating sealed pod...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="draft-page-bg">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="primary-button" onClick={() => setError(null)}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <SetSelection onSetSelect={handleSetSelect} onBack={handleBack} />
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'white', fontSize: '0.9rem', justifyContent: 'center', padding: '0.5rem 0' }}>
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Public (visible to other players)
      </label>
    </div>
  )
}
