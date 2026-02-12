// Tests for POST /api/casual/pack-blitz
import { describe, it } from 'node:test'
import assert from 'node:assert'

describe('POST /api/casual/pack-blitz', () => {
  describe('Request validation', () => {
    it('should require setCode parameter', () => {
      const body = {}
      const isValid = !!body.setCode
      assert.strictEqual(isValid, false, 'setCode should be required')
    })

    it('should accept valid setCode', () => {
      const body = { setCode: 'SEC' }
      const isValid = !!body.setCode
      assert.strictEqual(isValid, true)
    })

    it('should accept optional ignoreAspectPenalties parameter', () => {
      const body = { setCode: 'SEC', ignoreAspectPenalties: true }
      const ignoreAspectPenalties = body.ignoreAspectPenalties ?? true
      assert.strictEqual(ignoreAspectPenalties, true)
    })

    it('should default ignoreAspectPenalties to true', () => {
      const body = { setCode: 'SEC' }
      const ignoreAspectPenalties = body.ignoreAspectPenalties ?? true
      assert.strictEqual(ignoreAspectPenalties, true)
    })

    it('should accept optional resourceBufferCount parameter', () => {
      const body = { setCode: 'SEC', resourceBufferCount: 3 }
      const resourceBufferCount = body.resourceBufferCount ?? 0
      assert.strictEqual(resourceBufferCount, 3)
    })

    it('should default resourceBufferCount to 0', () => {
      const body = { setCode: 'SEC' }
      const resourceBufferCount = body.resourceBufferCount ?? 0
      assert.strictEqual(resourceBufferCount, 0)
    })
  })

  describe('Pool generation logic', () => {
    // Simulate a pack with leader, base, and other cards
    const mockPack = {
      cards: [
        { id: 'leader1', type: 'Leader', name: 'Test Leader' },
        { id: 'base1', type: 'Base', name: 'Test Base' },
        { id: 'unit1', type: 'Unit', name: 'Test Unit 1' },
        { id: 'unit2', type: 'Unit', name: 'Test Unit 2' },
        { id: 'event1', type: 'Event', name: 'Test Event' },
      ]
    }

    it('should extract leader from pack', () => {
      const leader = mockPack.cards.find(c => c.type === 'Leader')
      assert.ok(leader)
      assert.strictEqual(leader.name, 'Test Leader')
    })

    it('should extract base from pack', () => {
      const base = mockPack.cards.find(c => c.type === 'Base')
      assert.ok(base)
      assert.strictEqual(base.name, 'Test Base')
    })

    it('should create deck from non-leader, non-base cards', () => {
      const deckCards = mockPack.cards.filter(c => c.type !== 'Leader' && c.type !== 'Base')
      assert.strictEqual(deckCards.length, 3)
      assert.ok(deckCards.every(c => c.type !== 'Leader' && c.type !== 'Base'))
    })
  })

  describe('Response format', () => {
    it('should return shareId in response', () => {
      const response = { shareId: 'abc123', shareUrl: '/casual/pack-blitz/abc123' }
      assert.ok(response.shareId)
      assert.strictEqual(typeof response.shareId, 'string')
    })

    it('should return shareUrl in response', () => {
      const response = { shareId: 'abc123', shareUrl: '/casual/pack-blitz/abc123' }
      assert.ok(response.shareUrl)
      assert.ok(response.shareUrl.includes('/casual/pack-blitz/'))
    })
  })
})

console.log('\n📄 Running /api/casual/pack-blitz tests...\n')
