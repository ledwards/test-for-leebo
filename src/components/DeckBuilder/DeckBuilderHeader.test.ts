// @ts-nocheck
/**
 * DeckBuilderHeader Tests
 *
 * Tests the play button redirect logic:
 * - Draft pools redirect to /draft/:shareId/pod
 * - Sealed pools redirect to /pool/:shareId/deck/play
 * - Redirect only when deck is legal (leader + base + 30 cards)
 */
import { describe, it } from 'node:test'
import assert from 'node:assert'

// Simulate the handlePlay redirect logic from DeckBuilderHeader
function getPlayRedirectUrl(isDeckLegal, isDraftMode, draftShareId, shareId) {
  if (!isDeckLegal) return null

  if (isDraftMode && draftShareId) {
    return `/draft/${draftShareId}/pod`
  } else if (!isDraftMode && draftShareId) {
    return `/sealed/${draftShareId}/pod`
  } else {
    return `/pool/${shareId}/deck/play`
  }
}

// Simulate deck legality check
function isDeckLegal(activeLeader, activeBase, deckCardCount) {
  return !!(activeLeader && activeBase && deckCardCount >= 30)
}

describe('DeckBuilderHeader play redirect', () => {
  describe('redirect URL logic', () => {
    it('redirects draft pool to pod page', () => {
      const url = getPlayRedirectUrl(true, true, 'draft-abc', 'pool-xyz')
      assert.strictEqual(url, '/draft/draft-abc/pod')
    })

    it('redirects solo sealed pool to play page', () => {
      const url = getPlayRedirectUrl(true, false, null, 'pool-xyz')
      assert.strictEqual(url, '/pool/pool-xyz/deck/play')
    })

    it('redirects sealed pod pool to sealed pod page', () => {
      const url = getPlayRedirectUrl(true, false, 'sealed-abc', 'pool-xyz')
      assert.strictEqual(url, '/sealed/sealed-abc/pod')
    })

    it('redirects draft pool without draftShareId to play page', () => {
      const url = getPlayRedirectUrl(true, true, null, 'pool-xyz')
      assert.strictEqual(url, '/pool/pool-xyz/deck/play')
    })

    it('returns null when deck is not legal', () => {
      const url = getPlayRedirectUrl(false, true, 'draft-abc', 'pool-xyz')
      assert.strictEqual(url, null)
    })

    it('returns null for illegal sealed deck', () => {
      const url = getPlayRedirectUrl(false, false, null, 'pool-xyz')
      assert.strictEqual(url, null)
    })
  })

  describe('deck legality', () => {
    it('legal when leader + base + 30+ cards', () => {
      assert.strictEqual(isDeckLegal('leader-1', 'base-1', 30), true)
    })

    it('legal with more than 30 cards', () => {
      assert.strictEqual(isDeckLegal('leader-1', 'base-1', 50), true)
    })

    it('illegal without leader', () => {
      assert.strictEqual(isDeckLegal(null, 'base-1', 30), false)
    })

    it('illegal without base', () => {
      assert.strictEqual(isDeckLegal('leader-1', null, 30), false)
    })

    it('illegal with fewer than 30 cards', () => {
      assert.strictEqual(isDeckLegal('leader-1', 'base-1', 29), false)
    })

    it('illegal with 0 cards', () => {
      assert.strictEqual(isDeckLegal('leader-1', 'base-1', 0), false)
    })

    it('illegal with no leader, no base, no cards', () => {
      assert.strictEqual(isDeckLegal(null, null, 0), false)
    })
  })
})
