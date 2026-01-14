// Script to fetch all cards from swu-db.com API and populate cards.json

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_BASE = 'https://api.swu-db.com'
const SETS = [
  { code: 'SOR', name: 'Spark of Rebellion' },
  { code: 'SHD', name: 'Shadows of the Galaxy' },
  { code: 'TWI', name: 'Twilight of the Republic' },
  { code: 'JTL', name: 'Jump to Lightspeed' },
  { code: 'LOF', name: 'Legends of the Force' },
  { code: 'SEC', name: 'Secrets of Power' },
]

/**
 * Fetch all cards for a set using the set endpoint
 */
async function fetchSetCardsFromAPI(setCode) {
  const url = `${API_BASE}/cards/${setCode.toLowerCase()}?format=json`
  
  try {
    const response = await fetch(url)
    if (response.ok) {
      const data = await response.json()
      // API returns { total_cards, data: [...] }
      return data.data || []
    } else {
      console.warn(`Error fetching set ${setCode}: ${response.status}`)
      return []
    }
  } catch (error) {
    console.warn(`Error fetching set ${setCode}:`, error.message)
    return []
  }
}

/**
 * Transform API card data to our card schema
 */
function transformCard(apiCard) {
  return {
    id: `${apiCard.Set}-${apiCard.Number}`,
    name: apiCard.Name,
    subtitle: apiCard.Subtitle || null,
    set: apiCard.Set,
    number: apiCard.Number,
    rarity: apiCard.Rarity,
    type: apiCard.Type,
    aspects: apiCard.Aspects || [],
    traits: apiCard.Traits || [],
    arenas: apiCard.Arenas || [],
    cost: apiCard.Cost ? parseInt(apiCard.Cost) : null,
    power: apiCard.Power ? parseInt(apiCard.Power) : null,
    hp: apiCard.HP ? parseInt(apiCard.HP) : null,
    frontText: apiCard.FrontText || null,
    backText: apiCard.BackText || null,
    epicAction: apiCard.EpicAction || null,
    keywords: apiCard.Keywords || [],
    artist: apiCard.Artist || null,
    unique: apiCard.Unique || false,
    doubleSided: apiCard.DoubleSided || false,
    variantType: apiCard.VariantType || 'Normal',
    marketPrice: apiCard.MarketPrice ? parseFloat(apiCard.MarketPrice) : null,
    lowPrice: apiCard.LowPrice ? parseFloat(apiCard.LowPrice) : null,
    isLeader: apiCard.Type === 'Leader',
    isBase: apiCard.Type === 'Base',
    imageUrl: apiCard.FrontArt || null,
    backImageUrl: apiCard.BackArt || null,
  }
}

/**
 * Fetch all cards for a set
 */
async function fetchSetCards(setCode) {
  console.log(`\nFetching cards for ${setCode}...`)
  
  const apiCards = await fetchSetCardsFromAPI(setCode)
  
  if (apiCards.length === 0) {
    console.warn(`  No cards found for ${setCode}`)
    return []
  }

  // Transform all cards
  const cards = apiCards.map(card => transformCard(card))
  
  console.log(`  ✓ Fetched ${cards.length} cards from ${setCode}`)
  return cards
}

/**
 * Main function
 */
async function main() {
  console.log('Starting card data fetch from swu-db.com API...')
  console.log(`Sets to fetch: ${SETS.map(s => s.code).join(', ')}`)
  
  const allCards = []
  
  for (const set of SETS) {
    try {
      const cards = await fetchSetCards(set.code)
      allCards.push(...cards)
    } catch (error) {
      console.error(`Error fetching ${set.code}:`, error)
    }
  }
  
  console.log(`\n✓ Total cards fetched: ${allCards.length}`)
  
  // Write to cards.json
  const outputPath = path.join(__dirname, '../src/data/cards.json')
  const output = {
    cards: allCards,
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      description: 'Star Wars: Unlimited card database fetched from swu-db.com API',
      totalCards: allCards.length,
      sets: SETS.map(s => ({
        code: s.code,
        name: s.name,
        cardCount: allCards.filter(c => c.set === s.code).length,
      })),
    },
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
  console.log(`\n✓ Cards written to ${outputPath}`)
  console.log(`\nCard counts by set:`)
  SETS.forEach(set => {
    const count = allCards.filter(c => c.set === set.code).length
    console.log(`  ${set.code}: ${count} cards`)
  })
}

main().catch(console.error)
