// @ts-nocheck
// GET /api/auth/patron-status - Check if current user is a Patreon patron
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { queryRow } from '@/lib/db'
import { isPatron } from '@/lib/discord'
import { handleApiError } from '@/lib/utils'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = requireAuth(request)

    // Admins are always patrons
    if (session.is_admin) {
      return NextResponse.json({
        success: true,
        data: { isPatron: true },
      })
    }

    const user = await queryRow(
      'SELECT discord_id FROM users WHERE id = $1',
      [session.id]
    )

    if (!user?.discord_id) {
      return NextResponse.json({
        success: true,
        data: { isPatron: false },
      })
    }

    const patron = await isPatron(user.discord_id as string)

    return NextResponse.json({
      success: true,
      data: { isPatron: patron },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
