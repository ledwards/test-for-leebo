// Discord API utilities for patron role checking
// Requires: DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, DISCORD_PATRON_ROLE_ID
// Optional: DISCORD_FRIEND_ROLE_ID (Friend of the Pod role)

const BOT_TOKEN = process.env['DISCORD_BOT_TOKEN']
const GUILD_ID = process.env['DISCORD_GUILD_ID']
const PATRON_ROLE_ID = process.env['DISCORD_PATRON_ROLE_ID']
const FRIEND_ROLE_ID = process.env['DISCORD_FRIEND_ROLE_ID']

/**
 * Check if a Discord user has the Patreon patron role OR
 * the "Friend of the Pod" role in the server.
 * Returns false gracefully if env vars are not configured, user is not
 * in the server, or the Discord API is unavailable.
 */
export async function isPatron(discordId: string): Promise<boolean> {
  if (!BOT_TOKEN || !GUILD_ID || !PATRON_ROLE_ID) {
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
    if (!Array.isArray(member.roles)) {
      return false
    }

    // Check for Patron role OR Friend of the Pod role
    if (member.roles.includes(PATRON_ROLE_ID)) {
      return true
    }
    if (FRIEND_ROLE_ID && member.roles.includes(FRIEND_ROLE_ID)) {
      return true
    }

    return false
  } catch {
    // Network error, Discord API down, etc.
    return false
  }
}
