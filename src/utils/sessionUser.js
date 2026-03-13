export function toSessionUser(session) {
  if (!session) {
    return null
  }

  const user = {
    id: session.id,
    email: session.email,
    username: session.username,
    avatar_url: session.avatar_url || null,
  }

  // Preserve Patreon-related fields so subscribers can see status/banner in UI.
  for (const [key, value] of Object.entries(session)) {
    if (key.startsWith('patreon') || key.startsWith('is_patreon')) {
      user[key] = value
    }
  }

  return user
}
