// Authentication utilities
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'change-me-in-production'
const COOKIE_NAME = 'swupod_session'

/**
 * Create a JWT token for a user
 * @param {Object} user - User object with id, email, etc.
 * @returns {string} JWT token
 */
export function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar_url: user.avatar_url,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  )
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Get session from request (for API routes)
 * @param {Request} request - HTTP request object
 * @returns {Object|null} Session object or null
 */
export function getSession(request) {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = parseCookies(cookieHeader)
  const token = cookies[COOKIE_NAME]
  if (!token) return null

  return verifyToken(token)
}

/**
 * Set session cookie in response
 * @param {Response} response - HTTP response object (NextResponse)
 * @param {Object} user - User object
 * @returns {Response} Response with cookie set
 */
export function setSession(response, user) {
  const token = createToken(user)
  // Use NextResponse cookies API if available, otherwise fall back to headers
  if (response.cookies) {
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })
  } else {
    response.headers.set(
      'Set-Cookie',
      `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`
    )
  }
  return response
}

/**
 * Clear session cookie
 * @param {Response} response - HTTP response object (NextResponse)
 * @returns {Response} Response with cookie cleared
 */
export function clearSession(response) {
  // Use NextResponse cookies API if available, otherwise fall back to headers
  if (response.cookies) {
    response.cookies.delete(COOKIE_NAME)
  } else {
    response.headers.set(
      'Set-Cookie',
      `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
    )
  }
  return response
}

/**
 * Parse cookies from cookie header string
 * @param {string} cookieHeader - Cookie header string
 * @returns {Object} Cookie object
 */
function parseCookies(cookieHeader) {
  const cookies = {}
  if (!cookieHeader) return cookies

  cookieHeader.split(';').forEach((cookie) => {
    const [name, value] = cookie.trim().split('=')
    if (name && value) {
      cookies[name] = decodeURIComponent(value)
    }
  })

  return cookies
}

/**
 * Require authentication middleware
 * @param {Request} request - HTTP request
 * @returns {Object} Session object
 * @throws {Error} If not authenticated
 */
export function requireAuth(request) {
  const session = getSession(request)
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
