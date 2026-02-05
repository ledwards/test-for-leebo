// @ts-nocheck
/**
 * Pack Quality Service
 *
 * Calculates and aggregates pack quality metrics for the public dashboard.
 * Demonstrates that our generated packs match real-world collation rules.
 */

import { queryRow, queryRows } from '@/lib/db'
import {
  SETS_1_3_CONSTANTS,
  SETS_4_6_CONSTANTS,
  SET_7_PLUS_CONSTANTS,
  type PackConstants,
} from '@/src/utils/packConstants'

// === Types ===

export interface MetricResult {
  observed: number
  expected: number
  observedRate: number
  expectedRate: number
  zScore: number
  status: 'expected' | 'slight_variance' | 'outlier' | 'insufficient_data'
  sampleSize: number
  confidenceInterval: { low: number; high: number }
  displayRate: string // Human-readable like "1 in 6"
}

export interface StructuralMetric {
  metric: string
  passed: number
  failed: number
  rate: number
  status: 'pass' | 'fail' | 'warning'
}

export interface ChiSquaredResult {
  chiSquared: number
  degreesOfFreedom: number
  pValue: number
  status: 'expected' | 'slight_variance' | 'outlier' | 'insufficient_data'
  interpretation: string
}

export interface PackQualityData {
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
    score: number // 0-100
    status: 'excellent' | 'good' | 'acceptable' | 'needs_attention'
    metricsWithinExpected: number
    totalMetrics: number
  }

  structuralMetrics: StructuralMetric[]

  rarityMetrics: {
    legendaryRate: MetricResult
    foilRarityDistribution: {
      Common: MetricResult
      Uncommon: MetricResult
      Rare: MetricResult
      Legendary: MetricResult
    }
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

// === Helper Functions ===

function getSetNumber(setCode: string): number {
  const setMap: Record<string, number> = {
    SOR: 1, SHD: 2, TWI: 3,
    JTL: 4, LOF: 5, SEC: 6,
    LAW: 7,
  }
  return setMap[setCode] || 4
}

function getPackConstants(setCode: string): PackConstants {
  const setNumber = getSetNumber(setCode)
  if (setNumber <= 3) return SETS_1_3_CONSTANTS
  if (setNumber <= 6) return SETS_4_6_CONSTANTS
  return SET_7_PLUS_CONSTANTS
}

function getSetName(setCode: string): string {
  const names: Record<string, string> = {
    SOR: 'Spark of Rebellion',
    SHD: 'Shadows of the Galaxy',
    TWI: 'Twilight of the Republic',
    JTL: 'Jump to Lightspeed',
    LOF: 'Legacy of the Force',
    SEC: 'Secrets of the Crucible',
    LAW: 'Law of the Wasteland',
  }
  return names[setCode] || setCode
}

/**
 * Calculate Z-score for a proportion
 */
function calculateZScore(observed: number, expected: number, n: number, p: number): number {
  if (n === 0 || p === 0 || p === 1) return 0
  const standardError = Math.sqrt(n * p * (1 - p))
  if (standardError === 0) return 0
  return (observed - expected) / standardError
}

/**
 * Calculate Wilson score confidence interval for a proportion
 */
function calculateConfidenceInterval(
  successes: number,
  total: number,
  confidence: number = 0.95
): { low: number; high: number } {
  if (total === 0) return { low: 0, high: 0 }

  // Z-score for confidence level (1.96 for 95%)
  const z = confidence === 0.95 ? 1.96 : confidence === 0.99 ? 2.576 : 1.96
  const p = successes / total
  const n = total

  // Wilson score interval
  const denominator = 1 + (z * z) / n
  const center = (p + (z * z) / (2 * n)) / denominator
  const margin = (z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) / denominator

  return {
    low: Math.max(0, center - margin),
    high: Math.min(1, center + margin),
  }
}

/**
 * Categorize statistical significance
 */
function categorizeStatus(
  zScore: number,
  sampleSize: number,
  minSampleSize: number = 50
): MetricResult['status'] {
  if (sampleSize < minSampleSize) return 'insufficient_data'
  const absZ = Math.abs(zScore)
  if (absZ < 1.5) return 'expected'
  if (absZ < 2.0) return 'slight_variance'
  return 'outlier'
}

/**
 * Format rate as human-readable string
 */
function formatDisplayRate(rate: number): string {
  if (rate === 0) return '0%'
  if (rate >= 1) return '100%'

  // For rates like 0.166... show as "1 in 6"
  const inverse = 1 / rate
  if (inverse >= 2 && inverse <= 1000) {
    const rounded = Math.round(inverse)
    // Check if it's close to a nice fraction
    if (Math.abs(inverse - rounded) < 0.1) {
      return `1 in ${rounded}`
    }
  }

  // Otherwise show as percentage
  if (rate >= 0.01) {
    return `${(rate * 100).toFixed(1)}%`
  }
  return `${(rate * 100).toFixed(2)}%`
}

/**
 * Calculate chi-squared statistic for goodness-of-fit test
 * Compares observed distribution against expected distribution
 */
function calculateChiSquared(
  observed: Record<string, number>,
  expected: Record<string, number>
): ChiSquaredResult {
  const categories = Object.keys(expected).filter(k => expected[k] > 0)
  const totalObserved = Object.values(observed).reduce((a, b) => a + b, 0)
  const totalExpected = Object.values(expected).reduce((a, b) => a + b, 0)

  if (totalObserved < 50) {
    return {
      chiSquared: 0,
      degreesOfFreedom: categories.length - 1,
      pValue: 1,
      status: 'insufficient_data',
      interpretation: 'Need at least 50 samples for chi-squared test',
    }
  }

  // Scale expected to match total observed
  const scaledExpected: Record<string, number> = {}
  categories.forEach(cat => {
    scaledExpected[cat] = (expected[cat] / totalExpected) * totalObserved
  })

  // Calculate chi-squared statistic
  let chiSquared = 0
  categories.forEach(cat => {
    const o = observed[cat] || 0
    const e = scaledExpected[cat]
    if (e > 0) {
      chiSquared += Math.pow(o - e, 2) / e
    }
  })

  const df = categories.length - 1

  // Approximate p-value using chi-squared CDF
  // Using Wilson-Hilferty approximation for chi-squared CDF
  const pValue = approximateChiSquaredPValue(chiSquared, df)

  // Categorize result
  let status: ChiSquaredResult['status']
  let interpretation: string

  if (pValue >= 0.05) {
    status = 'expected'
    interpretation = 'Distribution matches expected (p >= 0.05)'
  } else if (pValue >= 0.01) {
    status = 'slight_variance'
    interpretation = 'Minor deviation from expected (0.01 <= p < 0.05)'
  } else {
    status = 'outlier'
    interpretation = 'Significant deviation from expected (p < 0.01)'
  }

  return {
    chiSquared: Math.round(chiSquared * 100) / 100,
    degreesOfFreedom: df,
    pValue: Math.round(pValue * 1000) / 1000,
    status,
    interpretation,
  }
}

/**
 * Approximate chi-squared p-value using Wilson-Hilferty transformation
 */
function approximateChiSquaredPValue(chiSquared: number, df: number): number {
  if (df <= 0 || chiSquared < 0) return 1

  // Wilson-Hilferty approximation
  const h = 2 / (9 * df)
  const z = Math.pow(chiSquared / df, 1/3) - (1 - h)
  const z_normalized = z / Math.sqrt(h)

  // Standard normal CDF approximation (Abramowitz and Stegun)
  const t = 1 / (1 + 0.2316419 * Math.abs(z_normalized))
  const d = 0.3989423 * Math.exp(-z_normalized * z_normalized / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))

  // Return 1 - CDF (upper tail probability)
  return z_normalized > 0 ? p : 1 - p
}

/**
 * Build a metric result
 */
function buildMetricResult(
  observed: number,
  sampleSize: number,
  expectedRate: number,
  minSampleForSignificance: number = 50
): MetricResult {
  const expected = sampleSize * expectedRate
  const observedRate = sampleSize > 0 ? observed / sampleSize : 0
  const zScore = calculateZScore(observed, expected, sampleSize, expectedRate)
  const status = categorizeStatus(zScore, sampleSize, minSampleForSignificance)
  const ci = calculateConfidenceInterval(observed, sampleSize)

  return {
    observed,
    expected: Math.round(expected * 10) / 10,
    observedRate: Math.round(observedRate * 10000) / 10000,
    expectedRate,
    zScore: Math.round(zScore * 100) / 100,
    status,
    sampleSize,
    confidenceInterval: {
      low: Math.round(ci.low * 10000) / 10000,
      high: Math.round(ci.high * 10000) / 10000,
    },
    displayRate: formatDisplayRate(expectedRate),
  }
}

// === Main Service Function ===

export async function getPackQualityData(setCode: string): Promise<PackQualityData> {
  const constants = getPackConstants(setCode)
  const setNumber = getSetNumber(setCode)

  // Get basic counts
  const countStats = await queryRow(
    `SELECT
      COUNT(*) as total_cards,
      COUNT(DISTINCT (source_id, COALESCE(pack_index, -1))) as estimated_packs,
      COUNT(*) FILTER (WHERE pack_index IS NOT NULL) as tracked_cards,
      MIN(generated_at) as first_generated,
      MAX(generated_at) as last_generated
     FROM card_generations
     WHERE set_code = $1`,
    [setCode]
  )

  const totalCards = parseInt(countStats?.total_cards || 0)
  const estimatedPacks = Math.floor(totalCards / 16) // 16 cards per pack
  const trackedCards = parseInt(countStats?.tracked_cards || 0)
  const packsWithTracking = Math.floor(trackedCards / 16)

  // === STRUCTURAL METRICS ===
  const structuralMetrics: StructuralMetric[] = []

  // 1. Pack size compliance (should be 16 cards per pack)
  // We check packs with pack_index tracking
  const packSizeStats = await queryRows(
    `SELECT
      source_id,
      pack_index,
      COUNT(*) as card_count
     FROM card_generations
     WHERE set_code = $1 AND pack_index IS NOT NULL
     GROUP BY source_id, pack_index`,
    [setCode]
  )

  const correctSizePacks = packSizeStats.filter(p => parseInt(p.card_count) === 16).length
  const totalTrackedPacks = packSizeStats.length

  structuralMetrics.push({
    metric: 'Pack Size (16 cards)',
    passed: correctSizePacks,
    failed: totalTrackedPacks - correctSizePacks,
    rate: totalTrackedPacks > 0 ? correctSizePacks / totalTrackedPacks : 1,
    status: totalTrackedPacks === 0 ? 'warning' :
            correctSizePacks === totalTrackedPacks ? 'pass' : 'fail',
  })

  // 2. No same-treatment duplicates within a pack
  const dupStats = await queryRow(
    `SELECT COUNT(DISTINCT (source_id, pack_index)) as packs_with_dupes
     FROM (
       SELECT source_id, pack_index
       FROM card_generations
       WHERE set_code = $1 AND pack_index IS NOT NULL
       GROUP BY source_id, pack_index, card_name, treatment
       HAVING COUNT(*) > 1
     ) dupes`,
    [setCode]
  )
  const packsWithDupes = parseInt(dupStats?.packs_with_dupes || 0)

  structuralMetrics.push({
    metric: 'No Same-Treatment Duplicates',
    passed: totalTrackedPacks - packsWithDupes,
    failed: packsWithDupes,
    rate: totalTrackedPacks > 0 ? (totalTrackedPacks - packsWithDupes) / totalTrackedPacks : 1,
    status: packsWithDupes === 0 ? 'pass' : 'fail',
  })

  // 3. Leader count per pack (should be 1)
  const leaderStats = await queryRows(
    `SELECT
      source_id,
      pack_index,
      COUNT(*) FILTER (WHERE slot_type = 'leader') as leader_count
     FROM card_generations
     WHERE set_code = $1 AND pack_index IS NOT NULL
     GROUP BY source_id, pack_index`,
    [setCode]
  )
  const correctLeaderPacks = leaderStats.filter(p => parseInt(p.leader_count) === 1).length

  structuralMetrics.push({
    metric: 'One Leader Per Pack',
    passed: correctLeaderPacks,
    failed: leaderStats.length - correctLeaderPacks,
    rate: leaderStats.length > 0 ? correctLeaderPacks / leaderStats.length : 1,
    status: leaderStats.length === 0 ? 'warning' :
            correctLeaderPacks === leaderStats.length ? 'pass' : 'fail',
  })

  // 4. Base count per pack (should be 1)
  const baseStats = await queryRows(
    `SELECT
      source_id,
      pack_index,
      COUNT(*) FILTER (WHERE slot_type = 'base') as base_count
     FROM card_generations
     WHERE set_code = $1 AND pack_index IS NOT NULL
     GROUP BY source_id, pack_index`,
    [setCode]
  )
  const correctBasePacks = baseStats.filter(p => parseInt(p.base_count) === 1).length

  structuralMetrics.push({
    metric: 'One Base Per Pack',
    passed: correctBasePacks,
    failed: baseStats.length - correctBasePacks,
    rate: baseStats.length > 0 ? correctBasePacks / baseStats.length : 1,
    status: baseStats.length === 0 ? 'warning' :
            correctBasePacks === baseStats.length ? 'pass' : 'fail',
  })

  // === RARITY METRICS ===

  // Legendary rate in rare/legendary slot
  const rareLegendaryStats = await queryRow(
    `SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE rarity = 'Legendary') as legendary_count
     FROM card_generations
     WHERE set_code = $1 AND slot_type = 'rare_legendary'`,
    [setCode]
  )

  const rlTotal = parseInt(rareLegendaryStats?.total || 0)
  const legendaryCount = parseInt(rareLegendaryStats?.legendary_count || 0)
  const expectedLegendaryRate = 1 / (constants.rareSlotLegendaryRatio + 1)

  const legendaryMetric = buildMetricResult(legendaryCount, rlTotal, expectedLegendaryRate, 100)

  // Foil slot rarity distribution
  const foilStats = await queryRows(
    `SELECT rarity, COUNT(*) as count
     FROM card_generations
     WHERE set_code = $1 AND slot_type = 'foil'
     GROUP BY rarity`,
    [setCode]
  )

  const foilTotal = foilStats.reduce((sum, r) => sum + parseInt(r.count), 0)
  const foilByRarity: Record<string, number> = {}
  foilStats.forEach(r => { foilByRarity[r.rarity] = parseInt(r.count) })

  const foilWeights = constants.foilSlotWeights || {
    Common: 70, Uncommon: 20, Rare: 8, Legendary: 2, Special: 0
  }
  const totalWeight = Object.values(foilWeights).reduce((a, b) => a + b, 0)

  const foilRarityMetrics = {
    Common: buildMetricResult(
      foilByRarity.Common || 0,
      foilTotal,
      foilWeights.Common / totalWeight,
      50
    ),
    Uncommon: buildMetricResult(
      foilByRarity.Uncommon || 0,
      foilTotal,
      foilWeights.Uncommon / totalWeight,
      50
    ),
    Rare: buildMetricResult(
      foilByRarity.Rare || 0,
      foilTotal,
      foilWeights.Rare / totalWeight,
      50
    ),
    Legendary: buildMetricResult(
      foilByRarity.Legendary || 0,
      foilTotal,
      foilWeights.Legendary / totalWeight,
      50
    ),
  }

  // Chi-squared test for foil rarity distribution
  const foilDistributionTest = calculateChiSquared(
    foilByRarity,
    { Common: foilWeights.Common, Uncommon: foilWeights.Uncommon, Rare: foilWeights.Rare, Legendary: foilWeights.Legendary }
  )

  // === TREATMENT METRICS ===

  // Hyperspace leader rate
  const leaderTreatmentStats = await queryRow(
    `SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE treatment = 'hyperspace') as hyperspace_count
     FROM card_generations
     WHERE set_code = $1 AND slot_type = 'leader'`,
    [setCode]
  )

  const leaderTotal = parseInt(leaderTreatmentStats?.total || 0)
  const hsLeaderCount = parseInt(leaderTreatmentStats?.hyperspace_count || 0)
  const hyperspaceLeaderMetric = buildMetricResult(
    hsLeaderCount,
    leaderTotal,
    constants.leaderHyperspaceRate,
    50
  )

  // Hyperspace base rate
  const baseTreatmentStats = await queryRow(
    `SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE treatment = 'hyperspace') as hyperspace_count
     FROM card_generations
     WHERE set_code = $1 AND slot_type = 'base'`,
    [setCode]
  )

  const baseTotal = parseInt(baseTreatmentStats?.total || 0)
  const hsBaseCount = parseInt(baseTreatmentStats?.hyperspace_count || 0)
  const hyperspaceBaseMetric = buildMetricResult(
    hsBaseCount,
    baseTotal,
    constants.baseHyperspaceRate,
    50
  )

  // Hyperspace common rate
  const commonTreatmentStats = await queryRow(
    `SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE treatment = 'hyperspace') as hyperspace_count
     FROM card_generations
     WHERE set_code = $1 AND slot_type = 'common'`,
    [setCode]
  )

  const commonTotal = parseInt(commonTreatmentStats?.total || 0)
  const hsCommonCount = parseInt(commonTreatmentStats?.hyperspace_count || 0)
  // Common HS rate is per-pack, not per-card. Adjust for 9 commons per pack.
  const expectedHsCommonsPerPack = constants.commonHyperspaceRate
  const hsCommonMetric = buildMetricResult(
    hsCommonCount,
    commonTotal,
    expectedHsCommonsPerPack / 9, // Rate per card slot
    100
  )

  // Hyperfoil rate
  const foilTreatmentStats = await queryRow(
    `SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE treatment = 'hyperspace_foil') as hyperfoil_count
     FROM card_generations
     WHERE set_code = $1 AND slot_type = 'foil'`,
    [setCode]
  )

  const foilTreatmentTotal = parseInt(foilTreatmentStats?.total || 0)
  const hyperfoilCount = parseInt(foilTreatmentStats?.hyperfoil_count || 0)
  const hyperfoilMetric = buildMetricResult(
    hyperfoilCount,
    foilTreatmentTotal,
    constants.hyperfoilRate,
    200 // Need more samples for rare events
  )

  // Showcase leader rate
  const showcaseStats = await queryRow(
    `SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE treatment = 'showcase') as showcase_count
     FROM card_generations
     WHERE set_code = $1 AND slot_type = 'leader'`,
    [setCode]
  )

  const showcaseTotal = parseInt(showcaseStats?.total || 0)
  const showcaseCount = parseInt(showcaseStats?.showcase_count || 0)
  const showcaseMetric = buildMetricResult(
    showcaseCount,
    showcaseTotal,
    constants.showcaseLeaderRate,
    500 // Very rare, need lots of samples
  )

  // === OVERALL HEALTH ===

  // Count metrics that are "expected" or "slight_variance"
  const allMetrics = [
    legendaryMetric,
    foilRarityMetrics.Common,
    foilRarityMetrics.Uncommon,
    foilRarityMetrics.Rare,
    foilRarityMetrics.Legendary,
    hyperspaceLeaderMetric,
    hyperspaceBaseMetric,
    hsCommonMetric,
    hyperfoilMetric,
    showcaseMetric,
  ]

  const metricsWithinExpected = allMetrics.filter(
    m => m.status === 'expected' || m.status === 'slight_variance' || m.status === 'insufficient_data'
  ).length

  const structuralPassing = structuralMetrics.filter(m => m.status === 'pass').length
  const totalStructural = structuralMetrics.filter(m => m.status !== 'warning').length

  const healthScore = Math.round(
    ((metricsWithinExpected / allMetrics.length) * 0.6 +
     (totalStructural > 0 ? structuralPassing / totalStructural : 1) * 0.4) * 100
  )

  const healthStatus = healthScore >= 95 ? 'excellent' :
                       healthScore >= 85 ? 'good' :
                       healthScore >= 70 ? 'acceptable' : 'needs_attention'

  return {
    setCode,
    setName: getSetName(setCode),
    generatedAt: new Date().toISOString(),

    sampleSize: {
      totalPacks: estimatedPacks,
      totalCards,
      packsWithTracking,
      dateRange: countStats?.first_generated ? {
        start: countStats.first_generated,
        end: countStats.last_generated,
      } : null,
    },

    overallHealth: {
      score: healthScore,
      status: healthStatus,
      metricsWithinExpected,
      totalMetrics: allMetrics.length,
    },

    structuralMetrics,

    rarityMetrics: {
      legendaryRate: legendaryMetric,
      foilRarityDistribution: foilRarityMetrics,
      foilDistributionTest,
    },

    treatmentMetrics: {
      hyperspaceLeader: hyperspaceLeaderMetric,
      hyperspaceBase: hyperspaceBaseMetric,
      hyperspaceCommon: hsCommonMetric,
      hyperfoil: hyperfoilMetric,
      showcaseLeader: showcaseMetric,
    },

    reference: {
      packStructure: '16 cards: 1 Leader, 1 Base, 9 Commons, 3 Uncommons, 1 Rare/Legendary, 1 Foil',
      dataSource: 'Community box break analysis and FFG announcements',
    },
  }
}

/**
 * Get available sets with data
 */
export async function getAvailableSets(): Promise<{ setCode: string; setName: string; packCount: number }[]> {
  const results = await queryRows(
    `SELECT set_code, COUNT(*) / 16 as pack_count
     FROM card_generations
     GROUP BY set_code
     ORDER BY set_code`
  )

  return results.map(r => ({
    setCode: r.set_code,
    setName: getSetName(r.set_code),
    packCount: parseInt(r.pack_count),
  }))
}
