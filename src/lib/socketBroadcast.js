/**
 * Socket.io Broadcast Helper
 *
 * Broadcasts draft state updates to all connected clients via WebSocket.
 * Replaces the SSE-based broadcast system for Railway deployment.
 */
import { queryRow, queryRows } from '@/lib/db.js'

/**
 * Broadcast draft state to all connected clients in a draft room
 * @param {string} shareId - Draft share ID
 */
export async function broadcastDraftState(shareId) {
  const io = global.io
  if (!io) {
    console.warn('Socket.io not initialized - broadcast skipped')
    return
  }

  try {
    const pod = await queryRow(
      `SELECT dp.id, dp.share_id, dp.status, dp.state_version, dp.draft_state,
              dp.timed, dp.timer_enabled, dp.timer_seconds, dp.pick_timeout_seconds,
              dp.started_at, dp.completed_at, dp.pick_started_at,
              dp.paused, dp.paused_at, dp.paused_duration_seconds
       FROM draft_pods dp WHERE dp.share_id = $1`,
      [shareId]
    )

    if (!pod) {
      io.to(`draft:${shareId}`).emit('deleted')
      return
    }

    const players = await queryRows(
      `SELECT dpp.id, dpp.user_id, dpp.seat_number, dpp.pick_status, dpp.is_bot,
              dpp.leaders, dpp.drafted_leaders, dpp.drafted_cards,
              u.username, u.avatar_url
       FROM draft_pod_players dpp
       JOIN users u ON dpp.user_id = u.id
       WHERE dpp.draft_pod_id = $1
       ORDER BY dpp.seat_number`,
      [pod.id]
    )

    const draftState = typeof pod.draft_state === 'string'
      ? JSON.parse(pod.draft_state)
      : pod.draft_state || {}

    const isLeaderDraftPhase = draftState?.phase === 'leader_draft'

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
        isBot: p.is_bot === true,
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

    io.to(`draft:${shareId}`).emit('state', {
      stateVersion: pod.state_version,
      status: pod.status,
      draftState,
      players: formattedPlayers,
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
    })
  } catch (err) {
    console.error('Error broadcasting draft state:', err)
  }
}

/**
 * Broadcast a simple event to all clients in a draft room
 * @param {string} shareId - Draft share ID
 * @param {string} eventType - Event type
 * @param {object} data - Event data
 */
export function broadcastEvent(shareId, eventType, data = {}) {
  const io = global.io
  if (!io) {
    console.warn('Socket.io not initialized - event broadcast skipped')
    return
  }

  io.to(`draft:${shareId}`).emit(eventType, {
    timestamp: Date.now(),
    ...data,
  })
}
