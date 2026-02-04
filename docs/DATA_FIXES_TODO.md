# Production Data Fixes TODO

Tracking data issues that need manual fixes in production.

---

## Pending Fixes

### 1. casero77 incorrectly marked as bot

**Discovered:** 2026-02-03

**Problem:** User `casero77` has one `draft_pod_players` entry with `is_bot = true`, but they are a real human user.

**Query to find:**
```sql
SELECT dpp.id, dpp.draft_pod_id, dpp.is_bot, dp.share_id
FROM draft_pod_players dpp
JOIN users u ON u.id = dpp.user_id
JOIN draft_pods dp ON dp.id = dpp.draft_pod_id
WHERE u.username = 'casero77' AND dpp.is_bot = true;
```

**Fix:**
```sql
UPDATE draft_pod_players dpp
SET is_bot = false
FROM users u
WHERE dpp.user_id = u.id
  AND u.username = 'casero77'
  AND dpp.is_bot = true;
```

**Status:** Pending

---

## Completed Fixes

_(None yet)_
