/**
 * CommonBelt Tests
 *
 * Run with: node src/belts/CommonBelt.test.js
 */

import { CommonBelt, getCommonPools } from './CommonBelt.js'
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
  console.log('CommonBelt Tests')
  console.log('================'  )

  test('getCommonPools divides commons into two pools', () => {
    const { poolA, poolB } = getCommonPools('SOR')
    assert(poolA.length > 0, 'Pool A should not be empty')
    assert(poolB.length > 0, 'Pool B should not be empty')
  })

  test('pools are roughly balanced in size', () => {
    const { poolA, poolB } = getCommonPools('SOR')
    const diff = Math.abs(poolA.length - poolB.length)
    // Difference should be at most 1 (due to odd total)
    assert(diff <= 1, `Pools should be balanced, but diff is ${diff} (A: ${poolA.length}, B: ${poolB.length})`)
  })

  test('Belt A contains Vigilance and Command cards', () => {
    const { poolA } = getCommonPools('SOR')
    const vigilanceCommand = poolA.filter(c =>
      c.aspects && (c.aspects.includes('Vigilance') || c.aspects.includes('Command'))
    )
    assert(vigilanceCommand.length > 0, 'Belt A should have Vigilance/Command cards')
  })

  test('Belt B contains Aggression and Cunning cards', () => {
    const { poolB } = getCommonPools('SOR')
    const aggressionCunning = poolB.filter(c =>
      c.aspects && (c.aspects.includes('Aggression') || c.aspects.includes('Cunning'))
    )
    assert(aggressionCunning.length > 0, 'Belt B should have Aggression/Cunning cards')
  })

  test('Belt A does not contain Aggression or Cunning aspect cards', () => {
    const { poolA } = getCommonPools('SOR')
    const wrongAspects = poolA.filter(c =>
      c.aspects && (c.aspects.includes('Aggression') || c.aspects.includes('Cunning'))
    )
    assertEqual(wrongAspects.length, 0, 'Belt A should not have Aggression/Cunning cards')
  })

  test('Belt B does not contain Vigilance or Command aspect cards', () => {
    const { poolB } = getCommonPools('SOR')
    const wrongAspects = poolB.filter(c =>
      c.aspects && (c.aspects.includes('Vigilance') || c.aspects.includes('Command'))
    )
    assertEqual(wrongAspects.length, 0, 'Belt B should not have Vigilance/Command cards')
  })

  test('all cards in pools are commons', () => {
    const { poolA, poolB } = getCommonPools('SOR')
    assert(poolA.every(c => c.rarity === 'Common'), 'All Pool A cards should be Common')
    assert(poolB.every(c => c.rarity === 'Common'), 'All Pool B cards should be Common')
  })

  test('no leaders or bases in pools', () => {
    const { poolA, poolB } = getCommonPools('SOR')
    assert(poolA.every(c => !c.isLeader && !c.isBase), 'Pool A should not have leaders/bases')
    assert(poolB.every(c => !c.isLeader && !c.isBase), 'Pool B should not have leaders/bases')
  })

  test('CommonBelt initializes with a pool', () => {
    const { poolA } = getCommonPools('SOR')
    const belt = new CommonBelt('SOR', poolA)
    assert(belt.fillingPool.length > 0, 'Filling pool should not be empty')
    assert(belt.hopper.length > 0, 'Hopper should be filled')
  })

  test('next() returns a common card', () => {
    const { poolA } = getCommonPools('SOR')
    const belt = new CommonBelt('SOR', poolA)
    const card = belt.next()
    assert(card !== null, 'next() should return a card')
    assert(card.rarity === 'Common', 'Returned card should be Common')
    assert(!card.isLeader, 'Returned card should not be a leader')
    assert(!card.isBase, 'Returned card should not be a base')
  })

  test('next() removes card from hopper', () => {
    const { poolA } = getCommonPools('SOR')
    const belt = new CommonBelt('SOR', poolA)
    const initialSize = belt.size
    belt.next()
    assertEqual(belt.size, initialSize - 1, 'Hopper size should decrease by 1')
  })

  test('next() returns a copy, not the original', () => {
    const { poolA } = getCommonPools('SOR')
    const belt = new CommonBelt('SOR', poolA)
    const card1 = belt.next()
    card1.modified = true
    const card2 = belt.next()
    assert(card2.modified === undefined, 'Cards should be copies, not references')
  })

  test('hopper refills when depleted', () => {
    const { poolA } = getCommonPools('SOR')
    const belt = new CommonBelt('SOR', poolA)
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

  test('no duplicate commons within 5 slots of each other (seam dedup)', () => {
    const { poolA } = getCommonPools('SOR')
    const belt = new CommonBelt('SOR', poolA)

    // Check first 100 cards for duplicates within 5 slots
    const sample = []
    for (let i = 0; i < 100; i++) {
      sample.push(belt.next())
    }

    let violations = 0
    for (let i = 0; i < sample.length; i++) {
      for (let j = i + 1; j <= Math.min(i + 5, sample.length - 1); j++) {
        if (sample[i].id === sample[j].id) {
          violations++
        }
      }
    }

    // With ~45 commons per belt, duplicates within 5 slots should be rare
    assert(violations <= 3, `Found ${violations} duplicate pairs within 5 slots (max allowed: 3)`)
  })

  test('different belt instances start at different positions', () => {
    const { poolA } = getCommonPools('SOR')
    const firstCards = new Set()
    for (let i = 0; i < 10; i++) {
      const belt = new CommonBelt('SOR', poolA)
      firstCards.add(belt.peek(1)[0].id)
    }

    // With random start, we should see variation
    assert(firstCards.size > 1, 'Different belt instances should start at different positions')
  })

  test('peek() returns cards without removing them', () => {
    const { poolA } = getCommonPools('SOR')
    const belt = new CommonBelt('SOR', poolA)
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
