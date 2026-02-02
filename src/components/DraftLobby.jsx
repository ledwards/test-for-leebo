'use client'

import { useState } from 'react'
import PlayerCircle from './PlayerCircle'
import HostControls from './HostControls'
import Button from './Button'
import './DraftLobby.css'

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
)

function DraftLobby({
  draft,
  players,
  isHost,
  isPlayer,
  onStart,
  onRandomize,
  onAddBot,
  onSettingsChange,
  onLeave,
  startingDraft,
  randomizing,
  addingBot,
  error,
  shareId,
}) {
  const maxPlayers = draft?.maxPlayers || 8
  const isFull = players.length >= maxPlayers
  const [copied, setCopied] = useState(false)

  const handleCopyShareUrl = async () => {
    const url = `${window.location.origin}/draft/${shareId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="draft-lobby">
      <div className="lobby-layout">
        <div className="players-section">
          <PlayerCircle
            players={players}
            maxPlayers={maxPlayers}
            currentUserId={draft?.myPlayer?.id}
            enableTooltip={false}
          />
          <p className="player-count">
            {players.length} / {maxPlayers} players
          </p>
          {shareId && (
            <div className="share-url-section">
              <span className="share-label">Share URL:</span>
              <Button variant="secondary" size="sm" className="copy-url-button" onClick={handleCopyShareUrl}>
                <CopyIcon />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </Button>
            </div>
          )}
        </div>

        <div className="controls-section">
          {isHost && (
            <HostControls
              draft={draft}
              playerCount={players.length}
              onStart={onStart}
              onRandomize={onRandomize}
              onAddBot={onAddBot}
              onSettingsChange={onSettingsChange}
              startingDraft={startingDraft}
              randomizing={randomizing}
              addingBot={addingBot}
              isFull={isFull}
              shareId={shareId}
            />
          )}

          {isPlayer && !isHost && (
            <div className="player-actions">
              <p className="waiting-message">Waiting for host to start the draft...</p>
              <Button
                variant="danger"
                className="leave-button"
                onClick={onLeave}
              >
                Leave Draft
              </Button>
            </div>
          )}

          {!isPlayer && (
            <div className="spectator-notice">
              <p>You are spectating this draft.</p>
            </div>
          )}

          {error && <div className="lobby-error">{error}</div>}
        </div>
      </div>
    </div>
  )
}

export default DraftLobby
