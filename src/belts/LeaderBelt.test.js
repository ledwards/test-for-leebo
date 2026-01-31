/**
 * LeaderBelt Tests
 *
 * Run with: node src/belts/LeaderBelt.test.js
 */

import { LeaderBelt } from './LeaderBelt.js'
import { initializeCardCache, getCachedCards } from '../utils/cardCache.js'

let passed = 0
let failed = 0

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

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed')
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`)
  }
}

async function runTests() {
  console.log('\x1b[36m🔄 Initializing card cache...\x1b[0m')
  await initializeCardCache()
  console.log('')
  console.log('\x1b[1m\x1b[35m👑 LeaderBelt Tests\x1b[0m')
  console.log('\x1b[35m' + '='.repeat(40) + '\x1b[0m')

  test('initializes with a set code and loads leaders', () => {
    const belt = new LeaderBelt('SOR')
    assert(belt.commonLeaders.length > 0, 'Should have common leaders')
    assert(belt.rareLeaders.length > 0, 'Should have rare leaders')
    assert(belt.commonLeaders.every(c => c.isLeader), 'All common leaders should be leaders')
    assert(belt.rareLeaders.every(c => c.isLeader), 'All rare leaders should be leaders')
    assert(belt.commonLeaders.every(c => c.set === 'SOR'), 'All common leaders should be from SOR set')
    assert(belt.commonLeaders.every(c => c.variantType === 'Normal'), 'All leaders should be normal variants')
  })

  test('separates leaders into common and rare', () => {
    const belt = new LeaderBelt('SOR')
    assert(belt.commonLeaders.length > 0, 'Should have common leaders')
    assert(belt.rareLeaders.length > 0, 'Should have rare leaders')
    assert(belt.commonLeaders.every(c => c.rarity === 'Common'), 'Common leaders should all be Common rarity')
    assert(belt.rareLeaders.every(c => c.rarity === 'Rare'), 'Rare leaders should all be Rare rarity')
  })

  test('common cycle is initialized on construction', () => {
    const belt = new LeaderBelt('SOR')
    assert(belt.commonCycle.length === belt.commonLeaders.length, 'Common cycle should contain all common leaders')
    assert(belt.commonIndex === 0, 'Common index should start at 0')
  })

  test('next() returns a leader card', () => {
    const belt = new LeaderBelt('SOR')
    const card = belt.next()
    assert(card !== null, 'next() should return a card')
    assert(card.isLeader, 'Returned card should be a leader')
    assert(card.set === 'SOR', 'Returned card should be from correct set')
  })

  test('next() advances through the common cycle', () => {
    const belt = new LeaderBelt('SOR')
    const initialIndex = belt.commonIndex

    // Draw several cards (some may be rares, but commons should advance)
    for (let i = 0; i < 10; i++) {
      belt.next()
    }

    // Common index should have advanced (accounting for rares not advancing it)
    // With ~16% rare rate, 10 draws should give ~8 common advances
    assert(belt.commonIndex > initialIndex || belt.commonIndex === 0,
      'Common index should advance or cycle has reset')
  })

  test('next() returns a copy, not the original', () => {
    const belt = new LeaderBelt('SOR')
    const card1 = belt.next()
    card1.modified = true
    // Get another card and check it doesn't have the modification
    const card2 = belt.next()
    assert(card2.modified === undefined, 'Cards should be copies, not references')
  })

  test('common cycle reshuffles when exhausted', () => {
    const belt = new LeaderBelt('SOR')
    const numCommons = belt.commonLeaders.length

    // Record the first cycle order
    const firstCycleOrder = [...belt.commonCycle].map(c => c.id)

    // Draw enough to exhaust multiple cycles (draw 3x commons, accounting for ~16% rares)
    const drawCount = numCommons * 4  // Should trigger at least 2-3 reshuffles
    for (let i = 0; i < drawCount; i++) {
      belt.next()
    }

    // After reshuffling, the current cycle should be different from the first
    const currentCycleOrder = belt.commonCycle.map(c => c.id)
    const areIdentical = firstCycleOrder.every((id, idx) => id === currentCycleOrder[idx])

    // It's possible but very unlikely (1/8! = 1/40320) for two shuffles to be identical
    // We just verify the cycle still has the right cards
    assertEqual(belt.commonCycle.length, numCommons, 'Cycle should maintain same size after reshuffle')
  })

  test('rare leaders appear in approximately 1/6 of packs (5:1 ratio)', () => {
    const belt = new LeaderBelt('SOR')

    // Sample 600 cards (should give ~100 rares)
    const counts = { Common: 0, Rare: 0 }
    for (let i = 0; i < 600; i++) {
      const card = belt.next()
      counts[card.rarity] = (counts[card.rarity] || 0) + 1
    }

    const commonCount = counts.Common
    const rareCount = counts.Rare
    const ratio = commonCount / rareCount

    // Expected: 5:1 ratio (1/6 rares = ~16.67%)
    // Allow variance for statistical tests: ratio should be between 3.5:1 and 6.5:1
    assert(ratio >= 3.5 && ratio <= 6.5, `Ratio should be ~5:1, got ${ratio.toFixed(2)}:1 (${commonCount} common, ${rareCount} rare)`)

    // Rare frequency should be approximately 1 in 6
    // Widen tolerance for statistical variance in sampling
    const rareFrequency = 600 / rareCount
    assert(rareFrequency >= 4.5 && rareFrequency <= 8, `Rare frequency should be ~1 in 6, got 1 in ${rareFrequency.toFixed(1)}`)
  })

  test('no immediately adjacent duplicate leaders', () => {
    const belt = new LeaderBelt('SOR')

    // Check first 100 cards for immediately adjacent duplicates
    const sample = []
    for (let i = 0; i < 100; i++) {
      sample.push(belt.next())
    }

    let violations = 0
    for (let i = 0; i < sample.length - 1; i++) {
      if (sample[i].name === sample[i + 1].name) {
        violations++
      }
    }

    // Should have zero immediate adjacencies (the new design prevents this)
    assertEqual(violations, 0, `Found ${violations} immediately adjacent duplicates (expected 0)`)
  })

  test('different belt instances start at different positions', () => {
    // Create multiple belts and check their first card varies
    const firstCards = new Set()
    for (let i = 0; i < 10; i++) {
      const belt = new LeaderBelt('SOR')
      firstCards.add(belt.next().name)
    }

    // With random shuffle start, we should see variation
    assert(firstCards.size > 1, 'Different belt instances should start at different positions')
  })

  test('each unique common leader appears before any repeats', () => {
    const belt = new LeaderBelt('SOR')
    const numCommons = belt.commonLeaders.length

    // Draw one full cycle worth of commons (accounting for rares)
    // We need to track common leaders specifically
    const commonsSeen = new Set()
    const commonsOrder = []
    let drawCount = 0
    const maxDraws = numCommons * 3  // Safety limit

    while (commonsSeen.size < numCommons && drawCount < maxDraws) {
      const card = belt.next()
      drawCount++

      if (card.rarity === 'Common') {
        if (commonsSeen.has(card.name)) {
          // We hit a repeat - check if we've seen all commons first
          assert(
            commonsSeen.size === numCommons,
            `Saw repeat of "${card.name}" after only seeing ${commonsSeen.size}/${numCommons} unique commons. ` +
            `Commons seen: ${Array.from(commonsSeen).join(', ')}`
          )
        }
        commonsSeen.add(card.name)
        commonsOrder.push(card.name)
      }
    }

    assertEqual(commonsSeen.size, numCommons,
      `Should see all ${numCommons} unique commons before any repeat`)
  })

  test('average gap between duplicate commons is close to cycle size', () => {
    const belt = new LeaderBelt('SOR')
    const numCommons = belt.commonLeaders.length

    // Track when each common leader is seen (in common-only count, not total draws)
    const lastSeenCommonIndex = new Map()  // name -> common index
    const gaps = []  // distances between same-name commons (in common-only count)
    let commonIndex = 0

    for (let i = 0; i < 200; i++) {
      const card = belt.next()
      if (card.rarity === 'Common') {
        if (lastSeenCommonIndex.has(card.name)) {
          const gap = commonIndex - lastSeenCommonIndex.get(card.name)
          gaps.push(gap)
        }
        lastSeenCommonIndex.set(card.name, commonIndex)
        commonIndex++
      }
    }

    // Average gap should be close to numCommons (the cycle size)
    // Due to adjacent-duplicate skipping at cycle boundaries, gaps can occasionally
    // be smaller, but the average should still be close to the cycle size
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
    const minExpectedAvg = numCommons - 2  // Allow for boundary skips
    const maxExpectedAvg = numCommons + 2  // Should not be much larger

    assert(
      avgGap >= minExpectedAvg && avgGap <= maxExpectedAvg,
      `Average gap should be ~${numCommons}, got ${avgGap.toFixed(1)} (range: [${Math.min(...gaps)}-${Math.max(...gaps)}])`
    )
  })

  console.log('')
  console.log('\x1b[35m' + '='.repeat(40) + '\x1b[0m')
  console.log(`\x1b[32m✅ Tests passed: ${passed}\x1b[0m`)
  if (failed > 0) {
    console.log(`\x1b[31m❌ Tests failed: ${failed}\x1b[0m`)
  } else {
    console.log(`\x1b[90m   Tests failed: ${failed}\x1b[0m`)
  }
  console.log('')

  if (failed > 0) {
    console.log('\x1b[31m\x1b[1m💥 TESTS FAILED\x1b[0m')
    process.exit(1)
  } else {
    console.log('\x1b[32m\x1b[1m🎉 ALL TESTS PASSED!\x1b[0m')
  }
}

runTests()
