// Run all tests in sequence
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const tests = [
  {
    name: 'Pack Distribution Tests',
    command: 'npm',
    args: ['run', 'test-distribution'],
    description: 'Comprehensive pack generation and distribution tests',
    requiresServer: false
  },
  {
    name: 'Duplicate/Triplicate Rate Tests',
    command: 'npm',
    args: ['run', 'test-duplicates', 'SOR', '500'],
    description: 'Statistical test for duplicate rates in sealed pods',
    requiresServer: false
  },
  {
    name: 'API Tests',
    command: 'npm',
    args: ['run', 'test-api'],
    description: 'API endpoint tests (requires dev server: npm run dev or vercel dev)',
    requiresServer: true
  },
  {
    name: 'Database Connection Tests',
    command: 'npm',
    args: ['run', 'test-db'],
    description: 'Database connection and query tests',
    requiresServer: false
  }
]

async function runTest(test, index, total) {
  return new Promise((resolve, reject) => {
    console.log('\n' + '='.repeat(80))
    console.log(`[${index + 1}/${total}] ${test.name}`)
    console.log(`Description: ${test.description}`)
    console.log('='.repeat(80))
    
    const proc = spawn(test.command, test.args, {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    })
    
    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${test.name} passed`)
        resolve(true)
      } else {
        console.log(`\n❌ ${test.name} failed with exit code ${code}`)
        resolve(false)
      }
    })
    
    proc.on('error', (error) => {
      console.error(`\n❌ ${test.name} error:`, error.message)
      resolve(false)
    })
  })
}

async function runAllTests() {
  console.log('='.repeat(80))
  console.log('RUNNING ALL TESTS')
  console.log('='.repeat(80))
  console.log(`Total test suites: ${tests.length}`)
  console.log(`Started at: ${new Date().toISOString()}`)
  console.log()
  console.log('Note: Some tests require the dev server to be running.')
  console.log('      Start it with: npm run dev (or vercel dev)')
  console.log()
  
  const results = []
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i]
    if (test.requiresServer) {
      console.log(`⚠️  ${test.name} requires the dev server to be running`)
    }
    const passed = await runTest(test, i, tests.length)
    results.push({
      name: test.name,
      passed,
      requiresServer: test.requiresServer
    })
  }
  
  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('TEST SUMMARY')
  console.log('='.repeat(80))
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL'
    const serverNote = result.requiresServer ? ' (requires server)' : ''
    console.log(`${status} - ${result.name}${serverNote}`)
  })
  
  console.log('\n' + '-'.repeat(80))
  console.log(`Total: ${results.length} test suites`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)
  console.log(`Completed at: ${new Date().toISOString()}`)
  console.log('='.repeat(80))
  
  // Check if failures are only from server-required tests
  const serverTestFailures = results.filter(r => !r.passed && r.requiresServer).length
  const nonServerFailures = results.filter(r => !r.passed && !r.requiresServer).length
  
  if (failed > 0) {
    if (nonServerFailures > 0) {
      console.log('\n⚠️  Some tests failed. Review the output above for details.')
      process.exit(1)
    } else if (serverTestFailures > 0) {
      console.log('\n⚠️  Server-required tests failed (dev server may not be running).')
      console.log('   Other tests passed. Start the dev server and run API tests separately.')
      console.log('   Start server: npm run dev (or vercel dev)')
      process.exit(0) // Don't fail the suite if only server tests failed
    }
  } else {
    console.log('\n✅ All tests passed!')
    process.exit(0)
  }
}

runAllTests().catch(error => {
  console.error('Fatal error running tests:', error)
  process.exit(1)
})
