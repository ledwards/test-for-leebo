// Test script to verify booster pack generation with real cards

import { getCardsBySet } from '../src/utils/cardData.js'
import { generateBoosterPack, generateSealedPod } from '../src/utils/boosterPack.js'

const setCode = 'SOR'
const cards = getCardsBySet(setCode)

console.log(`\nTesting booster pack generation for ${setCode}`)
console.log(`Total cards in set: ${cards.length}`)
console.log(`Leaders: ${cards.filter(c => c.isLeader).length}`)
console.log(`Bases: ${cards.filter(c => c.isBase).length}`)
console.log(`Commons: ${cards.filter(c => !c.isLeader && !c.isBase && c.rarity === 'Common').length}`)
console.log(`Uncommons: ${cards.filter(c => !c.isLeader && !c.isBase && c.rarity === 'Uncommon').length}`)
console.log(`Rares: ${cards.filter(c => !c.isLeader && !c.isBase && c.rarity === 'Rare').length}`)
console.log(`Legendaries: ${cards.filter(c => !c.isLeader && !c.isBase && c.rarity === 'Legendary').length}`)

console.log(`\nGenerating a test booster pack...`)
const pack = generateBoosterPack(cards)
console.log(`Pack generated with ${pack.length} cards\n`)

pack.forEach((card, i) => {
  const badges = []
  if (card.isFoil) badges.push('FOIL')
  if (card.isHyperspace) badges.push('HYPERSPACE')
  if (card.isShowcase) badges.push('SHOWCASE')
  const badgeStr = badges.length > 0 ? ` [${badges.join(', ')}]` : ''
  console.log(`  ${i+1}. [${card.rarity}] ${card.name}${badgeStr}`)
  console.log(`     Type: ${card.type}, Set: ${card.set}, Image: ${card.imageUrl ? 'Yes' : 'No'}`)
})

console.log(`\nGenerating a sealed pod (6 packs)...`)
const sealedPod = generateSealedPod(cards)
console.log(`Generated ${sealedPod.length} packs`)
sealedPod.forEach((pack, i) => {
  const leaders = pack.filter(c => c.isLeader).length
  const bases = pack.filter(c => c.isBase).length
  const foils = pack.filter(c => c.isFoil).length
  console.log(`  Pack ${i+1}: ${pack.length} cards (${leaders} leader, ${bases} base, ${foils} foil)`)
})

console.log(`\n✓ Booster pack generation test complete!`)
