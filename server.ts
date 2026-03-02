// @ts-nocheck
// Custom server for Next.js with Socket.io - v2
import 'dotenv/config'
import { createServer, IncomingMessage, ServerResponse } from 'http'
import { spawn } from 'child_process'
import next from 'next'
import { Server } from 'socket.io'
import { query, queryRow } from './lib/db.js'
import { broadcastPublicPodsUpdate } from './src/lib/socketBroadcast.js'
import { postUserMessageForPod, postLobbyMessage } from './lib/discordLfg.js'

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

  // In-memory presence tracking: userId → Set<socketId>
  const presenceMap = new Map<string, Set<string>>()

  // Delist timers: when a host disconnects, wait before hiding their public pods
  const delistTimers = new Map<string, NodeJS.Timeout>()
  const DELIST_DELAY_MS = 60_000 // 60 seconds

  function startDelistTimer(userId: string): void {
    // Cancel any existing timer first
    cancelDelistTimer(userId)
    const timer = setTimeout(async () => {
      delistTimers.delete(userId)
      try {
        const result = await query(
          `UPDATE pods SET is_public = false WHERE host_id = $1 AND is_public = true AND status = 'waiting'`,
          [userId]
        )
        if (result.rowCount && result.rowCount > 0) {
          console.log(`[Delist] Host ${userId} disconnected >60s, delisted ${result.rowCount} public pod(s)`)
          await broadcastPublicPodsUpdate()
        }
      } catch (err) {
        console.error('[Delist] Failed to delist pods:', err)
      }
    }, DELIST_DELAY_MS)
    delistTimers.set(userId, timer)
  }

  function cancelDelistTimer(userId: string): void {
    const timer = delistTimers.get(userId)
    if (timer) {
      clearTimeout(timer)
      delistTimers.delete(userId)
    }
  }

  function broadcastPresenceCount(): void {
    const count = presenceMap.size
    io.to('presence').emit('presence:count', { count })
  }

  io.on('connection', (socket) => {
    console.log('[DEBUG] Socket.io client connected:', socket.id)

    // Presence tracking - subscribe to count updates (no userId needed)
    socket.on('presence:subscribe', () => {
      socket.join('presence')
      socket.emit('presence:count', { count: presenceMap.size })
    })

    // Presence tracking - join as a counted user (requires userId)
    socket.on('presence:join', (userId: string) => {
      if (!userId) return
      socket.join('presence')
      ;(socket as any)._presenceUserId = userId
      if (!presenceMap.has(userId)) {
        presenceMap.set(userId, new Set())
      }
      presenceMap.get(userId)!.add(socket.id)
      cancelDelistTimer(userId)
      broadcastPresenceCount()
    })

    socket.on('join-draft', (shareId: string) => {
      socket.join(`draft:${shareId}`)
    })

    socket.on('leave-draft', (shareId: string) => {
      socket.leave(`draft:${shareId}`)
    })

    socket.on('join-rotisserie', (shareId: string) => {
      socket.join(`rotisserie:${shareId}`)
    })

    socket.on('leave-rotisserie', (shareId: string) => {
      socket.leave(`rotisserie:${shareId}`)
    })

    socket.on('join-pod', (shareId: string) => {
      socket.join(`pod:${shareId}`)
    })

    socket.on('leave-pod', (shareId: string) => {
      socket.leave(`pod:${shareId}`)
    })

    socket.on('join-sealed', (shareId: string) => {
      socket.join(`sealed:${shareId}`)
    })

    socket.on('leave-sealed', (shareId: string) => {
      socket.leave(`sealed:${shareId}`)
    })

    // Chat room handlers
    socket.on('join-chat', (shareId: string) => {
      socket.join(`chat:${shareId}`)
    })

    socket.on('leave-chat', (shareId: string) => {
      socket.leave(`chat:${shareId}`)
    })

    socket.on('chat:send', async (data: { shareId: string; text: string; username: string; avatarUrl: string | null }) => {
      const { shareId, text, username, avatarUrl } = data
      if (!shareId || !text || !username) return

      const message = {
        username,
        avatarUrl,
        text,
        timestamp: new Date().toISOString(),
        isSystem: false,
      }

      // Broadcast to all web clients in the chat room
      io.to(`chat:${shareId}`).emit('chat:message', message)

      // Post to Discord thread (fire-and-forget) — Discord is the persistence layer
      postUserMessageForPod(shareId, username, avatarUrl, text).catch(() => {})
    })

    // Lobby chat room handlers (channel-level, mirrors #draft-now / #sealed-now)
    socket.on('join-lobby-chat', (lobbyType: string) => {
      if (lobbyType === 'draft' || lobbyType === 'sealed') {
        socket.join(`lobby-chat:${lobbyType}`)
      }
    })

    socket.on('leave-lobby-chat', (lobbyType: string) => {
      if (lobbyType === 'draft' || lobbyType === 'sealed') {
        socket.leave(`lobby-chat:${lobbyType}`)
      }
    })

    socket.on('lobby-chat:send', async (data: { lobbyType: string; text: string; username: string; avatarUrl: string | null }) => {
      const { lobbyType, text, username, avatarUrl } = data
      if (!lobbyType || !text || !username) return
      if (lobbyType !== 'draft' && lobbyType !== 'sealed') return

      const message = {
        username,
        avatarUrl,
        text,
        timestamp: new Date().toISOString(),
        isSystem: false,
      }

      // Broadcast to all web clients in the lobby chat room
      io.to(`lobby-chat:${lobbyType}`).emit('lobby-chat:message', message)

      // Post to Discord channel (fire-and-forget)
      postLobbyMessage(lobbyType as 'draft' | 'sealed', username, avatarUrl, text).catch(() => {})
    })

    socket.on('join-public-pods', () => {
      socket.join('public-pods')
    })

    socket.on('leave-public-pods', () => {
      socket.leave('public-pods')
    })

    socket.on('disconnect', () => {
      const userId = (socket as any)._presenceUserId as string | undefined
      if (userId && presenceMap.has(userId)) {
        const sockets = presenceMap.get(userId)!
        sockets.delete(socket.id)
        if (sockets.size === 0) {
          presenceMap.delete(userId)
          startDelistTimer(userId)
        }
        broadcastPresenceCount()
      }
    })
  })

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
