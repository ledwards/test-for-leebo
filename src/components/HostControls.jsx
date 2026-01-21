'use client'

import './HostControls.css'

const DiceIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"></circle>
    <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"></circle>
    <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor"></circle>
    <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"></circle>
  </svg>
)

const RobotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
    <line x1="8" y1="16" x2="8" y2="16"></line>
    <line x1="16" y1="16" x2="16" y2="16"></line>
    <circle cx="8" cy="16" r="1" fill="currentColor"></circle>
    <circle cx="16" cy="16" r="1" fill="currentColor"></circle>
  </svg>
)

function HostControls({
  draft,
  playerCount,
  onStart,
  onRandomize,
  onAddBot,
  onTimedChange,
  loading,
  isFull,
}) {
  const canStart = playerCount >= 2
  const canAddBot = playerCount < (draft?.maxPlayers || 8)
  const isTimed = draft?.timed !== false

  // Timer settings for display
  const pickTimeoutSeconds = draft?.pickTimeoutSeconds || 120
  const lastPlayerTimerSeconds = draft?.timerSeconds || 30

  const handleTimedChange = (e) => {
    if (onTimedChange) {
      onTimedChange(e.target.checked)
    }
  }

  return (
    <div className="host-controls">
      <h3>Host Controls</h3>

      <div className="draft-settings">
        <div className="settings-row">
          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={isTimed}
              onChange={handleTimedChange}
            />
            <span>Timed</span>
          </label>

          {isTimed && (
            <>
              <div className="setting-item">
                <span className="setting-label">Pick Timeout:</span>
                <span className="setting-value">{pickTimeoutSeconds}s</span>
              </div>
              <div className="setting-item">
                <span className="setting-label">Last Player Timer:</span>
                <span className="setting-value">{lastPlayerTimerSeconds}s</span>
              </div>
            </>
          )}
        </div>

        <div className="settings-row">
          <div className="setting-item">
            <span className="setting-label">Max Players:</span>
            <span className="setting-value">{draft?.maxPlayers || 8}</span>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <div className="controls-row secondary-controls">
          <button
            className="control-button secondary"
            onClick={onRandomize}
            disabled={loading || playerCount < 2}
          >
            <DiceIcon />
            <span>Randomize Seats</span>
          </button>

          <button
            className="control-button secondary"
            onClick={onAddBot}
            disabled={loading || !canAddBot}
          >
            <RobotIcon />
            <span>Add Bot</span>
          </button>
        </div>

        <div className="controls-row primary-controls">
          <button
            className="control-button primary"
            onClick={onStart}
            disabled={loading || !canStart}
          >
            {loading ? 'Starting...' : 'Start Draft'}
          </button>
        </div>

        {!canStart && (
          <p className="min-players-note">
            Need at least 2 players to start
          </p>
        )}

        {isFull && (
          <p className="ready-to-start">Ready to Start</p>
        )}
      </div>
    </div>
  )
}

export default HostControls
