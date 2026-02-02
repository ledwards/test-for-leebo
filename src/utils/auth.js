// Frontend authentication utilities

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

/**
 * Get current session
 * @returns {Promise<Object|null>} Session object or null
 */
export async function getSession() {
  try {
    const response = await fetch(`${API_BASE}/auth/session`, {
      credentials: 'include',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.data?.user || null
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}

/**
 * Sign in with Discord
 */
export function signInWithDiscord() {
  // Store current URL to return after login
  const returnTo = encodeURIComponent(window.location.pathname + window.location.search)
  window.location.href = `${API_BASE}/auth/signin/discord?return_to=${returnTo}`
}

/**
 * Sign out current user
 * @returns {Promise<boolean>} Success status
 */
export async function signOut() {
  try {
    const response = await fetch(`${API_BASE}/auth/signout`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      return false
    }

    // Reload page to clear client-side state
    window.location.reload()
    return true
  } catch (error) {
    console.error('Failed to sign out:', error)
    return false
  }
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if authenticated
 */
export async function isAuthenticated() {
  const session = await getSession()
  return session !== null
}

/**
 * Refresh session with latest user data from database
 * Updates the session cookie with fresh data (role flags, etc.)
 * @returns {Promise<Object|null>} Updated user object or null on failure
 */
export async function refreshSession() {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.data?.user || null
  } catch (error) {
    console.error('Failed to refresh session:', error)
    return null
  }
}

/**
 * Enroll current user as beta tester
 * Returns the updated user object (session cookie is also updated)
 * @returns {Promise<Object|null>} Updated user object or null on failure
 */
export async function enrollBeta() {
  try {
    const response = await fetch(`${API_BASE}/beta/enroll`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.data?.user || null
  } catch (error) {
    console.error('Failed to enroll in beta:', error)
    return null
  }
}
