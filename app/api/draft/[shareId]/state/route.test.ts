/**
 * Tests for draft state endpoint security
 *
 * Bug: During leader draft, every player's leader pack was broadcast to all clients.
 * A player could inspect network requests to see other players' available leaders,
 * gaining an unfair advantage by knowing what leaders opponents could pick.
 *
 * Fix: Only send a player's own leader pack. Other players' packs are null.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'

// Extract the leader pack visibility logic for testing

interface Leader {
  name: string
  aspects: string[]
  imageUrl: string
  backImageUrl: string
}

interface PlayerData {
  user_id: string
  leaders: Leader[]
  drafted_leaders: Leader[]
}

/**
 * BUGGY: Sends all players' leader packs to everyone
 */
function formatPlayerLeaderPackBuggy(
  player: PlayerData,
  _sessionUserId: string | null,
  isLeaderDraftPhase: boolean,
): Leader[] | null {
  if (!isLeaderDraftPhase) return null
  // BUG: No check on session — every player's pack is visible to all
  return player.leaders.map(l => ({
    name: l.name,
    aspects: l.aspects || [],
    imageUrl: l.imageUrl,
    backImageUrl: l.backImageUrl,
  }))
}

/**
 * FIXED: Only sends leader pack to the owning player
 */
function formatPlayerLeaderPackFixed(
  player: PlayerData,
  sessionUserId: string | null,
  isLeaderDraftPhase: boolean,
): Leader[] | null {
  if (!isLeaderDraftPhase) return null
  if (!sessionUserId || player.user_id !== sessionUserId) return null
  return player.leaders.map(l => ({
    name: l.name,
    aspects: l.aspects || [],
    imageUrl: l.imageUrl,
    backImageUrl: l.backImageUrl,
  }))
}

const mockLeaders: Leader[] = [
  { name: 'Darth Vader', aspects: ['Villainy', 'Aggression'], imageUrl: '/vader.png', backImageUrl: '/vader-back.png' },
  { name: 'Luke Skywalker', aspects: ['Heroism', 'Vigilance'], imageUrl: '/luke.png', backImageUrl: '/luke-back.png' },
  { name: 'Boba Fett', aspects: ['Cunning', 'Villainy'], imageUrl: '/boba.png', backImageUrl: '/boba-back.png' },
]

const player1: PlayerData = { user_id: 'user-1', leaders: mockLeaders, drafted_leaders: [] }
const player2: PlayerData = { user_id: 'user-2', leaders: mockLeaders, drafted_leaders: [] }

describe('Leader pack visibility in draft state', () => {
  describe('BUGGY: exposes other players leader packs', () => {
    it('leaks opponent leader pack to all players', () => {
      // User 1 requests state — can see User 2's leaders
      const result = formatPlayerLeaderPackBuggy(player2, 'user-1', true)
      assert.notStrictEqual(result, null, 'BUG: opponent leader pack is exposed')
      assert.strictEqual(result!.length, 3, 'BUG: all 3 leaders visible to opponent')
    })

    it('leaks leader pack even to unauthenticated requests', () => {
      const result = formatPlayerLeaderPackBuggy(player1, null, true)
      assert.notStrictEqual(result, null, 'BUG: leader pack exposed without auth')
    })
  })

  describe('FIXED: only shows own leader pack', () => {
    it('shows leader pack to the owning player', () => {
      const result = formatPlayerLeaderPackFixed(player1, 'user-1', true)
      assert.notStrictEqual(result, null, 'Own leader pack should be visible')
      assert.strictEqual(result!.length, 3)
      assert.strictEqual(result![0].name, 'Darth Vader')
    })

    it('hides opponent leader pack', () => {
      const result = formatPlayerLeaderPackFixed(player2, 'user-1', true)
      assert.strictEqual(result, null, 'Opponent leader pack should be hidden')
    })

    it('hides leader pack from unauthenticated requests', () => {
      const result = formatPlayerLeaderPackFixed(player1, null, true)
      assert.strictEqual(result, null, 'Leader pack should be hidden without auth')
    })

    it('returns null outside leader draft phase', () => {
      const result = formatPlayerLeaderPackFixed(player1, 'user-1', false)
      assert.strictEqual(result, null, 'No leader pack outside leader draft phase')
    })
  })
})
