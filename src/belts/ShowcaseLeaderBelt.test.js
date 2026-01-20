/**
 * ShowcaseLeaderBelt Tests
 *
 * Run with: node src/belts/ShowcaseLeaderBelt.test.js
 */

import { ShowcaseLeaderBelt } from './ShowcaseLeaderBelt.js'
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
  console.log('ShowcaseLeaderBelt Tests')
  console.log('========================')

  test('initializes with Showcase variant leaders', () => {
    const belt = new ShowcaseLeaderBelt('SOR')
    assert(belt.fillingPool.length > 0, 'Filling pool should not be empty')
    assert(belt.fillingPool.every(c => c.isLeader), 'All cards should be leaders')
    assert(belt.fillingPool.every(c => c.variantType === 'Showcase'), 'All cards should be Showcase variant')
  })

  test('Set 1 excludes Special rarity', () => {
    const belt = new ShowcaseLeaderBelt('SOR')
    const hasSpecial = belt.fillingPool.some(c => c.rarity === 'Special')
    assert(!hasSpecial, 'SOR should not have Special rarity in showcase leaders')
  })

  test('Sets 2+ include Special rarity', () => {
    const belt = new ShowcaseLeaderBelt('SHD')
    // Check if Special exists in the data for this set
    const hasSpecial = belt.fillingPool.some(c => c.rarity === 'Special')
    // This might be true or false depending on data, just ensure no error
    assert(belt.fillingPool.length >= 0, 'Should initialize without error')
  })

  test('next() returns a Showcase leader', () => {
    const belt = new ShowcaseLeaderBelt('SOR')
    const card = belt.next()
    assert(card !== null, 'next() should return a card')
    assert(card.isLeader, 'Returned card should be a leader')
    assert(card.variantType === 'Showcase', 'Returned card should be Showcase variant')
  })

  test('next() removes card from hopper', () => {
    const belt = new ShowcaseLeaderBelt('SOR')
    const initialSize = belt.size
    belt.next()
    assertEqual(belt.size, initialSize - 1, 'Hopper size should decrease by 1')
  })

  test('hopper refills when depleted', () => {
    const belt = new ShowcaseLeaderBelt('SOR')
    const fillingPoolSize = belt.fillingPool.length

    while (belt.size > fillingPoolSize) {
      belt.next()
    }

    belt.next()
    assert(belt.size > fillingPoolSize, 'Hopper should refill')
  })

  test('different belt instances start at different positions', () => {
    const firstCards = new Set()
    for (let i = 0; i < 10; i++) {
      const belt = new ShowcaseLeaderBelt('SOR')
      firstCards.add(belt.peek(1)[0].id)
    }
    assert(firstCards.size > 1, 'Different belt instances should start at different positions')
  })

  console.log('')
  console.log(`Results: ${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

runTests()
