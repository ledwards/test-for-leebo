import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  getAspectSortKey,
  getTypeOrder,
  compareByAspectTypeCostName,
  compareByCostName,
  compareByName,
  sortByAspect,
  sortByCost,
  sortByName,
  sortCards,
} from './cardSorting.js'

describe('cardSorting', () => {
  describe('getAspectSortKey', () => {
    describe('single aspect cards', () => {
      it('returns correct key for Vigilance', () => {
        const card = { aspects: ['Vigilance'] }
        assert.strictEqual(getAspectSortKey(card), '1_04_Vigilance')
      })

      it('returns correct key for Command', () => {
        const card = { aspects: ['Command'] }
        assert.strictEqual(getAspectSortKey(card), '2_04_Command')
      })

      it('returns correct key for Aggression', () => {
        const card = { aspects: ['Aggression'] }
        assert.strictEqual(getAspectSortKey(card), '3_04_Aggression')
      })

      it('returns correct key for Cunning', () => {
        const card = { aspects: ['Cunning'] }
        assert.strictEqual(getAspectSortKey(card), '4_04_Cunning')
      })

      it('returns correct key for Villainy (single)', () => {
        const card = { aspects: ['Villainy'] }
        assert.strictEqual(getAspectSortKey(card), 'E_01_Villainy')
      })

      it('returns correct key for Heroism (single)', () => {
        const card = { aspects: ['Heroism'] }
        assert.strictEqual(getAspectSortKey(card), 'E_02_Heroism')
      })
    })

    describe('dual aspect cards', () => {
      it('returns correct key for Vigilance/Villainy', () => {
        const card = { aspects: ['Vigilance', 'Villainy'] }
        assert.strictEqual(getAspectSortKey(card), '1_01_Vigilance_Villainy')
      })

      it('returns correct key for Vigilance/Heroism', () => {
        const card = { aspects: ['Vigilance', 'Heroism'] }
        assert.strictEqual(getAspectSortKey(card), '1_02_Vigilance_Heroism')
      })

      it('returns correct key for Command/Villainy', () => {
        const card = { aspects: ['Command', 'Villainy'] }
        assert.strictEqual(getAspectSortKey(card), '2_01_Command_Villainy')
      })

      it('returns correct key for Aggression/Heroism', () => {
        const card = { aspects: ['Aggression', 'Heroism'] }
        assert.strictEqual(getAspectSortKey(card), '3_02_Aggression_Heroism')
      })

      it('returns correct key for Villainy/Heroism (no primary)', () => {
        const card = { aspects: ['Villainy', 'Heroism'] }
        assert.strictEqual(getAspectSortKey(card), 'E_01_Villainy_Heroism')
      })
    })

    describe('no aspect cards', () => {
      it('returns neutral key for empty aspects', () => {
        const card = { aspects: [] }
        assert.strictEqual(getAspectSortKey(card), 'E_99_Neutral')
      })

      it('returns neutral key for undefined aspects', () => {
        const card = {}
        assert.strictEqual(getAspectSortKey(card), 'E_99_Neutral')
      })
    })

    describe('sorting order', () => {
      it('sorts Vigilance before Command', () => {
        const vigilance = getAspectSortKey({ aspects: ['Vigilance'] })
        const command = getAspectSortKey({ aspects: ['Command'] })
        assert.strictEqual(vigilance.localeCompare(command) < 0, true)
      })

      it('sorts Command before Aggression', () => {
        const command = getAspectSortKey({ aspects: ['Command'] })
        const aggression = getAspectSortKey({ aspects: ['Aggression'] })
        assert.strictEqual(command.localeCompare(aggression) < 0, true)
      })

      it('sorts primary aspects before secondary-only', () => {
        const vigilance = getAspectSortKey({ aspects: ['Vigilance'] })
        const villainy = getAspectSortKey({ aspects: ['Villainy'] })
        assert.strictEqual(vigilance.localeCompare(villainy) < 0, true)
      })

      it('sorts Villainy combos before Heroism combos within same primary', () => {
        const vigVil = getAspectSortKey({ aspects: ['Vigilance', 'Villainy'] })
        const vigHer = getAspectSortKey({ aspects: ['Vigilance', 'Heroism'] })
        assert.strictEqual(vigVil.localeCompare(vigHer) < 0, true)
      })
    })
  })

  describe('getTypeOrder', () => {
    it('returns 1 for Unit', () => {
      assert.strictEqual(getTypeOrder('Unit'), 1)
    })

    it('returns 1 for Ground Unit', () => {
      assert.strictEqual(getTypeOrder('Ground Unit'), 1)
    })

    it('returns 2 for Space Unit', () => {
      assert.strictEqual(getTypeOrder('Space Unit'), 2)
    })

    it('returns 3 for Upgrade', () => {
      assert.strictEqual(getTypeOrder('Upgrade'), 3)
    })

    it('returns 4 for Event', () => {
      assert.strictEqual(getTypeOrder('Event'), 4)
    })

    it('returns 99 for unknown type', () => {
      assert.strictEqual(getTypeOrder('Unknown'), 99)
    })
  })

  describe('compareByAspectTypeCostName', () => {
    it('sorts by aspect first', () => {
      const vigilance = { aspects: ['Vigilance'], type: 'Event', cost: 5, name: 'Z' }
      const command = { aspects: ['Command'], type: 'Unit', cost: 1, name: 'A' }
      assert.strictEqual(compareByAspectTypeCostName(vigilance, command) < 0, true)
    })

    it('sorts by type within same aspect', () => {
      const unit = { aspects: ['Vigilance'], type: 'Unit', cost: 5, name: 'Z' }
      const event = { aspects: ['Vigilance'], type: 'Event', cost: 1, name: 'A' }
      assert.strictEqual(compareByAspectTypeCostName(unit, event) < 0, true)
    })

    it('sorts by cost within same aspect and type', () => {
      const cheap = { aspects: ['Vigilance'], type: 'Unit', cost: 1, name: 'Z' }
      const expensive = { aspects: ['Vigilance'], type: 'Unit', cost: 5, name: 'A' }
      assert.strictEqual(compareByAspectTypeCostName(cheap, expensive) < 0, true)
    })

    it('sorts by name within same aspect, type, and cost', () => {
      const a = { aspects: ['Vigilance'], type: 'Unit', cost: 1, name: 'Alpha' }
      const z = { aspects: ['Vigilance'], type: 'Unit', cost: 1, name: 'Zeta' }
      assert.strictEqual(compareByAspectTypeCostName(a, z) < 0, true)
    })

    it('handles null cost (sorts last)', () => {
      const withCost = { aspects: ['Vigilance'], type: 'Unit', cost: 10, name: 'A' }
      const nullCost = { aspects: ['Vigilance'], type: 'Unit', cost: null, name: 'A' }
      assert.strictEqual(compareByAspectTypeCostName(withCost, nullCost) < 0, true)
    })

    it('handles undefined cost (sorts last)', () => {
      const withCost = { aspects: ['Vigilance'], type: 'Unit', cost: 10, name: 'A' }
      const noCost = { aspects: ['Vigilance'], type: 'Unit', name: 'A' }
      assert.strictEqual(compareByAspectTypeCostName(withCost, noCost) < 0, true)
    })

    it('handles missing name', () => {
      const withName = { aspects: ['Vigilance'], type: 'Unit', cost: 1, name: 'Test' }
      const noName = { aspects: ['Vigilance'], type: 'Unit', cost: 1 }
      // Should not throw
      compareByAspectTypeCostName(withName, noName)
      assert.ok(true)
    })
  })

  describe('compareByCostName', () => {
    it('sorts by cost first', () => {
      const cheap = { cost: 1, name: 'Z' }
      const expensive = { cost: 5, name: 'A' }
      assert.strictEqual(compareByCostName(cheap, expensive) < 0, true)
    })

    it('sorts by name when cost is equal', () => {
      const a = { cost: 3, name: 'Alpha' }
      const z = { cost: 3, name: 'Zeta' }
      assert.strictEqual(compareByCostName(a, z) < 0, true)
    })
  })

  describe('compareByName', () => {
    it('sorts alphabetically', () => {
      const a = { name: 'Alpha' }
      const z = { name: 'Zeta' }
      assert.strictEqual(compareByName(a, z) < 0, true)
    })

    it('is case insensitive', () => {
      const lower = { name: 'alpha' }
      const upper = { name: 'ALPHA' }
      assert.strictEqual(compareByName(lower, upper), 0)
    })
  })

  describe('sortByAspect', () => {
    it('returns new array (does not mutate)', () => {
      const cards = [
        { aspects: ['Command'], name: 'B' },
        { aspects: ['Vigilance'], name: 'A' },
      ]
      const original = [...cards]
      const sorted = sortByAspect(cards)

      // Original unchanged
      assert.deepStrictEqual(cards, original)
      // Result is different reference
      assert.notStrictEqual(sorted, cards)
    })

    it('sorts multiple cards correctly', () => {
      const cards = [
        { aspects: ['Aggression'], type: 'Unit', cost: 3, name: 'C' },
        { aspects: ['Vigilance'], type: 'Unit', cost: 1, name: 'A' },
        { aspects: ['Command'], type: 'Event', cost: 2, name: 'B' },
      ]
      const sorted = sortByAspect(cards)

      assert.strictEqual(sorted[0].aspects[0], 'Vigilance')
      assert.strictEqual(sorted[1].aspects[0], 'Command')
      assert.strictEqual(sorted[2].aspects[0], 'Aggression')
    })
  })

  describe('sortByCost', () => {
    it('sorts by cost ascending', () => {
      const cards = [
        { cost: 5, name: 'Expensive' },
        { cost: 1, name: 'Cheap' },
        { cost: 3, name: 'Medium' },
      ]
      const sorted = sortByCost(cards)

      assert.strictEqual(sorted[0].cost, 1)
      assert.strictEqual(sorted[1].cost, 3)
      assert.strictEqual(sorted[2].cost, 5)
    })
  })

  describe('sortByName', () => {
    it('sorts alphabetically', () => {
      const cards = [
        { name: 'Zeta' },
        { name: 'Alpha' },
        { name: 'Beta' },
      ]
      const sorted = sortByName(cards)

      assert.strictEqual(sorted[0].name, 'Alpha')
      assert.strictEqual(sorted[1].name, 'Beta')
      assert.strictEqual(sorted[2].name, 'Zeta')
    })
  })

  describe('sortCards', () => {
    const testCards = [
      { aspects: ['Aggression'], type: 'Unit', cost: 3, name: 'C' },
      { aspects: ['Vigilance'], type: 'Unit', cost: 1, name: 'A' },
      { aspects: ['Command'], type: 'Event', cost: 2, name: 'B' },
    ]

    it('sorts by aspect by default', () => {
      const sorted = sortCards(testCards)
      assert.strictEqual(sorted[0].aspects[0], 'Vigilance')
    })

    it('sorts by aspect when specified', () => {
      const sorted = sortCards(testCards, 'aspect')
      assert.strictEqual(sorted[0].aspects[0], 'Vigilance')
    })

    it('sorts by cost when specified', () => {
      const sorted = sortCards(testCards, 'cost')
      assert.strictEqual(sorted[0].cost, 1)
    })

    it('sorts by name when specified', () => {
      const sorted = sortCards(testCards, 'name')
      assert.strictEqual(sorted[0].name, 'A')
    })
  })
})
