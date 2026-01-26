# Pack Generation System

This document describes the booster pack generation system used to simulate opening Star Wars Unlimited card packs.

## Overview

The pack generation system creates realistic booster packs following the same collation rules as physical packs. Each pack contains 16 cards with specific slot allocations and upgrade probabilities.

## Pack Structure

| Slot | Card Type | Count | Notes |
|------|-----------|-------|-------|
| 1 | Leader | 1 | Dual-aspect (always one of RGBY + H or V) |
| 2 | Base | 1 | Single-aspect (R, G, B, or Y only) |
| 3-11 | Commons | 9 | 6 from Belt A, 3 from Belt B |
| 12-14 | Uncommons | 3 | U1, U2, U3 slots |
| 15 | Rare/Legendary | 1 | 5:1 ratio (Sets 1-3) or 6:1 ratio (Sets 4-6) |
| 16 | Foil | 1 | Any rarity, weighted by population |

## Belt System

Commons are distributed across two belts with a 6:3 slot split:

### Belt A (Slots 1-6)
- **Aspects:** Aggression (R) + Vigilance (B) + Command (G) + Neutrals
- **Card count:** ~60 cards per set

### Belt B (Slots 7-9)
- **Aspects:** Cunning (Y) + Villainy-only (V) + Heroism-only (H)
- **Card count:** ~30 cards per set

### Aspect Coverage Guarantee

Every pack is guaranteed to contain all 6 aspects in its common slots:
- Aggression (R)
- Vigilance (B)
- Command (G)
- Cunning (Y)
- Heroism (H)
- Villainy (V)

This is enforced by `ensureAspectCoverage()` which may swap cards to ensure coverage.

## Upgrade Pass

After base pack generation, an upgrade pass applies hyperspace variants:

### Upgrade Rates (Sets 4-6)

| Slot | Upgrade | Rate |
|------|---------|------|
| Leader | Hyperspace | ~1/6 (17%) |
| Leader | Showcase | ~1/288 |
| Base | Hyperspace | ~1/4 (25%) |
| Common slot 6 | Hyperspace | ~1/3 (33%) |
| Uncommon U1, U2 | Hyperspace | ~1/8.5 each |
| Uncommon U3 | Hyperspace R/L | ~1/5.5 |
| Foil | Hyperfoil | ~1/50 |

Note: Rare slot never upgrades to hyperspace (0% rate).

## Foil Slot Rarity Weights

### Sets 1-3 (SOR, SHD, TWI)
```
Common: 70, Uncommon: 20, Rare: 8, Legendary: 2, Special: 0
```

### Sets 4-6 (JTL, LOF, SEC)
```
Common: 54, Uncommon: 18, Rare: 6, Legendary: 1
Special cards can appear in foil slot
```

## Deduplication

A 12-position deduplication window prevents the same card from appearing too close together within a belt. This ensures variety without completely preventing duplicates in a pack.

## File Structure

```
src/
├── utils/
│   ├── packConstants.js      # All probability constants
│   ├── boosterPack.js        # Main pack generation logic
│   ├── upgradePass.js        # Hyperspace upgrade logic
│   └── setConfigs/
│       ├── SOR.js            # Spark of Rebellion config
│       ├── SHD.js            # Shadows of the Galaxy config
│       ├── TWI.js            # Twilight of the Republic config
│       ├── JTL.js            # Jump to Lightspeed config
│       ├── LOF.js            # Legends of the Force config
│       └── SEC.js            # Secrets of Power config
├── belts/
│   ├── CommonBelt.js         # Common card belt
│   ├── FoilBelt.js           # Foil slot belt
│   ├── HyperspaceCommonBelt.js
│   ├── LeaderBelt.js
│   ├── BaseBelt.js
│   ├── UncommonBelt.js
│   └── RareBelt.js
└── data/
    └── cards.json            # Card database
```

## Usage

```javascript
import { generateBoosterPack } from '@/utils/boosterPack'

// Generate a single pack for a set
const pack = generateBoosterPack('JTL')

// Pack structure
{
  cards: [
    { name: "...", type: "Leader", ... },
    { name: "...", type: "Base", ... },
    // 9 commons
    // 3 uncommons
    // 1 rare/legendary
    // 1 foil
  ],
  setCode: 'JTL',
  packNumber: 1
}
```

## Configuration

All pack generation parameters are centralized in `src/utils/packConstants.js`:

```javascript
export const SETS_4_6_CONSTANTS = {
  // Foil slot weights
  foilSlotWeights: {
    Common: 54,
    Uncommon: 18,
    Rare: 6,
    Legendary: 1,
    Special: 0
  },

  // Upgrade rates
  hyperfoilRate: 1 / 50,
  leaderHyperspaceRate: 1 / 6,
  baseHyperspaceRate: 1 / 4,
  commonHyperspaceRate: 1 / 3,
  uncommonHyperspaceRate: 1 / 8.5,
  ucSlot3UpgradeRate: 1 / 5.5,
  rareSlotHyperspaceRate: 0,
  showcaseLeaderRate: 1 / 288,

  // Other settings
  rareSlotLegendaryRatio: 6,  // 1:6 legendary to rare
  specialInFoilSlot: true,
}
```

## Testing

Statistical tests validate pack generation:

```bash
npm test src/utils/boosterPack.test.js
```

Tests include:
- Aspect coverage (100% of packs must have all 6 aspects)
- Duplicate rate (within acceptable bounds)
- Foil-common correlation (should be random chance only)
- Hyperspace co-occurrence (each slot independent)
- Hyperfoil rate (~1/50)
- Rare/Legendary ratio

## Adding a New Set

1. Create a new config file in `src/utils/setConfigs/SETCODE.js`
2. Import the appropriate constants from `packConstants.js`
3. Define card counts for the set
4. Export the config with the set code
5. Add the config to the index in `setConfigs/index.js`

Example:
```javascript
import { SETS_4_6_CONSTANTS } from '../packConstants.js'

const constants = SETS_4_6_CONSTANTS

export const NEW_CONFIG = {
  setCode: 'NEW',
  setName: 'New Set Name',
  setNumber: 7,

  cardCounts: {
    leaders: { common: 8, rare: 10, total: 18 },
    bases: { common: 12, rare: 0, total: 12 },
    commons: 100,
    uncommons: 60,
    rares: 50,
    legendaries: 20,
    specials: 8
  },

  packRules: {
    rareBasesInRareSlot: true,
    specialInFoilSlot: constants.specialInFoilSlot,
  },

  rarityWeights: {
    foilSlot: constants.foilSlotWeights,
    hyperfoil: constants.hyperfoilWeights,
    ucSlot3Upgraded: constants.ucSlot3UpgradedWeights,
    hyperspaceNonFoil: constants.hyperspaceNonFoilWeights,
  },

  beltRatios: {
    rareToLegendary: constants.rareSlotLegendaryRatio,
  },

  upgradeProbabilities: {
    leaderToHyperspace: constants.leaderHyperspaceRate,
    leaderToShowcase: constants.showcaseLeaderRate,
    baseToHyperspace: constants.baseHyperspaceRate,
    foilToHyperfoil: constants.hyperfoilRate,
    thirdUCToHyperspaceRL: constants.ucSlot3UpgradeRate,
    firstUCToHyperspaceUC: constants.uncommonHyperspaceRate,
    secondUCToHyperspaceUC: constants.uncommonHyperspaceRate,
    commonToHyperspace: constants.commonHyperspaceRate,
    rareToHyperspaceRL: constants.rareSlotHyperspaceRate,
  }
}
```
