// @ts-nocheck
// POST /api/beta/enroll - Enroll current user as beta tester
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, setSession } from '@/lib/auth'
import { queryRow } from '@/lib/db'
import { isPatron, addBetaTesterRole } from '@/lib/discord'
import { handleApiError } from '@/lib/utils'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = requireAuth(request)

    // Fetch discord_id for patron check and role assignment
    const userRow = await queryRow(
      'SELECT discord_id FROM users WHERE id = $1',
      [session.id]
    )
    const discordId = userRow?.discord_id as string | undefined

    // Admins bypass patron check
    if (!session.is_admin) {
      const patron = discordId
        ? await isPatron(discordId)
        : false

      if (!patron) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            message: 'Patreon subscription required. Visit our Patreon to subscribe and get beta access.',
          },
          { status: 403 }
        )
      }
    }

    // Update user to be a beta tester
    const user = await queryRow(
      `UPDATE users
       SET is_beta_tester = TRUE
       WHERE id = $1
       RETURNING id, email, username, avatar_url, is_admin, is_beta_tester`,
      [session.id]
    )

    if (!user) {
      throw new Error('User not found')
    }

    // Return updated session with new cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar_url: user.avatar_url || null,
          is_admin: user.is_admin || false,
          is_beta_tester: user.is_beta_tester || false,
        },
      },
      message: 'Beta access granted',
    })

    // Best-effort: assign Discord beta tester role
    if (discordId) {
      addBetaTesterRole(discordId).catch(() => {})
    }

    // Set new session cookie with updated role flags
    return setSession(response, user)
  } catch (error) {
    return handleApiError(error)
  }
}
