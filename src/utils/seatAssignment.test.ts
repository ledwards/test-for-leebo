import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { findSpreadSeat } from './seatAssignment.ts'

describe('findSpreadSeat', () => {
  it('returns seat 1 when no seats are taken', () => {
    assert.strictEqual(findSpreadSeat(new Set(), 8), 1)
  })

  it('returns seat 5 when only seat 1 is taken (8 players)', () => {
    // Seat 5 is distance 4 from seat 1 (max possible for 8 seats)
    assert.strictEqual(findSpreadSeat(new Set([1]), 8), 5)
  })

  it('returns seat 3 when seats 1 and 5 are taken (8 players)', () => {
    // Seat 3: dist to 1=2, dist to 5=2 → min=2
    // Seat 7: dist to 1=2, dist to 5=2 → min=2 (tie, 3 wins by lower number)
    assert.strictEqual(findSpreadSeat(new Set([1, 5]), 8), 3)
  })

  it('returns seat 7 when seats 1, 3, 5 are taken (8 players)', () => {
    // Seat 7: dist to 1=2, dist to 3=4→min(4,4)=4→min(2), dist to 5=2 → min=2
    // Seat 2: dist to 1=1, immediately worse
    assert.strictEqual(findSpreadSeat(new Set([1, 3, 5]), 8), 7)
  })

  it('fills 8-seat pod in spread order', () => {
    const taken = new Set<number>()
    const order: number[] = []
    for (let i = 0; i < 8; i++) {
      const seat = findSpreadSeat(taken, 8)
      order.push(seat)
      taken.add(seat)
    }
    // Expected: 1, 5, 3, 7, 2, 4, 6, 8
    assert.deepStrictEqual(order, [1, 5, 3, 7, 2, 4, 6, 8])
  })

  it('works with 4 max players', () => {
    // Seat 1 taken → seat 3 (distance 2, opposite)
    assert.strictEqual(findSpreadSeat(new Set([1]), 4), 3)
    // Seats 1,3 → seat 2 (distance 1 from both, tie with 4, 2 wins)
    assert.strictEqual(findSpreadSeat(new Set([1, 3]), 4), 2)
  })

  it('works with 6 max players', () => {
    assert.strictEqual(findSpreadSeat(new Set([1]), 6), 4)
    assert.strictEqual(findSpreadSeat(new Set([1, 4]), 6), 2)
  })

  it('works with 2 max players', () => {
    assert.strictEqual(findSpreadSeat(new Set(), 2), 1)
    assert.strictEqual(findSpreadSeat(new Set([1]), 2), 2)
  })

  it('handles non-contiguous taken seats', () => {
    // Seats 2 and 6 taken in 8-player pod
    // Seat 1: dist to 2=1, dist to 6=3 → min=1
    // Seat 3: dist to 2=1, dist to 6=3 → min=1
    // Seat 4: dist to 2=2, dist to 6=2 → min=2 ← best
    // Seat 5: dist to 2=3, dist to 6=1 → min=1
    // Seat 7: dist to 2=3, dist to 6=1 → min=1
    // Seat 8: dist to 2=2, dist to 6=2 → min=2 (tie with 4, 4 wins)
    assert.strictEqual(findSpreadSeat(new Set([2, 6]), 8), 4)
  })

  it('returns -1 when all seats taken', () => {
    assert.strictEqual(findSpreadSeat(new Set([1, 2, 3, 4]), 4), -1)
  })
})
