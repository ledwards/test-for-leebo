// GET /api/auth/callback/discord - Discord OAuth callback
import { queryRow, query } from '../../lib/db.js'
import { setSession } from '../../lib/auth.js'
import { jsonResponse, errorResponse } from '../../lib/utils.js'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const APP_URL = process.env.APP_URL || process.env.VERCEL_URL || 'http://localhost:5173'

export default async function handler(request) {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    if (error) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${APP_URL}/?error=${encodeURIComponent(error)}`,
        },
      })
    }

    if (!code) {
      return errorResponse('Missing authorization code', 400)
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

    // Create session and redirect
    const response = new Response(null, {
      status: 302,
      headers: {
        Location: `${APP_URL}/?auth=success`,
      },
    })

    return setSession(response, user)
  } catch (error) {
    console.error('Discord OAuth error:', error)
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${APP_URL}/?error=${encodeURIComponent(error.message)}`,
      },
    })
  }
}
