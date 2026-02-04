// @ts-nocheck
// Tests for API utilities - beta set filtering
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { fetchSets } from './api'

describe('fetchSets', () => {
  describe('beta set filtering', () => {
    it('should exclude beta sets by default', async () => {
      const sets = await fetchSets()
      const setCodes = sets.map(s => s.code)

      assert.ok(!setCodes.includes('LAW'), 'LAW should not be included by default')
      assert.ok(setCodes.includes('SOR'), 'SOR should be included')
      assert.ok(setCodes.includes('SEC'), 'SEC should be included')
      assert.strictEqual(sets.length, 6, 'Should have 6 non-beta sets')
    })

    it('should exclude beta sets when includeBeta is false', async () => {
      const sets = await fetchSets({ includeBeta: false })
      const setCodes = sets.map(s => s.code)

      assert.ok(!setCodes.includes('LAW'), 'LAW should not be included')
      assert.strictEqual(sets.length, 6, 'Should have 6 non-beta sets')
    })

    it('should include beta sets when includeBeta is true', async () => {
      const sets = await fetchSets({ includeBeta: true })
      const setCodes = sets.map(s => s.code)

      assert.ok(setCodes.includes('LAW'), 'LAW should be included')
      assert.ok(setCodes.includes('SOR'), 'SOR should still be included')
      assert.strictEqual(sets.length, 7, 'Should have 7 sets including beta')
    })

    it('should mark LAW as a beta set', async () => {
      const sets = await fetchSets({ includeBeta: true })
      const lawSet = sets.find(s => s.code === 'LAW')

      assert.ok(lawSet, 'LAW set should exist')
      assert.strictEqual(lawSet.beta, true, 'LAW should have beta: true')
      assert.strictEqual(lawSet.name, 'A Lawless Time', 'LAW should have correct name')
    })

    it('should not mark regular sets as beta', async () => {
      const sets = await fetchSets({ includeBeta: true })
      const nonBetaSets = sets.filter(s => s.code !== 'LAW')

      for (const set of nonBetaSets) {
        assert.ok(!set.beta, `${set.code} should not be marked as beta`)
      }
    })
  })

  describe('set data structure', () => {
    it('should include imageUrl for released sets', async () => {
      const sets = await fetchSets({ includeBeta: false })

      for (const set of sets) {
        assert.ok(set.imageUrl, `${set.code} should have imageUrl`)
      }
    })

    it('should have imageUrl property defined (may be null for beta)', async () => {
      const sets = await fetchSets({ includeBeta: true })

      for (const set of sets) {
        assert.ok('imageUrl' in set, `${set.code} should have imageUrl property`)
      }
    })

    it('should include code, name, and releaseDate for all sets', async () => {
      const sets = await fetchSets({ includeBeta: true })

      for (const set of sets) {
        assert.ok(set.code, 'Set should have code')
        assert.ok(set.name, 'Set should have name')
        assert.ok(set.releaseDate, 'Set should have releaseDate')
      }
    })

    it('should return sets in chronological order', async () => {
      const sets = await fetchSets()
      const releaseDates = sets.map(s => new Date(s.releaseDate))

      for (let i = 1; i < releaseDates.length; i++) {
        assert.ok(
          releaseDates[i] >= releaseDates[i - 1],
          'Sets should be in chronological order'
        )
      }
    })
  })
})

// Run tests
console.log('\n📡 Running API tests...\n')
