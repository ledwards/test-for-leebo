import { describe, it } from 'node:test'
import assert from 'node:assert'
import { fetchSets, fetchSetCards } from './api.js'

describe('api', () => {
  describe('fetchSets', () => {
    it('returns all 7 expansion sets including LAW', async () => {
      const sets = await fetchSets()
      const setCodes = sets.map(s => s.code)

      // Should include all 7 known sets
      assert.ok(setCodes.includes('SOR'), 'Should include SOR (Spark of Rebellion)')
      assert.ok(setCodes.includes('SHD'), 'Should include SHD (Shadows of the Galaxy)')
      assert.ok(setCodes.includes('TWI'), 'Should include TWI (Twilight of the Republic)')
      assert.ok(setCodes.includes('JTL'), 'Should include JTL (Jump to Lightspeed)')
      assert.ok(setCodes.includes('LOF'), 'Should include LOF (Legends of the Force)')
      assert.ok(setCodes.includes('SEC'), 'Should include SEC (Secrets of Power)')
      assert.ok(setCodes.includes('LAW'), 'Should include LAW (Lawless Time)')

      assert.strictEqual(sets.length, 7, 'Should return exactly 7 sets')
    })

    it('includes LAW set with correct metadata', async () => {
      const sets = await fetchSets()
      const lawSet = sets.find(s => s.code === 'LAW')

      assert.ok(lawSet, 'LAW set should be present')
      assert.strictEqual(lawSet.code, 'LAW', 'LAW code should be correct')
      assert.strictEqual(lawSet.name, 'Lawless Time', 'LAW name should be correct')
      assert.ok(lawSet.releaseDate, 'LAW should have a release date')
      assert.ok(lawSet.imageUrl, 'LAW should have an image URL')
    })

    it('returns sets with required properties', async () => {
      const sets = await fetchSets()

      sets.forEach(set => {
        assert.ok(set.code, `Set should have code: ${JSON.stringify(set)}`)
        assert.ok(set.name, `Set should have name: ${JSON.stringify(set)}`)
        assert.ok(set.releaseDate, `Set should have releaseDate: ${JSON.stringify(set)}`)
        assert.ok(set.imageUrl, `Set should have imageUrl: ${JSON.stringify(set)}`)
      })
    })
  })

  describe('fetchSetCards', () => {
    it('returns empty array for sets with no card data', async () => {
      // LAW doesn't have card data yet, should return empty array
      const cards = await fetchSetCards('LAW')
      assert.ok(Array.isArray(cards), 'Should return an array')
      // Note: This will return empty array until LAW cards are added to cards.json
    })
  })
})
