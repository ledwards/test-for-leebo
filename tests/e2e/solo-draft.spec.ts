// @ts-nocheck
import { test, expect } from '@playwright/test'
import { waitForNetworkIdle, shouldIgnoreError } from './helpers.ts'

test.describe('Solo Draft Page', () => {
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

  test('anonymous user sees set selection (no auth gate)', async ({ page }) => {
    await page.goto('/solo/draft')
    await waitForNetworkIdle(page)

    // Should show set selection, NOT a login prompt
    await expect(page.locator('.set-selection')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.sets-grid')).toBeVisible()

    // Should have set cards
    await expect(page.locator('.set-card').first()).toBeVisible({ timeout: 10000 })

    // Should NOT show "Login Required" text
    await expect(page.locator('text=Login Required')).not.toBeVisible()

    // Check no JS errors
    expect((page as any).errors).toHaveLength(0)
  })

  test('anonymous user clicking a set triggers auth flow', async ({ page }) => {
    await page.goto('/solo/draft')
    await waitForNetworkIdle(page)

    await expect(page.locator('.set-card').first()).toBeVisible({ timeout: 10000 })

    // Click a set — should trigger auth flow (redirect to Discord, then back)
    // The full round-trip: /api/auth/signin/discord → Discord OAuth → callback → /solo/draft
    // We verify the auth flow happened by checking we end up back with auth params
    await page.locator('.set-card').first().click()
    await page.waitForURL(/discord\.com|\/solo\/draft\?auth=/, { timeout: 15000 })
  })
})
