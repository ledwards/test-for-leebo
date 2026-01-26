// GET /api/draft/:shareId/state - Poll for state updates
import { queryRow, queryRows } from '@/lib/db.js'
import { getSession } from '@/lib/auth.js'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils.js'
import { checkAndEnforceTimeout } from '@/src/utils/draftTimeout.js'

export async function GET(request, { params }) {
  try {
    const { shareId } = await params
    const session = getSession(request)

    // Get sinceVersion from query params
    const url = new URL(request.url)
    const sinceVersion = parseInt(url.searchParams.get('sinceVersion') || '0', 10)

    // Get draft pod
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
      return errorResponse('Draft not found', 404)
    }

    // Check and enforce timeouts (server-side timeout enforcement)
    const timeoutEnforced = await checkAndEnforceTimeout(pod.id)
    if (timeoutEnforced) {
      // Re-fetch pod since state changed
      pod = await queryRow(
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
    }

    // If state hasn't changed, return minimal response
    if (pod.state_version <= sinceVersion) {
      return jsonResponse({
        changed: false,
        stateVersion: pod.state_version,
      })
    }

    // Get all players
    const players = await queryRows(
      `SELECT
        dpp.*,
        u.username,
        u.avatar_url
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

    // Check if we're in leader draft phase (show leader packs to all)
    const isLeaderDraftPhase = draftState?.phase === 'leader_draft'

    // Format players
    const formattedPlayers = players.map(p => {
      const draftedLeaders = p.drafted_leaders
        ? (typeof p.drafted_leaders === 'string' ? JSON.parse(p.drafted_leaders) : p.drafted_leaders)
        : []

      // Parse leaders pack (for leader draft phase visibility)
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
        // During leader draft, show each player's leader pack to all (packs rotate anyway)
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
        // Include leader info for all players (for tooltips)
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

    return jsonResponse({
      changed: true,
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
    })
  } catch (error) {
    return handleApiError(error)
  }
}
