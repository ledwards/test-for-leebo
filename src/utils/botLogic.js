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

  for (const bot of botsNeedingPicks) {
    await makeBotPick(bot, draftState)
    // Small delay between bot picks
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return true
}

/**
 * Make a pick for a single bot
 */
async function makeBotPick(bot, draftState) {
  if (draftState.phase === 'leader_draft') {
    await makeBotLeaderPick(bot, draftState)
  } else if (draftState.phase === 'pack_draft') {
    await makeBotCardPick(bot, draftState)
  }
}

/**
 * Bot picks a leader (random selection)
 */
async function makeBotLeaderPick(bot, draftState) {
  const leaders = typeof bot.leaders === 'string'
    ? JSON.parse(bot.leaders)
    : bot.leaders || []

  if (leaders.length === 0) return

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
}

/**
 * Bot picks a card (prefers higher rarity)
 */
async function makeBotCardPick(bot, draftState) {
  const currentPack = typeof bot.current_pack === 'string'
    ? JSON.parse(bot.current_pack)
    : bot.current_pack || []

  if (currentPack.length === 0) return

  // Sort by rarity and pick the best
  const rarityOrder = { 'Legendary': 0, 'Rare': 1, 'Uncommon': 2, 'Common': 3 }
  const sorted = [...currentPack].sort(
    (a, b) => (rarityOrder[a.rarity] ?? 4) - (rarityOrder[b.rarity] ?? 4)
  )

  const pickedCard = sorted[0]
  const remainingPack = currentPack.filter(c => c.id !== pickedCard.id)

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
}

/**
 * Process bot picks and advance state in a loop until human input is needed
 * Call this after a human makes a pick
 */
export async function processBotTurns(podId) {
  let iterations = 0
  const maxIterations = 100 // Safety limit

  console.log('[BOT] Starting processBotTurns')

  while (iterations < maxIterations) {
    iterations++
    console.log('[BOT] Iteration', iterations)

    // Get current state
    const pod = await queryRow('SELECT * FROM draft_pods WHERE id = $1', [podId])
    if (!pod || pod.status !== 'active') {
      console.log('[BOT] Pod not active, breaking. Status:', pod?.status)
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
      console.log('[BOT] All picked, advancing state. Phase:', draftState.phase)
      // Advance the draft state
      let advanced = false
      if (draftState.phase === 'leader_draft') {
        advanced = await checkAndAdvanceLeaderDraft(podId, draftState, pod)
      } else if (draftState.phase === 'pack_draft') {
        advanced = await checkAndAdvancePackDraft(podId, draftState, pod)
      }

      console.log('[BOT] Advanced:', advanced)
      if (!advanced) break

      // After advancing, trigger bot picks if any bots need to pick
      const botsMadePicks = await triggerBotPicks(podId)
      console.log('[BOT] After advance, bots made picks:', botsMadePicks)
      if (!botsMadePicks) {
        // No bots picked, check if humans need to pick
        const updatedPlayers = await queryRows(
          'SELECT pick_status, is_bot FROM draft_pod_players WHERE draft_pod_id = $1',
          [podId]
        )
        const humansNeedToPick = updatedPlayers.some(p => !p.is_bot && p.pick_status === 'picking')
        console.log('[BOT] Humans need to pick:', humansNeedToPick)
        if (humansNeedToPick) break // Wait for human input
      }
    } else {
      console.log('[BOT] Not all picked, triggering bot picks')
      // Not all picked yet - trigger bot picks
      const botsMadePicks = await triggerBotPicks(podId)
      console.log('[BOT] Bots made picks:', botsMadePicks)
      if (!botsMadePicks) break // No bots to pick, wait for humans
    }
  }
  console.log('[BOT] processBotTurns finished after', iterations, 'iterations')
}
