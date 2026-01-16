// POST /api/auth/signout - Sign out current user
import { clearSession } from '@/lib/auth.js'
import { jsonResponse, errorResponse } from '@/lib/utils.js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const response = NextResponse.json({
      success: true,
      data: { message: 'Signed out successfully' },
    })
    return clearSession(response)
  } catch (error) {
    return errorResponse(error.message, 500)
  }
}
