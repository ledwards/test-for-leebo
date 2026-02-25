// @ts-nocheck
/**
 * Pod Pairing Algorithm
 *
 * Computes round 1 pairings for a draft pod.
 * Uses opposite-seat pairing: player[i] is paired with player[i + half].
 * For odd player counts, one player gets a random bye.
 */

export interface PairingPlayer {
  userId: string
  seatNumber: number
}

export interface PairingMatch {
  player1Id: string
  player2Id: string
}

export interface PairingResult {
  matches: PairingMatch[]
  byePlayerId: string | null
}

/**
 * Compute pairings from players sorted by seat number.
 * Opposite-seat pairing: player[i] paired with player[i + half].
 * Returns matches array and optionally a bye player ID.
 *
 * @param players - Array of players with userId and seatNumber
 * @param storedByePlayerId - Previously stored bye player ID (for consistency)
 * @returns Pairing result with matches and bye player
 */
export function computePairings(
  players: PairingPlayer[],
  storedByePlayerId: string | null = null
): PairingResult {
  if (players.length < 2) {
    return {
      matches: [],
      byePlayerId: players.length === 1 ? players[0].userId : null,
    }
  }

  let byePlayerId: string | null = null

  // Determine bye for odd player count
  if (players.length % 2 === 1) {
    if (storedByePlayerId && players.some(p => p.userId === storedByePlayerId)) {
      byePlayerId = storedByePlayerId
    } else {
      // Random bye
      const randomIndex = Math.floor(Math.random() * players.length)
      byePlayerId = players[randomIndex].userId
    }
  }

  // Remove bye player from pairing list
  const pairingPlayers = byePlayerId
    ? players.filter(p => p.userId !== byePlayerId)
    : [...players]

  // Sort by seat number
  pairingPlayers.sort((a, b) => a.seatNumber - b.seatNumber)

  // Pair opposite seats: player[i] with player[i + half]
  const half = pairingPlayers.length / 2
  const matches: PairingMatch[] = []

  for (let i = 0; i < half; i++) {
    matches.push({
      player1Id: pairingPlayers[i].userId,
      player2Id: pairingPlayers[i + half].userId,
    })
  }

  return { matches, byePlayerId }
}
