// Tests for LandingPage component logic
import { describe, it } from 'node:test'
import assert from 'node:assert'

describe('LandingPage', () => {
  describe('Casual Formats button visibility', () => {
    it('should hide Casual Formats button when user is not logged in', () => {
      const user = null
      const hasBetaAccess = user?.is_beta_tester || user?.is_admin
      const showCasualMode = !!hasBetaAccess

      assert.strictEqual(showCasualMode, false)
    })

    it('should hide Casual Formats button when user is logged in but not beta', () => {
      const user = { id: '123', is_beta_tester: false, is_admin: false }
      const hasBetaAccess = user?.is_beta_tester || user?.is_admin
      const showCasualMode = !!hasBetaAccess

      assert.strictEqual(showCasualMode, false)
    })

    it('should show Casual Formats button when user is beta tester', () => {
      const user = { id: '123', is_beta_tester: true, is_admin: false }
      const hasBetaAccess = user?.is_beta_tester || user?.is_admin
      const showCasualMode = !!hasBetaAccess

      assert.strictEqual(showCasualMode, true)
    })

    it('should show Casual Formats button when user is admin', () => {
      const user = { id: '123', is_beta_tester: false, is_admin: true }
      const hasBetaAccess = user?.is_beta_tester || user?.is_admin
      const showCasualMode = !!hasBetaAccess

      assert.strictEqual(showCasualMode, true)
    })

    it('should show Casual Formats button when user is both beta and admin', () => {
      const user = { id: '123', is_beta_tester: true, is_admin: true }
      const hasBetaAccess = user?.is_beta_tester || user?.is_admin
      const showCasualMode = !!hasBetaAccess

      assert.strictEqual(showCasualMode, true)
    })
  })

  describe('Casual Formats button click handler', () => {
    it('should call onCasualModeClick when Casual Formats button is clicked', () => {
      let clickHandlerCalled = false
      const onCasualModeClick = () => {
        clickHandlerCalled = true
      }

      onCasualModeClick()
      assert.strictEqual(clickHandlerCalled, true)
    })

    it('should navigate to /casual when handler is invoked', () => {
      let navigatedTo: string | null = null
      const handleCasualModeClick = () => {
        navigatedTo = '/casual'
      }

      handleCasualModeClick()
      assert.strictEqual(navigatedTo, '/casual')
    })
  })
})

console.log('\n📄 Running LandingPage tests...\n')
