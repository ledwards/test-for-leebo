#!/usr/bin/env node
/**
 * Debug script to check for duplicates in pack generation
 */

import { initializeCardCache, getCachedCards } from '../src/utils/cardCache.js'
import { generateBoosterPack, clearBeltCache } from '../src/utils/boosterPack.js'

async function main() {
  console.log('Initializing card cache...')
  await initializeCardCache()

  const cards = getCachedCards('SOR')
  console.log(`Loaded ${cards.length} cards for SOR\n`)

  // Generate 100 packs and check for duplicates
  clearBeltCache()

  let packsWithDuplicates = 0
  const duplicateDetails = []

  for (let i = 0; i < 100; i++) {
    const pack = generateBoosterPack(cards, 'SOR')

    // Check for duplicates by comparing both ID and foil status
    const seen = new Map() // Map of card.id to array of {index, isFoil}
    let hasDuplicate = false

    for (let j = 0; j < pack.cards.length; j++) {
      const card = pack.cards[j]
      const key = card.id

      if (!seen.has(key)) {
        seen.set(key, [])
      }

      // Check if we've seen this card with the same foil status
      const matchingCards = seen.get(key).filter(c => c.isFoil === card.isFoil)

      if (matchingCards.length > 0) {
        // True duplicate found (same ID and same foil status)
        hasDuplicate = true
        const firstMatch = matchingCards[0]
        duplicateDetails.push({
          packNum: i + 1,
          cardName: card.name,
          cardId: card.id,
          rarity: card.rarity,
          positions: [firstMatch.index, j],
          distance: j - firstMatch.index,
          firstIsFoil: firstMatch.isFoil,
          secondIsFoil: card.isFoil
        })
      }

      seen.get(key).push({ index: j, isFoil: card.isFoil })
    }

    if (hasDuplicate) {
      packsWithDuplicates++
    }
  }

  console.log('═'.repeat(70))
  console.log('DUPLICATE DETECTION RESULTS')
  console.log('═'.repeat(70))
  console.log(`Packs generated: 100`)
  console.log(`Packs with duplicates: ${packsWithDuplicates}`)
  console.log(`Duplicate rate: ${(packsWithDuplicates / 100 * 100).toFixed(1)}%`)
  console.log('')

  if (duplicateDetails.length > 0) {
    console.log('DUPLICATE DETAILS:')
    console.log('─'.repeat(70))
    duplicateDetails.forEach(dup => {
      console.log(`Pack ${dup.packNum}: ${dup.cardName} (${dup.cardId})`)
      console.log(`  Rarity: ${dup.rarity}`)
      console.log(`  Positions: ${dup.positions[0]} (isFoil: ${dup.firstIsFoil}) and ${dup.positions[1]} (isFoil: ${dup.secondIsFoil}) (${dup.distance} apart)`)
    })
  } else {
    console.log('✅ NO DUPLICATES FOUND!')
  }

  console.log('')
  console.log('═'.repeat(70))
}

main().catch(console.error)
