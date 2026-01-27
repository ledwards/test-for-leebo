// POST /api/draft/:shareId/select - Stage a selection (not a final pick)
// Selection is stored temporarily until all players have selected
// When all have selected, picks are processed automatically
import { query, queryRow, queryRows } from '@/lib/db.js'
import { requireAuth } from '@/lib/auth.js'
import { jsonResponse, errorResponse, parseBody, handleApiError } from '@/lib/utils.js'
import { processAllStagedPicks } from '@/src/utils/draftAdvance.js'
import { processBotTurns } from '@/src/utils/botLogic.js'

export async function POST(request, { params }) {
  try {
    const { shareId } = await params
    const session = requireAuth(request)
    const body = await parseBody(request)

    const { cardId } = body // cardId can be null to unselect

    // Get draft pod
    const pod = await queryRow(
      'SELECT * FROM draft_pods WHERE share_id = $1',
      [shareId]
    )

    if (!pod) {
      return errorResponse('Draft not found', 404)
    }

    if (pod.status !== 'active') {
      return errorResponse('Draft is not active', 400)
    }

    // Get current player
    const player = await queryRow(
      'SELECT * FROM draft_pod_players WHERE draft_pod_id = $1 AND user_id = $2',
      [pod.id, session.id]
    )

    if (!player) {
      return errorResponse('Not in this draft', 400)
    }

    // Parse draft state
    const draftState = typeof pod.draft_state === 'string'
      ? JSON.parse(pod.draft_state)
      : pod.draft_state

    // Validate the card is available (if selecting, not unselecting)
    if (cardId) {
      if (draftState.phase === 'leader_draft') {
        const leaders = typeof player.leaders === 'string'
          ? JSON.parse(player.leaders)
          : player.leaders || []

        const leaderExists = leaders.some(l =>
          (l.instanceId && l.instanceId === cardId) || (!l.instanceId && l.id === cardId)
        )
        if (!leaderExists) {
          return errorResponse('Leader not available', 400)
        }
      } else if (draftState.phase === 'pack_draft') {
        const currentPack = typeof player.current_pack === 'string'
          ? JSON.parse(player.current_pack)
          : player.current_pack || []

        const cardExists = currentPack.some(c =>
          (c.instanceId && c.instanceId === cardId) || (!c.instanceId && c.id === cardId)
        )
        if (!cardExists) {
          return errorResponse('Card not available', 400)
        }
      }
    }

    // Update player's selection (temporary, not a final pick)
    await query(
      `UPDATE draft_pod_players
       SET selected_card_id = $1,
           pick_status = $2
       WHERE id = $3`,
      [cardId, cardId ? 'selected' : 'picking', player.id]
    )

    // Increment state version so other clients see the update
    await query(
      'UPDATE draft_pods SET state_version = state_version + 1 WHERE id = $1',
      [pod.id]
    )

    // Check if all players have now selected - if so, process picks immediately
    // This handles the case of all-human drafts without relying on bot processing
    if (cardId) {
      // Retry loop to handle race conditions
      for (let attempt = 0; attempt < 3; attempt++) {
        // Try to acquire a short lock to prevent race conditions
        const lockResult = await query(
          `UPDATE draft_pods
           SET bot_processing_since = NOW()
           WHERE id = $1
             AND status = 'active'
             AND (bot_processing_since IS NULL OR bot_processing_since < NOW() - INTERVAL '2 seconds')
           RETURNING id`,
          [pod.id]
        )

        if (lockResult.rowCount > 0) {
          try {
            // Re-fetch players after acquiring lock
            const allPlayers = await queryRows(
              'SELECT pick_status, selected_card_id FROM draft_pod_players WHERE draft_pod_id = $1',
              [pod.id]
            )
            const allSelected = allPlayers.every(p => p.pick_status === 'selected' && p.selected_card_id)

            if (allSelected) {
              // All players have selected - process picks and advance
              // Re-fetch pod state to ensure fresh data
              const freshPod = await queryRow('SELECT * FROM draft_pods WHERE id = $1', [pod.id])
              const freshState = typeof freshPod.draft_state === 'string'
                ? JSON.parse(freshPod.draft_state)
                : freshPod.draft_state
              await processAllStagedPicks(pod.id, freshState, freshPod)
            }
          } catch (err) {
            console.error('Error processing picks:', err)
          } finally {
            // Release lock BEFORE calling bot processing (bot processing needs the lock)
            await query('UPDATE draft_pods SET bot_processing_since = NULL WHERE id = $1', [pod.id])
          }

          // Trigger bot processing for drafts with bots (after lock is released)
          try {
            await processBotTurns(pod.id)
          } catch (err) {
            console.error('Error processing bot turns:', err)
          }

          break // Success, exit retry loop
        } else {
          // Couldn't acquire lock - wait and retry
          await new Promise(resolve => setTimeout(resolve, 150 + attempt * 100))
        }
      }
    }

    return jsonResponse({ message: cardId ? 'Card selected' : 'Selection cleared' })
  } catch (error) {
    return handleApiError(error)
  }
}
