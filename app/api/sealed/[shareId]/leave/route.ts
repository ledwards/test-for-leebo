// @ts-nocheck
// POST /api/sealed/:shareId/leave - Leave a sealed pod
import { query, queryRow } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils'
import { broadcastSealedPodState, broadcastPublicPodsUpdate } from '@/src/lib/socketBroadcast'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ shareId: string }>
}

export async function POST(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  try {
    const { shareId } = await params
    const session = requireAuth(request)

    const pod = await queryRow(
      `SELECT * FROM pods WHERE share_id = $1 AND pod_type = 'sealed'`,
      [shareId]
    )

    if (!pod) {
      return errorResponse('Sealed pod not found', 404)
    }

    if (pod.status !== 'waiting') {
      return errorResponse('Cannot leave after sealed pod has started', 400)
    }

    const player = await queryRow(
      'SELECT * FROM pod_players WHERE pod_id = $1 AND user_id = $2',
      [pod.id, session.id]
    )

    if (!player) {
      return errorResponse('Not in this sealed pod', 400)
    }

    if (pod.host_id === session.id) {
      return errorResponse('Host cannot leave. Delete the sealed pod instead.', 400)
    }

    await query(
      'DELETE FROM pod_players WHERE id = $1',
      [player.id]
    )

    await query(
      `UPDATE pods
       SET current_players = current_players - 1,
           state_version = state_version + 1
       WHERE id = $1`,
      [pod.id]
    )

    broadcastSealedPodState(shareId).catch(err => {
      console.error('Error broadcasting sealed pod state:', err)
    })
    broadcastPublicPodsUpdate().catch(err => {
      console.error('Error broadcasting public pods update:', err)
    })

    return jsonResponse({ message: 'Left sealed pod' })
  } catch (error) {
    return handleApiError(error)
  }
}
