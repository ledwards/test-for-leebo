/**
 * Spread seating: assign seats to maximize circular distance from existing players.
 * Seats form a circular table (seat maxPlayers wraps to seat 1 for pack passing).
 */

function circularDistance(a: number, b: number, maxPlayers: number): number {
  const diff = Math.abs(a - b)
  return Math.min(diff, maxPlayers - diff)
}

/**
 * Find the seat that maximizes minimum circular distance from any taken seat.
 * Ties broken by lowest seat number.
 */
export function findSpreadSeat(takenSeats: Set<number>, maxPlayers: number): number {
  if (takenSeats.size === 0) return 1

  let bestSeat = -1
  let bestMinDist = -1

  for (let seat = 1; seat <= maxPlayers; seat++) {
    if (takenSeats.has(seat)) continue

    let minDist = Infinity
    for (const taken of takenSeats) {
      const d = circularDistance(seat, taken, maxPlayers)
      if (d < minDist) minDist = d
    }

    if (minDist > bestMinDist) {
      bestMinDist = minDist
      bestSeat = seat
    }
  }

  return bestSeat
}
