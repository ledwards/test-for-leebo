// POST /api/draft - Create a new draft pod
import { query, queryRow } from '@/lib/db.js'
import { requireAuth } from '@/lib/auth.js'
import { generateShareId } from '@/lib/utils.js'
import { jsonResponse, errorResponse, parseBody, validateRequired, handleApiError } from '@/lib/utils.js'
import { getSetConfig } from '@/src/utils/setConfigs/index.js'

export async function POST(request) {
  try {
    const session = requireAuth(request)
    const body = await parseBody(request)
    validateRequired(body, ['setCode'])

    const {
      setCode,
      maxPlayers = 8,
      timerEnabled = true,
      timerSeconds = 30
    } = body

    // Get set name from config
    const setConfig = getSetConfig(setCode)
    const setName = setConfig?.setName || setCode

    // Generate share ID with retry logic
    let shareId = generateShareId(8)
    let attempts = 0
    const maxAttempts = 10
    let result

    while (attempts < maxAttempts) {
      try {
        result = await query(
          `INSERT INTO draft_pods (
            share_id,
            host_id,
            set_code,
            set_name,
            status,
            max_players,
            current_players,
            timer_enabled,
            timer_seconds,
            settings,
            draft_state,
            state_version
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING id, share_id, created_at`,
          [
            shareId,
            session.id,
            setCode,
            setName,
            'waiting',
            maxPlayers,
            1, // Host counts as first player
            timerEnabled,
            timerSeconds,
            JSON.stringify({}),
            JSON.stringify({ phase: 'lobby' }),
            1
          ]
        )
        break
      } catch (error) {
        if (error.message.includes('duplicate key') || error.code === '23505') {
          shareId = generateShareId(8)
          attempts++
          continue
        }
        throw error
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique share ID')
    }

    const pod = result.rows[0]

    // Add host as first player with seat 1
    await query(
      `INSERT INTO draft_pod_players (
        draft_pod_id,
        user_id,
        seat_number,
        pick_status,
        drafted_cards,
        leaders,
        drafted_leaders
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        pod.id,
        session.id,
        1,
        'waiting',
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([])
      ]
    )

    const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const shareUrl = `${APP_URL}/draft/${shareId}`

    return jsonResponse({
      id: pod.id,
      shareId: pod.share_id,
      shareUrl,
      createdAt: pod.created_at,
    }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
