/**
 * Draft Advance Logic
 *
 * Handles advancing draft state after picks are made.
 * Extracted to avoid circular imports between pick route and bot logic.
 */

import { query, queryRow, queryRows } from '@/lib/db.js'
import { getPassDirection, getLeaderPassDirection, getNextSeat, getCardsPerDraftPack } from './draftLogic.js'

/**
 * Check if all players picked and advance leader draft
 */
export async function checkAndAdvanceLeaderDraft(podId, draftState, pod) {
  const players = await queryRows(
    'SELECT * FROM draft_pod_players WHERE draft_pod_id = $1 ORDER BY seat_number',
    [podId]
  )

  const allPicked = players.every(p => p.pick_status === 'picked')
  if (!allPicked) {
    // Just increment state version
    await query(
      'UPDATE draft_pods SET state_version = state_version + 1 WHERE id = $1',
      [podId]
    )
    return false
  }

  // All players have picked - advance to next round
  const currentRound = draftState.leaderRound

  if (currentRound === 1) {
    // Pass remaining leaders (2) to the right
    const direction = getLeaderPassDirection(1) // 'right'
    await passLeaders(players, direction)

    // Update state for round 2
    draftState.leaderRound = 2
    await query(
      `UPDATE draft_pods
       SET draft_state = $1,
           state_version = state_version + 1,
           pick_started_at = NOW(),
           paused_duration_seconds = 0
       WHERE id = $2`,
      [JSON.stringify(draftState), podId]
    )

    // Reset pick status
    await query(
      `UPDATE draft_pod_players
       SET pick_status = 'picking'
       WHERE draft_pod_id = $1`,
      [podId]
    )

  } else if (currentRound === 2) {
    // Move to round 3 - let players confirm their final leader
    draftState.leaderRound = 3
    await query(
      `UPDATE draft_pods
       SET draft_state = $1,
           state_version = state_version + 1,
           pick_started_at = NOW(),
           paused_duration_seconds = 0
       WHERE id = $2`,
      [JSON.stringify(draftState), podId]
    )

    // Reset pick status for round 3
    await query(
      `UPDATE draft_pod_players
       SET pick_status = 'picking'
       WHERE draft_pod_id = $1`,
      [podId]
    )

  } else if (currentRound === 3) {
    // Round 3 complete - transition to pack draft phase
    draftState.phase = 'pack_draft'
    draftState.packNumber = 1
    draftState.pickInPack = 1

    // Get all packs and distribute pack 1
    const allPacks = typeof pod.all_packs === 'string'
      ? JSON.parse(pod.all_packs)
      : pod.all_packs

    // Assign pack 1 to each player (by seat order, 0-indexed)
    for (let i = 0; i < players.length; i++) {
      const player = players[i]
      const pack = allPacks[i][0] // Pack 1 for this player

      await query(
        `UPDATE draft_pod_players
         SET current_pack = $1,
             pick_status = 'picking'
         WHERE id = $2`,
        [JSON.stringify(pack), player.id]
      )
    }

    await query(
      `UPDATE draft_pods
       SET draft_state = $1,
           state_version = state_version + 1,
           pick_started_at = NOW(),
           paused_duration_seconds = 0
       WHERE id = $2`,
      [JSON.stringify(draftState), podId]
    )
  }

  return true
}

/**
 * Pass leaders between players
 */
async function passLeaders(players, direction) {
  // Collect all remaining leaders
  const leadersByPlayer = []
  for (const player of players) {
    const leaders = typeof player.leaders === 'string'
      ? JSON.parse(player.leaders)
      : player.leaders || []
    leadersByPlayer.push({ playerId: player.id, seatNumber: player.seat_number, leaders })
  }

  // Calculate new assignments
  const totalSeats = players.length
  for (const playerData of leadersByPlayer) {
    const nextSeat = getNextSeat(playerData.seatNumber, direction, totalSeats)
    const nextPlayer = players.find(p => p.seat_number === nextSeat)
    if (nextPlayer) {
      await query(
        'UPDATE draft_pod_players SET leaders = $1 WHERE id = $2',
        [JSON.stringify(playerData.leaders), nextPlayer.id]
      )
    }
  }
}

/**
 * Check if all players picked and advance pack draft
 */
export async function checkAndAdvancePackDraft(podId, draftState, pod) {
  console.log('[ADVANCE-PACK] Checking pack draft advance, pack:', draftState.packNumber, 'pick:', draftState.pickInPack)

  const players = await queryRows(
    'SELECT * FROM draft_pod_players WHERE draft_pod_id = $1 ORDER BY seat_number',
    [podId]
  )

  const allPicked = players.every(p => p.pick_status === 'picked')
  if (!allPicked) {
    console.log('[ADVANCE-PACK] Not all picked yet')
    // Just increment state version
    await query(
      'UPDATE draft_pods SET state_version = state_version + 1 WHERE id = $1',
      [podId]
    )
    return false
  }

  // All players have picked
  const packNumber = draftState.packNumber
  const pickInPack = draftState.pickInPack
  const totalPacks = 3

  // Check if current pack is exhausted
  const firstPlayer = players[0]
  const remainingPack = typeof firstPlayer.current_pack === 'string'
    ? JSON.parse(firstPlayer.current_pack)
    : firstPlayer.current_pack || []

  console.log('[ADVANCE-PACK] All picked. Pack', packNumber, 'remaining cards:', remainingPack.length)

  if (remainingPack.length === 0) {
    console.log('[ADVANCE-PACK] Pack exhausted, packNumber:', packNumber, 'totalPacks:', totalPacks)
    // Pack is done, move to next pack or complete draft
    if (packNumber >= totalPacks) {
      // Draft complete!
      await query(
        `UPDATE draft_pods
         SET status = 'complete',
             draft_state = $1,
             completed_at = NOW(),
             state_version = state_version + 1
         WHERE id = $2`,
        [JSON.stringify({ ...draftState, phase: 'complete' }), podId]
      )
      return true
    }

    // Move to next pack
    draftState.packNumber = packNumber + 1
    draftState.pickInPack = 1
    console.log('[ADVANCE-PACK] Moving to pack', draftState.packNumber)

    // Get all packs and distribute next pack
    const allPacks = typeof pod.all_packs === 'string'
      ? JSON.parse(pod.all_packs)
      : pod.all_packs

    console.log('[ADVANCE-PACK] allPacks structure:', allPacks?.length, 'players, packs per player:', allPacks?.[0]?.length)

    // Assign next pack to each player
    for (let i = 0; i < players.length; i++) {
      const player = players[i]
      const pack = allPacks[i][packNumber] // Next pack (0-indexed array, packNumber is the old value which equals new index)
      console.log('[ADVANCE-PACK] Player', i, 'getting pack index', packNumber, 'with', pack?.length, 'cards')

      await query(
        `UPDATE draft_pod_players
         SET current_pack = $1,
             pick_status = 'picking'
         WHERE id = $2`,
        [JSON.stringify(pack), player.id]
      )
    }

    await query(
      `UPDATE draft_pods
       SET draft_state = $1,
           state_version = state_version + 1,
           pick_started_at = NOW(),
           paused_duration_seconds = 0
       WHERE id = $2`,
      [JSON.stringify(draftState), podId]
    )

  } else {
    // Pass packs and continue
    const direction = getPassDirection(packNumber)
    await passPacks(players, direction)

    // Update state
    draftState.pickInPack = pickInPack + 1

    await query(
      `UPDATE draft_pods
       SET draft_state = $1,
           state_version = state_version + 1,
           pick_started_at = NOW(),
           paused_duration_seconds = 0
       WHERE id = $2`,
      [JSON.stringify(draftState), podId]
    )

    // Reset pick status
    await query(
      `UPDATE draft_pod_players
       SET pick_status = 'picking'
       WHERE draft_pod_id = $1`,
      [podId]
    )
  }

  return true
}

/**
 * Pass packs between players
 */
async function passPacks(players, direction) {
  // Collect all current packs
  const packsByPlayer = []
  for (const player of players) {
    const currentPack = typeof player.current_pack === 'string'
      ? JSON.parse(player.current_pack)
      : player.current_pack || []
    packsByPlayer.push({ playerId: player.id, seatNumber: player.seat_number, pack: currentPack })
  }

  // Calculate new assignments
  const totalSeats = players.length
  for (const playerData of packsByPlayer) {
    const nextSeat = getNextSeat(playerData.seatNumber, direction, totalSeats)
    const nextPlayer = players.find(p => p.seat_number === nextSeat)
    if (nextPlayer) {
      await query(
        'UPDATE draft_pod_players SET current_pack = $1 WHERE id = $2',
        [JSON.stringify(playerData.pack), nextPlayer.id]
      )
    }
  }
}
