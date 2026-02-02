// POST /api/draft/:shareId/trigger-bots - Force bots to make their picks
import { queryRow } from '@/lib/db.js'
import { requireAuth } from '@/lib/auth.js'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils.js'
import { processBotTurns } from '@/src/utils/botLogic.js'

export async function POST(request, { params }) {
  try {
    const { shareId } = await params
    const session = requireAuth(request)

    // Get draft pod
    const pod = await queryRow(
      'SELECT * FROM draft_pods WHERE share_id = $1',
      [shareId]
    )

    if (!pod) {
      return errorResponse('Draft not found', 404)
    }

    // Only host can trigger bots
    if (pod.host_id !== session.id) {
      return errorResponse('Only the host can trigger bot picks', 403)
    }

    if (pod.status !== 'active') {
      return errorResponse('Draft is not active', 400)
    }

    // Trigger bot picks
    await processBotTurns(pod.id)

    return jsonResponse({ success: true, message: 'Bot picks triggered' })
  } catch (error) {
    return handleApiError(error)
  }
}
