// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '../../src/App.css'
import './Quality.css'

interface MetricResult {
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

interface StructuralMetric {
  metric: string
  passed: number
  failed: number
  rate: number
  status: 'pass' | 'fail' | 'warning'
}

interface ChiSquaredResult {
  chiSquared: number
  degreesOfFreedom: number
  pValue: number
  status: 'expected' | 'slight_variance' | 'outlier' | 'insufficient_data'
  interpretation: string
}

interface PackQualityData {
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
  structuralMetrics: StructuralMetric[]
  rarityMetrics: {
    legendaryRate: MetricResult
    foilRarityDistribution: Record<string, MetricResult>
    foilDistributionTest: ChiSquaredResult
  }
  treatmentMetrics: {
    hyperspaceLeader: MetricResult
    hyperspaceBase: MetricResult
    hyperspaceCommon: MetricResult
    hyperfoil: MetricResult
    showcaseLeader: MetricResult
  }
  reference: {
    packStructure: string
    dataSource: string
  }
}

interface SetInfo {
  setCode: string
  setName: string
  packCount: number
}

const SET_CODES = ['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC']

export default function QualityPage() {
  const [selectedSet, setSelectedSet] = useState<string>('SOR')
  const [data, setData] = useState<PackQualityData | null>(null)
  const [availableSets, setAvailableSets] = useState<SetInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Fetch available sets on mount
  useEffect(() => {
    fetch('/api/public/pack-quality?all=true')
      .then(r => r.json())
      .then(result => {
        if (result.data?.sets) {
          setAvailableSets(result.data.sets)
        }
      })
      .catch(console.error)
  }, [])

  // Fetch data for selected set
  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch(`/api/public/pack-quality?setCode=${selectedSet}`)
      .then(r => r.json())
      .then(result => {
        if (result.data) {
          setData(result.data)
        } else if (result.error) {
          setError(result.error)
        }
      })
      .catch(err => {
        setError('Failed to load pack quality data')
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [selectedSet])

  const getStatusBadge = (status: MetricResult['status']) => {
    switch (status) {
      case 'expected':
        return <span className="status-badge status-expected">Within Expected</span>
      case 'slight_variance':
        return <span className="status-badge status-variance">Slight Variance</span>
      case 'outlier':
        return <span className="status-badge status-outlier">Outlier</span>
      case 'insufficient_data':
        return <span className="status-badge status-insufficient">Needs More Data</span>
    }
  }

  const getStructuralBadge = (status: StructuralMetric['status']) => {
    switch (status) {
      case 'pass':
        return <span className="status-badge status-pass">Pass</span>
      case 'fail':
        return <span className="status-badge status-fail">Fail</span>
      case 'warning':
        return <span className="status-badge status-warning">No Data</span>
    }
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#27AE60'
      case 'good': return '#2ECC71'
      case 'acceptable': return '#F39C12'
      case 'needs_attention': return '#E74C3C'
      default: return '#888'
    }
  }

  const renderMetricCard = (label: string, metric: MetricResult, description?: string) => (
    <div className="metric-card" key={label}>
      <div className="metric-header">
        <h4>{label}</h4>
        {getStatusBadge(metric.status)}
      </div>
      {description && <p className="metric-description">{description}</p>}
      <div className="metric-rates">
        <div className="rate-row">
          <span className="rate-label">Expected:</span>
          <span className="rate-value">{metric.displayRate}</span>
          <span className="rate-percent">({formatPercent(metric.expectedRate)})</span>
        </div>
        <div className="rate-row">
          <span className="rate-label">Observed:</span>
          <span className="rate-value">{metric.observed.toLocaleString()}</span>
          <span className="rate-percent">({formatPercent(metric.observedRate)})</span>
        </div>
      </div>
      <div className="metric-bar-container">
        <div
          className="metric-bar-expected"
          style={{ left: `${metric.expectedRate * 100}%` }}
          title={`Expected: ${formatPercent(metric.expectedRate)}`}
        />
        <div
          className="metric-bar-ci"
          style={{
            left: `${metric.confidenceInterval.low * 100}%`,
            width: `${(metric.confidenceInterval.high - metric.confidenceInterval.low) * 100}%`
          }}
          title={`95% CI: ${formatPercent(metric.confidenceInterval.low)} - ${formatPercent(metric.confidenceInterval.high)}`}
        />
        <div
          className="metric-bar-observed"
          style={{ width: `${Math.min(metric.observedRate * 100, 100)}%` }}
        />
      </div>
      <div className="metric-footer">
        <span className="sample-size">Sample: {metric.sampleSize.toLocaleString()}</span>
        {metric.status !== 'insufficient_data' && (
          <span className="z-score" title="Z-score: statistical distance from expected">
            z = {metric.zScore.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  )

  return (
    <div className="quality-page">
      <header className="quality-header">
        <button className="back-button" onClick={() => router.push('/')}>
          ← Back
        </button>
        <div className="header-content">
          <h1>Pack Quality Dashboard</h1>
          <p className="subtitle">Building trust through transparency</p>
        </div>
      </header>

      <div className="set-selector">
        {SET_CODES.map(code => {
          const setInfo = availableSets.find(s => s.setCode === code)
          return (
            <button
              key={code}
              className={`set-button ${selectedSet === code ? 'active' : ''}`}
              onClick={() => setSelectedSet(code)}
            >
              {code}
              {setInfo && <span className="pack-count">{setInfo.packCount.toLocaleString()}</span>}
            </button>
          )
        })}
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading pack quality data...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>{error}</p>
        </div>
      )}

      {data && !loading && (
        <div className="quality-content">
          {/* Overview Section */}
          <section className="overview-section">
            <div className="overview-cards">
              <div className="overview-card">
                <div className="overview-value">{data.sampleSize.totalPacks.toLocaleString()}</div>
                <div className="overview-label">Packs Generated</div>
              </div>
              <div className="overview-card health-card" style={{ borderColor: getHealthColor(data.overallHealth.status) }}>
                <div className="overview-value" style={{ color: getHealthColor(data.overallHealth.status) }}>
                  {data.overallHealth.score}%
                </div>
                <div className="overview-label">Quality Score</div>
                <div className="health-status">{data.overallHealth.status.replace('_', ' ')}</div>
              </div>
              <div className="overview-card">
                <div className="overview-value">
                  {data.overallHealth.metricsWithinExpected}/{data.overallHealth.totalMetrics}
                </div>
                <div className="overview-label">Metrics Within Expected</div>
              </div>
              <div className="overview-card">
                <div className="overview-value">
                  {data.structuralMetrics.filter(m => m.status === 'pass').length}/{data.structuralMetrics.length}
                </div>
                <div className="overview-label">Structural Checks Pass</div>
              </div>
            </div>
          </section>

          {/* Structural Metrics */}
          <section className="metrics-section">
            <h2>Pack Structure Validation</h2>
            <p className="section-description">
              Every pack must have exactly 16 cards with the correct composition.
              These metrics verify structural integrity.
            </p>
            <div className="structural-grid">
              {data.structuralMetrics.map(metric => (
                <div className="structural-card" key={metric.metric}>
                  <div className="structural-header">
                    <span className="structural-name">{metric.metric}</span>
                    {getStructuralBadge(metric.status)}
                  </div>
                  <div className="structural-stats">
                    <span className="pass-count">{metric.passed.toLocaleString()} passed</span>
                    {metric.failed > 0 && (
                      <span className="fail-count">{metric.failed.toLocaleString()} failed</span>
                    )}
                  </div>
                  {metric.status !== 'warning' && (
                    <div className="structural-bar">
                      <div
                        className="structural-bar-fill"
                        style={{
                          width: `${metric.rate * 100}%`,
                          backgroundColor: metric.rate === 1 ? '#27AE60' : '#E74C3C'
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Rarity Distribution */}
          <section className="metrics-section">
            <h2>Rarity Distribution</h2>
            <p className="section-description">
              Comparing observed drop rates against expected probabilities based on
              community box break analysis and official announcements.
            </p>
            <div className="metrics-grid">
              {renderMetricCard(
                'Legendary in Rare Slot',
                data.rarityMetrics.legendaryRate,
                'How often the rare/legendary slot contains a Legendary card'
              )}
              {Object.entries(data.rarityMetrics.foilRarityDistribution).map(([rarity, metric]) =>
                renderMetricCard(
                  `Foil Slot: ${rarity}`,
                  metric,
                  `Percentage of foils that are ${rarity} rarity`
                )
              )}
            </div>

            {/* Chi-squared test result */}
            <div className="chi-squared-card">
              <div className="chi-squared-header">
                <h4>Foil Distribution Goodness-of-Fit Test</h4>
                {getStatusBadge(data.rarityMetrics.foilDistributionTest.status)}
              </div>
              <p className="chi-squared-interpretation">
                {data.rarityMetrics.foilDistributionTest.interpretation}
              </p>
              <div className="chi-squared-stats">
                <span>χ² = {data.rarityMetrics.foilDistributionTest.chiSquared}</span>
                <span>df = {data.rarityMetrics.foilDistributionTest.degreesOfFreedom}</span>
                <span>p = {data.rarityMetrics.foilDistributionTest.pValue}</span>
              </div>
            </div>
          </section>

          {/* Treatment Rates */}
          <section className="metrics-section">
            <h2>Treatment Upgrade Rates</h2>
            <p className="section-description">
              Cards can be upgraded to special treatments like Hyperspace borders,
              foil finishes, or ultra-rare Showcase variants.
            </p>
            <div className="metrics-grid">
              {renderMetricCard(
                'Hyperspace Leader',
                data.treatmentMetrics.hyperspaceLeader,
                'Leaders upgraded to Hyperspace border'
              )}
              {renderMetricCard(
                'Hyperspace Base',
                data.treatmentMetrics.hyperspaceBase,
                'Bases upgraded to Hyperspace border'
              )}
              {renderMetricCard(
                'Hyperspace Common',
                data.treatmentMetrics.hyperspaceCommon,
                'Common slots upgraded to Hyperspace'
              )}
              {renderMetricCard(
                'Hyperfoil',
                data.treatmentMetrics.hyperfoil,
                'Foil cards upgraded to Hyperspace Foil'
              )}
              {renderMetricCard(
                'Showcase Leader',
                data.treatmentMetrics.showcaseLeader,
                'Ultra-rare Showcase treatment leaders'
              )}
            </div>
          </section>

          {/* Methodology */}
          <section className="methodology-section">
            <h2>How We Measure Quality</h2>
            <div className="methodology-content">
              <div className="methodology-item">
                <h4>Pack Structure</h4>
                <p>{data.reference.packStructure}</p>
              </div>
              <div className="methodology-item">
                <h4>Data Source</h4>
                <p>{data.reference.dataSource}</p>
              </div>
              <div className="methodology-item">
                <h4>Statistical Validation</h4>
                <p>
                  We use Z-scores to measure how close observed rates are to expected rates.
                  A Z-score between -1.96 and 1.96 means the result is within the 95% confidence interval
                  (statistically expected). Values outside this range may indicate variance worth investigating.
                </p>
              </div>
              <div className="methodology-item">
                <h4>Belt Collation System</h4>
                <p>
                  Our pack generation uses a "belt" system that mirrors physical print sheet collation.
                  This ensures proper aspect diversity, duplicate prevention, and realistic card distribution
                  across packs.
                </p>
              </div>
            </div>
          </section>

          <footer className="quality-footer">
            <p>Data generated: {new Date(data.generatedAt).toLocaleString()}</p>
            <p>
              <a href="/api/public/pack-quality?setCode={selectedSet}" target="_blank" rel="noopener noreferrer">
                View raw API data →
              </a>
            </p>
          </footer>
        </div>
      )}
    </div>
  )
}
