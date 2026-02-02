// POST /api/auth/refresh - Refresh session with latest user data from database
import { NextResponse } from 'next/server'
import { requireAuth, setSession } from '@/lib/auth.js'
import { queryRow } from '@/lib/db.js'
import { handleApiError } from '@/lib/utils.js'

export async function POST(request) {
  try {
    const session = requireAuth(request)

    // Fetch fresh user data from database
    const user = await queryRow(
      `SELECT id, email, username, avatar_url, is_admin, is_beta_tester
       FROM users
       WHERE id = $1`,
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
    })

    // Set new session cookie with updated data
    return setSession(response, user)
  } catch (error) {
    return handleApiError(error)
  }
}
