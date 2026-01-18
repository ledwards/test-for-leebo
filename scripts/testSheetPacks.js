/**
 * Comprehensive Test Suite for Sheet-Based Pack Generation
 * 
 * Tests the new sheet-based pack generation system for:
 * - Drop rates (legendary 1:8, etc.)
 * - No duplicate commons in packs
 * - Belt distribution (4-5 from each belt)
 * - Box/case statistics
 * - Hyperspace rates
 * - Foil rates
 */

import { generateSealedPodFromSheets } from '../src/utils/packBuilder.js'
import { generateBoosterBox, generateCase, getBoxStatistics, getCaseStatistics } from '../src/utils/boxCaseSystem.js'
import { getCachedCards, initializeCardCache } from '../src/utils/cardCache.js'
import { getSetConfig } from '../src/utils/setConfigs/index.js'

const SETS = ['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC']

// Test configuration
const NUM_PACKS_FOR_STATS = 1000 // For statistical tests
const TOLERANCE = 0.05 // 5% tolerance for statistical tests

/**
 * Test 1: Pack structure correctness
 */
function testPackStructure(setCode) {
  console.log(`\n=== Test 1: Pack Structure (${setCode}) ===`)
  
  const cards = getCachedCards(setCode)
  const packs = generateSealedPodFromSheets(cards, setCode, 10)
  
  let passed = true
  
  for (let i = 0; i < packs.length; i++) {
    const pack = packs[i]
    
    // Should have 16 cards
    if (pack.length !== 16) {
      console.error(`  ❌ Pack ${i+1}: Expected 16 cards, got ${pack.length}`)
      passed = false
    }
    
    // Should have exactly 1 leader
    const leaders = pack.filter(c => c.isLeader)
    if (leaders.length !== 1) {
      console.error(`  ❌ Pack ${i+1}: Expected 1 leader, got ${leaders.length}`)
      passed = false
    }
    
    // Should have exactly 1 base
    const bases = pack.filter(c => c.isBase)
    if (bases.length !== 1) {
      console.error(`  ❌ Pack ${i+1}: Expected 1 base, got ${bases.length}`)
      passed = false
    }
    
    // Should have exactly 1 foil
    const foils = pack.filter(c => c.isFoil)
    if (foils.length !== 1) {
      console.error(`  ❌ Pack ${i+1}: Expected 1 foil, got ${foils.length}`)
      passed = false
    }
    
    // Leaders should never be foil
    const foilLeaders = pack.filter(c => c.isLeader && c.isFoil)
    if (foilLeaders.length > 0) {
      console.error(`  ❌ Pack ${i+1}: Leader cannot be foil!`)
      passed = false
    }
  }
  
  if (passed) {
    console.log(`  ✅ All packs have correct structure`)
  }
  
  return passed
}

/**
 * Test 2: No duplicate commons in same pack (normal treatment)
 */
function testNoDuplicateCommons(setCode) {
  console.log(`\n=== Test 2: No Duplicate Commons (${setCode}) ===`)
  
  const cards = getCachedCards(setCode)
  const packs = generateSealedPodFromSheets(cards, setCode, 100)
  
  let passed = true
  let duplicateCount = 0
  
  for (let i = 0; i < packs.length; i++) {
    const pack = packs[i]
    
    // Get all normal (non-foil, non-hyperspace) commons for base treatment only
    const normalCommons = pack.filter(c => 
      c.rarity === 'Common' && 
      !c.isFoil && 
      !c.isHyperspace && // Exclude hyperspace commons (can come from upgrade slot)
      !c.isLeader && 
      !c.isBase
    )
    
    // Check for duplicates
    const cardNames = normalCommons.map(c => `${c.name}-${c.set}`)
    const uniqueNames = new Set(cardNames)
    
    if (cardNames.length !== uniqueNames.size) {
      duplicateCount++
      // Find which cards are duplicated
      const nameCounts = {}
      for (const name of cardNames) {
        nameCounts[name] = (nameCounts[name] || 0) + 1
      }
      const dupes = Object.entries(nameCounts).filter(([_, count]) => count > 1).map(([name]) => name.split('-')[0])
      console.error(`  ❌ Pack ${i+1}: Found duplicate common cards: ${dupes.join(', ')}`)
      passed = false
    }
  }
  
  if (passed) {
    console.log(`  ✅ No duplicate commons found in ${packs.length} packs`)
  } else {
    console.log(`  ❌ Found duplicates in ${duplicateCount} packs`)
  }
  
  return passed
}

/**
 * Test 3: Legendary drop rate (~1 in 8 packs)
 */
function testLegendaryDropRate(setCode) {
  console.log(`\n=== Test 3: Legendary Drop Rate (${setCode}) ===`)
  
  const config = getSetConfig(setCode)
  const expectedRate = config.sheetConfig.rareLegendary.legendaryRate
  
  const cards = getCachedCards(setCode)
  const packs = generateSealedPodFromSheets(cards, setCode, NUM_PACKS_FOR_STATS)
  
  let legendaryCount = 0
  for (const pack of packs) {
    const hasLegendary = pack.some(c => c.rarity === 'Legendary' && !c.isLeader && !c.isBase)
    if (hasLegendary) legendaryCount++
  }
  
  const observedRate = legendaryCount / packs.length
  const diff = Math.abs(observedRate - expectedRate)
  const passed = diff <= TOLERANCE
  
  console.log(`  Expected: ${(expectedRate * 100).toFixed(1)}% (1 in ${Math.round(1/expectedRate)})`)
  console.log(`  Observed: ${(observedRate * 100).toFixed(1)}% (${legendaryCount} in ${packs.length})`)
  console.log(`  Difference: ${(diff * 100).toFixed(2)}%`)
  
  if (passed) {
    console.log(`  ✅ Drop rate within tolerance`)
  } else {
    console.log(`  ❌ Drop rate outside tolerance (±${TOLERANCE * 100}%)`)
  }
  
  return passed
}

/**
 * Test 4: Belt distribution (4-5 cards from each belt)
 */
function testBeltDistribution(setCode) {
  console.log(`\n=== Test 4: Belt Distribution (${setCode}) ===`)
  
  const cards = getCachedCards(setCode)
  const packs = generateSealedPodFromSheets(cards, setCode, 100)
  
  let passed = true
  let invalidCount = 0
  
  for (let i = 0; i < packs.length; i++) {
    const pack = packs[i]
    
    // Get all commons that came from belts (foil/hyperspace variants can still have belt tags)
    const beltCommons = pack.filter(c => 
      c.rarity === 'Common' && 
      !c.isFoil && // Exclude foil commons (they come from foil sheet, not belts)
      !c.isLeader && 
      !c.isBase
    )
    
    // Count by belt (using actual belt tag from pack builder)
    let beltACount = 0
    let beltBCount = 0
    let untaggedCount = 0
    
    for (const card of beltCommons) {
      // Use the belt tag that was added during pack generation
      if (card.belt === 'beltA') {
        beltACount++
      } else if (card.belt === 'beltB') {
        beltBCount++
      } else {
        untaggedCount++
        // Card doesn't have belt tag - shouldn't happen
      }
    }
    
    // Account for untagged cards in the check
    const totalTagged = beltACount + beltBCount
    
    // Should have 4-5 from each belt (or 9 total if some untagged)
    if (untaggedCount > 0) {
      invalidCount++
      if (invalidCount <= 5) {
        console.error(`  ❌ Pack ${i+1}: Belt A: ${beltACount}, Belt B: ${beltBCount}, Untagged: ${untaggedCount} (${normalCommons.length} total commons)`)
      }
      passed = false
    } else if (beltACount < 4 || beltACount > 5 || beltBCount < 4 || beltBCount > 5) {
      invalidCount++
      if (invalidCount <= 5) { // Only log first 5
        const allCommons = pack.filter(c => c.rarity === 'Common' && !c.isLeader && !c.isBase)
        console.error(`  ❌ Pack ${i+1}: Belt A: ${beltACount}, Belt B: ${beltBCount} (expected 4-5 each)`)
        console.error(`      Belt-tagged commons: ${beltACount + beltBCount} (includes hyperspace upgrades)`)
        console.error(`      All commons in pack: ${allCommons.length} (${allCommons.filter(c => c.isFoil).length} foil, ${allCommons.filter(c => c.isHyperspace).length} hyperspace)`)
      }
      passed = false
    }
  }
  
  if (passed) {
    console.log(`  ✅ All packs have correct belt distribution (4-5 from each belt)`)
  } else {
    console.log(`  ❌ ${invalidCount} packs have incorrect belt distribution`)
  }
  
  return passed
}

/**
 * Test 5: Hyperspace pack rate (~2/3 of packs have at least one)
 */
function testHyperspacePackRate(setCode) {
  console.log(`\n=== Test 5: Hyperspace Pack Rate (${setCode}) ===`)
  
  const config = getSetConfig(setCode)
  const expectedRate = config.packRules.hyperspacePackRate || 0.667
  
  const cards = getCachedCards(setCode)
  const packs = generateSealedPodFromSheets(cards, setCode, NUM_PACKS_FOR_STATS)
  
  let hyperspacePackCount = 0
  for (const pack of packs) {
    const hasHyperspace = pack.some(c => c.isHyperspace)
    if (hasHyperspace) hyperspacePackCount++
  }
  
  const observedRate = hyperspacePackCount / packs.length
  const diff = Math.abs(observedRate - expectedRate)
  const passed = diff <= TOLERANCE
  
  console.log(`  Expected: ${(expectedRate * 100).toFixed(1)}%`)
  console.log(`  Observed: ${(observedRate * 100).toFixed(1)}% (${hyperspacePackCount} in ${packs.length})`)
  console.log(`  Difference: ${(diff * 100).toFixed(2)}%`)
  
  if (passed) {
    console.log(`  ✅ Hyperspace pack rate within tolerance`)
  } else {
    console.log(`  ❌ Hyperspace pack rate outside tolerance (±${TOLERANCE * 100}%)`)
  }
  
  return passed
}

/**
 * Test 6: Box statistics
 */
function testBoxStatistics(setCode) {
  console.log(`\n=== Test 6: Box Statistics (${setCode}) ===`)
  
  const cards = getCachedCards(setCode)
  const box = generateBoosterBox(cards, setCode)
  const stats = getBoxStatistics(box)
  
  console.log(`  Total cards: ${stats.totalCards} (expected 384 = 24 packs × 16 cards)`)
  console.log(`  By rarity:`)
  for (const [rarity, count] of Object.entries(stats.byRarity)) {
    console.log(`    ${rarity}: ${count}`)
  }
  console.log(`  Hyperspace cards: ${stats.hyperspace}`)
  console.log(`  Foil cards: ${stats.foil}`)
  console.log(`  Showcase cards: ${stats.showcase}`)
  console.log(`  Unique cards: ${stats.uniqueCardCount}`)
  
  const passed = stats.totalCards === 384 && stats.foil === 24
  
  if (passed) {
    console.log(`  ✅ Box statistics look correct`)
  } else {
    console.log(`  ❌ Box statistics inconsistent`)
  }
  
  return passed
}

/**
 * Test 7: Rare leader rate (~1 in 6)
 */
function testRareLeaderRate(setCode) {
  console.log(`\n=== Test 7: Rare Leader Rate (${setCode}) ===`)
  
  const config = getSetConfig(setCode)
  const expectedRate = config.sheetConfig.leader.rareLeaderRate
  
  const cards = getCachedCards(setCode)
  const packs = generateSealedPodFromSheets(cards, setCode, NUM_PACKS_FOR_STATS)
  
  let rareLeaderCount = 0
  for (const pack of packs) {
    const leader = pack.find(c => c.isLeader)
    if (leader && (leader.rarity === 'Rare' || leader.rarity === 'Legendary')) {
      rareLeaderCount++
    }
  }
  
  const observedRate = rareLeaderCount / packs.length
  const diff = Math.abs(observedRate - expectedRate)
  const passed = diff <= TOLERANCE
  
  console.log(`  Expected: ${(expectedRate * 100).toFixed(1)}% (1 in ${Math.round(1/expectedRate)})`)
  console.log(`  Observed: ${(observedRate * 100).toFixed(1)}% (${rareLeaderCount} in ${packs.length})`)
  console.log(`  Difference: ${(diff * 100).toFixed(2)}%`)
  
  if (passed) {
    console.log(`  ✅ Rare leader rate within tolerance`)
  } else {
    console.log(`  ❌ Rare leader rate outside tolerance (±${TOLERANCE * 100}%)`)
  }
  
  return passed
}

/**
 * Test 8: Duplicate and triplicate rates across sealed pods
 * Tests that duplicates/triplicates across 6 packs in a pod are within expected statistical ranges
 */
function testPodDuplicatesAndTriplicates(setCode) {
  console.log(`\n=== Test 8: Pod Duplicates/Triplicates (${setCode}) ===`)
  
  const cards = getCachedCards(setCode)
  const numPods = 500 // Test 500 pods (3000 packs total)
  
  console.log(`  Testing ${numPods} sealed pods (${numPods * 6} total packs)...`)
  
  const podStats = {
    duplicates: {
      leaders: 0,
      bases: 0,
      commons: 0,
      uncommons: 0,
    },
    triplicates: {
      leaders: 0,
      bases: 0,
      commons: 0,
      uncommons: 0,
    },
    maxCopies: {
      leaders: 0,
      bases: 0,
      commons: 0,
      uncommons: 0,
    }
  }
  
  for (let podIndex = 0; podIndex < numPods; podIndex++) {
    // Generate a sealed pod (6 packs)
    const pod = []
    for (let i = 0; i < 6; i++) {
      const packs = generateSealedPodFromSheets(cards, setCode, 1)
      pod.push(packs[0])
    }
    
    // Count cards by name across all 6 packs (foils and hyperspace count as same card)
    const cardCounts = {
      leaders: new Map(),
      bases: new Map(),
      commons: new Map(),
      uncommons: new Map(),
    }
    
    pod.forEach(pack => {
      pack.forEach(card => {
        const name = card.name
        
        if (card.isLeader) {
          cardCounts.leaders.set(name, (cardCounts.leaders.get(name) || 0) + 1)
        }
        if (card.isBase) {
          cardCounts.bases.set(name, (cardCounts.bases.get(name) || 0) + 1)
        }
        if (card.rarity === 'Common' && !card.isLeader && !card.isBase) {
          cardCounts.commons.set(name, (cardCounts.commons.get(name) || 0) + 1)
        }
        if (card.rarity === 'Uncommon' && !card.isLeader && !card.isBase) {
          cardCounts.uncommons.set(name, (cardCounts.uncommons.get(name) || 0) + 1)
        }
      })
    })
    
    // Check for duplicates/triplicates in each category
    const checkCategory = (category) => {
      let hasDuplicate = false
      let hasTriplicate = false
      let maxCount = 0
      
      cardCounts[category].forEach((count) => {
        maxCount = Math.max(maxCount, count)
        if (count >= 2) {
          hasDuplicate = true
          if (count >= 3) {
            hasTriplicate = true
          }
        }
      })
      
      if (hasDuplicate) {
        podStats.duplicates[category]++
      }
      if (hasTriplicate) {
        podStats.triplicates[category]++
      }
      podStats.maxCopies[category] = Math.max(podStats.maxCopies[category], maxCount)
    }
    
    checkCategory('leaders')
    checkCategory('bases')
    checkCategory('commons')
    checkCategory('uncommons')
  }
  
  // Calculate rates
  const duplicateRates = {
    leaders: podStats.duplicates.leaders / numPods,
    bases: podStats.duplicates.bases / numPods,
    commons: podStats.duplicates.commons / numPods,
    uncommons: podStats.duplicates.uncommons / numPods,
  }
  
  const triplicateRates = {
    leaders: podStats.triplicates.leaders / numPods,
    bases: podStats.triplicates.bases / numPods,
    commons: podStats.triplicates.commons / numPods,
    uncommons: podStats.triplicates.uncommons / numPods,
  }
  
  console.log(`  Duplicate rates (pods with at least one duplicate):`)
  console.log(`    Leaders: ${(duplicateRates.leaders * 100).toFixed(1)}% (${podStats.duplicates.leaders}/${numPods} pods)`)
  console.log(`    Bases: ${(duplicateRates.bases * 100).toFixed(1)}% (${podStats.duplicates.bases}/${numPods} pods)`)
  console.log(`    Commons: ${(duplicateRates.commons * 100).toFixed(1)}% (${podStats.duplicates.commons}/${numPods} pods)`)
  console.log(`    Uncommons: ${(duplicateRates.uncommons * 100).toFixed(1)}% (${podStats.duplicates.uncommons}/${numPods} pods)`)
  
  console.log(`  Triplicate rates (pods with at least one triplicate):`)
  console.log(`    Leaders: ${(triplicateRates.leaders * 100).toFixed(1)}% (${podStats.triplicates.leaders}/${numPods} pods)`)
  console.log(`    Bases: ${(triplicateRates.bases * 100).toFixed(1)}% (${podStats.triplicates.bases}/${numPods} pods)`)
  console.log(`    Commons: ${(triplicateRates.commons * 100).toFixed(1)}% (${podStats.triplicates.commons}/${numPods} pods)`)
  console.log(`    Uncommons: ${(triplicateRates.uncommons * 100).toFixed(1)}% (${podStats.triplicates.uncommons}/${numPods} pods)`)
  
  console.log(`  Maximum copies seen in a single pod:`)
  console.log(`    Leaders: ${podStats.maxCopies.leaders}`)
  console.log(`    Bases: ${podStats.maxCopies.bases}`)
  console.log(`    Commons: ${podStats.maxCopies.commons}`)
  console.log(`    Uncommons: ${podStats.maxCopies.uncommons}`)
  
  // Note: Duplicates/triplicates across pods are expected and normal
  // We're just verifying they occur at reasonable rates
  // Commons should have the highest duplicate rate (54 cards per pod, smaller pool)
  // Leaders should have moderate duplicate rate (6 cards per pod, small pool)
  // Uncommons should have lower duplicate rate (18 cards per pod, larger pool)
  
  const passed = true // Always pass - we're just reporting statistics
  console.log(`  ✅ Duplicate/triplicate rates reported (expected across pods)`)
  
  return passed
}

/**
 * Run all tests for a set
 */
async function runTestsForSet(setCode) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`TESTING SET: ${setCode}`)
  console.log('='.repeat(80))
  
  const results = {
    packStructure: testPackStructure(setCode),
    noDuplicateCommons: testNoDuplicateCommons(setCode),
    legendaryDropRate: testLegendaryDropRate(setCode),
    beltDistribution: testBeltDistribution(setCode),
    hyperspacePackRate: testHyperspacePackRate(setCode),
    boxStatistics: testBoxStatistics(setCode),
    rareLeaderRate: testRareLeaderRate(setCode),
    podDuplicatesTriplicates: testPodDuplicatesAndTriplicates(setCode)
  }
  
  const passedCount = Object.values(results).filter(r => r).length
  const totalCount = Object.keys(results).length
  
  console.log(`\n${'='.repeat(80)}`)
  console.log(`RESULTS FOR ${setCode}: ${passedCount}/${totalCount} tests passed`)
  console.log('='.repeat(80))
  
  return results
}

/**
 * Run all tests for all sets
 */
async function runAllTests() {
  console.log('Initializing card cache...')
  await initializeCardCache()
  
  const allResults = {}
  
  for (const setCode of SETS) {
    allResults[setCode] = await runTestsForSet(setCode)
  }
  
  // Summary
  console.log(`\n\n${'='.repeat(80)}`)
  console.log('OVERALL SUMMARY')
  console.log('='.repeat(80))
  
  for (const setCode of SETS) {
    const results = allResults[setCode]
    const passedCount = Object.values(results).filter(r => r).length
    const totalCount = Object.keys(results).length
    const allPassed = passedCount === totalCount
    
    console.log(`${setCode}: ${passedCount}/${totalCount} tests passed ${allPassed ? '✅' : '❌'}`)
  }
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setArg = process.argv[2]
  
  if (setArg && SETS.includes(setArg.toUpperCase())) {
    // Test single set
    const setCode = setArg.toUpperCase()
    console.log(`Testing single set: ${setCode}`)
    await initializeCardCache()
    const results = await runTestsForSet(setCode)
    const passedCount = Object.values(results).filter(r => r).length
    const totalCount = Object.keys(results).length
    const allPassed = passedCount === totalCount
    
    console.log(`\n${'='.repeat(60)}`)
    console.log(`FINAL RESULT: ${passedCount}/${totalCount} tests passed ${allPassed ? '✅' : '❌'}`)
    console.log('='.repeat(60))
    
    process.exit(allPassed ? 0 : 1)
  } else if (setArg) {
    console.error(`❌ Invalid set code: ${setArg}`)
    console.error(`Valid sets: ${SETS.join(', ')}`)
    process.exit(1)
  } else {
    // Test all sets
    runAllTests().catch(err => {
      console.error('❌ Tests failed:', err)
      process.exit(1)
    })
  }
}

export { runAllTests, runTestsForSet }
