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
  console.log('HyperfoilBelt Tests')
  console.log('==================='  )

  test('initializes with Hyperspace variant cards', () => {
    const belt = new HyperfoilBelt('SOR')
    assert(belt.fillingPool.length > 0, 'Filling pool should not be empty')
    assert(belt.fillingPool.every(c => c.variantType === 'Hyperspace'), 'All cards should be Hyperspace variant')
    assert(belt.fillingPool.every(c => !c.isLeader && !c.isBase), 'No leaders or bases')
  })

  test('next() returns a hyperfoil card', () => {
    const belt = new HyperfoilBelt('SOR')
    const card = belt.next()
    assert(card !== null, 'next() should return a card')
    assert(card.isFoil === true, 'Returned card should be marked as foil')
    assert(card.isHyperspace === true, 'Returned card should be marked as hyperspace')
    assert(card.variantType === 'Hyperspace', 'Returned card should be Hyperspace variant')
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

    belt.next()
    assert(belt.size > bootSize, 'Hopper should refill')
  })

  console.log('')
  console.log(`Results: ${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

runTests()
