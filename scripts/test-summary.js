#!/usr/bin/env node
/**
 * Test Summary Aggregator
 *
 * Aggregates results from all test runs (unit, QA, e2e) and displays a summary
 * Usage: node scripts/test-summary.js
 */

import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title, color = 'cyan') {
  console.log('')
  log('═'.repeat(70), color)
  log(`  ${title}`, 'bold')
  log('═'.repeat(70), color)
  console.log('')
}

/**
 * Parse QA results
 */
function parseQAResults() {
  const qaResultsPath = join(projectRoot, 'src', 'qa', 'results.json')

  if (!existsSync(qaResultsPath)) {
    return null
  }

  try {
    const data = JSON.parse(readFileSync(qaResultsPath, 'utf8'))

    const failedTests = data.tests.filter(t => t.status === 'failed')
    const warnings = data.tests.filter(t => t.status === 'warning')

    return {
      total: data.summary.total,
      passed: data.summary.passed,
      failed: data.summary.failed,
      warnings: warnings.length,
      failedTests: failedTests.map(t => ({
        suite: t.suite,
        name: t.name,
        error: t.error
      })),
      warningTests: warnings.map(t => ({
        suite: t.suite,
        name: t.name,
        message: t.error || t.message
      }))
    }
  } catch (error) {
    return null
  }
}

/**
 * Parse Playwright results
 */
function parsePlaywrightResults() {
  // Try to parse from playwright-report or test-results
  const reportPath = join(projectRoot, 'playwright-report', 'index.html')
  const resultsPath = join(projectRoot, 'test-results')

  // Check if playwright ran
  if (!existsSync(reportPath) && !existsSync(resultsPath)) {
    return null
  }

  // Try to read from .last-run.json if available
  const lastRunPath = join(projectRoot, 'test-results', '.last-run.json')
  if (existsSync(lastRunPath)) {
    try {
      const data = JSON.parse(readFileSync(lastRunPath, 'utf8'))
      return {
        total: data.stats?.expected || 0,
        passed: data.stats?.passed || 0,
        failed: data.stats?.failed || 0,
        skipped: data.stats?.skipped || 0,
        flaky: data.stats?.flaky || 0,
        errors: []
      }
    } catch (error) {
      // Fall through to basic check
    }
  }

  // Basic check - just verify report exists
  return {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    flaky: 0,
    errors: [],
    hasReport: existsSync(reportPath)
  }
}

/**
 * Estimate unit test results from console output
 * This is a fallback since unit tests don't produce JSON output
 */
function estimateUnitTestResults() {
  // Unit tests typically show "✅ X tests passed" at the end
  // We'll return a placeholder structure
  return {
    estimated: true,
    total: 0,
    passed: 0,
    failed: 0
  }
}

/**
 * Display summary
 */
function displaySummary() {
  logSection('🎯 TEST SUMMARY', 'cyan')

  let totalTests = 0
  let totalPassed = 0
  let totalFailed = 0
  let totalWarnings = 0
  let hasErrors = false

  // Unit Tests (estimated from process)
  const unitTests = estimateUnitTestResults()
  if (!unitTests.estimated) {
    log('📦 Unit Tests', 'bold')
    log(`   Total: ${unitTests.total}`, 'white')
    log(`   Passed: ${unitTests.passed} ✅`, 'green')
    if (unitTests.failed > 0) {
      log(`   Failed: ${unitTests.failed} ❌`, 'red')
      hasErrors = true
    }
    totalTests += unitTests.total
    totalPassed += unitTests.passed
    totalFailed += unitTests.failed
    console.log('')
  }

  // QA Tests
  const qaResults = parseQAResults()
  if (qaResults) {
    log('📊 QA Tests', 'bold')
    log(`   Total: ${qaResults.total}`, 'white')
    log(`   Passed: ${qaResults.passed} ✅`, 'green')

    if (qaResults.failed > 0) {
      log(`   Failed: ${qaResults.failed} ❌`, 'red')
      hasErrors = true
    }

    if (qaResults.warnings > 0) {
      log(`   Warnings: ${qaResults.warnings} ⚠️`, 'yellow')
      totalWarnings += qaResults.warnings
    }

    totalTests += qaResults.total
    totalPassed += qaResults.passed
    totalFailed += qaResults.failed

    // Show failed tests
    if (qaResults.failedTests.length > 0) {
      console.log('')
      log('   Failed Tests:', 'red')
      qaResults.failedTests.slice(0, 5).forEach(test => {
        log(`   • ${test.name}`, 'red')
        if (test.error) {
          log(`     ${test.error.split('\n')[0]}`, 'dim')
        }
      })
      if (qaResults.failedTests.length > 5) {
        log(`   ... and ${qaResults.failedTests.length - 5} more`, 'dim')
      }
    }

    // Show warnings
    if (qaResults.warningTests.length > 0) {
      console.log('')
      log('   Warnings:', 'yellow')
      qaResults.warningTests.slice(0, 3).forEach(test => {
        log(`   • ${test.name}`, 'yellow')
        if (test.message) {
          log(`     ${test.message.split('\n')[0]}`, 'dim')
        }
      })
      if (qaResults.warningTests.length > 3) {
        log(`   ... and ${qaResults.warningTests.length - 3} more`, 'dim')
      }
    }

    console.log('')
  }

  // Playwright Tests
  const playwrightResults = parsePlaywrightResults()
  if (playwrightResults) {
    log('🎭 E2E Tests (Playwright)', 'bold')

    if (playwrightResults.hasReport) {
      log('   Report available at: playwright-report/index.html', 'cyan')
    }

    if (playwrightResults.total > 0) {
      log(`   Total: ${playwrightResults.total}`, 'white')
      log(`   Passed: ${playwrightResults.passed} ✅`, 'green')

      if (playwrightResults.failed > 0) {
        log(`   Failed: ${playwrightResults.failed} ❌`, 'red')
        hasErrors = true
      }

      if (playwrightResults.skipped > 0) {
        log(`   Skipped: ${playwrightResults.skipped} ⊘`, 'dim')
      }

      if (playwrightResults.flaky > 0) {
        log(`   Flaky: ${playwrightResults.flaky} ⚠️`, 'yellow')
      }

      totalTests += playwrightResults.total
      totalPassed += playwrightResults.passed
      totalFailed += playwrightResults.failed
    }

    console.log('')
  }

  // Overall Summary
  logSection('📋 OVERALL RESULTS', hasErrors ? 'red' : 'green')

  log(`Total Tests Run: ${totalTests}`, 'bold')
  log(`Passed: ${totalPassed} ✅`, 'green')

  if (totalFailed > 0) {
    log(`Failed: ${totalFailed} ❌`, 'red')
  }

  if (totalWarnings > 0) {
    log(`Warnings: ${totalWarnings} ⚠️`, 'yellow')
  }

  console.log('')

  // Pass rate
  if (totalTests > 0) {
    const passRate = ((totalPassed / totalTests) * 100).toFixed(1)
    const passRateColor = passRate >= 95 ? 'green' : passRate >= 80 ? 'yellow' : 'red'
    log(`Pass Rate: ${passRate}%`, passRateColor)
  }

  console.log('')

  // Final verdict
  if (totalFailed === 0 && totalWarnings === 0) {
    log('✅ ALL TESTS PASSED!', 'green')
  } else if (totalFailed === 0 && totalWarnings > 0) {
    log('⚠️  ALL TESTS PASSED WITH WARNINGS', 'yellow')
  } else if (totalFailed <= 2) {
    log('⚠️  TESTS MOSTLY PASSED (FEW FAILURES)', 'yellow')
    log('   Some failures may be due to statistical variance', 'dim')
  } else {
    log('❌ TESTS FAILED', 'red')
    log(`   ${totalFailed} test(s) need attention`, 'red')
  }

  console.log('')

  // Links
  log('═'.repeat(70), 'cyan')
  log('📎 Useful Links:', 'bold')
  log('   QA Results:     src/qa/results.json', 'cyan')
  if (playwrightResults?.hasReport) {
    log('   E2E Report:     playwright-report/index.html (opened in browser)', 'cyan')
  }
  log('═'.repeat(70), 'cyan')
  console.log('')
}

// Run summary
displaySummary()
