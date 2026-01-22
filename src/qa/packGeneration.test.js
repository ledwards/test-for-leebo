/**
 * Pack Generation QA Tests
 *
 * Statistical analysis of pack generation to detect anomalies.
 * Generates a large sample of sealed pods and validates distribution.
 *
 * Run with: node src/qa/packGeneration.test.js
 */

import { generateBoosterPack, generateSealedPod, clearBeltCache } from '../utils/boosterPack.js'
import { initializeCardCache, getCachedCards } from '../utils/cardCache.js'

const POD_SAMPLE_SIZE = 100 // Number of sealed pods to generate for analysis
const PACKS_PER_POD = 6
const TOLERANCE = 0.15 // 15% tolerance for statistical tests

let passed = 0
let failed = 0
let warnings = 0

function test(name, fn) {
  try {
    fn()
    console.log(`\x1b[32m✅ ${name}\x1b[0m`)
    passed++
  } catch (e) {
    console.log(`\x1b[31m❌ ${name}\x1b[0m`)
    console.log(`\x1b[33m   ${e.message}\x1b[0m`)
    failed++
  }
}

function warn(name, message) {
  console.log(`\x1b[33m⚠️  ${name}\x1b[0m`)
  console.log(`\x1b[33m   ${message}\x1b[0m`)
  warnings++
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed')
}

function assertWithinTolerance(actual, expected, tolerance, message) {
  const diff = Math.abs(actual - expected)
  const maxDiff = expected * tolerance
  if (diff > maxDiff) {
    throw new Error(
      message || `Expected ${actual} to be within ${tolerance * 100}% of ${expected} (max diff: ${maxDiff.toFixed(2)}, actual diff: ${diff.toFixed(2)})`
    )
  }
}

/**
 * Group cards by their base treatment (variantType + foil status)
 * Cards with different treatments don't count as duplicates:
 * - Normal, Foil, Hyperspace, Hyperspace Foil, Showcase are all distinct
 * We only detect duplicates of the SAME treatment
 */
function getBaseTreatmentKey(card) {
  const variant = card.variantType || 'Normal'
  const foilSuffix = card.isFoil ? '-Foil' : ''
  return `${card.id}-${variant}${foilSuffix}`
}

/**
 * Count duplicates in a card list
 * Returns { duplicates: count of cards appearing 2+ times, triplicates: count appearing 3+ times }
 * Only counts duplicates of the same base treatment (e.g., two Normal variants)
 */
function countDuplicates(cards) {
  const cardCounts = new Map()

  cards.forEach(card => {
    const key = getBaseTreatmentKey(card)
    const count = cardCounts.get(key) || 0
    cardCounts.set(key, count + 1)
  })

  let duplicates = 0
  let triplicates = 0

  cardCounts.forEach(count => {
    if (count >= 2) duplicates++
    if (count >= 3) triplicates++
  })

  return { duplicates, triplicates }
}

/**
 * Calculate mean and standard deviation
 */
function calculateStats(values) {
  const n = values.length
  const mean = values.reduce((sum, val) => sum + val, 0) / n
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n
  const stdDev = Math.sqrt(variance)

  return { mean, stdDev, min: Math.min(...values), max: Math.max(...values) }
}

/**
 * Check if value is a statistical outlier (z-score method)
 */
function checkOutlier(value, mean, stdDev, threshold = 2) {
  if (stdDev === 0) return false // No variation, not an outlier
  const zScore = Math.abs((value - mean) / stdDev)
  return zScore > threshold
}

async function runQA() {
  console.log('\x1b[1m\x1b[36m📊 Pack Generation QA\x1b[0m')
  console.log('\x1b[36m============================\x1b[0m')
  console.log(`\x1b[36m📦 Pod sample size: ${POD_SAMPLE_SIZE} (${POD_SAMPLE_SIZE * PACKS_PER_POD} packs total)\x1b[0m`)
  console.log(`\x1b[36m📏 Tolerance: ${TOLERANCE * 100}%\x1b[0m`)
  console.log('')

  console.log('\x1b[36m🔄 Initializing card cache...\x1b[0m')
  await initializeCardCache()

  const sets = ['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC']

  for (const setCode of sets) {
    console.log('')
    console.log(`\x1b[1m\x1b[35m=== 🎴 ${setCode} ===\x1b[0m`)
    const cards = getCachedCards(setCode)

    if (cards.length === 0) {
      console.log(`\x1b[33m⚠️  Skipping ${setCode} - no card data\x1b[0m`)
      continue
    }

    // Generate sealed pods
    console.log(`\x1b[36m🎁 Generating ${POD_SAMPLE_SIZE} sealed pods (${POD_SAMPLE_SIZE * PACKS_PER_POD} packs)...\x1b[0m`)
    clearBeltCache()
    const pods = []
    for (let i = 0; i < POD_SAMPLE_SIZE; i++) {
      pods.push(generateSealedPod(cards, setCode, PACKS_PER_POD))
    }
    console.log('\x1b[32m✔️  Generation complete.\x1b[0m')
    console.log('')

    // ===== INDIVIDUAL PACK TESTS =====
    console.log('\x1b[36m📦 Testing Individual Packs...\x1b[0m')

    const allPacks = pods.flat()

    test(`${setCode}: all packs have 16 cards`, () => {
      allPacks.forEach((pack, i) => {
        assert(
          pack.cards.length === 16,
          `Pack ${i} has ${pack.cards.length} cards (expected 16)`
        )
      })
    })

    test(`${setCode}: all packs have exactly 1 leader`, () => {
      allPacks.forEach((pack, i) => {
        const leaders = pack.cards.filter(c => c.isLeader)
        assert(
          leaders.length === 1,
          `Pack ${i} has ${leaders.length} leaders (expected 1)`
        )
      })
    })

    test(`${setCode}: all packs have exactly 1 base`, () => {
      allPacks.forEach((pack, i) => {
        const bases = pack.cards.filter(c => c.isBase)
        assert(
          bases.length === 1,
          `Pack ${i} has ${bases.length} bases (expected 1)`
        )
      })
    })

    test(`${setCode}: all packs have exactly 1 foil`, () => {
      allPacks.forEach((pack, i) => {
        const foils = pack.cards.filter(c => c.isFoil)
        assert(
          foils.length === 1,
          `Pack ${i} has ${foils.length} foils (expected 1)`
        )
      })
    })

    // CRITICAL: No duplicates of same base treatment within a single pack
    test(`${setCode}: no duplicate base treatment cards within any pack`, () => {
      const packsWithDuplicates = []

      allPacks.forEach((pack, packIndex) => {
        const seen = new Map()
        const duplicates = []

        pack.cards.forEach(card => {
          const key = getBaseTreatmentKey(card)
          if (seen.has(key)) {
            const variant = card.variantType || 'Normal'
            duplicates.push({ id: card.id, name: card.name, variant })
          }
          seen.set(key, card)
        })

        if (duplicates.length > 0) {
          packsWithDuplicates.push({
            packIndex,
            duplicates
          })
        }
      })

      if (packsWithDuplicates.length > 0) {
        const examples = packsWithDuplicates.slice(0, 3).map(p => {
          const dupes = p.duplicates.map(d => `"${d.name}" [${d.variant}] (${d.id})`).join(', ')
          return `Pack ${p.packIndex}: ${dupes}`
        }).join('; ')
        const total = packsWithDuplicates.length
        const suffix = total > 3 ? ` (+${total - 3} more)` : ''
        throw new Error(
          `Found ${total} packs with duplicate base treatment cards${suffix}. Examples: ${examples}`
        )
      }
    })

    // Rarity distribution
    const rarityCount = { Common: 0, Uncommon: 0, Rare: 0, Legendary: 0, Special: 0 }
    allPacks.forEach(pack => {
      pack.cards.forEach(card => {
        if (!card.isLeader && !card.isBase && !card.isFoil) {
          rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1
        }
      })
    })

    test(`${setCode}: common distribution (expect ~9 per pack)`, () => {
      const avgCommons = rarityCount.Common / allPacks.length
      assertWithinTolerance(avgCommons, 9, TOLERANCE, `Average commons: ${avgCommons.toFixed(2)}`)
    })

    test(`${setCode}: uncommon distribution (expect ~3 per pack)`, () => {
      const avgUncommons = rarityCount.Uncommon / allPacks.length
      assertWithinTolerance(avgUncommons, 3, TOLERANCE, `Average uncommons: ${avgUncommons.toFixed(2)}`)
    })

    test(`${setCode}: rare/legendary distribution (expect ~1 per pack)`, () => {
      const avgRarePlus = (rarityCount.Rare + rarityCount.Legendary + rarityCount.Special) / allPacks.length
      assertWithinTolerance(avgRarePlus, 1, TOLERANCE, `Average rare+: ${avgRarePlus.toFixed(2)}`)
    })

    // ===== SEALED POD TESTS (Cross-Pack Duplicates) =====
    console.log('')
    console.log('\x1b[36m🎁 Testing Sealed Pods (Cross-Pack Duplicates)...\x1b[0m')

    // Collect duplicate statistics across all pods
    const podDuplicateCounts = []
    const podTriplicateCounts = []

    pods.forEach(pod => {
      const allCards = pod.flatMap(pack => pack.cards)
      const { duplicates, triplicates } = countDuplicates(allCards)
      podDuplicateCounts.push(duplicates)
      podTriplicateCounts.push(triplicates)
    })

    const dupStats = calculateStats(podDuplicateCounts)
    const tripStats = calculateStats(podTriplicateCounts)

    console.log(`\x1b[36m   Duplicates across pod: mean=${dupStats.mean.toFixed(1)}, σ=${dupStats.stdDev.toFixed(1)}, range=[${dupStats.min}-${dupStats.max}]\x1b[0m`)
    console.log(`\x1b[36m   Triplicates across pod: mean=${tripStats.mean.toFixed(1)}, σ=${tripStats.stdDev.toFixed(1)}, range=[${tripStats.min}-${tripStats.max}]\x1b[0m`)

    test(`${setCode}: duplicate distribution across pods is reasonable`, () => {
      // When mean is very low (< 0.5), skip statistical outlier check
      // because low-count discrete distributions don't follow normal distribution well
      if (dupStats.mean < 0.5) {
        // Just check that max duplicates is reasonable (< 5 per pod)
        const maxDuplicates = Math.max(...podDuplicateCounts)
        if (maxDuplicates >= 5) {
          throw new Error(`Found pod with ${maxDuplicates} duplicates (expected < 5 when duplicate rate is very low)`)
        }
        return
      }

      // Check for pods that are statistical outliers (>3σ)
      const outliers = []
      pods.forEach((pod, i) => {
        const dupCount = podDuplicateCounts[i]
        if (checkOutlier(dupCount, dupStats.mean, dupStats.stdDev, 3)) {
          outliers.push({ index: i, count: dupCount, zScore: Math.abs((dupCount - dupStats.mean) / dupStats.stdDev).toFixed(2) })
        }
      })

      if (outliers.length > 0) {
        const examples = outliers.slice(0, 3).map(o =>
          `Pod ${o.index}: ${o.count} duplicates (z=${o.zScore})`
        ).join(', ')
        throw new Error(
          `Found ${outliers.length} pods with extreme duplicate counts (>3σ). Examples: ${examples}`
        )
      }
    })

    test(`${setCode}: triplicate distribution across pods is reasonable`, () => {
      // When mean is very low (< 0.3), skip statistical outlier check
      // because low-count discrete distributions don't follow normal distribution well
      if (tripStats.mean < 0.3) {
        // Just check that max triplicates is reasonable (< 3 per pod)
        const maxTriplicates = Math.max(...podTriplicateCounts)
        if (maxTriplicates >= 3) {
          throw new Error(`Found pod with ${maxTriplicates} triplicates (expected < 3 when triplicate rate is very low)`)
        }
        return
      }

      // Check for pods that are statistical outliers (>3σ)
      const outliers = []
      pods.forEach((pod, i) => {
        const tripCount = podTriplicateCounts[i]
        if (checkOutlier(tripCount, tripStats.mean, tripStats.stdDev, 3)) {
          outliers.push({ index: i, count: tripCount, zScore: Math.abs((tripCount - tripStats.mean) / tripStats.stdDev).toFixed(2) })
        }
      })

      if (outliers.length > 0) {
        const examples = outliers.slice(0, 3).map(o =>
          `Pod ${o.index}: ${o.count} triplicates (z=${o.zScore})`
        ).join(', ')
        throw new Error(
          `Found ${outliers.length} pods with extreme triplicate counts (>3σ). Examples: ${examples}`
        )
      }
    })

    // Test: Number of 2σ outliers should match statistical expectations
    test(`${setCode}: number of 2σ outliers is statistically reasonable`, () => {
      // When mean is very low (< 0.5), skip this test
      // because low-count discrete distributions don't follow normal distribution well
      if (dupStats.mean < 0.5) {
        return
      }

      // Count pods outside 2σ (in either direction)
      const twoSigmaOutliers = pods.filter((pod, i) => {
        const dupCount = podDuplicateCounts[i]
        return checkOutlier(dupCount, dupStats.mean, dupStats.stdDev, 2)
      }).length

      // For normal distribution, expect ~5% outside 2σ
      const expectedOutliers = POD_SAMPLE_SIZE * 0.05
      const stdDevOutliers = Math.sqrt(POD_SAMPLE_SIZE * 0.05 * 0.95)

      // 95% confidence interval: expected ± 2 * stdDev
      const minExpected = Math.max(0, expectedOutliers - 2 * stdDevOutliers)
      const maxExpected = expectedOutliers + 2 * stdDevOutliers

      // Fail if outside 99% confidence interval (± 3 stdDev)
      const minFail = Math.max(0, expectedOutliers - 3 * stdDevOutliers)
      const maxFail = expectedOutliers + 3 * stdDevOutliers

      if (twoSigmaOutliers < minFail || twoSigmaOutliers > maxFail) {
        throw new Error(
          `Found ${twoSigmaOutliers} 2σ outliers, expected ${expectedOutliers.toFixed(1)} ± ${(3 * stdDevOutliers).toFixed(1)} (99% CI: [${minFail.toFixed(0)}, ${maxFail.toFixed(0)}])`
        )
      }

      // Warn if outside 95% confidence interval
      if (twoSigmaOutliers < minExpected || twoSigmaOutliers > maxExpected) {
        warn(
          `${setCode}: unusual number of 2σ outliers`,
          `Found ${twoSigmaOutliers}, expected ${expectedOutliers.toFixed(1)} ± ${(2 * stdDevOutliers).toFixed(1)} (95% CI: [${minExpected.toFixed(0)}, ${maxExpected.toFixed(0)}])`
        )
      }
    })

    // List 2σ outliers for reference (not a test failure)
    const dupWarningOutliers = []
    pods.forEach((pod, i) => {
      const dupCount = podDuplicateCounts[i]
      if (checkOutlier(dupCount, dupStats.mean, dupStats.stdDev, 2) && !checkOutlier(dupCount, dupStats.mean, dupStats.stdDev, 3)) {
        dupWarningOutliers.push({ index: i, count: dupCount })
      }
    })
    if (dupWarningOutliers.length > 0 && dupWarningOutliers.length <= 3) {
      console.log(`\x1b[36m   2σ outliers: ${dupWarningOutliers.map(o => `#${o.index}(${o.count})`).join(', ')}\x1b[0m`)
    } else if (dupWarningOutliers.length > 3) {
      console.log(`\x1b[36m   2σ outliers: ${dupWarningOutliers.length} pods (${dupWarningOutliers.slice(0, 3).map(o => `#${o.index}(${o.count})`).join(', ')}...)\x1b[0m`)
    }

    // Card variety tests
    test(`${setCode}: good card variety across all packs`, () => {
      const cardFrequency = new Map()
      allPacks.forEach(pack => {
        pack.cards.forEach(card => {
          const key = getBaseTreatmentKey(card)
          cardFrequency.set(key, (cardFrequency.get(key) || 0) + 1)
        })
      })

      const tooFrequent = []
      const threshold = allPacks.length * 0.5 // Appears in >50% of packs
      cardFrequency.forEach((count, key) => {
        if (count > threshold) {
          const card = allPacks.flatMap(p => p.cards).find(c => getBaseTreatmentKey(c) === key)
          const variant = card?.variantType || 'Normal'
          tooFrequent.push({ name: card?.name || 'unknown', variant, count, frequency: (count / allPacks.length).toFixed(2) })
        }
      })

      if (tooFrequent.length > 0) {
        const list = tooFrequent.slice(0, 3).map(c => `"${c.name}" [${c.variant}] (${(c.frequency * 100).toFixed(0)}%)`).join(', ')
        throw new Error(`${tooFrequent.length} cards appear too frequently: ${list}`)
      }
    })

    test(`${setCode}: leaders show good variety`, () => {
      const leaderFrequency = new Map()
      allPacks.forEach(pack => {
        const leader = pack.cards.find(c => c.isLeader)
        if (leader) {
          leaderFrequency.set(leader.id, (leaderFrequency.get(leader.id) || 0) + 1)
        }
      })

      const uniqueLeaders = leaderFrequency.size
      const minExpected = Math.min(10, Math.floor(allPacks.length / 30)) // At least 1 unique per 30 packs, min 10
      assert(
        uniqueLeaders >= minExpected,
        `Only ${uniqueLeaders} unique leaders in ${allPacks.length} packs (expected at least ${minExpected})`
      )
    })
  }

  console.log('')
  console.log('\x1b[36m============================\x1b[0m')
  console.log(`\x1b[32m✅ Tests passed: ${passed}\x1b[0m`)
  if (failed > 0) {
    console.log(`\x1b[31m❌ Tests failed: ${failed}\x1b[0m`)
  } else {
    console.log(`\x1b[90m   Tests failed: ${failed}\x1b[0m`)
  }
  if (warnings > 0) {
    console.log(`\x1b[33m⚠️  Warnings: ${warnings}\x1b[0m`)
  } else {
    console.log(`\x1b[90m   Warnings: ${warnings}\x1b[0m`)
  }
  console.log('')

  if (failed > 0) {
    console.log('\x1b[31m\x1b[1m💥 QA FAILED - Issues detected in pack generation\x1b[0m')
    process.exit(1)
  } else if (warnings > 0) {
    console.log('\x1b[33m\x1b[1m⚠️  QA PASSED with warnings - Review recommended\x1b[0m')
  } else {
    console.log('\x1b[32m\x1b[1m🎉 QA PASSED - Pack generation looks good!\x1b[0m')
  }
}

runQA().catch(err => {
  console.error('QA runner failed:', err)
  process.exit(1)
})
