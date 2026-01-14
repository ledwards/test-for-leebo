import { useState, useEffect } from 'react'
import './SealedPod.css'
import { getCachedCards, isCacheInitialized } from '../utils/cardCache'
import { fetchSetCards } from '../utils/api'
import { generateSealedPod } from '../utils/boosterPack'
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
                    {card.isFoil && <span className="badge foil-badge">Foil</span>}
                    {card.isShowcase && <span className="badge showcase-badge">Showcase</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  )
}

export default SealedPod
