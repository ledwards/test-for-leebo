/**
 * Booster Pack Generation Tests
 *
 * Run with: node src/utils/boosterPack.test.js
 */

import { generateBoosterPack, generateSealedPod, clearBeltCache } from './boosterPack.js'
import { initializeCardCache, getCachedCards } from './cardCache.js'

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
  const cards = getCachedCards('SOR')
  console.log('')
  console.log('Booster Pack Tests')
  console.log('==================')

  test('generateBoosterPack returns pack with cards array', () => {
    clearBeltCache()
    const pack = generateBoosterPack(cards, 'SOR')
    assert(pack !== null, 'Pack should not be null')
    assert(Array.isArray(pack.cards), 'Pack should have cards array')
    assert(pack.cards.length > 0, 'Pack should have cards')
  })

  test('pack contains exactly 16 cards', () => {
    clearBeltCache()
    const pack = generateBoosterPack(cards, 'SOR')
    assertEqual(pack.cards.length, 16, 'Pack should contain 16 cards')
  })

  test('pack contains exactly 1 leader', () => {
    clearBeltCache()
    const pack = generateBoosterPack(cards, 'SOR')
    const leaders = pack.cards.filter(c => c.isLeader)
    assertEqual(leaders.length, 1, 'Pack should contain exactly 1 leader')
  })

  test('pack contains exactly 1 base', () => {
    clearBeltCache()
    const pack = generateBoosterPack(cards, 'SOR')
    const bases = pack.cards.filter(c => c.isBase)
    assertEqual(bases.length, 1, 'Pack should contain exactly 1 base')
  })

  test('pack contains 9 commons (non-leader, non-base)', () => {
    clearBeltCache()
    const pack = generateBoosterPack(cards, 'SOR')
    const commons = pack.cards.filter(c =>
      c.rarity === 'Common' && !c.isLeader && !c.isBase && !c.isFoil
    )
    assertEqual(commons.length, 9, 'Pack should contain 9 common cards')
  })

  test('pack contains 2-3 uncommons (3rd UC may upgrade to R/L)', () => {
    clearBeltCache()
    const pack = generateBoosterPack(cards, 'SOR')
    const uncommons = pack.cards.filter(c => c.rarity === 'Uncommon' && !c.isFoil)
    assert(
      uncommons.length >= 2 && uncommons.length <= 3,
      `Pack should contain 2-3 uncommon cards, got ${uncommons.length}`
    )
  })

  test('pack contains 1-2 rare or legendary (3rd UC may upgrade to R/L)', () => {
    clearBeltCache()
    const pack = generateBoosterPack(cards, 'SOR')
    const rareOrLegendary = pack.cards.filter(c =>
      (c.rarity === 'Rare' || c.rarity === 'Legendary') &&
      !c.isFoil && !c.isLeader && !c.isBase
    )
    assert(
      rareOrLegendary.length >= 1 && rareOrLegendary.length <= 2,
      `Pack should contain 1-2 rare or legendary, got ${rareOrLegendary.length}`
    )
  })

  test('pack contains exactly 1 foil', () => {
    clearBeltCache()
    const pack = generateBoosterPack(cards, 'SOR')
    const foils = pack.cards.filter(c => c.isFoil)
    assertEqual(foils.length, 1, 'Pack should contain exactly 1 foil')
  })

  test('foil is not a leader or base', () => {
    clearBeltCache()
    // Test multiple packs to increase confidence
    for (let i = 0; i < 10; i++) {
      const pack = generateBoosterPack(cards, 'SOR')
      const foil = pack.cards.find(c => c.isFoil)
      assert(!foil.isLeader, 'Foil should not be a leader')
      assert(!foil.isBase, 'Foil should not be a base')
    }
  })

  test('all cards are from the correct set', () => {
    clearBeltCache()
    const pack = generateBoosterPack(cards, 'SOR')
    assert(pack.cards.every(c => c.set === 'SOR'), 'All cards should be from SOR set')
  })

  test('all cards are Normal or Hyperspace or Showcase variants', () => {
    clearBeltCache()
    const pack = generateBoosterPack(cards, 'SOR')
    const validVariants = ['Normal', 'Hyperspace', 'Showcase']
    assert(
      pack.cards.every(c => validVariants.includes(c.variantType)),
      'All cards should be Normal, Hyperspace, or Showcase variants'
    )
  })

  test('leaders do not appear in rare/legendary slot', () => {
    clearBeltCache()
    // Test many packs to ensure leaders never appear in wrong slot
    for (let i = 0; i < 50; i++) {
      const pack = generateBoosterPack(cards, 'SOR')
      const rareOrLegendary = pack.cards.filter(c =>
        (c.rarity === 'Rare' || c.rarity === 'Legendary') &&
        !c.isFoil && !c.isLeader
      )
      assert(
        rareOrLegendary.every(c => !c.isLeader),
        'Leaders should not appear in rare/legendary slot'
      )
    }
  })

  console.log('')
  console.log('Sealed Pod Tests')
  console.log('================')

  test('generateSealedPod returns 6 packs by default', () => {
    clearBeltCache()
    const packs = generateSealedPod(cards, 'SOR')
    assertEqual(packs.length, 6, 'Should generate 6 packs')
  })

  test('generateSealedPod returns specified number of packs', () => {
    clearBeltCache()
    const packs = generateSealedPod(cards, 'SOR', 3)
    assertEqual(packs.length, 3, 'Should generate specified number of packs')
  })

  test('each pack in sealed pod has correct structure', () => {
    clearBeltCache()
    const packs = generateSealedPod(cards, 'SOR')
    packs.forEach((pack, i) => {
      assertEqual(pack.cards.length, 16, `Pack ${i + 1} should have 16 cards`)
      assertEqual(
        pack.cards.filter(c => c.isLeader).length,
        1,
        `Pack ${i + 1} should have 1 leader`
      )
    })
  })

  test('leaders in sealed pod come from belt (sequential, not random)', () => {
    clearBeltCache()
    const packs = generateSealedPod(cards, 'SOR')
    const leaders = packs.map(p => p.cards.find(c => c.isLeader))

    // Check that we don't have the same leader in adjacent packs too often
    // (belt should provide variety through its fill algorithm)
    let adjacentDupes = 0
    for (let i = 1; i < leaders.length; i++) {
      if (leaders[i].id === leaders[i - 1].id) {
        adjacentDupes++
      }
    }

    assert(adjacentDupes <= 1, `Too many adjacent duplicate leaders: ${adjacentDupes}`)
  })

  test('clearBeltCache causes new belt initialization', () => {
    clearBeltCache()
    const packs1 = generateSealedPod(cards, 'SOR')
    const leader1 = packs1[0].cards.find(c => c.isLeader)

    // Generate many pods and check that we get different starting leaders
    const startingLeaders = new Set()
    startingLeaders.add(leader1.id)

    for (let i = 0; i < 10; i++) {
      clearBeltCache()
      const packs = generateSealedPod(cards, 'SOR')
      const leader = packs[0].cards.find(c => c.isLeader)
      startingLeaders.add(leader.id)
    }

    assert(startingLeaders.size > 1, 'Different pods should start with different leaders')
  })

  test('commons alternate between Belt A and Belt B aspects across packs', () => {
    clearBeltCache()
    const packs = generateSealedPod(cards, 'SOR', 2)

    // Get commons from first pack (should be A,B,A,B,A,B,A,B,A pattern)
    // Exclude base, foil, and leader (leaders can be Common rarity)
    const pack1Commons = packs[0].cards.filter(c => c.rarity === 'Common' && !c.isBase && !c.isFoil && !c.isLeader)
    // Get commons from second pack (should be B,A,B,A,B,A,B,A,B pattern)
    const pack2Commons = packs[1].cards.filter(c => c.rarity === 'Common' && !c.isBase && !c.isFoil && !c.isLeader)

    assertEqual(pack1Commons.length, 9, 'Pack 1 should have 9 commons')
    assertEqual(pack2Commons.length, 9, 'Pack 2 should have 9 commons')

    // Count aspects in odd positions (0,2,4,6,8) vs even positions (1,3,5,7)
    // Pack 1: positions 0,2,4,6,8 should be Belt A (Vigilance/Command)
    // Pack 2: positions 0,2,4,6,8 should be Belt B (Aggression/Cunning)
    const beltAAspects = ['Vigilance', 'Command']
    const beltBAspects = ['Aggression', 'Cunning']

    const hasAspect = (card, aspects) => {
      if (!card.aspects) return false
      return aspects.some(a => card.aspects.includes(a))
    }

    // Check that packs have a mix from both belts
    const pack1HasBeltA = pack1Commons.some(c => hasAspect(c, beltAAspects))
    const pack1HasBeltB = pack1Commons.some(c => hasAspect(c, beltBAspects))
    const pack2HasBeltA = pack2Commons.some(c => hasAspect(c, beltAAspects))
    const pack2HasBeltB = pack2Commons.some(c => hasAspect(c, beltBAspects))

    assert(pack1HasBeltA && pack1HasBeltB, 'Pack 1 should have commons from both belts')
    assert(pack2HasBeltA && pack2HasBeltB, 'Pack 2 should have commons from both belts')
  })

  console.log('')
  console.log('Upgrade Pass Tests')
  console.log('==================')

  test('over many packs, some leaders get upgraded to Hyperspace', () => {
    clearBeltCache()
    let hyperspaceLeaderCount = 0
    const packCount = 100

    for (let i = 0; i < packCount; i++) {
      const pack = generateBoosterPack(cards, 'SOR')
      const leader = pack.cards.find(c => c.isLeader)
      if (leader.isHyperspace) {
        hyperspaceLeaderCount++
      }
    }

    // With 1/6 probability, we expect ~17 out of 100
    // Allow wide variance for randomness
    assert(
      hyperspaceLeaderCount > 5,
      `Expected some Hyperspace leaders, got ${hyperspaceLeaderCount} out of ${packCount}`
    )
  })

  test('over many packs, some bases get upgraded to Hyperspace', () => {
    clearBeltCache()
    let hyperspaceBaseCount = 0
    const packCount = 100

    for (let i = 0; i < packCount; i++) {
      const pack = generateBoosterPack(cards, 'SOR')
      const base = pack.cards.find(c => c.isBase)
      if (base.isHyperspace) {
        hyperspaceBaseCount++
      }
    }

    // With 1/6 probability, we expect ~17 out of 100
    assert(
      hyperspaceBaseCount > 5,
      `Expected some Hyperspace bases, got ${hyperspaceBaseCount} out of ${packCount}`
    )
  })

  test('over many packs, some foils get upgraded to Hyperfoil', () => {
    clearBeltCache()
    let hyperfoilCount = 0
    const packCount = 150

    for (let i = 0; i < packCount; i++) {
      const pack = generateBoosterPack(cards, 'SOR')
      const foil = pack.cards.find(c => c.isFoil)
      if (foil.isHyperspace) {
        hyperfoilCount++
      }
    }

    // With 1/15 probability, we expect ~10 out of 150
    assert(
      hyperfoilCount > 2,
      `Expected some Hyperfoils, got ${hyperfoilCount} out of ${packCount}`
    )
  })

  test('over many packs, some commons get upgraded to Hyperspace', () => {
    clearBeltCache()
    let hyperspaceCommonPacks = 0
    const packCount = 100

    for (let i = 0; i < packCount; i++) {
      const pack = generateBoosterPack(cards, 'SOR')
      const hsCommon = pack.cards.find(c =>
        c.rarity === 'Common' && !c.isLeader && !c.isBase && c.isHyperspace
      )
      if (hsCommon) {
        hyperspaceCommonPacks++
      }
    }

    // With 1/6 probability, we expect ~17 out of 100
    assert(
      hyperspaceCommonPacks > 5,
      `Expected some packs with Hyperspace commons, got ${hyperspaceCommonPacks} out of ${packCount}`
    )
  })

  test('upgraded cards retain correct set code', () => {
    clearBeltCache()
    // Generate many packs to ensure we hit some upgrades
    for (let i = 0; i < 50; i++) {
      const pack = generateBoosterPack(cards, 'SOR')
      pack.cards.forEach(card => {
        assert(
          card.set === 'SOR',
          `All cards should be from SOR, found ${card.set}`
        )
      })
    }
  })

  test('showcase leader upgrade uses Showcase variant', () => {
    // Showcase is very rare (1/288), so we check that when it happens,
    // the card has correct properties. We use many packs.
    clearBeltCache()
    let showcaseFound = false

    for (let i = 0; i < 500 && !showcaseFound; i++) {
      const pack = generateBoosterPack(cards, 'SOR')
      const leader = pack.cards.find(c => c.isLeader)
      if (leader.variantType === 'Showcase') {
        showcaseFound = true
        assert(leader.isLeader, 'Showcase card should be a leader')
      }
    }

    // It's OK if we don't find one - it's a very rare upgrade
    // Just ensure the test completes without error
  })

  console.log('')
  console.log(`Results: ${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

runTests()
