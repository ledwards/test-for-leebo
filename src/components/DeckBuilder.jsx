import { useState, useRef, useEffect } from 'react'
import './DeckBuilder.css'
import CardModal from './CardModal'
import { getCachedCards, isCacheInitialized } from '../utils/cardCache'
import { fetchSetCards } from '../utils/api'

function DeckBuilder({ cards, setCode, onBack }) {
  const [cardPositions, setCardPositions] = useState({})
  const [draggedCard, setDraggedCard] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [selectedCard, setSelectedCard] = useState(null)
  const [canvasHeight, setCanvasHeight] = useState(null)
  const [allSetCards, setAllSetCards] = useState([])
  const [sectionLabels, setSectionLabels] = useState([])
  const hasDraggedRef = useRef(false)
  const canvasRef = useRef(null)

  // Load all cards from the set
  useEffect(() => {
    const loadSetCards = async () => {
      try {
        let cardsData = []
        if (isCacheInitialized()) {
          cardsData = getCachedCards(setCode)
        }
        
        if (cardsData.length === 0) {
          cardsData = await fetchSetCards(setCode)
        }
        
        if (cardsData.length > 0) {
          setAllSetCards(cardsData)
        }
      } catch (error) {
        console.error('Failed to load set cards:', error)
      }
    }
    
    if (setCode) {
      loadSetCards()
    }
  }, [setCode])

  // Initialize card positions in sections
  useEffect(() => {
    if (cards.length > 0 && allSetCards.length > 0 && Object.keys(cardPositions).length === 0) {
      // Filter out common bases and leaders from the sealed pool cards
      const poolCards = cards.filter(card => !(card.isBase && card.rarity === 'Common') && !card.isLeader)
      
      // Get leaders from the pool only
      const poolLeaders = cards.filter(card => card.isLeader)
      
      // Get unique common bases from the set (one of each by name)
      const commonBasesMap = new Map()
      allSetCards
        .filter(card => card.isBase && card.rarity === 'Common')
        .forEach(card => {
          const key = card.name
          if (!commonBasesMap.has(key)) {
            commonBasesMap.set(key, card)
          }
        })
      const uniqueCommonBases = Array.from(commonBasesMap.values())
      
      const initialPositions = {}
      const labels = []
      const cardWidth = 120
      const cardHeight = 168
      // Leaders and bases are landscape (wider than tall)
      const leaderBaseWidth = 168
      const leaderBaseHeight = 120
      const spacing = 20
      const padding = 50
      const sectionSpacing = 80
      const labelHeight = 30
      let currentY = padding
      
      // Leaders section (only from pool)
      if (poolLeaders.length > 0) {
        currentY += labelHeight + 10
        labels.push({ text: 'Leaders', y: currentY - labelHeight - 5 })
        const leadersPerRow = Math.floor((window.innerWidth - 100) / (leaderBaseWidth + spacing))
        poolLeaders.forEach((card, index) => {
          const row = Math.floor(index / leadersPerRow)
          const col = index % leadersPerRow
          const cardId = `leader-${card.id || `${card.name}-${card.set}-${index}`}`
          initialPositions[cardId] = {
            x: padding + col * (leaderBaseWidth + spacing),
            y: currentY + row * (leaderBaseHeight + spacing),
            card: card,
            section: 'leaders'
          }
        })
        const leadersRows = Math.ceil(poolLeaders.length / leadersPerRow)
        currentY += leadersRows * (leaderBaseHeight + spacing) + sectionSpacing
      }
      
      // Bases section
      if (uniqueCommonBases.length > 0) {
        currentY += labelHeight + 10
        labels.push({ text: 'Bases', y: currentY - labelHeight - 5 })
        const basesPerRow = Math.floor((window.innerWidth - 100) / (leaderBaseWidth + spacing))
        uniqueCommonBases.forEach((card, index) => {
          const row = Math.floor(index / basesPerRow)
          const col = index % basesPerRow
          const cardId = `base-${card.id || `${card.name}-${card.set}-${index}`}`
          initialPositions[cardId] = {
            x: padding + col * (leaderBaseWidth + spacing),
            y: currentY + row * (leaderBaseHeight + spacing),
            card: card,
            section: 'bases'
          }
        })
        const basesRows = Math.ceil(uniqueCommonBases.length / basesPerRow)
        currentY += basesRows * (leaderBaseHeight + spacing) + sectionSpacing
      }
      
      // Main cards section (pool cards without common bases)
      if (poolCards.length > 0) {
        currentY += labelHeight + 10
        labels.push({ text: 'Pool Cards', y: currentY - labelHeight - 5 })
        const cardsPerRow = Math.floor((window.innerWidth - 100) / (cardWidth + spacing))
        poolCards.forEach((card, index) => {
          const row = Math.floor(index / cardsPerRow)
          const col = index % cardsPerRow
          const cardId = card.id || `pool-${card.name}-${card.set}-${index}`
          initialPositions[cardId] = {
            x: padding + col * (cardWidth + spacing),
            y: currentY + row * (cardHeight + spacing),
            card: card,
            section: 'main'
          }
        })
        const mainRows = Math.ceil(poolCards.length / cardsPerRow)
        currentY += mainRows * (cardHeight + spacing)
      }
      
      // Calculate canvas height
      const calculatedHeight = currentY + padding
      setCanvasHeight(calculatedHeight)
      setCardPositions(initialPositions)
      setSectionLabels(labels)
    }
  }, [cards, allSetCards])

  const handleMouseDown = (e, cardId) => {
    e.preventDefault()
    const card = cardPositions[cardId]
    if (!card) return

    const rect = canvasRef.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - card.x
    const offsetY = e.clientY - rect.top - card.y

    setDraggedCard(cardId)
    setDragOffset({ x: offsetX, y: offsetY })
    hasDraggedRef.current = false
  }

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Common':
        return '#999'
      case 'Uncommon':
        return '#4CAF50'
      case 'Rare':
        return '#2196F3'
      case 'Legendary':
        return '#FF9800'
      default:
        return '#666'
    }
  }

  // Add event listeners for mouse move and up
  useEffect(() => {
    if (!draggedCard) return

    const handleMove = (e) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      hasDraggedRef.current = true
      setCardPositions(prev => {
        const currentCard = prev[draggedCard]
        if (!currentCard) return prev

        const newX = e.clientX - rect.left - dragOffset.x
        const newY = e.clientY - rect.top - dragOffset.y

        return {
          ...prev,
          [draggedCard]: {
            ...currentCard,
            x: Math.max(0, Math.min(newX, rect.width - (currentCard.card.isLeader || currentCard.card.isBase ? 168 : 120))),
            y: Math.max(0, Math.min(newY, rect.height - (currentCard.card.isLeader || currentCard.card.isBase ? 120 : 168)))
          }
        }
      })
    }

    const handleUp = () => {
      setDraggedCard(null)
      setDragOffset({ x: 0, y: 0 })
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [draggedCard, dragOffset])

  return (
    <div className="deck-builder">
      <div className="deck-builder-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Sealed Pod
        </button>
        <h1>Deck Builder</h1>
        <p className="instruction">Drag cards around to organize your deck</p>
      </div>
      
      <div 
        ref={canvasRef}
        className="deck-canvas"
        style={canvasHeight ? { height: `${canvasHeight}px` } : {}}
      >
        {/* Section labels */}
        {sectionLabels.map((label, index) => (
          <div key={index} className="section-label" style={{ top: `${label.y}px`, left: '50px' }}>
            {label.text}
          </div>
        ))}
        
        {Object.entries(cardPositions).map(([cardId, position]) => {
          const card = position.card
          const isDragging = draggedCard === cardId
          
          return (
            <div
              key={cardId}
              className={`canvas-card ${card.isLeader ? 'leader' : ''} ${card.isBase ? 'base' : ''} ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isDragging ? 'dragging' : ''}`}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={(e) => handleMouseDown(e, cardId)}
              onMouseUp={(e) => {
                if (!hasDraggedRef.current) {
                  setSelectedCard(card)
                }
                hasDraggedRef.current = false
              }}
            >
              {card.imageUrl ? (
                <img
                  src={card.imageUrl}
                  alt={card.name || 'Card'}
                  className="card-image"
                  draggable={false}
                />
              ) : (
                <div className="card-placeholder">
                  <div className="card-name">{card.name || 'Card'}</div>
                  <div className="card-rarity" style={{ color: getRarityColor(card.rarity) }}>
                    {card.rarity}
                  </div>
                </div>
              )}
              <div className="card-badges">
                {card.isFoil && <span className="badge foil-badge">Foil</span>}
                {card.isHyperspace && <span className="badge hyperspace-badge">Hyperspace</span>}
                {card.isShowcase && <span className="badge showcase-badge">Showcase</span>}
              </div>
            </div>
          )
        })}
      </div>
      
      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  )
}

export default DeckBuilder
