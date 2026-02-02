// Utility functions
import { customAlphabet } from 'nanoid'

// Alphanumeric only (no dashes or underscores)
const alphanumericNanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  10
)

/**
 * Generate a short, URL-safe alphanumeric ID for sharing
 * @param {number} length - Length of ID (default: 10 for better collision resistance)
 * @returns {string} Shareable ID
 */
export function generateShareId(length = 10) {
  return alphanumericNanoid(length)
}

/**
 * Create a standardized API response
 * @param {*} data - Response data
 * @param {number} status - HTTP status code
 * @param {string} message - Optional message
 * @returns {Response} HTTP response
 */
export function jsonResponse(data, status = 200, message = null) {
  return new Response(
    JSON.stringify({
      success: status >= 200 && status < 300,
      data,
      message,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

/**
 * Create an error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 400)
 * @returns {Response} HTTP error response
 */
export function errorResponse(message, status = 400) {
  return jsonResponse(null, status, message)
}

/**
 * Handle API route errors
 * @param {Error} error - Error object
 * @returns {Response} Error response
 */
export function handleApiError(error) {
  console.error('API Error:', error)
  
  if (error.message === 'Unauthorized') {
    return errorResponse('Authentication required', 401)
  }
  
  if (error.message.includes('duplicate key')) {
    return errorResponse('Resource already exists', 409)
  }
  
  if (error.message.includes('not found')) {
    return errorResponse('Resource not found', 404)
  }
  
  return errorResponse(error.message || 'Internal server error', 500)
}

/**
 * Parse request body as JSON
 * @param {Request} request - HTTP request
 * @returns {Promise<Object>} Parsed JSON body
 */
export async function parseBody(request) {
  try {
    // Next.js Request already has .json() method
    return await request.json()
  } catch (error) {
    throw new Error('Invalid JSON body')
  }
}

/**
 * Validate required fields in an object
 * @param {Object} obj - Object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @throws {Error} If any required field is missing
 */
export function validateRequired(obj, requiredFields) {
  const missing = requiredFields.filter((field) => !(field in obj))
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
}
