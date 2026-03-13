import { describe, it } from 'node:test'
import assert from 'node:assert'
import { toSessionUser } from './sessionUser.js'

describe('toSessionUser', () => {
  it('preserves patreon status and banner fields', () => {
    const session = {
      id: 'user-1',
      email: 'patron@example.com',
      username: 'patron',
      avatar_url: 'https://cdn.example/avatar.png',
      is_patreon: true,
      patreon_tier: 'gold',
      patreon_banner_url: 'https://cdn.example/banner.png',
    }

    const user = toSessionUser(session)

    assert.equal(user.id, 'user-1')
    assert.equal(user.is_patreon, true)
    assert.equal(user.patreon_tier, 'gold')
    assert.equal(user.patreon_banner_url, 'https://cdn.example/banner.png')
  })
})
