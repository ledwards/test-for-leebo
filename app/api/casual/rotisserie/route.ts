// @ts-nocheck
// POST /api/casual/rotisserie - Create a Rotisserie Draft
import { query } from '@/lib/db'
import { requireBetaAccess } from '@/lib/auth'
import { generateShareId, formatSetCodeRange } from '@/lib/utils'
import { jsonResponse, parseBody, validateRequired, handleApiError } from '@/lib/utils'
import { getSetConfig } from '@/src/utils/setConfigs/index'
import { initializeCardCache, getCachedCards } from '@/src/utils/cardCache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Require beta access for casual formats
    const session = requireBetaAccess(request)
    const userId = session.id

    const body = await parseBody(request)
    validateRequired(body, ['setCodes', 'maxPlayers'])

    const {
      setCodes,
      maxPlayers,
      pickTimerSeconds = 60
    } = body

    // Validate sets exist
    for (const setCode of setCodes) {
      const setConfig = getSetConfig(setCode)
      if (!setConfig) {
        return jsonResponse({ error: `Invalid set code: ${setCode}` }, 400)
      }
    }

    // Initialize card cache (needed for server-side operations)
    await initializeCardCache()

    // Get all cards from selected sets
    const cardPool = setCodes.flatMap(setCode => getCachedCards(setCode))
      .filter(card =>
        !card.isToken && // Exclude tokens
        card.type !== 'Token'
      )

    // Separate leaders and bases
    const leaders = cardPool.filter(c => c.type === 'Leader' || c.isLeader)
    const bases = cardPool.filter(c => c.type === 'Base' || c.isBase)
    const draftableCards = cardPool.filter(c =>
      c.type !== 'Leader' && !c.isLeader &&
      c.type !== 'Base' && !c.isBase
    )

    // Add unique instance IDs to all cards
    let instanceCounter = 0
    const cardsWithIds = draftableCards.map(card => ({
      ...card,
      instanceId: `${card.id}_${instanceCounter++}`
    }))
    const leadersWithIds = leaders.map(card => ({
      ...card,
      instanceId: `${card.id}_${instanceCounter++}`
    }))
    const basesWithIds = bases.map(card => ({
      ...card,
      instanceId: `${card.id}_${instanceCounter++}`
    }))

    // Generate unique share ID
    const shareId = generateShareId(8)

    // Generate default name with format: Rotisserie Draft (SETS) MM/DD/YYYY
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const year = now.getFullYear()
    const setRange = formatSetCodeRange(setCodes)
    const defaultName = `Rotisserie Draft (${setRange}) ${month}/${day}/${year}`

    // Calculate total picks needed: 50 cards per player
    const picksPerPlayer = 50
    const totalPicks = picksPerPlayer * maxPlayers

    // Store rotisserie draft data
    const rotisserieData = {
      setCodes,
      maxPlayers,
      pickTimerSeconds,
      cardPool: cardsWithIds,
      leaders: leadersWithIds,
      bases: basesWithIds,
      pickedCards: [], // Array of { cardInstanceId, playerId, pickNumber }
      currentPickerIndex: 0,
      pickDirection: 1, // 1 = forward, -1 = backward
      pickNumber: 0,
      totalPicks,
      status: 'waiting', // waiting, active, completed
      players: [{ id: userId, name: session.username || 'Host', seat: 1 }]
    }

    // Insert into card_pools table (reusing for storage)
    const result = await query(
      `INSERT INTO card_pools (user_id, share_id, set_code, set_name, pool_type, name, cards, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, share_id, created_at`,
      [
        userId,
        shareId,
        setCodes.join(','),
        'Rotisserie Draft',
        'rotisserie',
        defaultName,
        JSON.stringify(rotisserieData),
        true
      ]
    )

    const pool = result.rows[0]
    const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const shareUrl = `${APP_URL}/casual/rotisserie/${shareId}`

    return jsonResponse({
      id: pool.id,
      shareId: pool.share_id,
      shareUrl,
      createdAt: pool.created_at,
      maxPlayers,
      cardPoolSize: cardsWithIds.length,
      leaderCount: leadersWithIds.length,
      baseCount: basesWithIds.length
    }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
