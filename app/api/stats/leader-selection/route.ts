// @ts-nocheck
// GET /api/stats/leader-selection - Get leader selection rates from built decks
import { queryRows, queryRow } from '@/lib/db'
import { jsonResponse, handleApiError } from '@/lib/utils'
import { getAllCards } from '@/src/utils/cardData'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url)
    const setCode = url.searchParams.get('setCode') || 'SOR'
    const since = url.searchParams.get('since') || '2020-01-01'
    const until = url.searchParams.get('until') || '2099-12-31'
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

    const needsBotJoin = !includeBots || !includeHumans
    const joinClause = needsBotJoin
      ? `LEFT JOIN card_pools cp ON cp.id = bd.card_pool_id LEFT JOIN pod_players dpp ON cp.pod_id = dpp.pod_id AND bd.user_id = dpp.user_id`
      : ''

    // Get total built decks count
    const summary = await queryRow(
      `SELECT COUNT(*) AS total_decks
       FROM built_decks bd
       ${joinClause}
       WHERE bd.set_code = $1 AND bd.built_at >= $2 AND bd.built_at < ($3::date + interval '1 day')
         ${botFilter}`,
      [setCode, since, until]
    )

    // Get all leader JSONB values from built_decks
    const rows = await queryRows(
      `SELECT bd.leader
       FROM built_decks bd
       ${joinClause}
       WHERE bd.set_code = $1 AND bd.built_at >= $2 AND bd.built_at < ($3::date + interval '1 day')
         ${botFilter}`,
      [setCode, since, until]
    )

    // Aggregate leader selections by name
    const leaderStats = new Map<string, {
      count: number
      cardName: string
      cardId: string
    }>()

    for (const row of rows) {
      const leader = row.leader
      if (!leader) continue
      const name = leader.name || leader.cardName || 'Unknown'
      const cardId = leader.cardId || leader.id || ''

      if (!leaderStats.has(name)) {
        leaderStats.set(name, { count: 0, cardName: name, cardId })
      }
      leaderStats.get(name)!.count++
    }

    const totalDecks = parseInt(summary?.total_decks || '0')

    // Enrich and format
    const leaders = Array.from(leaderStats.values())
      .map(stat => {
        const selectionRate = totalDecks > 0
          ? (stat.count / totalDecks) * 100
          : 0

        const cardData = cardMap.get(stat.cardId) || cardMap.get(stat.cardId?.replace(/-/g, '_'))

        return {
          cardName: stat.cardName,
          cardId: stat.cardId,
          timesSelected: stat.count,
          selectionRate: Math.round(selectionRate * 10) / 10,
          aspects: cardData?.aspects || [],
          subtitle: cardData?.subtitle || null,
          imageUrl: cardData?.imageUrl || null,
        }
      })
      .sort((a, b) => b.timesSelected - a.timesSelected)

    return jsonResponse({
      setCode,
      totalDecks,
      leaders,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
