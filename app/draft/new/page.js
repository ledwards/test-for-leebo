'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../src/contexts/AuthContext'
import { createDraft } from '../../../src/utils/draftApi'
import { initializeCardCache } from '../../../src/utils/cardCache'
import SetSelection from '../../../src/components/SetSelection'
import '../../../src/App.css'
import '../draft.css'

export default function NewDraftPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  // Preload cards on mount
  useEffect(() => {
    initializeCardCache().catch((error) => {
      console.error('Failed to load cards:', error)
    })
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/draft')
    }
  }, [authLoading, isAuthenticated, router])

  const handleSetSelect = async (setCode) => {
    if (creating) return

    setCreating(true)
    setError(null)

    try {
      const result = await createDraft(setCode)
      router.push(`/draft/${result.shareId}`)
    } catch (err) {
      console.error('Failed to create draft:', err)
      setError(err.message || 'Failed to create draft')
      setCreating(false)
    }
  }

  const handleBack = () => {
    router.push('/draft')
  }

  if (authLoading) {
    return (
      <div className="draft-page-bg">
        <div className="loading"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (creating) {
    return (
      <div className="draft-page-bg">
        <div className="loading-container">
          <div className="loading"></div>
          <p>Creating draft...</p>
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
    </div>
  )
}
