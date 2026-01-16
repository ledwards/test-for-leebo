// GET /api/pools/:shareId - Get a card pool by share ID
// PUT /api/pools/:shareId - Update a card pool
// DELETE /api/pools/:shareId - Delete a card pool
import { queryRow, query } from '@/lib/db.js'
import { getSession, requireAuth } from '@/lib/auth.js'
import { jsonResponse, errorResponse, parseBody, handleApiError } from '@/lib/utils.js'

export async function GET(request, { params }) {
  try {
    const { shareId } = params
    const pool = await queryRow(
      `SELECT 
        cp.*,
        u.id as owner_id,
        u.username as owner_username
       FROM card_pools cp
       LEFT JOIN users u ON cp.user_id = u.id
       WHERE cp.share_id = $1`,
      [shareId]
    )

    if (!pool) {
      return errorResponse('Pool not found', 404)
    }

    // Check if user can access (public or owner)
    const session = getSession(request)
    const isOwner = session && session.id === pool.user_id

    if (!pool.is_public && !isOwner) {
      return errorResponse('Pool not found or access denied', 404)
    }

    return jsonResponse({
      id: pool.id,
      shareId: pool.share_id,
      setCode: pool.set_code,
      cards: pool.cards,
      packs: pool.packs,
      deckBuilderState: pool.deck_builder_state,
      isPublic: pool.is_public,
      createdAt: pool.created_at,
      updatedAt: pool.updated_at,
      owner: pool.owner_id
        ? {
            id: pool.owner_id,
            username: pool.owner_username,
          }
        : null,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request, { params }) {
  try {
    const { shareId } = params
    const session = requireAuth(request)
    const body = await parseBody(request)

    // Check ownership
    const pool = await queryRow(
      'SELECT * FROM card_pools WHERE share_id = $1',
      [shareId]
    )

    if (!pool) {
      return errorResponse('Pool not found', 404)
    }

    if (pool.user_id !== session.id) {
      return errorResponse('Unauthorized', 403)
    }

    // Update pool
    const updates = []
    const values = []
    let paramIndex = 1

    if (body.cards !== undefined) {
      updates.push(`cards = $${paramIndex++}`)
      values.push(JSON.stringify(body.cards))
    }
    if (body.packs !== undefined) {
      updates.push(`packs = $${paramIndex++}`)
      values.push(body.packs ? JSON.stringify(body.packs) : null)
    }
    if (body.deckBuilderState !== undefined) {
      updates.push(`deck_builder_state = $${paramIndex++}`)
      values.push(body.deckBuilderState ? JSON.stringify(body.deckBuilderState) : null)
    }
    if (body.isPublic !== undefined) {
      updates.push(`is_public = $${paramIndex++}`)
      values.push(body.isPublic)
    }
    if (body.setCode !== undefined) {
      updates.push(`set_code = $${paramIndex++}`)
      values.push(body.setCode)
    }

    if (updates.length === 0) {
      return errorResponse('No fields to update', 400)
    }

    values.push(shareId)
    const result = await query(
      `UPDATE card_pools 
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE share_id = $${paramIndex}
       RETURNING *`,
      values
    )

    return jsonResponse({
      id: result.rows[0].id,
      shareId: result.rows[0].share_id,
      updatedAt: result.rows[0].updated_at,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request, { params }) {
  try {
    const { shareId } = params
    const session = requireAuth(request)

    // Check ownership
    const pool = await queryRow(
      'SELECT * FROM card_pools WHERE share_id = $1',
      [shareId]
    )

    if (!pool) {
      return errorResponse('Pool not found', 404)
    }

    if (pool.user_id !== session.id) {
      return errorResponse('Unauthorized', 403)
    }

    // Delete pool
    await query('DELETE FROM card_pools WHERE share_id = $1', [shareId])

    return jsonResponse({ message: 'Pool deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
