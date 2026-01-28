// POST /api/draft/:shareId/leave - Leave a draft pod
import { query, queryRow } from '@/lib/db.js'
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

    // Can only leave during lobby
    if (pod.status !== 'waiting') {
      return errorResponse('Cannot leave after draft has started', 400)
    }

    // Check if user is a player
    const player = await queryRow(
      'SELECT * FROM draft_pod_players WHERE draft_pod_id = $1 AND user_id = $2',
      [pod.id, session.id]
    )

    if (!player) {
      return errorResponse('Not in this draft', 400)
    }

    // Host cannot leave - they must delete the draft
    if (pod.host_id === session.id) {
      return errorResponse('Host cannot leave. Delete the draft instead.', 400)
    }

    // Remove player
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

    // Broadcast state update to SSE clients
    broadcastDraftState(shareId).catch(err => {
      console.error('Error broadcasting draft state:', err)
    })

    return jsonResponse({ message: 'Left draft' })
  } catch (error) {
    return handleApiError(error)
  }
}
