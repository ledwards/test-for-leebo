'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../src/contexts/AuthContext'
import AuthWidget from '../../src/components/AuthWidget'
import '../../src/App.css'
import './draft.css'

export default function DraftLandingPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Fetch draft history when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setHistory([])
      return
    }

    const fetchHistory = async () => {
      setHistoryLoading(true)
      try {
        const response = await fetch('/api/draft/history', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          const allPods = data.data?.pods || data.pods || []

          // Show all drafts (no filtering)
          setHistory(allPods)
        }
      } catch (err) {
        console.error('Failed to fetch draft history:', err)
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchHistory()
  }, [isAuthenticated, user])

  const handleCreateDraft = () => {
    if (!isAuthenticated) {
      setError('Please sign in to create a draft')
      return
    }
    router.push('/draft/new')
  }

  const handleJoinDraft = () => {
    if (!joinCode.trim()) {
      setError('Please enter a draft code')
      return
    }
    router.push(`/draft/${joinCode.trim()}`)
  }

  const handleBack = () => {
    router.push('/')
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'waiting': return 'Lobby'
      case 'active': return 'In Progress'
      case 'complete': return 'Complete'
      default: return status
    }
  }

  return (
    <div className="draft-page-bg">
      <AuthWidget />
      <div className="draft-landing">
        <div className="back-button-container">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
        </div>

        <h1>Draft Mode</h1>
        <p className="draft-description">
          Draft with up to 8 players. Each player opens 3 booster packs and drafts cards
          in a rotating pick order.
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="draft-options">
          <div className="draft-option">
            <h2>Create New Draft</h2>
            <p>Start a new draft pod and invite your friends</p>
            <button
              className="primary-button"
              onClick={handleCreateDraft}
              disabled={authLoading}
            >
              Create Draft
            </button>
            {!isAuthenticated && !authLoading && (
              <p className="auth-note">Sign in required to create drafts</p>
            )}
          </div>

          <div className="draft-option">
            <h2>Join Draft</h2>
            <p>To enter an exisitng draft, just go to the URL shared with you by the organizer.</p>
          </div>
        </div>

        {isAuthenticated && (
          <div className="draft-history">
            <h2>My Drafts</h2>
            {historyLoading ? (
              <p className="history-loading">Loading...</p>
            ) : history.length === 0 ? (
              <p className="history-empty">No drafts yet</p>
            ) : (
              <div className="history-list">
                {history.map((pod) => (
                  <a
                    key={pod.id}
                    href={`/draft/${pod.shareId}`}
                    className="history-item"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push(`/draft/${pod.shareId}`)
                    }}
                  >
                    <div className="history-item-main">
                      <span className="history-set">{pod.setName || pod.setCode}</span>
                      {pod.isHost && <span className="host-badge">(Host)</span>}
                      <span className={`history-status ${pod.status}`}>
                        {getStatusLabel(pod.status)}
                      </span>
                    </div>
                    <div className="history-item-meta">
                      <span className="history-players">
                        {pod.currentPlayers}/{pod.maxPlayers} players
                      </span>
                      <span className="history-date">{formatDate(pod.createdAt)}</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
