// @ts-nocheck
// Custom server for Next.js with Socket.io - v2
import 'dotenv/config'
import { createServer, IncomingMessage, ServerResponse } from 'http'
import { spawn } from 'child_process'
import next from 'next'
import { Server } from 'socket.io'

declare global {
  var io: Server | undefined
}

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

console.log('🚀 Starting custom server.ts with Socket.io support')

// Run migrations at startup (for Railway where build-time DB access doesn't work)
async function runMigrations(): Promise<void> {
  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!dbUrl) {
    console.log('⚠️  No database URL set, skipping migrations')
    return
  }

  console.log('🔧 Running migrations at startup...')

  return new Promise((resolve) => {
    const migrate = spawn('npx', ['tsx', 'scripts/migrate-on-deploy.ts'], {
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
  // Create server WITHOUT a request handler first
  const server = createServer()

  // Attach Socket.io BEFORE adding request handler
  const io = new Server(server, {
    cors: { origin: '*' },
    path: '/socket.io/'
  })

  // Now add request handler for Next.js (non-socket.io requests)
  server.on('request', (req: IncomingMessage, res: ServerResponse) => {
    // Health check endpoint
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, socketio: !!io }))
      return
    }
    if (req.url?.startsWith('/socket.io')) {
      console.log('[DEBUG] Socket.io request (letting engine handle):', req.method, req.url)
      return
    }
    handle(req, res)
  })

  // Store globally so API routes can access it
  global.io = io

  io.on('connection', (socket) => {
    console.log('[DEBUG] Socket.io client connected:', socket.id)
    socket.on('join-draft', (shareId: string) => {
      socket.join(`draft:${shareId}`)
    })

    socket.on('leave-draft', (shareId: string) => {
      socket.leave(`draft:${shareId}`)
    })
  })

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
