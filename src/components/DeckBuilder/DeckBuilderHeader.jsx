/**
 * DeckBuilderHeader Component
 *
 * Displays the main header for the deck builder including:
 * - Editable pool name
 * - Pool type (Draft/Sealed)
 * - Action buttons (Clone, Play, Share)
 * - Status messages
 */

import EditableTitle from '../EditableTitle'
import Button from '../Button'
import { savePool } from '../../utils/poolApi'

export function DeckBuilderHeader({
  currentPoolName,
  onRenamePool,
  isOwner,
  isDraftMode,
  isInfoBarSticky,
  isAuthenticated,
  signIn,
  shareId,
  cardPositions,
  activeLeader,
  activeBase,
  setCode,
  cards,
  savedState,
  poolType,
  errorMessage,
  setErrorMessage,
  messageType,
  setMessageType,
}) {
  // Calculate deck legality for Play button
  const deckCardCount = Object.values(cardPositions)
    .filter(pos => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader && pos.enabled !== false).length
  const isDeckLegal = activeLeader && activeBase && deckCardCount >= 30

  // Handle clone pool action
  const handleClonePool = async () => {
    if (!isAuthenticated) {
      signIn()
      return
    }

    try {
      setErrorMessage('Cloning pool...')
      setMessageType('info')

      const clonedPool = await savePool({
        setCode: setCode,
        cards: cards,
        packs: null,
        deckBuilderState: savedState,
        poolType: poolType,
        name: currentPoolName ? `${currentPoolName} (Copy)` : null,
        isPublic: false
      })

      setErrorMessage('Pool cloned! Redirecting...')
      setMessageType('success')

      setTimeout(() => {
        window.location.href = `/pool/${clonedPool.shareId}/deck`
      }, 1000)
    } catch (err) {
      console.error('Failed to clone pool:', err)
      setErrorMessage('Failed to clone pool')
      setMessageType('error')
      setTimeout(() => {
        setErrorMessage(null)
        setMessageType(null)
      }, 3000)
    }
  }

  // Handle copy share URL
  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/pool/${shareId}`)
      setErrorMessage('Share URL copied to clipboard!')
      setMessageType('success')
      setTimeout(() => {
        setErrorMessage(null)
        setMessageType(null)
      }, 3000)
    } catch (err) {
      setErrorMessage('Failed to copy to clipboard')
      setMessageType('error')
      setTimeout(() => {
        setErrorMessage(null)
        setMessageType(null)
      }, 3000)
    }
  }

  // Handle navigate to play
  const handlePlay = () => {
    if (isDeckLegal) {
      window.location.href = `/pool/${shareId}/deck/play`
    }
  }

  return (
    <div className="deck-builder-header">
      <div className="deck-builder-header-title-container">
        <h1>
          <EditableTitle
            value={currentPoolName}
            onSave={onRenamePool}
            isEditable={isOwner}
            placeholder="Deck Builder"
          />
        </h1>
        <p className="deck-builder-pool-type">{isDraftMode ? 'Draft Pool' : 'Sealed Pool'}</p>
      </div>

      <div className={`header-buttons ${isInfoBarSticky ? 'hidden' : ''}`}>
        {/* Clone button first for non-owners */}
        {!isOwner && (
          <Button
            variant="secondary"
            className="export-button"
            onClick={handleClonePool}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <path d="M20 8v6M23 11h-6"></path>
            </svg>
            <span>{isAuthenticated ? 'Clone' : 'Login to Clone'}</span>
          </Button>
        )}

        {/* Play button */}
        {shareId && (
          <Button
            variant="primary"
            className={`export-button ready-to-play-button ${!isDeckLegal ? 'disabled' : ''}`}
            onClick={handlePlay}
            disabled={!isDeckLegal}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>{isDeckLegal ? 'Ready to Play' : 'Finish Deckbuilding to Play'}</span>
          </Button>
        )}

        {/* Clone button between Play and Share for owners */}
        {isOwner && (
          <Button
            variant="secondary"
            className="export-button"
            onClick={handleClonePool}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <path d="M20 8v6M23 11h-6"></path>
            </svg>
            <span>Clone</span>
          </Button>
        )}

        {/* Share button */}
        {shareId && (
          <Button
            variant="secondary"
            className="export-button"
            onClick={handleCopyShareUrl}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <span>Copy Share URL</span>
          </Button>
        )}
      </div>

      {errorMessage && (
        <div className="error-message" style={{
          marginTop: '1rem',
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '0.5rem 1rem',
          background: messageType === 'error' ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 100, 255, 0.2)',
          border: messageType === 'error' ? '1px solid #ff0000' : '1px solid #0066ff',
          borderRadius: '4px',
          color: messageType === 'error' ? '#ffcccc' : '#cce5ff',
          width: 'fit-content',
          fontSize: '0.875rem'
        }}>
          {errorMessage}
        </div>
      )}
    </div>
  )
}

export default DeckBuilderHeader
