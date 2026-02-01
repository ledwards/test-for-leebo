import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import './DeckBuilder.css'
import './AspectIcons.css'
import DeckBuilderContext from '../contexts/DeckBuilderContext'
import { getCachedCards, isCacheInitialized, initializeCardCache } from '../utils/cardCache'
import { buildBaseCardMap as buildBaseCardMapUtil, getBaseCardId as getBaseCardIdUtil } from '../utils/variantDowngrade'
import { fetchSetCards } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { jsonParse } from '../utils/json'
import { calculateAspectPenalty } from '../services/cards/aspectPenalties'
import {
  getAspectSortKey,
  compareByAspectTypeCostName,
} from '../services/cards/cardSorting'
import { updatePool } from '../utils/poolApi'
import { getPackArtUrl } from '../utils/packArt'
import Card from './Card'
import { CardPreview } from './DeckBuilder/CardPreview'
import { LeaderBaseSelector } from './DeckBuilder/LeaderBaseSelector'
import { SectionHeader } from './DeckBuilder/SectionHeader'
import { DeckBuilderHeader } from './DeckBuilder/DeckBuilderHeader'
import { StickyInfoBar } from './DeckBuilder/StickyInfoBar'
import { PoolSection } from './DeckBuilder/PoolSection'
import { DeckSection } from './DeckBuilder/DeckSection'
import { SelectionListSection } from './DeckBuilder/SelectionListSection'
import { PoolListSection } from './DeckBuilder/PoolListSection'
import { Tooltip } from './DeckBuilder/Tooltip'
import { DeckImageModal } from './DeckBuilder/DeckImageModal'
import { DeleteDeckSection } from './DeckBuilder/DeleteDeckSection'
import { ViewModeToggle } from './DeckBuilder/ViewModeToggle'
import { CollapsibleSectionHeader } from './DeckBuilder/CollapsibleSectionHeader'
import { getTypeStringOrder } from '../utils/cardSort'
import { useDeckExport } from '../hooks/useDeckExport'
import { useDragAndDrop } from '../hooks/useDragAndDrop'
import { useCardPreview } from '../hooks/useCardPreview'
import { useTooltip } from '../hooks/useTooltip'
import {
  getAspectCombinationKey as getAspectCombinationKeyUtil,
  getAspectCombinationDisplayName as getAspectCombinationDisplayNameUtil,
  getAspectKey as getAspectKeyUtil,
} from '../utils/aspectCombinations'

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
  const deckBlocksRowRef = useRef(null)
  const [activeLeader, setActiveLeader] = useState(null)
  const [activeBase, setActiveBase] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [messageType, setMessageType] = useState(null) // 'error' or 'success'
  const [isInfoBarSticky, setIsInfoBarSticky] = useState(false)
  const [showAspectPenalties, setShowAspectPenalties] = useState(false)

  // Memoized active leader and base cards (derived from cardPositions)
  const leaderCard = useMemo(() => {
    return activeLeader && cardPositions[activeLeader] ? cardPositions[activeLeader].card : null
  }, [activeLeader, cardPositions])

  const baseCard = useMemo(() => {
    return activeBase && cardPositions[activeBase] ? cardPositions[activeBase].card : null
  }, [activeBase, cardPositions])

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

    // Only update if at least one is selected
    if (leaderCard || baseCard) {
      updatePoolName(leaderCard, baseCard)
    }
  }, [leaderCard, baseCard, shareId, poolCreatedAt, updatePoolName])
  const [deckImageModal, setDeckImageModal] = useState(null) // URL for deck image modal
  const modalHoverTimeoutRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const infoBarRef = useRef(null)

  // Drag and drop handling
  const {
    draggedCard,
    selectedCards,
    setSelectedCards,
    selectionBox,
    isSelecting,
    handleMouseDown,
    handleCanvasMouseDown,
  } = useDragAndDrop({
    cardPositions,
    setCardPositions,
    sectionBounds,
    activeLeader,
    setActiveLeader,
    activeBase,
    setActiveBase,
    poolSortOption,
    deckSortOption,
    setShowAspectPenalties,
    setHoveredCard,
    canvasRef,
  })

  // Card preview handling
  const {
    hoveredCardPreview,
    handleCardMouseEnter,
    handleCardMouseLeave,
    handlePreviewMouseEnter,
    handlePreviewMouseLeave,
  } = useCardPreview()

  // Tooltip handling
  const {
    tooltip,
    showTooltip,
    showNavTooltip,
    hideTooltip,
    handleLongPress,
    cancelLongPress,
  } = useTooltip()

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

  // Bulk move helpers for +All/-All buttons
  const moveCardsToDeck = useCallback((cardIds) => {
    setCardPositions(prev => {
      const updated = { ...prev }
      cardIds.forEach(cardId => {
        updated[cardId] = { ...updated[cardId], section: 'deck', enabled: true }
      })
      return updated
    })
  }, [])

  const moveCardsToPool = useCallback((cardIds) => {
    setCardPositions(prev => {
      const updated = { ...prev }
      cardIds.forEach(cardId => {
        updated[cardId] = { ...updated[cardId], section: 'sideboard', enabled: false }
      })
      return updated
    })
  }, [])

  // Cleanup modal hover timeout
  useEffect(() => {
    return () => {
      if (modalHoverTimeoutRef.current) {
        clearTimeout(modalHoverTimeoutRef.current)
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
  }, [aspectFilters, leaderCard, baseCard, inAspectFilter, outAspectFilter])

  // Use imported getAspectSortKey from cardSorting service
  const getDefaultAspectSortKey = useCallback(getAspectSortKey, [])

  // Get aspect combination grouping key (uses utility function)
  const getAspectCombinationKey = useCallback(getAspectCombinationKeyUtil, [])

  // Get display name for aspect combination (uses utility function)
  const getAspectCombinationDisplayName = useCallback(getAspectCombinationDisplayNameUtil, [])

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

  // Get aspect combination key for sorting (uses utility function)
  const getAspectKey = useCallback(getAspectKeyUtil, [])

  // Sort cards (only from deck section, excluding bases and leaders)
  // Note: No longer filtering - cards are moved between deck/sideboard via filter checkboxes
  const getFilteredAndSortedCards = useCallback(() => {
    const allCards = Object.values(cardPositions)
      .filter(pos => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader && pos.enabled !== false)
      .map(pos => pos.card)

    // Get effective cost including aspect penalty
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
  }, [cardPositions, deckSortOption, getAspectKey, getDefaultAspectSortKey, showAspectPenalties, leaderCard, baseCard])

  // Helper to filter and map deck cards
  const getDeckCards = useCallback(() => {
    return Object.entries(cardPositions)
      .filter(([_, pos]) => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader && pos.enabled !== false)
      .map(([cardId, position]) => ({ cardId, position }))
  }, [cardPositions])

  // Helper to filter and map pool/sideboard cards
  const getPoolCards = useCallback(() => {
    return Object.entries(cardPositions)
      .filter(([_, pos]) => (pos.section === 'sideboard' || pos.enabled === false) && pos.visible && !pos.card.isBase && !pos.card.isLeader)
      .map(([cardId, position]) => ({ cardId, position }))
  }, [cardPositions])

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

  // Get common Card props for a card entry
  const getCardEventHandlers = useCallback((cardId, card) => ({
    onClick: (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (!e.shiftKey) {
        toggleCardSection(cardId)
      }
    },
    onMouseEnter: (e) => {
      setHoveredCard(cardId)
      handleCardMouseEnter(card, e)
    },
    onMouseLeave: () => {
      setHoveredCard(null)
      handleCardMouseLeave()
    }
  }), [toggleCardSection, handleCardMouseEnter, handleCardMouseLeave])

  // Factory for card render callbacks used in renderCardStack
  const createCardRenderer = useCallback((leaderCardRef, baseCardRef, { showDisabled = false } = {}) => {
    return (cardEntry, stackIndex, isStacked) => {
      const { cardId, position } = cardEntry
      const card = position.card
      const isSelected = selectedCards.has(cardId)
      const isHovered = hoveredCard === cardId
      const isDisabled = showDisabled && !position.enabled
      const penalty = showAspectPenalties && leaderCardRef && baseCardRef
        ? calculateAspectPenalty(card, leaderCardRef, baseCardRef)
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
          showPenalty={showAspectPenalties && leaderCardRef && baseCardRef}
          penaltyAmount={penalty}
          {...getCardEventHandlers(cardId, position.card)}
        />
      )
    }
  }, [selectedCards, hoveredCard, showAspectPenalties, getCardEventHandlers])

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
  }, [cardPositions, leaderCard, baseCard]) // Only depend on these to avoid infinite loops

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

  // Export functions (JSON, clipboard, image)
  const { exportJSON, copyJSON, exportDeckImage } = useDeckExport({
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
  })

  const packArtUrl = setCode ? getPackArtUrl(setCode) : null
  const setArtStyle = packArtUrl ? {
    backgroundImage: `url("${packArtUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
  } : {}

  // Context value for child components
  const contextValue = useMemo(() => ({
    // Core state
    cardPositions,
    setCardPositions,
    activeLeader,
    setActiveLeader,
    activeBase,
    setActiveBase,
    // Derived cards
    leaderCard,
    baseCard,
    // Selection
    selectedCards,
    setSelectedCards,
    hoveredCard,
    setHoveredCard,
    // Filter state
    filterAspectsExpanded,
    setFilterAspectsExpanded,
    deckFilterOpen,
    setDeckFilterOpen,
    poolFilterOpen,
    setPoolFilterOpen,
    // UI preferences
    showAspectPenalties,
    setShowAspectPenalties,
    viewMode,
    setViewMode,
    poolSortOption,
    setPoolSortOption,
    deckSortOption,
    setDeckSortOption,
    // Actions
    toggleCardSection,
    moveCardsToDeck,
    moveCardsToPool,
  }), [
    cardPositions, activeLeader, activeBase, leaderCard, baseCard,
    selectedCards, hoveredCard, filterAspectsExpanded, deckFilterOpen,
    poolFilterOpen, showAspectPenalties, viewMode, poolSortOption,
    deckSortOption, toggleCardSection, moveCardsToDeck, moveCardsToPool,
  ])

  return (
    <DeckBuilderContext.Provider value={contextValue}>
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

      <ViewModeToggle
        viewMode={viewMode}
        setViewMode={setViewMode}
        showNavTooltip={showNavTooltip}
        hideTooltip={hideTooltip}
      />

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="blocks-container">
          <CollapsibleSectionHeader
            title="Leaders & Bases"
            expanded={leadersBasesExpanded}
            onToggle={() => setLeadersBasesExpanded(!leadersBasesExpanded)}
          />

          {/* Leaders and Bases - only show when parent is expanded */}
          {leadersBasesExpanded && (
            <LeaderBaseSelector
              leadersExpanded={leadersExpanded}
              setLeadersExpanded={setLeadersExpanded}
              basesExpanded={basesExpanded}
              setBasesExpanded={setBasesExpanded}
              onCardMouseEnter={handleCardMouseEnter}
              onCardMouseLeave={handleCardMouseLeave}
            />
          )}

          {/* Deck and Pool sections wrapper - allows reordering via CSS */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DeckSection
              getDeckCards={getDeckCards}
              getPoolCards={getPoolCards}
              groupCardsByName={groupCardsByName}
              renderCardStack={renderCardStack}
              createCardRenderer={createCardRenderer}
              getAspectSymbol={getAspectSymbol}
              getDefaultAspectSortKey={getDefaultAspectSortKey}
              getAspectKey={getAspectKey}
              deckExpanded={deckExpanded}
              setDeckExpanded={setDeckExpanded}
              deckGroupsExpanded={deckGroupsExpanded}
              setDeckGroupsExpanded={setDeckGroupsExpanded}
              deckFilterOpen={deckFilterOpen}
              setDeckFilterOpen={setDeckFilterOpen}
              setPoolFilterOpen={setPoolFilterOpen}
              setFilterAspectsExpanded={setFilterAspectsExpanded}
              deckBlocksRowRef={deckBlocksRowRef}
            />
            <PoolSection
              getPoolCards={getPoolCards}
              getDeckCards={getDeckCards}
              groupCardsByName={groupCardsByName}
              renderCardStack={renderCardStack}
              createCardRenderer={createCardRenderer}
              getAspectSymbol={getAspectSymbol}
              getDefaultAspectSortKey={getDefaultAspectSortKey}
              getAspectKey={getAspectKey}
              sideboardExpanded={sideboardExpanded}
              setSideboardExpanded={setSideboardExpanded}
              poolGroupsExpanded={poolGroupsExpanded}
              setPoolGroupsExpanded={setPoolGroupsExpanded}
              poolFilterOpen={poolFilterOpen}
              setPoolFilterOpen={setPoolFilterOpen}
              setDeckFilterOpen={setDeckFilterOpen}
              setFilterAspectsExpanded={setFilterAspectsExpanded}
            />
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="list-view" style={{ minHeight: '200px' }}>
          {/* Leaders Section */}
          <SelectionListSection
            title="Leaders"
            sectionId="leaders"
            radioName="leader-selection"
            positions={Object.entries(cardPositions)
              .filter(([_, pos]) => pos.section === 'leaders-bases' && pos.visible && pos.card.isLeader)
              .map(([cardId, pos]) => ({ cardId, card: pos.card }))}
            selectedId={activeLeader}
            onSelect={(cardId) => {
              setActiveLeader(cardId)
              if (cardId && (poolSortOption === 'cost' || deckSortOption === 'cost')) {
                setShowAspectPenalties(true)
              }
            }}
            tableSort={tableSort}
            onSort={handleTableSort}
            defaultSort={defaultSort}
            sortTableData={sortTableData}
            expanded={leadersExpanded}
            onToggleExpanded={() => setLeadersExpanded(!leadersExpanded)}
            getAspectIcons={getAspectIcons}
            onCardHover={(cardId, card, e) => {
              setHoveredCard(cardId)
              handleCardMouseEnter(card, e)
            }}
            onCardLeave={() => {
              setHoveredCard(null)
              handleCardMouseLeave()
            }}
          />

          {/* Bases Section */}
          <SelectionListSection
            title="Bases"
            sectionId="bases"
            radioName="base-selection"
            positions={Object.entries(cardPositions)
              .filter(([_, pos]) => pos.section === 'leaders-bases' && pos.visible && pos.card.isBase)
              .map(([cardId, pos]) => ({ cardId, card: pos.card }))}
            selectedId={activeBase}
            onSelect={setActiveBase}
            tableSort={tableSort}
            onSort={handleTableSort}
            defaultSort={defaultSort}
            sortTableData={sortTableData}
            expanded={basesExpanded}
            onToggleExpanded={() => setBasesExpanded(!basesExpanded)}
            getAspectIcons={getAspectIcons}
            onCardHover={(cardId, card, e) => {
              setHoveredCard(cardId)
              handleCardMouseEnter(card, e)
            }}
            onCardLeave={() => {
              setHoveredCard(null)
              handleCardMouseLeave()
            }}
          />

          {/* Pool Section - Deck and Sideboard */}
          <PoolListSection
            cardPositions={cardPositions}
            setCardPositions={setCardPositions}
            deckSortOption={deckSortOption}
            isDraftMode={isDraftMode}
            tableSort={tableSort}
            handleTableSort={handleTableSort}
            defaultSort={defaultSort}
            sortTableData={sortTableData}
            getAspectIcons={getAspectIcons}
            getDefaultAspectSortKey={getDefaultAspectSortKey}
            getFormattedType={getFormattedType}
            getAspectCombinationKey={getAspectCombinationKey}
            getAspectCombinationDisplayName={getAspectCombinationDisplayName}
            getAspectCombinationIcons={getAspectCombinationIcons}
            deckCostSectionsExpanded={deckCostSectionsExpanded}
            setDeckCostSectionsExpanded={setDeckCostSectionsExpanded}
            deckAspectSectionsExpanded={deckAspectSectionsExpanded}
            setDeckAspectSectionsExpanded={setDeckAspectSectionsExpanded}
            onCardHover={(cardId, card, e) => {
              setHoveredCard(cardId)
              handleCardMouseEnter(card, e)
            }}
            onCardLeave={() => {
              setHoveredCard(null)
              handleCardMouseLeave()
            }}
          />
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

      <Tooltip tooltip={tooltip} />

      <DeckImageModal
        imageUrl={deckImageModal}
        onClose={() => setDeckImageModal(null)}
        poolName={currentPoolName}
        setCode={setCode}
        poolType={poolType}
      />

      <DeleteDeckSection
        shareId={shareId}
        isOwner={isOwner}
        setErrorMessage={setErrorMessage}
        setMessageType={setMessageType}
      />
      </div>
    </div>
    </DeckBuilderContext.Provider>
  )
}

export default DeckBuilder
