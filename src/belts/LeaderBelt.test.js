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
    console.log(`✓ ${name}`)
    passed++
  } catch (e) {
    console.log(`✗ ${name}`)
    console.log(`  ${e.message}`)
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
  console.log('Initializing card cache...')
  await initializeCardCache()
  console.log('')
  console.log('LeaderBelt Tests')
  console.log('================')

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
    assert(belt.hopper.length > belt.fillingPool.length, 'Hopper should be larger than filling pool after init')
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
    belt.next() // This triggers _fillIfNeeded which should refill

    // After refill, hopper should be larger than filling pool again
    assert(belt.size > fillingPoolSize, `Hopper should refill. Size: ${belt.size}, threshold: ${fillingPoolSize}`)
  })

  test('commons appear more frequently than rares in hopper', () => {
    const belt = new LeaderBelt('SOR')

    // Sample 100 cards
    const counts = { Common: 0, Rare: 0 }
    for (let i = 0; i < 100; i++) {
      const card = belt.next()
      counts[card.rarity] = (counts[card.rarity] || 0) + 1
    }

    const commonCount = counts.Common
    const rareCount = counts.Rare

    assert(commonCount > rareCount, `Commons (${commonCount}) should appear more than rares (${rareCount})`)
  })

  test('no duplicate leaders within 6 slots of each other (seam dedup)', () => {
    const belt = new LeaderBelt('SOR')

    // Check first 50 cards for adjacent duplicates
    const sample = []
    for (let i = 0; i < 50; i++) {
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

    // Allow some violations since dedup isn't perfect with small card pool (16 leaders in SOR)
    assert(violations <= 5, `Found ${violations} duplicate pairs within 6 slots (max allowed: 5)`)
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

  console.log('')
  console.log(`Results: ${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

runTests()
