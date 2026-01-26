/**
 * Hyperspace Belts Tests
 *
 * Tests for HyperspaceUncommonBelt, HyperspaceCommonBelt, HyperspaceBaseBelt, HyperspaceLeaderBelt
 *
 * Run with: node src/belts/HyperspaceBelts.test.js
 */

import { HyperspaceUncommonBelt } from './HyperspaceUncommonBelt.js'
import { HyperspaceCommonBelt } from './HyperspaceCommonBelt.js'
import { HyperspaceBaseBelt } from './HyperspaceBaseBelt.js'
import { HyperspaceLeaderBelt } from './HyperspaceLeaderBelt.js'
import { HyperspaceRareLegendaryBelt } from './HyperspaceRareLegendaryBelt.js'
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
  console.log('HyperspaceUncommonBelt Tests')
  console.log('\x1b[35m' + '='.repeat(40) + '\x1b[0m')

  test('HyperspaceUncommon: initializes with Hyperspace uncommons', () => {
    const belt = new HyperspaceUncommonBelt('SOR')
    assert(belt.fillingPool.length > 0, 'Filling pool should not be empty')
    assert(belt.fillingPool.every(c => c.variantType === 'Hyperspace'), 'All should be Hyperspace')
    assert(belt.fillingPool.every(c => c.rarity === 'Uncommon'), 'All should be Uncommon')
    assert(belt.fillingPool.every(c => !c.isLeader && !c.isBase), 'No leaders or bases')
  })

  test('HyperspaceUncommon: next() returns marked card', () => {
    const belt = new HyperspaceUncommonBelt('SOR')
    const card = belt.next()
    assert(card.isHyperspace === true, 'Should be marked as hyperspace')
    assert(card.rarity === 'Uncommon', 'Should be Uncommon rarity')
  })

  test('HyperspaceUncommon: hopper refills', () => {
    const belt = new HyperspaceUncommonBelt('SOR')
    const poolSize = belt.fillingPool.length
    while (belt.size > poolSize) belt.next(); belt.next()
    belt.next()
    assert(belt.size >= poolSize, 'Hopper should refill')
  })

  console.log('')
  console.log('HyperspaceCommonBelt Tests')
  console.log('\x1b[35m' + '='.repeat(40) + '\x1b[0m')

  test('HyperspaceCommon: initializes with Hyperspace commons', () => {
    const belt = new HyperspaceCommonBelt('SOR')
    assert(belt.fillingPool.length > 0, 'Filling pool should not be empty')
    assert(belt.fillingPool.every(c => c.variantType === 'Hyperspace'), 'All should be Hyperspace')
    assert(belt.fillingPool.every(c => c.rarity === 'Common'), 'All should be Common')
    assert(belt.fillingPool.every(c => !c.isLeader && !c.isBase), 'No leaders or bases')
  })

  test('HyperspaceCommon: next() returns marked card', () => {
    const belt = new HyperspaceCommonBelt('SOR')
    const card = belt.next()
    assert(card.isHyperspace === true, 'Should be marked as hyperspace')
    assert(card.rarity === 'Common', 'Should be Common rarity')
  })

  test('HyperspaceCommon: is a single belt (not split)', () => {
    const belt = new HyperspaceCommonBelt('SOR')
    // Just verify it works as a single belt
    const cards = []
    for (let i = 0; i < 20; i++) {
      cards.push(belt.next())
    }
    assert(cards.length === 20, 'Should pull 20 cards from single belt')
  })

  test('HyperspaceCommon: hopper refills', () => {
    const belt = new HyperspaceCommonBelt('SOR')
    const poolSize = belt.fillingPool.length
    while (belt.size > poolSize) belt.next(); belt.next()
    belt.next()
    assert(belt.size >= poolSize, 'Hopper should refill')
  })

  console.log('')
  console.log('HyperspaceBaseBelt Tests')
  console.log('\x1b[35m' + '='.repeat(40) + '\x1b[0m')

  test('HyperspaceBase: initializes with Hyperspace bases', () => {
    const belt = new HyperspaceBaseBelt('SOR')
    assert(belt.fillingPool.length > 0, 'Filling pool should not be empty')
    assert(belt.fillingPool.every(c => c.variantType === 'Hyperspace'), 'All should be Hyperspace')
    assert(belt.fillingPool.every(c => c.isBase), 'All should be bases')
    assert(belt.fillingPool.every(c => c.rarity === 'Common'), 'All should be Common rarity')
  })

  test('HyperspaceBase: next() returns marked card', () => {
    const belt = new HyperspaceBaseBelt('SOR')
    const card = belt.next()
    assert(card.isHyperspace === true, 'Should be marked as hyperspace')
    assert(card.isBase === true, 'Should be a base')
  })

  test('HyperspaceBase: hopper refills', () => {
    const belt = new HyperspaceBaseBelt('SOR')
    const poolSize = belt.fillingPool.length
    while (belt.size > poolSize) belt.next(); belt.next()
    belt.next()
    assert(belt.size >= poolSize, 'Hopper should refill')
  })

  console.log('')
  console.log('HyperspaceLeaderBelt Tests')
  console.log('\x1b[35m' + '='.repeat(40) + '\x1b[0m')

  test('HyperspaceLeader: initializes with Hyperspace leaders', () => {
    const belt = new HyperspaceLeaderBelt('SOR')
    assert(belt.fillingPool.length > 0, 'Filling pool should not be empty')
    assert(belt.fillingPool.every(c => c.variantType === 'Hyperspace'), 'All should be Hyperspace')
    assert(belt.fillingPool.every(c => c.isLeader), 'All should be leaders')
    assert(belt.fillingPool.every(c => c.rarity === 'Common' || c.rarity === 'Rare'), 'Only C and R rarity')
  })

  test('HyperspaceLeader: separates into common and rare', () => {
    const belt = new HyperspaceLeaderBelt('SOR')
    assert(belt.commonLeaders.length > 0, 'Should have common leaders')
    assert(belt.rareLeaders.length > 0, 'Should have rare leaders')
    assertEqual(
      belt.commonLeaders.length + belt.rareLeaders.length,
      belt.fillingPool.length,
      'Common + rare should equal total'
    )
  })

  test('HyperspaceLeader: next() returns marked card', () => {
    const belt = new HyperspaceLeaderBelt('SOR')
    const card = belt.next()
    assert(card.isHyperspace === true, 'Should be marked as hyperspace')
    assert(card.isLeader === true, 'Should be a leader')
  })

  test('HyperspaceLeader: hopper refills', () => {
    const belt = new HyperspaceLeaderBelt('SOR')
    const poolSize = belt.fillingPool.length
    while (belt.size > poolSize) belt.next(); belt.next()
    belt.next()
    assert(belt.size >= poolSize, 'Hopper should refill')
  })

  console.log('')
  console.log('HyperspaceRareLegendaryBelt Tests')
  console.log('\x1b[35m' + '='.repeat(40) + '\x1b[0m')

  test('HyperspaceRL: initializes with Hyperspace rares and legendaries', () => {
    const belt = new HyperspaceRareLegendaryBelt('SOR')
    assert(belt.fillingPool.length > 0, 'Filling pool should not be empty')
    assert(belt.fillingPool.every(c => c.variantType === 'Hyperspace'), 'All should be Hyperspace')
    assert(belt.fillingPool.every(c =>
      c.rarity === 'Rare' || c.rarity === 'Legendary'
    ), 'All should be Rare or Legendary')
    assert(belt.fillingPool.every(c => !c.isLeader && !c.isBase), 'No leaders or bases')
  })

  test('HyperspaceRL: next() returns marked card', () => {
    const belt = new HyperspaceRareLegendaryBelt('SOR')
    const card = belt.next()
    assert(card.isHyperspace === true, 'Should be marked as hyperspace')
    assert(card.rarity === 'Rare' || card.rarity === 'Legendary', 'Should be Rare or Legendary')
  })

  test('HyperspaceRL: sets 1-3 use 6:1 ratio', () => {
    const belt = new HyperspaceRareLegendaryBelt('SOR')
    assertEqual(belt.ratio, 6, 'SOR should use 6:1 ratio')
  })

  test('HyperspaceRL: sets 4-6 use 5:1 ratio', () => {
    const belt = new HyperspaceRareLegendaryBelt('JTL')
    assertEqual(belt.ratio, 5, 'JTL should use 5:1 ratio')
  })

  test('HyperspaceRL: hopper refills', () => {
    const belt = new HyperspaceRareLegendaryBelt('SOR')
    const poolSize = belt.fillingPool.length
    while (belt.size > poolSize) belt.next(); belt.next()
    belt.next()
    assert(belt.size >= poolSize, 'Hopper should refill')
  })

  test('HyperspaceRL: no repeating pattern in consecutive fills', () => {
    const belt = new HyperspaceRareLegendaryBelt('SOR')
    const fillSize = belt.fillingPool.length

    const firstFill = []
    for (let i = 0; i < fillSize; i++) {
      firstFill.push(belt.next().id)
    }

    const secondFill = []
    for (let i = 0; i < fillSize; i++) {
      secondFill.push(belt.next().id)
    }

    const areIdentical = firstFill.every((id, idx) => id === secondFill[idx])
    assert(!areIdentical, 'Consecutive fills should not be identical')

    let differences = 0
    for (let i = 0; i < firstFill.length; i++) {
      if (firstFill[i] !== secondFill[i]) differences++
    }
    const diffPercent = (differences / firstFill.length) * 100
    assert(diffPercent > 50, `At least 50% should differ, got ${diffPercent.toFixed(1)}%`)
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
