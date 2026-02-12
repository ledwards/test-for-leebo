// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Card from '@/src/components/Card'
import Button from '@/src/components/Button'
import './page.css'

interface CardData {
  id: string
  name: string
  type: string
  cost?: number
  aspects?: string[]
  frontArt?: string
}

interface PoolData {
  setCode: string
  setName: string
  leaders: CardData[]
  bases: CardData[]
  deckCards: CardData[]
  options: {
    ignoreAspectPenalties: boolean
    resourceBufferCount: number
  }
}

export default function PackWarsPlayPage() {
  const params = useParams()
  const shareId = params.shareId as string

  const [poolData, setPoolData] = useState<PoolData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLeader, setSelectedLeader] = useState<CardData | null>(null)
  const [hand, setHand] = useState<CardData[]>([])
  const [deck, setDeck] = useState<CardData[]>([])
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const loadPool = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/pools/${shareId}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Pool not found')
        }

        const data = await response.json()

        // Parse the cards JSON which contains pool data
        const poolInfo = typeof data.cards === 'string' ? JSON.parse(data.cards) : data.cards

        setPoolData(poolInfo)

        // Initialize deck with shuffled cards
        const shuffled = [...poolInfo.deckCards].sort(() => Math.random() - 0.5)

        // Add resource buffer cards if configured
        if (poolInfo.options?.resourceBufferCount > 0) {
          for (let i = 0; i < poolInfo.options.resourceBufferCount; i++) {
            shuffled.push({
              id: `buffer-${i}`,
              name: 'Resource Buffer',
              type: 'Resource',
              isBuffer: true
            })
          }
          // Shuffle again with buffer cards
          shuffled.sort(() => Math.random() - 0.5)
        }

        setDeck(shuffled)
      } catch (err) {
        setError(err.message || 'Failed to load pool')
      } finally {
        setLoading(false)
      }
    }

    loadPool()
  }, [shareId])

  const drawHand = () => {
    if (hasDrawn) return

    // Draw 4 cards
    const newHand = deck.slice(0, 4)
    const remainingDeck = deck.slice(4)

    setHand(newHand)
    setDeck(remainingDeck)
    setHasDrawn(true)
  }

  const reshuffleAndDraw = () => {
    if (!poolData) return

    // Reshuffle all cards
    const allCards = [...poolData.deckCards]

    // Add resource buffer cards if configured
    if (poolData.options?.resourceBufferCount > 0) {
      for (let i = 0; i < poolData.options.resourceBufferCount; i++) {
        allCards.push({
          id: `buffer-${i}`,
          name: 'Resource Buffer',
          type: 'Resource',
          isBuffer: true
        })
      }
    }

    const shuffled = allCards.sort(() => Math.random() - 0.5)

    // Draw new hand
    const newHand = shuffled.slice(0, 4)
    const remainingDeck = shuffled.slice(4)

    setHand(newHand)
    setDeck(remainingDeck)
    setHasDrawn(true)
  }

  if (loading) {
    return (
      <div className="pack-wars-play-page">
        <div className="loading">Loading pool...</div>
      </div>
    )
  }

  if (error || !poolData) {
    return (
      <div className="pack-wars-play-page">
        <div className="error">{error || 'Pool not found'}</div>
      </div>
    )
  }

  return (
    <div className="pack-wars-play-page">
      <div className="pack-wars-play-container">
        <div className="pack-wars-header">
          <h1>Pack Wars</h1>
          <p className="set-name">{poolData.setName}</p>
          {poolData.options?.ignoreAspectPenalties && (
            <span className="option-badge">Aspect Penalties Ignored</span>
          )}
          {poolData.options?.resourceBufferCount > 0 && (
            <span className="option-badge">{poolData.options.resourceBufferCount} Buffer Cards</span>
          )}
        </div>

        <div className="pack-wars-leaders-bases">
          <div className="leaders-section">
            <h3>Leaders (choose one per game)</h3>
            <div className="leaders-grid">
              {poolData.leaders.map((leader, index) => (
                <div
                  key={leader.id || index}
                  className={`leader-card ${selectedLeader?.id === leader.id ? 'selected' : ''}`}
                  onClick={() => setSelectedLeader(leader)}
                >
                  <Card card={leader} />
                  {selectedLeader?.id === leader.id && (
                    <div className="selected-indicator">Active</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bases-section">
            <h3>Bases</h3>
            <div className="bases-grid">
              {poolData.bases.map((base, index) => (
                <div key={base.id || index} className="base-card">
                  <Card card={base} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pack-wars-deck-section">
          <h3>Deck ({deck.length} cards remaining)</h3>

          {!hasDrawn ? (
            <div className="draw-section">
              <Button variant="primary" size="lg" onClick={drawHand}>
                Draw Starting Hand (4 cards)
              </Button>
            </div>
          ) : (
            <>
              <div className="hand-section">
                <h4>Your Hand</h4>
                <div className="hand-cards">
                  {hand.map((card, index) => (
                    <div key={card.id || index} className="hand-card">
                      {card.isBuffer ? (
                        <div className="buffer-card">
                          <span>Resource</span>
                          <span>Buffer</span>
                        </div>
                      ) : (
                        <Card card={card} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="reshuffle-section">
                <Button variant="secondary" onClick={reshuffleAndDraw}>
                  Reshuffle & Draw New Hand
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="pack-wars-all-cards">
          <h3>All Cards in Pool ({poolData.deckCards.length} cards)</h3>
          <div className="all-cards-grid">
            {poolData.deckCards.map((card, index) => (
              <div key={card.id || index} className="pool-card">
                <Card card={card} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
