import { useState, useRef, useEffect, useCallback } from 'react'
import './DeckBuilder.css'
import './AspectIcons.css'
import { getCachedCards, isCacheInitialized } from '../utils/cardCache'
import { fetchSetCards } from '../utils/api'
import CardModal from './CardModal'
import { getAspectColor } from '../utils/aspectColors'

// Get aspect symbol for list view using individual icon files
const getAspectSymbol = (aspect, size = 'medium') => {
  const aspectMap = {
    'Command': 'command',
    'Villainy': 'villainy',
    'Heroism': 'heroism',
    'Cunning': 'cunning',
    'Vigilance': 'vigilance',
    'Aggression': 'aggression'
  }
  
  const aspectName = aspectMap[aspect]
  if (!aspectName) return null
  
  const sizeMap = {
    'small': 16,
    'medium': 18,
    'large': 38.4  // 20% smaller than cost icon (48px * 0.8 = 38.4px)
  }
  
  const iconSize = sizeMap[size] || 18
  
  return (
    <img 
      src={`/icons/${aspectName}.png`}
      alt={aspect}
      style={{ width: `${iconSize}px`, height: `${iconSize}px`, display: 'block' }}
    />
  )
}

const ASPECTS = ['Vigilance', 'Command', 'Aggression', 'Cunning', 'Villainy', 'Heroism']
const NO_ASPECT_LABEL = 'No Aspect'
const SORT_OPTIONS = ['aspect', 'cost']

// getAspectColor is now imported from utils/aspectColors

function DeckBuilder({ cards, setCode, onBack, savedState }) {
  const [cardPositions, setCardPositions] = useState({})
  const [draggedCard, setDraggedCard] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [canvasHeight, setCanvasHeight] = useState(null)
  const [allSetCards, setAllSetCards] = useState([])
  const [sectionLabels, setSectionLabels] = useState([])
  const [sectionBounds, setSectionBounds] = useState({})
  const [hoveredCard, setHoveredCard] = useState(null)
  const [ctrlPressed, setCtrlPressed] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [sortDrawerOpen, setSortDrawerOpen] = useState(false)
  const [aspectFilters, setAspectFilters] = useState({
    Vigilance: true,
    Command: true,
    Aggression: true,
    Cunning: true,
    Villainy: true,
    Heroism: true,
    [NO_ASPECT_LABEL]: true
  })
  const [sortOption, setSortOption] = useState('aspect')
  const [tableSort, setTableSort] = useState({ field: null, direction: 'asc' })
  const [leadersExpanded, setLeadersExpanded] = useState(true)
  const [basesExpanded, setBasesExpanded] = useState(true)
  const [deckExpanded, setDeckExpanded] = useState(true)
  const [sideboardExpanded, setSideboardExpanded] = useState(true)
  const [deckAspectSectionsExpanded, setDeckAspectSectionsExpanded] = useState({}) // Track expanded aspect combination sections
  const [sideboardAspectSectionsExpanded, setSideboardAspectSectionsExpanded] = useState({}) // Track expanded aspect combination sections for sideboard
  const [deckCostSectionsExpanded, setDeckCostSectionsExpanded] = useState({}) // Track expanded cost sections (default all expanded)
  const [sideboardCostSectionsExpanded, setSideboardCostSectionsExpanded] = useState({}) // Track expanded cost sections for sideboard
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
  const [selectedCard, setSelectedCard] = useState(null)
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

  // Check if card matches aspect filters (used for export, not for display filtering)
  const cardMatchesFilters = useCallback((card) => {
    const cardAspects = card.aspects || []
    // If card has no aspects, check "No Aspect" filter
    if (cardAspects.length === 0) {
      return aspectFilters[NO_ASPECT_LABEL] || false
    }
    // Card must have at least one aspect that's checked
    return cardAspects.some(aspect => aspectFilters[aspect])
  }, [aspectFilters])

  // Get aspect combination key for default sorting
  // Sort order within each primary aspect group:
  // - Primary + Villainy
  // - Primary + Heroism
  // - Primary + Primary (double)
  // - Primary only
  // Then: Villainy only, Heroism only, Neutral (no aspect)
  const getDefaultAspectSortKey = useCallback((card) => {
    const aspects = card.aspects || []
    if (aspects.length === 0) return 'Z_Neutral'
    
    const hasVillainy = aspects.includes('Villainy')
    const hasHeroism = aspects.includes('Heroism')
    const primaryAspects = ['Vigilance', 'Command', 'Aggression', 'Cunning']
    const primaryAspect = aspects.find(a => primaryAspects.includes(a))
    
    // Single aspect
    if (aspects.length === 1) {
      const aspect = aspects[0]
      if (aspect === 'Villainy') return 'Y_Villainy'
      if (aspect === 'Heroism') return 'Y_Heroism'
      // Single primary aspect (Vigilance, Command, Aggression, Cunning)
      const primaryOrder = {
        'Vigilance': 'A',
        'Command': 'B',
        'Aggression': 'C',
        'Cunning': 'D'
      }
      // Single primary comes after double and combinations, so use prefix '04'
      return `${primaryOrder[aspect] || 'Z'}_04_${aspect}`
    }
    
    // Two aspects
    if (aspects.length === 2) {
      if (primaryAspect) {
        const primaryOrder = {
          'Vigilance': 'A',
          'Command': 'B',
          'Aggression': 'C',
          'Cunning': 'D'
        }
        const prefix = primaryOrder[primaryAspect] || 'Z'
        
        // Check if it's double primary (e.g., Vigilance Vigilance)
        const primaryCount = aspects.filter(a => a === primaryAspect).length
        if (hasVillainy) {
          // Primary + Villainy - comes first
          return `${prefix}_01_${primaryAspect}_Villainy`
        } else if (hasHeroism) {
          // Primary + Heroism - comes second
          return `${prefix}_02_${primaryAspect}_Heroism`
        } else if (primaryCount === 2) {
          // Double primary (e.g., Vig Vig) - comes after Villainy and Heroism combos
          return `${prefix}_03_${primaryAspect}_${primaryAspect}`
        }
      } else {
        // Villainy + Heroism (no primary)
        return 'Y_Villainy_Heroism'
      }
    }
    
    // More than 2 aspects - use first primary aspect
    if (primaryAspect) {
      const primaryOrder = {
        'Vigilance': 'A',
        'Command': 'B',
        'Aggression': 'C',
        'Cunning': 'D'
      }
      const prefix = primaryOrder[primaryAspect] || 'Z'
      const sortedAspects = [...aspects].sort()
      return `${prefix}_${sortedAspects.join('_')}`
    }
    
    // No primary aspect found
    return 'Z_Neutral'
  }, [])

  // Get aspect combination grouping key and display name for deck sections
  const getAspectCombinationKey = useCallback((card) => {
    const aspects = card.aspects || []
    if (aspects.length === 0) return 'neutral'
    
    const hasVillainy = aspects.includes('Villainy')
    const hasHeroism = aspects.includes('Heroism')
    const primaryAspects = ['Vigilance', 'Command', 'Aggression', 'Cunning']
    const primaryAspect = aspects.find(a => primaryAspects.includes(a))
    
    // Single aspect
    if (aspects.length === 1) {
      const aspect = aspects[0]
      // Single primary aspect (includes double primary like Vig Vig)
      if (primaryAspects.includes(aspect)) {
        return aspect.toLowerCase() // e.g., "vigilance", "command"
      }
      if (aspect === 'Villainy') return 'villainy'
      if (aspect === 'Heroism') return 'heroism'
      return 'neutral'
    }
    
    // Two aspects
    if (aspects.length === 2) {
      if (primaryAspect) {
        // Check if it's double primary (e.g., Vigilance Vigilance)
        const primaryCount = aspects.filter(a => a === primaryAspect).length
        if (primaryCount === 2) {
          // Double primary - group with single primary
          return primaryAspect.toLowerCase()
        }
        if (hasVillainy) {
          return `${primaryAspect.toLowerCase()}_villainy` // e.g., "vigilance_villainy"
        }
        if (hasHeroism) {
          return `${primaryAspect.toLowerCase()}_heroism` // e.g., "vigilance_heroism"
        }
      } else {
        // Villainy + Heroism
        return 'villainy_heroism'
      }
    }
    
    // More than 2 aspects - use first primary aspect
    if (primaryAspect) {
      const sortedAspects = [...aspects].sort()
      return sortedAspects.join('_').toLowerCase()
    }
    
    return 'neutral'
  }, [])

  // Get display name for aspect combination
  const getAspectCombinationDisplayName = useCallback((key) => {
    const parts = key.split('_')
    if (parts.length === 1) {
      // Single aspect
      const aspect = parts[0]
      const displayNames = {
        'vigilance': 'Vigilance',
        'command': 'Command',
        'aggression': 'Aggression',
        'cunning': 'Cunning',
        'villainy': 'Villainy',
        'heroism': 'Heroism',
        'neutral': 'Neutral'
      }
      return displayNames[aspect] || aspect.charAt(0).toUpperCase() + aspect.slice(1)
    } else if (parts.length === 2) {
      // Two aspects
      const [first, second] = parts
      const displayNames = {
        'vigilance': 'Vigilance',
        'command': 'Command',
        'aggression': 'Aggression',
        'cunning': 'Cunning',
        'villainy': 'Villainy',
        'heroism': 'Heroism'
      }
      const firstDisplay = displayNames[first] || first.charAt(0).toUpperCase() + first.slice(1)
      const secondDisplay = displayNames[second] || second.charAt(0).toUpperCase() + second.slice(1)
      return `${firstDisplay} ${secondDisplay}`
    }
    // More than 2 aspects - capitalize each part
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
  }, [])

  // Get aspect icons for deck area headers (replaces text with icons)
  const getAspectCombinationIcons = useCallback((key) => {
    const parts = key.split('_')
    const aspectMap = {
      'vigilance': 'vigilance',
      'command': 'command',
      'aggression': 'aggression',
      'cunning': 'cunning',
      'villainy': 'villainy',
      'heroism': 'heroism'
    }
    
    if (parts.length === 1) {
      // Single aspect or neutral
      if (parts[0] === 'neutral') {
        return <span style={{ color: '#999' }}>Neutral</span>
      }
      const aspectName = aspectMap[parts[0]]
      if (!aspectName) return null
      return (
        <img 
          src={`/icons/${aspectName}.png`}
          alt={parts[0]}
          style={{ width: '24px', height: '24px' }}
        />
      )
    } else {
      // Multiple aspects - show all icons
      return (
        <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {parts.map((part, i) => {
            const aspectName = aspectMap[part]
            if (!aspectName) return null
            return (
              <img 
                key={i}
                src={`/icons/${aspectName}.png`}
                alt={part}
                style={{ width: '24px', height: '24px', display: 'block' }}
              />
            )
          }).filter(Boolean)}
        </span>
      )
    }
  }, [])

  // Get aspect combination key for sorting (legacy, used for 'aspect' sort option)
  const getAspectKey = useCallback((card) => {
    const aspects = card.aspects || []
    if (aspects.length === 0) return 'ZZZ_Neutral'
    
    // Single aspects - sort by priority (alphabetical of colors: Blue, Green, Red, Yellow)
    if (aspects.length === 1) {
      const aspect = aspects[0]
      const priority = {
        'Vigilance': 'A_Vigilance',      // Blue
        'Command': 'B_Command',          // Green
        'Aggression': 'C_Aggression',    // Red
        'Cunning': 'D_Cunning',          // Yellow
        'Villainy': 'E_Villainy',
        'Heroism': 'F_Heroism'
      }
      return priority[aspect] || `G_${aspect}`
    }
    
    // Two aspects - return sorted combination with prefix
    const sortedAspects = [...aspects].sort()
    return `H_${sortedAspects.join(' ')}`
  }, [])

  // Sort cards (only from deck section, excluding bases and leaders)
  // Note: No longer filtering - cards are moved between deck/sideboard via filter checkboxes
  const getFilteredAndSortedCards = useCallback(() => {
    const allCards = Object.values(cardPositions)
      .filter(pos => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
      .map(pos => pos.card)
    
    if (sortOption === 'aspect') {
      // Sort by aspect key directly
      return allCards.sort((a, b) => {
        const keyA = getAspectKey(a)
        const keyB = getAspectKey(b)
        return keyA.localeCompare(keyB)
      })
    } else if (sortOption === 'cost') {
      // Sort by cost (will be grouped by cost segments in rendering)
      return allCards.sort((a, b) => (a.cost || 0) - (b.cost || 0))
    }
    return allCards
  }, [cardPositions, sortOption, getAspectKey, getDefaultAspectSortKey])

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
          setSortOption(state.sortOption || 'aspect')
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

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedCard) {
        setSelectedCard(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedCard])

  // Handle Ctrl key press/release for hover modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl key (works on both Mac and Windows)
      if (e.ctrlKey || e.metaKey) {
        setCtrlPressed(true)
      }
    }
    const handleKeyUp = (e) => {
      // Check if Ctrl/Meta is released
      if (!e.ctrlKey && !e.metaKey) {
        setCtrlPressed(false)
        // Close modal when Ctrl is released
        if (selectedCard) {
          setSelectedCard(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [selectedCard])

  // Open modal when Ctrl is pressed while hovering over a card
  useEffect(() => {
    if (ctrlPressed && hoveredCard) {
      const position = cardPositions[hoveredCard]
      if (position && position.card) {
        setSelectedCard(position.card)
      }
    }
  }, [ctrlPressed, hoveredCard, cardPositions])

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
    if (sortOption === 'aspect') return // Aspect sorting is handled in rendering, not here
    
    setCardPositions(prev => {
      // Separate deck and sideboard cards
      const deckCards = Object.entries(prev)
        .filter(([_, pos]) => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
        .map(([id, pos]) => ({ id, ...pos }))
      
      const sideboardCards = Object.entries(prev)
        .filter(([_, pos]) => pos.section === 'sideboard' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
        .map(([id, pos]) => ({ id, ...pos }))
      
      // Get sorted deck cards (only deck section)
      // Note: No longer filtering - cards are moved between deck/sideboard via filter checkboxes
      const deckSorted = deckCards
        .map(({ card }) => card)
      const sortedDeckIds = deckSorted.map(card => {
        const entry = deckCards.find(({ card: c }) => c.id === card.id || c.name === card.name)
        return entry?.id
      }).filter(Boolean)
      
      // Get sorted sideboard cards
      // Note: No longer filtering - cards are moved between deck/sideboard via filter checkboxes
      const sideboardSorted = sideboardCards
        .map(({ card }) => card)
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
          // Sort by aspect key directly
          return [...cards].sort((a, b) => {
            const keyA = getAspectKey(a)
            const keyB = getAspectKey(b)
            return keyA.localeCompare(keyB)
          })
        } else if (sortOption === 'type') {
          // Handle both "Unit" and "Ground Unit"/"Space Unit" types
          const getTypeOrder = (type) => {
            if (type === 'Unit' || type === 'Ground Unit') return 1
            if (type === 'Space Unit') return 2
            if (type === 'Upgrade') return 3
            if (type === 'Event') return 4
            return 99
          }
          return [...cards].sort((a, b) => {
            const aOrder = getTypeOrder(a.type || '')
            const bOrder = getTypeOrder(b.type || '')
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
    
    // Handle click-toggle for deck/sideboard cards if no drag occurred
    if (draggedCard && !hasDraggedRef.current) {
      const card = cardPositions[draggedCard]
      if (card && (card.section === 'deck' || card.section === 'sideboard')) {
        // Simple click (no drag) - toggle between deck and sideboard
        setCardPositions(prev => ({
          ...prev,
          [draggedCard]: {
            ...prev[draggedCard],
            section: prev[draggedCard].section === 'deck' ? 'sideboard' : 'deck',
            enabled: prev[draggedCard].section === 'deck' ? false : true
          }
        }))
        setDraggedCard(null)
        setDragOffset({ x: 0, y: 0 })
        return
      }
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
  }, [isSelecting, draggedCard, sectionBounds, cardPositions])

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

  // Default sort function: aspect combinations, then type, then cost
  const defaultSort = (a, b) => {
    // First: sort by aspect combination
    const aspectKeyA = getDefaultAspectSortKey(a)
    const aspectKeyB = getDefaultAspectSortKey(b)
    const aspectCompare = aspectKeyA.localeCompare(aspectKeyB)
    if (aspectCompare !== 0) return aspectCompare
    
    // Second: sort by type (Unit, then Upgrade, then Event)
    // Handle both "Unit" and "Ground Unit"/"Space Unit" types
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
    
    // Third: sort by cost (low to high)
    const costA = a.cost !== null && a.cost !== undefined ? a.cost : 999
    const costB = b.cost !== null && b.cost !== undefined ? b.cost : 999
    if (costA !== costB) return costA - costB
    
    // Fourth: sort alphabetically (a before b down to z)
    const nameA = (a.name || '').toLowerCase()
    const nameB = (b.name || '').toLowerCase()
    return nameA.localeCompare(nameB)
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
                // Expand leaders section if collapsed
                const wasCollapsed = !leadersExpanded
                if (wasCollapsed) {
                  setLeadersExpanded(true)
                }
                const leadersSection = document.querySelector('.leaders-bases-subsection:first-child')
                if (leadersSection) {
                  const headerHeight = document.querySelector('.deck-info-bar')?.offsetHeight || 0
                  const topOffset = 20 // matches top: 20px from sticky header
                  const scrollOffset = headerHeight + topOffset + 10 // extra 10px for spacing
                  // Wait for expansion animation if it was collapsed
                  setTimeout(() => {
                    const elementPosition = leadersSection.getBoundingClientRect().top + window.pageYOffset
                    window.scrollTo({
                      top: elementPosition - scrollOffset,
                      behavior: 'smooth'
                    })
                  }, wasCollapsed ? 400 : 0)
                }
              }
            }}
          >
            {activeLeader && cardPositions[activeLeader] ? (
              <>
                <span 
                  className="selected-card-name"
                  style={{ color: getAspectColor(cardPositions[activeLeader].card) }}
                >
                  {cardPositions[activeLeader].card.name}
                </span>
                {cardPositions[activeLeader].card.subtitle && (
                  <span className="selected-card-subtitle">{cardPositions[activeLeader].card.subtitle}</span>
                )}
              </>
            ) : (
              <span className="selected-card-name">(Select a Leader)</span>
            )}
          </div>
          <span className="separator"></span>
          <div 
            className={`selected-card-container ${!activeBase ? 'select-card-placeholder' : ''}`}
            onClick={() => {
              if (!activeBase) {
                // Expand bases section if collapsed
                const wasCollapsed = !basesExpanded
                if (wasCollapsed) {
                  setBasesExpanded(true)
                }
                const basesSection = document.querySelector('.leaders-bases-subsection:last-child')
                if (basesSection) {
                  const headerHeight = document.querySelector('.deck-info-bar')?.offsetHeight || 0
                  const topOffset = 20 // matches top: 20px from sticky header
                  const scrollOffset = headerHeight + topOffset + 10 // extra 10px for spacing
                  // Wait for expansion animation if it was collapsed
                  setTimeout(() => {
                    const elementPosition = basesSection.getBoundingClientRect().top + window.pageYOffset
                    window.scrollTo({
                      top: elementPosition - scrollOffset,
                      behavior: 'smooth'
                    })
                  }, wasCollapsed ? 400 : 0)
                }
              }
            }}
          >
            {activeBase && cardPositions[activeBase] ? (
              <span 
                className="selected-card-name"
                style={{ color: getAspectColor(cardPositions[activeBase].card) }}
              >
                {cardPositions[activeBase].card.name}
              </span>
            ) : (
              <span className="selected-card-name">(Select a Base)</span>
            )}
          </div>
        </div>
        <div className="deck-counts-info">
            <span>Deck (<span style={{ 
              color: (() => {
                const deckCount = Object.values(cardPositions)
                  .filter(pos => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader).length
                if (deckCount < 30) return '#F1C40F' // Yellow
                if (deckCount === 30) return '#27AE60' // Green
                return '#E74C3C' // Red
              })()
            }}>{(() => {
              const deckCards = Object.values(cardPositions)
                .filter(pos => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader)
              return deckCards.length
            })()}</span>/30)</span>
            <span className="separator"></span>
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
                  onChange={(e) => {
                    const isChecked = e.target.checked
                    setAspectFilters(prev => ({ ...prev, [aspect]: isChecked }))
                    
                    // Move cards between deck and sideboard based on filter
                    setCardPositions(prev => {
                      const updated = { ...prev }
                      Object.entries(updated).forEach(([cardId, position]) => {
                        // Skip leaders and bases
                        if (position.card.isLeader || position.card.isBase) return
                        // Only process cards in deck or sideboard sections
                        if (position.section !== 'deck' && position.section !== 'sideboard') return
                        
                        const cardAspects = position.card.aspects || []
                        const matchesFilter = aspect === NO_ASPECT_LABEL
                          ? cardAspects.length === 0
                          : cardAspects.includes(aspect)
                        
                        if (matchesFilter) {
                          if (isChecked) {
                            // Move from sideboard to deck (enable)
                            if (position.section === 'sideboard' || !position.enabled) {
                              updated[cardId] = {
                                ...position,
                                section: 'deck',
                                enabled: true,
                                x: 0,
                                y: 0
                              }
                            }
                          } else {
                            // Move from deck to sideboard (disable)
                            if (position.section === 'deck' && position.enabled !== false) {
                              updated[cardId] = {
                                ...position,
                                section: 'sideboard',
                                enabled: false,
                                x: 0,
                                y: 0
                              }
                            }
                          }
                        }
                      })
                      return updated
                    })
                  }}
                />
                <span>{aspect}</span>
              </label>
            ))}
            <label key={NO_ASPECT_LABEL} className="filter-checkbox">
              <input
                type="checkbox"
                checked={aspectFilters[NO_ASPECT_LABEL]}
                onChange={(e) => {
                  const isChecked = e.target.checked
                  setAspectFilters(prev => ({ ...prev, [NO_ASPECT_LABEL]: isChecked }))
                  
                  // Move cards between deck and sideboard based on filter
                  setCardPositions(prev => {
                    const updated = { ...prev }
                    Object.entries(updated).forEach(([cardId, position]) => {
                      // Skip leaders and bases
                      if (position.card.isLeader || position.card.isBase) return
                      // Only process cards in deck or sideboard sections
                      if (position.section !== 'deck' && position.section !== 'sideboard') return
                      
                      const cardAspects = position.card.aspects || []
                      const matchesFilter = cardAspects.length === 0
                      
                      if (matchesFilter) {
                        if (isChecked) {
                          // Move from sideboard to deck (enable)
                          if (position.section === 'sideboard' || !position.enabled) {
                            updated[cardId] = {
                              ...position,
                              section: 'deck',
                              enabled: true,
                              x: 0,
                              y: 0
                            }
                          }
                        } else {
                          // Move from deck to sideboard (disable)
                          if (position.section === 'deck' && position.enabled !== false) {
                            updated[cardId] = {
                              ...position,
                              section: 'sideboard',
                              enabled: false,
                              x: 0,
                              y: 0
                            }
                          }
                        }
                      }
                    })
                    return updated
                  })
                }}
              />
              <span>{NO_ASPECT_LABEL}</span>
            </label>
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
                  {option === 'aspect' ? 'Aspect' : `Cost`}
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
          .sort((a, b) => {
            if (sortOption === 'cost') {
              return (a.position.card.cost || 0) - (b.position.card.cost || 0)
            } else if (sortOption === 'aspect') {
              const keyA = getAspectKey(a.position.card)
              const keyB = getAspectKey(b.position.card)
              return keyA.localeCompare(keyB)
            }
            // Default to aspect sorting
            const keyA = getAspectKey(a.position.card)
            const keyB = getAspectKey(b.position.card)
            return keyA.localeCompare(keyB)
          })
        const basesCards = leadersBasesCards
          .filter(({ position }) => position.card.isBase)
          .sort((a, b) => {
            if (sortOption === 'cost') {
              return (a.position.card.cost || 0) - (b.position.card.cost || 0)
            } else if (sortOption === 'aspect') {
              const keyA = getAspectKey(a.position.card)
              const keyB = getAspectKey(b.position.card)
              return keyA.localeCompare(keyB)
            }
            // Default to aspect sorting
            const keyA = getAspectKey(a.position.card)
            const keyB = getAspectKey(b.position.card)
            return keyA.localeCompare(keyB)
          })
        
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
                    Leaders ({leadersCards.length})
                  </h3>
                  {leadersExpanded && (
                    <div className="leaders-bases-container leaders-only">
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
              {basesCards.length > 0 && (() => {
                // Separate bases by rarity
                const rareBases = basesCards.filter(({ position }) => {
                  const rarity = position.card.rarity
                  return rarity === 'Rare' || rarity === 'Legendary' || rarity === 'Special'
                })
                const commonBases = basesCards.filter(({ position }) => {
                  const rarity = position.card.rarity
                  return rarity !== 'Rare' && rarity !== 'Legendary' && rarity !== 'Special'
                })
                
                return (
                  <div className="leaders-bases-subsection">
                    <h3 
                      className="subsection-header"
                      onClick={() => setBasesExpanded(!basesExpanded)}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <span style={{ marginRight: '0.5rem' }}>{basesExpanded ? '▼' : '▶'}</span>
                      Bases ({basesCards.length})
                    </h3>
                    {basesExpanded && (
                      <>
                        {/* Rare bases first */}
                        {rareBases.length > 0 && (
                          <div className="leaders-bases-container bases-only bases-rare">
                            {rareBases.map(({ cardId, position }) => {
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
                                    {card.isShowcase && <span className="badge showcase-badge">Showcase</span>}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        {/* Common bases below */}
                        {commonBases.length > 0 && (
                          <div className="leaders-bases-container bases-only bases-common">
                            {commonBases.map(({ cardId, position }) => {
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
                                    {card.isShowcase && <span className="badge showcase-badge">Showcase</span>}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })()}
            </div>
          )
        }
        return null
      })()}
      
      {/* Deck Section */}
      <div className="deck-section">
        <h3 className="subsection-header" style={{ userSelect: 'none' }}>
          Deck ({Object.values(cardPositions)
            .filter(pos => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader).length})
        </h3>
        {(() => {
          // Get all deck cards
          const deckCards = Object.entries(cardPositions)
            .filter(([_, position]) => position.section === 'deck' && position.visible && !position.card.isBase && !position.card.isLeader)
            .map(([cardId, position]) => ({ cardId, position }))
            // Note: No longer filtering - cards are moved between deck/sideboard via filter checkboxes
          
          if (sortOption === 'cost') {
            // Group by cost segments: 0, 1, 2, 3, 4, 5, 6, 7, 8+
            const costSegments = [0, 1, 2, 3, 4, 5, 6, 7, '8+']
            const groupedByCost = {}
            
            // Initialize all cost segments (even if empty)
            costSegments.forEach(segment => {
              groupedByCost[segment] = []
            })
            
            // Group cards by cost segment
            deckCards.forEach(({ cardId, position }) => {
              const cost = position.card.cost
              let segment
              if (cost === null || cost === undefined || cost === 0) {
                segment = 0
              } else if (cost >= 8) {
                segment = '8+'
              } else if (cost >= 1 && cost <= 7) {
                segment = cost
              } else {
                segment = 0 // Default to 0 for any other edge cases
              }
              if (!groupedByCost[segment]) {
                groupedByCost[segment] = []
              }
              groupedByCost[segment].push({ cardId, position })
            })
            
            // Render cost segments
            return costSegments.map((costSegment) => {
              const cards = groupedByCost[costSegment] || []
              const activeCards = cards.filter(({ position }) => position.enabled !== false)
              
              // For 0 and 8+ only, don't show if there are no cards
              if ((costSegment === 0 || costSegment === '8+') && cards.length === 0) {
                return null
              }
              
              const isExpanded = deckCostSectionsExpanded[costSegment] !== false // Default to expanded
              
              // Sort cards within this cost segment using default sort (ASPECT then TYPE then COST)
              const sortedCards = [...activeCards].sort((a, b) => {
                return defaultSort(a.position.card, b.position.card)
              })
              
              return (
                <div key={`cost-${costSegment}`} className="deck-aspect-subsection">
                  <h4 
                    className="subsection-header"
                    onClick={() => setDeckCostSectionsExpanded(prev => ({ ...prev, [costSegment]: !isExpanded }))}
                    style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <span style={{ marginRight: '0.5rem' }}>{isExpanded ? '▼' : '▶'}</span>
                    <div style={{ position: 'relative', display: 'inline-block', width: '32px', height: '32px' }}>
                      <img 
                        src="/icons/cost.png" 
                        alt="cost" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                      }}>
                        {costSegment}
                      </span>
                    </div>
                    <span>({sortedCards.length})</span>
                  </h4>
                  <div className={`leaders-bases-container-wrapper ${isExpanded ? '' : 'collapsed'}`}>
                    <div className="cards-grid">
                      {sortedCards.map(({ cardId, position }) => {
                        const card = position.card
                        const isSelected = selectedCards.has(cardId)
                        const isHovered = hoveredCard === cardId
                        const isDisabled = !position.enabled
                        
                        return (
                          <div
                            key={cardId}
                            className={`canvas-card ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isDisabled ? 'disabled' : ''}`}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                                setCardPositions(prev => {
                                  const newSection = prev[cardId].section === 'deck' ? 'sideboard' : 'deck'
                                  const newEnabled = newSection === 'deck'
                                  return {
                                    ...prev,
                                    [cardId]: {
                                      ...prev[cardId],
                                      section: newSection,
                                      enabled: newEnabled,
                                      x: 0,
                                      y: 0,
                                    }
                                  }
                                })
                              }
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
                              {card.isShowcase && <span className="badge showcase-badge">Showcase</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })
          } else {
            // Group by aspect combination (original behavior)
            const groupedByAspect = {}
            deckCards.forEach(({ cardId, position }) => {
              const aspectKey = getAspectCombinationKey(position.card)
              if (!groupedByAspect[aspectKey]) {
                groupedByAspect[aspectKey] = []
              }
              groupedByAspect[aspectKey].push({ cardId, position })
            })
            
            // Sort aspect combinations for display order
            const aspectOrder = ['vigilance_villainy', 'vigilance_heroism', 'vigilance', 'command_villainy', 'command_heroism', 'command', 'aggression_villainy', 'aggression_heroism', 'aggression', 'cunning_villainy', 'cunning_heroism', 'cunning', 'villainy', 'heroism', 'villainy_heroism', 'neutral']
            const sortedAspectKeys = Object.keys(groupedByAspect).sort((a, b) => {
              const indexA = aspectOrder.indexOf(a)
              const indexB = aspectOrder.indexOf(b)
              if (indexA === -1 && indexB === -1) return a.localeCompare(b)
              if (indexA === -1) return 1
              if (indexB === -1) return -1
              return indexA - indexB
            })
            
            return sortedAspectKeys.map((aspectKey) => {
              const cards = groupedByAspect[aspectKey]
              const activeCards = cards.filter(({ position }) => position.enabled !== false)
              
              if (activeCards.length === 0 && cards.length === 0) {
                return null
              }
              
              const isExpanded = deckAspectSectionsExpanded[aspectKey] !== false
              const displayName = getAspectCombinationDisplayName(aspectKey)
              
              // Sort cards within this aspect combination using default sort (ASPECT then TYPE then COST)
              const sortedCards = [...activeCards].sort((a, b) => {
                return defaultSort(a.position.card, b.position.card)
              })
              
              return (
                <div key={aspectKey} className="deck-aspect-subsection">
                  <h4 
                    className="subsection-header"
                    onClick={() => setDeckAspectSectionsExpanded(prev => ({ ...prev, [aspectKey]: !isExpanded }))}
                    style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <span>{isExpanded ? '▼' : '▶'}</span>
                    {getAspectCombinationIcons(aspectKey)}
                    <span>({sortedCards.length})</span>
                  </h4>
                  <div className={`leaders-bases-container-wrapper ${isExpanded ? '' : 'collapsed'}`}>
                    <div className="cards-grid">
                      {sortedCards.map(({ cardId, position }) => {
                        const card = position.card
                        const isSelected = selectedCards.has(cardId)
                        const isHovered = hoveredCard === cardId
                        const isDisabled = !position.enabled
                        
                        return (
                          <div
                            key={cardId}
                            className={`canvas-card ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isDisabled ? 'disabled' : ''}`}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                                setCardPositions(prev => {
                                  const newSection = prev[cardId].section === 'deck' ? 'sideboard' : 'deck'
                                  const newEnabled = newSection === 'deck'
                                  return {
                                    ...prev,
                                    [cardId]: {
                                      ...prev[cardId],
                                      section: newSection,
                                      enabled: newEnabled,
                                      x: 0,
                                      y: 0,
                                    }
                                  }
                                })
                              }
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
                              {card.isShowcase && <span className="badge showcase-badge">Showcase</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })
          }
        })()}
      </div>

      {/* Sideboard Section */}
      <div className="sideboard-section">
        <h3 className="subsection-header" style={{ userSelect: 'none' }}>
          Sideboard ({Object.entries(cardPositions)
            .filter(([_, position]) => position.section === 'sideboard' && position.visible && !position.card.isBase && !position.card.isLeader)
            .filter(([_, position]) => cardMatchesFilters(position.card))
            .length})
        </h3>
        <div className="cards-grid">
          {Object.entries(cardPositions)
            .filter(([_, position]) => position.section === 'sideboard' && position.visible && !position.card.isBase && !position.card.isLeader)
            .map(([cardId, position]) => ({ cardId, position }))
            .filter(({ position }) => cardMatchesFilters(position.card))
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
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                      setCardPositions(prev => {
                        const newSection = prev[cardId].section === 'deck' ? 'sideboard' : 'deck'
                        const newEnabled = newSection === 'deck'
                        return {
                          ...prev,
                          [cardId]: {
                            ...prev[cardId],
                            section: newSection,
                            enabled: newEnabled,
                            x: 0,
                            y: 0,
                          }
                        }
                      })
                    }
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
                    {card.isShowcase && <span className="badge showcase-badge">Showcase</span>}
                  </div>
                </div>
              )
            })}
        </div>
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
                            const symbol = getAspectSymbol(aspect, 'large')
                            return symbol ? <span key={i} className="aspect-symbol-wrapper">{symbol}</span> : null
                          }).filter(Boolean)
                        : null
                      const isSelected = activeLeader === cardId
                      return (
                        <tr 
                          key={`leader-${cardId}-${idx}`}
                          onMouseEnter={() => setHoveredCard(cardId)}
                          onMouseLeave={() => setHoveredCard(null)}
                        >
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
                              <div 
                                className="card-name-main" 
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedCard(card)}
                              >
                                {card.name || 'Unknown'}
                              </div>
                              {card.subtitle && !card.isBase && (
                                <div className="card-name-subtitle">{card.subtitle}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            {card.cost !== null && card.cost !== undefined ? (
                              <div style={{ position: 'relative', display: 'inline-block', width: '48px', height: '48px' }}>
                                <img 
                                  src="/icons/cost.png" 
                                  alt="cost" 
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                                <span style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '28px',
                                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                }}>
                                  {card.cost}
                                </span>
                              </div>
                            ) : '-'}
                          </td>
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
                            const symbol = getAspectSymbol(aspect, 'large')
                            return symbol ? <span key={i} className="aspect-symbol-wrapper">{symbol}</span> : null
                          }).filter(Boolean)
                        : null
                      const isSelected = activeBase === cardId
                      return (
                        <tr 
                          key={`base-${cardId}-${idx}`}
                          onMouseEnter={() => setHoveredCard(cardId)}
                          onMouseLeave={() => setHoveredCard(null)}
                        >
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
                              <div 
                                className="card-name-main" 
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedCard(card)}
                              >
                                {card.name || 'Unknown'}
                              </div>
                              {card.subtitle && !card.isBase && (
                                <div className="card-name-subtitle">{card.subtitle}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            {card.cost !== null && card.cost !== undefined ? (
                              <div style={{ position: 'relative', display: 'inline-block', width: '48px', height: '48px' }}>
                                <img 
                                  src="/icons/cost.png" 
                                  alt="cost" 
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                                <span style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '28px',
                                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                }}>
                                  {card.cost}
                                </span>
                              </div>
                            ) : '-'}
                          </td>
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
                    <h3 className="pool-subsection-title" style={{ userSelect: 'none' }}>
                      Deck ({deckCardPositions.length})
                    </h3>
                    {(() => {
                      // Group cards by aspect combination
                      const groupedByAspect = {}
                      deckCardPositions.forEach(({ cardId, card }) => {
                        const aspectKey = getAspectCombinationKey(card)
                        if (!groupedByAspect[aspectKey]) {
                          groupedByAspect[aspectKey] = []
                        }
                        groupedByAspect[aspectKey].push({ cardId, card })
                      })
                      
                      // Sort aspect combinations for display order
                      const aspectOrder = ['vigilance_villainy', 'vigilance_heroism', 'vigilance', 'command_villainy', 'command_heroism', 'command', 'aggression_villainy', 'aggression_heroism', 'aggression', 'cunning_villainy', 'cunning_heroism', 'cunning', 'villainy', 'heroism', 'villainy_heroism', 'neutral']
                      const sortedAspectKeys = Object.keys(groupedByAspect).sort((a, b) => {
                        const indexA = aspectOrder.indexOf(a)
                        const indexB = aspectOrder.indexOf(b)
                        if (indexA === -1 && indexB === -1) return a.localeCompare(b)
                        if (indexA === -1) return 1
                        if (indexB === -1) return -1
                        return indexA - indexB
                      })
                      
                      return sortedAspectKeys.map((aspectKey) => {
                        const cards = groupedByAspect[aspectKey]
                        const isExpanded = deckAspectSectionsExpanded[aspectKey] !== false // Default to expanded
                        const displayName = getAspectCombinationDisplayName(aspectKey)
                        
                        // Sort cards within this aspect combination
                        // Create a copy to avoid mutating the original array
                        const sortedCards = [...cards].sort((a, b) => {
                          if (tableSort.field) {
                            return sortTableData(a.card, b.card, tableSort.field, tableSort.direction)
                          }
                          return defaultSort(a.card, b.card)
                        })
                        
                        return (
                          <div key={aspectKey} className="deck-aspect-subsection">
                            <h4 
                              className="pool-subsection-title"
                              onClick={() => setDeckAspectSectionsExpanded(prev => ({ ...prev, [aspectKey]: !isExpanded }))}
                              style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                              <span>{isExpanded ? '▼' : '▶'}</span>
                              {getAspectCombinationIcons(aspectKey)}
                              <span style={{ textTransform: 'uppercase' }}>{getAspectCombinationDisplayName(aspectKey)}</span>
                              <span>({cards.length})</span>
                            </h4>
                            <div className={`list-section-content-wrapper ${isExpanded ? '' : 'collapsed'}`}>
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
                          {sortedCards.map(({ cardId, card }, idx) => {
                            const aspectSymbols = card.aspects && card.aspects.length > 0 
                              ? card.aspects.map((aspect, i) => {
                                  const symbol = getAspectSymbol(aspect, 'large')
                                  return symbol ? <span key={i} className="aspect-symbol-wrapper">{symbol}</span> : null
                                }).filter(Boolean)
                              : null
                            return (
                              <tr 
                                key={`deck-${aspectKey}-${cardId}-${idx}`}
                                onMouseEnter={() => setHoveredCard(cardId)}
                                onMouseLeave={() => setHoveredCard(null)}
                              >
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
                                    <div 
                                      className="card-name-main" 
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => setSelectedCard(card)}
                                    >
                                      {card.name || 'Unknown'}
                                    </div>
                                    {card.subtitle && !card.isBase && (
                                      <div className="card-name-subtitle">{card.subtitle}</div>
                                    )}
                                  </div>
                                </td>
                                <td>
                            {card.cost !== null && card.cost !== undefined ? (
                              <div style={{ position: 'relative', display: 'inline-block', width: '48px', height: '48px' }}>
                                <img 
                                  src="/icons/cost.png" 
                                  alt="cost" 
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                                <span style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '28px',
                                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                }}>
                                  {card.cost}
                                </span>
                              </div>
                            ) : '-'}
                          </td>
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
                          </div>
                        )
                      })
                    })()}
                  </div>
                )}
                
                {/* Sideboard Section */}
                {sideboardCardPositions.length > 0 && (
                  <div className="pool-subsection">
                    <h3 className="pool-subsection-title" style={{ userSelect: 'none' }}>
                      Sideboard ({sideboardCardPositions.length})
                    </h3>
                    {(() => {
                      // Group cards by aspect combination
                      const groupedByAspect = {}
                      sideboardCardPositions.forEach(({ cardId, card }) => {
                        const aspectKey = getAspectCombinationKey(card)
                        if (!groupedByAspect[aspectKey]) {
                          groupedByAspect[aspectKey] = []
                        }
                        groupedByAspect[aspectKey].push({ cardId, card })
                      })
                      
                      // Sort aspect combinations for display order
                      const aspectOrder = ['vigilance_villainy', 'vigilance_heroism', 'vigilance', 'command_villainy', 'command_heroism', 'command', 'aggression_villainy', 'aggression_heroism', 'aggression', 'cunning_villainy', 'cunning_heroism', 'cunning', 'villainy', 'heroism', 'villainy_heroism', 'neutral']
                      const sortedAspectKeys = Object.keys(groupedByAspect).sort((a, b) => {
                        const indexA = aspectOrder.indexOf(a)
                        const indexB = aspectOrder.indexOf(b)
                        if (indexA === -1 && indexB === -1) return a.localeCompare(b)
                        if (indexA === -1) return 1
                        if (indexB === -1) return -1
                        return indexA - indexB
                      })
                      
                      return sortedAspectKeys.map((aspectKey) => {
                        const cards = groupedByAspect[aspectKey]
                        const isExpanded = sideboardAspectSectionsExpanded[aspectKey] !== false // Default to expanded
                        const displayName = getAspectCombinationDisplayName(aspectKey)
                        
                        // Sort cards within this aspect combination
                        // Create a copy to avoid mutating the original array
                        const sortedCards = [...cards].sort((a, b) => {
                          if (tableSort.field) {
                            return sortTableData(a.card, b.card, tableSort.field, tableSort.direction)
                          }
                          return defaultSort(a.card, b.card)
                        })
                        
                        return (
                          <div key={aspectKey} className="deck-aspect-subsection">
                            <h4 
                              className="pool-subsection-title"
                              onClick={() => setSideboardAspectSectionsExpanded(prev => ({ ...prev, [aspectKey]: !isExpanded }))}
                              style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                              <span style={{ marginRight: '0.5rem' }}>{isExpanded ? '▼' : '▶'}</span>
                              {displayName} ({cards.length})
                            </h4>
                            <div className={`list-section-content-wrapper ${isExpanded ? '' : 'collapsed'}`}>
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
                                  {sortedCards.map(({ cardId, card }, idx) => {
                                    const aspectSymbols = card.aspects && card.aspects.length > 0 
                                      ? card.aspects.map((aspect, i) => {
                                          const symbol = getAspectSymbol(aspect, 'large')
                                          return symbol ? <span key={i} className="aspect-symbol-wrapper">{symbol}</span> : null
                                        }).filter(Boolean)
                                      : null
                                    return (
                                      <tr 
                                        key={`sideboard-${aspectKey}-${cardId}-${idx}`}
                                        onMouseEnter={() => setHoveredCard(cardId)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                      >
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
                                            <div 
                                              className="card-name-main" 
                                              style={{ cursor: 'pointer' }}
                                              onClick={() => setSelectedCard(card)}
                                            >
                                              {card.name || 'Unknown'}
                                            </div>
                                            {card.subtitle && !card.isBase && (
                                              <div className="card-name-subtitle">{card.subtitle}</div>
                                            )}
                                          </div>
                                        </td>
                                        <td>
                                          {card.cost !== null && card.cost !== undefined ? (
                                            <div style={{ position: 'relative', display: 'inline-block', width: '48px', height: '48px' }}>
                                              <img 
                                                src="/icons/cost.png" 
                                                alt="cost" 
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                              />
                                              <span style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '28px',
                                                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                              }}>
                                                {card.cost}
                                              </span>
                                            </div>
                                          ) : '-'}
                                        </td>
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
                          </div>
                        )
                      })
                    })()}
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  )
}

export default DeckBuilder
