/**
 * SSE Broadcast Helper
 *
 * Helper functions for broadcasting draft state updates to SSE clients.
 */
import { queryRow, queryRows } from '@/lib/db.js'
import { broadcast } from './sseConnections.js'

/**
 * Broadcast a full state update to all connected clients for a draft.
 * This fetches the current state from the database and sends it.
 *
 * @param {string} shareId - Draft share ID
 */
export async function broadcastDraftState(shareId) {
  try {
    const pod = await queryRow(
      `SELECT
        dp.id,
        dp.share_id,
        dp.status,
        dp.state_version,
        dp.draft_state,
        dp.timed,
        dp.timer_enabled,
        dp.timer_seconds,
        dp.pick_timeout_seconds,
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
      broadcast(shareId, { type: 'deleted' })
      return
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

    // Format players (public view - no private data)
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

    // Broadcast the public state
    // Note: Each client will need to fetch their own myPlayer data
    // since we can't send user-specific data in a broadcast
    broadcast(shareId, {
      type: 'state',
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
 * Broadcast a simple event (pick made, timer update, etc.)
 *
 * @param {string} shareId - Draft share ID
 * @param {string} eventType - Event type
 * @param {object} data - Event data
 */
export function broadcastEvent(shareId, eventType, data = {}) {
  broadcast(shareId, {
    type: eventType,
    timestamp: Date.now(),
    ...data,
  })
}
