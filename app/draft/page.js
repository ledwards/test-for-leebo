'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../src/contexts/AuthContext'
import AuthWidget from '../../src/components/AuthWidget'
import '../../src/App.css'
import '../../src/components/LandingPage.css'
import './draft.css'

export default function DraftLandingPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // { shareId, poolShareId, isHost }
  const [isDeleting, setIsDeleting] = useState(false)

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

          // Always show the most recent draft, plus any active/waiting drafts
          const filteredPods = allPods.filter((pod, index) => {
            // Always include the most recent draft (index 0)
            if (index === 0) return true
            // Include any other waiting or active drafts
            return pod.status === 'waiting' || pod.status === 'active'
          })
          setHistory(filteredPods)
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

  const handleDeleteDraft = async () => {
    if (!deleteConfirm) return
    setIsDeleting(true)
    try {
      // Use the draft shareId to delete via draft API
      const response = await fetch(`/api/draft/${deleteConfirm.shareId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (response.ok) {
        setHistory(prev => prev.filter(pod => pod.shareId !== deleteConfirm.shareId))
        setDeleteConfirm(null)
      } else {
        console.error('Failed to delete draft')
      }
    } catch (err) {
      console.error('Failed to delete draft:', err)
    } finally {
      setIsDeleting(false)
    }
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
              className="primary-button create-draft-button"
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
            <p>To find a draft pod, join the Discord server!</p>
            <div className="landing-login">
            <a
              className="landing-login-button"
              href="https://discord.gg/sHrwzGqRvg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                  fill="currentColor"
                />
              </svg>
              Join the Discord
            </a>
            </div>
            <p>To enter an existing draft, just go to the URL shared with you by the organizer.</p>
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
                  <div key={pod.id} className="history-item-wrapper">
                    <a
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
                    {pod.isHost && (
                      <button
                        className="draft-history-delete-button"
                        onClick={() => setDeleteConfirm({ shareId: pod.shareId, poolShareId: pod.poolShareId, isHost: pod.isHost })}
                        title="Delete Draft"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="draft-delete-confirm-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="draft-delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Delete Draft?</h2>
              <p>Are you sure you want to delete this draft? This action cannot be undone.</p>
              <div className="draft-delete-confirm-buttons">
                <button
                  className="draft-delete-confirm-cancel"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="draft-delete-confirm-delete"
                  onClick={handleDeleteDraft}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
