import { describe, it, beforeEach, afterEach, mock } from 'node:test'
import assert from 'node:assert'

// Mock fetch for testing
let originalFetch
let mockFetchResponse

function mockFetch(response) {
  mockFetchResponse = response
  global.fetch = mock.fn(async () => mockFetchResponse)
}

describe('httpClient', () => {
  beforeEach(() => {
    originalFetch = global.fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('request basics', () => {
    it('makes GET request with credentials', async () => {
      mockFetch({
        ok: true,
        json: async () => ({ data: { id: 1 } }),
      })

      // Dynamic import to get fresh module with mocked fetch
      const { httpClient } = await import('./httpClient.js')
      const result = await httpClient.get('/test')

      assert.deepStrictEqual(result, { id: 1 })
      assert.strictEqual(global.fetch.mock.calls.length, 1)

      const [url, options] = global.fetch.mock.calls[0].arguments
      assert.strictEqual(url, '/api/test')
      assert.strictEqual(options.method, 'GET')
      assert.strictEqual(options.credentials, 'include')
    })

    it('makes POST request with JSON body', async () => {
      mockFetch({
        ok: true,
        json: async () => ({ data: { success: true } }),
      })

      const { httpClient } = await import('./httpClient.js')
      const result = await httpClient.post('/test', { foo: 'bar' })

      assert.deepStrictEqual(result, { success: true })

      const [, options] = global.fetch.mock.calls[0].arguments
      assert.strictEqual(options.method, 'POST')
      assert.strictEqual(options.headers['Content-Type'], 'application/json')
      assert.strictEqual(options.body, '{"foo":"bar"}')
    })

    it('makes PUT request', async () => {
      mockFetch({
        ok: true,
        json: async () => ({ data: { updated: true } }),
      })

      const { httpClient } = await import('./httpClient.js')
      await httpClient.put('/test/1', { name: 'updated' })

      const [, options] = global.fetch.mock.calls[0].arguments
      assert.strictEqual(options.method, 'PUT')
    })

    it('makes PATCH request', async () => {
      mockFetch({
        ok: true,
        json: async () => ({ data: {} }),
      })

      const { httpClient } = await import('./httpClient.js')
      await httpClient.patch('/test/1', { field: 'value' })

      const [, options] = global.fetch.mock.calls[0].arguments
      assert.strictEqual(options.method, 'PATCH')
    })

    it('makes DELETE request', async () => {
      mockFetch({
        ok: true,
        json: async () => ({ data: { deleted: true } }),
      })

      const { httpClient } = await import('./httpClient.js')
      await httpClient.delete('/test/1')

      const [, options] = global.fetch.mock.calls[0].arguments
      assert.strictEqual(options.method, 'DELETE')
    })
  })

  describe('response handling', () => {
    it('extracts data.data from response by default', async () => {
      mockFetch({
        ok: true,
        json: async () => ({ data: { nested: 'value' }, other: 'ignored' }),
      })

      const { httpClient } = await import('./httpClient.js')
      const result = await httpClient.get('/test')

      assert.deepStrictEqual(result, { nested: 'value' })
    })

    it('returns full response when extractData is false', async () => {
      mockFetch({
        ok: true,
        json: async () => ({ data: { nested: 'value' }, success: true }),
      })

      const { httpClient } = await import('./httpClient.js')
      const result = await httpClient.get('/test', { extractData: false })

      assert.deepStrictEqual(result, { data: { nested: 'value' }, success: true })
    })

    it('returns response as-is when no data property', async () => {
      mockFetch({
        ok: true,
        json: async () => ({ message: 'ok' }),
      })

      const { httpClient } = await import('./httpClient.js')
      const result = await httpClient.get('/test')

      assert.deepStrictEqual(result, { message: 'ok' })
    })
  })

  describe('error handling', () => {
    it('throws HttpError on non-ok response with JSON error', async () => {
      mockFetch({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      })

      const { httpClient, HttpError } = await import('./httpClient.js')

      await assert.rejects(
        () => httpClient.get('/test'),
        (err) => {
          assert(err instanceof HttpError)
          assert.strictEqual(err.message, 'Not found')
          assert.strictEqual(err.status, 404)
          return true
        }
      )
    })

    it('throws HttpError with status text when response is not JSON', async () => {
      mockFetch({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => { throw new Error('Not JSON') },
      })

      const { httpClient, HttpError } = await import('./httpClient.js')

      await assert.rejects(
        () => httpClient.get('/test'),
        (err) => {
          assert(err instanceof HttpError)
          assert.strictEqual(err.message, 'Internal Server Error')
          assert.strictEqual(err.status, 500)
          return true
        }
      )
    })

    it('includes error data in HttpError', async () => {
      mockFetch({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Validation failed', errors: ['field required'] }),
      })

      const { httpClient, HttpError } = await import('./httpClient.js')

      await assert.rejects(
        () => httpClient.post('/test', {}),
        (err) => {
          assert(err instanceof HttpError)
          assert.deepStrictEqual(err.data, { message: 'Validation failed', errors: ['field required'] })
          return true
        }
      )
    })
  })

  describe('URL handling', () => {
    it('prefixes relative URLs with API_BASE', async () => {
      mockFetch({
        ok: true,
        json: async () => ({ data: {} }),
      })

      const { httpClient } = await import('./httpClient.js')
      await httpClient.get('/draft/abc123')

      const [url] = global.fetch.mock.calls[0].arguments
      assert.strictEqual(url, '/api/draft/abc123')
    })

    it('uses absolute URLs as-is', async () => {
      mockFetch({
        ok: true,
        json: async () => ({ data: {} }),
      })

      const { httpClient } = await import('./httpClient.js')
      await httpClient.get('https://external.api/endpoint')

      const [url] = global.fetch.mock.calls[0].arguments
      assert.strictEqual(url, 'https://external.api/endpoint')
    })
  })
})
