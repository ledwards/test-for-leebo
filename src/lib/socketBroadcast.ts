// @ts-nocheck
/**
 * Socket.io Broadcast Helper
 *
 * Broadcasts draft state updates to all connected clients via WebSocket.
 * Sends PUBLIC data only - clients fetch their user-specific data via HTTP.
 */
import { queryRow, queryRows } from '@/lib/db'
import { jsonParse } from '@/src/utils/json'
import type { Server as SocketIOServer } from 'socket.io'

// Extend global with io
declare global {
  // eslint-disable-next-line no-var
  var io: SocketIOServer | undefined
}

interface DraftPod {
  id: string
  share_id: string
  status: string
  state_version: number
  draft_state: string | Record<string, unknown>
  host_id: string
  timed: boolean
  timer_enabled: boolean
  timer_seconds: number
  pick_timeout_seconds: number
  started_at: string | null
  completed_at: string | null
  pick_started_at: string | null
  paused: boolean
  paused_at: string | null
  paused_duration_seconds: number
}

interface DraftPlayer {
  id: string
  user_id: string
  seat_number: number
  pick_status: string
  is_bot: boolean
  leaders: string | unknown[]
  drafted_leaders: string | unknown[]
  drafted_cards: string | unknown[]
  username: string
  avatar_url: string
}

interface PublicLeader {
  name: string
  aspects: string[]
  imageUrl: string
  backImageUrl: string
}

interface PublicPlayer {
  id: string
  odId: string
  username: string
  avatarUrl: string
  seatNumber: number
  pickStatus: string
  isBot: boolean
  leaderPack: PublicLeader[] | null
  draftedCardsCount: number
  draftedLeadersCount: number
  draftedLeaders: PublicLeader[]
}

interface BroadcastState {
  stateVersion: number
  status: string
  draftState: Record<string, unknown>
  players: PublicPlayer[]
  timed: boolean
  timerEnabled: boolean
  timerSeconds: number
  pickTimeoutSeconds: number
  startedAt: string | null
  completedAt: string | null
  pickStartedAt: string | null
  paused: boolean
  pausedAt: string | null
  pausedDurationSeconds: number
}

/**
 * Broadcast draft state to all connected clients in a draft room.
 * @param shareId - Draft share ID
 */
export async function broadcastDraftState(shareId: string): Promise<void> {
  const io = global.io
  if (!io) {
    console.warn('[Broadcast] Socket.io not initialized - broadcast skipped')
    return
  }

  try {
    const pod = await queryRow(
      `SELECT dp.id, dp.share_id, dp.status, dp.state_version, dp.draft_state,
              dp.host_id, dp.timed, dp.timer_enabled, dp.timer_seconds, dp.pick_timeout_seconds,
              dp.started_at, dp.completed_at, dp.pick_started_at,
              dp.paused, dp.paused_at, dp.paused_duration_seconds
       FROM draft_pods dp WHERE dp.share_id = $1`,
      [shareId]
    ) as DraftPod | null

    if (!pod) {
      io.to(`draft:${shareId}`).emit('deleted')
      return
    }

    // Get all players (public info only)
    const players = await queryRows(
      `SELECT dpp.id, dpp.user_id, dpp.seat_number, dpp.pick_status, dpp.is_bot,
              dpp.leaders, dpp.drafted_leaders, dpp.drafted_cards,
              u.username, u.avatar_url
       FROM draft_pod_players dpp
       JOIN users u ON dpp.user_id = u.id
       WHERE dpp.draft_pod_id = $1
       ORDER BY dpp.seat_number`,
      [pod.id]
    ) as DraftPlayer[]

    const draftState = jsonParse<Record<string, unknown>>(pod.draft_state, {}) as Record<string, unknown>

    // Build PUBLIC player data (visible to all)
    const publicPlayers: PublicPlayer[] = players.map(p => {
      const draftedLeaders = jsonParse<unknown[]>(p.drafted_leaders, []) as { name: string; aspects?: string[]; imageUrl: string; backImageUrl: string }[]

      return {
        id: p.id,
        odId: p.user_id,
        username: p.username,
        avatarUrl: p.avatar_url,
        seatNumber: p.seat_number,
        pickStatus: p.pick_status,
        isBot: p.is_bot === true,
        // Never expose other players' leader packs - clients get their own via HTTP myPlayer
        leaderPack: null,
        draftedCardsCount: (jsonParse<unknown[]>(p.drafted_cards, []) as unknown[]).length,
        draftedLeadersCount: draftedLeaders.length,
        draftedLeaders: draftedLeaders.map(l => ({
          name: l.name,
          aspects: l.aspects || [],
          imageUrl: l.imageUrl,
          backImageUrl: l.backImageUrl,
        })),
      }
    })

    // Broadcast public state to all clients in the room
    const broadcastPayload: BroadcastState = {
      stateVersion: pod.state_version,
      status: pod.status,
      draftState,
      players: publicPlayers,
      timed: pod.timed !== false,
      timerEnabled: pod.timer_enabled,
      timerSeconds: pod.timer_seconds,
      pickTimeoutSeconds: pod.pick_timeout_seconds || 120,
      startedAt: pod.started_at,
      completedAt: pod.completed_at,
      pickStartedAt: pod.pick_started_at,
      paused: pod.paused === true,
      pausedAt: pod.paused_at,
      pausedDurationSeconds: pod.paused_duration_seconds || 0,
    }
    io.to(`draft:${shareId}`).emit('state', broadcastPayload)
  } catch (err) {
    console.error('Error broadcasting draft state:', err)
  }
}

/**
 * Broadcast a simple event to all clients in a draft room
 * @param shareId - Draft share ID
 * @param eventType - Event type
 * @param data - Event data
 */
export function broadcastEvent(shareId: string, eventType: string, data: Record<string, unknown> = {}): void {
  const io = global.io
  if (!io) {
    console.warn('Socket.io not initialized - event broadcast skipped')
    return
  }

  io.to(`draft:${shareId}`).emit(eventType, {
    timestamp: Date.now(),
    ...data,
  })
}

/**
 * Broadcast pod state to all connected clients on the pod page.
 * Sends player readiness updates when someone builds a deck.
 * @param draftShareId - Draft share ID
 */
export async function broadcastPodState(draftShareId: string): Promise<void> {
  const io = global.io
  if (!io) {
    console.warn('[Broadcast] Socket.io not initialized - pod broadcast skipped')
    return
  }

  try {
    const pod = await queryRow(
      `SELECT dp.id, dp.share_id, dp.status
       FROM draft_pods dp WHERE dp.share_id = $1`,
      [draftShareId]
    )

    if (!pod) {
      io.to(`pod:${draftShareId}`).emit('deleted')
      return
    }

    // Get all players with readiness status
    const players = await queryRows(
      `SELECT
        dpp.user_id,
        dpp.seat_number,
        u.username,
        u.avatar_url,
        CASE WHEN bd.id IS NOT NULL THEN true ELSE false END as is_ready
       FROM draft_pod_players dpp
       JOIN users u ON dpp.user_id = u.id
       LEFT JOIN card_pools cp ON cp.draft_pod_id = dpp.draft_pod_id AND cp.user_id = dpp.user_id
       LEFT JOIN built_decks bd ON bd.card_pool_id = cp.id
       WHERE dpp.draft_pod_id = $1
       ORDER BY dpp.seat_number`,
      [pod.id]
    )

    io.to(`pod:${draftShareId}`).emit('pod-state', {
      timestamp: Date.now(),
      players: players.map(p => ({
        id: p.user_id,
        username: p.username,
        avatarUrl: p.avatar_url,
        seatNumber: p.seat_number,
        isReady: p.is_ready,
      })),
    })
  } catch (err) {
    console.error('Error broadcasting pod state:', err)
  }
}

/**
 * Broadcast rotisserie draft state to all connected clients.
 * @param shareId - Rotisserie draft share ID
 */
export async function broadcastRotisserieState(shareId: string): Promise<void> {
  const io = global.io
  if (!io) {
    console.warn('[Broadcast] Socket.io not initialized - rotisserie broadcast skipped')
    return
  }

  try {
    const pool = await queryRow(
      'SELECT * FROM card_pools WHERE share_id = $1 AND pool_type = $2',
      [shareId, 'rotisserie']
    )

    if (!pool) {
      io.to(`rotisserie:${shareId}`).emit('deleted')
      return
    }

    const data = jsonParse(pool.cards, {})

    // Broadcast full state to all clients in the room
    io.to(`rotisserie:${shareId}`).emit('state', {
      shareId: pool.share_id,
      createdAt: pool.created_at,
      timestamp: Date.now(),
      ...data
    })
  } catch (err) {
    console.error('Error broadcasting rotisserie state:', err)
  }
}
