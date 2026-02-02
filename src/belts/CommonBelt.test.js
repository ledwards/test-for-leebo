/**
 * CommonBelt Tests
 *
 * Run with: node src/belts/CommonBelt.test.js
 */

import { CommonBelt, getCommonPools, getBeltCards } from './CommonBelt.js'
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

// Helper to flatten a structured pool into a flat array
function flattenPool(pool) {
  return [
    ...pool.primary1,
    ...pool.primary2,
    ...pool.assigned,
    ...(pool.neutral || [])
  ]
}

async function runTests() {
  console.log('\x1b[36m🔄 Initializing card cache...\x1b[0m')
  await initializeCardCache()
  console.log('')
  console.log('\x1b[1m\x1b[35m🎯 CommonBelt Tests\x1b[0m')
  console.log('\x1b[35m====================\x1b[0m')

  test('getBeltCards returns cards for Belt A', () => {
    const beltACards = getBeltCards('SOR', 'A')
    assert(beltACards.length > 0, 'Belt A should not be empty')
    assert(beltACards.length === 60, `Belt A should have 60 cards, got ${beltACards.length}`)
  })

  test('getBeltCards returns cards for Belt B', () => {
    const beltBCards = getBeltCards('SOR', 'B')
    assert(beltBCards.length > 0, 'Belt B should not be empty')
    assert(beltBCards.length === 30, `Belt B should have 30 cards, got ${beltBCards.length}`)
  })

  test('Belt A contains Vigilance and Command cards', () => {
    const beltACards = getBeltCards('SOR', 'A')
    const vigilanceCommand = beltACards.filter(c =>
      c.aspects && (c.aspects.includes('Vigilance') || c.aspects.includes('Command'))
    )
    assert(vigilanceCommand.length > 0, 'Belt A should have Vigilance/Command cards')
  })

  test('Belt B contains Cunning cards', () => {
    const beltBCards = getBeltCards('SOR', 'B')
    const cunning = beltBCards.filter(c =>
      c.aspects && c.aspects.includes('Cunning')
    )
    assert(cunning.length > 0, 'Belt B should have Cunning cards')
  })

  test('Belt A and Belt B are completely disjoint (no shared cards)', () => {
    const beltACards = getBeltCards('SOR', 'A')
    const beltBCards = getBeltCards('SOR', 'B')

    const idsInA = new Set(beltACards.map(c => c.id))
    const idsInB = new Set(beltBCards.map(c => c.id))

    const overlap = []
    for (const id of idsInA) {
      if (idsInB.has(id)) {
        const card = beltACards.find(c => c.id === id)
        overlap.push(`${card.name} (${id})`)
      }
    }

    assertEqual(overlap.length, 0,
      `Belt A and Belt B must be disjoint, but found ${overlap.length} shared cards: ${overlap.join(', ')}`)
  })

  test('all cards in belts are commons', () => {
    const beltACards = getBeltCards('SOR', 'A')
    const beltBCards = getBeltCards('SOR', 'B')
    assert(beltACards.every(c => c.rarity === 'Common'), 'All Belt A cards should be Common')
    assert(beltBCards.every(c => c.rarity === 'Common'), 'All Belt B cards should be Common')
  })

  test('no leaders or bases in belts', () => {
    const beltACards = getBeltCards('SOR', 'A')
    const beltBCards = getBeltCards('SOR', 'B')
    assert(beltACards.every(c => !c.isLeader && !c.isBase), 'Belt A should not have leaders/bases')
    assert(beltBCards.every(c => !c.isLeader && !c.isBase), 'Belt B should not have leaders/bases')
  })

  test('CommonBelt initializes with belt ID', () => {
    const belt = new CommonBelt('SOR', 'A')
    assert(belt.beltCards.length > 0, 'Belt cards should not be empty')
    assert(belt.hopper.length > 0, 'Hopper should be filled')
  })

  test('next() returns a common card', () => {
    const belt = new CommonBelt('SOR', 'A')
    const card = belt.next()
    assert(card !== null, 'next() should return a card')
    assert(card.rarity === 'Common', 'Returned card should be Common')
    assert(!card.isLeader, 'Returned card should not be a leader')
    assert(!card.isBase, 'Returned card should not be a base')
  })

  test('next() removes card from hopper', () => {
    const belt = new CommonBelt('SOR', 'A')
    const initialSize = belt.size
    belt.next()
    assertEqual(belt.size, initialSize - 1, 'Hopper size should decrease by 1')
  })

  test('next() returns a copy, not the original', () => {
    const belt = new CommonBelt('SOR', 'A')
    const card1 = belt.next()
    card1.modified = true
    const card2 = belt.next()
    assert(card2.modified === undefined, 'Cards should be copies, not references')
  })

  test('hopper refills when low', () => {
    const belt = new CommonBelt('SOR', 'A')
    const beltCardsSize = belt.beltCards.length
    const drawSize = 6 // SOR Belt A draws 6 cards per pack

    // Drain the hopper until it reaches the refill threshold (drawSize)
    while (belt.size > drawSize) {
      belt.next()
    }

    // At this point, hopper should have <= drawSize cards
    assert(belt.size <= drawSize, `Hopper should be at refill threshold: ${belt.size}`)

    // Pull one more to trigger refill
    belt.next()

    // After refill, hopper should be larger
    assert(belt.size > drawSize, `Hopper should refill. Size: ${belt.size}, threshold: ${drawSize}`)
  })

  test('different belt instances start at different positions', () => {
    const firstCards = new Set()
    for (let i = 0; i < 10; i++) {
      const belt = new CommonBelt('SOR', 'A')
      firstCards.add(belt.peek(1)[0].id)
    }

    // With random shuffling, we should see variation
    assert(firstCards.size > 1, 'Different belt instances should start at different positions')
  })

  test('peek() returns cards without removing them', () => {
    const belt = new CommonBelt('SOR', 'A')
    const peeked = belt.peek(3)
    const sizeBefore = belt.size

    assertEqual(peeked.length, 3, 'peek(3) should return 3 cards')
    assertEqual(belt.size, sizeBefore, 'peek() should not change hopper size')

    // Verify peek matches what next() returns
    const next1 = belt.next()
    assertEqual(next1.id, peeked[0].id, 'First peeked card should match first next()')
  })

  test('pulling 20 consecutive cards from a belt has reasonable variety', () => {
    const belt = new CommonBelt('SOR', 'A')

    // Pull 20 consecutive cards
    const pulled = []
    for (let i = 0; i < 20; i++) {
      pulled.push(belt.next())
    }

    // Check we have at least 15 unique cards (some duplicates allowed due to belt cycling)
    const uniqueIds = new Set(pulled.map(c => c.id))
    assert(uniqueIds.size >= 15,
      `Should have at least 15 unique cards in 20 draws, got ${uniqueIds.size}`)
  })

  test('consecutive belt fills produce different sequences', () => {
    const belt = new CommonBelt('SOR', 'A')
    const fillSize = belt.beltCards.length

    // Pull entire first fill
    const firstFill = []
    for (let i = 0; i < fillSize; i++) {
      firstFill.push(belt.next().id)
    }

    // Pull second fill
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

  // Legacy getCommonPools tests for backward compatibility
  test('getCommonPools returns structured pools (legacy)', () => {
    const { poolA, poolB } = getCommonPools('SOR')
    assert(poolA.primary1.length > 0, 'Pool A primary1 should not be empty')
    assert(poolB.primary1.length > 0, 'Pool B primary1 should not be empty')
  })

  console.log('')
  console.log('\x1b[35m====================\x1b[0m')
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
