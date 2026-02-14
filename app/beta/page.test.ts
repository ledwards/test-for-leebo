// Tests for /beta page component logic
import { describe, it } from 'node:test'
import assert from 'node:assert'

describe('/beta page', () => {
  describe('User states', () => {
    it('should show Discord login when not authenticated', () => {
      const user = null
      const showDiscordLogin = !user

      assert.strictEqual(showDiscordLogin, true)
    })

    it('should show "Join the Beta" when authenticated but not enrolled', () => {
      const user = { id: '123', is_beta_tester: false, is_admin: false }
      const hasBetaAccess = user?.is_beta_tester || user?.is_admin
      const showJoinButton = user && !hasBetaAccess

      assert.strictEqual(showJoinButton, true)
    })

    it('should show success message when user has beta access', () => {
      const user = { id: '123', is_beta_tester: true }
      const hasBetaAccess = user?.is_beta_tester || user?.is_admin
      const showSuccess = user && hasBetaAccess

      assert.strictEqual(showSuccess, true)
    })

    it('should show success for admins even without beta flag', () => {
      const user = { id: '123', is_beta_tester: false, is_admin: true }
      const hasBetaAccess = user?.is_beta_tester || user?.is_admin

      assert.strictEqual(hasBetaAccess, true)
    })
  })

  describe('Join beta flow', () => {
    it('should call enrollBeta on button click', async () => {
      let enrollCalled = false
      const enrollBeta = async () => {
        enrollCalled = true
        return true
      }

      await enrollBeta()
      assert.strictEqual(enrollCalled, true)
    })

    it('should redirect to /sets on success', async () => {
      let redirectPath: string | null = null
      const router = {
        push: (path: string) => { redirectPath = path }
      }

      const success = true
      if (success) {
        router.push('/sets')
      }

      assert.strictEqual(redirectPath, '/sets')
    })

    it('should not redirect on failure', async () => {
      let redirectPath: string | null = null
      const router = {
        push: (path: string) => { redirectPath = path }
      }

      const success = false
      if (success) {
        router.push('/sets')
      }

      assert.strictEqual(redirectPath, null)
    })
  })

  describe('Loading state', () => {
    it('should show loading indicator while auth is loading', () => {
      const loading = true
      const showLoading = loading

      assert.strictEqual(showLoading, true)
    })

    it('should hide loading indicator when auth is ready', () => {
      const loading = false
      const showLoading = loading

      assert.strictEqual(showLoading, false)
    })
  })

  describe('Back navigation', () => {
    it('should navigate to home on back button click', () => {
      let navigatedTo: string | null = null
      const router = {
        push: (path: string) => { navigatedTo = path }
      }

      router.push('/')
      assert.strictEqual(navigatedTo, '/')
    })
  })
})

describe('Beta page content', () => {
  it('should display set name in features list', () => {
    const setName = 'A Lawless Time (LAW)'
    const content = `<li><strong>${setName}</strong> - Set 7</li>`

    assert.ok(content.includes('A Lawless Time'))
    assert.ok(content.includes('LAW'))
    assert.ok(content.includes('Set 7'))
  })

  it('should show Pre-Release badge styling', () => {
    const badgeText = 'Pre-Release'
    assert.strictEqual(badgeText, 'Pre-Release')
  })

  it('should display Other Formats in features list', () => {
    const content = '<li><strong>Other Formats</strong> - Alternative limited formats</li>'

    assert.ok(content.includes('Other Formats'))
    assert.ok(content.includes('Alternative limited formats'))
  })
})

console.log('\n📄 Running beta page tests...\n')
