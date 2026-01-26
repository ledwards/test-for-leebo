/**
 * Bot Behavior Tests
 *
 * Tests for the bot behavior system.
 * Run with: node src/bots/behaviors/behaviors.test.js
 */

import { getBehavior, behaviors, DEFAULT_BEHAVIOR } from './index.js'
import { RandomBehavior } from './RandomBehavior.js'
import { PopularLeaderBehavior } from './PopularLeaderBehavior.js'

// Test utilities
let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`\x1b[32m✅ ${name}\x1b[0m`)
    passed++
  } catch (e) {
    console.log(`\x1b[31m❌ ${name}\x1b[0m`)
    console.log(`   ${e.message}`)
    failed++
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed')
}

// Mock data
const mockLeadersSOR = [
  { id: 'SOR-014', name: 'Sabine Wren', set: 'SOR', aspects: ['Aggression', 'Heroism'] },
  { id: 'SOR-015', name: 'Boba Fett', set: 'SOR', aspects: ['Cunning', 'Villainy'] },
  { id: 'SOR-017', name: 'Han Solo', set: 'SOR', aspects: ['Cunning', 'Heroism'] },
  { id: 'SOR-007', name: 'Grand Moff Tarkin', set: 'SOR', aspects: ['Command', 'Villainy'] },
]

const mockPack = [
  { id: 'SOR-100', name: 'Stormtrooper', type: 'Unit', rarity: 'Common', aspects: ['Villainy'], cost: 2, power: 2, hp: 2 },
  { id: 'SOR-101', name: 'Vanquish', type: 'Event', rarity: 'Rare', aspects: ['Aggression'], cost: 5 },
  { id: 'SOR-102', name: 'Wing Leader', type: 'Unit', rarity: 'Uncommon', aspects: ['Aggression', 'Heroism'], cost: 3, power: 3, hp: 3 },
  { id: 'SOR-103', name: 'Random Event', type: 'Event', rarity: 'Common', aspects: ['Cunning'], cost: 2 },
  { id: 'SOR-104', name: 'Neutral Unit', type: 'Unit', rarity: 'Common', aspects: [], cost: 2, power: 2, hp: 2 },
]

console.log('\n\x1b[1m\x1b[35m🤖 Bot Behavior Tests\x1b[0m')
console.log('\x1b[35m======================\x1b[0m\n')

// Behavior Registry Tests
console.log('\x1b[36mBehavior Registry\x1b[0m')
test('getBehavior returns default behavior', () => {
  const behavior = getBehavior()
  assert(behavior !== null, 'Behavior should not be null')
  assert(behavior.name === DEFAULT_BEHAVIOR, `Should return ${DEFAULT_BEHAVIOR}`)
})

test('getBehavior returns random behavior by name', () => {
  const behavior = getBehavior('random')
  assert(behavior instanceof RandomBehavior, 'Should be RandomBehavior')
  assert(behavior.name === 'random', 'Name should be random')
})

test('getBehavior returns popularLeader behavior by name', () => {
  const behavior = getBehavior('popularLeader')
  assert(behavior instanceof PopularLeaderBehavior, 'Should be PopularLeaderBehavior')
  assert(behavior.name === 'popularLeader', 'Name should be popularLeader')
})

test('getBehavior falls back to random for unknown behavior', () => {
  const behavior = getBehavior('nonexistent')
  assert(behavior instanceof RandomBehavior, 'Should fall back to RandomBehavior')
})

// Random Behavior Tests
console.log('\n\x1b[36mRandom Behavior\x1b[0m')
test('RandomBehavior.selectLeader picks from available leaders', () => {
  const behavior = new RandomBehavior()
  const leader = behavior.selectLeader(mockLeadersSOR)
  assert(leader !== null, 'Should return a leader')
  assert(mockLeadersSOR.some(l => l.id === leader.id), 'Should be from available leaders')
})

test('RandomBehavior.selectCard prefers higher rarity', () => {
  const behavior = new RandomBehavior()
  const card = behavior.selectCard(mockPack)
  assert(card !== null, 'Should return a card')
  assert(card.rarity === 'Rare', 'Should pick the rare card (Vanquish)')
})

test('RandomBehavior handles empty arrays', () => {
  const behavior = new RandomBehavior()
  assert(behavior.selectLeader([]) === null, 'Empty leaders should return null')
  assert(behavior.selectCard([]) === null, 'Empty pack should return null')
})

// Popular Leader Behavior Tests
console.log('\n\x1b[36mPopular Leader Behavior\x1b[0m')
test('PopularLeaderBehavior.selectLeader picks highest ranked leader', () => {
  const behavior = new PopularLeaderBehavior()
  const leader = behavior.selectLeader(mockLeadersSOR, { setCode: 'SOR' })
  assert(leader !== null, 'Should return a leader')
  // Sabine Wren should be #1 for SOR
  assert(leader.name === 'Sabine Wren', `Should pick Sabine Wren (got ${leader.name})`)
})

test('PopularLeaderBehavior.selectLeader picks from remaining if top not available', () => {
  const behavior = new PopularLeaderBehavior()
  const limitedLeaders = mockLeadersSOR.filter(l => l.name !== 'Sabine Wren')
  const leader = behavior.selectLeader(limitedLeaders, { setCode: 'SOR' })
  assert(leader !== null, 'Should return a leader')
  // Boba Fett should be #2 for SOR
  assert(leader.name === 'Boba Fett', `Should pick Boba Fett (got ${leader.name})`)
})

test('PopularLeaderBehavior.selectCard favors in-color units', () => {
  const behavior = new PopularLeaderBehavior()
  // Give the bot Sabine (Aggression/Heroism)
  const context = {
    draftedLeaders: [{ name: 'Sabine Wren', aspects: ['Aggression', 'Heroism'] }],
    setCode: 'SOR'
  }
  const card = behavior.selectCard(mockPack, context)
  assert(card !== null, 'Should return a card')
  // Should pick Wing Leader (Uncommon, Aggression/Heroism unit, dual-aspect)
  // or Vanquish (Rare, Aggression, high-value) - both are good picks
  assert(
    card.name === 'Wing Leader' || card.name === 'Vanquish',
    `Should pick in-color card (got ${card.name})`
  )
})

test('PopularLeaderBehavior.selectCard prefers units over non-units', () => {
  const behavior = new PopularLeaderBehavior()
  // Create a pack with same rarity unit vs event
  const testPack = [
    { id: '1', name: 'Unit Card', type: 'Unit', rarity: 'Common', aspects: ['Aggression'], cost: 2, power: 2, hp: 2 },
    { id: '2', name: 'Event Card', type: 'Event', rarity: 'Common', aspects: ['Aggression'], cost: 2 },
  ]
  const context = {
    draftedLeaders: [{ name: 'Sabine Wren', aspects: ['Aggression', 'Heroism'] }],
    setCode: 'SOR'
  }
  const card = behavior.selectCard(testPack, context)
  assert(card.type === 'Unit', `Should prefer unit (got ${card.type})`)
})

test('PopularLeaderBehavior.selectCard gives bonus to dual-aspect cards', () => {
  const behavior = new PopularLeaderBehavior()
  // Create a pack with single vs dual aspect
  const testPack = [
    { id: '1', name: 'Single Aspect', type: 'Unit', rarity: 'Common', aspects: ['Aggression'], cost: 2, power: 2, hp: 2 },
    { id: '2', name: 'Dual Aspect', type: 'Unit', rarity: 'Common', aspects: ['Aggression', 'Heroism'], cost: 2, power: 2, hp: 2 },
  ]
  const context = {
    draftedLeaders: [{ name: 'Sabine Wren', aspects: ['Aggression', 'Heroism'] }],
    setCode: 'SOR'
  }
  const card = behavior.selectCard(testPack, context)
  assert(card.name === 'Dual Aspect', `Should prefer dual-aspect (got ${card.name})`)
})

test('PopularLeaderBehavior handles empty arrays', () => {
  const behavior = new PopularLeaderBehavior()
  assert(behavior.selectLeader([]) === null, 'Empty leaders should return null')
  assert(behavior.selectCard([]) === null, 'Empty pack should return null')
})

test('PopularLeaderBehavior can reset state', () => {
  const behavior = new PopularLeaderBehavior()
  behavior.secondaryColor = 'Command'
  behavior.reset()
  assert(behavior.secondaryColor === null, 'Reset should clear secondary color')
})

// Summary
console.log('\n\x1b[35m======================\x1b[0m')
console.log(`\x1b[32m✅ Tests passed: ${passed}\x1b[0m`)
if (failed > 0) {
  console.log(`\x1b[31m❌ Tests failed: ${failed}\x1b[0m`)
}
console.log('')

if (failed > 0) {
  console.log('\x1b[31m\x1b[1m💥 TESTS FAILED\x1b[0m\n')
  process.exit(1)
} else {
  console.log('\x1b[32m\x1b[1m🎉 ALL TESTS PASSED!\x1b[0m\n')
}
