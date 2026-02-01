/**
 * useDeckExport Hook
 *
 * Provides deck export functionality including JSON export, clipboard copy, and image generation.
 */

import { getBaseCardId } from '../utils/variantDowngrade'

export function useDeckExport({
  cardPositions,
  activeLeader,
  activeBase,
  leaderCard,
  baseCard,
  allSetCards,
  setCode,
  poolType,
  currentPoolName,
  poolOwnerUsername,
  setErrorMessage,
  setMessageType,
  setDeckImageModal,
}) {
  const isDraftMode = poolType === 'draft'

  // Build deck data structure for export (uses base card IDs for Karabast compatibility)
  const buildDeckData = () => {
    // Build set of leader/base IDs to filter from final output
    const leaderBaseIds = new Set()
    allSetCards.forEach(card => {
      if (card.type === 'Leader' || card.type === 'Base') {
        leaderBaseIds.add(getBaseCardId(card))
      }
    })

    // Get cards from deck and sideboard sections (excluding leaders and bases)
    const deckCards = Object.values(cardPositions)
      .filter(pos => pos.section === 'deck' && pos.visible && pos.enabled !== false && !pos.card.isBase && !pos.card.isLeader)
      .map(pos => pos.card)

    const sideboardCards = Object.values(cardPositions)
      .filter(pos => pos.section === 'sideboard' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
      .map(pos => pos.card)

    // Count cards by base ID, excluding leaders and bases
    const deckCounts = new Map()
    deckCards.forEach(card => {
      const id = getBaseCardId(card)
      if (!leaderBaseIds.has(id)) {
        deckCounts.set(id, (deckCounts.get(id) || 0) + 1)
      }
    })

    const sideboardCounts = new Map()
    sideboardCards.forEach(card => {
      const id = getBaseCardId(card)
      if (!leaderBaseIds.has(id)) {
        sideboardCounts.set(id, (sideboardCounts.get(id) || 0) + 1)
      }
    })

    return {
      leader: leaderCard ? { id: getBaseCardId(leaderCard), count: 1 } : null,
      base: baseCard ? { id: getBaseCardId(baseCard), count: 1 } : null,
      deck: Array.from(deckCounts.entries()).map(([id, count]) => ({ id, count })),
      sideboard: Array.from(sideboardCounts.entries()).map(([id, count]) => ({ id, count }))
    }
  }

  // Export as JSON
  const exportJSON = () => {
    if (!activeLeader || !activeBase) {
      const missing = []
      if (!activeLeader) missing.push('leader')
      if (!activeBase) missing.push('base')
      setErrorMessage(`Please select a ${missing.join(' and ')} before exporting.`)
      setMessageType('error')
      setTimeout(() => {
        setErrorMessage(null)
        setMessageType(null)
      }, 5000)
      return
    }

    setErrorMessage(null)
    setMessageType(null)
    const deckData = buildDeckData()

    const poolDisplayName = currentPoolName || `${setCode} ${isDraftMode ? 'Draft' : 'Sealed'}`
    const exportData = {
      metadata: {
        name: `[PTP] ${poolDisplayName}`,
        author: "Protect the Pod"
      },
      leader: deckData.leader,
      base: deckData.base,
      deck: deckData.deck,
      sideboard: deckData.sideboard
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `[PTP ${poolType === 'draft' ? 'DRAFT' : 'SEALED'}] ${poolDisplayName} Deck.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Copy JSON to clipboard
  const copyJSON = async () => {
    if (!activeLeader || !activeBase) {
      const missing = []
      if (!activeLeader) missing.push('leader')
      if (!activeBase) missing.push('base')
      setErrorMessage(`Please select a ${missing.join(' and ')} before copying.`)
      setMessageType('error')
      setTimeout(() => {
        setErrorMessage(null)
        setMessageType(null)
      }, 5000)
      return
    }

    setErrorMessage(null)
    setMessageType(null)
    const deckData = buildDeckData()

    const poolDisplayName = currentPoolName || `${setCode} ${isDraftMode ? 'Draft' : 'Sealed'}`
    const exportData = {
      metadata: {
        name: `[PTP] ${poolDisplayName}`,
        author: "Protect the Pod"
      },
      leader: deckData.leader,
      base: deckData.base,
      deck: deckData.deck,
      sideboard: deckData.sideboard
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    try {
      await navigator.clipboard.writeText(jsonString)
      setErrorMessage('JSON copied to clipboard!')
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

  // Export deck as image
  const exportDeckImage = async () => {
    try {
      setErrorMessage('Generating image...')
      setMessageType('success')

      // Sort by cost for deck image export
      const costSort = (a, b) => {
        const costA = a.cost !== null && a.cost !== undefined ? a.cost : 999
        const costB = b.cost !== null && b.cost !== undefined ? b.cost : 999
        if (costA !== costB) return costA - costB
        const nameA = (a.name || '').toLowerCase()
        const nameB = (b.name || '').toLowerCase()
        return nameA.localeCompare(nameB)
      }

      // Get sorted deck and sideboard cards with duplicates
      const deckCards = Object.values(cardPositions)
        .filter(pos => pos.section === 'deck' && pos.visible && pos.enabled !== false && !pos.card.isBase && !pos.card.isLeader)
        .map(pos => pos.card)
        .sort(costSort)

      const sideboardCards = Object.values(cardPositions)
        .filter(pos => pos.section === 'sideboard' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
        .map(pos => pos.card)
        .sort(costSort)

      const selectedLeader = leaderCard
      const selectedBase = baseCard

      // Canvas dimensions
      const padding = 40
      const cardWidth = 150
      const cardHeight = 210
      const spacing = 10
      const titleHeight = 50
      const labelHeight = 40
      const sectionSpacing = 30
      const leaderBaseWidth = 180
      const leaderBaseHeight = 252
      const cardsPerRow = 8
      const deckRows = Math.ceil(deckCards.length / cardsPerRow)
      const sideboardRows = Math.ceil(sideboardCards.length / cardsPerRow)
      const hasLeaderBase = selectedLeader || selectedBase
      const footerHeight = poolOwnerUsername ? 100 : 70

      const width = padding * 2 + cardsPerRow * cardWidth + (cardsPerRow - 1) * spacing
      const totalHeight = padding * 2 +
        titleHeight + sectionSpacing +
        (hasLeaderBase ? leaderBaseHeight + sectionSpacing : 0) +
        labelHeight + deckRows * (cardHeight + spacing) + sectionSpacing +
        labelHeight + sideboardRows * (cardHeight + spacing) + sectionSpacing +
        footerHeight

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = totalHeight
      const ctx = canvas.getContext('2d')

      // Dark background
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, width, totalHeight)

      // Draw grid pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
      ctx.lineWidth = 1
      const gridSize = 20
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, totalHeight)
        ctx.stroke()
      }
      for (let y = 0; y < totalHeight; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      let currentY = padding

      // Helper to draw a single card
      const drawCard = (card, x, y, width, height, count, grayscale) => {
        return new Promise((resolve) => {
          const imageUrl = card.frontArt || '/card-back.png'

          const drawPlaceholder = () => {
            ctx.fillStyle = '#333'
            ctx.fillRect(x, y, width, height)
            ctx.strokeStyle = '#555'
            ctx.strokeRect(x, y, width, height)
            ctx.fillStyle = '#888'
            ctx.font = '10px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(card.name || 'Unknown', x + width / 2, y + height / 2)
            resolve()
          }

          // Try to load image via blob (better for CORS)
          const loadImageViaBlob = async () => {
            const img = new Image()
            const timeoutId = setTimeout(() => {
              console.warn(`Image load timeout for ${card.name}`)
              drawPlaceholder()
            }, 5000)

            img.onload = () => {
              clearTimeout(timeoutId)
              try {
                if (grayscale) {
                  const tempCanvas = document.createElement('canvas')
                  tempCanvas.width = width
                  tempCanvas.height = height
                  const tempCtx = tempCanvas.getContext('2d')
                  tempCtx.drawImage(img, 0, 0, width, height)
                  const imageData = tempCtx.getImageData(0, 0, width, height)
                  const data = imageData.data
                  for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
                    data[i] = avg
                    data[i + 1] = avg
                    data[i + 2] = avg
                  }
                  tempCtx.putImageData(imageData, 0, 0)
                  ctx.drawImage(tempCanvas, x, y, width, height)
                } else {
                  ctx.drawImage(img, x, y, width, height)
                }

                // Draw count badge if count > 1
                if (count && count > 1) {
                  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
                  ctx.beginPath()
                  ctx.arc(x + width - 15, y + height - 15, 12, 0, Math.PI * 2)
                  ctx.fill()
                  ctx.fillStyle = 'white'
                  ctx.font = 'bold 14px Arial'
                  ctx.textAlign = 'center'
                  ctx.textBaseline = 'middle'
                  ctx.fillText(count.toString(), x + width - 15, y + height - 15)
                }

                resolve()
              } catch (error) {
                console.error(`Error drawing card ${card.name}:`, error)
                drawPlaceholder()
              }
            }

            img.onerror = () => {
              clearTimeout(timeoutId)
              console.warn(`Image load error for ${card.name}: ${imageUrl}`)
              drawPlaceholder()
            }

            img.crossOrigin = 'anonymous'
            img.src = imageUrl
          }

          loadImageViaBlob()
        })
      }

      currentY = padding

      // Draw title at top
      ctx.fillStyle = 'white'
      ctx.font = 'bold 32px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(`Sealed Pod (${setCode})`, width / 2, currentY)
      currentY += titleHeight + sectionSpacing

      // Draw selected leader and base at top, centered in one row
      if (selectedLeader || selectedBase) {
        const totalWidth = (selectedLeader ? leaderBaseWidth : 0) + (selectedBase ? leaderBaseWidth : 0) + (selectedLeader && selectedBase ? spacing : 0)
        const startX = (width - totalWidth) / 2
        let x = startX
        if (selectedLeader) {
          await drawCard(selectedLeader, x, currentY, leaderBaseWidth, leaderBaseHeight, null, false)
          x += leaderBaseWidth + spacing
        }
        if (selectedBase) {
          await drawCard(selectedBase, x, currentY, leaderBaseWidth, leaderBaseHeight, null, false)
        }
        currentY += leaderBaseHeight + sectionSpacing
      }

      // Draw "Deck" section label
      ctx.fillStyle = 'white'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('Deck', padding, currentY)
      currentY += labelHeight

      // Draw deck cards (in color)
      let col = 0
      let row = 0
      for (const card of deckCards) {
        const x = padding + col * (cardWidth + spacing)
        const y = currentY + row * (cardHeight + spacing)
        await drawCard(card, x, y, cardWidth, cardHeight, null, false)
        col++
        if (col >= cardsPerRow) {
          col = 0
          row++
        }
      }
      currentY += deckRows * (cardHeight + spacing) + sectionSpacing

      // Draw "Sideboard" section label
      ctx.fillStyle = 'white'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('Sideboard', padding, currentY)
      currentY += labelHeight

      // Draw sideboard cards (in grayscale)
      col = 0
      row = 0
      for (const card of sideboardCards) {
        const x = padding + col * (cardWidth + spacing)
        const y = currentY + row * (cardHeight + spacing)
        await drawCard(card, x, y, cardWidth, cardHeight, null, true)
        col++
        if (col >= cardsPerRow) {
          col = 0
          row++
        }
      }
      currentY += sideboardRows * (cardHeight + spacing) + sectionSpacing

      // Draw pool name and timestamp at bottom
      const now = new Date()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      let hours = now.getHours()
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const ampm = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12
      hours = hours ? hours : 12
      const timeStr = `${month}/${day} ${hours}:${minutes} ${ampm}`

      const displayName = currentPoolName || `${setCode} ${poolType === 'draft' ? 'Draft' : 'Sealed'}`

      // Draw pool name
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(displayName, width / 2, totalHeight - padding / 2 - 40)

      // Draw "by {username}" if available
      if (poolOwnerUsername) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.font = '20px Arial'
        ctx.fillText(`by ${poolOwnerUsername}`, width / 2, totalHeight - padding / 2 - 15)
      }

      // Draw timestamp below name
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = '18px Arial'
      ctx.fillText(timeStr, width / 2, totalHeight - padding / 2)

      // Show image in modal instead of downloading
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        setDeckImageModal(url)
        setErrorMessage('Image generated!')
        setMessageType('success')
        setTimeout(() => {
          setErrorMessage(null)
          setMessageType(null)
        }, 3000)
      }, 'image/png')

    } catch (error) {
      console.error('Error generating deck image:', error)
      setErrorMessage('Failed to generate image')
      setMessageType('error')
      setTimeout(() => {
        setErrorMessage(null)
        setMessageType(null)
      }, 3000)
    }
  }

  return {
    buildDeckData,
    exportJSON,
    copyJSON,
    exportDeckImage,
  }
}

export default useDeckExport
