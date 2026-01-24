/**
 * Bot Logic for Draft Testing
 *
 * Handles automatic picks for bot players during draft.
 */

import { query, queryRow, queryRows } from '@/lib/db.js'
import { checkAndAdvanceLeaderDraft, checkAndAdvancePackDraft } from './draftAdvance.js'

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
    // Small delay between bot picks
    await new Promise(resolve => setTimeout(resolve, 100))
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
    console.log('[BOT] Bot', botId, 'no longer needs to pick (already picked or state changed)')
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
 * Bot picks a leader (random selection)
 * @returns {boolean} - Whether a pick was made
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
  const remainingLeaders = leaders.filter((_, i) => i !== pickIndex)

  const draftedLeaders = typeof bot.drafted_leaders === 'string'
    ? JSON.parse(bot.drafted_leaders)
    : bot.drafted_leaders || []

  // Add pick metadata
  const leaderRound = draftState?.leaderRound || 1
  pickedLeader.pickNumber = draftedLeaders.length + 1
  pickedLeader.leaderRound = leaderRound

  draftedLeaders.push(pickedLeader)

  await query(
    `UPDATE draft_pod_players
     SET drafted_leaders = $1,
         leaders = $2,
         pick_status = 'picked',
         last_pick_at = NOW()
     WHERE id = $3`,
    [
      JSON.stringify(draftedLeaders),
      JSON.stringify(remainingLeaders),
      bot.id
    ]
  )

  console.log('[BOT] Bot', bot.id, 'picked leader:', pickedLeader.name)
  return true
}

/**
 * Bot picks a card (prefers higher rarity)
 * @returns {boolean} - Whether a pick was made
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
  // Use instanceId if available to ensure correct card is removed (handles duplicate base IDs)
  const remainingPack = currentPack.filter(c =>
    pickedCard.instanceId
      ? c.instanceId !== pickedCard.instanceId
      : c.id !== pickedCard.id
  )

  const draftedCards = typeof bot.drafted_cards === 'string'
    ? JSON.parse(bot.drafted_cards)
    : bot.drafted_cards || []

  // Add pick metadata
  const packNumber = draftState?.packNumber || 1
  const pickInPack = draftState?.pickInPack || 1
  pickedCard.pickNumber = draftedCards.length + 1
  pickedCard.packNumber = packNumber
  pickedCard.pickInPack = pickInPack

  draftedCards.push(pickedCard)

  await query(
    `UPDATE draft_pod_players
     SET drafted_cards = $1,
         current_pack = $2,
         pick_status = 'picked',
         last_pick_at = NOW()
     WHERE id = $3`,
    [
      JSON.stringify(draftedCards),
      JSON.stringify(remainingPack),
      bot.id
    ]
  )

  console.log('[BOT] Bot', bot.id, 'picked card:', pickedCard.name, '(pack', packNumber, 'pick', pickInPack, ')')
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

  console.log('[BOT]', instanceId, 'Starting processBotTurns for pod', podId)

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
    console.log('[BOT]', instanceId, 'Could not acquire lock, another process is handling bots or pod not active')
    return
  }

  console.log('[BOT]', instanceId, 'Acquired processing lock')

  try {
    while (iterations < maxIterations) {
      iterations++
      console.log('[BOT]', instanceId, 'Iteration', iterations)

      // Refresh the lock timestamp to prevent timeout
      await query(
        `UPDATE draft_pods SET bot_processing_since = NOW() WHERE id = $1`,
        [podId]
      )

      // Get current state with fresh data
      const pod = await queryRow('SELECT * FROM draft_pods WHERE id = $1', [podId])
      if (!pod || pod.status !== 'active') {
        console.log('[BOT]', instanceId, 'Pod not active, breaking. Status:', pod?.status)
        break
      }

      // Don't process bot turns while draft is paused
      if (pod.paused === true) {
        console.log('[BOT]', instanceId, 'Draft is paused, breaking')
        break
      }

      const draftState = typeof pod.draft_state === 'string'
        ? JSON.parse(pod.draft_state)
        : pod.draft_state || {}

      // Check if all players have picked
      const players = await queryRows(
        'SELECT pick_status, is_bot FROM draft_pod_players WHERE draft_pod_id = $1',
        [podId]
      )

      const allPicked = players.every(p => p.pick_status === 'picked')

      if (allPicked) {
        console.log('[BOT]', instanceId, 'All picked, advancing state. Phase:', draftState.phase)
        // Advance the draft state
        let advanced = false
        if (draftState.phase === 'leader_draft') {
          advanced = await checkAndAdvanceLeaderDraft(podId, draftState, pod)
        } else if (draftState.phase === 'pack_draft') {
          advanced = await checkAndAdvancePackDraft(podId, draftState, pod)
        }

        console.log('[BOT]', instanceId, 'Advanced:', advanced)
        if (!advanced) break

        // After advancing, trigger bot picks if any bots need to pick
        const botsMadePicks = await triggerBotPicks(podId)
        console.log('[BOT]', instanceId, 'After advance, bots made picks:', botsMadePicks)
        if (!botsMadePicks) {
          // No bots picked, check if humans need to pick
          const updatedPlayers = await queryRows(
            'SELECT pick_status, is_bot FROM draft_pod_players WHERE draft_pod_id = $1',
            [podId]
          )
          const humansNeedToPick = updatedPlayers.some(p => !p.is_bot && p.pick_status === 'picking')
          console.log('[BOT]', instanceId, 'Humans need to pick:', humansNeedToPick)
          if (humansNeedToPick) break // Wait for human input
        }
      } else {
        console.log('[BOT]', instanceId, 'Not all picked, triggering bot picks')
        // Not all picked yet - trigger bot picks
        const botsMadePicks = await triggerBotPicks(podId)
        console.log('[BOT]', instanceId, 'Bots made picks:', botsMadePicks)
        if (!botsMadePicks) break // No bots to pick, wait for humans
      }
    }
  } finally {
    // Always release the lock
    await query(
      `UPDATE draft_pods SET bot_processing_since = NULL WHERE id = $1`,
      [podId]
    )
    console.log('[BOT]', instanceId, 'Released processing lock after', iterations, 'iterations')
  }
}
