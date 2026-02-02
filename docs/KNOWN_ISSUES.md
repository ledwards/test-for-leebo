# Known Issues

## Draft Showcase Tracking Attribution

**Status:** Open
**Severity:** Medium
**Affected:** Draft showcase leader tracking

### Description

When a draft starts, all generated cards (packs and leaders for all players) are tracked in `card_generations` with the **host's user_id**, not the individual players who will draft those cards.

This means:
- Only the draft host gets credit for showcase leaders that appear in any player's packs
- Other players who actually draft showcase leaders don't see them in their Showcases collection

### Location

`app/api/draft/[shareId]/start/route.js` lines 59-96:

```javascript
// All cards tracked with session.id (the host)
trackingRecords.push({
  card,
  options: {
    ...
    userId: session.id  // <- Always the host, not the player who will draft this
  }
})
```

### Proposed Fix

Track showcase leaders when they are **picked** by a player, not when packs are generated:

1. Add tracking call in the pick/select endpoints when a player drafts a leader
2. Only track showcase leaders (not all cards) to minimize overhead
3. Update the backfill migration to use `drafted_leaders` from `draft_pod_players` to attribute correctly

### Workaround

For now, showcase leaders from drafts only appear in the host's collection. Players who want their showcases tracked should create sealed pools instead.

### Related Files

- `app/api/draft/[shareId]/start/route.js` - Pack generation and initial tracking
- `app/api/draft/[shareId]/pick/route.js` - Where picks happen
- `src/utils/trackGeneration.js` - Tracking utility
- `migrations/020_backfill_generation_user_ids.sql` - Backfill uses host_id for drafts
