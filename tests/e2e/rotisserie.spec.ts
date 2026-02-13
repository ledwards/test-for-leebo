// @ts-nocheck
import { test, expect, chromium, Browser, BrowserContext, Page } from '@playwright/test'
import { createTestUser, cleanupTestUsers, closeDb } from './test-utils.ts'

/**
 * Rotisserie Draft E2E test
 * Tests: navigate to rotisserie → select sets → create draft → lobby UI → add bot → start draft → pick a card
 *
 * Run: npx playwright test tests/e2e/rotisserie.spec.ts --workers=1
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const TEST_ID = `e2e_rotisserie_${Date.now()}`

test.describe.configure({ mode: 'serial' })
test.skip(({ browserName, isMobile }) =>
  browserName !== 'chromium' || isMobile,
  'Skipped: Desktop Chromium only'
)
test.setTimeout(120000) // 2 minutes

test.describe('Rotisserie Draft', () => {
  let browser: Browser
  let context: BrowserContext
  let page: Page
  let user: any
  let draftShareId: string

  test.beforeAll(async () => {
    browser = await chromium.launch({ headless: false, slowMo: 50 })

    user = await createTestUser('RotisseriePlayer', TEST_ID, { isBetaTester: true })

    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    })

    const urlObj = new URL(BASE_URL)
    const cookieConfig: any = {
      name: user.cookieName,
      value: user.token,
      httpOnly: true,
      sameSite: 'Lax',
    }
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      cookieConfig.url = BASE_URL
    } else {
      cookieConfig.domain = urlObj.hostname
      cookieConfig.path = '/'
    }
    await context.addCookies([cookieConfig])

    page = await context.newPage()
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`  [Error]:`, msg.text().slice(0, 300))
      }
    })

    console.log(`✓ Created beta test user: ${user.user.username}`)
  })

  test.afterAll(async () => {
    try { await cleanupTestUsers(TEST_ID) } catch (e: any) { console.error('Cleanup error:', e.message) }
    await closeDb()
    if (context) await context.close()
    if (browser) await browser.close()
  })

  test('setup page loads and shows set selection grid', async () => {
    await page.goto(`${BASE_URL}/casual/rotisserie`)
    await page.waitForLoadState('networkidle')

    // Page title and subtitle visible
    await expect(page.locator('h1')).toHaveText('Rotisserie Draft')
    await expect(page.locator('.rotisserie-subtitle')).toBeVisible()

    // Set cards appear
    await expect(page.locator('.set-card').first()).toBeVisible({ timeout: 10000 })
    const setCount = await page.locator('.set-card').count()
    expect(setCount).toBeGreaterThanOrEqual(6) // At least 6 released sets
    console.log(`✓ Found ${setCount} sets`)

    // All non-beta sets should be selected by default
    const selectedSets = page.locator('.set-card.selected')
    const selectedCount = await selectedSets.count()
    expect(selectedCount).toBeGreaterThanOrEqual(6)
    console.log(`✓ ${selectedCount} sets selected by default`)

    // Create button should be enabled
    const createButton = page.locator('button:has-text("Create Rotisserie Draft")')
    await expect(createButton).toBeEnabled()
    console.log('✓ Create button enabled with default selection')
  })

  test('can toggle set selection', async () => {
    // Click first set to deselect it
    const setCards = page.locator('.set-card')
    await setCards.first().click()
    await page.waitForTimeout(200)

    // Should now be unselected
    await expect(setCards.first()).toHaveClass(/unselected/)
    console.log('✓ Deselected first set')

    // Click again to reselect
    await setCards.first().click()
    await page.waitForTimeout(200)
    await expect(setCards.first()).toHaveClass(/selected/)
    console.log('✓ Reselected first set')
  })

  test('create rotisserie draft and navigate to lobby', async () => {
    const createButton = page.locator('button:has-text("Create Rotisserie Draft")')
    await expect(createButton).toBeEnabled()
    await createButton.click()

    // Should show "Creating..." state
    await expect(page.locator('button:has-text("Creating...")')).toBeVisible({ timeout: 5000 })

    // Should navigate to /casual/rotisserie/<shareId>
    await page.waitForURL(/\/casual\/rotisserie\/[a-zA-Z0-9_-]+/, { timeout: 30000 })
    const url = page.url()
    expect(url).toContain('/casual/rotisserie/')

    // Extract shareId for later tests
    draftShareId = url.split('/casual/rotisserie/')[1]
    console.log(`✓ Navigated to rotisserie lobby: ${url}`)
  })

  test('lobby shows waiting state with host controls', async () => {
    // Wait for lobby to load
    await page.waitForLoadState('networkidle')

    // Should show "Rotisserie Draft" header
    await expect(page.locator('h1')).toHaveText('Rotisserie Draft')

    // Should show waiting status badge
    await expect(page.locator('.status-badge.waiting')).toBeVisible({ timeout: 10000 })
    console.log('✓ Status badge shows "waiting"')

    // Should show players section with host
    const playersSection = page.locator('.players-section')
    await expect(playersSection).toBeVisible()
    await expect(playersSection.locator('h3')).toContainText('Players (1/')
    console.log('✓ Players section shows 1 player')

    // Host should be listed with "(You)"
    await expect(page.locator('.player-item:has-text("(You)")')).toBeVisible()
    console.log('✓ Host player shown with (You) marker')

    // Share link section should be visible
    await expect(page.locator('.share-section')).toBeVisible()
    await expect(page.locator('button:has-text("Copy Link")')).toBeVisible()
    console.log('✓ Share link section visible')

    // Add Bot button should be visible (host control)
    await expect(page.locator('button:has-text("+ Add Bot")')).toBeVisible()
    console.log('✓ Add Bot button visible')

    // Start Draft button should be disabled (need 2+ players)
    const startButton = page.locator('button:has-text("Start Draft")')
    await expect(startButton).not.toBeVisible() // Shows "Need at least 2 players" text instead
    await expect(page.locator('.waiting-text')).toContainText('Need at least 2 players')
    console.log('✓ Start button hidden until 2+ players')
  })

  test('can add a bot player', async () => {
    const addBotButton = page.locator('button:has-text("+ Add Bot")')
    await addBotButton.click()
    await page.waitForTimeout(500)

    // Players section should now show 2 players
    await expect(page.locator('.players-section h3')).toContainText('Players (2/')
    console.log('✓ Bot added, now 2 players')

    // Bot should appear in player list
    await expect(page.locator('.player-item:has-text("Bot")')).toBeVisible()
    console.log('✓ Bot visible in player list')

    // Start Draft button should now be visible
    await expect(page.locator('button:has-text("Start Draft")')).toBeVisible()
    console.log('✓ Start Draft button now visible')
  })

  test('can start the draft', async () => {
    const startButton = page.locator('button:has-text("Start Draft")')
    await expect(startButton).toBeEnabled()
    await startButton.click()
    await page.waitForTimeout(1000)

    // Status should change to active
    await expect(page.locator('.status-badge.active')).toBeVisible({ timeout: 10000 })
    console.log('✓ Draft started, status is "active"')

    // Should show turn indicator
    await expect(page.locator('.turn-indicator')).toBeVisible()
    console.log('✓ Turn indicator visible')

    // Should show card pool
    await expect(page.locator('.card-pool')).toBeVisible()
    console.log('✓ Card pool visible')

    // Should have cards to pick from
    const poolCards = page.locator('.pool-card')
    const cardCount = await poolCards.count()
    expect(cardCount).toBeGreaterThan(0)
    console.log(`✓ ${cardCount} cards in pool`)
  })

  test('can pick a card when it is your turn', async () => {
    // Check if it's our turn
    const turnIndicator = page.locator('.turn-indicator')
    const turnText = await turnIndicator.textContent()

    if (turnText?.includes("your turn")) {
      // It's our turn - pick a card
      const pickableCard = page.locator('.pool-card.pickable').first()
      await pickableCard.click()
      await page.waitForTimeout(1000)

      // Should see our pick in the sidebar
      await expect(page.locator('.my-picks-section')).toBeVisible()
      await expect(page.locator('.my-picks-section h3')).toContainText('My Picks (1)')
      console.log('✓ Picked a card successfully')
    } else {
      // Bot goes first - wait for it (bots don't auto-pick, so just verify state)
      console.log('✓ Bot has first pick (expected behavior)')
    }
  })

  test('cancel button from lobby navigates back', async () => {
    // Go back to setup page
    await page.goto(`${BASE_URL}/casual/rotisserie`)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.set-card').first()).toBeVisible({ timeout: 10000 })

    const cancelButton = page.locator('button:has-text("Cancel")')
    await cancelButton.click()

    await page.waitForURL(/\/casual$/, { timeout: 10000 })
    console.log('✓ Cancel navigated to /casual')
  })
})
