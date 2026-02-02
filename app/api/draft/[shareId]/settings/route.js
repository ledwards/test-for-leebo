// PATCH /api/draft/:shareId/settings - Update draft settings (host only)
import { query, queryRow } from '@/lib/db.js'
import { requireAuth } from '@/lib/auth.js'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils.js'
import { broadcastDraftState } from '@/src/lib/socketBroadcast.js'

export async function PATCH(request, { params }) {
  try {
    const { shareId } = await params
    const session = requireAuth(request)
    const body = await request.json()

    // Get draft pod
    const pod = await queryRow(
      'SELECT * FROM draft_pods WHERE share_id = $1',
      [shareId]
    )

    if (!pod) {
      return errorResponse('Draft not found', 404)
    }

    // Only host can update settings
    if (pod.host_id !== session.id) {
      return errorResponse('Only the host can update settings', 403)
    }

    // Can only update settings in waiting status
    if (pod.status !== 'waiting') {
      return errorResponse('Cannot change settings after draft has started', 400)
    }

    // Update allowed fields
    const updates = []
    const values = []
    let paramIndex = 1

    if (typeof body.timed === 'boolean') {
      updates.push('timed = $' + paramIndex++)
      values.push(body.timed)
    }

    if (typeof body.pickTimeoutSeconds === 'number') {
      updates.push('pick_timeout_seconds = $' + paramIndex++)
      values.push(body.pickTimeoutSeconds)
    }

    if (typeof body.timerSeconds === 'number') {
      updates.push('timer_seconds = $' + paramIndex++)
      values.push(body.timerSeconds)
    }

    if (typeof body.timerEnabled === 'boolean') {
      updates.push('timer_enabled = $' + paramIndex++)
      values.push(body.timerEnabled)
    }

    if (updates.length === 0) {
      return errorResponse('No valid settings to update', 400)
    }

    // Add state version increment and pod id
    updates.push('state_version = state_version + 1')
    values.push(pod.id)

    await query(
      'UPDATE draft_pods SET ' + updates.join(', ') + ' WHERE id = $' + paramIndex,
      values
    )

    // Broadcast state update to all connected clients
    broadcastDraftState(shareId).catch(err => {
      console.error('Error broadcasting draft state:', err)
    })

    return jsonResponse({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
