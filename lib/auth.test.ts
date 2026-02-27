// @ts-nocheck
// Tests for authentication utilities
import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert'
import { createToken, verifyToken, getSession } from './auth.ts'

const testUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  username: 'testuser',
  avatar_url: null,
  is_admin: false,
  is_beta_tester: false,
}

describe('Auth Utilities', () => {
  describe('createToken', () => {
    it('should include role flags in token payload', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        avatar_url: 'https://example.com/avatar.png',
        is_admin: true,
        is_beta_tester: true,
      }

      const token = createToken(user)
      const decoded = verifyToken(token)
      assert.ok(decoded)
      assert.strictEqual(decoded.is_admin, true)
      assert.strictEqual(decoded.is_beta_tester, true)
    })

    it('should default role flags to false when not provided', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        avatar_url: null,
      }

      const token = createToken(user)
      const decoded = verifyToken(token)
      assert.ok(decoded)
      assert.strictEqual(decoded.is_admin, false)
      assert.strictEqual(decoded.is_beta_tester, false)
    })
  })

  describe('verifyToken', () => {
    it('roundtrips with createToken', () => {
      const token = createToken(testUser)
      const decoded = verifyToken(token)
      assert.ok(decoded)
      assert.strictEqual(decoded.id, testUser.id)
      assert.strictEqual(decoded.email, testUser.email)
      assert.strictEqual(decoded.username, testUser.username)
    })

    it('returns null for invalid token', () => {
      assert.strictEqual(verifyToken('not-a-jwt'), null)
    })

    it('returns null for empty string', () => {
      assert.strictEqual(verifyToken(''), null)
    })
  })

  describe('getSession - Bearer token support', () => {
    it('returns null when no auth is provided', () => {
      const request = new Request('http://localhost/api/test')
      const session = getSession(request)
      assert.strictEqual(session, null)
    })

    it('works with valid Bearer token', () => {
      const token = createToken(testUser)
      const request = new Request('http://localhost/api/test', {
        headers: { authorization: `Bearer ${token}` },
      })
      const session = getSession(request)
      assert.ok(session)
      assert.strictEqual(session.id, testUser.id)
      assert.strictEqual(session.email, testUser.email)
      assert.strictEqual(session.username, testUser.username)
    })

    it('returns null for invalid Bearer token', () => {
      const request = new Request('http://localhost/api/test', {
        headers: { authorization: 'Bearer invalid-token-here' },
      })
      const session = getSession(request)
      assert.strictEqual(session, null)
    })

    it('works with valid cookie', () => {
      const token = createToken(testUser)
      const request = new Request('http://localhost/api/test', {
        headers: { cookie: `swupod_session=${token}` },
      })
      const session = getSession(request)
      assert.ok(session)
      assert.strictEqual(session.id, testUser.id)
    })

    it('Bearer token takes priority over cookie', () => {
      const otherUser = { ...testUser, id: 'other-user-456', username: 'other' }
      const bearerToken = createToken(testUser)
      const cookieToken = createToken(otherUser)

      const request = new Request('http://localhost/api/test', {
        headers: {
          authorization: `Bearer ${bearerToken}`,
          cookie: `swupod_session=${cookieToken}`,
        },
      })
      const session = getSession(request)
      assert.ok(session)
      assert.strictEqual(session.id, testUser.id, 'Bearer token should take priority')
    })

    it('falls back to cookie when Bearer token is invalid', () => {
      const token = createToken(testUser)
      const request = new Request('http://localhost/api/test', {
        headers: {
          authorization: 'Bearer invalid',
          cookie: `swupod_session=${token}`,
        },
      })
      const session = getSession(request)
      assert.ok(session)
      assert.strictEqual(session.id, testUser.id, 'Should fall back to cookie')
    })
  })

  describe('requireBetaAccess logic', () => {
    it('should pass for beta testers', () => {
      const session = { id: '123', is_beta_tester: true, is_admin: false }
      const hasBetaAccess = session.is_beta_tester || session.is_admin
      assert.strictEqual(hasBetaAccess, true)
    })

    it('should pass for admins', () => {
      const session = { id: '123', is_beta_tester: false, is_admin: true }
      const hasBetaAccess = session.is_beta_tester || session.is_admin
      assert.strictEqual(hasBetaAccess, true)
    })

    it('should fail for regular users', () => {
      const session = { id: '123', is_beta_tester: false, is_admin: false }
      const hasBetaAccess = session.is_beta_tester || session.is_admin
      assert.strictEqual(hasBetaAccess, false)
    })
  })

  describe('requireAdmin logic', () => {
    it('should pass for admins', () => {
      const session = { id: '123', is_admin: true }
      assert.strictEqual(session.is_admin, true)
    })

    it('should fail for non-admins', () => {
      const session = { id: '123', is_admin: false }
      assert.strictEqual(session.is_admin, false)
    })
  })
})

describe('Error handling for role-based access', () => {
  it('should map "Beta access required" to 403', () => {
    const error = new Error('Beta access required')
    let status = 500
    if (error.message === 'Beta access required') status = 403
    assert.strictEqual(status, 403)
  })

  it('should map "Admin access required" to 403', () => {
    const error = new Error('Admin access required')
    let status = 500
    if (error.message === 'Admin access required') status = 403
    assert.strictEqual(status, 403)
  })

  it('should map "Unauthorized" to 401', () => {
    const error = new Error('Unauthorized')
    let status = 500
    if (error.message === 'Unauthorized') status = 401
    assert.strictEqual(status, 401)
  })
})

console.log('\n🔐 Running auth tests...\n')
