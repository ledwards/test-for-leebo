// POST /api/auth/signout - Sign out current user
import { clearSession } from '../../lib/auth.js'
import { jsonResponse, errorResponse } from '../../lib/utils.js'

export default async function handler(request) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const response = jsonResponse({ message: 'Signed out successfully' })
    return clearSession(response)
  } catch (error) {
    return errorResponse(error.message, 500)
  }
}
