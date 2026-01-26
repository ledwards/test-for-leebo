#!/usr/bin/env node
/**
 * Quiet Test Runner
 *
 * Runs all tests but only shows output for failures.
 * Shows a clean summary at the end.
 *
 * Usage: node scripts/run-tests-quiet.js
 */

import { execSync } from 'child_process'
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
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function runCommand(name, command) {
  const startTime = Date.now()
  try {
    execSync(command, {
      cwd: projectRoot,
      stdio: 'pipe',
      encoding: 'utf8'
    })
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    return { success: true, elapsed }
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    return {
      success: false,
      elapsed,
      output: error.stdout || '',
      stderr: error.stderr || ''
    }
  }
}

function extractFailures(output) {
  const lines = output.split('\n')
  const failures = []
  let inFailure = false
  let currentFailure = []

  for (const line of lines) {
    if (line.includes('❌') || line.includes('FAILED') || line.includes('Error:')) {
      inFailure = true
    }
    if (inFailure) {
      currentFailure.push(line)
      if (line.trim() === '' && currentFailure.length > 1) {
        failures.push(currentFailure.join('\n'))
        currentFailure = []
        inFailure = false
      }
    }
  }
  if (currentFailure.length > 0) {
    failures.push(currentFailure.join('\n'))
  }
  return failures
}

async function main() {
  console.log('')
  log('🧪 Running tests...', 'cyan')
  console.log('')

  const results = []

  // Unit tests
  process.stdout.write(`  Unit tests... `)
  const unitResult = runCommand('unit', 'npm run test')
  if (unitResult.success) {
    log(`✅ (${unitResult.elapsed}s)`, 'green')
  } else {
    log(`❌ (${unitResult.elapsed}s)`, 'red')
  }
  results.push({ name: 'Unit', ...unitResult })

  // QA tests
  process.stdout.write(`  QA tests...   `)
  const qaResult = runCommand('qa', 'npm run qa')
  if (qaResult.success) {
    log(`✅ (${qaResult.elapsed}s)`, 'green')
  } else {
    log(`❌ (${qaResult.elapsed}s)`, 'red')
  }
  results.push({ name: 'QA', ...qaResult })

  // E2E tests
  process.stdout.write(`  E2E tests...  `)
  const e2eResult = runCommand('e2e', 'npm run test:e2e')
  if (e2eResult.success) {
    log(`✅ (${e2eResult.elapsed}s)`, 'green')
  } else {
    log(`❌ (${e2eResult.elapsed}s)`, 'red')
  }
  results.push({ name: 'E2E', ...e2eResult })

  console.log('')

  // Show failures if any
  const failures = results.filter(r => !r.success)
  if (failures.length > 0) {
    log('═'.repeat(70), 'red')
    log('  FAILURES', 'bold')
    log('═'.repeat(70), 'red')
    console.log('')

    for (const failure of failures) {
      log(`📛 ${failure.name} Tests Failed:`, 'red')
      console.log('')

      // Show relevant failure output
      const output = failure.output + '\n' + failure.stderr
      const failureLines = extractFailures(output)

      if (failureLines.length > 0) {
        for (const f of failureLines.slice(0, 5)) {
          console.log(f)
        }
        if (failureLines.length > 5) {
          log(`  ... and ${failureLines.length - 5} more failures`, 'dim')
        }
      } else {
        // Show last 20 lines if no specific failures found
        const lines = output.split('\n').filter(l => l.trim())
        const lastLines = lines.slice(-20)
        console.log(lastLines.join('\n'))
      }
      console.log('')
    }
  }

  // Summary
  log('═'.repeat(70), failures.length > 0 ? 'red' : 'green')
  log('  SUMMARY', 'bold')
  log('═'.repeat(70), failures.length > 0 ? 'red' : 'green')
  console.log('')

  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const totalTime = results.reduce((sum, r) => sum + parseFloat(r.elapsed), 0).toFixed(1)

  log(`  Passed: ${passed}/${results.length}`, passed === results.length ? 'green' : 'yellow')
  if (failed > 0) {
    log(`  Failed: ${failed}`, 'red')
  }
  log(`  Time:   ${totalTime}s`, 'dim')
  console.log('')

  if (failures.length === 0) {
    log('✅ ALL TESTS PASSED!', 'green')
  } else {
    log('❌ SOME TESTS FAILED', 'red')
  }
  console.log('')

  process.exit(failures.length > 0 ? 1 : 0)
}

main().catch(error => {
  log(`Error: ${error.message}`, 'red')
  process.exit(1)
})
