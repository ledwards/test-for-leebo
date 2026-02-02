// POST /api/draft/:shareId/start - Start the draft (host only)
import { query, queryRow, queryRows } from '@/lib/db.js'
import { requireAuth } from '@/lib/auth.js'
import { jsonResponse, errorResponse, handleApiError } from '@/lib/utils.js'
import { generateDraftPacks } from '@/src/utils/draftLogic.js'
import { processBotTurns } from '@/src/utils/botLogic.js'
import { initializeCardCache } from '@/src/utils/cardCache.js'
import { trackBulkGenerations } from '@/src/utils/trackGeneration.js'
import { broadcastDraftState } from '@/src/lib/socketBroadcast.js'

export async function POST(request, { params }) {
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

    // Generate packs for all players
    // console.log('[START] Generating packs for', players.length, 'players, set:', pod.set_code)
    const { packs, leaders } = generateDraftPacks(pod.set_code, players.length)
    // console.log('[START] Packs generated, leaders per player:', leaders[0]?.length)

    // Track all generated cards for statistics (async, non-blocking)
    const trackingRecords = []
    let globalPackIndex = 0
    for (let i = 0; i < packs.length; i++) {
      for (let packNum = 0; packNum < packs[i].length; packNum++) {
        const pack = packs[i][packNum]
        pack.forEach(card => {
          trackingRecords.push({
            card,
            options: {
              packType: 'booster',
              sourceType: 'draft',
              sourceId: pod.id,
              sourceShareId: shareId,
              packIndex: globalPackIndex
            }
          })
        })
        globalPackIndex++
      }
      // Track leaders separately (no pack_index - they're from leader draft)
      leaders[i].forEach(leader => {
        trackingRecords.push({
          card: leader,
          options: {
            packType: 'leader',
            sourceType: 'draft',
            sourceId: pod.id,
            sourceShareId: shareId,
            packIndex: null
          }
        })
      })
    }
    trackBulkGenerations(trackingRecords).catch(err => {
      console.error('Failed to track draft generations:', err)
    })

    // Assign leaders and first pack to each player
    for (let i = 0; i < players.length; i++) {
      const player = players[i]
      const playerLeaders = leaders[i]
      const firstPack = packs[i][0] // First pack for drafting

      await query(
        `UPDATE draft_pod_players
         SET leaders = $1,
             current_pack = $2,
             pick_status = 'picking',
             drafted_leaders = '[]'
         WHERE id = $3`,
        [
          JSON.stringify(playerLeaders),
          JSON.stringify(firstPack),
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
