// GET/POST /api/draft/:shareId/pool - Get or create a pool from drafted cards
import { query, queryRow } from '@/lib/db.js'
import { requireAuth } from '@/lib/auth.js'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils.js'
import { nanoid } from 'nanoid'

export async function GET(request, { params }) {
  try {
    const { shareId } = await params
    const session = requireAuth(request)

    // Get the draft pod
    const pod = await queryRow(
      'SELECT * FROM draft_pods WHERE share_id = $1',
      [shareId]
    )

    if (!pod) {
      return errorResponse('Draft not found', 404)
    }

    // Check if user is a player in this draft
    const player = await queryRow(
      'SELECT * FROM draft_pod_players WHERE draft_pod_id = $1 AND user_id = $2',
      [pod.id, session.id]
    )

    if (!player) {
      return errorResponse('You are not a player in this draft', 403)
    }

    // Check if a pool already exists for this user and draft
    const existingPool = await queryRow(
      'SELECT * FROM card_pools WHERE draft_pod_id = $1 AND user_id = $2',
      [pod.id, session.id]
    )

    if (existingPool) {
      return jsonResponse({
        poolShareId: existingPool.share_id,
        created: false,
      })
    }

    // Draft must be complete to create a pool
    if (pod.status !== 'complete') {
      return errorResponse('Draft is not complete yet', 400)
    }

    // Combine leaders and cards
    const draftedLeaders = typeof player.drafted_leaders === 'string'
      ? JSON.parse(player.drafted_leaders)
      : player.drafted_leaders || []

    const draftedCards = typeof player.drafted_cards === 'string'
      ? JSON.parse(player.drafted_cards)
      : player.drafted_cards || []

    const allCards = [...draftedLeaders, ...draftedCards]

    // Get the original packs assigned to this player
    const allPacks = typeof pod.all_packs === 'string'
      ? JSON.parse(pod.all_packs)
      : pod.all_packs || []

    // Player's seat number is 1-indexed, array is 0-indexed
    const playerPacksIndex = player.seat_number - 1
    const playerOriginalPacks = allPacks[playerPacksIndex] || []

    // Format packs to match sealed pools format (just cards property, no name)
    const formattedPacks = playerOriginalPacks.map(packCards => ({
      cards: packCards
    }))

    // Create a new pool
    const poolShareId = nanoid(8)
    const setName = pod.set_name || pod.set_code
    const defaultName = `${pod.set_code} Draft (${poolShareId})`

    await query(
      `INSERT INTO card_pools (
        user_id,
        share_id,
        set_code,
        set_name,
        pool_type,
        name,
        cards,
        packs,
        draft_pod_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        session.id,
        poolShareId,
        pod.set_code,
        setName,
        'draft',
        defaultName,
        JSON.stringify(allCards),
        JSON.stringify(formattedPacks),
        pod.id
      ]
    )

    return jsonResponse({
      poolShareId,
      created: true,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
