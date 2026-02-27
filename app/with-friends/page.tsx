// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../src/contexts/AuthContext'
import Button from '../../src/components/Button'
import '../draft/draft.css'
import '../formats/page.css'
import './with-friends.css'

const CARD_ART = {
  draft: 'https://cdn.starwarsunlimited.com//card_SWH_01_493_AT_ST_HYP_ff73b562a5.png',
  sealed: 'https://cdn.starwarsunlimited.com//card_0302421_EN_Mister_Bones_dcd95db084.png',
  chaosDraft: 'https://cdn.starwarsunlimited.com//card_0202428_EN_The_Chaos_of_War_248678061a.png',
}

interface HistoryPod {
  id: string
  shareId: string
  setCode: string
  setName: string
  status: string
  currentPlayers: number
  isHost: boolean
  createdAt: string
  completedAt?: string
  poolShareId?: string
  poolName?: string
  draftName?: string
  type: 'draft' | 'sealed'
}

export default function WithFriendsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const hasBetaAccess = user?.is_beta_tester || user?.is_admin
  const [history, setHistory] = useState<HistoryPod[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Fetch combined history
  useEffect(() => {
    if (!isAuthenticated) {
      setHistory([])
      return
    }

    const fetchHistory = async () => {
      setHistoryLoading(true)
      try {
        const [draftRes, sealedRes] = await Promise.all([
          fetch('/api/draft/history', { credentials: 'include' }),
          fetch('/api/sealed/history', { credentials: 'include' }),
        ])

        const combined: HistoryPod[] = []

        if (draftRes.ok) {
          const draftData = await draftRes.json()
          const pods = draftData.pods || []
          pods.forEach((pod: any) => {
            combined.push({
              id: pod.id,
              shareId: pod.shareId,
              setCode: pod.setCode,
              setName: pod.setName,
              status: pod.status,
              currentPlayers: pod.currentPlayers,
              isHost: pod.isHost,
              createdAt: pod.createdAt,
              completedAt: pod.completedAt,
              poolShareId: pod.poolShareId,
              draftName: pod.draftName,
              type: 'draft',
            })
          })
        }

        if (sealedRes.ok) {
          const sealedData = await sealedRes.json()
          const pods = sealedData.pods || []
          pods.forEach((pod: any) => {
            combined.push({
              id: pod.id,
              shareId: pod.shareId,
              setCode: pod.setCode,
              setName: pod.setName,
              status: pod.status,
              currentPlayers: pod.currentPlayers,
              isHost: pod.isHost,
              createdAt: pod.createdAt,
              completedAt: pod.completedAt,
              poolShareId: pod.poolShareId,
              poolName: pod.poolName,
              type: 'sealed',
            })
          })
        }

        // Sort by date descending
        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setHistory(combined.slice(0, 20))
      } catch (err) {
        console.error('Failed to fetch history:', err)
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchHistory()
  }, [isAuthenticated, user])

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
      if (pod.status === 'complete' && pod.poolShareId) {
        router.push(`/pool/${pod.poolShareId}/deck`)
      } else {
        router.push(`/sealed/${pod.shareId}`)
      }
    }
  }

  const getStatusBadge = (pod: HistoryPod) => {
    if (pod.status === 'waiting') return 'Waiting'
    if (pod.status === 'complete') return 'Complete'
    if (pod.status === 'leader_draft' || pod.status === 'pack_draft') return 'In Progress'
    return pod.status
  }

  return (
    <div className="with-friends-page">
      <div className="with-friends-container">
        <Button variant="back" onClick={() => router.push('/')}>
          Back
        </Button>
        <h1>With Friends</h1>
        <p className="with-friends-subtitle">Multiplayer limited formats</p>

        <div className="with-friends-modes-grid">
          <button
            className="format-mode-card art-unit"
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

          <button
            className="format-mode-card art-unit"
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
            className="format-mode-card art-event glow-red"
            onClick={() => router.push('/formats/chaos-draft')}
          >
            <div
              className="format-mode-card-art"
              style={{ backgroundImage: `url("${CARD_ART.chaosDraft}")` }}
            />
            <div className="format-mode-card-content">
              <h3>Chaos Draft</h3>
              <p>Draft with packs from 3 different sets</p>
            </div>
          </button>
        </div>

        {isAuthenticated && (
          <div className="draft-history">
            <h2>My Pods</h2>
            {historyLoading ? (
              <p className="history-loading">Loading...</p>
            ) : history.length === 0 ? (
              <p className="history-empty">No pods yet</p>
            ) : (
              <div className="history-list">
                {history.map((pod) => (
                  <a
                    key={`${pod.type}-${pod.id}`}
                    href="#"
                    className="history-item"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePodClick(pod)
                    }}
                  >
                    <div className="history-item-main">
                      <span className="history-set">
                        {pod.draftName || pod.poolName || pod.setName || pod.setCode}
                      </span>
                      <span className={`history-type ${pod.type === 'sealed' ? 'type-sealed' : 'type-default'}`}>
                        {pod.type === 'draft' ? 'Draft' : 'Sealed Pod'}
                      </span>
                      <span className={`history-status status-${pod.status}`}>
                        {getStatusBadge(pod)}
                      </span>
                    </div>
                    <div className="history-item-meta">
                      <span className="history-date">{formatDate(pod.createdAt)}</span>
                      <span className="history-players">{pod.currentPlayers} players</span>
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
