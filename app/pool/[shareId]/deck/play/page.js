'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadPool, updatePool, claimPool } from '../../../../../src/utils/poolApi'
import { getPackArtUrl } from '../../../../../src/utils/packArt'
import { getSetConfig } from '../../../../../src/utils/setConfigs'
import { useAuth } from '../../../../../src/contexts/AuthContext'
import EditableTitle from '../../../../../src/components/EditableTitle'
import { getCachedCards, initializeCardCache } from '../../../../../src/utils/cardCache'
import { buildBaseCardMap, getBaseCardId } from '../../../../../src/utils/variantDowngrade'
import { jsonParse } from '../../../../../src/utils/json'
import { defaultSort } from '../../../../../src/services/cards/cardSorting'
import '../../../../../src/App.css'
import './play.css'

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
  const [claiming, setClaiming] = useState(false)

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

  // Auto-claim anonymous pool when user logs in
  useEffect(() => {
    if (!user || !pool || !shareId) return
    // Only claim if pool is anonymous (no owner)
    if (pool.owner !== null) return

    async function tryClaimPool() {
      setClaiming(true)
      try {
        const result = await claimPool(shareId)
        if (result.claimed) {
          // Refresh pool data to get updated owner
          const updatedPool = await loadPool(shareId)
          setPool(updatedPool)
          setMessage('This deck is now saved to your account!')
          setMessageType('success')
          setTimeout(() => { setMessage(null); setMessageType(null) }, 5000)
        }
      } catch (err) {
        console.error('Failed to claim pool:', err)
        // Don't show error - claiming is a nice-to-have
      } finally {
        setClaiming(false)
      }
    }
    tryClaimPool()
  }, [user, pool?.owner, shareId])

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

    const state = jsonParse(pool.deckBuilderState)

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

    // Get all cards from deck and sideboard sections (excluding leaders and bases)
    const deckCards = Object.values(cardPositions)
      .filter(pos => pos.section === 'deck' && pos.enabled !== false && !pos.card.isBase && !pos.card.isLeader)
      .map(pos => pos.card)

    const sideboardCards = Object.values(cardPositions)
      .filter(pos => pos.section === 'sideboard' && !pos.card.isBase && !pos.card.isLeader)
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
    a.download = `[PTP ${pool?.poolType === 'draft' ? 'DRAFT' : 'SEALED'}] ${pool?.setCode || 'deck'} Deck.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportDeckImage = async () => {
    console.log('=== exportDeckImage called ===')
    console.log('Pool exists:', !!pool)
    console.log('DeckBuilderState exists:', !!pool?.deckBuilderState)
    if (!pool?.deckBuilderState) {
      setMessage('No deck data found. Please build your deck first.')
      setMessageType('error')
      setTimeout(() => { setMessage(null); setMessageType(null) }, 3000)
      return
    }

    setGeneratingImage(true)
    console.log('=== Starting image generation ===')

    try {
      const state = jsonParse(pool.deckBuilderState)

      console.log('State parsed successfully')
      console.log('cardPositions exists:', !!state.cardPositions)
      console.log('activeLeader:', state.activeLeader)
      console.log('activeBase:', state.activeBase)

      const { cardPositions, activeLeader, activeBase } = state
      if (!cardPositions || !activeLeader || !activeBase) {
        console.log('Missing required state:', { hasPositions: !!cardPositions, hasLeader: !!activeLeader, hasBase: !!activeBase })
        setMessage('Please select a leader and base first.')
        setMessageType('error')
        setTimeout(() => { setMessage(null); setMessageType(null) }, 3000)
        setGeneratingImage(false)
        return
      }

      const leaderCard = cardPositions[activeLeader]?.card
      const baseCard = cardPositions[activeBase]?.card

      console.log('Leader/base lookup done')
      // Debug logging
      console.log('=== Deck Image Export Debug ===')
      console.log('Total positions:', Object.keys(cardPositions).length)
      console.log('Active leader ID:', activeLeader)
      console.log('Active base ID:', activeBase)
      console.log('Leader card:', leaderCard?.name, 'imageUrl:', leaderCard?.imageUrl)
      console.log('Base card:', baseCard?.name, 'imageUrl:', baseCard?.imageUrl)

      // Get deck cards only (no sideboard), sorted by default sort (aspect combo -> type -> cost -> name)
      const deckCards = Object.values(cardPositions)
        .filter(pos => pos.section === 'deck' && !pos.card.isBase && !pos.card.isLeader && pos.enabled !== false)
        .map(pos => pos.card)
        .sort(defaultSort)

      console.log('Deck cards found:', deckCards.length)
      console.log('First 3 deck cards:', deckCards.slice(0, 3).map(c => ({ name: c.name, imageUrl: c.imageUrl })))
      console.log('Cards missing imageUrl:', deckCards.filter(c => !c.imageUrl).map(c => c.name))

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
      ctx.fillStyle = 'rgb(76, 77, 81)'
      ctx.fillRect(0, 0, width, totalHeight)

      // Load set art and texture pattern
      const loadImage = async (url) => {
        try {
          const response = await fetch(url)
          const blob = await response.blob()
          const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsDataURL(blob)
          })
          return await new Promise((resolve) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = () => resolve(null)
            img.src = dataUrl
          })
        } catch {
          return null
        }
      }

      // Load both images
      const setArtUrl = pool?.setCode ? getPackArtUrl(pool.setCode) : null
      const [setArtImg, bgImg] = await Promise.all([
        setArtUrl ? loadImage(setArtUrl) : null,
        loadImage('/background-images/bg-texture-crop.png')
      ])

      // Calculate set art height: natural height at canvas width, minus 80px crop
      const cropAmount = 80
      const topShift = 15 // shift image up, clipping top 15px
      let setArtHeight = 300 // fallback
      if (setArtImg && setArtImg.width > 0) {
        // Natural height if image fills canvas width
        const naturalHeight = Math.round(width / (setArtImg.width / setArtImg.height))
        setArtHeight = naturalHeight - cropAmount
      }

      // Draw texture pattern starting at the crop point
      if (bgImg && bgImg.width > 0) {
        const scaledWidth = bgImg.width * 1.5
        const scaledHeight = bgImg.height * 1.5
        // Tile starting from where set art is cropped
        for (let y = setArtHeight; y < totalHeight; y += scaledHeight) {
          for (let x = 0; x < width; x += scaledWidth) {
            ctx.drawImage(bgImg, x, y, scaledWidth, scaledHeight)
          }
        }
        // Dark overlay on texture area (0.8 opacity)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.fillRect(0, setArtHeight, width, totalHeight - setArtHeight)

        // Fade at top of texture (blends with set art bottom)
        const textureFadeHeight = 150
        const textureFadeGrad = ctx.createLinearGradient(0, setArtHeight, 0, setArtHeight + textureFadeHeight)
        textureFadeGrad.addColorStop(0, 'rgb(9, 9, 9)')
        textureFadeGrad.addColorStop(1, 'rgba(9, 9, 9, 0)')
        ctx.fillStyle = textureFadeGrad
        ctx.fillRect(0, setArtHeight, width, textureFadeHeight)

        // Left fade on texture
        const textureSideFadeWidth = 200
        const textureLeftGrad = ctx.createLinearGradient(0, 0, textureSideFadeWidth, 0)
        textureLeftGrad.addColorStop(0, 'rgb(9, 9, 9)')
        textureLeftGrad.addColorStop(1, 'rgba(9, 9, 9, 0)')
        ctx.fillStyle = textureLeftGrad
        ctx.fillRect(0, setArtHeight, textureSideFadeWidth, totalHeight - setArtHeight)

        // Right fade on texture
        const textureRightGrad = ctx.createLinearGradient(width - textureSideFadeWidth, 0, width, 0)
        textureRightGrad.addColorStop(0, 'rgba(9, 9, 9, 0)')
        textureRightGrad.addColorStop(1, 'rgb(9, 9, 9)')
        ctx.fillStyle = textureRightGrad
        ctx.fillRect(width - textureSideFadeWidth, setArtHeight, textureSideFadeWidth, totalHeight - setArtHeight)

        // Bottom fade on texture
        const textureBottomFadeHeight = 200
        const textureBottomGrad = ctx.createLinearGradient(0, totalHeight - textureBottomFadeHeight, 0, totalHeight)
        textureBottomGrad.addColorStop(0, 'rgba(9, 9, 9, 0)')
        textureBottomGrad.addColorStop(1, 'rgb(9, 9, 9)')
        ctx.fillStyle = textureBottomGrad
        ctx.fillRect(0, totalHeight - textureBottomFadeHeight, width, textureBottomFadeHeight)
      }

      // Draw set art at top (cropped - bottom 80px removed)
      if (setArtImg && setArtImg.width > 0) {
        // Fill set art area with dark first
        ctx.fillStyle = 'rgb(9, 9, 9)'
        ctx.fillRect(0, 0, width, setArtHeight)

        // Draw set art at natural ratio, shifted up and cropped
        const naturalHeight = setArtHeight + cropAmount + topShift
        ctx.drawImage(setArtImg, 0, -topShift, width, naturalHeight)

        // Dark overlay on set art (0.8 opacity) - extend 40px to fully cover image
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.fillRect(0, 0, width, setArtHeight + 100)

        // Top fade on set art: rgb(9,9,9) at 0% -> transparent at ~18%
        const topFadeEnd = Math.round(setArtHeight * 0.18)
        const topGrad = ctx.createLinearGradient(0, 0, 0, topFadeEnd)
        topGrad.addColorStop(0, 'rgb(9, 9, 9)')
        topGrad.addColorStop(1, 'rgba(9, 9, 9, 0)')
        ctx.fillStyle = topGrad
        ctx.fillRect(0, 0, width, topFadeEnd)

        // Bottom fade on set art ending at crop point
        const bottomFadeHeight = 250
        const bottomFadeStart = setArtHeight - bottomFadeHeight
        const bottomGrad = ctx.createLinearGradient(0, bottomFadeStart, 0, setArtHeight)
        bottomGrad.addColorStop(0, 'rgba(9, 9, 9, 0)')
        bottomGrad.addColorStop(0.2, 'rgba(9, 9, 9, 0.2)')
        bottomGrad.addColorStop(0.4, 'rgba(9, 9, 9, 0.5)')
        bottomGrad.addColorStop(0.6, 'rgba(9, 9, 9, 0.8)')
        bottomGrad.addColorStop(0.8, 'rgba(9, 9, 9, 0.95)')
        bottomGrad.addColorStop(1, 'rgb(9, 9, 9)')
        ctx.fillStyle = bottomGrad
        ctx.fillRect(0, bottomFadeStart, width, bottomFadeHeight)

        // Left fade on set art (extend to cover the full overlay area)
        const sideFadeWidth = 200
        const setArtWithOverlay = setArtHeight + 100
        const leftGrad = ctx.createLinearGradient(0, 0, sideFadeWidth, 0)
        leftGrad.addColorStop(0, 'rgb(9, 9, 9)')
        leftGrad.addColorStop(1, 'rgba(9, 9, 9, 0)')
        ctx.fillStyle = leftGrad
        ctx.fillRect(0, 0, sideFadeWidth, setArtWithOverlay)

        // Right fade on set art
        const rightGrad = ctx.createLinearGradient(width - sideFadeWidth, 0, width, 0)
        rightGrad.addColorStop(0, 'rgba(9, 9, 9, 0)')
        rightGrad.addColorStop(1, 'rgb(9, 9, 9)')
        ctx.fillStyle = rightGrad
        ctx.fillRect(width - sideFadeWidth, 0, sideFadeWidth, setArtWithOverlay)
      } else {
        // No set art - just fill top with dark
        ctx.fillStyle = 'rgb(9, 9, 9)'
        ctx.fillRect(0, 0, width, setArtHeight)
      }

      // Bottom fade for entire image
      const overallBottomFadeStart = Math.round(totalHeight * 0.78)
      const overallBottomFadeEnd = Math.round(totalHeight * 0.93)
      const overallBottomGrad = ctx.createLinearGradient(0, overallBottomFadeStart, 0, overallBottomFadeEnd)
      overallBottomGrad.addColorStop(0, 'rgba(9, 9, 9, 0)')
      overallBottomGrad.addColorStop(1, 'rgb(9, 9, 9)')
      ctx.fillStyle = overallBottomGrad
      ctx.fillRect(0, overallBottomFadeStart, width, overallBottomFadeEnd - overallBottomFadeStart)
      ctx.fillStyle = 'rgb(9, 9, 9)'
      ctx.fillRect(0, overallBottomFadeEnd, width, totalHeight - overallBottomFadeEnd)


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

      // Helper to draw card with multiple CORS proxy fallbacks and border radius
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

        // Try loading via fetch + blob URL (better CORS handling)
        const tryLoadViaFetch = async (url) => {
          const response = await fetch(url)
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const blob = await response.blob()
          const blobUrl = URL.createObjectURL(blob)
          return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
              URL.revokeObjectURL(blobUrl)
              resolve(img)
            }
            img.onerror = () => {
              URL.revokeObjectURL(blobUrl)
              reject(new Error('Failed to load blob image'))
            }
            img.src = blobUrl
          })
        }

        try {
          let img
          // Always use our own API proxy to avoid CORS issues
          const corsProxies = [
            `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
          ]

          for (const proxyUrl of corsProxies) {
            try {
              // Try image loading first
              img = await tryLoadImage(proxyUrl)
              break
            } catch {
              try {
                // Try fetch approach for this URL
                img = await tryLoadViaFetch(proxyUrl)
                break
              } catch {
                // Continue to next proxy
              }
            }
          }

          if (img) {
            // Draw with rounded corners
            ctx.save()
            roundedClip(x, y, w, h, borderRadius)
            ctx.clip()
            ctx.drawImage(img, x, y, w, h)
            ctx.restore()
          } else {
            throw new Error('All image loading methods failed')
          }
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
      console.log('=== Starting to draw', deckCards.length, 'deck cards ===')
      let col = 0
      let row = 0
      let cardsDrawn = 0
      for (const card of deckCards) {
        const x = padding + col * (cardWidth + spacing)
        const y = currentY + row * (cardHeight + spacing)
        await drawCard(card, x, y, cardWidth, cardHeight)
        cardsDrawn++
        if (cardsDrawn % 10 === 0) {
          console.log(`Drawn ${cardsDrawn}/${deckCards.length} cards`)
        }
        col++
        if (col >= cardsPerRow) {
          col = 0
          row++
        }
      }
      console.log('=== Finished drawing all deck cards ===')

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
      console.log('=== Drawing complete, creating blob ===')
      canvas.toBlob((blob) => {
        console.log('=== Blob created:', blob?.size, 'bytes ===')
        const url = URL.createObjectURL(blob)
        console.log('=== Blob URL created:', url, '===')
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
      const state = jsonParse(pool.deckBuilderState)
      if (state?.poolName) return state.poolName
    }
    return pool?.name || `${setConfig?.setName || pool?.setCode} Deck`
  }
  const poolName = getPoolName()

  const handleRenamePool = async (newName) => {
    if (!shareId) return
    try {
      // Get current deckBuilderState and update poolName in it
      const currentState = jsonParse(pool?.deckBuilderState, {})
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

        {/* Login banner for logged-out users */}
        {!user && (
          <div className="login-banner">
            <div className="login-banner-content">
              <div className="login-banner-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="login-banner-text">
                <h3>Save Your Deck</h3>
                <p>Login with Discord to permanently save this deck to your account. You'll be able to access it from any device and see it in your deck history.</p>
              </div>
              <a
                href={`/api/auth/login?redirect=${encodeURIComponent(`/pool/${shareId}/deck/play`)}`}
                className="login-banner-button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Login with Discord
              </a>
            </div>
          </div>
        )}

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
                  const prefix = pool?.poolType === 'draft' ? 'ptp_draft' : 'ptp_sealed'
                  a.download = `${prefix}_${sanitizedName}_deck.png`
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
