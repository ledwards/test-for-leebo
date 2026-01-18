#!/usr/bin/env node

/**
 * Sheet Visualization Script
 * 
 * Generates visual representations of print sheets for inspection.
 * Creates HTML files and detailed text files in the sheets/ directory.
 * 
 * Usage:
 *   npm run visualize-sheets [SET_CODE]
 *   
 * Examples:
 *   npm run visualize-sheets SOR    # Visualize SOR sheets
 *   npm run visualize-sheets JTL    # Visualize JTL sheets
 *   npm run visualize-sheets        # Visualize all sets
 */

import { initializeCardCache, getCachedCards } from '../src/utils/cardCache.js'
import { generateCompleteSheetSet } from '../src/utils/packBuilder.js'
import { visualizeAllSheets, saveSheetHTML, saveSheetVisualization, generateMainIndex } from '../src/utils/sheetVisualization.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SETS = ['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC']

// Suppress card cache initialization output
const originalLog = console.log
console.log = () => {}
await initializeCardCache()
console.log = originalLog

async function visualizeSet(setCode) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Visualizing Sheets: ${setCode}`)
  console.log('='.repeat(60))
  
  const cards = getCachedCards(setCode)
  const sheets = generateCompleteSheetSet(cards, setCode)
  
  // Output directory
  const outputDir = path.join(process.cwd(), 'sheets')
  
  console.log(`\nGenerating visualizations...`)
  console.log(`Output directory: ${outputDir}/${setCode}/`)
  
  // Generate all visualizations
  const files = visualizeAllSheets(sheets, outputDir)
  
  console.log(`\n✅ Generated ${files.length} files:`)
  
  // Group by type
  const htmlFiles = files.filter(f => f.endsWith('.html'))
  const txtFiles = files.filter(f => f.endsWith('.txt'))
  
  console.log(`  HTML files: ${htmlFiles.length}`)
  htmlFiles.forEach(f => {
    const basename = path.basename(f)
    console.log(`    - ${basename}`)
  })
  
  console.log(`  Text files: ${txtFiles.length}`)
  txtFiles.forEach(f => {
    const basename = path.basename(f)
    console.log(`    - ${basename}`)
  })
  
  console.log(`\n📂 Open HTML files in a browser to view interactive sheets`)
  console.log(`   Example: open sheets/${setCode}/rare-legendary-base.html`)
  
  return files
}

async function main() {
  const setArg = process.argv[2]
  
  if (setArg) {
    const setCode = setArg.toUpperCase()
    if (!SETS.includes(setCode)) {
      console.error(`❌ Invalid set code: ${setArg}`)
      console.error(`Valid sets: ${SETS.join(', ')}`)
      process.exit(1)
    }
    
    await visualizeSet(setCode)
  } else {
    console.log('Visualizing all sets...\n')
    
    for (const setCode of SETS) {
      await visualizeSet(setCode)
    }
    
    // Generate main index.html after all sets are visualized
    const outputDir = path.join(process.cwd(), 'sheets')
    const mainIndexPath = await generateMainIndex(outputDir)
    console.log(`\n✅ Generated main index: ${mainIndexPath}`)
    
    console.log(`\n${'='.repeat(60)}`)
    console.log(`✅ All sets visualized`)
    console.log('='.repeat(60))
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  console.error(err.stack)
  process.exit(1)
})
