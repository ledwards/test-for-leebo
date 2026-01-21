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
        cp.share_id as pool_share_id
       FROM draft_pods dp
       JOIN draft_pod_players dpp ON dp.id = dpp.draft_pod_id
       LEFT JOIN card_pools cp ON cp.draft_pod_id = dp.id AND cp.user_id = $1
       WHERE dpp.user_id = $1
       ORDER BY dp.created_at DESC
       LIMIT 20`,
      [session.id]
    )

    const formattedPods = pods.map(pod => ({
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
      poolShareId: pod.pool_share_id,
    }))

    return jsonResponse({ pods: formattedPods })
  } catch (error) {
    return handleApiError(error)
  }
}
