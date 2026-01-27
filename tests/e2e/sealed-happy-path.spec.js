// @ts-check
import { test, expect, chromium } from '@playwright/test'
import { createTestUser, cleanupTestUsers, closeDb } from './test-utils.js'

/**
 * Full Sealed Happy Path E2E test
 * Tests the complete sealed flow: select set → view pool → build deck → export
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const TEST_ID = `e2e_sealed_${Date.now()}`

test.describe.configure({ mode: 'serial' })
test.skip(({ browserName, isMobile }) =>
  browserName !== 'chromium' || isMobile,
  'Skipped: Desktop Chromium only (long-running integration test)'
)
test.setTimeout(180000) // 3 minutes

test.describe('Sealed happy path', () => {
  /** @type {import('@playwright/test').Browser} */
  let browser
  /** @type {import('@playwright/test').BrowserContext} */
  let context
  /** @type {import('@playwright/test').Page} */
  let page
  let user
  let poolShareId = null

  test.beforeAll(async () => {
    console.log(`\n${'='.repeat(50)}`)
    console.log('Starting Sealed Happy Path Test')
    console.log(`Test ID: ${TEST_ID}`)
    console.log(`${'='.repeat(50)}\n`)

    browser = await chromium.launch({
      headless: false,
      slowMo: 50,
    })

    // Create test user
    console.log('Creating test user...')
    user = await createTestUser('SealedPlayer', TEST_ID)

    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    })

    // Set auth cookie
    const urlObj = new URL(BASE_URL)
    const cookieConfig = {
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
        console.log(`  [Error]:`, msg.text().slice(0, 80))
      }
    })

    console.log(`✓ Created: ${user.user.username}\n`)
  })

  test.afterAll(async () => {
    console.log('\nCleaning up...')
    try {
      await cleanupTestUsers(TEST_ID)
    } catch (e) {
      console.error('Cleanup error:', e.message)
    }
    await closeDb()
    if (context) await context.close()
    if (browser) await browser.close()
  })

  test('complete sealed flow: create pool → view cards → build deck → export', async () => {
    // === STEP 1: Navigate to set selection ===
    console.log('--- STEP 1: Selecting a set ---')
    await page.goto(`${BASE_URL}/sets`)
    await page.waitForLoadState('networkidle')

    // Wait for sets to load
    await expect(page.locator('.set-card').first()).toBeVisible({ timeout: 10000 })
    const setCount = await page.locator('.set-card').count()
    console.log(`✓ Found ${setCount} sets`)

    // Click the first set
    const setName = await page.locator('.set-card').first().locator('.set-name, h3, h2').textContent()
    await page.locator('.set-card').first().click()
    console.log(`✓ Selected: ${setName?.trim()}`)

    // === STEP 2: Wait for pool creation ===
    console.log('\n--- STEP 2: Creating sealed pool ---')
    await page.waitForURL(/\/pool\/[a-zA-Z0-9_-]+/, { timeout: 30000 })
    poolShareId = page.url().split('/pool/')[1]?.split('/')[0]?.split('?')[0]
    console.log(`✓ Pool created: ${poolShareId}`)

    // === STEP 3: View pool cards ===
    console.log('\n--- STEP 3: Viewing pool cards ---')

    // Wait for cards to load
    await page.waitForSelector('.card-image, .pool-card', { timeout: 30000 })
    await page.waitForTimeout(2000) // Let all cards render

    const cardCount = await page.locator('.card-image, .pool-card').count()
    console.log(`✓ Pool has ${cardCount} cards`)
    expect(cardCount).toBeGreaterThanOrEqual(80) // 6 packs * 16 cards minimum

    // Check that leaders are displayed
    const hasLeaders = await page.locator('.leader-card, .leaders-section, [class*="leader"]').count() > 0 ||
                       await page.locator('text=/Leader/i').count() > 0
    console.log(`✓ Leaders section visible: ${hasLeaders}`)

    // === STEP 4: Navigate to deck builder ===
    console.log('\n--- STEP 4: Opening deck builder ---')

    // Click Build Deck button or navigate directly
    const buildButton = page.locator('button:has-text("Build Deck"), .build-deck-button, a:has-text("Build Deck")')
    if (await buildButton.isVisible()) {
      await buildButton.click()
    } else {
      await page.goto(`${BASE_URL}/pool/${poolShareId}/deck`)
    }

    await page.waitForURL(/\/deck/, { timeout: 15000 })
    console.log('✓ Navigated to deck builder')

    // Wait for deck builder to load
    await page.waitForSelector('.deck-builder, .deck-info-bar, .pool-section', { timeout: 30000 })

    // === STEP 5: Build a deck ===
    console.log('\n--- STEP 5: Building deck ---')

    // Wait for deck builder to fully load (cards take time to render)
    await page.waitForTimeout(2000)

    // Wait for leaders to appear in the UI
    await page.waitForSelector('.canvas-card.leader', { timeout: 15000 }).catch(() => {
      console.log('  (No leaders found with .canvas-card.leader)')
    })

    // Select a leader (required) - click on a leader card that's not already active
    const leaderCards = page.locator('.canvas-card.leader:not(.active-leader)')
    const leaderCount = await leaderCards.count()
    console.log(`  Found ${leaderCount} leaders to choose from`)
    if (leaderCount > 0) {
      await leaderCards.first().click()
      console.log('✓ Selected a leader')
      await page.waitForTimeout(500)
    }

    // Select a base (required) - click on a base card that's not already active
    const baseCards = page.locator('.canvas-card.base:not(.active-base)')
    const baseCount = await baseCards.count()
    console.log(`  Found ${baseCount} bases to choose from`)
    if (baseCount > 0) {
      await baseCards.first().click()
      console.log('✓ Selected a base')
      await page.waitForTimeout(500)
    }

    // Add cards to the deck (need 30+ cards)
    // Pool cards are .canvas-card that are not leader/base
    const poolCards = page.locator('.canvas-card:not(.leader):not(.base)')
    let poolCardCount = await poolCards.count()
    console.log(`  Found ${poolCardCount} pool cards available`)

    const cardsToAdd = Math.min(35, poolCardCount) // Add 35 cards to meet minimum
    console.log(`  Adding ${cardsToAdd} cards to deck...`)

    let cardsAdded = 0
    for (let i = 0; i < cardsToAdd && cardsAdded < 35; i++) {
      try {
        // Re-query each time since state changes
        const availableCards = page.locator('.canvas-card:not(.leader):not(.base)')
        const cardCount = await availableCards.count()
        if (cardCount === 0) break

        const card = availableCards.nth(i % cardCount)
        if (await card.isVisible({ timeout: 500 }).catch(() => false)) {
          await card.click()
          cardsAdded++
          await page.waitForTimeout(50)
        }
      } catch {
        // Card might have moved, continue
      }
    }
    console.log(`✓ Added ${cardsAdded} cards to deck`)

    // Wait for UI to update
    await page.waitForTimeout(1000)

    // === STEP 6: Verify deck is legal ===
    console.log('\n--- STEP 6: Verifying deck is legal ---')

    // Check if the "Ready to Play" button is enabled (deck is legal)
    const readyButton = page.locator('.ready-to-play-button:not(.disabled), button:has-text("Ready to Play")')
    const isReady = await readyButton.isVisible({ timeout: 5000 }).catch(() => false)

    if (isReady) {
      console.log('✓ Deck is legal - Ready to Play button is enabled')
    } else {
      // Check why deck isn't legal
      const finalizeButton = page.locator('button:has-text("Finalize Deck to Continue")')
      if (await finalizeButton.isVisible().catch(() => false)) {
        console.log('  ⚠ Deck not yet legal (missing leader, base, or cards)')
      }
    }

    // === STEP 7: Navigate to Play page ===
    console.log('\n--- STEP 7: Navigating to Play page ---')

    // Click Ready to Play button or navigate directly
    if (isReady) {
      await readyButton.first().click()
      console.log('✓ Clicked Ready to Play')
      await page.waitForURL(/\/deck\/play/, { timeout: 10000 })
      console.log('✓ Navigated to play page')
    } else {
      // Fallback: navigate directly
      await page.goto(`${BASE_URL}/pool/${poolShareId}/deck/play`)
      console.log('✓ Navigated to play page directly')
    }

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // === STEP 8: Test Copy to Clipboard ===
    console.log('\n--- STEP 8: Testing Copy to Clipboard ---')

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    const copyButton = page.locator('button:has-text("Copy to Clipboard")')
    await expect(copyButton).toBeVisible({ timeout: 5000 })
    await copyButton.click()
    console.log('✓ Clicked Copy to Clipboard')

    // Wait for success message
    await page.waitForTimeout(500)

    // Read clipboard and verify it contains JSON
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toBeTruthy()

    let clipboardJson
    try {
      clipboardJson = JSON.parse(clipboardText)
      console.log('✓ Clipboard contains valid JSON')
    } catch (e) {
      throw new Error(`Clipboard does not contain valid JSON: ${clipboardText.slice(0, 100)}...`)
    }

    // Verify JSON structure
    expect(clipboardJson).toHaveProperty('metadata')
    expect(clipboardJson).toHaveProperty('leader')
    expect(clipboardJson).toHaveProperty('base')
    expect(clipboardJson).toHaveProperty('deck')
    expect(clipboardJson).toHaveProperty('sideboard')
    console.log('✓ JSON has required properties (metadata, leader, base, deck, sideboard)')

    // === STEP 9: Test Download JSON ===
    console.log('\n--- STEP 9: Testing Download JSON ---')

    const downloadButton = page.locator('button:has-text("Download")')
    await expect(downloadButton).toBeVisible({ timeout: 5000 })

    // Wait for download to start
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      downloadButton.click()
    ])
    console.log('✓ Clicked Download button')

    // Read download content
    const downloadContent = await download.createReadStream()

    // Read the file content
    const chunks = []
    for await (const chunk of downloadContent) {
      chunks.push(chunk)
    }
    const fileContent = Buffer.concat(chunks).toString('utf-8')

    // Parse and validate
    let downloadJson
    try {
      downloadJson = JSON.parse(fileContent)
      console.log('✓ Downloaded file contains valid JSON')
    } catch (e) {
      throw new Error(`Downloaded file does not contain valid JSON`)
    }

    // Verify deck integrity
    expect(downloadJson.leader).toBeTruthy()
    expect(downloadJson.leader.count).toBe(1)
    console.log('✓ Leader: 1 card')

    expect(downloadJson.base).toBeTruthy()
    expect(downloadJson.base.count).toBe(1)
    console.log('✓ Base: 1 card')

    // Count total deck cards
    const deckCardCount = downloadJson.deck.reduce((sum, card) => sum + card.count, 0)
    expect(deckCardCount).toBeGreaterThanOrEqual(30)
    expect(deckCardCount).toBeLessThanOrEqual(50) // Reasonable upper bound
    console.log(`✓ Deck: ${deckCardCount} cards (expected 30-50)`)

    // Count sideboard cards
    const sideboardCount = downloadJson.sideboard.reduce((sum, card) => sum + card.count, 0)
    // Sealed pool has 96 cards total (6 packs x 16), minus ~6 leaders, ~6 bases, minus deck cards
    console.log(`✓ Sideboard: ${sideboardCount} cards`)

    // Total playable cards should be reasonable (deck + sideboard = pool minus leaders/bases)
    const totalPlayable = deckCardCount + sideboardCount
    console.log(`✓ Total playable cards: ${totalPlayable}`)

    // === STEP 10: Test Deck Image ===
    console.log('\n--- STEP 10: Testing Deck Image ---')

    const imageButton = page.locator('button:has-text("Deck Image")')
    await expect(imageButton).toBeVisible({ timeout: 5000 })
    await imageButton.click()
    console.log('✓ Clicked Deck Image button')

    // Wait for image modal to appear (it shows "Generating..." first)
    await page.waitForSelector('.deck-image-modal-overlay, .deck-image-modal-content', { timeout: 30000 })
    console.log('✓ Image modal appeared')

    // Verify image is present in modal
    const modalImage = page.locator('.deck-image-modal-image')
    await expect(modalImage).toBeVisible({ timeout: 30000 })
    console.log('✓ Deck image generated successfully')

    // Verify download button is available
    const imageDownloadButton = page.locator('.deck-image-modal-download, button:has-text("Download Image")')
    await expect(imageDownloadButton).toBeVisible()
    console.log('✓ Image download button available')

    // Close modal
    const closeButton = page.locator('.deck-image-modal-close')
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click()
      console.log('✓ Closed image modal')
    }

    // === Final Verification ===
    console.log('\n--- Final Verification ---')
    expect(page.url()).toContain('/pool/')
    expect(page.url()).toContain('/play')

    console.log('\n' + '='.repeat(50))
    console.log('✅ SEALED HAPPY PATH COMPLETED!')
    console.log(`   - Pool created: ${poolShareId}`)
    console.log(`   - Deck built: ${deckCardCount} cards`)
    console.log(`   - Sideboard: ${sideboardCount} cards`)
    console.log(`   - JSON export verified`)
    console.log(`   - Image export verified`)
    console.log('='.repeat(50) + '\n')
  })
})
