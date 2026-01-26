/**
 * GET /api/draft/:shareId/stream - SSE endpoint for real-time draft updates
 *
 * Server-Sent Events stream that pushes draft state updates to connected clients.
 * Replaces polling with instant push notifications.
 */
import { queryRow, queryRows } from '@/lib/db.js'
import { getSession } from '@/lib/auth.js'
import { registerConnection } from '@/src/lib/sseConnections.js'
import { checkAndEnforceTimeout } from '@/src/utils/draftTimeout.js'

// Heartbeat interval (25 seconds - under Vercel's 30s timeout)
const HEARTBEAT_INTERVAL = 25000

/**
 * Build the draft state response (same logic as state/route.js)
 */
async function buildDraftState(shareId, session) {
  let pod = await queryRow(
    `SELECT
      dp.id,
      dp.share_id,
      dp.status,
      dp.current_players,
      dp.timer_enabled,
      dp.timer_seconds,
      dp.pick_timeout_seconds,
      dp.timed,
      dp.state_version,
      dp.draft_state,
      dp.started_at,
      dp.completed_at,
      dp.pick_started_at,
      dp.paused,
      dp.paused_at,
      dp.paused_duration_seconds
     FROM draft_pods dp
     WHERE dp.share_id = $1`,
    [shareId]
  )

  if (!pod) {
    return null
  }

  // Check and enforce timeouts
  const timeoutEnforced = await checkAndEnforceTimeout(pod.id)
  if (timeoutEnforced) {
    pod = await queryRow(
      `SELECT
        dp.id, dp.share_id, dp.status, dp.current_players,
        dp.timer_enabled, dp.timer_seconds, dp.pick_timeout_seconds,
        dp.timed, dp.state_version, dp.draft_state, dp.started_at,
        dp.completed_at, dp.pick_started_at, dp.paused, dp.paused_at,
        dp.paused_duration_seconds
       FROM draft_pods dp WHERE dp.share_id = $1`,
      [shareId]
    )
  }

  // Get all players
  const players = await queryRows(
    `SELECT dpp.*, u.username, u.avatar_url
     FROM draft_pod_players dpp
     JOIN users u ON dpp.user_id = u.id
     WHERE dpp.draft_pod_id = $1
     ORDER BY dpp.seat_number`,
    [pod.id]
  )

  // Parse draft state
  const draftState = typeof pod.draft_state === 'string'
    ? JSON.parse(pod.draft_state)
    : pod.draft_state || {}

  const isLeaderDraftPhase = draftState?.phase === 'leader_draft'

  // Format players
  const formattedPlayers = players.map(p => {
    const draftedLeaders = p.drafted_leaders
      ? (typeof p.drafted_leaders === 'string' ? JSON.parse(p.drafted_leaders) : p.drafted_leaders)
      : []

    const leadersPack = p.leaders
      ? (typeof p.leaders === 'string' ? JSON.parse(p.leaders) : p.leaders)
      : []

    return {
      id: p.id,
      odId: p.user_id,
      username: p.username,
      avatarUrl: p.avatar_url,
      seatNumber: p.seat_number,
      pickStatus: p.pick_status,
      leaderPack: isLeaderDraftPhase ? leadersPack.map(l => ({
        name: l.name,
        aspects: l.aspects || [],
        imageUrl: l.imageUrl,
        backImageUrl: l.backImageUrl,
      })) : null,
      draftedCardsCount: p.drafted_cards
        ? (typeof p.drafted_cards === 'string' ? JSON.parse(p.drafted_cards) : p.drafted_cards).length
        : 0,
      draftedLeadersCount: draftedLeaders.length,
      draftedLeaders: draftedLeaders.map(l => ({
        name: l.name,
        aspects: l.aspects || [],
        imageUrl: l.imageUrl,
        backImageUrl: l.backImageUrl,
      })),
    }
  })

  // Get current user's data if logged in
  let myPlayer = null
  if (session) {
    const player = players.find(p => p.user_id === session.id)
    if (player) {
      myPlayer = {
        id: player.id,
        seatNumber: player.seat_number,
        pickStatus: player.pick_status,
        selectedCardId: player.selected_card_id || null,
        currentPack: typeof player.current_pack === 'string'
          ? JSON.parse(player.current_pack)
          : player.current_pack,
        draftedCards: typeof player.drafted_cards === 'string'
          ? JSON.parse(player.drafted_cards)
          : player.drafted_cards || [],
        leaders: typeof player.leaders === 'string'
          ? JSON.parse(player.leaders)
          : player.leaders || [],
        draftedLeaders: typeof player.drafted_leaders === 'string'
          ? JSON.parse(player.drafted_leaders)
          : player.drafted_leaders || [],
      }
    }
  }

  return {
    type: 'state',
    stateVersion: pod.state_version,
    status: pod.status,
    draftState,
    players: formattedPlayers,
    myPlayer,
    timed: pod.timed !== false,
    timerEnabled: pod.timer_enabled,
    timerSeconds: pod.timer_seconds,
    pickTimeoutSeconds: pod.pick_timeout_seconds || 120,
    startedAt: pod.started_at,
    completedAt: pod.completed_at,
    pickStartedAt: pod.pick_started_at,
    paused: pod.paused === true,
    pausedAt: pod.paused_at,
    pausedDurationSeconds: pod.paused_duration_seconds || 0,
  }
}

export async function GET(request, { params }) {
  const { shareId } = await params
  const session = getSession(request)

  const encoder = new TextEncoder()
  let cleanup = null
  let heartbeatInterval = null

  const stream = new ReadableStream({
    async start(controller) {
      // Register this connection
      cleanup = registerConnection(shareId, controller)

      // Send initial state
      try {
        const initialState = await buildDraftState(shareId, session)
        if (!initialState) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Draft not found' })}\n\n`))
          controller.close()
          return
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialState)}\n\n`))
      } catch (err) {
        console.error('Error sending initial SSE state:', err)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Failed to load draft' })}\n\n`))
        controller.close()
        return
      }

      // Set up heartbeat to keep connection alive
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`))
        } catch (e) {
          // Connection closed
          clearInterval(heartbeatInterval)
        }
      }, HEARTBEAT_INTERVAL)
    },

    cancel() {
      // Clean up on connection close
      if (cleanup) cleanup()
      if (heartbeatInterval) clearInterval(heartbeatInterval)
    }
  })

  // Handle client disconnect
  request.signal.addEventListener('abort', () => {
    if (cleanup) cleanup()
    if (heartbeatInterval) clearInterval(heartbeatInterval)
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}
