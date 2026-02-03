# Known Issues

## Draft Showcase Tracking Attribution

**Status:** Fixed
**Severity:** Medium
**Affected:** Draft showcase leader tracking

### Description

When a draft starts, all generated cards (packs and leaders for all players) were tracked in `card_generations` with the **host's user_id**, not the individual players who actually drafted those cards.

This meant:
- Only the draft host got credit for showcase leaders that appeared in any player's packs
- Other players who actually drafted showcase leaders didn't see them in their Showcases collection

### Fix Applied

**Going forward (commit a787907):**
- Showcase leaders are now tracked at **pick time** with the picking player's user_id
- Both `pick/route.js` (direct picks) and `draftAdvance.js` (staged picks) track correctly
- Start route skips tracking showcase leaders (they're tracked when picked)

**Existing data (migration 024):**
- Queries `draft_pod_players.drafted_leaders` to find who actually drafted each showcase
- Updates `card_generations.user_id` to the correct player
- Idempotent and non-destructive

### Related Files

- `app/api/draft/[shareId]/start/route.js` - Skips showcase leaders (tracked at pick time)
- `app/api/draft/[shareId]/pick/route.js` - Tracks showcase leaders when picked
- `src/utils/draftAdvance.js` - Tracks showcase leaders for staged picks
- `migrations/024_backfill_draft_showcase_attribution.js` - Backfills existing data
