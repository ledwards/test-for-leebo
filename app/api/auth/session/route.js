// GET /api/auth/session - Get current session
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth.js'
import { toSessionUser } from '@/src/utils/sessionUser.js'

export async function GET(request) {
  try {
    const session = getSession(request)
    
    if (!session) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No active session',
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        user: toSessionUser(session),
      },
    })
  } catch (error) {
    console.error('Session endpoint error:', error)
    return NextResponse.json({
      success: false,
      data: null,
      message: error.message || 'Internal server error',
    }, { status: 500 })
  }
}
