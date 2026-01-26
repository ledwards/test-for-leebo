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

// Extract the card number from an ID like "SEC-246" or "SEC_1002"
function getCardNumber(id) {
  const match = id?.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : Infinity
}

// Check if a card ID is a variant (Hyperspace 1000+, Showcase 253+, etc.)
function isVariantNumber(num) {
  return num >= 253
}

// Build a map of card name -> base card (the non-variant version)
function buildBaseCardMap(setCode) {
  const cards = getCachedCards(setCode)
  if (!cards) return new Map()

  const nameToBaseCard = new Map()

  cards.forEach(card => {
    const key = card.name
    const existing = nameToBaseCard.get(key)
    const cardNum = getCardNumber(card.id)
    const existingNum = existing ? getCardNumber(existing.id) : Infinity

    // Prefer non-variant cards (number < 253) over variant cards
    // If both same type, prefer lower number
    const cardIsVariant = isVariantNumber(cardNum)
    const existingIsVariant = isVariantNumber(existingNum)

    if (!existing ||
        (!cardIsVariant && existingIsVariant) ||
        (cardIsVariant === existingIsVariant && cardNum < existingNum)) {
      nameToBaseCard.set(key, card)
    }
  })

  return nameToBaseCard
}

// Convert card ID to standard format (dash to underscore, strip suffixes)
function normalizeId(id) {
  if (!id) return id
  let baseId = id.replace(/-/g, '_')
  baseId = baseId.replace(/_Foil$/, '')
  baseId = baseId.replace(/_Hyperspace$/, '')
  baseId = baseId.replace(/_HyperFoil$/, '')
  baseId = baseId.replace(/_Showcase$/, '')
  return baseId
}

// Convert card to base card ID for export
// Looks up the base (non-variant) card by name and returns its normalized ID
function getBaseCardId(card, baseCardMap) {
  if (!card) return null

  // Look up base card by name
  const baseCard = baseCardMap?.get(card.name)
  if (baseCard) {
    return normalizeId(baseCard.id)
  }

  // Fallback: just normalize the card's own ID
  return normalizeId(card.id)
}

// Get default aspect sort key for a card
function getDefaultAspectSortKey(card) {
  const aspects = card.aspects || []
  if (aspects.length === 0) return 'E_99_Neutral'

  const hasVillainy = aspects.includes('Villainy')
  const hasHeroism = aspects.includes('Heroism')
  const primaryAspects = ['Vigilance', 'Command', 'Aggression', 'Cunning']
  const primaryAspect = aspects.find(a => primaryAspects.includes(a))

  // Primary aspect order: Vigilance=1, Command=2, Aggression=3, Cunning=4
  const primaryOrder = {
    'Vigilance': '1',
    'Command': '2',
    'Aggression': '3',
    'Cunning': '4'
  }

  // Single aspect
  if (aspects.length === 1) {
    const aspect = aspects[0]
    if (aspect === 'Villainy') return 'E_01_Villainy'
    if (aspect === 'Heroism') return 'E_02_Heroism'
    return `${primaryOrder[aspect] || '9'}_04_${aspect}`
  }

  // Two aspects
  if (aspects.length === 2) {
    if (primaryAspect) {
      const prefix = primaryOrder[primaryAspect] || '9'
      const primaryCount = aspects.filter(a => a === primaryAspect).length
      if (hasVillainy) {
        return `${prefix}_01_${primaryAspect}_Villainy`
      } else if (hasHeroism) {
        return `${prefix}_02_${primaryAspect}_Heroism`
      } else if (primaryCount === 2) {
        return `${prefix}_03_${primaryAspect}_${primaryAspect}`
      }
    } else {
      return 'E_01_Villainy_Heroism'
    }
  }

  // More than 2 aspects
  if (primaryAspect) {
    const prefix = primaryOrder[primaryAspect] || '9'
    const sortedAspects = [...aspects].sort((a, b) => {
      if (a === 'Villainy') return -1
      if (b === 'Villainy') return 1
      if (a === 'Heroism') return -1
      if (b === 'Heroism') return 1
      return a.localeCompare(b)
    })
    let subOrder = '05'
    if (hasVillainy) subOrder = '01'
    else if (hasHeroism) subOrder = '02'
    return `${prefix}_${subOrder}_${sortedAspects.join('_')}`
  }

  if (hasVillainy) return 'E_01_Villainy_Multi'
  if (hasHeroism) return 'E_02_Heroism_Multi'
  return 'E_99_Neutral'
}

// Default sort: aspect combo -> type -> cost -> name
function defaultSort(a, b) {
  const aspectKeyA = getDefaultAspectSortKey(a)
  const aspectKeyB = getDefaultAspectSortKey(b)
  const aspectCompare = aspectKeyA.localeCompare(aspectKeyB)
  if (aspectCompare !== 0) return aspectCompare

  // Type order: Ground Unit, Space Unit, Upgrade, Event
  const getTypeOrder = (type) => {
    if (type === 'Unit' || type === 'Ground Unit') return 1
    if (type === 'Space Unit') return 2
    if (type === 'Upgrade') return 3
    if (type === 'Event') return 4
    return 99
  }
  const aOrder = getTypeOrder(a.type || '')
  const bOrder = getTypeOrder(b.type || '')
  if (aOrder !== bOrder) return aOrder - bOrder

  // Cost (low to high)
  const costA = a.cost !== null && a.cost !== undefined ? a.cost : 999
  const costB = b.cost !== null && b.cost !== undefined ? b.cost : 999
  if (costA !== costB) return costA - costB

  // Alphabetically
  const nameA = (a.name || '').toLowerCase()
  const nameB = (b.name || '').toLowerCase()
  return nameA.localeCompare(nameB)
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

    async function init() {
      await initializeCardCache()
      const map = buildBaseCardMap(pool.setCode)
      setBaseCardMap(map)
    }
    init()
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
    // Use getBaseCardId to ensure variant treatments map to their base ID
    const allCards = getCachedCards(pool.setCode) || []
    const leaderBaseIds = new Set()
    allCards.forEach(card => {
      if (card.type === 'Leader' || card.type === 'Base') {
        leaderBaseIds.add(getBaseCardId(card, baseCardMap))
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

      // Get deck cards only (no sideboard), sorted by default sort (aspect combo -> type -> cost -> name)
      const deckCards = Object.values(cardPositions)
        .filter(pos => pos.section === 'deck' && !pos.card.isBase && !pos.card.isLeader && pos.enabled !== false)
        .map(pos => pos.card)
        .sort(defaultSort)

      // Load Barlow font
      const barlowFont = new FontFace('Barlow', 'url(https://fonts.gstatic.com/s/barlow/v12/7cHpv4kjgoGqM7E_DMs5.woff2)')
      const barlowBold = new FontFace('Barlow', 'url(https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E30-8s51os.woff2)', { weight: '700' })
      await Promise.all([barlowFont.load(), barlowBold.load()])
      document.fonts.add(barlowFont)
      document.fonts.add(barlowBold)

      // Canvas settings - high resolution (2767px wide)
      const width = 2767
      const padding = 100
      const cardWidth = 300
      const cardHeight = 420
      const cardBorderRadius = 15
      // Leader/base are landscape (wider than tall)
      const leaderBaseWidth = 525
      const leaderBaseHeight = 375
      const spacing = 25
      const titleHeight = 100
      const byLineHeight = 60
      const subtitleHeight = 65
      const labelHeight = 90
      const sectionSpacing = 50
      const footerHeight = 200
      const cardsPerRow = 8

      // Calculate heights
      const deckRows = Math.ceil(deckCards.length / cardsPerRow)
      const totalHeight = padding + titleHeight + byLineHeight + subtitleHeight + sectionSpacing +
        leaderBaseHeight + sectionSpacing +
        labelHeight + deckRows * (cardHeight + spacing) + sectionSpacing +
        footerHeight + padding

      // Create canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = totalHeight
      const ctx = canvas.getContext('2d')

      // Fill base background
      ctx.fillStyle = 'rgb(9, 9, 9)'
      ctx.fillRect(0, 0, width, totalHeight)

      // Load and tile background pattern
      try {
        const response = await fetch('/background-images/bg-texture-crop.png')
        const blob = await response.blob()
        const dataUrl = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        })

        const bgImg = await new Promise((resolve) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = () => resolve(null)
          img.src = dataUrl
        })

        if (bgImg && bgImg.width > 0) {
          // Tile the pattern across the canvas
          for (let y = 0; y < totalHeight; y += bgImg.height) {
            for (let x = 0; x < width; x += bgImg.width) {
              ctx.drawImage(bgImg, x, y)
            }
          }
          // Dark overlay to match website style
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
          ctx.fillRect(0, 0, width, totalHeight)
        }
      } catch (err) {
        console.error('Failed to load background pattern:', err)
      }

      // Draw fade gradients on all four sides
      const fadeSize = 200

      // Top fade
      const topGrad = ctx.createLinearGradient(0, 0, 0, fadeSize)
      topGrad.addColorStop(0, 'rgb(9, 9, 9)')
      topGrad.addColorStop(1, 'rgba(9, 9, 9, 0)')
      ctx.fillStyle = topGrad
      ctx.fillRect(0, 0, width, fadeSize)

      // Bottom fade
      const bottomGrad = ctx.createLinearGradient(0, totalHeight - fadeSize, 0, totalHeight)
      bottomGrad.addColorStop(0, 'rgba(9, 9, 9, 0)')
      bottomGrad.addColorStop(1, 'rgb(9, 9, 9)')
      ctx.fillStyle = bottomGrad
      ctx.fillRect(0, totalHeight - fadeSize, width, fadeSize)

      // Left fade
      const leftGrad = ctx.createLinearGradient(0, 0, fadeSize, 0)
      leftGrad.addColorStop(0, 'rgb(9, 9, 9)')
      leftGrad.addColorStop(1, 'rgba(9, 9, 9, 0)')
      ctx.fillStyle = leftGrad
      ctx.fillRect(0, 0, fadeSize, totalHeight)

      // Right fade
      const rightGrad = ctx.createLinearGradient(width - fadeSize, 0, width, 0)
      rightGrad.addColorStop(0, 'rgba(9, 9, 9, 0)')
      rightGrad.addColorStop(1, 'rgb(9, 9, 9)')
      ctx.fillStyle = rightGrad
      ctx.fillRect(width - fadeSize, 0, fadeSize, totalHeight)

      // Helper to draw rounded rect clip
      const roundedClip = (x, y, w, h, r) => {
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + w - r, y)
        ctx.quadraticCurveTo(x + w, y, x + w, y + r)
        ctx.lineTo(x + w, y + h - r)
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
        ctx.lineTo(x + r, y + h)
        ctx.quadraticCurveTo(x, y + h, x, y + h - r)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.closePath()
      }

      // Helper to draw card with CORS proxy fallback and border radius
      const drawCard = async (card, x, y, w, h, borderRadius = cardBorderRadius) => {
        if (!card?.imageUrl) {
          ctx.save()
          roundedClip(x, y, w, h, borderRadius)
          ctx.clip()
          ctx.fillStyle = '#333'
          ctx.fillRect(x, y, w, h)
          ctx.restore()
          ctx.fillStyle = '#888'
          ctx.font = '30px Barlow'
          ctx.textAlign = 'center'
          ctx.fillText(card?.name || 'Unknown', x + w / 2, y + h / 2)
          return
        }

        // Use high-res image URL if available
        const imageUrl = card.imageUrl.replace('/small/', '/large/').replace('/medium/', '/large/')

        const tryLoadImage = (url) => {
          return new Promise((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = url
          })
        }

        try {
          let img
          try {
            img = await tryLoadImage(imageUrl)
          } catch {
            // Try CORS proxy as fallback
            img = await tryLoadImage(`https://corsproxy.io/?${encodeURIComponent(imageUrl)}`)
          }

          // Draw with rounded corners
          ctx.save()
          roundedClip(x, y, w, h, borderRadius)
          ctx.clip()
          ctx.drawImage(img, x, y, w, h)
          ctx.restore()
        } catch {
          ctx.save()
          roundedClip(x, y, w, h, borderRadius)
          ctx.clip()
          ctx.fillStyle = '#333'
          ctx.fillRect(x, y, w, h)
          ctx.restore()
          ctx.fillStyle = '#888'
          ctx.font = '30px Barlow'
          ctx.textAlign = 'center'
          ctx.fillText(card?.name || 'Unknown', x + w / 2, y + h / 2)
        }
      }

      let currentY = padding

      // Draw title (H1)
      ctx.fillStyle = 'white'
      ctx.font = 'bold 70px Barlow'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const displayName = state.poolName || pool.name || `${pool.setCode} ${pool.poolType === 'draft' ? 'Draft' : 'Sealed'}`
      ctx.fillText(displayName, width / 2, currentY)
      currentY += titleHeight

      // Draw subtitle (H2) - Sealed Deck or Draft Deck, smaller and grey, tight to title
      const poolTypeLabel = pool.poolType === 'draft' ? 'Draft Deck' : 'Sealed Deck'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = '600 45px Barlow'
      ctx.fillText(poolTypeLabel, width / 2, currentY - 20)
      currentY += subtitleHeight

      // Draw "by [discord handle]" line
      const ownerName = pool.owner?.username || pool.owner?.name || 'Unknown'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '40px Barlow'
      ctx.fillText(`by ${ownerName}`, width / 2, currentY - 20)
      currentY += byLineHeight + sectionSpacing

      // Draw leader and base centered (landscape orientation)
      const totalLeaderBaseWidth = leaderBaseWidth * 2 + spacing
      const startX = (width - totalLeaderBaseWidth) / 2
      if (leaderCard) {
        await drawCard(leaderCard, startX, currentY, leaderBaseWidth, leaderBaseHeight, 20)
      }
      if (baseCard) {
        await drawCard(baseCard, startX + leaderBaseWidth + spacing, currentY, leaderBaseWidth, leaderBaseHeight, 20)
      }
      currentY += leaderBaseHeight + sectionSpacing

      // Draw "Deck" label
      ctx.fillStyle = 'white'
      ctx.font = 'bold 50px Barlow'
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

      // Draw footer
      const footerY = totalHeight - footerHeight - padding + 20

      // Created by text with date/time - bold and white
      const now = new Date()
      const dateStr = now.toLocaleDateString()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      ctx.fillStyle = 'white'
      ctx.font = 'bold 50px Barlow'
      ctx.textAlign = 'center'
      ctx.fillText(`Created by Protect the Pod on ${dateStr} at ${timeStr}`, width / 2, footerY)

      // URL to deckbuilder
      const deckUrl = `https://www.protectthepod.com/pool/${shareId}/deck`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '48px Barlow'
      ctx.fillText(deckUrl, width / 2, footerY + 80)

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
