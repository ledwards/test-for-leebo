/**
 * Variant Downgrade Tests
 *
 * Tests the functionality that converts variant cards (Hyperspace, Foil, Showcase)
 * to their Normal/base equivalents for export to external tools like swudb.com.
 */

import assert from 'assert'
import { initializeCardCache, getCachedCards } from './cardCache.js'
import { buildBaseCardMap, getBaseCardId } from './variantDowngrade.js'

// Simple test framework
const results = { passed: 0, failed: 0 }

function test(name, fn) {
  try {
    fn()
    console.log(`\x1b[32m✅ ${name}\x1b[0m`)
    results.passed++
  } catch (error) {
    console.log(`\x1b[31m❌ ${name}\x1b[0m`)
    console.log(`\x1b[33m   ${error.message}\x1b[0m`)
    results.failed++
  }
}

// Initialize
console.log('\x1b[36m🔄 Initializing card cache...\x1b[0m')
await initializeCardCache()

console.log('')
console.log('\x1b[1m\x1b[35m📦 Variant Downgrade Tests\x1b[0m')
console.log('\x1b[35m==========================\x1b[0m')

// Test buildBaseCardMap
console.log('')
console.log('buildBaseCardMap Tests')
console.log('======================')

test('buildBaseCardMap returns a Map', () => {
  const map = buildBaseCardMap('SOR')
  assert(map instanceof Map, 'Should return a Map')
})

test('buildBaseCardMap only includes Normal variants', () => {
  const map = buildBaseCardMap('SOR')
  const cards = getCachedCards('SOR')

  // Check that all values in the map are Normal variants
  for (const [key, card] of map) {
    assert(
      card.variantType === 'Normal',
      `Card ${card.name} should be Normal variant, got ${card.variantType}`
    )
  }
})

test('buildBaseCardMap includes all unique name+type combinations', () => {
  const map = buildBaseCardMap('SOR')
  const cards = getCachedCards('SOR')

  // Count unique Normal cards by name+type
  const normalCards = cards.filter(c => c.variantType === 'Normal')
  const uniqueNormal = new Set(normalCards.map(c => `${c.name}|${c.type}`))

  assert(
    map.size === uniqueNormal.size,
    `Map should have ${uniqueNormal.size} entries, got ${map.size}`
  )
})

test('buildBaseCardMap handles Leaders and Units with same name separately', () => {
  const map = buildBaseCardMap('SOR')

  // Leia Organa exists as both a Leader and a Unit
  const leiaLeaderKey = 'Leia Organa|Leader'
  const leiaUnitKey = 'Leia Organa|Unit'

  const leiaLeader = map.get(leiaLeaderKey)
  const leiaUnit = map.get(leiaUnitKey)

  // At least the leader should exist
  assert(leiaLeader, 'Leia Organa Leader should exist in map')
  assert(leiaLeader.type === 'Leader', 'Leia Organa Leader should be type Leader')

  // The unit may or may not exist depending on set
  if (leiaUnit) {
    assert(leiaUnit.type === 'Unit', 'Leia Organa Unit should be type Unit')
  }
})

// Test getBaseCardId
console.log('')
console.log('getBaseCardId Tests')
console.log('===================')

test('getBaseCardId returns underscore format for Normal card', () => {
  const map = buildBaseCardMap('SOR')
  const cards = getCachedCards('SOR')

  // Find a Normal card
  const normalCard = cards.find(c => c.variantType === 'Normal' && c.cardId)
  assert(normalCard, 'Should find a Normal card')

  const baseId = getBaseCardId(normalCard, map)
  assert(baseId, 'Should return a base ID')
  assert(!baseId.includes('-'), 'Base ID should use underscores, not dashes')
  assert(baseId.includes('_'), 'Base ID should contain underscore')
})

test('getBaseCardId converts Hyperspace variant to Normal', () => {
  const map = buildBaseCardMap('SOR')
  const cards = getCachedCards('SOR')

  // Find a Hyperspace card that has a Normal variant
  const hsCard = cards.find(c =>
    c.variantType === 'Hyperspace' &&
    cards.some(n => n.name === c.name && n.type === c.type && n.variantType === 'Normal')
  )

  if (!hsCard) {
    console.log('   (No Hyperspace cards with Normal variants in SOR, skipping)')
    return
  }

  const normalCard = cards.find(c =>
    c.name === hsCard.name &&
    c.type === hsCard.type &&
    c.variantType === 'Normal'
  )

  const hsBaseId = getBaseCardId(hsCard, map)
  const normalBaseId = getBaseCardId(normalCard, map)

  assert(
    hsBaseId === normalBaseId,
    `Hyperspace "${hsCard.name}" should map to same base ID as Normal. Got "${hsBaseId}" vs "${normalBaseId}"`
  )
})

test('getBaseCardId converts Foil variant to Normal', () => {
  const map = buildBaseCardMap('SOR')
  const cards = getCachedCards('SOR')

  // Find a Foil card that has a Normal variant
  const foilCard = cards.find(c =>
    c.variantType === 'Foil' &&
    cards.some(n => n.name === c.name && n.type === c.type && n.variantType === 'Normal')
  )

  if (!foilCard) {
    console.log('   (No Foil cards with Normal variants in SOR, skipping)')
    return
  }

  const normalCard = cards.find(c =>
    c.name === foilCard.name &&
    c.type === foilCard.type &&
    c.variantType === 'Normal'
  )

  const foilBaseId = getBaseCardId(foilCard, map)
  const normalBaseId = getBaseCardId(normalCard, map)

  assert(
    foilBaseId === normalBaseId,
    `Foil "${foilCard.name}" should map to same base ID as Normal. Got "${foilBaseId}" vs "${normalBaseId}"`
  )
})

test('getBaseCardId converts Showcase variant to Normal', () => {
  const map = buildBaseCardMap('SOR')
  const cards = getCachedCards('SOR')

  // Find a Showcase card that has a Normal variant
  const showcaseCard = cards.find(c =>
    c.variantType === 'Showcase' &&
    cards.some(n => n.name === c.name && n.type === c.type && n.variantType === 'Normal')
  )

  if (!showcaseCard) {
    console.log('   (No Showcase cards with Normal variants in SOR, skipping)')
    return
  }

  const normalCard = cards.find(c =>
    c.name === showcaseCard.name &&
    c.type === showcaseCard.type &&
    c.variantType === 'Normal'
  )

  const showcaseBaseId = getBaseCardId(showcaseCard, map)
  const normalBaseId = getBaseCardId(normalCard, map)

  assert(
    showcaseBaseId === normalBaseId,
    `Showcase "${showcaseCard.name}" should map to same base ID as Normal. Got "${showcaseBaseId}" vs "${normalBaseId}"`
  )
})

test('getBaseCardId handles null card gracefully', () => {
  const map = buildBaseCardMap('SOR')
  const result = getBaseCardId(null, map)
  assert(result === null, 'Should return null for null card')
})

test('getBaseCardId handles missing map gracefully', () => {
  const cards = getCachedCards('SOR')
  const card = cards.find(c => c.variantType === 'Normal')
  const result = getBaseCardId(card, null)

  // Should still return something (fallback to card's own cardId)
  assert(result !== null, 'Should return fallback ID even without map')
})

test('getBaseCardId returns consistent IDs across all variant types of same card', () => {
  const map = buildBaseCardMap('SOR')
  const cards = getCachedCards('SOR')

  // Find a card that has multiple variants
  const cardName = 'Director Krennic'
  const variants = cards.filter(c => c.name === cardName && c.type === 'Leader')

  if (variants.length <= 1) {
    console.log(`   (Only ${variants.length} variant(s) of ${cardName} found, skipping)`)
    return
  }

  const baseIds = variants.map(v => getBaseCardId(v, map))
  const uniqueBaseIds = new Set(baseIds)

  assert(
    uniqueBaseIds.size === 1,
    `All variants of "${cardName}" should map to same base ID. Got: ${[...uniqueBaseIds].join(', ')}`
  )
})

// Integration test with real export scenario
console.log('')
console.log('Export Integration Tests')
console.log('========================')

test('exported deck IDs are all in swudb format', () => {
  const map = buildBaseCardMap('SOR')
  const cards = getCachedCards('SOR')

  // Simulate a deck with various card types
  const testDeck = [
    cards.find(c => c.variantType === 'Normal' && c.type === 'Unit'),
    cards.find(c => c.variantType === 'Hyperspace' && c.type === 'Unit'),
    cards.find(c => c.variantType === 'Foil' && c.type === 'Event'),
    cards.find(c => c.variantType === 'Normal' && c.type === 'Upgrade'),
  ].filter(Boolean)

  const exportedIds = testDeck.map(card => getBaseCardId(card, map))

  // All IDs should be in SWUDB format: SET_XXX (3-digit zero-padded)
  const validFormat = /^[A-Z]{3}_\d{3,}$/
  exportedIds.forEach((id, idx) => {
    assert(
      validFormat.test(id),
      `Card "${testDeck[idx].name}" should export as SWUDB format SET_XXX, got "${id}"`
    )
  })
})

test('Hyperspace Foil variant maps to Normal base', () => {
  const map = buildBaseCardMap('SOR')
  const cards = getCachedCards('SOR')

  // Find a Hyperspace Foil card
  const hsFoilCard = cards.find(c => c.variantType === 'Hyperspace Foil')

  if (!hsFoilCard) {
    console.log('   (No Hyperspace Foil cards in SOR, skipping)')
    return
  }

  const normalCard = cards.find(c =>
    c.name === hsFoilCard.name &&
    c.type === hsFoilCard.type &&
    c.variantType === 'Normal'
  )

  if (!normalCard) {
    console.log(`   (No Normal variant of ${hsFoilCard.name} found, skipping)`)
    return
  }

  const hsFoilBaseId = getBaseCardId(hsFoilCard, map)
  const normalBaseId = getBaseCardId(normalCard, map)

  assert(
    hsFoilBaseId === normalBaseId,
    `Hyperspace Foil "${hsFoilCard.name}" should map to same base ID as Normal`
  )
})

// Summary
console.log('')
console.log('\x1b[35m==========================\x1b[0m')
console.log(`\x1b[32m✅ Tests passed: ${results.passed}\x1b[0m`)
if (results.failed > 0) {
  console.log(`\x1b[31m❌ Tests failed: ${results.failed}\x1b[0m`)
  console.log('')
  console.log('\x1b[31m\x1b[1m💥 TESTS FAILED\x1b[0m')
  process.exit(1)
} else {
  console.log(`\x1b[90m   Tests failed: ${results.failed}\x1b[0m`)
  console.log('')
  console.log('\x1b[32m\x1b[1m🎉 ALL TESTS PASSED!\x1b[0m')
}
