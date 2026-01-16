// GET /api/auth/session - Get current session
import { getSession } from '../../lib/auth.js'
import { jsonResponse, errorResponse } from '../../lib/utils.js'

export default async function handler(request) {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const session = getSession(request)
    
    if (!session) {
      return jsonResponse(null, 200, 'No active session')
    }

    return jsonResponse({
      user: {
        id: session.id,
        email: session.email,
        username: session.username,
      },
    })
  } catch (error) {
    return errorResponse(error.message, 500)
  }
}
