// @ts-nocheck
'use client'

import './PlayInstructions.css'

const DISCORD_INVITE_URL = 'https://discord.gg/u6fkdDzWqF'

interface PlayInstructionsProps {
  shareId: string | null
  poolType: 'draft' | 'sealed' | 'sealed_pod' | string
  hasBetaAccess?: boolean
  opponentName?: string | null
  hasBye?: boolean
  onCopyLink?: () => void
  onCopyJson?: () => void
  onDownload?: () => void
  onDeckImage?: () => void
  generatingImage?: boolean
  message?: string | null
  messageType?: 'success' | 'error' | null
  showActions?: boolean
}

export default function PlayInstructions({
  shareId,
  poolType,
  hasBetaAccess = false,
  opponentName = null,
  hasBye = false,
  onCopyLink,
  onCopyJson,
  onDownload,
  onDeckImage,
  generatingImage = false,
  message = null,
  messageType = null,
  showActions = true,
}: PlayInstructionsProps) {
  return (
    <div className="play-instructions">
      <h2>Ready to Play!</h2>
      <p>Your deck is ready. Here's how to get started:</p>

      <div className="play-steps">
        {/* Step 1: Copy Your Deck */}
        <div className="play-step">
          <span className="step-number">1</span>
          <div className="step-content">
            {hasBetaAccess ? (
              <>
                <h3>Copy Your Deck:
                  {onCopyLink && (
                    <button className="step-copy-button" onClick={onCopyLink} title="Copy deck link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                      </svg>
                      Link
                    </button>
                  )}
                  {onCopyJson && (
                    <button className="step-copy-button" onClick={onCopyJson} title="Copy deck JSON">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      JSON
                    </button>
                  )}
                </h3>
                <p>Copy your deck link for <a href="https://karabast.net" target="_blank" rel="noopener noreferrer">Karabast</a>, or copy the deck JSON for <a href="https://swudb.com" target="_blank" rel="noopener noreferrer">SWUDB</a>.</p>
              </>
            ) : (
              <>
                <h3>
                  Copy Your Deck
                  {onCopyLink && (
                    <button className="step-copy-button" onClick={onCopyLink} title="Copy deck link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                      </svg>
                    </button>
                  )}
                  {onCopyJson && (
                    <button className="step-copy-button" onClick={onCopyJson} title="Copy deck JSON">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  )}
                </h3>
                {onCopyLink && onCopyJson ? (
                  <p>Copy your deck link for <a href="https://karabast.net" target="_blank" rel="noopener noreferrer">Karabast</a>, or copy the deck JSON.</p>
                ) : onCopyLink ? (
                  <p>Copy your deck link to paste into <a href="https://karabast.net" target="_blank" rel="noopener noreferrer">Karabast</a>, or go to your {shareId ? <a href={`/pool/${shareId}/deck/play`}>play page</a> : 'play page'} for JSON export.</p>
                ) : onCopyJson ? (
                  <p>Copy your deck in JSON format.</p>
                ) : (
                  <p>Go to your {shareId ? <a href={`/pool/${shareId}/deck/play`}>play page</a> : 'play page'} to copy your deck.</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Step 2: Find Your Opponent */}
        <div className="play-step">
          <span className="step-number">2</span>
          <div className="step-content">
            <h3>Find Your Opponent</h3>
            {(poolType === 'draft' || poolType === 'sealed_pod') ? (
              hasBye ? (
                <p>You have a bye this round.</p>
              ) : opponentName ? (
                <p>Your first round opponent is <strong>{opponentName}</strong>. Reach out to them on Discord to schedule your match!</p>
              ) : (
                <p>Find an opponent in the <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">Protect the Pod Discord</a> or play against someone you know.</p>
              )
            ) : (
              <p>Find an opponent in the <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">Protect the Pod Discord</a> or play against someone you know.</p>
            )}
          </div>
        </div>

        {/* Step 3: Play on Karabast */}
        <div className="play-step">
          <span className="step-number">3</span>
          <div className="step-content">
            <h3>Play on Karabast</h3>
            {hasBetaAccess ? (
              <p>Go to <a href="https://karabast.net" target="_blank" rel="noopener noreferrer">karabast.net</a> and paste your deck link or JSON. Create a <strong>Private Lobby</strong> with <strong>Open</strong> format and <strong>Mainboard minimum size of 30</strong>.</p>
            ) : (
              <p>Go to <a href="https://karabast.net" target="_blank" rel="noopener noreferrer">karabast.net</a> and load your deck (by pasting JSON into Karabast directly, or via <a href="https://swudb.com" target="_blank" rel="noopener noreferrer">swudb.com</a> if you prefer). Create a <strong>Private Lobby</strong> with <strong>Open</strong> format and <strong>Mainboard minimum size of 30</strong>.</p>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="play-instructions-actions">
          {hasBetaAccess && onCopyLink && (
            <button className="play-instructions-action-button primary" onClick={onCopyLink}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              Copy Link
            </button>
          )}

          {onCopyJson && (
            <button className={`play-instructions-action-button${hasBetaAccess ? '' : ' primary'}`} onClick={onCopyJson}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              {hasBetaAccess ? 'Copy JSON' : 'Copy to Clipboard'}
            </button>
          )}

          {onDownload && (
            <button className="play-instructions-action-button" onClick={onDownload}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download
            </button>
          )}

          {onDeckImage && (
            <button className="play-instructions-action-button" onClick={onDeckImage} disabled={generatingImage}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              {generatingImage ? 'Generating...' : 'Deck Image'}
            </button>
          )}
        </div>
      )}

      {/* Message feedback */}
      {message && (
        <div className={`play-instructions-message ${messageType}`}>
          {message}
        </div>
      )}
    </div>
  )
}
