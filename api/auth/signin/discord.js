// GET /api/auth/signin/discord - Initiate Discord OAuth flow
import { errorResponse } from '../../lib/utils.js'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const APP_URL = process.env.APP_URL || process.env.VERCEL_URL || 'http://localhost:5173'

export default async function handler(request) {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  if (!DISCORD_CLIENT_ID) {
    return errorResponse('Discord OAuth not configured', 500)
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
  return new Response(null, {
    status: 302,
    headers: {
      Location: discordAuthUrl.toString(),
    },
  })
}
