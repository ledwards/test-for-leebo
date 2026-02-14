// @ts-nocheck
/**
 * GET /api/pools/:shareId/deck.json - Export deck in SWUDB-compatible JSON format
 *
 * Returns the deck built from a pool in a format compatible with SWUDB, Karabast,
 * and other Star Wars Unlimited tools.
 *
 * This is a public endpoint - anyone with the shareId can access the deck.
 */
import { queryRow } from '@/lib/db'
import { jsonResponse, errorResponse, handleApiError, formatSetCodeRange } from '@/lib/utils'
import { jsonParse } from '@/src/utils/json'
import { buildBaseCardMap, getBaseCardId } from '@/src/utils/variantDowngrade'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ shareId: string }>
}

interface Card {
  id?: string
  cardId?: string
  name?: string
  type?: string
  variantType?: string
  isLeader?: boolean
  isBase?: boolean
  set?: string
}

interface CardPosition {
  card: Card
  section: 'deck' | 'sideboard' | 'pool' | 'leaders' | 'bases'
  visible: boolean
  enabled?: boolean
}

interface DeckBuilderState {
  cardPositions?: Record<string, CardPosition>
  activeLeader?: string
  activeBase?: string
  poolName?: string
}

interface DeckEntry {
  id: string
  count: number
}

interface ExportData {
  metadata: {
    name: string
    author: string
  }
  leader: DeckEntry | null
  base: DeckEntry | null
  deck: DeckEntry[]
  sideboard: DeckEntry[]
}

/**
 * Build deck data from deckBuilderState
 */
function buildDeckFromState(
  state: DeckBuilderState,
  setCode: string
): { leader: DeckEntry | null; base: DeckEntry | null; deck: DeckEntry[]; sideboard: DeckEntry[] } {
  const cardPositions = state.cardPositions || {}
  const baseCardMap = buildBaseCardMap(setCode)

  // Find leader and base cards
  let leaderCard: Card | null = null
  let baseCard: Card | null = null

  // Look through card positions to find the active leader and base
  for (const [posId, pos] of Object.entries(cardPositions)) {
    if (pos.card.isLeader && posId === state.activeLeader) {
      leaderCard = pos.card
    }
    if (pos.card.isBase && posId === state.activeBase) {
      baseCard = pos.card
    }
  }

  // Get deck cards (section === 'deck', visible, enabled !== false, not leader/base)
  const deckCards = Object.values(cardPositions)
    .filter(pos =>
      pos.section === 'deck' &&
      pos.visible &&
      pos.enabled !== false &&
      !pos.card.isBase &&
      !pos.card.isLeader
    )
    .map(pos => pos.card)

  // Get sideboard cards (section === 'sideboard', visible, not leader/base)
  const sideboardCards = Object.values(cardPositions)
    .filter(pos =>
      pos.section === 'sideboard' &&
      pos.visible &&
      !pos.card.isBase &&
      !pos.card.isLeader
    )
    .map(pos => pos.card)

  // Count cards by base ID
  const deckCounts = new Map<string, number>()
  deckCards.forEach(card => {
    const id = getBaseCardId(card, baseCardMap)
    if (id) {
      deckCounts.set(id, (deckCounts.get(id) || 0) + 1)
    }
  })

  const sideboardCounts = new Map<string, number>()
  sideboardCards.forEach(card => {
    const id = getBaseCardId(card, baseCardMap)
    if (id) {
      sideboardCounts.set(id, (sideboardCounts.get(id) || 0) + 1)
    }
  })

  return {
    leader: leaderCard ? { id: getBaseCardId(leaderCard, baseCardMap) || '', count: 1 } : null,
    base: baseCard ? { id: getBaseCardId(baseCard, baseCardMap) || '', count: 1 } : null,
    deck: Array.from(deckCounts.entries()).map(([id, count]) => ({ id, count })),
    sideboard: Array.from(sideboardCounts.entries()).map(([id, count]) => ({ id, count })),
  }
}

export async function GET(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  try {
    const { shareId } = await params

    // Query pool - only need deck_builder_state, set_code, name, and pool_type
    const pool = await queryRow(
      `SELECT
        cp.share_id,
        cp.set_code,
        cp.pool_type,
        cp.name,
        cp.deck_builder_state
       FROM card_pools cp
       WHERE cp.share_id = $1`,
      [shareId]
    )

    if (!pool) {
      return errorResponse('Pool not found', 404)
    }

    const deckBuilderState: DeckBuilderState = jsonParse(pool.deck_builder_state, {})

    // Check if deck has been built (has activeLeader or activeBase)
    if (!deckBuilderState.activeLeader && !deckBuilderState.activeBase) {
      return errorResponse('No deck has been built for this pool yet', 400)
    }

    const setCode = pool.set_code || ''
    const poolType = pool.pool_type || 'sealed'
    const formatType = poolType === 'draft' ? 'Draft' :
      poolType === 'rotisserie' ? 'Rotisserie Draft' : 'Sealed'

    // Generate display name
    let poolName = deckBuilderState.poolName || pool.name
    if (!poolName) {
      const setCodes = setCode.includes(',') ? setCode.split(',').map((s: string) => s.trim()) : [setCode]
      const setCodeDisplay = formatSetCodeRange(setCodes)
      const createdAt = pool.created_at ? new Date(pool.created_at) : new Date()
      const month = String(createdAt.getMonth() + 1).padStart(2, '0')
      const day = String(createdAt.getDate()).padStart(2, '0')
      const year = createdAt.getFullYear()
      poolName = `${setCodeDisplay} ${formatType} ${month}/${day}/${year}`
    }

    // Build deck data
    const deckData = buildDeckFromState(deckBuilderState, setCode)

    // Build export format
    const exportData: ExportData = {
      metadata: {
        name: `[PTP] ${poolName}`,
        author: 'Protect the Pod',
      },
      leader: deckData.leader,
      base: deckData.base,
      deck: deckData.deck,
      sideboard: deckData.sideboard,
    }

    // Return with .json content type
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
