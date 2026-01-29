// POST /api/draft/:shareId/pause - Toggle pause state (host only)
import { query, queryRow } from '@/lib/db.js'
import { requireAuth } from '@/lib/auth.js'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils.js'
import { processBotTurns } from '@/src/utils/botLogic.js'
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

    // Only host can pause/resume
    if (pod.host_id !== session.id) {
      return errorResponse('Only the host can pause/resume the draft', 403)
    }

    // Can only pause active drafts
    if (pod.status !== 'active') {
      return errorResponse('Can only pause an active draft', 400)
    }

    const isPaused = pod.paused === true
    const now = new Date()

    if (isPaused) {
      // Resuming - calculate how long we were paused and add to accumulated duration
      const pausedAt = new Date(pod.paused_at)
      const pausedDuration = Math.floor((now.getTime() - pausedAt.getTime()) / 1000)
      const totalPausedDuration = (pod.paused_duration_seconds || 0) + pausedDuration

      await query(
        `UPDATE draft_pods
         SET paused = false,
             paused_at = NULL,
             paused_duration_seconds = $1,
             state_version = state_version + 1
         WHERE id = $2`,
        [totalPausedDuration, pod.id]
      )

      // After resuming, check if all players have selected and process picks
      // This handles the case where everyone selected while paused
      try {
        await processBotTurns(pod.id)
      } catch (err) {
        console.error('Error processing bot turns after resume:', err)
      }

      // Broadcast state update to SSE clients
      broadcastDraftState(shareId).catch(err => {
        console.error('Error broadcasting draft state:', err)
      })

      return jsonResponse({
        success: true,
        paused: false,
        message: 'Draft resumed'
      })
    } else {
      // Pausing
      await query(
        `UPDATE draft_pods
         SET paused = true,
             paused_at = $1,
             state_version = state_version + 1
         WHERE id = $2`,
        [now.toISOString(), pod.id]
      )

      // Broadcast state update to SSE clients
      broadcastDraftState(shareId).catch(err => {
        console.error('Error broadcasting draft state:', err)
      })

      return jsonResponse({
        success: true,
        paused: true,
        message: 'Draft paused'
      })
    }
  } catch (error) {
    return handleApiError(error)
  }
}
