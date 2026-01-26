# E2E Integration Tests

This directory contains Playwright end-to-end tests for the Protect the Pod application.

## Setup

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see the browser)
```bash
npm run test:e2e:headed
```

### Run only desktop Chrome tests
```bash
npm run test:e2e:chromium
```

### Run only mobile tests
```bash
npm run test:e2e:mobile
```

### Run regression tests only
```bash
npm run test:e2e:regression
```

### View test report
```bash
npm run test:e2e:report
```

## Test Files

- `landing.spec.js` - Tests for the landing page and basic navigation
- `sealed-flow.spec.js` - Tests for the sealed pool creation and viewing flow
- `deck-builder.spec.js` - Tests for the deck builder functionality
- `draft-flow.spec.js` - Tests for the draft page (note: full draft flow requires auth)
- `regression.spec.js` - Comprehensive regression tests for common issues

## Test Configuration

Tests are configured in `playwright.config.js` at the project root. By default, tests run against:
- Desktop Chrome
- Desktop Firefox
- Desktop Safari (WebKit)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## Writing New Tests

1. Create a new `.spec.js` file in this directory
2. Import helpers from `helpers.js` for common utilities
3. Use the standard Playwright test API

Example:
```javascript
import { test, expect } from '@playwright/test'
import { checkLayoutIssues, waitForNetworkIdle } from './helpers.js'

test.describe('My Feature', () => {
  test('should work correctly', async ({ page }) => {
    await page.goto('/my-page')
    await waitForNetworkIdle(page)

    // Check for layout issues
    const issues = await checkLayoutIssues(page)
    expect(issues).toHaveLength(0)

    // Your assertions here
  })
})
```

## CI/CD Integration

Tests can be run in CI by setting the `CI=true` environment variable. This will:
- Disable video/trace collection for passing tests
- Use a single worker for stability
- Retry failed tests twice

## Troubleshooting

### Tests fail to connect to localhost:3000
Make sure your dev server is running:
```bash
npm run dev
```

Or let Playwright start it automatically (configured in `playwright.config.js`).

### Browser installation issues
```bash
npx playwright install --with-deps
```

### Timeouts on slow machines
Increase timeouts in the test or configuration:
```javascript
test.setTimeout(60000) // 60 seconds
```
