'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../src/contexts/AuthContext'
import { initializeCardCache, getCachedCards } from '../../src/utils/cardCache'
import { getAspectColor } from '../../src/utils/aspectColors'
import './showcases.css'

export default function ShowcasesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showcases, setShowcases] = useState([])
  const [cardsData, setCardsData] = useState({})
  const [totalLeaders, setTotalLeaders] = useState(0)
  const [loadingShowcases, setLoadingShowcases] = useState(true)
  const [cardPositions, setCardPositions] = useState({})
  const [flippedCards, setFlippedCards] = useState({})
  const [draggingCard, setDraggingCard] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasDragged, setHasDragged] = useState(false)
  const containerRef = useRef(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Fetch showcase leaders and card data
  useEffect(() => {
    if (!user) return

    const fetchShowcases = async () => {
      try {
        // Initialize card cache to get image URLs
        await initializeCardCache()

        // Build a map of card id -> card data for all sets and count showcase leaders
        const cardMap = {}
        let showcaseLeaderCount = 0
        const sets = ['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC']
        sets.forEach(setCode => {
          const cards = getCachedCards(setCode) || []
          cards.forEach(card => {
            cardMap[card.id] = card
            if (card.isLeader && card.variantType === 'Showcase') {
              showcaseLeaderCount++
            }
          })
        })
        setCardsData(cardMap)
        setTotalLeaders(showcaseLeaderCount)

        const response = await fetch(`/api/users/${user.id}/showcase-leaders`)
        if (response.ok) {
          const result = await response.json()
          const leaders = result.data?.showcaseLeaders || result.showcaseLeaders || []
          setShowcases(leaders)

          // Initialize random positions for each card
          const positions = {}
          const containerWidth = window.innerWidth
          const containerHeight = window.innerHeight
          const cardWidth = 294  // landscape
          const cardHeight = 210
          const padding = 50

          leaders.forEach((leader, index) => {
            // Spread cards across the viewport with some randomness
            const gridCols = Math.ceil(Math.sqrt(leaders.length))
            const gridRows = Math.ceil(leaders.length / gridCols)
            const cellWidth = (containerWidth - padding * 2) / gridCols
            const cellHeight = (containerHeight - padding * 2) / gridRows

            const col = index % gridCols
            const row = Math.floor(index / gridCols)

            // Base position in grid cell with random offset
            const baseX = padding + col * cellWidth + (cellWidth - cardWidth) / 2
            const baseY = padding + row * cellHeight + (cellHeight - cardHeight) / 2

            // Add random offset and rotation
            const randomX = (Math.random() - 0.5) * cellWidth * 0.5
            const randomY = (Math.random() - 0.5) * cellHeight * 0.3
            const rotation = (Math.random() - 0.5) * 20 // -10 to 10 degrees

            positions[leader.id] = {
              x: Math.max(padding, Math.min(containerWidth - cardWidth - padding, baseX + randomX)),
              y: Math.max(padding, Math.min(containerHeight - cardHeight - padding, baseY + randomY)),
              rotation,
              zIndex: index + 1
            }
          })
          setCardPositions(positions)
        }
      } catch (error) {
        console.error('Failed to fetch showcases:', error)
      } finally {
        setLoadingShowcases(false)
      }
    }

    fetchShowcases()
  }, [user])

  // Handle card flip
  const handleCardClick = useCallback((cardId, e) => {
    // Don't flip if we were dragging
    if (hasDragged) return

    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }))
  }, [hasDragged])

  // Drag handlers
  const handleMouseDown = useCallback((cardId, e) => {
    e.preventDefault()
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()

    setDraggingCard(cardId)
    setHasDragged(false)
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })

    // Bring card to front
    setCardPositions(prev => {
      const maxZ = Math.max(...Object.values(prev).map(p => p.zIndex || 0))
      return {
        ...prev,
        [cardId]: {
          ...prev[cardId],
          zIndex: maxZ + 1
        }
      }
    })
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!draggingCard) return

    setHasDragged(true)

    const containerWidth = window.innerWidth
    const containerHeight = window.innerHeight
    const cardWidth = 294
    const cardHeight = 210

    setCardPositions(prev => ({
      ...prev,
      [draggingCard]: {
        ...prev[draggingCard],
        x: Math.max(0, Math.min(containerWidth - cardWidth, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(containerHeight - cardHeight, e.clientY - dragOffset.y))
      }
    }))
  }, [draggingCard, dragOffset])

  const handleMouseUp = useCallback((e) => {
    if (draggingCard) {
      e.preventDefault()
    }
    setDraggingCard(null)
  }, [draggingCard])

  // Touch handlers for mobile
  const handleTouchStart = useCallback((cardId, e) => {
    const touch = e.touches[0]
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()

    setDraggingCard(cardId)
    setHasDragged(false)
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    })

    setCardPositions(prev => {
      const maxZ = Math.max(...Object.values(prev).map(p => p.zIndex || 0))
      return {
        ...prev,
        [cardId]: {
          ...prev[cardId],
          zIndex: maxZ + 1
        }
      }
    })
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!draggingCard) return

    setHasDragged(true)

    const touch = e.touches[0]
    const containerWidth = window.innerWidth
    const containerHeight = window.innerHeight
    const cardWidth = 294
    const cardHeight = 210

    setCardPositions(prev => ({
      ...prev,
      [draggingCard]: {
        ...prev[draggingCard],
        x: Math.max(0, Math.min(containerWidth - cardWidth, touch.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(containerHeight - cardHeight, touch.clientY - dragOffset.y))
      }
    }))
  }, [draggingCard, dragOffset])

  const handleTouchEnd = useCallback(() => {
    setDraggingCard(null)
  }, [])

  // Global mouse/touch listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  if (loading || loadingShowcases) {
    return (
      <div className="showcases-page">
        <div className="showcases-loading">Loading your showcases...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (showcases.length === 0) {
    return (
      <div className="showcases-page">
        <div className="showcases-empty">
          <h2>No Showcase Leaders Yet</h2>
          <p>Play Sealed to find rare Showcase Leaders!</p>
          <p className="showcases-hint">Showcase leaders appear in approximately 1 in 288 packs.</p>
          <button className="showcases-back-button" onClick={() => router.push('/sets')}>
            Play Sealed
          </button>
        </div>
      </div>
    )
  }

  // Get card data including image URLs and aspect color
  const getCardData = (leader) => {
    const card = cardsData[leader.cardId]
    const aspectColor = card ? getAspectColor(card) : '#ffd700'
    return {
      frontImage: card?.imageUrl || `https://swudb.com/images/cards/${leader.setCode}/${String(leader.cardId).padStart(3, '0')}.png`,
      backImage: card?.backImageUrl || card?.imageUrl || `https://swudb.com/images/cards/${leader.setCode}/${String(leader.cardId).padStart(3, '0')}.png`,
      aspectColor
    }
  }

  return (
    <div className="showcases-page" ref={containerRef}>
      <div className="showcases-title">
        <svg className="shooting-star-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L9 9l-7 1 5 5-1.5 7L12 18l6.5 4L17 15l5-5-7-1-3-7z" fill="currentColor" opacity="0.3"/>
          <path d="M12 2L9 9l-7 1 5 5-1.5 7L12 18l6.5 4L17 15l5-5-7-1-3-7z"/>
          <line x1="2" y1="2" x2="6" y2="6" strokeLinecap="round"/>
          <line x1="4" y1="1" x2="5" y2="3" strokeLinecap="round"/>
        </svg>
        <span>Showcase Collection</span>
        <span className="showcases-count">{showcases.length}/{totalLeaders}</span>
      </div>

      {showcases.map((leader) => {
        const pos = cardPositions[leader.id] || { x: 100, y: 100, rotation: 0, zIndex: 1 }
        const isFlipped = flippedCards[leader.id]
        const isDragging = draggingCard === leader.id
        const cardData = getCardData(leader)

        return (
          <div
            key={leader.id}
            className={`showcase-card ${isFlipped ? 'flipped' : ''} ${isDragging ? 'dragging' : ''}`}
            style={{
              left: pos.x,
              top: pos.y,
              zIndex: pos.zIndex,
              transform: `rotate(${pos.rotation}deg)`,
              cursor: isDragging ? 'grabbing' : 'grab',
              '--aspect-color': cardData.aspectColor
            }}
            onMouseDown={(e) => handleMouseDown(leader.id, e)}
            onTouchStart={(e) => handleTouchStart(leader.id, e)}
            onClick={(e) => !isDragging && handleCardClick(leader.id, e)}
          >
            <div className="showcase-card-inner">
              <div className="showcase-card-front">
                <div className="showcase-card-image-container">
                  <img
                    src={cardData.frontImage}
                    alt={`${leader.cardName}${leader.cardSubtitle ? ` - ${leader.cardSubtitle}` : ''}`}
                    className="showcase-card-image"
                    draggable={false}
                  />
                  <div className="showcase-foil-effect"></div>
                </div>
              </div>
              <div className="showcase-card-back">
                <div className="showcase-card-image-container">
                  <img
                    src={cardData.backImage}
                    alt={`${leader.cardName} - Deployed`}
                    className="showcase-card-image"
                    draggable={false}
                  />
                  <div className="showcase-foil-effect"></div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
