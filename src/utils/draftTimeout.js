/**
 * Draft Timeout Logic
 *
 * Handles forcing picks when timeout is exceeded.
 * Called during state polling to enforce server-side timeouts.
 */

import { query, queryRow, queryRows } from '@/lib/db.js'
import { checkAndAdvanceLeaderDraft, checkAndAdvancePackDraft } from './draftAdvance.js'

/**
 * Check if timeout has been exceeded and force picks if needed
 * @param {string} podId - Draft pod ID
 * @returns {boolean} - Whether any picks were forced
 */
export async function checkAndEnforceTimeout(podId) {
  // Get pod with timeout settings
  const pod = await queryRow(
    `SELECT * FROM draft_pods WHERE id = $1`,
    [podId]
  )

  if (!pod) return false

  // Only enforce timeouts on active, timed, non-paused drafts
  if (pod.status !== 'active' || pod.timed === false || pod.paused === true) {
    return false
  }

  // Check if timeout has passed
  if (!pod.pick_started_at) {
    return false
  }

  // Get players who haven't picked
  const players = await queryRows(
    `SELECT * FROM draft_pod_players
     WHERE draft_pod_id = $1 AND pick_status = 'picking'
     ORDER BY seat_number`,
    [podId]
  )

  if (players.length === 0) {
    // Everyone has picked, nothing to do
    return false
  }

  // Use last player timer if only one player is picking
  const isLastPlayer = players.length === 1
  const timeoutSeconds = isLastPlayer
    ? (pod.timer_seconds || 30)
    : (pod.pick_timeout_seconds || 120)

  const pickStartedAt = new Date(pod.pick_started_at).getTime()
  const timeoutMs = timeoutSeconds * 1000
  const now = Date.now()
  // Subtract any accumulated paused time from elapsed calculation
  const pausedDurationMs = (pod.paused_duration_seconds || 0) * 1000
  const elapsed = now - pickStartedAt - pausedDurationMs

  if (elapsed < timeoutMs) {
    // Timeout not reached yet
    return false
  }

  // Parse draft state
  const draftState = typeof pod.draft_state === 'string'
    ? JSON.parse(pod.draft_state)
    : pod.draft_state || {}

  const phase = draftState.phase

  // Force picks for each player who hasn't picked
  for (const player of players) {
    if (phase === 'leader_draft') {
      await forceLeaderPick(player, draftState)
    } else if (phase === 'pack_draft') {
      await forcePackPick(player, draftState)
    }
  }

  // Now advance the draft state
  if (phase === 'leader_draft') {
    await checkAndAdvanceLeaderDraft(podId, draftState, pod)
  } else if (phase === 'pack_draft') {
    await checkAndAdvancePackDraft(podId, draftState, pod)
  }

  return true
}

/**
 * Force a random leader pick for a player
 */
async function forceLeaderPick(player, draftState) {
  const leaders = typeof player.leaders === 'string'
    ? JSON.parse(player.leaders)
    : player.leaders || []

  if (leaders.length === 0) {
    // No leaders to pick, just mark as picked
    await query(
      `UPDATE draft_pod_players SET pick_status = 'picked' WHERE id = $1`,
      [player.id]
    )
    return
  }

  // Pick a random leader
  const randomIndex = Math.floor(Math.random() * leaders.length)
  const pickedLeader = leaders[randomIndex]

  // Remove from available, add to drafted
  const remainingLeaders = leaders.filter((_, i) => i !== randomIndex)
  const draftedLeaders = typeof player.drafted_leaders === 'string'
    ? JSON.parse(player.drafted_leaders)
    : player.drafted_leaders || []

  // Add pick metadata
  const leaderRound = draftState?.leaderRound || 1
  pickedLeader.pickNumber = draftedLeaders.length + 1
  pickedLeader.leaderRound = leaderRound

  draftedLeaders.push(pickedLeader)

  await query(
    `UPDATE draft_pod_players
     SET leaders = $1,
         drafted_leaders = $2,
         pick_status = 'picked',
         last_pick_at = NOW()
     WHERE id = $3`,
    [JSON.stringify(remainingLeaders), JSON.stringify(draftedLeaders), player.id]
  )
}

/**
 * Force a random card pick for a player
 */
async function forcePackPick(player, draftState) {
  const currentPack = typeof player.current_pack === 'string'
    ? JSON.parse(player.current_pack)
    : player.current_pack || []

  if (currentPack.length === 0) {
    // No cards to pick, just mark as picked
    await query(
      `UPDATE draft_pod_players SET pick_status = 'picked' WHERE id = $1`,
      [player.id]
    )
    return
  }

  // Pick a random card
  const randomIndex = Math.floor(Math.random() * currentPack.length)
  const pickedCard = currentPack[randomIndex]

  // Remove from pack, add to drafted
  const remainingPack = currentPack.filter((_, i) => i !== randomIndex)
  const draftedCards = typeof player.drafted_cards === 'string'
    ? JSON.parse(player.drafted_cards)
    : player.drafted_cards || []

  // Add pick metadata
  const packNumber = draftState?.packNumber || 1
  const pickInPack = draftState?.pickInPack || 1
  pickedCard.pickNumber = draftedCards.length + 1
  pickedCard.packNumber = packNumber
  pickedCard.pickInPack = pickInPack

  draftedCards.push(pickedCard)

  await query(
    `UPDATE draft_pod_players
     SET current_pack = $1,
         drafted_cards = $2,
         pick_status = 'picked',
         last_pick_at = NOW()
     WHERE id = $3`,
    [JSON.stringify(remainingPack), JSON.stringify(draftedCards), player.id]
  )
}
