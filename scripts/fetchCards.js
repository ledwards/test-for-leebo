// Script to fetch all cards from swuapi.com API and populate cards.json
// Automatically runs post-processing to apply fixes

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_URL = 'https://api.swuapi.com/export/all'
const SETS = [
  { code: 'SOR', name: 'Spark of Rebellion' },
  { code: 'SHD', name: 'Shadows of the Galaxy' },
  { code: 'TWI', name: 'Twilight of the Republic' },
  { code: 'JTL', name: 'Jump to Lightspeed' },
  { code: 'LOF', name: 'Legends of the Force' },
  { code: 'SEC', name: 'Secrets of Power' },
]

// Set codes we want to include
const VALID_SET_CODES = new Set(SETS.map(s => s.code))

/**
 * Fetch all cards from the export endpoint
 */
async function fetchAllCardsFromAPI() {
  console.log(`Fetching all cards from ${API_URL}...`)

  try {
    const response = await fetch(API_URL)
    if (response.ok) {
      const data = await response.json()
      // API returns { cards: [...] }
      return data.cards || []
    } else {
      console.error(`Error fetching cards: ${response.status}`)
      return []
    }
  } catch (error) {
    console.error(`Error fetching cards:`, error.message)
    return []
  }
}

/**
 * Transform API card data to our card schema
 */
function transformCard(apiCard) {
  const setCode = apiCard.setCode || ''
  const cardNumber = apiCard.cardNumber || ''
  // Use strapiId as unique identifier (setCode-cardNumber is NOT unique across variants)
  const id = String(apiCard.strapiId)
  // Keep cardId for display purposes (e.g., "SOR-11")
  const cardId = `${setCode}-${cardNumber}`

  // Normalize arena to array (API uses singular 'arena')
  let arenas = []
  if (apiCard.arena) {
    arenas = Array.isArray(apiCard.arena) ? apiCard.arena : [apiCard.arena]
  }

  // Normalize variantType - map API values to our expected values
  let variantType = apiCard.variantType || 'Normal'
  // Map swuapi.com variant types to our expected values
  const variantTypeMap = {
    'Standard': 'Normal',
    'Standard Foil': 'Foil',
    // 'Hyperspace' stays as is
    // 'Hyperspace Foil' stays as is
    // 'Showcase' stays as is
  }
  if (variantTypeMap[variantType]) {
    variantType = variantTypeMap[variantType]
  }

  // Determine isFoil based on variantType (not the hasFoil flag which indicates if foil exists)
  const isFoil = variantType === 'Foil' || variantType === 'Hyperspace Foil'

  return {
    id,
    cardId,
    name: apiCard.name || '',
    subtitle: apiCard.subtitle || null,
    set: setCode,
    number: cardNumber,
    rarity: apiCard.rarity || 'Common',
    type: apiCard.type || '',
    aspects: apiCard.aspects || [],
    traits: apiCard.traits || [],
    arenas,
    cost: apiCard.cost !== null && apiCard.cost !== undefined ? parseInt(apiCard.cost) : null,
    power: apiCard.power !== null && apiCard.power !== undefined ? parseInt(apiCard.power) : null,
    hp: apiCard.hp !== null && apiCard.hp !== undefined ? parseInt(apiCard.hp) : null,
    frontText: apiCard.text || null,
    backText: apiCard.backText || null,
    epicAction: apiCard.epicAction || null,
    keywords: apiCard.keywords || [],
    artist: apiCard.artist || null,
    unique: apiCard.isUnique || false,
    doubleSided: !!(apiCard.backImageUrl),
    variantType,
    marketPrice: null, // Not available in swuapi.com
    lowPrice: null, // Not available in swuapi.com
    isLeader: apiCard.isLeader || false,
    isBase: apiCard.isBase || false,
    isFoil,
    isHyperspace: variantType === 'Hyperspace' || variantType === 'Hyperspace Foil',
    isShowcase: variantType === 'Showcase',
    imageUrl: apiCard.frontImageUrl || null,
    backImageUrl: apiCard.backImageUrl || null,
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting card data fetch from swuapi.com API...')
  console.log(`Sets to include: ${SETS.map(s => s.code).join(', ')}`)

  const apiCards = await fetchAllCardsFromAPI()

  if (apiCards.length === 0) {
    console.error('No cards fetched from API!')
    process.exit(1)
  }

  console.log(`\n✓ Fetched ${apiCards.length} total cards from API`)

  // Filter to only our desired sets and transform
  const allCards = apiCards
    .filter(card => VALID_SET_CODES.has(card.setCode))
    .map(card => transformCard(card))

  console.log(`\n✓ Total cards fetched: ${allCards.length}`)

  // Prepare output data
  const output = {
    cards: allCards,
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      description: 'Star Wars: Unlimited card database fetched from swuapi.com API',
      totalCards: allCards.length,
      sets: SETS.map(s => ({
        code: s.code,
        name: s.name,
        cardCount: allCards.filter(c => c.set === s.code).length,
      })),
    },
  }

  // Write raw data (before post-processing)
  const rawDataPath = path.join(__dirname, '../src/data/cards.raw.json')
  fs.writeFileSync(rawDataPath, JSON.stringify(output, null, 2))
  console.log(`\n✓ Raw data written to ${rawDataPath}`)

  // Write to cards.json (will be overwritten by post-processing)
  const outputPath = path.join(__dirname, '../src/data/cards.json')
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
  console.log(`✓ Cards written to ${outputPath}`)

  console.log(`\nCard counts by set:`)
  SETS.forEach(set => {
    const count = allCards.filter(c => c.set === set.code).length
    console.log(`  ${set.code}: ${count} cards`)
  })

  // Run post-processing
  console.log('\n' + '='.repeat(50))
  console.log('Running post-processing...')
  console.log('='.repeat(50) + '\n')

  try {
    execSync('node scripts/postProcessCards.js', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    })
  } catch (error) {
    console.error('Error running post-processing:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)
