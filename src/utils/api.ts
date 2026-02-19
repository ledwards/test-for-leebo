// @ts-nocheck
// API utilities for fetching card/set data

import { getCardsBySet } from './cardData'
import { getPackArtUrl } from './packArt'
import type { RawCard } from './cardData'

interface SetInfo {
  code: string
  name: string
  releaseDate: string
  beta?: boolean
  imageUrl: string | null
}

interface FetchSetsOptions {
  includeBeta?: boolean
}

/**
 * Fetch all sets
 * Returns array of set objects with code, name, and imageUrl
 * @param options - Options
 * @param options.includeBeta - Include beta sets (default: false)
 */
export async function fetchSets({ includeBeta = false }: FetchSetsOptions = {}): Promise<SetInfo[]> {
  // Use hardcoded set data for the expansion sets
  // External API calls fail due to CORS, so we use local data
  const knownSets = [
    { code: 'SOR', name: 'Spark of Rebellion', releaseDate: '2024-03-08' },
    { code: 'SHD', name: 'Shadows of the Galaxy', releaseDate: '2024-07-12' },
    { code: 'TWI', name: 'Twilight of the Republic', releaseDate: '2024-11-08' },
    { code: 'JTL', name: 'Jump to Lightspeed', releaseDate: '2025-03-14' },
    { code: 'LOF', name: 'Legends of the Force', releaseDate: '2025-07-11' },
    { code: 'SEC', name: 'Secrets of Power', releaseDate: '2025-11-07' },
    { code: 'LAW', name: 'A Lawless Time', releaseDate: '2026-03-13' },
  ]

  // Filter out beta sets unless explicitly requested
  const filteredSets = includeBeta
    ? knownSets
    : knownSets.filter((set) => !set.beta)

  return filteredSets.map((set) => ({
    ...set,
    imageUrl: getPackArtUrl(set.code),
  }))
}

/**
 * Fetch all cards for a specific set
 * Returns array of card objects with imageUrl, rarity, type, etc.
 */
export async function fetchSetCards(setCode: string): Promise<RawCard[]> {
  // Load from local card data file
  // External API calls fail due to CORS, so we use local data
  try {
    const localCards = getCardsBySet(setCode)
    if (localCards.length > 0) {
      return localCards
    }
  } catch (error) {
    console.warn('Failed to load local card data', error)
  }

  console.warn(`Unable to fetch card data for set ${setCode}. Card data file may need to be populated.`)
  return []
}
