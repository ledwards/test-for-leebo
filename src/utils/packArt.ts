// @ts-nocheck
// Pack art URL mappings for Star Wars Unlimited sets
//
// To find pack art URLs:
// 1. Visit official Star Wars Unlimited website: https://starwarsunlimited.com
// 2. Check product pages on Fantasy Flight Games website
// 3. Look for images on retailer sites (Amazon, etc.) - right-click and "Copy Image Address"
// 4. Check image hosting services (Imgur, etc.) for community-uploaded pack art
// 5. Look for CDN URLs from official sources
//
// Once you find a working URL, update the corresponding entry below.
// URLs should point directly to image files (.jpg, .png, etc.)

import type { SetCode } from '../types'

/**
 * Expansion art URL mappings for each set (background key art)
 * Images sourced from https://starwarsunlimited.com/products
 * Using key art images from the official Star Wars Unlimited website
 */
const EXPANSION_ART_URLS: Record<string, string> = {
  // Spark of Rebellion - Set 1
  SOR: '/expansion-art/sor.jpg',
  // Shadows of the Galaxy - Set 2
  SHD: '/expansion-art/shd.jpg',
  // Twilight of the Republic - Set 3
  TWI: '/expansion-art/twi.png',
  // Jump to Lightspeed - Set 4
  JTL: '/expansion-art/jtl.jpg',
  // Legends of the Force - Set 5
  LOF: '/expansion-art/lof.png',
  // Secrets of Power - Set 6
  SEC: '/expansion-art/sec.png',
  // A Lawless Time - Set 7
  LAW: '/expansion-art/law.png',
}

/**
 * Booster pack image URLs (the actual pack, not background art)
 * Used for pack opening animation
 */
const PACK_IMAGE_URLS: Record<string, string> = {
  // Spark of Rebellion - Set 1
  SOR: '/pack-images/sor-pack.png',
  // Shadows of the Galaxy - Set 2
  SHD: '/pack-images/shd-pack.png',
  // Twilight of the Republic - Set 3
  TWI: '/pack-images/twi-pack.png',
  // Jump to Lightspeed - Set 4
  JTL: '/pack-images/jtl-pack.png',
  // Legends of the Force - Set 5
  LOF: '/pack-images/lof-pack.png',
  // Secrets of Power - Set 6
  SEC: '/pack-images/sec-pack.png',
  // A Lawless Time - Set 7
  LAW: '/pack-images/law-pack.png',
}

/**
 * Get expansion art URL for a set code (background key art)
 * Returns the URL if available, or null if not set
 */
export function getPackArtUrl(setCode: SetCode | string): string | null {
  return EXPANSION_ART_URLS[setCode] || null
}

/**
 * Get booster pack image URL for a set code (the actual pack)
 * Used for pack opening animation
 * Returns the URL if available, or a default pack image
 */
export function getPackImageUrl(setCode: SetCode | string): string {
  return PACK_IMAGE_URLS[setCode] || '/pack-images/default-pack.png'
}

/**
 * Set expansion art URL for a set code
 * Useful for updating URLs programmatically
 */
export function setPackArtUrl(setCode: SetCode | string, url: string): void {
  EXPANSION_ART_URLS[setCode] = url
}
