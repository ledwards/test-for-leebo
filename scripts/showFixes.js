#!/usr/bin/env node
/**
 * Show Fixes Utility
 *
 * Displays detailed information about card fixes that will be or have been applied.
 * Useful for debugging and verifying your fix definitions.
 *
 * Usage:
 *   node scripts/showFixes.js              # Show all configured fixes
 *   node scripts/showFixes.js --applied    # Show fixes from last post-processing
 *   node scripts/showFixes.js --card SOR-324  # Show fixes for specific card
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { cardFixes, batchFixes, customTransforms } from './cardFixes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const args = process.argv.slice(2)
const showApplied = args.includes('--applied')
const cardIdIndex = args.indexOf('--card')
const specificCardId = cardIdIndex !== -1 ? args[cardIdIndex + 1] : null

console.log('═'.repeat(70))
console.log('Card Fixes Summary')
console.log('═'.repeat(70))

/**
 * Show configured fixes
 */
function showConfiguredFixes() {
  console.log('\n📋 INDIVIDUAL FIXES')
  console.log('─'.repeat(70))

  if (cardFixes.length === 0) {
    console.log('  No individual fixes configured')
  } else {
    cardFixes.forEach((fix, index) => {
      console.log(`\n  ${index + 1}. Card: ${fix.id}`)
      console.log(`     Field: ${fix.field}`)
      console.log(`     Value: ${JSON.stringify(fix.value)}`)
      console.log(`     Reason: ${fix.reason}`)
    })
  }

  console.log('\n\n🔄 BATCH FIXES')
  console.log('─'.repeat(70))

  if (batchFixes.length === 0) {
    console.log('  No batch fixes configured')
  } else {
    batchFixes.forEach((fix, index) => {
      console.log(`\n  ${index + 1}. Field: ${fix.field}`)
      console.log(`     Value: ${JSON.stringify(fix.value)}`)
      console.log(`     Condition: ${fix.condition.toString().substring(0, 100)}...`)
      console.log(`     Reason: ${fix.reason}`)
    })
  }

  console.log('\n\n⚙️  CUSTOM TRANSFORMS')
  console.log('─'.repeat(70))

  if (customTransforms.length === 0) {
    console.log('  No custom transforms configured')
  } else {
    customTransforms.forEach((transform, index) => {
      console.log(`\n  ${index + 1}. Name: ${transform.name}`)
      console.log(`     Function: ${transform.transform.toString().substring(0, 150)}...`)
    })
  }

  console.log('\n\n📊 SUMMARY')
  console.log('─'.repeat(70))
  console.log(`  Individual Fixes:   ${cardFixes.length}`)
  console.log(`  Batch Fixes:        ${batchFixes.length}`)
  console.log(`  Custom Transforms:  ${customTransforms.length}`)
  console.log(`  Total:              ${cardFixes.length + batchFixes.length + customTransforms.length}`)
}

/**
 * Show applied fixes from report
 */
function showAppliedFixes() {
  const reportPath = path.join(__dirname, '../src/data/card-fixes-report.json')

  if (!fs.existsSync(reportPath)) {
    console.log('\n⚠️  No fix report found.')
    console.log('   Run "npm run fetch-cards" to generate a report.')
    return
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))

  console.log(`\n📅 Last Processed: ${report.timestamp}`)
  console.log(`   Total Fixes Applied: ${report.totalFixes}`)
  console.log(`   By Type:`)
  console.log(`     - Individual: ${report.byType.individual}`)
  console.log(`     - Batch:      ${report.byType.batch}`)
  console.log(`     - Custom:     ${report.byType.custom}`)

  if (Object.keys(report.byField).length > 0) {
    console.log(`   By Field:`)
    Object.entries(report.byField)
      .sort((a, b) => b[1] - a[1])
      .forEach(([field, count]) => {
        console.log(`     - ${field}: ${count}`)
      })
  }

  // Show sample fixes
  if (report.fixes.length > 0) {
    console.log('\n\n🔍 SAMPLE FIXES (first 10)')
    console.log('─'.repeat(70))

    report.fixes.slice(0, 10).forEach((fix, index) => {
      console.log(`\n  ${index + 1}. [${fix.type.toUpperCase()}] ${fix.cardId} - ${fix.cardName}`)
      if (fix.field) {
        console.log(`     ${fix.field}: ${JSON.stringify(fix.oldValue)} → ${JSON.stringify(fix.newValue)}`)
      }
      if (fix.reason) {
        console.log(`     Reason: ${fix.reason}`)
      }
      if (fix.transform) {
        console.log(`     Transform: ${fix.transform}`)
      }
    })

    if (report.fixes.length > 10) {
      console.log(`\n  ... and ${report.fixes.length - 10} more fixes`)
    }
  }
}

/**
 * Show fixes for specific card
 */
function showFixesForCard(cardId) {
  console.log(`\n🎯 Fixes for card: ${cardId}`)
  console.log('─'.repeat(70))

  // Check individual fixes
  const individualFix = cardFixes.find(f => f.id === cardId)
  if (individualFix) {
    console.log('\n  ✓ INDIVIDUAL FIX:')
    console.log(`    Field: ${individualFix.field}`)
    console.log(`    Value: ${JSON.stringify(individualFix.value)}`)
    console.log(`    Reason: ${individualFix.reason}`)
  }

  // Check if card data exists
  const cardsPath = path.join(__dirname, '../src/data/cards.json')
  if (!fs.existsSync(cardsPath)) {
    console.log('\n  ⚠️  Card data not found. Cannot check batch fixes.')
    return
  }

  const cardData = JSON.parse(fs.readFileSync(cardsPath, 'utf8'))
  const card = cardData.cards.find(c => c.id === cardId)

  if (!card) {
    console.log(`\n  ⚠️  Card ${cardId} not found in data`)
    return
  }

  console.log('\n  📄 CARD DATA:')
  console.log(`    Name: ${card.name}`)
  console.log(`    Type: ${card.type}`)
  console.log(`    Set: ${card.set}`)
  console.log(`    Variant: ${card.variantType}`)

  // Check batch fixes
  console.log('\n  🔍 BATCH FIX CHECKS:')
  let batchFixCount = 0

  batchFixes.forEach((batchFix, index) => {
    if (batchFix.condition(card)) {
      batchFixCount++
      console.log(`\n    ✓ Batch Fix #${index + 1} applies:`)
      console.log(`      Field: ${batchFix.field}`)
      console.log(`      Value: ${JSON.stringify(batchFix.value)}`)
      console.log(`      Reason: ${batchFix.reason}`)
    }
  })

  if (batchFixCount === 0) {
    console.log('    No batch fixes apply to this card')
  }

  // Check custom transforms
  if (customTransforms.length > 0) {
    console.log('\n  ⚙️  CUSTOM TRANSFORMS:')
    console.log(`    ${customTransforms.length} transform(s) will be applied`)
    customTransforms.forEach(t => {
      console.log(`      - ${t.name}`)
    })
  }
}

/**
 * Main
 */
function main() {
  if (specificCardId) {
    showFixesForCard(specificCardId)
  } else if (showApplied) {
    showAppliedFixes()
  } else {
    showConfiguredFixes()
  }

  console.log('\n' + '═'.repeat(70))
  console.log('\n💡 TIPS:')
  console.log('   • Run "node scripts/showFixes.js --applied" to see last applied fixes')
  console.log('   • Run "node scripts/showFixes.js --card SOR-324" to check specific card')
  console.log('   • Run "npm run fetch-cards" to fetch data and apply all fixes')
  console.log('   • Run "npm run test:fixes" to test the fix system')
  console.log('═'.repeat(70) + '\n')
}

main()
