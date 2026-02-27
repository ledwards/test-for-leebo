// @ts-nocheck
import { test, expect } from '@playwright/test'
import { checkLayoutIssues, waitForNetworkIdle, shouldIgnoreError } from './helpers.ts'

test.describe('Multiplayer Page', () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = []
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
    ;(page as any).errors = errors
  })

  test('should load multiplayer page with correct title', async ({ page }) => {
    await page.goto('/multiplayer')
    await waitForNetworkIdle(page)

    // Check page title and subtitle
    await expect(page.locator('h1')).toContainText('Pod')
    await expect(page.locator('.multiplayer-subtitle')).toContainText('Play live with friends')

    // Check no JS errors
    expect((page as any).errors).toHaveLength(0)
  })

  test('should show Sealed and Draft cards', async ({ page }) => {
    await page.goto('/multiplayer')
    await waitForNetworkIdle(page)

    // Check format cards are visible
    await expect(page.locator('.format-mode-card h3', { hasText: /^Sealed$/ })).toBeVisible()
    await expect(page.locator('.format-mode-card h3', { hasText: /^Draft$/ })).toBeVisible()

    // Should only have 2 format cards (no Chaos Draft)
    const formatCards = page.locator('.multiplayer-modes-grid .format-mode-card')
    await expect(formatCards).toHaveCount(2)
  })

  test('should have no layout issues', async ({ page }) => {
    await page.goto('/multiplayer')
    await waitForNetworkIdle(page)

    const issues = await checkLayoutIssues(page)
    expect(issues).toHaveLength(0)
  })

  test('should navigate to sealed creation', async ({ page }) => {
    await page.goto('/multiplayer')
    await waitForNetworkIdle(page)

    await page.locator('.format-mode-card', { hasText: /^Sealed/ }).click()
    await page.waitForURL('**/sealed/new', { timeout: 10000 })
  })

  test('should navigate to draft page', async ({ page }) => {
    await page.goto('/multiplayer')
    await waitForNetworkIdle(page)

    await page.locator('.format-mode-card', { hasText: /^Draft/ }).click()
    await page.waitForURL('**/draft', { timeout: 10000 })
  })

  test('should navigate back to home', async ({ page }) => {
    await page.goto('/multiplayer')
    await waitForNetworkIdle(page)

    await page.locator('button:has-text("Back")').click()
    await page.waitForURL('/', { timeout: 10000 })
  })
})

test.describe('Multiplayer Page - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should display correctly on mobile', async ({ page }) => {
    await page.goto('/multiplayer')
    await waitForNetworkIdle(page)

    const issues = await checkLayoutIssues(page)
    expect(issues).toHaveLength(0)

    // Cards should be visible
    await expect(page.locator('.format-mode-card h3', { hasText: /^Sealed$/ })).toBeVisible()
    await expect(page.locator('.format-mode-card h3', { hasText: /^Draft$/ })).toBeVisible()
  })
})
