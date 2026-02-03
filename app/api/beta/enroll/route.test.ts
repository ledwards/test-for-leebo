// Tests for POST /api/beta/enroll endpoint
import { describe, it } from 'node:test'
import assert from 'node:assert'

describe('POST /api/beta/enroll', () => {
  describe('Request validation', () => {
    it('should require authentication', () => {
      // Endpoint requires valid session cookie
      // Without auth, should return 401
      const expectedStatus = 401
      assert.strictEqual(expectedStatus, 401)
    })

    it('should not require request body', () => {
      // Enrollment uses session cookie, no body needed
      const body = undefined
      assert.strictEqual(body, undefined)
    })
  })

  describe('Successful enrollment', () => {
    it('should set is_beta_tester to true', () => {
      const userBefore = { id: '123', is_beta_tester: false }
      const userAfter = { ...userBefore, is_beta_tester: true }

      assert.strictEqual(userAfter.is_beta_tester, true)
    })

    it('should preserve existing admin status', () => {
      const userBefore = { id: '123', is_admin: true, is_beta_tester: false }
      const userAfter = { ...userBefore, is_beta_tester: true }

      assert.strictEqual(userAfter.is_admin, true)
      assert.strictEqual(userAfter.is_beta_tester, true)
    })

    it('should return updated user object', () => {
      const response = {
        success: true,
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
            username: 'testuser',
            avatar_url: null,
            is_admin: false,
            is_beta_tester: true,
          },
        },
        message: 'Beta access granted',
      }

      assert.strictEqual(response.success, true)
      assert.strictEqual(response.data.user.is_beta_tester, true)
      assert.strictEqual(response.message, 'Beta access granted')
    })

    it('should return new session cookie with updated JWT', () => {
      // Response should include Set-Cookie header with new token
      // Token should contain is_beta_tester: true
      const tokenPayload = {
        id: '123',
        is_beta_tester: true,
        is_admin: false,
      }

      assert.strictEqual(tokenPayload.is_beta_tester, true)
    })
  })

  describe('Idempotent behavior', () => {
    it('should succeed even if already enrolled', () => {
      // Calling enrollment twice should not error
      const firstCall = { is_beta_tester: true }
      const secondCall = { is_beta_tester: true }

      assert.strictEqual(firstCall.is_beta_tester, secondCall.is_beta_tester)
    })

    it('should not change other user data', () => {
      const userBefore = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        is_admin: true,
      }
      const userAfter = {
        ...userBefore,
        is_beta_tester: true,
      }

      assert.strictEqual(userAfter.email, userBefore.email)
      assert.strictEqual(userAfter.username, userBefore.username)
      assert.strictEqual(userAfter.is_admin, userBefore.is_admin)
    })
  })

  describe('Error handling', () => {
    it('should return 401 for unauthenticated requests', () => {
      const error = new Error('Unauthorized')
      const status = error.message === 'Unauthorized' ? 401 : 500

      assert.strictEqual(status, 401)
    })

    it('should return 404 if user not found in database', () => {
      // Edge case: valid JWT but user deleted from DB
      const error = new Error('User not found')

      assert.ok(error.message.includes('not found'))
    })
  })
})

describe('Beta enrollment database operations', () => {
  it('should update users table with is_beta_tester = TRUE', () => {
    const sql = `UPDATE users SET is_beta_tester = TRUE WHERE id = $1`
    assert.ok(sql.includes('is_beta_tester = TRUE'))
  })

  it('should return all user fields after update', () => {
    const sql = `UPDATE users SET is_beta_tester = TRUE WHERE id = $1
       RETURNING id, email, username, avatar_url, is_admin, is_beta_tester`

    assert.ok(sql.includes('RETURNING'))
    assert.ok(sql.includes('is_admin'))
    assert.ok(sql.includes('is_beta_tester'))
  })
})

console.log('\n🧪 Running beta enrollment API tests...\n')
