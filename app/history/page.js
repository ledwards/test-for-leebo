'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../src/contexts/AuthContext'
import { fetchUserPools } from '../../src/utils/poolApi'
import { useRouter } from 'next/navigation'
import '../../src/App.css'
import './History.css'

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const [pools, setPools] = useState([])
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
      console.log('Fetching pools for user:', user.id, user)
      fetchUserPools(user.id)
        .then(data => {
          console.log('Fetched pools:', data, 'length:', data?.length)
          if (data && Array.isArray(data)) {
            // Sort by created_at descending
            const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            console.log('Sorted pools:', sorted.length)
            setPools(sorted)
          } else {
            console.warn('Data is not an array:', data)
            setPools([])
          }
        })
        .catch(err => {
          console.error('Failed to fetch pools:', err)
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

  if (authLoading || loading) {
    return (
      <div className="app">
        <div className="history-page">
          <div className="history-header">
            <h1>Your Pools</h1>
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
            <h1>Your Pools</h1>
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
          <h1>Your Pools</h1>
        </div>

        {pools.length === 0 ? (
          <div className="history-empty">
            <p>No pools found. Create your first pool to get started!</p>
          </div>
        ) : (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Format</th>
                  <th>Set</th>
                  <th>ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pools.map((pool) => (
                  <tr key={pool.id}>
                    <td>{formatDate(pool.createdAt)}</td>
                    <td>{pool.name || 'N/A'}</td>
                    <td>{pool.poolType === 'draft' ? 'Draft' : 'Sealed'}</td>
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
      </div>
    </div>
  )
}
