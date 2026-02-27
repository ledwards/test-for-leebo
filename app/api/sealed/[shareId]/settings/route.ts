// @ts-nocheck
// PATCH /api/sealed/:shareId/settings - Update sealed pod settings (host only)
import { query, queryRow } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils'
import { broadcastSealedPodState, broadcastPublicPodsUpdate } from '@/src/lib/socketBroadcast'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ shareId: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  try {
    const { shareId } = await params
    const session = requireAuth(request)
    const body = await request.json()

    const pod = await queryRow(
      'SELECT * FROM pods WHERE share_id = $1 AND pod_type = $2',
      [shareId, 'sealed']
    )

    if (!pod) {
      return errorResponse('Sealed pod not found', 404)
    }

    if (pod.host_id !== session.id) {
      return errorResponse('Only the host can update settings', 403)
    }

    if (pod.status !== 'waiting') {
      return errorResponse('Cannot change settings after pod has started', 400)
    }

    const updates: string[] = []
    const values: (boolean | number | string)[] = []
    let paramIndex = 1

    if (typeof body.name === 'string' && body.name.trim().length > 0) {
      updates.push('name = $' + paramIndex++)
      values.push(body.name.trim().slice(0, 100))
    }

    if (typeof body.isPublic === 'boolean') {
      updates.push('is_public = $' + paramIndex++)
      values.push(body.isPublic)
    }

    if (typeof body.maxPlayers === 'number' && body.maxPlayers >= 2 && body.maxPlayers <= 16) {
      if (body.maxPlayers >= pod.current_players) {
        updates.push('max_players = $' + paramIndex++)
        values.push(body.maxPlayers)
      }
    }

    if (updates.length === 0) {
      return errorResponse('No valid settings to update', 400)
    }

    updates.push('state_version = state_version + 1')
    values.push(pod.id)

    await query(
      'UPDATE pods SET ' + updates.join(', ') + ' WHERE id = $' + paramIndex,
      values
    )

    broadcastSealedPodState(shareId).catch(err => {
      console.error('Error broadcasting sealed pod state:', err)
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
