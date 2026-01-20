/**
 * UncommonBelt Tests
 *
 * Run with: node src/belts/UncommonBelt.test.js
 */

import { UncommonBelt } from './UncommonBelt.js'
import { initializeCardCache } from '../utils/cardCache.js'

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
  console.log('UncommonBelt Tests')
  console.log('==================')

  test('initializes with a set code and loads only uncommons', () => {
    const belt = new UncommonBelt('SOR')
    assert(belt.fillingPool.length > 0, 'Filling pool should not be empty')
    assert(belt.fillingPool.every(c => c.rarity === 'Uncommon'), 'All cards should be Uncommon')
    assert(belt.fillingPool.every(c => !c.isLeader), 'No leaders in filling pool')
    assert(belt.fillingPool.every(c => !c.isBase), 'No bases in filling pool')
    assert(belt.fillingPool.every(c => c.set === 'SOR'), 'All cards should be from SOR set')
    assert(belt.fillingPool.every(c => c.variantType === 'Normal'), 'All cards should be normal variants')
  })

  test('hopper is filled on initialization', () => {
    const belt = new UncommonBelt('SOR')
    assert(belt.hopper.length > belt.fillingPool.length, 'Hopper should be larger than filling pool after init')
  })

  test('next() returns an uncommon card', () => {
    const belt = new UncommonBelt('SOR')
    const card = belt.next()
    assert(card !== null, 'next() should return a card')
    assert(card.rarity === 'Uncommon', 'Returned card should be Uncommon')
    assert(!card.isLeader, 'Returned card should not be a leader')
    assert(!card.isBase, 'Returned card should not be a base')
    assert(card.set === 'SOR', 'Returned card should be from correct set')
  })

  test('next() removes card from hopper', () => {
    const belt = new UncommonBelt('SOR')
    const initialSize = belt.size
    belt.next()
    assertEqual(belt.size, initialSize - 1, 'Hopper size should decrease by 1')
  })

  test('next() returns a copy, not the original', () => {
    const belt = new UncommonBelt('SOR')
    const card1 = belt.next()
    card1.modified = true
    const card2 = belt.next()
    assert(card2.modified === undefined, 'Cards should be copies, not references')
  })

  test('hopper refills when depleted', () => {
    const belt = new UncommonBelt('SOR')
    const fillingPoolSize = belt.fillingPool.length

    // Drain the hopper to exactly the threshold
    while (belt.size > fillingPoolSize) {
      belt.next()
    }

    // Next call should trigger refill
    belt.next()

    // After refill, hopper should be larger than filling pool again
    assert(belt.size > fillingPoolSize, `Hopper should refill. Size: ${belt.size}, threshold: ${fillingPoolSize}`)
  })

  test('different belt instances start at different positions', () => {
    const firstCards = new Set()
    for (let i = 0; i < 10; i++) {
      const belt = new UncommonBelt('SOR')
      firstCards.add(belt.peek(1)[0].id)
    }

    // With random start, we should see variation
    assert(firstCards.size > 1, 'Different belt instances should start at different positions')
  })

  test('peek() returns cards without removing them', () => {
    const belt = new UncommonBelt('SOR')
    const peeked = belt.peek(3)
    const sizeBefore = belt.size

    assertEqual(peeked.length, 3, 'peek(3) should return 3 cards')
    assertEqual(belt.size, sizeBefore, 'peek() should not change hopper size')

    // Verify peek matches what next() returns
    const next1 = belt.next()
    assertEqual(next1.id, peeked[0].id, 'First peeked card should match first next()')
  })

  test('all uncommons from set are in filling pool', () => {
    const belt = new UncommonBelt('SOR')
    // SOR has 60 uncommons
    assert(belt.fillingPool.length >= 50, `Should have many uncommons, got ${belt.fillingPool.length}`)
  })

  test('no duplicate uncommons within 4 slots of each other (seam dedup)', () => {
    const belt = new UncommonBelt('SOR')

    // Check first 100 cards for duplicates within 4 slots
    const sample = []
    for (let i = 0; i < 100; i++) {
      sample.push(belt.next())
    }

    let violations = 0
    for (let i = 0; i < sample.length; i++) {
      for (let j = i + 1; j <= Math.min(i + 4, sample.length - 1); j++) {
        if (sample[i].id === sample[j].id) {
          violations++
        }
      }
    }

    // With 60 uncommons, duplicates within 4 slots should be very rare
    assert(violations <= 3, `Found ${violations} duplicate pairs within 4 slots (max allowed: 3)`)
  })

  test('serves all 3 uncommon slots in a pack without duplicates', () => {
    const belt = new UncommonBelt('SOR')

    // Simulate drawing 3 uncommons for many packs
    let packsWithDuplicates = 0
    for (let pack = 0; pack < 50; pack++) {
      const uncommons = [belt.next(), belt.next(), belt.next()]
      const ids = uncommons.map(c => c.id)
      const uniqueIds = new Set(ids)
      if (uniqueIds.size < 3) {
        packsWithDuplicates++
      }
    }

    // Very few packs should have duplicate uncommons
    assert(packsWithDuplicates <= 2, `${packsWithDuplicates} packs had duplicate uncommons (max allowed: 2)`)
  })

  console.log('')
  console.log(`Results: ${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

runTests()
