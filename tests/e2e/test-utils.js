// Test utilities for E2E tests
import jwt from 'jsonwebtoken'
import pg from 'pg'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables from .env (try multiple locations)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '../..')

// Try loading from various env files
dotenv.config({ path: join(projectRoot, '.env.local') })
dotenv.config({ path: join(projectRoot, '.env') })

// Get the JWT secret from environment or use the same fallback as the app
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'change-me-in-production'
const COOKIE_NAME = 'swupod_session'

// Database connection - lazy initialized and safely reusable
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!connectionString) {
  console.error('No DATABASE_URL or POSTGRES_URL found. Check .env or .env.local in:', projectRoot)
}

let pool = null
let poolEnded = false

function getPool() {
  if (poolEnded || !pool) {
    pool = new pg.Pool({ connectionString })
    poolEnded = false
  }
  return pool
}

/**
 * Create a test user directly in the database
 * @param {string} username
 * @param {string} testId - Unique test run ID for cleanup
 * @returns {Promise<{user: Object, token: string, cookieName: string}>}
 */
export async function createTestUser(username, testId) {
  const uniqueId = `test_${testId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  // Insert user into database
  const db = getPool()
  const result = await db.query(
    `INSERT INTO users (discord_id, username, email, avatar_url)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [uniqueId, username, `${uniqueId}@test.local`, null]
  )

  const user = result.rows[0]

  // Create JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar_url: user.avatar_url,
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  )

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    token,
    cookieName: COOKIE_NAME,
  }
}

/**
 * Clean up all test users and their data
 * @param {string} testId - Test run ID to clean up
 */
export async function cleanupTestUsers(testId) {
  const pattern = `test_${testId}_%`
  const db = getPool()

  // Delete in order due to foreign key constraints
  await db.query(
    `DELETE FROM draft_pod_players WHERE user_id IN (SELECT id FROM users WHERE discord_id LIKE $1)`,
    [pattern]
  )

  await db.query(
    `DELETE FROM draft_pods WHERE host_id IN (SELECT id FROM users WHERE discord_id LIKE $1)`,
    [pattern]
  )

  await db.query(
    `DELETE FROM card_pools WHERE user_id IN (SELECT id FROM users WHERE discord_id LIKE $1)`,
    [pattern]
  )

  const result = await db.query(
    'DELETE FROM users WHERE discord_id LIKE $1 RETURNING id',
    [pattern]
  )

  return result.rowCount
}

/**
 * Close database connection (safe to call multiple times)
 */
export async function closeDb() {
  if (pool && !poolEnded) {
    poolEnded = true
    await pool.end()
    pool = null
  }
}
