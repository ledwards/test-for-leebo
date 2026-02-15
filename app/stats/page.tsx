// @ts-nocheck
'use client'

import { useState, useEffect, useMemo } from 'react'
import './stats.css'

interface Treatment {
  isApplicable?: boolean
  observed: number
  expected: number
  percentDiff: number
  zScore: number
  significance: {
    status: string
    color: string
    description: string
  }
}

interface CardAnalysis {
  base?: Treatment
  hyperspace?: Treatment
  foil?: Treatment
  hyperspace_foil?: Treatment
  showcase?: Treatment
}

interface CardStats {
  cardId: string
  name: string
  subtitle?: string
  type: string
  aspects?: string[]
  analysis?: CardAnalysis
}

interface PoolMetrics {
  totalPools?: number
  poolsAffected?: number
  samples?: Array<{
    card: string
    treatment?: string
    treatments?: string[]
    count?: number
  }>
}

interface PackMetrics {
  treatmentDistribution?: Record<string, number>
  rarityDistribution?: Record<string, number>
  packSameTreatmentDuplicates?: PoolMetrics & { packsAffected?: number }
  packCrossTreatmentDuplicates?: PoolMetrics & { packsAffected?: number }
  poolSameTreatmentDuplicates?: PoolMetrics
  poolCrossTreatmentDuplicates?: PoolMetrics
  totalPacksTracked?: number
}

interface Stats {
  cards: CardStats[]
  totalPools: number
  draftPools: number
  sealedPools: number
  totalPacks: number
  totalCards: number
  packMetrics?: PackMetrics
  debug?: {
    rawGenerationsCount?: number
    treatmentCounts?: Record<string, number>
    unmatchedCardsCount?: number
    unmatchedSamples?: Array<{ name: string }>
  }
}

interface PackCard {
  cardId: string
  name: string
  subtitle?: string
  type?: string
  rarity?: string
  treatment: string
  isFoil?: boolean
  isHyperspace?: boolean
  isShowcase?: boolean
  imageUrl?: string
}

interface Pack {
  sourceId: string
  sourceType: string
  packIndex: number
  cards: PackCard[]
}

interface QATest {
  name: string
  suite: string
  status: 'passed' | 'failed'
  executionTime?: number
  errorMessage?: string
}

interface QAResults {
  available: boolean
  latestRun?: {
    summary: {
      total: number
      passed: number
      failed: number
    }
    runAt: string
    tests: QATest[]
  }
}

// Stats start date - from env var or default to include all historical data
const STATS_START_DATE = process.env.NEXT_PUBLIC_STATS_START_DATE || '2020-01-01'

// Format numbers with commas
const fmt = (n: number) => n.toLocaleString()

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState('Reference')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Format the stats start date for display
  const formattedDate = new Date(STATS_START_DATE).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Set initial tab from hash on mount
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

  useEffect(() => {
    if (activeTab === 'Reference' || activeTab === 'Overall') {
      setLoading(false)
      return
    }

    // Load stats for the active set
    setLoading(true)
    fetch(`/api/stats/generations?setCode=${activeTab}&since=${STATS_START_DATE}`)
      .then(res => res.json())
      .then(response => {
        // API wraps response in {success: true, data: {...}}
        setStats(response.data || response)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [activeTab])

  const tabs = ['Reference', 'Overall', 'SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC', 'LAW']

  // Set colors for tabs
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
        <h1>Statistics</h1>
        <p>Statistical analysis of card and pack generation for nerds</p>
        <h3 className="stats-date-range">Since {formattedDate}</h3>
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
        {activeTab === 'Reference' ? (
          <ReferenceTab />
        ) : activeTab === 'Overall' ? (
          <QATab />
        ) : loading ? (
          <div className="stats-loading">Loading statistics...</div>
        ) : error ? (
          <div className="stats-error">Error: {error}</div>
        ) : (
          <GenerationStatsTab stats={stats} setCode={activeTab} />
        )}
      </div>
    </div>
  )
}

interface GenerationStatsTabProps {
  stats: Stats | null
  setCode: string
}

function GenerationStatsTab({ stats, setCode }: GenerationStatsTabProps) {
  const [subTab, setSubTab] = useState('quality')
  const [qualityData, setQualityData] = useState<QualityData | null>(null)
  const [qualityLoading, setQualityLoading] = useState(true)

  // Fetch quality data for this set
  useEffect(() => {
    setQualityLoading(true)
    fetch(`/api/public/pack-quality?setCode=${setCode}&since=${STATS_START_DATE}`)
      .then(r => r.json())
      .then(result => {
        if (result.data) {
          setQualityData(result.data)
        }
      })
      .catch(err => {
        console.error('Error fetching quality data:', err)
      })
      .finally(() => setQualityLoading(false))
  }, [setCode])

  if (!stats || !stats.cards || stats.cards.length === 0) {
    return (
      <div className="stats-empty">
        <p>No generation data available for {setCode} yet.</p>
        <p>Statistics will appear after packs are generated.</p>
        {stats?.debug && (
          <div className="stats-debug">
            <p><strong>Debug info:</strong></p>
            <p>Raw generations: {stats.debug.rawGenerationsCount || 0}</p>
            <p>Treatment counts: {JSON.stringify(stats.debug.treatmentCounts || {})}</p>
            <p>Unmatched cards: {stats.debug.unmatchedCardsCount || 0}</p>
            {stats.debug.unmatchedSamples?.length > 0 && (
              <p>Samples: {stats.debug.unmatchedSamples.slice(0, 3).map(c => c.name).join(', ')}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  // Minimum sample size for meaningful statistics (about 2 sealed pools or 1 draft)
  const hasEnoughData = stats.totalPacks >= 10

  return (
    <div className="generation-stats">
      {/* Global summary stats - outside tabs */}
      <div className="stats-summary">
        <h2>{setCode} Statistics</h2>
        <div className="stats-summary-grid">
          <div className="stat-item">
            <span className="stat-label">Pools:</span>
            <span className="stat-value">{fmt(stats.totalPools)}</span>
            <span className="stat-detail">({fmt(stats.draftPools)} draft, {fmt(stats.sealedPools)} sealed)</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Packs:</span>
            <span className="stat-value">{fmt(stats.totalPacks)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Cards Tracked:</span>
            <span className="stat-value">{fmt(stats.totalCards)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Unique Cards:</span>
            <span className="stat-value">{fmt(stats.cards.length)}</span>
          </div>
        </div>
        {!hasEnoughData && (
          <p className="stats-warning">
            Warning: Small sample size - statistics may not be reliable yet. Generate more packs for better accuracy.
          </p>
        )}
      </div>

      {/* Sub-tabs for Quality, Cards and Packs */}
      <div className="stats-subtabs">
        <button
          className={`stats-subtab ${subTab === 'quality' ? 'active' : ''}`}
          onClick={() => setSubTab('quality')}
        >
          Quality
        </button>
        <button
          className={`stats-subtab ${subTab === 'cards' ? 'active' : ''}`}
          onClick={() => setSubTab('cards')}
        >
          Cards
        </button>
        <button
          className={`stats-subtab ${subTab === 'packs' ? 'active' : ''}`}
          onClick={() => setSubTab('packs')}
        >
          Packs
        </button>
      </div>

      {subTab === 'quality' ? (
        <QualitySubTab data={qualityData} loading={qualityLoading} />
      ) : subTab === 'cards' ? (
        <CardsSubTab stats={stats} setCode={setCode} hasEnoughData={hasEnoughData} />
      ) : (
        <PacksSubTab setCode={setCode} />
      )}
    </div>
  )
}

interface CardsSubTabProps {
  stats: Stats
  setCode: string
  hasEnoughData: boolean
}

function CardsSubTab({ stats, setCode, hasEnoughData }: CardsSubTabProps) {
  return (
    <div className="cards-subtab">
      {/* Cards table only - stats are above the tabs now */}
      <div className="stats-table-container">
        <table className="stats-table">
          <thead>
            <tr>
              <th>Card #</th>
              <th>Name</th>
              <th>Type</th>
              <th>Aspects</th>
              <th>Base</th>
              <th>Hyperspace</th>
              <th>Foil</th>
              <th>Hyper Foil</th>
              <th>Showcase</th>
            </tr>
          </thead>
          <tbody>
            {stats.cards.map(card => (
              <tr key={card.cardId}>
                <td>{card.cardId.split('-')[1]}</td>
                <td>
                  <div className="card-name-cell">
                    <div className="card-name">{card.name}</div>
                    {card.subtitle && (
                      <div className="card-subtitle">{card.subtitle}</div>
                    )}
                  </div>
                </td>
                <td>{card.type}</td>
                <td>
                  <div className="aspects-cell">
                    {card.aspects && card.aspects.map((aspect, i) => (
                      <img
                        key={i}
                        src={`/icons/${aspect.toLowerCase()}.png`}
                        alt={aspect}
                        className="aspect-icon"
                      />
                    ))}
                  </div>
                </td>
                <TreatmentCell treatment={card.analysis?.base} hasEnoughData={hasEnoughData} />
                <TreatmentCell treatment={card.analysis?.hyperspace} hasEnoughData={hasEnoughData} />
                <TreatmentCell treatment={card.analysis?.foil} hasEnoughData={hasEnoughData} />
                <TreatmentCell treatment={card.analysis?.hyperspace_foil} hasEnoughData={hasEnoughData} />
                <TreatmentCell treatment={card.analysis?.showcase} hasEnoughData={hasEnoughData} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface PacksSubTabProps {
  setCode: string
}

// Group packs by sourceId (pool)
interface PoolGroup {
  sourceId: string
  sourceType: string
  packs: Pack[]
}

// Pool stats for display
interface LegendaryInfo {
  name: string
  treatment: string // 'Foil', 'Hyperspace', etc. or '' for regular
}

interface PoolStats {
  baseDuplicates: { name: string; count: number }[]  // Normal variant only
  anyDuplicates: { name: string; count: number }[]   // Any treatment
  legendaries: LegendaryInfo[]
  hyperspaceLeaders: number
  hyperspaceBases: number
  hyperspaceOther: number
}

function getPoolStats(packs: Pack[]): PoolStats {
  const allCards = packs.flatMap(p => p.cards)

  // Base treatment duplicates (Normal only - no foil, no hyperspace, no showcase)
  const normalCards = allCards.filter(c =>
    !c.isFoil && !c.isHyperspace && !c.isShowcase && c.type !== 'Leader' && c.type !== 'Base'
  )
  const baseNameCounts = new Map<string, number>()
  normalCards.forEach(c => {
    baseNameCounts.set(c.name, (baseNameCounts.get(c.name) || 0) + 1)
  })
  const baseDuplicates = Array.from(baseNameCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Any treatment duplicates (exact card ID)
  const nonLeaderBase = allCards.filter(c => c.type !== 'Leader' && c.type !== 'Base')
  const idCounts = new Map<string, { name: string; count: number }>()
  nonLeaderBase.forEach(c => {
    if (!idCounts.has(c.cardId)) {
      idCounts.set(c.cardId, { name: c.name, count: 0 })
    }
    idCounts.get(c.cardId)!.count++
  })
  const anyDuplicates = Array.from(idCounts.values())
    .filter(d => d.count > 1)
    .sort((a, b) => b.count - a.count)

  // Legendaries with treatment info
  const legendaries = allCards
    .filter(c => c.rarity === 'Legendary')
    .map(c => {
      let treatment = ''
      if (c.isShowcase) treatment = 'Showcase'
      else if (c.isHyperspace && c.isFoil) treatment = 'Hyperspace Foil'
      else if (c.isHyperspace) treatment = 'Hyperspace'
      else if (c.isFoil) treatment = 'Foil'
      return { name: c.name, treatment }
    })

  // Hyperspace breakdown
  const hsCards = allCards.filter(c => c.isHyperspace)
  const hyperspaceLeaders = hsCards.filter(c => c.type === 'Leader').length
  const hyperspaceBases = hsCards.filter(c => c.type === 'Base').length
  const hyperspaceOther = hsCards.filter(c => c.type !== 'Leader' && c.type !== 'Base').length

  return { baseDuplicates, anyDuplicates, legendaries, hyperspaceLeaders, hyperspaceBases, hyperspaceOther }
}

// Determine status color based on expected values
function getStatColor(value: number, expected: number, stdDev: number): string {
  const z = Math.abs(value - expected) / (stdDev || 1)
  if (z > 3) return '#ff4444' // Red - serious outlier
  if (z > 2) return '#ffaa00' // Yellow - slight outlier
  return '#44ff44' // Green - normal
}

function PacksSubTab({ setCode }: PacksSubTabProps) {
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const limit = 60 // Load more at once since we're grouping

  useEffect(() => {
    setLoading(true)
    setOffset(0)
    fetch(`/api/stats/packs?setCode=${setCode}&limit=${limit}&offset=0&since=${STATS_START_DATE}`)
      .then(res => res.json())
      .then(response => {
        const data = response.data || response
        setPacks(data.packs || [])
        setTotal(data.total || 0)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading packs:', err)
        setLoading(false)
      })
  }, [setCode])

  const loadMore = () => {
    const newOffset = offset + limit
    setLoading(true)
    fetch(`/api/stats/packs?setCode=${setCode}&limit=${limit}&offset=${newOffset}&since=${STATS_START_DATE}`)
      .then(res => res.json())
      .then(response => {
        const data = response.data || response
        setPacks(prev => [...prev, ...(data.packs || [])])
        setOffset(newOffset)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading more packs:', err)
        setLoading(false)
      })
  }

  // Group packs by pool (sourceId)
  const poolGroups: PoolGroup[] = useMemo(() => {
    const groups = new Map<string, PoolGroup>()
    packs.forEach(pack => {
      if (!groups.has(pack.sourceId)) {
        groups.set(pack.sourceId, {
          sourceId: pack.sourceId,
          sourceType: pack.sourceType,
          packs: []
        })
      }
      groups.get(pack.sourceId)!.packs.push(pack)
    })
    // Sort packs within each group by packIndex
    groups.forEach(group => {
      group.packs.sort((a, b) => a.packIndex - b.packIndex)
    })
    return Array.from(groups.values())
  }, [packs])

  if (loading && packs.length === 0) {
    return <div className="stats-loading">Loading packs...</div>
  }

  if (packs.length === 0) {
    return (
      <div className="stats-empty">
        <p>No pack data available for {setCode} yet.</p>
        <p>Pack contents will appear after packs are generated.</p>
      </div>
    )
  }

  return (
    <div className="packs-subtab">
      <div className="packs-summary">
        <p>Showing {fmt(packs.length)} packs in {fmt(poolGroups.length)} pools (of {fmt(total)} total packs)</p>
      </div>
      <div className="pools-grid">
        {poolGroups.map(pool => {
          const stats = getPoolStats(pool.packs)
          const numPacks = pool.packs.length
          // Expected values scale with pack count (sealed=6, draft=3)
          const expectedBaseDups = numPacks === 6 ? 1.0 : 0.5
          const expectedAnyDups = numPacks === 6 ? 3.7 : 1.8
          const expectedLegendary = numPacks * 0.125 // ~12.5% per pack
          const expectedHS = numPacks * 0.5 // ~0.5 per pack estimate

          const baseDupCount = stats.baseDuplicates.reduce((sum, d) => sum + d.count - 1, 0)
          const anyDupCount = stats.anyDuplicates.reduce((sum, d) => sum + d.count - 1, 0)
          const totalHS = stats.hyperspaceLeaders + stats.hyperspaceBases + stats.hyperspaceOther

          return (
            <div key={pool.sourceId} className="pool-container">
              <div className="pool-header">
                <span className="pool-type">{pool.sourceType}</span>
                <a href={`/pool/${pool.sourceId}`} className="pool-link" title={`View pool ${pool.sourceId}`}>
                  {pool.sourceId.slice(0, 8)}...
                </a>
              </div>
              <div className="pool-stats-block">
                <div className="pool-stat-line">
                  <span className="pool-stat-label">Duplicates (regular treatment):</span>
                  <span className="pool-stat-value" style={{ color: getStatColor(baseDupCount, expectedBaseDups, 0.8) }}>
                    {baseDupCount === 0 ? 'None' : stats.baseDuplicates.map(d => `${d.name} x${d.count}`).join(', ')}
                  </span>
                </div>
                <div className="pool-stat-line">
                  <span className="pool-stat-label">Duplicates (any treatment):</span>
                  <span className="pool-stat-value" style={{ color: getStatColor(anyDupCount, expectedAnyDups, 1.4) }}>
                    {anyDupCount === 0 ? 'None' : stats.anyDuplicates.map(d => `${d.name} x${d.count}`).join(', ')}
                  </span>
                </div>
                <div className="pool-stat-line">
                  <span className="pool-stat-label">Legendaries:</span>
                  <span className="pool-stat-value" style={{ color: getStatColor(stats.legendaries.length, expectedLegendary, 0.8) }}>
                    {stats.legendaries.length === 0 ? 'None' : stats.legendaries.map(l => l.treatment ? `${l.name} (${l.treatment})` : l.name).join(', ')}
                  </span>
                </div>
                <div className="pool-stat-line">
                  <span className="pool-stat-label">Hyperspace:</span>
                  <span className="pool-stat-value" style={{ color: getStatColor(totalHS, expectedHS, 1.5) }}>
                    {totalHS === 0 ? 'None' : `${stats.hyperspaceLeaders} leader, ${stats.hyperspaceBases} base, ${stats.hyperspaceOther} other`}
                  </span>
                </div>
              </div>
              <div className="pool-packs-column">
                {pool.packs.map((pack, idx) => (
                  <div key={`${pack.sourceId}-${pack.packIndex}-${idx}`} className="pack-row">
                    <span className="pack-label-inline">{pack.packIndex + 1}</span>
                    <div className="pack-cards-row">
                      {pack.cards.map((card, cardIdx) => {
                        const isBase = card.type === 'Base'
                        const isLeader = card.type === 'Leader'
                        return (
                          <div
                            key={`${card.cardId}-${cardIdx}`}
                            className={`pack-card ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isBase ? 'base' : ''} ${isLeader ? 'leader' : ''}`}
                            title={`${card.name}${card.subtitle ? ` - ${card.subtitle}` : ''} (${card.treatment})`}
                          >
                            {card.imageUrl ? (
                              <img src={card.imageUrl} alt={card.name} className="pack-card-image" />
                            ) : (
                              <div className="pack-card-placeholder">
                                <span className="placeholder-name">{card.name}</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      {packs.length < total && (
        <div className="load-more-container">
          <button className="load-more-button" onClick={loadMore} disabled={loading}>
            {loading ? 'Loading...' : `Load More (${fmt(total - packs.length)} remaining)`}
          </button>
        </div>
      )}
    </div>
  )
}

interface TreatmentCellProps {
  treatment?: Treatment
  hasEnoughData: boolean
}

function TreatmentCell({ treatment, hasEnoughData }: TreatmentCellProps) {
  // Show "-" if treatment is not applicable for this card
  if (!treatment || treatment.isApplicable === false) {
    return <td className="treatment-cell treatment-na">—</td>
  }

  const { observed, expected, percentDiff, significance, zScore } = treatment
  const displayPercent = percentDiff > 0 ? `+${percentDiff.toFixed(1)}%` : `${percentDiff.toFixed(1)}%`

  // Only apply color coding and show Z-score if we have enough data
  const cellStyle = hasEnoughData ? { backgroundColor: significance.color + '20' } : {}
  const tooltipText = hasEnoughData
    ? `Z-score: ${zScore.toFixed(2)}\n${significance.description}`
    : 'Small sample size - color coding disabled'

  return (
    <td
      className={`treatment-cell ${hasEnoughData ? `treatment-${significance.status}` : ''}`}
      style={cellStyle}
      title={tooltipText}
    >
      <div className="treatment-numbers">
        <span className="observed">{observed}</span>
        <span className="divider">/</span>
        <span className="expected">{expected.toFixed(1)}</span>
      </div>
      <div className="treatment-percent" style={{ color: hasEnoughData ? significance.color : 'rgba(255, 255, 255, 0.6)' }}>
        {displayPercent}
      </div>
    </td>
  )
}

interface PackMetricsSectionProps {
  metrics: PackMetrics
}

function PackMetricsSection({ metrics }: PackMetricsSectionProps) {
  if (!metrics) return null

  const totalCards = Object.values(metrics.treatmentDistribution || {}).reduce((a, b) => a + b, 0)
  const totalPools = metrics.poolSameTreatmentDuplicates?.totalPools || 0
  const totalPacks = metrics.totalPacksTracked || 0

  // Statistical analysis helper — uses relative tolerance for small expected values
  const getMetricStatus = (observed: number, expected: number, threshold = 10) => {
    const diff = Math.abs(observed - expected)
    // For very small expected values (< 1%), use absolute threshold of 2
    const effectiveThreshold = expected < 1 ? Math.max(threshold, 2) : threshold
    if (diff <= effectiveThreshold) return { status: 'expected', color: '#27AE60' }
    if (diff <= effectiveThreshold * 2) return { status: 'outlier', color: '#F39C12' }
    return { status: 'extreme', color: '#E74C3C' }
  }

  // Pack-level metrics
  const packSameTreatmentPercent = totalPacks > 0
    ? (metrics.packSameTreatmentDuplicates?.packsAffected / totalPacks) * 100
    : 0
  const packCrossTreatmentPercent = totalPacks > 0
    ? (metrics.packCrossTreatmentDuplicates?.packsAffected / totalPacks) * 100
    : 0

  // Expected: same-treatment duplicates = 0%, cross-treatment = ~8%
  const packSameTreatmentStatus = getMetricStatus(packSameTreatmentPercent, 0, 1) // Very strict - should be 0
  const packCrossTreatmentStatus = getMetricStatus(packCrossTreatmentPercent, 8, 5)

  // Pool-level metrics
  const poolSameTreatmentPercent = totalPools > 0
    ? (metrics.poolSameTreatmentDuplicates?.poolsAffected / totalPools) * 100
    : 0
  const poolCrossTreatmentPercent = totalPools > 0
    ? (metrics.poolCrossTreatmentDuplicates?.poolsAffected / totalPools) * 100
    : 0

  // Expected: most pools should have duplicates across 6 packs (~90%), and cross-treatment pairs (~95%)
  const poolSameTreatmentStatus = getMetricStatus(poolSameTreatmentPercent, 90, 15)
  const poolCrossTreatmentStatus = getMetricStatus(poolCrossTreatmentPercent, 95, 10)

  // Treatment distribution expected percentages (per 16 cards)
  // base: ~14/16 cards are base treatment (no HS/foil/showcase)
  // hyperspace: ~0.83 HS upgrades per pack / 16 = ~5.2%
  // foil: 1 foil per pack / 16 = 6.25%
  // hyperspace_foil: ~1 in 50 packs = ~0.13%
  // showcase: ~1 in 288 packs = ~0.02%
  const treatmentExpected: Record<string, number> = {
    base: 88,
    hyperspace: 5,
    foil: 6,
    hyperspace_foil: 0.1,
    showcase: 0.02
  }

  // Rarity distribution expected (per 16 cards)
  // Note: these are approximate and vary by set
  const rarityExpected: Record<string, number> = {
    Common: 56, // 9/16
    Uncommon: 19, // 3/16
    Rare: 7, // ~1.1/16
    Legendary: 1, // ~0.15/16
    Leader: 6, // 1/16
    Base: 6, // 1/16
    Special: 1
  }

  return (
    <div className="pack-metrics-section">
      {/* Pack-Level Statistics */}
      <h3>Pack-Level Statistics</h3>
      <p className="pack-metrics-description">
        Per-pack analysis from {fmt(totalPacks)} tracked packs
      </p>

      {totalPacks === 0 ? (
        <div className="metrics-notice">
          No pack-level data available yet. Generate new pools to see pack statistics.
        </div>
      ) : (
        <div className="pack-metrics-grid">
          {/* Pack same-treatment duplicates (should be 0) */}
          <div className={`pack-metric-card metric-${packSameTreatmentStatus.status}`}>
            <div className="metric-header">
              <span className="metric-icon" style={{ background: packSameTreatmentStatus.color + '30', color: packSameTreatmentStatus.color }}>
                {packSameTreatmentStatus.status === 'expected' ? '✓' : '!'}
              </span>
              <span className="metric-title">Same-Treatment Duplicates</span>
            </div>
            <div className="metric-stats-row">
              <div className="metric-stat">
                <span className="metric-stat-value">{packSameTreatmentPercent.toFixed(1)}%</span>
                <span className="metric-stat-label">observed</span>
              </div>
              <div className="metric-stat">
                <span className="metric-stat-value">0%</span>
                <span className="metric-stat-label">expected</span>
              </div>
              <div className="metric-stat">
                <span className="metric-stat-value" style={{ color: packSameTreatmentStatus.color }}>
                  {packSameTreatmentPercent > 0 ? '+' : ''}{packSameTreatmentPercent.toFixed(1)}%
                </span>
                <span className="metric-stat-label">diff</span>
              </div>
            </div>
            <p className="metric-description">
              {fmt(metrics.packSameTreatmentDuplicates?.packsAffected || 0)} / {fmt(totalPacks)} packs have duplicate cards
            </p>
            {metrics.packSameTreatmentDuplicates?.samples?.length > 0 && (
              <div className="metric-samples">
                {metrics.packSameTreatmentDuplicates.samples.slice(0, 2).map((s, i) => (
                  <span key={i} className="sample-tag">{s.card} ({s.treatment}) x{s.count}</span>
                ))}
              </div>
            )}
          </div>

          {/* Pack cross-treatment pairs (card+foil) */}
          <div className={`pack-metric-card metric-${packCrossTreatmentStatus.status}`}>
            <div className="metric-header">
              <span className="metric-icon" style={{ background: packCrossTreatmentStatus.color + '30', color: packCrossTreatmentStatus.color }}>
                {packCrossTreatmentStatus.status === 'expected' ? '✓' : '!'}
              </span>
              <span className="metric-title">Card+Foil Pairs</span>
            </div>
            <div className="metric-stats-row">
              <div className="metric-stat">
                <span className="metric-stat-value">{packCrossTreatmentPercent.toFixed(1)}%</span>
                <span className="metric-stat-label">observed</span>
              </div>
              <div className="metric-stat">
                <span className="metric-stat-value">~8%</span>
                <span className="metric-stat-label">expected</span>
              </div>
              <div className="metric-stat">
                <span className="metric-stat-value" style={{ color: packCrossTreatmentStatus.color }}>
                  {packCrossTreatmentPercent >= 8 ? '+' : ''}{(packCrossTreatmentPercent - 8).toFixed(1)}%
                </span>
                <span className="metric-stat-label">diff</span>
              </div>
            </div>
            <p className="metric-description">
              {fmt(metrics.packCrossTreatmentDuplicates?.packsAffected || 0)} / {fmt(totalPacks)} packs have card+foil pair
            </p>
            {metrics.packCrossTreatmentDuplicates?.samples?.length > 0 && (
              <div className="metric-samples">
                {metrics.packCrossTreatmentDuplicates.samples.slice(0, 2).map((s, i) => (
                  <span key={i} className="sample-tag">{s.card}: {s.treatments?.join('+')}</span>
                ))}
              </div>
            )}
          </div>

          {/* Treatment distribution with expected */}
          <div className="pack-metric-card metric-info">
            <div className="metric-header">
              <span className="metric-icon">T</span>
              <span className="metric-title">Treatment Distribution</span>
            </div>
            <div className="metric-distribution">
              {metrics.treatmentDistribution && Object.entries(metrics.treatmentDistribution).map(([treatment, count]) => {
                const pct = totalCards > 0 ? (count / totalCards) * 100 : 0
                const expected = treatmentExpected[treatment] || 0
                const status = getMetricStatus(pct, expected, expected * 0.3 || 2)
                return (
                  <div key={treatment} className="distribution-row">
                    <span className="distribution-label">{treatment}:</span>
                    <span className="distribution-value" style={{ color: status.color }}>
                      {pct.toFixed(1)}% <span className="expected-hint">(exp: {expected}%)</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Rarity distribution with expected */}
          <div className="pack-metric-card metric-info">
            <div className="metric-header">
              <span className="metric-icon">R</span>
              <span className="metric-title">Rarity Distribution</span>
            </div>
            <div className="metric-distribution">
              {metrics.rarityDistribution && Object.entries(metrics.rarityDistribution).map(([rarity, count]) => {
                const pct = totalCards > 0 ? (count / totalCards) * 100 : 0
                const expected = rarityExpected[rarity] || 0
                const status = getMetricStatus(pct, expected, expected * 0.3 || 2)
                return (
                  <div key={rarity} className="distribution-row">
                    <span className="distribution-label">{rarity}:</span>
                    <span className="distribution-value" style={{ color: status.color }}>
                      {pct.toFixed(1)}% <span className="expected-hint">(exp: {expected}%)</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pool-Level Statistics */}
      <h3 style={{ marginTop: '2rem' }}>Pool-Level Statistics</h3>
      <p className="pack-metrics-description">
        Aggregate statistics from {fmt(totalPools)} pools
      </p>

      <div className="pack-metrics-grid">
        {/* Pool same-treatment duplicates */}
        <div className={`pack-metric-card metric-${poolSameTreatmentStatus.status}`}>
          <div className="metric-header">
            <span className="metric-icon" style={{ background: poolSameTreatmentStatus.color + '30', color: poolSameTreatmentStatus.color }}>
              {poolSameTreatmentStatus.status === 'expected' ? '✓' : '!'}
            </span>
            <span className="metric-title">Same-Treatment Duplicates</span>
          </div>
          <div className="metric-stats-row">
            <div className="metric-stat">
              <span className="metric-stat-value">{poolSameTreatmentPercent.toFixed(1)}%</span>
              <span className="metric-stat-label">observed</span>
            </div>
            <div className="metric-stat">
              <span className="metric-stat-value">~90%</span>
              <span className="metric-stat-label">expected</span>
            </div>
            <div className="metric-stat">
              <span className="metric-stat-value" style={{ color: poolSameTreatmentStatus.color }}>
                {poolSameTreatmentPercent >= 90 ? '+' : ''}{(poolSameTreatmentPercent - 90).toFixed(1)}%
              </span>
              <span className="metric-stat-label">diff</span>
            </div>
          </div>
          <p className="metric-description">
            {fmt(metrics.poolSameTreatmentDuplicates?.poolsAffected || 0)} / {fmt(totalPools)} pools have card appearing 2+ times
          </p>
        </div>

        {/* Pool cross-treatment pairs */}
        <div className={`pack-metric-card metric-${poolCrossTreatmentStatus.status}`}>
          <div className="metric-header">
            <span className="metric-icon" style={{ background: poolCrossTreatmentStatus.color + '30', color: poolCrossTreatmentStatus.color }}>
              {poolCrossTreatmentStatus.status === 'expected' ? '✓' : '!'}
            </span>
            <span className="metric-title">Cross-Treatment Pairs</span>
          </div>
          <div className="metric-stats-row">
            <div className="metric-stat">
              <span className="metric-stat-value">{poolCrossTreatmentPercent.toFixed(1)}%</span>
              <span className="metric-stat-label">observed</span>
            </div>
            <div className="metric-stat">
              <span className="metric-stat-value">~95%</span>
              <span className="metric-stat-label">expected</span>
            </div>
            <div className="metric-stat">
              <span className="metric-stat-value" style={{ color: poolCrossTreatmentStatus.color }}>
                {poolCrossTreatmentPercent >= 95 ? '+' : ''}{(poolCrossTreatmentPercent - 95).toFixed(1)}%
              </span>
              <span className="metric-stat-label">diff</span>
            </div>
          </div>
          <p className="metric-description">
            {fmt(metrics.poolCrossTreatmentDuplicates?.poolsAffected || 0)} / {fmt(totalPools)} pools have card+foil pair
          </p>
        </div>
      </div>
    </div>
  )
}

function ReferenceTab() {
  return (
    <div className="reference-tab">
      <h2>Pack Generation Reference</h2>
      <p className="reference-intro">
        Complete technical documentation of how booster packs are generated in Star Wars: Unlimited.
        This covers universal rules that apply to all sets. For set-specific statistics, see the individual set tabs.
      </p>

      <div className="reference-sections">
        {/* Pack Structure */}
        <section className="reference-section reference-full-width">
          <h3>Pack Structure (16 Cards Total)</h3>
          <div className="reference-description">
            <p>Every booster pack contains exactly 16 cards in specific slots:</p>
          </div>
          <table className="reference-table">
            <thead>
              <tr>
                <th>Slot</th>
                <th>Count</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Leader</strong></td>
                <td>1</td>
                <td>One leader card from the leader pool. Can upgrade to Hyperspace or Showcase.</td>
              </tr>
              <tr>
                <td><strong>Base</strong></td>
                <td>1</td>
                <td>One base card. Can upgrade to Hyperspace variant.</td>
              </tr>
              <tr>
                <td><strong>Commons</strong></td>
                <td>9</td>
                <td>Nine common cards drawn from alternating aspect belts (A/B pattern). Guarantees all 6 aspects present.</td>
              </tr>
              <tr>
                <td><strong>Uncommons</strong></td>
                <td>2-3</td>
                <td>Two guaranteed uncommons. Third uncommon can upgrade to Rare/Legendary (~18% chance).</td>
              </tr>
              <tr>
                <td><strong>Rare/Legendary</strong></td>
                <td>1-2</td>
                <td>One guaranteed Rare or Legendary. Legendary rate varies by set (see below). Can be 2 if third UC upgrades.</td>
              </tr>
              <tr>
                <td><strong>Foil</strong></td>
                <td>1</td>
                <td>One foil card of any rarity (weighted by set - see below). Can upgrade to Hyperfoil.</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Rarity Distribution */}
        <section className="reference-section">
          <h3>Rarity Distribution</h3>
          <div className="reference-description">
            <p><strong>Rare/Legendary Slot (varies by set):</strong></p>
            <ul>
              <li>Sets 1-3: ~14.3% Legendary (6:1 ratio)</li>
              <li>Sets 4+: ~16.7% Legendary (5:1 ratio)</li>
            </ul>
            <p><strong>Third UC Slot Upgrade:</strong></p>
            <ul>
              <li>Sets 1-3: ~18% upgrade rate (1 in 5.5)</li>
              <li>Sets 4+: ~20% upgrade rate (1 in 5)</li>
            </ul>
          </div>
        </section>

        {/* Leader Rarity */}
        <section className="reference-section">
          <h3>Leader Distribution</h3>
          <div className="reference-description">
            <p>Leaders come in two rarities (Common and Rare), but in the leader slot:</p>
            <ul>
              <li>All leaders have equal probability (uniform distribution)</li>
              <li>Rarity is aesthetic/collectibility, not pull rate</li>
            </ul>
          </div>
        </section>

        {/* Foil Slot */}
        <section className="reference-section reference-full-width">
          <h3>Foil Slot Distribution</h3>
          <div className="reference-description">
            <p>The foil slot uses weighted random selection (weights vary by set):</p>
          </div>
          <table className="reference-table">
            <thead>
              <tr>
                <th>Rarity</th>
                <th>Sets 1-3</th>
                <th>Sets 4-6</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Common</td>
                <td><strong>~78%</strong></td>
                <td><strong>~75%</strong></td>
              </tr>
              <tr>
                <td>Uncommon</td>
                <td><strong>~17%</strong></td>
                <td><strong>~17%</strong></td>
              </tr>
              <tr>
                <td>Rare</td>
                <td><strong>~5%</strong></td>
                <td><strong>~4%</strong></td>
              </tr>
              <tr>
                <td>Legendary</td>
                <td><strong>~0.3%</strong></td>
                <td><strong>~0.3%</strong></td>
              </tr>
              <tr>
                <td>Special</td>
                <td><strong>0%</strong></td>
                <td><strong>~4%</strong></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Belt System */}
        <section className="reference-section reference-full-width">
          <h3>The Belt System</h3>
          <div className="reference-description">
            <p><strong>What are Belts?</strong></p>
            <p>Belts are shuffled pools of cards that ensure proper distribution and prevent immediate duplicates. Each belt contains all eligible cards for that slot, shuffled randomly.</p>

            <p><strong>How Belts Work:</strong></p>
            <ol>
              <li>Cards are organized into belts by slot type (leader, base, common A, common B, uncommon, rare/legendary, foil)</li>
              <li>Each belt is shuffled once at the start</li>
              <li>Cards are drawn sequentially from the belt</li>
              <li>When a belt is exhausted, it's reshuffled and reused</li>
              <li>This prevents the same card from appearing in consecutive packs</li>
            </ol>

            <p><strong>Common Belts (A & B):</strong></p>
            <ul>
              <li><strong>Belt A</strong>: Vigilance, Command, Heroism aspects</li>
              <li><strong>Belt B</strong>: Aggression, Cunning, Villainy aspects</li>
              <li>Packs alternate drawing from A and B (positions 0,2,4,6,8 vs 1,3,5,7)</li>
              <li>Ensures all 6 aspects appear in every pack's 9 commons</li>
            </ul>
          </div>
        </section>

        {/* Upgrade System */}
        <section className="reference-section reference-full-width">
          <h3>Upgrade System</h3>
          <div className="reference-description">
            <p>After the base pack is generated, an upgrade pass can replace certain cards with premium versions:</p>
          </div>
          <table className="reference-table">
            <thead>
              <tr>
                <th>Upgrade Type</th>
                <th>Probability</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Leader → Showcase</strong></td>
                <td>~0.35%</td>
                <td>Showcase leaders (all sets, ~1 in 288 packs). Takes priority over Hyperspace.</td>
              </tr>
              <tr>
                <td><strong>Leader → Hyperspace</strong></td>
                <td>~17%</td>
                <td>Hyperspace variant of the leader (1 in 6 packs)</td>
              </tr>
              <tr>
                <td><strong>Base → Hyperspace</strong></td>
                <td>~25%</td>
                <td>Hyperspace variant of the base (1 in 4 packs)</td>
              </tr>
              <tr>
                <td><strong>Rare → Hyperspace R/L</strong></td>
                <td>0%</td>
                <td>Rare slot is always standard (black border), never Hyperspace</td>
              </tr>
              <tr>
                <td><strong>3rd UC → R/L</strong></td>
                <td>~18-20%</td>
                <td>Third uncommon upgrades to rare/legendary (varies by set)</td>
              </tr>
              <tr>
                <td><strong>Foil → Hyperfoil</strong></td>
                <td>~2%</td>
                <td>Ultra-rare Hyperfoil variant (1 in 50 packs, ~1 per 2 boxes)</td>
              </tr>
              <tr>
                <td><strong>UC 1/2 → Hyperspace UC</strong></td>
                <td>~12%</td>
                <td>First or second uncommon becomes Hyperspace (1 in 8.5 packs)</td>
              </tr>
              <tr>
                <td><strong>Common → Hyperspace C</strong></td>
                <td>~33%</td>
                <td>One random common becomes Hyperspace variant (1 in 3 packs)</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Hyperspace */}
        <section className="reference-section">
          <h3>Hyperspace Variants</h3>
          <div className="reference-description">
            <p><strong>What is Hyperspace?</strong></p>
            <p>Hyperspace variants are alternate versions of cards with different art and a blue border. They're mechanically identical but visually distinct.</p>

            <p><strong>Hyperspace Sources:</strong></p>
            <ul>
              <li>Upgrade passes (listed above)</li>
              <li>Can appear as regular cards or foils</li>
              <li>Special "Hyperfoil" versions are extremely rare</li>
            </ul>
          </div>
        </section>

        {/* Special Rarity */}
        <section className="reference-section">
          <h3>Special Rarity</h3>
          <div className="reference-description">
            <p><strong>Sets 1-3 (Legacy):</strong></p>
            <ul>
              <li>Special rarity cards exist but don't appear in standard boosters</li>
              <li>8 special cards per set</li>
              <li>Available through other products only</li>
            </ul>

            <p><strong>Sets 4-6:</strong></p>
            <ul>
              <li>Special rarity can appear in the <strong>foil slot only</strong></li>
              <li>Never in regular rare/legendary slot</li>
              <li>12-16 special cards per set</li>
              <li>Same total output rate as Rare (dynamic multiplier scales for card count)</li>
            </ul>
          </div>
        </section>

        {/* Showcase */}
        <section className="reference-section">
          <h3>Showcase Cards</h3>
          <div className="reference-description">
            <p><strong>What are Showcase Cards?</strong></p>
            <p>Showcase cards are premium variants with special borderless alternate art. They exist in all sets from SOR onwards.</p>

            <p><strong>Showcase Distribution:</strong></p>
            <ul>
              <li>Only leaders can be Showcase</li>
              <li>~0.35% chance (~1 in 288 packs)</li>
              <li>Takes priority over Hyperspace leader upgrade</li>
              <li>Can also appear as foils</li>
            </ul>
          </div>
        </section>

        {/* Quality Score Overview */}
        <section className="reference-section reference-full-width">
          <h3>Quality Score</h3>
          <div className="reference-description">
            <p>The Quality Score is a percentage representing overall pack generation health:</p>
            <ul>
              <li><strong>Calculation:</strong> (metrics within expected / total metrics) × 100</li>
              <li><strong>Excellent (90-100%):</strong> Nearly all metrics pass validation</li>
              <li><strong>Good (75-89%):</strong> Most metrics pass, minor variances acceptable</li>
              <li><strong>Acceptable (60-74%):</strong> Some metrics failing, may need attention</li>
              <li><strong>Needs Attention (&lt;60%):</strong> Significant issues with pack generation</li>
            </ul>
            <p>The score combines structural checks (pass/fail) and rate metrics (statistical tolerance).</p>
          </div>
        </section>

        {/* Quality Metrics Explained */}
        <section className="reference-section reference-full-width">
          <h3>Quality Metrics Explained</h3>
          <div className="reference-description">
            <p>The Quality subtab in each set shows automated validation of pack generation. Here&apos;s what each metric measures:</p>

            <p><strong>Structural Validation:</strong></p>
            <ul>
              <li><strong>Pack has exactly 16 cards:</strong> Every pack must contain exactly 16 cards</li>
              <li><strong>Pack has 1 leader:</strong> Exactly one leader card per pack</li>
              <li><strong>Pack has 1 base:</strong> Exactly one base card per pack</li>
              <li><strong>Pack has 9 commons:</strong> Nine common cards (from A/B belts)</li>
              <li><strong>Pack has 1 foil:</strong> Exactly one foil card of any rarity</li>
              <li><strong>All 6 aspects in commons:</strong> The 9 commons must cover all 6 aspects</li>
              <li><strong>No same-treatment duplicates:</strong> No card appears twice with the same treatment</li>
            </ul>

            <p><strong>Rate Validation:</strong></p>
            <ul>
              <li><strong>Legendary Rate:</strong> Sets 1-3: ~14.3% (6:1), Sets 4+: ~16.7% (5:1)</li>
              <li><strong>Hyperspace Leader:</strong> ~17% of leaders should be Hyperspace (1 in 6 packs)</li>
              <li><strong>Hyperspace Base:</strong> ~25% of bases should be Hyperspace (1 in 4 packs)</li>
              <li><strong>Hyperspace Common:</strong> ~33% of packs should have a Hyperspace common (1 in 3)</li>
              <li><strong>Hyperfoil:</strong> ~2% of foils should be Hyperspace Foil variants (1 in 50)</li>
              <li><strong>Showcase Leader:</strong> ~0.35% of leaders should be Showcase (~1 in 288 packs)</li>
            </ul>

            <p><strong>Foil Distribution (Sets 1-3 / Sets 4+):</strong></p>
            <ul>
              <li><strong>Common foils:</strong> Expected ~78% / ~75%</li>
              <li><strong>Uncommon foils:</strong> Expected ~17% / ~17%</li>
              <li><strong>Rare foils:</strong> Expected ~5% / ~4%</li>
              <li><strong>Legendary foils:</strong> Expected ~0.3% / ~0.3%</li>
              <li><strong>Special foils:</strong> Expected 0% / ~4% (Sets 4+ only, same rate as Rare)</li>
            </ul>
          </div>
        </section>

        {/* Statistical Methods */}
        <section className="reference-section reference-full-width">
          <h3>Statistical Methods</h3>
          <div className="reference-description">
            <p><strong>Z-Score (Standard Score):</strong></p>
            <p>Measures how many standard deviations an observed value is from the expected value.</p>
            <ul>
              <li>Formula: Z = (observed - expected) / standard_error</li>
              <li>|Z| &lt; 1.96: Within 95% confidence (normal)</li>
              <li>1.96 &lt; |Z| &lt; 2.58: Between 95-99% confidence (outlier)</li>
              <li>|Z| &gt; 2.58: Beyond 99% confidence (extreme outlier)</li>
            </ul>

            <p><strong>Wilson Score Confidence Interval:</strong></p>
            <p>Used for binomial proportions (rate metrics). More accurate than simple intervals for small samples or extreme probabilities.</p>
            <ul>
              <li>Provides upper and lower bounds for the true rate</li>
              <li>If expected rate falls within the confidence interval, the metric passes</li>
              <li>Handles edge cases (0% or 100% observed) better than simpler methods</li>
            </ul>

            <p><strong>Chi-Squared Goodness-of-Fit Test:</strong></p>
            <p>Tests whether an observed distribution matches an expected distribution.</p>
            <ul>
              <li>Used for foil rarity distribution (multiple categories)</li>
              <li>p-value &gt; 0.05: Distribution matches expected (pass)</li>
              <li>p-value &lt; 0.05: Significant deviation from expected (fail)</li>
              <li>Reports degrees of freedom (df) = number of categories - 1</li>
            </ul>
          </div>
        </section>

        {/* Statistical Interpretation */}
        <section className="reference-section reference-full-width">
          <h3>Status Color Coding</h3>
          <div className="reference-description">
            <p>All rate metrics use Z-tests to compare actual vs expected generation rates:</p>
          </div>
          <div className="stats-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#27AE6040' }}></span>
              <div className="legend-text">
                <strong>Green (Within Expected)</strong>
                <p>Within 95% confidence interval (|Z| &lt; 1.96). Normal statistical variation. No action needed.</p>
              </div>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#F39C1240' }}></span>
              <div className="legend-text">
                <strong>Yellow (Slight Variance)</strong>
                <p>95-99% confidence interval (1.96 &lt; |Z| &lt; 2.58). Statistically unusual but could be random chance. Worth monitoring.</p>
              </div>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#E74C3C40' }}></span>
              <div className="legend-text">
                <strong>Red (Outlier)</strong>
                <p>Beyond 99% confidence interval (|Z| &gt; 2.58). Very unlikely to occur by chance. May indicate a bug in pack generation.</p>
              </div>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#88888840' }}></span>
              <div className="legend-text">
                <strong>Gray (Insufficient Data)</strong>
                <p>Not enough samples for reliable statistics. Generate more packs for accurate results.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pack Opening Expectations */}
        <section className="reference-section reference-full-width">
          <h3>Expected Pack Opening Results</h3>
          <div className="reference-description">
            <p><strong>In a typical booster box (24 packs):</strong></p>
            <ul>
              <li><strong>Legendaries:</strong> ~3-4 non-foil + ~0.5 foil = ~4 total (Sets 1-3), ~4-5 total (Sets 4+)</li>
              <li><strong>Rares:</strong> ~20-21 non-foil + ~2 foil = ~22 total</li>
              <li><strong>Hyperfoils:</strong> ~0.5 (about 1 per 2 boxes)</li>
              <li><strong>Showcase Leaders:</strong> ~0.08 per box (~1 per 12 boxes, all sets)</li>
              <li><strong>UC Upgrades:</strong> ~4-5 packs will have 2 rare/legendary</li>
            </ul>

            <p><strong>In a sealed pool (6 packs):</strong></p>
            <ul>
              <li><strong>Legendaries:</strong> ~1 total (0-2 range is normal)</li>
              <li><strong>Rares:</strong> ~5-6 total</li>
              <li><strong>All 6 aspects:</strong> Guaranteed in commons of every pack</li>
              <li><strong>Card+Foil pairs:</strong> 95-99% chance of at least one pair</li>
            </ul>
          </div>
        </section>

        {/* Set-Specific Rules */}
        <section className="reference-section reference-full-width">
          <h3>Set-Specific Rules</h3>
          <table className="reference-table">
            <thead>
              <tr>
                <th>Rule</th>
                <th>Sets 1-3 (SOR/SHD/TWI)</th>
                <th>Sets 4-6 (JTL/LOF/SEC)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Special Rarity</strong></td>
                <td>Not in boosters</td>
                <td>Foil slot only (same rate as Rare)</td>
              </tr>
              <tr>
                <td><strong>Showcase Leaders</strong></td>
                <td>~0.35% (1 in 288)</td>
                <td>~0.35% (1 in 288)</td>
              </tr>
              <tr>
                <td><strong>Legendary Rate</strong></td>
                <td>~14.3% (6:1 ratio)</td>
                <td>~16.7% (5:1 ratio)</td>
              </tr>
              <tr>
                <td><strong>Hyperfoil Rate</strong></td>
                <td>~2% (1 in 50)</td>
                <td>~2% (1 in 50)</td>
              </tr>
              <tr>
                <td><strong>UC Upgrade Rate</strong></td>
                <td>~18% (1 in 5.5)</td>
                <td>~20% (1 in 5)</td>
              </tr>
              <tr>
                <td><strong>Foil Legendary Weight</strong></td>
                <td>2%</td>
                <td>3%</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Technical Notes */}
        <section className="reference-section reference-full-width">
          <h3>Technical Notes</h3>
          <div className="reference-description">
            <p><strong>Card Treatments:</strong></p>
            <ul>
              <li><strong>Base:</strong> Normal version of a card (no special treatment)</li>
              <li><strong>Hyperspace:</strong> Blue border alternate art version</li>
              <li><strong>Foil:</strong> Shiny/holographic version (any variant can be foil)</li>
              <li><strong>Hyperspace Foil:</strong> Foil version of Hyperspace variant</li>
              <li><strong>Showcase:</strong> Borderless premium art (leaders only, all sets)</li>
            </ul>

            <p><strong>Duplicate Prevention:</strong></p>
            <ul>
              <li>Same card with same treatment cannot appear twice in one pack</li>
              <li>Different treatments of same card ARE allowed (e.g., normal + foil version)</li>
              <li>Belt system prevents immediate duplicates across consecutive packs</li>
            </ul>

            <p><strong>Aspect Balance:</strong></p>
            <ul>
              <li>All 6 aspects (Vigilance, Command, Aggression, Cunning, Heroism, Villainy) guaranteed in every pack</li>
              <li>Achieved through alternating common belt draws (A/B pattern)</li>
              <li>Belt A: Vigilance, Command, Heroism (positions 0,2,4,6,8)</li>
              <li>Belt B: Aggression, Cunning, Villainy (positions 1,3,5,7)</li>
              <li>9th common position ensures at least one duplicate aspect for deckbuilding</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

function QATab() {
  const [qaResults, setQaResults] = useState<QAResults | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQAResults()
  }, [])

  const loadQAResults = () => {
    setLoading(true)
    fetch('/api/stats/qa')
      .then(res => res.json())
      .then(response => {
        // API wraps response in {success: true, data: {...}}
        setQaResults(response.data || response)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  if (loading) {
    return <div className="stats-loading">Loading QA results...</div>
  }

  return (
    <div className="qa-tab">
      <div className="qa-header">
        <h2>QA Test Results</h2>
      </div>

      {!qaResults?.available || !qaResults?.latestRun ? (
        <div className="stats-empty">
          <p>Quality assurance tests have not been run yet.</p>
          <p>Test results will appear here once available.</p>
        </div>
      ) : (
        <div className="qa-results">
          <div className="qa-summary">
            <div className="qa-summary-card">
              <div className="qa-summary-number">{fmt(qaResults.latestRun.summary.total)}</div>
              <div className="qa-summary-label">Total Tests</div>
            </div>
            <div className="qa-summary-card qa-summary-passed">
              <div className="qa-summary-number">{fmt(qaResults.latestRun.summary.passed)}</div>
              <div className="qa-summary-label">Passed</div>
            </div>
            <div className="qa-summary-card qa-summary-failed">
              <div className="qa-summary-number">{fmt(qaResults.latestRun.summary.failed)}</div>
              <div className="qa-summary-label">Failed</div>
            </div>
          </div>

          <div className="qa-test-list">
            <h3>Latest Test Run</h3>
            <p className="qa-run-time">
              Run at: {new Date(qaResults.latestRun.runAt).toLocaleString()}
            </p>

            {qaResults.latestRun.tests.map((test, index) => (
              <div
                key={index}
                className={`qa-test-item qa-test-${test.status}`}
              >
                <div className="qa-test-header">
                  <span className={`qa-test-status qa-status-${test.status}`}>
                    {test.status === 'passed' ? '✓' : '✗'}
                  </span>
                  <span className="qa-test-name">{test.name}</span>
                  <span className="qa-test-suite">{test.suite}</span>
                  {test.executionTime != null && (
                    <span className="qa-test-time">{test.executionTime}ms</span>
                  )}
                </div>
                {test.errorMessage && (
                  <div className="qa-test-error">{test.errorMessage}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// === Types for Quality Tab ===

interface QualityMetricResult {
  observed: number
  expected: number
  observedRate: number
  expectedRate: number
  zScore: number
  status: 'expected' | 'slight_variance' | 'outlier' | 'insufficient_data'
  sampleSize: number
  confidenceInterval: { low: number; high: number }
  displayRate: string
}

interface QualityStructuralMetric {
  metric: string
  passed: number
  failed: number
  rate: number
  status: 'pass' | 'fail' | 'warning'
}

interface QualityChiSquaredResult {
  chiSquared: number
  degreesOfFreedom: number
  pValue: number
  status: 'expected' | 'slight_variance' | 'outlier' | 'insufficient_data'
  interpretation: string
}

interface QualityDuplicateMetric {
  observedMean: number
  observedStdDev: number
  expectedMean: number
  expectedStdDev: number
  zScore: number
  sampleSize: number
  status: 'expected' | 'slight_variance' | 'outlier' | 'insufficient_data'
}

interface QualityDuplicateMetrics {
  baseTreatmentDuplicates: QualityDuplicateMetric
  anyTreatmentDuplicates: QualityDuplicateMetric
  baseTreatmentTriplicates: QualityDuplicateMetric
  anyTreatmentTriplicates: QualityDuplicateMetric
}

interface QualityData {
  setCode: string
  setName: string
  generatedAt: string
  sampleSize: {
    totalPacks: number
    totalCards: number
    packsWithTracking: number
    dateRange: { start: string; end: string } | null
  }
  overallHealth: {
    score: number
    status: 'excellent' | 'good' | 'acceptable' | 'needs_attention'
    metricsWithinExpected: number
    totalMetrics: number
  }
  structuralMetrics: QualityStructuralMetric[]
  rarityMetrics: {
    legendaryRate: QualityMetricResult
    foilRarityDistribution: Record<string, QualityMetricResult>
    foilDistributionTest: QualityChiSquaredResult
  }
  treatmentMetrics: {
    hyperspaceLeader: QualityMetricResult
    hyperspaceBase: QualityMetricResult
    hyperspaceCommon: QualityMetricResult
    hyperfoil: QualityMetricResult
    showcaseLeader: QualityMetricResult
  }
  duplicateMetrics?: QualityDuplicateMetrics
  reference: {
    packStructure: string
    dataSource: string
  }
}

interface QualitySubTabProps {
  data: QualityData | null
  loading: boolean
}

function QualitySubTab({ data, loading }: QualitySubTabProps) {
  const getStatusBadge = (status: QualityMetricResult['status']) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      expected: { bg: 'rgba(39, 174, 96, 0.2)', color: '#27AE60', label: 'Within Expected' },
      slight_variance: { bg: 'rgba(243, 156, 18, 0.2)', color: '#F39C12', label: 'Slight Variance' },
      outlier: { bg: 'rgba(231, 76, 60, 0.2)', color: '#E74C3C', label: 'Outlier' },
      insufficient_data: { bg: 'rgba(255, 255, 255, 0.1)', color: '#888', label: 'Needs Data' },
    }
    const s = styles[status] || styles.insufficient_data
    return (
      <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>
        {s.label}
      </span>
    )
  }

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

  const getHealthColor = (status: string) => {
    const colors: Record<string, string> = {
      excellent: '#27AE60',
      good: '#2ECC71',
      acceptable: '#F39C12',
      needs_attention: '#E74C3C',
    }
    return colors[status] || '#888'
  }

  const renderMetricRow = (label: string, metric: QualityMetricResult) => (
    <tr key={label}>
      <td>{label}</td>
      <td>{metric.displayRate}</td>
      <td>{formatPercent(metric.observedRate)}</td>
      <td>{fmt(metric.sampleSize)}</td>
      <td style={{ textAlign: 'center' }}>{getStatusBadge(metric.status)}</td>
    </tr>
  )

  if (loading) {
    return <div className="stats-loading">Loading pack quality data...</div>
  }

  if (!data) {
    return <div className="stats-empty"><p>No quality data available yet.</p></div>
  }

  return (
    <div className="quality-subtab">
      {/* Quality Score Overview */}
      <div className="qa-summary" style={{ marginBottom: '30px' }}>
        <div className="qa-summary-card">
          <div className="qa-summary-number">{fmt(data.sampleSize.totalPacks)}</div>
          <div className="qa-summary-label">Packs Generated</div>
        </div>
        <div className="qa-summary-card" style={{ borderColor: getHealthColor(data.overallHealth.status) }}>
          <div className="qa-summary-number" style={{ color: getHealthColor(data.overallHealth.status) }}>
            {data.overallHealth.score}%
          </div>
          <div className="qa-summary-label">Quality Score</div>
        </div>
        <div className="qa-summary-card">
          <div className="qa-summary-number">
            {data.overallHealth.metricsWithinExpected}/{data.overallHealth.totalMetrics}
          </div>
          <div className="qa-summary-label">Metrics OK</div>
        </div>
        <div className="qa-summary-card">
          <div className="qa-summary-number">
            {fmt(data.structuralMetrics.filter(m => m.status === 'pass').length)}/{fmt(data.structuralMetrics.length)}
          </div>
          <div className="qa-summary-label">Structure OK</div>
        </div>
      </div>

      {/* Structural Metrics */}
      <h3>Structural Validation</h3>
      <table className="quality-table" style={{ width: '100%', marginBottom: '30px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>Check</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Passed</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Failed</th>
            <th style={{ textAlign: 'center', padding: '8px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.structuralMetrics.map(m => (
            <tr key={m.metric} style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: '8px' }}>{m.metric}</td>
              <td style={{ textAlign: 'right', padding: '8px', color: '#27AE60' }}>{fmt(m.passed)}</td>
              <td style={{ textAlign: 'right', padding: '8px', color: m.failed > 0 ? '#E74C3C' : '#888' }}>{fmt(m.failed)}</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>
                <span style={{
                  background: m.status === 'pass' ? 'rgba(39,174,96,0.2)' : m.status === 'fail' ? 'rgba(231,76,60,0.2)' : 'rgba(255,255,255,0.1)',
                  color: m.status === 'pass' ? '#27AE60' : m.status === 'fail' ? '#E74C3C' : '#888',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '11px',
                }}>
                  {m.status === 'pass' ? '✓ Pass' : m.status === 'fail' ? '✗ Fail' : 'No Data'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Rate Validation */}
      <h3>Rate Validation</h3>
      <table className="quality-table" style={{ width: '100%', marginBottom: '30px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>Metric</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Expected</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Observed</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Sample</th>
            <th style={{ textAlign: 'center', padding: '8px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {renderMetricRow('Legendary Rate', data.rarityMetrics.legendaryRate)}
          {renderMetricRow('Hyperspace Leader', data.treatmentMetrics.hyperspaceLeader)}
          {renderMetricRow('Hyperspace Base', data.treatmentMetrics.hyperspaceBase)}
          {renderMetricRow('Hyperspace Common', data.treatmentMetrics.hyperspaceCommon)}
          {renderMetricRow('Hyperfoil', data.treatmentMetrics.hyperfoil)}
          {renderMetricRow('Showcase Leader', data.treatmentMetrics.showcaseLeader)}
        </tbody>
      </table>

      {/* Foil Distribution */}
      <h3>Foil Rarity Distribution</h3>
      <table className="quality-table" style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>Rarity</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Expected</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Observed</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Sample</th>
            <th style={{ textAlign: 'center', padding: '8px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data.rarityMetrics.foilRarityDistribution).map(([rarity, metric]) =>
            renderMetricRow(rarity, metric)
          )}
        </tbody>
      </table>

      {/* Chi-squared result */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #333', borderRadius: '8px', padding: '16px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <strong>Foil Distribution Goodness-of-Fit Test</strong>
          {getStatusBadge(data.rarityMetrics.foilDistributionTest.status)}
        </div>
        <p style={{ color: '#888', margin: '0 0 12px', fontSize: '14px' }}>
          {data.rarityMetrics.foilDistributionTest.interpretation}
        </p>
        <div style={{ display: 'flex', gap: '24px', fontFamily: 'monospace', fontSize: '13px', color: '#888' }}>
          <span>χ² = {data.rarityMetrics.foilDistributionTest.chiSquared}</span>
          <span>df = {data.rarityMetrics.foilDistributionTest.degreesOfFreedom}</span>
          <span>p = {data.rarityMetrics.foilDistributionTest.pValue}</span>
        </div>
      </div>

      {/* Duplicate/Triplicate Metrics */}
      {data.duplicateMetrics && (
        <>
          <h3>Duplicate & Triplicate Distribution</h3>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '16px' }}>
            Per sealed pool (6 packs), excluding leaders and bases. Values should match expected statistical distribution.
          </p>
          <table className="quality-table" style={{ width: '100%', marginBottom: '30px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Metric</th>
                <th style={{ textAlign: 'right', padding: '8px' }}>Observed</th>
                <th style={{ textAlign: 'right', padding: '8px' }}>Expected</th>
                <th style={{ textAlign: 'right', padding: '8px' }}>Z-Score</th>
                <th style={{ textAlign: 'right', padding: '8px' }}>Sample</th>
                <th style={{ textAlign: 'center', padding: '8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Duplicates (Base Treatment)', metric: data.duplicateMetrics.baseTreatmentDuplicates, precision: 2 },
                { label: 'Duplicates (Any Treatment)', metric: data.duplicateMetrics.anyTreatmentDuplicates, precision: 2 },
                { label: 'Triplicates (Base Treatment)', metric: data.duplicateMetrics.baseTreatmentTriplicates, precision: 3 },
                { label: 'Triplicates (Any Treatment)', metric: data.duplicateMetrics.anyTreatmentTriplicates, precision: 3 },
              ].map(({ label, metric, precision }) => (
                <tr key={label} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '8px' }}>{label}</td>
                  <td style={{ textAlign: 'right', padding: '8px' }}>
                    {metric.observedMean.toFixed(precision)} ± {metric.observedStdDev.toFixed(precision)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px' }}>
                    {metric.expectedMean.toFixed(precision)} ± {metric.expectedStdDev.toFixed(precision)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px', fontFamily: 'monospace' }}>
                    {metric.zScore >= 0 ? '+' : ''}{metric.zScore.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px' }}>{fmt(metric.sampleSize)}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    {getStatusBadge(metric.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ color: '#666', fontSize: '12px', marginTop: '-20px', marginBottom: '30px' }}>
            <strong>Base Treatment:</strong> Only Normal variant cards (no foil/hyperspace/showcase) — same base card appearing multiple times.<br/>
            <strong>Any Treatment:</strong> Exact card ID matches — includes foil/hyperspace variants as distinct.<br/>
            <strong>Z-Score:</strong> How many standard deviations from expected. |Z| &lt; 2 is normal, |Z| &gt; 3 indicates an issue.
          </p>
        </>
      )}

      <p style={{ color: '#555', fontSize: '12px', marginTop: '20px' }}>
        Data generated: {new Date(data.generatedAt).toLocaleString()}
      </p>
    </div>
  )
}

// Legacy QualityTab for backwards compatibility - redirects to Reference
function QualityTab() {
  return (
    <div className="quality-tab">
      <p style={{ color: '#888' }}>Quality metrics are now shown in each set&apos;s tab under the &quot;Quality&quot; subtab.</p>
      <p style={{ color: '#888' }}>Select a set (SOR, SHD, TWI, etc.) to view quality metrics for that set.</p>
    </div>
  )
}

