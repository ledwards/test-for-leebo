/**
 * Test: No More Than 3 Same Color in Column
 * 
 * Rule 5: In a given belt/column, we can never have a run of more than 3 
 * of the same color (aspect) in a row.
 */

import { initializeCardCache, getCachedCards } from '../src/utils/cardCache.js'
import { generateSheetsForSet } from '../src/utils/sheetGeneration.js'

// Suppress noisy console output during card cache initialization
const originalLog = console.log
console.log = () => {}
await initializeCardCache()
console.log = originalLog

console.log('\n' + '='.repeat(80))
console.log('COLUMN COLOR CONSTRAINT TEST (Rule 5)')
console.log('Testing: No more than 3 consecutive cards of same color in any column')
console.log('='.repeat(80) + '\n')

const testSets = ['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC']

// Helper to get card color/aspect
const getCardColor = (card) => {
  if (!card || !card.aspects || card.aspects.length === 0) return 'Neutral'
  return card.aspects[0] // Primary aspect
}

for (const setCode of testSets) {
  console.log(`\n=== Testing ${setCode} ===\n`)
  
  const cards = getCachedCards(setCode)
  
  // Suppress sheet generation output
  console.log = () => {}
  const sheets = generateSheetsForSet(cards, setCode)
  console.log = originalLog
  
  const commonSheets = sheets.common.sheets || []
  
  console.log(`Testing ${commonSheets.length} common sheets`)
  
  let totalColumns = 0
  let violatingColumns = 0
  const violations = []
  
  for (let sheetIdx = 0; sheetIdx < commonSheets.length; sheetIdx++) {
    const sheet = commonSheets[sheetIdx]
    
    // Check each column (11 columns per sheet)
    for (let col = 0; col < 11; col++) {
      totalColumns++
      
      // Extract column (11 cards top to bottom)
      const column = []
      for (let row = 0; row < 11; row++) {
        const position = row * 11 + col
        const card = sheet.cards[position]
        if (card) {
          column.push(card)
        }
      }
      
      // Check for runs of >3 same color
      let currentColor = null
      let currentRun = 0
      let maxRun = 0
      let maxRunColor = null
      
      for (const card of column) {
        const color = getCardColor(card)
        
        if (color === currentColor) {
          currentRun++
          if (currentRun > maxRun) {
            maxRun = currentRun
            maxRunColor = color
          }
        } else {
          currentColor = color
          currentRun = 1
        }
      }
      
      if (maxRun > 3) {
        violatingColumns++
        violations.push({
          sheet: sheetIdx + 1,
          column: col + 1,
          maxRun,
          color: maxRunColor
        })
        
        if (violations.length <= 5) {
          console.log(`  ❌ Sheet ${sheetIdx + 1}, Column ${col + 1}: ${maxRun} consecutive ${maxRunColor} cards`)
        }
      }
    }
  }
  
  console.log(`\nResults:`)
  console.log(`  Total columns tested: ${totalColumns}`)
  console.log(`  Violating columns: ${violatingColumns}`)
  
  if (violatingColumns === 0) {
    console.log(`  ✅ ${setCode} PERFECT: No columns with >3 same color in a row!`)
  } else {
    console.log(`  ⚠️  ${setCode} WARNING: ${violatingColumns} columns violate the 3-color rule`)
    console.log(`     Violation rate: ${(violatingColumns / totalColumns * 100).toFixed(1)}%`)
  }
}

console.log('\n' + '='.repeat(80))
console.log('COLUMN COLOR TEST COMPLETE')
console.log('='.repeat(80) + '\n')
