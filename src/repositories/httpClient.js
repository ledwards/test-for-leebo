/**
 * HTTP Client
 *
 * Standardized HTTP client for API calls with consistent error handling.
 * Replaces the repeated fetch pattern across draftApi.js, poolApi.js, etc.
 *
 * All methods:
 * - Include credentials (cookies) by default
 * - Parse JSON responses
 * - Extract data.data from response (API convention)
 * - Throw errors with server message on non-ok responses
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

/**
 * HTTP error with status code and server message
 */
export class HttpError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.data = data
  }
}

/**
 * Make an HTTP request with standardized error handling
 *
 * @param {string} url - URL path (will be prefixed with API_BASE)
 * @param {Object} options - Fetch options
 * @param {string} options.method - HTTP method (default: GET)
 * @param {Object} options.body - Request body (will be JSON stringified)
 * @param {Object} options.headers - Additional headers
 * @param {boolean} options.extractData - Extract data.data from response (default: true)
 * @returns {Promise<*>} Response data
 * @throws {HttpError} On non-ok response
 */
async function request(url, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    extractData = true,
    ...rest
  } = options

  const fetchOptions = {
    method,
    credentials: 'include',
    headers: {
      ...headers,
    },
    ...rest,
  }

  // Add JSON content-type and body for POST/PUT/PATCH
  if (body !== undefined) {
    fetchOptions.headers['Content-Type'] = 'application/json'
    fetchOptions.body = JSON.stringify(body)
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`

  const response = await fetch(fullUrl, fetchOptions)

  // Handle non-ok responses
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`
    let errorData = null

    try {
      errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      // Response wasn't JSON, use status text
      errorMessage = response.statusText || errorMessage
    }

    throw new HttpError(errorMessage, response.status, errorData)
  }

  // Parse JSON response
  const data = await response.json()

  // Extract nested data if API uses { data: ... } convention
  if (extractData && data && typeof data === 'object' && 'data' in data) {
    return data.data
  }

  return data
}

/**
 * HTTP Client with convenience methods
 */
export const httpClient = {
  /**
   * GET request
   * @param {string} url - URL path
   * @param {Object} options - Additional options
   * @returns {Promise<*>} Response data
   */
  get: (url, options = {}) => request(url, { ...options, method: 'GET' }),

  /**
   * POST request
   * @param {string} url - URL path
   * @param {Object} body - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<*>} Response data
   */
  post: (url, body, options = {}) => request(url, { ...options, method: 'POST', body }),

  /**
   * PUT request
   * @param {string} url - URL path
   * @param {Object} body - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<*>} Response data
   */
  put: (url, body, options = {}) => request(url, { ...options, method: 'PUT', body }),

  /**
   * PATCH request
   * @param {string} url - URL path
   * @param {Object} body - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<*>} Response data
   */
  patch: (url, body, options = {}) => request(url, { ...options, method: 'PATCH', body }),

  /**
   * DELETE request
   * @param {string} url - URL path
   * @param {Object} options - Additional options
   * @returns {Promise<*>} Response data
   */
  delete: (url, options = {}) => request(url, { ...options, method: 'DELETE' }),

  /**
   * Raw request with full control
   * @param {string} url - URL path
   * @param {Object} options - Fetch options
   * @returns {Promise<*>} Response data
   */
  request,
}

export default httpClient
