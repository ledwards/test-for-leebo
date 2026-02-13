// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import { deletePool } from '@/src/utils/poolApi'
import '../draft/draft.css'
import './page.css'

interface CasualMode {
  id: string
  name: string
  description: string
  comingSoon: boolean
  cardArt?: string
  artType?: 'event' | 'unit' // event = bottom 50%, unit = 10% from top
  glowColor?: 'red' | 'purple' // default is green
}

interface CasualPool {
  id: string
  shareId: string
  setCode: string
  setName: string
  poolType: string
  name: string
  createdAt: string
}

interface DeleteConfirmState {
  shareId: string
  name: string
}

// Card art URLs for hover effect (all Hyperspace variants, not foil)
const CARD_ART = {
  misterBones: 'https://cdn.starwarsunlimited.com//card_0302421_EN_Mister_Bones_dcd95db084.png',
  chaosOfWar: 'https://cdn.starwarsunlimited.com//card_0202428_EN_The_Chaos_of_War_248678061a.png',
  letsCallItWar: 'https://cdn.starwarsunlimited.com//card_06020444_EN_Let_s_Call_It_War_45a2c83395.png',
  toppleTheSummit: 'https://cdn.starwarsunlimited.com//card_06020447_EN_Topple_the_Summit_d82f3cefcb.png',
  atst: 'https://cdn.starwarsunlimited.com//card_SWH_01_493_AT_ST_HYP_ff73b562a5.png',
}

const CASUAL_MODES: CasualMode[] = [
  {
    id: 'chaos-sealed',
    name: 'Chaos Sealed',
    description: 'Open 6 packs from 6 different sets',
    comingSoon: false,
    cardArt: CARD_ART.chaosOfWar,
    artType: 'event',
    glowColor: 'red',
  },
  {
    id: 'chaos-draft',
    name: 'Chaos Draft',
    description: 'Draft with packs from 3 different sets',
    comingSoon: false,
    cardArt: CARD_ART.misterBones,
    artType: 'unit',
    glowColor: 'red',
  },
  {
    id: 'pack-wars',
    name: 'Pack Wars',
    description: 'Build deck from 2 packs',
    comingSoon: false,
    cardArt: CARD_ART.letsCallItWar,
    artType: 'event',
  },
  {
    id: 'pack-blitz',
    name: 'Pack Blitz',
    description: 'Build deck from 1 pack',
    comingSoon: false,
    cardArt: CARD_ART.toppleTheSummit,
    artType: 'event',
  },
  {
    id: 'rotisserie',
    name: 'Rotisserie Draft',
    description: 'Snake draft from entire card pool, face-up',
    comingSoon: false,
    cardArt: CARD_ART.atst,
    artType: 'unit',
    glowColor: 'purple',
  },
]

// Map pool types to route paths
const POOL_TYPE_ROUTES: Record<string, string> = {
  'chaos_sealed': '/pool',
  'pack_wars': '/casual/pack-wars',
  'pack_blitz': '/casual/pack-blitz',
  'chaos_draft': '/draft',
  'rotisserie': '/casual/rotisserie',
}

// Map pool types to display names
const POOL_TYPE_NAMES: Record<string, string> = {
  'chaos_sealed': 'Chaos Sealed',
  'pack_wars': 'Pack Wars',
  'pack_blitz': 'Pack Blitz',
  'chaos_draft': 'Chaos Draft',
  'rotisserie': 'Rotisserie',
}

export default function CasualModePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const hasBetaAccess = user?.is_beta_tester || user?.is_admin
  const [history, setHistory] = useState<CasualPool[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch casual format history when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setHistory([])
      return
    }

    const fetchHistory = async () => {
      setHistoryLoading(true)
      try {
        const response = await fetch('/api/casual/history', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          const pools = data.pools || data.data?.pools || []
          setHistory(pools)
        }
      } catch (err) {
        console.error('Failed to fetch casual history:', err)
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchHistory()
  }, [isAuthenticated, user])

  const handleModeSelect = (mode: CasualMode) => {
    if (mode.comingSoon) {
      return // Don't navigate if coming soon
    }
    router.push(`/casual/${mode.id}`)
  }

  const handleDeletePool = async () => {
    if (!deleteConfirm) return
    setIsDeleting(true)
    try {
      await deletePool(deleteConfirm.shareId)
      setHistory(prev => prev.filter(pool => pool.shareId !== deleteConfirm.shareId))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Failed to delete pool:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
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

  const getPoolUrl = (pool: CasualPool) => {
    const baseRoute = POOL_TYPE_ROUTES[pool.poolType] || '/pool'
    return `${baseRoute}/${pool.shareId}`
  }

  const getPoolTypeClass = (poolType: string) => {
    if (poolType === 'chaos_sealed' || poolType === 'chaos_draft') return 'type-chaos'
    if (poolType === 'rotisserie') return 'type-rotisserie'
    return 'type-default'
  }

  return (
    <div className="casual-page">
      <div className="casual-container">
        <h1>Casual Formats {hasBetaAccess && <span className="beta-badge">Beta</span>}</h1>
        <p className="casual-subtitle">Alternative limited formats for casual play</p>

        <div className="casual-modes-grid">
          {CASUAL_MODES.map((mode) => (
            <button
              key={mode.id}
              className={`casual-mode-card ${mode.comingSoon ? 'coming-soon' : ''} ${mode.artType ? `art-${mode.artType}` : ''} ${mode.glowColor ? `glow-${mode.glowColor}` : ''}`}
              onClick={() => handleModeSelect(mode)}
              disabled={mode.comingSoon}
            >
              {mode.cardArt && (
                <div
                  className="casual-mode-card-art"
                  style={{ backgroundImage: `url("${mode.cardArt}")` }}
                />
              )}
              <div className="casual-mode-card-content">
                <h3>{mode.name}</h3>
                <p>{mode.description}</p>
              </div>
              {mode.comingSoon && (
                <span className="coming-soon-badge">Coming Soon</span>
              )}
            </button>
          ))}
        </div>

        {isAuthenticated && (
          <div className="draft-history">
            <h2>My Casual Format Pools</h2>
            {historyLoading ? (
              <p className="history-loading">Loading...</p>
            ) : history.length === 0 ? (
              <p className="history-empty">No casual pools yet</p>
            ) : (
              <div className="history-list">
                {history.map((pool) => (
                  <div key={pool.id} className="history-item-wrapper">
                    <a
                      href={getPoolUrl(pool)}
                      className="history-item"
                      onClick={(e) => {
                        e.preventDefault()
                        router.push(getPoolUrl(pool))
                      }}
                    >
                      <div className="history-item-main">
                        <span className="history-set">{pool.name || pool.setName || pool.setCode}</span>
                        <span className={`history-type ${getPoolTypeClass(pool.poolType)}`}>
                          {POOL_TYPE_NAMES[pool.poolType] || pool.poolType}
                        </span>
                      </div>
                      <div className="history-item-meta">
                        <span className="history-date">{formatDate(pool.createdAt)}</span>
                      </div>
                    </a>
                    <button
                      className="draft-history-delete-button"
                      onClick={() => setDeleteConfirm({ shareId: pool.shareId, name: pool.name || pool.setName })}
                      title="Delete Pool"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
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
              <h2>Delete Pool?</h2>
              <p>Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.</p>
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
                  onClick={handleDeletePool}
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
