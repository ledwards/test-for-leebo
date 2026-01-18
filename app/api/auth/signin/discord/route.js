// GET /api/auth/signin/discord - Initiate Discord OAuth flow
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth.js'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(request) {
  try {
    if (!DISCORD_CLIENT_ID) {
      return NextResponse.json({
        success: false,
        data: null,
        message: 'Discord OAuth not configured',
      }, { status: 500 })
    }

    // Check if user already has a valid session
    const session = getSession(request)
    if (session) {
      // Already logged in, redirect back to home
      return NextResponse.redirect(`${APP_URL}/?auth=already_logged_in`)
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
    // Add prompt=consent to force re-authorization, or remove it to allow auto-approval
    // If user has already authorized, Discord will auto-approve if prompt is not set

    // Redirect to Discord OAuth
    return NextResponse.redirect(discordAuthUrl.toString())
  } catch (error) {
    console.error('Discord signin error:', error)
    return NextResponse.json({
      success: false,
      data: null,
      message: error.message || 'Internal server error',
    }, { status: 500 })
  }
}
