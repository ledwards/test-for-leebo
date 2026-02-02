// POST /api/draft/:shareId/drop - Drop from a draft pod (non-host only)
// - If status === 'waiting': Remove player (same as leave)
// - If status === 'active': Convert player slot to bot
import { query, queryRow } from '@/lib/db.js'
import { requireAuth } from '@/lib/auth.js'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils.js'
import { broadcastDraftState } from '@/src/lib/socketBroadcast.js'
import { processBotTurns } from '@/src/utils/botLogic.js'

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

    // Cannot drop from completed draft
    if (pod.status === 'complete') {
      return errorResponse('Draft already completed', 400)
    }

    // Check if user is a player
    const player = await queryRow(
      'SELECT * FROM draft_pod_players WHERE draft_pod_id = $1 AND user_id = $2',
      [pod.id, session.id]
    )

    if (!player) {
      return errorResponse('Not in this draft', 400)
    }

    // Host cannot drop - they must cancel/delete the draft
    if (pod.host_id === session.id) {
      return errorResponse('Host cannot drop. Cancel the draft instead.', 403)
    }

    // Check if already dropped (converted to bot)
    if (player.is_bot) {
      return errorResponse('Already dropped from this draft', 400)
    }

    let convertedToBot = false

    if (pod.status === 'waiting') {
      // During lobby: Remove player completely (same as leave)
      await query(
        'DELETE FROM draft_pod_players WHERE id = $1',
        [player.id]
      )

      // Update player count and state version
      await query(
        `UPDATE draft_pods
         SET current_players = current_players - 1,
             state_version = state_version + 1
         WHERE id = $1`,
        [pod.id]
      )
    } else {
      // During active draft: Convert to bot
      // Keep all their data (current_pack, drafted_cards, drafted_leaders, etc.)
      // The bot system will take over their picks
      await query(
        `UPDATE draft_pod_players
         SET is_bot = true
         WHERE id = $1`,
        [player.id]
      )

      // Increment state version to notify clients
      await query(
        `UPDATE draft_pods
         SET state_version = state_version + 1
         WHERE id = $1`,
        [pod.id]
      )

      convertedToBot = true

      // Trigger bot processing so the bot picks immediately if it's their turn
      processBotTurns(pod.id).catch(err => {
        console.error('Error processing bot turns after drop:', err)
      })
    }

    // Broadcast state update to all clients
    broadcastDraftState(shareId).catch(err => {
      console.error('Error broadcasting draft state:', err)
    })

    return jsonResponse({
      dropped: true,
      convertedToBot,
      message: convertedToBot
        ? 'Dropped from draft. A bot will complete your picks.'
        : 'Left the draft lobby.'
    })
  } catch (error) {
    return handleApiError(error)
  }
}
