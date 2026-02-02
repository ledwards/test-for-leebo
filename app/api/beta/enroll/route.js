// POST /api/beta/enroll - Enroll current user as beta tester
import { NextResponse } from 'next/server'
import { requireAuth, setSession } from '@/lib/auth.js'
import { queryRow } from '@/lib/db.js'
import { handleApiError } from '@/lib/utils.js'

export async function POST(request) {
  try {
    const session = requireAuth(request)

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

    // Set new session cookie with updated role flags
    return setSession(response, user)
  } catch (error) {
    return handleApiError(error)
  }
}
