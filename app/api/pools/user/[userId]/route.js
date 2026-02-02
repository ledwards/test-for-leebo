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
          deck_builder_state,
          jsonb_array_length(cards) as card_count
         FROM card_pools
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      )
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

    return jsonResponse({
      pools: pools.map((pool) => {
        // Extract data from deck_builder_state
        let poolNameFromState = null
        let leaderName = null
        let baseName = null
        if (pool.deck_builder_state) {
          try {
            const state = typeof pool.deck_builder_state === 'string'
              ? JSON.parse(pool.deck_builder_state)
              : pool.deck_builder_state
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

        // Generate name: prefer deckBuilderState.poolName, then pool.name column, then generate default
        let name = poolNameFromState || pool.name
        if (!name) {
          const formatType = (pool.pool_type || 'sealed') === 'draft' ? 'Draft' : 'Sealed'
          const setCode = pool.set_code || ''
          name = `${setCode} ${formatType}`
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
          leaderName,
          baseName,
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
