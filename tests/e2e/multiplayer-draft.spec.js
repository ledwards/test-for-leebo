// @ts-check
import { test, expect, chromium } from '@playwright/test'
import { createTestUser, cleanupTestUsers, closeDb } from './test-utils.js'

/**
 * Full 8-player draft E2E test
 */

const NUM_PLAYERS = 8
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const TEST_ID = `e2e_${Date.now()}`

test.describe.configure({ mode: 'serial' })
test.skip(({ browserName, isMobile }) =>
  browserName !== 'chromium' || isMobile,
  'Skipped: Desktop Chromium only (long-running integration test)'
)
test.setTimeout(900000) // 15 minutes for 8 players

test.describe('Full 8-player draft', () => {
  /** @type {import('@playwright/test').Browser} */
  let browser
  /** @type {import('@playwright/test').BrowserContext[]} */
  let contexts = []
  /** @type {import('@playwright/test').Page[]} */
  let pages = []
  let users = []
  let shareId = null

  test.beforeAll(async () => {
    console.log(`\n${'='.repeat(60)}`)
    console.log('Starting 8-Player Draft E2E Test')
    console.log(`Test ID: ${TEST_ID}`)
    console.log(`${'='.repeat(60)}\n`)

    browser = await chromium.launch({
      headless: false,
      slowMo: 50,
    })

    // Create 8 test users
    for (let i = 0; i < NUM_PLAYERS; i++) {
      console.log(`Creating test user ${i + 1}/${NUM_PLAYERS}...`)
      const userData = await createTestUser(`TestPlayer${i + 1}`, TEST_ID)
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
        // Log API responses during draft
        if (msg.text().includes('select') || msg.text().includes('pick')) {
          console.log(`  [P${i + 1}]:`, msg.text().slice(0, 100))
        }
      })
      page.on('response', response => {
        if (response.url().includes('/select')) {
          console.log(`  [P${i + 1}] Select API: ${response.status()}`)
        }
      })
      pages.push(page)
      console.log(`  ✓ Created: ${userData.user.username}`)
    }

    console.log(`\n✓ All ${NUM_PLAYERS} test users ready\n`)
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

  test('complete a full 8-player draft', async () => {
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

    // === STEP 2: All other players join ===
    console.log('\n--- STEP 2: Players joining ---')
    for (let i = 1; i < NUM_PLAYERS; i++) {
      await pages[i].goto(`${BASE_URL}/draft/${shareId}`)
      await pages[i].waitForSelector('.draft-lobby', { timeout: 10000 })
      await pages[i].waitForTimeout(300)
      console.log(`  ✓ Player ${i + 1} joined`)
    }

    await pages[0].waitForTimeout(1000)
    const playerCountText = await pages[0].locator('.player-count').textContent()
    console.log(`  Player count: ${playerCountText}`)

    // === STEP 3: Start draft ===
    console.log('\n--- STEP 3: Starting draft ---')
    const startButton = pages[0].locator('button:has-text("Start Draft")')
    await expect(startButton).toBeEnabled({ timeout: 10000 })
    await startButton.click()

    await pages[0].waitForSelector('.leader-draft-phase', { timeout: 30000 })
    console.log('✓ Draft started - Leader draft phase')

    // === STEP 4: Leader draft (3 rounds) ===
    console.log('\n--- STEP 4: Leader draft ---')

    let selectionFailures = 0

    for (let round = 1; round <= 3; round++) {
      console.log(`  Round ${round}/3:`)

      // Wait for all players to have cards to pick
      await waitForAllPlayersReady('.leaders-grid .draftable-card')

      // All players select a leader
      await selectCardForAllPlayers('.leaders-grid')

      // Wait for round to advance
      if (round < 3) {
        const success = await waitForLeaderRoundAdvance(round)
        if (!success) selectionFailures++
      } else {
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

        // Debug: check what players can see on first pick
        if (pack === 1 && pick === 1) {
          const debugInfo = await Promise.all(pages.map(async (page, idx) => {
            const hasPackPhase = await page.locator('.pack-draft-phase').isVisible().catch(() => false)
            const hasPackGrid = await page.locator('.pack-grid').isVisible().catch(() => false)
            const cardCount = await page.locator('.pack-grid .draftable-card').count().catch(() => 0)
            const hasPassing = await page.locator('.passing-message').isVisible().catch(() => false)
            const hasSkeleton = await page.locator('.skeleton-card').count().catch(() => 0)
            return `P${idx + 1}:phase=${hasPackPhase},grid=${hasPackGrid},cards=${cardCount},passing=${hasPassing},skel=${hasSkeleton}`
          }))
          console.log(`\n      Debug: ${debugInfo.join(' | ')}`)
        }

        // Wait for all players to have cards
        await waitForAllPlayersReady('.pack-grid .draftable-card')

        // All players select a card
        await selectCardForAllPlayers('.pack-grid')

        // Wait for pick to advance (unless last pick of last pack)
        if (!(pack === 3 && pick === 14)) {
          const success = await waitForPickAdvance(pack, pick)
          if (!success) selectionFailures++
        }

        console.log(' ✓')
      }

      console.log(`  ✓ Pack ${pack} complete!`)
    }

    // Fail if any picks relied on timer instead of successful card selection
    if (selectionFailures > 0) {
      console.log(`\n❌ ${selectionFailures} picks failed to advance via card selection (relied on timer)`)
      expect(selectionFailures).toBe(0)
    }

    // === STEP 6: Verify completion ===
    console.log('\n--- STEP 6: Verifying completion ---')

    // Wait for completion - draft should redirect to pool or show complete state
    let p1Complete = false
    for (let i = 0; i < 30; i++) {
      await pages[0].waitForTimeout(1000)
      if (pages[0].url().includes('/pool/')) {
        p1Complete = true
        break
      }
      const isComplete = await pages[0].locator('.draft-complete, .deck-builder').isVisible().catch(() => false)
      if (isComplete) {
        p1Complete = true
        break
      }
    }

    // If still not complete, check if the last pick was processed (Cards: 42/42)
    if (!p1Complete) {
      const cardCount = await pages[0].locator('text=/Cards:.*42/').isVisible().catch(() => false)
      if (cardCount) {
        console.log('  Draft picked all cards, waiting for redirect...')
        p1Complete = true
      }
    }

    expect(p1Complete).toBeTruthy()

    console.log('\n' + '='.repeat(60))
    console.log('✅ 8-PLAYER DRAFT COMPLETED!')
    console.log('='.repeat(60) + '\n')
  })

  // Helper: Wait for majority of players to have selectable cards with images loaded
  async function waitForAllPlayersReady(selector) {
    const threshold = Math.ceil(NUM_PLAYERS * 0.9) // 90% of players
    let attempts = 0
    while (attempts < 120) { // Increase to 60 seconds
      const readyStates = await Promise.all(
        pages.map(async (page) => {
          try {
            // Check if cards exist
            const cardCount = await page.locator(selector).count()
            if (cardCount === 0) return false

            // Check if at least one card has a loaded image
            const hasLoadedImage = await page.evaluate((sel) => {
              const cards = document.querySelectorAll(sel)
              for (const card of cards) {
                const img = card.querySelector('img')
                if (img && img.complete && img.naturalWidth > 0) {
                  return true
                }
              }
              return false
            }, selector)

            return hasLoadedImage
          } catch {
            return false
          }
        })
      )
      const readyCount = readyStates.filter(Boolean).length
      if (readyCount >= threshold) return

      // Log progress every 20 attempts (10 seconds)
      if (attempts > 0 && attempts % 20 === 0) {
        const statuses = await Promise.all(pages.map(async (page, idx) => {
          const cardCount = await page.locator(selector).count().catch(() => 0)
          const hasSkeleton = await page.locator('.skeleton-card').count().catch(() => 0)
          const hasPassing = await page.locator('.passing-message').isVisible().catch(() => false)
          return `P${idx+1}:${cardCount}c/${hasSkeleton}sk/${hasPassing?'pass':'ok'}`
        }))
        console.log(`    Waiting... ready=${readyCount}/${NUM_PLAYERS}: ${statuses.join(' ')}`)
      }

      await pages[0].waitForTimeout(500)
      attempts++
    }
    throw new Error(`Timeout waiting for cards: ${selector}`)
  }

  // Helper: Have all players select a card with retries and verification
  // Uses parallel clicks with small stagger to avoid exact simultaneous API hits
  async function selectCardForAllPlayers(gridSelector) {
    const maxRetries = 3

    // Click for a single player - returns true if successful
    async function clickForPlayer(page, idx) {
      for (let retry = 0; retry < maxRetries; retry++) {
        try {
          // Check if already selected
          const hasSelected = await page.locator(`${gridSelector} .draftable-card.selected`).count() > 0
          const hasBanner = await page.locator('.selection-confirmation-banner').isVisible().catch(() => false)
          if (hasSelected || hasBanner) return true

          // Wait for cards to be available
          const cardCount = await page.locator(`${gridSelector} .draftable-card`).count().catch(() => 0)
          if (cardCount === 0) {
            await page.waitForTimeout(300)
            continue
          }

          // Wait for at least one image to be loaded
          await page.waitForFunction(
            (sel) => {
              const cards = document.querySelectorAll(sel)
              for (const card of cards) {
                const img = card.querySelector('img')
                if (img && img.complete && img.naturalWidth > 0) return true
              }
              return false
            },
            gridSelector + ' .draftable-card',
            { timeout: 3000 }
          ).catch(() => {})

          // Get available cards
          const availableCards = await page.locator(`${gridSelector} .draftable-card:not(.selected):not(.dimmed)`).all()
          if (availableCards.length === 0) {
            await page.waitForTimeout(200)
            continue
          }

          // Click
          await availableCards[0].scrollIntoViewIfNeeded()
          await availableCards[0].click({ force: true, timeout: 2000 })

          // Verify selection
          await page.waitForTimeout(300)
          const selected = await page.locator(`${gridSelector} .draftable-card.selected`).count() > 0
          const banner = await page.locator('.selection-confirmation-banner').isVisible().catch(() => false)
          if (selected || banner) return true
        } catch {
          await page.waitForTimeout(200)
        }
      }
      return false
    }

    // Run all players in parallel with stagger (100ms between starts to avoid API race)
    const results = await Promise.all(
      pages.map(async (page, idx) => {
        // Stagger to prevent exact simultaneous API calls causing race condition
        await page.waitForTimeout(idx * 100)
        const success = await clickForPlayer(page, idx)
        if (success) process.stdout.write(`✓`)
        return success
      })
    )

    const successCount = results.filter(Boolean).length
    if (successCount < NUM_PLAYERS) {
      console.log(` (${successCount}/${NUM_PLAYERS})`)
    }

    // Brief wait for API to process all selections
    await pages[0].waitForTimeout(500)
  }

  // Helper: Wait for leader round to advance, retrying selections if stuck
  // Returns true if advanced via picks, false if timed out
  async function waitForLeaderRoundAdvance(currentRound) {
    const threshold = Math.ceil(NUM_PLAYERS * 0.9)
    let attempts = 0
    let lastRetryAttempt = 0

    while (attempts < 60) {
      const states = await Promise.all(
        pages.map(async (page) => {
          try {
            // Check if we've moved to pack draft phase (means leader draft is done)
            const inPackPhase = await page.locator('.pack-draft-phase').isVisible({ timeout: 100 }).catch(() => false)
            if (inPackPhase) return true // Leader draft complete!

            // Look for round info in .round-pick-info (shows "Leader 1/3", "Leader 2/3", etc.)
            const roundInfo = await page.locator('.round-pick-info').textContent({ timeout: 300 })
            const match = roundInfo?.match(/Leader (\d+)\/3/)
            if (match) {
              return parseInt(match[1]) > currentRound
            }
            return false
          } catch {
            return false
          }
        })
      )

      const advancedCount = states.filter(Boolean).length
      if (advancedCount >= threshold) return true // Success!

      // If we're stuck for a while, retry selections for players who haven't advanced
      // But only if we're still in leader phase (not transitioned to pack draft)
      if (attempts > 0 && attempts % 10 === 0 && attempts !== lastRetryAttempt) {
        lastRetryAttempt = attempts

        // Check if majority have moved to pack phase - if so, leader draft is done
        const packPhaseCount = await Promise.all(
          pages.map(page => page.locator('.pack-draft-phase').isVisible({ timeout: 100 }).catch(() => false))
        ).then(states => states.filter(Boolean).length)

        if (packPhaseCount >= threshold) {
          console.log(`    Pack phase detected for ${packPhaseCount} players, leader draft done`)
          return true
        }

        // Only retry if most players are still in leader phase
        const leaderPhaseCount = await Promise.all(
          pages.map(page => page.locator('.leader-draft-phase').isVisible({ timeout: 100 }).catch(() => false))
        ).then(states => states.filter(Boolean).length)

        if (leaderPhaseCount >= threshold) {
          console.log(`    Retrying leader selections (attempt ${attempts})...`)
          await selectCardForAllPlayers('.leaders-grid')
        } else {
          console.log(`    Mixed phases: ${leaderPhaseCount} in leader, ${packPhaseCount} in pack`)
        }
      }

      await pages[0].waitForTimeout(500)
      attempts++
    }

    // This is a failure - we shouldn't rely on timer to advance
    console.log(`\n      ⚠ Leader round ${currentRound} advance timeout`)
    return false
  }

  // Helper: Wait for pack draft phase to start AND have cards loaded
  async function waitForPackDraftPhase() {
    const threshold = Math.ceil(NUM_PLAYERS * 0.9)
    let attempts = 0

    // First wait for phase to be visible
    while (attempts < 60) {
      const states = await Promise.all(
        pages.map(page => page.locator('.pack-draft-phase').isVisible({ timeout: 300 }).catch(() => false))
      )
      if (states.filter(Boolean).length >= threshold) break
      await pages[0].waitForTimeout(500)
      attempts++
    }

    if (attempts >= 60) {
      throw new Error('Timeout waiting for pack draft phase')
    }

    // Now wait for cards to actually load for ALL players (not just skeletons)
    console.log('    Waiting for pack cards to load...')
    attempts = 0
    while (attempts < 30) {
      const cardCounts = await Promise.all(
        pages.map(page => page.locator('.pack-grid .draftable-card').count().catch(() => 0))
      )
      const allHaveCards = cardCounts.every(c => c > 0)
      if (allHaveCards) {
        console.log(`    ✓ Cards loaded for all players (${cardCounts.join(',')})`)
        return
      }
      // Log progress periodically
      if (attempts > 0 && attempts % 5 === 0) {
        console.log(`    ... still waiting (${cardCounts.join(',')})`)
      }
      await pages[0].waitForTimeout(500)
      attempts++
    }
    // Show which players are missing cards
    const finalCounts = await Promise.all(
      pages.map(page => page.locator('.pack-grid .draftable-card').count().catch(() => 0))
    )
    console.log(`    ⚠ Cards not loaded for all players: ${finalCounts.join(',')}`)
  }

  // Helper: Wait for pack pick to advance, retrying selections if stuck
  // Returns true if advanced via picks, false if timed out
  async function waitForPickAdvance(currentPack, currentPick) {
    const threshold = Math.ceil(NUM_PLAYERS * 0.9)
    let attempts = 0
    let lastRetryAttempt = 0

    while (attempts < 60) {
      const states = await Promise.all(
        pages.map(async (page) => {
          try {
            // Check for completion
            if (page.url().includes('/pool/')) return true
            const complete = await page.locator('.draft-complete').isVisible({ timeout: 100 }).catch(() => false)
            if (complete) return true

            // Check pick info in .round-pick-info (shows "Pack 1 - Pick 1", etc.)
            const roundInfo = await page.locator('.round-pick-info').textContent({ timeout: 300 })
            const match = roundInfo?.match(/Pack (\d+) - Pick (\d+)/)
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

      const advancedCount = states.filter(Boolean).length
      if (advancedCount >= threshold) return true // Success!

      // If we're stuck for a while, retry selections for players who haven't advanced
      // But only if we're still in pack phase with cards to pick
      if (attempts > 0 && attempts % 10 === 0 && attempts !== lastRetryAttempt) {
        lastRetryAttempt = attempts
        // Check if any player still has cards to pick
        const stillHasCards = await pages[0].locator('.pack-grid .draftable-card').count().catch(() => 0)
        if (stillHasCards > 0) {
          console.log(` retrying...`)
          await selectCardForAllPlayers('.pack-grid')
        }
      }

      await pages[0].waitForTimeout(500)
      attempts++
    }

    // This is a failure - we shouldn't rely on timer to advance
    console.log(`\n      ❌ Pick advance timeout at Pack ${currentPack} Pick ${currentPick} - card selection failed!`)
    return false
  }
})
