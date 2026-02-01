/**
 * StickyInfoBar Component
 *
 * Displays the sticky navigation bar with:
 * - Selected leader/base names (clickable to scroll)
 * - Deck/Pool counts (clickable to scroll)
 * - Action buttons (Clone, Play, Share) when sticky
 */

import { useRef } from 'react'
import Button from '../Button'
import { getAspectColor } from '../../utils/aspectColors'
import { savePool } from '../../utils/poolApi'

// Helper to scroll to an element with offset
function scrollToElement(selector, wasCollapsed) {
  const element = document.querySelector(selector)
  if (element) {
    const headerHeight = document.querySelector('.deck-info-bar')?.offsetHeight || 0
    const topOffset = 20
    const scrollOffset = headerHeight + topOffset + 10
    setTimeout(() => {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      window.scrollTo({
        top: elementPosition - scrollOffset,
        behavior: 'smooth'
      })
    }, wasCollapsed ? 400 : 0)
  }
}

export function StickyInfoBar({
  infoBarRef,
  isInfoBarSticky,
  activeLeader,
  activeBase,
  cardPositions,
  leadersExpanded,
  setLeadersExpanded,
  basesExpanded,
  setBasesExpanded,
  deckExpanded,
  setDeckExpanded,
  sideboardExpanded,
  setSideboardExpanded,
  onCardMouseEnter,
  onCardMouseLeave,
  isDraftMode,
  isOwner,
  isAuthenticated,
  signIn,
  shareId,
  setErrorMessage,
  setMessageType,
  setCode,
  cards,
  savedState,
  poolType,
  currentPoolName,
}) {
  const longPressTimeoutRef = useRef(null)

  // Calculate deck counts
  const deckCardCount = Object.values(cardPositions)
    .filter(pos => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader && pos.enabled !== false).length
  const poolCardCount = Object.values(cardPositions)
    .filter(pos => (pos.section === 'sideboard' || pos.enabled === false) && pos.visible && !pos.card.isBase && !pos.card.isLeader).length
  const isDeckLegal = activeLeader && activeBase && deckCardCount >= 30

  // Get deck count color
  const getDeckCountColor = () => {
    if (deckCardCount < 30) return '#E74C3C' // Red
    if (deckCardCount === 30) return '#27AE60' // Green
    return '#F1C40F' // Yellow
  }

  // Handle clone action
  const handleClone = async () => {
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

  // Handle share action
  const handleShare = async () => {
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

  // Handle play navigation
  const handlePlay = () => {
    if (isDeckLegal) {
      window.location.href = `/pool/${shareId}/deck/play`
    }
  }

  // Touch handlers for long press preview
  const handleTouchStart = (card, e) => {
    if (isInfoBarSticky) {
      longPressTimeoutRef.current = setTimeout(() => {
        onCardMouseEnter(card, e)
      }, 500)
    }
  }

  const handleTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current)
      longPressTimeoutRef.current = null
    }
  }

  const leaderCard = activeLeader && cardPositions[activeLeader]?.card
  const baseCard = activeBase && cardPositions[activeBase]?.card

  return (
    <div className={`deck-info-bar ${isInfoBarSticky ? 'sticky' : ''}`} ref={infoBarRef}>
      <div className="selected-cards-info">
        {/* Leader display */}
        <div
          className={`selected-card-container ${!activeLeader ? 'select-card-placeholder' : ''} ${isInfoBarSticky ? 'sticky-layout' : 'inline-layout'}`}
          onClick={() => {
            const wasCollapsed = !leadersExpanded
            if (wasCollapsed) setLeadersExpanded(true)
            scrollToElement('.blocks-leaders-row .card-block', wasCollapsed)
          }}
          style={{ cursor: 'pointer' }}
        >
          {leaderCard ? (
            <>
              <span
                className="selected-card-name"
                style={{ color: getAspectColor(leaderCard) }}
                onMouseEnter={(e) => isInfoBarSticky && onCardMouseEnter(leaderCard, e)}
                onMouseLeave={() => isInfoBarSticky && onCardMouseLeave()}
                onTouchStart={(e) => handleTouchStart(leaderCard, e)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                {leaderCard.name}
              </span>
              {leaderCard.subtitle && (
                <span className="selected-card-subtitle">{leaderCard.subtitle}</span>
              )}
            </>
          ) : (
            <span className="selected-card-name">(Select a Leader)</span>
          )}
        </div>

        <span className="separator"></span>

        {/* Base display */}
        <div
          className={`selected-card-container ${!activeBase ? 'select-card-placeholder' : ''}`}
          onClick={() => {
            const wasCollapsed = !basesExpanded
            if (wasCollapsed) setBasesExpanded(true)
            scrollToElement('.blocks-bases-row .card-block', wasCollapsed)
          }}
          style={{ cursor: 'pointer' }}
        >
          {baseCard ? (
            <span
              className="selected-card-name"
              style={{ color: getAspectColor(baseCard) }}
              onMouseEnter={(e) => isInfoBarSticky && onCardMouseEnter(baseCard, e)}
              onMouseLeave={() => isInfoBarSticky && onCardMouseLeave()}
              onTouchStart={(e) => handleTouchStart(baseCard, e)}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              {baseCard.name}
            </span>
          ) : (
            <span className="selected-card-name">(Select a Base)</span>
          )}
        </div>
      </div>

      <div className="deck-counts-info">
        {/* Deck count */}
        <span
          className="section-link"
          onClick={() => {
            const wasCollapsed = !deckExpanded
            if (wasCollapsed) setDeckExpanded(true)
            scrollToElement('#deck-header', wasCollapsed)
          }}
          style={{ cursor: 'pointer' }}
        >
          Deck (<span style={{ color: getDeckCountColor() }}>{deckCardCount}</span>/30)
        </span>

        <span className="separator"></span>

        {/* Pool/Sideboard count */}
        <span
          className="section-link"
          onClick={() => {
            const wasCollapsed = !sideboardExpanded
            if (wasCollapsed) setSideboardExpanded(true)
            scrollToElement('#pool-header', wasCollapsed)
          }}
          style={{ cursor: 'pointer' }}
        >
          {isDraftMode ? 'Card Pool' : 'Sideboard'} ({poolCardCount})
        </span>
      </div>

      {/* Action buttons when sticky */}
      {isInfoBarSticky && (
        <div className="header-buttons-in-nav">
          {/* Clone button for non-owners */}
          {!isOwner && (
            <Button variant="icon" className="export-button-icon" onClick={handleClone}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <path d="M20 8v6M23 11h-6"></path>
              </svg>
              <span className="button-tooltip">{isAuthenticated ? 'Clone' : 'Login to Clone'}</span>
            </Button>
          )}

          {/* Play button */}
          {shareId && (
            <Button
              variant="primary"
              className={`export-button-icon ready-to-play-icon ${!isDeckLegal ? 'disabled' : ''}`}
              onClick={handlePlay}
              disabled={!isDeckLegal}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span className="button-tooltip tooltip-below">{isDeckLegal ? 'Ready to Play' : 'Create Deck to Continue'}</span>
            </Button>
          )}

          {/* Clone button for owners */}
          {isOwner && (
            <Button variant="icon" className="export-button-icon" onClick={handleClone}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <path d="M20 8v6M23 11h-6"></path>
              </svg>
              <span className="button-tooltip">Clone</span>
            </Button>
          )}

          {/* Share button */}
          {shareId && (
            <Button variant="icon" className="export-button-icon" onClick={handleShare}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              <span className="button-tooltip tooltip-below">Copy Share URL</span>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default StickyInfoBar
