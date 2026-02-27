// @ts-nocheck
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useSealedPodSocket } from '../../../src/hooks/useSealedPodSocket'
import { usePresence } from '../../../src/hooks/usePresence'
import { getPackArtUrl, getPackImageUrl } from '../../../src/utils/packArt'
import { loadPool } from '../../../src/utils/poolApi'
import SealedPodLobby from '../../../src/components/SealedPodLobby'
import PackOpeningAnimation from '../../../src/components/PackOpeningAnimation'
import SealedPod from '../../../src/components/SealedPod'
import Button from '../../../src/components/Button'
import '../../../src/App.css'
import '../../draft/draft.css'
import '../../draft/[shareId]/pod/pod.css'

interface PageProps {
  params: Promise<{ shareId: string }>
}

// Post-start phases: animation → pool review → deckbuilder
type PostStartPhase = 'animation' | 'pool-review'

export default function SealedPodPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  usePresence(user?.id)
  const [shareId, setShareId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  // Post-start state
  const [postStartPhase, setPostStartPhase] = useState<PostStartPhase | null>(null)
  const [poolShareId, setPoolShareId] = useState<string | null>(null)
  const [poolData, setPoolData] = useState<any>(null)
  const [poolLoading, setPoolLoading] = useState(false)

  useEffect(() => {
    setShareId(resolvedParams.shareId)
  }, [resolvedParams])

  const {
    pod,
    loading,
    error: syncError,
    deleted,
    refresh,
  } = useSealedPodSocket(shareId, { enabled: !!shareId && isAuthenticated })

  // Redirect if pod was deleted
  useEffect(() => {
    if (deleted) {
      router.push('/multiplayer')
    }
  }, [deleted, router])

  // When pod completes, fetch pool data and start the animation flow
  useEffect(() => {
    if (pod?.status === 'complete' && shareId && !postStartPhase && !poolShareId) {
      const fetchPool = async () => {
        try {
          setPoolLoading(true)
          const poolRes = await fetch(`/api/sealed/${shareId}/pool`, {
            credentials: 'include',
          })
          if (!poolRes.ok) return
          const poolJson = await poolRes.json()
          const pShareId = (poolJson.data || poolJson).poolShareId
          if (pShareId) {
            setPoolShareId(pShareId)
            // Load the full pool data for animation and review
            const pool = await loadPool(pShareId)
            setPoolData(pool)
            setPostStartPhase('animation')
          }
        } catch (err) {
          console.error('Failed to get pool:', err)
        } finally {
          setPoolLoading(false)
        }
      }
      fetchPool()
    }
  }, [pod?.status, shareId, postStartPhase, poolShareId])

  // Auto-join on load if authenticated and not already in pod
  useEffect(() => {
    if (!shareId || !isAuthenticated || loading || pod?.isPlayer || pod?.status !== 'waiting') return

    const autoJoin = async () => {
      try {
        await fetch(`/api/sealed/${shareId}/join`, {
          method: 'POST',
          credentials: 'include',
        })
        await refresh()
      } catch (err) {
        console.error('Failed to auto-join:', err)
      }
    }

    autoJoin()
  }, [shareId, isAuthenticated, loading, pod?.isPlayer, pod?.status, refresh])

  const handleStart = async () => {
    if (!shareId || starting) return
    setStarting(true)
    setError(null)
    try {
      const response = await fetch(`/api/sealed/${shareId}/start`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to start')
      }
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start')
      setStarting(false)
    }
  }

  const handleLeave = async () => {
    if (!shareId) return
    try {
      await fetch(`/api/sealed/${shareId}/leave`, {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/multiplayer')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave')
    }
  }

  const handleCancel = async () => {
    if (!shareId) return
    try {
      const response = await fetch(`/api/sealed/${shareId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to cancel pod')
      }
      router.push('/multiplayer')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel pod')
    }
  }

  const handleSettingsChange = async (settings: Record<string, unknown>) => {
    if (!shareId) return
    try {
      await fetch(`/api/sealed/${shareId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      })
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
    }
  }

  const handleRemovePlayer = async (userId: string) => {
    if (!shareId) return
    try {
      await fetch(`/api/sealed/${shareId}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      })
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove player')
    }
  }

  const handleLogin = () => {
    const returnUrl = encodeURIComponent(`/sealed/${shareId}`)
    window.location.href = `/api/auth/signin/discord?return_to=${returnUrl}`
  }

  if (authLoading) {
    return (
      <div className="draft-page-bg">
        <div className="loading"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="draft-page-bg">
        <div className="auth-prompt-container">
          <h2>Login Required</h2>
          <p>Join this sealed pod by logging in with Discord.</p>
          <button className="primary-button" onClick={handleLogin}>
            Login with Discord
          </button>
          <Button variant="back" onClick={() => router.push('/')}>
            Back
          </Button>
        </div>
      </div>
    )
  }

  if (loading || poolLoading) {
    return (
      <div className="draft-page-bg">
        <div className="loading"></div>
      </div>
    )
  }

  if (syncError && !pod) {
    return (
      <div className="draft-page-bg">
        <div className="error-container">
          <h2>Error</h2>
          <p>{syncError}</p>
          <Button variant="back" onClick={() => router.push('/multiplayer')}>
            Back
          </Button>
        </div>
      </div>
    )
  }

  if (!pod) return null

  // Phase: Pack Opening Animation
  if (postStartPhase === 'animation' && poolData) {
    const packs = poolData.packs && poolData.packs.length > 0
      ? poolData.packs
      : poolData.cards ? [{ cards: poolData.cards }] : null

    return (
      <div className="app">
        <PackOpeningAnimation
          packCount={packs?.length || 6}
          packImageUrl={getPackImageUrl(pod.setCode)}
          packs={packs}
          onComplete={() => setPostStartPhase('pool-review')}
          setCode={pod.setCode}
        />
      </div>
    )
  }

  // Phase: Pool Review
  if (postStartPhase === 'pool-review' && poolData) {
    const packs = poolData.packs && poolData.packs.length > 0
      ? poolData.packs
      : poolData.cards ? [{ cards: poolData.cards }] : null

    const getPoolName = () => {
      if (poolData.deckBuilderState) {
        const state = typeof poolData.deckBuilderState === 'string'
          ? JSON.parse(poolData.deckBuilderState)
          : poolData.deckBuilderState
        if (state.poolName) return state.poolName
      }
      return poolData.name || null
    }

    return (
      <div className="app">
        <SealedPod
          setCode={poolData.setCode}
          setName={poolData.setName}
          poolType="sealed"
          poolName={getPoolName()}
          createdAt={poolData.createdAt}
          onBack={() => router.push('/multiplayer')}
          onBuildDeck={() => {
            router.push(`/pool/${poolShareId}/deck`)
          }}
          initialPacks={packs}
          shareId={poolData.shareId}
          isLoading={false}
          poolOwnerId={poolData.owner?.id || poolData.userId}
        />
      </div>
    )
  }

  const packArtUrl = getPackArtUrl(pod.setCode)

  // Phase: Lobby (waiting for players / host to start)
  return (
    <div className="pod-page">
      {packArtUrl && (
        <div className="set-art-header" style={{
          backgroundImage: `url("${packArtUrl}")`,
        }}></div>
      )}

      <div className="pod-content">
        <SealedPodLobby
          setName={pod.setName}
          podName={pod.name}
          shareId={pod.shareId}
          players={pod.players}
          isHost={pod.isHost}
          isPlayer={pod.isPlayer}
          currentUserId={user?.id}
          hostId={pod?.host?.id}
          maxPlayers={pod?.maxPlayers}
          isPublic={pod?.isPublic}
          onStart={handleStart}
          onLeave={handleLeave}
          onCancel={handleCancel}
          onBack={() => router.push('/multiplayer')}
          onRemovePlayer={handleRemovePlayer}
          onSettingsChange={handleSettingsChange}
          onRenamePod={(name) => handleSettingsChange({ name })}
          starting={starting}
          error={error || syncError}
        />
      </div>
    </div>
  )
}
