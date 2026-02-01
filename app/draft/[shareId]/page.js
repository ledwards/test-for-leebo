'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useDraftSocket } from '../../../src/hooks/useDraftSocket'
import { joinDraft, leaveDraft, startDraft, randomizeSeats, makePick, selectCard, updateSettings, togglePause } from '../../../src/utils/draftApi'
import DraftLobby from '../../../src/components/DraftLobby'
import LeaderDraftPhase from '../../../src/components/LeaderDraftPhase'
import PackDraftPhase from '../../../src/components/PackDraftPhase'
import { getPackArtUrl } from '../../../src/utils/packArt'
import '../../../src/App.css'
import '../draft.css'
import '../../../src/components/SealedPod.css'

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
)

export default function DraftRoomPage({ params }) {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [shareId, setShareId] = useState(null)
  const [error, setError] = useState(null)
  const [startingDraft, setStartingDraft] = useState(false)
  const [randomizing, setRandomizing] = useState(false)
  const [addingBot, setAddingBot] = useState(false)
  const [changingSettings, setChangingSettings] = useState(false)
  const [picking, setPicking] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [togglingPause, setTogglingPause] = useState(false)
  const [showOpponentTooltip, setShowOpponentTooltip] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  // Get shareId from params
  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      setShareId(resolvedParams.shareId)
    }
    getParams()
  }, [params])

  // Use draft SSE hook for real-time updates
  const {
    draft,
    loading,
    error: syncError,
    deleted,
    refresh,
    isHost,
    isPlayer,
    players,
    myPlayer,
    draftState,
    status,
  } = useDraftSocket(shareId, { enabled: !!shareId && isAuthenticated })

  // Redirect if draft was deleted
  useEffect(() => {
    if (deleted) {
      router.push('/draft')
    }
  }, [deleted, router])

  // Redirect to deck builder when draft completes
  useEffect(() => {
    if (status === 'complete' && shareId) {
      const buildDeck = async () => {
        try {
          const response = await fetch(`/api/draft/${shareId}/pool`, {
            credentials: 'include',
          })
          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || 'Failed to create pool')
          }
          const data = await response.json()
          const poolShareId = data.data?.poolShareId
          if (poolShareId) {
            router.push(`/pool/${poolShareId}`)
          }
        } catch (err) {
          setError(err.message)
        }
      }
      buildDeck()
    }
  }, [status, shareId, router])

  // Auto-join on load if authenticated and not already in draft
  useEffect(() => {
    if (!shareId || !isAuthenticated || loading || isPlayer || status !== 'waiting') return

    const autoJoin = async () => {
      try {
        await joinDraft(shareId)
        await refresh()
      } catch (err) {
        // Ignore "already in draft" errors
        if (!err.message.includes('Already in draft')) {
          console.error('Failed to auto-join:', err)
        }
      }
    }

    autoJoin()
  }, [shareId, isAuthenticated, loading, isPlayer, status, refresh])

  const handleLeave = async () => {
    try {
      await leaveDraft(shareId)
      router.push('/draft')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleStart = async () => {
    if (startingDraft) return
    setStartingDraft(true)
    setError(null)
    try {
      await startDraft(shareId)
      // WebSocket broadcast will update state
    } catch (err) {
      setError(err.message)
    } finally {
      setStartingDraft(false)
    }
  }

  const handleRandomize = async () => {
    if (randomizing) return
    setRandomizing(true)
    try {
      await randomizeSeats(shareId)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setRandomizing(false)
    }
  }

  const handleSettingsChange = async (settings) => {
    if (changingSettings) return
    setChangingSettings(true)
    try {
      await updateSettings(shareId, settings)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setChangingSettings(false)
    }
  }

  const handleAddBot = async () => {
    if (addingBot) return
    setAddingBot(true)
    setError(null)
    try {
      const response = await fetch(`/api/draft/${shareId}/dev/add-bots?count=1`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to add bot')
      }
      // WebSocket broadcast will update players list
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingBot(false)
    }
  }

  const handlePick = async (cardId) => {
    if (picking) return
    setPicking(true)
    setError(null)
    try {
      await makePick(shareId, cardId)
      // WebSocket broadcast will update state
    } catch (err) {
      setError(err.message)
    } finally {
      setPicking(false)
    }
  }

  const handleSelect = async (cardId) => {
    if (selecting) return
    setSelecting(true)
    setError(null)
    try {
      const result = await selectCard(shareId, cardId)
      // Handle state changed response (409) - refresh data silently
      if (result?.stateChanged) {
        await refresh()
        return
      }
      // Refresh to ensure state updates
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setSelecting(false)
    }
  }

  const handleBack = () => {
    router.push('/draft')
  }

  const handleCancelDraft = async () => {
    if (!shareId) return
    setIsCancelling(true)
    try {
      const response = await fetch(`/api/draft/${shareId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (response.ok) {
        router.push('/draft')
      } else {
        console.error('Failed to cancel draft')
        setIsCancelling(false)
        setShowCancelConfirm(false)
      }
    } catch (err) {
      console.error('Failed to cancel draft:', err)
      setIsCancelling(false)
      setShowCancelConfirm(false)
    }
  }

  const handleTogglePause = async () => {
    if (togglingPause) return
    setTogglingPause(true)
    setError(null)
    try {
      await togglePause(shareId)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setTogglingPause(false)
    }
  }

  // Loading auth state
  if (authLoading || !shareId) {
    return (
      <div className="draft-page-bg">
        <div className="loading-container">
          <div className="loading"></div>
        </div>
      </div>
    )
  }

  // Auth required - check before SSE loading since SSE is disabled when not authenticated
  if (!isAuthenticated) {
    // Redirect to Discord auth with return URL
    const returnUrl = encodeURIComponent(`/draft/${shareId}`)
    return (
      <div className="draft-page-bg">
        <div className="login-required">
          <h2>Sign In Required</h2>
          <p>Please sign in to join this draft</p>
          <a href={`/api/auth/discord?returnUrl=${returnUrl}`} className="discord-login-button">
            Sign in with Discord
          </a>
        </div>
      </div>
    )
  }

  // Loading draft data
  if (loading) {
    return (
      <div className="draft-page-bg">
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading draft...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (syncError && !draft) {
    return (
      <div className="draft-page-bg">
        <div className="error-container">
          <h2>Error</h2>
          <p>{syncError}</p>
        </div>
      </div>
    )
  }

  // Draft not found
  if (!draft) {
    return (
      <div className="draft-page-bg">
        <div className="error-container">
          <h2>Draft Not Found</h2>
          <p>This draft may have been deleted or the code is incorrect.</p>
        </div>
      </div>
    )
  }

  // Render based on status
  const renderContent = () => {
    if (status === 'waiting') {
      return (
        <DraftLobby
          draft={draft}
          players={players}
          isHost={isHost}
          isPlayer={isPlayer}
          onStart={handleStart}
          onRandomize={handleRandomize}
          onAddBot={handleAddBot}
          onSettingsChange={handleSettingsChange}
          onLeave={handleLeave}
          startingDraft={startingDraft}
          randomizing={randomizing}
          addingBot={addingBot}
          error={error}
          shareId={shareId}
        />
      )
    }

    if (status === 'active') {
      const phase = draftState?.phase

      if (phase === 'leader_draft') {
        return (
          <LeaderDraftPhase
            draft={draft}
            players={players}
            myPlayer={myPlayer}
            draftState={draftState}
            onSelect={handleSelect}
            loading={selecting}
            error={error}
            isHost={isHost}
            onTogglePause={handleTogglePause}
            shareId={shareId}
            onTimerExpire={refresh}
          />
        )
      }

      if (phase === 'pack_draft') {
        return (
          <PackDraftPhase
            draft={draft}
            players={players}
            myPlayer={myPlayer}
            draftState={draftState}
            onSelect={handleSelect}
            loading={selecting}
            error={error}
            isHost={isHost}
            onTogglePause={handleTogglePause}
            shareId={shareId}
            onTimerExpire={refresh}
          />
        )
      }
    }

    if (status === 'complete') {
      // useEffect will handle redirect to deck builder
      return <div className="loading"></div>
    }

    return <div className="loading"></div>
  }

  const packArtUrl = draft?.setArtUrl || (draft?.setCode ? getPackArtUrl(draft.setCode) : null)

  const setArtStyle = packArtUrl ? {
    backgroundImage: `url("${packArtUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
  } : {}

  return (
    <div className="sealed-pod">
      {packArtUrl && (
        <div className="set-art-header" style={setArtStyle}></div>
      )}
      <div className="sealed-pod-content">
        <div className="draft-room">
          <div className="draft-header">
              <div className="draft-header-center">
              <div className="draft-title-row">
                <h1>{draft.setName || draft.setCode} Draft</h1>
              </div>
              {status === 'active' && draftState?.phase === 'leader_draft' && (
                <span className="draft-round-info">Leader Drafting Phase</span>
              )}
              {status === 'active' && draftState?.phase === 'pack_draft' && (
                <span className="draft-round-info">Drafting Phase</span>
              )}
            </div>
          </div>

          <div className="draft-main">
            <div className="draft-content">
              {error && <div className="error-message">{error}</div>}
              {renderContent()}
            </div>
          </div>

          {/* Cancel Draft Button - bottom center during active phases */}
          {isHost && status === 'active' && (
            <div className="draft-cancel-section">
              <button
                className="draft-cancel-button"
                onClick={() => setShowCancelConfirm(true)}
                disabled={isCancelling}
              >
                Cancel Draft
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="draft-cancel-overlay" onClick={() => setShowCancelConfirm(false)}>
          <div className="draft-cancel-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Cancel Draft?</h2>
            <p>Are you sure you want to cancel this draft? All players will lose their progress and this action cannot be undone.</p>
            <div className="draft-cancel-buttons">
              <button
                className="draft-cancel-back"
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
              >
                Go Back
              </button>
              <button
                className="draft-cancel-confirm"
                onClick={handleCancelDraft}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
