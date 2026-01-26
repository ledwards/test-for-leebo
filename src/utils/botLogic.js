/**
 * Bot Logic for Draft Testing
 *
 * Handles automatic picks for bot players during draft.
 */

import { query, queryRow, queryRows } from '@/lib/db.js'
import { checkAndAdvanceLeaderDraft, checkAndAdvancePackDraft, processAllStagedPicks } from './draftAdvance.js'

/**
 * Check if any bots need to pick and make picks for them
 * @param {string} podId - Draft pod ID
 * @returns {boolean} - Whether any bot picks were made
 */
export async function triggerBotPicks(podId) {
  const pod = await queryRow('SELECT * FROM draft_pods WHERE id = $1', [podId])
  if (!pod || pod.status !== 'active') return false

  const draftState = typeof pod.draft_state === 'string'
    ? JSON.parse(pod.draft_state)
    : pod.draft_state || {}

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
    // console.log('[BOT] Bot', botId, 'no longer needs to pick (already picked or state changed)')
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
 * Bot selects a leader (random selection)
 * Uses the staged pick system - selection is finalized when all players have selected
 * @returns {boolean} - Whether a selection was made
 */
async function makeBotLeaderPick(bot, draftState) {
  const leaders = typeof bot.leaders === 'string'
    ? JSON.parse(bot.leaders)
    : bot.leaders || []

  if (leaders.length === 0) {
    console.error('[BOT] Bot', bot.id, 'has no leaders to pick from! leaders:', bot.leaders)
    return false
  }

  // Pick randomly
  const pickIndex = Math.floor(Math.random() * leaders.length)
  const pickedLeader = leaders[pickIndex]
  const cardId = pickedLeader.instanceId || pickedLeader.id

  // Use staged selection system
  await query(
    `UPDATE draft_pod_players
     SET selected_card_id = $1,
         pick_status = 'selected'
     WHERE id = $2`,
    [cardId, bot.id]
  )

  // Increment state version so clients see the update
  await query(
    `UPDATE draft_pods SET state_version = state_version + 1 WHERE id = $1`,
    [bot.draft_pod_id]
  )

  // console.log('[BOT] Bot', bot.id, 'selected leader:', pickedLeader.name)
  return true
}

/**
 * Bot selects a card (prefers higher rarity)
 * Uses the staged pick system - selection is finalized when all players have selected
 * @returns {boolean} - Whether a selection was made
 */
async function makeBotCardPick(bot, draftState) {
  const currentPack = typeof bot.current_pack === 'string'
    ? JSON.parse(bot.current_pack)
    : bot.current_pack || []

  if (currentPack.length === 0) {
    console.error('[BOT] Bot', bot.id, 'has no cards to pick from! current_pack:', bot.current_pack)
    return false
  }

  // Sort by rarity and pick the best
  const rarityOrder = { 'Legendary': 0, 'Rare': 1, 'Uncommon': 2, 'Common': 3 }
  const sorted = [...currentPack].sort(
    (a, b) => (rarityOrder[a.rarity] ?? 4) - (rarityOrder[b.rarity] ?? 4)
  )

  const pickedCard = sorted[0]
  const cardId = pickedCard.instanceId || pickedCard.id

  // Use staged selection system
  await query(
    `UPDATE draft_pod_players
     SET selected_card_id = $1,
         pick_status = 'selected'
     WHERE id = $2`,
    [cardId, bot.id]
  )

  // Increment state version so clients see the update
  await query(
    `UPDATE draft_pods SET state_version = state_version + 1 WHERE id = $1`,
    [bot.draft_pod_id]
  )

  // console.log('[BOT] Bot', bot.id, 'selected card:', pickedCard.name)
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
  const instanceId = Math.random().toString(36).slice(2, 8) // Unique ID for this execution

  // console.log('[BOT]', instanceId, 'Starting processBotTurns for pod', podId)

  // Try to acquire processing lock using atomic update
  // Only one process can set bot_processing_since when it's NULL or stale (> 30s old)
  const lockResult = await query(
    `UPDATE draft_pods
     SET bot_processing_since = NOW()
     WHERE id = $1
       AND status = 'active'
       AND (bot_processing_since IS NULL OR bot_processing_since < NOW() - INTERVAL '30 seconds')
     RETURNING id`,
    [podId]
  )

  if (lockResult.rowCount === 0) {
    // console.log('[BOT]', instanceId, 'Could not acquire lock, another process is handling bots or pod not active')
    return
  }

  // console.log('[BOT]', instanceId, 'Acquired processing lock')

  try {
    while (iterations < maxIterations) {
      iterations++
      // console.log('[BOT]', instanceId, 'Iteration', iterations)

      // Refresh the lock timestamp to prevent timeout
      await query(
        `UPDATE draft_pods SET bot_processing_since = NOW() WHERE id = $1`,
        [podId]
      )

      // Get current state with fresh data
      const pod = await queryRow('SELECT * FROM draft_pods WHERE id = $1', [podId])
      if (!pod || pod.status !== 'active') {
        // console.log('[BOT]', instanceId, 'Pod not active, breaking. Status:', pod?.status)
        break
      }

      // Note: We still process bot turns while paused - pause only affects timers, not turn advancement
      // This allows the draft to continue if all players have selected while paused

      const draftState = typeof pod.draft_state === 'string'
        ? JSON.parse(pod.draft_state)
        : pod.draft_state || {}

      // Check if all players have selected (using new staged pick system)
      const players = await queryRows(
        'SELECT pick_status, is_bot, selected_card_id FROM draft_pod_players WHERE draft_pod_id = $1',
        [podId]
      )

      const allSelected = players.every(p => p.pick_status === 'selected' && p.selected_card_id)

      if (allSelected) {
        // console.log('[BOT]', instanceId, 'All selected, processing staged picks. Phase:', draftState.phase)
        // Process all staged picks and advance
        await processAllStagedPicks(podId, draftState, pod)

        // After advancing, trigger bot picks if any bots need to pick
        const botsMadePicks = await triggerBotPicks(podId)
        // console.log('[BOT]', instanceId, 'After advance, bots made picks:', botsMadePicks)
        if (!botsMadePicks) {
          // No bots picked, check if humans need to pick
          const updatedPlayers = await queryRows(
            'SELECT pick_status, is_bot FROM draft_pod_players WHERE draft_pod_id = $1',
            [podId]
          )
          const humansNeedToPick = updatedPlayers.some(p => !p.is_bot && p.pick_status === 'picking')
          // console.log('[BOT]', instanceId, 'Humans need to pick:', humansNeedToPick)
          if (humansNeedToPick) break // Wait for human input
        }
      } else {
        // console.log('[BOT]', instanceId, 'Not all selected, triggering bot picks')
        // Not all selected yet - trigger bot picks
        const botsMadePicks = await triggerBotPicks(podId)
        // console.log('[BOT]', instanceId, 'Bots made picks:', botsMadePicks)
        if (!botsMadePicks) break // No bots to pick, wait for humans
      }
    }
  } finally {
    // Always release the lock
    await query(
      `UPDATE draft_pods SET bot_processing_since = NULL WHERE id = $1`,
      [podId]
    )
    // console.log('[BOT]', instanceId, 'Released processing lock after', iterations, 'iterations')
  }
}
