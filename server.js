// Custom server for Next.js with Socket.io - v2
import 'dotenv/config'
import { createServer } from 'http'
import { spawn } from 'child_process'
import next from 'next'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

console.log('🚀 Starting custom server.js with Socket.io support')

// Run migrations at startup (for Railway where build-time DB access doesn't work)
async function runMigrations() {
  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!dbUrl) {
    console.log('⚠️  No database URL set, skipping migrations')
    return
  }

  // Only run migrations if we have an internal Railway URL (skipped during build)
  if (!dbUrl.includes('.railway.internal')) {
    console.log('ℹ️  External database URL - migrations should have run during build')
    return
  }

  console.log('🔧 Running migrations at startup...')

  return new Promise((resolve) => {
    const migrate = spawn('node', ['scripts/migrate-on-deploy.js'], {
      env: { ...process.env, POSTGRES_URL: dbUrl },
      stdio: 'inherit'
    })

    migrate.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Migrations completed')
      } else {
        console.log('⚠️  Migration process exited with code', code)
      }
      resolve()
    })

    migrate.on('error', (err) => {
      console.error('Migration error:', err)
      resolve()
    })
  })
}

const app = next({ dev })
const handle = app.getRequestHandler()

// Run migrations before starting
await runMigrations()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res)
  })

  // Socket.io setup
  const io = new Server(server, {
    cors: { origin: '*' }
  })

  // Store globally so API routes can access it
  global.io = io

  io.on('connection', (socket) => {
    socket.on('join-draft', (shareId) => {
      socket.join(`draft:${shareId}`)
    })

    socket.on('leave-draft', (shareId) => {
      socket.leave(`draft:${shareId}`)
    })
  })

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
