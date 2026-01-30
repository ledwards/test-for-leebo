// POST /api/pools/:shareId/claim - Claim an anonymous pool
import { queryRow, query } from '@/lib/db.js'
import { requireAuth } from '@/lib/auth.js'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils.js'

export async function POST(request, { params }) {
  try {
    const { shareId } = await params
    const session = requireAuth(request)

    // Get the pool
    const pool = await queryRow(
      'SELECT id, user_id FROM card_pools WHERE share_id = $1',
      [shareId]
    )

    if (!pool) {
      return errorResponse('Pool not found', 404)
    }

    // Can only claim anonymous pools
    if (pool.user_id !== null) {
      if (pool.user_id === session.id) {
        // Already owned by this user
        return jsonResponse({
          message: 'Pool already owned by you',
          claimed: false,
          alreadyOwned: true,
        })
      }
      return errorResponse('Pool is already owned by another user', 403)
    }

    // Claim the pool by setting user_id
    await query(
      'UPDATE card_pools SET user_id = $1, updated_at = NOW() WHERE share_id = $2',
      [session.id, shareId]
    )

    return jsonResponse({
      message: 'Pool claimed successfully',
      claimed: true,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
