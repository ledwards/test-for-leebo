// @ts-nocheck
// POST /api/draft/:shareId/start - Start the draft (host only)
import { query, queryRow, queryRows } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils'
import { generateDraftPacks } from '@/src/utils/draftLogic'
import { processBotTurns } from '@/src/utils/botLogic'
import { initializeCardCache } from '@/src/utils/cardCache'
// trackBulkGenerations removed - cards are now tracked at pick time
import { broadcastDraftState } from '@/src/lib/socketBroadcast'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ shareId: string }>
}

export async function POST(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  // console.log('[START] Starting draft...')
  try {
    const { shareId } = await params
    // console.log('[START] shareId:', shareId)
    const session = requireAuth(request)
    // console.log('[START] session:', session?.id)

    // Get draft pod
    const pod = await queryRow(
      'SELECT * FROM draft_pods WHERE share_id = $1',
      [shareId]
    )

    if (!pod) {
      return errorResponse('Draft not found', 404)
    }

    // Verify host
    if (pod.host_id !== session.id) {
      return errorResponse('Only the host can start the draft', 403)
    }

    // Verify status
    if (pod.status !== 'waiting') {
      return errorResponse('Draft has already started', 400)
    }

    // Get all players
    const players = await queryRows(
      'SELECT * FROM draft_pod_players WHERE draft_pod_id = $1 ORDER BY seat_number',
      [pod.id]
    )

    // Need at least 2 players to draft
    if (players.length < 2) {
      return errorResponse('Need at least 2 players to start', 400)
    }

    // Initialize card cache before generating packs
    await initializeCardCache()

    // Check for chaos draft settings
    const settings = pod.settings || {}
    const chaosSets = settings.draftMode === 'chaos' && settings.chaosSets
      ? settings.chaosSets
      : undefined

    // Generate packs for all players
    // console.log('[START] Generating packs for', players.length, 'players, set:', pod.set_code)
    const { packs, leaders } = generateDraftPacks(pod.set_code, {
      playerCount: players.length,
      chaosSets
    })
    // console.log('[START] Packs generated, leaders per player:', leaders[0]?.length)

    // NOTE: We don't track cards at draft start anymore.
    // All cards are tracked at pick time with the picking player's user_id.
    // This ensures correct attribution for all drafted cards.

    // Assign leaders and first pack to each player
    // Note: packs are objects { cards: [...] }, extract .cards for current_pack
    for (let i = 0; i < players.length; i++) {
      const player = players[i]
      const playerLeaders = leaders[i]
      const firstPack = packs[i][0] // First pack for drafting
      const firstPackCards = firstPack.cards || firstPack // Extract cards array

      await query(
        `UPDATE draft_pod_players
         SET leaders = $1,
             current_pack = $2,
             pick_status = 'picking',
             drafted_leaders = '[]'
         WHERE id = $3`,
        [
          JSON.stringify(playerLeaders),
          JSON.stringify(firstPackCards),
          player.id
        ]
      )
    }

    // Update draft state
    const draftState = {
      phase: 'leader_draft',
      leaderRound: 1,
      packNumber: 0, // Will be 1 when leader draft completes
      pickInPack: 0,
      timerStartedAt: null,
    }

    // Store all packs in pod (for later rounds)
    await query(
      `UPDATE draft_pods
       SET status = 'active',
           draft_state = $1,
           all_packs = $2,
           started_at = NOW(),
           pick_started_at = NOW(),
           paused_duration_seconds = 0,
           state_version = state_version + 1
       WHERE id = $3`,
      [
        JSON.stringify(draftState),
        JSON.stringify(packs),
        pod.id
      ]
    )

    // console.log('[START] Draft state updated, triggering bot turns')

    // Trigger bot picks in the background
    processBotTurns(pod.id).catch(err => {
      console.error('Error processing bot turns after start:', err)
    })

    // Broadcast state update to SSE clients
    broadcastDraftState(shareId).catch(err => {
      console.error('Error broadcasting draft state:', err)
    })

    // console.log('[START] Returning success response')
    return jsonResponse({
      message: 'Draft started',
      phase: 'leader_draft',
      playerCount: players.length,
    })
  } catch (error) {
    console.error('[START] Error:', error)
    return handleApiError(error)
  }
}
