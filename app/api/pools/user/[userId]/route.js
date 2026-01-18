// GET /api/pools/user/:userId - Get all pools for a user
import { queryRows, queryRow } from '@/lib/db.js'
import { getSession, requireAuth } from '@/lib/auth.js'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils.js'

export async function GET(request, { params }) {
  try {
    const { userId } = await params
    const session = getSession(request)

    // All pools are public - allow viewing any user's pools
    // No authorization check needed

    console.log('Fetching pools for userId:', userId, 'type:', typeof userId)

    // Parse query parameters - use high limit to get all pools
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '1000', 10) // High limit to get all pools
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Get pools - also include set_name and pool_type if they exist
    let pools
    try {
      pools = await queryRows(
        `SELECT 
          id,
          share_id,
          set_code,
          set_name,
          pool_type,
          name,
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
      console.log('Query returned', pools?.length || 0, 'pools')
    } catch (error) {
      console.error('Error fetching pools:', error)
      // Fallback if name, set_name or pool_type columns don't exist
      if (error.message.includes('name') || error.message.includes('set_name') || error.message.includes('pool_type')) {
        try {
          pools = await queryRows(
            `SELECT 
              id,
              share_id,
              set_code,
              set_name,
              pool_type,
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
          // Add default values
          pools = pools.map(pool => ({
            ...pool,
            name: null,
            set_name: pool.set_name || null,
            pool_type: pool.pool_type || 'sealed'
          }))
        } catch (innerError) {
          // If set_name or pool_type columns don't exist either
          if (innerError.message.includes('set_name') || innerError.message.includes('pool_type')) {
            pools = await queryRows(
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
            // Add default values
            pools = pools.map(pool => ({
              ...pool,
              name: null,
              set_name: null,
              pool_type: 'sealed'
            }))
          } else {
            throw innerError
          }
        }
      } else {
        throw error
      }
    }

    // Get total count
    const countResult = await queryRow(
      'SELECT COUNT(*) as total FROM card_pools WHERE user_id = $1',
      [userId]
    )
    const total = parseInt(countResult.total, 10)
    console.log('Total pools for user:', total)

    return jsonResponse({
      pools: pools.map((pool) => {
        // Generate default name if it doesn't exist
        let name = pool.name
        if (!name) {
          const formatType = (pool.pool_type || 'sealed') === 'draft' ? 'Draft' : 'Sealed'
          const setCode = pool.set_code || ''
          name = `${setCode} ${formatType} (${pool.share_id})`
        }
        
        return {
          id: pool.id,
          shareId: pool.share_id,
          setCode: pool.set_code,
          setName: pool.set_name || null,
          poolType: pool.pool_type || 'sealed',
          name: name,
          createdAt: pool.created_at,
          updatedAt: pool.updated_at,
          isPublic: pool.is_public,
          cardCount: parseInt(pool.card_count, 10),
        }
      }),
      total,
      limit,
      offset,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
