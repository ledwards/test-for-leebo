import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert'
import { applyRateLimit, _store, MAX_REQUESTS } from './rateLimit'

function makeRequest(ip = '1.2.3.4'): Request {
  return new Request('http://localhost/api/test', {
    headers: { 'x-forwarded-for': ip },
  })
}

describe('applyRateLimit', () => {
  beforeEach(() => {
    _store.clear()
  })

  it('allows requests under the limit', () => {
    const req = makeRequest()
    const result = applyRateLimit(req)
    assert.strictEqual(result, null, 'Should allow first request')
  })

  it('blocks after exceeding the limit', () => {
    const req = makeRequest()
    for (let i = 0; i < MAX_REQUESTS; i++) {
      const result = applyRateLimit(req)
      assert.strictEqual(result, null, `Request ${i + 1} should be allowed`)
    }
    // 61st request should be blocked
    const blocked = applyRateLimit(req)
    assert.notStrictEqual(blocked, null, 'Should block after limit')
    assert.strictEqual(blocked!.status, 429)
  })

  it('tracks remaining count correctly', () => {
    const req = makeRequest()
    for (let i = 0; i < MAX_REQUESTS; i++) {
      applyRateLimit(req)
    }
    const blocked = applyRateLimit(req)
    assert.notStrictEqual(blocked, null)
    assert.strictEqual(blocked!.headers.get('X-RateLimit-Remaining'), '0')
  })

  it('sets Retry-After header on 429', () => {
    const req = makeRequest()
    for (let i = 0; i < MAX_REQUESTS; i++) {
      applyRateLimit(req)
    }
    const blocked = applyRateLimit(req)
    assert.notStrictEqual(blocked, null)
    const retryAfter = parseInt(blocked!.headers.get('Retry-After')!, 10)
    assert.ok(retryAfter > 0 && retryAfter <= 60, `Retry-After should be 1-60, got ${retryAfter}`)
  })

  it('tracks different IPs independently', () => {
    const req1 = makeRequest('10.0.0.1')
    const req2 = makeRequest('10.0.0.2')

    for (let i = 0; i < MAX_REQUESTS; i++) {
      applyRateLimit(req1)
    }
    // IP 1 is blocked
    assert.notStrictEqual(applyRateLimit(req1), null)
    // IP 2 is still allowed
    assert.strictEqual(applyRateLimit(req2), null)
  })

  it('resets after window expires', () => {
    const req = makeRequest()
    for (let i = 0; i < MAX_REQUESTS; i++) {
      applyRateLimit(req)
    }
    assert.notStrictEqual(applyRateLimit(req), null, 'Should be blocked')

    // Manually expire the window
    const entry = _store.get('1.2.3.4')!
    entry.resetAt = Date.now() - 1

    // Should be allowed again
    assert.strictEqual(applyRateLimit(req), null, 'Should be allowed after window reset')
  })
})
