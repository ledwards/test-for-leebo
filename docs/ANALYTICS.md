# Analytics (PostHog)

Protect the Pod uses [PostHog](https://posthog.com) for product analytics to understand how users interact with the app.

## Setup

1. Create a PostHog account at https://app.posthog.com
2. Get your Project API Key from Project Settings
3. Add environment variables:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Leave `NEXT_PUBLIC_POSTHOG_KEY` blank to disable analytics entirely.

## What's Tracked

### Automatic (PostHog built-in)
- **Page views** - Every route change
- **Device info** - Mobile/Desktop/Tablet, screen size
- **Browser** - Chrome, Safari, Firefox, etc.
- **OS** - iOS, Android, Windows, macOS, etc.
- **Referrer** - Where users came from

### User Identification
- Logged-in users are identified by their user ID
- Properties: `discord_username`, `is_admin`, `is_beta_tester`
- Anonymous users are tracked per-session without a persistent profile

### Custom Events

| Event | Properties | When |
|-------|------------|------|
| `user_signed_in` | `is_beta_tester`, `is_admin` | User logs in via Discord |
| `user_signed_out` | - | User logs out |
| `beta_enrolled` | - | User enrolls in beta program |
| `sealed_pool_created` | `set_code`, `pack_count`, `card_count` | New sealed pool generated |
| `draft_created` | `set_code` | New draft pod created |
| `chaos_sealed_created` | `set_codes`, `unique_sets`, `pack_count` | Chaos sealed pool created |
| `chaos_draft_created` | `set_codes`, `unique_sets` | Chaos draft created |
| `pack_wars_created` | `set_code` | Pack wars game created |
| `pack_blitz_created` | `set_code` | Pack blitz game created |
| `rotisserie_created` | - | Rotisserie draft created |
| `deck_builder_opened` | `set_code`, `pool_type`, `view_mode` | User opens deck builder |
| `deck_builder_view_changed` | `from_view`, `to_view`, `set_code`, `pool_type` | User switches view mode |
| `deck_exported_json` | `set_code`, `pool_type`, `deck_size`, `sideboard_size` | Deck exported as JSON file |
| `deck_copied_json` | `set_code`, `pool_type`, `deck_size`, `sideboard_size` | Deck JSON copied to clipboard |
| `deck_image_generated` | `set_code`, `pool_type`, `deck_size`, `sideboard_size` | Deck image created |
| `pool_image_generated` | `set_code`, `pool_type`, `deck_size`, `pool_size`, `other_leaders`, `other_bases` | Full pool image created |

## Usage in Code

### In React Components

```typescript
import { useAnalytics, AnalyticsEvents } from '@/src/hooks/useAnalytics'

function MyComponent() {
  const { track } = useAnalytics()

  const handleAction = () => {
    track(AnalyticsEvents.SEALED_POOL_CREATED, {
      set_code: 'LAW',
      pack_count: 6,
    })
  }
}
```

### Outside React (callbacks, utilities)

```typescript
import { trackEvent, AnalyticsEvents } from '@/src/hooks/useAnalytics'

trackEvent(AnalyticsEvents.USER_SIGNED_IN, { is_beta_tester: true })
```

## Architecture

- `src/contexts/PostHogProvider.tsx` - Provider component, initializes PostHog
- `src/hooks/useAnalytics.ts` - Hook and standalone function for tracking
- `app/layout.tsx` - Provider wrapped around the app

## Privacy

- Uses `person_profiles: 'identified_only'` - only creates user profiles for logged-in users
- Anonymous visitors get pageviews tracked but no persistent profile
- No cookie consent banner (acceptable risk for hobby project)
