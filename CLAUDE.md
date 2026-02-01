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
npm run test             # All unit tests (204 tests)
npm run test:belts       # Belt system tests only
npm run test:utils       # Pack generation tests
npm run test:data        # Card data validation
npm run test:hooks       # Hook tests only
npm run test:e2e         # Playwright E2E tests
npm run qa               # Statistical QA (100 packs/set)

# Run a single test file
node src/utils/cardSort.test.js

# E2E tests
npm run test:e2e -- --grep "Sealed Happy Path"  # Quick sanity check
npm run test:e2e -- --grep-invert "8-player"    # Skip slow test

# Card data
npm run fetch-cards      # Refresh cards.json from API
npm run show-fixes       # Show card data fixes
```

## Architecture

### DeckBuilder Component Structure

The DeckBuilder has been refactored from a 6700-line monolith to a modular structure:

```
src/components/
├── Card.jsx                    # Reusable card component
├── Card.css                    # All .canvas-card styles (416 lines)
├── DeckBuilder.jsx             # Main orchestrator (2030 lines)
├── DeckBuilder.css             # Layout/section styles (2066 lines)
└── DeckBuilder/                # Sub-components (23 files)
    ├── README.md               # Component documentation
    ├── CardGrid.jsx            # Reusable card grid container
    ├── CardPreview.jsx         # Enlarged card preview on hover
    ├── DeckSection.jsx         # Deck grid view
    ├── PoolSection.jsx         # Pool grid view
    ├── PoolListSection.jsx     # List view for pool/deck
    ├── SelectionListSection.jsx # List view for leaders/bases
    ├── LeaderBaseSelector.jsx  # Leader/base selection
    ├── SectionHeader.jsx       # Section header with controls
    ├── DeckBuilderHeader.jsx   # Main header
    ├── StickyInfoBar.jsx       # Sticky stats bar
    └── ... (12 more components)
```

See `src/components/DeckBuilder/README.md` for full component documentation.

### DeckBuilder Hooks

```
src/hooks/
├── README.md               # Hook documentation
├── useDeckExport.js        # Export to JSON/clipboard/image
├── useDragAndDrop.js       # Drag and drop card movement
├── useCardPreview.js       # Card preview hover state
├── useTooltip.js           # Tooltip positioning
├── useDraftSocket.js       # WebSocket for drafts
└── useDraftSync.js         # Draft state sync
```

### DeckBuilder Context

`src/contexts/DeckBuilderContext.jsx` provides shared state:
- `deckSortOption`, `poolSortOption` - Current sort settings
- `leaderCard`, `baseCard` - Selected leader and base
- `showAspectPenalties` - Toggle for aspect penalty display
- `moveCardsToDeck()`, `moveCardsToPool()` - Bulk card operations

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

### Utility Functions

```
src/utils/
├── cardSort.js             # Card sorting utilities (with tests)
├── aspectCombinations.js   # Aspect grouping utilities (with tests)
├── aspectColors.js         # Aspect color/styling utilities
├── boosterPack.js          # Pack generation
├── cardCache.js            # Card data caching
├── variantDowngrade.js     # Variant card mapping
└── ... (20+ utility files)
```

### App Structure
- `app/` - Next.js App Router pages and API routes
- `app/api/draft/` - Draft CRUD and state management
- `app/api/sealed/` - Sealed pool generation
- `app/showcases/` - Showcase collection gallery
- `src/components/` - React components

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

### Card Component
Use `src/components/Card.jsx` for rendering cards:
```jsx
import Card from '@/src/components/Card'

<Card
  card={cardData}
  selected={isSelected}
  disabled={isDisabled}
  showPenalty={showAspectPenalties}
  penaltyAmount={penalty}
  onClick={handleClick}
/>
```

Card styles are in `Card.css`. Key classes:
- `.canvas-card` - Base card styling
- `.canvas-card.selected` - Rainbow border animation
- `.canvas-card.disabled` - Grayscale effect
- `.canvas-card.foil` - Foil shimmer effect

### Modal Component
Use `src/components/Modal.jsx` for dialogs with `<Modal.Body>` and `<Modal.Actions>`.

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

**Test files:**
- `src/utils/*.test.js` - Utility function tests
- `src/hooks/*.test.js` - Hook contract tests
- `src/belts/*.test.js` - Belt system tests
- `e2e/*.spec.js` - Playwright E2E tests

## Architecture & Refactoring

**See `DECKBUILDER_REFACTOR_PLAN.md` for the completed refactoring summary.**

### Key Principles
1. **Test Before Refactor**: Always write characterization tests before changing existing code
2. **Services are Pure**: No React, no side effects, no I/O in services
3. **Components Don't Calculate**: Move calculations to services, call via hooks
4. **Small Files**: Components <300 lines, services <200 lines

### When Adding New Features
1. Business logic → `src/services/` (with tests)
2. State management → `src/hooks/`
3. UI → `src/components/` (receives data via props/hooks)

## Important Notes

- **NEVER PUSH WITHOUT HUMAN REVIEW** - pushes trigger deploy to production
- The mobile test (`deck-builder.spec.js:220`) is flaky - pre-existing issue
- Skip 8-player test during iteration (takes 10+ minutes)
