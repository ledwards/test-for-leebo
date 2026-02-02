// POST /api/draft/:shareId/join - Join a draft pod
import { query, queryRow, queryRows } from '@/lib/db.js'
import { requireAuth } from '@/lib/auth.js'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils.js'
import { broadcastDraftState } from '@/src/lib/socketBroadcast.js'

export async function POST(request, { params }) {
  try {
    const { shareId } = await params
    const session = requireAuth(request)

    // Get draft pod
    const pod = await queryRow(
      'SELECT * FROM draft_pods WHERE share_id = $1',
      [shareId]
    )

    if (!pod) {
      return errorResponse('Draft not found', 404)
    }

    if (pod.status !== 'waiting') {
      return errorResponse('Draft has already started', 400)
    }

    // Check if already a player
    const existingPlayer = await queryRow(
      'SELECT * FROM draft_pod_players WHERE draft_pod_id = $1 AND user_id = $2',
      [pod.id, session.id]
    )

    if (existingPlayer) {
      return jsonResponse({
        message: 'Already in draft',
        seatNumber: existingPlayer.seat_number,
      })
    }

    // Check if draft is full
    if (pod.current_players >= pod.max_players) {
      return errorResponse('Draft is full', 400)
    }

    // Find next available seat
    const players = await queryRows(
      'SELECT seat_number FROM draft_pod_players WHERE draft_pod_id = $1 ORDER BY seat_number',
      [pod.id]
    )

    const takenSeats = new Set(players.map(p => p.seat_number))
    let seatNumber = 1
    while (takenSeats.has(seatNumber) && seatNumber <= pod.max_players) {
      seatNumber++
    }

    // Add player
    await query(
      `INSERT INTO draft_pod_players (
        draft_pod_id,
        user_id,
        seat_number,
        pick_status,
        drafted_cards,
        leaders,
        drafted_leaders
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        pod.id,
        session.id,
        seatNumber,
        'waiting',
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([])
      ]
    )

    // Update player count and state version
    await query(
      `UPDATE draft_pods
       SET current_players = current_players + 1,
           state_version = state_version + 1
       WHERE id = $1`,
      [pod.id]
    )

    // Broadcast state update to SSE clients
    broadcastDraftState(shareId).catch(err => {
      console.error('Error broadcasting draft state:', err)
    })

    return jsonResponse({
      message: 'Joined draft',
      seatNumber,
    }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
