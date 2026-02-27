// @ts-nocheck
// PATCH /api/draft/:shareId/settings - Update draft settings (host only)
import { query, queryRow } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils'
import { broadcastDraftState, broadcastPublicPodsUpdate } from '@/src/lib/socketBroadcast'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ shareId: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  try {
    const { shareId } = await params
    const session = requireAuth(request)
    const body = await request.json()

    // Get draft pod
    const pod = await queryRow(
      'SELECT * FROM pods WHERE share_id = $1',
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
    const updates: string[] = []
    const values: (boolean | number | string)[] = []
    let paramIndex = 1

    if (typeof body.name === 'string' && body.name.trim().length > 0) {
      updates.push('name = $' + paramIndex++)
      values.push(body.name.trim().slice(0, 100))
    }

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

    if (typeof body.isPublic === 'boolean') {
      updates.push('is_public = $' + paramIndex++)
      values.push(body.isPublic)
    }

    if (typeof body.maxPlayers === 'number' && body.maxPlayers >= 2 && body.maxPlayers <= 8) {
      if (body.maxPlayers >= pod.current_players) {
        updates.push('max_players = $' + paramIndex++)
        values.push(body.maxPlayers)
      }
    }

    if (updates.length === 0) {
      return errorResponse('No valid settings to update', 400)
    }

    // Add state version increment and pod id
    updates.push('state_version = state_version + 1')
    values.push(pod.id)

    await query(
      'UPDATE pods SET ' + updates.join(', ') + ' WHERE id = $' + paramIndex,
      values
    )

    // Broadcast state update to all connected clients
    broadcastDraftState(shareId).catch(err => {
      console.error('Error broadcasting draft state:', err)
    })

    // If public visibility or name changed, notify multiplayer page listeners
    if (typeof body.isPublic === 'boolean' || typeof body.name === 'string') {
      broadcastPublicPodsUpdate().catch(err => {
        console.error('Error broadcasting public pods update:', err)
      })
    }

    return jsonResponse({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
