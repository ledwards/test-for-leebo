import { useState, useEffect, useRef } from 'react'
import './SealedPod.css'
import { getCachedCards, isCacheInitialized } from '../utils/cardCache'
import { fetchSetCards } from '../utils/api'
import { generateSealedPod } from '../utils/boosterPack'
import { getDistributionPeriod, DISTRIBUTION_PERIODS, allowsSpecialInFoil } from '../utils/rarityConfig'
import CardModal from './CardModal'

// Helper function to get set name from set code
function getSetName(setCode) {
  const setNames = {
    'SOR': 'Spark of Rebellion',
    'SHD': 'Shadows of the Galaxy',
    'TWI': 'Twilight of the Republic',
    'JTL': 'Jump to Lightspeed',
    'LOF': 'Legends of the Force',
    'SEC': 'Secrets of Power'
  }
  return setNames[setCode] || setCode
}

function SealedPod({ setCode, onBack, onBuildDeck, onPacksGenerated }) {
  const [cards, setCards] = useState([])
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [hoveredCardPreview, setHoveredCardPreview] = useState(null) // { card, x, y } for enlarged preview
  const previewTimeoutRef = useRef(null)

  useEffect(() => {
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
          setError(`No card data available for set ${setCode}. Please populate src/data/cards.json with card data.`)
          setCards([])
        } else {
          setCards(cardsData)
        }
      } catch (err) {
        setError(err.message)
        setCards([])
      } finally {
        setLoading(false)
      }
    }
    loadCards()
  }, [setCode])

  // Cleanup preview timeout
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
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
    }
  }, [cards, setCode, onPacksGenerated])


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

  if (loading) {
    return (
      <div className="sealed-pod">
        <div className="loading">Loading cards...</div>
      </div>
    )
  }

  if (error || cards.length === 0) {
    return (
      <div className="sealed-pod">
        <button className="back-button" onClick={onBack}>
          ← Back to Sets
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
    )
  }

  return (
    <div className="sealed-pod">
      <button className="back-button" onClick={onBack}>
        ← Back to Sets
      </button>
      <div className="sealed-pod-header">
        <h1>Sealed Pod - {setCode}</h1>
        <p className="instruction">All 6 packs are displayed below</p>
        {packs.length > 0 && (
          <button className="build-deck-button" onClick={() => onBuildDeck(packs.flat(), setCode)}>
            Build Deck
          </button>
        )}
      </div>
      
      <div className="packs-container">
        {packs.map((pack, index) => (
          <div key={index} className="pack-details">
            <h2>Pack {index + 1}</h2>
            <div className="cards-grid">
              {pack.map((card, cardIndex) => (
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
        ))}
      </div>
      
      {/* Rate Card */}
      {packs.length > 0 && (
        <div className="rate-card">
          <h2>Pack Rate Card</h2>
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
              
              pack.forEach((card, cardIndex) => {
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
                    <div><strong>Legendary (L):</strong> {stats.rarityCounts.Legendary} ({((stats.rarityCounts.Legendary / (stats.totalPacks * 16)) * 100).toFixed(1)}% observed, ~6.25% expected)</div>
                    <div><strong>Rare (R):</strong> {stats.rarityCounts.Rare} ({((stats.rarityCounts.Rare / (stats.totalPacks * 16)) * 100).toFixed(1)}% observed, ~6.25% expected)</div>
                    <div><strong>Uncommon (U):</strong> {stats.rarityCounts.Uncommon} ({((stats.rarityCounts.Uncommon / (stats.totalPacks * 16)) * 100).toFixed(1)}% observed, ~18.75% expected)</div>
                    <div><strong>Common (C):</strong> {stats.rarityCounts.Common} ({((stats.rarityCounts.Common / (stats.totalPacks * 16)) * 100).toFixed(1)}% observed, ~56.25% expected)</div>
                    {stats.rarityCounts.Special > 0 && (
                      <div><strong>Special (S):</strong> {stats.rarityCounts.Special} ({((stats.rarityCounts.Special / (stats.totalPacks * 16)) * 100).toFixed(1)}% observed, ~0.1% expected)</div>
                    )}
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
                      <li>Legendary (L): {stats.foilSlotRarities.Legendary} ({((stats.foilSlotRarities.Legendary / stats.foilCount) * 100).toFixed(1)}% observed)</li>
                    )}
                    {stats.foilSlotRarities.Rare > 0 && (
                      <li>Rare (R): {stats.foilSlotRarities.Rare} ({((stats.foilSlotRarities.Rare / stats.foilCount) * 100).toFixed(1)}% observed)</li>
                    )}
                    {stats.foilSlotRarities.Uncommon > 0 && (
                      <li>Uncommon (U): {stats.foilSlotRarities.Uncommon} ({((stats.foilSlotRarities.Uncommon / stats.foilCount) * 100).toFixed(1)}% observed)</li>
                    )}
                    {stats.foilSlotRarities.Common > 0 && (
                      <li>Common (C): {stats.foilSlotRarities.Common} ({((stats.foilSlotRarities.Common / stats.foilCount) * 100).toFixed(1)}% observed)</li>
                    )}
                    {stats.foilSlotRarities.Special > 0 && (
                      <li>Special (S): {stats.foilSlotRarities.Special} ({((stats.foilSlotRarities.Special / stats.foilCount) * 100).toFixed(1)}% observed)</li>
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
                  <h3>Uncommon Upgrade Slot - {getSetName(setCode)}</h3>
                  <p>The 3rd Uncommon slot can be upgraded to a Hyperspace variant of any rarity.</p>
                  <p><strong>Upgrade Slot Hyperspace:</strong> {stats.upgradeSlotHyperspace} out of {stats.totalPacks} packs ({((stats.upgradeSlotHyperspace / stats.totalPacks) * 100).toFixed(1)}%, ~25% expected)</p>
                  
                  {stats.upgradeSlotHyperspace > 0 && (
                    <>
                      <p style={{ marginTop: '0.75em' }}><strong>Upgrade Slot Rarity Distribution (when hyperspace):</strong></p>
                      <ul style={{ marginTop: '0.25em', marginLeft: '1.5em' }}>
                        <li>Legendary (L): {stats.upgradeSlotRarities.Legendary || 0} ({stats.upgradeSlotHyperspace > 0 ? ((stats.upgradeSlotRarities.Legendary || 0) / stats.upgradeSlotHyperspace * 100).toFixed(1) : 0}% observed, ~3% expected)</li>
                        <li>Rare (R): {stats.upgradeSlotRarities.Rare || 0} ({stats.upgradeSlotHyperspace > 0 ? ((stats.upgradeSlotRarities.Rare || 0) / stats.upgradeSlotHyperspace * 100).toFixed(1) : 0}% observed, ~12% expected)</li>
                        <li>Uncommon (U): {stats.upgradeSlotRarities.Uncommon || 0} ({stats.upgradeSlotHyperspace > 0 ? ((stats.upgradeSlotRarities.Uncommon || 0) / stats.upgradeSlotHyperspace * 100).toFixed(1) : 0}% observed, ~25% expected)</li>
                        <li>Common (C): {stats.upgradeSlotRarities.Common || 0} ({stats.upgradeSlotHyperspace > 0 ? ((stats.upgradeSlotRarities.Common || 0) / stats.upgradeSlotHyperspace * 100).toFixed(1) : 0}% observed, ~60% expected)</li>
                        {stats.upgradeSlotRarities.Special > 0 && (
                          <li>Special (S): {stats.upgradeSlotRarities.Special} ({((stats.upgradeSlotRarities.Special / stats.upgradeSlotHyperspace) * 100).toFixed(1)}% observed)</li>
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
                
                <div className="rate-card-section">
                  <h3>Special Rarity (S)</h3>
                  {allowsSpecial ? (
                    <>
                      {stats.specialRarity.inFoilSlot > 0 && (
                        <>
                          <p>
                            <strong>Foil Slot:</strong> {stats.specialRarity.inFoilSlot} out of {stats.foilCount} foils ({((stats.specialRarity.inFoilSlot / stats.foilCount) * 100).toFixed(2)}% observed, ~1-2% expected)
                          </p>
                          <ul style={{ marginLeft: '1.5em', marginTop: '0.25em' }}>
                            {stats.specialRarity.inFoilSlotStandard > 0 && (
                              <li>Standard Foil: {stats.specialRarity.inFoilSlotStandard} ({((stats.specialRarity.inFoilSlotStandard / stats.specialRarity.inFoilSlot) * 100).toFixed(1)}% of Special foils observed)</li>
                            )}
                            {stats.specialRarity.inFoilSlotHyperspace > 0 && (
                              <li>Hyperspace Foil: {stats.specialRarity.inFoilSlotHyperspace} ({((stats.specialRarity.inFoilSlotHyperspace / stats.specialRarity.inFoilSlot) * 100).toFixed(1)}% of Special foils observed)</li>
                            )}
                          </ul>
                        </>
                      )}
                      {stats.specialRarity.inUpgradeSlot > 0 && (
                        <p style={{ marginTop: stats.specialRarity.inFoilSlot > 0 ? '0.5em' : '0' }}>
                          <strong>Upgrade Slot:</strong> {stats.specialRarity.inUpgradeSlot} out of {stats.upgradeSlotHyperspace} upgrade slots ({((stats.specialRarity.inUpgradeSlot / stats.upgradeSlotHyperspace) * 100).toFixed(2)}% observed)
                        </p>
                      )}
                    </>
                  ) : (
                    <p>This set does not include Special rarity cards in booster packs.</p>
                  )}
                </div>
                
                <div className="rate-card-section">
                  <h3>Pack Building Rules</h3>
                  <ul>
                    <li>Leaders can ONLY appear in leader slot (position 1)</li>
                    <li><strong>Leader Rarity:</strong> Common leaders appear ~83.3% of the time (5/6), Rare/Legendary leaders appear ~16.7% of the time (1/6)</li>
                    <li>Common bases can ONLY appear in base slot (position 2)</li>
                    {['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC'].includes(setCode) && (
                      <li>Rare bases CAN appear in rare slot</li>
                    )}
                    {allowsSpecial && (
                      <>
                        <li>Special rarity cards do NOT appear in regular slots</li>
                        <li>Special rarity cards can ONLY appear in foil/hyperfoil slots</li>
                        <li>Foil slot can be any rarity, including Special</li>
                      </>
                    )}
                    {!allowsSpecial && (
                      <li>Foil slot can be any rarity (L, R, U, C)</li>
                    )}
                    <li>Foil slot can be a duplicate of another card in the pack</li>
                    <li>Upgrade slot (3rd uncommon) can be a duplicate</li>
                    <li>Leaders are NEVER foil or hyperfoil</li>
                  </ul>
                </div>
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
        const borderRadius = '18px' // Slightly smaller than 24px to reduce clipping
        
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
                <div style={{
                  width: '504px',
                  height: '360px',
                  overflow: 'hidden',
                  borderRadius: borderRadius,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
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
                <div style={{
                  width: '360px',
                  height: '504px',
                  overflow: 'hidden',
                  borderRadius: borderRadius,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
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
              <div style={{
                width: `${previewWidth}px`,
                height: `${previewHeight}px`,
                overflow: 'hidden',
                borderRadius: borderRadius,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
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
    </div>
  )
}

export default SealedPod
