// @ts-nocheck
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
)

function getUpcomingPicks(
  currentPickerIndex: number,
  pickDirection: number,
  players: Player[],
  count: number
): Player[] {
  const picks: Player[] = []
  let idx = currentPickerIndex
  let dir = pickDirection
  for (let i = 0; i < count; i++) {
    picks.push(players[idx])
    const next = idx + dir
    if (next >= players.length) {
      dir = -1
    } else if (next < 0) {
      dir = 1
    } else {
      idx = next
    }
  }
  return picks
}

export default function RotisseriePlayPage() {
  const params = useParams()
  const router = useRouter()
  const shareId = params.shareId as string
  const { user } = useAuth()

  const [data, setData] = useState<RotisserieData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [picking, setPicking] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/casual/rotisserie/${shareId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Draft not found')
      }

      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err.message || 'Failed to load draft')
    } finally {
      setLoading(false)
    }
  }, [shareId])

  useEffect(() => {
    fetchData()

    const interval = setInterval(() => {
      fetchData()
    }, 3000)

    return () => clearInterval(interval)
  }, [fetchData])

  const handleAction = async (action: string, extraBody?: Record<string, unknown>) => {
    try {
      setPicking(true)
      const response = await fetch(`/api/casual/rotisserie/${shareId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, ...extraBody })
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Action failed')
      }

      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setPicking(false)
    }
  }

  const handleCopyShareUrl = async () => {
    const url = `${window.location.origin}/casual/rotisserie/${shareId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const isCardPicked = (instanceId: string) => {
    return (data?.pickedCards || []).some(p => p.cardInstanceId === instanceId)
  }

  const getMyPicks = () => {
    if (!data || !user) return []
    return (data.pickedCards || [])
      .filter(p => p.playerId === user.id)
      .map(p => {
        return (data.cardPool || []).find(c => c.instanceId === p.cardInstanceId) ||
          (data.leaders || []).find(c => c.instanceId === p.cardInstanceId) ||
          (data.bases || []).find(c => c.instanceId === p.cardInstanceId)
      })
      .filter(Boolean)
  }

  const getFilteredCards = () => {
    if (!data) return []

    let cards = [...(data.cardPool || [])]

    if (typeFilter === 'leaders') {
      cards = data.leaders || []
    } else if (typeFilter === 'bases') {
      cards = data.bases || []
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

  const getSetCardCounts = () => {
    if (!data) return []
    const allCards = [...(data.cardPool || []), ...(data.leaders || []), ...(data.bases || [])]
    return (data.setCodes || []).map(setCode => {
      const count = allCards.filter(c => c.set === setCode).length
      return { setCode, count }
    })
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

  const upcomingCount = Math.min(players.length * 2 + 1, 10)
  const upcomingPicks = data.status === 'active'
    ? getUpcomingPicks(data.currentPickerIndex, data.pickDirection, players, upcomingCount)
    : []
  const turnsAway = upcomingPicks.length > 1 && user
    ? upcomingPicks.findIndex((p, i) => i > 0 && p.id === user.id)
    : -1

  // Lobby view when waiting
  if (data.status === 'waiting') {
    const setCardCounts = getSetCardCounts()
    const totalCards = (data.cardPool || []).length + (data.leaders || []).length + (data.bases || []).length

    return (
      <div className="rotisserie-play-page">
        <div className="rotisserie-header">
          <h1>Rotisserie Draft</h1>
          <span className="status-badge waiting">waiting</span>
        </div>

        <div className="rotisserie-lobby">
          <div className="share-section">
            <span className="share-label">Share Link:</span>
            <Button variant="secondary" size="sm" className="copy-url-button" onClick={handleCopyShareUrl}>
              <CopyIcon />
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </Button>
          </div>

          {!hasJoined && user && (
            <div className="join-section">
              <Button variant="primary" onClick={() => handleAction('join')}>
                Join Draft
              </Button>
            </div>
          )}

          <div className="lobby-columns">
            <div className="lobby-left">
              <div className="players-section">
                <h3>Players ({players.length}/{data.maxPlayers})</h3>
                {players.map((player) => (
                  <div key={player.id} className="player-item">
                    <span className="player-seat">{player.seat}</span>
                    <span className="player-name">
                      {player.name}
                      {player.id === user?.id && ' (You)'}
                    </span>
                  </div>
                ))}

                {isHost && players.length < data.maxPlayers && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="add-bot-button"
                    onClick={() => handleAction('add-bot')}
                    disabled={picking}
                  >
                    + Add Bot
                  </Button>
                )}

                {isHost && (
                  <div className="max-players-row">
                    <label htmlFor="max-players">Max Players:</label>
                    <input
                      id="max-players"
                      type="number"
                      min={Math.max(2, players.length)}
                      max={16}
                      value={data.maxPlayers}
                      className="max-players-input"
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        if (!isNaN(val)) {
                          handleAction('update-settings', { maxPlayers: val })
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="lobby-right">
              <div className="set-info-section">
                <h3>Draft Info</h3>
                {setCardCounts.map(({ setCode, count }) => (
                  <div key={setCode} className="set-info-row">
                    <span className="set-code">{setCode}</span>
                    <span className="set-count">{count} cards</span>
                  </div>
                ))}
                <div className="set-info-row total">
                  <span>Total</span>
                  <span>{totalCards} cards</span>
                </div>
                <div className="set-info-row">
                  <span>Cards per player</span>
                  <span>50</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rules-section">
            <h3>How Rotisserie Works</h3>
            <p>
              All cards from the selected sets are laid out face-up.
              Players take turns picking one card at a time in
              snake draft order (1&rarr;2&rarr;3&rarr;3&rarr;2&rarr;1&rarr;...).
              Each player picks 50 cards, then builds a 30-card
              deck from their picks.
            </p>
            <p className="rules-link">
              <a href="https://starwarsunlimited.com/articles/behind-unlimited-a-rotisserie-draft" target="_blank" rel="noopener noreferrer">
                Read more on the official blog &rarr;
              </a>
            </p>
          </div>

          <div className="lobby-actions">
            {isHost && players.length >= 2 && (
              <Button variant="primary" onClick={() => handleAction('start')}>
                Start Draft
              </Button>
            )}
            {isHost && players.length < 2 && (
              <p className="waiting-text">Need at least 2 players to start</p>
            )}
            <Button variant="back" onClick={() => router.push('/casual/rotisserie')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Active / Completed draft view
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
                  {(data.pickedCards || []).filter(p => p.playerId === player.id).length} picks
                </span>
              </div>
            ))}
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
            <>
              <div className={`turn-indicator ${isMyTurn ? 'my-turn' : ''}`}>
                <div>{isMyTurn ? "It's your turn to pick!" : `Waiting for ${currentPicker?.name}...`}</div>
                {!isMyTurn && turnsAway > 0 && (
                  <div className="turns-away">You pick in {turnsAway} {turnsAway === 1 ? 'turn' : 'turns'}</div>
                )}
              </div>
              <div className="pick-order-strip">
                <span className="pick-order-label">UPCOMING</span>
                {upcomingPicks.map((player, i) => {
                  const isCurrentPick = i === 0
                  const isYou = user && player.id === user.id
                  let chipClass = 'pick-chip'
                  if (isCurrentPick) chipClass += ' current'
                  else if (isYou) chipClass += ' you'
                  return (
                    <span key={i}>
                      {i > 0 && <span className="pick-separator">&rsaquo;</span>}
                      <span className={chipClass}>
                        {isYou ? 'You' : player.name}
                      </span>
                    </span>
                  )
                })}
              </div>
            </>
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
                      handleAction('pick', { cardInstanceId: card.instanceId })
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
