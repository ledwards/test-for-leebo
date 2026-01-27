// @ts-check
import { test, expect, chromium } from '@playwright/test'
import { createTestUser, cleanupTestUsers, closeDb } from './test-utils.js'

/**
 * 2-player draft E2E test - simpler version for faster iteration
 */

const NUM_PLAYERS = 2
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const TEST_ID = `e2e_2p_${Date.now()}`

test.describe.configure({ mode: 'serial' })
test.skip(({ browserName }) => browserName !== 'chromium', 'Test only runs on chromium')
test.setTimeout(300000) // 5 minutes

test.describe('2-player draft', () => {
  /** @type {import('@playwright/test').Browser} */
  let browser
  /** @type {import('@playwright/test').BrowserContext[]} */
  let contexts = []
  /** @type {import('@playwright/test').Page[]} */
  let pages = []
  let users = []
  let shareId = null

  test.beforeAll(async () => {
    console.log(`\n${'='.repeat(50)}`)
    console.log('Starting 2-Player Draft E2E Test')
    console.log(`Test ID: ${TEST_ID}`)
    console.log(`${'='.repeat(50)}\n`)

    browser = await chromium.launch({
      headless: false,
      slowMo: 50,
    })

    // Create 2 test users
    for (let i = 0; i < NUM_PLAYERS; i++) {
      console.log(`Creating test user ${i + 1}/${NUM_PLAYERS}...`)
      const userData = await createTestUser(`Player${i + 1}`, TEST_ID)
      users.push(userData)

      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
      })
      contexts.push(context)

      // Set auth cookie
      const urlObj = new URL(BASE_URL)
      const cookieConfig = {
        name: userData.cookieName,
        value: userData.token,
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

      const page = await context.newPage()
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`  [P${i + 1} Error]:`, msg.text().slice(0, 80))
        }
      })
      pages.push(page)
      console.log(`  ✓ Created: ${userData.user.username}`)
    }

    console.log(`\n✓ ${NUM_PLAYERS} test users ready\n`)
  })

  test.afterAll(async () => {
    console.log('\nCleaning up...')
    try {
      await cleanupTestUsers(TEST_ID)
    } catch (e) {
      console.error('Cleanup error:', e.message)
    }
    await closeDb()
    for (const context of contexts) {
      await context.close()
    }
    if (browser) {
      await browser.close()
    }
  })

  test('complete a 2-player draft', async () => {
    // === STEP 1: Player 1 creates draft ===
    console.log('--- STEP 1: Creating draft ---')
    await pages[0].goto(`${BASE_URL}/draft`)
    await pages[0].waitForLoadState('networkidle')
    await pages[0].waitForTimeout(2000)

    await pages[0].click('.create-draft-button, button:has-text("Create Draft")')
    await pages[0].waitForSelector('.set-selection', { timeout: 10000 })
    await pages[0].locator('.set-card').first().click()

    await pages[0].waitForFunction(() => {
      const url = window.location.pathname
      return url.startsWith('/draft/') && !url.includes('/draft/new')
    }, { timeout: 20000 })

    shareId = pages[0].url().split('/draft/')[1]?.split('?')[0]
    console.log(`✓ Draft created: ${shareId}`)

    await pages[0].waitForSelector('.draft-lobby', { timeout: 10000 })

    // === STEP 2: Player 2 joins ===
    console.log('\n--- STEP 2: Player 2 joining ---')
    await pages[1].goto(`${BASE_URL}/draft/${shareId}`)
    await pages[1].waitForSelector('.draft-lobby', { timeout: 10000 })
    console.log('✓ Player 2 joined')

    await pages[0].waitForTimeout(1000)

    // === STEP 3: Start draft ===
    console.log('\n--- STEP 3: Starting draft ---')
    const startButton = pages[0].locator('button:has-text("Start Draft")')
    await expect(startButton).toBeEnabled({ timeout: 10000 })
    await startButton.click()

    await pages[0].waitForSelector('.leader-draft-phase', { timeout: 20000 })
    console.log('✓ Draft started - Leader draft phase')

    // === STEP 4: Leader draft (3 rounds) ===
    console.log('\n--- STEP 4: Leader draft ---')

    for (let round = 1; round <= 3; round++) {
      console.log(`  Round ${round}/3:`)

      // Wait for both players to have cards to pick
      await waitForBothPlayersReady('.leaders-grid .draftable-card')

      // Both players select a leader
      await selectCardForAllPlayers('.leaders-grid')

      // Wait for round to advance
      if (round < 3) {
        await waitForRoundAdvance('leader', round)
      } else {
        // After round 3, wait for pack draft
        await waitForPackDraftPhase()
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

        // Wait for both players to have cards
        await waitForBothPlayersReady('.pack-grid .draftable-card')

        // Both players select a card
        await selectCardForAllPlayers('.pack-grid')

        // Wait for pick to advance (unless last pick of last pack)
        if (!(pack === 3 && pick === 14)) {
          await waitForPickAdvance(pack, pick)
        }

        console.log(' ✓')
      }

      console.log(`  ✓ Pack ${pack} complete!`)
    }

    // === STEP 6: Verify completion ===
    console.log('\n--- STEP 6: Verifying completion ---')

    // Wait for redirect to pool or completion state
    await pages[0].waitForTimeout(3000)

    const p1Complete = pages[0].url().includes('/pool/') ||
      await pages[0].locator('.draft-complete, .deck-builder').isVisible().catch(() => false)

    expect(p1Complete).toBeTruthy()

    console.log('\n' + '='.repeat(50))
    console.log('✅ 2-PLAYER DRAFT COMPLETED!')
    console.log('='.repeat(50) + '\n')
  })

  // Helper: Wait for both players to have selectable cards
  async function waitForBothPlayersReady(selector) {
    let attempts = 0
    while (attempts < 30) {
      const counts = await Promise.all(
        pages.map(page => page.locator(selector).count().catch(() => 0))
      )
      if (counts.every(c => c > 0)) return
      await pages[0].waitForTimeout(500)
      attempts++
    }
    throw new Error(`Timeout waiting for cards: ${selector}`)
  }

  // Helper: Have all players select a card
  async function selectCardForAllPlayers(gridSelector) {
    await Promise.all(pages.map(async (page, idx) => {
      try {
        // Check if already selected
        const hasSelected = await page.locator(`${gridSelector} .draftable-card.selected`).count() > 0
        if (hasSelected) return

        // Find available cards (not selected, not dimmed)
        const cards = await page.locator(`${gridSelector} .draftable-card:not(.selected):not(.dimmed)`).all()
        if (cards.length > 0) {
          // Pick randomly from first few
          const pickIdx = Math.floor(Math.random() * Math.min(cards.length, 3))
          await cards[pickIdx].click()
          await page.waitForTimeout(200)
        }
      } catch (e) {
        console.log(`\n      [P${idx + 1}] Selection error: ${e.message?.slice(0, 50)}`)
      }
    }))
  }

  // Helper: Wait for leader round to advance
  async function waitForRoundAdvance(phase, currentRound) {
    let attempts = 0
    while (attempts < 40) {
      const states = await Promise.all(
        pages.map(async (page) => {
          try {
            const roundInfo = await page.locator('.draft-round-info').textContent({ timeout: 300 })
            const match = roundInfo?.match(/Leader Round (\d+)/)
            if (match) {
              return parseInt(match[1]) > currentRound
            }
            return false
          } catch {
            return false
          }
        })
      )
      if (states.every(Boolean)) return
      await pages[0].waitForTimeout(500)
      attempts++
    }
    console.log('\n      ⚠ Round advance timeout')
  }

  // Helper: Wait for pack draft phase to start
  async function waitForPackDraftPhase() {
    let attempts = 0
    while (attempts < 40) {
      const states = await Promise.all(
        pages.map(page => page.locator('.pack-draft-phase').isVisible({ timeout: 300 }).catch(() => false))
      )
      if (states.every(Boolean)) return
      await pages[0].waitForTimeout(500)
      attempts++
    }
    throw new Error('Timeout waiting for pack draft phase')
  }

  // Helper: Wait for pack pick to advance
  async function waitForPickAdvance(currentPack, currentPick) {
    let attempts = 0
    while (attempts < 40) {
      const states = await Promise.all(
        pages.map(async (page) => {
          try {
            // Check for completion
            if (page.url().includes('/pool/')) return true
            const complete = await page.locator('.draft-complete').isVisible({ timeout: 100 }).catch(() => false)
            if (complete) return true

            // Check pick info
            const roundInfo = await page.locator('.draft-round-info').textContent({ timeout: 300 })
            const match = roundInfo?.match(/Round (\d+) - Pick (\d+)/)
            if (match) {
              const pack = parseInt(match[1])
              const pick = parseInt(match[2])
              return (pack > currentPack) || (pack === currentPack && pick > currentPick)
            }
            return false
          } catch {
            return false
          }
        })
      )
      if (states.every(Boolean)) return
      await pages[0].waitForTimeout(500)
      attempts++
    }
    console.log(`\n      ⚠ Pick advance timeout at Pack ${currentPack} Pick ${currentPick}`)
  }
})
