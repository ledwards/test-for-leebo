// @ts-nocheck
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import Card from '@/src/components/Card'
import Button from '@/src/components/Button'
import './page.css'

interface CardData {
  id: string
  instanceId: string
  name: string
  type: string
  cost?: number
  aspects?: string[]
  frontArt?: string
  set?: string
}

interface Player {
  id: string
  name: string
  seat: number
}

interface PickedCard {
  cardInstanceId: string
  playerId: string
  pickNumber: number
}

interface RotisserieData {
  setCodes: string[]
  maxPlayers: number
  pickTimerSeconds: number
  cardPool: CardData[]
  leaders: CardData[]
  bases: CardData[]
  pickedCards: PickedCard[]
  currentPickerIndex: number
  pickDirection: number
  pickNumber: number
  totalPicks: number
  status: 'waiting' | 'active' | 'completed'
  players: Player[]
}

export default function RotisseriePlayPage() {
  const params = useParams()
  const shareId = params.shareId as string
  const { user } = useAuth()

  const [data, setData] = useState<RotisserieData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [picking, setPicking] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/casual/rotisserie/${shareId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Draft not found')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to load draft')
    } finally {
      setLoading(false)
    }
  }, [shareId])

  useEffect(() => {
    fetchData()

    // Poll for updates every 3 seconds when draft is active
    const interval = setInterval(() => {
      if (data?.status === 'active') {
        fetchData()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [fetchData, data?.status])

  const handleAction = async (action: string, cardInstanceId?: string) => {
    try {
      setPicking(true)
      const response = await fetch(`/api/casual/rotisserie/${shareId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, cardInstanceId })
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Action failed')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setPicking(false)
    }
  }

  const isCardPicked = (instanceId: string) => {
    return data?.pickedCards.some(p => p.cardInstanceId === instanceId)
  }

  const getMyPicks = () => {
    if (!data || !user) return []
    return data.pickedCards
      .filter(p => p.playerId === user.id)
      .map(p => {
        return data.cardPool.find(c => c.instanceId === p.cardInstanceId) ||
          data.leaders.find(c => c.instanceId === p.cardInstanceId) ||
          data.bases.find(c => c.instanceId === p.cardInstanceId)
      })
      .filter(Boolean)
  }

  const getFilteredCards = () => {
    if (!data) return []

    let cards = [...data.cardPool]

    if (typeFilter === 'leaders') {
      cards = data.leaders
    } else if (typeFilter === 'bases') {
      cards = data.bases
    } else if (typeFilter !== 'all') {
      cards = cards.filter(c => c.type === typeFilter)
    }

    if (filter) {
      const lowerFilter = filter.toLowerCase()
      cards = cards.filter(c =>
        c.name.toLowerCase().includes(lowerFilter)
      )
    }

    return cards
  }

  if (loading) {
    return (
      <div className="rotisserie-play-page">
        <div className="loading">Loading draft...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rotisserie-play-page">
        <div className="error">{error || 'Draft not found'}</div>
      </div>
    )
  }

  const players = data.players || []
  const currentPicker = players[data.currentPickerIndex]
  const isMyTurn = user && currentPicker?.id === user.id
  const hasJoined = user && players.some(p => p.id === user.id)
  const isHost = user && players[0]?.id === user.id
  const myPicks = getMyPicks()
  const filteredCards = getFilteredCards()

  return (
    <div className="rotisserie-play-page">
      <div className="rotisserie-header">
        <h1>Rotisserie Draft</h1>
        <div className="draft-info">
          <span>Pick {data.pickNumber} / {data.totalPicks}</span>
          <span className={`status-badge ${data.status}`}>{data.status}</span>
        </div>
      </div>

      <div className="rotisserie-layout">
        <div className="sidebar">
          <div className="players-section">
            <h3>Players ({players.length}/{data.maxPlayers})</h3>
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`player-item ${index === data.currentPickerIndex && data.status === 'active' ? 'current' : ''}`}
              >
                <span className="player-seat">{player.seat}</span>
                <span className="player-name">
                  {player.name}
                  {player.id === user?.id && ' (You)'}
                </span>
                <span className="player-picks">
                  {data.pickedCards.filter(p => p.playerId === player.id).length} picks
                </span>
              </div>
            ))}

            {data.status === 'waiting' && (
              <div className="lobby-actions">
                {!hasJoined && user && (
                  <Button variant="primary" onClick={() => handleAction('join')}>
                    Join Draft
                  </Button>
                )}
                {isHost && players.length >= 2 && (
                  <Button variant="primary" onClick={() => handleAction('start')}>
                    Start Draft
                  </Button>
                )}
                {players.length < 2 && (
                  <p className="waiting-text">Waiting for players...</p>
                )}
              </div>
            )}
          </div>

          {myPicks.length > 0 && (
            <div className="my-picks-section">
              <h3>My Picks ({myPicks.length})</h3>
              <div className="my-picks-list">
                {myPicks.map((card, i) => (
                  <div key={card.instanceId} className="my-pick-item">
                    {i + 1}. {card.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="main-content">
          {data.status === 'active' && (
            <div className={`turn-indicator ${isMyTurn ? 'my-turn' : ''}`}>
              {isMyTurn ? "It's your turn to pick!" : `Waiting for ${currentPicker?.name}...`}
            </div>
          )}

          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search cards..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="search-input"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="type-select"
            >
              <option value="all">All Cards</option>
              <option value="leaders">Leaders</option>
              <option value="bases">Bases</option>
              <option value="Unit">Units</option>
              <option value="Event">Events</option>
              <option value="Upgrade">Upgrades</option>
            </select>
          </div>

          <div className="card-pool">
            {filteredCards.map((card) => {
              const picked = isCardPicked(card.instanceId)
              return (
                <div
                  key={card.instanceId}
                  className={`pool-card ${picked ? 'picked' : ''} ${isMyTurn && !picked ? 'pickable' : ''}`}
                  onClick={() => {
                    if (isMyTurn && !picked && !picking) {
                      handleAction('pick', card.instanceId)
                    }
                  }}
                >
                  <Card card={card} disabled={picked} />
                  {picked && <div className="picked-overlay">Picked</div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
