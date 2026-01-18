/**
 * Belt System Tests
 * 
 * Tests that belts work correctly:
 * 1. Pulling 9 cards alternating between belts gives at least 4 aspects
 * 2. Pulling 9 cards alternating between belts includes neutral/hero/villain
 * 3. Pulling 9 cards alternating between belts has ZERO duplicates
 */

import { initializeCardCache, getCachedCards } from '../src/utils/cardCache.js'
import { generateSheetsForSet } from '../src/utils/sheetGeneration.js'

// Suppress noisy console output during card cache initialization
const originalLog = console.log
console.log = () => {}
await initializeCardCache()
console.log = originalLog

console.log('\n' + '='.repeat(80))
console.log('BELT SYSTEM TESTS')
console.log('='.repeat(80) + '\n')

const testSets = ['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC']

for (const setCode of testSets) {
  console.log(`\n=== Testing ${setCode} ===\n`)
  
  const cards = getCachedCards(setCode)
  
  // Suppress sheet generation output
  console.log = () => {}
  const sheets = generateSheetsForSet(cards, setCode)
  console.log = originalLog
  
  const beltA = sheets.common.belts.beltA
  const beltB = sheets.common.belts.beltB
  
  console.log(`Belt A: ${beltA.cards.length} cards`)
  console.log(`Belt B: ${beltB.cards.length} cards`)
  
  // Run test 1000 times
  let passCount = 0
  let failAspects = 0
  let failNeutralHeroVillain = 0
  let failDuplicates = 0
  
  for (let testNum = 0; testNum < 1000; testNum++) {
    // Pick random starting positions
    let pointerA = Math.floor(Math.random() * beltA.cards.length)
    let pointerB = Math.floor(Math.random() * beltB.cards.length)
    
    // Pick random starting belt
    let useBeltA = Math.random() < 0.5
    
    // Pull 9 cards alternating
    const pulledCards = []
    for (let i = 0; i < 9; i++) {
      const belt = useBeltA ? beltA : beltB
      const pointer = useBeltA ? pointerA : pointerB
      
      const card = belt.cards[pointer % belt.cards.length]
      
      // Skip nulls
      if (card && !card.isLeader && !card.isBase) {
        pulledCards.push(card)
        
        // Advance pointer and alternate belt
        if (useBeltA) {
          pointerA++
        } else {
          pointerB++
        }
        useBeltA = !useBeltA
      } else {
        // Don't alternate if we got a null
        if (useBeltA) {
          pointerA++
        } else {
          pointerB++
        }
      }
    }
    
    // Test 1: At least 4 aspects
    const aspects = new Set()
    for (const card of pulledCards) {
      if (card.aspects && card.aspects.length > 0) {
        card.aspects.forEach(a => aspects.add(a))
      }
    }
    
    if (aspects.size < 4) {
      failAspects++
      continue
    }
    
    // Test 2: Has neutral/hero/villain
    const hasNeutral = pulledCards.some(c => 
      !c.aspects || c.aspects.length === 0 || 
      (c.aspects.length === 1 && c.aspects[0] === 'Neutral')
    )
    const hasHero = pulledCards.some(c => c.affiliation === 'Heroic')
    const hasVillain = pulledCards.some(c => c.affiliation === 'Villainous')
    
    // We need at least one of neutral/hero/villain
    if (!hasNeutral && !hasHero && !hasVillain) {
      failNeutralHeroVillain++
      continue
    }
    
    // Test 3: ZERO duplicates
    const cardNames = pulledCards.map(c => c.name)
    const uniqueNames = new Set(cardNames)
    
    if (cardNames.length !== uniqueNames.size) {
      failDuplicates++
      continue
    }
    
    passCount++
  }
  
  console.log(`\nResults (1000 tests):`)
  console.log(`  ✅ Passed: ${passCount}`)
  console.log(`  ❌ Failed (< 4 aspects): ${failAspects}`)
  console.log(`  ❌ Failed (no neutral/hero/villain): ${failNeutralHeroVillain}`)
  console.log(`  ❌ Failed (duplicates): ${failDuplicates}`)
  
  if (passCount === 1000) {
    console.log(`\n  🎉 ${setCode} PERFECT: All tests passed!`)
  } else if (failDuplicates > 0) {
    console.log(`\n  ⚠️  ${setCode} CRITICAL: Duplicates detected!`)
  } else if (passCount >= 950) {
    console.log(`\n  ✅ ${setCode} GOOD: ${(passCount/10).toFixed(1)}% pass rate`)
  } else {
    console.log(`\n  ⚠️  ${setCode} WARNING: ${(passCount/10).toFixed(1)}% pass rate`)
  }
}

console.log('\n' + '='.repeat(80))
console.log('BELT TESTS COMPLETE')
console.log('='.repeat(80) + '\n')
