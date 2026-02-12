// @ts-nocheck
// POST /api/casual/chaos-sealed - Generate a Chaos Sealed pool (6 packs from 6 different sets)
import { query } from '@/lib/db'
import { requireBetaAccess } from '@/lib/auth'
import { generateShareId } from '@/lib/utils'
import { jsonResponse, parseBody, validateRequired, handleApiError } from '@/lib/utils'
import { getSetConfig } from '@/src/utils/setConfigs/index'
import { generateBoosterPack } from '@/src/utils/boosterPack'
import { initializeCardCache } from '@/src/utils/cardCache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Require beta access for casual formats
    const session = requireBetaAccess(request)
    const userId = session.id

    const body = await parseBody(request)
    validateRequired(body, ['setCodes'])

    const { setCodes } = body

    // Validate exactly 6 sets
    if (!Array.isArray(setCodes) || setCodes.length !== 6) {
      return jsonResponse({ error: 'Must select exactly 6 sets' }, 400)
    }

    // Validate all sets exist
    const setConfigs = []
    for (const setCode of setCodes) {
      const setConfig = getSetConfig(setCode)
      if (!setConfig) {
        return jsonResponse({ error: `Invalid set code: ${setCode}` }, 400)
      }
      setConfigs.push(setConfig)
    }

    // Initialize card cache (needed for server-side pack generation)
    await initializeCardCache()

    // Generate 6 packs (1 from each set)
    const packs = []
    const allCards = []

    for (let i = 0; i < 6; i++) {
      const setCode = setCodes[i]
      const pack = generateBoosterPack([], setCode)
      packs.push({
        ...pack,
        setCode,
        setName: setConfigs[i].setName
      })
      allCards.push(...pack.cards)
    }

    // Generate unique share ID
    const shareId = generateShareId(8)

    // Generate default name with format: Chaos Sealed (SETS) MM/DD/YYYY
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const year = now.getFullYear()
    const defaultName = `Chaos Sealed (${setCodes.join(', ')}) ${month}/${day}/${year}`

    // Insert into card_pools table
    // cards column = flat array of all cards
    // packs column = array of pack objects with setCode/setName metadata
    const result = await query(
      `INSERT INTO card_pools (user_id, share_id, set_code, set_name, pool_type, name, cards, packs, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, share_id, created_at`,
      [
        userId,
        shareId,
        setCodes.join(','),
        `Chaos Sealed (${setCodes.join(', ')})`,
        'chaos_sealed',
        defaultName,
        JSON.stringify(allCards),
        JSON.stringify(packs),
        true
      ]
    )

    const pool = result.rows[0]
    const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const shareUrl = `${APP_URL}/casual/chaos-sealed/${shareId}`

    return jsonResponse({
      id: pool.id,
      shareId: pool.share_id,
      shareUrl,
      createdAt: pool.created_at,
      setCodes,
      setNames: setConfigs.map(c => c.setName),
      cardCount: allCards.length,
      packCount: packs.length
    }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
