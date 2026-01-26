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

  // Return cleanup function
  return () => {
    const controllers = connections.get(shareId)
    if (controllers) {
      controllers.delete(controller)
      if (controllers.size === 0) {
        connections.delete(shareId)
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
