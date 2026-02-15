// POST /api/pools - Create a new card pool
import { query } from '@/lib/db.js'
import { requireAuth } from '@/lib/auth.js'
import { generateShareId, jsonResponse, parseBody, validateRequired, handleApiError } from '@/lib/utils.js'
import { getSetConfig } from '@/src/utils/setConfigs/index.js'
import { trackBulkGenerations } from '@/src/utils/trackGeneration.js'
import { createPostHandler } from './route-handler.js'

export const POST = createPostHandler({
  query,
  requireAuth,
  generateShareId,
  parseBody,
  validateRequired,
  getSetConfig,
  trackBulkGenerations,
  jsonResponse,
  handleApiError,
})
