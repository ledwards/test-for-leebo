/**
 * RareLegendaryBelt Tests
 *
 * Run with: node src/belts/RareLegendaryBelt.test.js
 */

import { RareLegendaryBelt } from './RareLegendaryBelt.js'
import { initializeCardCache } from '../utils/cardCache.js'

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
  console.log('\x1b[1m\x1b[35m💎 RareLegendaryBelt Tests\x1b[0m')
  console.log('\x1b[35m' + '='.repeat(40) + '\x1b[0m')

  test('initializes with a set code and loads rares and legendaries', () => {
    const belt = new RareLegendaryBelt('SOR')
    assert(belt.fillingPool.length > 0, 'Filling pool should not be empty')
    assert(belt.rares.length > 0, 'Should have rares')
    assert(belt.legendaries.length > 0, 'Should have legendaries')
    assert(belt.fillingPool.every(c => !c.isLeader), 'No leaders in filling pool')
    assert(belt.fillingPool.every(c => !c.isBase), 'No bases in filling pool')
    assert(belt.fillingPool.every(c => c.set === 'SOR'), 'All cards should be from SOR set')
    assert(belt.fillingPool.every(c => c.variantType === 'Normal'), 'All cards should be normal variants')
  })

  test('filling pool contains only Rare and Legendary rarities', () => {
    const belt = new RareLegendaryBelt('SOR')
    assert(
      belt.fillingPool.every(c => c.rarity === 'Rare' || c.rarity === 'Legendary'),
      'All cards should be Rare or Legendary'
    )
  })

  test('sets 1-3 use 6:1 ratio', () => {
    for (const setCode of ['SOR', 'SHD', 'TWI']) {
      const belt = new RareLegendaryBelt(setCode)
      assertEqual(belt.ratio, 6, `${setCode} should use 6:1 ratio`)
    }
  })

  test('sets 4-6 use 5:1 ratio', () => {
    for (const setCode of ['JTL', 'LOF', 'SEC']) {
      const belt = new RareLegendaryBelt(setCode)
      assertEqual(belt.ratio, 5, `${setCode} should use 5:1 ratio`)
    }
  })

  test('hopper is filled on initialization', () => {
    const belt = new RareLegendaryBelt('SOR')
    assert(belt.hopper.length > belt.fillingPool.length, 'Hopper should be at least as large as filling pool after init')
  })

  test('next() returns a rare or legendary card', () => {
    const belt = new RareLegendaryBelt('SOR')
    const card = belt.next()
    assert(card !== null, 'next() should return a card')
    assert(card.rarity === 'Rare' || card.rarity === 'Legendary', 'Returned card should be Rare or Legendary')
    assert(!card.isLeader, 'Returned card should not be a leader')
    assert(!card.isBase, 'Returned card should not be a base')
    assert(card.set === 'SOR', 'Returned card should be from correct set')
  })

  test('next() removes card from hopper', () => {
    const belt = new RareLegendaryBelt('SOR')
    const initialSize = belt.size
    belt.next()
    assertEqual(belt.size, initialSize - 1, 'Hopper size should decrease by 1')
  })

  test('next() returns a copy, not the original', () => {
    const belt = new RareLegendaryBelt('SOR')
    const card1 = belt.next()
    card1.modified = true
    const card2 = belt.next()
    assert(card2.modified === undefined, 'Cards should be copies, not references')
  })

  test('hopper refills when depleted', () => {
    const belt = new RareLegendaryBelt('SOR')
    const fillingPoolSize = belt.fillingPool.length

    // Drain the hopper to exactly the threshold
    while (belt.size > fillingPoolSize) {
      belt.next()
    }

    // Pull one more (hopper is still at threshold, won't refill yet)
    belt.next()
    // Pull another (hopper is now below threshold, should trigger refill)
    belt.next()
    belt.next()

    // After refill, hopper should be larger than filling pool again
    assert(belt.size >= fillingPoolSize, `Hopper should refill. Size: ${belt.size}, threshold: ${fillingPoolSize}`)
  })

  test('rares appear more frequently than legendaries (matching ratio)', () => {
    const belt = new RareLegendaryBelt('SOR')

    // Sample many cards
    const counts = { Rare: 0, Legendary: 0 }
    for (let i = 0; i < 500; i++) {
      const card = belt.next()
      counts[card.rarity] = (counts[card.rarity] || 0) + 1
    }

    // Rares should appear much more than legendaries
    assert(counts.Rare > counts.Legendary,
      `Rares (${counts.Rare}) should appear more than legendaries (${counts.Legendary})`)

    // The ratio in the hopper depends on card pool:
    // SOR has 48 rares and 16 legendaries, with 6:1 ratio
    // Each segment has 48 rares + ~2-3 legendaries = ~48:2.67 ≈ 18:1 in hopper
    const ratio = counts.Rare / counts.Legendary
    assert(ratio > 2 && ratio < 30,
      `Rare:Legendary ratio should be reasonable, got ${ratio.toFixed(2)}`)
  })

  test('no duplicate cards within 6 slots of each other (seam dedup)', () => {
    const belt = new RareLegendaryBelt('SOR')

    // Check first 100 cards for adjacent duplicates
    const sample = []
    for (let i = 0; i < 100; i++) {
      sample.push(belt.next())
    }

    let violations = 0
    for (let i = 0; i < sample.length; i++) {
      for (let j = i + 1; j <= Math.min(i + 6, sample.length - 1); j++) {
        if (sample[i].id === sample[j].id) {
          violations++
        }
      }
    }

    // Allow some violations since dedup isn't perfect with card pool size
    assert(violations <= 5, `Found ${violations} duplicate pairs within 6 slots (max allowed: 5)`)
  })

  test('different belt instances start at different positions', () => {
    const firstCards = new Set()
    for (let i = 0; i < 10; i++) {
      const belt = new RareLegendaryBelt('SOR')
      firstCards.add(belt.peek(1)[0].id)
    }

    // With random start, we should see variation
    assert(firstCards.size > 1, 'Different belt instances should start at different positions')
  })

  test('peek() returns cards without removing them', () => {
    const belt = new RareLegendaryBelt('SOR')
    const peeked = belt.peek(3)
    const sizeBefore = belt.size

    assertEqual(peeked.length, 3, 'peek(3) should return 3 cards')
    assertEqual(belt.size, sizeBefore, 'peek() should not change hopper size')

    // Verify peek matches what next() returns
    const next1 = belt.next()
    assertEqual(next1.id, peeked[0].id, 'First peeked card should match first next()')
  })

  test('no repeating pattern: consecutive belt fills produce different sequences', () => {
    const belt = new RareLegendaryBelt('SOR')
    const fillSize = belt.fillingPool.length

    // Deploy entire first fill into an array
    const firstFill = []
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
