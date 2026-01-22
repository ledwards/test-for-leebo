// GET /api/auth/callback/discord - Discord OAuth callback
import { queryRow, query } from '@/lib/db.js'
import { setSession } from '@/lib/auth.js'
import { NextResponse } from 'next/server'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Decode state to get return_to URL
    let returnTo = '/'
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
        returnTo = stateData.returnTo || '/'
      } catch (e) {
        console.error('Failed to decode state:', e)
      }
    }

    if (error) {
      return NextResponse.redirect(`${APP_URL}${returnTo}?error=${encodeURIComponent(error)}`)
    }

    if (!code) {
      return NextResponse.json({
        success: false,
        data: null,
        message: 'Missing authorization code',
      }, { status: 400 })
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${APP_URL}/api/auth/callback/discord`,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Get user info from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info from Discord')
    }

    const discordUser = await userResponse.json()

    // Find or create user
    let user = await queryRow(
      'SELECT * FROM users WHERE discord_id = $1',
      [discordUser.id]
    )

    if (!user) {
      // Create new user
      const result = await query(
        `INSERT INTO users (discord_id, username, email, avatar_url)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          discordUser.id,
          discordUser.username,
          discordUser.email,
          discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null,
        ]
      )
      user = result.rows[0]
    } else {
      // Update existing user
      const result = await query(
        `UPDATE users
         SET username = $1, email = $2, avatar_url = $3, updated_at = NOW()
         WHERE discord_id = $4
         RETURNING *`,
        [
          discordUser.username,
          discordUser.email,
          discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null,
          discordUser.id,
        ]
      )
      user = result.rows[0] || user
    }

    // Create session and redirect to return_to
    const response = NextResponse.redirect(`${APP_URL}${returnTo}?auth=success`)
    return setSession(response, user)
  } catch (error) {
    console.error('Discord OAuth error:', error)
    // Try to redirect to return_to from state, fallback to home
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    let returnTo = '/'
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
        returnTo = stateData.returnTo || '/'
      } catch (e) {
        // ignore decode errors
      }
    }
    return NextResponse.redirect(`${APP_URL}${returnTo}?error=${encodeURIComponent(error.message)}`)
  }
}
