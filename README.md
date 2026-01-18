# Protect the Pod - Star Wars: Unlimited Sealed Pod Simulator

A web application that simulates opening sealed pods of Star Wars: Unlimited booster packs.

## Features

- **Sealed Mode**: Generate and open 6 booster packs according to official SWU pack distribution
- **Set Selection**: Choose from available Star Wars: Unlimited expansion sets
- **Booster Pack Generation**: Accurately simulates pack contents based on official rules:
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

Each card includes:
- Card ID, name, set code, number
- Rarity (Common, Uncommon, Rare, Legendary)
- Type (Leader, Base, Unit, Event, etc.)
- Aspects, traits, arenas
- Cost, power, HP
- Card text, keywords, artist
- Image URLs (front and back if applicable)
- Whether the card is a Leader or Base

#### Refreshing Card Data

To refresh the card data from the API, run:

```bash
npm run fetch-cards
```

This will fetch the latest card data from swu-db.com and update `src/data/cards.json`.

The app will:
1. First try to fetch cards from swu-db.com API (if available)
2. Fall back to loading from `src/data/cards.json`
3. Show an error if no card data is available

## Booster Pack Rules

Based on the official article: [Boosting Ahead of Release](https://starwarsunlimited.com/articles/boosting-ahead-of-release)

Each booster pack contains exactly 16 cards with the specified distribution above.

### Sheet-Based Pack Generation

The app uses a realistic **sheet-based collation system** that simulates how real TCG packs are manufactured:
- Cards are generated from 11×11 sheets (121 cards each)
- Packs are filled sequentially with advancing pointers
- Common cards use a **belt system** to ensure aspect diversity and prevent duplicates
- Different legendary rates for Sets 1-3 vs Sets 4-6

#### Belt System

The belt system prevents duplicate common cards by separating cards into two completely disjoint belts:
- **Belt A**: Vigilance + Command aspects (blue/green) + ~50% of Neutral/Hero/Villain cards
- **Belt B**: Aggression + Cunning aspects (red/yellow) + ~50% of Neutral/Hero/Villain cards
- Packs alternate pulls between belts (A, B, A, B, A, B, A, B, A) ensuring 4-5 cards from each belt
- **Zero duplicates guaranteed** - belts have no overlap

#### Set Differences: Sets 1-3 vs Sets 4-6

**Legendary Drop Rates:**
- **Sets 1-3 (SOR, SHD, TWI)**: 16 legendaries per set → ~13.3% legendary rate (~1 in 7.5 packs)
- **Sets 4-6 (JTL, LOF, SEC)**: 20 legendaries per set → ~16.7% legendary rate (~1 in 6 packs) - **HIGHER**

**Special Rarity Cards:**
- **Sets 1-3**: Special rarity only for leaders (8 per set), not in foil slots
- **Sets 4-6**: Special rarity for leaders (8) + non-leader specials (8) = 16 total, **can appear in foil slots** (~1.5-2%)

**Card Counts:**
| Set | Commons | Uncommons | Rares | Legendaries | Specials (non-leader) |
|-----|---------|-----------|-------|-------------|----------------------|
| SOR | 90 | 60 | 48 | 16 | 0 |
| SHD | 90 | 60 | 52 | 16 | 0 |
| TWI | 90 | 60 | 48 | 16 | 0 |
| JTL | 98 | 60 | 45 | **20** | **8** |
| LOF | 100 | 60 | 46 | **20** | **8** |
| SEC | 100 | 60 | 50 | **20** | **8** |

See `MANUFACTURING_RULES.md` for detailed implementation of the manufacturing rules.

## Quick Reference

### Essential Commands

```bash
# Development
npm install                  # Install dependencies
npm run dev                  # Start development server
npm run build                # Build for production

# Testing
npm test                     # Run all tests
npm run test-sheets SOR      # Test specific set
npm run test-rarity          # Test all rarity rates

# Visualization
npm run visualize-sheets SOR # Generate sheet visualizations
# Then open: sheets/SOR/index.html

# Data management
npm run fetch-cards          # Refresh card data from API
```

### Testing

Run the complete test suite:

```bash
npm test
```

Individual test suites:

```bash
npm run test-inspect         # Inspect sheet composition
npm run test-rarity          # Test ALL rarity rates (all sets)
npm run test-sheets SOR      # Comprehensive pack tests for a set
npm run test-belts           # Test belt system (zero duplicates)
npm run test-colors          # Test color constraints
npm run test-separation      # Test sheet separation
npm run visualize-sheets SOR # Generate visual sheet representations
                            # Then open sheets/SOR/index.html
npm run test-db              # Database connection test
npm run test-api             # API tests (requires server)
```

See `TESTING_GUIDE.md` for detailed testing instructions and `SHEET_VISUALIZATION_GUIDE.md` for sheet visualization.

### Code Structure

```
src/
├── utils/
│   ├── sheetGeneration.js      # Manufacturing rules, belt system
│   ├── packBuilder.js          # Pack generation, pointer management
│   ├── setConfigs/             # Set-specific parameters (SOR, SHD, TWI, JTL, LOF, SEC)
│   ├── sheetVisualization.js   # Sheet visualization
│   └── cardCache.js            # Card data management
├── data/
│   └── cards.json              # 4,973 cards from all sets
└── components/                 # React UI components

scripts/
├── run-all-tests.js            # Main test runner
├── testSheetPacks.js           # Comprehensive pack tests
├── testRarityRates.js          # Rarity rate validation
├── testBelts.js                # Belt system tests
└── visualizeSheets.js          # Generate sheet visualizations
```

### Documentation

- **`TESTING_GUIDE.md`** - Comprehensive testing instructions, verification checklist, troubleshooting
- **`MANUFACTURING_RULES.md`** - The 5 manufacturing rules, belt system explanation, test results
- **`SHEET_VISUALIZATION_GUIDE.md`** - How to generate and inspect sheet visualizations
- **`src/data/CARD_DATA_STRUCTURE.md`** - Card data format reference

## Future Features

- Draft mode (coming soon)
- Real-time card data from swudb.com API
- Card image display
- Export deck lists
- Statistics tracking

## Disclaimer

Protect the Pod is in no way affiliated with Disney or Fantasy Flight Games. Star Wars characters, cards, logos, and art are property of Disney and/or Fantasy Flight Games.
