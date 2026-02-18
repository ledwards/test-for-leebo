// @ts-nocheck
// POST /api/pools/:shareId/randomize - Randomize packs from the booster box
import { queryRow, query } from '@/lib/db'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils'
import { jsonParse } from '@/src/utils/json'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ shareId: string }>
}

/**
 * Generate N unique random indices from 0 to max-1
 */
function generateRandomIndices(count: number, max: number): number[] {
  if (count > max) {
    throw new Error(`Cannot pick ${count} unique indices from ${max} options`)
  }

  const indices: number[] = []
  const available = Array.from({ length: max }, (_, i) => i)

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * available.length)
    indices.push(available[randomIndex])
    available.splice(randomIndex, 1)
  }

  // Sort indices so packs appear in box order
  return indices.sort((a, b) => a - b)
}

export async function POST(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  try {
    const { shareId } = await params

    // Get pool with box_packs
    const pool = await queryRow(
      `SELECT id, user_id, box_packs, pack_indices, packs
       FROM card_pools
       WHERE share_id = $1`,
      [shareId]
    )

    if (!pool) {
      return errorResponse('Pool not found', 404)
    }

    // Check if box_packs exists
    const boxPacks = jsonParse(pool.box_packs)
    if (!boxPacks || !Array.isArray(boxPacks) || boxPacks.length === 0) {
      return errorResponse('This pool does not have a booster box to randomize from', 400)
    }

    // Get current pack count (default 6 for sealed)
    const currentPacks = jsonParse(pool.packs) || []
    const packCount = Array.isArray(currentPacks) ? currentPacks.length : 6

    // Generate new random indices
    const newIndices = generateRandomIndices(packCount, boxPacks.length)

    // Get the packs at those indices
    const newPacks = newIndices.map(i => boxPacks[i])

    // Get all cards from the new packs
    const allCards = newPacks.flatMap(pack => pack.cards || [])

    // Update the database
    await query(
      `UPDATE card_pools
       SET packs = $1,
           cards = $2,
           pack_indices = $3,
           shuffled_packs = true,
           updated_at = NOW()
       WHERE share_id = $4`,
      [
        JSON.stringify(newPacks),
        JSON.stringify(allCards),
        newIndices,
        shareId
      ]
    )

    return jsonResponse({
      packs: newPacks,
      cards: allCards,
      packIndices: newIndices,
      shuffledPacks: true
    })
  } catch (error) {
    return handleApiError(error)
  }
}
