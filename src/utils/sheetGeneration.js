/**
 * Sheet Generation System
 * 
 * Generates print sheets for realistic TCG pack collation.
 * Sheets simulate actual printer behavior with 11x11 grids.
 */

import { getSetConfig } from './setConfigs/index.js'
import { 
  createSheet, 
  setCardAtPosition, 
  shuffleArray,
  getBlankPositions 
} from './sheetData.js'

/**
 * Generate all sheets for a set
 * @param {Array} cards - All cards in the set
 * @param {string} setCode - Set code
 * @returns {Object} Object containing all generated sheets
 */
export function generateSheetsForSet(cards, setCode) {
  const config = getSetConfig(setCode)
  if (!config || !config.sheetConfig) {
    throw new Error(`No sheet configuration found for set ${setCode}`)
  }
  
  const sheets = {
    rareLegendary: generateRareLegendarySheet(cards, setCode, config),
    uncommon: generateUncommonSheets(cards, setCode, config),
    common: generateCommonSheets(cards, setCode, config),
    leader: generateLeaderSheet(cards, setCode, config),
    bases: generateBasesSheet(cards, setCode, config),
    foil: generateFoilSheet(cards, setCode, config)
  }
  
  return sheets
}

/**
 * Generate Rare/Legendary sheet
 * @param {Array} cards - All cards in the set
 * @param {string} setCode - Set code
 * @param {Object} config - Set configuration
 * @returns {Object} Rare/Legendary sheet
 */
export function generateRareLegendarySheet(cards, setCode, config) {
  const sheet = createSheet('rare-legendary', 'base', setCode)
  const sheetConfig = config.sheetConfig.rareLegendary
  
  // Filter cards by rarity (Normal variant, non-leader, non-base)
  const rares = cards.filter(c => 
    c.set === setCode && 
    c.rarity === 'Rare' && 
    c.variantType === 'Normal' &&
    c.type !== 'Leader' && 
    c.type !== 'Base'
  )
  
  const legendaries = cards.filter(c => 
    c.set === setCode && 
    c.rarity === 'Legendary' && 
    c.variantType === 'Normal' &&
    c.type !== 'Leader' && 
    c.type !== 'Base'
  )
  
  // Build card list with appropriate copies
  const cardList = []
  
  // Add rares (multiple copies each)
  const rareCopies = sheetConfig.layout.rares.copies
  for (const rare of rares) {
    for (let i = 0; i < rareCopies; i++) {
      cardList.push(rare)
    }
  }
  
  // Add legendaries (typically 1 copy each)
  const legendaryCopies = sheetConfig.layout.legendaries.copies
  for (const legendary of legendaries) {
    for (let i = 0; i < legendaryCopies; i++) {
      cardList.push(legendary)
    }
  }
  
  // Shuffle card list
  const shuffledCards = shuffleArray(cardList)
  
  // Place cards on sheet
  for (let i = 0; i < shuffledCards.length && i < sheet.size; i++) {
    setCardAtPosition(sheet, i, shuffledCards[i])
  }
  
  // Remaining positions are blanks (already null)
  
  return sheet
}

/**
 * Generate Uncommon sheet(s)
 * @param {Array} cards - All cards in the set
 * @param {string} setCode - Set code
 * @param {Object} config - Set configuration
 * @returns {Array} Array of uncommon sheets
 */
export function generateUncommonSheets(cards, setCode, config) {
  const sheetConfig = config.sheetConfig.uncommon
  const numSheets = sheetConfig.sheets || 1
  
  // Filter uncommon cards (Normal variant, non-leader, non-base)
  // Double-check: exclude both by type and isLeader flag to catch any data inconsistencies
  const uncommons = cards.filter(c => 
    c.set === setCode && 
    c.rarity === 'Uncommon' && 
    c.variantType === 'Normal' &&
    c.type !== 'Leader' && 
    c.type !== 'Base' &&
    !c.isLeader &&  // Additional safety check
    !c.isBase       // Additional safety check
  )
  
  // Build card list with appropriate copies
  const cardList = []
  const copies = sheetConfig.layout.uncommons.copies
  
  for (const uncommon of uncommons) {
    for (let i = 0; i < copies; i++) {
      cardList.push(uncommon)
    }
  }
  
  const sheets = []
  
  for (let sheetNum = 0; sheetNum < numSheets; sheetNum++) {
    const sheet = createSheet(`uncommon-${sheetNum + 1}`, 'base', setCode)
    
    // Shuffle card list for each sheet
    const shuffledCards = shuffleArray([...cardList])
    
    // Place cards on sheet
    for (let i = 0; i < shuffledCards.length && i < sheet.size; i++) {
      setCardAtPosition(sheet, i, shuffledCards[i])
    }
    
    sheets.push(sheet)
  }
  
  return sheets
}

/**
 * Generate Common sheets with Belt system
 * @param {Array} cards - All cards in the set
 * @param {string} setCode - Set code
 * @param {Object} config - Set configuration
 * @returns {Object} Object containing beltA and beltB sheet arrays
 */
export function generateCommonSheets(cards, setCode, config) {
  const sheetConfig = config.sheetConfig.common
  const SHEET_SIZE = 121
  const COLUMN_HEIGHT = 11
  const COLUMNS_PER_SHEET = 11
  const SHEETS_FOR_BELTS = 10 // Number of sheets to generate for belt creation
  
  // Filter common cards (Normal variant, non-leader, non-base)
  const commons = cards.filter(c => 
    c.set === setCode && 
    c.rarity === 'Common' && 
    c.variantType === 'Normal' &&
    c.type !== 'Leader' && 
    c.type !== 'Base'
  )
  
  // Step 1: Separate commons by color
  const blueGreenCards = [] // Vigilance + Command
  const redYellowCards = [] // Aggression + Cunning
  const neutralCards = [] // Neutral/Hero/Villain only (no color aspects)
  
  for (const card of commons) {
    const aspects = card.aspects || []
    
    const hasVigOrComm = aspects.some(a => a === 'Vigilance' || a === 'Command')
    const hasAggOrCunn = aspects.some(a => a === 'Aggression' || a === 'Cunning')
    
    if (hasVigOrComm && !hasAggOrCunn) {
      blueGreenCards.push(card)
    } else if (hasAggOrCunn && !hasVigOrComm) {
      redYellowCards.push(card)
    } else if (hasVigOrComm && hasAggOrCunn) {
      // Multi-aspect cards spanning both - put in neutral for random split
      neutralCards.push(card)
    } else {
      neutralCards.push(card)
    }
  }
  
  // Step 2: Split neutral cards UNEQUALLY to match column alternation pattern
  // With 360 cards over 4 passes in alternating columns starting with Group1:
  // Group1 needs 184 cards (46 unique × 4), Group2 needs 176 cards (44 unique × 4)
  const group1TargetSize = 46
  const totalUnique = blueGreenCards.length + redYellowCards.length + neutralCards.length
  const group2TargetSize = totalUnique - group1TargetSize
  
  const shuffledNeutrals = shuffleArray([...neutralCards])
  const group1NeedFromNeutral = group1TargetSize - blueGreenCards.length
  const neutralGroup1 = shuffledNeutrals.slice(0, group1NeedFromNeutral)
  const neutralGroup2 = shuffledNeutrals.slice(group1NeedFromNeutral)
  
  // Step 3: Create Group 1 (blue/green + neutrals to hit 46) and Group 2 (red/yellow + remaining neutrals)
  const group1Cards = [...blueGreenCards, ...neutralGroup1]
  const group2Cards = [...redYellowCards, ...neutralGroup2]
  
  // Verify no overlap
  const group1Names = new Set(group1Cards.map(c => c.name))
  const group2Names = new Set(group2Cards.map(c => c.name))
  const overlap = [...group1Names].filter(name => group2Names.has(name))
  if (overlap.length > 0) {
    console.error(`ERROR: Group overlap detected for ${setCode}:`, overlap)
  }
  
  // Step 4: Create source card lists (1 copy each)
  // We'll refill these pools 4 times (one per pass)
  const sourceGroup1 = [...group1Cards]
  const sourceGroup2 = [...group2Cards]
  
  // Working pools (will be refilled after each pass)
  // SHUFFLE THE INITIAL POOLS!
  let group1Pool = shuffleArray([...sourceGroup1])
  let group2Pool = shuffleArray([...sourceGroup2])
  
  const totalPasses = sheetConfig.layout.commons.copies // Usually 4
  let currentPass = 1
  
  // Step 5: Generate sheets one card at a time
  // Shuffle the pool at the start of each column (every 11 cards)
  const sheets = []
  let currentSheet = createSheet('common', 'base', setCode)
  currentSheet.columnGroups = []
  let position = 0
  let lastColumnShuffled = -1
  
  // Track last 3 cards placed (for "Shuffle-and-Shift Buffer" seam duplicate detection)
  const lastPlaced = []
  
  // Place all cards (both groups combined × 4 passes = 360 for SOR)
  // We'll fill 360 cards, leaving 3 blanks at the end
  const totalUniqueCards = group1Cards.length + group2Cards.length
  const totalCards = totalUniqueCards * totalPasses
  
  // Calculate how many cards each group needs to place
  // We alternate: col0=G1, col1=G2, col2=G1, col3=G2, ...
  // For 360 cards: 360/11 = 32.727 columns
  // Columns 0-32 = 33 columns, but we only fill 32 full + 8 partial
  // Even columns (0,2,4...32) = 17 columns * 11 = 187 cards from Group1
  // Odd columns (1,3,5...31) = 16 columns * 11 = 176 cards from Group2
  // But we only have 180 cards per group! So Group1 will come up short.
  // Solution: Stop at totalCards, not at filling all 363 slots
  const expectedCardsPerGroup = totalUniqueCards / 2 * totalPasses // Should be 45*4=180 each
  
  while (position < totalCards) {
    // Determine which column we're in globally (across all sheets)
    const globalColumn = Math.floor(position / COLUMN_HEIGHT)
    const col = globalColumn % COLUMNS_PER_SHEET // Column on current sheet (0-10)
    const row = position % COLUMN_HEIGHT // Row WITHIN that column (0-10)
    
    // Determine which pool to use
    const useGroup1 = globalColumn % 2 === 0
    
    // Shuffle at the start of each NEW column
    if (row === 0) {  // Starting a new column
      // Shuffle the pool for this column
      shuffleArray(useGroup1 ? group1Pool : group2Pool)
      
      // Track which group this column uses
      currentSheet.columnGroups.push(useGroup1 ? 'group1' : 'group2')
    }
    
    // Check if we need to refill BEFORE pulling (don't leave blanks!)
    const pool = useGroup1 ? group1Pool : group2Pool
    if (pool.length === 0) {
      if (currentPass < totalPasses) {
        currentPass++
        // Refill and SHUFFLE both pools IMMEDIATELY
        group1Pool = shuffleArray([...sourceGroup1])
        group2Pool = shuffleArray([...sourceGroup2])
        
        // SHUFFLE-AND-SHIFT BUFFER: Prevent duplicates at seam between passes
        // Check the first 3 cards in the newly refilled pool
        // If any match the last 3 cards placed, swap them with cards from later in the pool
        const poolToCheck = useGroup1 ? group1Pool : group2Pool
        if (lastPlaced.length > 0 && poolToCheck.length > 10) {
          for (let checkIdx = 0; checkIdx < Math.min(3, poolToCheck.length); checkIdx++) {
            const cardToCheck = poolToCheck[checkIdx]
            // Check if this card matches any of the last 3 placed
            const isDuplicate = lastPlaced.some(prevCard => 
              prevCard && cardToCheck && prevCard.name === cardToCheck.name
            )
            if (isDuplicate) {
              // Swap with a random card from positions 10+ (safe distance)
              const swapIdx = 10 + Math.floor(Math.random() * (poolToCheck.length - 10))
              const temp = poolToCheck[checkIdx]
              poolToCheck[checkIdx] = poolToCheck[swapIdx]
              poolToCheck[swapIdx] = temp
            }
          }
        }
      }
      // If we've done all passes and pool is empty, we're done
    }
    
    // Pull one card from the appropriate pool (use fresh reference after refill)
    const freshPool = useGroup1 ? group1Pool : group2Pool
    const card = freshPool.length > 0 ? freshPool.shift() : null
    
    // Place card DOWN THE COLUMN
    // Position WITHIN the current sheet (0-120)
    const positionInSheet = position % (COLUMNS_PER_SHEET * COLUMN_HEIGHT)
    const rowInSheet = positionInSheet % COLUMN_HEIGHT
    const colInSheet = Math.floor(positionInSheet / COLUMN_HEIGHT)
    const sheetPosition = rowInSheet * COLUMNS_PER_SHEET + colInSheet
    setCardAtPosition(currentSheet, sheetPosition, card)
    
    // Track last 3 cards placed (for seam duplicate detection)
    if (card && card.name !== 'BLANK') {
      lastPlaced.push(card)
      if (lastPlaced.length > 3) {
        lastPlaced.shift() // Keep only last 3
      }
    }
    
    position++
    
    // Start a new sheet after 121 cards
    if (position % (COLUMNS_PER_SHEET * COLUMN_HEIGHT) === 0 && position < totalCards) {
      sheets.push(currentSheet)
      currentSheet = createSheet('common', 'base', setCode)
      currentSheet.columnGroups = []
    }
  }
  
  // Push final partial sheet if it has any cards
  if (currentSheet.columnGroups.length > 0 && sheets[sheets.length - 1] !== currentSheet) {
    sheets.push(currentSheet)
  }
  
  // console.log(`Generated ${sheets.length} common sheets for ${setCode} with alternating columns (Group1: ${group1Cards.length} unique, Group2: ${group2Cards.length} unique)`)
  
  // Step 6: Generate belts by cutting all sheets
  const belts = generateBeltsFromSheets(sheets, sheets.length, setCode)
  
  return {
    sheets: sheets.slice(0, 3), // First 3 sheets for visualization
    belts: belts
  }
}

/**
 * Generate belts by cutting and taping columns from sheets
 * Belt A gets odd columns (1, 3, 5, ...), Belt B gets even columns (2, 4, 6, ...)
 */
function generateBeltsFromSheets(sheets, numSheets, setCode) {
  const COLUMN_HEIGHT = 11
  const COLUMNS_PER_SHEET = 11
  
  const beltACards = []
  const beltBCards = []
  
  // Process first N sheets for belt creation
  for (let sheetIdx = 0; sheetIdx < Math.min(numSheets, sheets.length); sheetIdx++) {
    const sheet = sheets[sheetIdx]
    
    // Extract each column
    for (let col = 0; col < COLUMNS_PER_SHEET; col++) {
      const globalCol = sheetIdx * COLUMNS_PER_SHEET + col + 1 // 1-indexed column number
      const column = []
      
      // Extract column (top to bottom)
      for (let row = 0; row < COLUMN_HEIGHT; row++) {
        const position = row * COLUMNS_PER_SHEET + col
        column.push(sheet.cards[position])
      }
      
      // Belt A gets odd columns, Belt B gets even columns
      if (globalCol % 2 === 1) {
        beltACards.push(...column)
      } else {
        beltBCards.push(...column)
      }
    }
  }
  
  // console.log(`  Generated belts from ${Math.min(numSheets, sheets.length)} sheets: Belt A (${beltACards.length} cards), Belt B (${beltBCards.length} cards)`)
  
  // Create belt objects (long strips of cards taped together)
  // Each belt contains ~4 copies of each card, spaced ~90 cards apart
  // This ensures sequential pulls of 4-5 cards won't hit duplicates
  return {
    beltA: {
      type: 'belt',
      name: 'Belt A (Odd Columns)',
      cards: beltACards,
      setCode: setCode
    },
    beltB: {
      type: 'belt',
      name: 'Belt B (Even Columns)',
      cards: beltBCards,
      setCode: setCode
    }
  }
}

/**
 * Helper: Generate sheets for a belt with column uniformity
 * @param {Array} cards - Cards for this belt
 * @param {number} copies - Copies per card
 * @param {string} type - Sheet type
 * @param {string} setCode - Set code
 * @param {Object} sheetConfig - Sheet configuration
 * @returns {Array} Array of sheets
 */
function generateBeltSheets(cards, copies, type, setCode, sheetConfig) {
  // Build card list with copies
  const cardList = []
  for (const card of cards) {
    for (let i = 0; i < copies; i++) {
      cardList.push(card)
    }
  }
  
  // Calculate number of sheets needed
  const numSheets = sheetConfig.sheets || Math.ceil(cardList.length / 121)
  const sheets = []
  
  // Shuffle once for all sheets
  const shuffledCards = shuffleArray([...cardList])
  
  for (let sheetNum = 0; sheetNum < numSheets; sheetNum++) {
    const sheet = createSheet(`${type}-${sheetNum + 1}`, 'base', setCode)
    
    // For column uniformity: assign cards by columns
    // Each column gets roughly equal cards
    const cardsPerSheet = Math.min(121, shuffledCards.length - (sheetNum * 121))
    const startIndex = sheetNum * 121
    
    // Fill sheet column by column to maintain belt uniformity
    // This ensures entire columns are from same belt
    let cardIndex = startIndex
    for (let col = 0; col < 11; col++) {
      for (let row = 0; row < 11; row++) {
        const position = row * 11 + col
        if (cardIndex < startIndex + cardsPerSheet && cardIndex < shuffledCards.length) {
          setCardAtPosition(sheet, position, shuffledCards[cardIndex])
          cardIndex++
        }
        // else leave as blank
      }
    }
    
    sheets.push(sheet)
  }
  
  return sheets
}

/**
 * Generate Leader sheet
 * @param {Array} cards - All cards in the set
 * @param {string} setCode - Set code
 * @param {Object} config - Set configuration
 * @returns {Object} Leader sheet
 */
export function generateLeaderSheet(cards, setCode, config) {
  const sheet = createSheet('leader', 'base', setCode)
  const sheetConfig = config.sheetConfig.leader
  
  // Filter leader cards (Normal variant)
  const commonLeaders = cards.filter(c => 
    c.set === setCode && 
    c.type === 'Leader' && 
    c.rarity === 'Common' && 
    c.variantType === 'Normal'
  )
  
  const rareLeaders = cards.filter(c => 
    c.set === setCode && 
    c.type === 'Leader' && 
    (c.rarity === 'Rare' || c.rarity === 'Legendary') && 
    c.variantType === 'Normal'
  )
  
  // Build card list
  const cardList = []
  
  // Common leaders (more copies)
  const commonCopies = sheetConfig.layout.commonLeaders.copies
  for (const leader of commonLeaders) {
    for (let i = 0; i < commonCopies; i++) {
      cardList.push(leader)
    }
  }
  
  // Rare leaders (fewer copies)
  const rareCopies = sheetConfig.layout.rareLeaders.copies
  for (const leader of rareLeaders) {
    for (let i = 0; i < rareCopies; i++) {
      cardList.push(leader)
    }
  }
  
  // Shuffle and place
  const shuffledCards = shuffleArray(cardList)
  for (let i = 0; i < shuffledCards.length && i < sheet.size; i++) {
    setCardAtPosition(sheet, i, shuffledCards[i])
  }
  
  return sheet
}

/**
 * Generate Base sheet
 * @param {Array} cards - All cards in the set
 * @param {string} setCode - Set code
 * @param {Object} config - Set configuration
 * @returns {Object} Base sheet
 */
export function generateBasesSheet(cards, setCode, config) {
  const sheet = createSheet('bases', 'base', setCode)
  const sheetConfig = config.sheetConfig.base
  const SHEET_SIZE = 121
  
  // Filter base cards (Normal variant, Common only for base slot)
  const bases = cards.filter(c => 
    c.set === setCode && 
    c.type === 'Base' && 
    c.rarity === 'Common' && 
    c.variantType === 'Normal'
  )
  
  // Rule 3: Repeat bases to fill ~121 without going over
  const cardList = []
  
  // Calculate how many times to repeat the full set
  const timesToRepeat = Math.floor(SHEET_SIZE / bases.length)
  
  for (let repeatNum = 0; repeatNum < timesToRepeat; repeatNum++) {
    const shuffled = shuffleArray([...bases])
    cardList.push(...shuffled)
  }
  
  // Add remaining cards to get close to 121
  const remaining = SHEET_SIZE - cardList.length
  if (remaining > 0 && bases.length > 0) {
    const shuffled = shuffleArray([...bases])
    cardList.push(...shuffled.slice(0, remaining))
  }
  
  // Place cards on sheet
  for (let i = 0; i < Math.min(cardList.length, SHEET_SIZE); i++) {
    setCardAtPosition(sheet, i, cardList[i])
  }
  
  // console.log(`Generated bases sheet for ${setCode}: ${cardList.length} cards (${bases.length} unique × ~${timesToRepeat} + ${remaining})`)
  
  return sheet
}

/**
 * Generate Foil sheet
 * @param {Array} cards - All cards in the set
 * @param {string} setCode - Set code
 * @param {Object} config - Set configuration
 * @returns {Object} Foil sheet
 */
export function generateFoilSheet(cards, setCode, config) {
  const sheetConfig = config.sheetConfig.foil
  const layout = sheetConfig.layout
  const sheetSize = 121
  
  // Filter cards (Normal variant, exclude leaders, exclude common bases)
  const foilableCommons = cards.filter(c => 
    c.set === setCode && 
    c.rarity === 'Common' && 
    c.variantType === 'Normal' &&
    c.type !== 'Leader' && 
    c.type !== 'Base' // Common bases can't be foil
  )
  
  const foilableUncommons = cards.filter(c => 
    c.set === setCode && 
    c.rarity === 'Uncommon' && 
    c.variantType === 'Normal' &&
    c.type !== 'Leader' && 
    c.type !== 'Base'
  )
  
  const foilableRares = cards.filter(c => 
    c.set === setCode && 
    c.rarity === 'Rare' && 
    c.variantType === 'Normal' &&
    c.type !== 'Leader' &&
    c.type !== 'Base'
    // Note: In real TCG, rare bases CAN be foil, but excluding for simplicity
  )
  
  const foilableLegendaries = cards.filter(c => 
    c.set === setCode && 
    c.rarity === 'Legendary' && 
    c.variantType === 'Normal' &&
    c.type !== 'Leader'
  )
  
  // Special rarity cards (for sets 4-6 only)
  const foilableSpecials = cards.filter(c => 
    c.set === setCode && 
    c.rarity === 'Special' && 
    c.variantType === 'Normal' &&
    c.type !== 'Leader'
  )
  
  // Calculate target distribution (slots per 121-card sheet)
  const commonSlots = layout.commons.approximate || 85
  const uncommonSlots = layout.uncommons.approximate || 24
  const rareSlots = layout.rares.approximate || 10
  const legendarySlots = layout.legendaries.approximate || 2
  const specialSlots = layout.specials?.approximate || 0
  
  // Determine number of sheets needed for full coverage
  // We need enough sheets so that every unique card appears at least once
  const sheetsNeeded = Math.max(
    Math.ceil(foilableCommons.length / commonSlots),
    Math.ceil(foilableUncommons.length / uncommonSlots),
    Math.ceil(foilableRares.length / rareSlots),
    Math.ceil(foilableLegendaries.length / legendarySlots),
    foilableSpecials.length > 0 && specialSlots > 0 ? Math.ceil(foilableSpecials.length / specialSlots) : 0,
    1 // At least 1 sheet
  )
  
  const sheets = []
  
  for (let sheetNum = 0; sheetNum < sheetsNeeded; sheetNum++) {
    const sheet = createSheet('foil', 'foil', setCode)
    const cardList = []
    
    // Add commons (rotate through different cards for each sheet)
    for (let i = 0; i < commonSlots; i++) {
      const cardIndex = (sheetNum * commonSlots + i) % foilableCommons.length
      const card = foilableCommons[cardIndex]
      if (card) cardList.push(card)
    }
    
    // Add uncommons
    for (let i = 0; i < uncommonSlots; i++) {
      const cardIndex = (sheetNum * uncommonSlots + i) % foilableUncommons.length
      const card = foilableUncommons[cardIndex]
      if (card) cardList.push(card)
    }
    
    // Add rares
    for (let i = 0; i < rareSlots; i++) {
      const cardIndex = (sheetNum * rareSlots + i) % foilableRares.length
      const card = foilableRares[cardIndex]
      if (card) cardList.push(card)
    }
    
    // Add legendaries
    for (let i = 0; i < legendarySlots; i++) {
      const cardIndex = (sheetNum * legendarySlots + i) % foilableLegendaries.length
      const card = foilableLegendaries[cardIndex]
      if (card) cardList.push(card)
    }
    
    // Add specials (for sets 4-6)
    if (specialSlots > 0 && foilableSpecials.length > 0) {
      for (let i = 0; i < specialSlots; i++) {
        const cardIndex = (sheetNum * specialSlots + i) % foilableSpecials.length
        const card = foilableSpecials[cardIndex]
        if (card) cardList.push(card)
      }
    }
    
    // Shuffle and place on sheet
    const shuffledCards = shuffleArray(cardList)
    for (let i = 0; i < shuffledCards.length && i < sheetSize; i++) {
      setCardAtPosition(sheet, i, shuffledCards[i])
    }
    
    sheets.push(sheet)
  }
  
  // console.log(`Generated ${sheets.length} foil sheets for ${setCode} to ensure full coverage (${foilableCommons.length}C, ${foilableUncommons.length}U, ${foilableRares.length}R, ${foilableLegendaries.length}L${foilableSpecials.length > 0 ? `, ${foilableSpecials.length}S` : ''})`)
  
  return sheets
}

/**
 * Generate hyperspace variant of a sheet
 * @param {Object} baseSheet - Base sheet to create hyperspace variant from
 * @param {Array} allCards - All cards in set (to find hyperspace variants)
 * @returns {Object} Hyperspace variant sheet
 */
export function generateHyperspaceSheet(baseSheet, allCards) {
  const hyperspaceSheet = createSheet(baseSheet.type, 'hyperspace', baseSheet.setCode)
  
  // For each card on base sheet, find its hyperspace variant
  for (let i = 0; i < baseSheet.cards.length; i++) {
    const baseCard = baseSheet.cards[i]
    if (baseCard === null) {
      // Keep blanks as blanks
      continue
    }
    
    // Find hyperspace variant
    const hyperspaceCard = allCards.find(c => 
      c.name === baseCard.name &&
      c.set === baseCard.set &&
      c.variantType === 'Hyperspace'
    )
    
    setCardAtPosition(hyperspaceSheet, i, hyperspaceCard || baseCard)
  }
  
  return hyperspaceSheet
}

/**
 * Generate hyperspace variant of a foil sheet
 * @param {Object} foilSheet - Foil sheet to create hyperspace variant from
 * @param {Array} allCards - All cards in set (to find hyperspace variants)
 * @returns {Object} Hyperspace variant sheet
 */
export function generateHyperspaceFoilSheet(foilSheets, allCards) {
  // foilSheets is now an array of sheets
  const hyperspaceSheets = []
  
  for (const foilSheet of foilSheets) {
    const hyperspaceFoilSheet = createSheet(foilSheet.type, 'hyperspace', foilSheet.setCode)
    
    // For each card on foil sheet, find its hyperspace variant
    for (let i = 0; i < foilSheet.cards.length; i++) {
      const baseCard = foilSheet.cards[i]
      if (baseCard === null) {
        continue
      }
      
      // Find hyperspace variant
      const hyperspaceCard = allCards.find(c => 
        c.name === baseCard.name &&
        c.set === baseCard.set &&
        c.variantType === 'Hyperspace'
      )
      
      setCardAtPosition(hyperspaceFoilSheet, i, hyperspaceCard || baseCard)
    }
    
    hyperspaceSheets.push(hyperspaceFoilSheet)
  }
  
  return hyperspaceSheets
}
