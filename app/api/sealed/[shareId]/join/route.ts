// @ts-nocheck
// POST /api/sealed/:shareId/join - Join a sealed pod
import { query, queryRow, queryRows } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils'
import { broadcastSealedPodState, broadcastPublicPodsUpdate } from '@/src/lib/socketBroadcast'
import { findSpreadSeat } from '@/src/utils/seatAssignment'
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
      return errorResponse('Sealed pod has already started', 400)
    }

    // Check if already a player
    const existingPlayer = await queryRow(
      'SELECT * FROM pod_players WHERE pod_id = $1 AND user_id = $2',
      [pod.id, session.id]
    )

    if (existingPlayer) {
      return jsonResponse({
        message: 'Already in sealed pod',
        seatNumber: existingPlayer.seat_number,
      })
    }

    if (pod.current_players >= pod.max_players) {
      return errorResponse('Sealed pod is full', 400)
    }

    // Find next available seat
    const players = await queryRows(
      'SELECT seat_number FROM pod_players WHERE pod_id = $1 ORDER BY seat_number',
      [pod.id]
    )

    const takenSeats = new Set(players.map(p => p.seat_number))
    const seatNumber = findSpreadSeat(takenSeats, pod.max_players)

    await query(
      `INSERT INTO pod_players (
        pod_id,
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

    await query(
      `UPDATE pods
       SET current_players = current_players + 1,
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

    return jsonResponse({
      message: 'Joined sealed pod',
      seatNumber,
    }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
