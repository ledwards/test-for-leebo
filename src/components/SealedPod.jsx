import { useState, useEffect } from 'react'
import './SealedPod.css'
import { getCachedCards, isCacheInitialized } from '../utils/cardCache'
import { fetchSetCards } from '../utils/api'
import { generateSealedPod } from '../utils/boosterPack'
import { getDistributionPeriod, DISTRIBUTION_PERIODS } from '../utils/rarityConfig'
import CardModal from './CardModal'

function SealedPod({ setCode, onBack, onBuildDeck, onPacksGenerated }) {
  const [cards, setCards] = useState([])
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)

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
              specialRarity: []
            }
            
            packs.forEach((pack, packIndex) => {
              let uncommonCount = 0
              let nonLeaderBaseFoilCount = 0
              
              pack.forEach((card, cardIndex) => {
                // Count rarities
                if (card.rarity) {
                  stats.rarityCounts[card.rarity] = (stats.rarityCounts[card.rarity] || 0) + 1
                }
                
                // Count hyperspace
                if (card.isHyperspace) {
                  stats.hyperspaceCount++
                }
                
                // Count foils
                if (card.isFoil) {
                  stats.foilCount++
                  if (card.isHyperspace) {
                    stats.hyperspaceFoilCount++
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
                
                // Check for Special rarity
                if (card.rarity === 'Special') {
                  stats.specialRarity.push({
                    pack: packIndex + 1,
                    name: card.name,
                    isFoil: card.isFoil,
                    isHyperspace: card.isHyperspace
                  })
                }
                
                // Track non-leader, non-base, non-foil cards
                // The upgrade slot is around position 13-14 (after 1 leader, 1 base, 9 commons, 2 uncommons)
                if (!card.isLeader && !card.isBase && !card.isFoil) {
                  nonLeaderBaseFoilCount++
                  
                  // The upgrade slot is typically the 13th card (position 12 in 0-indexed)
                  // It can be a hyperspace variant of any rarity
                  if (nonLeaderBaseFoilCount === 12 && card.isHyperspace) {
                    // This is likely the upgrade slot and it's hyperspace
                    stats.upgradeSlotHyperspace++
                  }
                  
                  // Also track uncommons for reference
                  if (card.rarity === 'Uncommon') {
                    uncommonCount++
                  }
                }
              })
            })
            
            const distributionPeriod = getDistributionPeriod(setCode)
            const isPreLawlessTime = distributionPeriod === DISTRIBUTION_PERIODS.PRE_LAWLESS_TIME
            
            return (
              <div className="rate-card-content">
                <div className="rate-card-section">
                  <h3>Pack Structure</h3>
                  <p>Each pack contains: 1 Leader, 1 Base, 9 Commons, 3 Uncommons, 1 Rare/Legendary, 1 Foil</p>
                  <p>Total: 16 cards per pack</p>
                </div>
                
                <div className="rate-card-section">
                  <h3>Rarity Distribution (across all {stats.totalPacks} packs)</h3>
                  <div className="rarity-stats">
                    <div><strong>Legendary (L):</strong> {stats.rarityCounts.Legendary} ({((stats.rarityCounts.Legendary / (stats.totalPacks * 16)) * 100).toFixed(1)}%)</div>
                    <div><strong>Rare (R):</strong> {stats.rarityCounts.Rare} ({((stats.rarityCounts.Rare / (stats.totalPacks * 16)) * 100).toFixed(1)}%)</div>
                    <div><strong>Uncommon (UC):</strong> {stats.rarityCounts.Uncommon} ({((stats.rarityCounts.Uncommon / (stats.totalPacks * 16)) * 100).toFixed(1)}%)</div>
                    <div><strong>Common (C):</strong> {stats.rarityCounts.Common} ({((stats.rarityCounts.Common / (stats.totalPacks * 16)) * 100).toFixed(1)}%)</div>
                    {stats.rarityCounts.Special > 0 && (
                      <div><strong>Special (S):</strong> {stats.rarityCounts.Special} ({((stats.rarityCounts.Special / (stats.totalPacks * 16)) * 100).toFixed(1)}%)</div>
                    )}
                  </div>
                </div>
                
                <div className="rate-card-section">
                  <h3>Foil Information</h3>
                  <p><strong>Foil Rate:</strong> {stats.foilCount} foils in {stats.totalPacks} packs ({((stats.foilCount / stats.totalPacks) * 100).toFixed(1)}% per pack)</p>
                  {isPreLawlessTime ? (
                    <>
                      <p><strong>Standard Foil:</strong> {stats.foilCount - stats.hyperspaceFoilCount} ({(((stats.foilCount - stats.hyperspaceFoilCount) / stats.foilCount) * 100).toFixed(1)}% of foils)</p>
                      <p><strong>Hyperspace Foil:</strong> {stats.hyperspaceFoilCount} ({((stats.hyperspaceFoilCount / stats.foilCount) * 100).toFixed(1)}% of foils, ~16.7% expected)</p>
                    </>
                  ) : (
                    <p><strong>Hyperspace Foil:</strong> {stats.hyperspaceFoilCount} (100% expected - all foils are hyperspace)</p>
                  )}
                  {stats.foilPositions.length > 0 && (
                    <div className="foil-positions">
                      <strong>Foil Positions:</strong>
                      <ul>
                        {stats.foilPositions.map((foil, idx) => (
                          <li key={idx}>
                            Pack {foil.pack}, Position {foil.position}: {foil.rarity} {foil.isHyperspace ? 'Hyperspace ' : ''}Foil - {foil.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="rate-card-section">
                  <h3>Hyperspace Variants</h3>
                  <p><strong>Total Hyperspace Cards:</strong> {stats.hyperspaceCount} ({((stats.hyperspaceCount / (stats.totalPacks * 16)) * 100).toFixed(1)}% of all cards)</p>
                  <p><strong>Hyperspace Rate:</strong> {((stats.hyperspaceCount / stats.totalPacks)).toFixed(1)} per pack (~50% expected per pack)</p>
                </div>
                
                <div className="rate-card-section">
                  <h3>Uncommon Upgrade Slot</h3>
                  <p>The 3rd Uncommon slot can be upgraded to a Hyperspace variant of any rarity.</p>
                  <p><strong>Upgrade Slot Hyperspace:</strong> {stats.upgradeSlotHyperspace} out of {stats.totalPacks} packs ({((stats.upgradeSlotHyperspace / stats.totalPacks) * 100).toFixed(1)}%, ~25% expected)</p>
                  <p>When upgraded, can be Common, Uncommon, Rare, or Legendary Hyperspace variant.</p>
                </div>
                
                {stats.showcaseCount > 0 && (
                  <div className="rate-card-section">
                    <h3>Showcase Leaders</h3>
                    <p><strong>Showcase Count:</strong> {stats.showcaseCount} ({((stats.showcaseCount / stats.totalPacks) * 100).toFixed(2)}%, ~0.35% expected per pack)</p>
                  </div>
                )}
                
                {stats.specialRarity.length > 0 && (
                  <div className="rate-card-section">
                    <h3>Special Rarity (S) Occurrences</h3>
                    <ul>
                      {stats.specialRarity.map((special, idx) => (
                        <li key={idx}>
                          Pack {special.pack}: {special.name} {special.isFoil ? '(Foil)' : ''} {special.isHyperspace ? '(Hyperspace)' : ''}
                        </li>
                      ))}
                    </ul>
                    <p><em>Special rarity cards only appear in foil/hyperfoil slots (sets 5, 6, 7: LOF, SEC, and future set 7)</em></p>
                  </div>
                )}
                
                <div className="rate-card-section">
                  <h3>Pack Building Rules</h3>
                  <ul>
                    <li>Leaders can ONLY appear in leader slot (position 1)</li>
                    <li>Common bases can ONLY appear in base slot (position 2)</li>
                    <li>Rare bases CAN appear in rare slot (sets 1-6)</li>
                    <li>Special rarity cards do NOT appear in regular slots</li>
                    <li>Special rarity cards can ONLY appear in foil/hyperfoil slots (sets 5, 6, 7)</li>
                    <li>Foil slot can be any rarity, including Special (in applicable sets)</li>
                    <li>Foil slot can be a duplicate of another card in the pack</li>
                    <li>Upgrade slot (3rd uncommon) can be a duplicate</li>
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
    </div>
  )
}

export default SealedPod
