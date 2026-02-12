// @ts-nocheck
// GET/POST /api/casual/rotisserie/:shareId - Get/Update rotisserie draft
import { query, queryRow } from '@/lib/db'
import { requireBetaAccess } from '@/lib/auth'
import { jsonResponse, parseBody, handleApiError, errorResponse } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ shareId: string }>
}

// GET - Get rotisserie draft state
export async function GET(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  try {
    const { shareId } = await params

    const pool = await queryRow(
      'SELECT * FROM card_pools WHERE share_id = $1 AND pool_type = $2',
      [shareId, 'rotisserie']
    )

    if (!pool) {
      return errorResponse('Rotisserie draft not found', 404)
    }

    const data = typeof pool.cards === 'string' ? JSON.parse(pool.cards) : pool.cards

    return jsonResponse({
      shareId: pool.share_id,
      createdAt: pool.created_at,
      ...data
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST - Join, start, or make a pick
export async function POST(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  try {
    const { shareId } = await params
    const session = requireBetaAccess(request)
    const body = await parseBody(request)
    const { action, cardInstanceId } = body

    const pool = await queryRow(
      'SELECT * FROM card_pools WHERE share_id = $1 AND pool_type = $2',
      [shareId, 'rotisserie']
    )

    if (!pool) {
      return errorResponse('Rotisserie draft not found', 404)
    }

    const data = typeof pool.cards === 'string' ? JSON.parse(pool.cards) : pool.cards

    // Handle different actions
    switch (action) {
      case 'join': {
        if (data.status !== 'waiting') {
          return errorResponse('Draft has already started', 400)
        }
        if (data.players.length >= data.maxPlayers) {
          return errorResponse('Draft is full', 400)
        }
        if (data.players.some(p => p.id === session.id)) {
          return jsonResponse({ message: 'Already joined', ...data })
        }

        data.players.push({
          id: session.id,
          name: session.username || `Player ${data.players.length + 1}`,
          seat: data.players.length + 1
        })

        await query(
          'UPDATE card_pools SET cards = $1 WHERE share_id = $2',
          [JSON.stringify(data), shareId]
        )

        return jsonResponse({ message: 'Joined draft', ...data })
      }

      case 'start': {
        // Verify host
        if (data.players[0].id !== session.id) {
          return errorResponse('Only the host can start the draft', 403)
        }
        if (data.status !== 'waiting') {
          return errorResponse('Draft has already started', 400)
        }
        if (data.players.length < 2) {
          return errorResponse('Need at least 2 players', 400)
        }

        // Shuffle player order
        const shuffledPlayers = [...data.players].sort(() => Math.random() - 0.5)
        shuffledPlayers.forEach((p, i) => p.seat = i + 1)

        data.players = shuffledPlayers
        data.status = 'active'
        data.currentPickerIndex = 0
        data.pickNumber = 1

        await query(
          'UPDATE card_pools SET cards = $1 WHERE share_id = $2',
          [JSON.stringify(data), shareId]
        )

        return jsonResponse({ message: 'Draft started', ...data })
      }

      case 'pick': {
        if (data.status !== 'active') {
          return errorResponse('Draft is not active', 400)
        }
        if (!cardInstanceId) {
          return errorResponse('cardInstanceId is required', 400)
        }

        // Verify it's this player's turn
        const currentPicker = data.players[data.currentPickerIndex]
        if (currentPicker.id !== session.id) {
          return errorResponse('Not your turn', 403)
        }

        // Verify card is still available
        const isPicked = data.pickedCards.some(p => p.cardInstanceId === cardInstanceId)
        if (isPicked) {
          return errorResponse('Card already picked', 400)
        }

        // Check if card is in the pool
        const cardExists = data.cardPool.some(c => c.instanceId === cardInstanceId) ||
          data.leaders.some(c => c.instanceId === cardInstanceId) ||
          data.bases.some(c => c.instanceId === cardInstanceId)
        if (!cardExists) {
          return errorResponse('Card not found in pool', 400)
        }

        // Record the pick
        data.pickedCards.push({
          cardInstanceId,
          playerId: session.id,
          pickNumber: data.pickNumber
        })

        // Advance to next picker (snake draft)
        data.pickNumber++
        const nextIndex = data.currentPickerIndex + data.pickDirection

        if (nextIndex >= data.players.length) {
          // End of forward pass, reverse direction
          data.pickDirection = -1
          // Stay at last player for their second pick
        } else if (nextIndex < 0) {
          // End of backward pass, reverse direction
          data.pickDirection = 1
          // Stay at first player for their second pick
        } else {
          data.currentPickerIndex = nextIndex
        }

        // Check if draft is complete
        const picksPerPlayer = 50
        if (data.pickNumber > picksPerPlayer * data.players.length) {
          data.status = 'completed'
        }

        await query(
          'UPDATE card_pools SET cards = $1 WHERE share_id = $2',
          [JSON.stringify(data), shareId]
        )

        return jsonResponse({ message: 'Pick recorded', ...data })
      }

      default:
        return errorResponse('Invalid action', 400)
    }
  } catch (error) {
    return handleApiError(error)
  }
}
