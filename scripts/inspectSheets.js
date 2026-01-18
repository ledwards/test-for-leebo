#!/usr/bin/env node

import { initializeCardCache, getCachedCards } from '../src/utils/cardCache.js'
import { generateSheetsForSet } from '../src/utils/sheetGeneration.js'
import { getSetConfig } from '../src/utils/setConfigs/index.js'

// Suppress card cache initialization output
const originalLog = console.log
console.log = () => {}
await initializeCardCache()
console.log = originalLog

console.log('\n=== Inspecting R/L Sheet Composition ===\n')

const testSets = process.argv.length > 2 ? process.argv.slice(2).map(s => s.toUpperCase()) : ['SOR', 'JTL']

for (const setCode of testSets) {
  const config = getSetConfig(setCode)
  const cards = getCachedCards(setCode)
  
  // Generate sheets
  const sheets = generateSheetsForSet(cards, setCode)
  const rlSheet = sheets.rareLegendary
  
  // Count cards by rarity
  let rareCount = 0
  let legendaryCount = 0
  let blankCount = 0
  
  // Sheet.cards is a 1D array of 121 elements
  for (let i = 0; i < rlSheet.size; i++) {
    const card = rlSheet.cards[i]
    
    if (card === null || card === undefined) {
      blankCount++
    } else if (card.rarity === 'Rare') {
      rareCount++
    } else if (card.rarity === 'Legendary') {
      legendaryCount++
    }
  }
  
  const nonBlankTotal = rareCount + legendaryCount
  const legendaryRatio = nonBlankTotal > 0 ? (legendaryCount / nonBlankTotal * 100).toFixed(2) : 0
  
  console.log(`${setCode}:`)
  console.log(`  Sheet composition:`)
  console.log(`    Rares: ${rareCount}`)
  console.log(`    Legendaries: ${legendaryCount}`)
  console.log(`    Blanks: ${blankCount}`)
  console.log(`    Total: ${rareCount + legendaryCount + blankCount}`)
  console.log(`  Legendary ratio: ${legendaryRatio}% (${legendaryCount}/${nonBlankTotal})`)
  console.log(`  Expected ratio: ${(config.sheetConfig.rareLegendary.legendaryRate * 100).toFixed(2)}%`)
  console.log()
}

console.log('='.repeat(60))
console.log('✅ Sheet inspection complete')
console.log('='.repeat(60))
