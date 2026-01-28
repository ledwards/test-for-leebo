/**
 * POST /api/draft/:shareId/heartbeat - Record player heartbeat for presence detection
 *
 * Called by clients every 5 seconds to indicate they're still connected.
 * Heartbeats expire after 15 seconds - if not refreshed, player is considered disconnected.
 */
import { getSession } from '@/lib/auth.js'
import { jsonResponse, errorResponse } from '@/lib/utils.js'
import { setHeartbeat, getOnlinePlayers } from '@/src/lib/redis.js'

export async function POST(request, { params }) {
  try {
    const { shareId } = await params
    const session = getSession(request)

    if (!session) {
      return errorResponse('Not authenticated', 401)
    }

    // Record heartbeat
    await setHeartbeat(shareId, session.id)

    // Return list of online players (useful for immediate UI update)
    const onlinePlayers = await getOnlinePlayers(shareId)

    return jsonResponse({
      success: true,
      onlinePlayers,
    })
  } catch (error) {
    console.error('Heartbeat error:', error)
    // Don't fail hard on heartbeat errors - just return success
    // The client will retry anyway
    return jsonResponse({ success: true, onlinePlayers: [] })
  }
}
