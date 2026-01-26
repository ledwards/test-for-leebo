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

  test('getCommonPools divides commons into two pools', () => {
    const { poolA, poolB } = getCommonPools('SOR')
    const flatA = flattenPool(poolA)
    const flatB = flattenPool(poolB)
    assert(flatA.length > 0, 'Pool A should not be empty')
    assert(flatB.length > 0, 'Pool B should not be empty')
  })

  test('pools have required aspect sub-pools', () => {
    const { poolA, poolB } = getCommonPools('SOR')
    assert(poolA.primary1.length > 0, 'Pool A should have Vigilance cards (primary1)')
    assert(poolA.primary2.length > 0, 'Pool A should have Command cards (primary2)')
    assert(poolA.assigned.length > 0, 'Pool A should have Heroism cards (assigned)')
    assert(poolB.primary1.length > 0, 'Pool B should have Aggression cards (primary1)')
    assert(poolB.primary2.length > 0, 'Pool B should have Cunning cards (primary2)')
    assert(poolB.assigned.length > 0, 'Pool B should have Villainy cards (assigned)')
  })

  test('Belt A contains Vigilance and Command cards', () => {
    const { poolA } = getCommonPools('SOR')
    const flatA = flattenPool(poolA)
    const vigilanceCommand = flatA.filter(c =>
      c.aspects && (c.aspects.includes('Vigilance') || c.aspects.includes('Command'))
    )
    assert(vigilanceCommand.length > 0, 'Belt A should have Vigilance/Command cards')
  })

  test('Belt B contains Aggression and Cunning cards', () => {
    const { poolB } = getCommonPools('SOR')
    const flatB = flattenPool(poolB)
    const aggressionCunning = flatB.filter(c =>
      c.aspects && (c.aspects.includes('Aggression') || c.aspects.includes('Cunning'))
    )
    assert(aggressionCunning.length > 0, 'Belt B should have Aggression/Cunning cards')
  })

  test('Belt A does not contain Aggression or Cunning aspect cards', () => {
    const { poolA } = getCommonPools('SOR')
    const flatA = flattenPool(poolA)
    const wrongAspects = flatA.filter(c =>
      c.aspects && (c.aspects.includes('Aggression') || c.aspects.includes('Cunning'))
    )
    assertEqual(wrongAspects.length, 0, 'Belt A should not have Aggression/Cunning cards')
  })

  test('Belt B does not contain Vigilance or Command aspect cards', () => {
    const { poolB } = getCommonPools('SOR')
    const flatB = flattenPool(poolB)
    const wrongAspects = flatB.filter(c =>
      c.aspects && (c.aspects.includes('Vigilance') || c.aspects.includes('Command'))
    )
    assertEqual(wrongAspects.length, 0, 'Belt B should not have Vigilance/Command cards')
  })

  test('Belt A and Belt B are completely disjoint (no shared cards)', () => {
    const { poolA, poolB } = getCommonPools('SOR')
    const flatA = flattenPool(poolA)
    const flatB = flattenPool(poolB)

    // Create sets of card IDs
    const idsInA = new Set(flatA.map(c => c.id))
    const idsInB = new Set(flatB.map(c => c.id))

    // Check for any overlap
    const overlap = []
    for (const id of idsInA) {
      if (idsInB.has(id)) {
        const card = flatA.find(c => c.id === id)
        overlap.push(`${card.name} (${id})`)
      }
    }

    assertEqual(overlap.length, 0,
      `Belt A and Belt B must be disjoint, but found ${overlap.length} shared cards: ${overlap.join(', ')}`)
  })

  test('Belt A filling pool has no duplicate card IDs', () => {
    const { poolA } = getCommonPools('SOR')
    const flatA = flattenPool(poolA)
    const ids = flatA.map(c => c.id)
    const uniqueIds = new Set(ids)

    const duplicates = []
    const seen = new Set()
    for (const card of flatA) {
      if (seen.has(card.id)) {
        duplicates.push(`${card.name} (${card.id})`)
      }
      seen.add(card.id)
    }

    assertEqual(duplicates.length, 0,
      `Pool A should have no duplicate IDs, but found: ${duplicates.join(', ')}`)
    assertEqual(ids.length, uniqueIds.size,
      `Pool A has ${ids.length} cards but only ${uniqueIds.size} unique IDs`)
  })

  test('Belt B filling pool has no duplicate card IDs', () => {
    const { poolB } = getCommonPools('SOR')
    const flatB = flattenPool(poolB)
    const ids = flatB.map(c => c.id)
    const uniqueIds = new Set(ids)

    const duplicates = []
    const seen = new Set()
    for (const card of flatB) {
      if (seen.has(card.id)) {
        duplicates.push(`${card.name} (${card.id})`)
      }
      seen.add(card.id)
    }

    assertEqual(duplicates.length, 0,
      `Pool B should have no duplicate IDs, but found: ${duplicates.join(', ')}`)
    assertEqual(ids.length, uniqueIds.size,
      `Pool B has ${ids.length} cards but only ${uniqueIds.size} unique IDs`)
  })

  test('Belt hopper has no close duplicates after initial fill', () => {
    const { poolA } = getCommonPools('SOR')
    const belt = new CommonBelt('SOR', poolA)

    // Check the hopper for close duplicates (within 10 positions)
    // Note: with period-3 interleave, cards from smaller aspect pools may repeat
    // in the hopper, but they should be far apart (at least pool size × 3 positions)
    const closeViolations = []
    for (let i = 0; i < belt.hopper.length; i++) {
      for (let j = i + 1; j <= Math.min(i + 10, belt.hopper.length - 1); j++) {
        if (belt.hopper[i].id === belt.hopper[j].id) {
          closeViolations.push(`${belt.hopper[i].name} at positions ${i} and ${j}`)
        }
      }
    }

    assertEqual(closeViolations.length, 0,
      `Hopper should have no duplicate IDs within 10 positions, but found: ${closeViolations.join(', ')}`)
  })

  test('Belt hopper has no close duplicates after refill', () => {
    const { poolA } = getCommonPools('SOR')
    const belt = new CommonBelt('SOR', poolA)
    const flatPoolSize = belt.flatPool.length

    // Drain to trigger refill
    while (belt.size > flatPoolSize) {
      belt.next()
    }

    // Trigger refill
    belt.next()

    // Check for close duplicates (within 10 positions) after refill
    const closeViolations = []
    for (let i = 0; i < belt.hopper.length; i++) {
      for (let j = i + 1; j <= Math.min(i + 10, belt.hopper.length - 1); j++) {
        if (belt.hopper[i].id === belt.hopper[j].id) {
          closeViolations.push(`${belt.hopper[i].name} at positions ${i} and ${j}`)
        }
      }
    }

    assertEqual(closeViolations.length, 0,
      `Hopper should have no duplicate IDs within 10 positions after refill, but found: ${closeViolations.join(', ')}`)
  })

  test('all cards in pools are commons', () => {
    const { poolA, poolB } = getCommonPools('SOR')
    const flatA = flattenPool(poolA)
    const flatB = flattenPool(poolB)
    assert(flatA.every(c => c.rarity === 'Common'), 'All Pool A cards should be Common')
    assert(flatB.every(c => c.rarity === 'Common'), 'All Pool B cards should be Common')
  })

  test('no leaders or bases in pools', () => {
    const { poolA, poolB } = getCommonPools('SOR')
    const flatA = flattenPool(poolA)
    const flatB = flattenPool(poolB)
    assert(flatA.every(c => !c.isLeader && !c.isBase), 'Pool A should not have leaders/bases')
    assert(flatB.every(c => !c.isLeader && !c.isBase), 'Pool B should not have leaders/bases')
  })

  test('CommonBelt initializes with a pool', () => {
    const { poolA } = getCommonPools('SOR')
    const belt = new CommonBelt('SOR', poolA)
    assert(belt.flatPool.length > 0, 'Flat pool should not be empty')
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
    const flatPoolSize = belt.flatPool.length

    // Drain the hopper to exactly the threshold
    while (belt.size > flatPoolSize) {
      belt.next()
    }

    // Pull one more (hopper is still at threshold, won't refill yet)
    belt.next()
    // Pull another (hopper is now below threshold, should trigger refill)
    belt.next()

    // After refill, hopper should be at least as large as flat pool (with < instead of <=, it refills to exactly flat pool size)
    assert(belt.size >= flatPoolSize, `Hopper should refill. Size: ${belt.size}, threshold: ${flatPoolSize}`)
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
    const violationDetails = []
    for (let i = 0; i < sample.length; i++) {
      for (let j = i + 1; j <= Math.min(i + 5, sample.length - 1); j++) {
        if (sample[i].id === sample[j].id) {
          violations++
          violationDetails.push(`${sample[i].name} (${sample[i].id}) at positions ${i} and ${j}`)
        }
      }
    }

    // With ~45 commons per belt, duplicates within 5 slots should be rare
    assert(violations <= 3, `Found ${violations} duplicate pairs within 5 slots (max allowed: 3): ${violationDetails.join(', ')}`)
  })

  test('seam dedup works across multiple refills', () => {
    const { poolA } = getCommonPools('SOR')
    const belt = new CommonBelt('SOR', poolA)
    const flatPoolSize = belt.flatPool.length

    // Pull enough cards to trigger multiple refills (3x flat pool size)
    const sample = []
    for (let i = 0; i < flatPoolSize * 3; i++) {
      sample.push(belt.next())
    }

    // Check for duplicates within 5 slots across the entire sequence
    let violations = 0
    const violationDetails = []
    for (let i = 0; i < sample.length; i++) {
      for (let j = i + 1; j <= Math.min(i + 5, sample.length - 1); j++) {
        if (sample[i].id === sample[j].id) {
          violations++
          violationDetails.push(`${sample[i].name} (${sample[i].id}) at positions ${i} and ${j}`)
        }
      }
    }

    assert(violations <= 10, `Found ${violations} duplicate pairs within 5 slots across multiple refills (max allowed: 10): ${violationDetails.slice(0, 5).join(', ')}${violationDetails.length > 5 ? '...' : ''}`)
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

  test('pulling 20 consecutive cards from many belts never yields duplicates', () => {
    const { poolA } = getCommonPools('SOR')
    let beltsWithDuplicates = 0
    const duplicateExamples = []

    // Test 100 different belt instances
    for (let beltNum = 0; beltNum < 100; beltNum++) {
      const belt = new CommonBelt('SOR', poolA)

      // Pull 20 consecutive cards (more than enough for a pack)
      const pulled = []
      for (let i = 0; i < 20; i++) {
        pulled.push(belt.next())
      }

      // Check for any duplicates in this sequence
      const ids = pulled.map(c => c.id)
      const uniqueIds = new Set(ids)

      if (ids.length !== uniqueIds.size) {
        beltsWithDuplicates++

        // Find which cards are duplicated
        const seen = new Set()
        for (let i = 0; i < pulled.length; i++) {
          if (seen.has(pulled[i].id)) {
            // Find where it appeared before
            const firstIndex = pulled.findIndex(c => c.id === pulled[i].id)
            duplicateExamples.push(
              `Belt ${beltNum}: ${pulled[i].name} (${pulled[i].id}) at positions ${firstIndex} and ${i} (${i - firstIndex} apart)`
            )
            if (duplicateExamples.length >= 10) break
          }
          seen.add(pulled[i].id)
        }
        if (duplicateExamples.length >= 10) break
      }
    }

    assertEqual(beltsWithDuplicates, 0,
      `Found duplicates in ${beltsWithDuplicates} out of 100 belts when pulling 20 consecutive cards. Examples:\n  ${duplicateExamples.join('\n  ')}`)
  })

  test('pulling 100 cards from a single belt never yields duplicates within 5 positions', () => {
    const { poolA } = getCommonPools('SOR')
    const belt = new CommonBelt('SOR', poolA)

    // Pull 100 cards to go through multiple refills
    const pulled = []
    for (let i = 0; i < 100; i++) {
      pulled.push(belt.next())
    }

    // Check for duplicates within 5 positions
    let violations = 0
    const violationDetails = []
    for (let i = 0; i < pulled.length; i++) {
      for (let j = i + 1; j <= Math.min(i + 5, pulled.length - 1); j++) {
        if (pulled[i].id === pulled[j].id) {
          violations++
          violationDetails.push(`${pulled[i].name} (${pulled[i].id}) at positions ${i} and ${j} (${j - i} apart)`)
        }
      }
    }

    assertEqual(violations, 0,
      `Should have no duplicates within 5 positions when pulling 100 cards, but found ${violations}:\n  ${violationDetails.slice(0, 10).join('\n  ')}`)
  })

  test('no repeating pattern: consecutive belt fills produce different sequences', () => {
    const { poolA } = getCommonPools('SOR')
    const belt = new CommonBelt('SOR', poolA)
    const fillSize = belt.flatPool.length

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
