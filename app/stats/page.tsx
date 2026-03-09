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
  const [activeTab, setActiveTab] = useState('SOR')
  const [includeBots, setIncludeBots] = useState(true)
  const [includeHumans, setIncludeHumans] = useState(true)
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

  const tabs = ['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC', 'LAW']

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
  startDate: string
  endDate: string
}

function SetStatsTab({ setCode, includeBots, includeHumans, startDate, endDate }: SetStatsTabProps) {
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
          className={`stats-subtab ${subTab === 'deckbuilding' ? 'active' : ''}`}
          onClick={() => setSubTab('deckbuilding')}
        >
          Deck Building
        </button>
        <button
          className={`stats-subtab ${subTab === 'leaders' ? 'active' : ''}`}
          onClick={() => setSubTab('leaders')}
        >
          Leaders
        </button>
      </div>

      {subTab === 'draft' ? (
        <CardsSubTab setCode={setCode} includeBots={includeBots} includeHumans={includeHumans} startDate={startDate} endDate={endDate} />
      ) : subTab === 'deckbuilding' ? (
        <DeckBuildingSubTab setCode={setCode} includeBots={includeBots} includeHumans={includeHumans} startDate={startDate} endDate={endDate} />
      ) : (
        <LeadersSubTab setCode={setCode} includeBots={includeBots} includeHumans={includeHumans} startDate={startDate} endDate={endDate} />
      )}
    </div>
  )
}

// === Draft Picks Sub-Tab ===

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

type SortKey = 'cardName' | 'rarity' | 'avgPickPosition' | 'firstPickPct' | 'timesPicked'

const RARITY_ORDER: Record<string, number> = { 'Legendary': 0, 'Rare': 1, 'Uncommon': 2, 'Common': 3 }

interface CardsSubTabProps {
  setCode: string
  includeBots: boolean
  includeHumans: boolean
  startDate: string
  endDate: string
}

function CardsSubTab({ setCode, includeBots, includeHumans, startDate, endDate }: CardsSubTabProps) {
  const [data, setData] = useState<DraftPickStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('avgPickPosition')
  const [sortAsc, setSortAsc] = useState(true)
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
    fetch(`/api/stats/draft-picks?${params}`)
      .then(r => r.json())
      .then(result => setData(result.data || result))
      .catch(err => console.error('Error fetching draft picks:', err))
      .finally(() => setLoading(false))
  }, [setCode, includeBots, includeHumans, startDate, endDate])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(key === 'avgPickPosition' || key === 'cardName')
    }
  }

  const sortedCards = useMemo(() => {
    if (!data?.cards) return []
    return [...data.cards].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'cardName': cmp = a.cardName.localeCompare(b.cardName); break
        case 'rarity': cmp = (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9); break
        case 'avgPickPosition': cmp = a.avgPickPosition - b.avgPickPosition; break
        case 'firstPickPct': cmp = (a.firstPickPct ?? -1) - (b.firstPickPct ?? -1); break
        case 'timesPicked': cmp = a.timesPicked - b.timesPicked; break
      }
      return sortAsc ? cmp : -cmp
    })
  }, [data?.cards, sortKey, sortAsc])

  if (loading) return (
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

  if (!data || !data.cards || data.cards.length === 0) {
    return (
      <div className="stats-empty">
        <p>No draft data available for {setCode} yet.</p>
        <p>Draft pick statistics will appear after drafts are completed.</p>
      </div>
    )
  }

  const SortHeader = ({ label, col, title }: { label: string, col: SortKey, title?: string }) => (
    <th className={`sortable ${sortKey === col ? 'active' : ''}`} onClick={() => handleSort(col)} title={title}>
      {label}
      {sortKey === col && <span className="sort-indicator">{sortAsc ? ' ▲' : ' ▼'}</span>}
    </th>
  )

  const pickClass = (avg: number) =>
    avg <= 3 ? 'pick-early' : avg <= 7 ? 'pick-mid' : 'pick-late'

  const rarityClass = (r: string) =>
    `rarity-${r.toLowerCase()}`

  return (
    <div className="cards-subtab">
      <div className="draft-picks-summary">
        <div className="stat-item">
          <span className="stat-label">Drafts:</span>
          <span className="stat-value">{fmt(data.totalDrafts)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Picks:</span>
          <span className="stat-value">{fmt(data.totalPicks)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Drafters:</span>
          <span className="stat-value">{fmt(data.totalDrafters)}</span>
        </div>
      </div>

      {data.totalPicks < 100 && (
        <p className="stats-warning">
          Small sample size ({fmt(data.totalPicks)} picks from {fmt(data.totalDrafts)} drafts). Statistics may not be reliable yet.
        </p>
      )}

      <div className="stats-table-container">
        <table className="stats-table">
          <thead>
            <tr>
              <SortHeader label="Name" col="cardName" />
              <SortHeader label="Avg Pick" col="avgPickPosition" title="Average position this card is picked within a pack (1 = first pick, 14 = last). Lower is better." />
              <SortHeader label="1st Pick" col="firstPickPct" title="How often this card is the first pick out of a fresh pack (pick position 1 of 14)." />
              <SortHeader label="Rarity" col="rarity" />
              <th>Aspects</th>
              <SortHeader label="# Drafted" col="timesPicked" title="Total number of times this card was drafted across all drafts." />
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

// === Deck Building Sub-Tab ===

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

type DeckSortKey = 'cardName' | 'rarity' | 'inclusionRate' | 'avgCopiesPlayed' | 'poolsWithCard'

interface DeckBuildingSubTabProps {
  setCode: string
  includeBots: boolean
  includeHumans: boolean
  startDate: string
  endDate: string
}

function DeckBuildingSubTab({ setCode, includeBots, includeHumans, startDate, endDate }: DeckBuildingSubTabProps) {
  const [data, setData] = useState<DeckInclusionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<DeckSortKey>('inclusionRate')
  const [sortAsc, setSortAsc] = useState(false)
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
    fetch(`/api/stats/deck-inclusion?${params}`)
      .then(r => r.json())
      .then(result => setData(result.data || result))
      .catch(err => console.error('Error fetching deck inclusion:', err))
      .finally(() => setLoading(false))
  }, [setCode, includeBots, includeHumans, startDate, endDate])

  const handleSort = (key: DeckSortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(key === 'cardName')
    }
  }

  const sortedCards = useMemo(() => {
    if (!data?.cards) return []
    return [...data.cards].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'cardName': cmp = a.cardName.localeCompare(b.cardName); break
        case 'rarity': cmp = (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9); break
        case 'inclusionRate': cmp = a.inclusionRate - b.inclusionRate; break
        case 'avgCopiesPlayed': cmp = a.avgCopiesPlayed - b.avgCopiesPlayed; break
        case 'poolsWithCard': cmp = a.poolsWithCard - b.poolsWithCard; break
      }
      return sortAsc ? cmp : -cmp
    })
  }, [data?.cards, sortKey, sortAsc])

  if (loading) return (
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

  if (!data || !data.cards || data.cards.length === 0) {
    return (
      <div className="stats-empty">
        <p>No deck building data available for {setCode} yet.</p>
        <p>Deck inclusion statistics will appear after players build decks from their pools.</p>
      </div>
    )
  }

  const SortHeader = ({ label, col, title }: { label: string, col: DeckSortKey, title?: string }) => (
    <th className={`sortable ${sortKey === col ? 'active' : ''}`} onClick={() => handleSort(col)} title={title}>
      {label}
      {sortKey === col && <span className="sort-indicator">{sortAsc ? ' ▲' : ' ▼'}</span>}
    </th>
  )

  const inclusionClass = (rate: number) =>
    rate >= 75 ? 'pick-early' : rate >= 40 ? 'pick-mid' : 'pick-late'

  const rarityClass = (r: string) =>
    `rarity-${r.toLowerCase()}`

  return (
    <div className="cards-subtab">
      <div className="draft-picks-summary">
        <div className="stat-item">
          <span className="stat-label">Pools with Decks:</span>
          <span className="stat-value">{fmt(data.totalPoolsWithDecks)}</span>
        </div>
      </div>

      {data.totalPoolsWithDecks < 20 && (
        <p className="stats-warning">
          Small sample size ({fmt(data.totalPoolsWithDecks)} pools with built decks). Statistics may not be reliable yet.
        </p>
      )}

      <div className="stats-table-container">
        <table className="stats-table">
          <thead>
            <tr>
              <SortHeader label="Name" col="cardName" />
              <SortHeader label="Inclusion %" col="inclusionRate" title="When this card is in your pool, how often does it make your deck?" />
              <SortHeader label="Avg Copies" col="avgCopiesPlayed" title="When you include this card, how many copies do you run?" />
              <SortHeader label="Rarity" col="rarity" />
              <th>Aspects</th>
              <SortHeader label="Pools" col="poolsWithCard" title="Number of pools that contained this card" />
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
                <td className={inclusionClass(card.inclusionRate)}>
                  {card.inclusionRate.toFixed(1)}%
                </td>
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

// === Leaders Sub-Tab ===

interface LeaderDraftPick {
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
  imageUrl: string | null
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

interface LeadersSubTabProps {
  setCode: string
  includeBots: boolean
  includeHumans: boolean
  startDate: string
  endDate: string
}

type LeaderSortKey = 'cardName' | 'avgPickPosition' | 'firstPickPct' | 'timesPicked'
type LeaderSelSortKey = 'cardName' | 'timesSelected' | 'selectionRate'

function LeadersSubTab({ setCode, includeBots, includeHumans, startDate, endDate }: LeadersSubTabProps) {
  const [draftData, setDraftData] = useState<{ totalPicks: number; totalDrafts: number; cards: LeaderDraftPick[] } | null>(null)
  const [selData, setSelData] = useState<{ totalDecks: number; leaders: LeaderSelection[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [draftSortKey, setDraftSortKey] = useState<LeaderSortKey>('avgPickPosition')
  const [draftSortAsc, setDraftSortAsc] = useState(true)
  const [selSortKey, setSelSortKey] = useState<LeaderSelSortKey>('timesSelected')
  const [selSortAsc, setSelSortAsc] = useState(false)
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

    Promise.all([
      fetch(`/api/stats/draft-picks?${params}&type=leaders`)
        .then(r => r.json())
        .then(result => setDraftData(result.data || result)),
      fetch(`/api/stats/leader-selection?${params}`)
        .then(r => r.json())
        .then(result => setSelData(result.data || result)),
    ])
      .catch(err => console.error('Error fetching leader stats:', err))
      .finally(() => setLoading(false))
  }, [setCode, includeBots, includeHumans, startDate, endDate])

  const handleDraftSort = (key: LeaderSortKey) => {
    if (draftSortKey === key) {
      setDraftSortAsc(!draftSortAsc)
    } else {
      setDraftSortKey(key)
      setDraftSortAsc(key === 'avgPickPosition' || key === 'cardName')
    }
  }

  const handleSelSort = (key: LeaderSelSortKey) => {
    if (selSortKey === key) {
      setSelSortAsc(!selSortAsc)
    } else {
      setSelSortKey(key)
      setSelSortAsc(key === 'cardName')
    }
  }

  const sortedDraftCards = useMemo(() => {
    if (!draftData?.cards) return []
    return [...draftData.cards].sort((a, b) => {
      let cmp = 0
      switch (draftSortKey) {
        case 'cardName': cmp = a.cardName.localeCompare(b.cardName); break
        case 'avgPickPosition': cmp = a.avgPickPosition - b.avgPickPosition; break
        case 'firstPickPct': cmp = (a.firstPickPct ?? -1) - (b.firstPickPct ?? -1); break
        case 'timesPicked': cmp = a.timesPicked - b.timesPicked; break
      }
      return draftSortAsc ? cmp : -cmp
    })
  }, [draftData?.cards, draftSortKey, draftSortAsc])

  const sortedSelLeaders = useMemo(() => {
    if (!selData?.leaders) return []
    return [...selData.leaders].sort((a, b) => {
      let cmp = 0
      switch (selSortKey) {
        case 'cardName': cmp = a.cardName.localeCompare(b.cardName); break
        case 'timesSelected': cmp = a.timesSelected - b.timesSelected; break
        case 'selectionRate': cmp = a.selectionRate - b.selectionRate; break
      }
      return selSortAsc ? cmp : -cmp
    })
  }, [selData?.leaders, selSortKey, selSortAsc])

  if (loading) return (
    <div className="stats-loading-skeleton">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="skeleton-row">
          <div className="skeleton-line" style={{ maxWidth: '140px' }} />
          <div className="skeleton-line" style={{ maxWidth: '60px' }} />
          <div className="skeleton-line" style={{ maxWidth: '60px' }} />
        </div>
      ))}
    </div>
  )

  const pickClass = (avg: number) =>
    avg <= 1.5 ? 'pick-early' : avg <= 3 ? 'pick-mid' : 'pick-late'

  const DraftSortHeader = ({ label, col, title }: { label: string, col: LeaderSortKey, title?: string }) => (
    <th className={`sortable ${draftSortKey === col ? 'active' : ''}`} onClick={() => handleDraftSort(col)} title={title}>
      {label}
      {draftSortKey === col && <span className="sort-indicator">{draftSortAsc ? ' ▲' : ' ▼'}</span>}
    </th>
  )

  const SelSortHeader = ({ label, col, title }: { label: string, col: LeaderSelSortKey, title?: string }) => (
    <th className={`sortable ${selSortKey === col ? 'active' : ''}`} onClick={() => handleSelSort(col)} title={title}>
      {label}
      {selSortKey === col && <span className="sort-indicator">{selSortAsc ? ' ▲' : ' ▼'}</span>}
    </th>
  )

  return (
    <div className="cards-subtab">
      {/* Leader Draft Picks */}
      {draftData && draftData.cards && draftData.cards.length > 0 && (
        <>
          <h3 style={{ marginBottom: '0.5rem' }}>Draft Pick Order</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            How early leaders are picked in leader rounds ({fmt(draftData.totalDrafts)} drafts, {fmt(draftData.totalPicks)} leader picks)
          </p>
          <div className="stats-table-container" style={{ marginBottom: '2rem' }}>
            <table className="stats-table">
              <thead>
                <tr>
                  <DraftSortHeader label="Leader" col="cardName" />
                  <DraftSortHeader label="Avg Pick" col="avgPickPosition" title="Average position this leader is picked in leader rounds (1 = first pick)" />
                  <DraftSortHeader label="1st Pick" col="firstPickPct" title="How often this leader is picked first overall in leader rounds" />
                  <th>Aspects</th>
                  <DraftSortHeader label="# Drafted" col="timesPicked" />
                </tr>
              </thead>
              <tbody>
                {sortedDraftCards.map(card => (
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
                    <td className={pickClass(card.avgPickPosition)}>{card.avgPickPosition.toFixed(1)}</td>
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
      {selData && selData.leaders && selData.leaders.length > 0 && (
        <>
          <h3 style={{ marginBottom: '0.5rem' }}>Deck Selection Rate</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            How often each leader is chosen for built decks ({fmt(selData.totalDecks)} decks)
          </p>
          <div className="stats-table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <SelSortHeader label="Leader" col="cardName" />
                  <SelSortHeader label="Selection %" col="selectionRate" title="Percentage of all built decks that chose this leader" />
                  <th>Aspects</th>
                  <SelSortHeader label="# Selected" col="timesSelected" />
                </tr>
              </thead>
              <tbody>
                {sortedSelLeaders.map(leader => (
                  <tr key={leader.cardId}>
                    <td
                      className="card-name-cell"
                      onMouseEnter={(e) => handleCardMouseEnter({ imageUrl: leader.imageUrl || undefined, name: leader.cardName, rarity: 'Legendary' }, e)}
                      onMouseLeave={handleCardMouseLeave}
                      onTouchStart={() => handleCardTouchStart({ imageUrl: leader.imageUrl || undefined, name: leader.cardName, rarity: 'Legendary' })}
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

      {(!draftData?.cards?.length && !selData?.leaders?.length) && (
        <div className="stats-empty">
          <p>No leader data available for {setCode} yet.</p>
        </div>
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
