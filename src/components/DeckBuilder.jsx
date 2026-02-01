import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import './DeckBuilder.css'
import './AspectIcons.css'
import { getCachedCards, isCacheInitialized, initializeCardCache } from '../utils/cardCache'
import { buildBaseCardMap as buildBaseCardMapUtil, getBaseCardId as getBaseCardIdUtil } from '../utils/variantDowngrade'
import { fetchSetCards } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { jsonParse } from '../utils/json'
import {
  calculateAspectPenalty,
  getLeaderAbilityDescription as getLeaderAspectAbilityDescription,
} from '../services/cards/aspectPenalties'
import {
  getAspectSortKey,
  compareByAspectTypeCostName,
} from '../services/cards/cardSorting'
import CostIcon from './CostIcon'
import Modal from './Modal'
import Button from './Button'
import { updatePool, deletePool } from '../utils/poolApi'
import { getPackArtUrl } from '../utils/packArt'
import Card from './Card'
import { CardPreview } from './DeckBuilder/CardPreview'
import { LeaderBaseSelector } from './DeckBuilder/LeaderBaseSelector'
import { SectionHeader } from './DeckBuilder/SectionHeader'
import { DeckBuilderHeader } from './DeckBuilder/DeckBuilderHeader'
import { StickyInfoBar } from './DeckBuilder/StickyInfoBar'
import { TypeIcon } from './DeckBuilder/TypeIcon'
import { GroupHeader } from './DeckBuilder/GroupHeader'
import { ListTableHeader } from './DeckBuilder/ListTableHeader'
import { getCardTypeOrder, getTypeStringOrder, sortGroupKeys, createGetGroupKey, createDefaultSortFn, createGroupCardSortFn } from '../utils/cardSort'
import { getRarityColor } from '../utils/aspectColors'

// Get aspect symbol for list view using individual icon files
import AspectIcon from './AspectIcon'

// Legacy wrapper for existing code - maps old size names to new component sizes
const getAspectSymbol = (aspect, size = 'medium') => {
  const sizeMap = {
    'small': 'sm',
    'medium': 'md',
    'large': 'xl'
  }
  return <AspectIcon aspect={aspect} size={sizeMap[size] || 'md'} />
}

// Build aspect icons for table cells
const getAspectIcons = (card) => {
  if (!card.aspects || card.aspects.length === 0) return null
  return card.aspects.map((aspect, i) => {
    const symbol = getAspectSymbol(aspect, 'large')
    return symbol ? <span key={i} className="aspect-symbol-wrapper">{symbol}</span> : null
  }).filter(Boolean)
}

const ASPECTS = ['Vigilance', 'Command', 'Aggression', 'Cunning', 'Villainy', 'Heroism']
const NO_ASPECT_LABEL = 'Neutral'
const SORT_OPTIONS = ['aspect', 'cost']

function DeckBuilder({ cards, setCode, onBack, savedState, onStateChange, shareId = null, poolCreatedAt = null, poolType = 'sealed', poolName: initialPoolName = null, poolOwnerUsername = null, poolOwnerId = null }) {
  const { user, isAuthenticated, signIn } = useAuth()
  const isOwner = user && poolOwnerId && user.id === poolOwnerId
  const isDraftMode = poolType === 'draft'

  // Get pool name from saved state if available, otherwise use initial prop
  const getInitialPoolName = () => {
    if (savedState) {
      const state = jsonParse(savedState)
      if (state?.poolName) return state.poolName
    }
    return initialPoolName
  }
  const [currentPoolName, setCurrentPoolName] = useState(getInitialPoolName)

  // Sync pool name from savedState when it changes (e.g., after pool data reloads)
  // This ensures we pick up changes made elsewhere (like the play page)
  useEffect(() => {
    if (savedState) {
      const state = jsonParse(savedState)
      if (state?.poolName && state.poolName !== currentPoolName) {
        setCurrentPoolName(state.poolName)
      }
    } else if (!currentPoolName && initialPoolName) {
      setCurrentPoolName(initialPoolName)
    }
  }, [savedState, initialPoolName])

  const handleRenamePool = (newName) => {
    if (!shareId) return
    setCurrentPoolName(newName)
    // Save is triggered automatically via useEffect when currentPoolName changes
  }
  // Helper function to format card type for display
  const getFormattedType = useCallback((card) => {
    if (card.type === 'Unit') {
      if (card.arenas && card.arenas.includes('Ground')) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
            <div>Unit</div>
            <div style={{ fontSize: '0.7em', color: 'rgba(255, 255, 255, 0.6)', marginTop: '-2px' }}>Ground</div>
          </div>
        )
      } else if (card.arenas && card.arenas.includes('Space')) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
            <div>Unit</div>
            <div style={{ fontSize: '0.7em', color: 'rgba(255, 255, 255, 0.6)', marginTop: '-2px' }}>Space</div>
          </div>
        )
      }
      return 'Unit'
    }
    return card.type || 'Unknown'
  }, [])

  const [cardPositions, setCardPositions] = useState({})
  const [draggedCard, setDraggedCard] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [canvasHeight, setCanvasHeight] = useState(null)
  const [allSetCards, setAllSetCards] = useState([])
  const [sectionLabels, setSectionLabels] = useState([])
  const [sectionBounds, setSectionBounds] = useState({})
  const [hoveredCard, setHoveredCard] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [aspectFilters, setAspectFilters] = useState({
    Vigilance: poolType !== 'draft',
    Command: poolType !== 'draft',
    Aggression: poolType !== 'draft',
    Cunning: poolType !== 'draft',
    Villainy: poolType !== 'draft',
    Heroism: poolType !== 'draft',
    [NO_ASPECT_LABEL]: poolType !== 'draft'
  })
  const [inAspectFilter, setInAspectFilter] = useState(poolType !== 'draft')
  const [outAspectFilter, setOutAspectFilter] = useState(poolType !== 'draft')
  const [poolSortOption, setPoolSortOption] = useState('aspect') // Controls Pool grouping
  const [deckSortOption, setDeckSortOption] = useState('cost') // Controls Deck sorting and grouping (default = flat container, others = grouped blocks)
  const [deckGroupsExpanded, setDeckGroupsExpanded] = useState({}) // Track expanded state of deck group blocks
  const [deckFilterOpen, setDeckFilterOpen] = useState(false) // Filter modal for Deck section
  const [poolFilterOpen, setPoolFilterOpen] = useState(false) // Filter modal for Pool section
  const [filterAspectsExpanded, setFilterAspectsExpanded] = useState({}) // Track which aspect groups are expanded in filter modal
  const [tableSort, setTableSort] = useState({}) // Per-section sorting: { sectionId: { field, direction } }
  const [leadersBasesExpanded, setLeadersBasesExpanded] = useState(true) // Parent toggle for entire Leaders & Bases section
  const [leadersExpanded, setLeadersExpanded] = useState(true)
  const [basesExpanded, setBasesExpanded] = useState(true)
  const [deckExpanded, setDeckExpanded] = useState(true)
  const [sideboardExpanded, setSideboardExpanded] = useState(true)
  const [poolGroupsExpanded, setPoolGroupsExpanded] = useState({}) // Track expanded state for each pool group block
  const [poolFirstOrder, setPoolFirstOrder] = useState(null) // null = not determined yet, true = pool first, false = deck first
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
  const deckBlocksRowRef = useRef(null)
  const [activeLeader, setActiveLeader] = useState(null)
  const [activeBase, setActiveBase] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [messageType, setMessageType] = useState(null) // 'error' or 'success'
  const [isInfoBarSticky, setIsInfoBarSticky] = useState(false)
  const [showAspectPenalties, setShowAspectPenalties] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const getAspectColorName = (card) => {
    const aspectColorMap = {
      'Vigilance': 'blue',
      'Command': 'green',
      'Aggression': 'red',
      'Cunning': 'yellow',
      'Villainy': 'purple',
      'Heroism': 'orange',
    }
    return aspectColorMap[card.aspects?.[0]] || 'gray'
  }

  // Function to update pool name when leader or base changes
  const updatePoolName = useCallback(async (leaderCard, baseCard) => {
    if (!shareId || !setCode) return

    try {
      const formatType = poolType === 'draft' ? 'Draft' : 'Sealed'

      const leaderName = leaderCard?.name || ''

      // For base: if common, use aspect color name; if rare, use base name
      let baseName = ''
      if (baseCard) {
        if (baseCard.rarity === 'Common') {
          // Get the first aspect and convert to color name
          const aspects = baseCard.aspects || []
          if (aspects.length > 0) {
            baseName = getAspectColorName(aspects[0])
          } else {
            baseName = baseCard.name || ''
          }
        } else {
          // Rare or other rarities: use the base name
          baseName = baseCard.name || ''
        }
      }

      // Format: {Leader Name} {Base Name} ({Set Abbrv} {Format})
      const leaderBaseParts = []
      if (leaderName) leaderBaseParts.push(leaderName)
      if (baseName) leaderBaseParts.push(baseName)

      let name
      if (leaderBaseParts.length > 0) {
        name = leaderBaseParts.join(' ') + ` (${setCode} ${formatType})`
      } else {
        name = `${setCode} ${formatType}`
      }

      await updatePool(shareId, { name })
    } catch (err) {
      console.error('Failed to update pool name:', err)
      // Don't show error to user - this is a background operation
    }
  }, [shareId, poolType, setCode])

  // Update pool name when leader or base changes
  useEffect(() => {
    if (!shareId || !poolCreatedAt) return

    const leaderCard = activeLeader && cardPositions[activeLeader] ? cardPositions[activeLeader].card : null
    const baseCard = activeBase && cardPositions[activeBase] ? cardPositions[activeBase].card : null

    // Only update if at least one is selected
    if (leaderCard || baseCard) {
      updatePoolName(leaderCard, baseCard)
    }
  }, [activeLeader, activeBase, cardPositions, shareId, poolCreatedAt, updatePoolName])
  const [deckImageModal, setDeckImageModal] = useState(null) // URL for deck image modal
  const [hoveredCardPreview, setHoveredCardPreview] = useState(null) // { card, x, y } for enlarged preview
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 })
  const tooltipTimeoutRef = useRef(null)
  const longPressTimeoutRef = useRef(null)
  const modalHoverTimeoutRef = useRef(null)
  const previewTimeoutRef = useRef(null)
  const previewHideTimeoutRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const infoBarRef = useRef(null)

  // Clear preview on visibility change (tab switch) or scroll
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setHoveredCardPreview(null)
        if (previewTimeoutRef.current) {
          clearTimeout(previewTimeoutRef.current)
          previewTimeoutRef.current = null
        }
      }
    }

    const handleScroll = () => {
      setHoveredCardPreview(null)
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current)
        previewTimeoutRef.current = null
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [])

  // Tooltip handlers
  const showTooltip = (text, event) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
    }
    tooltipTimeoutRef.current = setTimeout(() => {
      const rect = event.currentTarget.getBoundingClientRect()
      setTooltip({
        show: true,
        text,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        alignLeft: false
      })
    }, 1000)
  }

  // Tooltip for right nav buttons (no delay)
  const showNavTooltip = (text, event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({
      show: true,
      text,
      x: rect.left,
      y: rect.top + rect.height / 2,
      alignLeft: true
    })
  }

  const hideTooltip = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
      tooltipTimeoutRef.current = null
    }
    setTooltip({ show: false, text: '', x: 0, y: 0, alignLeft: false })
  }

  // Mobile long press handler
  const handleLongPress = (text, event, onClick) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (!isMobile) return

    longPressTimeoutRef.current = setTimeout(() => {
      const rect = event.currentTarget.getBoundingClientRect()
      setTooltip({
        show: true,
        text,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        alignLeft: false
      })
    }, 1000)
  }

  const cancelLongPress = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current)
      longPressTimeoutRef.current = null
    }
  }

  // Enlarged preview hover handlers
  const handleCardMouseEnter = (card, event) => {
    if (!event) return

    // DISABLE enlarged preview on mobile/touch devices
    if (window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return
    }

    // Clear any existing show timeout
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current)
    }
    // Cancel any pending hide timeout
    if (previewHideTimeoutRef.current) {
      clearTimeout(previewHideTimeoutRef.current)
      previewHideTimeoutRef.current = null
    }

    // Capture the rect immediately (before timeout)
    const rect = event.currentTarget.getBoundingClientRect()

    // Set timeout to show preview after hovering
    previewTimeoutRef.current = setTimeout(() => {
      // Position the preview near the card (to the right, or left if too close to right edge)
      let previewX = rect.right + 20
      const previewY = rect.top

      // Calculate preview dimensions based on card type
      // Leaders and bases are landscape: 168px x 120px, so 3x = 504px x 360px
      // Regular cards are portrait: 120px x 168px, so 3x = 360px x 504px
      // Leaders with back: front horizontal (504x360) + back vertical (360x504) side by side
      const isHorizontal = card.isLeader || card.isBase
      const hasBackImage = card.backImageUrl && card.isLeader
      let previewWidth, previewHeight
      if (hasBackImage) {
        // Leader with back: side by side (horizontal front + vertical back)
        previewWidth = 504 + 360 + 20 // 504px front + 360px back + 20px gap
        previewHeight = 504 // Max height (vertical back is 504px)
      } else {
        previewWidth = isHorizontal ? 504 : 360
        previewHeight = isHorizontal ? 360 : 504
      }

      // Ensure preview stays within viewport bounds
      // Check right edge
      if (previewX + previewWidth > window.innerWidth) {
        // Try positioning to the left of the card
        previewX = rect.left - previewWidth - 20
        // If still off screen to the left, clamp to left edge
        if (previewX < 0) {
          previewX = 10 // Small margin from left edge
        }
      }

      // Check left edge
      if (previewX < 0) {
        previewX = 10 // Small margin from left edge
      }

      // Adjust vertical position to keep preview within viewport
      // previewY is the center point (due to translateY(-50%))
      const previewTop = previewY - previewHeight / 2
      const previewBottom = previewY + previewHeight / 2
      let adjustedY = previewY

      // Check top edge
      if (previewTop < 0) {
        adjustedY = previewHeight / 2 + 10 // Position so top is 10px from top
      }

      // Check bottom edge
      if (previewBottom > window.innerHeight) {
        adjustedY = window.innerHeight - previewHeight / 2 - 10 // Position so bottom is 10px from bottom
      }

      setHoveredCardPreview({ card, x: previewX, y: adjustedY })
    }, 400)
  }

  const handleCardMouseLeave = () => {
    // Clear the show timeout if it exists (preview hasn't shown yet)
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current)
      previewTimeoutRef.current = null
    }

    // Hide the preview immediately
    setHoveredCardPreview(null)
  }

  const handlePreviewMouseEnter = () => {
    // Cancel the hide timeout when entering the preview
    if (previewHideTimeoutRef.current) {
      clearTimeout(previewHideTimeoutRef.current)
      previewHideTimeoutRef.current = null
    }
  }

  const handlePreviewMouseLeave = () => {
    // Clear immediately when leaving the preview
    if (previewHideTimeoutRef.current) {
      clearTimeout(previewHideTimeoutRef.current)
      previewHideTimeoutRef.current = null
    }
    setHoveredCardPreview(null)
  }

  // Toggle a card between deck and sideboard sections
  const toggleCardSection = useCallback((cardId) => {
    setHoveredCard(null)
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
  }, [])

  // Cleanup tooltip timeouts
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current)
      }
      if (modalHoverTimeoutRef.current) {
        clearTimeout(modalHoverTimeoutRef.current)
      }
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current)
      }
      if (previewHideTimeoutRef.current) {
        clearTimeout(previewHideTimeoutRef.current)
      }
    }
  }, [])

  // Load all cards from the set - optimize for speed
  useEffect(() => {
    const loadSetCards = async () => {
      try {
        // Initialize cache first if not already initialized (should be instant from JSON)
        if (!isCacheInitialized()) {
          await initializeCardCache()
        }

        // Get cards from cache (instant)
        let cardsData = getCachedCards(setCode)

        // If cache doesn't have cards, try API as fallback
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
      if (!(aspectFilters[NO_ASPECT_LABEL] || false)) return false
    } else {
      // Card must have at least one aspect that's checked
      if (!cardAspects.some(aspect => aspectFilters[aspect])) return false
    }

    // Check in/out aspect filters (only when both leader and base are selected)
    const leaderCard = activeLeader && cardPositions[activeLeader] ? cardPositions[activeLeader].card : null
    const baseCard = activeBase && cardPositions[activeBase] ? cardPositions[activeBase].card : null

    if (leaderCard && baseCard) {
      const penalty = calculateAspectPenalty(card, leaderCard, baseCard)
      const isInAspect = penalty === 0
      const isOutOfAspect = penalty > 0

      // If neither filter is checked, nothing passes
      if (!inAspectFilter && !outAspectFilter) return false
      // If only in-aspect is checked, out-of-aspect cards fail
      if (inAspectFilter && !outAspectFilter && isOutOfAspect) return false
      // If only out-of-aspect is checked, in-aspect cards fail
      if (!inAspectFilter && outAspectFilter && isInAspect) return false
    }

    return true
  }, [aspectFilters, activeLeader, activeBase, cardPositions, inAspectFilter, outAspectFilter])

  // Use imported getAspectSortKey from cardSorting service
  const getDefaultAspectSortKey = useCallback(getAspectSortKey, [])

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
          // Double primary - separate key (e.g., "command_command")
          return `${primaryAspect.toLowerCase()}_${primaryAspect.toLowerCase()}`
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
          style={{ width: '1em', height: '1em', verticalAlign: 'middle' }}
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
                style={{ width: '1em', height: '1em', display: 'block', verticalAlign: 'middle' }}
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
      .filter(pos => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader && pos.enabled !== false)
      .map(pos => pos.card)

    // Get leader and base for penalty calculation
    const leaderCard = activeLeader && cardPositions[activeLeader] ? cardPositions[activeLeader].card : null
    const baseCard = activeBase && cardPositions[activeBase] ? cardPositions[activeBase].card : null
    const getEffectiveCost = (card) => {
      const baseCost = card.cost || 0
      const penalty = (showAspectPenalties && leaderCard && baseCard) ? calculateAspectPenalty(card, leaderCard, baseCard) : 0
      return baseCost + penalty
    }

    if (deckSortOption === 'aspect') {
      // Sort by aspect key directly
      return allCards.sort((a, b) => {
        const keyA = getAspectKey(a)
        const keyB = getAspectKey(b)
        return keyA.localeCompare(keyB)
      })
    } else if (deckSortOption === 'cost') {
      // Sort by cost (will be grouped by cost segments in rendering)
      return allCards.sort((a, b) => getEffectiveCost(a) - getEffectiveCost(b))
    }
    return allCards
  }, [cardPositions, deckSortOption, getAspectKey, getDefaultAspectSortKey, showAspectPenalties, activeLeader, activeBase])

  // Group cards by base name (ignoring treatments like foil, hyperspace, showcase)
  // Returns an array of groups, where each group contains cards with the same base name
  const groupCardsByName = useCallback((cardEntries) => {
    const groups = new Map()

    cardEntries.forEach((cardEntry) => {
      const { cardId, position, aspectPenalty } = cardEntry
      const card = position.card
      const baseName = card.name || 'Unknown'

      if (!groups.has(baseName)) {
        groups.set(baseName, [])
      }
      groups.get(baseName).push({ cardId, position, aspectPenalty })
    })

    // Convert to array and sort groups by first card's order
    return Array.from(groups.entries()).map(([name, cards]) => ({
      name,
      cards
    }))
  }, [])

  // Render a card stack (for identical cards)
  const renderCardStack = useCallback((group, renderCard) => {
    // Render all cards individually, no stacking
    return group.cards.map((cardEntry, index) => renderCard(cardEntry, null, false))
  }, [])

  // Restore saved state on mount
  useEffect(() => {
    if (Object.keys(cardPositions).length === 0 && savedState) {
      try {
        // Load deck state from database (savedState prop)
        const state = jsonParse(savedState)

        // Check localStorage for more recent deck/sideboard state (backup for debounced database save)
        let localDeckCardIds = null
        let localSideboardCardIds = null
        if (shareId) {
          try {
            const uiState = localStorage.getItem(`deckBuilderUI_${shareId}`)
            if (uiState) {
              const localState = JSON.parse(uiState)
              // Use localStorage deck/sideboard state if it exists (it's saved immediately, unlike database)
              if (localState.deckCardIds && localState.sideboardCardIds) {
                localDeckCardIds = new Set(localState.deckCardIds)
                localSideboardCardIds = new Set(localState.sideboardCardIds)
              }
            }
          } catch (e) {
            // Ignore localStorage errors
          }
        }

        if (state.cardPositions && Object.keys(state.cardPositions).length > 0) {
          // Ensure all cards have enabled property (default to true)
          // Also remove any bases/leaders that might have been in 'main' section
          const positionsWithEnabled = {}
          Object.entries(state.cardPositions).forEach(([id, pos]) => {
            // Remove bases and leaders from 'main' section
            if ((pos.section === 'deck' || pos.section === 'sideboard') && (pos.card?.isBase || pos.card?.isLeader)) {
              return // Skip this card - it shouldn't be in main section
            }

            // Use localStorage deck/sideboard state if available (more recent than database)
            let section = pos.section
            let enabled = pos.enabled !== undefined ? pos.enabled : true
            if (localDeckCardIds && localSideboardCardIds && (pos.section === 'deck' || pos.section === 'sideboard')) {
              if (localDeckCardIds.has(id)) {
                section = 'deck'
                enabled = true
              } else if (localSideboardCardIds.has(id)) {
                section = 'sideboard'
                enabled = false
              }
            }

            positionsWithEnabled[id] = {
              ...pos,
              section,
              enabled
            }
          })

          // Check for leaders from cards prop that aren't in the restored state
          // This handles draft pools where savedState was created before leaders were properly included
          const poolLeaders = cards.filter(card => card.isLeader || card.type === 'Leader')
          const existingLeaderIds = new Set(
            Object.entries(positionsWithEnabled)
              .filter(([, pos]) => pos.card?.isLeader || pos.card?.type === 'Leader')
              .map(([, pos]) => pos.card?.id || pos.card?.name)
          )

          // Add any missing leaders to the leaders-bases section
          const leaderBaseWidth = 168
          const leaderBaseHeight = 120
          const spacing = 20
          const padding = 50

          // Count existing leaders/bases to determine starting position
          const existingLeadersBasesCount = Object.values(positionsWithEnabled)
            .filter(pos => pos.section === 'leaders-bases').length

          let addedCount = 0
          poolLeaders.forEach((leader, index) => {
            const leaderId = leader.id || leader.name
            if (!existingLeaderIds.has(leaderId)) {
              const itemsPerRow = Math.max(1, Math.floor((window.innerWidth - 100) / (leaderBaseWidth + spacing)))
              const totalIndex = existingLeadersBasesCount + addedCount
              const row = Math.floor(totalIndex / itemsPerRow)
              const col = totalIndex % itemsPerRow
              const cardId = `leader-${totalIndex}-${leader.id || `${leader.name}-${leader.set}`}`

              // Get Y position from bounds or use default
              const leaderBaseBounds = state.sectionBounds?.['leaders-bases']
              const baseY = leaderBaseBounds?.minY || 90

              positionsWithEnabled[cardId] = {
                x: padding + col * (leaderBaseWidth + spacing),
                y: baseY + row * (leaderBaseHeight + spacing),
                card: leader,
                section: 'leaders-bases',
                visible: true,
                zIndex: 1
              }
              addedCount++
            }
          })

          setCardPositions(positionsWithEnabled)
          setSectionLabels(state.sectionLabels || [])
          setSectionBounds(state.sectionBounds || {})
          setCanvasHeight(state.canvasHeight)
          // Merge with defaults to ensure all keys exist (prevents uncontrolled->controlled warning)
          const defaultAspectFilters = {
            Vigilance: true,
            Villainy: true,
            Heroism: true,
            Command: true,
            Cunning: true,
            Aggression: true,
            [NO_ASPECT_LABEL]: true
          }
          setAspectFilters({ ...defaultAspectFilters, ...(state.aspectFilters || {}) })
          // Restore sort options with backward compatibility
          if (state.poolSortOption) {
            setPoolSortOption(state.poolSortOption)
          } else if (state.sortOption) {
            setPoolSortOption(state.sortOption)
          }
          if (state.deckSortOption) {
            setDeckSortOption(state.deckSortOption)
          } else if (state.sortOption) {
            setDeckSortOption(state.sortOption)
          }

        }

        // Restore active leader and base (outside cardPositions check so it works even with empty positions)
        if (state.activeLeader) {
          setActiveLeader(state.activeLeader)
        }
        if (state.activeBase) {
          setActiveBase(state.activeBase)
        }

        // Restore UI state (outside cardPositions check)
        if (state.viewMode) {
          setViewMode(state.viewMode)
        }
        if (state.leadersBasesExpanded !== undefined) {
          setLeadersBasesExpanded(state.leadersBasesExpanded)
        }
        if (state.leadersExpanded !== undefined) {
          setLeadersExpanded(state.leadersExpanded)
        }
        if (state.basesExpanded !== undefined) {
          setBasesExpanded(state.basesExpanded)
        }
        if (state.deckExpanded !== undefined) {
          setDeckExpanded(state.deckExpanded)
        }
        if (state.sideboardExpanded !== undefined) {
          setSideboardExpanded(state.sideboardExpanded)
        }
        if (state.deckAspectSectionsExpanded) {
          setDeckAspectSectionsExpanded(state.deckAspectSectionsExpanded)
        }
        if (state.deckCostSectionsExpanded) {
          setDeckCostSectionsExpanded(state.deckCostSectionsExpanded)
        }
        if (state.deckGroupsExpanded) {
          setDeckGroupsExpanded(state.deckGroupsExpanded)
        }
        if (state.poolGroupsExpanded) {
          setPoolGroupsExpanded(state.poolGroupsExpanded)
        }
        if (state.showAspectPenalties !== undefined) {
          setShowAspectPenalties(state.showAspectPenalties)
        }
      } catch (e) {
        console.error('Failed to restore deck builder state:', e)
      }
    }
  }, [savedState, cards, shareId])

  // Restore UI state from localStorage
  useEffect(() => {
    if (!shareId) return

    try {
      const uiState = localStorage.getItem(`deckBuilderUI_${shareId}`)
      if (uiState) {
        const state = JSON.parse(uiState)

        if (state.viewMode) {
          setViewMode(state.viewMode)
        }
        if (state.aspectFilters) {
          // Merge with defaults to ensure all keys exist (prevents uncontrolled->controlled warning)
          setAspectFilters(prev => ({ ...prev, ...state.aspectFilters }))
        }
        if (state.inAspectFilter !== undefined) {
          setInAspectFilter(state.inAspectFilter)
        }
        if (state.outAspectFilter !== undefined) {
          setOutAspectFilter(state.outAspectFilter)
        }
        // Restore sort options with backward compatibility
        if (state.poolSortOption) {
          setPoolSortOption(state.poolSortOption)
        } else if (state.sortOption) {
          setPoolSortOption(state.sortOption)
        }
        if (state.deckSortOption) {
          setDeckSortOption(state.deckSortOption)
        } else if (state.sortOption) {
          setDeckSortOption(state.sortOption)
        }
        if (state.leadersBasesExpanded !== undefined) {
          setLeadersBasesExpanded(state.leadersBasesExpanded)
        }
        if (state.leadersExpanded !== undefined) {
          setLeadersExpanded(state.leadersExpanded)
        }
        if (state.basesExpanded !== undefined) {
          setBasesExpanded(state.basesExpanded)
        }
        if (state.deckExpanded !== undefined) {
          setDeckExpanded(state.deckExpanded)
        }
        if (state.sideboardExpanded !== undefined) {
          setSideboardExpanded(state.sideboardExpanded)
        }
        if (state.deckAspectSectionsExpanded) {
          setDeckAspectSectionsExpanded(state.deckAspectSectionsExpanded)
        }
        if (state.sideboardAspectSectionsExpanded) {
          setSideboardAspectSectionsExpanded(state.sideboardAspectSectionsExpanded)
        }
        if (state.deckCostSectionsExpanded) {
          setDeckCostSectionsExpanded(state.deckCostSectionsExpanded)
        }
        if (state.sideboardCostSectionsExpanded) {
          setSideboardCostSectionsExpanded(state.sideboardCostSectionsExpanded)
        }
        if (state.deckGroupsExpanded) {
          setDeckGroupsExpanded(state.deckGroupsExpanded)
        }
        if (state.poolGroupsExpanded) {
          setPoolGroupsExpanded(state.poolGroupsExpanded)
        }
        if (state.showAspectPenalties !== undefined) {
          setShowAspectPenalties(state.showAspectPenalties)
        }
        if (state.tableSort) {
          setTableSort(state.tableSort)
        }
        // Restore active leader/base from localStorage (backup for debounced database save)
        if (state.activeLeader) {
          setActiveLeader(state.activeLeader)
        }
        if (state.activeBase) {
          setActiveBase(state.activeBase)
        }
      }
    } catch (e) {
      console.error('Failed to restore UI state:', e)
    }
  }, [shareId])

  // Detect when deck-info-bar becomes sticky
  useEffect(() => {
    const infoBar = infoBarRef.current
    if (!infoBar) return

    const checkSticky = () => {
      if (!infoBar) return
      const rect = infoBar.getBoundingClientRect()
      // Trigger sticky mode 120px before it actually sticks (at top: 20px)
      const isSticky = rect.top <= 140
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
      if (e.key === 'Escape') {
        if (modalHoverTimeoutRef.current) {
          clearTimeout(modalHoverTimeoutRef.current)
          modalHoverTimeoutRef.current = null
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])


  // Initialize card positions in sections
  // Can initialize with just pool cards, then enhance when all set cards load
  useEffect(() => {
    // Don't initialize if we have saved state with card positions to restore
    if (savedState) {
      const state = jsonParse(savedState)
      if (state.cardPositions && Object.keys(state.cardPositions).length > 0) {
        return
      }
    }

    // Initialize immediately with pool cards if we have them
    // We only need allSetCards for the common bases, which can be added later
    if (cards.length > 0 && Object.keys(cardPositions).length === 0) {
      const poolCards = cards.filter(card => !card.isBase && !card.isLeader && card.type !== 'Base' && card.type !== 'Leader')
      const poolLeaders = cards.filter(card => card.isLeader || card.type === 'Leader')

      // Get common bases from all set cards if available, otherwise skip (will be added later)
      const commonBasesMap = new Map()
      if (allSetCards.length > 0) {
        allSetCards
          .filter(card => (card.isBase || card.type === 'Base') && card.rarity === 'Common')
          .forEach(card => {
            const key = card.name
            if (!commonBasesMap.has(key)) {
              commonBasesMap.set(key, card)
            }
          })
      }

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
      const rareBasesFromPacks = cards.filter(card => (card.isBase || card.type === 'Base') && card.rarity === 'Rare')
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
            section: 'sideboard', // All cards start in Pool section
            visible: true,
            enabled: false, // Start disabled (in Pool, not Deck)
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

  // Add common bases when allSetCards loads (even if cardPositions already exist)
  useEffect(() => {
    // Only run if we have allSetCards, cardPositions exist, and we haven't added common bases yet
    if (allSetCards.length > 0 && Object.keys(cardPositions).length > 0 && setCode) {
      // Check if common bases are already in cardPositions
      const hasCommonBases = Object.values(cardPositions).some(
        pos => pos.card.isBase && pos.card.rarity === 'Common'
      )

      // If no common bases found, add them
      if (!hasCommonBases) {
        // Get common bases from all set cards
        const commonBasesMap = new Map()
        allSetCards
          .filter(card => (card.isBase || card.type === 'Base') && card.rarity === 'Common')
          .forEach(card => {
            const key = card.name
            if (!commonBasesMap.has(key)) {
              commonBasesMap.set(key, card)
            }
          })

        // Sort bases by aspect
        const aspectOrder = ['Vigilance', 'Command', 'Aggression', 'Cunning']
        const getAspectSortValue = (card) => {
          const aspects = card.aspects || []
          if (aspects.length === 0) return 999
          for (let i = 0; i < aspectOrder.length; i++) {
            if (aspects.includes(aspectOrder[i])) {
              return i
            }
          }
          return 999
        }

        const uniqueCommonBases = Array.from(commonBasesMap.values()).sort((a, b) => {
          const aValue = getAspectSortValue(a)
          const bValue = getAspectSortValue(b)
          if (aValue !== bValue) {
            return aValue - bValue
          }
          return (a.name || '').localeCompare(b.name || '')
        })

        // Find the leaders-bases section bounds
        const leadersBasesBounds = sectionBounds['leaders-bases']
        if (leadersBasesBounds && uniqueCommonBases.length > 0) {
          const updatedPositions = { ...cardPositions }
          const leaderBaseWidth = 168
          const leaderBaseHeight = 120
          const spacing = 20
          const padding = 50

          // Find existing bases to determine starting position
          const existingBases = Object.values(cardPositions)
            .filter(pos => pos.section === 'leaders-bases' && pos.card.isBase)

          // Calculate starting position: after existing bases or at section start
          let startY = leadersBasesBounds.minY
          let startX = padding
          const itemsPerRow = Math.floor((window.innerWidth - 100) / (leaderBaseWidth + spacing))

          if (existingBases.length > 0) {
            // Find the bottom-right position of existing bases
            const maxY = Math.max(...existingBases.map(pos => pos.y + leaderBaseHeight))
            const maxX = Math.max(...existingBases.map(pos => pos.x + leaderBaseWidth))
            startY = maxY + spacing
            // If we need a new row, reset X
            if (maxX + leaderBaseWidth + spacing > window.innerWidth - padding) {
              startX = padding
            } else {
              startX = maxX + spacing
            }
          }

          // Add common bases
          uniqueCommonBases.forEach((card, index) => {
            const row = Math.floor(index / itemsPerRow)
            const col = index % itemsPerRow
            const cardId = `base-common-${index}-${card.id || `${card.name}-${card.set}`}`

            // Check if this base already exists (avoid duplicates)
            const baseExists = Object.values(cardPositions).some(
              pos => pos.card.isBase && pos.card.name === card.name && pos.card.rarity === 'Common'
            )

            if (!baseExists) {
              updatedPositions[cardId] = {
                x: startX + col * (leaderBaseWidth + spacing),
                y: startY + row * (leaderBaseHeight + spacing),
                card: card,
                section: 'leaders-bases',
                visible: true,
                zIndex: 1
              }
            }
          })

          // Update bounds if needed
          const updatedBounds = { ...sectionBounds }
          if (uniqueCommonBases.length > 0) {
            const totalRows = Math.ceil(uniqueCommonBases.length / itemsPerRow)
            const newMaxY = startY + (totalRows - 1) * (leaderBaseHeight + spacing) + leaderBaseHeight
            if (updatedBounds['leaders-bases']) {
              updatedBounds['leaders-bases'].maxY = Math.max(updatedBounds['leaders-bases'].maxY, newMaxY)
            }
          }

          setCardPositions(updatedPositions)
          setSectionBounds(updatedBounds)
        }
      }
    }
  }, [allSetCards, cardPositions, sectionBounds, setCode])

  // Save deck builder state to localStorage whenever it changes
  useEffect(() => {
    // Only save if we have a shareId to key the state by
    if (!shareId) return

    // Save state if we have card positions OR if leader/base selection changes
    if (Object.keys(cardPositions).length > 0 || activeLeader || activeBase) {
      // Determine which cards are in deck vs sideboard
      const deckCardIds = Object.entries(cardPositions)
        .filter(([_, pos]) => pos.section === 'deck')
        .map(([cardId, _]) => cardId)

      const sideboardCardIds = Object.entries(cardPositions)
        .filter(([_, pos]) => pos.section === 'sideboard')
        .map(([cardId, _]) => cardId)

      // Deck state for database
      const deckStateToSave = {
        cardPositions: Object.keys(cardPositions).length > 0 ? cardPositions : {},
        sectionLabels,
        sectionBounds,
        canvasHeight,
        activeLeader,
        activeBase,
        deckCardIds,
        sideboardCardIds,
        poolName: currentPoolName
      }

      // UI state for localStorage only
      const uiStateToSave = {
        viewMode,
        aspectFilters,
        inAspectFilter,
        outAspectFilter,
        poolSortOption,
        deckSortOption,
        leadersBasesExpanded,
        leadersExpanded,
        basesExpanded,
        deckExpanded,
        sideboardExpanded,
        deckAspectSectionsExpanded,
        sideboardAspectSectionsExpanded,
        deckCostSectionsExpanded,
        sideboardCostSectionsExpanded,
        deckGroupsExpanded,
        poolGroupsExpanded,
        showAspectPenalties,
        tableSort,
        // Also save active leader/base to localStorage as backup (database save is debounced)
        activeLeader,
        activeBase,
        // Save deck/sideboard card IDs to localStorage as backup (database save is debounced)
        deckCardIds,
        sideboardCardIds,
        lastSavedAt: Date.now()
      }

      // Save UI state to localStorage keyed by pool shareId
      if (shareId) {
        localStorage.setItem(`deckBuilderUI_${shareId}`, JSON.stringify(uiStateToSave))
      }

      // Save deck state to database via callback
      if (onStateChange) {
        onStateChange(deckStateToSave)
      }
    }
  }, [shareId, cardPositions, sectionLabels, sectionBounds, canvasHeight, activeLeader, activeBase, viewMode, aspectFilters, inAspectFilter, outAspectFilter, poolSortOption, deckSortOption, leadersBasesExpanded, leadersExpanded, basesExpanded, deckExpanded, sideboardExpanded, deckAspectSectionsExpanded, sideboardAspectSectionsExpanded, deckCostSectionsExpanded, sideboardCostSectionsExpanded, deckGroupsExpanded, poolGroupsExpanded, showAspectPenalties, tableSort, onStateChange, currentPoolName])

  // Cleanup: Remove any bases/leaders from deck/sideboard sections and move cards based on enabled state
  useEffect(() => {
    setCardPositions(prev => {
      let hasChanges = false
      const updated = { ...prev }
      const toRemove = []

      Object.keys(updated).forEach(cardId => {
        const pos = updated[cardId]
        // Remove bases and leaders from deck/sideboard sections
        if ((pos.section === 'deck' || pos.section === 'sideboard') && (pos.card.isBase || pos.card.isLeader)) {
          toRemove.push(cardId)
          hasChanges = true
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
            hasChanges = true
          } else if (!shouldBeInDeck && pos.section === 'deck') {
            // Move from deck to sideboard (card is disabled)
            updated[cardId] = {
              ...pos,
              section: 'sideboard',
              enabled: false
            }
            hasChanges = true
          }
        }
      })

      // Remove invalid cards
      toRemove.forEach(cardId => {
        delete updated[cardId]
      })

      // Only return new object if something changed, otherwise keep same reference
      return hasChanges ? updated : prev
    })
  }, [aspectFilters])

  // Sync aspect filter checkboxes with actual deck state
  // If all cards of an aspect are in sideboard, checkbox should be OFF
  // If all cards of an aspect are in deck, checkbox should be ON
  useEffect(() => {
    // Get all pool cards (not leaders/bases)
    const poolCards = Object.values(cardPositions).filter(
      pos => !pos.card.isLeader && !pos.card.isBase &&
             pos.card.type !== 'Leader' && pos.card.type !== 'Base' &&
             (pos.section === 'deck' || pos.section === 'sideboard')
    )

    // Allow running even if poolCards is empty to uncheck all filters when deck is empty

    const newAspectFilters = { ...aspectFilters }
    let hasAspectChanges = false

    // Check each aspect
    ;[...ASPECTS, NO_ASPECT_LABEL].forEach(aspect => {
      // Get cards matching this aspect
      const aspectCards = poolCards.filter(pos => {
        const cardAspects = pos.card.aspects || []
        if (aspect === NO_ASPECT_LABEL) {
          return cardAspects.length === 0
        }
        return cardAspects.includes(aspect)
      })

      // If no cards of this aspect exist in pool, uncheck the filter
      if (aspectCards.length === 0) {
        if (aspectFilters[aspect]) {
          newAspectFilters[aspect] = false
          hasAspectChanges = true
        }
        return
      }

      const inDeckCount = aspectCards.filter(pos => pos.section === 'deck').length
      const totalCount = aspectCards.length

      // If ALL cards of this aspect are in deck, checkbox should be ON
      if (inDeckCount === totalCount && !aspectFilters[aspect]) {
        newAspectFilters[aspect] = true
        hasAspectChanges = true
      }
      // If ALL cards of this aspect are in sideboard, checkbox should be OFF
      else if (inDeckCount === 0 && aspectFilters[aspect]) {
        newAspectFilters[aspect] = false
        hasAspectChanges = true
      }
    })

    if (hasAspectChanges) {
      setAspectFilters(newAspectFilters)
    }

    // Sync in/out aspect filters (only when leader and base are selected)
    const leaderCard = activeLeader && cardPositions[activeLeader] ? cardPositions[activeLeader].card : null
    const baseCard = activeBase && cardPositions[activeBase] ? cardPositions[activeBase].card : null

    if (leaderCard && baseCard) {
      // Categorize cards by in/out of aspect
      const inAspectCards = poolCards.filter(pos => calculateAspectPenalty(pos.card, leaderCard, baseCard) === 0)
      const outAspectCards = poolCards.filter(pos => calculateAspectPenalty(pos.card, leaderCard, baseCard) > 0)

      // Sync in-aspect filter
      if (inAspectCards.length > 0) {
        const inAspectInDeck = inAspectCards.filter(pos => pos.section === 'deck').length
        if (inAspectInDeck === inAspectCards.length && !inAspectFilter) {
          setInAspectFilter(true)
        } else if (inAspectInDeck === 0 && inAspectFilter) {
          setInAspectFilter(false)
        }
      }

      // Sync out-of-aspect filter
      if (outAspectCards.length > 0) {
        const outAspectInDeck = outAspectCards.filter(pos => pos.section === 'deck').length
        if (outAspectInDeck === outAspectCards.length && !outAspectFilter) {
          setOutAspectFilter(true)
        } else if (outAspectInDeck === 0 && outAspectFilter) {
          setOutAspectFilter(false)
        }
      }
    }
  }, [cardPositions, activeLeader, activeBase]) // Only depend on these to avoid infinite loops

  // Determine pool/deck order once on initial load (draft mode only)
  // If pool has more cards, show it first; otherwise show deck first
  useEffect(() => {
    if (poolFirstOrder !== null) return // Already determined

    // Wait until cards prop has loaded (indicates pool data is available)
    if (!cards || cards.length === 0) return

    if (!isDraftMode) {
      setPoolFirstOrder(false) // Sealed mode: deck always first
      return
    }

    // Get all non-leader/base cards from cardPositions
    const allPoolDeckCards = Object.values(cardPositions).filter(
      pos => !pos.card.isLeader && !pos.card.isBase &&
             pos.card.type !== 'Leader' && pos.card.type !== 'Base' &&
             (pos.section === 'deck' || pos.section === 'sideboard')
    )

    // Wait until we have cards in cardPositions (after initialization/restoration)
    if (allPoolDeckCards.length < 10) return

    const poolCards = allPoolDeckCards.filter(
      pos => pos.section === 'sideboard' || pos.enabled === false
    )
    const deckCards = allPoolDeckCards.filter(
      pos => pos.section === 'deck' && pos.enabled !== false
    )

    setPoolFirstOrder(poolCards.length > deckCards.length)
  }, [cards, cardPositions, isDraftMode, poolFirstOrder, poolType])

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
  // Note: This effect handles card positioning for canvas view
  // In grid/block view, sorting is handled directly in rendering
  useEffect(() => {
    if (deckSortOption === 'aspect' && poolSortOption === 'aspect') return // Aspect sorting is handled in rendering, not here

    setCardPositions(prev => {
      // Separate deck and sideboard cards
      const deckCards = Object.entries(prev)
        .filter(([_, pos]) => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader && pos.enabled !== false)
        .map(([id, pos]) => ({ id, ...pos }))

      const sideboardCards = Object.entries(prev)
        .filter(([_, pos]) => (pos.section === 'sideboard' || pos.enabled === false) && pos.visible && !pos.card.isBase && !pos.card.isLeader)
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

      // Helper function to sort cards based on a sort option
      // Get leader and base for penalty calculation
      const leaderCardSort = activeLeader && updated[activeLeader] ? updated[activeLeader].card : null
      const baseCardSort = activeBase && updated[activeBase] ? updated[activeBase].card : null
      const getEffectiveCost = (card) => {
        const baseCost = card.cost || 0
        const penalty = (showAspectPenalties && leaderCardSort && baseCardSort) ? calculateAspectPenalty(card, leaderCardSort, baseCardSort) : 0
        return baseCost + penalty
      }
      const sortCards = (cards, sortOpt) => {
        if (sortOpt === 'cost') {
          return [...cards].sort((a, b) => getEffectiveCost(a) - getEffectiveCost(b))
        } else if (sortOpt === 'aspect') {
          // Sort by aspect key directly
          return [...cards].sort((a, b) => {
            const keyA = getAspectKey(a)
            const keyB = getAspectKey(b)
            return keyA.localeCompare(keyB)
          })
        } else if (sortOpt === 'type') {
          return [...cards].sort((a, b) => {
            const aOrder = getTypeStringOrder(a.type || '')
            const bOrder = getTypeStringOrder(b.type || '')
            if (aOrder !== bOrder) return aOrder - bOrder
            return getEffectiveCost(a) - getEffectiveCost(b)
          })
        }
        return cards
      }

      // Helper function to position cards in a section
      const positionCards = (cardIds, startY, sectionName, sortOpt) => {
        if (cardIds.length === 0) return startY

        const cards = cardIds.map(id => updated[id]?.card).filter(Boolean)
        const sortedCards = sortCards(cards, sortOpt)
        const sortedCardIds = sortedCards.map(card => {
          return cardIds.find(id => {
            const c = updated[id]?.card
            return c && (c.id === card.id || c.name === card.name)
          })
        }).filter(Boolean)

      if (sortOpt === 'cost') {
        // Vertical columns by cost
        const costGroups = {}
        // Get leader and base for penalty calculation
        const leaderCard = activeLeader && updated[activeLeader] ? updated[activeLeader].card : null
        const baseCard = activeBase && updated[activeBase] ? updated[activeBase].card : null
          sortedCardIds.forEach(cardId => {
            const card = updated[cardId]?.card
            if (!card) return
          const baseCost = card.cost || 0
          const penalty = (showAspectPenalties && leaderCard && baseCard) ? calculateAspectPenalty(card, leaderCard, baseCard) : 0
          const cost = baseCost + penalty
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
      } else if (sortOpt === 'aspect') {
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

      // Position deck cards using deckSortOption
      const deckEndY = positionCards(sortedDeckIds, deckY, 'deck', deckSortOption)

      // Position sideboard cards using poolSortOption
      const sideboardEndY = positionCards(sortedSideboardIds, sideboardY, 'sideboard', poolSortOption)

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
    // Note: sectionBounds intentionally excluded - this effect writes to it, including it would cause infinite loop
    // Note: cardMatchesFilters excluded - it depends on cardPositions which this effect writes to
  }, [deckSortOption, poolSortOption, getAspectKey, showAspectPenalties, activeLeader, activeBase])

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
      const newLeader = cardId === activeLeader ? null : cardId
      setActiveLeader(newLeader)
      // Turn on aspect penalties if selecting a leader and sort by cost is active
      if (newLeader && (poolSortOption === 'cost' || deckSortOption === 'cost')) {
        setShowAspectPenalties(true)
      }
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
        setHoveredCard(null) // Clear hover state when card is moved
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

  // Mark the last block in each row to expand
  useEffect(() => {
    if (!deckExpanded || !deckBlocksRowRef.current) return

    const markLastInRow = () => {
      const blocks = deckBlocksRowRef.current?.querySelectorAll('.card-block')
      if (!blocks || blocks.length === 0) return

      // Remove previous markers
      blocks.forEach(block => block.classList.remove('last-in-row'))

      // Group blocks by row (same top position)
      const rows = new Map()
      blocks.forEach((block) => {
        const rect = block.getBoundingClientRect()
        const top = Math.round(rect.top)
        if (!rows.has(top)) {
          rows.set(top, [])
        }
        rows.get(top).push(block)
      })

      // Mark the last block in each row
      rows.forEach((rowBlocks) => {
        if (rowBlocks.length > 0) {
          rowBlocks[rowBlocks.length - 1].classList.add('last-in-row')
        }
      })
    }

    // Run after a short delay to ensure layout is complete
    const timeoutId = setTimeout(markLastInRow, 100)

    // Also run on resize
    window.addEventListener('resize', markLastInRow)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', markLastInRow)
    }
  }, [deckExpanded, cardPositions, deckSortOption])

  // Table sorting functions - per section
  const handleTableSort = (sectionId, field) => {
    setTableSort(prev => {
      const sectionSort = prev[sectionId] || { field: null, direction: 'asc' }
      if (sectionSort.field === field) {
        return {
          ...prev,
          [sectionId]: { field, direction: sectionSort.direction === 'asc' ? 'desc' : 'asc' }
        }
      }
      return {
        ...prev,
        [sectionId]: { field, direction: 'asc' }
      }
    })
  }

  const getSortArrow = (sectionId, field) => {
    const sectionSort = tableSort[sectionId] || { field: null, direction: 'asc' }
    if (sectionSort.field !== field) {
      return <span className="sort-arrow">↕</span>
    }
    return sectionSort.direction === 'asc' ? <span className="sort-arrow">↑</span> : <span className="sort-arrow">↓</span>
  }

  // Default sort function: aspect combinations, then type, then cost
  // Use imported compareByAspectTypeCostName from cardSorting service
  const defaultSort = compareByAspectTypeCostName

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

  // Extract the card number from an ID like "SEC-246" or "SEC_1002"
  // Build base card map for the current set (memoized)
  // Uses the robust utility that filters by variantType === 'Normal'
  const baseCardMap = useMemo(() => {
    return buildBaseCardMapUtil(setCode)
  }, [setCode])

  // Get base card ID for export (converts variants to Normal equivalent)
  const getBaseCardId = useCallback((card) => {
    return getBaseCardIdUtil(card, baseCardMap)
  }, [baseCardMap])

  // Convert card ID from hyphen format (SOR-015) to underscore format (SOR_015)
  // Note: This simple conversion is only used internally - for export, use getBaseCardId
  const convertIdFormat = (id) => {
    if (!id) return id
    return id.replace(/-/g, '_')
  }

  // Build deck data structure for export (uses base card IDs for Karabast compatibility)
  const buildDeckData = () => {
    const leaderCard = activeLeader && cardPositions[activeLeader] ? cardPositions[activeLeader].card : null
    const baseCard = activeBase && cardPositions[activeBase] ? cardPositions[activeBase].card : null

    // Build set of leader/base IDs to filter from final output
    // Use getBaseCardId to ensure variant treatments map to their base ID
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
        setMessageType(null)
      }, 3000)
    } catch (err) {
      setErrorMessage('Failed to copy to clipboard')
      setMessageType('error')
      setTimeout(() => {
        setErrorMessage(null)
    setMessageType(null)
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
        // Secondary sort by name
        const nameA = (a.name || '').toLowerCase()
        const nameB = (b.name || '').toLowerCase()
        return nameA.localeCompare(nameB)
      }

      // Get selected leader and base
      const selectedLeader = activeLeader ? cardPositions[activeLeader]?.card : null
      const selectedBase = activeBase ? cardPositions[activeBase]?.card : null

      // Get deck cards (in color) - sorted by cost
      const deckCards = Object.values(cardPositions)
        .filter(pos => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader && pos.enabled !== false)
        .map(pos => pos.card)
        .sort((a, b) => costSort(a, b))

      // Get sideboard cards (will be grayscale) - sorted by cost
      const sideboardCards = Object.values(cardPositions)
        .filter(pos => (pos.section === 'sideboard' || pos.enabled === false) && pos.visible && !pos.card.isBase && !pos.card.isLeader)
        .map(pos => pos.card)
        .sort((a, b) => costSort(a, b))

      // Card dimensions
      const cardWidth = 120
      const cardHeight = 168
      const leaderBaseWidth = 168
      const leaderBaseHeight = 120
      const spacing = 20
      const padding = 50
      const sectionSpacing = 40
      const labelHeight = 30
      const titleHeight = 50
      const cardsPerRow = 12

      // Calculate dimensions based on total cards (including duplicates)
      const deckRows = Math.ceil(deckCards.length / cardsPerRow)
      const sideboardRows = Math.ceil(sideboardCards.length / cardsPerRow)
      const width = padding * 2 + cardsPerRow * (cardWidth + spacing) - spacing

      let currentY = padding

      // Title at top
      currentY += titleHeight + sectionSpacing

      // Selected leader and base at top (1 row, centered)
      if (selectedLeader || selectedBase) {
        currentY += leaderBaseHeight + sectionSpacing
      }

      // Deck section (label + cards)
      currentY += labelHeight + deckRows * (cardHeight + spacing) + sectionSpacing

      // Sideboard section (label + cards)
      currentY += labelHeight + sideboardRows * (cardHeight + spacing) + sectionSpacing

      // Add space for Protect the Pod stamp
      const stampHeight = 40
      const totalHeight = currentY + stampHeight + padding

      // Create canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = totalHeight
      const ctx = canvas.getContext('2d')

      // Draw black background
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, width, totalHeight)

      const cardRadius = 13 // Border radius matching app style

      // Helper to draw rounded rectangle
      const drawRoundedRect = (x, y, width, height, radius) => {
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
        ctx.lineTo(x + width, y + height - radius)
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        ctx.lineTo(x + radius, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
      }

      // Helper to load and draw card image
      const drawCard = async (card, x, y, width, height, count = null, grayscale = false) => {
        return new Promise((resolve) => {

          // Helper to draw placeholder
          const drawPlaceholder = () => {
            ctx.save()
            ctx.fillStyle = grayscale ? 'rgba(50, 50, 50, 0.8)' : 'rgba(26, 26, 46, 0.8)'
            drawRoundedRect(x, y, width, height, cardRadius)
            ctx.fill()
            ctx.restore()

            ctx.fillStyle = grayscale ? 'rgba(200, 200, 200, 0.5)' : 'white'
            ctx.font = '12px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(card.name || 'Card', x + width / 2, y + height / 2)
            resolve()
          }

          if (!card.imageUrl) {
            drawPlaceholder()
            return
          }

          // Try to fetch image as blob first to avoid CORS issues
          const loadImageViaBlob = async () => {
            try {
              // Always use our API proxy to avoid CORS issues
              const imageUrl = `/api/image-proxy?url=${encodeURIComponent(card.imageUrl)}`

              const response = await fetch(imageUrl, { mode: 'cors' })

              if (!response.ok) throw new Error('Failed to fetch')
              const blob = await response.blob()
              const objectUrl = URL.createObjectURL(blob)

              const img = new Image()
              img.onload = () => {
                URL.revokeObjectURL(objectUrl)
                try {
                  // Save context state
                  ctx.save()

                  // Clip to rounded rectangle
                  drawRoundedRect(x, y, width, height, cardRadius)
                  ctx.clip()

                  if (grayscale) {
                    // Apply grayscale filter
                    ctx.filter = 'grayscale(100%)'
                  }

                  // Draw card image
                  ctx.drawImage(img, x, y, width, height)

                  // Restore context (removes filter and clip)
                  ctx.restore()

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
                URL.revokeObjectURL(objectUrl)
                drawPlaceholder()
              }
              img.src = objectUrl
            } catch (error) {
              // If fetch fails, try direct image load
              console.warn(`Failed to fetch image as blob for ${card.name}, trying direct load:`, error)
              loadImageDirect()
            }
          }

          // Fallback: direct image load (may fail due to CORS)
          const loadImageDirect = () => {
            const img = new Image()
            // Always use API proxy to avoid CORS issues
            const imageUrl = `/api/image-proxy?url=${encodeURIComponent(card.imageUrl)}`

            const timeoutId = setTimeout(() => {
              console.warn(`Image load timeout for ${card.name}: ${imageUrl}`)
              drawPlaceholder()
            }, 10000)

            img.onload = () => {
              clearTimeout(timeoutId)
              try {
                // Save context state
                ctx.save()

                // Clip to rounded rectangle
                drawRoundedRect(x, y, width, height, cardRadius)
                ctx.clip()

                if (grayscale) {
                  // Apply grayscale filter
                  ctx.filter = 'grayscale(100%)'
                }

                // Draw card image
                ctx.drawImage(img, x, y, width, height)

                // Restore context (removes filter and clip)
                ctx.restore()

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

            // Try with CORS first
            img.crossOrigin = 'anonymous'
            img.src = imageUrl
          }

          // Try blob method first (better for CORS)
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

      // Draw deck cards (in color) - sorted by default sort, including duplicates
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

      // Draw sideboard cards (in grayscale) - sorted by default sort, including duplicates
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

      // Draw timestamp below name (or below "by username" if present)
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

  const packArtUrl = setCode ? getPackArtUrl(setCode) : null
  const setArtStyle = packArtUrl ? {
    backgroundImage: `url("${packArtUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
  } : {}

  return (
    <div className="deck-builder" ref={containerRef}>
      {packArtUrl && (
        <div className="set-art-header" style={setArtStyle}></div>
      )}
      <div className="deck-builder-content">
        <DeckBuilderHeader
          currentPoolName={currentPoolName}
          onRenamePool={handleRenamePool}
          isOwner={isOwner}
          isDraftMode={isDraftMode}
          isInfoBarSticky={isInfoBarSticky}
          isAuthenticated={isAuthenticated}
          signIn={signIn}
          shareId={shareId}
          cardPositions={cardPositions}
          activeLeader={activeLeader}
          activeBase={activeBase}
          setCode={setCode}
          cards={cards}
          savedState={savedState}
          poolType={poolType}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          messageType={messageType}
          setMessageType={setMessageType}
        />

      {/* Selected Leader/Base and Deck/Sideboard Info - Sticky Bar */}
      <StickyInfoBar
        infoBarRef={infoBarRef}
        isInfoBarSticky={isInfoBarSticky}
        activeLeader={activeLeader}
        activeBase={activeBase}
        cardPositions={cardPositions}
        leadersExpanded={leadersExpanded}
        setLeadersExpanded={setLeadersExpanded}
        basesExpanded={basesExpanded}
        setBasesExpanded={setBasesExpanded}
        deckExpanded={deckExpanded}
        setDeckExpanded={setDeckExpanded}
        sideboardExpanded={sideboardExpanded}
        setSideboardExpanded={setSideboardExpanded}
        onCardMouseEnter={handleCardMouseEnter}
        onCardMouseLeave={handleCardMouseLeave}
        isDraftMode={isDraftMode}
        isOwner={isOwner}
        isAuthenticated={isAuthenticated}
        signIn={signIn}
        shareId={shareId}
        setErrorMessage={setErrorMessage}
        setMessageType={setMessageType}
        setCode={setCode}
        cards={cards}
        savedState={savedState}
        poolType={poolType}
        currentPoolName={currentPoolName}
      />

      <div className="view-controls">
        <Button
          variant="icon"
          className="view-toggle-button"
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          onMouseEnter={(e) => showNavTooltip(viewMode === 'grid' ? 'Table View' : 'Playmat View', e)}
          onMouseLeave={hideTooltip}
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
        </Button>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="blocks-container">
          {/* Leaders & Bases Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1.5rem',
            marginBottom: '0.75rem',
            fontSize: '1.2rem',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.9)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            paddingBottom: '0.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={() => setLeadersBasesExpanded(!leadersBasesExpanded)}
          >
            <span>{leadersBasesExpanded ? '▼' : '▶'}</span>
            <span>Leaders & Bases</span>
          </div>

          {/* Leaders and Bases - only show when parent is expanded */}
          {leadersBasesExpanded && (
            <LeaderBaseSelector
              cardPositions={cardPositions}
              activeLeader={activeLeader}
              setActiveLeader={setActiveLeader}
              activeBase={activeBase}
              setActiveBase={setActiveBase}
              selectedCards={selectedCards}
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
              leadersExpanded={leadersExpanded}
              setLeadersExpanded={setLeadersExpanded}
              basesExpanded={basesExpanded}
              setBasesExpanded={setBasesExpanded}
              onCardMouseEnter={handleCardMouseEnter}
              onCardMouseLeave={handleCardMouseLeave}
              poolSortOption={poolSortOption}
              deckSortOption={deckSortOption}
              setShowAspectPenalties={setShowAspectPenalties}
            />
          )}

          {/* Deck and Pool sections wrapper - allows reordering via CSS */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Deck Section (appears below Pool) */}
          <div style={{ order: 1 }}>
          {/* Deck Header */}
          <SectionHeader
            id="deck-header"
            title="Deck"
            mode="deck"
            cardCount={Object.values(cardPositions)
              .filter(pos => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader && pos.enabled !== false).length}
            expanded={deckExpanded}
            onToggleExpanded={() => setDeckExpanded(!deckExpanded)}
            sortOption={deckSortOption}
            onSortChange={setDeckSortOption}
            filterOpen={deckFilterOpen}
            onFilterToggle={() => { setDeckFilterOpen(!deckFilterOpen); setPoolFilterOpen(false); }}
            onFilterClose={() => setDeckFilterOpen(false)}
            cardPositions={cardPositions}
            setCardPositions={setCardPositions}
            activeLeader={activeLeader}
            activeBase={activeBase}
            filterAspectsExpanded={filterAspectsExpanded}
            onFilterAspectsExpandedChange={setFilterAspectsExpanded}
            showAspectPenalties={showAspectPenalties}
            setShowAspectPenalties={setShowAspectPenalties}
          />

          {/* Deck Blocks Row */}
          {deckExpanded && (
            <div className="blocks-deck-row" ref={deckBlocksRowRef}>
              {(() => {
          // Get all deck cards (only enabled ones)
          const deckCards = Object.entries(cardPositions)
            .filter(([_, position]) => position.section === 'deck' && position.visible && !position.card.isBase && !position.card.isLeader && position.enabled !== false)
            .map(([cardId, position]) => ({ cardId, position }))

          const leaderCardDeck = activeLeader && cardPositions[activeLeader] ? cardPositions[activeLeader].card : null
          const baseCardDeck = activeBase && cardPositions[activeBase] ? cardPositions[activeBase].card : null

          // Default sort uses flat container with default sort order
          if (deckSortOption === 'default') {
            const sortedDeckCards = [...deckCards].sort(createDefaultSortFn(getDefaultAspectSortKey))
            const groupedCards = groupCardsByName(sortedDeckCards)

            return (
              <div className="card-block deck-flat-container" style={{ width: '100%' }}>
                <div className="card-block-content">
                  <div className="cards-grid">
                    {groupedCards.map(group => renderCardStack(group, (cardEntry, stackIndex, isStacked) => {
                      const { cardId, position } = cardEntry
                      const card = position.card
                      const isSelected = selectedCards.has(cardId)
                      const isHovered = hoveredCard === cardId
                      const isDisabled = !position.enabled

                      const penalty = showAspectPenalties && leaderCardDeck && baseCardDeck
                        ? calculateAspectPenalty(card, leaderCardDeck, baseCardDeck)
                        : 0

                      return (
                        <Card
                          key={cardId}
                          card={card}
                          selected={isSelected}
                          hovered={isHovered}
                          disabled={isDisabled}
                          stacked={isStacked}
                          stackIndex={stackIndex}
                          showPenalty={showAspectPenalties && leaderCardDeck && baseCardDeck}
                          penaltyAmount={penalty}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (!e.shiftKey) {
                              toggleCardSection(cardId)
                            }
                          }}
                          onMouseEnter={(e) => {
                            setHoveredCard(cardId)
                            handleCardMouseEnter(position.card, e)
                          }}
                          onMouseLeave={() => {
                            setHoveredCard(null)
                            handleCardMouseLeave()
                          }}
                        />
                      )
                    }))}
                  </div>
                </div>
              </div>
            )
          }

          // Grouped blocks for aspect, cost, type
          // Helper to get group key based on sort option
          const leaderCard = activeLeader && cardPositions[activeLeader] ? cardPositions[activeLeader].card : null
          const baseCard = activeBase && cardPositions[activeBase] ? cardPositions[activeBase].card : null
          const getGroupKey = createGetGroupKey(deckSortOption, {
            showAspectPenalties,
            leaderCard,
            baseCard,
            calculateAspectPenalty,
            getAspectKey
          })

          // Sort function for cards within groups
          const cardSortFn = createGroupCardSortFn(deckSortOption, getDefaultAspectSortKey)

          // Group cards
          const groups = {}
          deckCards.forEach(({ cardId, position }) => {
            const key = getGroupKey(position.card)
            if (!groups[key]) groups[key] = []
            groups[key].push({ cardId, position })
          })

          // Also group pool cards to determine +All availability
          const poolCardsAll = Object.entries(cardPositions)
            .filter(([_, position]) => (position.section === 'sideboard' || position.enabled === false) && position.visible && !position.card.isBase && !position.card.isLeader)
            .map(([cardId, position]) => ({ cardId, position }))
          const poolGroups = {}
          poolCardsAll.forEach(({ cardId, position }) => {
            const key = getGroupKey(position.card)
            if (!poolGroups[key]) poolGroups[key] = []
            poolGroups[key].push({ cardId, position })
          })

          // Sort group keys
          const sortedKeys = sortGroupKeys(Object.keys(groups), deckSortOption, '8+')

          // Toggle group expanded state
          const toggleDeckGroupExpanded = (key) => {
            setDeckGroupsExpanded(prev => ({
              ...prev,
              [key]: prev[key] === false ? true : false
            }))
          }

          // Check if group is expanded (default true)
          const isDeckGroupExpanded = (key) => deckGroupsExpanded[key] !== false

          // Helper to check if a group key is a mono-aspect (single primary color)
          const isDeckMonoAspect = (key) => {
            if (deckSortOption !== 'aspect') return false
            return key === 'A_Vigilance' || key === 'B_Command' || key === 'C_Aggression' || key === 'D_Cunning'
          }

          // Determine block class based on sort option
          const blockTypeClass = deckSortOption === 'type' ? 'type-block' : deckSortOption === 'cost' ? 'cost-block' : 'aspect-block'

          return (
            <div className="blocks-deck-groups-row">
              {sortedKeys.map(groupKey => {
                const groupCards = groups[groupKey].sort(cardSortFn)
                const groupedByName = groupCardsByName(groupCards)
                const expanded = isDeckGroupExpanded(groupKey)
                const monoAspect = isDeckMonoAspect(groupKey)

                // Get matching pool cards for this group
                const matchingPoolCards = poolGroups[groupKey] || []
                // +All enabled if there are pool cards to add
                const hasPoolCardsToAdd = matchingPoolCards.length > 0
                // -All enabled if there are deck cards to remove
                const hasDeckCardsToRemove = groupCards.length > 0

                return (
                  <div key={groupKey} className={`card-block deck-group-block ${monoAspect ? 'mono-aspect' : ''} ${blockTypeClass} ${!expanded ? 'collapsed' : ''}`}>
                    <div
                      className="card-block-header"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <span
                        style={{ marginRight: '0.25rem', fontSize: '0.8rem', cursor: 'pointer' }}
                        onClick={() => toggleDeckGroupExpanded(groupKey)}
                      >{expanded ? '▼' : '▶'}</span>
                      <span style={{ cursor: 'pointer', marginRight: '0.5rem' }} onClick={() => toggleDeckGroupExpanded(groupKey)}>
                        <GroupHeader groupKey={groupKey} count={groupCards.length} sortOption={deckSortOption} getAspectSymbol={getAspectSymbol} />
                      </span>
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCardPositions(prev => {
                            const updated = { ...prev }
                            groupCards.forEach(({ cardId }) => {
                              updated[cardId] = { ...updated[cardId], section: 'sideboard', enabled: false }
                            })
                            return updated
                          })
                        }}
                        className="remove-all-button"
                        disabled={!hasDeckCardsToRemove}
                      >
                        - All
                      </Button>
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Add matching pool cards to deck
                          setCardPositions(prev => {
                            const updated = { ...prev }
                            matchingPoolCards.forEach(({ cardId }) => {
                              updated[cardId] = { ...updated[cardId], section: 'deck', enabled: true }
                            })
                            return updated
                          })
                        }}
                        className="add-all-button"
                        disabled={!hasPoolCardsToAdd}
                      >
                        + All
                      </Button>
                    </div>
                    {expanded && <div className="card-block-content">
                      <div className="cards-grid">
                        {groupedByName.map(group => renderCardStack(group, (cardEntry, stackIndex, isStacked) => {
                          const { cardId, position } = cardEntry
                          const card = position.card
                          const isSelected = selectedCards.has(cardId)
                          const isHovered = hoveredCard === cardId
                          const isDisabled = !position.enabled

                          const penalty = showAspectPenalties && leaderCard && baseCard ? calculateAspectPenalty(card, leaderCard, baseCard) : 0
                          return (
                            <Card
                              key={cardId}
                              card={card}
                              selected={isSelected}
                              hovered={isHovered}
                              disabled={isDisabled}
                              stacked={isStacked}
                              stackIndex={stackIndex}
                              showPenalty={showAspectPenalties}
                              penaltyAmount={penalty}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (!e.shiftKey) {
                                  toggleCardSection(cardId)
                                }
                              }}
                              onMouseEnter={(e) => {
                                setHoveredCard(cardId)
                                handleCardMouseEnter(position.card, e)
                              }}
                              onMouseLeave={() => {
                                setHoveredCard(null)
                                handleCardMouseLeave()
                              }}
                            />
                          )
                        }))}
                      </div>
                    </div>}
                  </div>
                )
              })}
            </div>
          )
              })()}
            </div>
          )}
          </div>{/* End Deck Section */}

          {/* Pool Section (appears above Deck) */}
          <div style={{ order: 0 }}>
          {/* Pool Header */}
          <SectionHeader
            id="pool-header"
            title="Pool"
            mode="pool"
            cardCount={Object.entries(cardPositions)
              .filter(([_, position]) => (position.section === 'sideboard' || position.enabled === false) && position.visible && !position.card.isBase && !position.card.isLeader)
              .length}
            expanded={sideboardExpanded}
            onToggleExpanded={() => setSideboardExpanded(!sideboardExpanded)}
            sortOption={poolSortOption}
            onSortChange={setPoolSortOption}
            filterOpen={poolFilterOpen}
            onFilterToggle={() => { setPoolFilterOpen(!poolFilterOpen); setDeckFilterOpen(false); }}
            onFilterClose={() => setPoolFilterOpen(false)}
            cardPositions={cardPositions}
            setCardPositions={setCardPositions}
            activeLeader={activeLeader}
            activeBase={activeBase}
            filterAspectsExpanded={filterAspectsExpanded}
            onFilterAspectsExpandedChange={setFilterAspectsExpanded}
            showAspectPenalties={showAspectPenalties}
            setShowAspectPenalties={setShowAspectPenalties}
          />

          {/* Pool Blocks - Grouped by sort option or flat for default */}
          {(() => {
            const poolCards = Object.entries(cardPositions)
              .filter(([_, position]) => (position.section === 'sideboard' || position.enabled === false) && position.visible && !position.card.isBase && !position.card.isLeader)
              .map(([cardId, position]) => ({ cardId, position }))

            if (poolCards.length === 0) {
              return null
            }

            const leaderCardPool = activeLeader && cardPositions[activeLeader] ? cardPositions[activeLeader].card : null
            const baseCardPool = activeBase && cardPositions[activeBase] ? cardPositions[activeBase].card : null

            // Default sort - flat container
            if (poolSortOption === 'default') {
              const sortedPoolCards = [...poolCards].sort(createDefaultSortFn(getDefaultAspectSortKey))
              const groupedCards = groupCardsByName(sortedPoolCards)

              return (
                <div className="blocks-pool-row">
                  {sideboardExpanded && (
                    <div className="card-block pool-flat-container" style={{ width: '100%' }}>
                      <div className="card-block-content">
                        <div className="cards-grid">
                          {groupedCards.map(group => renderCardStack(group, (cardEntry, stackIndex, isStacked) => {
                            const { cardId, position } = cardEntry
                            const card = position.card
                            const isSelected = selectedCards.has(cardId)
                            const isHovered = hoveredCard === cardId

                            const penalty = showAspectPenalties && leaderCardPool && baseCardPool ? calculateAspectPenalty(card, leaderCardPool, baseCardPool) : 0
                            return (
                              <Card
                                key={cardId}
                                card={card}
                                selected={isSelected}
                                hovered={isHovered}
                                stacked={isStacked}
                                stackIndex={stackIndex}
                                showPenalty={showAspectPenalties}
                                penaltyAmount={penalty}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (!e.shiftKey) {
                                    toggleCardSection(cardId)
                                  }
                                }}
                                onMouseEnter={(e) => {
                                  setHoveredCard(cardId)
                                  handleCardMouseEnter(position.card, e)
                                }}
                                onMouseLeave={() => {
                                  setHoveredCard(null)
                                  handleCardMouseLeave()
                                }}
                              />
                            )
                          }))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            // Helper to get group key based on sort option
            const leaderCard = activeLeader && cardPositions[activeLeader] ? cardPositions[activeLeader].card : null
            const baseCard = activeBase && cardPositions[activeBase] ? cardPositions[activeBase].card : null
            const getGroupKey = createGetGroupKey(poolSortOption, {
              showAspectPenalties,
              leaderCard,
              baseCard,
              calculateAspectPenalty,
              getAspectKey
            })

            // Sort function for cards within groups
            const cardSortFn = createGroupCardSortFn(poolSortOption, getDefaultAspectSortKey)

            // Group cards
            const groups = {}
            poolCards.forEach(({ cardId, position }) => {
              const key = getGroupKey(position.card)
              if (!groups[key]) groups[key] = []
              groups[key].push({ cardId, position })
            })

            // Also group deck cards to determine -All availability (remove from deck to pool)
            const deckCardsAll = Object.entries(cardPositions)
              .filter(([_, position]) => position.section === 'deck' && position.visible && !position.card.isBase && !position.card.isLeader && position.enabled !== false)
              .map(([cardId, position]) => ({ cardId, position }))
            const deckGroups = {}
            deckCardsAll.forEach(({ cardId, position }) => {
              const key = getGroupKey(position.card)
              if (!deckGroups[key]) deckGroups[key] = []
              deckGroups[key].push({ cardId, position })
            })

            // Sort group keys
            const sortedKeys = sortGroupKeys(Object.keys(groups), poolSortOption, '8+')

            // Helper to determine if a group key is a mono-aspect (single primary color)
            const isMonoAspect = (key) => {
              if (poolSortOption !== 'aspect') return false
              // Check if it's a single primary aspect (Vigilance, Command, Aggression, Cunning)
              return key === 'A_Vigilance' || key === 'B_Command' || key === 'C_Aggression' || key === 'D_Cunning'
            }

            // Toggle group expanded state
            const toggleGroupExpanded = (key) => {
              setPoolGroupsExpanded(prev => ({
                ...prev,
                [key]: prev[key] === false ? true : false // Default to true (expanded), toggle to false
              }))
            }

            // Check if group is expanded (default true)
            const isGroupExpanded = (key) => poolGroupsExpanded[key] !== false

            return (
              <div className="blocks-pool-row">
                {sideboardExpanded && sortedKeys.map(groupKey => {
                  const groupCards = groups[groupKey].sort(cardSortFn)
                  const groupedByName = groupCardsByName(groupCards)
                  const monoAspect = isMonoAspect(groupKey)
                  const expanded = isGroupExpanded(groupKey)

                  // Determine block class based on sort option
                  const blockTypeClass = poolSortOption === 'type' ? 'type-block' : poolSortOption === 'cost' ? 'cost-block' : 'aspect-block'

                  // Get matching deck cards for this group
                  const matchingDeckCards = deckGroups[groupKey] || []
                  // +All (add to deck): enabled if there are pool cards to move
                  const hasPoolCardsToMove = groupCards.length > 0
                  // -All (remove from deck to pool): enabled if there are matching deck cards
                  const hasDeckCardsToRemove = matchingDeckCards.length > 0

                  return (
                    <div key={groupKey} className={`card-block pool-group-block ${monoAspect ? 'mono-aspect' : ''} ${blockTypeClass} ${!expanded ? 'collapsed' : ''}`}>
                      <div
                        className="card-block-header"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <span
                          style={{ marginRight: '0.25rem', fontSize: '0.8rem', cursor: 'pointer' }}
                          onClick={() => toggleGroupExpanded(groupKey)}
                        >{expanded ? '▼' : '▶'}</span>
                        <span style={{ cursor: 'pointer', marginRight: '0.5rem' }} onClick={() => toggleGroupExpanded(groupKey)}>
                          <GroupHeader groupKey={groupKey} count={groupCards.length} sortOption={poolSortOption} getAspectSymbol={getAspectSymbol} />
                        </span>
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Move pool cards to deck
                            setCardPositions(prev => {
                              const updated = { ...prev }
                              groupCards.forEach(({ cardId }) => {
                                updated[cardId] = { ...updated[cardId], section: 'deck', enabled: true }
                              })
                              return updated
                            })
                          }}
                          className="add-all-button"
                          disabled={!hasPoolCardsToMove}
                        >
                          + All
                        </Button>
                        <Button
                          variant="danger"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Move matching deck cards to pool
                            setCardPositions(prev => {
                              const updated = { ...prev }
                              matchingDeckCards.forEach(({ cardId }) => {
                                updated[cardId] = { ...updated[cardId], section: 'sideboard', enabled: false }
                              })
                              return updated
                            })
                          }}
                          className="remove-all-button"
                          disabled={!hasDeckCardsToRemove}
                        >
                          - All
                        </Button>
                      </div>
                      {expanded && <div className="card-block-content">
                        <div className="cards-grid">
                          {groupedByName.map(group => renderCardStack(group, (cardEntry, stackIndex, isStacked) => {
                            const { cardId, position } = cardEntry
                            const card = position.card
                            const isSelected = selectedCards.has(cardId)
                            const isHovered = hoveredCard === cardId

                            const penalty = showAspectPenalties && leaderCard && baseCard ? calculateAspectPenalty(card, leaderCard, baseCard) : 0
                            return (
                              <Card
                                key={cardId}
                                card={card}
                                selected={isSelected}
                                hovered={isHovered}
                                stacked={isStacked}
                                stackIndex={stackIndex}
                                showPenalty={showAspectPenalties}
                                penaltyAmount={penalty}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (!e.shiftKey) {
                                    toggleCardSection(cardId)
                                  }
                                }}
                                onMouseEnter={(e) => {
                                  setHoveredCard(cardId)
                                  handleCardMouseEnter(position.card, e)
                                }}
                                onMouseLeave={() => {
                                  setHoveredCard(null)
                                  handleCardMouseLeave()
                                }}
                              />
                            )
                          }))}
                        </div>
                      </div>}
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
        </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="list-view" style={{ minHeight: '200px' }}>
          {/* Leaders Section */}
          {(() => {
            const leaderPositions = Object.entries(cardPositions)
              .filter(([_, pos]) => pos.section === 'leaders-bases' && pos.visible && pos.card.isLeader)
              .map(([cardId, pos]) => ({ cardId, card: pos.card, enabled: pos.enabled !== false }))

            // Always render the section, even if empty

            const sectionId = 'leaders'
            const sectionSort = tableSort[sectionId] || { field: null, direction: 'asc' }
            const sortedLeaders = [...leaderPositions].sort((a, b) => {
              if (!sectionSort.field) {
                return defaultSort(a.card, b.card)
              }
              return sortTableData(a.card, b.card, sectionSort.field, sectionSort.direction)
            })

            return (
              <div className="list-section">
                <h2
                  className="list-section-title"
                  onClick={() => setLeadersExpanded(!leadersExpanded)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ marginRight: '0.5rem' }}>{leadersExpanded ? '▼' : '▶'}</span>
                  Leaders ({leaderPositions.length})
                </h2>
                {leadersExpanded && leaderPositions.length > 0 && (
                  <table className="list-table">
                  <ListTableHeader
                    sectionId="leaders"
                    tableSort={tableSort}
                    onSort={handleTableSort}
                    columns={[
                      { field: 'name', label: 'Title' },
                      { field: 'cost', label: 'Cost' },
                      { field: 'aspects', label: 'Aspects' },
                      { field: 'rarity', label: 'Rarity' },
                    ]}
                    checkboxVisible={false}
                  />
                  <tbody>
                    {sortedLeaders.map(({ cardId, card, enabled }, idx) => {
                      const aspectSymbols = getAspectIcons(card)
                      const isSelected = activeLeader === cardId
                      return (
                        <tr
                          key={`leader-${cardId}-${idx}`}
                          onMouseEnter={(e) => {
                            setHoveredCard(cardId)
                            handleCardMouseEnter(card, e)
                          }}
                          onMouseLeave={() => {
                            setHoveredCard(null)
                            handleCardMouseLeave()
                          }}
                        >
                          <td>
                            <input
                              type="radio"
                              name="leader-selection"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setActiveLeader(cardId)
                                  if (poolSortOption === 'cost' || deckSortOption === 'cost') {
                                    setShowAspectPenalties(true)
                                  }
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
                              >
                                {card.name || 'Unknown'}
                              </div>
                              {card.subtitle && !card.isBase && (
                                <div className="card-name-subtitle">{card.subtitle}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            <CostIcon cost={card.cost} size={39} />
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

            // Always render the section, even if empty

            const sectionId = 'bases'
            const sectionSort = tableSort[sectionId] || { field: null, direction: 'asc' }
            const sortedBases = [...basePositions].sort((a, b) => {
              if (!sectionSort.field) {
                return defaultSort(a.card, b.card)
              }
              return sortTableData(a.card, b.card, sectionSort.field, sectionSort.direction)
            })

            return (
              <div className="list-section">
                <h2
                  className="list-section-title"
                  onClick={() => setBasesExpanded(!basesExpanded)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ marginRight: '0.5rem' }}>{basesExpanded ? '▼' : '▶'}</span>
                  Bases ({basePositions.length})
                </h2>
                {basesExpanded && basePositions.length > 0 && (
                  <table className="list-table">
                  <ListTableHeader
                    sectionId="bases"
                    tableSort={tableSort}
                    onSort={handleTableSort}
                    columns={[
                      { field: 'name', label: 'Title' },
                      { field: 'cost', label: 'Cost' },
                      { field: 'aspects', label: 'Aspects' },
                      { field: 'rarity', label: 'Rarity' },
                    ]}
                    checkboxVisible={false}
                  />
                  <tbody>
                    {sortedBases.map(({ cardId, card, enabled }, idx) => {
                      const aspectSymbols = getAspectIcons(card)
                      const isSelected = activeBase === cardId
                      return (
                        <tr
                          key={`base-${cardId}-${idx}`}
                          onMouseEnter={(e) => {
                            setHoveredCard(cardId)
                            handleCardMouseEnter(card, e)
                          }}
                          onMouseLeave={() => {
                            setHoveredCard(null)
                            handleCardMouseLeave()
                          }}
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
                              >
                                {card.name || 'Unknown'}
                              </div>
                              {card.subtitle && !card.isBase && (
                                <div className="card-name-subtitle">{card.subtitle}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            <CostIcon cost={card.cost} size={39} />
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
              .filter(([_, pos]) => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader && pos.enabled !== false)
              .map(([cardId, pos]) => ({ cardId, card: pos.card }))

            const sideboardCardPositions = Object.entries(cardPositions)
              .filter(([_, pos]) => (pos.section === 'sideboard' || pos.enabled === false) && pos.visible && !pos.card.isBase && !pos.card.isLeader)
              .map(([cardId, pos]) => ({ cardId, card: pos.card }))

            // Always render the pool section container, even if empty
            return (
              <div className="list-section">
                <h2 className="list-section-title">Pool</h2>

                {/* Deck Section */}
                <div className="pool-subsection">
                  <h3 className="pool-subsection-title" style={{ userSelect: 'none' }}>
                    Deck ({deckCardPositions.length})
                  </h3>
                  {deckCardPositions.length > 0 && (() => {
                    if (deckSortOption === 'cost') {
                        // Group by cost segments: 1, 2, 3, 4, 5, 6, 7, 8+
                        const costSegments = [1, 2, 3, 4, 5, 6, 7, '8+']
                        const groupedByCost = {}

                        // Initialize all cost segments (even if empty)
                        costSegments.forEach(segment => {
                          groupedByCost[segment] = []
                        })

                        // Group cards by cost segment
                        deckCardPositions.forEach(({ cardId, card }) => {
                          const cost = card.cost
                          let segment
                          if (cost === null || cost === undefined || cost === 0) {
                            segment = 1 // Default to 1 for cost 0 or null
                          } else if (cost >= 8) {
                            segment = '8+'
                          } else if (cost >= 1 && cost <= 7) {
                            segment = cost
                          } else {
                            segment = 1 // Default to 1 for any other edge cases
                          }
                          if (!groupedByCost[segment]) {
                            groupedByCost[segment] = []
                          }
                          groupedByCost[segment].push({ cardId, card })
                        })

                        // Render cost segments
                        return costSegments.map((costSegment) => {
                          const cards = groupedByCost[costSegment] || []
                          const isExpanded = deckCostSectionsExpanded[costSegment] !== false // Default to expanded

                          // Sort cards within this cost segment by aspect
                          const sectionId = `deck-cost-${costSegment}`
                          const sectionSort = tableSort[sectionId] || { field: null, direction: 'asc' }
                          const sortedCards = [...cards].sort((a, b) => {
                            if (sectionSort.field) {
                              return sortTableData(a.card, b.card, sectionSort.field, sectionSort.direction)
                            }
                            // Sort by aspect within cost segment
                            const keyA = getDefaultAspectSortKey(a.card)
                            const keyB = getDefaultAspectSortKey(b.card)
                            if (keyA !== keyB) return keyA.localeCompare(keyB)
                            return defaultSort(a.card, b.card)
                          })

                          // Check if all cards in this segment are enabled (in deck)
                          const allEnabled = sortedCards.length > 0 && sortedCards.every(({ cardId }) => {
                            const position = cardPositions[cardId]
                            return position && position.section === 'deck' && position.enabled !== false
                          })

                          return (
                            <div key={`cost-${costSegment}`} className="deck-aspect-subsection">
                              <h4
                                className="pool-subsection-title"
                                onClick={() => setDeckCostSectionsExpanded(prev => ({ ...prev, [costSegment]: !isExpanded }))}
                                style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                              >
                                <span>{isExpanded ? '▼' : '▶'}</span>
                                <CostIcon cost={costSegment} size={32} />
                                <span>({cards.length})</span>
                              </h4>
                              <div className={`list-section-content-wrapper ${isExpanded ? '' : 'collapsed'}`}>
                                <table className="list-table">
                                  <thead>
                                    <tr>
                                      <th className="checkbox-col">
                                        <input
                                          type="checkbox"
                                          checked={allEnabled}
                                          onChange={(e) => {
                                            const shouldEnable = e.target.checked
                                            setCardPositions(prev => {
                                              const updated = { ...prev }
                                              sortedCards.forEach(({ cardId }) => {
                                                updated[cardId] = {
                                                  ...prev[cardId],
                                                  section: shouldEnable ? 'deck' : 'sideboard',
                                                  enabled: shouldEnable,
                                                  x: 0,
                                                  y: 0
                                                }
                                              })
                                              return updated
                                            })
                                          }}
                                        />
                                      </th>
                                      <th className="sortable" onClick={() => handleTableSort(`deck-cost-${costSegment}`, 'name')}>
                                        Title {getSortArrow(`deck-cost-${costSegment}`, 'name')}
                                      </th>
                                      <th className="sortable" onClick={() => handleTableSort(`deck-cost-${costSegment}`, 'type')}>
                                        Type {getSortArrow(`deck-cost-${costSegment}`, 'type')}
                                      </th>
                                      <th className="sortable" onClick={() => handleTableSort(`deck-cost-${costSegment}`, 'cost')}>
                                        Cost {getSortArrow(`deck-cost-${costSegment}`, 'cost')}
                                      </th>
                                      <th className="sortable" onClick={() => handleTableSort(`deck-cost-${costSegment}`, 'aspects')}>
                                        Aspects {getSortArrow(`deck-cost-${costSegment}`, 'aspects')}
                                      </th>
                                      <th className="sortable" onClick={() => handleTableSort(`deck-cost-${costSegment}`, 'rarity')}>
                                        Rarity {getSortArrow(`deck-cost-${costSegment}`, 'rarity')}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sortedCards.map(({ cardId, card }, idx) => {
                                      const aspectSymbols = getAspectIcons(card)
                                      return (
                                        <tr
                                          key={`deck-cost-${costSegment}-${cardId}-${idx}`}
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
                                                onMouseEnter={(e) => {
                                                  setHoveredCard(cardId)
                                                  handleCardMouseEnter(card, e)
                                                }}
                                                onMouseLeave={() => {
                                                  setHoveredCard(null)
                                                  handleCardMouseLeave()
                                                }}
                                              >
                                                {card.name || 'Unknown'}
                                              </div>
                                              {card.subtitle && !card.isBase && (
                                                <div className="card-name-subtitle">{card.subtitle}</div>
                                              )}
                                            </div>
                                          </td>
                                          <td>
                                            {getFormattedType(card)}
                                          </td>
                                          <td>
                                            <CostIcon cost={card.cost} size={39} />
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
                      } else {
                        // Aspect sort
                        // Define all possible aspect combinations in order
                        const aspectOrder = [
                          'vigilance_villainy', 'vigilance_heroism', 'vigilance_vigilance', 'vigilance',
                          'command_villainy', 'command_heroism', 'command_command', 'command',
                          'aggression_villainy', 'aggression_heroism', 'aggression_aggression', 'aggression',
                          'cunning_villainy', 'cunning_heroism', 'cunning_cunning', 'cunning',
                          'villainy', 'heroism', 'villainy_heroism', 'neutral'
                        ]

                        // Initialize all aspect combinations (even if empty)
                        const groupedByAspect = {}
                        aspectOrder.forEach(key => {
                          groupedByAspect[key] = []
                        })

                        // Group cards by aspect combination
                        deckCardPositions.forEach(({ cardId, card }) => {
                          const aspectKey = getAspectCombinationKey(card)
                          if (!groupedByAspect[aspectKey]) {
                            groupedByAspect[aspectKey] = []
                          }
                          groupedByAspect[aspectKey].push({ cardId, card })
                        })

                        // Filter to show segments that have cards OR have sideborded cards that could be restored
                        const sortedAspectKeys = aspectOrder.filter(aspectKey => {
                          const cards = groupedByAspect[aspectKey] || []
                          const hasSideboardCards = sideboardCardPositions.some(({ card }) =>
                            getAspectCombinationKey(card) === aspectKey
                          )
                          return cards.length > 0 || hasSideboardCards
                        })

                        return sortedAspectKeys.map((aspectKey) => {
                          const cards = groupedByAspect[aspectKey] || []
                          const isExpanded = deckAspectSectionsExpanded[aspectKey] !== false // Default to expanded
                          const displayName = getAspectCombinationDisplayName(aspectKey)

                          // Sort cards within this aspect combination
                          // Create a copy to avoid mutating the original array
                          const sectionId = `deck-aspect-${aspectKey}`
                          const sectionSort = tableSort[sectionId] || { field: null, direction: 'asc' }
                          const sortedCards = [...cards].sort((a, b) => {
                            if (sectionSort.field) {
                              return sortTableData(a.card, b.card, sectionSort.field, sectionSort.direction)
                            }
                            return defaultSort(a.card, b.card)
                          })

                          // Check if all cards in this segment are enabled (in deck)
                          const allEnabled = sortedCards.length > 0 && sortedCards.every(({ cardId }) => {
                            const position = cardPositions[cardId]
                            return position && position.section === 'deck' && position.enabled !== false
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
                                        <input
                                          type="checkbox"
                                          checked={allEnabled}
                                          onChange={(e) => {
                                            const shouldEnable = e.target.checked
                                            setCardPositions(prev => {
                                              const updated = { ...prev }

                                              // If section is empty and we're enabling, restore all cards from sideboard
                                              if (sortedCards.length === 0 && shouldEnable) {
                                                // Find all cards in sideboard that match this aspect combination
                                                Object.entries(prev).forEach(([cardId, position]) => {
                                                  if ((position.section === 'sideboard' || position.enabled === false) &&
                                                      position.visible &&
                                                      !position.card.isBase &&
                                                      !position.card.isLeader &&
                                                      getAspectCombinationKey(position.card) === aspectKey) {
                                                    updated[cardId] = {
                                                      ...position,
                                                      section: 'deck',
                                                      enabled: true,
                                                      x: 0,
                                                      y: 0
                                                    }
                                                  }
                                                })
                                              } else {
                                                // Normal behavior: toggle existing cards
                                                sortedCards.forEach(({ cardId }) => {
                                                  updated[cardId] = {
                                                    ...prev[cardId],
                                                    section: shouldEnable ? 'deck' : 'sideboard',
                                                    enabled: shouldEnable,
                                                    x: 0,
                                                    y: 0
                                                  }
                                                })
                                              }

                                              return updated
                                            })
                                          }}
                                        />
                                      </th>
                                      <th className="sortable" onClick={() => handleTableSort(`deck-aspect-${aspectKey}`, 'name')}>
                                        Title {getSortArrow(`deck-aspect-${aspectKey}`, 'name')}
                                      </th>
                                      <th className="sortable" onClick={() => handleTableSort(`deck-aspect-${aspectKey}`, 'type')}>
                                        Type {getSortArrow(`deck-aspect-${aspectKey}`, 'type')}
                                      </th>
                                      <th className="sortable" onClick={() => handleTableSort(`deck-aspect-${aspectKey}`, 'cost')}>
                                        Cost {getSortArrow(`deck-aspect-${aspectKey}`, 'cost')}
                                      </th>
                                      <th className="sortable" onClick={() => handleTableSort(`deck-aspect-${aspectKey}`, 'aspects')}>
                                        Aspects {getSortArrow(`deck-aspect-${aspectKey}`, 'aspects')}
                                      </th>
                                      <th className="sortable" onClick={() => handleTableSort(`deck-aspect-${aspectKey}`, 'rarity')}>
                                        Rarity {getSortArrow(`deck-aspect-${aspectKey}`, 'rarity')}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sortedCards.map(({ cardId, card }, idx) => {
                                      const aspectSymbols = getAspectIcons(card)
                                      return (
                                        <tr
                                          key={`deck-${aspectKey}-${cardId}-${idx}`}
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
                                                onMouseEnter={(e) => {
                                                  setHoveredCard(cardId)
                                                  handleCardMouseEnter(card, e)
                                                }}
                                                onMouseLeave={() => {
                                                  setHoveredCard(null)
                                                  handleCardMouseLeave()
                                                }}
                                              >
                                                {card.name || 'Unknown'}
                                              </div>
                                              {card.subtitle && !card.isBase && (
                                                <div className="card-name-subtitle">{card.subtitle}</div>
                                              )}
                                            </div>
                                          </td>
                                          <td>
                                            {getFormattedType(card)}
                                          </td>
                                          <td>
                                            <CostIcon cost={card.cost} size={39} />
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
                      }
                    })()}
                </div>

                {/* Sideboard Section */}
                <div className="pool-subsection">
                  <h3 className="pool-subsection-title" style={{ userSelect: 'none' }}>
                    {isDraftMode ? 'Card Pool' : 'Sideboard'} ({sideboardCardPositions.length})
                  </h3>
                  {(() => {
                    const sectionId = 'sideboard'
                    const sectionSort = tableSort[sectionId] || { field: null, direction: 'asc' }
                    const sortedSideboard = [...sideboardCardPositions].sort((a, b) => {
                      if (!sectionSort.field) {
                        return defaultSort(a.card, b.card)
                      }
                      return sortTableData(a.card, b.card, sectionSort.field, sectionSort.direction)
                    })

                    return sortedSideboard.length > 0 ? (
                      <table className="list-table">
                        <thead>
                          <tr>
                            <th className="checkbox-col">
                              <input
                                type="checkbox"
                                checked={false}
                                onChange={(e) => {
                                  const shouldEnable = e.target.checked
                                  setCardPositions(prev => {
                                    const updated = { ...prev }
                                    sideboardCardPositions.forEach(({ cardId }) => {
                                      updated[cardId] = {
                                        ...prev[cardId],
                                        section: shouldEnable ? 'deck' : 'sideboard',
                                        enabled: shouldEnable,
                                        x: 0,
                                        y: 0
                                      }
                                    })
                                    return updated
                                  })
                                }}
                              />
                            </th>
                            <th className="sortable" onClick={() => handleTableSort('sideboard', 'name')}>
                              Title {getSortArrow('sideboard', 'name')}
                            </th>
                            <th className="sortable" onClick={() => handleTableSort('sideboard', 'cost')}>
                              Cost {getSortArrow('sideboard', 'cost')}
                            </th>
                            <th className="sortable" onClick={() => handleTableSort('sideboard', 'aspects')}>
                              Aspects {getSortArrow('sideboard', 'aspects')}
                            </th>
                            <th className="sortable" onClick={() => handleTableSort('sideboard', 'rarity')}>
                              Rarity {getSortArrow('sideboard', 'rarity')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedSideboard.map(({ cardId, card }, idx) => {
                          const aspectSymbols = getAspectIcons(card)
                          return (
                            <tr
                              key={`sideboard-${cardId}-${idx}`}
                              onMouseEnter={(e) => {
                                setHoveredCard(cardId)
                                handleCardMouseEnter(card, e)
                              }}
                              onMouseLeave={() => {
                                setHoveredCard(null)
                                handleCardMouseLeave()
                              }}
                            >
                              <td>
                                <input
                                  type="checkbox"
                                  checked={false}
                                  onChange={(e) => {
                                    setCardPositions(prev => ({
                                      ...prev,
                                      [cardId]: { ...prev[cardId], section: 'deck', enabled: true, x: 0, y: 0 }
                                    }))
                                  }}
                                />
                              </td>
                              <td>
                                <div className="card-name-cell">
                                  <div
                                    className="card-name-main"
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {card.name || 'Unknown'}
                                  </div>
                                  {card.subtitle && !card.isBase && (
                                    <div className="card-name-subtitle">{card.subtitle}</div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <CostIcon cost={card.cost} size={39} />
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
                    ) : null
                  })()}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Enlarged card preview (3x size) */}
      {hoveredCardPreview && (
        <CardPreview
          card={hoveredCardPreview.card}
          x={hoveredCardPreview.x}
          y={hoveredCardPreview.y}
          onMouseEnter={handlePreviewMouseEnter}
          onMouseLeave={handlePreviewMouseLeave}
        />
      )}

      {tooltip.show && (
        <div
          className="tooltip"
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: tooltip.alignLeft
              ? 'translateX(-100%) translateY(-50%)'
              : 'translateX(-50%) translateY(-100%)',
            zIndex: 10000,
            pointerEvents: 'none',
            marginTop: tooltip.alignLeft ? '0' : '-8px',
            ...(tooltip.marginRight && { marginRight: tooltip.marginRight })
          }}
        >
          {tooltip.text}
        </div>
      )}

      {deckImageModal && (
        <div className="deck-image-modal-overlay" onClick={() => {
          URL.revokeObjectURL(deckImageModal)
          setDeckImageModal(null)
        }}>
          <div className="deck-image-modal-content" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="icon"
              size="sm"
              className="deck-image-modal-close"
              onClick={() => {
                URL.revokeObjectURL(deckImageModal)
                setDeckImageModal(null)
              }}
            >
              ×
            </Button>
            <img
              src={deckImageModal}
              alt="Deck Export"
              className="deck-image-modal-image"
            />
            <div className="deck-image-modal-actions">
              <Button
                variant="primary"
                className="deck-image-modal-download"
                onClick={() => {
                  const a = document.createElement('a')
                  a.href = deckImageModal

                  // Generate filename with pool name and timestamp
                  const now = new Date()
                  const month = String(now.getMonth() + 1).padStart(2, '0')
                  const day = String(now.getDate()).padStart(2, '0')
                  let hours = now.getHours()
                  const minutes = String(now.getMinutes()).padStart(2, '0')
                  const ampm = hours >= 12 ? 'PM' : 'AM'
                  hours = hours % 12
                  hours = hours ? hours : 12
                  const timeStr = `${month}${day}_${hours}${minutes}${ampm}`

                  const displayName = currentPoolName || `${setCode} ${poolType === 'draft' ? 'Draft' : 'Sealed'}`
                  // Sanitize filename - remove invalid characters
                  const sanitizedName = displayName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
                  const prefix = poolType === 'draft' ? 'ptp_draft' : 'ptp_sealed'

                  a.download = `${prefix}_${sanitizedName}_${timeStr}.png`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                }}
              >
                Download Image
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Deck Button - only show for owner */}
      {shareId && isOwner && (
        <div className="delete-deck-section">
          <hr className="delete-deck-divider" />
          <Button
            variant="danger"
            className="delete-deck-button"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Delete Deck
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => !isDeleting && setShowDeleteConfirm(false)}
        title="Delete Deck?"
        variant="danger"
      >
        <Modal.Body>
          <p>Are you sure you want to delete this deck? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Actions>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              setIsDeleting(true)
              try {
                await deletePool(shareId)
                window.location.href = '/history'
              } catch (err) {
                console.error('Failed to delete:', err)
                setErrorMessage('Failed to delete deck')
                setMessageType('error')
                setShowDeleteConfirm(false)
                setIsDeleting(false)
              }
            }}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Actions>
      </Modal>
      </div>
    </div>
  )
}

export default DeckBuilder
