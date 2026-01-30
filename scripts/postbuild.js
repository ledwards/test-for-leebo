#!/usr/bin/env node
/**
 * Post-build script for deployment
 *
 * This script runs after the Next.js build to:
 * 1. Copy QA results to the public directory for serving
 * 2. Generate QA status badge and documentation
 * 3. Verify all required artifacts are present
 *
 * Usage: node scripts/postbuild.js
 */

import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('')
  log(`${'='.repeat(60)}`, 'cyan')
  log(`  ${title}`, 'bold')
  log(`${'='.repeat(60)}`, 'cyan')
  console.log('')
}

async function main() {
  logSection('📦 Post-Build Artifact Management')

  log('Preparing deployment artifacts...', 'bold')
  console.log('')

  // Ensure public directory exists
  const publicDir = join(projectRoot, 'public')
  if (!existsSync(publicDir)) {
    log('Creating public directory...', 'yellow')
    mkdirSync(publicDir, { recursive: true })
  }

  // Copy release notes to public directory
  const releaseNotesSource = join(projectRoot, 'RELEASE_NOTES.md')
  const releaseNotesDest = join(publicDir, 'RELEASE_NOTES.md')

  if (existsSync(releaseNotesSource)) {
    try {
      copyFileSync(releaseNotesSource, releaseNotesDest)
      log('✅ Copied release notes to public directory', 'green')
    } catch (error) {
      log(`⚠️  Failed to copy release notes: ${error.message}`, 'yellow')
    }
  } else {
    log('⚠️  Release notes file not found - skipping copy', 'yellow')
  }

  // Run QA tests to generate fresh results
  log('Running QA tests to generate fresh results...', 'cyan')
  try {
    execSync('npm run qa', {
      cwd: projectRoot,
      stdio: 'inherit'
    })
    log('✅ QA tests completed', 'green')
  } catch (error) {
    log(`⚠️  QA tests failed: ${error.message}`, 'yellow')
  }

  // Copy QA results to public directory
  const qaResultsSource = join(projectRoot, 'src', 'qa', 'results.json')
  const qaResultsDest = join(publicDir, 'qa-results.json')

  if (existsSync(qaResultsSource)) {
    try {
      copyFileSync(qaResultsSource, qaResultsDest)
      log('✅ Copied QA results to public directory', 'green')
      log(`   Source: ${qaResultsSource}`, 'cyan')
      log(`   Destination: ${qaResultsDest}`, 'cyan')
    } catch (error) {
      log(`⚠️  Failed to copy QA results: ${error.message}`, 'yellow')
    }
  } else {
    log('⚠️  QA results file not found - skipping copy', 'yellow')
    log(`   Expected at: ${qaResultsSource}`, 'cyan')
  }

  // Generate QA badge and status
  if (existsSync(qaResultsSource)) {
    try {
      log('Generating QA status badge...', 'cyan')
      execSync('node scripts/generate-qa-badge.js', {
        cwd: projectRoot,
        stdio: 'inherit'
      })
      log('✅ Generated QA status badge', 'green')
    } catch (error) {
      log(`⚠️  Failed to generate QA badge: ${error.message}`, 'yellow')
    }
  }

  // Verify build artifacts
  logSection('✅ Verification')

  const requiredFiles = [
    { path: join(projectRoot, '.next'), name: 'Next.js build output', type: 'dir' },
    { path: qaResultsDest, name: 'QA results', type: 'file' },
    { path: join(publicDir, 'qa-status.json'), name: 'QA status JSON', type: 'file' }
  ]

  let allPresent = true
  for (const file of requiredFiles) {
    if (existsSync(file.path)) {
      log(`✅ ${file.name} present`, 'green')
    } else {
      log(`⚠️  ${file.name} missing`, 'yellow')
      allPresent = false
    }
  }

  console.log('')
  if (allPresent) {
    log('✅ All required artifacts are present!', 'green')
  } else {
    log('⚠️  Some artifacts are missing - deployment may be incomplete', 'yellow')
  }

  console.log('')
  log('📋 Post-build complete!', 'bold')
  console.log('')

  process.exit(0)
}

main().catch(error => {
  log(`❌ Post-build script error: ${error.message}`, 'red')
  if (error.stack) {
    console.error(error.stack)
  }
  // Don't fail the build on script errors
  process.exit(0)
})
