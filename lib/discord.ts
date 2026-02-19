// Discord API utilities for beta access role checking
// Requires: DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, DISCORD_FRIEND_OF_THE_POD_ROLE_ID

const BOT_TOKEN = process.env['DISCORD_BOT_TOKEN']
const GUILD_ID = process.env['DISCORD_GUILD_ID']
const FRIEND_ROLE_ID = process.env['DISCORD_FRIEND_OF_THE_POD_ROLE_ID']

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
