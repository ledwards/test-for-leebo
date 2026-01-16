// GET /api/pools/user/:userId - Get all pools for a user
import { queryRows, queryRow } from '../../lib/db.js'
import { getSession, requireAuth } from '../../lib/auth.js'
import { jsonResponse, errorResponse, handleApiError } from '../../lib/utils.js'

export default async function handler(request, context) {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const userId = context.params?.userId || new URL(request.url).pathname.split('/').pop()
    const session = getSession(request)

    // Users can only view their own pools (unless public)
    if (!session || session.id !== userId) {
      return errorResponse('Unauthorized', 403)
    }

    // Parse query parameters
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20', 10)
    const offset = parseInt(url.searchParams.get('offset') || '0', 10)

    // Get pools
    const pools = await queryRows(
      `SELECT 
        id,
        share_id,
        set_code,
        created_at,
        updated_at,
        is_public,
        jsonb_array_length(cards) as card_count
       FROM card_pools
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    )

    // Get total count
    const countResult = await queryRow(
      'SELECT COUNT(*) as total FROM card_pools WHERE user_id = $1',
      [userId]
    )
    const total = parseInt(countResult.total, 10)

    return jsonResponse({
      pools: pools.map((pool) => ({
        id: pool.id,
        shareId: pool.share_id,
        setCode: pool.set_code,
        createdAt: pool.created_at,
        updatedAt: pool.updated_at,
        isPublic: pool.is_public,
        cardCount: parseInt(pool.card_count, 10),
      })),
      total,
      limit,
      offset,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
