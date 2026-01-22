'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../src/contexts/AuthContext'
import { fetchUserPools } from '../../src/utils/poolApi'
import { useRouter } from 'next/navigation'
import { getSetConfig } from '../../src/utils/setConfigs'
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
                      <th>Title</th>
                      <th>Set</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sealedPools.map((pool) => (
                      <tr key={pool.id}>
                        <td>
                          <a
                            href={`/pool/${pool.shareId}/deck`}
                            className="history-pool-name"
                          >
                            {pool.name || 'Untitled Pool'}
                          </a>
                        </td>
                        <td style={{ color: 'white', fontWeight: '600' }}>
                          {getSetName(pool.setCode)}
                        </td>
                        <td>{formatDate(pool.createdAt)}</td>
                        <td>
                          <button
                            className="history-show-button"
                            onClick={() => window.location.href = `/pool/${pool.shareId}/deck`}
                          >
                            Show
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
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draftPods.map((pod) => (
                      <tr key={pod.id}>
                        <td>
                          <a
                            href={`/draft/${pod.shareId}`}
                            className="history-pool-name"
                          >
                            {pod.draftName || 'Untitled Draft'}
                          </a>
                        </td>
                        <td style={{ color: 'white', fontWeight: '600' }}>
                          {getSetName(pod.setCode)}
                        </td>
                        <td>{formatDate(pod.createdAt)}</td>
                        <td>
                          <button
                            className="history-show-button"
                            onClick={() => window.location.href = `/draft/${pod.shareId}`}
                          >
                            Show
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
      </div>
    </div>
  )
}
