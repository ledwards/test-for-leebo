// Discord API utilities for beta access role checking
// Requires: DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, DISCORD_FRIEND_OF_THE_POD_ROLE_ID

const BOT_TOKEN = process.env['DISCORD_BOT_TOKEN']
const GUILD_ID = process.env['DISCORD_GUILD_ID']
const FRIEND_ROLE_ID = process.env['DISCORD_FRIEND_OF_THE_POD_ROLE_ID']
const BETA_TESTER_ROLE_ID = process.env['DISCORD_BETA_TESTER_ROLE_ID']

/**
 * Check if a Discord user has the "Friend of the Pod" role in the server.
 * Returns false gracefully if env vars are not configured, user is not
 * in the server, or the Discord API is unavailable.
 */
export async function isPatron(discordId: string): Promise<boolean> {
  if (!BOT_TOKEN || !GUILD_ID || !FRIEND_ROLE_ID) {
    return false
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}`,
      {
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
        },
      }
    )

    if (!response.ok) {
      // 404 = user not in server, other errors = API issue
      return false
    }

    const member = await response.json()
    return Array.isArray(member.roles) && member.roles.includes(FRIEND_ROLE_ID)
  } catch {
    // Network error, Discord API down, etc.
    return false
  }
}

/**
 * Check if a Discord user is a member of the server.
 * Returns false gracefully if env vars are not configured or API is unavailable.
 */
export async function isGuildMember(discordId: string): Promise<boolean> {
  if (!BOT_TOKEN || !GUILD_ID) {
    return false
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}`,
      {
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
        },
      }
    )

    return response.ok
  } catch {
    return false
  }
}

/**
 * Add a role to a Discord user in the server.
 * Returns true if successful, false on any error.
 */
export async function addRole(discordId: string, roleId: string): Promise<boolean> {
  if (!BOT_TOKEN || !GUILD_ID) {
    return false
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}/roles/${roleId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
        },
      }
    )

    return response.ok || response.status === 204
  } catch {
    return false
  }
}

/**
 * Add the beta tester role to a Discord user.
 * No-op if DISCORD_BETA_TESTER_ROLE_ID is not configured.
 */
export async function addBetaTesterRole(discordId: string): Promise<boolean> {
  if (!BETA_TESTER_ROLE_ID) {
    return false
  }
  return addRole(discordId, BETA_TESTER_ROLE_ID)
}
