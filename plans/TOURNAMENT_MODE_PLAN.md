# Tournament Mode Plan

> **Status**: Draft
> **Feature Flag**: Beta-only (`is_beta_tester || is_admin`)

## Overview

Swiss-format tournament system supporting both Sealed and Draft formats. Tournaments have shareable links, real-time state sync, result reporting with mutual confirmation, and automatic Swiss pairing following official SWU Organized Play rules.

---

## 1. User Flow

### 1.1 Tournament Creation

1. Landing page shows **"Start a Tournament"** button (beta users only, trophy icon)
2. Click navigates to `/tournament/new`
3. Creator selects **Draft** or **Sealed**
4. **Draft**: Goes straight into draft flow (existing `/draft` creation), tournament wraps the draft pod
5. **Sealed**: Shows tournament configuration:
   - **Player cap**: 4, 8, 16, 32, 64 (dropdown, default 8)
   - **Set**: Set selector (same as sealed/draft)
   - **Format**: BO1 or BO3 (default BO1)
   - **Number of rounds**: Default `ceil(log2(playerCap))`, editable
   - **Live mode**: Checkbox. If checked, all players wait for organizer to hit Start before opening packs
   - **Tournament name**: Auto-generated `"{username}'s {SET} Sealed Tournament {MM/DD/YYYY}"`, editable
6. Click **Create** generates tournament with shareable link `/tournament/{shareId}`

### 1.2 Tournament Lobby (Sealed)

- Shareable URL shows tournament name, set, format, player list
- Players click **Join** to join (first come first served, up to cap)
- If tournament is full, visitor sees "Tournament is full" message
- Anyone not joined can **observe** (see state but not participate)
- Observer count shown on side; clicking it shows observer list
- Organizer sees **Start Tournament** button
- When organizer clicks Start:
  - Seats are **randomly assigned** (no manual randomize — always random)
  - If odd number of players, byes are determined by Swiss rules
  - If Live mode: all players wait, then open packs simultaneously
  - If not Live mode: players can open sealed packs as they join, before start
- Starting locks: format (BO1/BO3), number of rounds, player cap

### 1.3 Tournament Lobby (Draft)

- Same as existing draft pod lobby flow
- Tournament object wraps the draft pod
- Draft proceeds normally (leader draft → pack draft)
- Once draft completes, tournament begins (round 1 pairings generated)
- Observers can watch the draft in progress without being a player

### 1.4 Pool/Deck Building Phase

- After sealed packs open or draft completes, players build decks (existing deckbuilder)
- On the deckbuilder page, if pool is tied to a tournament: show tournament name as a link (opens tournament page in new tab)
- No time limit enforced by the app (organizer manages pace externally)

### 1.5 Active Tournament (Rounds)

- Tournament page shows current round, all matchups, and reported results
- Each player sees their current opponent: name, avatar (or Discord icon default)
- Player actions:
  - **"Play Your Match"** button → opens `/play` page with opponent info
  - **"Report Result"** button → opens result reporting modal

#### Result Reporting

**BO1**: Click the winner's name (two buttons: your name vs opponent name)

**BO3**: Three game slots, each with two buttons (your name vs opponent name). Click to record who won each game. Series result derived automatically (first to 2 wins).

**Mutual Confirmation**:
- If Player A reports but Player B hasn't: show "Waiting for {opponent} to confirm" to Player A
- If both players report the **same result**: result is locked in
- If players report **conflicting results**: flag for TO (Tournament Organizer) resolution
- TO can override any result

### 1.6 Round Advancement

- TO sees all matchups with reported results on tournament page
- TO clicks **"Advance to Next Round"** with confirmation popup
  - Warning if not all results are reported
- On round 2+, TO can also **"Go Back"** with warning: "This will erase all results from the current round and re-pair"
- Advancing triggers Swiss re-pairing for next round

### 1.7 Tournament Completion

- After final round results are reported and TO advances: tournament is complete
- Tournament page shows:
  - Winner: avatar + name + trophy icon (prominent)
  - Final standings table: rank, name, record, OMW%, GW%, OGW%
- Tournament is no longer "active" (removed from active tournament indicators)

### 1.8 Navigation Integration

- **Auth widget dropdown**: If player is in an active tournament, show trophy icon + tournament name link (below History, above Home)
- **Play page**: If tournament exists, show "Your opponent is {name}" with avatar
- **Deckbuilder**: If tournament exists, show tournament name as link to tournament page

---

## 2. Swiss Pairing Rules (SWU Official)

### 2.1 Scoring

| Result | Match Wins |
|--------|-----------|
| Win | 1 |
| Loss | 0 |
| Draw | 0 (tracked separately) |
| Bye | 1 (counts as 0 for OMW) |

### 2.2 Recommended Rounds

| Players | Rounds |
|---------|--------|
| 3-4 | 2 |
| 5-8 | 3 |
| 9-16 | 4 |
| 17-32 | 5 |
| 33-64 | 6 |

Formula: `ceil(log2(players))` — editable by TO at creation.

### 2.3 Pairing Algorithm

**Round 1**: Random pairing. If odd players, lowest-ranked (random in R1) gets bye.

**Round 2+**:
1. Group players by match wins (descending)
2. Within each group, pair randomly
3. Cannot pair two players who already played each other
4. If a group has an odd number, the last player "floats down" to the next group
5. Bye goes to lowest-ranked player who hasn't had a bye yet

### 2.4 Tiebreakers (in order)

1. **Match Wins** (primary)
2. **OMW%** (Opponent Match-Win Percentage) — average of opponents' match-win%, floor 33%
3. **GW%** (Game-Win Percentage) — personal game-level win rate, floor 33%
4. **OGW%** (Opponent Game-Win Percentage) — average of opponents' GW%, floor 33%

### 2.5 Bye Rules

- A player should not receive more than one bye
- Bye = 1 match win, but excluded from OMW/OGW calculations (no opponent)
- Bye assigned to lowest-ranked player who hasn't had one

### 2.6 Draft-Specific Pairing (Round 1 Only)

For draft tournaments, round 1 uses **opposite-seat** pairing:
- 8 players: 1v5, 2v6, 3v7, 4v8
- Fewer than 8: compress out bots, then pair opposites
- Odd number: determine bye first, then pair remaining by opposite seat

Round 2+ uses standard Swiss pairing regardless of format.

---

## 3. Database Schema

### 3.1 `tournaments` Table

```sql
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id TEXT UNIQUE NOT NULL,
  organizer_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  set_code TEXT NOT NULL,
  set_name TEXT,
  format TEXT NOT NULL DEFAULT 'sealed',        -- 'sealed' or 'draft'
  match_format TEXT NOT NULL DEFAULT 'bo1',      -- 'bo1' or 'bo3'
  max_players INTEGER NOT NULL DEFAULT 8,
  num_rounds INTEGER NOT NULL DEFAULT 3,
  current_round INTEGER NOT NULL DEFAULT 0,      -- 0 = lobby/pre-start
  status TEXT NOT NULL DEFAULT 'lobby',           -- lobby, active, complete, cancelled
  live_mode BOOLEAN NOT NULL DEFAULT false,       -- sealed only: wait for start
  draft_pod_id UUID REFERENCES draft_pods(id),   -- draft tournaments link here
  state_version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tournaments_share_id ON tournaments(share_id);
CREATE INDEX idx_tournaments_organizer ON tournaments(organizer_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
```

### 3.2 `tournament_players` Table

```sql
CREATE TABLE tournament_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  seat_number INTEGER,                           -- assigned at start (random)
  match_wins INTEGER NOT NULL DEFAULT 0,
  match_losses INTEGER NOT NULL DEFAULT 0,
  match_draws INTEGER NOT NULL DEFAULT 0,
  game_wins INTEGER NOT NULL DEFAULT 0,
  game_losses INTEGER NOT NULL DEFAULT 0,
  game_draws INTEGER NOT NULL DEFAULT 0,
  has_bye BOOLEAN NOT NULL DEFAULT false,        -- received a bye this tournament
  is_dropped BOOLEAN NOT NULL DEFAULT false,
  pool_share_id TEXT,                            -- link to their sealed/draft pool
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

CREATE INDEX idx_tournament_players_tournament ON tournament_players(tournament_id);
CREATE INDEX idx_tournament_players_user ON tournament_players(user_id);
```

### 3.3 `tournament_rounds` Table

```sql
CREATE TABLE tournament_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',          -- active, complete
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(tournament_id, round_number)
);

CREATE INDEX idx_tournament_rounds_tournament ON tournament_rounds(tournament_id);
```

### 3.4 `tournament_matches` Table

```sql
CREATE TABLE tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES tournament_rounds(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player1_id UUID REFERENCES users(id),          -- null for bye
  player2_id UUID REFERENCES users(id),          -- null for bye
  is_bye BOOLEAN NOT NULL DEFAULT false,
  -- Result reporting
  player1_reported JSONB,                        -- { winner: 'player1'|'player2', games: [...] }
  player2_reported JSONB,
  final_result JSONB,                            -- locked result after agreement or TO override
  result_status TEXT NOT NULL DEFAULT 'pending',  -- pending, reported, confirmed, conflict, overridden
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tournament_matches_round ON tournament_matches(round_id);
CREATE INDEX idx_tournament_matches_tournament ON tournament_matches(tournament_id);
CREATE INDEX idx_tournament_matches_players ON tournament_matches(player1_id, player2_id);
```

### 3.5 `card_pools` Table Addition

```sql
ALTER TABLE card_pools ADD COLUMN tournament_id UUID REFERENCES tournaments(id);
CREATE INDEX idx_card_pools_tournament ON card_pools(tournament_id);
```

---

## 4. API Routes

### 4.1 Tournament CRUD

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/tournament` | Required + Beta | Create tournament |
| GET | `/api/tournament/[shareId]` | Public | Get tournament state |
| PATCH | `/api/tournament/[shareId]` | TO only | Update name/settings (pre-start only) |
| DELETE | `/api/tournament/[shareId]` | TO only | Cancel tournament |
| GET | `/api/tournament/history` | Required | User's tournament history |

### 4.2 Player Management

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/tournament/[shareId]/join` | Required | Join tournament |
| POST | `/api/tournament/[shareId]/leave` | Required | Leave (pre-start only) |
| POST | `/api/tournament/[shareId]/drop` | Required | Drop from active tournament |

### 4.3 Tournament Flow

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/tournament/[shareId]/start` | TO only | Start tournament (randomize seats, pair R1) |
| POST | `/api/tournament/[shareId]/advance` | TO only | Advance to next round |
| POST | `/api/tournament/[shareId]/revert` | TO only | Go back to previous round (R2+) |

### 4.4 Result Reporting

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/tournament/[shareId]/match/[matchId]/report` | Player in match | Report result |
| POST | `/api/tournament/[shareId]/match/[matchId]/override` | TO only | Override result |

### 4.5 Observers

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/tournament/[shareId]/observers` | Public | Get observer list/count |

Observer tracking via Socket.io room membership (no DB table needed).

---

## 5. Pages & Components

### 5.1 New Pages

| Page | Route | Description |
|------|-------|-------------|
| Tournament Type Selection | `/tournament/new` | Draft vs Sealed picker |
| Tournament Config (Sealed) | `/tournament/new/sealed` | Config form |
| Tournament Page | `/tournament/[shareId]` | Lobby, active rounds, results |

### 5.2 New Components

```
src/components/Tournament/
├── TournamentLobby.tsx          # Pre-start: player list, join, config
├── TournamentBracket.tsx        # Active: current round matchups + results
├── TournamentStandings.tsx      # Standings table with tiebreakers
├── TournamentHeader.tsx         # Name, set, format, round info
├── MatchCard.tsx                # Single matchup: players, result, report button
├── ResultReportModal.tsx        # BO1/BO3 result reporting
├── TournamentComplete.tsx       # Winner display + final standings
└── ObserverList.tsx             # Observer count + expandable list
```

### 5.3 Modified Components

| Component | Change |
|-----------|--------|
| `LandingPage.tsx` | Add "Start a Tournament" button (beta-gated) |
| `AuthWidget.tsx` | Add active tournament link with trophy icon in dropdown |
| `DeckBuilder.jsx` | Show tournament link if pool has tournament_id |
| `app/pool/[shareId]/deck/play/page.tsx` | Show opponent from tournament matchup |

### 5.4 New Hooks

```
src/hooks/
├── useTournamentSync.ts         # Poll tournament state (like useDraftSync)
└── useTournamentActions.ts      # Join, leave, report, advance actions
```

---

## 6. Services (Pure Logic)

```
src/services/tournament/
├── swissPairing.ts              # Swiss pairing algorithm
├── swissPairing.test.ts         # Pairing tests
├── standings.ts                 # Calculate standings, OMW%, GW%, OGW%
├── standings.test.ts            # Standings/tiebreaker tests
├── draftPairing.ts              # Draft R1 opposite-seat pairing
├── draftPairing.test.ts         # Draft pairing tests
└── validation.ts                # Tournament state validation
```

### 6.1 `swissPairing.ts` — Core Algorithm

```typescript
interface Player {
  id: string
  matchWins: number
  matchLosses: number
  matchDraws: number
  gameWins: number
  gameLosses: number
  gameDraws: number
  hasBye: boolean
  opponents: string[]  // IDs of previous opponents
}

interface Pairing {
  player1Id: string
  player2Id: string | null  // null = bye
  isBye: boolean
}

// Round 1: random pairing
function pairRound1(players: Player[]): Pairing[]

// Round 2+: Swiss pairing by record
function pairSwiss(players: Player[]): Pairing[]

// Calculate standings with tiebreakers
function calculateStandings(players: Player[], matches: Match[]): Standing[]

// Determine bye recipient
function assignBye(players: Player[]): string  // returns player ID
```

### 6.2 `standings.ts` — Tiebreaker Calculations

```typescript
interface Standing {
  playerId: string
  rank: number
  matchWins: number
  matchLosses: number
  matchDraws: number
  omwPercent: number   // Opponent Match-Win %, floor 33%
  gwPercent: number    // Game-Win %, floor 33%
  ogwPercent: number   // Opponent Game-Win %, floor 33%
}

function calculateOMW(player: Player, allPlayers: Player[]): number
function calculateGW(player: Player): number
function calculateOGW(player: Player, allPlayers: Player[]): number
function rankPlayers(players: Player[], matches: Match[]): Standing[]
```

---

## 7. Real-Time Sync

### 7.1 Socket.io Rooms

- `tournament:${shareId}` — all participants and observers
- Events:
  - `tournament-state-updated` — broadcast on any state change
  - `tournament-result-reported` — broadcast when a result is reported
  - `tournament-round-advanced` — broadcast on round advance

### 7.2 Polling Fallback

- `useTournamentSync.ts` polls `/api/tournament/[shareId]` every 3 seconds
- Uses `state_version` for optimistic updates (same pattern as `useDraftSync`)

---

## 8. Result Reporting Data Structures

### 8.1 BO1 Report

```json
{
  "winner": "player1",
  "games": [{ "winner": "player1" }]
}
```

### 8.2 BO3 Report

```json
{
  "winner": "player1",
  "games": [
    { "winner": "player1" },
    { "winner": "player2" },
    { "winner": "player1" }
  ]
}
```

### 8.3 Result Confirmation Flow

```
player1 reports → result_status = 'reported', player1_reported = {...}
player2 reports →
  if matches player1: result_status = 'confirmed', final_result = {...}
  if conflicts: result_status = 'conflict'
TO overrides → result_status = 'overridden', final_result = {...}
```

---

## 9. Migrations

```
migrations/
├── 030_create_tournaments.sql
├── 031_create_tournament_players.sql
├── 032_create_tournament_rounds.sql
├── 033_create_tournament_matches.sql
└── 034_add_tournament_to_card_pools.sql
```

---

## 10. Test Plan

### 10.1 Unit Tests — Swiss Pairing (`src/services/tournament/swissPairing.test.ts`)

1. **Round 1 random pairing**: 8 players → 4 pairings, no repeats
2. **Round 1 odd players**: 7 players → 3 pairings + 1 bye
3. **Swiss pairing by record**: Players grouped by wins, paired within groups
4. **No rematches**: Players who already played are not re-paired
5. **Float down**: Odd player in bracket floats to next bracket
6. **Bye assignment**: Lowest-ranked player without prior bye gets bye
7. **No double bye**: Player with bye cannot get another
8. **4 players, 2 rounds**: Full 2-round simulation
9. **8 players, 3 rounds**: Full 3-round simulation with realistic results
10. **16 players, 4 rounds**: Stress test with many pairings
11. **Edge: 3 players**: Correct round count and bye handling
12. **Edge: All ties**: Pairing works when all players have same record

### 10.2 Unit Tests — Standings (`src/services/tournament/standings.test.ts`)

1. **Basic ranking**: Players ordered by match wins
2. **OMW% calculation**: Correct average of opponents' win rates
3. **OMW% floor**: Opponents below 33% floored to 33%
4. **OMW% bye exclusion**: Bye rounds excluded from OMW calculation
5. **GW% calculation**: Correct game-level win percentage
6. **GW% floor**: Floor at 33%
7. **OGW% calculation**: Average of opponents' GW%
8. **Full tiebreaker chain**: Two players same wins, different OMW%
9. **Three-way tie**: Three players same wins, resolved by OMW → GW → OGW
10. **Dropped player**: Dropped players' results still count for OMW

### 10.3 Unit Tests — Draft Pairing (`src/services/tournament/draftPairing.test.ts`)

1. **8 players opposite seat**: 1v5, 2v6, 3v7, 4v8
2. **6 players opposite seat**: 1v4, 2v5, 3v6
3. **7 players (odd)**: Bye assigned, remaining paired by opposite seat
4. **4 players**: 1v3, 2v4
5. **5 players (odd)**: Bye + opposite seat for remaining 4

### 10.4 Unit Tests — Result Reporting (`src/services/tournament/validation.test.ts`)

1. **BO1 valid report**: Single game result accepted
2. **BO3 valid report (2-0)**: Two games, same winner
3. **BO3 valid report (2-1)**: Three games, different winners
4. **BO3 invalid (1-0)**: Incomplete series rejected
5. **BO3 invalid (3-0)**: Too many games rejected
6. **Mutual confirmation**: Same reports → confirmed
7. **Conflict detection**: Different reports → conflict status
8. **TO override**: Override sets final_result regardless

### 10.5 API Tests (`app/api/tournament/`)

1. **Create tournament**: Returns shareId, correct defaults
2. **Create requires beta access**: Non-beta user rejected
3. **Join tournament**: Player added, count updated
4. **Join full tournament**: Returns 400 error
5. **Join started tournament**: Returns 400 error
6. **Start tournament**: Status changes, seats randomized, R1 paired
7. **Start requires TO**: Non-organizer rejected
8. **Report result**: Updates match, mutual confirmation works
9. **Advance round**: New round created, Swiss pairing applied
10. **Advance with incomplete results**: Warning returned
11. **Revert round**: Current round deleted, previous re-activated
12. **Revert round 1**: Returns 400 error
13. **Get tournament**: Returns full state for participants and observers
14. **Tournament history**: Returns user's tournaments
15. **Drop from tournament**: Player marked dropped, future byes adjusted

### 10.6 E2E Tests (`e2e/tournament.spec.ts`)

1. **Sealed tournament happy path**: Create → join 4 players → start → open packs → build decks → play R1 → report → advance → play R2 → report → complete → verify standings
2. **Draft tournament happy path**: Create → draft (use existing draft flow) → R1 pairings from seats → report → advance → complete
3. **Observer flow**: Non-participant visits URL → sees tournament state → cannot report
4. **Full tournament**: Navigate from landing page to completion
5. **Result conflict**: Two players report different results → TO resolves
6. **Tournament link in deckbuilder**: Pool tied to tournament shows link
7. **Opponent display on play page**: Shows correct opponent from tournament matchup

### 10.7 Hook Tests (`src/hooks/useTournamentSync.test.ts`)

1. **Polls tournament state**: Fetches on interval
2. **Updates on state_version change**: Re-renders with new data
3. **Stops polling when complete**: No more fetches after tournament ends

---

## 11. Implementation Phases

### Phase 1: Core Engine (Services + DB)
- [ ] Database migrations (030-034)
- [ ] `swissPairing.ts` + tests
- [ ] `standings.ts` + tests
- [ ] `draftPairing.ts` + tests
- [ ] `validation.ts` + tests

### Phase 2: API Layer
- [ ] Tournament CRUD routes
- [ ] Join/leave/drop routes
- [ ] Start/advance/revert routes
- [ ] Result reporting routes
- [ ] Tournament history route

### Phase 3: Tournament Pages
- [ ] `/tournament/new` — type selection page
- [ ] `/tournament/new/sealed` — config form
- [ ] `/tournament/[shareId]` — main tournament page
- [ ] `TournamentLobby` component
- [ ] `TournamentBracket` component
- [ ] `TournamentStandings` component
- [ ] `MatchCard` component
- [ ] `ResultReportModal` component (BO1 + BO3)
- [ ] `TournamentComplete` component

### Phase 4: Integration
- [ ] Landing page "Start a Tournament" button (beta-gated)
- [ ] Auth widget active tournament link
- [ ] Deckbuilder tournament link
- [ ] Play page opponent display from tournament
- [ ] `useTournamentSync` hook
- [ ] Socket.io tournament rooms + events
- [ ] Observer tracking

### Phase 5: Polish & E2E
- [ ] E2E tests
- [ ] Error handling edge cases (drops, disconnects, timeouts)
- [ ] Mobile responsiveness for tournament page
- [ ] Tournament page styling (trophy, standings table, match cards)

---

## 12. Files to Create

| File | Purpose |
|------|---------|
| `migrations/030_create_tournaments.sql` | Tournament tables |
| `migrations/031_create_tournament_players.sql` | Player enrollment |
| `migrations/032_create_tournament_rounds.sql` | Round tracking |
| `migrations/033_create_tournament_matches.sql` | Match tracking |
| `migrations/034_add_tournament_to_card_pools.sql` | Link pools to tournaments |
| `src/services/tournament/swissPairing.ts` | Pairing algorithm |
| `src/services/tournament/swissPairing.test.ts` | Pairing tests |
| `src/services/tournament/standings.ts` | Standings + tiebreakers |
| `src/services/tournament/standings.test.ts` | Standings tests |
| `src/services/tournament/draftPairing.ts` | Draft R1 opposite-seat |
| `src/services/tournament/draftPairing.test.ts` | Draft pairing tests |
| `src/services/tournament/validation.ts` | Result validation |
| `src/services/tournament/validation.test.ts` | Validation tests |
| `app/api/tournament/route.ts` | Create + list |
| `app/api/tournament/[shareId]/route.ts` | Get + update + delete |
| `app/api/tournament/[shareId]/join/route.ts` | Join |
| `app/api/tournament/[shareId]/leave/route.ts` | Leave |
| `app/api/tournament/[shareId]/drop/route.ts` | Drop |
| `app/api/tournament/[shareId]/start/route.ts` | Start |
| `app/api/tournament/[shareId]/advance/route.ts` | Advance round |
| `app/api/tournament/[shareId]/revert/route.ts` | Revert round |
| `app/api/tournament/[shareId]/match/[matchId]/report/route.ts` | Report result |
| `app/api/tournament/[shareId]/match/[matchId]/override/route.ts` | TO override |
| `app/api/tournament/[shareId]/observers/route.ts` | Observer list |
| `app/api/tournament/history/route.ts` | User's tournaments |
| `app/tournament/new/page.tsx` | Type selection |
| `app/tournament/new/sealed/page.tsx` | Sealed config |
| `app/tournament/[shareId]/page.tsx` | Main tournament page |
| `src/components/Tournament/TournamentLobby.tsx` | Lobby UI |
| `src/components/Tournament/TournamentBracket.tsx` | Matchups UI |
| `src/components/Tournament/TournamentStandings.tsx` | Standings table |
| `src/components/Tournament/TournamentHeader.tsx` | Header bar |
| `src/components/Tournament/MatchCard.tsx` | Single matchup |
| `src/components/Tournament/ResultReportModal.tsx` | Result reporting |
| `src/components/Tournament/TournamentComplete.tsx` | Winner + standings |
| `src/components/Tournament/ObserverList.tsx` | Observers |
| `src/components/Tournament/Tournament.css` | All tournament styles |
| `src/hooks/useTournamentSync.ts` | Polling hook |
| `src/hooks/useTournamentActions.ts` | Action hooks |
| `e2e/tournament.spec.ts` | E2E tests |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/LandingPage.tsx` | Add tournament button |
| `src/components/AuthWidget.tsx` | Active tournament link |
| `src/components/DeckBuilder.jsx` | Tournament link |
| `app/pool/[shareId]/deck/play/page.tsx` | Opponent from tournament |
| `server.ts` | Tournament Socket.io rooms |

---

## 13. Open Questions

| Question | Current Assumption |
|----------|-------------------|
| Top cut after Swiss? | Not in v1 — Swiss only, winner is top of standings |
| Timer per round? | Not in v1 — TO manages pace externally |
| Spectator mode for games? | Not in v1 — observers see tournament state, not individual games |
| Mobile tournament page? | Responsive but optimized for desktop in v1 |
| Tournament chat? | Not in v1 |
| Player drop mid-tournament? | Supported — dropped players' results count for OMW |
