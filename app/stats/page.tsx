// @ts-nocheck
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useCardPreview } from '@/src/hooks/useCardPreview'
import { CardPreview } from '@/src/components/DeckBuilder/CardPreview'
import './stats.css'

// Stats start date - default to 2026-02-12 when position-based slot_type tracking was deployed.
const STATS_START_DATE = process.env.NEXT_PUBLIC_STATS_START_DATE || '2026-02-12'

// Format numbers with commas
const fmt = (n: number) => n.toLocaleString()

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState('SOR')
  const [includeBots, setIncludeBots] = useState(true)
  const [includeHumans, setIncludeHumans] = useState(true)

  const formattedDate = new Date(STATS_START_DATE).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

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
        <h3 className="stats-date-range">Since {formattedDate}</h3>
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
}

function SetStatsTab({ setCode, includeBots, includeHumans }: SetStatsTabProps) {
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
      </div>

      {subTab === 'draft' ? (
        <CardsSubTab setCode={setCode} includeBots={includeBots} includeHumans={includeHumans} />
      ) : (
        <DeckBuildingSubTab setCode={setCode} includeBots={includeBots} includeHumans={includeHumans} />
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
}

function CardsSubTab({ setCode, includeBots, includeHumans }: CardsSubTabProps) {
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
      since: STATS_START_DATE,
      includeBots: String(includeBots),
      includeHumans: String(includeHumans),
    })
    fetch(`/api/stats/draft-picks?${params}`)
      .then(r => r.json())
      .then(result => setData(result.data || result))
      .catch(err => console.error('Error fetching draft picks:', err))
      .finally(() => setLoading(false))
  }, [setCode, includeBots, includeHumans])

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
}

function DeckBuildingSubTab({ setCode, includeBots, includeHumans }: DeckBuildingSubTabProps) {
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
      includeBots: String(includeBots),
      includeHumans: String(includeHumans),
    })
    fetch(`/api/stats/deck-inclusion?${params}`)
      .then(r => r.json())
      .then(result => setData(result.data || result))
      .catch(err => console.error('Error fetching deck inclusion:', err))
      .finally(() => setLoading(false))
  }, [setCode, includeBots, includeHumans])

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
