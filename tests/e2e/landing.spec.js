// @ts-check
import { test, expect } from '@playwright/test'
import { checkLayoutIssues, waitForNetworkIdle, shouldIgnoreError } from './helpers.js'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    // Collect console errors throughout the test
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

    // Store errors for later assertion
    page.errors = errors
  })

  test('should load landing page successfully', async ({ page }) => {
    await page.goto('/')

    // Wait for page to be fully loaded
    await waitForNetworkIdle(page)

    // Check logo is visible
    await expect(page.locator('.landing-logo')).toBeVisible()

    // Check mode selection buttons are visible
    await expect(page.locator('.sealed-button')).toBeVisible()
    await expect(page.locator('.draft-button')).toBeVisible()

    // Check for subtitle text
    await expect(page.locator('.subtitle')).toContainText('Star Wars Unlimited')

    // Check no JS errors
    expect(page.errors).toHaveLength(0)
  })

  test('should have no layout issues', async ({ page }) => {
    await page.goto('/')
    await waitForNetworkIdle(page)

    const issues = await checkLayoutIssues(page)
    expect(issues).toHaveLength(0)
  })

  test('should navigate to sealed set selection', async ({ page }) => {
    await page.goto('/')
    await waitForNetworkIdle(page)

    // Click sealed button
    await page.locator('.sealed-button').click()

    // Should navigate to sets page
    await expect(page).toHaveURL('/sets')

    // Wait for sets to load
    await expect(page.locator('.set-selection')).toBeVisible()
    await expect(page.locator('.sets-grid')).toBeVisible()

    // Should have set cards
    await expect(page.locator('.set-card').first()).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to draft page', async ({ page }) => {
    await page.goto('/')
    await waitForNetworkIdle(page)

    // Click draft button
    await page.locator('.draft-button').click()

    // Should navigate to draft page
    await expect(page).toHaveURL('/draft')

    // Check draft page elements
    await expect(page.locator('h1')).toContainText('Draft Mode')
    await expect(page.locator('.create-draft-button')).toBeVisible()
  })

  test('should show login button when not authenticated', async ({ page }) => {
    await page.goto('/')
    await waitForNetworkIdle(page)

    // Should show Discord login button
    await expect(page.locator('.landing-login-button')).toBeVisible()
    await expect(page.locator('.landing-login-button')).toContainText('Login with Discord')
  })

  test('should display disclaimer', async ({ page }) => {
    await page.goto('/')
    await waitForNetworkIdle(page)

    // Check disclaimer is present (may be in footer or at bottom of page)
    const disclaimer = page.locator('.landing-disclaimer').or(page.locator('.disclaimer')).or(page.getByText(/not affiliated/i))
    await expect(disclaimer.first()).toBeVisible()
  })
})

test.describe('Landing Page - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should display correctly on mobile', async ({ page }) => {
    await page.goto('/')
    await waitForNetworkIdle(page)

    // Check layout issues specific to mobile
    const issues = await checkLayoutIssues(page)
    expect(issues).toHaveLength(0)

    // Buttons should still be visible and clickable
    await expect(page.locator('.sealed-button')).toBeVisible()
    await expect(page.locator('.draft-button')).toBeVisible()

    // Logo should be visible
    await expect(page.locator('.landing-logo')).toBeVisible()
  })
})
