// GET /api/draft/:shareId - Get draft pod details
// DELETE /api/draft/:shareId - Delete draft pod (host only)
import { query, queryRow, queryRows } from '@/lib/db.js'
import { getSession, requireAuth } from '@/lib/auth.js'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils.js'
import { getPackArtUrl } from '@/src/utils/packArt.js'
import { checkAndEnforceTimeout } from '@/src/utils/draftTimeout.js'
import { jsonParse } from '@/src/utils/json.js'

export async function GET(request, { params }) {
  try {
    const { shareId } = await params
    const session = getSession(request)

    // Get draft pod (exclude all_packs to improve performance)
    let pod = await queryRow(
      `SELECT
        dp.id, dp.share_id, dp.host_id, dp.status, dp.current_players, dp.max_players,
        dp.set_code, dp.set_name,   dp.settings,
        dp.draft_state, dp.state_version, dp.started_at, dp.completed_at,
        dp.timer_enabled, dp.timer_seconds, dp.pick_timeout_seconds, dp.timed,
        dp.pick_started_at, dp.paused, dp.paused_at, dp.paused_duration_seconds,
        dp.created_at, dp.updated_at,
        u.username as host_username,
        u.avatar_url as host_avatar
       FROM draft_pods dp
       LEFT JOIN users u ON dp.host_id = u.id
       WHERE dp.share_id = $1`,
      [shareId]
    )

    if (!pod) {
      return errorResponse('Draft not found', 404)
    }

    // Check and enforce timeouts (server-side timeout enforcement)
    // Only run during active drafts - skip in waiting room for performance
    const timeoutEnforced = pod.status === 'active' ? await checkAndEnforceTimeout(pod.id) : false
    if (timeoutEnforced) {
      // Re-fetch pod since state changed (exclude all_packs)
      pod = await queryRow(
        `SELECT
          dp.id, dp.share_id, dp.host_id, dp.status, dp.current_players, dp.max_players,
          dp.set_code, dp.set_name,   dp.settings,
          dp.draft_state, dp.state_version, dp.started_at, dp.completed_at,
          dp.timer_enabled, dp.timer_seconds, dp.pick_timeout_seconds, dp.timed,
          dp.pick_started_at, dp.paused, dp.paused_at, dp.paused_duration_seconds,
          dp.created_at, dp.updated_at,
          u.username as host_username,
          u.avatar_url as host_avatar
         FROM draft_pods dp
         LEFT JOIN users u ON dp.host_id = u.id
         WHERE dp.share_id = $1`,
        [shareId]
      )
    }

    // Get all players
    const players = await queryRows(
      `SELECT
        dpp.*,
        u.id as user_id,
        u.username,
        u.avatar_url
       FROM draft_pod_players dpp
       JOIN users u ON dpp.user_id = u.id
       WHERE dpp.draft_pod_id = $1
       ORDER BY dpp.seat_number`,
      [pod.id]
    )

    // Find current user's player data if logged in
    let myPlayer = null
    if (session) {
      myPlayer = players.find(p => p.user_id === session.id) || null
    }

    // Parse JSON fields
    const draftState = jsonParse(pod.draft_state, {})
    const settings = jsonParse(pod.settings, {})

    // Check if we're in leader draft phase (show leader packs to all)
    const isLeaderDraftPhase = draftState?.phase === 'leader_draft'

    // Format players for response
    const formattedPlayers = players.map(p => {
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
        // Only include pack info for current user
        currentPack: session && p.user_id === session.id
          ? jsonParse(p.current_pack)
          : null,
        // During leader draft, show each player's leader pack to all (packs rotate anyway)
        leaderPack: isLeaderDraftPhase ? leadersPack.map(l => ({
          name: l.name,
          aspects: l.aspects || [],
          imageUrl: l.imageUrl,
          backImageUrl: l.backImageUrl,
        })) : null,
        draftedCardsCount: jsonParse(p.drafted_cards, []).length,
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

    return jsonResponse({
      id: pod.id,
      shareId: pod.share_id,
      setCode: pod.set_code,
      setName: pod.set_name,
      setArtUrl: getPackArtUrl(pod.set_code),
      status: pod.status,
      maxPlayers: pod.max_players,
      currentPlayers: pod.current_players,
      timed: pod.timed !== false, // default true
      timerEnabled: pod.timer_enabled,
      timerSeconds: pod.timer_seconds,
      pickTimeoutSeconds: pod.pick_timeout_seconds || 120,
      stateVersion: pod.state_version,
      draftState,
      settings,
      host: {
        id: pod.host_id,
        username: pod.host_username,
        avatarUrl: pod.host_avatar,
      },
      players: formattedPlayers,
      isHost: session ? pod.host_id === session.id : false,
      isPlayer: !!myPlayer,
      myPlayer: myPlayer ? {
        id: myPlayer.id,
        seatNumber: myPlayer.seat_number,
        pickStatus: myPlayer.pick_status,
        selectedCardId: myPlayer.selected_card_id || null,
        currentPack: jsonParse(myPlayer.current_pack),
        draftedCards: jsonParse(myPlayer.drafted_cards, []),
        leaders: jsonParse(myPlayer.leaders, []),
        draftedLeaders: jsonParse(myPlayer.drafted_leaders, []),
      } : null,
      startedAt: pod.started_at,
      completedAt: pod.completed_at,
      createdAt: pod.created_at,
      pickStartedAt: pod.pick_started_at,
      paused: pod.paused === true,
      pausedAt: pod.paused_at,
      pausedDurationSeconds: pod.paused_duration_seconds || 0,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request, { params }) {
  try {
    const { shareId } = await params
    const session = requireAuth(request)

    // Get pod and verify host (only need id and host_id)
    const pod = await queryRow(
      'SELECT id, host_id FROM draft_pods WHERE share_id = $1',
      [shareId]
    )

    if (!pod) {
      return errorResponse('Draft not found', 404)
    }

    if (pod.host_id !== session.id) {
      return errorResponse('Only the host can delete the draft', 403)
    }

    // Delete pod (cascade will remove players)
    await query('DELETE FROM draft_pods WHERE id = $1', [pod.id])

    return jsonResponse({ message: 'Draft deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
