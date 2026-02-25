/**
 * Tests for Practice Hand feature
 *
 * Tests the logic for drawing a random 6-card practice hand
 * from the deck (excluding leaders and bases).
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'

// === Types (mirrors page.tsx) ===

interface CardType {
  id?: string
  name?: string
  type?: string
  isBase?: boolean
  isLeader?: boolean
  [key: string]: unknown
}

interface CardPosition {
  card: CardType
  section: string
  enabled?: boolean
  [key: string]: unknown
}

// === Extract the practice hand logic as a pure function for testing ===

function drawPracticeHand(
  cardPositions: Record<string, CardPosition>,
  handSize: number = 6
): CardType[] {
  const deckCards = Object.values(cardPositions)
    .filter((pos: CardPosition) =>
      pos.section === 'deck' &&
      pos.enabled !== false &&
      !pos.card.isBase &&
      !pos.card.isLeader
    )
    .map((pos: CardPosition) => pos.card)

  const shuffled = [...deckCards].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, handSize)
}

// === Helper to build card positions ===

function makeCardPosition(
  id: string,
  section: string,
  overrides: Partial<CardType> = {},
  posOverrides: Partial<CardPosition> = {}
): [string, CardPosition] {
  return [id, {
    card: { id, name: `Card ${id}`, ...overrides },
    section,
    enabled: true,
    ...posOverrides,
  }]
}

// === Tests ===

describe('Practice Hand', () => {
  it('draws exactly 6 cards from the deck', () => {
    const positions = Object.fromEntries([
      ...Array.from({ length: 30 }, (_, i) =>
        makeCardPosition(`card-${i}`, 'deck')
      ),
      makeCardPosition('leader-1', 'leaders', { isLeader: true }),
      makeCardPosition('base-1', 'bases', { isBase: true }),
    ])

    const hand = drawPracticeHand(positions)
    assert.strictEqual(hand.length, 6, 'Hand should have 6 cards')
  })

  it('excludes leaders from the hand', () => {
    const positions = Object.fromEntries([
      ...Array.from({ length: 10 }, (_, i) =>
        makeCardPosition(`card-${i}`, 'deck')
      ),
      // Leader in the deck section should still be excluded
      makeCardPosition('leader-in-deck', 'deck', { isLeader: true }),
    ])

    // Draw many hands to make sure leader never appears
    for (let trial = 0; trial < 50; trial++) {
      const hand = drawPracticeHand(positions)
      const hasLeader = hand.some(c => c.isLeader)
      assert.strictEqual(hasLeader, false, 'Hand should never contain a leader')
    }
  })

  it('excludes bases from the hand', () => {
    const positions = Object.fromEntries([
      ...Array.from({ length: 10 }, (_, i) =>
        makeCardPosition(`card-${i}`, 'deck')
      ),
      // Base in the deck section should still be excluded
      makeCardPosition('base-in-deck', 'deck', { isBase: true }),
    ])

    for (let trial = 0; trial < 50; trial++) {
      const hand = drawPracticeHand(positions)
      const hasBase = hand.some(c => c.isBase)
      assert.strictEqual(hasBase, false, 'Hand should never contain a base')
    }
  })

  it('excludes sideboard cards', () => {
    const positions = Object.fromEntries([
      ...Array.from({ length: 10 }, (_, i) =>
        makeCardPosition(`deck-${i}`, 'deck')
      ),
      ...Array.from({ length: 10 }, (_, i) =>
        makeCardPosition(`side-${i}`, 'sideboard')
      ),
    ])

    for (let trial = 0; trial < 50; trial++) {
      const hand = drawPracticeHand(positions)
      const hasSideboard = hand.some(c => c.id?.startsWith('side-'))
      assert.strictEqual(hasSideboard, false, 'Hand should never contain sideboard cards')
    }
  })

  it('excludes disabled cards', () => {
    const positions = Object.fromEntries([
      ...Array.from({ length: 10 }, (_, i) =>
        makeCardPosition(`card-${i}`, 'deck')
      ),
      makeCardPosition('disabled-card', 'deck', {}, { enabled: false }),
    ])

    for (let trial = 0; trial < 50; trial++) {
      const hand = drawPracticeHand(positions)
      const hasDisabled = hand.some(c => c.id === 'disabled-card')
      assert.strictEqual(hasDisabled, false, 'Hand should never contain disabled cards')
    }
  })

  it('returns fewer cards if deck has less than 6', () => {
    const positions = Object.fromEntries([
      makeCardPosition('card-0', 'deck'),
      makeCardPosition('card-1', 'deck'),
      makeCardPosition('card-2', 'deck'),
    ])

    const hand = drawPracticeHand(positions)
    assert.strictEqual(hand.length, 3, 'Hand should have all 3 available cards')
  })

  it('returns empty hand if deck is empty', () => {
    const positions = Object.fromEntries([
      makeCardPosition('leader-1', 'leaders', { isLeader: true }),
      makeCardPosition('base-1', 'bases', { isBase: true }),
    ])

    const hand = drawPracticeHand(positions)
    assert.strictEqual(hand.length, 0, 'Hand should be empty')
  })

  it('draws are random (not always the same cards)', () => {
    const positions = Object.fromEntries(
      Array.from({ length: 30 }, (_, i) =>
        makeCardPosition(`card-${i}`, 'deck')
      )
    )

    const hands = Array.from({ length: 10 }, () => drawPracticeHand(positions))
    const firstCardIds = hands.map(h => h.map(c => c.id).sort().join(','))

    // With 30 cards choosing 6, getting the same hand twice in 10 draws is astronomically unlikely
    const uniqueHands = new Set(firstCardIds)
    assert.ok(uniqueHands.size > 1, `Hands should vary across draws, got ${uniqueHands.size} unique hand(s)`)
  })

  it('only draws from deck section cards', () => {
    const positions = Object.fromEntries([
      makeCardPosition('deck-1', 'deck'),
      makeCardPosition('deck-2', 'deck'),
      makeCardPosition('deck-3', 'deck'),
      makeCardPosition('deck-4', 'deck'),
      makeCardPosition('deck-5', 'deck'),
      makeCardPosition('deck-6', 'deck'),
      makeCardPosition('pool-1', 'pool'),
      makeCardPosition('side-1', 'sideboard'),
      makeCardPosition('leader-1', 'leaders', { isLeader: true }),
      makeCardPosition('base-1', 'bases', { isBase: true }),
    ])

    const hand = drawPracticeHand(positions)
    assert.strictEqual(hand.length, 6)
    for (const card of hand) {
      assert.ok(card.id?.startsWith('deck-'), `Card ${card.id} should be a deck card`)
    }
  })
})
