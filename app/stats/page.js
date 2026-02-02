'use client'

import { useState, useEffect } from 'react'
import './stats.css'

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState('Reference')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    window.location.hash = tab
  }

  useEffect(() => {
    if (activeTab === 'Reference' || activeTab === 'QA' || activeTab === 'Test') {
      setLoading(false)
      return
    }

    // Load stats for the active set
    setLoading(true)
    fetch(`/api/stats/generations?setCode=${activeTab}`)
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

  const tabs = ['Reference', 'QA', 'Test', 'SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC']

  // Set colors for tabs
  const setColors = {
    'SOR': '#CC0000',
    'SHD': '#6B21A8',
    'TWI': '#0891B2',
    'JTL': '#EA580C',
    'LOF': '#16A34A',
    'SEC': '#7C3AED'
  }

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h1>Statistics</h1>
        <p>Statistical analysis of card and pack generation for nerds</p>
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
          <ReferenceTab stats={stats} />
        ) : activeTab === 'QA' ? (
          <QATab />
        ) : activeTab === 'Test' ? (
          <TestTab />
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

function GenerationStatsTab({ stats, setCode }) {
  const [subTab, setSubTab] = useState('cards')

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
            <span className="stat-value">{stats.totalPools}</span>
            <span className="stat-detail">({stats.draftPools} draft, {stats.sealedPools} sealed)</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Packs:</span>
            <span className="stat-value">{stats.totalPacks}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Cards Tracked:</span>
            <span className="stat-value">{stats.totalCards.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Unique Cards:</span>
            <span className="stat-value">{stats.cards.length}</span>
          </div>
        </div>
        {!hasEnoughData && (
          <p className="stats-warning">
            Warning: Small sample size - statistics may not be reliable yet. Generate more packs for better accuracy.
          </p>
        )}
      </div>

      {/* Pack-Level Metrics Section */}
      {stats.packMetrics && (
        <PackMetricsSection metrics={stats.packMetrics} />
      )}

      {/* Sub-tabs for Cards and Packs - directly above content */}
      <div className="stats-subtabs">
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

      {subTab === 'cards' ? (
        <CardsSubTab stats={stats} setCode={setCode} hasEnoughData={hasEnoughData} />
      ) : (
        <PacksSubTab setCode={setCode} />
      )}
    </div>
  )
}

function CardsSubTab({ stats, setCode, hasEnoughData }) {
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

function PacksSubTab({ setCode }) {
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const limit = 20

  useEffect(() => {
    setLoading(true)
    setOffset(0)
    fetch(`/api/stats/packs?setCode=${setCode}&limit=${limit}&offset=0`)
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
    fetch(`/api/stats/packs?setCode=${setCode}&limit=${limit}&offset=${newOffset}`)
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
        <p>Showing {packs.length} of {total} packs</p>
      </div>
      <div className="packs-grid">
        {packs.map((pack, idx) => (
          <div key={`${pack.sourceId}-${pack.packIndex}-${idx}`} className="pack-container">
            <div className="pack-header">
              <span className="pack-label">Pack {pack.packIndex + 1}</span>
              <span className="pack-source">{pack.sourceType}</span>
              {pack.sourceId && (
                <a href={`/pool/${pack.sourceId}`} className="pack-pool-link" title={`View pool ${pack.sourceId}`}>
                  {pack.sourceId.slice(0, 8)}...
                </a>
              )}
            </div>
            <div className="pack-cards">
              {pack.cards.map((card, cardIdx) => (
                <div
                  key={`${card.cardId}-${cardIdx}`}
                  className={`pack-card ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''}`}
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
              ))}
            </div>
          </div>
        ))}
      </div>
      {packs.length < total && (
        <div className="load-more-container">
          <button className="load-more-button" onClick={loadMore} disabled={loading}>
            {loading ? 'Loading...' : `Load More (${total - packs.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  )
}

function TreatmentCell({ treatment, hasEnoughData }) {
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

function PackMetricsSection({ metrics }) {
  if (!metrics) return null

  const totalCards = Object.values(metrics.treatmentDistribution || {}).reduce((a, b) => a + b, 0)
  const totalPools = metrics.poolSameTreatmentDuplicates?.totalPools || 0
  const totalPacks = metrics.totalPacksTracked || 0

  // Statistical analysis helper
  const getMetricStatus = (observed, expected, threshold = 10) => {
    const diff = Math.abs(observed - expected)
    if (diff <= threshold) return { status: 'expected', color: '#27AE60' }
    if (diff <= threshold * 2) return { status: 'outlier', color: '#F39C12' }
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
  const treatmentExpected = {
    base: 87, // ~14 of 16 cards
    hyperspace: 6, // ~1 card
    foil: 6, // 1 foil per pack
    hyperspace_foil: 0.5, // rare
    showcase: 0.5 // rare, leaders only
  }

  // Rarity distribution expected (per 16 cards)
  const rarityExpected = {
    Common: 56, // 9/16
    Uncommon: 16, // 2.5/16
    Rare: 8, // ~1.3/16
    Legendary: 2, // ~0.3/16
    Leader: 6, // 1/16
    Base: 6, // 1/16
    Special: 0.5
  }

  return (
    <div className="pack-metrics-section">
      {/* Pack-Level Statistics */}
      <h3>Pack-Level Statistics</h3>
      <p className="pack-metrics-description">
        Per-pack analysis from {totalPacks.toLocaleString()} tracked packs
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
              {metrics.packSameTreatmentDuplicates?.packsAffected || 0} / {totalPacks} packs have duplicate cards
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
              {metrics.packCrossTreatmentDuplicates?.packsAffected || 0} / {totalPacks} packs have card+foil pair
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
        Aggregate statistics from {totalPools} pools
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
            {metrics.poolSameTreatmentDuplicates?.poolsAffected || 0} / {totalPools} pools have card appearing 2+ times
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
            {metrics.poolCrossTreatmentDuplicates?.poolsAffected || 0} / {totalPools} pools have card+foil pair
          </p>
        </div>
      </div>
    </div>
  )
}

function ReferenceTab({ stats }) {
  const sets = ['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC']
  const [selectedSet, setSelectedSet] = useState('SOR')

  // Get set-specific info
  const getSetInfo = (setCode) => {
    const setNames = {
      'SOR': 'Spark of Rebellion',
      'SHD': 'Shadows of the Galaxy',
      'TWI': 'Twilight of the Republic',
      'JTL': 'Jump to Lightspeed',
      'LOF': 'Legends of the Force',
      'SEC': 'Secrets of Power'
    }

    // Sets 1-3 vs Sets 4-6 have different rules
    const isLegacySet = ['SOR', 'SHD', 'TWI'].includes(setCode)

    return {
      name: setNames[setCode],
      isLegacySet,
      // Card counts vary by set but structure is similar
      cardCounts: {
        leaders: isLegacySet ? '16-18' : '18-20',
        bases: isLegacySet ? '12-16' : '12-16',
        commons: '81-90',
        uncommons: '60',
        rares: '47-48',
        legendaries: '16-18',
        special: isLegacySet ? '8' : '12-16'
      },
      legendaryRate: isLegacySet ? '~14.3%' : '~14.3%',
      hyperfoilRate: '~2% (1 in 50 packs)',
      showcaseRate: isLegacySet ? 'N/A' : '~5%'
    }
  }

  const setInfo = getSetInfo(selectedSet)

  return (
    <div className="reference-tab">
      <h2>Pack Generation Reference - {setInfo.name}</h2>
      <p className="reference-intro">
        Complete technical documentation of how booster packs are generated in Star Wars: Unlimited.
      </p>

      <div className="reference-set-selector">
        {sets.map(set => (
          <button
            key={set}
            className={`go-button ${selectedSet === set ? 'selected' : ''}`}
            onClick={() => setSelectedSet(set)}
          >
            {set}
          </button>
        ))}
      </div>

      <div className="reference-sections">
        {/* Pack Structure */}
        <section className="reference-section reference-full-width">
          <h3>📦 Pack Structure (16 Cards Total)</h3>
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
                <td>One guaranteed Rare or Legendary (L rate: {setInfo.legendaryRate}). Can be 2 if third UC upgrades.</td>
              </tr>
              <tr>
                <td><strong>Foil</strong></td>
                <td>1</td>
                <td>One foil card of any rarity (weighted: 70% C / 20% U / 8% R / 2% L). Can upgrade to Hyperfoil.</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Card Counts */}
        <section className="reference-section">
          <h3>🎴 Card Pool Sizes</h3>
          <div className="reference-description">
            <p>Total unique cards available in {setInfo.name}:</p>
          </div>
          <table className="reference-table">
            <tbody>
              <tr>
                <td>Leaders</td>
                <td><strong>{setInfo.cardCounts.leaders}</strong></td>
              </tr>
              <tr>
                <td>Bases</td>
                <td><strong>{setInfo.cardCounts.bases}</strong></td>
              </tr>
              <tr>
                <td>Commons</td>
                <td><strong>{setInfo.cardCounts.commons}</strong></td>
              </tr>
              <tr>
                <td>Uncommons</td>
                <td><strong>{setInfo.cardCounts.uncommons}</strong></td>
              </tr>
              <tr>
                <td>Rares</td>
                <td><strong>{setInfo.cardCounts.rares}</strong></td>
              </tr>
              <tr>
                <td>Legendaries</td>
                <td><strong>{setInfo.cardCounts.legendaries}</strong></td>
              </tr>
              <tr>
                <td>Special</td>
                <td><strong>{setInfo.cardCounts.special}</strong></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Rarity Distribution */}
        <section className="reference-section">
          <h3>🎲 Rarity Distribution</h3>
          <div className="reference-description">
            <p><strong>Rare/Legendary Slot:</strong></p>
            <ul>
              <li>Legendary: {setInfo.legendaryRate} (6:1 ratio)</li>
              <li>Rare: ~85.7%</li>
            </ul>
            <p><strong>Third UC Slot Upgrade:</strong></p>
            <ul>
              <li>Stays UC: ~82%</li>
              <li>Upgrades to R/L: ~18%</li>
            </ul>
          </div>
        </section>

        {/* Leader Rarity */}
        <section className="reference-section">
          <h3>👑 Leader Rarity Distribution</h3>
          <div className="reference-description">
            <p>Leaders come in two rarities:</p>
            <ul>
              <li><strong>Common Leaders:</strong> 8 per set (easier to pull)</li>
              <li><strong>Rare/Legendary Leaders:</strong> 10 per set (harder to pull)</li>
            </ul>
            <p><strong>Total Leaders per Set:</strong> 18</p>

            <p><strong>In the Leader Slot:</strong></p>
            <ul>
              <li>All leaders have equal probability (uniform distribution)</li>
              <li>1 in 18 chance for any specific leader</li>
              <li>Rarity doesn't affect pull rate - it's aesthetic/collectibility</li>
            </ul>
          </div>
        </section>

        {/* Foil Slot */}
        <section className="reference-section reference-full-width">
          <h3>✨ Foil Slot Distribution</h3>
          <div className="reference-description">
            <p>The foil slot uses weighted random selection:</p>
          </div>
          <table className="reference-table">
            <thead>
              <tr>
                <th>Rarity</th>
                <th>Weight</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Common</td>
                <td><strong>70%</strong></td>
                <td>Most foils are commons</td>
              </tr>
              <tr>
                <td>Uncommon</td>
                <td><strong>20%</strong></td>
                <td>About 1 in 5 foils</td>
              </tr>
              <tr>
                <td>Rare</td>
                <td><strong>8%</strong></td>
                <td>Roughly 1 in 12 foils</td>
              </tr>
              <tr>
                <td>Legendary</td>
                <td><strong>2%</strong></td>
                <td>Very rare - 1 in 50 foils</td>
              </tr>
              {!setInfo.isLegacySet && (
                <tr>
                  <td>Special</td>
                  <td><strong>Varies</strong></td>
                  <td>Special rarity cards only appear in foil slot (Sets 4-6)</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Belt System */}
        <section className="reference-section reference-full-width">
          <h3>🎰 The Belt System</h3>
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
          <h3>⬆️ Upgrade System</h3>
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
                <td>{setInfo.showcaseRate}</td>
                <td>Showcase leaders (Sets 4-6 only, takes priority over Hyperspace)</td>
              </tr>
              <tr>
                <td><strong>Leader → Hyperspace</strong></td>
                <td>~15%</td>
                <td>Hyperspace variant of the leader</td>
              </tr>
              <tr>
                <td><strong>Base → Hyperspace</strong></td>
                <td>~15%</td>
                <td>Hyperspace variant of the base</td>
              </tr>
              <tr>
                <td><strong>Rare → Hyperspace R/L</strong></td>
                <td>~20%</td>
                <td>Hyperspace variant in the rare slot</td>
              </tr>
              <tr>
                <td><strong>3rd UC → Hyperspace R/L</strong></td>
                <td>~18%</td>
                <td>Third uncommon upgrades to rare/legendary (Hyperspace variant)</td>
              </tr>
              <tr>
                <td><strong>Foil → Hyperfoil</strong></td>
                <td>{setInfo.hyperfoilRate}</td>
                <td>Ultra-rare Hyperfoil variant (about 1 per 2-3 boxes)</td>
              </tr>
              <tr>
                <td><strong>UC 1/2 → Hyperspace UC</strong></td>
                <td>~15% each</td>
                <td>First or second uncommon becomes Hyperspace variant</td>
              </tr>
              <tr>
                <td><strong>Common → Hyperspace C</strong></td>
                <td>~10%</td>
                <td>One random common becomes Hyperspace variant</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Hyperspace */}
        <section className="reference-section">
          <h3>🌌 Hyperspace Variants</h3>
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
          <h3>⭐ Special Rarity</h3>
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
              <li>Distribution weighted similar to legendary foils</li>
            </ul>
          </div>
        </section>

        {/* Showcase */}
        {!setInfo.isLegacySet && (
          <section className="reference-section">
            <h3>🎨 Showcase Cards</h3>
            <div className="reference-description">
              <p><strong>What are Showcase Cards?</strong></p>
              <p>Showcase cards are premium variants with special borderless art. They're exclusive to Sets 4-6.</p>

              <p><strong>Showcase Distribution:</strong></p>
              <ul>
                <li>Only leaders can be Showcase</li>
                <li>~5% chance to replace normal leader</li>
                <li>Takes priority over Hyperspace leader upgrade</li>
                <li>Can also appear as foils</li>
              </ul>
            </div>
          </section>
        )}

        {/* Statistical Interpretation */}
        <section className="reference-section reference-full-width">
          <h3>📊 Statistical Interpretation</h3>
          <div className="reference-description">
            <p>The statistics page uses Z-tests to compare actual vs expected generation rates:</p>
          </div>
          <div className="stats-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#27AE6040' }}></span>
              <div className="legend-text">
                <strong>Green (Expected)</strong>
                <p>Within 95% confidence interval. Normal statistical variation. No action needed.</p>
              </div>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#F39C1240' }}></span>
              <div className="legend-text">
                <strong>Yellow (Outlier)</strong>
                <p>95-99% confidence interval. Statistically unusual but could be random chance. Worth monitoring.</p>
              </div>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#E74C3C40' }}></span>
              <div className="legend-text">
                <strong>Red (Extreme Outlier)</strong>
                <p>Beyond 99% confidence interval. Very unlikely to occur by chance. Likely indicates a bug in pack generation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pack Opening Expectations */}
        <section className="reference-section reference-full-width">
          <h3>📈 Expected Pack Opening Results</h3>
          <div className="reference-description">
            <p><strong>In a typical booster box (24 packs):</strong></p>
            <ul>
              <li><strong>Legendaries:</strong> ~3-4 non-foil + ~0.5 foil = ~4 total</li>
              <li><strong>Rares:</strong> ~20-21 non-foil + ~2 foil = ~22 total</li>
              <li><strong>Hyperfoils:</strong> ~0.5 (about 1 per 2 boxes)</li>
              <li><strong>Showcase Leaders:</strong> ~1-2 (Sets 4-6 only)</li>
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
          <h3>🎯 Set-Specific Rules</h3>
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
                <td>Foil slot only</td>
              </tr>
              <tr>
                <td><strong>Showcase Leaders</strong></td>
                <td>Not available</td>
                <td>~5% leader upgrade</td>
              </tr>
              <tr>
                <td><strong>Legendary Rate</strong></td>
                <td>~14.3% (6:1 ratio)</td>
                <td>~14.3% (6:1 ratio)</td>
              </tr>
              <tr>
                <td><strong>Hyperfoil Rate</strong></td>
                <td>~2% (1 in 50)</td>
                <td>~2% (1 in 50)</td>
              </tr>
              <tr>
                <td><strong>UC Upgrade Rate</strong></td>
                <td>~18% (1 in 5.5)</td>
                <td>~18% (1 in 5.5)</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Technical Notes */}
        <section className="reference-section reference-full-width">
          <h3>⚙️ Technical Notes</h3>
          <div className="reference-description">
            <p><strong>Card Treatments:</strong></p>
            <ul>
              <li><strong>Base:</strong> Normal version of a card (no special treatment)</li>
              <li><strong>Hyperspace:</strong> Blue border alternate art version</li>
              <li><strong>Foil:</strong> Shiny/holographic version (any variant can be foil)</li>
              <li><strong>Hyperspace Foil:</strong> Foil version of Hyperspace variant</li>
              <li><strong>Showcase:</strong> Borderless premium art (leaders only, Sets 4-6)</li>
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
  const [qaResults, setQaResults] = useState(null)
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
              <div className="qa-summary-number">{qaResults.latestRun.summary.total}</div>
              <div className="qa-summary-label">Total Tests</div>
            </div>
            <div className="qa-summary-card qa-summary-passed">
              <div className="qa-summary-number">{qaResults.latestRun.summary.passed}</div>
              <div className="qa-summary-label">Passed</div>
            </div>
            <div className="qa-summary-card qa-summary-failed">
              <div className="qa-summary-number">{qaResults.latestRun.summary.failed}</div>
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

function TestTab() {
  const [testResults, setTestResults] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTestResults()
  }, [])

  const loadTestResults = () => {
    setLoading(true)
    fetch('/api/stats/tests')
      .then(res => res.json())
      .then(response => {
        setTestResults(response.data || response)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  if (loading) {
    return <div className="stats-loading">Loading test results...</div>
  }

  return (
    <div className="test-tab">
      <div className="qa-header">
        <h2>Unit Test Results</h2>
      </div>

      {!testResults?.available || !testResults?.latestRun ? (
        <div className="stats-empty">
          <p>Unit tests have not been run yet.</p>
          <p>Run <code>npm run test:json</code> to generate results.</p>
        </div>
      ) : (
        <div className="qa-results">
          <div className="qa-summary">
            <div className="qa-summary-card">
              <div className="qa-summary-number">{testResults.latestRun.summary.totalSuites}</div>
              <div className="qa-summary-label">Test Suites</div>
            </div>
            <div className="qa-summary-card">
              <div className="qa-summary-number">{testResults.latestRun.summary.totalTests}</div>
              <div className="qa-summary-label">Total Tests</div>
            </div>
            <div className="qa-summary-card qa-summary-passed">
              <div className="qa-summary-number">{testResults.latestRun.summary.passed}</div>
              <div className="qa-summary-label">Passed</div>
            </div>
            <div className="qa-summary-card qa-summary-failed">
              <div className="qa-summary-number">{testResults.latestRun.summary.failed}</div>
              <div className="qa-summary-label">Failed</div>
            </div>
          </div>

          <div className="test-execution-time">
            Execution time: {(testResults.latestRun.executionTime / 1000).toFixed(2)}s
          </div>

          <div className="qa-test-list">
            <h3>Test Suites</h3>
            <p className="qa-run-time">
              Run at: {new Date(testResults.latestRun.runAt).toLocaleString()}
            </p>

            {testResults.latestRun.suites.map((suite, index) => (
              <div
                key={index}
                className={`qa-test-item qa-test-${suite.status}`}
              >
                <div className="qa-test-header">
                  <span className={`qa-test-status qa-status-${suite.status}`}>
                    {suite.status === 'passed' ? '✓' : '✗'}
                  </span>
                  <span className="qa-test-name">{suite.name}</span>
                  <span className="qa-test-suite">{suite.suite}</span>
                  {suite.executionTime != null && (
                    <span className="qa-test-time">{suite.executionTime}ms</span>
                  )}
                </div>
                {suite.errorMessage && (
                  <div className="qa-test-error">{suite.errorMessage}</div>
                )}
                {suite.tests && suite.tests.length > 1 && (
                  <div className="test-suite-details">
                    {suite.tests.map((test, testIdx) => (
                      <div key={testIdx} className={`test-detail test-detail-${test.status}`}>
                        <span className="test-detail-icon">
                          {test.status === 'passed' ? '✓' : '✗'}
                        </span>
                        <span className="test-detail-name">{test.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
