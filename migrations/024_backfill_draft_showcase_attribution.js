/**
 * Migration 024: Backfill draft showcase leader attribution
 *
 * THE BUG
 * =======
 * When drafts were started, ALL cards (including showcase leaders) were tracked
 * in card_generations with the HOST's user_id, not the player who drafted them.
 *
 * This was fixed going forward in commit a787907, but existing draft data still
 * has showcase leaders incorrectly attributed to the host.
 *
 * THE FIX
 * =======
 * Query draft_pod_players.drafted_leaders to find who ACTUALLY drafted each
 * showcase leader, then update card_generations.user_id accordingly.
 *
 * SAFETY
 * ======
 * - Idempotent: Only updates records where user_id is wrong
 * - Non-destructive: Only changes user_id, preserves all other data
 * - Skips bots: Only processes players with user_id (not null)
 */

export async function run(client) {
  console.log('Starting draft showcase attribution backfill...')

  // Find all draft_pod_players who drafted showcase leaders
  const playersResult = await client.query(`
    SELECT
      dpp.id,
      dpp.draft_pod_id,
      dpp.user_id,
      dpp.drafted_leaders,
      dp.share_id,
      dp.host_id
    FROM draft_pod_players dpp
    JOIN draft_pods dp ON dp.id = dpp.draft_pod_id
    WHERE dpp.user_id IS NOT NULL
      AND dpp.drafted_leaders IS NOT NULL
      AND dpp.drafted_leaders != '[]'
  `)

  console.log(`Found ${playersResult.rows.length} players with drafted leaders`)

  let totalFixed = 0
  let totalSkipped = 0

  for (const player of playersResult.rows) {
    let draftedLeaders
    try {
      draftedLeaders = typeof player.drafted_leaders === 'string'
        ? JSON.parse(player.drafted_leaders)
        : player.drafted_leaders || []
    } catch (e) {
      console.warn(`  Skipping player ${player.id}: Invalid drafted_leaders JSON`)
      continue
    }

    // Find showcase leaders this player drafted
    const showcaseLeaders = draftedLeaders.filter(leader =>
      leader.variantType === 'Showcase' && leader.isLeader
    )

    if (showcaseLeaders.length === 0) continue

    console.log(`  Player ${player.user_id} in draft ${player.share_id}: ${showcaseLeaders.length} showcase leader(s)`)

    for (const leader of showcaseLeaders) {
      // Find the card_generation record for this showcase
      // Match by source_id (pod id), card name, and treatment
      const genResult = await client.query(`
        SELECT id, user_id, card_name
        FROM card_generations
        WHERE source_type = 'draft'
          AND source_id = $1
          AND card_name = $2
          AND treatment = 'showcase'
          AND slot_type = 'leader'
      `, [player.draft_pod_id, leader.name])

      if (genResult.rows.length === 0) {
        console.log(`    No generation record found for ${leader.name}`)
        totalSkipped++
        continue
      }

      const genRecord = genResult.rows[0]

      // Check if attribution is wrong
      if (genRecord.user_id === player.user_id) {
        console.log(`    ${leader.name}: Already correct (user ${player.user_id})`)
        totalSkipped++
        continue
      }

      // Fix the attribution
      await client.query(`
        UPDATE card_generations
        SET user_id = $1
        WHERE id = $2
      `, [player.user_id, genRecord.id])

      console.log(`    ${leader.name}: Fixed ${genRecord.user_id} -> ${player.user_id}`)
      totalFixed++
    }
  }

  console.log(`\nBackfill complete:`)
  console.log(`  Fixed: ${totalFixed} records`)
  console.log(`  Skipped: ${totalSkipped} records (already correct or not found)`)
}
