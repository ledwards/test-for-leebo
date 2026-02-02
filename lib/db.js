// Database client - supports both Vercel Postgres and standard DATABASE_URL
import pg from 'pg'

const { Pool } = pg

// Create a connection pool
// Railway provides DATABASE_URL, Vercel provides POSTGRES_URL
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!connectionString) {
  console.warn('No database connection string found (DATABASE_URL or POSTGRES_URL)')
}

const pool = connectionString ? new Pool({
  connectionString,
  ssl: connectionString?.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
  max: 20, // Support more concurrent connections for 8-player drafts
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
}) : null

/**
 * Execute a SQL query
 * @param {string} queryText - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
export async function query(queryText, params = []) {
  if (!pool) {
    throw new Error('Database not configured')
  }
  try {
    const result = await pool.query(queryText, params)
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

/**
 * Execute a SQL query and return rows
 * @param {string} queryText - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query rows
 */
export async function queryRows(queryText, params = []) {
  const result = await query(queryText, params)
  return result.rows || []
}

/**
 * Execute a SQL query and return first row
 * @param {string} queryText - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} First row or null
 */
export async function queryRow(queryText, params = []) {
  const rows = await queryRows(queryText, params)
  return rows[0] || null
}

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connected
 */
export async function testConnection() {
  try {
    await query('SELECT 1')
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}
