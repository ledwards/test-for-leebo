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

          // Only show Lobby (waiting) and In Progress (active) drafts
          const activePods = allPods.filter(pod =>
            pod.status === 'waiting' || pod.status === 'active' || pod.status === 'leader_draft' || pod.status === 'pack_draft'
          )
          setHistory(activePods)
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
