// @ts-nocheck
// POST /api/draft - Create a new draft pod
import { query, queryRow } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { generateShareId } from '@/lib/utils'
import { jsonResponse, parseBody, validateRequired, handleApiError } from '@/lib/utils'
import { getSetConfig } from '@/src/utils/setConfigs/index'
import { generateSealedBox, clearBeltCache } from '@/src/utils/boosterPack'
import { broadcastPublicPodsUpdate } from '@/src/lib/socketBroadcast'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = requireAuth(request)
    const body = await parseBody(request)
    validateRequired(body, ['setCode'])

    const {
      setCode,
      maxPlayers = 8,
      timerEnabled = true,
      timerSeconds = 30,
      settings = {}
    } = body

    // Get set name from config
    // For chaos draft, use "Chaos Draft (SET1, SET2, SET3) MM/DD/YYYY"
    let setName: string
    if (settings.draftMode === 'chaos' && settings.chaosSets) {
      const now = new Date()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const year = now.getFullYear()
      setName = `Chaos Draft (${settings.chaosSets.join(', ')}) ${month}/${day}/${year}`
    } else {
      const setConfig = getSetConfig(setCode)
      setName = setConfig?.setName || setCode
    }

    // Generate 24-pack booster box upfront
    // For chaos drafts, generate 8 packs per set (3 sets = 24 packs)
    let boxPacks
    if (settings.draftMode === 'chaos' && settings.chaosSets) {
      clearBeltCache()
      boxPacks = []
      for (const chaosSetCode of settings.chaosSets) {
        // Generate 8 packs per set for chaos draft
        const setPacks = generateSealedBox([], chaosSetCode, 8)
        boxPacks.push(...setPacks)
      }
    } else {
      // Normal draft - generate 24 packs from one set
      boxPacks = generateSealedBox([], setCode, 24)
    }

    // Generate share ID with retry logic
    let shareId = generateShareId(8)
    let attempts = 0
    const maxAttempts = 10
    let result

    while (attempts < maxAttempts) {
      try {
        result = await query(
          `INSERT INTO pods (
            share_id,
            host_id,
            set_code,
            set_name,
            name,
            status,
            max_players,
            current_players,
            timer_enabled,
            timer_seconds,
            settings,
            draft_state,
            state_version,
            box_packs,
            shuffled_packs
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING id, share_id, created_at`,
          [
            shareId,
            session.id,
            setCode,
            setName,
            `${setName} Draft`,
            'waiting',
            maxPlayers,
            1, // Host counts as first player
            timerEnabled,
            timerSeconds,
            JSON.stringify(settings),
            JSON.stringify({ phase: 'lobby' }),
            1,
            JSON.stringify(boxPacks),
            false
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
      `INSERT INTO pod_players (
        pod_id,
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

    // Broadcast to multiplayer page if pod is public
    if (settings.isPublic) {
      broadcastPublicPodsUpdate().catch(err => {
        console.error('Error broadcasting public pods update:', err)
      })
    }

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
