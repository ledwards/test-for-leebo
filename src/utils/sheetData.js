/**
 * Sheet Data Structures
 * 
 * Represents print sheets used in pack generation.
 * Sheets are 11x11 grids (121 cards) that simulate actual TCG printing.
 */

/**
 * Create a new empty sheet
 * @param {string} type - Sheet type ('rare-legendary', 'uncommon', 'common-beltA', 'common-beltB', 'leader', 'base', 'foil')
 * @param {string} variant - Sheet variant ('base', 'hyperspace', 'foil', 'hyperspace')
 * @param {string} setCode - Set code
 * @returns {Object} Empty sheet object
 */
export function createSheet(type, variant, setCode) {
  return {
    type,
    variant,
    setCode,
    size: 121, // 11x11 grid
    rows: 11,
    cols: 11,
    cards: new Array(121).fill(null), // Initialize with nulls (blanks)
    metadata: {
      created: new Date().toISOString(),
      filled: 0,
      blanks: 121
    }
  }
}

/**
 * Set a card at a specific position on the sheet
 * @param {Object} sheet - Sheet object
 * @param {number} position - Position (0-120)
 * @param {Object} card - Card object or null for blank
 */
export function setCardAtPosition(sheet, position, card) {
  if (position < 0 || position >= sheet.size) {
    throw new Error(`Invalid position ${position} for sheet of size ${sheet.size}`)
  }
  
  const wasBlank = sheet.cards[position] === null
  const isBlank = card === null
  
  sheet.cards[position] = card
  
  if (wasBlank && !isBlank) {
    sheet.metadata.filled++
    sheet.metadata.blanks--
  } else if (!wasBlank && isBlank) {
    sheet.metadata.filled--
    sheet.metadata.blanks++
  }
}

/**
 * Get card at a specific position on the sheet
 * @param {Object} sheet - Sheet object
 * @param {number} position - Position (0-120)
 * @returns {Object|null} Card object or null if blank
 */
export function getCardAtPosition(sheet, position) {
  if (position < 0 || position >= sheet.size) {
    throw new Error(`Invalid position ${position} for sheet of size ${sheet.size}`)
  }
  return sheet.cards[position]
}

/**
 * Get card at row/column coordinates
 * @param {Object} sheet - Sheet object
 * @param {number} row - Row (0-10)
 * @param {number} col - Column (0-10)
 * @returns {Object|null} Card object or null if blank
 */
export function getCardAtCoords(sheet, row, col) {
  if (row < 0 || row >= sheet.rows || col < 0 || col >= sheet.cols) {
    throw new Error(`Invalid coordinates (${row}, ${col}) for sheet`)
  }
  const position = row * sheet.cols + col
  return sheet.cards[position]
}

/**
 * Set card at row/column coordinates
 * @param {Object} sheet - Sheet object
 * @param {number} row - Row (0-10)
 * @param {number} col - Column (0-10)
 * @param {Object} card - Card object or null for blank
 */
export function setCardAtCoords(sheet, row, col, card) {
  if (row < 0 || row >= sheet.rows || col < 0 || col >= sheet.cols) {
    throw new Error(`Invalid coordinates (${row}, ${col}) for sheet`)
  }
  const position = row * sheet.cols + col
  setCardAtPosition(sheet, position, card)
}

/**
 * Get all non-blank cards from the sheet
 * @param {Object} sheet - Sheet object
 * @returns {Array} Array of cards
 */
export function getAllCards(sheet) {
  return sheet.cards.filter(card => card !== null)
}

/**
 * Get all positions that are blank
 * @param {Object} sheet - Sheet object
 * @returns {Array<number>} Array of blank positions
 */
export function getBlankPositions(sheet) {
  const blanks = []
  for (let i = 0; i < sheet.cards.length; i++) {
    if (sheet.cards[i] === null) {
      blanks.push(i)
    }
  }
  return blanks
}

/**
 * Get all positions that are filled
 * @param {Object} sheet - Sheet object
 * @returns {Array<number>} Array of filled positions
 */
export function getFilledPositions(sheet) {
  const filled = []
  for (let i = 0; i < sheet.cards.length; i++) {
    if (sheet.cards[i] !== null) {
      filled.push(i)
    }
  }
  return filled
}

/**
 * Shuffle an array in place using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Create a pointer for sequential card pulls
 * @param {number} startPosition - Starting position (random or specific)
 * @returns {Object} Pointer object
 */
export function createPointer(startPosition = null) {
  return {
    position: startPosition !== null ? startPosition : Math.floor(Math.random() * 121),
    pulls: 0
  }
}

/**
 * Advance pointer to next position, wrapping around
 * @param {Object} pointer - Pointer object
 * @param {number} sheetSize - Size of sheet (default 121)
 */
export function advancePointer(pointer, sheetSize = 121) {
  pointer.position = (pointer.position + 1) % sheetSize
  pointer.pulls++
}

/**
 * Pull a card from sheet at pointer position, skipping blanks
 * @param {Object} sheet - Sheet object
 * @param {Object} pointer - Pointer object
 * @param {number} maxSkips - Maximum blanks to skip before giving up (default 121)
 * @returns {Object|null} Card object or null if all blanks
 */
export function pullCardFromSheet(sheet, pointer, maxSkips = 121) {
  let skipped = 0
  
  while (skipped < maxSkips) {
    const card = getCardAtPosition(sheet, pointer.position)
    advancePointer(pointer, sheet.size)
    
    if (card !== null) {
      return card
    }
    
    skipped++
  }
  
  // All positions are blank
  return null
}

/**
 * Pull multiple cards from sheet
 * @param {Object} sheet - Sheet object
 * @param {Object} pointer - Pointer object
 * @param {number} count - Number of cards to pull
 * @returns {Array} Array of cards
 */
export function pullCardsFromSheet(sheet, pointer, count) {
  const cards = []
  for (let i = 0; i < count; i++) {
    const card = pullCardFromSheet(sheet, pointer)
    if (card) {
      cards.push(card)
    }
  }
  return cards
}

/**
 * Clone a sheet (for creating variant versions)
 * @param {Object} sheet - Sheet to clone
 * @param {string} newVariant - New variant type
 * @returns {Object} Cloned sheet
 */
export function cloneSheet(sheet, newVariant) {
  return {
    ...sheet,
    variant: newVariant,
    cards: [...sheet.cards],
    metadata: {
      ...sheet.metadata,
      clonedFrom: sheet.variant,
      created: new Date().toISOString()
    }
  }
}
