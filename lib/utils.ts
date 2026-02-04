// @ts-nocheck
// Utility functions
import { customAlphabet } from 'nanoid'

// Alphanumeric only (no dashes or underscores)
const alphanumericNanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  10
)

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  message: string | null
}

/**
 * Generate a short, URL-safe alphanumeric ID for sharing
 * @param length - Length of ID (default: 10 for better collision resistance)
 * @returns Shareable ID
 */
export function generateShareId(length: number = 10): string {
  return alphanumericNanoid(length)
}

/**
 * Create a standardized API response
 * @param data - Response data
 * @param status - HTTP status code
 * @param message - Optional message
 * @returns HTTP response
 */
export function jsonResponse<T>(data: T, status: number = 200, message: string | null = null): Response {
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
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @returns HTTP error response
 */
export function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse(null, status, message)
}

/**
 * Handle API route errors
 * @param error - Error object
 * @returns Error response
 */
export function handleApiError(error: Error): Response {
  console.error('API Error:', error)

  if (error.message === 'Unauthorized') {
    return errorResponse('Authentication required', 401)
  }

  if (error.message === 'Beta access required') {
    return errorResponse('Beta access required', 403)
  }

  if (error.message === 'Admin access required') {
    return errorResponse('Admin access required', 403)
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
 * @param request - HTTP request
 * @returns Parsed JSON body
 */
export async function parseBody<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    // Next.js Request already has .json() method
    return await request.json() as T
  } catch {
    throw new Error('Invalid JSON body')
  }
}

/**
 * Validate required fields in an object
 * @param obj - Object to validate
 * @param requiredFields - Array of required field names
 * @throws Error if any required field is missing
 */
export function validateRequired(obj: Record<string, unknown>, requiredFields: string[]): void {
  const missing = requiredFields.filter((field) => !(field in obj))
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
}
