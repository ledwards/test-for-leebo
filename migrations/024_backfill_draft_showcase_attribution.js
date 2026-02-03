/**
 * Migration 024: Backfill draft card attribution
 *
 * THE BUG
 * =======
 * When drafts were started, ALL cards were tracked in card_generations with
 * the HOST's user_id, not the player who actually drafted them.
 *
 * THE FIX
 * =======
 * Query draft_pod_players.drafted_leaders and drafted_cards to find who
 * ACTUALLY drafted each card, then update card_generations.user_id accordingly.
 *
 * SAFETY
 * ======
 * - Idempotent: Only updates records where user_id is wrong
 * - Non-destructive: Only changes user_id, preserves all other data
 * - Skips bots: Only processes players with user_id (not null)
 */

export async function run(client) {
  console.log('Starting draft card attribution backfill...')

  // Find all draft_pod_players who drafted cards
  const playersResult = await client.query(`
    SELECT
      dpp.id,
      dpp.draft_pod_id,
      dpp.user_id,
      dpp.drafted_leaders,
      dpp.drafted_cards,
      dp.share_id,
      dp.host_id
    FROM draft_pod_players dpp
    JOIN draft_pods dp ON dp.id = dpp.draft_pod_id
    WHERE dpp.user_id IS NOT NULL
  `)

  console.log(`Found ${playersResult.rows.length} players to process`)

  let totalFixed = 0
  let totalSkipped = 0

  for (const player of playersResult.rows) {
    // Process drafted leaders
    let draftedLeaders = []
    try {
      draftedLeaders = typeof player.drafted_leaders === 'string'
        ? JSON.parse(player.drafted_leaders)
        : player.drafted_leaders || []
    } catch (e) {
      // Invalid JSON, skip
    }

    // Process drafted cards
    let draftedCards = []
    try {
      draftedCards = typeof player.drafted_cards === 'string'
        ? JSON.parse(player.drafted_cards)
        : player.drafted_cards || []
    } catch (e) {
      // Invalid JSON, skip
    }

    const allDraftedCards = [...draftedLeaders, ...draftedCards]
    if (allDraftedCards.length === 0) continue

    for (const card of allDraftedCards) {
      // Find the card_generation record for this card
      // Match by source_id (pod id) and card name
      const genResult = await client.query(`
        SELECT id, user_id, card_name
        FROM card_generations
        WHERE source_type = 'draft'
          AND source_id = $1
          AND card_name = $2
        LIMIT 1
      `, [player.draft_pod_id, card.name])

      if (genResult.rows.length === 0) {
        // No generation record - might not have been tracked, skip
        continue
      }

      const genRecord = genResult.rows[0]

      // Check if attribution is wrong
      if (genRecord.user_id === player.user_id) {
        totalSkipped++
        continue
      }

      // Fix the attribution
      await client.query(`
        UPDATE card_generations
        SET user_id = $1
        WHERE id = $2
      `, [player.user_id, genRecord.id])

      totalFixed++
    }
  }

  console.log(`\nBackfill complete:`)
  console.log(`  Fixed: ${totalFixed} records`)
  console.log(`  Skipped: ${totalSkipped} records (already correct)`)
}
