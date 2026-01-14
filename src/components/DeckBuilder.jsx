import { useState, useRef, useEffect, useCallback } from 'react'
import './DeckBuilder.css'
import { getCachedCards, isCacheInitialized } from '../utils/cardCache'
import { fetchSetCards } from '../utils/api'

// Get aspect symbol for list view
const getAspectSymbol = (aspect) => {
  const symbols = {
    'Command': (
      <svg className="aspect-symbol" viewBox="0 0 24 24" width="18" height="18">
        <circle cx="12" cy="12" r="10" fill="#4CAF50" stroke="#2E7D32" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="3.5" fill="#2E7D32"/>
        <path d="M12 3 L12 7 M12 17 L12 21 M3 12 L7 12 M17 12 L21 12" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round"/>
        <path d="M8 8 L10 10 M14 10 L16 8 M8 16 L10 14 M14 14 L16 16" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    'Villainy': (
      <svg className="aspect-symbol" viewBox="0 0 24 24" width="18" height="18">
        <path d="M12 3 L9 9 L12 15 L15 9 Z" fill="#1a1a1a" stroke="#000" strokeWidth="1.5"/>
        <path d="M9 9 L15 9 M9 13 L15 13" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
        <rect x="10" y="13" width="4" height="3" fill="#000" stroke="#000" strokeWidth="1"/>
        <path d="M8 18 L10 20 L12 18 L14 20 L16 18" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    'Heroism': (
      <svg className="aspect-symbol" viewBox="0 0 24 24" width="18" height="18">
        <path d="M12 3 L9 10 L12 17 L15 10 Z" fill="#fff" stroke="#ddd" strokeWidth="1.5"/>
        <circle cx="12" cy="10" r="3.5" fill="#ddd" stroke="#bbb" strokeWidth="1"/>
        <path d="M12 7 L12 13" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    'Cunning': (
      <svg className="aspect-symbol" viewBox="0 0 24 24" width="18" height="18">
        <circle cx="12" cy="12" r="9" fill="#FFC107" stroke="#F57C00" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="3" fill="#F57C00"/>
        <path d="M5 12 Q12 5 19 12 Q12 19 5 12" fill="none" stroke="#F57C00" strokeWidth="2"/>
        <path d="M8 8 Q12 4 16 8 M8 16 Q12 20 16 16" fill="none" stroke="#F57C00" strokeWidth="1.5"/>
      </svg>
    ),
    'Vigilance': (
      <svg className="aspect-symbol" viewBox="0 0 24 24" width="18" height="18">
        <path d="M7 9 Q12 4 17 9" fill="#2196F3" stroke="#1565C0" strokeWidth="1.5"/>
        <path d="M7 15 Q12 20 17 15" fill="#2196F3" stroke="#1565C0" strokeWidth="1.5"/>
        <circle cx="10" cy="12" r="2.5" fill="#1565C0"/>
        <circle cx="14" cy="12" r="2.5" fill="#1565C0"/>
      </svg>
    ),
    'Aggression': (
      <svg className="aspect-symbol" viewBox="0 0 24 24" width="18" height="18">
        <circle cx="12" cy="12" r="10" fill="#F44336" stroke="#C62828" strokeWidth="1.5"/>
        <path d="M12 3 L13.5 8 L12 6 L10.5 8 Z M12 21 L13.5 16 L12 18 L10.5 16 Z M3 12 L8 10.5 L6 12 L8 13.5 Z M21 12 L16 10.5 L18 12 L16 13.5 Z" fill="#C62828"/>
        <circle cx="12" cy="12" r="2" fill="#C62828"/>
      </svg>
    ),
  }
  return symbols[aspect] || null
}

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
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
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
  const [tableSort, setTableSort] = useState({ field: null, direction: 'asc' })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [leadersExpanded, setLeadersExpanded] = useState(true)
  const [basesExpanded, setBasesExpanded] = useState(true)
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
  const finalDragPositionRef = useRef(null)
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

  // Sort and filter cards (only from main section, excluding bases and leaders)
  const getFilteredAndSortedCards = useCallback(() => {
    const allCards = Object.values(cardPositions)
      .filter(pos => pos.section === 'main' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
      .map(pos => pos.card)
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
          // Ensure all cards have enabled property (default to true)
          // Also remove any bases/leaders that might have been in 'main' section
          const positionsWithEnabled = {}
          Object.entries(state.cardPositions).forEach(([id, pos]) => {
            // Remove bases and leaders from 'main' section
            if (pos.section === 'main' && (pos.card?.isBase || pos.card?.isLeader)) {
              return // Skip this card - it shouldn't be in main section
            }
            positionsWithEnabled[id] = {
              ...pos,
              enabled: pos.enabled !== undefined ? pos.enabled : true
            }
          })
          setCardPositions(positionsWithEnabled)
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
      const poolCards = cards.filter(card => !card.isBase && !card.isLeader)
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
      const sectionSpacing = 20
      const labelHeight = 30
      let currentY = padding
      
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
      
      // Combine leaders and bases into one section
      const leadersAndBases = [...poolLeaders, ...allBases]
      
      if (leadersAndBases.length > 0) {
        const sectionStartY = currentY + labelHeight + 10
        currentY = sectionStartY
        labels.push({ text: 'Leaders & Bases', y: currentY - labelHeight - 5 })
        const itemsPerRow = Math.floor((window.innerWidth - 100) / (leaderBaseWidth + spacing))
        leadersAndBases.forEach((card, index) => {
          const row = Math.floor(index / itemsPerRow)
          const col = index % itemsPerRow
          // Use unique ID that always includes index to handle duplicates
          const cardId = card.isLeader 
            ? `leader-${index}-${card.id || `${card.name}-${card.set}`}`
            : `base-${index}-${card.id || `${card.name}-${card.set}`}`
          initialPositions[cardId] = {
            x: padding + col * (leaderBaseWidth + spacing),
            y: currentY + row * (leaderBaseHeight + spacing),
            card: card,
            section: 'leaders-bases',
            visible: true,
            zIndex: 1
          }
        })
        const totalRows = Math.ceil(leadersAndBases.length / itemsPerRow)
        const sectionEndY = currentY + totalRows * (leaderBaseHeight + spacing)
        bounds['leaders-bases'] = { minY: sectionStartY, maxY: sectionEndY, minX: padding, maxX: window.innerWidth - padding }
        currentY = sectionEndY
      }
      
      if (poolCards.length > 0) {
        const sectionStartY = currentY + 10
        currentY = sectionStartY
        labels.push({ text: 'Pool Cards', y: currentY - labelHeight })
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
            enabled: true,
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

  // Cleanup: Remove any bases/leaders from main section and update enabled state
  useEffect(() => {
    setCardPositions(prev => {
      const updated = { ...prev }
      const toRemove = []
      
      Object.keys(updated).forEach(cardId => {
        const pos = updated[cardId]
        // Remove bases and leaders from main section
        if (pos.section === 'main' && (pos.card.isBase || pos.card.isLeader)) {
          toRemove.push(cardId)
          return
        }
        
        if (pos.section === 'main') {
          // Filters enable/disable cards instead of hiding/showing
          updated[cardId] = {
            ...pos,
            enabled: cardMatchesFilters(pos.card)
          }
        }
      })
      
      // Remove invalid cards
      toRemove.forEach(cardId => {
        delete updated[cardId]
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
        .filter(([_, pos]) => pos.section === 'main' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
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
        // Grid layout - compact layout (fill gaps)
        // Filter to only enabled cards for compact grid
        const enabledSorted = sorted.filter((card, idx) => {
          const cardId = sortedIds[idx]
          if (!cardId || !updated[cardId]) return false
          return updated[cardId].enabled !== false
        })
        const enabledIds = enabledSorted.map(card => {
          const idx = sorted.findIndex(c => c.id === card.id || c.name === card.name)
          return sortedIds[idx]
        }).filter(Boolean)
        
        enabledIds.forEach((cardId, index) => {
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
    if (card.section === 'leaders-bases' && card.card.isLeader) {
      // Only allow selection, not deselection by clicking the same card
      if (cardId !== activeLeader) {
        setActiveLeader(cardId)
      }
      return
    }
    
    if (card.section === 'leaders-bases' && card.card.isBase) {
      // Only allow selection, not deselection by clicking the same card
      if (cardId !== activeBase) {
        setActiveBase(cardId)
      }
      return
    }
    
    // For pool cards (main section), clicking toggles enable/disable
    if (card.section === 'main' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      setCardPositions(prev => ({
        ...prev,
        [cardId]: {
          ...prev[cardId],
          enabled: !prev[cardId].enabled
        }
      }))
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
          // Store final position for cleanup
          finalDragPositionRef.current = { x: constrainedX, y: constrainedY }
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
      const currentDraggedCard = draggedCard
      const finalPos = finalDragPositionRef.current
      
      // Cleanup overlap
      setCardPositions(prev => {
        const draggedCardPos = prev[currentDraggedCard]
        if (!draggedCardPos) return prev
        
        // Use final position from ref if available, otherwise use current position
        const dragX = finalPos ? finalPos.x : draggedCardPos.x
        const dragY = finalPos ? finalPos.y : draggedCardPos.y
        
        const draggedWidth = draggedCardPos.card.isLeader || draggedCardPos.card.isBase ? 168 : 120
        const draggedHeight = draggedCardPos.card.isLeader || draggedCardPos.card.isBase ? 120 : 168
        const draggedLeft = dragX
        const draggedRight = dragX + draggedWidth
        const draggedTop = dragY
        const draggedBottom = dragY + draggedHeight
        const draggedCenterX = dragX + draggedWidth / 2
        const draggedCenterY = dragY + draggedHeight / 2
        
        // Find all cards that the dragged card overlaps with (in the same section)
        const overlappingCards = []
        Object.entries(prev).forEach(([cardId, pos]) => {
          if (cardId === currentDraggedCard || !pos.visible || pos.section !== draggedCardPos.section) return
          
          const cardWidth = pos.card.isLeader || pos.card.isBase ? 168 : 120
          const cardHeight = pos.card.isLeader || pos.card.isBase ? 120 : 168
          const cardLeft = pos.x
          const cardRight = pos.x + cardWidth
          const cardTop = pos.y
          const cardBottom = pos.y + cardHeight
          
          // Check if dragged card's center is inside this card (more reliable)
          const centerOverlap = draggedCenterX >= cardLeft && draggedCenterX <= cardRight &&
                                draggedCenterY >= cardTop && draggedCenterY <= cardBottom
          
          // Also check if cards have significant overlap (at least 20% area overlap)
          const overlapX = Math.max(0, Math.min(draggedRight, cardRight) - Math.max(draggedLeft, cardLeft))
          const overlapY = Math.max(0, Math.min(draggedBottom, cardBottom) - Math.max(draggedTop, cardTop))
          const overlapArea = overlapX * overlapY
          const draggedArea = draggedWidth * draggedHeight
          const significantOverlap = overlapArea > (draggedArea * 0.2)
          
          if (centerOverlap || significantOverlap) {
            overlappingCards.push({ cardId, pos })
          }
        })
        
        // If there are overlapping cards, cleanup
        if (overlappingCards.length > 0) {
          const updates = { ...prev }
          
          // First, update the dragged card's position to its final position
          updates[currentDraggedCard] = {
            ...draggedCardPos,
            x: dragX,
            y: dragY
          }
          
          // Create updated position object for sorting
          const updatedDraggedPos = {
            ...draggedCardPos,
            x: dragX,
            y: dragY
          }
          
          // Include the dragged card and all overlapping cards
          const allCardsToCleanup = [{ cardId: currentDraggedCard, pos: updatedDraggedPos }, ...overlappingCards]
          
          // Remove duplicates by cardId
          const uniqueCardsMap = new Map()
          allCardsToCleanup.forEach(({ cardId, pos }) => {
            uniqueCardsMap.set(cardId, { cardId, pos })
          })
          const uniqueCardsArray = Array.from(uniqueCardsMap.values())
          
          // Sort by current Y position, then X position to maintain visual order
          uniqueCardsArray.sort((a, b) => {
            const yDiff = a.pos.y - b.pos.y
            if (Math.abs(yDiff) < 50) {
              return a.pos.x - b.pos.x
            }
            return yDiff
          })
          
          // Find the leftmost X position of all cards
          const leftmostX = Math.min(...uniqueCardsArray.map(c => c.pos.x))
          
          // Get the topmost Y position
          const topmostY = Math.min(...uniqueCardsArray.map(c => c.pos.y))
          
          // Get section bounds
          const section = draggedCardPos.section
          const bounds = sectionBounds[section]
          if (bounds) {
            // Left align and stack vertically with 15px spacing
            const stackSpacing = 15
            let currentY = topmostY
            
            uniqueCardsArray.forEach(({ cardId, pos }) => {
              const cardHeight = pos.card.isLeader || pos.card.isBase ? 120 : 168
              const cardWidth = pos.card.isLeader || pos.card.isBase ? 168 : 120
              const constrainedX = Math.max(bounds.minX, Math.min(leftmostX, bounds.maxX - cardWidth))
              const constrainedY = Math.max(bounds.minY, Math.min(currentY, bounds.maxY - cardHeight))
              
              // Preserve all properties from the current position
              updates[cardId] = {
                ...updates[cardId] || pos,
                x: constrainedX,
                y: constrainedY
              }
              
              currentY = constrainedY + cardHeight + stackSpacing
            })
            
            return updates
          }
        }
          
          return prev
        })
      
      // Clear the final position ref
      finalDragPositionRef.current = null
      setDraggedCard(null)
      setDragOffset({ x: 0, y: 0 })
      setIsShiftDrag(false)
      setTouchingCards(new Set())
    }
  }, [isSelecting, draggedCard, sectionBounds])

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

  // Table sorting functions
  const handleTableSort = (field) => {
    setTableSort(prev => {
      if (prev.field === field) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { field, direction: 'asc' }
    })
  }

  const getSortArrow = (field) => {
    if (tableSort.field !== field) {
      return <span className="sort-arrow">↕</span>
    }
    return tableSort.direction === 'asc' ? <span className="sort-arrow">↑</span> : <span className="sort-arrow">↓</span>
  }

  const sortTableData = (a, b, field, direction) => {
    let aVal, bVal
    
    switch (field) {
      case 'name':
        aVal = (a.name || '').toLowerCase()
        bVal = (b.name || '').toLowerCase()
        break
      case 'cost':
        aVal = a.cost !== null && a.cost !== undefined ? a.cost : -1
        bVal = b.cost !== null && b.cost !== undefined ? b.cost : -1
        break
      case 'aspects':
        aVal = (a.aspects || []).join(', ').toLowerCase()
        bVal = (b.aspects || []).join(', ').toLowerCase()
        break
      case 'rarity':
        const rarityOrder = { 'Common': 1, 'Uncommon': 2, 'Rare': 3, 'Legendary': 4 }
        aVal = rarityOrder[a.rarity] || 0
        bVal = rarityOrder[b.rarity] || 0
        break
      default:
        return 0
    }
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  }

  // Build deck data structure
  const buildDeckData = () => {
    const leaderCard = activeLeader && cardPositions[activeLeader] ? cardPositions[activeLeader].card : null
    const baseCard = activeBase && cardPositions[activeBase] ? cardPositions[activeBase].card : null
    
    // Enabled cards go to deck, disabled cards go to sideboard
    // Exclude bases and leaders from pool
    const enabledCards = Object.values(cardPositions)
      .filter(pos => pos.section === 'main' && pos.visible && pos.enabled !== false && !pos.card.isBase && !pos.card.isLeader)
      .map(pos => pos.card)
    
    const disabledCards = Object.values(cardPositions)
      .filter(pos => pos.section === 'main' && pos.visible && pos.enabled === false && !pos.card.isBase && !pos.card.isLeader)
      .map(pos => pos.card)
    
    // Count enabled cards by ID for deck
    const deckCounts = new Map()
    enabledCards.forEach(card => {
      const id = card.id
      deckCounts.set(id, (deckCounts.get(id) || 0) + 1)
    })
    
    // Count disabled cards by ID for sideboard
    const sideboardCounts = new Map()
    disabledCards.forEach(card => {
      const id = card.id
      sideboardCounts.set(id, (sideboardCounts.get(id) || 0) + 1)
    })
    
    const deck = Array.from(deckCounts.entries()).map(([id, count]) => ({
      id,
      count
    }))
    
    const sideboard = Array.from(sideboardCounts.entries()).map(([id, count]) => ({
      id,
      count
    }))
    
    return {
      leader: leaderCard ? { id: leaderCard.id, count: 1 } : null,
      base: baseCard ? { id: baseCard.id, count: 1 } : null,
      deck,
      sideboard
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
        .filter(pos => pos.section === 'leaders-bases' && pos.visible && pos.card.isLeader)
        .map(pos => pos.card)
      
      const bases = Object.values(cardPositions)
        .filter(pos => pos.section === 'leaders-bases' && pos.visible && pos.card.isBase)
        .map(pos => pos.card)
      
      const poolCards = Object.values(cardPositions)
        .filter(pos => pos.section === 'main' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
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
        
        {/* Selected Leader/Base and Deck/Sideboard Info */}
        <div className="deck-info-bar">
          <div className="selected-cards-info">
            <span 
              className={activeLeader ? 'selected-card-name' : 'select-card-placeholder'}
              onClick={() => {
                if (!activeLeader) {
                  const leadersSection = document.querySelector('.leaders-bases-subsection:first-child')
                  if (leadersSection) {
                    leadersSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }
              }}
            >
              {activeLeader && cardPositions[activeLeader] ? (
                <>
                  {cardPositions[activeLeader].card.name}
                  {cardPositions[activeLeader].card.subtitle && (
                    <span className="selected-card-subtitle"> {cardPositions[activeLeader].card.subtitle}</span>
                  )}
                </>
              ) : (
                '(Select a Leader)'
              )}
            </span>
            <span className="separator">|</span>
            <span 
              className={activeBase ? 'selected-card-name' : 'select-card-placeholder'}
              onClick={() => {
                if (!activeBase) {
                  const basesSection = document.querySelector('.leaders-bases-subsection:last-child')
                  if (basesSection) {
                    basesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }
              }}
            >
              {activeBase && cardPositions[activeBase] 
                ? cardPositions[activeBase].card.name 
                : '(Select a Base)'}
            </span>
          </div>
          <div className="deck-counts-info">
            <span>Deck ({(() => {
              const enabledCards = Object.values(cardPositions)
                .filter(pos => pos.section === 'main' && pos.visible && pos.enabled !== false && !pos.card.isBase && !pos.card.isLeader)
              return enabledCards.length
            })()})</span>
            <span className="separator">|</span>
            <span>Sideboard ({(() => {
              const disabledCards = Object.values(cardPositions)
                .filter(pos => pos.section === 'main' && pos.visible && pos.enabled === false && !pos.card.isBase && !pos.card.isLeader)
              return disabledCards.length
            })()})</span>
          </div>
        </div>
        
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
      
      <div className="view-controls">
        <button 
          className="view-toggle-button"
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
        >
          {viewMode === 'grid' ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="3" width="16" height="2" fill="currentColor"/>
              <rect x="2" y="7" width="16" height="2" fill="currentColor"/>
              <rect x="2" y="11" width="16" height="2" fill="currentColor"/>
              <rect x="2" y="15" width="16" height="2" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2H8V8H2V2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M12 2H18V8H12V2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M2 12H8V18H2V12Z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M12 12H18V18H12V12Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          )}
        </button>
        {viewMode === 'grid' && (
          <button 
            className="filter-button"
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
          >
            Filter
          </button>
        )}
      </div>
      
      {filterDrawerOpen && (
        <>
          <div 
            className="filter-drawer-overlay"
            onClick={() => setFilterDrawerOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1999,
              background: 'transparent'
            }}
          />
          <div className="filter-drawer" onClick={(e) => e.stopPropagation()}>
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
        </>
      )}
      
      {filterDrawerOpen && (
        <div className="zoom-to-fit-container">
          <button className="export-button" onClick={zoomToFit}>
            Zoom to Fit
          </button>
        </div>
      )}
      
      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
      {/* Leaders & Bases Section - Flex Container */}
      {(() => {
        const leadersBasesCards = Object.entries(cardPositions)
          .filter(([_, position]) => position.section === 'leaders-bases' && position.visible)
          .map(([cardId, position]) => ({ cardId, position }))
        
        const leadersCards = leadersBasesCards.filter(({ position }) => position.card.isLeader)
        const basesCards = leadersBasesCards.filter(({ position }) => position.card.isBase)
        
        if (leadersBasesCards.length > 0) {
          return (
            <div className="leaders-bases-section">
              
              {/* Leaders Subsection */}
              {leadersCards.length > 0 && (
                <div className="leaders-bases-subsection">
                  <h3 
                    className="subsection-header"
                    onClick={() => setLeadersExpanded(!leadersExpanded)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <span style={{ marginRight: '0.5rem' }}>{leadersExpanded ? '▼' : '▶'}</span>
                    Leaders
                  </h3>
                  {leadersExpanded && (
                    <div className="leaders-bases-container">
                    {leadersCards.map(({ cardId, position }) => {
                      const card = position.card
                      const isSelected = selectedCards.has(cardId)
                      const isHovered = hoveredCard === cardId
                      const isActiveLeader = activeLeader === cardId
                      
                      return (
                        <div
                          key={cardId}
                          className={`canvas-card leader ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isActiveLeader ? 'active-leader' : ''}`}
                          style={{
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                          onClick={() => {
                            setActiveLeader(activeLeader === cardId ? null : cardId)
                          }}
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
                  )}
                </div>
              )}
              
              {/* Bases Subsection */}
              {basesCards.length > 0 && (
                <div className="leaders-bases-subsection">
                  <h3 
                    className="subsection-header"
                    onClick={() => setBasesExpanded(!basesExpanded)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <span style={{ marginRight: '0.5rem' }}>{basesExpanded ? '▼' : '▶'}</span>
                    Bases
                  </h3>
                  {basesExpanded && (
                    <div className="leaders-bases-container">
                    {basesCards.map(({ cardId, position }) => {
                      const card = position.card
                      const isSelected = selectedCards.has(cardId)
                      const isHovered = hoveredCard === cardId
                      const isActiveBase = activeBase === cardId
                      
                      return (
                        <div
                          key={cardId}
                          className={`canvas-card base ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isActiveBase ? 'active-base' : ''}`}
                          style={{
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                          onClick={() => {
                            setActiveBase(activeBase === cardId ? null : cardId)
                          }}
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
                  )}
                </div>
              )}
            </div>
          )
        }
        return null
      })()}
      
      {/* Pool Cards Canvas */}
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
        
        {/* Section border for pool cards */}
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
        
        {sectionLabels.filter(label => label.text === 'Pool Cards').map((label, index) => (
          <div key={index} className="section-label" style={{ top: `${label.y}px`, left: '50px' }}>
            {label.text}
          </div>
        ))}
        
        {Object.entries(cardPositions).map(([cardId, position]) => {
          if (!position.visible || position.section === 'leaders-bases') return null
          
          const card = position.card
          // Exclude bases and leaders from pool section
          if (card.isBase || card.isLeader) return null
          
          const isDragging = draggedCard === cardId
          const isSelected = selectedCards.has(cardId)
          const isHovered = hoveredCard === cardId
          const isDisabled = position.section === 'main' && position.enabled === false
          const canDrag = true
          
          return (
            <div
              key={cardId}
              className={`canvas-card ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isDisabled ? 'disabled' : ''}`}
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
        </>
      )}
      
      {/* List View */}
      {viewMode === 'list' && (
        <div className="list-view">
          {/* Leaders Section */}
          {(() => {
            const leaderPositions = Object.entries(cardPositions)
              .filter(([_, pos]) => pos.section === 'leaders-bases' && pos.visible && pos.card.isLeader)
              .map(([cardId, pos]) => ({ cardId, card: pos.card, enabled: pos.enabled !== false }))
            
            if (leaderPositions.length === 0) return null
            
            const sortedLeaders = [...leaderPositions].sort((a, b) => {
              if (!tableSort.field) return 0
              return sortTableData(a.card, b.card, tableSort.field, tableSort.direction)
            })
            
            return (
              <div className="list-section">
                <h2 
                  className="list-section-title"
                  onClick={() => setLeadersExpanded(!leadersExpanded)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ marginRight: '0.5rem' }}>{leadersExpanded ? '▼' : '▶'}</span>
                  Leaders
                </h2>
                {leadersExpanded && (
                  <table className="list-table">
                  <thead>
                    <tr>
                      <th className="checkbox-col">
                        <input type="checkbox" disabled />
                      </th>
                      <th className="sortable" onClick={() => handleTableSort('name')}>
                        Title {getSortArrow('name')}
                      </th>
                      <th className="sortable" onClick={() => handleTableSort('cost')}>
                        Cost {getSortArrow('cost')}
                      </th>
                      <th className="sortable" onClick={() => handleTableSort('aspects')}>
                        Aspects {getSortArrow('aspects')}
                      </th>
                      <th className="sortable" onClick={() => handleTableSort('rarity')}>
                        Rarity {getSortArrow('rarity')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLeaders.map(({ cardId, card, enabled }, idx) => {
                      const aspectSymbols = card.aspects && card.aspects.length > 0 
                        ? card.aspects.map((aspect, i) => {
                            const symbol = getAspectSymbol(aspect)
                            return symbol ? <span key={i} className="aspect-symbol-wrapper">{symbol}</span> : null
                          }).filter(Boolean)
                        : null
                      return (
                        <tr key={`leader-${cardId}-${idx}`} className={!enabled ? 'disabled' : ''}>
                          <td>
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={(e) => {
                                setCardPositions(prev => ({
                                  ...prev,
                                  [cardId]: { ...prev[cardId], enabled: e.target.checked }
                                }))
                              }}
                            />
                          </td>
                          <td>
                            <div className="card-name-cell">
                              <div className="card-name-main">{card.name || 'Unknown'}</div>
                              {card.subtitle && !card.isBase && (
                                <div className="card-name-subtitle">{card.subtitle}</div>
                              )}
                            </div>
                          </td>
                          <td>{card.cost !== null && card.cost !== undefined ? card.cost : '-'}</td>
                          <td className="aspects-cell">
                            {aspectSymbols && aspectSymbols.length > 0 ? aspectSymbols : <span>Neutral</span>}
                          </td>
                          <td style={{ color: getRarityColor(card.rarity) }}>{card.rarity || 'Unknown'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  </table>
                )}
              </div>
            )
          })()}
          
          {/* Bases Section */}
          {(() => {
            const basePositions = Object.entries(cardPositions)
              .filter(([_, pos]) => pos.section === 'leaders-bases' && pos.visible && pos.card.isBase)
              .map(([cardId, pos]) => ({ cardId, card: pos.card, enabled: pos.enabled !== false }))
            
            if (basePositions.length === 0) return null
            
            const sortedBases = [...basePositions].sort((a, b) => {
              if (!tableSort.field) return 0
              return sortTableData(a.card, b.card, tableSort.field, tableSort.direction)
            })
            
            return (
              <div className="list-section">
                <h2 
                  className="list-section-title"
                  onClick={() => setBasesExpanded(!basesExpanded)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ marginRight: '0.5rem' }}>{basesExpanded ? '▼' : '▶'}</span>
                  Bases
                </h2>
                {basesExpanded && (
                  <table className="list-table">
                  <thead>
                    <tr>
                      <th className="checkbox-col">
                        <input type="checkbox" disabled />
                      </th>
                      <th className="sortable" onClick={() => handleTableSort('name')}>
                        Title {getSortArrow('name')}
                      </th>
                      <th className="sortable" onClick={() => handleTableSort('cost')}>
                        Cost {getSortArrow('cost')}
                      </th>
                      <th className="sortable" onClick={() => handleTableSort('aspects')}>
                        Aspects {getSortArrow('aspects')}
                      </th>
                      <th className="sortable" onClick={() => handleTableSort('rarity')}>
                        Rarity {getSortArrow('rarity')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBases.map(({ cardId, card, enabled }, idx) => {
                      const aspectSymbols = card.aspects && card.aspects.length > 0 
                        ? card.aspects.map((aspect, i) => {
                            const symbol = getAspectSymbol(aspect)
                            return symbol ? <span key={i} className="aspect-symbol-wrapper">{symbol}</span> : null
                          }).filter(Boolean)
                        : null
                      return (
                        <tr key={`base-${cardId}-${idx}`} className={!enabled ? 'disabled' : ''}>
                          <td>
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={(e) => {
                                setCardPositions(prev => ({
                                  ...prev,
                                  [cardId]: { ...prev[cardId], enabled: e.target.checked }
                                }))
                              }}
                            />
                          </td>
                          <td>
                            <div className="card-name-cell">
                              <div className="card-name-main">{card.name || 'Unknown'}</div>
                              {card.subtitle && !card.isBase && (
                                <div className="card-name-subtitle">{card.subtitle}</div>
                              )}
                            </div>
                          </td>
                          <td>{card.cost !== null && card.cost !== undefined ? card.cost : '-'}</td>
                          <td className="aspects-cell">
                            {aspectSymbols && aspectSymbols.length > 0 ? aspectSymbols : <span>Neutral</span>}
                          </td>
                          <td style={{ color: getRarityColor(card.rarity) }}>{card.rarity || 'Unknown'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  </table>
                )}
              </div>
            )
          })()}
          
          {/* Card Pool Section */}
          {(() => {
            const poolCardPositions = Object.entries(cardPositions)
              .filter(([_, pos]) => pos.section === 'main' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
              .map(([cardId, pos]) => ({ cardId, card: pos.card, enabled: pos.enabled !== false }))
            
            if (poolCardPositions.length === 0) return null
            
            const sortedPoolCards = [...poolCardPositions].sort((a, b) => {
              if (!tableSort.field) return 0
              return sortTableData(a.card, b.card, tableSort.field, tableSort.direction)
            })
            
            return (
              <div className="list-section">
                <h2 className="list-section-title">Card Pool</h2>
                <table className="list-table">
                  <thead>
                    <tr>
                      <th className="checkbox-col">
                        <input type="checkbox" disabled />
                      </th>
                      <th className="sortable" onClick={() => handleTableSort('name')}>
                        Title {getSortArrow('name')}
                      </th>
                      <th className="sortable" onClick={() => handleTableSort('cost')}>
                        Cost {getSortArrow('cost')}
                      </th>
                      <th className="sortable" onClick={() => handleTableSort('aspects')}>
                        Aspects {getSortArrow('aspects')}
                      </th>
                      <th className="sortable" onClick={() => handleTableSort('rarity')}>
                        Rarity {getSortArrow('rarity')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPoolCards.map(({ cardId, card, enabled }, idx) => {
                      const aspectSymbols = card.aspects && card.aspects.length > 0 
                        ? card.aspects.map((aspect, i) => {
                            const symbol = getAspectSymbol(aspect)
                            return symbol ? <span key={i} className="aspect-symbol-wrapper">{symbol}</span> : null
                          }).filter(Boolean)
                        : null
                      return (
                        <tr key={`pool-${cardId}-${idx}`} className={!enabled ? 'disabled' : ''}>
                          <td>
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={(e) => {
                                setCardPositions(prev => ({
                                  ...prev,
                                  [cardId]: { ...prev[cardId], enabled: e.target.checked }
                                }))
                              }}
                            />
                          </td>
                          <td>
                            <div className="card-name-cell">
                              <div className="card-name-main">{card.name || 'Unknown'}</div>
                              {card.subtitle && !card.isBase && (
                                <div className="card-name-subtitle">{card.subtitle}</div>
                              )}
                            </div>
                          </td>
                          <td>{card.cost !== null && card.cost !== undefined ? card.cost : '-'}</td>
                          <td className="aspects-cell">
                            {aspectSymbols && aspectSymbols.length > 0 ? aspectSymbols : <span>Neutral</span>}
                          </td>
                          <td style={{ color: getRarityColor(card.rarity) }}>{card.rarity || 'Unknown'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export default DeckBuilder
