// Test database connection
// Usage: node scripts/test-db-connection.js [dev|prod]

import pg from 'pg'
import dotenv from 'dotenv'

const { Client } = pg

// Load environment variables
dotenv.config()

// Get environment from command line
const env = process.argv[2] || 'dev'
const isProd = env === 'prod'

// Get database URL
function getDatabaseUrl() {
  const dbUrl = process.env.POSTGRES_URL
  if (!dbUrl) {
    console.error('❌ Error: POSTGRES_URL is not set')
    if (isProd) {
      console.error('   For production, ensure POSTGRES_URL points to production database')
    } else {
      console.error('   For development, ensure POSTGRES_URL points to development database')
    }
    process.exit(1)
  }
  return dbUrl
}

async function testConnection() {
  let dbUrl = getDatabaseUrl()
  
  // Normalize SSL mode to avoid deprecation warnings
  // Replace 'prefer', 'require', 'verify-ca' with 'verify-full' explicitly
  if (dbUrl.includes('sslmode=')) {
    // Replace deprecated SSL modes with verify-full
    dbUrl = dbUrl
      .replace(/sslmode=prefer/gi, 'sslmode=verify-full')
      .replace(/sslmode=require/gi, 'sslmode=verify-full')
      .replace(/sslmode=verify-ca/gi, 'sslmode=verify-full')
  } else {
    // For Neon and other cloud databases, add explicit SSL mode
    const isCloudDB = dbUrl.includes('.neon.tech') || 
                      dbUrl.includes('.supabase.co') ||
                      dbUrl.includes('.aws.neon.tech')
    
    if (isCloudDB) {
      // Add sslmode=verify-full to connection string
      const separator = dbUrl.includes('?') ? '&' : '?'
      dbUrl = `${dbUrl}${separator}sslmode=verify-full`
    }
  }
  
  // Determine if SSL is needed
  const requiresSSL = dbUrl.includes('sslmode=verify-full') ||
                      dbUrl.includes('sslmode=require') ||
                      dbUrl.includes('ssl=true')
  
  const client = new Client({
    connectionString: dbUrl,
    ssl: requiresSSL ? { rejectUnauthorized: true } : false
  })

  try {
    console.log(`\n🔌 Testing ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'} database connection...`)
    console.log(`   Environment: ${env}`)
    
    await client.connect()
    console.log('✅ Connected to database')
    
    const result = await client.query('SELECT version(), current_database(), current_user')
    console.log('\n📊 Database Info:')
    console.log(`   PostgreSQL Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`)
    console.log(`   Database: ${result.rows[0].current_database}`)
    console.log(`   User: ${result.rows[0].current_user}`)
    
    // Test migrations table
    try {
      const migrationResult = await client.query('SELECT COUNT(*) as count FROM migrations')
      console.log(`\n📦 Migrations: ${migrationResult.rows[0].count} applied`)
    } catch (e) {
      if (e.message && e.message.includes('does not exist')) {
        console.log('\n📦 Migrations: No migrations table (run migrations first)')
      } else {
        throw e
      }
    }
    
    console.log('\n✅ Database connection test passed!')
    await client.end()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Database connection failed:', error.message)
    if (error.code) {
      console.error(`   Error code: ${error.code}`)
    }
    await client.end().catch(() => {})
    process.exit(1)
  }
}

testConnection()
