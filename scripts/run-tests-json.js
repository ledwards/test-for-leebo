#!/usr/bin/env node
/**
 * Test Runner with JSON Output
 *
 * Runs all unit tests and saves results to src/tests/results.json
 * Usage: node scripts/run-tests-json.js
 */

import { spawn } from 'child_process'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Test commands to run
const testCommands = [
  { name: 'Utils', suite: 'utils', cmd: 'node', args: ['src/utils/boosterPack.test.js'] },
  { name: 'Base Belt', suite: 'belts', cmd: 'node', args: ['src/belts/BaseBelt.test.js'] },
  { name: 'Common Belt', suite: 'belts', cmd: 'node', args: ['src/belts/CommonBelt.test.js'] },
  { name: 'Foil Belt', suite: 'belts', cmd: 'node', args: ['src/belts/FoilBelt.test.js'] },
  { name: 'Hyperfoil Belt', suite: 'belts', cmd: 'node', args: ['src/belts/HyperfoilBelt.test.js'] },
  { name: 'Hyperspace Belts', suite: 'belts', cmd: 'node', args: ['src/belts/HyperspaceBelts.test.js'] },
  { name: 'Leader Belt', suite: 'belts', cmd: 'node', args: ['src/belts/LeaderBelt.test.js'] },
  { name: 'Rare/Legendary Belt', suite: 'belts', cmd: 'node', args: ['src/belts/RareLegendaryBelt.test.js'] },
  { name: 'Showcase Leader Belt', suite: 'belts', cmd: 'node', args: ['src/belts/ShowcaseLeaderBelt.test.js'] },
  { name: 'Uncommon Belt', suite: 'belts', cmd: 'node', args: ['src/belts/UncommonBelt.test.js'] },
  { name: 'Card Fixes', suite: 'fixes', cmd: 'node', args: ['src/utils/cardFixes.test.js'] },
  { name: 'Draft Logic', suite: 'draft', cmd: 'node', args: ['src/utils/draftLogic.test.js'] },
  { name: 'Bot Behaviors', suite: 'bots', cmd: 'node', args: ['src/bots/behaviors/behaviors.test.js'] },
  { name: 'Card Data', suite: 'data', cmd: 'node', args: ['src/data/cards.test.js'] },
  { name: 'Card Counts', suite: 'data', cmd: 'node', args: ['src/data/cardCounts.test.js'] },
]

async function runTest(testConfig) {
  return new Promise((resolve) => {
    const startTime = Date.now()
    let stdout = ''
    let stderr = ''

    const proc = spawn(testConfig.cmd, testConfig.args, {
      cwd: projectRoot,
      stdio: ['inherit', 'pipe', 'pipe']
    })

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
      process.stdout.write(data)
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
      process.stderr.write(data)
    })

    proc.on('close', (code) => {
      const executionTime = Date.now() - startTime
      const passed = code === 0

      // Try to extract individual test results from output
      const testResults = parseTestOutput(stdout + stderr, testConfig.suite, testConfig.name)

      resolve({
        name: testConfig.name,
        suite: testConfig.suite,
        status: passed ? 'passed' : 'failed',
        exitCode: code,
        executionTime,
        tests: testResults,
        errorMessage: passed ? null : extractErrorMessage(stderr || stdout)
      })
    })

    proc.on('error', (err) => {
      resolve({
        name: testConfig.name,
        suite: testConfig.suite,
        status: 'failed',
        exitCode: -1,
        executionTime: Date.now() - startTime,
        tests: [],
        errorMessage: err.message
      })
    })
  })
}

function parseTestOutput(output, suite, suiteName) {
  const results = []
  const lines = output.split('\n')

  for (const line of lines) {
    // Match patterns like "✅ Test name" or "❌ Test name"
    const passMatch = line.match(/✅\s*(.+)/)
    const failMatch = line.match(/❌\s*(.+)/)

    if (passMatch) {
      results.push({
        suite,
        name: passMatch[1].trim(),
        status: 'passed'
      })
    } else if (failMatch) {
      results.push({
        suite,
        name: failMatch[1].trim(),
        status: 'failed'
      })
    }
  }

  // If no individual tests found, create one entry for the suite
  if (results.length === 0) {
    const hasError = output.includes('Error') || output.includes('failed') || output.includes('❌')
    results.push({
      suite,
      name: suiteName,
      status: hasError ? 'failed' : 'passed'
    })
  }

  return results
}

function extractErrorMessage(output) {
  const lines = output.split('\n')
  for (const line of lines) {
    if (line.includes('Error:') || line.includes('AssertionError')) {
      return line.trim()
    }
  }
  return lines.find(l => l.trim().length > 0) || 'Unknown error'
}

async function main() {
  console.log('\x1b[1m\x1b[36m🧪 Running Unit Tests\x1b[0m')
  console.log('\x1b[36m============================\x1b[0m')
  console.log('')

  const startTime = Date.now()
  const suiteResults = []
  const allTests = []

  for (const testConfig of testCommands) {
    console.log(`\x1b[36m📦 Running ${testConfig.name}...\x1b[0m`)
    const result = await runTest(testConfig)
    suiteResults.push(result)
    allTests.push(...result.tests)
    console.log('')
  }

  const totalTime = Date.now() - startTime
  const passedSuites = suiteResults.filter(r => r.status === 'passed').length
  const failedSuites = suiteResults.filter(r => r.status === 'failed').length
  const passedTests = allTests.filter(t => t.status === 'passed').length
  const failedTests = allTests.filter(t => t.status === 'failed').length

  // Ensure output directory exists
  const outputDir = join(projectRoot, 'src', 'tests')
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  // Write results
  const output = {
    runAt: new Date().toISOString(),
    executionTime: totalTime,
    summary: {
      totalSuites: suiteResults.length,
      passedSuites,
      failedSuites,
      totalTests: allTests.length,
      passed: passedTests,
      failed: failedTests
    },
    suites: suiteResults,
    tests: allTests
  }

  const outputPath = join(outputDir, 'results.json')
  writeFileSync(outputPath, JSON.stringify(output, null, 2))

  console.log('\x1b[36m============================\x1b[0m')
  console.log(`\x1b[32m✅ Suites passed: ${passedSuites}/${suiteResults.length}\x1b[0m`)
  if (failedSuites > 0) {
    console.log(`\x1b[31m❌ Suites failed: ${failedSuites}\x1b[0m`)
  }
  console.log(`\x1b[32m✅ Tests passed: ${passedTests}/${allTests.length}\x1b[0m`)
  if (failedTests > 0) {
    console.log(`\x1b[31m❌ Tests failed: ${failedTests}\x1b[0m`)
  }
  console.log(`\x1b[36m⏱️  Total time: ${(totalTime / 1000).toFixed(2)}s\x1b[0m`)
  console.log('')
  console.log(`\x1b[36m📄 Results written to: ${outputPath}\x1b[0m`)

  if (failedSuites > 0) {
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Test runner failed:', err)
  process.exit(1)
})
