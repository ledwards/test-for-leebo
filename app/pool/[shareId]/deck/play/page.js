'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadPool, updatePool } from '../../../../../src/utils/poolApi'
import { getPackArtUrl } from '../../../../../src/utils/packArt'
import { getSetConfig } from '../../../../../src/utils/setConfigs'
import { useAuth } from '../../../../../src/contexts/AuthContext'
import EditableTitle from '../../../../../src/components/EditableTitle'
import { getCachedCards, initializeCardCache } from '../../../../../src/utils/cardCache'
import '../../../../../src/App.css'
import './play.css'

// Build a map of card name+set -> base card ID (lowest numbered non-variant)
function buildBaseCardMap(setCode) {
  const cards = getCachedCards(setCode)
  const nameToBaseId = new Map()

  cards.forEach(card => {
    const key = `${card.name}|${card.set}`
    const existing = nameToBaseId.get(key)

    // Keep the lowest-numbered card as the base (non-variants have lower numbers)
    // Also prefer cards without variantType
    if (!existing ||
        (!card.variantType && existing.variantType) ||
        (card.variantType === existing.variantType && parseInt(card.number) < parseInt(existing.number))) {
      nameToBaseId.set(key, card)
    }
  })

  return nameToBaseId
}

// Convert card ID to base format for Karabast (handles Hyperspace 1000+ numbering)
function convertToBaseId(id) {
  if (!id) return id

  let baseId = id.replace(/-/g, '_')
  baseId = baseId.replace(/_Foil$/, '')
  baseId = baseId.replace(/_Hyperspace$/, '')
  baseId = baseId.replace(/_HyperFoil$/, '')
  baseId = baseId.replace(/_Showcase$/, '')

  // Handle Hyperspace variants that use 1000+ numbering (e.g., SEC_1002 -> SEC_002)
  const match = baseId.match(/^([A-Z]+)_(\d+)$/)
  if (match) {
    const setCode = match[1]
    const cardNum = parseInt(match[2], 10)
    if (cardNum >= 1000) {
      const baseNum = cardNum - 1000
      baseId = `${setCode}_${baseNum.toString().padStart(3, '0')}`
    }
  }

  return baseId
}

// Convert variant card to base card ID for export
function getBaseCardId(card, baseCardMap) {
  if (!card) return null

  const key = `${card.name}|${card.set}`
  const baseCard = baseCardMap?.get(key)

  if (baseCard) {
    // Always apply conversion to handle 1000+ Hyperspace numbering
    return convertToBaseId(baseCard.id)
  }

  // Fallback: convert the card's own ID
  return convertToBaseId(card.id)
}

export default function PlayPage({ params }) {
  const router = useRouter()
  const { user } = useAuth()
  const [pool, setPool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shareId, setShareId] = useState(null)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState(null)
  const [firstOpponent, setFirstOpponent] = useState(null)
  const [hasBye, setHasBye] = useState(false)
  const [deckImageModal, setDeckImageModal] = useState(null)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [baseCardMap, setBaseCardMap] = useState(null)

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      setShareId(resolvedParams.shareId)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!shareId) return

    async function fetchPool() {
      try {
        setLoading(true)
        const poolData = await loadPool(shareId)
        setPool(poolData)
        setError(null)

        // For draft pools, fetch opponent info
        if (poolData.poolType === 'draft' && poolData.draftShareId) {
          fetchOpponent(poolData.draftShareId)
        }
      } catch (err) {
        console.error('Failed to load pool:', err)
        setError(err.message || 'Failed to load pool')
      } finally {
        setLoading(false)
      }
    }

    fetchPool()

    // Refresh pool data when window regains focus (in case name was changed)
    const handleFocus = () => {
      if (shareId) {
        loadPool(shareId).then(poolData => {
          setPool(poolData)
        }).catch(console.error)
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [shareId])

  // Initialize card cache and build base card map when pool loads
  useEffect(() => {
    if (!pool?.setCode) return

    async function initCache() {
      await initializeCardCache()
      const map = buildBaseCardMap(pool.setCode)
      setBaseCardMap(map)
    }
    initCache()
  }, [pool?.setCode])

  const fetchOpponent = async (draftShareId) => {
    try {
      const response = await fetch(`/api/draft/${draftShareId}`, {
        credentials: 'include'
      })
      if (!response.ok) return

      const data = await response.json()
      const draft = data.data || data

      if (draft.status !== 'complete') return

      const players = draft.players || []
      const myPlayer = players.find(p => p.id === user?.id)
      if (!myPlayer || players.length === 0) return

      const isOddNumber = players.length % 2 === 1
      const organizer = players.find(p => p.isHost)

      if (isOddNumber && organizer?.id === myPlayer.id) {
        setHasBye(true)
      } else {
        const myIndex = players.findIndex(p => p.id === myPlayer.id)
        if (myIndex !== -1) {
          let playersForPairing = [...players]
          if (isOddNumber && organizer) {
            playersForPairing = playersForPairing.filter(p => p.id !== organizer.id)
          }
          const myNewIndex = playersForPairing.findIndex(p => p.id === myPlayer.id)
          if (myNewIndex !== -1) {
            const halfLength = playersForPairing.length / 2
            const opponentIndex = (myNewIndex + Math.floor(halfLength)) % playersForPairing.length
            setFirstOpponent(playersForPairing[opponentIndex])
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch opponent:', err)
    }
  }

  const getDeckData = () => {
    if (!pool?.deckBuilderState) return null

    const state = typeof pool.deckBuilderState === 'string'
      ? JSON.parse(pool.deckBuilderState)
      : pool.deckBuilderState

    const { cardPositions, activeLeader, activeBase } = state
    if (!cardPositions || !activeLeader || !activeBase) return null

    const leaderCard = cardPositions[activeLeader]?.card
    const baseCard = cardPositions[activeBase]?.card

    if (!leaderCard || !baseCard) return null

    // Build set of leader/base IDs from card cache to filter final output
    const allCards = getCachedCards(pool.setCode) || []
    const leaderBaseIds = new Set()
    allCards.forEach(card => {
      if (card.type === 'Leader' || card.type === 'Base') {
        leaderBaseIds.add(convertToBaseId(card.id))
      }
    })

    // Get all cards from deck and sideboard sections
    const deckCards = Object.values(cardPositions)
      .filter(pos => pos.section === 'deck' && pos.enabled !== false)
      .map(pos => pos.card)

    const sideboardCards = Object.values(cardPositions)
      .filter(pos => pos.section === 'sideboard')
      .map(pos => pos.card)

    // Count cards by base ID, excluding leaders and bases
    const deckCounts = new Map()
    deckCards.forEach(card => {
      const id = getBaseCardId(card, baseCardMap)
      if (!leaderBaseIds.has(id)) {
        deckCounts.set(id, (deckCounts.get(id) || 0) + 1)
      }
    })

    const sideboardCounts = new Map()
    sideboardCards.forEach(card => {
      const id = getBaseCardId(card, baseCardMap)
      if (!leaderBaseIds.has(id)) {
        sideboardCounts.set(id, (sideboardCounts.get(id) || 0) + 1)
      }
    })

    const poolName = state.poolName || pool.name || `${pool.setCode} ${pool.poolType === 'draft' ? 'Draft' : 'Sealed'}`

    return {
      metadata: {
        name: `[PTP] ${poolName}`,
        author: "Protect the Pod"
      },
      leader: { id: getBaseCardId(leaderCard, baseCardMap), count: 1 },
      base: { id: getBaseCardId(baseCard, baseCardMap), count: 1 },
      deck: Array.from(deckCounts.entries()).map(([id, count]) => ({ id, count })),
      sideboard: Array.from(sideboardCounts.entries()).map(([id, count]) => ({ id, count }))
    }
  }

  const copyToClipboard = async () => {
    const deckData = getDeckData()
    if (!deckData) {
      setMessage('No deck data found. Please build your deck first.')
      setMessageType('error')
      setTimeout(() => { setMessage(null); setMessageType(null) }, 3000)
      return
    }

    if (!deckData.leader || !deckData.base) {
      setMessage('Please select a leader and base before copying.')
      setMessageType('error')
      setTimeout(() => { setMessage(null); setMessageType(null) }, 3000)
      return
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(deckData, null, 2))
      setMessage('Deck JSON copied to clipboard!')
      setMessageType('success')
      setTimeout(() => { setMessage(null); setMessageType(null) }, 3000)
    } catch (err) {
      setMessage('Failed to copy to clipboard')
      setMessageType('error')
      setTimeout(() => { setMessage(null); setMessageType(null) }, 3000)
    }
  }

  const downloadJSON = () => {
    const deckData = getDeckData()
    if (!deckData) {
      setMessage('No deck data found. Please build your deck first.')
      setMessageType('error')
      setTimeout(() => { setMessage(null); setMessageType(null) }, 3000)
      return
    }

    if (!deckData.leader || !deckData.base) {
      setMessage('Please select a leader and base before downloading.')
      setMessageType('error')
      setTimeout(() => { setMessage(null); setMessageType(null) }, 3000)
      return
    }

    const jsonString = JSON.stringify(deckData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${pool?.setCode || 'deck'} ${pool?.poolType === 'draft' ? 'Draft' : 'Sealed'} Deck.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportDeckImage = async () => {
    if (!pool?.deckBuilderState) {
      setMessage('No deck data found. Please build your deck first.')
      setMessageType('error')
      setTimeout(() => { setMessage(null); setMessageType(null) }, 3000)
      return
    }

    setGeneratingImage(true)

    try {
      const state = typeof pool.deckBuilderState === 'string'
        ? JSON.parse(pool.deckBuilderState)
        : pool.deckBuilderState

      const { cardPositions, activeLeader, activeBase } = state
      if (!cardPositions || !activeLeader || !activeBase) {
        setMessage('Please select a leader and base first.')
        setMessageType('error')
        setTimeout(() => { setMessage(null); setMessageType(null) }, 3000)
        setGeneratingImage(false)
        return
      }

      const leaderCard = cardPositions[activeLeader]?.card
      const baseCard = cardPositions[activeBase]?.card

      // Get deck cards only (no sideboard)
      const deckCards = Object.values(cardPositions)
        .filter(pos => pos.section === 'deck' && !pos.card.isBase && !pos.card.isLeader && pos.enabled !== false)
        .map(pos => pos.card)
        .sort((a, b) => (a.cost || 0) - (b.cost || 0))

      // Canvas settings
      const padding = 40
      const cardWidth = 120
      const cardHeight = 168
      const leaderBaseWidth = 150
      const leaderBaseHeight = 210
      const spacing = 10
      const titleHeight = 50
      const labelHeight = 35
      const sectionSpacing = 20
      const cardsPerRow = 8
      const width = padding * 2 + cardsPerRow * cardWidth + (cardsPerRow - 1) * spacing

      // Calculate heights
      const deckRows = Math.ceil(deckCards.length / cardsPerRow)
      const totalHeight = padding + titleHeight + sectionSpacing +
        leaderBaseHeight + sectionSpacing +
        labelHeight + deckRows * (cardHeight + spacing) + sectionSpacing +
        80 + padding

      // Create canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = totalHeight
      const ctx = canvas.getContext('2d')

      // Fill background
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, width, totalHeight)

      // Helper to draw card with CORS proxy fallback
      const drawCard = async (card, x, y, w, h) => {
        if (!card?.imageUrl) {
          ctx.fillStyle = '#333'
          ctx.fillRect(x, y, w, h)
          ctx.fillStyle = '#888'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(card?.name || 'Unknown', x + w / 2, y + h / 2)
          return
        }

        // Try to load image via blob to avoid CORS issues
        const loadViaBlob = async (url) => {
          const response = await fetch(url, { mode: 'cors' })
          if (!response.ok) throw new Error('Failed to fetch')
          const blob = await response.blob()
          return URL.createObjectURL(blob)
        }

        // Try loading the image
        const tryLoadImage = (url) => {
          return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = url
          })
        }

        try {
          // Try direct blob fetch first
          let objectUrl
          try {
            objectUrl = await loadViaBlob(card.imageUrl)
          } catch {
            // Try CORS proxy
            objectUrl = await loadViaBlob(`https://corsproxy.io/?${encodeURIComponent(card.imageUrl)}`)
          }

          const img = await tryLoadImage(objectUrl)
          ctx.drawImage(img, x, y, w, h)
          URL.revokeObjectURL(objectUrl)
        } catch {
          // Final fallback: draw placeholder
          ctx.fillStyle = '#333'
          ctx.fillRect(x, y, w, h)
          ctx.fillStyle = '#888'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(card?.name || 'Unknown', x + w / 2, y + h / 2)
        }
      }

      let currentY = padding

      // Draw title
      ctx.fillStyle = 'white'
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const displayName = state.poolName || pool.name || `${pool.setCode} ${pool.poolType === 'draft' ? 'Draft' : 'Sealed'}`
      ctx.fillText(displayName, width / 2, currentY)
      currentY += titleHeight + sectionSpacing

      // Draw leader and base centered
      const totalLeaderBaseWidth = leaderBaseWidth * 2 + spacing
      const startX = (width - totalLeaderBaseWidth) / 2
      if (leaderCard) {
        await drawCard(leaderCard, startX, currentY, leaderBaseWidth, leaderBaseHeight)
      }
      if (baseCard) {
        await drawCard(baseCard, startX + leaderBaseWidth + spacing, currentY, leaderBaseWidth, leaderBaseHeight)
      }
      currentY += leaderBaseHeight + sectionSpacing

      // Draw "Deck" label
      ctx.fillStyle = 'white'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(`Deck (${deckCards.length} cards)`, padding, currentY)
      currentY += labelHeight

      // Draw deck cards
      let col = 0
      let row = 0
      for (const card of deckCards) {
        const x = padding + col * (cardWidth + spacing)
        const y = currentY + row * (cardHeight + spacing)
        await drawCard(card, x, y, cardWidth, cardHeight)
        col++
        if (col >= cardsPerRow) {
          col = 0
          row++
        }
      }
      currentY += deckRows * (cardHeight + spacing) + sectionSpacing

      // Draw timestamp
      const now = new Date()
      const timeStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(timeStr, width / 2, totalHeight - padding)

      // Show image in modal
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        setDeckImageModal(url)
        setGeneratingImage(false)
      }, 'image/png')

    } catch (error) {
      console.error('Error generating deck image:', error)
      setMessage('Failed to generate image')
      setMessageType('error')
      setTimeout(() => { setMessage(null); setMessageType(null) }, 3000)
      setGeneratingImage(false)
    }
  }

  const clonePool = () => {
    if (!user) {
      setMessage('Please log in to clone this pool')
      setMessageType('error')
      setTimeout(() => { setMessage(null); setMessageType(null) }, 3000)
      return
    }
    // Redirect to clone endpoint or handle clone
    router.push(`/pool/${shareId}/deck?clone=true`)
  }

  if (loading) {
    return (
      <div className="play-page">
        <div className="play-content">
          <div className="play-header">
            <div className="play-title-skeleton"></div>
            <div className="play-pool-type-skeleton"></div>
          </div>

          <div className="play-instructions">
            <div className="play-skeleton-heading"></div>
            <div className="play-skeleton-text"></div>

            <div className="play-steps">
              <div className="play-step">
                <div className="step-number-skeleton"></div>
                <div className="step-content">
                  <div className="play-skeleton-step-title"></div>
                  <div className="play-skeleton-step-text"></div>
                </div>
              </div>
              <div className="play-step">
                <div className="step-number-skeleton"></div>
                <div className="step-content">
                  <div className="play-skeleton-step-title"></div>
                  <div className="play-skeleton-step-text"></div>
                </div>
              </div>
              <div className="play-step">
                <div className="step-number-skeleton"></div>
                <div className="step-content">
                  <div className="play-skeleton-step-title"></div>
                  <div className="play-skeleton-step-text"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="play-actions">
            <div className="play-button-skeleton"></div>
            <div className="play-button-skeleton"></div>
            <div className="play-button-skeleton"></div>
            <div className="play-button-skeleton"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="play-page">
        <div className="play-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="play-button" onClick={() => router.back()}>Go Back</button>
        </div>
      </div>
    )
  }

  const packArtUrl = pool?.setCode ? getPackArtUrl(pool.setCode) : null
  const setConfig = pool?.setCode ? getSetConfig(pool.setCode) : null
  const isOwner = user && pool?.owner?.id === user.id
  const poolTypeLabel = pool?.poolType === 'draft' ? 'Draft Pool' : 'Sealed Pool'

  // Get pool name from deckBuilderState first, then fall back to pool.name
  const getPoolName = () => {
    if (pool?.deckBuilderState) {
      const state = typeof pool.deckBuilderState === 'string'
        ? JSON.parse(pool.deckBuilderState)
        : pool.deckBuilderState
      if (state.poolName) return state.poolName
    }
    return pool?.name || `${setConfig?.setName || pool?.setCode} Deck`
  }
  const poolName = getPoolName()

  const handleRenamePool = async (newName) => {
    if (!shareId) return
    try {
      // Get current deckBuilderState and update poolName in it
      const currentState = pool?.deckBuilderState
        ? (typeof pool.deckBuilderState === 'string' ? JSON.parse(pool.deckBuilderState) : pool.deckBuilderState)
        : {}
      const updatedState = { ...currentState, poolName: newName }

      await updatePool(shareId, { deckBuilderState: updatedState })
      setPool(prev => ({
        ...prev,
        deckBuilderState: updatedState
      }))
    } catch (err) {
      console.error('Failed to rename pool:', err)
      setMessage('Failed to rename pool')
      setMessageType('error')
      setTimeout(() => { setMessage(null); setMessageType(null) }, 3000)
    }
  }

  return (
    <div className="play-page">
      {packArtUrl && (
        <div className="set-art-header" style={{
          backgroundImage: `url("${packArtUrl}")`,
        }}></div>
      )}

      <div className="play-content">
        <div className="play-header">
          <EditableTitle
            value={poolName}
            onSave={handleRenamePool}
            isEditable={isOwner}
            placeholder="Untitled Deck"
            className="play-title"
          />
          <p className="play-pool-type">{poolTypeLabel}</p>
        </div>

        <div className="play-instructions">
          <h2>Ready to Play!</h2>
          <p>Your deck is ready. Here's how to get started:</p>

          <div className="play-steps">
            <div className="play-step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h3>
                  Copy Your Deck
                  <button className="step-copy-button" onClick={copyToClipboard}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </h3>
                <p>Copy your deck in JSON format.</p>
              </div>
            </div>

            <div className="play-step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h3>Find Your Opponent</h3>
                {pool?.poolType === 'draft' ? (
                  hasBye ? (
                    <p>You have a bye this round (organizer privilege for odd-numbered pods).</p>
                  ) : firstOpponent ? (
                    <p>Your first round opponent is <strong>{firstOpponent.username || 'Unknown Player'}</strong>. Reach out to them on Discord to schedule your match!</p>
                  ) : (
                    <p>Find an opponent to play against.</p>
                  )
                ) : (
                  <p>Find an opponent to play against.</p>
                )}
              </div>
            </div>

            <div className="play-step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h3>Play on Karabast</h3>
                <p>Go to <a href="https://karabast.net" target="_blank" rel="noopener noreferrer">karabast.net</a> and load your deck (by pasting JSON into Karabast directly, or via <a href="https://swudb.com" target="_blank" rel="noopener noreferrer">swudb.com</a> if you prefer). Create a <strong>Private Lobby</strong> with <strong>Open</strong> format and <strong>Mainboard minimum size of 30</strong>.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="play-actions">
          <button className="play-action-button edit-deck" onClick={() => router.push(`/pool/${shareId}/deck`)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Edit Deck
          </button>

          <button className="play-action-button primary" onClick={copyToClipboard}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy to Clipboard
          </button>

          <button className="play-action-button" onClick={downloadJSON}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download
          </button>

          <button className="play-action-button" onClick={exportDeckImage} disabled={generatingImage}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            {generatingImage ? 'Generating...' : 'Deck Image'}
          </button>
        </div>

        {!isOwner && (
          <div className="play-secondary-actions">
            <button className="play-secondary-button" onClick={clonePool}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <path d="M20 8v6M23 11h-6"></path>
              </svg>
              Clone Pool
            </button>
          </div>
        )}

        {message && (
          <div className={`play-message ${messageType}`}>
            {message}
          </div>
        )}
      </div>

      {deckImageModal && (
        <div className="deck-image-modal-overlay" onClick={() => {
          URL.revokeObjectURL(deckImageModal)
          setDeckImageModal(null)
        }}>
          <div className="deck-image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="deck-image-modal-close"
              onClick={() => {
                URL.revokeObjectURL(deckImageModal)
                setDeckImageModal(null)
              }}
            >
              ×
            </button>
            <img
              src={deckImageModal}
              alt="Deck Export"
              className="deck-image-modal-image"
            />
            <div className="deck-image-modal-actions">
              <button
                className="deck-image-modal-download"
                onClick={() => {
                  const a = document.createElement('a')
                  a.href = deckImageModal
                  const sanitizedName = poolName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
                  a.download = `${sanitizedName}_deck.png`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                }}
              >
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
