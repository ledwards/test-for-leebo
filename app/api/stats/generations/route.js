// GET /api/stats/generations - Get card generation statistics
import { queryRows } from '@/lib/db.js'
import { jsonResponse, handleApiError } from '@/lib/utils.js'
import { analyzeCardStats, getSetReferenceData } from '@/src/utils/statsCalculations.js'
import { getAllCards } from '@/src/utils/cardData.js'

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const setCode = url.searchParams.get('setCode') || 'SOR'

    // Get all cards
    const allCards = getAllCards()

    // Get all generations for this set
    const generations = await queryRows(
      `SELECT
        card_id,
        card_name,
        card_subtitle,
        card_type,
        rarity,
        aspects,
        treatment,
        COUNT(*) as count
       FROM card_generations
       WHERE set_code = $1
       GROUP BY card_id, card_name, card_subtitle, card_type, rarity, aspects, treatment
       ORDER BY card_id, treatment`,
      [setCode]
    )

    // Get comprehensive statistics
    const statsResult = await queryRows(
      `SELECT
        COUNT(DISTINCT source_id) FILTER (WHERE source_type = 'draft') as draft_pools,
        COUNT(DISTINCT source_id) FILTER (WHERE source_type = 'sealed') as sealed_pools,
        COUNT(*) as total_cards,
        COUNT(*) / 16 as estimated_packs
       FROM card_generations
       WHERE set_code = $1`,
      [setCode]
    )
    const stats = statsResult[0] || { draft_pools: 0, sealed_pools: 0, total_cards: 0, estimated_packs: 0 }
    const totalPacks = parseInt(stats.estimated_packs) || 0
    const totalPools = parseInt(stats.draft_pools || 0) + parseInt(stats.sealed_pools || 0)

    // Group generations by card
    const cardStats = {}
    generations.forEach(row => {
      if (!cardStats[row.card_id]) {
        cardStats[row.card_id] = {
          cardId: row.card_id,
          name: row.card_name,
          subtitle: row.card_subtitle,
          type: row.card_type,
          rarity: row.rarity,
          aspects: row.aspects || [],
          treatments: {}
        }
      }
      cardStats[row.card_id].treatments[row.treatment] = parseInt(row.count)
    })

    // Analyze each card's statistics
    const analyzedCards = []
    for (const cardId in cardStats) {
      const cardData = cardStats[cardId]

      // Find the full card object from cache
      const card = allCards.find(c => c.id === cardId)
      if (!card) continue

      const analysis = analyzeCardStats(card, cardData.treatments, totalPacks, setCode)

      analyzedCards.push({
        ...cardData,
        analysis
      })
    }

    // Get reference data
    const referenceData = getSetReferenceData(setCode)

    return jsonResponse({
      setCode,
      totalPacks,
      totalPools,
      draftPools: parseInt(stats.draft_pools || 0),
      sealedPools: parseInt(stats.sealed_pools || 0),
      totalCards: parseInt(stats.total_cards || 0),
      cards: analyzedCards,
      reference: referenceData,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching generation stats:', error)
    return handleApiError(error)
  }
}
