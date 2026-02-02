'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Button from './Button'
import './PackOpeningAnimation.css'

export default function PackOpeningAnimation({
  packCount = 6,
  packImageUrl = '/pack-images/default-pack.png',
  cardBackUrl = '/card-images/card-back.png',
  onComplete,
  packs = null,
}) {
  const [openedPacks, setOpenedPacks] = useState([])
  const [flyingCards, setFlyingCards] = useState([])
  const [phase, setPhase] = useState('entering')
  const [hoveredCard, setHoveredCard] = useState(null)
  const [hoveredCardPosition, setHoveredCardPosition] = useState(null)
  const [isOpeningAll, setIsOpeningAll] = useState(false)
  const [allPacksOpened, setAllPacksOpened] = useState(false)
  const [clickedPacks, setClickedPacks] = useState([])
  const [isMobile, setIsMobile] = useState(false)
  const [currentPackIndex, setCurrentPackIndex] = useState(0)
  const containerRef = useRef(null)
  const animationCompleteRef = useRef(false)
  const packsRef = useRef(packs)
  const openAllIndexRef = useRef(0)

  // Keep packs ref updated
  useEffect(() => {
    packsRef.current = packs
  }, [packs])

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      window.scrollTo(0, 0)
    }
  }, [])

  // Calculate layout values - card sizes match DeckBuilder
  const getLayoutValues = useCallback(() => {
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
    const mobile = screenWidth <= 768

    // Mobile: smaller cards to fit 5 per row with gaps
    // Desktop: original sizes
    const cardWidth = mobile ? Math.floor((screenWidth - 48) / 5) : 120
    const cardHeight = cardWidth * (3.5 / 2.5) // aspect ratio 2.5 / 3.5
    // Leaders/bases: width = height of regular cards, displayed landscape
    const leaderWidth = mobile ? Math.floor((screenWidth - 24) / 2.5) : cardHeight
    const leaderHeight = mobile ? leaderWidth * (2.5 / 3.5) : cardWidth
    const cardGap = mobile ? 6 : 10

    return { screenHeight, screenWidth, cardHeight, cardWidth, leaderWidth, leaderHeight, cardGap, mobile }
  }, [])

  // Show packs on mount
  useEffect(() => {
    setPhase('entering')
    setOpenedPacks([])
    setClickedPacks([])
    setFlyingCards([])
    setAllPacksOpened(false)

    const timer = setTimeout(() => setPhase('presenting'), 300)
    return () => clearTimeout(timer)
  }, [])

  // Layout values for packs (one row) - same size as cards
  const packWidth = 120
  const packHeight = packWidth * (3.5 / 2.5) // same aspect ratio as cards
  const packGap = 10

  // Open a specific pack
  const openPack = useCallback((packIndex) => {
    if (clickedPacks.includes(packIndex)) return

    // Track clicked pack immediately
    setClickedPacks(prev => [...prev, packIndex])

    // Hide pack after delay (faster on mobile) and advance carousel on mobile
    setTimeout(() => {
      setOpenedPacks(prev => [...prev, packIndex])
      // On mobile, advance to next pack in carousel
      if (isMobile && packIndex < packCount - 1) {
        setCurrentPackIndex(packIndex + 1)
      }
    }, isMobile ? 600 : 1000)

    // Check if this is the last pack
    if (clickedPacks.length + 1 === packCount) {
      setTimeout(() => {
        setAllPacksOpened(true)
        setPhase('ready')
      }, 600)
    }

    // Play card mixing sound at 4x speed
    if (typeof window !== 'undefined') {
      const sound = new Audio('/sounds/card-mixing.mp3')
      sound.volume = 0.5
      sound.preservesPitch = false
      sound.playbackRate = 4.0
      // Ensure playbackRate is set before playing
      sound.addEventListener('canplaythrough', () => {
        sound.playbackRate = 4.0
        sound.play().catch(() => {})
      }, { once: true })
      sound.load()
    }

    // Clear existing cards
    setFlyingCards([])

    const { screenWidth, screenHeight, cardHeight, cardWidth, leaderWidth, leaderHeight, cardGap, mobile } = getLayoutValues()

    // Calculate the position of the pack being opened
    let packX, packY
    if (mobile) {
      // Mobile: pack is centered at bottom
      packX = screenWidth / 2
      packY = screenHeight - 100
    } else {
      // Desktop: packs in row
      const totalPacksWidth = packCount * packWidth + (packCount - 1) * packGap
      const packStartXCalc = (screenWidth - totalPacksWidth) / 2
      const packsY = screenHeight - 354
      packX = packStartXCalc + packIndex * (packWidth + packGap) + packWidth / 2
      packY = packsY + packHeight / 2
    }

    // Cards layout
    const currentPacks = packsRef.current
    const packCards = currentPacks?.[packIndex]?.cards || []
    const cardCount = Math.min(packCards.length || 16, 16)

    const newCards = []

    if (mobile) {
      // MOBILE LAYOUT: 4 rows
      // Row 1: 2 leaders/bases (landscape)
      // Row 2: 5 cards
      // Row 3: 5 cards
      // Row 4: 4 cards
      const rowGap = 8
      const cardsStartY = 60

      // Row 1: Leaders/bases
      const row1Width = 2 * leaderWidth + cardGap
      const row1StartX = (screenWidth - row1Width) / 2
      const row1Y = cardsStartY + leaderHeight / 2

      // Rows 2-4: Regular cards (5, 5, 4)
      const row2CardsPerRow = 5
      const row3CardsPerRow = 5
      const row4CardsPerRow = 4
      const regularRowWidth = row2CardsPerRow * cardWidth + (row2CardsPerRow - 1) * cardGap
      const row2StartX = (screenWidth - regularRowWidth) / 2
      const row3StartX = (screenWidth - regularRowWidth) / 2
      const row4Width = row4CardsPerRow * cardWidth + (row4CardsPerRow - 1) * cardGap
      const row4StartX = (screenWidth - row4Width) / 2

      const row2Y = row1Y + leaderHeight / 2 + rowGap + cardHeight / 2
      const row3Y = row2Y + cardHeight + rowGap
      const row4Y = row3Y + cardHeight + rowGap

      for (let k = 0; k < cardCount; k++) {
        const card = packCards[k]
        const isLeaderOrBase = k < 2
        const w = isLeaderOrBase ? leaderWidth : cardWidth
        const h = isLeaderOrBase ? leaderHeight : cardHeight

        let endX, endY
        if (k < 2) {
          // Row 1: Leaders/bases
          endX = row1StartX + k * (leaderWidth + cardGap) + leaderWidth / 2
          endY = row1Y
        } else if (k < 7) {
          // Row 2: indices 2-6 (5 cards)
          const col = k - 2
          endX = row2StartX + col * (cardWidth + cardGap) + cardWidth / 2
          endY = row2Y
        } else if (k < 12) {
          // Row 3: indices 7-11 (5 cards)
          const col = k - 7
          endX = row3StartX + col * (cardWidth + cardGap) + cardWidth / 2
          endY = row3Y
        } else {
          // Row 4: indices 12-15 (4 cards)
          const col = k - 12
          endX = row4StartX + col * (cardWidth + cardGap) + cardWidth / 2
          endY = row4Y
        }

        newCards.push({
          id: `c-${packIndex}-${k}-${Date.now()}-${Math.random()}`,
          startX: packX, startY: packY,
          endX, endY,
          delay: k * 40,
          rotation: (Math.random() - 0.5) * 10,
          revealed: false,
          cardImageUrl: card?.imageUrl || null,
          backImageUrl: card?.backImageUrl || null,
          isLeader: card?.isLeader || false,
          packIndex,
          isLeaderOrBase,
          width: w, height: h,
          isFoil: card?.isFoil || false,
          isShowcase: card?.isShowcase || false,
        })
      }
    } else {
      // DESKTOP LAYOUT: 2 rows of 8
      const cardsStartY = 100
      const rowGap = 15
      const cardsPerRow = 8

      // Row 1: 2 leaders + 6 regular
      const row1LeaderCount = 2
      const row1RegularCount = cardsPerRow - row1LeaderCount
      const row1Width = row1LeaderCount * leaderWidth + row1RegularCount * cardWidth + (cardsPerRow - 1) * cardGap
      const row2Width = cardsPerRow * cardWidth + (cardsPerRow - 1) * cardGap

      const row1StartX = (screenWidth - row1Width) / 2
      const row2StartX = (screenWidth - row2Width) / 2

      const row1Y = cardsStartY + leaderHeight / 2
      const row2Y = row1Y + leaderHeight / 2 + rowGap + cardHeight / 2

      for (let k = 0; k < cardCount; k++) {
        const row = Math.floor(k / cardsPerRow)
        const col = k % cardsPerRow
        const isLeaderOrBase = k < 2
        const w = isLeaderOrBase ? leaderWidth : cardWidth
        const h = isLeaderOrBase ? leaderHeight : cardHeight
        const card = packCards[k]

        let endX, endY
        if (row === 0) {
          // First row - account for leader widths
          let xOffset = 0
          for (let j = 0; j < col; j++) {
            xOffset += (j < 2 ? leaderWidth : cardWidth) + cardGap
          }
          endX = row1StartX + xOffset + w / 2
          endY = row1Y
        } else {
          // Second row - all same width
          endX = row2StartX + col * (cardWidth + cardGap) + cardWidth / 2
          endY = row2Y
        }

        newCards.push({
          id: `c-${packIndex}-${k}-${Date.now()}-${Math.random()}`,
          startX: packX, startY: packY,
          endX, endY,
          delay: k * 40,
          rotation: (Math.random() - 0.5) * 10,
          revealed: false,
          cardImageUrl: card?.imageUrl || null,
          backImageUrl: card?.backImageUrl || null,
          isLeader: card?.isLeader || false,
          packIndex,
          isLeaderOrBase,
          width: w, height: h,
          isFoil: card?.isFoil || false,
          isShowcase: card?.isShowcase || false,
        })
      }
    }

    setFlyingCards(newCards)

    // Reveal cards after delay
    setTimeout(() => {
      setFlyingCards(prev => prev.map(c => c.packIndex === packIndex ? { ...c, revealed: true } : c))
    }, 500)

  }, [clickedPacks, packCount, getLayoutValues, isMobile])

  // Open all packs sequentially
  const openAllPacks = useCallback(() => {
    if (isOpeningAll) return
    setIsOpeningAll(true)
    openAllIndexRef.current = 0

    const openNext = () => {
      const idx = openAllIndexRef.current
      if (idx >= packCount) {
        // All done, proceed to next page
        setTimeout(() => {
          animationCompleteRef.current = true
          setPhase('complete')
          setTimeout(() => onComplete?.(), 400)
        }, 800)
        return
      }

      // On mobile, set current pack index before opening
      if (isMobile) {
        setCurrentPackIndex(idx)
      }
      openPack(idx)
      openAllIndexRef.current++
      // Slightly faster on mobile since less visual complexity
      setTimeout(openNext, isMobile ? 1800 : 2200)
    }

    openNext()
  }, [isOpeningAll, packCount, openPack, onComplete, isMobile])

  // Click handler - click on pack to open it
  const handlePackClick = useCallback((e, packIndex) => {
    e.stopPropagation()
    if (isOpeningAll) return
    openPack(packIndex)
  }, [openPack, isOpeningAll])

  // Handle continue/skip click
  const handleContinue = useCallback(() => {
    if (animationCompleteRef.current) return
    animationCompleteRef.current = true
    setPhase('complete')
    setTimeout(() => onComplete?.(), 400)
  }, [onComplete])

  // Handle click anywhere to continue (only after all packs opened)
  const handleContainerClick = useCallback((e) => {
    // Don't trigger if clicking on a pack or button
    if (e.target.closest('.pack-item') || e.target.closest('button')) return
    if (allPacksOpened && !isOpeningAll) {
      handleContinue()
    }
  }, [allPacksOpened, isOpeningAll, handleContinue])

  // Layout for packs and cards - vertically centered
  const { screenWidth, screenHeight, cardHeight, cardWidth, leaderHeight, mobile } = getLayoutValues()
  const totalPacksWidth = packCount * packWidth + (packCount - 1) * packGap
  const packStartX = (screenWidth - totalPacksWidth) / 2

  // Mobile carousel layout
  const mobilePackWidth = 80
  const mobilePackHeight = mobilePackWidth * (3.5 / 2.5)
  const mobilePackGap = 12

  // Simple fixed layout
  const cardsStartY = mobile ? 20 : 100  // Cards land closer to top on mobile

  // Check if device is desktop (for hover preview)
  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 768

  return (
    <div
      className={`pack-opening-container phase-${phase} ${allPacksOpened ? 'click-to-continue' : ''}`}
      ref={containerRef}
      onClick={handleContainerClick}
    >
      {/* Skip button in upper right */}
      <Button
        variant="secondary"
        size="sm"
        className="skip-button"
        onClick={handleContinue}
      >
        &gt;&gt;
      </Button>

      {/* Open All / Continue button above pack counter */}
      <div className="open-all-container" style={{ bottom: '110px' }}>
        <Button
          variant={allPacksOpened ? 'primary' : 'secondary'}
          className={allPacksOpened ? 'continue-button' : 'open-all-button'}
          onClick={allPacksOpened ? handleContinue : openAllPacks}
        >
          {allPacksOpened ? 'Continue' : 'Open All'}
        </Button>
      </div>

      {/* Packs - carousel on mobile, row on desktop */}
      {isMobile ? (
        <div className="packs-carousel">
          {Array.from({ length: packCount }).map((_, i) => {
            const isOpened = openedPacks.includes(i)
            if (isOpened) return null
            // Position relative to current pack
            const offset = i - currentPackIndex
            const isActive = offset === 0
            const isVisible = Math.abs(offset) <= 2
            if (!isVisible) return null

            return (
              <div
                key={i}
                className={`pack-item-mobile ${isActive ? 'active' : ''} ${clickedPacks.includes(i) ? 'fading' : ''}`}
                style={{
                  '--offset': offset,
                  '--abs-offset': Math.abs(offset),
                  '--pack-delay': `${i * 80}ms`,
                }}
                onClick={(e) => isActive && handlePackClick(e, i)}
              >
                <div className="pack-wrapper-mobile">
                  <div className="pack-image-container">
                    <img src={packImageUrl} alt={`Pack ${i + 1}`} className="pack-image"
                      onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('pack-fallback') }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="packs-row">
          {Array.from({ length: packCount }).map((_, i) => {
            const isOpened = openedPacks.includes(i)
            if (isOpened) return null // Don't render opened packs
            const x = packStartX + i * (packWidth + packGap)
            return (
              <div
                key={i}
                className={`pack-item visible ${clickedPacks.includes(i) ? 'fading' : ''}`}
                style={{ '--pack-x': `${x}px`, '--pack-delay': `${i * 80}ms` }}
                onClick={(e) => handlePackClick(e, i)}
              >
                <div className="pack-wrapper">
                  <div className="pack-image-container">
                    <img src={packImageUrl} alt={`Pack ${i + 1}`} className="pack-image"
                      onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('pack-fallback') }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Flying cards */}
      <div className="flying-cards-container">
        {flyingCards.map((card) => (
          <div
            key={card.id}
            className={`flying-card ${card.revealed ? 'revealed' : ''} ${card.isLeaderOrBase ? 'leader-card' : ''} ${card.isFoil || card.isShowcase ? 'foil' : ''}`}
            style={{
              '--start-x': `${card.startX}px`, '--start-y': `${card.startY}px`,
              '--end-x': `${card.endX}px`, '--end-y': `${card.endY}px`,
              '--delay': `${card.delay}ms`, '--rotation': `${card.rotation}deg`,
              '--card-width': `${card.width}px`, '--card-height': `${card.height}px`,
            }}
            onMouseEnter={(e) => {
              if (isDesktop && card.revealed) {
                const rect = e.currentTarget.getBoundingClientRect()
                setHoveredCard(card)
                setHoveredCardPosition({ x: rect.left + rect.width / 2, y: rect.top })
              }
            }}
            onMouseLeave={() => {
              setHoveredCard(null)
              setHoveredCardPosition(null)
            }}
          >
            <div className="card-inner">
              <div className="card-back">
                <img src={cardBackUrl} alt="Card Back"
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('card-back-fallback') }}
                />
              </div>
              <div className={`card-front ${card.isFoil || card.isShowcase ? 'foil-content' : ''}`}>
                {card.cardImageUrl ? (
                  <img src={card.cardImageUrl} alt="Card"
                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('card-front-fallback') }}
                  />
                ) : <div className="card-front-fallback"></div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Card hover preview (desktop only) */}
      {isDesktop && hoveredCard && hoveredCard.cardImageUrl && hoveredCardPosition && (
        <div
          className="card-preview-overlay"
          style={{
            left: `${Math.min(Math.max(hoveredCardPosition.x, 180), screenWidth - 180)}px`,
            top: `${Math.max(hoveredCardPosition.y - 320, 20)}px`,
          }}
        >
          {hoveredCard.isLeader && hoveredCard.backImageUrl ? (
            // Leader with back - show both sides
            <div className="card-preview-leader">
              <div className={`card-preview card-preview-front ${hoveredCard.isFoil || hoveredCard.isShowcase ? 'card-preview-foil' : ''}`}>
                <img src={hoveredCard.cardImageUrl} alt="Card Front" />
              </div>
              <div className={`card-preview card-preview-back ${hoveredCard.isFoil || hoveredCard.isShowcase ? 'card-preview-foil' : ''}`}>
                <img src={hoveredCard.backImageUrl} alt="Card Back" />
              </div>
            </div>
          ) : (
            // Regular card or leader without back
            <div className={`card-preview ${hoveredCard.isFoil || hoveredCard.isShowcase ? 'card-preview-foil' : ''}`}>
              <img src={hoveredCard.cardImageUrl} alt="Card Preview" />
            </div>
          )}
        </div>
      )}

      {/* Pack counter at bottom - hide once all packs opened */}
      {!allPacksOpened && (
        <div className="pack-counter">
          Pack {openedPacks.length > 0 ? openedPacks.length : 1}/{packCount}
        </div>
      )}

    </div>
  )
}
