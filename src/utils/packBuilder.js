/**
 * Pack Builder - Sheet-based pack generation
 * 
 * Builds booster packs using sheet-based sequential pulls,
 * simulating realistic TCG printing and collation.
 */

import { 
  generateSheetsForSet,
  generateHyperspaceSheet,
  generateHyperspaceFoilSheet 
} from './sheetGeneration.js'
import { 
  createPointer, 
  pullCardFromSheet 
} from './sheetData.js'
import { getSetConfig } from './setConfigs/index.js'
import { getDistributionForSet } from './rarityConfig.js'

/**
 * Generate a single booster pack using sheet-based system
 * @param {Object} sheets - Pre-generated sheets for the set
 * @param {Object} pointers - Pointers for each sheet type
 * @param {Array} allCards - All cards in set (for finding variants)
 * @param {string} setCode - Set code
 * @returns {Array} Pack of 16 cards
 */
export function generateBoosterPackFromSheets(sheets, pointers, allCards, setCode) {
  const config = getSetConfig(setCode)
  const distribution = getDistributionForSet(setCode)
  const pack = []
  
  // Track if we've added hyperspace card (for 2/3 pack rate)
  let hasHyperspaceCard = false
  const shouldHaveHyperspace = Math.random() < (config.packRules.hyperspacePackRate || 0.667)
  
  // 1. Pull Leader from leader sheet
  const leaderCard = pullCardFromSheet(sheets.leader, pointers.leader)
  if (leaderCard) {
    // Check for showcase variant (1 in 288 packs)
    const isShowcase = Math.random() < (distribution.showcaseLeader.inStandardPack || 1/288)
    
    let finalLeader = leaderCard
    if (isShowcase) {
      // Find showcase variant
      const showcaseCard = allCards.find(c => 
        c.name === leaderCard.name &&
        c.set === leaderCard.set &&
        c.variantType === 'Showcase'
      )
      if (showcaseCard) {
        finalLeader = showcaseCard
      }
    }
    
    pack.push({
      ...finalLeader,
      isFoil: false,
      isHyperspace: false,
      isShowcase: isShowcase
    })
  }
  
  // 2. Pull Base from base sheet
  const baseCard = pullCardFromSheet(sheets.bases, pointers.bases)
  if (baseCard) {
    pack.push({
      ...baseCard,
      isFoil: false,
      isHyperspace: false,
      isShowcase: false
    })
  }
  
  // 3. Pull 9 Commons - alternate between Belt A and Belt B
  // Since belts are completely disjoint, alternating guarantees no duplicates
  // Start with Belt A or B randomly
  let useBeltA = Math.random() < 0.5
  const beltA = sheets.common.belts.beltA
  const beltB = sheets.common.belts.beltB
  
  let commonsAdded = 0
  let attempts = 0
  const MAX_ATTEMPTS = 50 // Safety valve to prevent infinite loops
  
  while (commonsAdded < 9 && attempts < MAX_ATTEMPTS) {
    attempts++
    const beltName = useBeltA ? 'beltA' : 'beltB'
    const belt = useBeltA ? beltA : beltB
    const pointer = pointers.common[beltName]
    
    // Pull card from belt (which is just an array of cards)
    const cardIndex = pointer.position % belt.cards.length
    const commonCard = belt.cards[cardIndex]
    
    // Advance pointer
    pointer.position++
    
    // Skip nulls/blanks and leaders/bases (but this shouldn't happen often)
    if (commonCard && commonCard.name !== 'BLANK' && !commonCard.isLeader && !commonCard.isBase) {
      pack.push({
        ...commonCard,
        isFoil: false,
        isHyperspace: false,
        isShowcase: false,
        belt: beltName // Tag which belt this card came from
      })
      commonsAdded++
      // Alternate belt after successfully adding a card
      useBeltA = !useBeltA
    }
    // If null or invalid, pointer already advanced, try same belt again
  }
  
  // 4. Pull 3 Uncommons
  // First 2 are normal, 3rd is potentially upgraded
  // Track pulled uncommons to prevent duplicates
  const pulledUncommons = new Set()
  
  for (let i = 0; i < 2; i++) {
    const sheetIndex = i % sheets.uncommon.length
    const pointerIndex = i % pointers.uncommon.length
    
    // Pull and verify not duplicate
    let uncommonCard = null
    let attempts = 0
    const maxAttempts = 121
    
    while (attempts < maxAttempts) {
      uncommonCard = pullCardFromSheet(sheets.uncommon[sheetIndex], pointers.uncommon[pointerIndex])
      if (uncommonCard) {
        const cardKey = `${uncommonCard.name}-${uncommonCard.set}`
        if (!pulledUncommons.has(cardKey)) {
          pulledUncommons.add(cardKey)
          break
        }
        uncommonCard = null
      }
      attempts++
    }
    
    if (uncommonCard) {
      pack.push({
        ...uncommonCard,
        isFoil: false,
        isHyperspace: false,
        isShowcase: false
      })
    }
  }
  
  // 5. 3rd Uncommon - Upgrade slot
  // Can be upgraded to hyperspace variant of any rarity
  const upgradeSlotHyperspaceChance = config.upgradeSlot?.hyperspaceChance || 0.25
  const isUpgradeHyperspace = Math.random() < upgradeSlotHyperspaceChance
  
  if (isUpgradeHyperspace && !hasHyperspaceCard) {
    // Pull from hyperspace sheets based on rarity distribution
    // NOTE: We exclude commons here because the upgrade slot is the 3rd UNCOMMON
    // It can upgrade to R/L but should not downgrade to C
    const rarityDist = config.upgradeSlot.rarityDistribution
    const roll = Math.random()
    
    let upgradeCard = null
    let upgradeBelt = null
    if (false && roll < rarityDist.Common) { // DISABLED: upgrade slot should not pull commons
      // Common hyperspace - upgrade from normal common belt (hyperspace variants don't have separate belts)
      // Just use the normal common belt and find hyperspace variant
      const useBeltAForUpgrade = Math.random() < 0.5
      upgradeBelt = useBeltAForUpgrade ? 'beltA' : 'beltB'
      const normalBelt = useBeltAForUpgrade 
        ? sheets.common.belts.beltA 
        : sheets.common.belts.beltB
      if (normalBelt && normalBelt.cards.length > 0) {
        const pointer = pointers.common[upgradeBelt]
        const cardIndex = pointer.position % normalBelt.cards.length
        const normalCard = normalBelt.cards[cardIndex]
        // Find hyperspace variant
        if (normalCard) {
          upgradeCard = allCards.find(c => 
            c.name === normalCard.name &&
            c.set === normalCard.set &&
            c.variantType === 'Hyperspace'
          ) || normalCard
        }
        pointer.position++
      }
    } else if (roll < rarityDist.Common + rarityDist.Uncommon) {
      // Uncommon hyperspace
      if (sheets.hyperspaceUncommon && sheets.hyperspaceUncommon.length > 0) {
        upgradeCard = pullCardFromSheet(sheets.hyperspaceUncommon[0], pointers.hyperspaceUncommon[0])
      }
    } else if (roll < rarityDist.Common + rarityDist.Uncommon + rarityDist.Rare) {
      // Rare hyperspace
      if (sheets.hyperspaceRareLegendary) {
        upgradeCard = pullCardFromSheet(sheets.hyperspaceRareLegendary, pointers.hyperspaceRareLegendary)
        // Make sure it's a rare, not legendary
        if (upgradeCard && upgradeCard.rarity === 'Legendary') {
          // Try again or fallback to uncommon
          upgradeCard = null
        }
      }
    } else {
      // Legendary hyperspace
      if (sheets.hyperspaceRareLegendary) {
        // Pull until we get a legendary
        for (let attempt = 0; attempt < 10; attempt++) {
          upgradeCard = pullCardFromSheet(sheets.hyperspaceRareLegendary, pointers.hyperspaceRareLegendary)
          if (upgradeCard && upgradeCard.rarity === 'Legendary') break
          upgradeCard = null
        }
      }
    }
    
    if (upgradeCard) {
      const cardData = {
        ...upgradeCard,
        isFoil: false,
        isHyperspace: true,
        isShowcase: false
      }
      // Add belt tag if it's a common
      if (upgradeCard.rarity === 'Common' && upgradeBelt) {
        cardData.belt = upgradeBelt
      }
      pack.push(cardData)
      hasHyperspaceCard = true
    } else {
      // Fallback to normal uncommon
      const sheetIndex = 2 % sheets.uncommon.length
      const pointerIndex = 2 % pointers.uncommon.length
      
      // Pull and verify not duplicate
      let uncommonCard = null
      let attempts = 0
      const maxAttempts = 121
      
      while (attempts < maxAttempts) {
        uncommonCard = pullCardFromSheet(sheets.uncommon[sheetIndex], pointers.uncommon[pointerIndex])
        if (uncommonCard) {
          const cardKey = `${uncommonCard.name}-${uncommonCard.set}`
          if (!pulledUncommons.has(cardKey)) {
            pulledUncommons.add(cardKey)
            break
          }
          uncommonCard = null
        }
        attempts++
      }
      
      if (uncommonCard) {
        pack.push({
          ...uncommonCard,
          isFoil: false,
          isHyperspace: false,
          isShowcase: false
        })
      }
    }
  } else {
    // Normal 3rd uncommon
    const sheetIndex = 2 % sheets.uncommon.length
    const pointerIndex = 2 % pointers.uncommon.length
    
    // Pull and verify not duplicate
    let uncommonCard = null
    let attempts = 0
    const maxAttempts = 121
    
    while (attempts < maxAttempts) {
      uncommonCard = pullCardFromSheet(sheets.uncommon[sheetIndex], pointers.uncommon[pointerIndex])
      if (uncommonCard) {
        const cardKey = `${uncommonCard.name}-${uncommonCard.set}`
        if (!pulledUncommons.has(cardKey)) {
          pulledUncommons.add(cardKey)
          break
        }
        uncommonCard = null
      }
      attempts++
    }
    
    if (uncommonCard) {
      pack.push({
        ...uncommonCard,
        isFoil: false,
        isHyperspace: false,
        isShowcase: false
      })
    }
  }
  
  // 6. Pull 1 Rare or Legendary
  const rareLegendaryCard = pullCardFromSheet(sheets.rareLegendary, pointers.rareLegendary)
  if (rareLegendaryCard) {
    pack.push({
      ...rareLegendaryCard,
      isFoil: false,
      isHyperspace: false,
      isShowcase: false
    })
  }
  
  // 7. Pull 1 Foil
  // Determine if standard foil or hyperspace foil (5/6 vs 1/6 for sets 1-3)
  const isFoilHyperspace = Math.random() < (distribution.hyperspaceFoil?.inStandardPack || 1/6)
  
  const foilSheets = isFoilHyperspace && sheets.hyperspaceFoil ? sheets.hyperspaceFoil : sheets.foil
  const foilPointer = isFoilHyperspace ? pointers.hyperspaceFoil : pointers.foil
  
  // Pull from stacked foil sheets - cycle through all sheets sequentially
  const sheetIndex = Math.floor(foilPointer.position / 121) % foilSheets.length
  const foilCard = pullCardFromSheet(foilSheets[sheetIndex], foilPointer)
  if (foilCard) {
    pack.push({
      ...foilCard,
      isFoil: true,
      isHyperspace: isFoilHyperspace,
      isShowcase: false
    })
    
    if (isFoilHyperspace) {
      hasHyperspaceCard = true
    }
  }
  
  // 8. If pack should have hyperspace but doesn't, force one
  // This ensures we hit the 2/3 pack rate
  if (shouldHaveHyperspace && !hasHyperspaceCard && pack.length > 2) {
    // Upgrade a random non-leader, non-foil card to hyperspace
    const eligibleIndices = []
    for (let i = 1; i < pack.length - 1; i++) { // Skip leader (0) and foil (last)
      if (!pack[i].isFoil && !pack[i].isShowcase) {
        eligibleIndices.push(i)
      }
    }
    
    if (eligibleIndices.length > 0) {
      const indexToUpgrade = eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)]
      const cardToUpgrade = pack[indexToUpgrade]
      
      // Find hyperspace variant
      const hyperspaceCard = allCards.find(c => 
        c.name === cardToUpgrade.name &&
        c.set === cardToUpgrade.set &&
        c.variantType === 'Hyperspace'
      )
      
      if (hyperspaceCard) {
        pack[indexToUpgrade] = {
          ...hyperspaceCard,
          isFoil: false,
          isHyperspace: true,
          isShowcase: false,
          // Preserve belt tag if it exists (for commons)
          ...(cardToUpgrade.belt && { belt: cardToUpgrade.belt })
        }
      }
    }
  }
  
  return pack
}

/**
 * Initialize pointers for all sheets
 * @param {Object} sheets - Sheet collection
 * @returns {Object} Pointers for all sheets
 */
export function initializePointers(sheets) {
  const pointers = {
    leader: createPointer(),
    bases: createPointer(),
    common: {
      beltA: createPointer(),
      beltB: createPointer(),
      sheetIndex: 0
    },
    uncommon: sheets.uncommon.map(() => createPointer()),
    rareLegendary: createPointer(),
    foil: createPointer(),
    hyperspaceFoil: createPointer(),
    hyperspaceRareLegendary: createPointer(),
    hyperspaceUncommon: sheets.hyperspaceUncommon ? sheets.hyperspaceUncommon.map(() => createPointer()) : [],
    hyperspaceLeader: createPointer(),
    hyperspaceBases: createPointer()
  }
  
  return pointers
}

/**
 * Generate sheets and hyperspace variants for a set
 * @param {Array} cards - All cards in the set
 * @param {string} setCode - Set code
 * @returns {Object} Complete sheet collection including hyperspace variants
 */
export function generateCompleteSheetSet(cards, setCode) {
  // Generate base sheets
  const baseSheets = generateSheetsForSet(cards, setCode)
  
  // Generate hyperspace variants
  const hyperspaceRareLegendary = generateHyperspaceSheet(baseSheets.rareLegendary, cards)
  
  const hyperspaceUncommon = baseSheets.uncommon.map(sheet => 
    generateHyperspaceSheet(sheet, cards)
  )
  
  const hyperspaceLeader = generateHyperspaceSheet(baseSheets.leader, cards)
  
  const hyperspaceBases = generateHyperspaceSheet(baseSheets.bases, cards)
  
  const hyperspaceFoil = generateHyperspaceFoilSheet(baseSheets.foil, cards)
  
  return {
    ...baseSheets,
    hyperspaceRareLegendary,
    hyperspaceUncommon,
    hyperspaceLeader,
    hyperspaceBases,
    hyperspaceFoil
  }
}

/**
 * Generate multiple packs (for sealed pod)
 * @param {Array} cards - All cards in the set
 * @param {string} setCode - Set code
 * @param {number} packCount - Number of packs to generate (default 6)
 * @returns {Array} Array of packs
 */
/**
 * Generate a booster box (24 sequential packs)
 * @param {Object} sheets - Complete sheet set
 * @param {Object} pointers - Sheet pointers
 * @param {Array} cards - All cards in set
 * @param {string} setCode - Set code
 * @returns {Array} Array of 24 packs
 */
function generateBoosterBox(sheets, pointers, cards, setCode) {
  // Rule 2: Seam Jitter - random 1-10 offset between boxes
  // This prevents repeating neighbor patterns across box boundaries
  const jitter = Math.floor(Math.random() * 10) + 1
  
  // Helper to apply jitter with modulo wrapping
  const applyJitter = (pointer, sheetSize = 121) => {
    if (pointer && pointer.position !== undefined) {
      pointer.position = (pointer.position + jitter) % sheetSize
    }
  }
  
  // Apply jitter to all pointers (careful with nested structures)
  applyJitter(pointers.leader)
  applyJitter(pointers.bases)
  applyJitter(pointers.rareLegendary)
  applyJitter(pointers.foil)
  applyJitter(pointers.hyperspaceFoil)
  applyJitter(pointers.hyperspaceRareLegendary)
  applyJitter(pointers.hyperspaceLeader)
  applyJitter(pointers.hyperspaceBases)
  
  // Common pointers (nested) - belts are longer than 121
  if (pointers.common?.beltA) applyJitter(pointers.common.beltA, pointers.common.beltA.size || 242)
  if (pointers.common?.beltB) applyJitter(pointers.common.beltB, pointers.common.beltB.size || 242)
  
  // Uncommon pointers (arrays)
  if (Array.isArray(pointers.uncommon)) {
    pointers.uncommon.forEach(p => applyJitter(p))
  }
  if (Array.isArray(pointers.hyperspaceUncommon)) {
    pointers.hyperspaceUncommon.forEach(p => applyJitter(p))
  }
  
  const packs = []
  for (let i = 0; i < 24; i++) {
    const pack = generateBoosterPackFromSheets(sheets, pointers, cards, setCode)
    packs.push(pack)
  }
  return packs
}

/**
 * Generate a case (6 boxes of 24 packs each = 144 packs)
 * @param {Object} sheets - Complete sheet set
 * @param {Object} pointers - Sheet pointers
 * @param {Array} cards - All cards in set
 * @param {string} setCode - Set code
 * @returns {Array} Array of 6 boxes (each box is an array of 24 packs)
 */
function generateCase(sheets, pointers, cards, setCode) {
  const boxes = []
  for (let i = 0; i < 6; i++) {
    boxes.push(generateBoosterBox(sheets, pointers, cards, setCode))
  }
  return boxes
}

export function generateSealedPodFromSheets(cards, setCode, packCount = 6) {
  // Generate complete sheet set
  const sheets = generateCompleteSheetSet(cards, setCode)
  
  // Initialize pointers
  const pointers = initializePointers(sheets)
  
  // Generate TWO CASES (2 cases × 6 boxes × 24 packs = 288 packs total)
  // This simulates the realistic scenario: print 2 cases, pick a random box, open sequential packs
  const case1 = generateCase(sheets, pointers, cards, setCode)
  const case2 = generateCase(sheets, pointers, cards, setCode)
  
  // Combine all boxes from both cases (12 boxes total)
  const allBoxes = [...case1, ...case2]
  
  // Pick a random box from the 12 boxes (simulating buying/receiving a box)
  const randomBoxIndex = Math.floor(Math.random() * allBoxes.length)
  const selectedBox = allBoxes[randomBoxIndex]
  
  // Select sequential packs from that box
  // In reality, you'd start from pack 1, but we simulate opening from any position
  const startingPack = Math.floor(Math.random() * (24 - packCount + 1)) // Ensure we have enough consecutive packs
  const selectedPacks = selectedBox.slice(startingPack, startingPack + packCount)
  
  // Optional: Log case/box selection for debugging
  // console.log(`Generated 2 cases (288 packs), selected box ${randomBoxIndex + 1}/12, packs ${startingPack + 1}-${startingPack + packCount}`)
  
  return selectedPacks
}

/**
 * Export main function for compatibility
 */
export function generateBoosterPack(cards, setCode) {
  return generateSealedPodFromSheets(cards, setCode, 1)[0]
}

export function generateSealedPod(cards, setCode) {
  return generateSealedPodFromSheets(cards, setCode, 6)
}
