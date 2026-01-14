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
  const [sortDrawerOpen, setSortDrawerOpen] = useState(false)
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
  const [leadersExpanded, setLeadersExpanded] = useState(true)
  const [basesExpanded, setBasesExpanded] = useState(true)
  const [deckExpanded, setDeckExpanded] = useState(true)
  const [sideboardExpanded, setSideboardExpanded] = useState(true)
  const [selectedCards, setSelectedCards] = useState(new Set())
  const [selectionBox, setSelectionBox] = useState(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [isShiftDrag, setIsShiftDrag] = useState(false)
  const [touchingCards, setTouchingCards] = useState(new Set())
  const [zIndexCounter, setZIndexCounter] = useState(1000)
  const [activeLeader, setActiveLeader] = useState(null)
  const [activeBase, setActiveBase] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isInfoBarSticky, setIsInfoBarSticky] = useState(false)
  const hasDraggedRef = useRef(false)
  const finalDragPositionRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const infoBarRef = useRef(null)

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

  // Sort and filter cards (only from deck section, excluding bases and leaders)
  const getFilteredAndSortedCards = useCallback(() => {
    const allCards = Object.values(cardPositions)
      .filter(pos => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
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
            if ((pos.section === 'deck' || pos.section === 'sideboard') && (pos.card?.isBase || pos.card?.isLeader)) {
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

  // Detect when deck-info-bar becomes sticky
  useEffect(() => {
    const infoBar = infoBarRef.current
    if (!infoBar) return

    const checkSticky = () => {
      if (!infoBar) return
      const rect = infoBar.getBoundingClientRect()
      // Check if element is stuck at top: 20px
      const isSticky = Math.abs(rect.top - 20) < 5
      setIsInfoBarSticky(isSticky)
    }

    // Check on scroll and resize
    const handleScroll = () => requestAnimationFrame(checkSticky)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    checkSticky() // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

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
        // Calculate end Y as the bottom of the last row of cards (no extra spacing)
        // For last row: (totalRows - 1) rows of spacing + last row's cards
        const sectionEndY = currentY + (totalRows - 1) * (leaderBaseHeight + spacing) + leaderBaseHeight
        bounds['leaders-bases'] = { minY: sectionStartY, maxY: sectionEndY, minX: padding, maxX: window.innerWidth - padding }
        // Start pool section right after leaders/bases with minimal gap (just for label)
        currentY = sectionEndY + 20 // Small gap for visual separation
      }
      
      if (poolCards.length > 0) {
        // Deck section
        const deckStartY = currentY + labelHeight
        labels.push({ text: 'Deck', y: deckStartY - labelHeight })
        currentY = deckStartY
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
            section: 'deck', // Start in deck section
            visible: true,
            enabled: true,
            zIndex: 1
          }
        })
        const mainRows = Math.ceil(poolCards.length / cardsPerRow)
        const deckEndY = currentY + mainRows * (cardHeight + spacing)
        bounds.deck = { minY: deckStartY, maxY: deckEndY, minX: padding, maxX: window.innerWidth - padding }
        currentY = deckEndY
        
        // Sideboard section (empty initially, but with space reserved)
        const sideboardStartY = currentY + labelHeight + 10
        labels.push({ text: 'Sideboard', y: sideboardStartY - labelHeight })
        bounds.sideboard = { minY: sideboardStartY, maxY: sideboardStartY + 200, minX: padding, maxX: window.innerWidth - padding }
        currentY = sideboardStartY + 200
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
        aspectFilters,
        sortOption
      }
      sessionStorage.setItem('deckBuilderState', JSON.stringify(stateToSave))
    }
  }, [cardPositions, sectionLabels, sectionBounds, canvasHeight, aspectFilters, sortOption])

  // Cleanup: Remove any bases/leaders from deck/sideboard sections and move cards based on enabled state
  useEffect(() => {
    setCardPositions(prev => {
      const updated = { ...prev }
      const toRemove = []
      
      Object.keys(updated).forEach(cardId => {
        const pos = updated[cardId]
        // Remove bases and leaders from deck/sideboard sections
        if ((pos.section === 'deck' || pos.section === 'sideboard') && (pos.card.isBase || pos.card.isLeader)) {
          toRemove.push(cardId)
          return
        }
        
        // Move cards between deck and sideboard based on enabled state
        if (pos.section === 'deck' || pos.section === 'sideboard') {
          const isEnabled = pos.enabled !== false
          const shouldBeInDeck = isEnabled
          
          if (shouldBeInDeck && pos.section === 'sideboard') {
            // Move from sideboard to deck (card is enabled)
          updated[cardId] = {
            ...pos,
              section: 'deck',
              enabled: true
            }
          } else if (!shouldBeInDeck && pos.section === 'deck') {
            // Move from deck to sideboard (card is disabled)
            updated[cardId] = {
              ...pos,
              section: 'sideboard',
              enabled: false
            }
          } else {
            // Keep in current section, enabled state already matches section
            // No change needed
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

  // Apply sorting - separate deck and sideboard
  useEffect(() => {
    if (sortOption === 'none') return
    
    setCardPositions(prev => {
      // Separate deck and sideboard cards
      const deckCards = Object.entries(prev)
        .filter(([_, pos]) => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
        .map(([id, pos]) => ({ id, ...pos }))
      
      const sideboardCards = Object.entries(prev)
        .filter(([_, pos]) => pos.section === 'sideboard' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
        .map(([id, pos]) => ({ id, ...pos }))
      
      // Get sorted deck cards (only deck section)
      const deckSorted = deckCards
        .map(({ card }) => card)
        .filter(cardMatchesFilters)
      const sortedDeckIds = deckSorted.map(card => {
        const entry = deckCards.find(({ card: c }) => c.id === card.id || c.name === card.name)
        return entry?.id
      }).filter(Boolean)
      
      // Get sorted sideboard cards
      const sideboardSorted = sideboardCards
        .map(({ card }) => card)
        .filter(cardMatchesFilters)
      const sortedSideboardIds = sideboardSorted.map(card => {
        const entry = sideboardCards.find(({ card: c }) => c.id === card.id || c.name === card.name)
        return entry?.id
      }).filter(Boolean)
      
      const updated = { ...prev }
      const cardWidth = 120
      const cardHeight = 168
      const spacing = 20
      const padding = 50
      const sectionSpacing = 80
      const cardsPerRow = Math.floor((window.innerWidth - 100) / (cardWidth + spacing))
      
      // Get deck section bounds
      const deckBounds = sectionBounds.deck || { minY: padding, maxY: padding + 500, minX: padding, maxX: window.innerWidth - padding }
      let deckY = deckBounds.minY
      
      // Get sideboard section bounds (after deck)
      const sideboardStartY = deckBounds.maxY + sectionSpacing + 30
      let sideboardY = sideboardStartY
      
      // Helper function to sort cards
      const sortCards = (cards) => {
        if (sortOption === 'cost') {
          return [...cards].sort((a, b) => (a.cost || 0) - (b.cost || 0))
        } else if (sortOption === 'aspect') {
          const grouped = {}
          cards.forEach(card => {
            const key = getAspectKey(card)
            if (!grouped[key]) grouped[key] = []
            grouped[key].push(card)
          })
          const sortedKeys = Object.keys(grouped).sort()
          return sortedKeys.flatMap(key => grouped[key])
        } else if (sortOption === 'type') {
          const typeOrder = { 'Ground Unit': 1, 'Space Unit': 2, 'Upgrade': 3, 'Event': 4 }
          return [...cards].sort((a, b) => {
            const aOrder = typeOrder[a.type] || 99
            const bOrder = typeOrder[b.type] || 99
            if (aOrder !== bOrder) return aOrder - bOrder
            return (a.cost || 0) - (b.cost || 0)
          })
        }
        return cards
      }
      
      // Helper function to position cards in a section
      const positionCards = (cardIds, startY, sectionName) => {
        if (cardIds.length === 0) return startY
        
        const cards = cardIds.map(id => updated[id]?.card).filter(Boolean)
        const sortedCards = sortCards(cards)
        const sortedCardIds = sortedCards.map(card => {
          return cardIds.find(id => {
            const c = updated[id]?.card
            return c && (c.id === card.id || c.name === card.name)
          })
        }).filter(Boolean)
      
      if (sortOption === 'cost') {
        // Vertical columns by cost
        const costGroups = {}
          sortedCardIds.forEach(cardId => {
            const card = updated[cardId]?.card
            if (!card) return
          const cost = card.cost || 0
          if (!costGroups[cost]) costGroups[cost] = []
            costGroups[cost].push(cardId)
        })
        
        let col = 0
          let maxRow = 0
        Object.keys(costGroups).sort((a, b) => a - b).forEach(cost => {
            costGroups[cost].forEach((cardId, idx) => {
              if (updated[cardId]) {
              const row = idx
                maxRow = Math.max(maxRow, row)
              updated[cardId] = {
                ...updated[cardId],
                x: padding + col * (cardWidth + spacing),
                  y: startY + row * (cardHeight + spacing),
                  section: sectionName
              }
            }
          })
          col++
        })
          return startY + (maxRow + 1) * (cardHeight + spacing)
      } else if (sortOption === 'aspect') {
        // Group by aspect combination
        const aspectGroups = {}
          sortedCardIds.forEach(cardId => {
            const card = updated[cardId]?.card
            if (!card) return
          const key = getAspectKey(card)
          if (!aspectGroups[key]) aspectGroups[key] = []
            aspectGroups[key].push(cardId)
        })
        
          let currentY = startY
        const sortedKeys = Object.keys(aspectGroups).sort()
        sortedKeys.forEach(key => {
          const group = aspectGroups[key]
            group.forEach((cardId, idx) => {
              if (updated[cardId]) {
              updated[cardId] = {
                ...updated[cardId],
                  x: padding,
                  y: currentY + idx * (cardHeight + spacing),
                  section: sectionName
              }
            }
          })
          const groupHeight = group.length * (cardHeight + spacing)
          currentY += groupHeight + sectionSpacing
        })
          return currentY
      } else {
          // Grid layout - compact layout (fill gaps)
          sortedCardIds.forEach((cardId, index) => {
          if (cardId && updated[cardId]) {
            const row = Math.floor(index / cardsPerRow)
            const col = index % cardsPerRow
            updated[cardId] = {
              ...updated[cardId],
              x: padding + col * (cardWidth + spacing),
                y: startY + row * (cardHeight + spacing),
                section: sectionName
              }
            }
          })
          const rows = Math.ceil(sortedCardIds.length / cardsPerRow)
          return startY + rows * (cardHeight + spacing)
        }
      }
      
      // Position deck cards
      const deckEndY = positionCards(sortedDeckIds, deckY, 'deck')
      
      // Position sideboard cards
      const sideboardEndY = positionCards(sortedSideboardIds, sideboardY, 'sideboard')
      
      // Update section bounds and canvas height
      const newDeckBounds = { ...deckBounds, maxY: deckEndY }
      const newSideboardBounds = { minY: sideboardY, maxY: sideboardEndY, minX: padding, maxX: window.innerWidth - padding }
      
      setSectionBounds(prev => ({
        ...prev,
        deck: newDeckBounds,
        sideboard: newSideboardBounds
      }))
      
      // Update canvas height to include both sections
      const maxY = Math.max(deckEndY, sideboardEndY)
      setCanvasHeight(maxY + padding)
      
      return updated
    })
  }, [sortOption, cardMatchesFilters, getAspectKey, sectionBounds])

  const handleMouseDown = (e, cardId) => {
    if (e.button !== 0) return // Only left click
    e.preventDefault()
    e.stopPropagation()
    
    if (!cardId) return
      const card = cardPositions[cardId]
      if (!card) return
    
    // Reset drag flag at start of mouse down
    hasDraggedRef.current = false
    
    // Handle leaders and bases - they can't be dragged, only selected
    if (card.section === 'leaders-bases' && card.card.isLeader) {
      // Toggle selection - clicking same card deselects
      setActiveLeader(cardId === activeLeader ? null : cardId)
      return
    }
    
    if (card.section === 'leaders-bases' && card.card.isBase) {
      // Toggle selection - clicking same card deselects
      setActiveBase(cardId === activeBase ? null : cardId)
      return
    }
    
    // For pool cards (deck/sideboard sections), clicking moves between deck and sideboard
    // But only if not using modifier keys (which are for selection)
    if ((card.section === 'deck' || card.section === 'sideboard') && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      // Store that we're doing a click-toggle, not a drag
      hasDraggedRef.current = false
      setCardPositions(prev => ({
        ...prev,
        [cardId]: {
          ...prev[cardId],
          section: prev[cardId].section === 'deck' ? 'sideboard' : 'deck',
          enabled: prev[cardId].section === 'deck' ? false : true
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
    const offsetX = (e.clientX - rect.left) - card.x
    const offsetY = (e.clientY - rect.top) - card.y

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
      const startX = (e.clientX - rect.left)
      const startY = (e.clientY - rect.top)
      setIsSelecting(true)
      setSelectionBox({ startX, startY, endX: startX, endY: startY })
      setSelectedCards(new Set())
    }
  }

  const handleMouseMove = useCallback((e) => {
    if (isSelecting && selectionBox) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      
      const endX = (e.clientX - rect.left)
      const endY = (e.clientY - rect.top)
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

        const newX = (e.clientX - rect.left) - dragOffset.x
        const newY = (e.clientY - rect.top) - dragOffset.y
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
  }, [draggedCard, dragOffset, selectedCards, cardPositions, isSelecting, selectionBox, sectionBounds, isShiftDrag, touchingCards, findTouchingCards])

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
      hasDraggedRef.current = false
      setDraggedCard(null)
      setDragOffset({ x: 0, y: 0 })
      setIsShiftDrag(false)
      setTouchingCards(new Set())
    }
  }, [isSelecting, draggedCard, sectionBounds])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

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

  const defaultSort = (a, b) => {
    // Default sort: by name alphabetically
    const aName = (a.name || '').toLowerCase()
    const bName = (b.name || '').toLowerCase()
    return aName.localeCompare(bName)
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
    
    // Cards in deck section go to deck, cards in sideboard section go to sideboard
    // Exclude bases and leaders from pool
    const enabledCards = Object.values(cardPositions)
      .filter(pos => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
      .map(pos => pos.card)
    
    const disabledCards = Object.values(cardPositions)
      .filter(pos => pos.section === 'sideboard' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
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
      
      // Get selected leader and base
      const selectedLeader = activeLeader ? cardPositions[activeLeader]?.card : null
      const selectedBase = activeBase ? cardPositions[activeBase]?.card : null
      
      // Get deck cards (in color)
      const deckCards = Object.values(cardPositions)
        .filter(pos => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
        .map(pos => pos.card)
      
      // Get sideboard cards (will be grayscale)
      const sideboardCards = Object.values(cardPositions)
        .filter(pos => pos.section === 'sideboard' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
        .map(pos => pos.card)
      
      // Get unused leaders and bases (will be grayscale)
      const unusedLeaders = Object.entries(cardPositions)
        .filter(([cardId, pos]) => pos.section === 'leaders-bases' && pos.visible && pos.card.isLeader && cardId !== activeLeader)
        .map(([_, pos]) => pos.card)
      
      const unusedBases = Object.entries(cardPositions)
        .filter(([cardId, pos]) => pos.section === 'leaders-bases' && pos.visible && pos.card.isBase && cardId !== activeBase)
        .map(([_, pos]) => pos.card)
      
      // Count cards for display
      const deckCounts = new Map()
      deckCards.forEach(card => {
        const key = card.id || card.name
        deckCounts.set(key, (deckCounts.get(key) || 0) + 1)
      })
      
      const sideboardCounts = new Map()
      sideboardCards.forEach(card => {
        const key = card.id || card.name
        sideboardCounts.set(key, (sideboardCounts.get(key) || 0) + 1)
      })
      
      // Card dimensions
      const cardWidth = 120
      const cardHeight = 168
      const leaderBaseWidth = 168
      const leaderBaseHeight = 120
      const spacing = 20
      const padding = 50
      const sectionSpacing = 40
      const cardsPerRow = 6
      
      // Calculate dimensions
      const deckRows = Math.ceil(Array.from(deckCounts.keys()).length / cardsPerRow)
      const sideboardRows = Math.ceil(Array.from(sideboardCounts.keys()).length / cardsPerRow)
      const unusedLeadersRows = Math.ceil(Math.max(0, unusedLeaders.length) / 2)
      const unusedBasesRows = Math.ceil(Math.max(0, unusedBases.length) / 2)
      
      const width = padding * 2 + cardsPerRow * (cardWidth + spacing) - spacing
      let currentY = padding
      
      // Selected leader and base at top (1 row)
      if (selectedLeader || selectedBase) {
        currentY += leaderBaseHeight + sectionSpacing
      }
      
      // Deck section
      currentY += deckRows * (cardHeight + spacing) + sectionSpacing
      
      // Sideboard section
      currentY += sideboardRows * (cardHeight + spacing) + sectionSpacing
      
      // Unused leaders section
      currentY += unusedLeadersRows * (leaderBaseHeight + spacing) + sectionSpacing
      
      // Unused bases section
      currentY += unusedBasesRows * (leaderBaseHeight + spacing) + sectionSpacing
      
      // Add space for swupod stamp
      const stampHeight = 40
      const totalHeight = currentY + stampHeight + padding
      
      // Create canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = totalHeight
      const ctx = canvas.getContext('2d')
      
      // Draw background (same as deck builder page)
      ctx.fillStyle = 'rgb(76, 77, 81)'
      ctx.fillRect(0, 0, width, totalHeight)
      
      // Load background image if available
      const bgImg = new Image()
      bgImg.crossOrigin = 'anonymous'
      await new Promise((resolve) => {
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, width, totalHeight)
          resolve()
        }
        bgImg.onerror = () => resolve()
        bgImg.src = '/background-images/bg-texture-crop.png'
      })
      
      // Helper to load and draw card image
      const drawCard = async (card, x, y, width, height, count = null, grayscale = false) => {
        return new Promise((resolve) => {
          if (card.imageUrl) {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              // Save context state
              ctx.save()
              
              if (grayscale) {
                // Apply grayscale filter
                ctx.filter = 'grayscale(100%)'
              }
              
              // Draw card image
              ctx.drawImage(img, x, y, width, height)
              
              // Restore context (removes filter)
              ctx.restore()
              
              // Draw rainbow border (3px) around the card
              const borderWidth = 3
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
              ctx.fillStyle = grayscale ? 'rgba(50, 50, 50, 0.8)' : 'rgba(26, 26, 46, 0.8)'
              ctx.fillRect(x, y, width, height)
              // Draw rainbow border on placeholder too
              const borderWidth = 3
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
              ctx.fillStyle = grayscale ? 'rgba(200, 200, 200, 0.5)' : 'white'
              ctx.font = '12px Arial'
              ctx.textAlign = 'center'
              ctx.fillText(card.name || 'Card', x + width / 2, y + height / 2)
              resolve()
            }
            img.src = card.imageUrl
          } else {
            // Draw placeholder
            ctx.fillStyle = grayscale ? 'rgba(50, 50, 50, 0.8)' : 'rgba(26, 26, 46, 0.8)'
            ctx.fillRect(x, y, width, height)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
            ctx.lineWidth = 1
            ctx.strokeRect(x, y, width, height)
            ctx.fillStyle = grayscale ? 'rgba(200, 200, 200, 0.5)' : 'white'
            ctx.font = '12px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(card.name || 'Card', x + width / 2, y + height / 2)
            resolve()
          }
        })
      }
      
      currentY = padding
      
      // Draw selected leader and base at top
      if (selectedLeader || selectedBase) {
        let col = 0
        if (selectedLeader) {
          const x = padding + col * (leaderBaseWidth + spacing)
          await drawCard(selectedLeader, x, currentY, leaderBaseWidth, leaderBaseHeight, null, false)
          col++
        }
        if (selectedBase) {
          const x = padding + col * (leaderBaseWidth + spacing)
          await drawCard(selectedBase, x, currentY, leaderBaseWidth, leaderBaseHeight, null, false)
        }
        currentY += leaderBaseHeight + sectionSpacing
      }
      
      // Draw deck cards (in color)
      const uniqueDeckCards = Array.from(deckCounts.entries()).map(([key, count]) => {
        const card = deckCards.find(c => (c.id || c.name) === key)
        return { card, count }
      })
      
      let col = 0
      let row = 0
      for (const { card, count } of uniqueDeckCards) {
        const x = padding + col * (cardWidth + spacing)
        const y = currentY + row * (cardHeight + spacing)
        await drawCard(card, x, y, cardWidth, cardHeight, count, false)
        col++
        if (col >= cardsPerRow) {
          col = 0
          row++
        }
      }
      currentY += deckRows * (cardHeight + spacing) + sectionSpacing
      
      // Draw sideboard cards (in grayscale)
      const uniqueSideboardCards = Array.from(sideboardCounts.entries()).map(([key, count]) => {
        const card = sideboardCards.find(c => (c.id || c.name) === key)
        return { card, count }
      })
      
      col = 0
      row = 0
      for (const { card, count } of uniqueSideboardCards) {
        const x = padding + col * (cardWidth + spacing)
        const y = currentY + row * (cardHeight + spacing)
        await drawCard(card, x, y, cardWidth, cardHeight, count, true)
        col++
        if (col >= cardsPerRow) {
          col = 0
          row++
        }
      }
      currentY += sideboardRows * (cardHeight + spacing) + sectionSpacing
      
      // Draw unused leaders (in grayscale)
      if (unusedLeaders.length > 0) {
        col = 0
        row = 0
        for (const leader of unusedLeaders) {
          const x = padding + col * (leaderBaseWidth + spacing)
          const y = currentY + row * (leaderBaseHeight + spacing)
          await drawCard(leader, x, y, leaderBaseWidth, leaderBaseHeight, null, true)
          col++
          if (col >= 2) {
            col = 0
            row++
          }
        }
        currentY += unusedLeadersRows * (leaderBaseHeight + spacing) + sectionSpacing
      }
      
      // Draw unused bases (in grayscale)
      if (unusedBases.length > 0) {
        col = 0
        row = 0
        for (const base of unusedBases) {
          const x = padding + col * (leaderBaseWidth + spacing)
          const y = currentY + row * (leaderBaseHeight + spacing)
          await drawCard(base, x, y, leaderBaseWidth, leaderBaseHeight, null, true)
          col++
          if (col >= 2) {
            col = 0
            row++
          }
        }
        currentY += unusedBasesRows * (leaderBaseHeight + spacing) + sectionSpacing
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
      
      {/* Selected Leader/Base and Deck/Sideboard Info - Sticky Bar */}
      <div className={`deck-info-bar ${isInfoBarSticky ? 'sticky' : ''}`} ref={infoBarRef}>
        <div className="selected-cards-info">
          <div 
            className={`selected-card-container ${!activeLeader ? 'select-card-placeholder' : ''} ${isInfoBarSticky ? 'sticky-layout' : 'inline-layout'}`}
            onClick={() => {
              if (!activeLeader) {
                const leadersSection = document.querySelector('.leaders-bases-subsection:first-child')
                if (leadersSection) {
                  const headerHeight = document.querySelector('.deck-info-bar')?.offsetHeight || 0
                  const topOffset = 20 // matches top: 20px from sticky header
                  const scrollOffset = headerHeight + topOffset + 10 // extra 10px for spacing
                  const elementPosition = leadersSection.getBoundingClientRect().top + window.pageYOffset
                  window.scrollTo({
                    top: elementPosition - scrollOffset,
                    behavior: 'smooth'
                  })
                }
              }
            }}
          >
            {activeLeader && cardPositions[activeLeader] ? (
              <>
                <span className="selected-card-name">{cardPositions[activeLeader].card.name}</span>
                {cardPositions[activeLeader].card.subtitle && (
                  <span className="selected-card-subtitle">{cardPositions[activeLeader].card.subtitle}</span>
                )}
              </>
            ) : (
              <span className="selected-card-name">(Select a Leader)</span>
            )}
          </div>
          <span className="separator"></span>
          <span 
            className={activeBase ? 'selected-card-name' : 'select-card-placeholder'}
            onClick={() => {
              if (!activeBase) {
                const basesSection = document.querySelector('.leaders-bases-subsection:last-child')
                if (basesSection) {
                  const headerHeight = document.querySelector('.deck-info-bar')?.offsetHeight || 0
                  const topOffset = 20 // matches top: 20px from sticky header
                  const scrollOffset = headerHeight + topOffset + 10 // extra 10px for spacing
                  const elementPosition = basesSection.getBoundingClientRect().top + window.pageYOffset
                  window.scrollTo({
                    top: elementPosition - scrollOffset,
                    behavior: 'smooth'
                  })
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
              const deckCards = Object.values(cardPositions)
                .filter(pos => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
              return deckCards.length
            })()})</span>
            <span className="separator">|</span>
            <span>Sideboard ({(() => {
              const sideboardCards = Object.values(cardPositions)
                .filter(pos => pos.section === 'sideboard' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
              return sideboardCards.length
            })()})</span>
        </div>
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
          <>
            <button 
              className="filter-button"
              onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              title="Filter"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5H17M5 10H15M7 15H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <button 
              className="filter-button"
              onClick={() => setSortDrawerOpen(!sortDrawerOpen)}
              title="Sort"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7L10 2L15 7M5 13L10 18L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
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
        </div>
        </>
      )}
      
      {sortDrawerOpen && (
        <>
          <div 
            className="filter-drawer-overlay"
            onClick={() => setSortDrawerOpen(false)}
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
          <div className="filter-drawer" style={{ right: '20px', left: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="filter-drawer-header">
              <h2>Sort</h2>
              <button onClick={() => setSortDrawerOpen(false)}>×</button>
            </div>
            <div className="filter-section">
              {SORT_OPTIONS.map(option => (
                <button
                  key={option}
                  className={`sort-button ${sortOption === option ? 'active' : ''}`}
                  onClick={() => {
                    setSortOption(option)
                    setSortDrawerOpen(false)
                  }}
                >
                  {option === 'none' ? 'None' : `Sort by ${option}`}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
      {/* Leaders & Bases Section - Flex Container */}
      {(() => {
        const leadersBasesCards = Object.entries(cardPositions)
          .filter(([_, position]) => position.section === 'leaders-bases' && position.visible)
          .map(([cardId, position]) => ({ cardId, position }))
        
        const leadersCards = leadersBasesCards
          .filter(({ position }) => position.card.isLeader)
          .sort((a, b) => defaultSort(a.position.card, b.position.card))
        const basesCards = leadersBasesCards
          .filter(({ position }) => position.card.isBase)
          .sort((a, b) => defaultSort(a.position.card, b.position.card))
        
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
      
      {/* Deck Section */}
      <div className="deck-section">
        <h3 
          className="subsection-header"
          onClick={() => setDeckExpanded(!deckExpanded)}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <span style={{ marginRight: '0.5rem' }}>{deckExpanded ? '▼' : '▶'}</span>
          Deck
        </h3>
        {deckExpanded && (
          <div className="cards-grid">
            {Object.entries(cardPositions)
              .filter(([_, position]) => position.section === 'deck' && position.visible && !position.card.isBase && !position.card.isLeader)
              .map(([cardId, position]) => ({ cardId, position }))
              .sort((a, b) => defaultSort(a.position.card, b.position.card))
              .map(({ cardId, position }) => {
              const card = position.card
              const isSelected = selectedCards.has(cardId)
              const isHovered = hoveredCard === cardId
              const isDisabled = !position.enabled
              
              return (
                <div
                  key={cardId}
                  className={`canvas-card ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={(e) => handleMouseDown(e, cardId)}
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

      {/* Sideboard Section */}
      <div className="sideboard-section">
        <h3 
          className="subsection-header"
          onClick={() => setSideboardExpanded(!sideboardExpanded)}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <span style={{ marginRight: '0.5rem' }}>{sideboardExpanded ? '▼' : '▶'}</span>
          Sideboard
        </h3>
        {sideboardExpanded && (
          <div className="cards-grid">
            {Object.entries(cardPositions)
              .filter(([_, position]) => position.section === 'sideboard' && position.visible && !position.card.isBase && !position.card.isLeader)
              .map(([cardId, position]) => ({ cardId, position }))
              .sort((a, b) => defaultSort(a.position.card, b.position.card))
              .map(({ cardId, position }) => {
              const card = position.card
              const isSelected = selectedCards.has(cardId)
              const isHovered = hoveredCard === cardId
              const isDisabled = !position.enabled
              
              return (
                <div
                  key={cardId}
                  className={`canvas-card ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={(e) => handleMouseDown(e, cardId)}
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
              if (!tableSort.field) {
                return defaultSort(a.card, b.card)
              }
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
                      const isSelected = activeLeader === cardId
                      return (
                        <tr key={`leader-${cardId}-${idx}`}>
                          <td>
                            <input
                              type="radio"
                              name="leader-selection"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setActiveLeader(cardId)
                                } else {
                                  setActiveLeader(null)
                                }
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
              if (!tableSort.field) {
                return defaultSort(a.card, b.card)
              }
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
                      const isSelected = activeBase === cardId
                      return (
                        <tr key={`base-${cardId}-${idx}`}>
                          <td>
                            <input
                              type="radio"
                              name="base-selection"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setActiveBase(cardId)
                                } else {
                                  setActiveBase(null)
                                }
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
          
          {/* Pool Section - Deck and Sideboard */}
          {(() => {
            const deckCardPositions = Object.entries(cardPositions)
              .filter(([_, pos]) => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
              .map(([cardId, pos]) => ({ cardId, card: pos.card }))
              .sort((a, b) => {
                if (!tableSort.field) {
                  return defaultSort(a.card, b.card)
                }
                return sortTableData(a.card, b.card, tableSort.field, tableSort.direction)
              })
            
            const sideboardCardPositions = Object.entries(cardPositions)
              .filter(([_, pos]) => pos.section === 'sideboard' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
              .map(([cardId, pos]) => ({ cardId, card: pos.card }))
              .sort((a, b) => {
                if (!tableSort.field) {
                  return defaultSort(a.card, b.card)
                }
                return sortTableData(a.card, b.card, tableSort.field, tableSort.direction)
              })
            
            if (deckCardPositions.length === 0 && sideboardCardPositions.length === 0) return null
            
            return (
              <div className="list-section">
                <h2 className="list-section-title">Pool</h2>
                
                {/* Deck Section */}
                {deckCardPositions.length > 0 && (
                  <div className="pool-subsection">
                    <h3 
                      className="pool-subsection-title"
                      onClick={() => setDeckExpanded(!deckExpanded)}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <span style={{ marginRight: '0.5rem' }}>{deckExpanded ? '▼' : '▶'}</span>
                      Deck ({deckCardPositions.length})
                    </h3>
                    {deckExpanded && (
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
                          {deckCardPositions.map(({ cardId, card }, idx) => {
                            const aspectSymbols = card.aspects && card.aspects.length > 0 
                              ? card.aspects.map((aspect, i) => {
                                  const symbol = getAspectSymbol(aspect)
                                  return symbol ? <span key={i} className="aspect-symbol-wrapper">{symbol}</span> : null
                                }).filter(Boolean)
                              : null
                            return (
                              <tr key={`deck-${cardId}-${idx}`}>
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={true}
                                    onChange={(e) => {
                                      setCardPositions(prev => ({
                                        ...prev,
                                        [cardId]: { ...prev[cardId], section: 'sideboard', enabled: false }
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
                )}
                
                {/* Sideboard Section */}
                {sideboardCardPositions.length > 0 && (
                  <div className="pool-subsection">
                    <h3 
                      className="pool-subsection-title"
                      onClick={() => setSideboardExpanded(!sideboardExpanded)}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <span style={{ marginRight: '0.5rem' }}>{sideboardExpanded ? '▼' : '▶'}</span>
                      Sideboard ({sideboardCardPositions.length})
                    </h3>
                    {sideboardExpanded && (
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
                          {sideboardCardPositions.map(({ cardId, card }, idx) => {
                            const aspectSymbols = card.aspects && card.aspects.length > 0 
                              ? card.aspects.map((aspect, i) => {
                                  const symbol = getAspectSymbol(aspect)
                                  return symbol ? <span key={i} className="aspect-symbol-wrapper">{symbol}</span> : null
                                }).filter(Boolean)
                              : null
                            return (
                              <tr key={`sideboard-${cardId}-${idx}`}>
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={false}
                                    onChange={(e) => {
                                      setCardPositions(prev => ({
                                        ...prev,
                                        [cardId]: { ...prev[cardId], section: 'deck', enabled: true }
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
                )}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export default DeckBuilder
