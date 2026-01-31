# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Protect the Pod is a Star Wars: Unlimited draft and sealed simulator. It generates booster packs, supports multiplayer drafts with real-time sync via Socket.io, and includes a deck builder.

## Common Commands

```bash
npm run dev              # Start dev server (Next.js + Socket.io via server.js)
npm run build            # Production build
npm run lint             # ESLint

# Testing
npm run test             # All unit tests
npm run test:belts       # Belt system tests only
npm run test:utils       # Pack generation tests
npm run test:data        # Card data validation
npm run qa               # Statistical QA (100 packs/set)

# Run a single test file
node src/belts/LeaderBelt.test.js

# Card data
npm run fetch-cards      # Refresh cards.json from API
npm run show-fixes       # Show card data fixes
```

## Architecture

### Belt System (`src/belts/`)
The pack generation uses a "belt" metaphor - each card slot type has a belt that dispenses cards:
- **LeaderBelt**: 1 leader per pack, alternates common/rare with seam deduplication
- **BaseBelt**: 1 common base per pack, aspect-based deduplication
- **CommonBelt**: 9 commons, uses A/B pools for deduplication
- **UncommonBelt**: 3 uncommons
- **RareLegendaryBelt**: 1 rare or legendary
- **FoilBelt**: 1 foil of any rarity
- **ShowcaseLeaderBelt**: Very rare showcase leaders (~1 in 288 packs)
- **Hyperspace belts**: Various hyperspace variants

Belts maintain a "hopper" that refills from a "filling pool" when depleted. This ensures proper distribution while preventing adjacent duplicates.

### Booster Pack Generation (`src/utils/boosterPack.js`)
Orchestrates belt usage to create 16-card packs. Handles variant replacement (hyperspace, showcase, hyperfoil) at various probability rates.

### Set Configs (`src/utils/setConfigs/`)
Per-set parameters: card counts, rarity distributions, legendary drop rates. Sets 4-6 (JTL, LOF, SEC) have different rules than sets 1-3.

### Real-time Draft (`server.js`, `src/hooks/useDraftSync.js`)
Custom Next.js server with Socket.io for multiplayer draft synchronization. Draft state stored in PostgreSQL, synced to clients in real-time.

### Card Data (`src/data/cards.json`, `scripts/cardFixes.js`)
~5000 cards from 6 sets. Runtime fix system automatically corrects data issues (variant flags, missing properties) when cards are loaded via `cardCache.js`.

### App Structure
- `app/` - Next.js App Router pages and API routes
- `app/api/draft/` - Draft CRUD and state management
- `app/api/sealed/` - Sealed pool generation
- `app/showcases/` - Showcase collection gallery
- `src/components/` - React components (DeckBuilder, SealedPod, LeaderDraftPhase, etc.)

## UI Components & Style Guide

**IMPORTANT: Always use the style guide for UI work unless explicitly instructed otherwise.**

Read `docs/STYLE_GUIDE.md` before creating or modifying UI components. Key rules:

### Button Component (ALWAYS USE)
Use `src/components/Button.jsx` for all buttons:
```jsx
import Button from '@/src/components/Button'

// Primary CTA (green glow)
<Button variant="primary">Save</Button>

// Secondary/Cancel
<Button variant="secondary">Cancel</Button>

// Danger/Delete (red glow)
<Button variant="danger">Delete</Button>

// Back navigation
<Button variant="back">Go Back</Button>

// Icon-only (close buttons)
<Button variant="icon" size="sm">&times;</Button>

// Toggle (sort/filter)
<Button variant="toggle" active={isActive}>Option</Button>

// Text-only (no background)
<Button variant="primary" textOnly>Add All</Button>
```

### Modal Component
Use `src/components/Modal.jsx` for dialogs with `<Modal.Body>` and `<Modal.Actions>`.

### TimerButton Component
Use `src/components/TimerButton.jsx` for pause/play timer controls.

### Design Tokens
- Dark backgrounds: `rgba(0, 0, 0, 0.7)`
- Borders: `rgba(255, 255, 255, 0.3)`
- Primary glow: green, Danger glow: red, Interactive glow: blue
- Font: Barlow, weights 400/600/700
- Hover lift: `translateY(-2px)`

### Exceptions (Keep Custom)
These have unique designs - do NOT replace with Button:
- Landing page mode buttons (large card-like CTAs)
- Deselect button (card overlay)
- Editable title pencil
- Auth widget avatar
- Showcase share icon

## Key Patterns

### Card Variant Types
Cards have `variantType`: Normal, Foil, Hyperspace, Hyperspace Foil, Showcase. Same card with different variants are distinct (not duplicates).

### Aspect Colors
Use `src/utils/aspectColors.js` for aspect-based styling. Aspects: Vigilance (blue), Command (green), Aggression (red), Cunning (yellow), Villainy (black/purple), Heroism (white).

### Database
PostgreSQL via `lib/db.js`. Migrations in `scripts/migrations/`. Use `queryRows()` for SELECT, `queryRow()` for single row, `query()` for INSERT/UPDATE.

### Authentication
Discord OAuth via `lib/auth.js`. JWT tokens in cookies. User context via `src/contexts/AuthContext`.

## Testing Notes

Tests use Node's built-in test runner (no Jest). Run individual test files directly with `node`. Statistical QA tests validate pack distribution across 600 packs.

## Architecture & Refactoring

**IMPORTANT: Read before making structural changes.**

See `docs/ARCHITECTURE.md` for the target layered architecture:
- **Components** (`src/components/`) - Pure presentation, no business logic
- **Hooks** (`src/hooks/`) - State management, compose services
- **Services** (`src/services/`) - Pure business logic, fully testable
- **Repositories** (`src/repositories/`) - Data access layer

See `docs/REFACTORING_PLAN.md` for the active refactoring initiative.

### Key Principles
1. **Test Before Refactor**: Always write characterization tests before changing existing code
2. **Services are Pure**: No React, no side effects, no I/O in services
3. **Components Don't Calculate**: Move calculations to services, call via hooks
4. **Small Files**: Components <300 lines, services <200 lines

### When Adding New Features
1. Business logic → `src/services/` (with tests)
2. State management → `src/hooks/`
3. UI → `src/components/` (receives data via props/hooks)
