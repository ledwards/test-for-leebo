// GET /api/auth/session - Get current session
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: null,
    message: 'No active session',
  })
}
