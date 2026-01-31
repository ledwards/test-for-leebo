/**
 * HyperfoilBelt Tests
 *
 * Run with: node src/belts/HyperfoilBelt.test.js
 */

import { HyperfoilBelt } from './HyperfoilBelt.js'
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
  console.log('\x1b[1m\x1b[35m💫 HyperfoilBelt Tests\x1b[0m')
  console.log('\x1b[35m' + '='.repeat(40) + '\x1b[0m')

  test('initializes with Hyperspace Foil variant cards', () => {
    const belt = new HyperfoilBelt('SOR')
    assert(belt.fillingPool.length > 0, 'Filling pool should not be empty')
    assert(belt.fillingPool.every(c => c.variantType === 'Hyperspace Foil'), 'All cards should be Hyperspace Foil variant')
    assert(belt.fillingPool.every(c => !c.isLeader && !c.isBase), 'No leaders or bases')
  })

  test('next() returns a hyperfoil card', () => {
    const belt = new HyperfoilBelt('SOR')
    const card = belt.next()
    assert(card !== null, 'next() should return a card')
    assert(card.isFoil === true, 'Returned card should be marked as foil')
    assert(card.isHyperspace === true, 'Returned card should be marked as hyperspace')
    assert(card.variantType === 'Hyperspace Foil', 'Returned card should be Hyperspace Foil variant')
  })

  test('next() removes card from hopper', () => {
    const belt = new HyperfoilBelt('SOR')
    const initialSize = belt.size
    belt.next()
    assertEqual(belt.size, initialSize - 1, 'Hopper size should decrease by 1')
  })

  test('commons appear most frequently', () => {
    const belt = new HyperfoilBelt('SOR')
    const counts = { Common: 0, Uncommon: 0, Rare: 0, Legendary: 0 }
    for (let i = 0; i < 200; i++) {
      const card = belt.next()
      counts[card.rarity] = (counts[card.rarity] || 0) + 1
    }
    assert(counts.Common > counts.Uncommon, 'Commons should appear more than uncommons')
    assert(counts.Uncommon > counts.Rare, 'Uncommons should appear more than rares')
  })

  test('sets 1-3 exclude Special rarity', () => {
    const belt = new HyperfoilBelt('SOR')
    const hasSpecial = belt.fillingPool.some(c => c.rarity === 'Special')
    assert(!hasSpecial, 'SOR should not have Special rarity in hyperfoil')
  })

  test('sets 4-6 include Special rarity at Rare rate', () => {
    const belt = new HyperfoilBelt('JTL')
    // Special should be included and at 6x rate (same as Rare)
    assertEqual(belt.rarityQuantities.Special, 6, 'Special should use Rare rate (6x) in sets 4-6')
  })

  test('hopper refills when depleted', () => {
    const belt = new HyperfoilBelt('SOR')
    const bootSize = belt._calculateBootSize()

    while (belt.size > bootSize) {
      belt.next()
    }

    // Pull one more (hopper is still at threshold, won't refill yet)
    belt.next()
    // Pull another (hopper is now below threshold, should trigger refill)
    belt.next()
    assert(belt.size >= bootSize, 'Hopper should refill')
  })

  test('no repeating pattern: consecutive belt fills produce different sequences', () => {
    const belt = new HyperfoilBelt('SOR')
    const fillSize = Math.min(belt.fillingPool.length, 30)

    // Deploy first batch into an array
    const firstFill = []
    for (let i = 0; i < fillSize; i++) {
      firstFill.push(belt.next().id)
    }

    // Deploy second batch into an array
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
