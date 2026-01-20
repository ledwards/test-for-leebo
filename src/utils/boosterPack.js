/**
 * Booster Pack Generation (Stub)
 *
 * Simple random generation for pack contents.
 *
 * Pack structure:
 * - 1 Leader
 * - 1 Base (common)
 * - 9 Commons
 * - 3 Uncommons
 * - 1 Rare or Legendary
 * - 1 Foil (any rarity)
 *
 * Total: 16 cards
 */

/**
 * Pick a random element from an array
 */
function pickRandom(arr) {
  if (!arr || arr.length === 0) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Pick N random elements from an array (without replacement)
 */
function pickRandomN(arr, n) {
  if (!arr || arr.length === 0) return []
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

/**
 * Filter cards by set, getting only normal variants
 */
function getNormalCards(cards, setCode) {
  return cards.filter(c =>
    c.set === setCode &&
    c.variantType === 'Normal'
  )
}

/**
 * Generate a single booster pack
 * @param {Array} cards - All cards
 * @param {string} setCode - Set code (SOR, SHD, etc.)
 * @returns {Object} Pack object with cards array
 */
export function generateBoosterPack(cards, setCode) {
  const normalCards = getNormalCards(cards, setCode)

  // Filter by type/rarity
  const leaders = normalCards.filter(c => c.isLeader)
  const bases = normalCards.filter(c => c.isBase && c.rarity === 'Common')
  const commons = normalCards.filter(c => c.rarity === 'Common' && !c.isLeader && !c.isBase)
  const uncommons = normalCards.filter(c => c.rarity === 'Uncommon')
  const rares = normalCards.filter(c => c.rarity === 'Rare')
  const legendaries = normalCards.filter(c => c.rarity === 'Legendary')

  // All cards for foil slot
  const allForFoil = normalCards.filter(c => !c.isLeader && !c.isBase)

  // Build pack
  const packCards = []

  // 1 Leader
  const leader = pickRandom(leaders)
  if (leader) packCards.push({ ...leader })

  // 1 Base
  const base = pickRandom(bases)
  if (base) packCards.push({ ...base })

  // 9 Commons
  const selectedCommons = pickRandomN(commons, 9)
  selectedCommons.forEach(c => packCards.push({ ...c }))

  // 3 Uncommons
  const selectedUncommons = pickRandomN(uncommons, 3)
  selectedUncommons.forEach(c => packCards.push({ ...c }))

  // 1 Rare or Legendary (roughly 1 in 6 chance for legendary)
  const isLegendary = Math.random() < 0.167
  const rareOrLegendary = isLegendary ? pickRandom(legendaries) : pickRandom(rares)
  if (rareOrLegendary) packCards.push({ ...rareOrLegendary })

  // 1 Foil (any rarity, mark as foil)
  const foilCard = pickRandom(allForFoil)
  if (foilCard) packCards.push({ ...foilCard, isFoil: true })

  return {
    cards: packCards
  }
}

/**
 * Generate a sealed pod (6 booster packs)
 * @param {Array} cards - All cards
 * @param {string} setCode - Set code
 * @param {number} packCount - Number of packs (default 6)
 * @returns {Array} Array of pack objects (each with cards array)
 */
export function generateSealedPod(cards, setCode, packCount = 6) {
  const packs = []
  for (let i = 0; i < packCount; i++) {
    packs.push(generateBoosterPack(cards, setCode))
  }
  return packs
}
