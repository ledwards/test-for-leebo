// @ts-nocheck
// POST /api/casual/pack-wars - Generate a Pack Wars pool (2 packs)
import { query } from '@/lib/db'
import { requireBetaAccess } from '@/lib/auth'
import { generateShareId } from '@/lib/utils'
import { jsonResponse, parseBody, validateRequired, handleApiError } from '@/lib/utils'
import { getSetConfig } from '@/src/utils/setConfigs/index'
import { generateBoosterPack } from '@/src/utils/boosterPack'
import { getCachedCards } from '@/src/utils/cardCache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Require beta access for casual formats
    const session = requireBetaAccess(request)
    const userId = session.id

    const body = await parseBody(request)
    validateRequired(body, ['setCode'])

    const {
      setCode,
      ignoreAspectPenalties = true,
      resourceBufferCount = 0
    } = body

    // Validate set exists
    const setConfig = getSetConfig(setCode)
    if (!setConfig) {
      return jsonResponse({ error: 'Invalid set code' }, 400)
    }

    // Generate 2 booster packs
    const cards = await getCachedCards()
    const pack1 = generateBoosterPack(cards, setCode)
    const pack2 = generateBoosterPack(cards, setCode)

    // Extract leaders and bases from both packs
    const leaders = [
      pack1.cards.find(c => c.type === 'Leader'),
      pack2.cards.find(c => c.type === 'Leader')
    ].filter(Boolean)

    const bases = [
      pack1.cards.find(c => c.type === 'Base'),
      pack2.cards.find(c => c.type === 'Base')
    ].filter(Boolean)

    // Combine non-leader, non-base cards from both packs
    const deckCards = [
      ...pack1.cards.filter(c => c.type !== 'Leader' && c.type !== 'Base'),
      ...pack2.cards.filter(c => c.type !== 'Leader' && c.type !== 'Base')
    ]

    // Generate unique share ID
    const shareId = generateShareId(8)

    // Store pool metadata including pack wars options
    const poolData = {
      setCode,
      setName: setConfig.setName,
      poolType: 'pack_wars',
      leaders,
      bases,
      deckCards,
      packs: [pack1.cards, pack2.cards],
      options: {
        ignoreAspectPenalties,
        resourceBufferCount
      }
    }

    // Insert into card_pools table
    const result = await query(
      `INSERT INTO card_pools (user_id, share_id, set_code, set_name, pool_type, cards, packs, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, share_id, created_at`,
      [
        userId,
        shareId,
        setCode,
        setConfig.setName,
        'pack_wars',
        JSON.stringify(poolData),
        JSON.stringify([pack1, pack2]),
        true
      ]
    )

    const pool = result.rows[0]
    const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const shareUrl = `${APP_URL}/casual/pack-wars/${shareId}`

    return jsonResponse({
      id: pool.id,
      shareId: pool.share_id,
      shareUrl,
      createdAt: pool.created_at,
      leaders,
      bases,
      deckCards,
      options: {
        ignoreAspectPenalties,
        resourceBufferCount
      }
    }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
