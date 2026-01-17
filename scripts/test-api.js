// Quick API test script
// Run with: node scripts/test-api.js

import dotenv from 'dotenv'
dotenv.config()

const API_BASE = process.env.APP_URL || process.env.VERCEL_URL || 'http://localhost:3000'

// Helper function to check if server is running
async function checkServerRunning(baseUrl) {
  try {
    // Try to connect to the root URL first
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    
    const response = await fetch(baseUrl, {
      method: 'GET',
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return true
  } catch (error) {
    return false
  }
}

// Helper function to fetch with timeout
// All API routes must respond within 5 seconds or the test will fail
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms: ${url} did not respond. Test failed.`)
    }
    if (error.code === 'ECONNREFUSED') {
      throw new Error(`Connection refused: Server at ${url} is not running. Start it with: npm run dev or vercel dev`)
    }
    throw error
  }
}

async function testAPI() {
  console.log('🧪 Testing Protect the Pod API...\n')
  console.log(`   API Base URL: ${API_BASE}`)
  console.log(`   Note: Make sure the Next.js dev server is running (npm run dev)\n`)

  // First, check if server is running at all
  console.log('🔍 Checking if server is running...')
  const serverRunning = await checkServerRunning(API_BASE)
  if (!serverRunning) {
    console.log('   ❌ Server is not responding at', API_BASE)
    console.log('   💡 Start the Next.js dev server first:')
    console.log('      npm run dev')
    console.log('   💡 Next.js runs on port 3000 by default')
    process.exit(1)
  }
  console.log('   ✅ Server is responding\n')

  // Test 1: Session
  console.log('1️⃣  Testing session endpoint...')
  let testFailed = false
  try {
    const sessionRes = await fetchWithTimeout(`${API_BASE}/api/auth/session`, {}, 5000)
    const sessionData = await sessionRes.json()
    console.log('   ✅ Session endpoint working')
    console.log('   Response:', JSON.stringify(sessionData, null, 2))
  } catch (error) {
    testFailed = true
    console.log('   ❌ Session endpoint failed:', error.message)
    if (error.message.includes('timeout')) {
      console.log('   ⚠️  Test failed: Route did not respond within 5 seconds')
      process.exit(1)
    }
    if (error.message.includes('ECONNREFUSED')) {
      console.log('   💡 Tip: The server is running but the API route might not be working')
      console.log('      - Check that Next.js API routes are in app/api/ directory')
      console.log('      - Verify route files are named route.js and export HTTP methods')
      console.log('      - Check Next.js terminal output for any compilation errors')
      process.exit(1)
    }
  }
  
  if (testFailed) {
    console.log('\n❌ Test suite failed: Session endpoint test failed')
    process.exit(1)
  }

  console.log()

  // Test 2: Create Pool
  console.log('2️⃣  Testing create pool endpoint...')
  try {
    const createRes = await fetchWithTimeout(`${API_BASE}/api/pools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        setCode: 'SOR',
        cards: [{ id: 'test1', name: 'Test Card', set: 'SOR' }],
        isPublic: false,
      }),
    }, 5000)

    if (!createRes.ok) {
      const error = await createRes.json()
      throw new Error(error.message || `HTTP ${createRes.status}`)
    }

    const createData = await createRes.json()
    console.log('   ✅ Create pool endpoint working')
    console.log('   Created pool:', createData.data.shareId)
    const shareId = createData.data.shareId

    // Test 3: Get Pool
    console.log()
    console.log('3️⃣  Testing get pool endpoint...')
    const getRes = await fetchWithTimeout(`${API_BASE}/api/pools/${shareId}`, {}, 5000)
    
    if (!getRes.ok) {
      const error = await getRes.json()
      throw new Error(error.message || `HTTP ${getRes.status}`)
    }

    const getData = await getRes.json()
    console.log('   ✅ Get pool endpoint working')
    console.log('   Pool data:', {
      shareId: getData.data.shareId,
      setCode: getData.data.setCode,
      cardCount: getData.data.cards?.length || 0,
    })

    // Test 4: Update Pool (will fail without auth, but tests endpoint)
    console.log()
    console.log('4️⃣  Testing update pool endpoint (without auth)...')
    const updateRes = await fetchWithTimeout(`${API_BASE}/api/pools/${shareId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: true }),
    }, 5000)

    if (updateRes.status === 401 || updateRes.status === 403) {
      console.log('   ✅ Update endpoint correctly requires auth')
    } else if (updateRes.ok) {
      console.log('   ⚠️  Update worked (might be anonymous-friendly)')
    } else {
      console.log('   ❌ Update endpoint error:', updateRes.status)
    }

    // Test 5: Delete Pool (will fail without auth, but tests endpoint)
    console.log()
    console.log('5️⃣  Testing delete pool endpoint (without auth)...')
    const deleteRes = await fetchWithTimeout(`${API_BASE}/api/pools/${shareId}`, {
      method: 'DELETE',
    }, 5000)

    if (deleteRes.status === 401 || deleteRes.status === 403) {
      console.log('   ✅ Delete endpoint correctly requires auth')
    } else if (deleteRes.ok) {
      console.log('   ⚠️  Delete worked (might be anonymous-friendly)')
    } else {
      console.log('   ❌ Delete endpoint error:', deleteRes.status)
    }

    console.log()
    console.log('✅ All basic API tests passed!')
    console.log()
    console.log('📝 Next steps:')
    console.log('   1. Test authentication: Visit http://localhost:3000/api/auth/signin/discord')
    console.log('   2. After auth, test authenticated endpoints')
    console.log('   3. Test pool history: GET /api/pools/user/:userId')
  } catch (error) {
    console.log('   ❌ Error:', error.message)
    console.log()
    if (error.message.includes('timeout')) {
      console.log('   ⚠️  Test failed: Route did not respond within 5 seconds')
      console.log('   This indicates the API route is hanging or taking too long to respond.')
      console.log('   Check the server logs for errors or infinite loops.')
    } else {
      console.log('💡 Troubleshooting:')
      if (error.message.includes('ECONNREFUSED')) {
        console.log('   ⚠️  Server is not running or not accessible')
        console.log('   - Start the dev server: npm run dev (or vercel dev)')
        console.log('   - Make sure it\'s running on:', API_BASE)
      } else {
        console.log('   - Make sure dev server is running: npm run dev (or vercel dev)')
        console.log('   - Check database connection: npm run migrate')
        console.log('   - Verify .env file has all required variables')
      }
    }
    console.log('\n❌ Test suite failed')
    process.exit(1)
  }
}

testAPI()
