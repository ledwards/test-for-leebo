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

/**
 * Pack art URL mappings for each set
 * Images sourced from https://starwarsunlimited.com/products
 * Using key art images from the official Star Wars Unlimited website
 */
const PACK_ART_URLS = {
  // Spark of Rebellion - Set 1
  SOR: '/pack-art/sor.jpg',
  // Shadows of the Galaxy - Set 2
  SHD: '/pack-art/shd.jpg',
  // Twilight of the Republic - Set 3
  TWI: '/pack-art/twi.png',
  // Jump to Lightspeed - Set 4
  JTL: '/pack-art/jtl.jpg',
  // Legends of the Force - Set 5
  LOF: '/pack-art/lof.png',
  // Secrets of Power - Set 6
  SEC: '/pack-art/sec.png',
}

/**
 * Get pack art URL for a set code
 * Returns the URL if available, or null if not set
 */
export function getPackArtUrl(setCode) {
  return PACK_ART_URLS[setCode] || null
}

/**
 * Set pack art URL for a set code
 * Useful for updating URLs programmatically
 */
export function setPackArtUrl(setCode, url) {
  PACK_ART_URLS[setCode] = url
}
