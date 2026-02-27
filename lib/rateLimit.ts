/**
 * In-memory rate limiter
 * 60 requests per minute per IP address
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 60

const store = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
// .unref() allows the process to exit even if this timer is active
const cleanupInterval = setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)
if (typeof cleanupInterval?.unref === 'function') {
  cleanupInterval.unref()
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return 'unknown'
}

/**
 * Apply rate limiting to a request.
 * Returns a 429 Response if rate limited, or null if the request is allowed.
 */
export function applyRateLimit(request: Request): Response | null {
  const ip = getClientIp(request)
  const now = Date.now()

  let entry = store.get(ip)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS }
    store.set(ip, entry)
  }

  entry.count++

  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  return null
}

// Export for testing
export { store as _store, WINDOW_MS, MAX_REQUESTS }
