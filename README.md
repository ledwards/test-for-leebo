# Protect the Pod - Star Wars: Unlimited Draft & Sealed Simulator

![QA Tests](https://img.shields.io/badge/QA_Tests-passing-brightgreen?style=flat-square)

A web application for Star Wars: Unlimited limited formats - draft pods and sealed pools with deck building.

## Features

### Sealed Mode
- Generate and open 6 booster packs according to official SWU pack distribution
- Choose from all available Star Wars: Unlimited expansion sets
- Share sealed pools via unique URLs
- Build decks from your pool with the integrated deck builder

### Draft Mode
- **Multiplayer drafts** with 2-8 players (fill empty seats with bots)
- **Leader Draft**: 3-round Rochester-style leader draft before pack drafting
- **Pack Draft**: Traditional booster draft with pass-left/pass-right rotation
- **Real-time sync**: See other players' pick status live
- **Timers**: Configurable round timer and last-player timer with pause/resume
- **Bot players**: AI bots that make random picks to fill empty seats
- **Shareable draft rooms**: Invite players via unique draft URL

### Deck Builder
- Drag-and-drop deck construction
- Filter and sort by aspect, cost, type
- Multiple view modes (playmat, grid, table)
- Aspect penalty tracking for off-leader cards
- Export deck lists

### Other Features
- **History**: View and resume past drafts and sealed pools
- **Discord authentication**: Save your pools and drafts to your account
- **Responsive design**: Works on desktop and mobile

### Booster Pack Generation
Accurately simulates pack contents based on official rules:
- 1 Leader card (guaranteed)
- 1 Base card (guaranteed)
- 9 Common cards
- 3 Uncommon cards
- 1 Rare or Legendary card
- 1 Foil card (any rarity)
- Hyperspace variants (rare)
- Showcase variants (very rare, leaders only)

## Getting Started

### Prerequisites

- Node.js 20.19.0 or higher (or 22.12.0+)
- npm
- PostgreSQL database (for production features - optional for local development)
- Discord OAuth app (for authentication - optional for local development)

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```bash
# Database (optional - get from Neon via Vercel Marketplace, Supabase, or local PostgreSQL)
POSTGRES_URL=postgresql://user:password@host:port/database

# App URL (Vercel dev will use localhost:3000)
APP_URL=http://localhost:3000

# Discord OAuth (optional - get from https://discord.com/developers/applications)
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_random_secret_here
```

### Database Setup (Optional)

For database features, you can use:
- **Neon** (Recommended - free tier via Vercel Marketplace)
- **Supabase** (free tier available)
- **Local PostgreSQL**

Run migrations:
```bash
npm run migrate:dev
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000` (Next.js default port)

### Build

```bash
npm run build
```

## Data Sources

The app fetches card data from [swudb.com](https://swudb.com):
- Sets: `https://swudb.com/sets`
- Cards: `https://swudb.com/sets/{SET_CODE}`

### Card Data File

**Important**: The app requires a card definition file at `src/data/cards.json` containing all cards from all sets.

The card data file has been pre-populated with **4,973 cards** from all 6 expansion sets using the [swu-db.com API](https://www.swu-db.com/api):
- **SOR** (Spark of Rebellion): 510 cards
- **SHD** (Shadows of the Galaxy): 522 cards
- **TWI** (Twilight of the Republic): 517 cards
- **JTL** (Jump to Lightspeed): 1,122 cards
- **LOF** (Legends of the Force): 1,152 cards
- **SEC** (Secrets of Power): 1,150 cards

#### Refreshing Card Data

To refresh the card data from the API, run:

```bash
npm run fetch-cards
```

### Card Data Fixes

**Important**: The app includes an **automatic runtime fix system** that corrects data errors when cards are loaded.

- ✅ **3,750+ fixes** applied automatically at startup
- ✅ All code uses corrected data (no raw/processed data split)
- ✅ All tests test corrected data
- ✅ Fixes are version-controlled with code (easy rollbacks)
- ✅ Zero performance impact (fixes apply once at module load)

**Common fixes:**
- Hyperspace variants get `isHyperspace: true`
- Foil variants get `isFoil: true`
- Showcase variants get `isShowcase: true`

**See what fixes are active:**
```bash
npm run show-fixes
```

**Test the fix system:**
```bash
npm run test:fixes
```

**Add a new fix:**
Edit `scripts/cardFixes.js` and add your fix declaratively:
```javascript
{
  condition: (card) => card.type === 'Leader' && !card.isLeader,
  field: 'isLeader',
  value: true,
  reason: 'Ensure all Leaders have isLeader flag'
}
```

**📚 Documentation:**
- [Quick Start Guide](./docs/QUICKSTART_FIXES.md) - Get started in 5 minutes
- [Complete Documentation](./docs/CARD_FIXES.md) - Full guide to the fix system
- [Example Walkthrough](./docs/EXAMPLE_ADDING_FIX.md) - Real-world example
- [Implementation Details](./docs/IMPLEMENTATION_SUMMARY.md) - How it works

## Booster Pack Rules

Based on the official article: [Boosting Ahead of Release](https://starwarsunlimited.com/articles/boosting-ahead-of-release)

Each booster pack contains exactly 16 cards with the specified distribution above.

### Set Differences: Sets 1-3 vs Sets 4-6

**Legendary Drop Rates:**
- **Sets 1-3 (SOR, SHD, TWI)**: 16 legendaries per set → ~13.3% legendary rate (~1 in 7.5 packs)
- **Sets 4-6 (JTL, LOF, SEC)**: 20 legendaries per set → ~16.7% legendary rate (~1 in 6 packs)

**Special Rarity Cards:**
- **Sets 1-3**: Special rarity only for leaders (8 per set), not in foil slots
- **Sets 4-6**: Special rarity for leaders (8) + non-leader specials (8) = 16 total, can appear in foil slots (~1.5-2%)

**Card Counts:**
| Set | Commons | Uncommons | Rares | Legendaries | Specials (non-leader) |
|-----|---------|-----------|-------|-------------|----------------------|
| SOR | 90 | 60 | 48 | 16 | 0 |
| SHD | 90 | 60 | 52 | 16 | 0 |
| TWI | 90 | 60 | 48 | 16 | 0 |
| JTL | 98 | 60 | 45 | **20** | **8** |
| LOF | 100 | 60 | 46 | **20** | **8** |
| SEC | 100 | 60 | 50 | **20** | **8** |

## Commands

```bash
# Development
npm install                  # Install dependencies
npm run dev                  # Start development server
npm run build                # Build for production
npm run lint                 # Run linter

# Testing
npm run test:summary         # Quick test summary with colors 🎯
npm run test                 # Run all unit tests
npm run test:utils           # Pack generation tests 📦
npm run test:belts           # Belt tests (9 suites) 🎲
npm run test:data            # Card data validation 🎴
npm run qa                   # Statistical QA (100 packs/set) 📊

# Database
npm run migrate:dev          # Run migrations (dev)
npm run migrate:prod         # Run migrations (prod)

# Data management
npm run fetch-cards          # Refresh card data from API
npm run show-fixes           # Show configured card fixes
npm run test:fixes           # Test the card fix system
```

## Testing

This project has comprehensive test coverage with **color-coded output** and emojis:

- 🔄 **10 unit tests** - Belt logic and pack generation
- 🎴 **Data validation** - Card database integrity checks
- 📊 **QA tests** - Statistical analysis on 100 packs per set

**Quick Start:**
```bash
npm run test:summary    # See results summary
npm run qa              # Full QA analysis (~1-2 min)
```

**Test Output Features:**
- ✅ Green for passing tests
- ❌ Red for failing tests  
- ⚠️ Yellow for warnings
- 🎉 Success banners
- 💥 Failure indicators

See `src/qa/README.md` for detailed testing documentation.

## CI/CD & Deployment

Every deployment automatically runs tests and QA checks:

**Automated Pipeline:**
- ✅ Unit tests (belts, utils, draft logic)
- 📊 QA tests (100 pods per set, 600 packs)
- 🔄 Database migrations
- 📦 Build artifacts (includes QA results)

**Quick Commands:**
```bash
npm run build           # Full production build with tests
npm run test           # Run all unit tests
npm run qa             # Generate QA results
```

**QA Results Artifact:**
- Generated on every build: `src/qa/results.json`
- Copied to deployment: `public/qa-results.json`
- Accessible at: `https://www.protectthepod.com/qa-results.json`

**Documentation:**
- 📋 [CI/CD Documentation](docs/CI_CD.md) - Full pipeline details
- ✅ [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md) - Pre/post deployment steps
- 🔧 GitHub Actions workflow in `.github/workflows/ci.yml`

**Vercel Integration:**
- Tests run automatically on every push
- QA results included in deployments
- Preview deployments for PRs
- Instant rollback available

## Code Structure

```
src/
├── components/                 # React UI components
│   ├── DeckBuilder.jsx         # Deck building interface
│   ├── LeaderDraftPhase.jsx    # Leader draft UI
│   ├── PackDraftPhase.jsx      # Pack draft UI
│   ├── PlayerCircle.jsx        # Draft player display
│   ├── SealedPod.jsx           # Sealed pool viewer
│   └── ...
├── hooks/
│   └── useDraftSync.js         # Real-time draft state sync
├── utils/
│   ├── setConfigs/             # Set-specific parameters (SOR, SHD, TWI, JTL, LOF, SEC)
│   ├── botLogic.js             # Bot player AI
│   ├── draftAdvance.js         # Draft turn advancement logic
│   ├── draftTimeout.js         # Timer/timeout handling
│   ├── cardCache.js            # Card data management
│   ├── cardData.js             # Card loading with automatic fixes
│   └── cardFilters.js          # Card filtering logic
├── data/
│   └── cards.json              # 4,973 cards from all sets

scripts/
├── cardFixes.js                # Define card data fixes here
├── fetchCards.js               # Fetch from API and apply fixes
└── showFixes.js                # Utility to inspect fixes

docs/
├── QUICKSTART_FIXES.md         # Quick start guide for fixes
├── CARD_FIXES.md               # Complete fix system documentation
└── IMPLEMENTATION_SUMMARY.md   # Implementation details

app/
├── api/
│   ├── draft/                  # Draft API endpoints
│   ├── sealed/                 # Sealed pool API endpoints
│   └── auth/                   # Authentication endpoints
├── draft/                      # Draft pages
├── sealed_pool/                # Sealed pool pages
├── history/                    # History page
└── pools/                      # Pool creation pages

lib/
├── db.js                       # Database connection and queries
├── auth.js                     # Authentication helpers
└── utils.js                    # API utilities
```

## Future Features

- Tournament bracket support
- Cube draft format
- Draft statistics and analytics
- Deck sharing and public deck lists

## Disclaimer

Protect the Pod is in no way affiliated with Disney or Fantasy Flight Games. Star Wars characters, cards, logos, and art are property of Disney and/or Fantasy Flight Games.
