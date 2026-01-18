#!/usr/bin/env node

/**
 * Comprehensive Rarity Rate Tests
 * 
 * Tests observed vs definitional (expected) rates for ALL rarities:
 * - Common
 * - Uncommon
 * - Rare
 * - Legendary
 * - Special (sets 4-6 only)
 * - Foils (by rarity)
 * 
 * Compares observed distribution from 1000 generated packs
 * against the definitional expectations from set configurations.
 */

import { initializeCardCache, getCachedCards } from '../src/utils/cardCache.js'
import { generateBoosterPack } from '../src/utils/boosterPack.js'
import { getSetConfig } from '../src/utils/setConfigs/index.js'

// Suppress console.log from sheet generation
const originalLog = console.log
const originalError = console.error
console.log = () => {}
console.error = () => {}

await initializeCardCache()

// Restore console
console.log = originalLog
console.error = originalError

console.log('\n' + '='.repeat(80))
console.log('COMPREHENSIVE RARITY RATE TESTS')
console.log('Testing Observed vs Definitional Rates for All Rarities')
console.log('='.repeat(80) + '\n')

const testSets = [
  { code: 'SOR', group: '1-3', name: 'Spark of Rebellion' },
  { code: 'SHD', group: '1-3', name: 'Shadows of the Galaxy' },
  { code: 'TWI', group: '1-3', name: 'Twilight of the Republic' },
  { code: 'JTL', group: '4-6', name: 'Jump to Lightspeed' },
  { code: 'LOF', group: '4-6', name: 'Legends of the Force' },
  { code: 'SEC', group: '4-6', name: 'Secrets of Power' }
]

const numPacks = 1000

for (const set of testSets) {
  console.log(`${'='.repeat(80)}`)
  console.log(`${set.code} - ${set.name} (Set ${set.group})`)
  console.log(`${'='.repeat(80)}`)
  
  const config = getSetConfig(set.code)
  const cards = getCachedCards(set.code)
  const packs = []
  
  // Generate packs
  for (let i = 0; i < numPacks; i++) {
    packs.push(generateBoosterPack(cards, set.code))
  }
  
  // Count all cards by rarity
  const rarityCounts = {
    Common: { total: 0, foil: 0, hyperspace: 0, hyperspacefoil: 0 },
    Uncommon: { total: 0, foil: 0, hyperspace: 0, hyperspacefoil: 0 },
    Rare: { total: 0, foil: 0, hyperspace: 0, hyperspacefoil: 0 },
    Legendary: { total: 0, foil: 0, hyperspace: 0, hyperspacefoil: 0 },
    Special: { total: 0, foil: 0, hyperspace: 0, hyperspacefoil: 0 }
  }
  
  // Count leaders and bases separately
  let leaderCount = 0
  let baseCount = 0
  let totalCards = 0
  
  for (const pack of packs) {
    for (const card of pack) {
      totalCards++
      
      if (card.isLeader) {
        leaderCount++
      } else if (card.isBase) {
        baseCount++
      } else if (rarityCounts[card.rarity]) {
        rarityCounts[card.rarity].total++
        
        if (card.isFoil && card.isHyperspace) {
          rarityCounts[card.rarity].hyperspacefoil++
        } else if (card.isFoil) {
          rarityCounts[card.rarity].foil++
        } else if (card.isHyperspace) {
          rarityCounts[card.rarity].hyperspace++
        }
      }
    }
  }
  
  // Calculate rates per pack (cards per pack)
  console.log('\n--- OBSERVED RATES (per pack) ---')
  console.log(`Total cards: ${totalCards} (${numPacks} packs × 16 cards)`)
  console.log(`Leaders: ${leaderCount} (${(leaderCount/numPacks).toFixed(2)} per pack)`)
  console.log(`Bases: ${baseCount} (${(baseCount/numPacks).toFixed(2)} per pack)`)
  console.log()
  
  for (const [rarity, counts] of Object.entries(rarityCounts)) {
    if (counts.total === 0 && rarity !== 'Special') continue // Skip if none found
    
    const perPack = (counts.total / numPacks).toFixed(2)
    const foilRate = counts.total > 0 ? (counts.foil / counts.total * 100).toFixed(2) : '0.00'
    const hsRate = counts.total > 0 ? (counts.hyperspace / counts.total * 100).toFixed(2) : '0.00'
    
    console.log(`${rarity}:`)
    console.log(`  Total: ${counts.total} (${perPack} per pack)`)
    if (counts.foil > 0) {
      console.log(`  Foil: ${counts.foil} (${foilRate}% of ${rarity}s)`)
    }
    if (counts.hyperspace > 0) {
      console.log(`  Hyperspace: ${counts.hyperspace} (${hsRate}% of ${rarity}s)`)
    }
    if (counts.hyperspacefoil > 0) {
      console.log(`  Hyperspace Foil: ${counts.hyperspacefoil}`)
    }
  }
  
  // Definitional expectations
  console.log('\n--- DEFINITIONAL EXPECTATIONS (per pack) ---')
  console.log('Expected card counts per pack:')
  console.log('  Leaders: 1 (100%)')
  console.log('  Bases: 1 (100%)')
  console.log('  Commons: 9 (56.25%)')
  console.log('  Uncommons: 3 (18.75%)')
  console.log('  Rare/Legendary: 1 (6.25% total)')
  console.log('  Foil: 1 (6.25%, any rarity)')
  
  // R/L split from sheet configuration
  const expectedLegendaryRate = (config.sheetConfig.rareLegendary.legendaryRate * 100).toFixed(2)
  const expectedRareRate = (100 - config.sheetConfig.rareLegendary.legendaryRate * 100).toFixed(2)
  
  console.log('\n--- R/L SLOT ANALYSIS ---')
  const rlSlotTotal = rarityCounts.Rare.total + rarityCounts.Legendary.total
  const observedLegendaryRate = (rarityCounts.Legendary.total / numPacks * 100).toFixed(2)
  const observedRareRate = (rarityCounts.Rare.total / numPacks * 100).toFixed(2)
  
  console.log(`R/L slot composition:`)
  console.log(`  Rare: ${rarityCounts.Rare.total}/${rlSlotTotal} (${observedRareRate}% of packs)`)
  console.log(`  Expected Rare: ${expectedRareRate}% of packs`)
  console.log(`  Legendary: ${rarityCounts.Legendary.total}/${rlSlotTotal} (${observedLegendaryRate}% of packs)`)
  console.log(`  Expected Legendary: ${expectedLegendaryRate}% of packs`)
  
  const legendaryDiff = Math.abs(parseFloat(observedLegendaryRate) - parseFloat(expectedLegendaryRate)).toFixed(2)
  if (parseFloat(legendaryDiff) > 5) {
    console.log(`  ⚠️  Legendary rate differs by ${legendaryDiff}% from expected`)
  } else {
    console.log(`  ✅ Legendary rate within ±5% tolerance`)
  }
  
  // Special rarity (sets 4-6 only)
  if (set.group === '4-6') {
    console.log('\n--- SPECIAL RARITY (Sets 4-6) ---')
    if (rarityCounts.Special.total > 0) {
      const specialRate = (rarityCounts.Special.total / (numPacks * 16) * 100).toFixed(2)
      console.log(`  Total: ${rarityCounts.Special.total} cards`)
      console.log(`  Rate: ${specialRate}% of all cards`)
      console.log(`  Foil: ${rarityCounts.Special.foil} (${(rarityCounts.Special.foil / numPacks * 100).toFixed(2)}% of packs)`)
      console.log(`  Expected foil rate: ~1.5-2% of packs`)
      
      if (rarityCounts.Special.foil > 0) {
        console.log(`  ✅ Special foils present in sets 4-6`)
      }
    } else {
      console.log(`  ⚠️  No Special rarity cards found (expected in sets 4-6)`)
    }
  }
  
  // Foil slot analysis
  console.log('\n--- FOIL SLOT ANALYSIS ---')
  const totalFoils = Object.values(rarityCounts).reduce((sum, counts) => sum + counts.foil + counts.hyperspacefoil, 0)
  console.log(`Total foil cards: ${totalFoils} (${(totalFoils / numPacks).toFixed(2)} per pack)`)
  console.log(`Expected: 1 foil per pack (100%)`)
  
  if (Math.abs(totalFoils / numPacks - 1) > 0.05) {
    console.log(`  ⚠️  Foil rate differs from expected 1 per pack`)
  } else {
    console.log(`  ✅ Foil rate correct`)
  }
  
  // Foil distribution by rarity
  console.log('\nFoil distribution by rarity:')
  for (const [rarity, counts] of Object.entries(rarityCounts)) {
    if (counts.foil > 0 || counts.hyperspacefoil > 0) {
      const foilPct = (counts.foil / totalFoils * 100).toFixed(2)
      console.log(`  ${rarity}: ${counts.foil} (${foilPct}% of foils)`)
    }
  }
  
  console.log('\n')
}

// Overall summary
console.log('='.repeat(80))
console.log('SUMMARY')
console.log('='.repeat(80))
console.log('\n📊 Key Findings:')
console.log('\n1. LEGENDARY RATES:')
console.log('   Sets 1-3: Expected ~13.3% (1 in 7.5 packs)')
console.log('   Sets 4-6: Expected ~16.7% (1 in 6 packs)')
console.log('   → Sets 4-6 have 25% MORE legendaries')
console.log('\n2. SPECIAL RARITY:')
console.log('   Sets 1-3: Not in foil slots')
console.log('   Sets 4-6: In foil slots (~1.5-2% of packs)')
console.log('\n3. PACK STRUCTURE:')
console.log('   Every pack: 1 Leader, 1 Base, 9 Common, 3 Uncommon, 1 Rare/Legendary, 1 Foil')
console.log('   Total: 16 cards per pack')
console.log('\n4. FOIL DISTRIBUTION:')
console.log('   Foils can be any rarity (C, U, R, L, S*)')
console.log('   *Special foils only in sets 4-6')

console.log('\n' + '='.repeat(80))
console.log('✅ Rarity rate tests complete')
console.log('='.repeat(80))

process.exit(0)
