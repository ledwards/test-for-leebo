'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../src/contexts/AuthContext'
import { fetchUserPools } from '../../src/utils/poolApi'
import { useRouter } from 'next/navigation'
import '../../src/App.css'
import './History.css'

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('sealed')
  const [sealedPools, setSealedPools] = useState([])
  const [draftPods, setDraftPods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/'
      return
    }

    if (user) {
      setLoading(true)

      // Fetch both sealed pools and draft pods in parallel
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

          // Handle draft pods
          if (draftData && draftData.pods) {
            setDraftPods(draftData.pods)
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
          <button
            className="back-button"
            onClick={() => router.back()}
          >
            ← Back
          </button>
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
                      <th>Date</th>
                      <th>Name</th>
                      <th>Set</th>
                      <th>ID</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sealedPools.map((pool) => (
                      <tr key={pool.id}>
                        <td>{formatDate(pool.createdAt)}</td>
                        <td>{pool.name || 'N/A'}</td>
                        <td style={{ color: 'white', fontWeight: '600' }}>
                          {pool.setCode}
                        </td>
                        <td className="share-id-cell">
                          <code>{pool.shareId}</code>
                        </td>
                        <td>
                          <a
                            href={`/pool/${pool.shareId}/deck`}
                            className="history-edit-button"
                          >
                            Edit
                          </a>
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
                <p>No draft pods found. Join or create a draft to get started!</p>
              </div>
            ) : (
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Set</th>
                      <th>Players</th>
                      <th>Status</th>
                      <th>Role</th>
                      <th>Draft Pool</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draftPods.map((pod) => (
                      <tr key={pod.id}>
                        <td>{formatDate(pod.createdAt)}</td>
                        <td style={{ color: 'white', fontWeight: '600' }}>
                          {pod.setCode}
                        </td>
                        <td>{pod.currentPlayers}/{pod.maxPlayers}</td>
                        <td>{getStatusLabel(pod.status)}</td>
                        <td>{pod.isHost ? '(Host)' : 'Player'}</td>
                        <td>
                          {pod.poolShareId ? (
                            <a
                              href={`/pool/${pod.poolShareId}/deck`}
                              className="history-pool-link"
                            >
                              View Pool
                            </a>
                          ) : (
                            pod.status === 'complete' ? (
                              <a
                                href={`/draft/${pod.shareId}/deck`}
                                className="history-pool-link"
                              >
                                Create Pool
                              </a>
                            ) : (
                              <span className="history-no-pool">—</span>
                            )
                          )}
                        </td>
                        <td>
                          <a
                            href={`/draft/${pod.shareId}`}
                            className="history-edit-button"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
