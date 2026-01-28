/**
 * Draft Timeout Logic
 *
 * Handles forcing picks when timeout is exceeded.
 * Called during state polling to enforce server-side timeouts.
 */

import { query, queryRow, queryRows } from '@/lib/db.js'
import { processAllStagedPicks } from './draftAdvance.js'
import { processBotTurns } from './botLogic.js'

/**
 * Check if timeout has been exceeded and force picks if needed
 * Uses atomic locking to prevent concurrent timeout enforcement
 * @param {string} podId - Draft pod ID
 * @returns {boolean} - Whether any picks were forced
 */
export async function checkAndEnforceTimeout(podId) {
  // Get pod with timeout settings (exclude all_packs to save memory)
  const pod = await queryRow(
    `SELECT id, share_id, status, draft_state, state_version,
            timed, timer_enabled, timer_seconds, pick_timeout_seconds,
            pick_started_at, paused, paused_duration_seconds
     FROM draft_pods WHERE id = $1`,
    [podId]
  )

  if (!pod) return false

  // Only enforce timeouts on active, non-paused drafts
  if (pod.status !== 'active' || pod.paused === true) {
    return false
  }

  // Check if timeout has passed
  if (!pod.pick_started_at) {
    return false
  }

  // Timer settings - both can be enabled/disabled independently
  const isRoundTimerEnabled = pod.timed !== false
  const isLastPlayerTimerEnabled = pod.timer_enabled !== false
  const roundTimeoutSeconds = pod.pick_timeout_seconds || 120
  const lastPlayerTimeoutSeconds = pod.timer_seconds || 30

  // If neither timer is enabled, nothing to enforce
  if (!isRoundTimerEnabled && !isLastPlayerTimerEnabled) {
    return false
  }

  // Get players who haven't selected
  const players = await queryRows(
    `SELECT * FROM draft_pod_players
     WHERE draft_pod_id = $1 AND pick_status = 'picking'
     ORDER BY seat_number`,
    [podId]
  )

  if (players.length === 0) {
    // Everyone has selected, nothing to do
    return false
  }

  const pickStartedAt = new Date(pod.pick_started_at).getTime()
  const now = Date.now()
  // Subtract any accumulated paused time from elapsed calculation
  const pausedDurationMs = (pod.paused_duration_seconds || 0) * 1000
  const elapsed = now - pickStartedAt - pausedDurationMs

  // Check if either timer has expired
  const isLastPlayer = players.length === 1

  // Round timer uses elapsed time since pick started
  const roundTimerExpired = isRoundTimerEnabled && elapsed >= roundTimeoutSeconds * 1000

  // Last player timer uses the time since they became the last player
  // This is stored in draft_state.lastPlayerStartedAt when bots finish picking
  const draftState = typeof pod.draft_state === 'string'
    ? JSON.parse(pod.draft_state)
    : pod.draft_state || {}

  let lastPlayerTimerExpired = false
  if (isLastPlayerTimerEnabled && isLastPlayer && draftState.lastPlayerStartedAt) {
    const lastPlayerStartedAt = new Date(draftState.lastPlayerStartedAt).getTime()
    const lastPlayerElapsed = now - lastPlayerStartedAt
    lastPlayerTimerExpired = lastPlayerElapsed >= lastPlayerTimeoutSeconds * 1000
  }

  if (!roundTimerExpired && !lastPlayerTimerExpired) {
    // Neither timeout reached yet
    return false
  }

  // Try to acquire lock using atomic update
  // Use state_version for locking instead of pick_started_at to avoid timestamp precision issues
  const lockResult = await query(
    `UPDATE draft_pods
     SET state_version = state_version + 1
     WHERE id = $1
       AND status = 'active'
       AND state_version = $2
     RETURNING id`,
    [podId, pod.state_version]
  )

  if (lockResult.rowCount === 0) {
    // Another process already handled this timeout or state changed
    return false
  }

  const phase = draftState.phase

  // Force selections for each player who hasn't selected
  for (const player of players) {
    if (phase === 'leader_draft') {
      await forceLeaderSelect(player)
    } else if (phase === 'pack_draft') {
      await forcePackSelect(player)
    }
  }

  // Process all staged picks (including forced ones) and advance
  await processAllStagedPicks(podId, draftState, pod)

  // Trigger bot turns for the next round
  processBotTurns(podId).catch(err => {
    console.error('[TIMEOUT] Error processing bot turns after timeout:', err)
  })

  return true
}

/**
 * Force a random leader selection for a player (using staged pick system)
 */
async function forceLeaderSelect(player) {
  const leaders = typeof player.leaders === 'string'
    ? JSON.parse(player.leaders)
    : player.leaders || []

  if (leaders.length === 0) {
    // No leaders to select, just mark as selected with no card
    await query(
      `UPDATE draft_pod_players SET pick_status = 'selected', selected_card_id = NULL WHERE id = $1`,
      [player.id]
    )
    return
  }

  // Select a random leader
  const randomIndex = Math.floor(Math.random() * leaders.length)
  const selectedLeader = leaders[randomIndex]
  const cardId = selectedLeader.instanceId || selectedLeader.id

  await query(
    `UPDATE draft_pod_players
     SET selected_card_id = $1,
         pick_status = 'selected'
     WHERE id = $2`,
    [cardId, player.id]
  )
}

/**
 * Force a random card selection for a player (using staged pick system)
 */
async function forcePackSelect(player) {
  const currentPack = typeof player.current_pack === 'string'
    ? JSON.parse(player.current_pack)
    : player.current_pack || []

  if (currentPack.length === 0) {
    // No cards to select, just mark as selected with no card
    await query(
      `UPDATE draft_pod_players SET pick_status = 'selected', selected_card_id = NULL WHERE id = $1`,
      [player.id]
    )
    return
  }

  // Select a random card
  const randomIndex = Math.floor(Math.random() * currentPack.length)
  const selectedCard = currentPack[randomIndex]
  const cardId = selectedCard.instanceId || selectedCard.id

  await query(
    `UPDATE draft_pod_players
     SET selected_card_id = $1,
         pick_status = 'selected'
     WHERE id = $2`,
    [cardId, player.id]
  )
}
