// API utilities for fetching data from swu-db.com

import { getCardsBySet } from './cardData.js'
import { getPackArtUrl } from './packArt.js'

const SWUDB_BASE_URL = 'https://swudb.com'
const SWU_DB_API_BASE = 'https://api.swu-db.com'

/**
 * Fetch all sets from swudb.com
 * Returns array of set objects with code, name, and imageUrl
 */
export async function fetchSets() {
  try {
    // Try GraphQL API first
    const response = await fetch(`${SWUDB_BASE_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            sets {
              code
              name
              releaseDate
            }
          }
        `,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.data && data.data.sets) {
        return data.data.sets.map((set) => ({
          ...set,
          imageUrl: getPackArtUrl(set.code),
        }))
      }
    }
  } catch (error) {
    console.warn('GraphQL API failed, trying alternative method', error)
  }

  // Fallback: Use hardcoded set data for the first 6 sets
  // Based on actual SWU expansion sets from swudb.com
  // The 6 expansion sets are:
  // 1. Spark of Rebellion, 2. Shadows of the Galaxy, 3. Twilight of the Republic,
  // 4. Jump to Lightspeed, 5. Legends of the Force, 6. Secrets of Power
  const knownSets = [
    { code: 'SOR', name: 'Spark of Rebellion', releaseDate: '2024-03-08' },
    { code: 'SHD', name: 'Shadows of the Galaxy', releaseDate: '2024-07-12' },
    { code: 'TWI', name: 'Twilight of the Republic', releaseDate: '2024-11-08' },
    { code: 'JTL', name: 'Jump to Lightspeed', releaseDate: '2025-03-14' },
    { code: 'LOF', name: 'Legends of the Force', releaseDate: '2025-07-11' },
    { code: 'SEC', name: 'Secrets of Power', releaseDate: '2025-11-07' },
  ]

  return knownSets.map((set) => ({
    ...set,
    imageUrl: getPackArtUrl(set.code),
  }))
}

/**
 * Fetch all cards for a specific set
 * Returns array of card objects with imageUrl, rarity, type, etc.
 */
export async function fetchSetCards(setCode) {
  // Try swu-db.com API first (the official API)
  try {
    const response = await fetch(`${SWU_DB_API_BASE}/cards/${setCode.toLowerCase()}?format=json`)
    if (response.ok) {
      const data = await response.json()
      if (data.data && Array.isArray(data.data)) {
        // Transform API response to our card schema
        return data.data.map(card => ({
          id: `${card.Set}-${card.Number}`,
          name: card.Name,
          subtitle: card.Subtitle || null,
          set: card.Set,
          number: card.Number,
          rarity: card.Rarity,
          type: card.Type,
          aspects: card.Aspects || [],
          traits: card.Traits || [],
          arenas: card.Arenas || [],
          cost: card.Cost ? parseInt(card.Cost) : null,
          power: card.Power ? parseInt(card.Power) : null,
          hp: card.HP ? parseInt(card.HP) : null,
          frontText: card.FrontText || null,
          backText: card.BackText || null,
          epicAction: card.EpicAction || null,
          keywords: card.Keywords || [],
          artist: card.Artist || null,
          unique: card.Unique || false,
          doubleSided: card.DoubleSided || false,
          variantType: card.VariantType || 'Normal',
          marketPrice: card.MarketPrice ? parseFloat(card.MarketPrice) : null,
          lowPrice: card.LowPrice ? parseFloat(card.LowPrice) : null,
          isLeader: card.Type === 'Leader',
          isBase: card.Type === 'Base',
          imageUrl: card.FrontArt || null,
          backImageUrl: card.BackArt || null,
        }))
      }
    }
  } catch (error) {
    console.warn('swu-db.com API failed, trying local data', error)
  }

  // Fallback: Load from local card data file
  try {
    const localCards = getCardsBySet(setCode)
    if (localCards.length > 0) {
      console.log(`Loaded ${localCards.length} cards from local data for set ${setCode}`)
      return localCards
    }
  } catch (error) {
    console.warn('Failed to load local card data', error)
  }

  // If all methods fail, return empty array
  // The component should handle this gracefully
  console.warn(`Unable to fetch card data for set ${setCode}. Card data file may need to be populated.`)
  return []
}
