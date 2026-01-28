/**
 * Upstash Redis Client
 *
 * Used for:
 * - State version tracking for fast change detection
 * - Presence/heartbeat tracking for disconnect detection
 *
 * Note: Upstash uses REST-based Redis, so we can't do traditional pub/sub
 * subscriptions. Instead, we poll Redis for version changes which is fast.
 *
 * Supports both Vercel KV env vars (KV_REST_API_*) and direct Upstash vars.
 */
import { Redis } from '@upstash/redis'

// Create Redis client from environment variables
// Supports both Vercel KV (KV_REST_API_*) and Upstash (UPSTASH_REDIS_*) env vars
let redis = null

function getRedis() {
  if (!redis) {
    // Try Vercel KV env vars first, fall back to Upstash vars
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
      console.warn('Redis not configured - real-time features disabled')
      return null
    }
    redis = new Redis({ url, token })
  }
  return redis
}

export default getRedis

// Heartbeat TTL in seconds (player considered DC after this)
export const HEARTBEAT_TTL = 15

// Heartbeat interval for client in ms (should be less than TTL)
export const HEARTBEAT_INTERVAL = 5000

/**
 * Set a player's heartbeat (marks them as online)
 * @param {string} shareId - Draft share ID
 * @param {string} odId - User ID
 */
export async function setHeartbeat(shareId, odId) {
  const r = getRedis()
  if (!r) return

  const key = `presence:${shareId}:${odId}`
  await r.setex(key, HEARTBEAT_TTL, Date.now().toString())
}

/**
 * Get all online player IDs for a draft
 * @param {string} shareId - Draft share ID
 * @returns {Promise<string[]>} Array of online user IDs
 */
export async function getOnlinePlayers(shareId) {
  const r = getRedis()
  if (!r) return []

  const pattern = `presence:${shareId}:*`
  const keys = await r.keys(pattern)

  // Extract odId from keys like "presence:abc123:user456"
  return keys.map(key => key.split(':')[2])
}

/**
 * Store the latest state version for a draft in Redis
 * SSE endpoints poll this for fast change detection
 * @param {string} shareId - Draft share ID
 * @param {number} version - State version number
 */
export async function setStateVersion(shareId, version) {
  const r = getRedis()
  if (!r) return

  const key = `state:${shareId}`
  // Expire after 1 hour (drafts shouldn't take longer)
  await r.setex(key, 3600, version.toString())
}

/**
 * Get the latest state version for a draft from Redis
 * @param {string} shareId - Draft share ID
 * @returns {Promise<number|null>} State version or null if not found
 */
export async function getStateVersion(shareId) {
  const r = getRedis()
  if (!r) return null

  const key = `state:${shareId}`
  const version = await r.get(key)
  return version ? parseInt(version, 10) : null
}

/**
 * Clean up Redis keys for a draft (when draft is deleted)
 * @param {string} shareId - Draft share ID
 */
export async function cleanupDraft(shareId) {
  const r = getRedis()
  if (!r) return

  // Delete state version
  await r.del(`state:${shareId}`)

  // Delete all presence keys
  const presenceKeys = await r.keys(`presence:${shareId}:*`)
  if (presenceKeys.length > 0) {
    await r.del(...presenceKeys)
  }
}
