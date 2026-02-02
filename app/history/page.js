'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../src/contexts/AuthContext'
import { fetchUserPools, updatePool, deletePool } from '../../src/utils/poolApi'
import { useRouter } from 'next/navigation'
import { getSetConfig } from '../../src/utils/setConfigs'
import EditableTitle from '../../src/components/EditableTitle'
import '../../src/App.css'
import './History.css'

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('sealed')
  const [sealedPools, setSealedPools] = useState([])
  const [draftPods, setDraftPods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // { shareId, type: 'sealed' | 'draft', isActiveDraft: boolean }
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/'
      return
    }

    if (user) {
      setLoading(true)

      // Fetch user pools and drafts
      Promise.all([
        fetchUserPools(user.id),
        fetch('/api/draft/history', { credentials: 'include' }).then(r => r.json())
      ])
        .then(([poolsData, draftData]) => {
          // Handle sealed pools (filter out draft pools)
          if (poolsData && Array.isArray(poolsData)) {
            const sealed = poolsData
              .filter(p => p.poolType !== 'draft')
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            setSealedPools(sealed)
          } else {
            setSealedPools([])
          }

          // Handle draft pods - show ALL drafts (unfiltered for history)
          if (draftData && (draftData.data?.pods || draftData.pods)) {
            const allDrafts = (draftData.data?.pods || draftData.pods)
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            setDraftPods(allDrafts)
          } else {
            setDraftPods([])
          }
        })
        .catch(err => {
          console.error('Failed to fetch history:', err)
          setError(err.message || 'Failed to load history')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [user, authLoading])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'waiting': return 'Waiting'
      case 'leader_draft': return 'Leader Draft'
      case 'pack_draft': return 'Pack Draft'
      case 'complete': return 'Complete'
      default: return status
    }
  }

  const getSetName = (setCode) => {
    const config = getSetConfig(setCode)
    return config?.setName || setCode
  }

  const handleRenamePool = async (shareId, newName) => {
    try {
      // Update deckBuilderState.poolName (source of truth) - API handles the merge
      await updatePool(shareId, { poolName: newName })
      // Update local state
      setSealedPools(pools =>
        pools.map(pool =>
          pool.shareId === shareId ? { ...pool, name: newName } : pool
        )
      )
    } catch (err) {
      console.error('Failed to rename pool:', err)
    }
  }

  const handleRenameDraft = async (poolShareId, newName) => {
    if (!poolShareId) return
    try {
      // Update deckBuilderState.poolName (source of truth) - API handles the merge
      await updatePool(poolShareId, { poolName: newName })
      // Update local state
      setDraftPods(pods =>
        pods.map(pod =>
          pod.poolShareId === poolShareId ? { ...pod, draftName: newName } : pod
        )
      )
    } catch (err) {
      console.error('Failed to rename draft:', err)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setIsDeleting(true)
    try {
      if (deleteConfirm.isActiveDraft) {
        // Use draft API to delete active drafts
        const response = await fetch(`/api/draft/${deleteConfirm.shareId}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        if (!response.ok) {
          throw new Error('Failed to cancel draft')
        }
        setDraftPods(pods => pods.filter(p => p.shareId !== deleteConfirm.shareId))
      } else {
        await deletePool(deleteConfirm.shareId)
        // Remove from local state
        if (deleteConfirm.type === 'sealed') {
          setSealedPools(pools => pools.filter(p => p.shareId !== deleteConfirm.shareId))
        } else {
          setDraftPods(pods => pods.filter(p => p.poolShareId !== deleteConfirm.shareId))
        }
      }
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="app">
        <div className="history-page">
          <div className="history-header">
            <h1>History</h1>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="history-page">
          <div className="history-header">
            <h1>History</h1>
          </div>
          <div className="history-error">
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="history-page">
        <div className="history-header">
          <h1>History</h1>
        </div>

        <div className="history-tabs">
          <button
            className={`history-tab ${activeTab === 'sealed' ? 'active' : ''}`}
            onClick={() => setActiveTab('sealed')}
          >
            Sealed
          </button>
          <button
            className={`history-tab ${activeTab === 'draft' ? 'active' : ''}`}
            onClick={() => setActiveTab('draft')}
          >
            Draft
          </button>
        </div>

        {activeTab === 'sealed' && (
          <>
            {sealedPools.length === 0 ? (
              <div className="history-empty">
                <p>No sealed pools found. Create your first pool to get started!</p>
              </div>
            ) : (
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Set</th>
                      <th>Leader</th>
                      <th>Base</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sealedPools.map((pool) => (
                      <tr key={pool.id}>
                        <td>
                          <EditableTitle
                            value={pool.name}
                            onSave={(newName) => handleRenamePool(pool.shareId, newName)}
                            onTitleClick={() => window.location.href = `/pool/${pool.shareId}/deck`}
                            isEditable={true}
                            placeholder="Untitled Pool"
                            className="history-editable-title"
                          />
                        </td>
                        <td style={{ color: 'white', fontWeight: '600' }}>
                          {getSetName(pool.setCode)}
                        </td>
                        <td style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          {pool.leaderName || '-'}
                        </td>
                        <td style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          {pool.baseName || '-'}
                        </td>
                        <td>{formatDate(pool.createdAt)}</td>
                        <td className="history-actions-cell">
                          <button
                            className="history-view-button"
                            onClick={() => window.location.href = `/pool/${pool.shareId}/deck`}
                          >
                            View
                          </button>
                          <button
                            className="history-delete-button"
                            onClick={() => setDeleteConfirm({ shareId: pool.shareId, type: 'sealed' })}
                            title="Delete"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'draft' && (
          <>
            {draftPods.length === 0 ? (
              <div className="history-empty">
                <p>No drafts found. Join or create a draft to get started!</p>
              </div>
            ) : (
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Set</th>
                      <th>Status</th>
                      <th>Leader</th>
                      <th>Base</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draftPods.map((pod) => {
                      const isActive = pod.status === 'waiting' || pod.status === 'active' || pod.status === 'leader_draft' || pod.status === 'pack_draft'
                      const handleTitleClick = () => {
                        if (isActive) {
                          window.location.href = `/draft/${pod.shareId}`
                        } else if (pod.poolShareId) {
                          window.location.href = `/draft_pool/${pod.poolShareId}/`
                        }
                      }
                      return (
                        <tr key={pod.id}>
                          <td>
                            <EditableTitle
                              value={isActive ? null : pod.draftName}
                              onSave={(newName) => handleRenameDraft(pod.poolShareId, newName)}
                              onTitleClick={handleTitleClick}
                              isEditable={!isActive && !!pod.poolShareId}
                              editDisabled={isActive}
                              placeholder={isActive ? "Active Draft Pod" : "Untitled Draft"}
                              className="history-editable-title"
                            />
                          </td>
                          <td style={{ color: 'white', fontWeight: '600' }}>
                            {getSetName(pod.setCode)}
                          </td>
                          <td>
                            <span style={{
                              color: isActive ? '#4ade80' : 'rgba(255, 255, 255, 0.6)',
                              fontWeight: isActive ? '600' : '400'
                            }}>
                              {isActive ? 'Active' : 'Completed'}
                            </span>
                          </td>
                          <td style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            {pod.leaderName || '-'}
                          </td>
                          <td style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            {pod.baseName || '-'}
                          </td>
                          <td>{formatDate(pod.createdAt)}</td>
                          <td className="history-actions-cell">
                            <button
                              className="history-view-button"
                              onClick={() => window.location.href = `/draft/${pod.shareId}`}
                            >
                              View
                            </button>
                            {isActive && pod.isHost && (
                              <button
                                className="history-delete-button"
                                onClick={() => setDeleteConfirm({ shareId: pod.shareId, type: 'draft', isActiveDraft: true })}
                                title="Cancel Draft"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            )}
                            {!isActive && pod.poolShareId && (
                              <button
                                className="history-delete-button"
                                onClick={() => setDeleteConfirm({ shareId: pod.poolShareId, type: 'draft', isActiveDraft: false })}
                                title="Delete"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="delete-confirm-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{deleteConfirm.isActiveDraft ? 'Cancel Draft?' : 'Delete Deck?'}</h2>
              <p>
                {deleteConfirm.isActiveDraft
                  ? 'Are you sure you want to cancel this draft? All players will be removed and this action cannot be undone.'
                  : 'Are you sure you want to delete this deck? This action cannot be undone.'}
              </p>
              <div className="delete-confirm-buttons">
                <button
                  className="delete-confirm-cancel"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                >
                  Go Back
                </button>
                <button
                  className="delete-confirm-delete"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting
                    ? (deleteConfirm.isActiveDraft ? 'Cancelling...' : 'Deleting...')
                    : (deleteConfirm.isActiveDraft ? 'Cancel Draft' : 'Delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
