// @ts-check
import { test, expect } from '@playwright/test'
import { checkLayoutIssues, waitForNetworkIdle, shouldIgnoreError } from './helpers.js'

test.describe('Draft Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (!shouldIgnoreError(text)) {
          errors.push(text)
        }
      }
    })
    page.on('pageerror', error => {
      if (!shouldIgnoreError(error.message)) {
        errors.push(error.message)
      }
    })
    page.errors = errors
  })

  test('should load draft landing page', async ({ page }) => {
    await page.goto('/draft')
    await waitForNetworkIdle(page)

    // Check page structure
    await expect(page.locator('h1')).toContainText('Draft Mode')

    // Should have create draft button
    await expect(page.locator('.create-draft-button')).toBeVisible()

    // Should have description
    await expect(page.locator('.draft-description')).toBeVisible()

    // Check layout
    const issues = await checkLayoutIssues(page)
    expect(issues).toHaveLength(0)

    // Check no errors
    expect(page.errors).toHaveLength(0)
  })

  test('should show auth required message for unauthenticated users', async ({ page }) => {
    await page.goto('/draft')
    await waitForNetworkIdle(page)

    // Try to click create draft
    await page.locator('.create-draft-button').click()

    // Should show error or redirect to sign in
    // Either an error message appears or we stay on the same page
    await page.waitForTimeout(1000)

    // Should not navigate to /draft/new without auth
    const url = page.url()
    expect(url).not.toContain('/draft/new')
  })

  test('should have correct layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/draft')
    await waitForNetworkIdle(page)

    // Check layout
    const issues = await checkLayoutIssues(page)
    expect(issues).toHaveLength(0)

    // Buttons should be visible
    await expect(page.locator('.create-draft-button')).toBeVisible()
  })
})

test.describe('Draft New Page (Set Selection)', () => {
  test('should redirect unauthenticated users', async ({ page }) => {
    await page.goto('/draft/new')
    await waitForNetworkIdle(page)

    // Should redirect to /draft landing page when not authenticated
    await expect(page).toHaveURL(/\/draft$/, { timeout: 10000 })
  })
})

// Note: Full draft flow tests require authentication
// These tests verify the UI structure without requiring auth
test.describe('Draft UI Structure', () => {
  test('should have proper CSS loaded', async ({ page }) => {
    await page.goto('/draft')
    await waitForNetworkIdle(page)

    // Check that CSS is applied (elements have expected styles)
    const button = page.locator('.create-draft-button')
    await expect(button).toBeVisible()

    // Button should have some background color (not default)
    const bgColor = await button.evaluate(el => getComputedStyle(el).backgroundColor)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)') // Not transparent
  })

  test('should have AuthWidget visible', async ({ page }) => {
    await page.goto('/draft')
    await waitForNetworkIdle(page)

    // Auth widget should be present
    const authWidget = page.locator('.auth-widget, .user-avatar, .login-button')
    await expect(authWidget.first()).toBeVisible({ timeout: 10000 })
  })
})

// Integration test that would run with mock auth
test.describe('Draft Flow with Mock Auth', () => {
  test.skip('should create draft and show lobby', async ({ page, context }) => {
    // This test requires mock authentication setup
    // Skip for now - would need to implement mock auth middleware

    // Set mock auth cookie
    await context.addCookies([{
      name: 'mock_auth',
      value: JSON.stringify({ id: 'test-123', username: 'TestUser' }),
      domain: 'localhost',
      path: '/'
    }])

    await page.goto('/draft/new')
    await waitForNetworkIdle(page)

    // Should show set selection
    await expect(page.locator('.set-selection')).toBeVisible()

    // Select a set
    await page.locator('.set-card').first().click()

    // Should create draft and navigate to lobby
    await page.waitForURL(/\/draft\/[a-zA-Z0-9_-]+/, { timeout: 30000 })

    // Lobby should show
    await expect(page.locator('.draft-lobby, .player-list')).toBeVisible()
  })
})
