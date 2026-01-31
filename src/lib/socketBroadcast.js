/**
 * Socket.io Broadcast Helper
 *
 * Broadcasts draft state updates to all connected clients via WebSocket.
 * Sends PUBLIC data only - clients fetch their user-specific data via HTTP.
 */
import { queryRow, queryRows } from '@/lib/db.js'
import { jsonParse } from '@/src/utils/json.js'

/**
 * Broadcast draft state to all connected clients in a draft room.
 * @param {string} shareId - Draft share ID
 */
export async function broadcastDraftState(shareId) {
  const io = global.io
  if (!io) {
    console.warn('[Broadcast] Socket.io not initialized - broadcast skipped')
    return
  }

  try {
    const pod = await queryRow(
      `SELECT dp.id, dp.share_id, dp.status, dp.state_version, dp.draft_state,
              dp.host_id, dp.timed, dp.timer_enabled, dp.timer_seconds, dp.pick_timeout_seconds,
              dp.started_at, dp.completed_at, dp.pick_started_at,
              dp.paused, dp.paused_at, dp.paused_duration_seconds
       FROM draft_pods dp WHERE dp.share_id = $1`,
      [shareId]
    )

    if (!pod) {
      io.to(`draft:${shareId}`).emit('deleted')
      return
    }

    // Get all players (public info only)
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

    const draftState = jsonParse(pod.draft_state, {})
    const isLeaderDraftPhase = draftState?.phase === 'leader_draft'

    // Build PUBLIC player data (visible to all)
    const publicPlayers = players.map(p => {
      const draftedLeaders = jsonParse(p.drafted_leaders, [])
      const leadersPack = jsonParse(p.leaders, [])

      return {
        id: p.id,
        odId: p.user_id,
        username: p.username,
        avatarUrl: p.avatar_url,
        seatNumber: p.seat_number,
        pickStatus: p.pick_status,
        isBot: p.is_bot === true,
        // During leader draft, show each player's leader pack (packs rotate anyway)
        leaderPack: isLeaderDraftPhase ? leadersPack.map(l => ({
          name: l.name,
          aspects: l.aspects || [],
          imageUrl: l.imageUrl,
          backImageUrl: l.backImageUrl,
        })) : null,
        draftedCardsCount: jsonParse(p.drafted_cards, []).length,
        draftedLeadersCount: draftedLeaders.length,
        draftedLeaders: draftedLeaders.map(l => ({
          name: l.name,
          aspects: l.aspects || [],
          imageUrl: l.imageUrl,
          backImageUrl: l.backImageUrl,
        })),
      }
    })

    // Broadcast public state to all clients in the room
    io.to(`draft:${shareId}`).emit('state', {
      stateVersion: pod.state_version,
      status: pod.status,
      draftState,
      players: publicPlayers,
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
