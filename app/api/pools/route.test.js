// Test for pools API route - showcase leader tracking bug
// BUG: When creating a sealed pool, showcase leaders are tracked in card_generations
// but the user_id is not passed, so it's stored as NULL. This causes the showcase
// leaders to not appear in the user's showcase collection.

import { describe, it, mock } from 'node:test'
import assert from 'node:assert'
import { createPostHandler } from './route-handler.js'

const baseCards = [
  { id: 'card-1', name: 'Test Card 1' },
  { id: 'card-2', name: 'Test Card 2' },
]

function buildHandler({ body, userId = 'test-user-123' }) {
  const trackBulkGenerations = mock.fn(async () => {})
  const query = mock.fn(async () => ({
    rows: [
      {
        id: 123,
        share_id: body.shareId ?? 'generated-share-id',
        created_at: '2024-01-01T00:00:00Z',
      },
    ],
  }))

  const POST = createPostHandler({
    query,
    requireAuth: mock.fn(() => ({ id: userId })),
    generateShareId: mock.fn(() => 'generated-share-id'),
    parseBody: mock.fn(async () => body),
    validateRequired: mock.fn(() => {}),
    getSetConfig: mock.fn(() => ({ setName: 'Test Set' })),
    trackBulkGenerations,
    jsonResponse: mock.fn((data, status) => ({ data, status })),
    handleApiError: mock.fn((error) => {
      throw error
    }),
    logger: { error: mock.fn() },
  })

  return { POST, trackBulkGenerations }
}

describe('POST /api/pools - showcase leader tracking bug', () => {
  it('calls trackBulkGenerations with userId for packs array path', async () => {
    const userId = 'test-user-123'
    const body = {
      setCode: 'TST',
      shareId: 'share-123',
      cards: baseCards,
      packs: [baseCards],
    }

    const { POST, trackBulkGenerations } = buildHandler({ body, userId })

    await POST({})

    assert.strictEqual(trackBulkGenerations.mock.calls.length, 1)
    const [records] = trackBulkGenerations.mock.calls[0].arguments

    assert.strictEqual(records.length, baseCards.length)
    records.forEach(record => {
      assert.strictEqual(record.options.userId, userId)
      assert.strictEqual(record.options.packIndex, 0)
    })
  })

  it('calls trackBulkGenerations with userId for cards fallback path', async () => {
    const userId = 'test-user-456'
    const body = {
      setCode: 'TST',
      shareId: 'share-456',
      cards: baseCards,
    }

    const { POST, trackBulkGenerations } = buildHandler({ body, userId })

    await POST({})

    assert.strictEqual(trackBulkGenerations.mock.calls.length, 1)
    const [records] = trackBulkGenerations.mock.calls[0].arguments

    assert.strictEqual(records.length, baseCards.length)
    records.forEach(record => {
      assert.strictEqual(record.options.userId, userId)
      assert.strictEqual(record.options.packIndex, null)
    })
  })
})
