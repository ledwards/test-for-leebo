/**
 * Draft Logic Tests
 *
 * Tests for draft pack generation, specifically the instanceId fix
 * that prevents race condition bugs with duplicate card IDs.
 *
 * Run with: node src/utils/draftLogic.test.js
 */

import { generateDraftPacks } from './draftLogic.js'
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
