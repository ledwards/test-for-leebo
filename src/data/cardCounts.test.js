/**
 * Card Data Count Validation Tests
 *
 * Validates exact counts of cards by treatment type, card type, and aspect combination.
 * These tests use hardcoded expected values to catch data import issues.
 *
 * Run with: node src/data/cardCounts.test.js
 */

import { initializeCardCache, getCachedCards } from '../utils/cardCache.js'

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`\x1b[32m✅ ${name}\x1b[0m`)
    passed++
  } catch (e) {
    console.log(`\x1b[31m❌ ${name}\x1b[0m`)
    console.log(`\x1b[33m   ${e.message}\x1b[0m`)
    failed++
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`)
  }
}

function getAspectKey(card) {
  return (card.aspects || []).sort().join('/') || 'None'
}

async function runTests() {
  console.log('\x1b[36m🔄 Initializing card cache...\x1b[0m')
  await initializeCardCache()

  console.log('')
  console.log('\x1b[1m\x1b[35m🎴 Card Count Validation\x1b[0m')
  console.log('\x1b[35m========================\x1b[0m')
  console.log('')

  // ===== SET 1: SPARK OF REBELLION (SOR) =====
  console.log('\x1b[36m=== Set 1: Spark of Rebellion (SOR) ===\x1b[0m')
  const sorCards = getCachedCards('SOR')

  // Total by treatment
  test('SOR: Total Normal treatment = 252', () => {
    assertEqual(sorCards.filter(c => c.variantType === 'Normal').length, 252)
  })
  test('SOR: Total Foil treatment = 0', () => {
    assertEqual(sorCards.filter(c => c.variantType === 'Foil').length, 0)
  })
  test('SOR: Total Hyperspace treatment = 242', () => {
    assertEqual(sorCards.filter(c => c.variantType === 'Hyperspace').length, 242)
  })
  test('SOR: Total Hyperspace Foil treatment = 0', () => {
    assertEqual(sorCards.filter(c => c.variantType === 'Hyperspace Foil').length, 0)
  })
  test('SOR: Total Showcase treatment = 16', () => {
    assertEqual(sorCards.filter(c => c.variantType === 'Showcase').length, 16)
  })

  // By type and treatment
  test('SOR: Normal Leaders = 18', () => {
    assertEqual(sorCards.filter(c => c.type === 'Leader' && c.variantType === 'Normal').length, 18)
  })
  test('SOR: Hyperspace Leaders = 16', () => {
    assertEqual(sorCards.filter(c => c.type === 'Leader' && c.variantType === 'Hyperspace').length, 16)
  })
  test('SOR: Showcase Leaders = 16', () => {
    assertEqual(sorCards.filter(c => c.type === 'Leader' && c.variantType === 'Showcase').length, 16)
  })

  test('SOR: Normal Bases = 12', () => {
    assertEqual(sorCards.filter(c => c.type === 'Base' && c.variantType === 'Normal').length, 12)
  })
  test('SOR: Hyperspace Bases = 12', () => {
    assertEqual(sorCards.filter(c => c.type === 'Base' && c.variantType === 'Hyperspace').length, 12)
  })

  test('SOR: Normal Units = 148', () => {
    assertEqual(sorCards.filter(c => c.type === 'Unit' && c.variantType === 'Normal').length, 148)
  })
  test('SOR: Hyperspace Units = 143', () => {
    assertEqual(sorCards.filter(c => c.type === 'Unit' && c.variantType === 'Hyperspace').length, 143)
  })

  test('SOR: Normal Upgrades = 14', () => {
    assertEqual(sorCards.filter(c => c.type === 'Upgrade' && c.variantType === 'Normal').length, 14)
  })
  test('SOR: Hyperspace Upgrades = 12', () => {
    assertEqual(sorCards.filter(c => c.type === 'Upgrade' && c.variantType === 'Hyperspace').length, 12)
  })

  test('SOR: Normal Events = 60', () => {
    assertEqual(sorCards.filter(c => c.type === 'Event' && c.variantType === 'Normal').length, 60)
  })
  test('SOR: Hyperspace Events = 59', () => {
    assertEqual(sorCards.filter(c => c.type === 'Event' && c.variantType === 'Hyperspace').length, 59)
  })

  // By aspect combination (Normal treatment)
  const sorNormal = sorCards.filter(c => c.variantType === 'Normal')
  test('SOR: Normal Aggression aspect = 23', () => {
    assertEqual(sorNormal.filter(c => getAspectKey(c) === 'Aggression').length, 23)
  })
  test('SOR: Normal Command aspect = 24', () => {
    assertEqual(sorNormal.filter(c => getAspectKey(c) === 'Command').length, 24)
  })
  test('SOR: Normal Cunning aspect = 24', () => {
    assertEqual(sorNormal.filter(c => getAspectKey(c) === 'Cunning').length, 24)
  })
  test('SOR: Normal Vigilance aspect = 23', () => {
    assertEqual(sorNormal.filter(c => getAspectKey(c) === 'Vigilance').length, 23)
  })
  test('SOR: Normal Aggression/Heroism dual = 15', () => {
    assertEqual(sorNormal.filter(c => getAspectKey(c) === 'Aggression/Heroism').length, 15)
  })

  console.log('')

  // ===== SET 2: SHADOWS OF THE GALAXY (SHD) =====
  console.log('\x1b[36m=== Set 2: Shadows of the Galaxy (SHD) ===\x1b[0m')
  const shdCards = getCachedCards('SHD')

  test('SHD: Total Normal treatment = 262', () => {
    assertEqual(shdCards.filter(c => c.variantType === 'Normal').length, 262)
  })
  test('SHD: Total Foil treatment = 0', () => {
    assertEqual(shdCards.filter(c => c.variantType === 'Foil').length, 0)
  })
  test('SHD: Total Hyperspace treatment = 242', () => {
    assertEqual(shdCards.filter(c => c.variantType === 'Hyperspace').length, 242)
  })
  test('SHD: Total Hyperspace Foil treatment = 0', () => {
    assertEqual(shdCards.filter(c => c.variantType === 'Hyperspace Foil').length, 0)
  })
  test('SHD: Total Showcase treatment = 18', () => {
    assertEqual(shdCards.filter(c => c.variantType === 'Showcase').length, 18)
  })

  test('SHD: Normal Leaders = 18', () => {
    assertEqual(shdCards.filter(c => c.type === 'Leader' && c.variantType === 'Normal').length, 18)
  })
  test('SHD: Normal Bases = 8', () => {
    assertEqual(shdCards.filter(c => c.type === 'Base' && c.variantType === 'Normal').length, 8)
  })
  test('SHD: Normal Units = 160', () => {
    assertEqual(shdCards.filter(c => c.type === 'Unit' && c.variantType === 'Normal').length, 160)
  })
  test('SHD: Normal Upgrades = 30', () => {
    assertEqual(shdCards.filter(c => c.type === 'Upgrade' && c.variantType === 'Normal').length, 30)
  })
  test('SHD: Normal Events = 46', () => {
    assertEqual(shdCards.filter(c => c.type === 'Event' && c.variantType === 'Normal').length, 46)
  })

  test('SHD: Hyperspace Leaders = 16', () => {
    assertEqual(shdCards.filter(c => c.type === 'Leader' && c.variantType === 'Hyperspace').length, 16)
  })
  test('SHD: Hyperspace Units = 147', () => {
    assertEqual(shdCards.filter(c => c.type === 'Unit' && c.variantType === 'Hyperspace').length, 147)
  })

  console.log('')

  // ===== SET 3: TWILIGHT OF THE REPUBLIC (TWI) =====
  console.log('\x1b[36m=== Set 3: Twilight of the Republic (TWI) ===\x1b[0m')
  const twiCards = getCachedCards('TWI')

  test('TWI: Total Normal treatment = 257', () => {
    assertEqual(twiCards.filter(c => c.variantType === 'Normal').length, 257)
  })
  test('TWI: Total Foil treatment = 0', () => {
    assertEqual(twiCards.filter(c => c.variantType === 'Foil').length, 0)
  })
  test('TWI: Total Hyperspace treatment = 242', () => {
    assertEqual(twiCards.filter(c => c.variantType === 'Hyperspace').length, 242)
  })
  test('TWI: Total Hyperspace Foil treatment = 0', () => {
    assertEqual(twiCards.filter(c => c.variantType === 'Hyperspace Foil').length, 0)
  })
  test('TWI: Total Showcase treatment = 18', () => {
    assertEqual(twiCards.filter(c => c.variantType === 'Showcase').length, 18)
  })

  test('TWI: Normal Leaders = 18', () => {
    assertEqual(twiCards.filter(c => c.type === 'Leader' && c.variantType === 'Normal').length, 18)
  })
  test('TWI: Normal Bases = 12', () => {
    assertEqual(twiCards.filter(c => c.type === 'Base' && c.variantType === 'Normal').length, 12)
  })
  test('TWI: Normal Units = 150', () => {
    assertEqual(twiCards.filter(c => c.type === 'Unit' && c.variantType === 'Normal').length, 150)
  })
  test('TWI: Normal Upgrades = 19', () => {
    assertEqual(twiCards.filter(c => c.type === 'Upgrade' && c.variantType === 'Normal').length, 19)
  })
  test('TWI: Normal Events = 58', () => {
    assertEqual(twiCards.filter(c => c.type === 'Event' && c.variantType === 'Normal').length, 58)
  })

  test('TWI: Hyperspace Leaders = 16', () => {
    assertEqual(twiCards.filter(c => c.type === 'Leader' && c.variantType === 'Hyperspace').length, 16)
  })
  test('TWI: Hyperspace Units = 143', () => {
    assertEqual(twiCards.filter(c => c.type === 'Unit' && c.variantType === 'Hyperspace').length, 143)
  })

  console.log('')

  // ===== SET 4: JUMP TO LIGHTSPEED (JTL) =====
  console.log('\x1b[36m=== Set 4: Jump to Lightspeed (JTL) ===\x1b[0m')
  const jtlCards = getCachedCards('JTL')

  test('JTL: Total Normal treatment = 262', () => {
    assertEqual(jtlCards.filter(c => c.variantType === 'Normal').length, 262)
  })
  test('JTL: Total Foil treatment = 236', () => {
    assertEqual(jtlCards.filter(c => c.variantType === 'Foil').length, 236)
  })
  test('JTL: Total Hyperspace treatment = 262', () => {
    assertEqual(jtlCards.filter(c => c.variantType === 'Hyperspace').length, 262)
  })
  test('JTL: Total Hyperspace Foil treatment = 236', () => {
    assertEqual(jtlCards.filter(c => c.variantType === 'Hyperspace Foil').length, 236)
  })
  test('JTL: Total Showcase treatment = 18', () => {
    assertEqual(jtlCards.filter(c => c.variantType === 'Showcase').length, 18)
  })

  test('JTL: Normal Leaders = 18', () => {
    assertEqual(jtlCards.filter(c => c.type === 'Leader' && c.variantType === 'Normal').length, 18)
  })
  test('JTL: Normal Bases = 13', () => {
    assertEqual(jtlCards.filter(c => c.type === 'Base' && c.variantType === 'Normal').length, 13)
  })
  test('JTL: Normal Units = 167', () => {
    assertEqual(jtlCards.filter(c => c.type === 'Unit' && c.variantType === 'Normal').length, 167)
  })
  test('JTL: Normal Upgrades = 7', () => {
    assertEqual(jtlCards.filter(c => c.type === 'Upgrade' && c.variantType === 'Normal').length, 7)
  })
  test('JTL: Normal Events = 57', () => {
    assertEqual(jtlCards.filter(c => c.type === 'Event' && c.variantType === 'Normal').length, 57)
  })

  test('JTL: Foil Bases = 5', () => {
    assertEqual(jtlCards.filter(c => c.type === 'Base' && c.variantType === 'Foil').length, 5)
  })
  test('JTL: Foil Units = 167', () => {
    assertEqual(jtlCards.filter(c => c.type === 'Unit' && c.variantType === 'Foil').length, 167)
  })
  test('JTL: Foil Upgrades = 7', () => {
    assertEqual(jtlCards.filter(c => c.type === 'Upgrade' && c.variantType === 'Foil').length, 7)
  })
  test('JTL: Foil Events = 57', () => {
    assertEqual(jtlCards.filter(c => c.type === 'Event' && c.variantType === 'Foil').length, 57)
  })

  test('JTL: Hyperspace Leaders = 18', () => {
    assertEqual(jtlCards.filter(c => c.type === 'Leader' && c.variantType === 'Hyperspace').length, 18)
  })
  test('JTL: Hyperspace Units = 167', () => {
    assertEqual(jtlCards.filter(c => c.type === 'Unit' && c.variantType === 'Hyperspace').length, 167)
  })

  test('JTL: Hyperspace Foil Units = 167', () => {
    assertEqual(jtlCards.filter(c => c.type === 'Unit' && c.variantType === 'Hyperspace Foil').length, 167)
  })
  test('JTL: Hyperspace Foil Events = 57', () => {
    assertEqual(jtlCards.filter(c => c.type === 'Event' && c.variantType === 'Hyperspace Foil').length, 57)
  })

  console.log('')

  // ===== SET 5: LEADERS OF THE FORCE (LOF) =====
  console.log('\x1b[36m=== Set 5: Leaders of the Force (LOF) ===\x1b[0m')
  const lofCards = getCachedCards('LOF')

  test('LOF: Total Normal treatment = 264', () => {
    assertEqual(lofCards.filter(c => c.variantType === 'Normal').length, 264)
  })
  test('LOF: Total Foil treatment = 238', () => {
    assertEqual(lofCards.filter(c => c.variantType === 'Foil').length, 238)
  })
  test('LOF: Total Hyperspace treatment = 256', () => {
    assertEqual(lofCards.filter(c => c.variantType === 'Hyperspace').length, 256)
  })
  test('LOF: Total Hyperspace Foil treatment = 238', () => {
    assertEqual(lofCards.filter(c => c.variantType === 'Hyperspace Foil').length, 238)
  })
  test('LOF: Total Showcase treatment = 18', () => {
    assertEqual(lofCards.filter(c => c.variantType === 'Showcase').length, 18)
  })

  test('LOF: Normal Leaders = 18', () => {
    assertEqual(lofCards.filter(c => c.type === 'Leader' && c.variantType === 'Normal').length, 18)
  })
  test('LOF: Normal Bases = 12', () => {
    assertEqual(lofCards.filter(c => c.type === 'Base' && c.variantType === 'Normal').length, 12)
  })
  test('LOF: Normal Units = 166', () => {
    assertEqual(lofCards.filter(c => c.type === 'Unit' && c.variantType === 'Normal').length, 166)
  })
  test('LOF: Normal Upgrades = 20', () => {
    assertEqual(lofCards.filter(c => c.type === 'Upgrade' && c.variantType === 'Normal').length, 20)
  })
  test('LOF: Normal Events = 48', () => {
    assertEqual(lofCards.filter(c => c.type === 'Event' && c.variantType === 'Normal').length, 48)
  })

  test('LOF: Foil Bases = 4', () => {
    assertEqual(lofCards.filter(c => c.type === 'Base' && c.variantType === 'Foil').length, 4)
  })
  test('LOF: Foil Units = 166', () => {
    assertEqual(lofCards.filter(c => c.type === 'Unit' && c.variantType === 'Foil').length, 166)
  })
  test('LOF: Foil Upgrades = 20', () => {
    assertEqual(lofCards.filter(c => c.type === 'Upgrade' && c.variantType === 'Foil').length, 20)
  })
  test('LOF: Foil Events = 48', () => {
    assertEqual(lofCards.filter(c => c.type === 'Event' && c.variantType === 'Foil').length, 48)
  })

  test('LOF: Hyperspace Leaders = 18', () => {
    assertEqual(lofCards.filter(c => c.type === 'Leader' && c.variantType === 'Hyperspace').length, 18)
  })
  test('LOF: Hyperspace Bases = 4', () => {
    assertEqual(lofCards.filter(c => c.type === 'Base' && c.variantType === 'Hyperspace').length, 4)
  })
  test('LOF: Hyperspace Units = 166', () => {
    assertEqual(lofCards.filter(c => c.type === 'Unit' && c.variantType === 'Hyperspace').length, 166)
  })

  console.log('')

  // ===== SET 6: SECOND EDITION CORE (SEC) =====
  console.log('\x1b[36m=== Set 6: Second Edition Core (SEC) ===\x1b[0m')
  const secCards = getCachedCards('SEC')

  test('SEC: Total Normal treatment = 264', () => {
    assertEqual(secCards.filter(c => c.variantType === 'Normal').length, 264)
  })
  test('SEC: Total Foil treatment = 238', () => {
    assertEqual(secCards.filter(c => c.variantType === 'Foil').length, 238)
  })
  test('SEC: Total Hyperspace treatment = 264', () => {
    assertEqual(secCards.filter(c => c.variantType === 'Hyperspace').length, 264)
  })
  test('SEC: Total Hyperspace Foil treatment = 238', () => {
    assertEqual(secCards.filter(c => c.variantType === 'Hyperspace Foil').length, 238)
  })
  test('SEC: Total Showcase treatment = 18', () => {
    assertEqual(secCards.filter(c => c.variantType === 'Showcase').length, 18)
  })

  test('SEC: Normal Leaders = 18', () => {
    assertEqual(secCards.filter(c => c.type === 'Leader' && c.variantType === 'Normal').length, 18)
  })
  test('SEC: Normal Bases = 8', () => {
    assertEqual(secCards.filter(c => c.type === 'Base' && c.variantType === 'Normal').length, 8)
  })
  test('SEC: Normal Units = 171', () => {
    assertEqual(secCards.filter(c => c.type === 'Unit' && c.variantType === 'Normal').length, 171)
  })
  test('SEC: Normal Upgrades = 17', () => {
    assertEqual(secCards.filter(c => c.type === 'Upgrade' && c.variantType === 'Normal').length, 17)
  })
  test('SEC: Normal Events = 50', () => {
    assertEqual(secCards.filter(c => c.type === 'Event' && c.variantType === 'Normal').length, 50)
  })

  test('SEC: Foil Units = 171', () => {
    assertEqual(secCards.filter(c => c.type === 'Unit' && c.variantType === 'Foil').length, 171)
  })
  test('SEC: Foil Upgrades = 17', () => {
    assertEqual(secCards.filter(c => c.type === 'Upgrade' && c.variantType === 'Foil').length, 17)
  })
  test('SEC: Foil Events = 50', () => {
    assertEqual(secCards.filter(c => c.type === 'Event' && c.variantType === 'Foil').length, 50)
  })

  test('SEC: Hyperspace Leaders = 18', () => {
    assertEqual(secCards.filter(c => c.type === 'Leader' && c.variantType === 'Hyperspace').length, 18)
  })
  test('SEC: Hyperspace Units = 171', () => {
    assertEqual(secCards.filter(c => c.type === 'Unit' && c.variantType === 'Hyperspace').length, 171)
  })

  test('SEC: Hyperspace Foil Units = 171', () => {
    assertEqual(secCards.filter(c => c.type === 'Unit' && c.variantType === 'Hyperspace Foil').length, 171)
  })
  test('SEC: Hyperspace Foil Events = 50', () => {
    assertEqual(secCards.filter(c => c.type === 'Event' && c.variantType === 'Hyperspace Foil').length, 50)
  })

  console.log('')
  console.log('\x1b[35m========================\x1b[0m')
  console.log(`\x1b[32m✅ Tests passed: ${passed}\x1b[0m`)
  if (failed > 0) {
    console.log(`\x1b[31m❌ Tests failed: ${failed}\x1b[0m`)
  } else {
    console.log(`\x1b[90m   Tests failed: ${failed}\x1b[0m`)
  }
  console.log('')

  if (failed > 0) {
    console.log('\x1b[31m\x1b[1m💥 CARD COUNT VALIDATION FAILED\x1b[0m')
    process.exit(1)
  } else {
    console.log('\x1b[32m\x1b[1m🎉 ALL CARD COUNTS VALID!\x1b[0m')
  }
}

runTests().catch(err => {
  console.error('Test runner failed:', err)
  process.exit(1)
})
