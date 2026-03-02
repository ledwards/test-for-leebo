// @ts-nocheck
/**
 * CarbonitePrestigeBelt Tests
 *
 * Run with: node src/belts/CarbonitePrestigeBelt.test.ts
 */

import { CarbonitePrestigeBelt } from './CarbonitePrestigeBelt'
import { initializeCardCache } from '../utils/cardCache'

let passed = 0
let failed = 0

function test(name: string, fn: () => void): void {
  try {
    fn()
    console.log(`\x1b[32m✅ ${name}\x1b[0m`)
    passed++
  } catch (e) {
    console.log(`\x1b[31m❌ ${name}\x1b[0m`)
    console.log(`\x1b[33m   ${(e as Error).message}\x1b[0m`)
    failed++
  }
}

function assert(condition: boolean, message?: string): asserts condition {
  if (!condition) throw new Error(message || 'Assertion failed')
}

async function runTests(): Promise<void> {
  console.log('\x1b[36m🔄 Initializing card cache...\x1b[0m')
  await initializeCardCache()
  console.log('')
  console.log('\x1b[1m\x1b[35m🏆 CarbonitePrestigeBelt Tests\x1b[0m')
  console.log('\x1b[35m' + '='.repeat(40) + '\x1b[0m')

  test('initializes with R/L/Special Normal variant cards', () => {
    const belt = new CarbonitePrestigeBelt('JTL')
    assert(belt.fillingPool.length > 0, 'Filling pool should not be empty')
    assert(belt.fillingPool.every(c =>
      c.rarity === 'Rare' || c.rarity === 'Legendary' || c.rarity === 'Special'
    ), 'Pool should only contain Rare, Legendary, or Special cards')
    assert(belt.fillingPool.every(c => !c.isLeader), 'No leaders in filling pool')
    assert(belt.fillingPool.every(c => !c.isBase), 'No bases in filling pool')
  })

  test('next() returns a Prestige variant card', () => {
    const belt = new CarbonitePrestigeBelt('JTL')
    const card = belt.next()
    assert(card !== null, 'next() should return a card')
    assert(card.variantType === 'Prestige', `variantType should be Prestige, got ${card.variantType}`)
    assert(card.isPrestige === true, 'Card should have isPrestige flag')
    assert(
      card.prestigeTier === 'tier1' || card.prestigeTier === 'tier2' || card.prestigeTier === 'serialized',
      `prestigeTier should be valid, got ${card.prestigeTier}`
    )
  })

  test('all cards have Prestige variantType', () => {
    const belt = new CarbonitePrestigeBelt('JTL')
    for (let i = 0; i < 50; i++) {
      const card = belt.next()
      assert(card !== null, `Card ${i} should not be null`)
      assert(card.variantType === 'Prestige', `Card ${i} should be Prestige variant`)
      assert(card.isPrestige === true, `Card ${i} should have isPrestige flag`)
    }
  })

  test('prestige tier distribution matches weights over many draws', () => {
    // SPEC: tier1 80%, tier2 18%, serialized 2%
    const belt = new CarbonitePrestigeBelt('JTL')
    const counts = { tier1: 0, tier2: 0, serialized: 0 }
    const sampleSize = 2000
    for (let i = 0; i < sampleSize; i++) {
      const card = belt.next()
      counts[card.prestigeTier] = (counts[card.prestigeTier] || 0) + 1
    }

    const total = counts.tier1 + counts.tier2 + counts.serialized
    const tier1Pct = (counts.tier1 / total) * 100
    const tier2Pct = (counts.tier2 / total) * 100
    const serializedPct = (counts.serialized / total) * 100

    // tier1 ~80%, allow ±10%
    assert(tier1Pct > 65 && tier1Pct < 92,
      `Tier1 should be ~80%, got ${tier1Pct.toFixed(1)}%`)
    // tier2 ~18%, allow ±8%
    assert(tier2Pct > 8 && tier2Pct < 28,
      `Tier2 should be ~18%, got ${tier2Pct.toFixed(1)}%`)
    // serialized ~2%, allow generous tolerance for small count
    assert(serializedPct < 8,
      `Serialized should be ~2%, got ${serializedPct.toFixed(1)}%`)
    assert(counts.serialized > 0,
      `Should have at least 1 serialized in ${sampleSize} draws`)
  })

  test('works for all supported Carbonite sets', () => {
    for (const setCode of ['JTL', 'LOF', 'SEC', 'LAW']) {
      const belt = new CarbonitePrestigeBelt(setCode)
      assert(belt.fillingPool.length > 0, `${setCode} should have cards in pool`)
      const card = belt.next()
      assert(card !== null, `${setCode} should return a card`)
      assert(card.variantType === 'Prestige', `${setCode} card should be Prestige`)
    }
  })

  test('hopper refills when depleted', () => {
    const belt = new CarbonitePrestigeBelt('JTL')
    for (let i = 0; i < 200; i++) {
      const card = belt.next()
      assert(card !== null, `Draw ${i} should not be null`)
    }
    assert(belt.size > 0, 'Hopper should have refilled')
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
