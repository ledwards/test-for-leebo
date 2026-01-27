// @ts-check
import { test, expect, chromium } from '@playwright/test'
import { createTestUser, cleanupTestUsers, closeDb } from './test-utils.js'

/**
 * 1 human + 7 bots draft E2E test
 * Tests the full draft flow with a single authenticated user and 7 AI bots
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const TEST_ID = `e2e_bots_${Date.now()}`

test.describe.configure({ mode: 'serial' })
test.skip(({ browserName }) => browserName !== 'chromium', 'Test only runs on chromium')
test.setTimeout(600000) // 10 minutes

test.describe('Draft with bots', () => {
  /** @type {import('@playwright/test').Browser} */
  let browser
  /** @type {import('@playwright/test').BrowserContext} */
  let context
  /** @type {import('@playwright/test').Page} */
  let page
  let user
  let shareId = null

  test.beforeAll(async () => {
    console.log(`\n${'='.repeat(50)}`)
    console.log('Starting 1 Human + 7 Bots Draft Test')
    console.log(`Test ID: ${TEST_ID}`)
    console.log(`${'='.repeat(50)}\n`)

    browser = await chromium.launch({
      headless: false,
      slowMo: 50,
    })

    // Create test user
    console.log('Creating test user...')
    user = await createTestUser('HumanPlayer', TEST_ID)

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

  test('complete a draft with 7 bots', async () => {
    // === STEP 1: Create draft ===
    console.log('--- STEP 1: Creating draft ---')
    await page.goto(`${BASE_URL}/draft`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    await page.click('.create-draft-button, button:has-text("Create Draft")')
    await page.waitForSelector('.set-selection', { timeout: 10000 })
    await page.locator('.set-card').first().click()

    await page.waitForFunction(() => {
      const url = window.location.pathname
      return url.startsWith('/draft/') && !url.includes('/draft/new')
    }, { timeout: 20000 })

    shareId = page.url().split('/draft/')[1]?.split('?')[0]
    console.log(`✓ Draft created: ${shareId}`)

    await page.waitForSelector('.draft-lobby', { timeout: 10000 })

    // === STEP 2: Add 7 bots ===
    console.log('\n--- STEP 2: Adding 7 bots ---')

    // Add bots using the API
    const addBotsResponse = await page.evaluate(async (shareId) => {
      try {
        const resp = await fetch(`/api/draft/${shareId}/dev/add-bots?count=7`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const text = await resp.text()
        try {
          return { ok: resp.ok, status: resp.status, data: JSON.parse(text) }
        } catch {
          return { ok: resp.ok, status: resp.status, text }
        }
      } catch (e) {
        return { error: e.message }
      }
    }, shareId)

    if (addBotsResponse.error) {
      console.log(`  ⚠ Error adding bots: ${addBotsResponse.error}`)
    } else if (!addBotsResponse.ok) {
      console.log(`  ⚠ Add bots failed: ${addBotsResponse.status} - ${JSON.stringify(addBotsResponse.data || addBotsResponse.text)}`)
    } else {
      console.log(`✓ Added ${addBotsResponse.data?.bots?.length || 0} bots`)
    }

    // Wait for UI to update and verify player count
    await page.waitForTimeout(2000)
    await page.reload()
    await page.waitForSelector('.draft-lobby', { timeout: 10000 })

    // Check player count
    const playerCountText = await page.locator('.player-count').textContent()
    console.log(`  Player count: ${playerCountText}`)

    // === STEP 3: Start draft ===
    console.log('\n--- STEP 3: Starting draft ---')
    const startButton = page.locator('button:has-text("Start Draft")')
    await expect(startButton).toBeEnabled({ timeout: 10000 })
    await startButton.click()

    await page.waitForSelector('.leader-draft-phase', { timeout: 30000 })
    console.log('✓ Draft started - Leader draft phase')

    // === STEP 4: Leader draft (3 rounds) ===
    console.log('\n--- STEP 4: Leader draft ---')

    for (let round = 1; round <= 3; round++) {
      console.log(`  Round ${round}/3:`)

      // Wait for leaders to be available (with polling)
      let leadersFound = false
      for (let i = 0; i < 60 && !leadersFound; i++) {
        await pollServer()
        const leaderGridExists = await page.locator('.leaders-grid').count() > 0
        const leaderCardCount = await page.locator('.leaders-grid .draftable-card').count()
        leadersFound = leaderCardCount > 0
        if (!leadersFound) {
          if (i % 10 === 0) {
            console.log(`    Waiting for leaders... (grid: ${leaderGridExists}, cards: ${leaderCardCount})`)
          }
          await page.waitForTimeout(500)
        }
      }

      if (!leadersFound) {
        console.log('    ⚠ No leaders found, checking page state...')
        const url = page.url()
        const html = await page.locator('body').innerHTML().catch(() => 'error')
        console.log(`    URL: ${url}`)
        console.log(`    Body preview: ${html.slice(0, 200)}`)
        throw new Error('Leaders not found')
      }

      // Wait for any pending selection to complete (loading state to clear)
      // This prevents race conditions where background polling shows the new round
      // before the previous selectCard API call finishes
      await page.waitForFunction(() => {
        // Check if there's a loading indicator or if cards are disabled
        const disabledCards = document.querySelectorAll('.leaders-grid .draftable-card.disabled')
        return disabledCards.length === 0
      }, { timeout: 10000 }).catch(() => {
        console.log('    (waited for loading state)')
      })

      // Select a leader by clicking
      const leaderCards = page.locator('.leaders-grid .draftable-card:not(.dimmed):not(.disabled)')
      const leaderCount = await leaderCards.count()
      console.log(`    Found ${leaderCount} selectable leaders`)

      if (leaderCount > 0) {
        const firstLeader = leaderCards.first()
        await firstLeader.scrollIntoViewIfNeeded()
        await firstLeader.click()
        console.log(`    Clicked leader`)

        // Wait for selection to register with retry
        let selectedCount = 0
        for (let retry = 0; retry < 10; retry++) {
          await page.waitForTimeout(300)
          selectedCount = await page.locator('.leaders-grid .draftable-card.selected').count()
          if (selectedCount > 0) break
          // If click didn't register, try clicking again (might have been in loading state)
          if (retry < 5) {
            await firstLeader.click()
          }
        }
        console.log(`    Selected count after click: ${selectedCount}`)
      } else {
        console.log(`    ⚠ No selectable leaders found!`)
      }

      // Wait for round to advance
      console.log(`    Waiting for advancement...`)
      if (round < 3) {
        await waitForLeaderRoundOrPackDraft(round + 1)
      } else {
        await waitForPackDraft()
      }

      console.log(`    ✓ Round ${round} complete`)
    }

    console.log('✓ Leader draft complete!')

    // === STEP 5: Pack draft ===
    console.log('\n--- STEP 5: Pack draft ---')

    for (let pack = 1; pack <= 3; pack++) {
      console.log(`  Pack ${pack}/3:`)

      for (let pick = 1; pick <= 14; pick++) {
        process.stdout.write(`    Pick ${pick}/14...`)

        // Wait for cards to be available (with polling to trigger bot processing)
        let cardsFound = false
        for (let i = 0; i < 60 && !cardsFound; i++) {
          await pollServer()
          cardsFound = await page.locator('.pack-grid .draftable-card').count() > 0
          if (!cardsFound) {
            // Check if draft completed
            if (page.url().includes('/pool/')) break
            await page.waitForTimeout(500)
          }
        }

        if (!cardsFound && !page.url().includes('/pool/')) {
          console.log('\n    ⚠ No pack cards found')
          throw new Error('Pack cards not found')
        }

        if (page.url().includes('/pool/')) {
          console.log(' (draft complete)')
          break
        }

        // Wait for any pending selection to complete (loading state to clear)
        await page.waitForFunction(() => {
          const disabledCards = document.querySelectorAll('.pack-grid .draftable-card.disabled')
          return disabledCards.length === 0
        }, { timeout: 10000 }).catch(() => {})

        // Select a card by clicking
        const packCards = page.locator('.pack-grid .draftable-card:not(.dimmed):not(.disabled)')
        const cardCount = await packCards.count()

        if (cardCount > 0) {
          const firstCard = packCards.first()
          await firstCard.scrollIntoViewIfNeeded()
          await firstCard.click()

          // Wait for selection with retry
          for (let retry = 0; retry < 5; retry++) {
            await page.waitForTimeout(300)
            const selected = await page.locator('.pack-grid .draftable-card.selected').count()
            if (selected > 0) break
            await firstCard.click()
          }
        }

        // Wait for pick to advance (bots will auto-pick)
        if (!(pack === 3 && pick === 14)) {
          await waitForPickAdvance(pack, pick)
        }

        console.log(' ✓')
      }

      // Check if draft completed early
      if (page.url().includes('/pool/')) break

      console.log(`  ✓ Pack ${pack} complete!`)
    }

    // === STEP 6: Verify completion ===
    console.log('\n--- STEP 6: Verifying completion ---')

    // Wait for redirect to pool
    let isComplete = false
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000)
      if (page.url().includes('/pool/')) {
        isComplete = true
        break
      }
    }

    expect(isComplete).toBeTruthy()

    console.log('\n' + '='.repeat(50))
    console.log('✅ DRAFT WITH BOTS COMPLETED!')
    console.log('='.repeat(50) + '\n')
  })

  // Helper: Poll the server to trigger state updates and timeouts
  async function pollServer() {
    await page.evaluate(async (shareId) => {
      try {
        await fetch(`/api/draft/${shareId}/state`, { credentials: 'include' })
      } catch {}
    }, shareId)
  }

  // Helper: Wait for specific leader round OR pack draft phase
  async function waitForLeaderRoundOrPackDraft(targetRound) {
    let attempts = 0
    while (attempts < 120) { // 60 seconds
      try {
        // Poll server to trigger timeout checks and bot processing
        await pollServer()

        // Check if transitioned to pack draft
        const inPackDraft = await page.locator('.pack-draft-phase').isVisible().catch(() => false)
        if (inPackDraft) return

        // Check for pool redirect (draft complete)
        if (page.url().includes('/pool/')) return

        // Check leader round
        const roundInfo = await page.locator('.draft-round-info').textContent({ timeout: 500 })
        const match = roundInfo?.match(/Leader Round (\d+)/)
        if (match && parseInt(match[1]) >= targetRound) return
      } catch {}
      await page.waitForTimeout(500)
      attempts++
    }
    console.log(`    ⚠ Timeout waiting for leader round ${targetRound}`)
  }

  // Helper: Wait for pack draft phase
  async function waitForPackDraft() {
    let attempts = 0
    while (attempts < 120) { // 60 seconds
      // Poll server to trigger timeout checks
      await pollServer()

      const isVisible = await page.locator('.pack-draft-phase').isVisible().catch(() => false)
      if (isVisible) return

      // Also check for redirect to pool (draft might have completed)
      if (page.url().includes('/pool/')) return

      await page.waitForTimeout(500)
      attempts++
    }
    console.log(`    ⚠ Timeout waiting for pack draft phase`)
  }

  // Helper: Wait for pack pick to advance past current pick
  async function waitForPickAdvance(currentPack, currentPick) {
    let attempts = 0
    while (attempts < 120) { // 60 seconds
      try {
        // Poll server to trigger timeout checks and bot processing
        await pollServer()

        // Check for completion
        if (page.url().includes('/pool/')) return

        const roundInfo = await page.locator('.draft-round-info').textContent({ timeout: 500 })
        const match = roundInfo?.match(/Round (\d+) - Pick (\d+)/)
        if (match) {
          const pack = parseInt(match[1])
          const pick = parseInt(match[2])
          // Check if we've advanced past current pick
          if (pack > currentPack || (pack === currentPack && pick > currentPick)) return
        }
      } catch {}
      await page.waitForTimeout(500)
      attempts++
    }
    console.log(`\n    ⚠ Timeout waiting to advance past Pack ${currentPack} Pick ${currentPick}`)
  }
})
