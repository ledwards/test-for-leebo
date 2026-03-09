/**
 * Tests for draft-picks stats API query building logic.
 *
 * Verifies that the builtDeckOnly parameter correctly adds JOIN clauses
 * to filter draft picks to only drafters who built a deck.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'

// Extract the query-building logic for testability
// This mirrors the JOIN-building logic in route.ts

interface QueryParts {
  botJoin: string
  botFilter: string
  builtDeckJoin: string
}

function buildQueryParts(opts: {
  includeBots: boolean
  includeHumans: boolean
  builtDeckOnly: boolean
}): QueryParts {
  let botJoin = ''
  let botFilter = ''
  if (!opts.includeBots || !opts.includeHumans) {
    botJoin = `JOIN pod_players dpp ON dp.draft_pod_id = dpp.pod_id AND dp.user_id = dpp.user_id`
    if (!opts.includeBots && opts.includeHumans) {
      botFilter = `AND (dpp.is_bot = false OR dpp.is_bot IS NULL)`
    } else if (opts.includeBots && !opts.includeHumans) {
      botFilter = `AND dpp.is_bot = true`
    }
  }

  let builtDeckJoin = ''
  if (opts.builtDeckOnly) {
    builtDeckJoin = `JOIN card_pools cp_bd ON cp_bd.pod_id = dp.draft_pod_id AND cp_bd.user_id = dp.user_id
      JOIN built_decks bd ON bd.card_pool_id = cp_bd.id`
  }

  return { botJoin, botFilter, builtDeckJoin }
}

describe('draft-picks query building', () => {
  describe('builtDeckOnly filter', () => {
    it('adds no JOIN when builtDeckOnly is false', () => {
      const parts = buildQueryParts({ includeBots: true, includeHumans: true, builtDeckOnly: false })
      assert.strictEqual(parts.builtDeckJoin, '')
    })

    it('adds card_pools and built_decks JOINs when builtDeckOnly is true', () => {
      const parts = buildQueryParts({ includeBots: true, includeHumans: true, builtDeckOnly: true })
      assert.ok(parts.builtDeckJoin.includes('JOIN card_pools'), 'should JOIN card_pools')
      assert.ok(parts.builtDeckJoin.includes('JOIN built_decks'), 'should JOIN built_decks')
      assert.ok(parts.builtDeckJoin.includes('cp_bd.pod_id = dp.draft_pod_id'), 'should match on pod_id')
      assert.ok(parts.builtDeckJoin.includes('cp_bd.user_id = dp.user_id'), 'should match on user_id')
      assert.ok(parts.builtDeckJoin.includes('bd.card_pool_id = cp_bd.id'), 'should join built_decks via card_pool_id')
    })

    it('composes correctly with bot filter', () => {
      const parts = buildQueryParts({ includeBots: false, includeHumans: true, builtDeckOnly: true })
      assert.ok(parts.botJoin.includes('JOIN pod_players'), 'should have bot join')
      assert.ok(parts.botFilter.includes('dpp.is_bot = false'), 'should filter bots')
      assert.ok(parts.builtDeckJoin.includes('JOIN built_decks'), 'should also have built_decks join')
    })

    it('composes correctly with humans-only filter', () => {
      const parts = buildQueryParts({ includeBots: true, includeHumans: false, builtDeckOnly: true })
      assert.ok(parts.botFilter.includes('dpp.is_bot = true'), 'should filter to bots only')
      assert.ok(parts.builtDeckJoin.includes('JOIN built_decks'), 'should also have built_decks join')
    })
  })

  describe('builtDeckOnly param parsing', () => {
    // Mirrors: const builtDeckOnly = url.searchParams.get('builtDeckOnly') === 'true'
    const parse = (val: string | null) => val === 'true'

    it('defaults to false when param is absent', () => {
      assert.strictEqual(parse(null), false)
    })

    it('is true only when param is exactly "true"', () => {
      assert.strictEqual(parse('true'), true)
      assert.strictEqual(parse('false'), false)
      assert.strictEqual(parse('1'), false)
      assert.strictEqual(parse(''), false)
    })
  })
})
