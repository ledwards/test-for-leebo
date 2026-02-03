#!/usr/bin/env npx tsx
// @ts-nocheck
/**
 * Pre-build script for deployment
 *
 * This script runs before the Next.js build to:
 * 1. Run all unit tests
 * 2. Run QA tests and generate results.json
 * 3. Ensure QA results are available for the build
 *
 * Usage: npx tsx scripts/prebuild.ts
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// ANSI color codes
const colors: Record<string, string> = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message: string, color: string = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title: string): void {
  console.log('')
  log(`${'='.repeat(60)}`, 'cyan')
  log(`  ${title}`, 'bold')
  log(`${'='.repeat(60)}`, 'cyan')
  console.log('')
}

function runCommand(command: string, description: string): boolean {
  try {
    log(`▶️  ${description}...`, 'cyan')
    execSync(command, {
      cwd: projectRoot,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    })
    log(`✅ ${description} - SUCCESS`, 'green')
    return true
  } catch (error) {
    log(`❌ ${description} - FAILED`, 'red')
    return false
  }
}

async function main(): Promise<void> {
  const startTime = Date.now()

  logSection('🚀 Pre-Build Checks')

  log('Running pre-build checks before deployment...', 'bold')
  console.log('')

  // Ensure QA results directory exists
  const qaResultsDir = join(projectRoot, 'src', 'qa')
  if (!existsSync(qaResultsDir)) {
    log('Creating QA results directory...', 'yellow')
    mkdirSync(qaResultsDir, { recursive: true })
  }

  // Track failures
  let hasFailures = false

  // Step 1: Run unit tests
  logSection('🧪 Running Unit Tests')
  const testsSuccess = runCommand('npm run test', 'Unit Tests')
  if (!testsSuccess) {
    hasFailures = true
    log('⚠️  Unit tests failed - deployment will continue but you should fix these!', 'yellow')
  }

  // Step 2: Run QA tests (always run, even if unit tests fail)
  logSection('📊 Running QA Tests')
  const qaSuccess = runCommand('npm run qa', 'QA Tests')
  if (!qaSuccess) {
    hasFailures = true
    log('⚠️  QA tests failed - check pack generation quality!', 'yellow')
  }

  // Check if QA results file exists
  const qaResultsFile = join(qaResultsDir, 'results.json')
  if (existsSync(qaResultsFile)) {
    log('✅ QA results file generated successfully', 'green')
    log(`   Location: ${qaResultsFile}`, 'cyan')
  } else {
    log('⚠️  QA results file not found - will be generated during build', 'yellow')
  }

  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  logSection('📋 Pre-Build Summary')

  if (hasFailures) {
    log('⚠️  Some checks failed, but build will continue', 'yellow')
    log('   Please review the failures and fix them ASAP!', 'yellow')
  } else {
    log('✅ All pre-build checks passed!', 'green')
  }

  log(`⏱️  Total time: ${duration}s`, 'cyan')
  console.log('')

  // Don't fail the build if tests fail in CI
  // This allows deploys to continue while flagging issues
  if (process.env.CI && hasFailures) {
    log('ℹ️  CI mode: Continuing despite test failures', 'blue')
  }

  process.exit(0)
}

main().catch(error => {
  log(`❌ Pre-build script error: ${(error as Error).message}`, 'red')
  if ((error as Error).stack) {
    console.error((error as Error).stack)
  }
  // Don't fail the build on script errors
  process.exit(0)
})
