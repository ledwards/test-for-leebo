// @ts-nocheck
// GET /api/stats/deck-inclusion - Get deck inclusion metrics per card
import { queryRows } from '@/lib/db'
import { jsonResponse, handleApiError } from '@/lib/utils'
import { getAllCards } from '@/src/utils/cardData'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url)
    const setCode = url.searchParams.get('setCode') || 'SOR'
    const includeBots = url.searchParams.get('includeBots') !== 'false'
    const includeHumans = url.searchParams.get('includeHumans') !== 'false'

    // Build card lookup map for enrichment
    const allCards = getAllCards()
    const cardMap = new Map()
    allCards.forEach(card => {
      cardMap.set(card.id, card)
    })

    // Build bot/human filter clause
    let botFilter = ''
    if (!includeBots && includeHumans) {
      botFilter = `AND (dpp.is_bot = false OR dpp.is_bot IS NULL)`
    } else if (includeBots && !includeHumans) {
      botFilter = `AND dpp.is_bot = true`
    }

    // Need the LEFT JOIN to pod_players for bot filtering on draft pools
    // For non-draft pools (sealed), there's no pod_players entry, so those are always "human"
    const needsBotJoin = !includeBots || !includeHumans

    // Fetch card_pools with built_decks, filtered by set
    // card_pools.cards is a JSONB array of card objects with cardId field
    // built_decks.deck is a JSONB array of {id, count} objects where id = SOR_059 format
    const joinClause = needsBotJoin
      ? `LEFT JOIN pod_players dpp ON cp.pod_id = dpp.pod_id AND cp.user_id = dpp.user_id`
      : ''

    const rows = await queryRows(
      `SELECT cp.cards AS pool_cards, bd.deck AS deck_entries
       FROM card_pools cp
       JOIN built_decks bd ON bd.card_pool_id = cp.id
       ${joinClause}
       WHERE cp.set_code = $1
         ${botFilter}`,
      [setCode]
    )

    // Normalize a cardId to a canonical key: SOR-59 → SOR_059, SOR_059 stays SOR_059
    function normalizeCardId(id: string): string {
      if (!id) return id
      // Handle hyphen format: SOR-59 → SOR_059
      if (id.includes('-')) {
        const [set, num] = id.split('-')
        return `${set}_${num.padStart(3, '0')}`
      }
      // Handle underscore format: ensure zero-padded
      if (id.includes('_')) {
        const [set, num] = id.split('_')
        return `${set}_${num.padStart(3, '0')}`
      }
      return id
    }

    // Aggregate: for each card, count pools and decks
    const cardStats = new Map<string, {
      poolsWithCard: number
      decksWithCard: number
      totalCopiesInDecks: number
      cardName: string
      cardId: string // original cardId for lookup
    }>()

    for (const row of rows) {
      const poolCards = row.pool_cards || []
      const deckEntries = row.deck_entries || []

      // Get unique non-leader/base card IDs in this pool
      const poolCardIds = new Set<string>()
      const poolCardInfo = new Map<string, { name: string; cardId: string }>()
      for (const card of poolCards) {
        if (card.isLeader || card.isBase || card.type === 'Leader' || card.type === 'Base') continue
        const normalId = normalizeCardId(card.cardId)
        if (normalId) {
          poolCardIds.add(normalId)
          if (!poolCardInfo.has(normalId)) {
            poolCardInfo.set(normalId, { name: card.name, cardId: card.cardId })
          }
        }
      }

      // Get deck card IDs with counts
      const deckCardCounts = new Map<string, number>()
      for (const entry of deckEntries) {
        const normalId = normalizeCardId(entry.id)
        if (normalId) {
          deckCardCounts.set(normalId, (entry.count || 1))
        }
      }

      // Update stats for each card in the pool
      for (const normalId of poolCardIds) {
        if (!cardStats.has(normalId)) {
          const info = poolCardInfo.get(normalId) || { name: 'Unknown', cardId: normalId }
          cardStats.set(normalId, {
            poolsWithCard: 0,
            decksWithCard: 0,
            totalCopiesInDecks: 0,
            cardName: info.name,
            cardId: info.cardId,
          })
        }
        const stat = cardStats.get(normalId)!
        stat.poolsWithCard++
        if (deckCardCounts.has(normalId)) {
          stat.decksWithCard++
          stat.totalCopiesInDecks += deckCardCounts.get(normalId)!
        }
      }
    }

    // Enrich and format results
    const cards = Array.from(cardStats.values())
      .filter(s => s.poolsWithCard > 0)
      .map(stat => {
        const inclusionRate = stat.poolsWithCard > 0
          ? (stat.decksWithCard / stat.poolsWithCard) * 100
          : 0
        const avgCopiesPlayed = stat.decksWithCard > 0
          ? stat.totalCopiesInDecks / stat.decksWithCard
          : 0

        // Look up card data for enrichment
        const cardData = cardMap.get(stat.cardId) || cardMap.get(stat.cardId.replace(/-/g, '_'))

        return {
          cardName: stat.cardName,
          cardId: stat.cardId,
          rarity: cardData?.rarity || 'Unknown',
          cardType: cardData?.type || 'Unknown',
          aspects: cardData?.aspects || [],
          poolsWithCard: stat.poolsWithCard,
          decksWithCard: stat.decksWithCard,
          inclusionRate: Math.round(inclusionRate * 10) / 10,
          avgCopiesPlayed: Math.round(avgCopiesPlayed * 10) / 10,
          subtitle: cardData?.subtitle || null,
          cost: cardData?.cost ?? null,
          imageUrl: cardData?.imageUrl || null,
        }
      })
      .sort((a, b) => b.inclusionRate - a.inclusionRate)

    return jsonResponse({
      setCode,
      totalPoolsWithDecks: rows.length,
      cards,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
