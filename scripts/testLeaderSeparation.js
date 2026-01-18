/**
 * Test: Rare Leaders NOT on Rare/Legendary Sheets
 * 
 * Verifies that leaders only appear on leader sheets, not on R/L sheets.
 * Also verifies that common bases don't appear on common sheets.
 */

import { initializeCardCache, getCachedCards } from '../src/utils/cardCache.js'
import { generateSheetsForSet } from '../src/utils/sheetGeneration.js'

// Suppress noisy console output during card cache initialization
const originalLog = console.log
console.log = () => {}
await initializeCardCache()
console.log = originalLog

console.log('\n' + '='.repeat(80))
console.log('LEADER & BASE SEPARATION TEST')
console.log('Testing: Leaders only on leader sheets, bases only on bases sheets')
console.log('='.repeat(80) + '\n')

const testSets = ['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC']

for (const setCode of testSets) {
  console.log(`\n=== Testing ${setCode} ===\n`)
  
  const cards = getCachedCards(setCode)
  
  // Suppress sheet generation output
  console.log = () => {}
  const sheets = generateSheetsForSet(cards, setCode)
  console.log = originalLog
  
  let passed = true
  
  // Test 1: R/L sheet should NOT contain any leaders
  const rlSheet = sheets.rareLegendary
  let leadersOnRL = 0
  
  for (const card of rlSheet.cards) {
    if (card && card.isLeader) {
      leadersOnRL++
      if (leadersOnRL <= 3) {
        console.log(`  ❌ R/L Sheet: Found leader "${card.name}"`)
      }
    }
  }
  
  if (leadersOnRL === 0) {
    console.log(`  ✅ R/L Sheet: No leaders found (correct)`)
  } else {
    console.log(`  ❌ R/L Sheet: Found ${leadersOnRL} leaders (should be 0)`)
    passed = false
  }
  
  // Test 2: Leader sheet should ONLY contain leaders
  const leaderSheet = sheets.leader
  let nonLeadersOnLeader = 0
  let leadersOnLeader = 0
  
  for (const card of leaderSheet.cards) {
    if (card) {
      if (card.isLeader) {
        leadersOnLeader++
      } else {
        nonLeadersOnLeader++
        if (nonLeadersOnLeader <= 3) {
          console.log(`  ❌ Leader Sheet: Found non-leader "${card.name}"`)
        }
      }
    }
  }
  
  if (nonLeadersOnLeader === 0) {
    console.log(`  ✅ Leader Sheet: Only leaders found (${leadersOnLeader} cards, correct)`)
  } else {
    console.log(`  ❌ Leader Sheet: Found ${nonLeadersOnLeader} non-leaders (should be 0)`)
    passed = false
  }
  
  // Test 3: Common sheets should NOT contain bases
  const commonSheets = sheets.common.sheets || []
  let basesOnCommon = 0
  
  for (const sheet of commonSheets) {
    for (const card of sheet.cards) {
      if (card && card.isBase) {
        basesOnCommon++
        if (basesOnCommon <= 3) {
          console.log(`  ❌ Common Sheet: Found base "${card.name}"`)
        }
      }
    }
  }
  
  if (basesOnCommon === 0) {
    console.log(`  ✅ Common Sheets: No bases found (correct)`)
  } else {
    console.log(`  ❌ Common Sheets: Found ${basesOnCommon} bases (should be 0)`)
    passed = false
  }
  
  // Test 4: Bases sheet should ONLY contain bases
  const basesSheet = sheets.bases
  let nonBasesOnBases = 0
  let basesOnBases = 0
  
  for (const card of basesSheet.cards) {
    if (card) {
      if (card.isBase) {
        basesOnBases++
      } else {
        nonBasesOnBases++
        if (nonBasesOnBases <= 3) {
          console.log(`  ❌ Bases Sheet: Found non-base "${card.name}"`)
        }
      }
    }
  }
  
  if (nonBasesOnBases === 0) {
    console.log(`  ✅ Bases Sheet: Only bases found (${basesOnBases} cards, correct)`)
  } else {
    console.log(`  ❌ Bases Sheet: Found ${nonBasesOnBases} non-bases (should be 0)`)
    passed = false
  }
  
  if (passed) {
    console.log(`\n  🎉 ${setCode} PERFECT: All cards on correct sheets!`)
  } else {
    console.log(`\n  ⚠️  ${setCode} FAILED: Some cards on wrong sheets`)
  }
}

console.log('\n' + '='.repeat(80))
console.log('LEADER & BASE SEPARATION TEST COMPLETE')
console.log('='.repeat(80) + '\n')
