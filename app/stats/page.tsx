// @ts-nocheck
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useCardPreview } from '@/src/hooks/useCardPreview'
import { CardPreview } from '@/src/components/DeckBuilder/CardPreview'
import './stats.css'

// Stats start date - default to env var, or 2026-02-12 when position-based slot_type tracking was deployed.
const DEFAULT_START_DATE = process.env.NEXT_PUBLIC_STATS_START_DATE || '2026-02-12'

// Format numbers with commas
const fmt = (n: number) => n.toLocaleString()

// Format a YYYY-MM-DD date for display
const formatDate = (dateStr: string) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

// Get today as YYYY-MM-DD
const todayStr = () => new Date().toISOString().slice(0, 10)

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState('LAW')
  const [includeBots, setIncludeBots] = useState(false)
  const [includeHumans, setIncludeHumans] = useState(true)
  const [builtDeckOnly, setBuiltDeckOnly] = useState(false)
  const [tournamentOnly, setTournamentOnly] = useState(false)
  const [startDate, setStartDate] = useState(DEFAULT_START_DATE)
  const [endDate, setEndDate] = useState(todayStr())
  const [editingStart, setEditingStart] = useState(false)
  const [editingEnd, setEditingEnd] = useState(false)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) setActiveTab(hash)
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash) setActiveTab(hash)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    window.location.hash = tab
  }

  const tabs = ['LAW', 'SEC', 'LOF', 'JTL', 'TWI', 'SHD', 'SOR']

  const setColors: Record<string, string> = {
    'SOR': '#CC0000',
    'SHD': '#6B21A8',
    'TWI': '#0891B2',
    'JTL': '#EA580C',
    'LOF': '#16A34A',
    'SEC': '#7C3AED',
    'LAW': '#D93600'
  }

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h1>Stats</h1>
        <p>Card performance across drafts and sealed</p>
        <div className="stats-date-range">
          <span className="date-field">
            {editingStart ? (
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onBlur={() => setEditingStart(false)}
                autoFocus
                className="date-input"
              />
            ) : (
              <>
                <span className="date-display">{formatDate(startDate)}</span>
                <button className="date-edit-btn" onClick={() => setEditingStart(true)} title="Change start date">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  </svg>
                </button>
              </>
            )}
          </span>
          <span className="date-separator"> to </span>
          <span className="date-field">
            {editingEnd ? (
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onBlur={() => setEditingEnd(false)}
                autoFocus
                className="date-input"
              />
            ) : (
              <>
                <span className="date-display">{formatDate(endDate)}</span>
                <button className="date-edit-btn" onClick={() => setEditingEnd(true)} title="Change end date">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  </svg>
                </button>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Bot/Human filter checkboxes */}
      <div className="stats-filters">
        <label className="stats-filter-checkbox">
          <input
            type="checkbox"
            checked={includeHumans}
            onChange={(e) => setIncludeHumans(e.target.checked)}
          />
          Include Humans
        </label>
        <label className="stats-filter-checkbox">
          <input
            type="checkbox"
            checked={includeBots}
            onChange={(e) => setIncludeBots(e.target.checked)}
          />
          Include Bots
        </label>
        <label className="stats-filter-checkbox">
          <input
            type="checkbox"
            checked={builtDeckOnly}
            onChange={(e) => setBuiltDeckOnly(e.target.checked)}
          />
          Completed Pods Only
        </label>
        <label className="stats-filter-checkbox">
          <input
            type="checkbox"
            checked={tournamentOnly}
            onChange={(e) => setTournamentOnly(e.target.checked)}
          />
          Tournament Players Only
        </label>
      </div>

      <div className="stats-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`stats-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => handleTabChange(tab)}
            style={setColors[tab] ? {
              '--set-color': setColors[tab],
              ...(activeTab === tab ? {
                backgroundColor: setColors[tab],
                borderBottomColor: setColors[tab]
              } : {})
            } : {}}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="stats-content">
        {!includeHumans && !includeBots ? (
          <div className="stats-empty">
            <p>Select at least one player type to view statistics.</p>
          </div>
        ) : (
          <SetStatsTab
            setCode={activeTab}
            includeBots={includeBots}
            includeHumans={includeHumans}
            builtDeckOnly={builtDeckOnly}
            tournamentOnly={tournamentOnly}
            startDate={startDate}
            endDate={endDate}
          />
        )}
      </div>
    </div>
  )
}

interface SetStatsTabProps {
  setCode: string
  includeBots: boolean
  includeHumans: boolean
  builtDeckOnly: boolean
  tournamentOnly: boolean
  startDate: string
  endDate: string
}

function SetStatsTab({ setCode, includeBots, includeHumans, builtDeckOnly, tournamentOnly, startDate, endDate }: SetStatsTabProps) {
  const [subTab, setSubTab] = useState('draft')

  return (
    <div className="generation-stats">
      <div className="stats-subtabs">
        <button
          className={`stats-subtab ${subTab === 'draft' ? 'active' : ''}`}
          onClick={() => setSubTab('draft')}
        >
          Draft
        </button>
        <button
          className={`stats-subtab ${subTab === 'sealed' ? 'active' : ''}`}
          onClick={() => setSubTab('sealed')}
        >
          Sealed
        </button>
      </div>

      {subTab === 'draft' ? (
        <DraftTab setCode={setCode} includeBots={includeBots} includeHumans={includeHumans} builtDeckOnly={builtDeckOnly} tournamentOnly={tournamentOnly} startDate={startDate} endDate={endDate} />
      ) : (
        <SealedTab setCode={setCode} includeBots={includeBots} includeHumans={includeHumans} tournamentOnly={tournamentOnly} startDate={startDate} endDate={endDate} />
      )}
    </div>
  )
}

// === Shared Types ===

interface DraftPickCard {
  cardName: string
  cardId: string
  rarity: string
  cardType: string
  timesPicked: number
  firstPicks: number
  firstPickPct: number | null
  avgPickPosition: number
  draftsSeenIn: number
  aspects: string[]
  subtitle: string | null
  cost: number | null
  imageUrl: string | null
}

interface DraftPickStats {
  setCode: string
  totalPicks: number
  totalDrafts: number
  totalDrafters: number
  cards: DraftPickCard[]
}

interface DeckInclusionCard {
  cardName: string
  cardId: string
  rarity: string
  cardType: string
  aspects: string[]
  poolsWithCard: number
  decksWithCard: number
  inclusionRate: number
  avgCopiesPlayed: number
  subtitle: string | null
  cost: number | null
  imageUrl: string | null
}

interface DeckInclusionStats {
  setCode: string
  totalPoolsWithDecks: number
  cards: DeckInclusionCard[]
}

interface LeaderSelection {
  cardName: string
  cardId: string
  timesSelected: number
  selectionRate: number
  aspects: string[]
  subtitle: string | null
  imageUrl: string | null
}

type SortKey = 'cardName' | 'rarity' | 'avgPickPosition' | 'firstPickPct' | 'timesPicked'
type DeckSortKey = 'cardName' | 'rarity' | 'inclusionRate' | 'avgCopiesPlayed' | 'poolsWithCard'
type LeaderSortKey = 'cardName' | 'avgPickPosition' | 'firstPickPct' | 'timesPicked'
type LeaderSelSortKey = 'cardName' | 'timesSelected' | 'selectionRate'

const RARITY_ORDER: Record<string, number> = { 'Legendary': 0, 'Rare': 1, 'Uncommon': 2, 'Common': 3 }

// === Shared Skeleton ===

function LoadingSkeleton() {
  return (
    <div className="stats-loading-skeleton">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="skeleton-row">
          <div className="skeleton-line" style={{ maxWidth: '140px' }} />
          <div className="skeleton-line" style={{ maxWidth: '60px' }} />
          <div className="skeleton-line" style={{ maxWidth: '60px' }} />
          <div className="skeleton-line" style={{ maxWidth: '80px' }} />
        </div>
      ))}
    </div>
  )
}

// === Draft Tab (Cards + Leaders) ===

interface TabProps {
  setCode: string
  includeBots: boolean
  includeHumans: boolean
  builtDeckOnly?: boolean
  tournamentOnly?: boolean
  startDate: string
  endDate: string
}

function DraftTab({ setCode, includeBots, includeHumans, builtDeckOnly, tournamentOnly, startDate, endDate }: TabProps) {
  const [cardData, setCardData] = useState<DraftPickStats | null>(null)
  const [leaderData, setLeaderData] = useState<DraftPickStats | null>(null)
  const [leaderSelData, setLeaderSelData] = useState<{ totalDecks: number; leaders: LeaderSelection[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [cardSortKey, setCardSortKey] = useState<SortKey>('avgPickPosition')
  const [cardSortAsc, setCardSortAsc] = useState(true)
  const [leaderSortKey, setLeaderSortKey] = useState<LeaderSortKey>('avgPickPosition')
  const [leaderSortAsc, setLeaderSortAsc] = useState(true)
  const [leaderSelSortKey, setLeaderSelSortKey] = useState<LeaderSelSortKey>('timesSelected')
  const [leaderSelSortAsc, setLeaderSelSortAsc] = useState(false)
  const {
    hoveredCardPreview,
    handleCardMouseEnter,
    handleCardMouseLeave,
    handlePreviewMouseEnter,
    handlePreviewMouseLeave,
    handleCardTouchStart,
    handleCardTouchEnd,
    dismissPreview,
  } = useCardPreview()

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({
      setCode,
      since: startDate,
      until: endDate,
      includeBots: String(includeBots),
      includeHumans: String(includeHumans),
    })
    if (builtDeckOnly) params.set('builtDeckOnly', 'true')
    if (tournamentOnly) params.set('tournamentOnly', 'true')

    Promise.all([
      fetch(`/api/stats/draft-picks?${params}`)
        .then(r => r.json())
        .then(result => setCardData(result.data || result))
        .catch(err => console.error('Error fetching card draft picks:', err)),
      fetch(`/api/stats/draft-picks?${params}&type=leaders`)
        .then(r => r.json())
        .then(result => setLeaderData(result.data || result))
        .catch(err => console.error('Error fetching leader draft picks:', err)),
      fetch(`/api/stats/leader-selection?${params}&poolType=draft`)
        .then(r => r.json())
        .then(result => setLeaderSelData(result.data || result))
        .catch(err => console.error('Error fetching leader selection:', err)),
    ])
      .finally(() => setLoading(false))
  }, [setCode, includeBots, includeHumans, builtDeckOnly, tournamentOnly, startDate, endDate])

  const handleCardSort = (key: SortKey) => {
    if (cardSortKey === key) setCardSortAsc(!cardSortAsc)
    else { setCardSortKey(key); setCardSortAsc(key === 'avgPickPosition' || key === 'cardName') }
  }

  const handleLeaderSort = (key: LeaderSortKey) => {
    if (leaderSortKey === key) setLeaderSortAsc(!leaderSortAsc)
    else { setLeaderSortKey(key); setLeaderSortAsc(key === 'avgPickPosition' || key === 'cardName') }
  }

  const handleLeaderSelSort = (key: LeaderSelSortKey) => {
    if (leaderSelSortKey === key) setLeaderSelSortAsc(!leaderSelSortAsc)
    else { setLeaderSelSortKey(key); setLeaderSelSortAsc(key === 'cardName') }
  }

  const sortedCards = useMemo(() => {
    if (!cardData?.cards) return []
    return [...cardData.cards].sort((a, b) => {
      let cmp = 0
      switch (cardSortKey) {
        case 'cardName': cmp = a.cardName.localeCompare(b.cardName); break
        case 'rarity': cmp = (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9); break
        case 'avgPickPosition': cmp = a.avgPickPosition - b.avgPickPosition; break
        case 'firstPickPct': cmp = (a.firstPickPct ?? -1) - (b.firstPickPct ?? -1); break
        case 'timesPicked': cmp = a.timesPicked - b.timesPicked; break
      }
      return cardSortAsc ? cmp : -cmp
    })
  }, [cardData?.cards, cardSortKey, cardSortAsc])

  const sortedLeaders = useMemo(() => {
    if (!leaderData?.cards) return []
    return [...leaderData.cards].sort((a, b) => {
      let cmp = 0
      switch (leaderSortKey) {
        case 'cardName': cmp = a.cardName.localeCompare(b.cardName); break
        case 'avgPickPosition': cmp = a.avgPickPosition - b.avgPickPosition; break
        case 'firstPickPct': cmp = (a.firstPickPct ?? -1) - (b.firstPickPct ?? -1); break
        case 'timesPicked': cmp = a.timesPicked - b.timesPicked; break
      }
      return leaderSortAsc ? cmp : -cmp
    })
  }, [leaderData?.cards, leaderSortKey, leaderSortAsc])

  const sortedLeaderSel = useMemo(() => {
    if (!leaderSelData?.leaders) return []
    return [...leaderSelData.leaders].sort((a, b) => {
      let cmp = 0
      switch (leaderSelSortKey) {
        case 'cardName': cmp = a.cardName.localeCompare(b.cardName); break
        case 'timesSelected': cmp = a.timesSelected - b.timesSelected; break
        case 'selectionRate': cmp = a.selectionRate - b.selectionRate; break
      }
      return leaderSelSortAsc ? cmp : -cmp
    })
  }, [leaderSelData?.leaders, leaderSelSortKey, leaderSelSortAsc])

  if (loading) return <LoadingSkeleton />

  const pickClass = (avg: number) =>
    avg <= 3 ? 'pick-early' : avg <= 7 ? 'pick-mid' : 'pick-late'
  const leaderPickClass = (avg: number) =>
    avg <= 1.5 ? 'pick-early' : avg <= 3 ? 'pick-mid' : 'pick-late'
  const rarityClass = (r: string) => `rarity-${r.toLowerCase()}`

  const CardSortHeader = ({ label, col, title }: { label: string, col: SortKey, title?: string }) => (
    <th className={`sortable ${cardSortKey === col ? 'active' : ''}`} onClick={() => handleCardSort(col)} title={title}>
      {label}{cardSortKey === col && <span className="sort-indicator">{cardSortAsc ? ' ▲' : ' ▼'}</span>}
    </th>
  )
  const LeaderSortHeader = ({ label, col, title }: { label: string, col: LeaderSortKey, title?: string }) => (
    <th className={`sortable ${leaderSortKey === col ? 'active' : ''}`} onClick={() => handleLeaderSort(col)} title={title}>
      {label}{leaderSortKey === col && <span className="sort-indicator">{leaderSortAsc ? ' ▲' : ' ▼'}</span>}
    </th>
  )
  const LeaderSelSortHeader = ({ label, col, title }: { label: string, col: LeaderSelSortKey, title?: string }) => (
    <th className={`sortable ${leaderSelSortKey === col ? 'active' : ''}`} onClick={() => handleLeaderSelSort(col)} title={title}>
      {label}{leaderSelSortKey === col && <span className="sort-indicator">{leaderSelSortAsc ? ' ▲' : ' ▼'}</span>}
    </th>
  )

  const hasCards = cardData && cardData.cards && cardData.cards.length > 0
  const hasLeaders = leaderData && leaderData.cards && leaderData.cards.length > 0
  const hasLeaderSel = leaderSelData && leaderSelData.leaders && leaderSelData.leaders.length > 0

  if (!hasCards && !hasLeaders) {
    return (
      <div className="stats-empty">
        <p>No draft data available for {setCode} yet.</p>
        <p>Draft pick statistics will appear after drafts are completed.</p>
      </div>
    )
  }

  return (
    <div className="cards-subtab">
      {/* Leaders Section */}
      {(hasLeaders || hasLeaderSel) && (
        <>
          <h3 style={{ marginBottom: '0.5rem' }}>Leaders</h3>

          {/* Leader Draft Picks */}
          {hasLeaders && (
            <>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Draft pick order ({fmt(leaderData.totalDrafts)} drafts, {fmt(leaderData.totalPicks)} leader picks)
              </p>
              <div className="stats-table-container" style={{ marginBottom: '1.5rem' }}>
                <table className="stats-table">
                  <thead>
                    <tr>
                      <LeaderSortHeader label="Leader" col="cardName" />
                      <LeaderSortHeader label="Avg Pick" col="avgPickPosition" title="Average position this leader is picked in leader rounds (1 = first pick)" />
                      <LeaderSortHeader label="1st Pick" col="firstPickPct" title="How often this leader is picked first overall in leader rounds" />
                      <th>Aspects</th>
                      <LeaderSortHeader label="# Drafted" col="timesPicked" />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLeaders.map(card => (
                      <tr key={card.cardId}>
                        <td
                          className="card-name-cell"
                          onMouseEnter={(e) => handleCardMouseEnter({ imageUrl: card.imageUrl || undefined, name: card.cardName, rarity: card.rarity, isLeader: true }, e)}
                          onMouseLeave={handleCardMouseLeave}
                          onTouchStart={() => handleCardTouchStart({ imageUrl: card.imageUrl || undefined, name: card.cardName, rarity: card.rarity, isLeader: true })}
                          onTouchEnd={handleCardTouchEnd}
                        >
                          <span className="card-name">{card.cardName}</span>
                          {card.subtitle && <span className="card-subtitle-inline">, {card.subtitle}</span>}
                        </td>
                        <td className={leaderPickClass(card.avgPickPosition)}>{card.avgPickPosition.toFixed(1)}</td>
                        <td className={card.firstPickPct && card.firstPickPct >= 20 ? 'first-pick-high' : ''}>
                          {card.firstPicks}/{card.timesPicked} ({card.firstPickPct !== null ? `${card.firstPickPct}%` : '—'})
                        </td>
                        <td>
                          <div className="aspects-cell">
                            {card.aspects.map((aspect, i) => (
                              <img key={i} src={`/icons/${aspect.toLowerCase()}.png`} alt={aspect} className="aspect-icon" />
                            ))}
                          </div>
                        </td>
                        <td>{fmt(card.timesPicked)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Leader Deck Selection */}
          {hasLeaderSel && (
            <>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Deck selection rate ({fmt(leaderSelData.totalDecks)} draft decks built)
              </p>
              <div className="stats-table-container" style={{ marginBottom: '2rem' }}>
                <table className="stats-table">
                  <thead>
                    <tr>
                      <LeaderSelSortHeader label="Leader" col="cardName" />
                      <LeaderSelSortHeader label="Selection %" col="selectionRate" title="Percentage of all built decks that chose this leader" />
                      <th>Aspects</th>
                      <LeaderSelSortHeader label="# Selected" col="timesSelected" />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLeaderSel.map(leader => (
                      <tr key={leader.cardId}>
                        <td
                          className="card-name-cell"
                          onMouseEnter={(e) => handleCardMouseEnter({ imageUrl: leader.imageUrl || undefined, name: leader.cardName, rarity: 'Legendary', isLeader: true }, e)}
                          onMouseLeave={handleCardMouseLeave}
                          onTouchStart={() => handleCardTouchStart({ imageUrl: leader.imageUrl || undefined, name: leader.cardName, rarity: 'Legendary', isLeader: true })}
                          onTouchEnd={handleCardTouchEnd}
                        >
                          <span className="card-name">{leader.cardName}</span>
                          {leader.subtitle && <span className="card-subtitle-inline">, {leader.subtitle}</span>}
                        </td>
                        <td className={leader.selectionRate >= 5 ? 'pick-early' : leader.selectionRate >= 2 ? 'pick-mid' : ''}>{leader.selectionRate.toFixed(1)}%</td>
                        <td>
                          <div className="aspects-cell">
                            {leader.aspects.map((aspect, i) => (
                              <img key={i} src={`/icons/${aspect.toLowerCase()}.png`} alt={aspect} className="aspect-icon" />
                            ))}
                          </div>
                        </td>
                        <td>{fmt(leader.timesSelected)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Cards Section */}
      {hasCards && (
        <>
          <h3 style={{ marginBottom: '0.5rem' }}>Cards</h3>
          <div className="draft-picks-summary">
            <div className="stat-item">
              <span className="stat-label">Drafts:</span>
              <span className="stat-value">{fmt(cardData.totalDrafts)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Picks:</span>
              <span className="stat-value">{fmt(cardData.totalPicks)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Drafters:</span>
              <span className="stat-value">{fmt(cardData.totalDrafters)}</span>
            </div>
          </div>

          {cardData.totalPicks < 100 && (
            <p className="stats-warning">
              Small sample size ({fmt(cardData.totalPicks)} picks from {fmt(cardData.totalDrafts)} drafts). Statistics may not be reliable yet.
            </p>
          )}

          <div className="stats-table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <CardSortHeader label="Name" col="cardName" />
                  <CardSortHeader label="Avg Pick" col="avgPickPosition" title="Average position this card is picked within a pack (1 = first pick, 14 = last). Lower is better." />
                  <CardSortHeader label="1st Pick" col="firstPickPct" title="How often this card is the first pick out of a fresh pack (pick position 1 of 14)." />
                  <CardSortHeader label="Rarity" col="rarity" />
                  <th>Aspects</th>
                  <CardSortHeader label="# Drafted" col="timesPicked" title="Total number of times this card was drafted across all drafts." />
                </tr>
              </thead>
              <tbody>
                {sortedCards.map(card => (
                  <tr key={card.cardId}>
                    <td
                      className="card-name-cell"
                      onMouseEnter={(e) => handleCardMouseEnter({ imageUrl: card.imageUrl || undefined, name: card.cardName, rarity: card.rarity }, e)}
                      onMouseLeave={handleCardMouseLeave}
                      onTouchStart={() => handleCardTouchStart({ imageUrl: card.imageUrl || undefined, name: card.cardName, rarity: card.rarity })}
                      onTouchEnd={handleCardTouchEnd}
                    >
                      <span className="card-name">{card.cardName}</span>
                      {card.subtitle && <span className="card-subtitle-inline">, {card.subtitle}</span>}
                    </td>
                    <td className={pickClass(card.avgPickPosition)}>{Math.round(card.avgPickPosition)}</td>
                    <td className={card.firstPickPct && card.firstPickPct >= 10 ? 'first-pick-high' : ''}>
                      {card.firstPicks}/{card.timesPicked} ({card.firstPickPct !== null ? `${card.firstPickPct}%` : '—'})
                    </td>
                    <td><span className={rarityClass(card.rarity)}>{card.rarity}</span></td>
                    <td>
                      <div className="aspects-cell">
                        {card.aspects.map((aspect, i) => (
                          <img key={i} src={`/icons/${aspect.toLowerCase()}.png`} alt={aspect} className="aspect-icon" />
                        ))}
                      </div>
                    </td>
                    <td>{fmt(card.timesPicked)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {hoveredCardPreview && (
        <CardPreview
          card={hoveredCardPreview.card}
          x={hoveredCardPreview.x}
          y={hoveredCardPreview.y}
          isMobile={hoveredCardPreview.isMobile}
          onMouseEnter={handlePreviewMouseEnter}
          onMouseLeave={handlePreviewMouseLeave}
          onDismiss={dismissPreview}
        />
      )}
    </div>
  )
}

// === Sealed Tab ===

function SealedTab({ setCode, includeBots, includeHumans, tournamentOnly, startDate, endDate }: TabProps) {
  const [cardData, setCardData] = useState<DeckInclusionStats | null>(null)
  const [leaderSelData, setLeaderSelData] = useState<{ totalDecks: number; leaders: LeaderSelection[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [cardSortKey, setCardSortKey] = useState<DeckSortKey>('inclusionRate')
  const [cardSortAsc, setCardSortAsc] = useState(false)
  const [leaderSelSortKey, setLeaderSelSortKey] = useState<LeaderSelSortKey>('timesSelected')
  const [leaderSelSortAsc, setLeaderSelSortAsc] = useState(false)
  const {
    hoveredCardPreview,
    handleCardMouseEnter,
    handleCardMouseLeave,
    handlePreviewMouseEnter,
    handlePreviewMouseLeave,
    handleCardTouchStart,
    handleCardTouchEnd,
    dismissPreview,
  } = useCardPreview()

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({
      setCode,
      since: startDate,
      until: endDate,
      includeBots: String(includeBots),
      includeHumans: String(includeHumans),
      poolType: 'sealed',
    })
    if (tournamentOnly) params.set('tournamentOnly', 'true')

    Promise.all([
      fetch(`/api/stats/deck-inclusion?${params}`)
        .then(r => r.json())
        .then(result => setCardData(result.data || result))
        .catch(err => console.error('Error fetching deck inclusion:', err)),
      fetch(`/api/stats/leader-selection?${params}`)
        .then(r => r.json())
        .then(result => setLeaderSelData(result.data || result))
        .catch(err => console.error('Error fetching leader selection:', err)),
    ])
      .finally(() => setLoading(false))
  }, [setCode, includeBots, includeHumans, tournamentOnly, startDate, endDate])

  const handleCardSort = (key: DeckSortKey) => {
    if (cardSortKey === key) setCardSortAsc(!cardSortAsc)
    else { setCardSortKey(key); setCardSortAsc(key === 'cardName') }
  }

  const handleLeaderSelSort = (key: LeaderSelSortKey) => {
    if (leaderSelSortKey === key) setLeaderSelSortAsc(!leaderSelSortAsc)
    else { setLeaderSelSortKey(key); setLeaderSelSortAsc(key === 'cardName') }
  }

  const sortedCards = useMemo(() => {
    if (!cardData?.cards) return []
    return [...cardData.cards].sort((a, b) => {
      let cmp = 0
      switch (cardSortKey) {
        case 'cardName': cmp = a.cardName.localeCompare(b.cardName); break
        case 'rarity': cmp = (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9); break
        case 'inclusionRate': cmp = a.inclusionRate - b.inclusionRate; break
        case 'avgCopiesPlayed': cmp = a.avgCopiesPlayed - b.avgCopiesPlayed; break
        case 'poolsWithCard': cmp = a.poolsWithCard - b.poolsWithCard; break
      }
      return cardSortAsc ? cmp : -cmp
    })
  }, [cardData?.cards, cardSortKey, cardSortAsc])

  const sortedLeaderSel = useMemo(() => {
    if (!leaderSelData?.leaders) return []
    return [...leaderSelData.leaders].sort((a, b) => {
      let cmp = 0
      switch (leaderSelSortKey) {
        case 'cardName': cmp = a.cardName.localeCompare(b.cardName); break
        case 'timesSelected': cmp = a.timesSelected - b.timesSelected; break
        case 'selectionRate': cmp = a.selectionRate - b.selectionRate; break
      }
      return leaderSelSortAsc ? cmp : -cmp
    })
  }, [leaderSelData?.leaders, leaderSelSortKey, leaderSelSortAsc])

  if (loading) return <LoadingSkeleton />

  const hasCards = cardData && cardData.cards && cardData.cards.length > 0
  const hasLeaderSel = leaderSelData && leaderSelData.leaders && leaderSelData.leaders.length > 0

  if (!hasCards && !hasLeaderSel) {
    return (
      <div className="stats-empty">
        <p>No sealed data available for {setCode} yet.</p>
        <p>Sealed statistics will appear after players build decks from sealed pools.</p>
      </div>
    )
  }

  const inclusionClass = (rate: number) =>
    rate >= 75 ? 'pick-early' : rate >= 40 ? 'pick-mid' : 'pick-late'
  const rarityClass = (r: string) => `rarity-${r.toLowerCase()}`

  const CardSortHeader = ({ label, col, title }: { label: string, col: DeckSortKey, title?: string }) => (
    <th className={`sortable ${cardSortKey === col ? 'active' : ''}`} onClick={() => handleCardSort(col)} title={title}>
      {label}{cardSortKey === col && <span className="sort-indicator">{cardSortAsc ? ' ▲' : ' ▼'}</span>}
    </th>
  )
  const LeaderSelSortHeader = ({ label, col, title }: { label: string, col: LeaderSelSortKey, title?: string }) => (
    <th className={`sortable ${leaderSelSortKey === col ? 'active' : ''}`} onClick={() => handleLeaderSelSort(col)} title={title}>
      {label}{leaderSelSortKey === col && <span className="sort-indicator">{leaderSelSortAsc ? ' ▲' : ' ▼'}</span>}
    </th>
  )

  return (
    <div className="cards-subtab">
      {/* Leader Selection */}
      {hasLeaderSel && (
        <>
          <h3 style={{ marginBottom: '0.5rem' }}>Leaders</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            How often each leader is chosen for sealed decks ({fmt(leaderSelData.totalDecks)} decks)
          </p>
          <div className="stats-table-container" style={{ marginBottom: '2rem' }}>
            <table className="stats-table">
              <thead>
                <tr>
                  <LeaderSelSortHeader label="Leader" col="cardName" />
                  <LeaderSelSortHeader label="Selection %" col="selectionRate" title="Percentage of sealed decks that chose this leader" />
                  <th>Aspects</th>
                  <LeaderSelSortHeader label="# Selected" col="timesSelected" />
                </tr>
              </thead>
              <tbody>
                {sortedLeaderSel.map(leader => (
                  <tr key={leader.cardId}>
                    <td
                      className="card-name-cell"
                      onMouseEnter={(e) => handleCardMouseEnter({ imageUrl: leader.imageUrl || undefined, name: leader.cardName, rarity: 'Legendary', isLeader: true }, e)}
                      onMouseLeave={handleCardMouseLeave}
                      onTouchStart={() => handleCardTouchStart({ imageUrl: leader.imageUrl || undefined, name: leader.cardName, rarity: 'Legendary', isLeader: true })}
                      onTouchEnd={handleCardTouchEnd}
                    >
                      <span className="card-name">{leader.cardName}</span>
                      {leader.subtitle && <span className="card-subtitle-inline">, {leader.subtitle}</span>}
                    </td>
                    <td className={leader.selectionRate >= 5 ? 'pick-early' : leader.selectionRate >= 2 ? 'pick-mid' : ''}>{leader.selectionRate.toFixed(1)}%</td>
                    <td>
                      <div className="aspects-cell">
                        {leader.aspects.map((aspect, i) => (
                          <img key={i} src={`/icons/${aspect.toLowerCase()}.png`} alt={aspect} className="aspect-icon" />
                        ))}
                      </div>
                    </td>
                    <td>{fmt(leader.timesSelected)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Card Inclusion */}
      {hasCards && (
        <>
          <h3 style={{ marginBottom: '0.5rem' }}>Cards</h3>
          <div className="draft-picks-summary">
            <div className="stat-item">
              <span className="stat-label">Pools with Decks:</span>
              <span className="stat-value">{fmt(cardData.totalPoolsWithDecks)}</span>
            </div>
          </div>

          {cardData.totalPoolsWithDecks < 20 && (
            <p className="stats-warning">
              Small sample size ({fmt(cardData.totalPoolsWithDecks)} pools with built decks). Statistics may not be reliable yet.
            </p>
          )}

          <div className="stats-table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <CardSortHeader label="Name" col="cardName" />
                  <CardSortHeader label="Inclusion %" col="inclusionRate" title="When this card is in your pool, how often does it make your deck?" />
                  <CardSortHeader label="Avg Copies" col="avgCopiesPlayed" title="When you include this card, how many copies do you run?" />
                  <CardSortHeader label="Rarity" col="rarity" />
                  <th>Aspects</th>
                  <CardSortHeader label="Pools" col="poolsWithCard" title="Number of sealed pools that contained this card" />
                </tr>
              </thead>
              <tbody>
                {sortedCards.map(card => (
                  <tr key={card.cardId}>
                    <td
                      className="card-name-cell"
                      onMouseEnter={(e) => handleCardMouseEnter({ imageUrl: card.imageUrl || undefined, name: card.cardName, rarity: card.rarity }, e)}
                      onMouseLeave={handleCardMouseLeave}
                      onTouchStart={() => handleCardTouchStart({ imageUrl: card.imageUrl || undefined, name: card.cardName, rarity: card.rarity })}
                      onTouchEnd={handleCardTouchEnd}
                    >
                      <span className="card-name">{card.cardName}</span>
                      {card.subtitle && <span className="card-subtitle-inline">, {card.subtitle}</span>}
                    </td>
                    <td className={inclusionClass(card.inclusionRate)}>{card.inclusionRate.toFixed(1)}%</td>
                    <td>{card.avgCopiesPlayed.toFixed(1)}</td>
                    <td><span className={rarityClass(card.rarity)}>{card.rarity}</span></td>
                    <td>
                      <div className="aspects-cell">
                        {card.aspects.map((aspect, i) => (
                          <img key={i} src={`/icons/${aspect.toLowerCase()}.png`} alt={aspect} className="aspect-icon" />
                        ))}
                      </div>
                    </td>
                    <td>{fmt(card.poolsWithCard)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {hoveredCardPreview && (
        <CardPreview
          card={hoveredCardPreview.card}
          x={hoveredCardPreview.x}
          y={hoveredCardPreview.y}
          isMobile={hoveredCardPreview.isMobile}
          onMouseEnter={handlePreviewMouseEnter}
          onMouseLeave={handlePreviewMouseLeave}
          onDismiss={dismissPreview}
        />
      )}
    </div>
  )
}
