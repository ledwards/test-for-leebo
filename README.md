# SWU Pod - Star Wars: Unlimited Sealed Pod Simulator

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

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

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

## Future Features

- Draft mode (coming soon)
- Real-time card data from swudb.com API
- Card image display
- Export deck lists
- Statistics tracking
