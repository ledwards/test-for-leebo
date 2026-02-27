// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../src/contexts/AuthContext'
import { usePublicPodsSocket } from '../../src/hooks/usePublicPodsSocket'
import Button from '../../src/components/Button'
import '../draft/draft.css'
import '../formats/page.css'
import './multiplayer.css'

const CARD_ART = {
  sealed: 'https://cdn.starwarsunlimited.com//card_04020336_EN_Close_the_Shield_Gate_54e600004d.png',
  draft: 'https://cdn.starwarsunlimited.com//card_SWH_01_465_Cunning_HYP_9c76fc00ac.png',
}

interface HistoryPod {
  id: string
  shareId: string
  setCode: string
  setName: string
  status: string
  currentPlayers: number
  maxPlayers?: number
  isHost: boolean
  createdAt: string
  completedAt?: string
  poolShareId?: string
  poolName?: string
  draftName?: string
  leaderName?: string
  baseName?: string
  mainDeckCount?: number
  type: 'draft' | 'sealed'
}

interface PublicPod {
  shareId: string
  podType: string
  setCode: string
  setName: string
  name: string | null
  maxPlayers: number
  currentPlayers: number
  host: {
    username: string
    avatarUrl: string
  }
  createdAt: string
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now()
  const created = new Date(dateString).getTime()
  const diffMs = now - created
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const hours = Math.floor(diffMin / 60)
  const mins = diffMin % 60
  return mins > 0 ? `${hours}h ${mins}m ago` : `${hours}h ago`
}

const CrownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD700" stroke="none">
    <path d="M2 20h20v2H2zM4 17h16l-2-9-4 4-2-6-2 6-4-4z"/>
  </svg>
)

export default function MultiplayerPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [history, setHistory] = useState<HistoryPod[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const publicPods = usePublicPodsSocket()

  // Fetch active pods (last 24 hours)
  const fetchHistory = async () => {
    if (!isAuthenticated) return
    setHistoryLoading(true)
    try {
      const [draftRes, sealedRes] = await Promise.all([
        fetch('/api/draft/history', { credentials: 'include' }),
        fetch('/api/sealed/history', { credentials: 'include' }),
      ])

      const combined: HistoryPod[] = []

      if (draftRes.ok) {
        const draftJson = await draftRes.json()
        const draftData = draftJson.data || draftJson
        const pods = draftData.pods || []
        pods.forEach((pod: any) => {
          combined.push({
            id: pod.id,
            shareId: pod.shareId,
            setCode: pod.setCode,
            setName: pod.setName,
            status: pod.status,
            currentPlayers: pod.currentPlayers,
            maxPlayers: pod.maxPlayers,
            isHost: pod.isHost,
            createdAt: pod.createdAt,
            completedAt: pod.completedAt,
            poolShareId: pod.poolShareId,
            draftName: pod.draftName,
            leaderName: pod.leaderName,
            baseName: pod.baseName,
            mainDeckCount: pod.mainDeckCount,
            type: 'draft',
          })
        })
      }

      if (sealedRes.ok) {
        const sealedJson = await sealedRes.json()
        const sealedData = sealedJson.data || sealedJson
        const pods = sealedData.pods || []
        pods.forEach((pod: any) => {
          combined.push({
            id: pod.id,
            shareId: pod.shareId,
            setCode: pod.setCode,
            setName: pod.setName,
            status: pod.status,
            currentPlayers: pod.currentPlayers,
            maxPlayers: pod.maxPlayers,
            isHost: pod.isHost,
            createdAt: pod.createdAt,
            completedAt: pod.completedAt,
            poolShareId: pod.poolShareId,
            poolName: pod.poolName,
            type: 'sealed',
          })
        })
      }

      // Sort by date descending, filter to last 24 hours
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
      const recent = combined.filter(p => new Date(p.createdAt).getTime() > oneDayAgo)
      setHistory(recent.slice(0, 20))
    } catch (err) {
      console.error('Failed to fetch history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    fetchHistory()
  }, [isAuthenticated, authLoading])

  // Poll for active pods every 10 seconds
  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    const interval = setInterval(fetchHistory, 10000)
    return () => clearInterval(interval)
  }, [isAuthenticated, authLoading])

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

  const handlePodClick = (pod: HistoryPod) => {
    if (pod.type === 'draft') {
      if (pod.status === 'complete' && pod.poolShareId) {
        router.push(`/pool/${pod.poolShareId}/deck`)
      } else {
        router.push(`/draft/${pod.shareId}`)
      }
    } else {
      // Sealed pods always go through the sealed page (pack opening flow)
      router.push(`/sealed/${pod.shareId}`)
    }
  }

  const getDisplayStatus = (pod: HistoryPod): string => {
    switch (pod.status) {
      case 'waiting': return 'setup'
      case 'leader_draft':
      case 'pack_draft': return 'drafting'
      case 'complete':
        return (!!pod.leaderName && !!pod.baseName && (pod.mainDeckCount || 0) >= 30)
          ? 'playing' : 'deckbuilding'
      default: return pod.status
    }
  }

  const DISPLAY_STATUS_LABELS: Record<string, string> = {
    setup: 'Setup',
    drafting: 'Drafting',
    deckbuilding: 'Deckbuilding',
    playing: 'Playing',
  }

  const livePods = history.filter(p => getDisplayStatus(p) !== 'playing')
  const completedPods = history.filter(p => getDisplayStatus(p) === 'playing')

  const handleDeletePod = async (e: React.MouseEvent, pod: HistoryPod) => {
    e.stopPropagation()
    const endpoint = pod.type === 'draft'
      ? `/api/draft/${pod.shareId}`
      : `/api/sealed/${pod.shareId}`
    try {
      const res = await fetch(endpoint, { method: 'DELETE', credentials: 'include' })
      if (res.ok) {
        setHistory(prev => prev.filter(p => !(p.type === pod.type && p.id === pod.id)))
      }
    } catch (err) {
      console.error('Failed to delete pod:', err)
    }
  }

  const handleLeavePod = async (e: React.MouseEvent, pod: HistoryPod) => {
    e.stopPropagation()
    const endpoint = pod.type === 'draft'
      ? `/api/draft/${pod.shareId}/leave`
      : `/api/sealed/${pod.shareId}/leave`
    try {
      const res = await fetch(endpoint, { method: 'POST', credentials: 'include' })
      if (res.ok) {
        setHistory(prev => prev.filter(p => !(p.type === pod.type && p.id === pod.id)))
      }
    } catch (err) {
      console.error('Failed to leave pod:', err)
    }
  }

  const handleLogin = () => {
    window.location.href = `/api/auth/signin/discord?return_to=${encodeURIComponent('/multiplayer')}`
  }

  const renderPodList = (pods: HistoryPod[]) => (
    <div className="history-list">
      {pods.map((pod) => (
        <div
          key={`${pod.type}-${pod.id}`}
          className="history-item"
          role="button"
          tabIndex={0}
          onClick={() => handlePodClick(pod)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePodClick(pod) }}
        >
          <div className="history-item-main">
            <span className="history-set">
              {pod.draftName || pod.poolName || pod.setName || pod.setCode}
            </span>
            <span className={`history-type ${pod.type === 'sealed' ? 'type-sealed' : 'type-default'}`}>
              {pod.type === 'draft' ? 'Draft' : 'Sealed'}
            </span>
            {pod.isHost && (
              <span className="history-host-badge">Host</span>
            )}
            <span className={`history-status status-${getDisplayStatus(pod)}`}>
              {DISPLAY_STATUS_LABELS[getDisplayStatus(pod)] || pod.status}
            </span>
          </div>
          <div className="history-item-meta">
            <span className="history-date">{formatDate(pod.createdAt)} · {pod.currentPlayers}/{pod.maxPlayers || 8} players</span>
            <div className="history-item-links" onClick={(e) => e.stopPropagation()}>
              {pod.poolShareId && (
                <Button variant="icon" size="sm" title="View Deck" onClick={() => router.push(`/pool/${pod.poolShareId}/deck`)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="14" height="18" rx="2"></rect>
                    <rect x="8" y="1" width="14" height="18" rx="2"></rect>
                  </svg>
                </Button>
              )}
              {pod.type === 'draft' && pod.status === 'complete' && (
                <Button variant="icon" size="sm" title="Draft Log" onClick={() => router.push(`/draft/${pod.shareId}/log`)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </Button>
              )}
              {pod.isHost ? (
                <Button variant="icon" size="sm" className="history-delete-btn" title="Delete Pod" onClick={(e) => handleDeletePod(e, pod)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </Button>
              ) : pod.status === 'waiting' && (
                <Button variant="icon" size="sm" className="history-leave-btn" title="Leave Pod" onClick={(e) => handleLeavePod(e, pod)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="multiplayer-page">
      <div className="multiplayer-container">
        <div className="page-back-left">
          <Button variant="back" onClick={() => router.push('/')}>
            Back
          </Button>
        </div>
        <h1>Live Pod</h1>
        <p className="multiplayer-subtitle">Play live with friends</p>

        <div className="multiplayer-modes-grid">
          <button
            className="format-mode-card art-event"
            onClick={() => router.push('/sealed/new')}
          >
            <div
              className="format-mode-card-art"
              style={{ backgroundImage: `url("${CARD_ART.sealed}")` }}
            />
            <div className="format-mode-card-content">
              <h3>Sealed</h3>
              <p>Open 6 packs, build and play</p>
            </div>
          </button>

          <button
            className="format-mode-card art-event draft-art-offset"
            onClick={() => router.push('/draft')}
          >
            <div
              className="format-mode-card-art"
              style={{ backgroundImage: `url("${CARD_ART.draft}")` }}
            />
            <div className="format-mode-card-content">
              <h3>Draft</h3>
              <p>8-player booster draft</p>
            </div>
          </button>
        </div>

        {publicPods.length > 0 && (
          <div className="draft-history public-pods-section">
            <h2>Join a Pod</h2>
            <div className="history-list">
              {publicPods.map((pod) => (
                <div
                  key={`public-${pod.shareId}`}
                  className="history-item"
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(pod.podType === 'sealed' ? `/sealed/${pod.shareId}` : `/draft/${pod.shareId}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      router.push(pod.podType === 'sealed' ? `/sealed/${pod.shareId}` : `/draft/${pod.shareId}`)
                    }
                  }}
                >
                  <div className="history-item-main">
                    <span className="history-set">{pod.name || pod.setName}</span>
                    <span className={`history-type ${pod.podType === 'sealed' ? 'type-sealed' : 'type-default'}`}>
                      {pod.podType === 'draft' ? 'Draft' : 'Sealed'}
                    </span>
                    <span className="history-status status-setup">Open</span>
                  </div>
                  <div className="history-item-meta">
                    <span className="history-date">
                      <CrownIcon /> {pod.host.username} · {pod.currentPlayers}/{pod.maxPlayers} players · Created {formatRelativeTime(pod.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="draft-history">
          <h2>Your Active Pods</h2>
          {authLoading ? (
            <p className="history-loading">Loading...</p>
          ) : !isAuthenticated ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <p className="history-loading" style={{ marginBottom: '1rem' }}>Log in to see your pods</p>
              <Button variant="primary" onClick={handleLogin}>
                Login with Discord
              </Button>
            </div>
          ) : historyLoading ? (
            <p className="history-loading">Loading...</p>
          ) : livePods.length === 0 ? (
            <p className="history-loading">No active pods</p>
          ) : renderPodList(livePods)}
        </div>

        {isAuthenticated && !authLoading && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => router.push('/history')}>
              More
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
