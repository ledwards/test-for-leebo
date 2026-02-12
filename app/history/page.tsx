// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../src/contexts/AuthContext'
import { fetchUserPools, updatePool, deletePool } from '../../src/utils/poolApi'
import { dropFromDraft } from '../../src/utils/draftApi'
import { useRouter } from 'next/navigation'
import { getSetConfig } from '../../src/utils/setConfigs'
import EditableTitle from '../../src/components/EditableTitle'
import '../../src/App.css'
import './History.css'

interface SealedPool {
  id: string
  shareId: string
  setCode: string
  name?: string
  leaderName?: string
  baseName?: string
  mainDeckCount?: number
  createdAt: string
  poolType?: string
  hidden?: boolean
}

interface CasualPool {
  id: string
  shareId: string
  setCode: string
  setName: string
  poolType: string
  name: string
  leaderName?: string
  baseName?: string
  mainDeckCount?: number
  createdAt: string
  hidden?: boolean
}

interface DraftPod {
  id: string
  shareId: string
  poolShareId?: string
  setCode: string
  status: string
  draftName?: string
  leaderName?: string
  baseName?: string
  mainDeckCount?: number
  createdAt: string
  isHost?: boolean
  isBot?: boolean
  hidden?: boolean
}

// Check if a deck is valid for play (has leader, base, and 30+ main deck cards)
function isDeckPlayable(leaderName?: string, baseName?: string, mainDeckCount?: number): boolean {
  return !!leaderName && !!baseName && (mainDeckCount || 0) >= 30
}

interface DeleteConfirmState {
  shareId: string
  type: 'sealed' | 'draft' | 'casual'
  isActiveDraft?: boolean
}

// Map pool types to route paths for casual formats
const CASUAL_POOL_TYPE_ROUTES: Record<string, string> = {
  'chaos_sealed': '/pool',
  'pack_wars': '/casual/pack-wars',
  'pack_blitz': '/casual/pack-blitz',
  'chaos_draft': '/draft',
  'rotisserie': '/casual/rotisserie',
}

// Map pool types to display names
const CASUAL_POOL_TYPE_NAMES: Record<string, string> = {
  'chaos_sealed': 'Chaos Sealed',
  'pack_wars': 'Pack Wars',
  'pack_blitz': 'Pack Blitz',
  'chaos_draft': 'Chaos Draft',
  'rotisserie': 'Rotisserie',
}

interface DropConfirmState {
  shareId: string
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'sealed' | 'draft' | 'casual'>('sealed')
  const [sealedPools, setSealedPools] = useState<SealedPool[]>([])
  const [draftPods, setDraftPods] = useState<DraftPod[]>([])
  const [casualPools, setCasualPools] = useState<CasualPool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dropConfirm, setDropConfirm] = useState<DropConfirmState | null>(null)
  const [isDropping, setIsDropping] = useState(false)
  const [showHiddenSealed, setShowHiddenSealed] = useState(false)
  const [showHiddenDraft, setShowHiddenDraft] = useState(false)
  const [showHiddenCasual, setShowHiddenCasual] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/'
      return
    }

    if (user) {
      setLoading(true)

      // Fetch user pools, drafts, and casual pools
      Promise.all([
        fetchUserPools(user.id),
        fetch('/api/draft/history', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/casual/history', { credentials: 'include' }).then(r => r.json())
      ])
        .then(([poolsData, draftData, casualData]) => {
          // Handle sealed pools (filter out draft pools and casual pool types)
          const casualPoolTypes = ['chaos_sealed', 'pack_wars', 'pack_blitz', 'chaos_draft', 'rotisserie']
          if (poolsData && Array.isArray(poolsData)) {
            const sealed = poolsData
              .filter(p => p.poolType !== 'draft' && !casualPoolTypes.includes(p.poolType))
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

          // Handle casual pools
          if (casualData && (casualData.pools || casualData.data?.pools)) {
            const pools = (casualData.pools || casualData.data?.pools)
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            setCasualPools(pools)
          } else {
            setCasualPools([])
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting': return 'Waiting'
      case 'leader_draft': return 'Leader Draft'
      case 'pack_draft': return 'Pack Draft'
      case 'complete': return 'Complete'
      default: return status
    }
  }

  const getSetName = (setCode: string) => {
    const config = getSetConfig(setCode)
    return config?.setName || setCode
  }

  const handleRenamePool = async (shareId: string, newName: string) => {
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

  const handleRenameDraft = async (poolShareId: string | undefined, newName: string) => {
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

  const handleRenameCasual = async (shareId: string, newName: string) => {
    try {
      await updatePool(shareId, { poolName: newName })
      setCasualPools(pools =>
        pools.map(pool =>
          pool.shareId === shareId ? { ...pool, name: newName } : pool
        )
      )
    } catch (err) {
      console.error('Failed to rename casual pool:', err)
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
        } else if (deleteConfirm.type === 'casual') {
          setCasualPools(pools => pools.filter(p => p.shareId !== deleteConfirm.shareId))
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

  const handleDrop = async () => {
    if (!dropConfirm) return
    setIsDropping(true)
    try {
      await dropFromDraft(dropConfirm.shareId)
      // Remove from local state (user dropped, so they no longer see it as active)
      setDraftPods(pods => pods.filter(p => p.shareId !== dropConfirm.shareId))
      setDropConfirm(null)
    } catch (err) {
      console.error('Failed to drop from draft:', err)
    } finally {
      setIsDropping(false)
    }
  }

  const handleToggleHidden = async (shareId: string, currentHidden: boolean | undefined, type: 'sealed' | 'draft' | 'casual') => {
    try {
      await updatePool(shareId, { hidden: !currentHidden })
      if (type === 'sealed') {
        setSealedPools(pools => pools.map(p =>
          p.shareId === shareId ? { ...p, hidden: !currentHidden } : p
        ))
      } else if (type === 'casual') {
        setCasualPools(pools => pools.map(p =>
          p.shareId === shareId ? { ...p, hidden: !currentHidden } : p
        ))
      } else {
        setDraftPods(pods => pods.map(p =>
          p.poolShareId === shareId ? { ...p, hidden: !currentHidden } : p
        ))
      }
    } catch (err) {
      console.error('Failed to toggle hidden:', err)
    }
  }

  // Filter pools into visible and hidden
  const visibleSealedPools = sealedPools.filter(p => !p.hidden)
  const hiddenSealedPools = sealedPools.filter(p => p.hidden)
  const visibleDraftPods = draftPods.filter(p => !p.hidden)
  const hiddenDraftPods = draftPods.filter(p => p.hidden)
  const visibleCasualPools = casualPools.filter(p => !p.hidden)
  const hiddenCasualPools = casualPools.filter(p => p.hidden)

  // Helper function to get URL for casual pool
  const getCasualPoolUrl = (pool: CasualPool) => {
    const baseRoute = CASUAL_POOL_TYPE_ROUTES[pool.poolType] || '/pool'
    return `${baseRoute}/${pool.shareId}`
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
          <button
            className={`history-tab ${activeTab === 'casual' ? 'active' : ''}`}
            onClick={() => setActiveTab('casual')}
          >
            Casual
          </button>
        </div>

        {activeTab === 'sealed' && (
          <>
            {sealedPools.length === 0 ? (
              <div className="history-empty">
                <p>No sealed pools found. Create your first pool to get started!</p>
              </div>
            ) : (
              <>
                {visibleSealedPools.length > 0 && (
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
                        {visibleSealedPools.map((pool) => (
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
                              <div className="actions-wrapper">
                                <button
                                  className="history-view-button"
                                  onClick={() => window.location.href = `/pool/${pool.shareId}/deck`}
                                >
                                  View
                                </button>
                                {isDeckPlayable(pool.leaderName, pool.baseName, pool.mainDeckCount) && (
                                  <button
                                    className="history-play-button"
                                    onClick={() => window.location.href = `/pool/${pool.shareId}/deck/play`}
                                    title="Play"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                  </button>
                                )}
                                <button
                                  className="history-hide-button"
                                  onClick={() => handleToggleHidden(pool.shareId, pool.hidden, 'sealed')}
                                  title="Hide"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                  </svg>
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
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Hidden sealed pools section */}
                {hiddenSealedPools.length > 0 && (
                  <div className="hidden-pools-section">
                    <button
                      className={`hidden-pools-toggle ${showHiddenSealed ? 'expanded' : ''}`}
                      onClick={() => setShowHiddenSealed(!showHiddenSealed)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ transform: showHiddenSealed ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                      Hidden ({hiddenSealedPools.length})
                    </button>
                    {showHiddenSealed && (
                      <div className="history-table-container hidden-pools-table-container">
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
                            {hiddenSealedPools.map((pool) => (
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
                                  <div className="actions-wrapper">
                                    <button
                                      className="history-view-button"
                                      onClick={() => window.location.href = `/pool/${pool.shareId}/deck`}
                                    >
                                      View
                                    </button>
                                    {isDeckPlayable(pool.leaderName, pool.baseName, pool.mainDeckCount) && (
                                      <button
                                        className="history-play-button"
                                        onClick={() => window.location.href = `/pool/${pool.shareId}/deck/play`}
                                        title="Play"
                                      >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                        </svg>
                                      </button>
                                    )}
                                    <button
                                      className="history-unhide-button"
                                      onClick={() => handleToggleHidden(pool.shareId, pool.hidden, 'sealed')}
                                      title="Show"
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                      </svg>
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
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {visibleSealedPools.length === 0 && hiddenSealedPools.length > 0 && !showHiddenSealed && (
                  <div className="history-empty">
                    <p>All pools are hidden. Click "Hidden" above to show them.</p>
                  </div>
                )}
              </>
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
              <>
                {visibleDraftPods.length > 0 && (
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
                        {visibleDraftPods.map((pod) => {
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
                                <div className="actions-wrapper">
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
                                  {isActive && !pod.isHost && !pod.isBot && (
                                    <button
                                      className="history-drop-button"
                                      onClick={() => setDropConfirm({ shareId: pod.shareId })}
                                      title="Drop from Draft"
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                      </svg>
                                    </button>
                                  )}
                                  {!isActive && pod.poolShareId && (
                                    <>
                                      {isDeckPlayable(pod.leaderName, pod.baseName, pod.mainDeckCount) && (
                                        <button
                                          className="history-play-button"
                                          onClick={() => window.location.href = `/draft_pool/${pod.poolShareId}/play`}
                                          title="Play"
                                        >
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                          </svg>
                                        </button>
                                      )}
                                      <button
                                        className="history-hide-button"
                                        onClick={() => handleToggleHidden(pod.poolShareId, pod.hidden, 'draft')}
                                        title="Hide"
                                      >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                          <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                      </button>
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
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Hidden draft pods section */}
                {hiddenDraftPods.length > 0 && (
                  <div className="hidden-pools-section">
                    <button
                      className={`hidden-pools-toggle ${showHiddenDraft ? 'expanded' : ''}`}
                      onClick={() => setShowHiddenDraft(!showHiddenDraft)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ transform: showHiddenDraft ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                      Hidden ({hiddenDraftPods.length})
                    </button>
                    {showHiddenDraft && (
                      <div className="history-table-container hidden-pools-table-container">
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
                            {hiddenDraftPods.map((pod) => {
                              const handleTitleClick = () => {
                                if (pod.poolShareId) {
                                  window.location.href = `/draft_pool/${pod.poolShareId}/`
                                }
                              }
                              return (
                                <tr key={pod.id}>
                                  <td>
                                    <EditableTitle
                                      value={pod.draftName}
                                      onSave={(newName) => handleRenameDraft(pod.poolShareId, newName)}
                                      onTitleClick={handleTitleClick}
                                      isEditable={!!pod.poolShareId}
                                      placeholder="Untitled Draft"
                                      className="history-editable-title"
                                    />
                                  </td>
                                  <td style={{ color: 'white', fontWeight: '600' }}>
                                    {getSetName(pod.setCode)}
                                  </td>
                                  <td>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: '400' }}>
                                      Completed
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
                                    <div className="actions-wrapper">
                                      <button
                                        className="history-view-button"
                                        onClick={() => window.location.href = `/draft/${pod.shareId}`}
                                      >
                                        View
                                      </button>
                                      {pod.poolShareId && (
                                        <>
                                          {isDeckPlayable(pod.leaderName, pod.baseName, pod.mainDeckCount) && (
                                            <button
                                              className="history-play-button"
                                              onClick={() => window.location.href = `/draft_pool/${pod.poolShareId}/play`}
                                              title="Play"
                                            >
                                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                              </svg>
                                            </button>
                                          )}
                                          <button
                                            className="history-unhide-button"
                                            onClick={() => handleToggleHidden(pod.poolShareId, pod.hidden, 'draft')}
                                            title="Show"
                                          >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                              <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                          </button>
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
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {visibleDraftPods.length === 0 && hiddenDraftPods.length > 0 && !showHiddenDraft && (
                  <div className="history-empty">
                    <p>All drafts are hidden. Click "Hidden" above to show them.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'casual' && (
          <>
            {casualPools.length === 0 ? (
              <div className="history-empty">
                <p>No casual pools found. Try Chaos Sealed, Pack Wars, or other casual formats!</p>
              </div>
            ) : (
              <>
                {visibleCasualPools.length > 0 && (
                  <div className="history-table-container">
                    <table className="history-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Format</th>
                          <th>Leader</th>
                          <th>Base</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleCasualPools.map((pool) => (
                          <tr key={pool.id}>
                            <td>
                              <EditableTitle
                                value={pool.name}
                                onSave={(newName) => handleRenameCasual(pool.shareId, newName)}
                                onTitleClick={() => window.location.href = getCasualPoolUrl(pool) + '/deck'}
                                isEditable={true}
                                placeholder="Untitled Pool"
                                className="history-editable-title"
                              />
                            </td>
                            <td style={{ color: 'white', fontWeight: '600' }}>
                              {CASUAL_POOL_TYPE_NAMES[pool.poolType] || pool.poolType}
                            </td>
                            <td style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                              {pool.leaderName || '-'}
                            </td>
                            <td style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                              {pool.baseName || '-'}
                            </td>
                            <td>{formatDate(pool.createdAt)}</td>
                            <td className="history-actions-cell">
                              <div className="actions-wrapper">
                                <button
                                  className="history-view-button"
                                  onClick={() => window.location.href = getCasualPoolUrl(pool) + '/deck'}
                                >
                                  View
                                </button>
                                {isDeckPlayable(pool.leaderName, pool.baseName, pool.mainDeckCount) && (
                                  <button
                                    className="history-play-button"
                                    onClick={() => window.location.href = getCasualPoolUrl(pool) + '/deck/play'}
                                    title="Play"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                  </button>
                                )}
                                <button
                                  className="history-hide-button"
                                  onClick={() => handleToggleHidden(pool.shareId, pool.hidden, 'casual')}
                                  title="Hide"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                  </svg>
                                </button>
                                <button
                                  className="history-delete-button"
                                  onClick={() => setDeleteConfirm({ shareId: pool.shareId, type: 'casual' })}
                                  title="Delete"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Hidden casual pools section */}
                {hiddenCasualPools.length > 0 && (
                  <div className="hidden-pools-section">
                    <button
                      className={`hidden-pools-toggle ${showHiddenCasual ? 'expanded' : ''}`}
                      onClick={() => setShowHiddenCasual(!showHiddenCasual)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ transform: showHiddenCasual ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                      Hidden ({hiddenCasualPools.length})
                    </button>
                    {showHiddenCasual && (
                      <div className="history-table-container hidden-pools-table-container">
                        <table className="history-table">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Format</th>
                              <th>Leader</th>
                              <th>Base</th>
                              <th>Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hiddenCasualPools.map((pool) => (
                              <tr key={pool.id}>
                                <td>
                                  <EditableTitle
                                    value={pool.name}
                                    onSave={(newName) => handleRenameCasual(pool.shareId, newName)}
                                    onTitleClick={() => window.location.href = getCasualPoolUrl(pool) + '/deck'}
                                    isEditable={true}
                                    placeholder="Untitled Pool"
                                    className="history-editable-title"
                                  />
                                </td>
                                <td style={{ color: 'white', fontWeight: '600' }}>
                                  {CASUAL_POOL_TYPE_NAMES[pool.poolType] || pool.poolType}
                                </td>
                                <td style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                  {pool.leaderName || '-'}
                                </td>
                                <td style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                  {pool.baseName || '-'}
                                </td>
                                <td>{formatDate(pool.createdAt)}</td>
                                <td className="history-actions-cell">
                                  <div className="actions-wrapper">
                                    <button
                                      className="history-view-button"
                                      onClick={() => window.location.href = getCasualPoolUrl(pool) + '/deck'}
                                    >
                                      View
                                    </button>
                                    {isDeckPlayable(pool.leaderName, pool.baseName, pool.mainDeckCount) && (
                                      <button
                                        className="history-play-button"
                                        onClick={() => window.location.href = getCasualPoolUrl(pool) + '/deck/play'}
                                        title="Play"
                                      >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                        </svg>
                                      </button>
                                    )}
                                    <button
                                      className="history-unhide-button"
                                      onClick={() => handleToggleHidden(pool.shareId, pool.hidden, 'casual')}
                                      title="Show"
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                      </svg>
                                    </button>
                                    <button
                                      className="history-delete-button"
                                      onClick={() => setDeleteConfirm({ shareId: pool.shareId, type: 'casual' })}
                                      title="Delete"
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {visibleCasualPools.length === 0 && hiddenCasualPools.length > 0 && !showHiddenCasual && (
                  <div className="history-empty">
                    <p>All casual pools are hidden. Click "Hidden" above to show them.</p>
                  </div>
                )}
              </>
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

        {/* Drop Confirmation Modal */}
        {dropConfirm && (
          <div className="drop-confirm-overlay" onClick={() => setDropConfirm(null)}>
            <div className="drop-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Drop from Draft?</h2>
              <p>
                Are you sure you want to drop from this draft? A bot will take over your picks and you will lose access to your drafted cards.
              </p>
              <div className="drop-confirm-buttons">
                <button
                  className="drop-confirm-cancel"
                  onClick={() => setDropConfirm(null)}
                  disabled={isDropping}
                >
                  Go Back
                </button>
                <button
                  className="drop-confirm-drop"
                  onClick={handleDrop}
                  disabled={isDropping}
                >
                  {isDropping ? 'Dropping...' : 'Drop from Draft'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
