/**
 * Bot Logic for Draft Testing
 *
 * Handles automatic picks for bot players during draft.
 * Uses pluggable behavior system for pick decisions.
 */

import { query, queryRow, queryRows } from '@/lib/db.js'
import { checkAndAdvanceLeaderDraft, checkAndAdvancePackDraft, processAllStagedPicks } from './draftAdvance.js'
import { getBehavior } from '@/src/bots/behaviors/index.js'
import { broadcastDraftState } from '@/src/lib/socketBroadcast.js'
import { jsonParse } from './json.js'

// Cache behavior instances per bot to maintain state across picks
const botBehaviors = new Map()

/**
 * Check if any bots need to pick and make picks for them
 * @param {string} podId - Draft pod ID
 * @returns {boolean} - Whether any bot picks were made
 */
export async function triggerBotPicks(podId) {
  // Exclude all_packs to save memory
  const pod = await queryRow(
    `SELECT id, share_id, status, draft_state, state_version
     FROM draft_pods WHERE id = $1`,
    [podId]
  )
  if (!pod || pod.status !== 'active') {
    return false
  }

  const draftState = jsonParse(pod.draft_state, {})

  // Get all bot players who need to pick
  const botsNeedingPicks = await queryRows(
    `SELECT * FROM draft_pod_players
     WHERE draft_pod_id = $1 AND is_bot = true AND pick_status = 'picking'`,
    [podId]
  )

  if (botsNeedingPicks.length === 0) return false

  let picksMade = false
  for (const bot of botsNeedingPicks) {
    const made = await makeBotPick(bot.id, draftState)
    if (made) picksMade = true
    // Minimal delay between bot picks (just enough to prevent race conditions)
    await new Promise(resolve => setTimeout(resolve, 10))
  }

  return picksMade
}

/**
 * Make a pick for a single bot
 * @param {string} botId - Bot player ID
 * @param {object} draftState - Current draft state
 * @returns {boolean} - Whether a pick was made
 */
async function makeBotPick(botId, draftState) {
  // Re-fetch the bot with fresh data to avoid race conditions
  const bot = await queryRow(
    `SELECT * FROM draft_pod_players WHERE id = $1 AND pick_status = 'picking'`,
    [botId]
  )

  // Bot may have already picked (race condition) or state changed
  if (!bot) {
    return false
  }

  if (draftState.phase === 'leader_draft') {
    return await makeBotLeaderPick(bot, draftState)
  } else if (draftState.phase === 'pack_draft') {
    return await makeBotCardPick(bot, draftState)
  }
  return false
}

/**
 * Get or create a behavior instance for a bot
 * @param {string} botId - Bot player ID
 * @returns {Object} Behavior instance
 */
function getBotBehavior(botId) {
  if (!botBehaviors.has(botId)) {
    botBehaviors.set(botId, getBehavior())
  }
  return botBehaviors.get(botId)
}

/**
 * Clear behavior cache (useful when draft ends)
 */
export function clearBotBehaviors() {
  botBehaviors.clear()
}

/**
 * Bot selects a leader using behavior system
 * Uses the staged pick system - selection is finalized when all players have selected
 * @returns {boolean} - Whether a selection was made
 */
async function makeBotLeaderPick(bot, draftState) {
  const leaders = jsonParse(bot.leaders, [])

  if (leaders.length === 0) {
    console.error('[BOT] Bot', bot.id, 'has no leaders to pick from! leaders:', bot.leaders)
    return false
  }

  // Get bot's drafted leaders for context
  const draftedLeaders = jsonParse(bot.drafted_leaders, [])

  // Use behavior to select leader
  const behavior = getBotBehavior(bot.id)
  const context = {
    draftedLeaders,
    setCode: draftState.setCode || leaders[0]?.set,
    leaderRound: draftState.leaderRound || 1
  }

  const pickedLeader = behavior.selectLeader(leaders, context)
  if (!pickedLeader) {
    console.error('[BOT] Bot', bot.id, 'behavior returned no leader!')
    return false
  }

  const cardId = pickedLeader.instanceId || pickedLeader.id

  // Use staged selection system
  await query(
    `UPDATE draft_pod_players
     SET selected_card_id = $1,
         pick_status = 'selected'
     WHERE id = $2`,
    [cardId, bot.id]
  )

  // Check if only one player remains picking (for last player timer)
  const remainingPickers = await queryRows(
    `SELECT id FROM draft_pod_players WHERE draft_pod_id = $1 AND pick_status = 'picking'`,
    [bot.draft_pod_id]
  )

  if (remainingPickers.length === 1) {
    // One player left - set lastPlayerStartedAt if not already set
    const pod = await queryRow('SELECT draft_state FROM draft_pods WHERE id = $1', [bot.draft_pod_id])
    const currentState = jsonParse(pod.draft_state, {})

    if (!currentState.lastPlayerStartedAt) {
      currentState.lastPlayerStartedAt = new Date().toISOString()
      await query(
        `UPDATE draft_pods SET draft_state = $1, state_version = state_version + 1 WHERE id = $2`,
        [JSON.stringify(currentState), bot.draft_pod_id]
      )
    } else {
      await query(
        `UPDATE draft_pods SET state_version = state_version + 1 WHERE id = $1`,
        [bot.draft_pod_id]
      )
    }
  } else {
    // Increment state version so clients see the update
    await query(
      `UPDATE draft_pods SET state_version = state_version + 1 WHERE id = $1`,
      [bot.draft_pod_id]
    )
  }

  return true
}

/**
 * Bot selects a card using behavior system
 * Uses the staged pick system - selection is finalized when all players have selected
 * @returns {boolean} - Whether a selection was made
 */
async function makeBotCardPick(bot, draftState) {
  const currentPack = jsonParse(bot.current_pack, [])

  if (currentPack.length === 0) {
    console.error('[BOT] Bot', bot.id, 'has no cards to pick from! current_pack:', bot.current_pack)
    return false
  }

  // Get bot's drafted cards and leaders for context
  const draftedCards = jsonParse(bot.drafted_cards, [])
  const draftedLeaders = jsonParse(bot.drafted_leaders, [])

  // Use behavior to select card
  const behavior = getBotBehavior(bot.id)
  const context = {
    draftedCards,
    draftedLeaders,
    setCode: draftState.setCode || currentPack[0]?.set,
    packNumber: draftState.packNumber || 1,
    pickInPack: draftState.pickInPack || 1
  }

  const pickedCard = behavior.selectCard(currentPack, context)
  if (!pickedCard) {
    console.error('[BOT] Bot', bot.id, 'behavior returned no card!')
    return false
  }

  const cardId = pickedCard.instanceId || pickedCard.id

  // Use staged selection system
  await query(
    `UPDATE draft_pod_players
     SET selected_card_id = $1,
         pick_status = 'selected'
     WHERE id = $2`,
    [cardId, bot.id]
  )

  // Check if only one player remains picking (for last player timer)
  const remainingPickers = await queryRows(
    `SELECT id FROM draft_pod_players WHERE draft_pod_id = $1 AND pick_status = 'picking'`,
    [bot.draft_pod_id]
  )

  if (remainingPickers.length === 1) {
    // One player left - set lastPlayerStartedAt if not already set
    const pod = await queryRow('SELECT draft_state FROM draft_pods WHERE id = $1', [bot.draft_pod_id])
    const currentState = jsonParse(pod.draft_state, {})

    if (!currentState.lastPlayerStartedAt) {
      currentState.lastPlayerStartedAt = new Date().toISOString()
      await query(
        `UPDATE draft_pods SET draft_state = $1, state_version = state_version + 1 WHERE id = $2`,
        [JSON.stringify(currentState), bot.draft_pod_id]
      )
    } else {
      await query(
        `UPDATE draft_pods SET state_version = state_version + 1 WHERE id = $1`,
        [bot.draft_pod_id]
      )
    }
  } else {
    // Increment state version so clients see the update
    await query(
      `UPDATE draft_pods SET state_version = state_version + 1 WHERE id = $1`,
      [bot.draft_pod_id]
    )
  }

  return true
}

/**
 * Process bot picks and advance state in a loop until human input is needed
 * Call this after a human makes a pick
 * Uses atomic database update to prevent concurrent execution
 */
export async function processBotTurns(podId) {
  let iterations = 0
  const maxIterations = 100 // Safety limit

  // Try to acquire processing lock using atomic update
  // Only one process can set bot_processing_since when it's NULL or stale (> 30s old)
  const lockResult = await query(
    `UPDATE draft_pods
     SET bot_processing_since = NOW()
     WHERE id = $1
       AND status = 'active'
       AND (bot_processing_since IS NULL OR bot_processing_since < NOW() - INTERVAL '30 seconds')
     RETURNING id, share_id`,
    [podId]
  )

  if (lockResult.rowCount === 0) {
    // Another process is handling bots - but still broadcast current state
    // in case the other process finished and we missed the broadcast
    const pod = await queryRow('SELECT share_id FROM draft_pods WHERE id = $1', [podId])
    if (pod?.share_id) {
      broadcastDraftState(pod.share_id).catch(err => {
        console.error('Error broadcasting after lock fail:', err)
      })
    }
    return
  }

  try {
    while (iterations < maxIterations) {
      iterations++

      // Refresh the lock timestamp to prevent timeout
      await query(
        `UPDATE draft_pods SET bot_processing_since = NOW() WHERE id = $1`,
        [podId]
      )

      // Get current state with fresh data (exclude all_packs to save memory)
      const pod = await queryRow(
        `SELECT id, share_id, status, draft_state, state_version
         FROM draft_pods WHERE id = $1`,
        [podId]
      )
      if (!pod || pod.status !== 'active') {
        break
      }

      // Note: We still process bot turns while paused - pause only affects timers, not turn advancement
      // This allows the draft to continue if all players have selected while paused

      const draftState = jsonParse(pod.draft_state, {})

      // Check if all players have selected (using new staged pick system)
      const players = await queryRows(
        'SELECT pick_status, is_bot, selected_card_id FROM draft_pod_players WHERE draft_pod_id = $1',
        [podId]
      )

      const allSelected = players.every(p => p.pick_status === 'selected' && p.selected_card_id)

      if (allSelected) {
        // Process all staged picks and advance
        await processAllStagedPicks(podId, draftState, pod)

        // After advancing, trigger bot picks if any bots need to pick
        const botsMadePicks = await triggerBotPicks(podId)
        if (!botsMadePicks) {
          // No bots picked, check if humans need to pick
          const updatedPlayers = await queryRows(
            'SELECT pick_status, is_bot FROM draft_pod_players WHERE draft_pod_id = $1',
            [podId]
          )
          const humansNeedToPick = updatedPlayers.some(p => !p.is_bot && p.pick_status === 'picking')
          if (humansNeedToPick) break // Wait for human input
        }
      } else {
        // Not all selected yet - trigger bot picks
        const botsMadePicks = await triggerBotPicks(podId)
        if (!botsMadePicks) break // No bots to pick, wait for humans
      }
    }
  } finally {
    // Always release the lock
    await query(
      `UPDATE draft_pods SET bot_processing_since = NULL WHERE id = $1`,
      [podId]
    )

    // Always broadcast state update after bot processing
    // This ensures clients get the latest state even if no picks were made
    try {
      const podForBroadcast = await queryRow('SELECT share_id FROM draft_pods WHERE id = $1', [podId])
      if (podForBroadcast?.share_id) {
        await broadcastDraftState(podForBroadcast.share_id)
      }
    } catch (err) {
      console.error('Error broadcasting after bot turns:', err)
    }
  }
}
