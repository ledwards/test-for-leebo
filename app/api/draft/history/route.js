// GET /api/draft/history - Get draft pods the user is in
import { queryRows } from '@/lib/db.js'
import { requireAuth } from '@/lib/auth.js'
import { jsonResponse, handleApiError } from '@/lib/utils.js'

export async function GET(request) {
  try {
    const session = requireAuth(request)

    const pods = await queryRows(
      `SELECT
        dp.id,
        dp.share_id,
        dp.set_code,
        dp.set_name,
        dp.status,
        dp.current_players,
        dp.max_players,
        dp.host_id,
        dp.created_at,
        dp.started_at,
        dp.completed_at,
        cp.name as pool_name,
        cp.share_id as pool_share_id,
        cp.deck_builder_state
       FROM draft_pods dp
       JOIN draft_pod_players dpp ON dp.id = dpp.draft_pod_id
       LEFT JOIN card_pools cp ON cp.draft_pod_id = dp.id AND cp.user_id = $1
       WHERE dpp.user_id = $1
       ORDER BY dp.created_at DESC
       LIMIT 20`,
      [session.id]
    )

    const formattedPods = pods.map(pod => {
      // Extract data from deck_builder_state
      let poolNameFromState = null
      let leaderName = null
      let baseName = null
      if (pod.deck_builder_state) {
        try {
          const state = typeof pod.deck_builder_state === 'string'
            ? JSON.parse(pod.deck_builder_state)
            : pod.deck_builder_state
          // Pool name from state is the source of truth
          if (state.poolName) {
            poolNameFromState = state.poolName
          }
          // activeLeader/activeBase are cardId strings, actual card data is in cardPositions
          if (state.activeLeader && state.cardPositions) {
            const leaderCard = state.cardPositions[state.activeLeader]?.card
            if (leaderCard) {
              leaderName = leaderCard.name || leaderCard.title
            }
          }
          if (state.activeBase && state.cardPositions) {
            const baseCard = state.cardPositions[state.activeBase]?.card
            if (baseCard) {
              baseName = baseCard.name || baseCard.title
            }
          }
        } catch (e) {
          console.error('Failed to parse deck_builder_state:', e)
        }
      }

      return {
        id: pod.id,
        shareId: pod.share_id,
        setCode: pod.set_code,
        setName: pod.set_name,
        status: pod.status,
        currentPlayers: pod.current_players,
        maxPlayers: pod.max_players,
        isHost: pod.host_id === session.id,
        createdAt: pod.created_at,
        startedAt: pod.started_at,
        completedAt: pod.completed_at,
        draftName: poolNameFromState || pod.pool_name,
        poolShareId: pod.pool_share_id,
        leaderName,
        baseName,
      }
    })

    return jsonResponse({ pods: formattedPods })
  } catch (error) {
    return handleApiError(error)
  }
}
