// @ts-nocheck
// GET /api/auth/token - Get Bearer token for API usage
// Requires cookie session (must be logged in via browser)
import { getSession, createToken } from '@/lib/auth'
import { jsonResponse, handleApiError } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = getSession(request)
    if (!session) {
      return jsonResponse(null, 401, 'Authentication required. Log in at protectthepod.com first.')
    }

    const token = createToken({
      id: session.id,
      email: session.email,
      username: session.username,
      avatar_url: session.avatar_url,
      is_admin: session.is_admin,
      is_beta_tester: session.is_beta_tester,
    })

    return jsonResponse({
      token,
      expiresIn: '30d',
      usage: 'Include as Authorization: Bearer <token> header in API requests',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
