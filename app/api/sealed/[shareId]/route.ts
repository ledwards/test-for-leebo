// @ts-nocheck
// GET /api/sealed/:shareId - Get sealed pod details
// DELETE /api/sealed/:shareId - Delete sealed pod (host only)
import { query, queryRow, queryRows } from '@/lib/db'
import { getSession, requireAuth } from '@/lib/auth'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils'
import { getPackArtUrl } from '@/src/utils/packArt'
import { jsonParse } from '@/src/utils/json'
import { broadcastSealedPodState, broadcastPublicPodsUpdate } from '@/src/lib/socketBroadcast'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ shareId: string }>
}

export async function GET(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  try {
    const { shareId } = await params
    const session = getSession(request)

    const pod = await queryRow(
      `SELECT
        dp.id, dp.share_id, dp.host_id, dp.status, dp.current_players, dp.max_players,
        dp.set_code, dp.set_name, dp.name, dp.settings, dp.state_version,
        dp.is_public,
        dp.created_at, dp.updated_at,
        u.username as host_username,
        u.avatar_url as host_avatar
       FROM pods dp
       LEFT JOIN users u ON dp.host_id = u.id
       WHERE dp.share_id = $1 AND dp.pod_type = 'sealed'`,
      [shareId]
    )

    if (!pod) {
      return errorResponse('Sealed pod not found', 404)
    }

    const players = await queryRows(
      `SELECT
        dpp.*,
        u.id as user_id,
        u.username,
        u.avatar_url
       FROM pod_players dpp
       JOIN users u ON dpp.user_id = u.id
       WHERE dpp.pod_id = $1
       ORDER BY dpp.seat_number`,
      [pod.id]
    )

    const settings = jsonParse(pod.settings, {})

    const formattedPlayers = players.map(p => ({
      id: p.user_id,
      username: p.username,
      avatarUrl: p.avatar_url,
      seatNumber: p.seat_number,
    }))

    const isPlayer = session ? players.some(p => p.user_id === session.id) : false

    return jsonResponse({
      id: pod.id,
      shareId: pod.share_id,
      setCode: pod.set_code,
      setName: pod.set_name,
      name: pod.name,
      setArtUrl: getPackArtUrl(pod.set_code),
      status: pod.status,
      maxPlayers: pod.max_players,
      currentPlayers: pod.current_players,
      stateVersion: pod.state_version,
      settings,
      host: {
        id: pod.host_id,
        username: pod.host_username,
        avatarUrl: pod.host_avatar,
      },
      players: formattedPlayers,
      isPublic: pod.is_public || false,
      isHost: session ? pod.host_id === session.id : false,
      isPlayer,
      createdAt: pod.created_at,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  try {
    const { shareId } = await params
    const session = requireAuth(request)

    const pod = await queryRow(
      `SELECT id, host_id FROM pods WHERE share_id = $1 AND pod_type = 'sealed'`,
      [shareId]
    )

    if (!pod) {
      return errorResponse('Sealed pod not found', 404)
    }

    if (pod.host_id !== session.id) {
      return errorResponse('Only the host can delete the sealed pod', 403)
    }

    // Delete associated card_pools
    await query('DELETE FROM card_pools WHERE pod_id = $1', [pod.id])

    // Delete pod (cascade will remove players)
    await query('DELETE FROM pods WHERE id = $1', [pod.id])

    // Broadcast deletion to all connected clients (pod is gone, so this emits 'deleted')
    broadcastSealedPodState(shareId).catch(err => {
      console.error('Error broadcasting sealed pod deletion:', err)
    })
    broadcastPublicPodsUpdate().catch(err => {
      console.error('Error broadcasting public pods update:', err)
    })

    return jsonResponse({ message: 'Sealed pod deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
