/**
 * Draft Logic Tests
 *
 * Tests for draft pack generation, specifically the instanceId fix
 * that prevents race condition bugs with duplicate card IDs.
 *
 * Run with: node src/utils/draftLogic.test.js
 */

import { generateDraftPacks, getPassDirection, getNextSeat, getLeaderPassDirection } from './draftLogic.js'
import { initializeCardCache } from './cardCache.js'

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
  console.log('\n🎲 Draft Logic Tests\n')

  // Initialize card cache first
  console.log('Initializing card cache...')
  await initializeCardCache()

  // Generate packs for testing
  console.log('Generating test packs...')
  const { packs: packs4, leaders: leaders4 } = generateDraftPacks('SOR', 4)
  const { packs: packs8 } = generateDraftPacks('SOR', 8)
  console.log('Done.\n')

  test('All pack cards have instanceId', () => {
    packs4.forEach((playerPacks, pIdx) => {
      playerPacks.forEach((pack, packIdx) => {
        pack.forEach((card, cIdx) => {
          assert(card.instanceId, `Missing instanceId: player ${pIdx}, pack ${packIdx}, card ${cIdx} (${card.name})`)
        })
      })
    })
  })

  test('All leaders have instanceId', () => {
    leaders4.forEach((playerLeaders, pIdx) => {
      playerLeaders.forEach((leader, lIdx) => {
        assert(leader.instanceId, `Missing instanceId: player ${pIdx}, leader ${lIdx} (${leader.name})`)
      })
    })
  })

  test('All instanceIds are unique across entire draft', () => {
    const allInstanceIds = new Set()
    const duplicates = []

    // Check pack cards
    packs4.forEach((playerPacks) => {
      playerPacks.forEach((pack) => {
        pack.forEach((card) => {
          if (allInstanceIds.has(card.instanceId)) {
            duplicates.push(card.instanceId)
          }
          allInstanceIds.add(card.instanceId)
        })
      })
    })

    // Check leaders
    leaders4.forEach((playerLeaders) => {
      playerLeaders.forEach((leader) => {
        if (allInstanceIds.has(leader.instanceId)) {
          duplicates.push(leader.instanceId)
        }
        allInstanceIds.add(leader.instanceId)
      })
    })

    assertEqual(duplicates.length, 0, `Found duplicate instanceIds: ${duplicates.join(', ')}`)
  })

  test('Cards with same base ID have different instanceIds (the bug fix)', () => {
    const cardsByBaseId = new Map()

    packs8.forEach((playerPacks) => {
      playerPacks.forEach((pack) => {
        pack.forEach((card) => {
          if (!cardsByBaseId.has(card.id)) cardsByBaseId.set(card.id, [])
          cardsByBaseId.get(card.id).push(card)
        })
      })
    })

    // Find cards with duplicate base IDs and verify different instanceIds
    for (const [baseId, cards] of cardsByBaseId) {
      if (cards.length > 1) {
        const instanceIds = new Set(cards.map(c => c.instanceId))
        assertEqual(
          instanceIds.size,
          cards.length,
          `Cards with base id ${baseId} have duplicate instanceIds`
        )
      }
    }
  })

  test('instanceId format is baseId_counter', () => {
    const card = packs4[0][0][0]
    assert(card.instanceId, 'Card should have instanceId')
    assert(card.instanceId.startsWith(card.id + '_'), `instanceId should start with baseId_, got: ${card.instanceId}`)
  })

  test('Pack has expected card count (14 after removing leader and base)', () => {
    packs4.forEach((playerPacks, pIdx) => {
      playerPacks.forEach((pack, packIdx) => {
        assertEqual(
          pack.length,
          14,
          `Player ${pIdx} pack ${packIdx} has ${pack.length} cards, expected 14`
        )
      })
    })
  })

  test('Each player has 3 leaders', () => {
    leaders4.forEach((playerLeaders, pIdx) => {
      assertEqual(
        playerLeaders.length,
        3,
        `Player ${pIdx} has ${playerLeaders.length} leaders, expected 3`
      )
    })
  })

  // =============================================
  // PACK PASSING DIRECTION TESTS
  // =============================================

  test('Leader draft always passes right', () => {
    // Leader draft passes right for all 3 rounds
    assertEqual(getLeaderPassDirection(1), 'right', 'Round 1 should pass right')
    assertEqual(getLeaderPassDirection(2), 'right', 'Round 2 should pass right')
    assertEqual(getLeaderPassDirection(3), 'right', 'Round 3 should pass right')
  })

  test('Pack draft passes left-right-left for packs 1-2-3', () => {
    assertEqual(getPassDirection(1), 'left', 'Pack 1 should pass left')
    assertEqual(getPassDirection(2), 'right', 'Pack 2 should pass right')
    assertEqual(getPassDirection(3), 'left', 'Pack 3 should pass left')
  })

  test('Pass LEFT means clockwise (decreasing seat numbers)', () => {
    // In an 8-player draft, pass LEFT = clockwise = decreasing seats
    // Seat 1 -> Seat 8, Seat 2 -> Seat 1, etc.
    assertEqual(getNextSeat(1, 'left', 8), 8, 'Seat 1 left should go to seat 8')
    assertEqual(getNextSeat(2, 'left', 8), 1, 'Seat 2 left should go to seat 1')
    assertEqual(getNextSeat(3, 'left', 8), 2, 'Seat 3 left should go to seat 2')
    assertEqual(getNextSeat(8, 'left', 8), 7, 'Seat 8 left should go to seat 7')
  })

  test('Pass RIGHT means counter-clockwise (increasing seat numbers)', () => {
    // In an 8-player draft, pass RIGHT = counter-clockwise = increasing seats
    // Seat 1 -> Seat 2, Seat 2 -> Seat 3, etc.
    assertEqual(getNextSeat(1, 'right', 8), 2, 'Seat 1 right should go to seat 2')
    assertEqual(getNextSeat(2, 'right', 8), 3, 'Seat 2 right should go to seat 3')
    assertEqual(getNextSeat(7, 'right', 8), 8, 'Seat 7 right should go to seat 8')
    assertEqual(getNextSeat(8, 'right', 8), 1, 'Seat 8 right should go to seat 1')
  })

  test('Pack identity is preserved through full pass cycle', () => {
    // Simulate a pack starting at seat 1 passing through all 8 players
    // After 8 passes, it should return to the original seat
    const totalSeats = 8

    // Test pass left (pack 1)
    let currentSeat = 1
    const packId = 'test-pack-seat-1'
    const visitedSeatsLeft = [currentSeat]

    for (let i = 0; i < totalSeats - 1; i++) {
      currentSeat = getNextSeat(currentSeat, 'left', totalSeats)
      visitedSeatsLeft.push(currentSeat)
    }

    // Should have visited all 8 seats exactly once
    assertEqual(visitedSeatsLeft.length, 8, 'Should visit 8 seats for left pass')
    assertEqual(new Set(visitedSeatsLeft).size, 8, 'Should visit each seat exactly once for left pass')
    // Verify the order: 1 -> 8 -> 7 -> 6 -> 5 -> 4 -> 3 -> 2
    assertEqual(visitedSeatsLeft.join(','), '1,8,7,6,5,4,3,2', 'Left pass should go 1->8->7->6->5->4->3->2')

    // Test pass right (pack 2)
    currentSeat = 1
    const visitedSeatsRight = [currentSeat]

    for (let i = 0; i < totalSeats - 1; i++) {
      currentSeat = getNextSeat(currentSeat, 'right', totalSeats)
      visitedSeatsRight.push(currentSeat)
    }

    // Should have visited all 8 seats exactly once
    assertEqual(visitedSeatsRight.length, 8, 'Should visit 8 seats for right pass')
    assertEqual(new Set(visitedSeatsRight).size, 8, 'Should visit each seat exactly once for right pass')
    // Verify the order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8
    assertEqual(visitedSeatsRight.join(','), '1,2,3,4,5,6,7,8', 'Right pass should go 1->2->3->4->5->6->7->8')
  })

  test('Pack passing with 4 players works correctly', () => {
    const totalSeats = 4

    // Pass left should go: 1 -> 4 -> 3 -> 2
    let seat = 1
    const leftPath = [seat]
    for (let i = 0; i < 3; i++) {
      seat = getNextSeat(seat, 'left', totalSeats)
      leftPath.push(seat)
    }
    assertEqual(leftPath.join(','), '1,4,3,2', '4-player left pass should go 1->4->3->2')

    // Pass right should go: 1 -> 2 -> 3 -> 4
    seat = 1
    const rightPath = [seat]
    for (let i = 0; i < 3; i++) {
      seat = getNextSeat(seat, 'right', totalSeats)
      rightPath.push(seat)
    }
    assertEqual(rightPath.join(','), '1,2,3,4', '4-player right pass should go 1->2->3->4')
  })

  test('Simulated full draft: track specific pack through all picks', () => {
    // Simulate pack 1 (passes LEFT) from seat 1 through 14 picks
    // Each pick, pack moves to next seat in pass direction
    const totalSeats = 8
    const cardsPerPack = 14 // After removing leader and base

    // Create a mock pack with known cards
    const mockPack = Array.from({ length: cardsPerPack }, (_, i) => ({
      id: `card-${i}`,
      instanceId: `card-${i}_0`,
      name: `Test Card ${i}`
    }))

    // Track which seat holds this pack after each pick
    let packAtSeat = 1
    const packLocationHistory = [packAtSeat]
    const direction = getPassDirection(1) // Pack 1 = left

    for (let pick = 1; pick < cardsPerPack; pick++) {
      // After each pick, pack moves to next seat
      packAtSeat = getNextSeat(packAtSeat, direction, totalSeats)
      packLocationHistory.push(packAtSeat)
    }

    // After 14 picks (7 passes left, looping), pack should follow this pattern:
    // Pick 1: Seat 1, Pick 2: Seat 8, Pick 3: Seat 7, ...
    // The pack completes one full cycle (8 seats) plus 6 more passes
    assertEqual(packLocationHistory.length, 14, 'Should track 14 pick locations')

    // Verify first few locations (passing left from seat 1)
    assertEqual(packLocationHistory[0], 1, 'Pick 1 at seat 1')
    assertEqual(packLocationHistory[1], 8, 'Pick 2 at seat 8')
    assertEqual(packLocationHistory[2], 7, 'Pick 3 at seat 7')
    assertEqual(packLocationHistory[7], 2, 'Pick 8 at seat 2 (completed one full cycle)')
    // After full cycle, returns near original
    assertEqual(packLocationHistory[8], 1, 'Pick 9 back at seat 1')
  })

  // Summary
  console.log('\n' + '═'.repeat(40))
  if (failed === 0) {
    console.log(`\x1b[32m✅ All ${passed} tests passed!\x1b[0m`)
  } else {
    console.log(`\x1b[31m❌ ${failed} tests failed, ${passed} passed\x1b[0m`)
    process.exit(1)
  }
  console.log('═'.repeat(40) + '\n')
}

runTests().catch(err => {
  console.error('Test setup failed:', err)
  process.exit(1)
})
