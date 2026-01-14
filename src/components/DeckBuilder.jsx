import { useState, useRef, useEffect, useCallback } from 'react'
import './DeckBuilder.css'
import { getCachedCards, isCacheInitialized } from '../utils/cardCache'
import { fetchSetCards } from '../utils/api'

const ASPECTS = ['Vigilance', 'Villainy', 'Heroism', 'Command', 'Cunning', 'Aggression']
const SORT_OPTIONS = ['none', 'aspect', 'cost', 'type']

function DeckBuilder({ cards, setCode, onBack, savedState }) {
  const [cardPositions, setCardPositions] = useState({})
  const [draggedCard, setDraggedCard] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [canvasHeight, setCanvasHeight] = useState(null)
  const [allSetCards, setAllSetCards] = useState([])
  const [sectionLabels, setSectionLabels] = useState([])
  const [sectionBounds, setSectionBounds] = useState({})
  const [hoveredCard, setHoveredCard] = useState(null)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [aspectFilters, setAspectFilters] = useState({
    Vigilance: true,
    Villainy: true,
    Heroism: true,
    Command: true,
    Cunning: true,
    Aggression: true
  })
  const [sortOption, setSortOption] = useState('none')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [selectedCards, setSelectedCards] = useState(new Set())
  const [selectionBox, setSelectionBox] = useState(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [isShiftDrag, setIsShiftDrag] = useState(false)
  const [touchingCards, setTouchingCards] = useState(new Set())
  const [zIndexCounter, setZIndexCounter] = useState(1000)
  const [activeLeader, setActiveLeader] = useState(null)
  const [activeBase, setActiveBase] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const hasDraggedRef = useRef(false)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

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

  // Check if card matches aspect filters
  const cardMatchesFilters = useCallback((card) => {
    const cardAspects = card.aspects || []
    // If card has no aspects, it's neutral - show if any aspect is checked
    if (cardAspects.length === 0) {
      return Object.values(aspectFilters).some(v => v)
    }
    // Card must have at least one aspect that's checked
    return cardAspects.some(aspect => aspectFilters[aspect])
  }, [aspectFilters])

  // Get aspect combination key for sorting (15 possible combinations)
  const getAspectKey = useCallback((card) => {
    const aspects = (card.aspects || []).sort()
    if (aspects.length === 0) return 'Neutral'
    if (aspects.length === 1) return aspects[0]
    // Two aspects - return sorted combination
    return aspects.join(' ')
  }, [])

  // Sort and filter cards
  const getFilteredAndSortedCards = useCallback(() => {
    const allCards = Object.values(cardPositions).map(p => p.card)
    let filtered = allCards.filter(cardMatchesFilters)
    
    if (sortOption === 'aspect') {
      const grouped = {}
      filtered.forEach(card => {
        const key = getAspectKey(card)
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(card)
      })
      // Sort groups by aspect combination
      const sortedKeys = Object.keys(grouped).sort()
      return sortedKeys.flatMap(key => grouped[key])
    } else if (sortOption === 'cost') {
      return filtered.sort((a, b) => (a.cost || 0) - (b.cost || 0))
    } else if (sortOption === 'type') {
      const typeOrder = { 'Ground Unit': 1, 'Space Unit': 2, 'Upgrade': 3, 'Event': 4 }
      return filtered.sort((a, b) => {
        const aOrder = typeOrder[a.type] || 99
        const bOrder = typeOrder[b.type] || 99
        if (aOrder !== bOrder) return aOrder - bOrder
        return (a.cost || 0) - (b.cost || 0)
      })
    }
    return filtered
  }, [cardPositions, cardMatchesFilters, sortOption, getAspectKey])

  // Restore saved state on mount
  useEffect(() => {
    if (savedState && Object.keys(cardPositions).length === 0) {
      try {
        const state = JSON.parse(savedState)
        if (state.cardPositions && Object.keys(state.cardPositions).length > 0) {
          setCardPositions(state.cardPositions)
          setSectionLabels(state.sectionLabels || [])
          setSectionBounds(state.sectionBounds || {})
          setCanvasHeight(state.canvasHeight)
          setZoom(state.zoom || 1)
          setPan(state.pan || { x: 0, y: 0 })
          setAspectFilters(state.aspectFilters || {
            Vigilance: true,
            Villainy: true,
            Heroism: true,
            Command: true,
            Cunning: true,
            Aggression: true
          })
          setSortOption(state.sortOption || 'none')
        }
      } catch (e) {
        console.error('Failed to restore deck builder state:', e)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Initialize card positions in sections
  useEffect(() => {
    if (cards.length > 0 && allSetCards.length > 0 && Object.keys(cardPositions).length === 0) {
      const poolCards = cards.filter(card => !(card.isBase && card.rarity === 'Common') && !card.isLeader)
      const poolLeaders = cards.filter(card => card.isLeader)
      
      const commonBasesMap = new Map()
      allSetCards
        .filter(card => card.isBase && card.rarity === 'Common')
        .forEach(card => {
          const key = card.name
          if (!commonBasesMap.has(key)) {
            commonBasesMap.set(key, card)
          }
        })
      
      // Sort bases by aspect: Vigilance, Command, Aggression, Cunning
      const aspectOrder = ['Vigilance', 'Command', 'Aggression', 'Cunning']
      const getAspectSortValue = (card) => {
        const aspects = card.aspects || []
        if (aspects.length === 0) return 999 // Neutral/no aspect goes last
        // Get the first aspect that matches our order
        for (let i = 0; i < aspectOrder.length; i++) {
          if (aspects.includes(aspectOrder[i])) {
            return i
          }
        }
        return 999 // Other aspects go last
      }
      
      const uniqueCommonBases = Array.from(commonBasesMap.values()).sort((a, b) => {
        const aValue = getAspectSortValue(a)
        const bValue = getAspectSortValue(b)
        if (aValue !== bValue) {
          return aValue - bValue
        }
        // If same aspect, sort by name
        return (a.name || '').localeCompare(b.name || '')
      })
      
      const initialPositions = {}
      const labels = []
      const bounds = {}
      const cardWidth = 120
      const cardHeight = 168
      const leaderBaseWidth = 168
      const leaderBaseHeight = 120
      const spacing = 20
      const padding = 50
      const sectionSpacing = 80
      const labelHeight = 30
      let currentY = padding
      
      if (poolLeaders.length > 0) {
        const sectionStartY = currentY + labelHeight + 10
        currentY = sectionStartY
        labels.push({ text: 'Leaders', y: currentY - labelHeight - 5 })
        const leadersPerRow = Math.floor((window.innerWidth - 100) / (leaderBaseWidth + spacing))
        poolLeaders.forEach((card, index) => {
          const row = Math.floor(index / leadersPerRow)
          const col = index % leadersPerRow
          // Use unique ID that always includes index to handle duplicates (same name/set)
          const cardId = `leader-${index}-${card.id || `${card.name}-${card.set}`}`
          initialPositions[cardId] = {
            x: padding + col * (leaderBaseWidth + spacing),
            y: currentY + row * (leaderBaseHeight + spacing),
            card: card,
            section: 'leaders',
            visible: true,
            zIndex: 1
          }
        })
        const leadersRows = Math.ceil(poolLeaders.length / leadersPerRow)
        const sectionEndY = currentY + leadersRows * (leaderBaseHeight + spacing)
        bounds.leaders = { minY: sectionStartY, maxY: sectionEndY, minX: padding, maxX: window.innerWidth - padding }
        currentY = sectionEndY + sectionSpacing
      }
      
      // Get rare bases from pack cards
      const rareBasesFromPacks = cards.filter(card => card.isBase && card.rarity === 'Rare')
      const rareBasesMap = new Map()
      rareBasesFromPacks.forEach(card => {
        const key = card.name
        if (!rareBasesMap.has(key)) {
          rareBasesMap.set(key, card)
        }
      })
      const uniqueRareBases = Array.from(rareBasesMap.values()).sort((a, b) => {
        const aValue = getAspectSortValue(a)
        const bValue = getAspectSortValue(b)
        if (aValue !== bValue) {
          return aValue - bValue
        }
        return (a.name || '').localeCompare(b.name || '')
      })
      
      // Combine rare bases (first) and common bases (second)
      const allBases = [...uniqueRareBases, ...uniqueCommonBases]
      
      if (allBases.length > 0) {
        const sectionStartY = currentY + labelHeight + 10
        currentY = sectionStartY
        labels.push({ text: 'Bases', y: currentY - labelHeight - 5 })
        const basesPerRow = Math.floor((window.innerWidth - 100) / (leaderBaseWidth + spacing))
        allBases.forEach((card, index) => {
          const row = Math.floor(index / basesPerRow)
          const col = index % basesPerRow
          // Always include index to ensure uniqueness
          const cardId = `base-${index}-${card.id || `${card.name}-${card.set}`}`
          initialPositions[cardId] = {
            x: padding + col * (leaderBaseWidth + spacing),
            y: currentY + row * (leaderBaseHeight + spacing),
            card: card,
            section: 'bases',
            visible: true,
            zIndex: 1
          }
        })
        const basesRows = Math.ceil(allBases.length / basesPerRow)
        const sectionEndY = currentY + basesRows * (leaderBaseHeight + spacing)
        bounds.bases = { minY: sectionStartY, maxY: sectionEndY, minX: padding, maxX: window.innerWidth - padding }
        currentY = sectionEndY + sectionSpacing
      }
      
      if (poolCards.length > 0) {
        const sectionStartY = currentY + labelHeight + 10
        currentY = sectionStartY
        labels.push({ text: 'Pool Cards', y: currentY - labelHeight - 5 })
        const cardsPerRow = Math.floor((window.innerWidth - 100) / (cardWidth + spacing))
        poolCards.forEach((card, index) => {
          const row = Math.floor(index / cardsPerRow)
          const col = index % cardsPerRow
          // Always include index to ensure uniqueness for duplicate cards
          const cardId = `pool-${index}-${card.id || `${card.name}-${card.set}`}`
          initialPositions[cardId] = {
            x: padding + col * (cardWidth + spacing),
            y: currentY + row * (cardHeight + spacing),
            card: card,
            section: 'main',
            visible: true,
            zIndex: 1
          }
        })
        const mainRows = Math.ceil(poolCards.length / cardsPerRow)
        const sectionEndY = currentY + mainRows * (cardHeight + spacing)
        bounds.main = { minY: sectionStartY, maxY: sectionEndY, minX: padding, maxX: window.innerWidth - padding }
        currentY = sectionEndY
      }
      
      const calculatedHeight = currentY + padding
      setCanvasHeight(calculatedHeight)
      setCardPositions(initialPositions)
      setSectionLabels(labels)
      setSectionBounds(bounds)
    }
  }, [cards, allSetCards, savedState])

  // Save deck builder state to sessionStorage whenever it changes
  useEffect(() => {
    if (Object.keys(cardPositions).length > 0) {
      const stateToSave = {
        cardPositions,
        sectionLabels,
        sectionBounds,
        canvasHeight,
        zoom,
        pan,
        aspectFilters,
        sortOption
      }
      sessionStorage.setItem('deckBuilderState', JSON.stringify(stateToSave))
    }
  }, [cardPositions, sectionLabels, sectionBounds, canvasHeight, zoom, pan, aspectFilters, sortOption])

  // Update visibility based on filters
  useEffect(() => {
    setCardPositions(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(cardId => {
        const pos = updated[cardId]
        if (pos.section === 'main') {
          updated[cardId] = {
            ...pos,
            visible: cardMatchesFilters(pos.card)
          }
        }
      })
      return updated
    })
  }, [aspectFilters, cardMatchesFilters])

  // Find cards that are touching a given card
  const findTouchingCards = useCallback((cardId, positions) => {
    const card = positions[cardId]
    if (!card) return new Set()
    
    const touching = new Set([cardId])
    const cardWidth = card.card.isLeader || card.card.isBase ? 168 : 120
    const cardHeight = card.card.isLeader || card.card.isBase ? 120 : 168
    const threshold = 5 // Pixels of overlap/adjacency to consider "touching"
    
    const cardLeft = card.x
    const cardRight = card.x + cardWidth
    const cardTop = card.y
    const cardBottom = card.y + cardHeight
    
    // Check all other cards in the same section
    Object.entries(positions).forEach(([otherId, otherPos]) => {
      if (otherId === cardId || !otherPos.visible) return
      if (otherPos.section !== card.section) return
      
      const otherWidth = otherPos.card.isLeader || otherPos.card.isBase ? 168 : 120
      const otherHeight = otherPos.card.isLeader || otherPos.card.isBase ? 120 : 168
      
      const otherLeft = otherPos.x
      const otherRight = otherPos.x + otherWidth
      const otherTop = otherPos.y
      const otherBottom = otherPos.y + otherHeight
      
      // Check if cards are touching (overlapping or adjacent within threshold)
      const horizontalOverlap = !(cardRight < otherLeft - threshold || cardLeft > otherRight + threshold)
      const verticalOverlap = !(cardBottom < otherTop - threshold || cardTop > otherBottom + threshold)
      
      if (horizontalOverlap && verticalOverlap) {
        touching.add(otherId)
      }
    })
    
    return touching
  }, [])

  // Apply sorting
  useEffect(() => {
    if (sortOption === 'none') return
    
    setCardPositions(prev => {
      const mainCards = Object.entries(prev)
        .filter(([_, pos]) => pos.section === 'main' && pos.visible)
        .map(([id, pos]) => ({ id, ...pos }))
      
      const sorted = getFilteredAndSortedCards()
      const sortedIds = sorted.map(card => {
        const entry = mainCards.find(({ card: c }) => c.id === card.id || c.name === card.name)
        return entry?.id
      }).filter(Boolean)
      
      const updated = { ...prev }
      const cardWidth = 120
      const cardHeight = 168
      const spacing = 20
      const padding = 50
      const sectionSpacing = 80
      const cardsPerRow = Math.floor((window.innerWidth - 100) / (cardWidth + spacing))
      
      if (sortOption === 'cost') {
        // Vertical columns by cost
        const costGroups = {}
        sorted.forEach(card => {
          const cost = card.cost || 0
          if (!costGroups[cost]) costGroups[cost] = []
          costGroups[cost].push(card)
        })
        
        let col = 0
        Object.keys(costGroups).sort((a, b) => a - b).forEach(cost => {
          costGroups[cost].forEach((card, idx) => {
            const cardId = sortedIds.find(id => {
              const pos = updated[id]
              return pos && (pos.card.id === card.id || pos.card.name === card.name)
            })
            if (cardId && updated[cardId]) {
              const row = idx
              updated[cardId] = {
                ...updated[cardId],
                x: padding + col * (cardWidth + spacing),
                y: padding + row * (cardHeight + spacing)
              }
            }
          })
          col++
        })
      } else if (sortOption === 'aspect') {
        // Group by aspect combination
        const aspectGroups = {}
        sorted.forEach(card => {
          const key = getAspectKey(card)
          if (!aspectGroups[key]) aspectGroups[key] = []
          aspectGroups[key].push(card)
        })
        
        let currentY = padding
        const sortedKeys = Object.keys(aspectGroups).sort()
        sortedKeys.forEach(key => {
          const group = aspectGroups[key]
          group.forEach((card, idx) => {
            const cardId = sortedIds.find(id => {
              const pos = updated[id]
              return pos && (pos.card.id === card.id || pos.card.name === card.name)
            })
            if (cardId && updated[cardId]) {
              const row = idx
              const col = 0
              updated[cardId] = {
                ...updated[cardId],
                x: padding + col * (cardWidth + spacing),
                y: currentY + row * (cardHeight + spacing)
              }
            }
          })
          const groupHeight = group.length * (cardHeight + spacing)
          currentY += groupHeight + sectionSpacing
        })
      } else {
        // Grid layout for type
        sorted.forEach((card, index) => {
          const cardId = sortedIds[index]
          if (cardId && updated[cardId]) {
            const row = Math.floor(index / cardsPerRow)
            const col = index % cardsPerRow
            updated[cardId] = {
              ...updated[cardId],
              x: padding + col * (cardWidth + spacing),
              y: padding + row * (cardHeight + spacing)
            }
          }
        })
      }
      
      return updated
    })
  }, [sortOption, getFilteredAndSortedCards])

  const handleMouseDown = (e, cardId) => {
    if (e.button !== 0) return // Only left click
    e.preventDefault()
    e.stopPropagation()
    
    if (!cardId) return
    const card = cardPositions[cardId]
    if (!card) return
    
    // Handle leaders and bases - they can't be dragged, only selected
    if (card.section === 'leaders') {
      // Only allow selection, not deselection by clicking the same card
      if (cardId !== activeLeader) {
        setActiveLeader(cardId)
      }
      return
    }
    
    if (card.section === 'bases') {
      // Only allow selection, not deselection by clicking the same card
      if (cardId !== activeBase) {
        setActiveBase(cardId)
      }
      return
    }
    
    // For other cards, allow normal dragging and selection
    const isModifierPressed = e.metaKey || e.ctrlKey
    if (isModifierPressed) {
      // Multi-select (only within same section)
      // Bring to front
      setZIndexCounter(prev => {
        const newZ = prev + 1
        setCardPositions(prevPos => ({
          ...prevPos,
          [cardId]: { ...prevPos[cardId], zIndex: newZ }
        }))
        return newZ
      })
      
      setSelectedCards(prev => {
        const newSet = new Set(prev)
        // If selecting a card from a different section, clear and start new selection
        if (prev.size > 0) {
          const firstCard = cardPositions[Array.from(prev)[0]]
          if (firstCard && firstCard.section !== card.section) {
            newSet.clear()
          }
        }
        
        if (newSet.has(cardId)) {
          newSet.delete(cardId)
        } else {
          newSet.add(cardId)
        }
        return newSet
      })
      return
    }

    // Bring to front
    setZIndexCounter(prev => {
      const newZ = prev + 1
      setCardPositions(prevPos => ({
        ...prevPos,
        [cardId]: { ...prevPos[cardId], zIndex: newZ }
      }))
      return newZ
    })

    const rect = canvasRef.current.getBoundingClientRect()
    const offsetX = (e.clientX - rect.left) / zoom - card.x
    const offsetY = (e.clientY - rect.top) / zoom - card.y

    // Check if shift is pressed for group drag
    const isShiftPressed = e.shiftKey
    setIsShiftDrag(isShiftPressed)
    
    // If shift is pressed, find all touching cards
    if (isShiftPressed) {
      const touching = findTouchingCards(cardId, cardPositions)
      setTouchingCards(touching)
      setSelectedCards(touching)
    } else {
      setTouchingCards(new Set())
      if (!isModifierPressed && !selectedCards.has(cardId)) {
        setSelectedCards(new Set([cardId]))
      }
    }

    setDraggedCard(cardId)
    setDragOffset({ x: offsetX, y: offsetY })
    hasDraggedRef.current = false
  }

  const handleCanvasMouseDown = (e) => {
    if (e.button !== 0) return
    if (e.target === canvasRef.current || e.target.classList.contains('deck-canvas')) {
      const rect = canvasRef.current.getBoundingClientRect()
      const startX = (e.clientX - rect.left) / zoom
      const startY = (e.clientY - rect.top) / zoom
      setIsSelecting(true)
      setSelectionBox({ startX, startY, endX: startX, endY: startY })
      setSelectedCards(new Set())
    }
  }

  const handleMouseMove = useCallback((e) => {
    if (isSelecting && selectionBox) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      
      const endX = (e.clientX - rect.left) / zoom
      const endY = (e.clientY - rect.top) / zoom
      setSelectionBox(prev => prev ? { ...prev, endX, endY } : null)
      
      // Select cards in box
      const minX = Math.min(selectionBox.startX, endX)
      const maxX = Math.max(selectionBox.startX, endX)
      const minY = Math.min(selectionBox.startY, endY)
      const maxY = Math.max(selectionBox.startY, endY)
      
      const newSelected = new Set()
      Object.entries(cardPositions).forEach(([cardId, pos]) => {
        if (!pos.visible) return
        const cardWidth = pos.card.isLeader || pos.card.isBase ? 168 : 120
        const cardHeight = pos.card.isLeader || pos.card.isBase ? 120 : 168
        const cardRight = pos.x + cardWidth
        const cardBottom = pos.y + cardHeight
        
        if (pos.x < maxX && cardRight > minX && pos.y < maxY && cardBottom > minY) {
          newSelected.add(cardId)
        }
      })
      // Only select cards from the same section if multiple are selected
      if (newSelected.size > 1) {
        const sections = new Set(Array.from(newSelected).map(id => cardPositions[id]?.section))
        if (sections.size > 1) {
          // If multiple sections, only keep cards from the first section found
          const firstSection = Array.from(newSelected)[0] ? cardPositions[Array.from(newSelected)[0]]?.section : null
          const filtered = new Set()
          newSelected.forEach(id => {
            if (cardPositions[id]?.section === firstSection) {
              filtered.add(id)
            }
          })
          setSelectedCards(filtered)
          return
        }
      }
      setSelectedCards(newSelected)
    } else if (draggedCard) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      hasDraggedRef.current = true
      setCardPositions(prev => {
        const currentCard = prev[draggedCard]
        if (!currentCard) return prev

        const newX = (e.clientX - rect.left) / zoom - dragOffset.x
        const newY = (e.clientY - rect.top) / zoom - dragOffset.y
        const cardWidth = currentCard.card.isLeader || currentCard.card.isBase ? 168 : 120
        const cardHeight = currentCard.card.isLeader || currentCard.card.isBase ? 120 : 168
        
        // Get section bounds for this card
        const section = currentCard.section
        const bounds = sectionBounds[section]
        if (!bounds) return prev

        // Constrain to section boundaries
        const minX = bounds.minX
        const maxX = bounds.maxX - cardWidth
        const minY = bounds.minY
        const maxY = bounds.maxY - cardHeight

        const constrainedX = Math.max(minX, Math.min(newX, maxX))
        const constrainedY = Math.max(minY, Math.min(newY, maxY))

        const updates = { ...prev }
        
        // Determine which cards to move
        let cardsToMove = new Set([draggedCard])
        if (isShiftDrag && touchingCards.size > 0) {
          // Shift+drag: move all touching cards
          cardsToMove = touchingCards
        } else if (selectedCards.has(draggedCard) && selectedCards.size > 1) {
          // Normal multi-select: move all selected cards
          cardsToMove = selectedCards
        }
        
        // Move all cards together (only if they're in the same section)
        if (cardsToMove.size > 1) {
          const deltaX = constrainedX - currentCard.x
          const deltaY = constrainedY - currentCard.y
          
          cardsToMove.forEach(id => {
            if (updates[id] && updates[id].section === section) {
              const cardW = updates[id].card.isLeader || updates[id].card.isBase ? 168 : 120
              const cardH = updates[id].card.isLeader || updates[id].card.isBase ? 120 : 168
              const newCardX = Math.max(minX, Math.min(updates[id].x + deltaX, bounds.maxX - cardW))
              const newCardY = Math.max(minY, Math.min(updates[id].y + deltaY, bounds.maxY - cardH))
              updates[id] = {
                ...updates[id],
                x: newCardX,
                y: newCardY
              }
            }
          })
        } else {
          updates[draggedCard] = {
            ...currentCard,
            x: constrainedX,
            y: constrainedY
          }
        }
        
        return updates
      })
    }
  }, [draggedCard, dragOffset, selectedCards, cardPositions, isSelecting, selectionBox, zoom, sectionBounds, isShiftDrag, touchingCards, findTouchingCards])

  const handleMouseUp = useCallback(() => {
    if (isSelecting) {
      setIsSelecting(false)
      setSelectionBox(null)
    }
    if (draggedCard) {
      setDraggedCard(null)
      setDragOffset({ x: 0, y: 0 })
      setIsShiftDrag(false)
      setTouchingCards(new Set())
    }
  }, [isSelecting, draggedCard])

  // Zoom to fit
  const zoomToFit = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return
    
    const cards = Object.values(cardPositions).filter(p => p.visible)
    if (cards.length === 0) return
    
    const bounds = cards.reduce((acc, pos) => {
      const width = pos.card.isLeader || pos.card.isBase ? 168 : 120
      const height = pos.card.isLeader || pos.card.isBase ? 120 : 168
      return {
        minX: Math.min(acc.minX, pos.x),
        minY: Math.min(acc.minY, pos.y),
        maxX: Math.max(acc.maxX, pos.x + width),
        maxY: Math.max(acc.maxY, pos.y + height)
      }
    }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const contentWidth = bounds.maxX - bounds.minX
    const contentHeight = bounds.maxY - bounds.minY
    
    const scaleX = (containerRect.width - 100) / contentWidth
    const scaleY = (containerRect.height - 100) / contentHeight
    const newZoom = Math.min(scaleX, scaleY, 1)
    
    setZoom(newZoom)
    setPan({
      x: -bounds.minX * newZoom + 50,
      y: -bounds.minY * newZoom + 50
    })
  }, [cardPositions])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Pinch to zoom
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        // Much slower zoom - 2% per step instead of 10%
        const delta = e.deltaY > 0 ? 0.98 : 1.02
        setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)))
      }
    }
    
    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Common': return '#999'
      case 'Uncommon': return '#4CAF50'
      case 'Rare': return '#2196F3'
      case 'Legendary': return '#FF9800'
      default: return '#666'
    }
  }

  // Build deck data structure
  const buildDeckData = () => {
    const leaderCard = activeLeader && cardPositions[activeLeader] ? cardPositions[activeLeader].card : null
    const baseCard = activeBase && cardPositions[activeBase] ? cardPositions[activeBase].card : null
    
    const mainDeckCards = Object.values(cardPositions)
      .filter(pos => pos.section === 'main' && pos.visible)
      .map(pos => pos.card)
    
    // Count cards by ID
    const cardCounts = new Map()
    mainDeckCards.forEach(card => {
      const id = card.id
      cardCounts.set(id, (cardCounts.get(id) || 0) + 1)
    })
    
    const deck = Array.from(cardCounts.entries()).map(([id, count]) => ({
      id,
      count
    }))
    
    return {
      leader: leaderCard ? { id: leaderCard.id, count: 1 } : null,
      base: baseCard ? { id: baseCard.id, count: 1 } : null,
      deck,
      sideboard: [] // Empty for now, can be extended later
    }
  }

  // Export as JSON
  const exportJSON = () => {
    if (!activeLeader || !activeBase) {
      const missing = []
      if (!activeLeader) missing.push('leader')
      if (!activeBase) missing.push('base')
      setErrorMessage(`Please select a ${missing.join(' and ')} before exporting.`)
      setTimeout(() => setErrorMessage(null), 5000)
      return
    }
    
    setErrorMessage(null)
    const deckData = buildDeckData()
    
    const exportData = {
      metadata: {
        name: `Deck - ${setCode}`,
        author: "swupod"
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
    a.download = `deck-${setCode}-${Date.now()}.json`
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
      setTimeout(() => setErrorMessage(null), 5000)
      return
    }
    
    setErrorMessage(null)
    const deckData = buildDeckData()
    
    const exportData = {
      metadata: {
        name: `Deck - ${setCode}`,
        author: "swupod"
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
      setTimeout(() => setErrorMessage(null), 3000)
    } catch (err) {
      setErrorMessage('Failed to copy to clipboard')
      setTimeout(() => setErrorMessage(null), 3000)
    }
  }

  // Export deck as image
  const exportDeckImage = async () => {
    try {
      setErrorMessage('Generating image...')
      
      // Get all visible cards organized by section
      const leaders = Object.values(cardPositions)
        .filter(pos => pos.section === 'leaders' && pos.visible)
        .map(pos => pos.card)
      
      const bases = Object.values(cardPositions)
        .filter(pos => pos.section === 'bases' && pos.visible)
        .map(pos => pos.card)
      
      const poolCards = Object.values(cardPositions)
        .filter(pos => pos.section === 'main' && pos.visible)
        .map(pos => pos.card)
      
      // Count cards for display
      const cardCounts = new Map()
      poolCards.forEach(card => {
        const key = card.id || card.name
        cardCounts.set(key, (cardCounts.get(key) || 0) + 1)
      })
      
      // Card dimensions
      const cardWidth = 120
      const cardHeight = 168
      const leaderBaseWidth = 168
      const leaderBaseHeight = 120
      const spacing = 20
      const padding = 50
      const sectionSpacing = 40
      
      // Calculate dimensions
      const cardsPerRow = 6
      const poolRows = Math.ceil(Array.from(cardCounts.keys()).length / cardsPerRow)
      const leadersPerRow = Math.max(1, Math.ceil(leaders.length / 2))
      const basesPerRow = Math.max(1, Math.ceil(bases.length / 2))
      
      const width = padding * 2 + cardsPerRow * (cardWidth + spacing) - spacing
      let currentY = padding
      
      // Leaders section
      if (leaders.length > 0) {
        currentY += leadersPerRow * (leaderBaseHeight + spacing) + sectionSpacing
      }
      
      // Bases section
      if (bases.length > 0) {
        currentY += basesPerRow * (leaderBaseHeight + spacing) + sectionSpacing
      }
      
      // Pool cards section
      currentY += poolRows * (cardHeight + spacing) + sectionSpacing
      
      // Add space for swupod stamp
      const stampHeight = 40
      const totalHeight = currentY + stampHeight + padding
      
      // Create canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = totalHeight
      const ctx = canvas.getContext('2d')
      
      // Draw background gradient (same as deck builder)
      const gradient = ctx.createLinearGradient(0, 0, 0, totalHeight)
      gradient.addColorStop(0, '#0a0a0a')
      gradient.addColorStop(1, '#1a1a2e')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, totalHeight)
      
      // Helper to load and draw card image
      const drawCard = async (card, x, y, width, height, count = null) => {
        return new Promise((resolve) => {
          if (card.imageUrl) {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              // Draw card image
              ctx.drawImage(img, x, y, width, height)
              
              // Draw rainbow border (2px) around the card
              const borderWidth = 2
              const borderGradient = ctx.createLinearGradient(x, y, x + width + height, y + height)
              borderGradient.addColorStop(0, '#ff0000')
              borderGradient.addColorStop(0.14, '#ff7f00')
              borderGradient.addColorStop(0.28, '#ffff00')
              borderGradient.addColorStop(0.42, '#00ff00')
              borderGradient.addColorStop(0.57, '#0000ff')
              borderGradient.addColorStop(0.71, '#4b0082')
              borderGradient.addColorStop(0.85, '#9400d3')
              borderGradient.addColorStop(1, '#ff0000')
              
              ctx.strokeStyle = borderGradient
              ctx.lineWidth = borderWidth
              ctx.strokeRect(x, y, width, height)
              
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
            }
            img.onerror = () => {
              // Draw placeholder if image fails
              ctx.fillStyle = 'rgba(26, 26, 46, 0.8)'
              ctx.fillRect(x, y, width, height)
              // Draw rainbow border on placeholder too
              const borderWidth = 2
              const borderGradient = ctx.createLinearGradient(x, y, x + width + height, y + height)
              borderGradient.addColorStop(0, '#ff0000')
              borderGradient.addColorStop(0.14, '#ff7f00')
              borderGradient.addColorStop(0.28, '#ffff00')
              borderGradient.addColorStop(0.42, '#00ff00')
              borderGradient.addColorStop(0.57, '#0000ff')
              borderGradient.addColorStop(0.71, '#4b0082')
              borderGradient.addColorStop(0.85, '#9400d3')
              borderGradient.addColorStop(1, '#ff0000')
              ctx.strokeStyle = borderGradient
              ctx.lineWidth = borderWidth
              ctx.strokeRect(x, y, width, height)
              ctx.fillStyle = 'white'
              ctx.font = '12px Arial'
              ctx.textAlign = 'center'
              ctx.fillText(card.name || 'Card', x + width / 2, y + height / 2)
              resolve()
            }
            img.src = card.imageUrl
          } else {
            // Draw placeholder
            ctx.fillStyle = 'rgba(26, 26, 46, 0.8)'
            ctx.fillRect(x, y, width, height)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
            ctx.lineWidth = 1
            ctx.strokeRect(x, y, width, height)
            ctx.fillStyle = 'white'
            ctx.font = '12px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(card.name || 'Card', x + width / 2, y + height / 2)
            resolve()
          }
        })
      }
      
      currentY = padding
      
      // Draw leaders
      if (leaders.length > 0) {
        let col = 0
        let row = 0
        for (const leader of leaders) {
          const x = padding + col * (leaderBaseWidth + spacing)
          const y = currentY + row * (leaderBaseHeight + spacing)
          await drawCard(leader, x, y, leaderBaseWidth, leaderBaseHeight)
          col++
          if (col >= leadersPerRow) {
            col = 0
            row++
          }
        }
        currentY += row * (leaderBaseHeight + spacing) + (row > 0 ? leaderBaseHeight : 0) + sectionSpacing
      }
      
      // Draw bases
      if (bases.length > 0) {
        let col = 0
        let row = 0
        for (const base of bases) {
          const x = padding + col * (leaderBaseWidth + spacing)
          const y = currentY + row * (leaderBaseHeight + spacing)
          await drawCard(base, x, y, leaderBaseWidth, leaderBaseHeight)
          col++
          if (col >= basesPerRow) {
            col = 0
            row++
          }
        }
        currentY += row * (leaderBaseHeight + spacing) + (row > 0 ? leaderBaseHeight : 0) + sectionSpacing
      }
      
      // Draw pool cards
      const uniquePoolCards = Array.from(cardCounts.entries()).map(([key, count]) => {
        const card = poolCards.find(c => (c.id || c.name) === key)
        return { card, count }
      })
      
      let col = 0
      let row = 0
      for (const { card, count } of uniquePoolCards) {
        const x = padding + col * (cardWidth + spacing)
        const y = currentY + row * (cardHeight + spacing)
        await drawCard(card, x, y, cardWidth, cardHeight, count)
        col++
        if (col >= cardsPerRow) {
          col = 0
          row++
        }
      }
      
      // Draw swupod stamp at bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText('swupod', width / 2, totalHeight - padding / 2)
      
      // Download image
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `deck-${setCode}-${Date.now()}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setErrorMessage('Image downloaded!')
        setTimeout(() => setErrorMessage(null), 3000)
      }, 'image/png')
      
    } catch (error) {
      console.error('Error generating deck image:', error)
      setErrorMessage('Failed to generate image')
      setTimeout(() => setErrorMessage(null), 3000)
    }
  }


  return (
    <div className="deck-builder" ref={containerRef}>
      <div className="deck-builder-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Sealed Pod
        </button>
        <h1>Deck Builder</h1>
        <p className="instruction">Click leaders/bases to select them. Drag other cards to organize your deck.</p>
        <div className="header-buttons">
          <button className="export-button" onClick={exportJSON}>
            Export JSON
          </button>
          <button className="export-button" onClick={copyJSON}>
            Copy JSON
          </button>
          <button className="export-button" onClick={exportDeckImage}>
            Deck Image
          </button>
        </div>
        {errorMessage && (
          <div className="error-message" style={{ 
            marginTop: '1rem', 
            padding: '0.75rem', 
            background: 'rgba(255, 0, 0, 0.2)', 
            border: '1px solid #ff0000', 
            borderRadius: '4px',
            color: '#ffcccc'
          }}>
            {errorMessage}
          </div>
        )}
      </div>
      
      <button 
        className="filter-button"
        onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
      >
        Filter
      </button>
      
      {filterDrawerOpen && (
        <div className="filter-drawer">
          <div className="filter-drawer-header">
            <h2>Filters</h2>
            <button onClick={() => setFilterDrawerOpen(false)}>×</button>
          </div>
          <div className="filter-section">
            <h3>Aspects</h3>
            {ASPECTS.map(aspect => (
              <label key={aspect} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={aspectFilters[aspect]}
                  onChange={(e) => setAspectFilters(prev => ({ ...prev, [aspect]: e.target.checked }))}
                />
                <span>{aspect}</span>
              </label>
            ))}
          </div>
          <div className="filter-section">
            <h3>Sort</h3>
            {SORT_OPTIONS.map(option => (
              <button
                key={option}
                className={`sort-button ${sortOption === option ? 'active' : ''}`}
                onClick={() => setSortOption(option)}
              >
                {option === 'none' ? 'None' : `Sort by ${option}`}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {filterDrawerOpen && (
        <div className="zoom-to-fit-container">
          <button className="export-button" onClick={zoomToFit}>
            Zoom to Fit
          </button>
        </div>
      )}
      
      <div 
        ref={canvasRef}
        className="deck-canvas"
        style={{
          height: canvasHeight ? `${canvasHeight}px` : 'auto',
          transform: `scale(${zoom}) translate3d(${pan.x}px, ${pan.y}px, 0)`,
          transformOrigin: 'top left'
        }}
        onMouseDown={handleCanvasMouseDown}
      >
        {selectionBox && (
          <div
            className="selection-box"
            style={{
              left: `${Math.min(selectionBox.startX, selectionBox.endX)}px`,
              top: `${Math.min(selectionBox.startY, selectionBox.endY)}px`,
              width: `${Math.abs(selectionBox.endX - selectionBox.startX)}px`,
              height: `${Math.abs(selectionBox.endY - selectionBox.startY)}px`
            }}
          />
        )}
        
        {/* Section borders */}
        {sectionBounds.leaders && (
          <div
            className="section-border"
            style={{
              left: `${sectionBounds.leaders.minX - 10}px`,
              top: `${sectionBounds.leaders.minY - 10}px`,
              width: `${sectionBounds.leaders.maxX - sectionBounds.leaders.minX + 20}px`,
              height: `${sectionBounds.leaders.maxY - sectionBounds.leaders.minY + 20}px`
            }}
          />
        )}
        {sectionBounds.main && (
          <div
            className="section-border"
            style={{
              left: `${sectionBounds.main.minX - 10}px`,
              top: `${sectionBounds.main.minY - 10}px`,
              width: `${sectionBounds.main.maxX - sectionBounds.main.minX + 20}px`,
              height: `${sectionBounds.main.maxY - sectionBounds.main.minY + 20}px`
            }}
          />
        )}
        
        {sectionLabels.map((label, index) => (
          <div key={index} className="section-label" style={{ top: `${label.y}px`, left: '50px' }}>
            {label.text}
          </div>
        ))}
        
        {Object.entries(cardPositions).map(([cardId, position]) => {
          if (!position.visible) return null
          
          const card = position.card
          const isDragging = draggedCard === cardId
          const isSelected = selectedCards.has(cardId)
          const isHovered = hoveredCard === cardId
          const isActiveLeader = activeLeader === cardId
          const isActiveBase = activeBase === cardId
          const canDrag = position.section !== 'leaders' && position.section !== 'bases'
          
          return (
            <div
              key={cardId}
              className={`canvas-card ${card.isLeader ? 'leader' : ''} ${card.isBase ? 'base' : ''} ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isActiveLeader ? 'active-leader' : ''} ${isActiveBase ? 'active-base' : ''}`}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: canDrag ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
                zIndex: position.zIndex || (isDragging ? 1000 : isSelected ? 500 : isHovered ? 100 : 1)
              }}
              onMouseDown={(e) => handleMouseDown(e, cardId)}
              onMouseEnter={() => setHoveredCard(cardId)}
              onMouseLeave={() => setHoveredCard(null)}
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
                {card.isShowcase && <span className="badge showcase-badge">Showcase</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DeckBuilder
