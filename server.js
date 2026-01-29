// Custom server for Next.js with Socket.io
import { createServer } from 'http'
import next from 'next'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

const app = next({ dev })
const handle = app.getRequestHandler()

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

  // Handle connections
  io.on('connection', (socket) => {
    if (dev) {
      console.log('Client connected:', socket.id)
    }

    // Join a draft room
    socket.on('join-draft', (shareId) => {
      socket.join(`draft:${shareId}`)
      if (dev) {
        console.log(`Socket ${socket.id} joined draft:${shareId}`)
      }
    })

    socket.on('leave-draft', (shareId) => {
      socket.leave(`draft:${shareId}`)
      if (dev) {
        console.log(`Socket ${socket.id} left draft:${shareId}`)
      }
    })

    socket.on('disconnect', () => {
      if (dev) {
        console.log('Client disconnected:', socket.id)
      }
    })
  })

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
