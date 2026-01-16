// POST /api/pools - Create a new card pool
import { query } from '@/lib/db.js'
import { getSession, requireAuth } from '@/lib/auth.js'
import { generateShareId } from '@/lib/utils.js'
import { jsonResponse, errorResponse, parseBody, validateRequired, handleApiError } from '@/lib/utils.js'

export async function POST(request) {
  try {
    const body = await parseBody(request)
    validateRequired(body, ['setCode', 'cards'])

    const { setCode, cards, packs, deckBuilderState, isPublic = false } = body

    // Get user session (optional - allow anonymous pools)
    let userId = null
    try {
      const session = requireAuth(request)
      userId = session.id
    } catch {
      // Anonymous pool - allowed
    }

    // Generate shareable ID
    let shareId = generateShareId(8)
    let attempts = 0
    const maxAttempts = 10

    // Ensure unique share ID
    while (attempts < maxAttempts) {
      const existing = await query(
        'SELECT id FROM card_pools WHERE share_id = $1',
        [shareId]
      )
      if (existing.rows.length === 0) {
        break
      }
      shareId = generateShareId(8)
      attempts++
    }

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique share ID')
    }

    // Insert pool
    const result = await query(
      `INSERT INTO card_pools (user_id, share_id, set_code, cards, packs, deck_builder_state, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, share_id, created_at`,
      [
        userId,
        shareId,
        setCode,
        JSON.stringify(cards),
        packs ? JSON.stringify(packs) : null,
        deckBuilderState ? JSON.stringify(deckBuilderState) : null,
        isPublic,
      ]
    )

    const pool = result.rows[0]
    const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const shareUrl = `${APP_URL}/pool/${shareId}`

    return jsonResponse({
      id: pool.id,
      shareId: pool.share_id,
      shareUrl,
      createdAt: pool.created_at,
    }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
