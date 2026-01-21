import { useState, useEffect, useRef } from 'react'
import './SealedPod.css'
import { getCachedCards, isCacheInitialized } from '../utils/cardCache'
import { fetchSetCards } from '../utils/api'
import { generateSealedPod } from '../utils/boosterPack'
import { getDistributionPeriod, DISTRIBUTION_PERIODS, allowsSpecialInFoil } from '../utils/rarityConfig'
import { savePool } from '../utils/poolApi'
import { useAuth } from '../contexts/AuthContext'
import { getSetConfig } from '../utils/setConfigs'
import { getPackArtUrl } from '../utils/packArt'
import CardModal from './CardModal'

// Helper function to get set name from set code
function getSetName(setCode) {
  const config = getSetConfig(setCode)
  return config?.setName || setCode
}

// Helper function to get set color from set code
function getSetColor(setCode) {
  const config = getSetConfig(setCode)
  return config?.color || '#ffffff'
}

function SealedPod({ setCode, onBack, onBuildDeck, onPacksGenerated, initialPacks = null, shareId = null, poolType = 'sealed', setName = null, poolName = null, createdAt = null, isLoading = false }) {
  const { user } = useAuth()
  const [cards, setCards] = useState([])
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [hoveredCardPreview, setHoveredCardPreview] = useState(null) // { card, x, y } for enlarged preview
  const [savedShareId, setSavedShareId] = useState(shareId)
  const [saving, setSaving] = useState(false)
  const previewTimeoutRef = useRef(null)
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 })
  const tooltipTimeoutRef = useRef(null)

  useEffect(() => {
    // Skip loading cards if we have initialPacks (pool data from URL)
    if (initialPacks && initialPacks.length > 0) {
      // Extract cards from packs for card lookup/display purposes
      const allCardsFromPacks = initialPacks.flatMap(pack => pack.cards)
      setCards(allCardsFromPacks)
      setError(null) // Clear any error since we have pool data
      setLoading(false)
      return
    }

    const loadCards = async () => {
      try {
        setLoading(true)

        // First try to get from cache (fast, no loading)
        let cardsData = []
        if (isCacheInitialized()) {
          cardsData = getCachedCards(setCode)
        }

        // If cache doesn't have cards, try API as fallback
        if (cardsData.length === 0) {
          cardsData = await fetchSetCards(setCode)
        }

        if (cardsData.length === 0) {
          // Only set error if we don't have initialPacks (which means we have pool data)
          // If we have initialPacks, we don't need cards from cache/API
          if (!initialPacks || initialPacks.length === 0) {
            setError(`No card data available for set ${setCode}. Please populate src/data/cards.json with card data.`)
          }
          setCards([])
        } else {
          setCards(cardsData)
        }
      } catch (err) {
        // Only set error if we don't have initialPacks
        if (!initialPacks || initialPacks.length === 0) {
          setError(err.message)
        }
        setCards([])
      } finally {
        setLoading(false)
      }
    }
    loadCards()
  }, [setCode, initialPacks])

  // Cleanup preview timeout
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current)
      }
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
    }
  }, [])

  // Tooltip handlers
  const showTooltip = (text, event) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
    }
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({
      show: true,
      text,
      x: rect.left,
      y: rect.top + rect.height / 2,
      alignLeft: true
    })
    // Auto-hide after 2 seconds
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltip({ show: false, text: '', x: 0, y: 0, alignLeft: false })
    }, 2000)
  }

  const hideTooltip = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
      tooltipTimeoutRef.current = null
    }
    setTooltip({ show: false, text: '', x: 0, y: 0, alignLeft: false })
  }

  useEffect(() => {
    // If initialPacks provided (from URL), use those
    if (initialPacks && initialPacks.length > 0) {
      setPacks(initialPacks)
      setLoading(false)
      return
    }

    // Check if we have saved packs in sessionStorage
    const savedSealedPod = sessionStorage.getItem('sealedPod')
    if (savedSealedPod) {
      try {
        const data = JSON.parse(savedSealedPod)
        if (data.setCode === setCode && data.packs) {
          setPacks(data.packs)
          setLoading(false)
          return
        }
      } catch (e) {
        console.error('Failed to load saved sealed pod:', e)
      }
    }

    // Generate new packs if no saved data
    if (cards.length > 0) {
      const generatedPacks = generateSealedPod(cards, setCode)
      setPacks(generatedPacks)
      // Notify parent to save
      if (onPacksGenerated) {
        onPacksGenerated(generatedPacks, setCode)
      }
      // Auto-save to database if user is logged in
      autoSavePool(generatedPacks, setCode)
    }
  }, [cards, setCode, onPacksGenerated, initialPacks])

  // Auto-save pool to database when packs are generated
  const autoSavePool = async (generatedPacks, setCode) => {
    if (!user || savedShareId) {
      // Don't save if not logged in or already saved
      return
    }

    try {
      setSaving(true)
      const allCards = generatedPacks.flatMap(pack => pack.cards)
      const poolData = {
        setCode,
        cards: allCards,
        packs: generatedPacks,
        poolType: 'sealed',
        isPublic: false,
      }

      const saved = await savePool(poolData)
      setSavedShareId(saved.shareId)

      // Update URL without page reload
      const newUrl = `/pool/${saved.shareId}`
      window.history.replaceState({}, '', newUrl)

      console.log('Pool saved:', saved.shareId)
    } catch (error) {
      console.error('Failed to auto-save pool:', error)
      // Don't show error to user - silent fail is okay
    } finally {
      setSaving(false)
    }
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

  // Show loading placeholder for packs if isLoading prop is true
  const showPacksLoading = isLoading && (!packs || packs.length === 0)

  const packArtUrl = setCode ? getPackArtUrl(setCode) : null
  const setArtStyle = packArtUrl ? {
    backgroundImage: `url("${packArtUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat'
  } : {}

  // Only show full loading screen if we're loading cards AND don't have initialPacks
  if (loading && !initialPacks && !isLoading) {
    return (
      <div className="sealed-pod">
        {packArtUrl && (
          <div className="set-art-header" style={setArtStyle}></div>
        )}
        <div className="sealed-pod-content">
          <div className="loading"></div>
        </div>
      </div>
    )
  }

  // Don't show error if:
  // 1. We have initialPacks (pool data from URL)
  // 2. We're still loading (isLoading)
  // 3. We have packs already loaded
  // Only show error if we don't have packs AND we're not loading AND we don't have initialPacks
  if ((error || cards.length === 0) && (!packs || packs.length === 0) && !isLoading && !initialPacks) {
    return (
      <div className="sealed-pod">
        {packArtUrl && (
          <div className="set-art-header" style={setArtStyle}></div>
        )}
        <div className="sealed-pod-content">
          <button className="back-button" onClick={onBack}>
            ← {poolType === 'draft' ? 'Back to Pod' : 'Back to Sets'}
          </button>
          <div className="error">
            <h2>No Card Data Available</h2>
            <p>{error || `No cards found for set ${setCode}.`}</p>
            <p>To use this app, you need to populate <code>src/data/cards.json</code> with card data.</p>
            <p>Each card should have the following structure:</p>
            <pre style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`{
  "id": "unique-card-id",
  "name": "Card Name",
  "set": "SOR",
  "rarity": "Common",
  "type": "Unit",
  "aspects": ["Villainy", "Command"],
  "cost": 3,
  "isLeader": false,
  "isBase": false,
  "imageUrl": "https://..."
}`}
            </pre>
          </div>
          <button onClick={onBack}>Go Back</button>
        </div>
      </div>
    )
  }

  const handleRefresh = () => {
    // Navigate to /pools/new?set=SETCODE to generate a new pool
    if (setCode) {
      window.location.href = `/pools/new?set=${setCode}`
    }
  }

  return (
    <div className={`sealed-pod ${poolType === 'draft' ? 'draft-mode' : 'sealed-mode'}`}>
      {packArtUrl && (
        <div className="set-art-header" style={setArtStyle}></div>
      )}
      <div className="sealed-pod-content">
        <div className="top-buttons">
          <button className="back-button" onClick={onBack}>
            ← {poolType === 'draft' ? 'Back to Pod' : 'Back to Sets'}
          </button>
          {poolType !== 'draft' && (
            <button
              className="refresh-button"
              onClick={handleRefresh}
              title="Refresh Pool"
              aria-label="Refresh Pool"
            >
              ↻
            </button>
          )}
        </div>
        <div className="sealed-pod-header">
        <h1>
          {poolName || (poolType === 'draft' ? 'Draft Pool' : 'Sealed Pool')}
        </h1>
        {createdAt && (
          <p className="pool-date">
            {new Date(createdAt).toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        )}
        {saving && <p className="saving-indicator"></p>}
        {packs.length > 0 && (
          <button
            className="build-deck-button"
            onClick={() => {
              const allCards = packs.flatMap(pack => pack.cards)
              if (savedShareId) {
                // Navigate to deck builder with share ID
                window.location.href = `/pool/${savedShareId}/deck`
              } else {
                onBuildDeck(allCards, setCode)
              }
            }}
          >
            Build Deck
          </button>
        )}
      </div>

      <div className="packs-container">
        {showPacksLoading ? (
          <div className="loading"></div>
        ) : (
          packs.map((pack, index) => (
          <div key={index} className="pack-details">
            <h2>{pack.name || `${poolType === 'draft' ? 'Round' : 'Pack'} ${index + 1}`}</h2>
            <div className="cards-grid">
              {pack.cards.map((card, cardIndex) => (
                <div
                  key={cardIndex}
                  className={`card-item ${card.isLeader ? 'leader' : ''} ${card.isBase ? 'base' : ''} ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''}`}
                  onClick={() => setSelectedCard(card)}
                  onMouseEnter={(e) => {
                    // Clear any existing timeout
                    if (previewTimeoutRef.current) {
                      clearTimeout(previewTimeoutRef.current)
                    }

                    // Capture the rect immediately (before timeout)
                    const rect = e.currentTarget.getBoundingClientRect()

                    // Set timeout to show preview after 1 second
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
                    }, 1000)
                  }}
                  onMouseLeave={() => {
                    if (previewTimeoutRef.current) {
                      clearTimeout(previewTimeoutRef.current)
                      previewTimeoutRef.current = null
                    }
                    setHoveredCardPreview(null)
                  }}
                >
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={card.name || 'Card'}
                      className="card-image"
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
              ))}
            </div>
          </div>
        ))
        )}
      </div>

      {/* Rate Card */}
      {packs.length > 0 && poolType !== 'draft' && (
        <div className="rate-card">
          <h2>Pack Rate Card - {getSetName(setCode)}</h2>
          {(() => {
            // Analyze all packs
            const stats = {
              totalPacks: packs.length,
              rarityCounts: { Legendary: 0, Rare: 0, Uncommon: 0, Common: 0, Special: 0 },
              hyperspaceCount: 0,
              foilCount: 0,
              hyperspaceFoilCount: 0,
              showcaseCount: 0,
              upgradeSlotHyperspace: 0,
              foilPositions: [],
              specialRarity: {
                inFoilSlot: 0,
                inFoilSlotStandard: 0,
                inFoilSlotHyperspace: 0,
                inUpgradeSlot: 0
              },
              leaders: {
                total: 0,
                common: 0,
                rare: 0,
                legendary: 0
              },
              foilSlotRarities: { Legendary: 0, Rare: 0, Uncommon: 0, Common: 0, Special: 0 },
              upgradeSlotRarities: { Legendary: 0, Rare: 0, Uncommon: 0, Common: 0, Special: 0 }
            }

            packs.forEach((pack, packIndex) => {
              let uncommonCount = 0
              let nonLeaderBaseFoilCount = 0

              pack.cards.forEach((card, cardIndex) => {
                // Count rarities
                if (card.rarity) {
                  stats.rarityCounts[card.rarity] = (stats.rarityCounts[card.rarity] || 0) + 1
                }

                // Count leaders
                if (card.isLeader) {
                  stats.leaders.total++
                  if (card.rarity === 'Common') {
                    stats.leaders.common++
                  } else if (card.rarity === 'Rare') {
                    stats.leaders.rare++
                  } else if (card.rarity === 'Legendary') {
                    stats.leaders.legendary++
                  }
                }

                // Count hyperspace
                if (card.isHyperspace) {
                  stats.hyperspaceCount++
                }

                // Count foils and track foil slot rarities
                if (card.isFoil) {
                  stats.foilCount++
                  if (card.isHyperspace) {
                    stats.hyperspaceFoilCount++
                  }
                  // Track rarity distribution in foil slot
                  if (card.rarity) {
                    stats.foilSlotRarities[card.rarity] = (stats.foilSlotRarities[card.rarity] || 0) + 1
                  }
                  stats.foilPositions.push({
                    pack: packIndex + 1,
                    position: cardIndex + 1,
                    rarity: card.rarity,
                    isHyperspace: card.isHyperspace,
                    name: card.name
                  })
                }

                // Check for showcase
                if (card.isShowcase) {
                  stats.showcaseCount++
                }

                // Track non-leader, non-base, non-foil cards
                // The upgrade slot is around position 13-14 (after 1 leader, 1 base, 9 commons, 2 uncommons)
                if (!card.isLeader && !card.isBase && !card.isFoil) {
                  nonLeaderBaseFoilCount++

                  // The upgrade slot is typically the 13th card (position 12 in 0-indexed)
                  // It can be a hyperspace variant of any rarity
                  if (nonLeaderBaseFoilCount === 12) {
                    // This is the upgrade slot
                    if (card.isHyperspace) {
                      stats.upgradeSlotHyperspace++
                      // Track rarity distribution only for hyperspace upgrade slots
                      if (card.rarity) {
                        stats.upgradeSlotRarities[card.rarity] = (stats.upgradeSlotRarities[card.rarity] || 0) + 1
                        // Track Special rarity in upgrade slot
                        if (card.rarity === 'Special') {
                          stats.specialRarity.inUpgradeSlot++
                        }
                      }
                    }
                  }

                  // Also track uncommons for reference
                  if (card.rarity === 'Uncommon') {
                    uncommonCount++
                  }
                }

                // Track Special rarity in foil slot
                if (card.rarity === 'Special' && card.isFoil) {
                  stats.specialRarity.inFoilSlot++
                  if (card.isHyperspace) {
                    stats.specialRarity.inFoilSlotHyperspace++
                  } else {
                    stats.specialRarity.inFoilSlotStandard++
                  }
                }
              })
            })

            const distributionPeriod = getDistributionPeriod(setCode)
            const isPreLawlessTime = distributionPeriod === DISTRIBUTION_PERIODS.PRE_LAWLESS_TIME
            const allowsSpecial = allowsSpecialInFoil(setCode)

            // Format foil rate
            const foilRatePercent = (stats.foilCount / stats.totalPacks) * 100
            const foilRateText = foilRatePercent === 100
              ? `1 foil per pack`
              : `${stats.foilCount} foils in ${stats.totalPacks} packs (${foilRatePercent.toFixed(1)}% per pack)`

            return (
              <div className="rate-card-content">
                <div className="rate-card-section">
                  <h3>Pack Structure</h3>
                  <p>Each pack contains: 1 Leader, 1 Base, 9 Commons, 3 Uncommons, 1 Rare/Legendary, 1 Foil</p>
                  <p>Total: 16 cards per pack</p>
                </div>

                <div className="rate-card-section">
                  <h3>Leader Distribution</h3>
                  {stats.leaders.total > 0 && (
                    <>
                      <p><strong>Common Leaders:</strong> {stats.leaders.common} ({((stats.leaders.common / stats.leaders.total) * 100).toFixed(1)}%, ~83.3% expected)</p>
                      <p><strong>Rare/Legendary Leaders:</strong> {stats.leaders.rare + stats.leaders.legendary} ({(((stats.leaders.rare + stats.leaders.legendary) / stats.leaders.total) * 100).toFixed(1)}%, ~16.7% expected)</p>
                      {stats.leaders.legendary > 0 && (
                        <p style={{ marginLeft: '1em', fontSize: '0.9em', opacity: 0.8 }}>Including {stats.leaders.legendary} Legendary leader(s)</p>
                      )}
                    </>
                  )}
                </div>

                <div className="rate-card-section">
                  <h3>Rarity Distribution (across all {stats.totalPacks} packs)</h3>
                  <div className="rarity-stats">
                    <div><strong>Legendary (L):</strong> {stats.rarityCounts.Legendary} ({((stats.rarityCounts.Legendary / (stats.totalPacks * 16)) * 100).toFixed(1)}%, ~6.25% expected)</div>
                  </div>
                </div>

                <div className="rate-card-section">
                  <h3>Foil Information</h3>
                  <p><strong>Foil Rate:</strong> {foilRateText}</p>
                  {isPreLawlessTime ? (
                    <>
                      <p><strong>Standard Foil:</strong> {stats.foilCount - stats.hyperspaceFoilCount} ({(((stats.foilCount - stats.hyperspaceFoilCount) / stats.foilCount) * 100).toFixed(1)}% of foils, ~83.3% expected)</p>
                      <p><strong>Hyperspace Foil:</strong> {stats.hyperspaceFoilCount} ({((stats.hyperspaceFoilCount / stats.foilCount) * 100).toFixed(1)}% of foils, ~16.7% expected)</p>
                    </>
                  ) : (
                    <p><strong>Hyperspace Foil:</strong> {stats.hyperspaceFoilCount} (100% expected - all foils are hyperspace)</p>
                  )}

                  <p style={{ marginTop: '0.75em' }}><strong>Foil Slot Rarity Distribution:</strong></p>
                  <ul style={{ marginTop: '0.25em', marginLeft: '1.5em' }}>
                    {stats.foilSlotRarities.Legendary > 0 && (
                      <li>Legendary (L): {stats.foilSlotRarities.Legendary} ({((stats.foilSlotRarities.Legendary / stats.foilCount) * 100).toFixed(1)}%)</li>
                    )}
                    {stats.foilSlotRarities.Rare > 0 && (
                      <li>Rare (R): {stats.foilSlotRarities.Rare} ({((stats.foilSlotRarities.Rare / stats.foilCount) * 100).toFixed(1)}%)</li>
                    )}
                    {stats.foilSlotRarities.Uncommon > 0 && (
                      <li>Uncommon (U): {stats.foilSlotRarities.Uncommon} ({((stats.foilSlotRarities.Uncommon / stats.foilCount) * 100).toFixed(1)}%)</li>
                    )}
                    {stats.foilSlotRarities.Common > 0 && (
                      <li>Common (C): {stats.foilSlotRarities.Common} ({((stats.foilSlotRarities.Common / stats.foilCount) * 100).toFixed(1)}%)</li>
                    )}
                    {stats.foilSlotRarities.Special > 0 && (
                      <li>Special (S): {stats.foilSlotRarities.Special} ({((stats.foilSlotRarities.Special / stats.foilCount) * 100).toFixed(1)}%)</li>
                    )}
                  </ul>
                  {allowsSpecial && (
                    <p style={{ marginTop: '0.5em', fontSize: '0.9em', fontStyle: 'italic', opacity: 0.9 }}>
                      Special rarity (S) can appear in foil/hyperfoil slots (~1-2% of foils when applicable)
                    </p>
                  )}
                </div>

                <div className="rate-card-section">
                  <h3>Hyperspace Variants</h3>
                  <p><strong>Total Hyperspace Cards:</strong> {stats.hyperspaceCount} ({((stats.hyperspaceCount / (stats.totalPacks * 16)) * 100).toFixed(1)}% of all cards)</p>
                  <p><strong>Hyperspace Rate:</strong> {((stats.hyperspaceCount / stats.totalPacks)).toFixed(1)} per pack (~66.7% expected per pack)</p>
                </div>

                <div className="rate-card-section">
                  <h3>Uncommon Upgrade Slot</h3>
                  <p>The 3rd Uncommon slot can be upgraded to a Hyperspace variant of any rarity.</p>
                  <p><strong>Upgrade Slot Hyperspace:</strong> {stats.upgradeSlotHyperspace} out of {stats.totalPacks} packs ({((stats.upgradeSlotHyperspace / stats.totalPacks) * 100).toFixed(1)}%, ~10% expected)</p>

                  {stats.upgradeSlotHyperspace > 0 && (
                    <>
                      <p style={{ marginTop: '0.75em' }}><strong>Upgrade Slot Rarity Distribution (when hyperspace):</strong></p>
                      <ul style={{ marginTop: '0.25em', marginLeft: '1.5em' }}>
                        <li>Legendary (L): {stats.upgradeSlotRarities.Legendary || 0} ({stats.upgradeSlotHyperspace > 0 ? ((stats.upgradeSlotRarities.Legendary || 0) / stats.upgradeSlotHyperspace * 100).toFixed(1) : 0}%)</li>
                        <li>Rare (R): {stats.upgradeSlotRarities.Rare || 0} ({stats.upgradeSlotHyperspace > 0 ? ((stats.upgradeSlotRarities.Rare || 0) / stats.upgradeSlotHyperspace * 100).toFixed(1) : 0}%, ~12% expected)</li>
                        <li>Uncommon (U): {stats.upgradeSlotRarities.Uncommon || 0} ({stats.upgradeSlotHyperspace > 0 ? ((stats.upgradeSlotRarities.Uncommon || 0) / stats.upgradeSlotHyperspace * 100).toFixed(1) : 0}%, ~25% expected)</li>
                        <li>Common (C): {stats.upgradeSlotRarities.Common || 0} ({stats.upgradeSlotHyperspace > 0 ? ((stats.upgradeSlotRarities.Common || 0) / stats.upgradeSlotHyperspace * 100).toFixed(1) : 0}%, ~60% expected)</li>
                        {stats.upgradeSlotRarities.Special > 0 && (
                          <li>Special (S): {stats.upgradeSlotRarities.Special} ({((stats.upgradeSlotRarities.Special / stats.upgradeSlotHyperspace) * 100).toFixed(1)}%)</li>
                        )}
                      </ul>
                    </>
                  )}
                  {!allowsSpecial && (
                    <p style={{ marginTop: '0.5em', fontSize: '0.9em', fontStyle: 'italic', opacity: 0.9 }}>
                      Special (S) does not appear in upgrade slot (only in foil/hyperfoil slots)
                    </p>
                  )}
                </div>

                {stats.showcaseCount > 0 && (
                  <div className="rate-card-section">
                    <h3>Showcase Leaders</h3>
                    <p><strong>Showcase Count:</strong> {stats.showcaseCount} ({((stats.showcaseCount / stats.totalPacks) * 100).toFixed(2)}%, ~0.35% expected per pack)</p>
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

      {/* Enlarged card preview (3x size) */}
      {hoveredCardPreview && (() => {
        const card = hoveredCardPreview.card
        const hasBackImage = card.backImageUrl && card.isLeader
        const isHorizontal = card.isLeader || card.isBase
        const borderRadius = '23px' // Slightly smaller than 24px to reduce clipping

        // Calculate dimensions
        let previewWidth, previewHeight
        if (hasBackImage) {
          // Leader with back: side by side (horizontal front + vertical back)
          previewWidth = 504 + 360 + 20 // 504px front + 360px back + 20px gap
          previewHeight = 504 // Max height (vertical back is 504px)
        } else {
          // Leaders and bases are landscape: 168px x 120px, so 3x = 504px x 360px
          // Regular cards are portrait: 120px x 168px, so 3x = 360px x 504px
          previewWidth = isHorizontal ? 504 : 360
          previewHeight = isHorizontal ? 360 : 504
        }

        return (
          <div
            className="card-preview-enlarged"
            style={{
              position: 'fixed',
              left: `${hoveredCardPreview.x}px`,
              top: `${hoveredCardPreview.y}px`,
              zIndex: 10000,
              pointerEvents: 'auto',
              transform: 'translateY(-50%)',
              width: `${previewWidth}px`,
              height: `${previewHeight}px`,
              borderRadius: borderRadius,
              overflow: 'visible', // Changed to visible so side-by-side cards aren't clipped
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
              border: 'none', // Remove border from container
              display: 'flex',
              flexDirection: 'row', // Side by side for leaders with back
              gap: '20px',
            }}
            onMouseLeave={() => setHoveredCardPreview(null)}
          >
            {hasBackImage ? (
              // Show both front (horizontal) and back (vertical) side by side for leaders
              <>
                {/* Front - horizontal */}
                <div className={card.isFoil && (!card.isLeader || card.isShowcase) ? 'card-preview-foil' : ''} style={{
                  width: '504px',
                  height: '360px',
                  overflow: 'hidden',
                  borderRadius: borderRadius,
                  boxShadow: (card.isFoil && (!card.isLeader || card.isShowcase)) ? '0 0 15px rgba(255, 255, 255, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.8)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  alignSelf: 'center', // Vertically center the front side
                  position: 'relative',
                }}>
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={`${card.name || 'Card'} - Front`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'rgba(26, 26, 46, 0.95)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '1rem',
                      color: 'white',
                    }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                        {card.name || 'Card'} - Front
                      </div>
                      <div style={{ color: getRarityColor(card.rarity) }}>
                        {card.rarity}
                      </div>
                    </div>
                  )}
                </div>
                {/* Back - vertical */}
                <div className={card.isFoil && (!card.isLeader || card.isShowcase) ? 'card-preview-foil' : ''} style={{
                  width: '360px',
                  height: '504px',
                  overflow: 'hidden',
                  borderRadius: borderRadius,
                  boxShadow: (card.isFoil && (!card.isLeader || card.isShowcase)) ? '0 0 15px rgba(255, 255, 255, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.8)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  position: 'relative',
                }}>
                  {card.backImageUrl ? (
                    <img
                      src={card.backImageUrl}
                      alt={`${card.name || 'Card'} - Back`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'rgba(26, 26, 46, 0.95)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '1rem',
                      color: 'white',
                    }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                        {card.name || 'Card'} - Back
                      </div>
                      <div style={{ color: getRarityColor(card.rarity) }}>
                        {card.rarity}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Single card (non-leader, base, or leader without back)
              <div className={card.isFoil && (!card.isLeader || card.isShowcase) ? 'card-preview-foil' : ''} style={{
                width: `${previewWidth}px`,
                height: `${previewHeight}px`,
                overflow: 'hidden',
                borderRadius: borderRadius,
                boxShadow: card.isFoil && (!card.isLeader || card.isShowcase) ? '0 0 15px rgba(255, 255, 255, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.8)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                position: 'relative',
              }}>
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.name || 'Card'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'rgba(26, 26, 46, 0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '1rem',
                    color: 'white',
                  }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                      {card.name || 'Card'}
                    </div>
                    <div style={{ color: getRarityColor(card.rarity) }}>
                      {card.rarity}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })()}
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
            marginRight: '20px',
            marginTop: tooltip.alignLeft ? '0' : '-8px'
          }}
        >
          {tooltip.text}
        </div>
      )}
      </div>
    </div>
  )
}

export default SealedPod
