/**
 * Draft Advance Logic
 *
 * Handles advancing draft state after picks are made.
 * Extracted to avoid circular imports between pick route and bot logic.
 */

import { query, queryRow, queryRows } from '@/lib/db.js'
import { getPassDirection, getLeaderPassDirection, getNextSeat, getCardsPerDraftPack } from './draftLogic.js'

/**
 * Process all staged picks when all players have selected
 * This is the new "staged pick" system where:
 * 1. Players select cards (stored in selected_card_id)
 * 2. When all have selected, this function processes all picks at once
 * 3. Then advances the draft
 */
export async function processAllStagedPicks(podId, draftState, pod) {
  // Use SELECT FOR UPDATE to lock the rows and prevent race conditions
  // This ensures only one request can process picks at a time
  const players = await queryRows(
    'SELECT * FROM draft_pod_players WHERE draft_pod_id = $1 ORDER BY seat_number FOR UPDATE',
    [podId]
  )

  // Check if there are actually picks to process (must re-check after acquiring lock)
  const hasPicksToProcess = players.some(p => p.selected_card_id && p.pick_status === 'selected')
  if (!hasPicksToProcess) {
    // No picks to process - already processed or nothing selected
    return false
  }

  // Double-check ALL players are in 'selected' status before processing
  // This prevents partial processing if some picks already went through
  const allSelected = players.every(p => p.pick_status === 'selected' && p.selected_card_id)
  if (!allSelected) {
    // Not all players have selected - don't process yet
    return false
  }

  if (draftState.phase === 'leader_draft') {
    // Process leader picks
    for (const player of players) {
      const cardId = player.selected_card_id
      if (!cardId) continue

      const leaders = typeof player.leaders === 'string'
        ? JSON.parse(player.leaders)
        : player.leaders || []

      const draftedLeaders = typeof player.drafted_leaders === 'string'
        ? JSON.parse(player.drafted_leaders)
        : player.drafted_leaders || []

      // Find and pick the leader
      const leaderIndex = leaders.findIndex(l =>
        (l.instanceId && l.instanceId === cardId) || (!l.instanceId && l.id === cardId)
      )

      if (leaderIndex >= 0) {
        const pickedLeader = leaders[leaderIndex]
        const remainingLeaders = leaders.filter((_, i) => i !== leaderIndex)

        // Add pick metadata
        const leaderRound = draftState.leaderRound || 1
        pickedLeader.pickNumber = draftedLeaders.length + 1
        pickedLeader.leaderRound = leaderRound

        draftedLeaders.push(pickedLeader)

        await query(
          `UPDATE draft_pod_players
           SET drafted_leaders = $1,
               leaders = $2,
               selected_card_id = NULL,
               pick_status = 'picked',
               last_pick_at = NOW()
           WHERE id = $3`,
          [JSON.stringify(draftedLeaders), JSON.stringify(remainingLeaders), player.id]
        )
      }
    }

    // Advance leader draft
    await advanceLeaderDraftAfterPicks(podId, draftState, pod, players)

  } else if (draftState.phase === 'pack_draft') {
    // Process pack picks
    for (const player of players) {
      const cardId = player.selected_card_id
      if (!cardId) continue

      const currentPack = typeof player.current_pack === 'string'
        ? JSON.parse(player.current_pack)
        : player.current_pack || []

      const draftedCards = typeof player.drafted_cards === 'string'
        ? JSON.parse(player.drafted_cards)
        : player.drafted_cards || []

      // Find and pick the card
      const cardIndex = currentPack.findIndex(c =>
        (c.instanceId && c.instanceId === cardId) || (!c.instanceId && c.id === cardId)
      )

      if (cardIndex >= 0) {
        const pickedCard = currentPack[cardIndex]
        const remainingPack = currentPack.filter((_, i) => i !== cardIndex)

        // Add pick metadata
        const packNumber = draftState.packNumber || 1
        const pickInPack = draftState.pickInPack || 1
        pickedCard.pickNumber = draftedCards.length + 1
        pickedCard.packNumber = packNumber
        pickedCard.pickInPack = pickInPack

        draftedCards.push(pickedCard)

        await query(
          `UPDATE draft_pod_players
           SET drafted_cards = $1,
               current_pack = $2,
               selected_card_id = NULL,
               pick_status = 'picked',
               last_pick_at = NOW()
           WHERE id = $3`,
          [JSON.stringify(draftedCards), JSON.stringify(remainingPack), player.id]
        )
      }
    }

    // Advance pack draft
    await advancePackDraftAfterPicks(podId, draftState, pod)
  }
}

/**
 * Advance leader draft after all picks are processed
 */
async function advanceLeaderDraftAfterPicks(podId, draftState, pod, players) {
  const currentRound = draftState.leaderRound

  if (currentRound === 1) {
    // Pass remaining leaders (2) to the right
    const direction = getLeaderPassDirection(1)
    // Need to re-fetch players to get updated leaders
    const updatedPlayers = await queryRows(
      'SELECT * FROM draft_pod_players WHERE draft_pod_id = $1 ORDER BY seat_number',
      [podId]
    )
    await passLeaders(updatedPlayers, direction)

    draftState.leaderRound = 2
    delete draftState.lastPlayerStartedAt // Clear last player timer for new round
    await query(
      `UPDATE draft_pods
       SET draft_state = $1,
           state_version = state_version + 1,
           pick_started_at = NOW(),
           paused_duration_seconds = 0
       WHERE id = $2`,
      [JSON.stringify(draftState), podId]
    )

    await query(
      `UPDATE draft_pod_players SET pick_status = 'picking' WHERE draft_pod_id = $1`,
      [podId]
    )

  } else if (currentRound === 2) {
    // Pass remaining leader (1) to the right
    const direction = getLeaderPassDirection(2)
    const updatedPlayers = await queryRows(
      'SELECT * FROM draft_pod_players WHERE draft_pod_id = $1 ORDER BY seat_number',
      [podId]
    )
    await passLeaders(updatedPlayers, direction)

    draftState.leaderRound = 3
    delete draftState.lastPlayerStartedAt // Clear last player timer for new round
    await query(
      `UPDATE draft_pods
       SET draft_state = $1,
           state_version = state_version + 1,
           pick_started_at = NOW(),
           paused_duration_seconds = 0
       WHERE id = $2`,
      [JSON.stringify(draftState), podId]
    )

    await query(
      `UPDATE draft_pod_players SET pick_status = 'picking' WHERE draft_pod_id = $1`,
      [podId]
    )

  } else if (currentRound === 3) {
    // Transition to pack draft
    draftState.phase = 'pack_draft'
    draftState.packNumber = 1
    draftState.pickInPack = 1
    delete draftState.lastPlayerStartedAt // Clear last player timer for new phase

    // Fetch all_packs only when transitioning to pack draft
    const podWithPacks = await queryRow(
      'SELECT all_packs FROM draft_pods WHERE id = $1',
      [podId]
    )
    const allPacks = typeof podWithPacks.all_packs === 'string'
      ? JSON.parse(podWithPacks.all_packs)
      : podWithPacks.all_packs

    const updatedPlayers = await queryRows(
      'SELECT * FROM draft_pod_players WHERE draft_pod_id = $1 ORDER BY seat_number',
      [podId]
    )

    for (let i = 0; i < updatedPlayers.length; i++) {
      const player = updatedPlayers[i]
      const pack = allPacks[i][0]

      await query(
        `UPDATE draft_pod_players
         SET current_pack = $1, pick_status = 'picking'
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
}

/**
 * Advance pack draft after all picks are processed
 */
async function advancePackDraftAfterPicks(podId, draftState, pod) {
  const players = await queryRows(
    'SELECT * FROM draft_pod_players WHERE draft_pod_id = $1 ORDER BY seat_number',
    [podId]
  )

  const packNumber = draftState.packNumber
  const pickInPack = draftState.pickInPack
  const totalPacks = 3

  // Check if current pack is exhausted
  const firstPlayer = players[0]
  const remainingPack = typeof firstPlayer.current_pack === 'string'
    ? JSON.parse(firstPlayer.current_pack)
    : firstPlayer.current_pack || []

  if (remainingPack.length === 0) {
    if (packNumber >= totalPacks) {
      // Draft complete
      await query(
        `UPDATE draft_pods
         SET status = 'complete',
             draft_state = $1,
             completed_at = NOW(),
             state_version = state_version + 1
         WHERE id = $2`,
        [JSON.stringify({ ...draftState, phase: 'complete' }), podId]
      )
      return
    }

    // Move to next pack
    draftState.packNumber = packNumber + 1
    draftState.pickInPack = 1
    delete draftState.lastPlayerStartedAt // Clear last player timer for new pack

    // Fetch all_packs only when we need to start a new pack
    // (not loaded in most queries to save memory)
    const podWithPacks = await queryRow(
      'SELECT all_packs FROM draft_pods WHERE id = $1',
      [podId]
    )
    const allPacks = typeof podWithPacks.all_packs === 'string'
      ? JSON.parse(podWithPacks.all_packs)
      : podWithPacks.all_packs

    for (let i = 0; i < players.length; i++) {
      const player = players[i]
      const pack = allPacks[i][packNumber]

      await query(
        `UPDATE draft_pod_players
         SET current_pack = $1, pick_status = 'picking'
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

    draftState.pickInPack = pickInPack + 1
    delete draftState.lastPlayerStartedAt // Clear last player timer for new pick

    await query(
      `UPDATE draft_pods
       SET draft_state = $1,
           state_version = state_version + 1,
           pick_started_at = NOW(),
           paused_duration_seconds = 0
       WHERE id = $2`,
      [JSON.stringify(draftState), podId]
    )

    await query(
      `UPDATE draft_pod_players SET pick_status = 'picking' WHERE draft_pod_id = $1`,
      [podId]
    )
  }
}

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
    delete draftState.lastPlayerStartedAt // Clear last player timer for new round
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
    // Pass remaining leader (1) to the right before round 3
    const direction = getLeaderPassDirection(2) // 'right'
    await passLeaders(players, direction)

    // Move to round 3 - let players confirm their final leader
    draftState.leaderRound = 3
    delete draftState.lastPlayerStartedAt // Clear last player timer for new round
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
    delete draftState.lastPlayerStartedAt // Clear last player timer for new phase

    // Fetch all_packs only when transitioning to pack draft
    const podWithPacks = await queryRow(
      'SELECT all_packs FROM draft_pods WHERE id = $1',
      [podId]
    )
    const allPacks = typeof podWithPacks.all_packs === 'string'
      ? JSON.parse(podWithPacks.all_packs)
      : podWithPacks.all_packs

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
  // console.log('[ADVANCE-PACK] Checking pack draft advance, pack:', draftState.packNumber, 'pick:', draftState.pickInPack)

  const players = await queryRows(
    'SELECT * FROM draft_pod_players WHERE draft_pod_id = $1 ORDER BY seat_number',
    [podId]
  )

  const allPicked = players.every(p => p.pick_status === 'picked')
  if (!allPicked) {
    // console.log('[ADVANCE-PACK] Not all picked yet')
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

  // console.log('[ADVANCE-PACK] All picked. Pack', packNumber, 'remaining cards:', remainingPack.length)

  if (remainingPack.length === 0) {
    // console.log('[ADVANCE-PACK] Pack exhausted, packNumber:', packNumber, 'totalPacks:', totalPacks)
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
    delete draftState.lastPlayerStartedAt // Clear last player timer for new pack

    // Fetch all_packs only when moving to next pack
    const podWithPacks = await queryRow(
      'SELECT all_packs FROM draft_pods WHERE id = $1',
      [podId]
    )
    const allPacks = typeof podWithPacks.all_packs === 'string'
      ? JSON.parse(podWithPacks.all_packs)
      : podWithPacks.all_packs

    // Assign next pack to each player
    for (let i = 0; i < players.length; i++) {
      const player = players[i]
      const pack = allPacks[i][packNumber] // Next pack (0-indexed array, packNumber is the old value which equals new index)
      // console.log('[ADVANCE-PACK] Player', i, 'getting pack index', packNumber, 'with', pack?.length, 'cards')

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
    delete draftState.lastPlayerStartedAt // Clear last player timer for new pick

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
