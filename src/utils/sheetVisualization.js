/**
 * Sheet Visualization System
 * 
 * Generates visual representations of print sheets for inspection.
 * Creates both simple grid views and detailed views with card information.
 * 
 * NOTE: This uses Node.js Canvas API for image generation.
 * For browser-based visualization, use HTML Canvas instead.
 */

import fs from 'fs'
import path from 'path'
import { createSheet, setCardAtPosition } from './sheetData.js'

/**
 * Generate a simple text-based visualization of a sheet
 * @param {Object} sheet - Sheet object
 * @returns {string} Text visualization
 */
export function visualizeSheetText(sheet) {
  let output = []
  output.push(`Sheet: ${sheet.type} (${sheet.variant})`)
  output.push(`Set: ${sheet.setCode}`)
  output.push(`Size: ${sheet.rows}x${sheet.cols} = ${sheet.size}`)
  output.push(`Filled: ${sheet.metadata.filled} / Blanks: ${sheet.metadata.blanks}`)
  output.push('')
  
  // Create grid
  for (let row = 0; row < sheet.rows; row++) {
    const rowCells = []
    for (let col = 0; col < sheet.cols; col++) {
      const position = row * sheet.cols + col
      const card = sheet.cards[position]
      
      if (card === null) {
        rowCells.push('[BLANK]')
      } else {
        // Abbreviate card name
        const abbrev = card.name.substring(0, 8).padEnd(8, ' ')
        rowCells.push(`[${abbrev}]`)
      }
    }
    output.push(rowCells.join(' '))
  }
  
  return output.join('\n')
}

/**
 * Generate a detailed text visualization with full card info
 * @param {Object} sheet - Sheet object
 * @returns {string} Detailed text visualization
 */
export function visualizeSheetDetailed(sheet) {
  let output = []
  output.push(`====== SHEET DETAILS ======`)
  output.push(`Type: ${sheet.type}`)
  output.push(`Variant: ${sheet.variant}`)
  output.push(`Set: ${sheet.setCode}`)
  output.push(`Size: ${sheet.rows}x${sheet.cols} = ${sheet.size}`)
  output.push(`Filled: ${sheet.metadata.filled} / Blanks: ${sheet.metadata.blanks}`)
  output.push('')
  
  // List all unique cards and their counts
  const cardCounts = new Map()
  const blankPositions = []
  
  for (let i = 0; i < sheet.cards.length; i++) {
    const card = sheet.cards[i]
    if (card === null) {
      blankPositions.push(i)
    } else {
      const key = `${card.name} (${card.rarity})`
      cardCounts.set(key, (cardCounts.get(key) || 0) + 1)
    }
  }
  
  output.push(`=== CARD DISTRIBUTION ===`)
  const sortedCards = Array.from(cardCounts.entries()).sort((a, b) => b[1] - a[1])
  for (const [cardName, count] of sortedCards) {
    output.push(`  ${count}x ${cardName}`)
  }
  
  output.push('')
  output.push(`=== BLANK POSITIONS ===`)
  output.push(`Positions: ${blankPositions.join(', ')}`)
  
  output.push('')
  output.push(`=== GRID ===`)
  for (let row = 0; row < sheet.rows; row++) {
    const rowNum = String(row).padStart(2, ' ')
    const rowCells = []
    for (let col = 0; col < sheet.cols; col++) {
      const position = row * sheet.cols + col
      const card = sheet.cards[position]
      
      if (card === null) {
        rowCells.push('BLANK')
      } else {
        rowCells.push(card.name.substring(0, 12).padEnd(12, ' '))
      }
    }
    output.push(`${rowNum}| ${rowCells.join(' | ')}`)
  }
  
  return output.join('\n')
}

/**
 * Save sheet visualization to file
 * @param {Object} sheet - Sheet object
 * @param {string} outputDir - Output directory
 * @param {boolean} detailed - Generate detailed view
 */
export function saveSheetVisualization(sheet, outputDir = './sheets', detailed = false) {
  // Create output directory if it doesn't exist
  const setDir = path.join(outputDir, sheet.setCode)
  if (!fs.existsSync(setDir)) {
    fs.mkdirSync(setDir, { recursive: true })
  }
  
  // Generate filename
  const suffix = detailed ? '-detailed' : ''
  const filename = `${sheet.type}-${sheet.variant}${suffix}.txt`
  const filepath = path.join(setDir, filename)
  
  // Generate content
  const content = detailed ? visualizeSheetDetailed(sheet) : visualizeSheetText(sheet)
  
  // Write to file
  fs.writeFileSync(filepath, content, 'utf8')
  
  return filepath
}

/**
 * Get aspect border color for a card
 * Returns aspect color for Vigilance, Command, Aggression, or Cunning
 * Returns grey for Neutral, Heroism, Villainy, or no aspects
 * @param {Object} card - Card object
 * @returns {string} Hex color code
 */
function getAspectBorderColor(card) {
  if (!card || !card.aspects || card.aspects.length === 0) {
    return '#808080' // Grey for neutral/no aspects
  }
  
  // Aspect color mappings
  const ASPECT_COLORS = {
    'Vigilance': '#4A90E2',    // Blue
    'Command': '#27AE60',      // Green
    'Aggression': '#E74C3C',   // Red
    'Cunning': '#F1C40F'       // Yellow
  }
  
  // Find the first aspect that is Vigilance, Command, Aggression, or Cunning
  const primaryAspect = card.aspects.find(a => 
    a === 'Vigilance' || a === 'Command' || a === 'Aggression' || a === 'Cunning'
  )
  
  if (primaryAspect) {
    return ASPECT_COLORS[primaryAspect]
  }
  
  // If no primary aspect found (only Heroism/Villainy or neutral), use grey
  return '#808080'
}

/**
 * Generate HTML visualization of a belt (vertical strip)
 * @param {Array} cards - Array of cards in the belt
 * @param {string} beltName - Name of the belt (e.g., "Belt A")
 * @param {string} setCode - Set code
 * @returns {string} HTML content with card images
 */
export function visualizeBeltHTML(cards, beltName, setCode) {
  let html = []
  html.push('<!DOCTYPE html>')
  html.push('<html>')
  html.push('<head>')
  html.push('  <meta charset="UTF-8">')
  html.push(`  <title>${beltName} (${setCode})</title>`)
  html.push('  <link rel="preconnect" href="https://fonts.googleapis.com" />')
  html.push('  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />')
  html.push('  <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;800&display=swap" rel="stylesheet" />')
  html.push('  <style>')
  html.push('    body { font-family: "Barlow", system-ui, sans-serif; margin: 20px; background: #242424; color: rgba(255, 255, 255, 0.87); }')
  html.push('    .header { background: #1a1a1a; color: rgba(255, 255, 255, 0.87); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #333; }')
  html.push('    .header h1 { font-weight: 800; color: rgba(255, 255, 255, 0.87); }')
  html.push('    .belt-strip { display: grid; grid-template-columns: 1fr; gap: 2px; max-width: 200px; margin: 0 auto; }')
  html.push('    .card-slot { position: relative; aspect-ratio: 5 / 7; background: #1a1a1a; border: 1px solid #333; border-radius: 4px; overflow: hidden; }')
  html.push('    .card-slot.blank { background: #2a2a2a; display: flex; align-items: center; justify-content: center; color: #666; font-size: 12px; }')
  html.push('    .card-slot.has-image { border: 2px solid transparent; }')
  html.push('    .card-image { width: 100%; height: 100%; object-fit: cover; display: block; }')
  html.push('    .card-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); color: white; padding: 4px 6px; font-size: 10px; opacity: 0; transition: opacity 0.2s; }')
  html.push('    .card-slot:hover .card-overlay { opacity: 1; }')
  html.push('    .card-name { font-weight: 600; margin-bottom: 2px; }')
  html.push('    .card-rarity { font-size: 9px; opacity: 0.9; }')
  html.push('    .stats { background: #1a1a1a; color: rgba(255, 255, 255, 0.87); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #333; }')
  html.push('  </style>')
  html.push('</head>')
  html.push('<body>')
  
  const filled = cards.filter(c => c !== null).length
  const blanks = cards.filter(c => c === null).length
  
  html.push('  <div class="header">')
  html.push(`    <h1>${beltName}</h1>`)
  html.push(`    <p>Set: ${setCode}</p>`)
  html.push(`    <p>Length: ${cards.length} cards | Filled: ${filled} | Blanks: ${blanks}</p>`)
  html.push('  </div>')
  
  // Card distribution stats
  const cardCounts = new Map()
  let imagesCount = 0
  for (const card of cards) {
    if (card !== null) {
      const key = `${card.rarity}`
      cardCounts.set(key, (cardCounts.get(key) || 0) + 1)
      if (card.imageUrl) {
        imagesCount++
      }
    }
  }
  
  html.push('  <div class="stats">')
  html.push('    <h3>Rarity Distribution</h3>')
  for (const [rarity, count] of cardCounts) {
    html.push(`    <p>${rarity}: ${count} cards</p>`)
  }
  html.push(`    <p><strong>Cards with images: ${imagesCount} / ${filled}</strong></p>`)
  html.push('  </div>')
  
  html.push('  <div class="belt-strip">')
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i]
    if (card === null) {
      html.push('    <div class="card-slot blank">BLANK</div>')
    } else {
      const borderColor = getAspectBorderColor(card)
      const hasImage = card.imageUrl ? 'has-image' : ''
      html.push(`    <div class="card-slot ${hasImage}" style="border-color: ${borderColor}; border-width: 2px;">`)
      
      if (card.imageUrl) {
        html.push(`      <img src="${card.imageUrl}" alt="${card.name}" class="card-image" loading="lazy" onerror="this.parentElement.classList.remove('has-image'); this.style.display='none'; this.nextElementSibling.style.display='flex';">`)
        html.push('      <div class="card-overlay">')
        html.push(`        <div class="card-name">${card.name}</div>`)
        html.push(`        <div class="card-rarity">${card.rarity}</div>`)
        html.push('      </div>')
      } else {
        html.push(`      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; text-align: center; background: #2a2a2a; color: rgba(255, 255, 255, 0.87);">`)
        html.push(`        <div style="font-weight: 600; margin-bottom: 4px; font-size: 11px;">${card.name}</div>`)
        html.push(`        <div style="font-size: 9px; color: rgba(255, 255, 255, 0.6);">${card.rarity}</div>`)
        html.push('      </div>')
      }
      
      html.push('    </div>')
    }
  }
  html.push('  </div>')
  
  html.push('</body>')
  html.push('</html>')
  
  return html.join('\n')
}

/**
 * Generate HTML visualization of a sheet with actual card images
 * @param {Object} sheet - Sheet object
 * @returns {string} HTML content with card images
 */
export function visualizeSheetHTML(sheet) {
  let html = []
  html.push('<!DOCTYPE html>')
  html.push('<html>')
  html.push('<head>')
  html.push('  <meta charset="UTF-8">')
  html.push(`  <title>${sheet.type} - ${sheet.variant} (${sheet.setCode})</title>`)
  html.push('  <link rel="preconnect" href="https://fonts.googleapis.com" />')
  html.push('  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />')
  html.push('  <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;800&display=swap" rel="stylesheet" />')
  html.push('  <style>')
  html.push('    body { font-family: "Barlow", system-ui, sans-serif; margin: 20px; background: #242424; color: rgba(255, 255, 255, 0.87); }')
  html.push('    .header { background: #1a1a1a; color: rgba(255, 255, 255, 0.87); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #333; }')
  html.push('    .header h1 { font-weight: 800; color: rgba(255, 255, 255, 0.87); }')
  html.push('    .sheet-grid { display: grid; grid-template-columns: repeat(11, 1fr); gap: 2px; max-width: 2200px; }')
  html.push('    .card-slot { position: relative; aspect-ratio: 5 / 7; background: #1a1a1a; border: 1px solid #333; border-radius: 4px; overflow: hidden; }')
  html.push('    .card-slot.blank { background: #2a2a2a; display: flex; align-items: center; justify-content: center; color: #666; font-size: 12px; }')
  html.push('    .card-slot.has-image { border: 2px solid transparent; }')
  html.push('    .card-image { width: 100%; height: 100%; object-fit: cover; display: block; }')
  html.push('    .card-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); color: white; padding: 4px 6px; font-size: 10px; opacity: 0; transition: opacity 0.2s; }')
  html.push('    .card-slot:hover .card-overlay { opacity: 1; }')
  html.push('    .card-name { font-weight: 600; margin-bottom: 2px; }')
  html.push('    .card-rarity { font-size: 9px; opacity: 0.9; }')
  html.push('    .stats { background: #1a1a1a; color: rgba(255, 255, 255, 0.87); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #333; }')
  html.push('  </style>')
  html.push('</head>')
  html.push('<body>')
  
  html.push('  <div class="header">')
  html.push(`    <h1>${sheet.type} Sheet</h1>`)
  html.push(`    <p>Variant: ${sheet.variant} | Set: ${sheet.setCode}</p>`)
  html.push(`    <p>Size: ${sheet.rows}×${sheet.cols} (${sheet.size} cards) | Filled: ${sheet.metadata.filled} | Blanks: ${sheet.metadata.blanks}</p>`)
  html.push('  </div>')
  
  // Card distribution stats
  const cardCounts = new Map()
  let imagesCount = 0
  for (const card of sheet.cards) {
    if (card !== null) {
      const key = `${card.rarity}`
      cardCounts.set(key, (cardCounts.get(key) || 0) + 1)
      if (card.imageUrl) {
        imagesCount++
      }
    }
  }
  
  html.push('  <div class="stats">')
  html.push('    <h3>Rarity Distribution</h3>')
  for (const [rarity, count] of cardCounts) {
    html.push(`    <p>${rarity}: ${count} cards</p>`)
  }
  html.push(`    <p><strong>Cards with images: ${imagesCount} / ${sheet.metadata.filled}</strong></p>`)
  html.push('  </div>')
  
  html.push('  <div class="sheet-grid">')
  for (let i = 0; i < sheet.cards.length; i++) {
    const card = sheet.cards[i]
    if (card === null) {
      html.push('    <div class="card-slot blank">BLANK</div>')
    } else {
      const borderColor = getAspectBorderColor(card)
      const hasImage = card.imageUrl ? 'has-image' : ''
      html.push(`    <div class="card-slot ${hasImage}" style="border-color: ${borderColor}; border-width: 2px;">`)
      
      if (card.imageUrl) {
        html.push(`      <img src="${card.imageUrl}" alt="${card.name}" class="card-image" loading="lazy" onerror="this.parentElement.classList.remove('has-image'); this.style.display='none'; this.nextElementSibling.style.display='flex';">`)
        html.push('      <div class="card-overlay">')
        html.push(`        <div class="card-name">${card.name}</div>`)
        html.push(`        <div class="card-rarity">${card.rarity}</div>`)
        html.push('      </div>')
      } else {
        html.push(`      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; text-align: center; background: #2a2a2a; color: rgba(255, 255, 255, 0.87);">`)
        html.push(`        <div style="font-weight: 600; margin-bottom: 4px; font-size: 11px;">${card.name}</div>`)
        html.push(`        <div style="font-size: 9px; color: rgba(255, 255, 255, 0.6);">${card.rarity}</div>`)
        html.push('      </div>')
      }
      
      html.push('    </div>')
    }
  }
  html.push('  </div>')
  
  html.push('</body>')
  html.push('</html>')
  
  return html.join('\n')
}

/**
 * Save HTML visualization of a sheet (image-based)
 * @param {Object} sheet - Sheet object
 * @param {string} outputDir - Output directory
 * @param {number|null} index - Optional index for multiple sheets of same type
 */
export function saveSheetHTML(sheet, outputDir = './sheets', index = null) {
  // Create output directory if it doesn't exist
  const setDir = path.join(outputDir, sheet.setCode)
  if (!fs.existsSync(setDir)) {
    fs.mkdirSync(setDir, { recursive: true })
  }
  
  // Generate filename (with optional index for multiple sheets of same type)
  // Special case: common and uncommon BASE sheets should be "common-1.html" not "common-base-1.html"
  // But hyperspace variants should keep the variant name
  let filename
  if (index !== null) {
    if (sheet.type === 'common' && sheet.variant === 'base') {
      filename = `common-${index + 1}.html`
    } else if ((sheet.type === 'uncommon' || sheet.type.startsWith('uncommon-')) && sheet.variant === 'base') {
      filename = `uncommon-${index + 1}.html`
    } else {
      filename = `${sheet.type}-${sheet.variant}-${index + 1}.html`
    }
  } else {
    filename = `${sheet.type}-${sheet.variant}.html`
  }
  const filepath = path.join(setDir, filename)
  
  // Generate HTML (image-based)
  const html = visualizeSheetHTML(sheet)
  
  // Write to file
  fs.writeFileSync(filepath, html, 'utf8')
  
  return filepath
}

/**
 * Generate visualizations for all sheets in a set
 * @param {Object} sheets - Complete sheet collection
 * @param {string} outputDir - Output directory
 */
export function visualizeAllSheets(sheets, outputDir = './sheets') {
  const files = []
  
  // Rare/Legendary
  files.push(saveSheetHTML(sheets.rareLegendary, outputDir))
  files.push(saveSheetVisualization(sheets.rareLegendary, outputDir, true))
  
  // Uncommons
  for (let i = 0; i < sheets.uncommon.length; i++) {
    const sheet = sheets.uncommon[i]
    files.push(saveSheetHTML(sheet, outputDir, i))
  }
  
  // Commons (visualize base sheets which show column uniformity)
  if (sheets.common.sheets && Array.isArray(sheets.common.sheets)) {
    for (let i = 0; i < sheets.common.sheets.length; i++) {
      const sheet = sheets.common.sheets[i]
      files.push(saveSheetHTML(sheet, outputDir, i))
    }
  }
  
  // Also visualize belts (vertical strips, not sheets)
  // New system: belts are objects with cards arrays
  if (sheets.common.belts) {
    // Visualize belt A as a vertical strip
    if (sheets.common.belts.beltA && sheets.common.belts.beltA.cards) {
      const beltACards = sheets.common.belts.beltA.cards
      const setDir = path.join(outputDir, sheets.common.belts.beltA.setCode)
      if (!fs.existsSync(setDir)) {
        fs.mkdirSync(setDir, { recursive: true })
      }
      const filename = 'commonBeltA-base.html'
      const filepath = path.join(setDir, filename)
      const html = visualizeBeltHTML(beltACards, 'Common Belt A', sheets.common.belts.beltA.setCode)
      fs.writeFileSync(filepath, html, 'utf8')
      files.push(filepath)
    }
    // Visualize belt B as a vertical strip
    if (sheets.common.belts.beltB && sheets.common.belts.beltB.cards) {
      const beltBCards = sheets.common.belts.beltB.cards
      const setDir = path.join(outputDir, sheets.common.belts.beltB.setCode)
      if (!fs.existsSync(setDir)) {
        fs.mkdirSync(setDir, { recursive: true })
      }
      const filename = 'commonBeltB-base.html'
      const filepath = path.join(setDir, filename)
      const html = visualizeBeltHTML(beltBCards, 'Common Belt B', sheets.common.belts.beltB.setCode)
      fs.writeFileSync(filepath, html, 'utf8')
      files.push(filepath)
    }
  } else if (sheets.common.beltA && Array.isArray(sheets.common.beltA)) {
    // Fallback for old format (belt sheets already exist)
    for (let i = 0; i < sheets.common.beltA.length; i++) {
      const sheet = sheets.common.beltA[i]
      files.push(saveSheetHTML(sheet, outputDir, i))
    }
    if (sheets.common.beltB && Array.isArray(sheets.common.beltB)) {
      for (let i = 0; i < sheets.common.beltB.length; i++) {
        const sheet = sheets.common.beltB[i]
        files.push(saveSheetHTML(sheet, outputDir, i))
      }
    }
  }
  
  // Leader
  files.push(saveSheetHTML(sheets.leader, outputDir))
  files.push(saveSheetVisualization(sheets.leader, outputDir, true))
  
  // Bases
  files.push(saveSheetHTML(sheets.bases, outputDir))
  
  // Foil (now multiple sheets for full coverage)
  if (Array.isArray(sheets.foil)) {
    sheets.foil.forEach((sheet, index) => {
      files.push(saveSheetHTML(sheet, outputDir, index))
    })
  } else {
    files.push(saveSheetHTML(sheets.foil, outputDir))
  }
  
  // Hyperspace variants
  if (sheets.hyperspaceRareLegendary) {
    files.push(saveSheetHTML(sheets.hyperspaceRareLegendary, outputDir))
  }
  
  if (sheets.hyperspaceUncommon && Array.isArray(sheets.hyperspaceUncommon)) {
    for (let i = 0; i < sheets.hyperspaceUncommon.length; i++) {
      files.push(saveSheetHTML(sheets.hyperspaceUncommon[i], outputDir, i))
    }
  }
  
  if (sheets.hyperspaceLeader) {
    files.push(saveSheetHTML(sheets.hyperspaceLeader, outputDir))
  }
  
  if (sheets.hyperspaceBases) {
    files.push(saveSheetHTML(sheets.hyperspaceBases, outputDir))
  }
  
  if (sheets.hyperspaceFoil) {
    if (Array.isArray(sheets.hyperspaceFoil)) {
      sheets.hyperspaceFoil.forEach((sheet, index) => {
        files.push(saveSheetHTML(sheet, outputDir, index))
      })
    } else {
      files.push(saveSheetHTML(sheets.hyperspaceFoil, outputDir))
    }
  }
  
  // Generate index.html for this set
  const indexPath = generateSetIndex(sheets, outputDir)
  files.push(indexPath)
  
  return files
}

/**
 * Generate an index.html page for a set listing all sheets
 * @param {Object} sheets - Complete sheet collection
 * @param {string} outputDir - Output directory
 * @returns {string} Path to generated index.html
 */
function generateSetIndex(sheets, outputDir) {
  const setCode = sheets.rareLegendary?.setCode || sheets.leader?.setCode || 'Unknown'
  const setDir = path.join(outputDir, setCode)
  
  if (!fs.existsSync(setDir)) {
    fs.mkdirSync(setDir, { recursive: true })
  }
  
  const html = []
  html.push('<!DOCTYPE html>')
  html.push('<html lang="en">')
  html.push('<head>')
  html.push('  <meta charset="UTF-8">')
  html.push('  <meta name="viewport" content="width=device-width, initial-scale=1.0">')
  html.push(`  <title>${setCode} Sheet Visualizations</title>`)
  html.push('  <link rel="preconnect" href="https://fonts.googleapis.com" />')
  html.push('  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />')
  html.push('  <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;800&display=swap" rel="stylesheet" />')
  html.push('  <style>')
  html.push('    body { font-family: "Barlow", system-ui, sans-serif; margin: 40px; background: #242424; color: rgba(255, 255, 255, 0.87); }')
  html.push('    .container { max-width: 1200px; margin: 0 auto; background: #1a1a1a; padding: 40px; border-radius: 8px; border: 1px solid #333; }')
  html.push('    h1 { color: rgba(255, 255, 255, 0.87); font-weight: 800; border-bottom: 3px solid #646cff; padding-bottom: 10px; }')
  html.push('    h2 { color: rgba(255, 255, 255, 0.87); font-weight: 800; margin-top: 30px; border-bottom: 2px solid #333; padding-bottom: 8px; }')
  html.push('    .sheet-section { margin: 20px 0; }')
  html.push('    .sheet-links { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; margin: 15px 0; }')
  html.push('    .sheet-link { display: block; padding: 12px 16px; background: #646cff; color: white; text-decoration: none; border-radius: 8px; transition: all 0.25s; font-weight: 500; border: 1px solid transparent; }')
  html.push('    .sheet-link:hover { background: #535bf2; border-color: #646cff; }')
  html.push('    .sheet-link.hyperspace { background: #6610f2; }')
  html.push('    .sheet-link.hyperspace:hover { background: #520dc2; border-color: #6610f2; }')
  html.push('    .sheet-link.foil { background: #ffc107; color: #1a1a1a; }')
  html.push('    .sheet-link.foil:hover { background: #e0a800; border-color: #ffc107; }')
  html.push('    .sheet-link.belt { background: #28a745; }')
  html.push('    .sheet-link.belt:hover { background: #218838; border-color: #28a745; }')
  html.push('    .description { color: rgba(255, 255, 255, 0.6); margin: 10px 0; line-height: 1.6; }')
  html.push('  </style>')
  html.push('</head>')
  html.push('<body>')
  html.push('  <div class="container">')
  html.push(`    <h1>${setCode} Sheet Visualizations</h1>`)
  html.push('    <p class="description">This page provides access to all generated sheet visualizations for this set, including base sheets, hyperspace variants, foil sheets, and belts.</p>')
  
  // Base Sheets Section
  html.push('    <h2>Base Sheets</h2>')
  html.push('    <div class="sheet-section">')
  html.push('      <div class="sheet-links">')
  html.push('        <a href="rare-legendary-base.html" class="sheet-link">Rare/Legendary Sheet</a>')
  html.push('        <a href="uncommon-1.html" class="sheet-link">Uncommon Sheet</a>')
  html.push('        <a href="leader-base.html" class="sheet-link">Leader Sheet</a>')
  html.push('        <a href="bases-base.html" class="sheet-link">Bases Sheet</a>')
  html.push('      </div>')
  html.push('    </div>')
  
  // Common Sheets
  html.push('    <h2>Common Sheets</h2>')
  html.push('    <div class="sheet-section">')
  html.push('      <p class="description">Common sheets with alternating column colors (blue/green vs red/yellow)</p>')
  html.push('      <div class="sheet-links">')
  html.push('        <a href="common-1.html" class="sheet-link">Common Sheet 1</a>')
  html.push('        <a href="common-2.html" class="sheet-link">Common Sheet 2</a>')
  html.push('        <a href="common-3.html" class="sheet-link">Common Sheet 3</a>')
  html.push('      </div>')
  html.push('    </div>')
  
  // Belts
  html.push('    <h2>Common Belts</h2>')
  html.push('    <div class="sheet-section">')
  html.push('      <p class="description">Belts are created by cutting sheets into columns and taping them end-to-end</p>')
  html.push('      <div class="sheet-links">')
  html.push('        <a href="commonBeltA-base.html" class="sheet-link belt">Belt A (Odd Columns)</a>')
  html.push('        <a href="commonBeltB-base.html" class="sheet-link belt">Belt B (Even Columns)</a>')
  html.push('      </div>')
  html.push('    </div>')
  
  // Foil Sheets
  html.push('    <h2>Foil Sheets</h2>')
  html.push('    <div class="sheet-section">')
  html.push('      <p class="description">Multiple foil sheets for full coverage of all foilable cards</p>')
  html.push('      <div class="sheet-links">')
  for (let i = 1; i <= 8; i++) {
    html.push(`        <a href="foil-foil-${i}.html" class="sheet-link foil">Foil Sheet ${i}</a>`)
  }
  html.push('      </div>')
  html.push('    </div>')
  
  // Hyperspace Section
  html.push('    <h2>Hyperspace Variants</h2>')
  html.push('    <div class="sheet-section">')
  html.push('      <p class="description">Hyperspace versions of all base sheets</p>')
  html.push('      <div class="sheet-links">')
  html.push('        <a href="rare-legendary-hyperspace.html" class="sheet-link hyperspace">R/L Hyperspace</a>')
  html.push('        <a href="uncommon-1-hyperspace-1.html" class="sheet-link hyperspace">Uncommon Hyperspace</a>')
  html.push('        <a href="leader-hyperspace.html" class="sheet-link hyperspace">Leader Hyperspace</a>')
  html.push('        <a href="bases-hyperspace.html" class="sheet-link hyperspace">Bases Hyperspace</a>')
  html.push('      </div>')
  html.push('    </div>')
  
  // Hyperspace Foil Sheets
  html.push('    <h2>Hyperspace Foil Sheets</h2>')
  html.push('    <div class="sheet-section">')
  html.push('      <div class="sheet-links">')
  for (let i = 1; i <= 8; i++) {
    html.push(`        <a href="foil-hyperspace-${i}.html" class="sheet-link hyperspace foil">HS Foil ${i}</a>`)
  }
  html.push('      </div>')
  html.push('    </div>')
  
  html.push('  </div>')
  html.push('</body>')
  html.push('</html>')
  
  const filepath = path.join(setDir, 'index.html')
  fs.writeFileSync(filepath, html.join('\n'), 'utf8')
  
  return filepath
}

/**
 * Generate the main index.html that lists all sets and their sheets
 * @param {string} outputDir - Output directory
 * @returns {string} Path to generated index.html
 */
export async function generateMainIndex(outputDir = './sheets') {
  const { getSetConfig } = await import('./setConfigs/index.js')
  const indexPath = path.join(outputDir, 'index.html')
  
  // Scan all set directories to discover actual files
  const SETS = ['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC']
  const sheetData = {}
  
  for (const setCode of SETS) {
    const setDir = path.join(outputDir, setCode)
    if (!fs.existsSync(setDir)) continue
    
    const config = getSetConfig(setCode)
    if (!config) continue
    
    // Scan for actual HTML files (excluding index.html)
    const files = fs.readdirSync(setDir)
      .filter(f => f.endsWith('.html') && f !== 'index.html')
      .sort()
    
    // Organize files by type
    const sheets = {
      'Base': [],
      'Rare/Legendary': [],
      'Uncommon': [],
      'Common': [],
      'Common Belt A': [],
      'Common Belt B': [],
      'Leader': [],
      'Foil': [],
      'Foil Hyperspace': []
    }
    
    for (const file of files) {
      if (file.startsWith('bases-') || file === 'base-base.html') {
        sheets['Base'].push(file)
      } else if (file.startsWith('rare-legendary-')) {
        sheets['Rare/Legendary'].push(file)
      } else if (file.startsWith('uncommon-')) {
        sheets['Uncommon'].push(file)
      } else if (file.startsWith('common-') && !file.includes('Belt')) {
        sheets['Common'].push(file)
      } else if (file.startsWith('commonBeltA-')) {
        sheets['Common Belt A'].push(file)
      } else if (file.startsWith('commonBeltB-')) {
        sheets['Common Belt B'].push(file)
      } else if (file.startsWith('leader-')) {
        sheets['Leader'].push(file)
      } else if (file.startsWith('foil-foil-')) {
        sheets['Foil'].push(file)
      } else if (file.startsWith('foil-hyperspace-')) {
        sheets['Foil Hyperspace'].push(file)
      }
    }
    
    // Sort files within each category for consistent display
    Object.keys(sheets).forEach(key => {
      sheets[key].sort()
    })
    
    // Remove empty categories
    Object.keys(sheets).forEach(key => {
      if (sheets[key].length === 0) {
        delete sheets[key]
      }
    })
    
    sheetData[setCode] = {
      name: config.setName,
      setNumber: config.setNumber,
      sheets: sheets
    }
  }
  
  // Generate HTML
  const html = []
  html.push('<!DOCTYPE html>')
  html.push('<html lang="en">')
  html.push('<head>')
  html.push('  <meta charset="UTF-8">')
  html.push('  <meta name="viewport" content="width=device-width, initial-scale=1.0">')
  html.push('  <title>Sheet Visualization Explorer</title>')
  html.push('  <style>')
  html.push('    * {')
  html.push('      margin: 0;')
  html.push('      padding: 0;')
  html.push('      box-sizing: border-box;')
  html.push('    }')
  html.push('    body {')
  html.push('      font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;')
  html.push('      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);')
  html.push('      min-height: 100vh;')
  html.push('      padding: 20px;')
  html.push('      color: #333;')
  html.push('    }')
  html.push('    .container {')
  html.push('      max-width: 1400px;')
  html.push('      margin: 0 auto;')
  html.push('    }')
  html.push('    .header {')
  html.push('      background: white;')
  html.push('      padding: 30px;')
  html.push('      border-radius: 12px;')
  html.push('      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);')
  html.push('      margin-bottom: 30px;')
  html.push('      text-align: center;')
  html.push('    }')
  html.push('    .header h1 {')
  html.push('      font-size: 2.5em;')
  html.push('      margin-bottom: 10px;')
  html.push('      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);')
  html.push('      -webkit-background-clip: text;')
  html.push('      -webkit-text-fill-color: transparent;')
  html.push('      background-clip: text;')
  html.push('    }')
  html.push('    .header p {')
  html.push('      color: #666;')
  html.push('      font-size: 1.1em;')
  html.push('    }')
  html.push('    .sets-grid {')
  html.push('      display: grid;')
  html.push('      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));')
  html.push('      gap: 25px;')
  html.push('      margin-bottom: 30px;')
  html.push('    }')
  html.push('    .set-card {')
  html.push('      background: white;')
  html.push('      border-radius: 12px;')
  html.push('      padding: 25px;')
  html.push('      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);')
  html.push('      transition: transform 0.2s, box-shadow 0.2s;')
  html.push('    }')
  html.push('    .set-card:hover {')
  html.push('      transform: translateY(-5px);')
  html.push('      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);')
  html.push('    }')
  html.push('    .set-header {')
  html.push('      display: flex;')
  html.push('      align-items: center;')
  html.push('      justify-content: space-between;')
  html.push('      margin-bottom: 20px;')
  html.push('      padding-bottom: 15px;')
  html.push('      border-bottom: 2px solid #f0f0f0;')
  html.push('    }')
  html.push('    .set-code {')
  html.push('      font-size: 2em;')
  html.push('      font-weight: bold;')
  html.push('      color: #667eea;')
  html.push('    }')
  html.push('    .set-count {')
  html.push('      background: #f0f0f0;')
  html.push('      padding: 5px 12px;')
  html.push('      border-radius: 20px;')
  html.push('      font-size: 0.9em;')
  html.push('      color: #666;')
  html.push('    }')
  html.push('    .sheet-category {')
  html.push('      margin-bottom: 20px;')
  html.push('    }')
  html.push('    .category-title {')
  html.push('      font-size: 0.9em;')
  html.push('      font-weight: 600;')
  html.push('      color: #888;')
  html.push('      text-transform: uppercase;')
  html.push('      letter-spacing: 1px;')
  html.push('      margin-bottom: 10px;')
  html.push('    }')
  html.push('    .sheet-links {')
  html.push('      display: flex;')
  html.push('      flex-wrap: wrap;')
  html.push('      gap: 8px;')
  html.push('    }')
  html.push('    .sheet-link {')
  html.push('      display: inline-block;')
  html.push('      padding: 8px 14px;')
  html.push('      background: #f8f9fa;')
  html.push('      color: #333;')
  html.push('      text-decoration: none;')
  html.push('      border-radius: 6px;')
  html.push('      font-size: 0.9em;')
  html.push('      transition: all 0.2s;')
  html.push('      border: 1px solid #e0e0e0;')
  html.push('    }')
  html.push('    .sheet-link:hover {')
  html.push('      background: #667eea;')
  html.push('      color: white;')
  html.push('      border-color: #667eea;')
  html.push('      transform: translateY(-2px);')
  html.push('    }')
  html.push('    .stats {')
  html.push('      background: white;')
  html.push('      padding: 20px;')
  html.push('      border-radius: 12px;')
  html.push('      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);')
  html.push('      text-align: center;')
  html.push('    }')
  html.push('    .stats-grid {')
  html.push('      display: grid;')
  html.push('      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));')
  html.push('      gap: 20px;')
  html.push('      margin-top: 15px;')
  html.push('    }')
  html.push('    .stat-item {')
  html.push('      padding: 15px;')
  html.push('      background: #f8f9fa;')
  html.push('      border-radius: 8px;')
  html.push('    }')
  html.push('    .stat-value {')
  html.push('      font-size: 2em;')
  html.push('      font-weight: bold;')
  html.push('      color: #667eea;')
  html.push('    }')
  html.push('    .stat-label {')
  html.push('      color: #666;')
  html.push('      font-size: 0.9em;')
  html.push('      margin-top: 5px;')
  html.push('    }')
  html.push('    @media (max-width: 768px) {')
  html.push('      .sets-grid {')
  html.push('        grid-template-columns: 1fr;')
  html.push('      }')
  html.push('      .header h1 {')
  html.push('        font-size: 2em;')
  html.push('      }')
  html.push('    }')
  html.push('  </style>')
  html.push('</head>')
  html.push('<body>')
  html.push('  <div class="container">')
  html.push('    <div class="header">')
  html.push('      <h1>📊 Sheet Visualization Explorer</h1>')
  html.push('      <p>Browse and explore all print sheet visualizations</p>')
  html.push('    </div>')
  html.push('    <div class="sets-grid" id="setsGrid">')
  html.push('      <!-- Sets will be populated by JavaScript -->')
  html.push('    </div>')
  html.push('    <div class="stats">')
  html.push('      <h2>Statistics</h2>')
  html.push('      <div class="stats-grid">')
  html.push('        <div class="stat-item">')
  html.push('          <div class="stat-value" id="totalSets">6</div>')
  html.push('          <div class="stat-label">Sets</div>')
  html.push('        </div>')
  html.push('        <div class="stat-item">')
  html.push('          <div class="stat-value" id="totalSheets">0</div>')
  html.push('          <div class="stat-label">Total Sheets</div>')
  html.push('        </div>')
  html.push('        <div class="stat-item">')
  html.push('          <div class="stat-value" id="totalTypes">0</div>')
  html.push('          <div class="stat-label">Sheet Types</div>')
  html.push('        </div>')
  html.push('      </div>')
  html.push('    </div>')
  html.push('  </div>')
  html.push('  <script>')
  html.push('    // Sheet data organized by set (ordered 1-6: SOR, SHD, TWI, JTL, LOF, SEC)')
  html.push('    const sheetData = ' + JSON.stringify(sheetData, null, 2) + ';')
  html.push('    function renderSets() {')
  html.push('      const setsGrid = document.getElementById(\'setsGrid\');')
  html.push('      let totalSheets = 0;')
  html.push('      const allTypes = new Set();')
  html.push('      const sortedSets = Object.entries(sheetData).sort((a, b) => {')
  html.push('        return a[1].setNumber - b[1].setNumber;')
  html.push('      });')
  html.push('      sortedSets.forEach(([setCode, setInfo]) => {')
  html.push('        const setCard = document.createElement(\'div\');')
  html.push('        setCard.className = \'set-card\';')
  html.push('        let sheetCount = 0;')
  html.push('        Object.values(setInfo.sheets).forEach(sheets => {')
  html.push('          sheetCount += sheets.length;')
  html.push('          totalSheets += sheets.length;')
  html.push('        });')
  html.push('        Object.keys(setInfo.sheets).forEach(type => allTypes.add(type));')
  html.push('        setCard.innerHTML = `')
  html.push('          <div class="set-header">')
  html.push('            <div>')
  html.push('              <div class="set-code">${setCode}</div>')
  html.push('              <div style="color: #666; font-size: 0.9em; margin-top: 5px;">${setInfo.name}</div>')
  html.push('            </div>')
  html.push('            <div class="set-count">${sheetCount} sheets</div>')
  html.push('          </div>')
  html.push('          ${Object.entries(setInfo.sheets).map(([category, sheets]) => `')
  html.push('            <div class="sheet-category">')
  html.push('              <div class="category-title">${category}</div>')
  html.push('              <div class="sheet-links">')
  html.push('                ${sheets.map(sheet => {')
  html.push('                  let baseName = sheet.replace(\'.html\', \'\').replace(/-/g, \' \');')
  html.push('                  baseName = baseName.replace(/\\s+base$/, \'\');')
  html.push('                  return `')
  html.push('                    <a href="${setCode}/${sheet}" class="sheet-link" title="View sheet">${baseName}</a>')
  html.push('                  `')
  html.push('                }).join(\'\')}')
  html.push('              </div>')
  html.push('            </div>')
  html.push('          `).join(\'\')}')
  html.push('        `;')
  html.push('        setsGrid.appendChild(setCard);')
  html.push('      });')
  html.push('      document.getElementById(\'totalSheets\').textContent = totalSheets;')
  html.push('      document.getElementById(\'totalTypes\').textContent = allTypes.size;')
  html.push('    }')
  html.push('    renderSets();')
  html.push('  </script>')
  html.push('</body>')
  html.push('</html>')
  
  fs.writeFileSync(indexPath, html.join('\n'), 'utf8')
  return indexPath
}
