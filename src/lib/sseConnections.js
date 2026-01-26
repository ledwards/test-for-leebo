/**
 * SSE Connection Manager
 *
 * Manages Server-Sent Events connections for real-time draft updates.
 * Since Next.js serverless functions are stateless, this uses a simple
 * in-memory store that works within a single server instance.
 *
 * For production scaling across multiple instances, consider:
 * - Redis pub/sub
 * - Upstash Redis
 * - A dedicated WebSocket service
 */

// Map of shareId -> Set of response controllers
const connections = new Map()

// Map of shareId -> timestamp of last activity
const lastActivity = new Map()

// Cleanup stale connections every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
// Remove connections inactive for 30 minutes
const STALE_THRESHOLD = 30 * 60 * 1000
// Maximum number of draft connections to keep in memory
const MAX_DRAFTS = 100

let cleanupTimer = null

function startCleanupTimer() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(cleanupStaleConnections, CLEANUP_INTERVAL)
  // Don't prevent Node.js from exiting
  if (cleanupTimer.unref) cleanupTimer.unref()
}

function cleanupStaleConnections() {
  const now = Date.now()
  const staleShareIds = []

  for (const [shareId, lastTime] of lastActivity.entries()) {
    if (now - lastTime > STALE_THRESHOLD) {
      staleShareIds.push(shareId)
    }
  }

  for (const shareId of staleShareIds) {
    connections.delete(shareId)
    lastActivity.delete(shareId)
  }

  // If we're over the limit, remove oldest drafts
  if (connections.size > MAX_DRAFTS) {
    const sorted = Array.from(lastActivity.entries())
      .sort((a, b) => a[1] - b[1])

    const toRemove = sorted.slice(0, connections.size - MAX_DRAFTS)
    for (const [shareId] of toRemove) {
      connections.delete(shareId)
      lastActivity.delete(shareId)
    }
  }

  if (staleShareIds.length > 0 || connections.size > MAX_DRAFTS * 0.8) {
    const memUsage = process.memoryUsage()
    const memMB = Math.round(memUsage.heapUsed / 1024 / 1024)
    console.log(`[SSE] Cleanup: ${staleShareIds.length} stale removed. Active drafts: ${connections.size}/${MAX_DRAFTS}. Memory: ${memMB}MB`)
  }
}

/**
 * Register a new SSE connection for a draft
 * @param {string} shareId - Draft share ID
 * @param {ReadableStreamDefaultController} controller - Stream controller
 * @returns {function} Cleanup function to remove the connection
 */
export function registerConnection(shareId, controller) {
  if (!connections.has(shareId)) {
    connections.set(shareId, new Set())
  }
  connections.get(shareId).add(controller)

  // Update last activity timestamp
  lastActivity.set(shareId, Date.now())

  // Start cleanup timer if not already running
  startCleanupTimer()

  // Return cleanup function
  return () => {
    const controllers = connections.get(shareId)
    if (controllers) {
      controllers.delete(controller)
      if (controllers.size === 0) {
        connections.delete(shareId)
        lastActivity.delete(shareId)
      }
    }
  }
}

/**
 * Broadcast data to all connected clients for a draft
 * @param {string} shareId - Draft share ID
 * @param {object} data - Data to broadcast
 */
export function broadcast(shareId, data) {
  const controllers = connections.get(shareId)
  if (!controllers || controllers.size === 0) {
    return
  }

  // Update last activity timestamp
  lastActivity.set(shareId, Date.now())

  const message = `data: ${JSON.stringify(data)}\n\n`
  const encoder = new TextEncoder()
  const encoded = encoder.encode(message)

  for (const controller of controllers) {
    try {
      controller.enqueue(encoded)
    } catch (e) {
      // Connection closed, remove it
      controllers.delete(controller)
    }
  }

  // Clean up if no controllers left
  if (controllers.size === 0) {
    connections.delete(shareId)
    lastActivity.delete(shareId)
  }
}

/**
 * Send a heartbeat to all connections for a draft
 * Used to keep connections alive and detect stale ones
 * @param {string} shareId - Draft share ID
 */
export function sendHeartbeat(shareId) {
  broadcast(shareId, { type: 'heartbeat', timestamp: Date.now() })
}

/**
 * Get the number of active connections for a draft
 * @param {string} shareId - Draft share ID
 * @returns {number} Number of active connections
 */
export function getConnectionCount(shareId) {
  return connections.get(shareId)?.size || 0
}

/**
 * Get all active draft share IDs
 * @returns {string[]} Array of share IDs with active connections
 */
export function getActiveDrafts() {
  return Array.from(connections.keys())
}
