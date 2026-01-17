// Migration script for Vercel deployments
// This runs automatically during build/deploy
// Usage: node scripts/migrate-on-deploy.js

import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pg from 'pg'

const { Client } = pg

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get database URL from environment (Vercel provides this)
function getDatabaseUrl() {
  const dbUrl = process.env.POSTGRES_URL
  if (!dbUrl) {
    console.error('❌ Error: POSTGRES_URL is not set')
    console.error('   This script should run during Vercel deployment where POSTGRES_URL is automatically set')
    process.exit(1)
  }
  return dbUrl
}

// Create database client with SSL support
function createDbClient(connectionString) {
  let normalizedConnectionString = connectionString
  
  if (normalizedConnectionString.includes('sslmode=')) {
    normalizedConnectionString = normalizedConnectionString
      .replace(/sslmode=prefer/gi, 'sslmode=verify-full')
      .replace(/sslmode=require/gi, 'sslmode=verify-full')
      .replace(/sslmode=verify-ca/gi, 'sslmode=verify-full')
  } else {
    const isCloudDB = normalizedConnectionString.includes('.neon.tech') || 
                      normalizedConnectionString.includes('.supabase.co') ||
                      normalizedConnectionString.includes('.aws.neon.tech')
    
    if (isCloudDB) {
      const separator = normalizedConnectionString.includes('?') ? '&' : '?'
      normalizedConnectionString = `${normalizedConnectionString}${separator}sslmode=verify-full`
    }
  }
  
  const requiresSSL = normalizedConnectionString.includes('sslmode=verify-full') ||
                      normalizedConnectionString.includes('sslmode=require') ||
                      normalizedConnectionString.includes('ssl=true')
  
  return new Client({
    connectionString: normalizedConnectionString,
    ssl: requiresSSL ? { rejectUnauthorized: true } : false
  })
}

// Get all migration files sorted by name
function getMigrationFiles() {
  const migrationsDir = join(__dirname, '../migrations')
  const files = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .filter(file => file !== '000_migration_tracking.sql')
    .sort()
  
  return files.map(file => ({
    name: file,
    path: join(migrationsDir, file)
  }))
}

// Check if migration has been applied
async function isMigrationApplied(client, migrationName) {
  try {
    const result = await client.query(
      'SELECT 1 FROM migrations WHERE migration_name = $1',
      [migrationName]
    )
    return result.rows.length > 0
  } catch (error) {
    if (error.message && (error.message.includes('does not exist') || error.message.includes('relation "migrations"'))) {
      return false
    }
    throw error
  }
}

// Mark migration as applied
async function markMigrationApplied(client, migrationName) {
  await client.query(
    'INSERT INTO migrations (migration_name) VALUES ($1) ON CONFLICT (migration_name) DO NOTHING',
    [migrationName]
  )
}

// Run a single migration
async function runMigration(client, migrationFile) {
  const migrationName = migrationFile.name
  
  const isApplied = await isMigrationApplied(client, migrationName)
  if (isApplied) {
    console.log(`⏭️  Skipping ${migrationName} (already applied)`)
    return false
  }
  
  console.log(`📦 Running ${migrationName}...`)
  
  const migrationSQL = readFileSync(migrationFile.path, 'utf-8')
  await client.query(migrationSQL)
  
  await markMigrationApplied(client, migrationName)
  
  console.log(`✅ Applied ${migrationName}`)
  return true
}

// Ensure migration tracking table exists
async function ensureMigrationTable(client) {
  const trackingMigrationPath = join(__dirname, '../migrations/000_migration_tracking.sql')
  const trackingSQL = readFileSync(trackingMigrationPath, 'utf-8')
  
  try {
    await client.query(trackingSQL)
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error
    }
  }
}

// Main migration function
async function runMigrations() {
  let client = null
  
  try {
    const dbUrl = getDatabaseUrl()
    const isProduction = process.env.VERCEL_ENV === 'production'
    
    console.log(`\n🔧 Running migrations for ${isProduction ? 'PRODUCTION' : 'PREVIEW'} environment...`)
    
    client = createDbClient(dbUrl)
    await client.connect()
    console.log('✅ Connected to database\n')
    
    await ensureMigrationTable(client)
    
    const migrationFiles = getMigrationFiles()
    
    if (migrationFiles.length === 0) {
      console.log('⚠️  No migration files found')
      process.exit(0)
    }
    
    console.log(`📋 Found ${migrationFiles.length} migration file(s)\n`)
    
    let appliedCount = 0
    for (const migrationFile of migrationFiles) {
      const applied = await runMigration(client, migrationFile)
      if (applied) {
        appliedCount++
      }
    }
    
    if (appliedCount === 0) {
      console.log('\n✅ All migrations are already applied!')
    } else {
      console.log(`\n✅ Migration completed! Applied ${appliedCount} migration(s)`)
    }
    
    await client.end()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    if (client && typeof client.end === 'function') {
      try {
        await client.end()
      } catch (e) {
        // Ignore errors on close
      }
    }
  }
}

// Only run if POSTGRES_URL is set (i.e., during Vercel deployment)
if (process.env.POSTGRES_URL) {
  runMigrations()
} else {
  console.log('⚠️  POSTGRES_URL not set. Skipping migrations (this is normal for local development).')
  console.log('   Migrations will run automatically during Vercel deployment.')
  process.exit(0)
}
