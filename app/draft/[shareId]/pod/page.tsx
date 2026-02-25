// @ts-nocheck
'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { getPackArtUrl } from '../../../../src/utils/packArt'
import { useAuth } from '../../../../src/contexts/AuthContext'
import { usePodSocket } from '../../../../src/hooks/usePodSocket'
import Button from '../../../../src/components/Button'
import '../../../../src/App.css'
import './pod.css'

interface PageProps {
  params: Promise<{ shareId: string }>
}

const DISCORD_INVITE_URL = 'https://discord.gg/VcYkfGnSZH'

export default function PodPage({ params }: PageProps) {
  const { shareId } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const { podData, loading, error } = usePodSocket(shareId)

  if (loading) {
    return (
      <div className="pod-page">
        <div className="pod-loading">
          <p>Loading pod...</p>
        </div>
      </div>
    )
  }

  if (error || !podData) {
    return (
      <div className="pod-page">
        <div className="pod-error">
          <h2>Could not load pod</h2>
          <p>{error || 'Pod data not available'}</p>
          <Button variant="secondary" onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  const { draft, players, pairings, myOpponent, myBye, isHost, myPoolShareId } = podData
  const packArtUrl = getPackArtUrl(draft.setCode)

  // Build player ID -> poolShareId lookup for owner view links
  const playerPoolMap = new Map(players.map(p => [p.id, p.poolShareId]))

  const handleEditDeck = () => {
    if (myPoolShareId) {
      router.push(`/pool/${myPoolShareId}/deck`)
    }
  }

  const handleViewPlay = () => {
    if (myPoolShareId) {
      router.push(`/pool/${myPoolShareId}/deck/play`)
    }
  }

  const copyDeckUrl = async () => {
    if (!myPoolShareId) return
    const url = `${window.location.origin}/pool/${myPoolShareId}/deck/play`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // fallback: do nothing
    }
  }

  return (
    <div className="pod-page">
      {packArtUrl && (
        <div className="set-art-header" style={{
          backgroundImage: `url("${packArtUrl}")`,
        }}></div>
      )}

      <div className="pod-content">
        <button className="pod-back-button" onClick={handleEditDeck} disabled={!myPoolShareId}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Edit Deck
        </button>

        <div className="pod-header">
          <h1>{draft.setName || 'Draft'}</h1>
          <p className="pod-pool-type">Draft Pod</p>
        </div>

        {/* Owner view: Pod Status with all matches */}
        {isHost && (
          <div className="pod-status-section">
            <h2>Pod Status</h2>
            {pairings.matches.map((match, idx) => (
              <div key={idx} className="pod-match">
                <div className="pod-match-player">
                  {match.player1.avatarUrl && (
                    <img src={match.player1.avatarUrl} alt="" className="pod-match-avatar" />
                  )}
                  <span className="pod-match-name">{match.player1.username}</span>
                  <span className={`pod-status-badge ${match.player1.isReady ? 'ready' : 'building'}`}>
                    {match.player1.isReady ? 'Ready' : 'Building'}
                  </span>
                </div>
                <span className="pod-match-vs">vs</span>
                <div className="pod-match-player right">
                  {match.player2.avatarUrl && (
                    <img src={match.player2.avatarUrl} alt="" className="pod-match-avatar" />
                  )}
                  <span className="pod-match-name">{match.player2.username}</span>
                  <span className={`pod-status-badge ${match.player2.isReady ? 'ready' : 'building'}`}>
                    {match.player2.isReady ? 'Ready' : 'Building'}
                  </span>
                </div>
                <div className="pod-match-actions">
                  {playerPoolMap.get(match.player1.id) && (
                    <a href={`/pool/${playerPoolMap.get(match.player1.id)}/deck/play`} target="_blank" rel="noopener noreferrer" className="pod-view-link">{match.player1.username}</a>
                  )}
                  {playerPoolMap.get(match.player2.id) && (
                    <a href={`/pool/${playerPoolMap.get(match.player2.id)}/deck/play`} target="_blank" rel="noopener noreferrer" className="pod-view-link">{match.player2.username}</a>
                  )}
                </div>
              </div>
            ))}
            {pairings.byePlayer && (
              <div className="pod-match-bye">
                {pairings.byePlayer.username} has a bye this round
              </div>
            )}
          </div>
        )}

        {/* Player view: Your opponent */}
        <div className="pod-opponent-card">
          <h2>Your Opponent</h2>
          {myBye ? (
            <p className="pod-bye-message">You have a bye this round. Take a break or practice!</p>
          ) : myOpponent ? (
            <div className="pod-opponent-info">
              {myOpponent.avatarUrl && (
                <img src={myOpponent.avatarUrl} alt="" className="pod-opponent-avatar" />
              )}
              <div className="pod-opponent-details">
                <p className="pod-opponent-name">{myOpponent.username}</p>
                <span className={`pod-status-badge ${myOpponent.isReady ? 'ready' : 'building'}`}>
                  {myOpponent.isReady ? 'Ready to Play' : 'Deckbuilding'}
                </span>
              </div>
            </div>
          ) : (
            <p className="pod-bye-message">Opponent not yet assigned</p>
          )}
        </div>

        {/* Instructions */}
        <div className="pod-instructions">
          <h2>How to Play</h2>
          <p>Your deck is ready. Here's how to get started:</p>

          <div className="pod-steps">
            <div className="pod-step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h3>
                  Copy Your Deck
                  <button className="step-copy-button" onClick={copyDeckUrl}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                  </button>
                </h3>
                <p>Copy your deck link to paste into <a href="https://karabast.net" target="_blank" rel="noopener noreferrer">Karabast</a>, or go to your <a href={myPoolShareId ? `/pool/${myPoolShareId}/deck/play` : '#'}>play page</a> for JSON export.</p>
              </div>
            </div>

            <div className="pod-step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h3>Connect with Your Opponent</h3>
                {myBye ? (
                  <p>You have a bye — no opponent this round.</p>
                ) : myOpponent ? (
                  <p>Your opponent is <strong>{myOpponent.username}</strong>. Join the <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">Protect the Pod Discord</a> <code>#draft-now</code> channel or DM them to coordinate.</p>
                ) : (
                  <p>Join the <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">Protect the Pod Discord</a> to find your opponent.</p>
                )}
              </div>
            </div>

            <div className="pod-step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h3>Play on Karabast</h3>
                <p>Go to <a href="https://karabast.net" target="_blank" rel="noopener noreferrer">karabast.net</a> and paste your deck link. Create a <strong>Private Lobby</strong> with <strong>Open</strong> format and <strong>Mainboard minimum size of 30</strong>.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="pod-actions">
          <button className="pod-action-button primary" onClick={copyDeckUrl} disabled={!myPoolShareId}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            Copy Deck URL
          </button>

          <button className="pod-action-button" onClick={handleViewPlay} disabled={!myPoolShareId}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Export / Practice
          </button>

          <button className="pod-action-button" onClick={handleEditDeck} disabled={!myPoolShareId}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Deck
          </button>
        </div>

        {/* Discord banner */}
        <div className="pod-discord-banner">
          <h3>Join the Community</h3>
          <p>Find opponents, discuss strategy, and coordinate matches in the Protect the Pod Discord.</p>
          <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="pod-discord-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Join Discord
          </a>
        </div>
      </div>
    </div>
  )
}
