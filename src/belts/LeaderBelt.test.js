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

  test('initializes with a set code and loads only leaders', () => {
    const belt = new LeaderBelt('SOR')
    assert(belt.fillingPool.length > 0, 'Filling pool should not be empty')
    assert(belt.fillingPool.every(c => c.isLeader), 'All cards in filling pool should be leaders')
    assert(belt.fillingPool.every(c => c.set === 'SOR'), 'All cards should be from SOR set')
    assert(belt.fillingPool.every(c => c.variantType === 'Normal'), 'All cards should be normal variants')
  })

  test('separates leaders into common and rare', () => {
    const belt = new LeaderBelt('SOR')
    assert(belt.commonLeaders.length > 0, 'Should have common leaders')
    assert(belt.rareLeaders.length > 0, 'Should have rare leaders')
    assert(belt.commonLeaders.every(c => c.rarity === 'Common'), 'Common leaders should all be Common rarity')
    assert(belt.rareLeaders.every(c => c.rarity === 'Rare'), 'Rare leaders should all be Rare rarity')
    assertEqual(
      belt.commonLeaders.length + belt.rareLeaders.length,
      belt.fillingPool.length,
      'Common + rare should equal total filling pool'
    )
  })

  test('hopper is filled on initialization', () => {
    const belt = new LeaderBelt('SOR')
    assert(belt.hopper.length > belt.fillingPool.length, 'Hopper should be at least as large as filling pool after init')
  })

  test('next() returns a leader card', () => {
    const belt = new LeaderBelt('SOR')
    const card = belt.next()
    assert(card !== null, 'next() should return a card')
    assert(card.isLeader, 'Returned card should be a leader')
    assert(card.set === 'SOR', 'Returned card should be from correct set')
  })

  test('next() removes card from hopper', () => {
    const belt = new LeaderBelt('SOR')
    const initialSize = belt.size
    belt.next()
    assertEqual(belt.size, initialSize - 1, 'Hopper size should decrease by 1')
  })

  test('next() returns a copy, not the original', () => {
    const belt = new LeaderBelt('SOR')
    const card1 = belt.next()
    card1.modified = true
    // Get another card and check it doesn't have the modification
    const card2 = belt.next()
    assert(card2.modified === undefined, 'Cards should be copies, not references')
  })

  test('hopper refills when depleted', () => {
    const belt = new LeaderBelt('SOR')
    const fillingPoolSize = belt.fillingPool.length

    // Drain the hopper to exactly the threshold
    while (belt.size > fillingPoolSize) {
      belt.next()
    }

    // Now hopper.length === fillingPool.length, next call should trigger refill
    const sizeAtThreshold = belt.size
    // Pull one more (hopper is still at threshold, won't refill yet)
    belt.next()
    // Pull another (hopper is now below threshold, should trigger refill)
    belt.next()

    // After refill, hopper should be larger than filling pool again
    assert(belt.size >= fillingPoolSize, `Hopper should refill. Size: ${belt.size}, threshold: ${fillingPoolSize}`)
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
    // Allow some variance: ratio should be between 4:1 and 6:1
    assert(ratio >= 4 && ratio <= 6, `Ratio should be ~5:1, got ${ratio.toFixed(2)}:1 (${commonCount} common, ${rareCount} rare)`)

    // Rare frequency should be approximately 1 in 6
    const rareFrequency = 600 / rareCount
    assert(rareFrequency >= 5 && rareFrequency <= 7, `Rare frequency should be ~1 in 6, got 1 in ${rareFrequency.toFixed(1)}`)
  })

  test('no immediately adjacent duplicate leaders (seam dedup)', () => {
    const belt = new LeaderBelt('SOR')

    // Check first 100 cards for immediately adjacent duplicates
    const sample = []
    for (let i = 0; i < 100; i++) {
      sample.push(belt.next())
    }

    let violations = 0
    for (let i = 0; i < sample.length - 1; i++) {
      if (sample[i].id === sample[i + 1].id) {
        violations++
      }
    }

    // Should have zero or very few immediate adjacencies
    assert(violations <= 2, `Found ${violations} immediately adjacent duplicates (max allowed: 2)`)
  })

  test('different belt instances start at different positions', () => {
    // Create multiple belts and check their first card varies
    const firstCards = new Set()
    for (let i = 0; i < 10; i++) {
      const belt = new LeaderBelt('SOR')
      firstCards.add(belt.peek(1)[0].id)
    }

    // With random start, we should see variation
    assert(firstCards.size > 1, 'Different belt instances should start at different positions')
  })

  test('peek() returns cards without removing them', () => {
    const belt = new LeaderBelt('SOR')
    const peeked = belt.peek(3)
    const sizeBefore = belt.size

    assertEqual(peeked.length, 3, 'peek(3) should return 3 cards')
    assertEqual(belt.size, sizeBefore, 'peek() should not change hopper size')

    // Verify peek matches what next() returns
    const next1 = belt.next()
    assertEqual(next1.id, peeked[0].id, 'First peeked card should match first next()')
  })

  test('no repeating pattern: consecutive belt fills produce different sequences', () => {
    const belt = new LeaderBelt('SOR')

    // Deploy entire first fill into an array
    const firstFill = []
    const fillSize = belt.fillingPool.length * 5 + belt.fillingPool.length // 5 commons + 1 rare per leader
    for (let i = 0; i < fillSize; i++) {
      firstFill.push(belt.next().id)
    }

    // Deploy second fill into an array
    const secondFill = []
    for (let i = 0; i < fillSize; i++) {
      secondFill.push(belt.next().id)
    }

    // Arrays should not be identical
    const areIdentical = firstFill.length === secondFill.length &&
      firstFill.every((id, idx) => id === secondFill[idx])

    assert(!areIdentical, 'Consecutive belt fills should not produce identical sequences')

    // Count how many positions are different
    let differences = 0
    for (let i = 0; i < Math.min(firstFill.length, secondFill.length); i++) {
      if (firstFill[i] !== secondFill[i]) differences++
    }

    // At least 50% of positions should be different (shuffled)
    const diffPercent = (differences / firstFill.length) * 100
    assert(diffPercent > 50, `At least 50% of positions should differ, got ${diffPercent.toFixed(1)}%`)
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
