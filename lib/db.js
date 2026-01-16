// Database client for Vercel Postgres
import { sql } from '@vercel/postgres'

/**
 * Execute a SQL query
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
export async function query(queryText, params = []) {
  try {
    const result = await sql.query(queryText, params)
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

/**
 * Execute a SQL query and return rows
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query rows
 */
export async function queryRows(queryText, params = []) {
  const result = await query(queryText, params)
  return result.rows || []
}

/**
 * Execute a SQL query and return first row
 * @param {string} query - SQL query string
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
