// GET /api/health - Health check endpoint with memory and connection stats
import { getActiveDrafts, getConnectionCount } from '@/src/lib/sseConnections.js'
import { testConnection } from '@/lib/db.js'

export async function GET() {
  try {
    const memUsage = process.memoryUsage()
    const activeDrafts = getActiveDrafts()

    // Test database connection
    const dbHealthy = await testConnection()

    // Calculate total connections
    let totalConnections = 0
    const draftConnections = {}
    for (const shareId of activeDrafts) {
      const count = getConnectionCount(shareId)
      draftConnections[shareId] = count
      totalConnections += count
    }

    // Memory stats in MB
    const stats = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
      },
      connections: {
        activeDrafts: activeDrafts.length,
        totalConnections,
        perDraft: draftConnections,
      },
      database: {
        connected: dbHealthy,
      },
    }

    // Warn if memory usage is high (over 400MB)
    if (stats.memory.heapUsed > 400) {
      stats.status = 'warning'
      stats.warning = 'High memory usage detected'
    }

    // Warn if too many connections
    if (totalConnections > 200) {
      stats.status = 'warning'
      stats.warning = 'High connection count'
    }

    return Response.json(stats)
  } catch (error) {
    console.error('Health check error:', error)
    return Response.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
