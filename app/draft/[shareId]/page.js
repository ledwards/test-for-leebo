'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useDraftSync } from '../../../src/hooks/useDraftSync'
import { joinDraft, leaveDraft, startDraft, randomizeSeats, makePick, updateSettings } from '../../../src/utils/draftApi'
import DraftLobby from '../../../src/components/DraftLobby'
import LeaderDraftPhase from '../../../src/components/LeaderDraftPhase'
import PackDraftPhase from '../../../src/components/PackDraftPhase'
import '../../../src/App.css'
import '../draft.css'

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
  const [actionLoading, setActionLoading] = useState(false)
  const [showOpponentTooltip, setShowOpponentTooltip] = useState(false)

  // Get shareId from params
  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      setShareId(resolvedParams.shareId)
    }
    getParams()
  }, [params])

  // Use draft sync hook
  const {
    draft,
    loading,
    error: syncError,
    forcePoll,
    isHost,
    isPlayer,
    players,
    myPlayer,
    draftState,
    status,
  } = useDraftSync(shareId, { enabled: !!shareId && isAuthenticated })

  // Auto-join on load if authenticated and not already in draft
  useEffect(() => {
    if (!shareId || !isAuthenticated || loading || isPlayer || status !== 'waiting') return

    const autoJoin = async () => {
      try {
        await joinDraft(shareId)
        await forcePoll()
      } catch (err) {
        // Ignore "already in draft" errors
        if (!err.message.includes('Already in draft')) {
          console.error('Failed to auto-join:', err)
        }
      }
    }

    autoJoin()
  }, [shareId, isAuthenticated, loading, isPlayer, status, forcePoll])

  const handleLeave = async () => {
    if (actionLoading) return
    setActionLoading(true)
    try {
      await leaveDraft(shareId)
      router.push('/draft')
    } catch (err) {
      setError(err.message)
      setActionLoading(false)
    }
  }

  const handleStart = async () => {
    if (actionLoading) return
    setActionLoading(true)
    setError(null)
    try {
      await startDraft(shareId)
      await forcePoll()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRandomize = async () => {
    if (actionLoading) return
    setActionLoading(true)
    try {
      await randomizeSeats(shareId)
      await forcePoll()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleTimedChange = async (timed) => {
    if (actionLoading) return
    setActionLoading(true)
    try {
      await updateSettings(shareId, { timed })
      await forcePoll()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddBot = async () => {
    if (actionLoading) return
    setActionLoading(true)
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
      await forcePoll()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handlePick = async (cardId) => {
    if (actionLoading) return
    setActionLoading(true)
    setError(null)
    try {
      await makePick(shareId, cardId)
      await forcePoll()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/draft')
  }

  const handleBuildDeck = async () => {
    if (actionLoading) return
    setActionLoading(true)
    setError(null)
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
      } else {
        throw new Error('No pool ID returned')
      }
    } catch (err) {
      setError(err.message)
      setActionLoading(false)
    }
  }

  // Loading state
  if (authLoading || !shareId || loading) {
    return (
      <div className="app draft-page-bg">
        <div className="loading-container">
          <div className="loading"></div>
        </div>
      </div>
    )
  }

  // Auth required
  if (!isAuthenticated) {
    return (
      <div className="app draft-page-bg">
        <div className="login-required">
          <h2>Sign In Required</h2>
          <p>Please sign in to join this draft</p>
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
        </div>
      </div>
    )
  }

  // Error state
  if (syncError && !draft) {
    return (
      <div className="app draft-page-bg">
        <div className="error-container">
          <h2>Error</h2>
          <p>{syncError}</p>
          <button className="primary-button" onClick={handleBack}>
            Back to Draft
          </button>
        </div>
      </div>
    )
  }

  // Draft not found
  if (!draft) {
    return (
      <div className="app draft-page-bg">
        <div className="error-container">
          <h2>Draft Not Found</h2>
          <p>This draft may have been deleted or the code is incorrect.</p>
          <button className="primary-button" onClick={handleBack}>
            Back to Draft
          </button>
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
          onTimedChange={handleTimedChange}
          onLeave={handleLeave}
          loading={actionLoading}
          error={error}
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
            onPick={handlePick}
            loading={actionLoading}
            error={error}
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
            onPick={handlePick}
            loading={actionLoading}
            error={error}
          />
        )
      }
    }

    if (status === 'complete') {
      // Calculate first opponent
      let firstOpponent = null
      let hasBye = false

      if (myPlayer && players.length > 0) {
        const isOddNumber = players.length % 2 === 1
        const organizer = players.find(p => p.isHost)

        if (isOddNumber && organizer?.id === myPlayer.id) {
          // I am the organizer and there's an odd number - I get the bye
          hasBye = true
        } else {
          // Find my position in the player list
          const myIndex = players.findIndex(p => p.id === myPlayer.id)

          if (myIndex !== -1) {
            // Create array for distance calculation
            let playersForPairing = [...players]

            // Remove organizer from pairing if odd number
            if (isOddNumber && organizer) {
              playersForPairing = playersForPairing.filter(p => p.id !== organizer.id)
            }

            // Find my new index after potential organizer removal
            const myNewIndex = playersForPairing.findIndex(p => p.id === myPlayer.id)

            if (myNewIndex !== -1) {
              // Calculate opposite player (furthest distance in array)
              const halfLength = playersForPairing.length / 2
              const opponentIndex = (myNewIndex + Math.floor(halfLength)) % playersForPairing.length
              firstOpponent = playersForPairing[opponentIndex]
            }
          }
        }
      }

      return (
        <div className="draft-complete">
          <h2>Draft Complete!</h2>
          <p>The draft has finished. Build your deck from your drafted cards.</p>



          {hasBye && (
            <div className="first-opponent-info">
              <h3>First Round</h3>
              <p className="bye-message">You have a bye this round (organizer privilege for odd-numbered pods).</p>
            </div>
          )}

          {!hasBye && firstOpponent && (
            <div className="first-opponent-info">
              <h3>What's Next?</h3>
              <div className="opponent-display">
                <div className="opponent-avatar-container">
                  {firstOpponent.avatarUrl ? (
                    <img
                      src={firstOpponent.avatarUrl}
                      alt={firstOpponent.username}
                      className="opponent-avatar"
                    />
                  ) : (
                    <div className="opponent-avatar-placeholder">
                      {firstOpponent.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span className="opponent-name">{firstOpponent.username || 'Unknown Player'}</span>
                </div>
                <div className="opponent-instructions">
                  <ol className="instructions-steps">
                    <li>Reach out to <strong>{firstOpponent.username || 'your opponent'}</strong> on Discord</li>
                    <li>Review your pool and build your deck.</li>
                    <li>Copy the JSON or export the deck to SWUDB.com</li>
                    <li>You or {firstOpponent.username || 'your opponent'} starts a game on Karabast.net. You each use your draft decks (no cheating)</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          <button className="primary-button" onClick={handleBuildDeck}>
            Review Pool
          </button>
        </div>
      )
    }

    return <div className="loading"></div>
  }

  return (
    <div className="app draft-page-bg">
      {draft.setArtUrl && (
        <div
          className="set-art-header"
          style={{ backgroundImage: `url("${draft.setArtUrl}")` }}
        ></div>
      )}
      <div className="draft-room-content">
        <div className="draft-room">
          <div className="draft-header">
            <button className="back-button" onClick={handleBack}>
              ← Back
            </button>
            <h1>{draft.setName || draft.setCode} Draft</h1>
            <div className="draft-status">
              <span className={`status-badge ${status}`}>
                {status === 'waiting' ? 'Lobby' : status === 'active' ? 'Drafting' : 'Complete'}
              </span>
            </div>
          </div>

          <div className="draft-main">
            <div className="draft-content">
              {error && <div className="error-message">{error}</div>}
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
