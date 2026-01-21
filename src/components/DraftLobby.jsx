'use client'

import PlayerCircle from './PlayerCircle'
import HostControls from './HostControls'
import './DraftLobby.css'

function DraftLobby({
  draft,
  players,
  isHost,
  isPlayer,
  onStart,
  onRandomize,
  onAddBot,
  onTimedChange,
  onLeave,
  loading,
  error
}) {
  const maxPlayers = draft?.maxPlayers || 8
  const isFull = players.length >= maxPlayers

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
        </div>

        <div className="controls-section">
          {isHost && (
            <HostControls
              draft={draft}
              playerCount={players.length}
              onStart={onStart}
              onRandomize={onRandomize}
              onAddBot={onAddBot}
              onTimedChange={onTimedChange}
              loading={loading}
              isFull={isFull}
            />
          )}

          {isPlayer && !isHost && (
            <div className="player-actions">
              <p className="waiting-message">Waiting for host to start the draft...</p>
              <button
                className="leave-button"
                onClick={onLeave}
                disabled={loading}
              >
                Leave Draft
              </button>
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
