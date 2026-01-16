// GET /api/auth/signin/discord - Initiate Discord OAuth flow
import { NextResponse } from 'next/server'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(request) {
  if (!DISCORD_CLIENT_ID) {
    return NextResponse.json({
      success: false,
      data: null,
      message: 'Discord OAuth not configured',
    }, { status: 500 })
  }

  // Generate state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15)
  
  // Build Discord OAuth URL
  const discordAuthUrl = new URL('https://discord.com/api/oauth2/authorize')
  discordAuthUrl.searchParams.set('client_id', DISCORD_CLIENT_ID)
  discordAuthUrl.searchParams.set('redirect_uri', `${APP_URL}/api/auth/callback/discord`)
  discordAuthUrl.searchParams.set('response_type', 'code')
  discordAuthUrl.searchParams.set('scope', 'identify email')
  discordAuthUrl.searchParams.set('state', state)

  // Redirect to Discord OAuth
  return NextResponse.redirect(discordAuthUrl.toString())
}
