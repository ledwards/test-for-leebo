# Belt System Documentation

This document describes the belt system used for generating booster packs.

## Overview

A **belt** is a cyclic queue of cards that provides cards for pack generation. Cards are drawn from the front of the belt, and when the belt runs low, it refills with a shuffled "boot" of cards.

## Belt Types

### Common Belts (A and B)

Each set has two common belts that provide the 9 commons in each pack:

- **Belt A**: Primary belt, fills most slots
- **Belt B**: Secondary belt, fills remaining slots

The slot assignments vary by block (see Block Definitions below).

### Other Belts

| Belt | Purpose |
|------|---------|
| LeaderBelt | Provides leader cards |
| BaseBelt | Provides base cards |
| UncommonBelt | Provides uncommon cards |
| RareLegendaryBelt | Provides rare/legendary cards |
| FoilBelt | Provides foil cards |
| HyperspaceLeaderBelt | Provides hyperspace variant leaders |
| HyperspaceBaseBelt | Provides hyperspace variant bases |
| HyperspaceUncommonBelt | Provides hyperspace variant uncommons |
| HyperspaceRareLegendaryBelt | Provides hyperspace variant rare/legendary |
| HyperfoilBelt | Provides hyperspace foil cards |
| ShowcaseLeaderBelt | Provides showcase variant leaders |

## Block Definitions

Cards are assigned to belts differently based on which block the set belongs to.

### Block 0 (Sets 1-3: SOR, SHD, TWI)

**Belt A (60 cards)**:
- Vigilance (Blue)
- Command (Green)
- Aggression (Red)
- Some Neutral cards moved from B to balance

**Belt B (30 cards)**:
- Cunning (Yellow)
- Villainy
- Heroism
- Neutral (remaining after balancing)

**Slot Pattern** (9 commons per pack):
- Slots 1-6: Belt A
- Slots 7-9: Belt B

**Belt Size Ratio**: 2:1 (60 cards : 30 cards)

**Hyperspace Upgrade Slot**: Slot 6

### Block A (Sets 4-6: JTL, LOF, SEC)

**Belt A (50 cards)**:
- Vigilance (Blue)
- Command (Green)
- Villainy

**Belt B (50 cards)**:
- Aggression (Red)
- Cunning (Yellow)
- Heroism
- Neutral

**Slot Pattern** (9 commons per pack):
- Slots 1-4: Belt A
- Slot 5: Alternates between Belt A and Belt B each pack
- Slots 6-9: Belt B

**Belt Size Ratio**: 1:1 (50 cards : 50 cards)

**Hyperspace Upgrade Slot**: Slot 4

### Block B (Sets 7+)

TBD - Currently defaults to Block A pattern.

## Static Belt Assignments

Common cards are statically assigned to belts in:
```
src/belts/data/commonBeltAssignments.js
```

This file is designed to be easily editable by hand. Each set has a `beltA` and `beltB` array containing card names.

### Assignment Rules

1. Cards are initially assigned based on their aspects
2. If belt sizes don't match targets, flexible cards are moved to balance:
   - Mono-Villainy cards
   - Mono-Heroism cards
   - Neutral cards (no aspects)
3. Final belt sizes must match the block's target sizes

### Balancing Algorithm

For Block 0:
1. Start with aspect-based assignment
2. Move mono-Villainy/Heroism/Neutral from B to A until A = 60
3. Verify final counts: A = 60, B = 30

For Block A:
1. Start with aspect-based assignment
2. Move flexible cards between belts until balanced
3. Verify final counts: A = 50, B = 50

## Deduplication

### Within-Belt Deduplication

- 12-card deduplication window prevents same card appearing close together
- Cards are skipped during boot generation if they're in the recent IDs window
- Seam deduplication runs at boot boundaries

### Within-Pack Deduplication

- After drawing 9 commons, the pack is checked for duplicates
- Any duplicate commons are replaced with fresh draws from the appropriate belt

## Color Proximity Rules

**Note**: With static belt assignments, color proximity is handled differently:
- Cards are shuffled within their belt
- No special aspect ordering is enforced within the belt
- Aspect coverage comes from the slot-to-belt mapping

## Hyperspace Upgrades

When a hyperspace upgrade occurs on a common slot:
1. The upgrade happens at the designated slot (Block 0: slot 6, Block A: slot 4)
2. We find the hyperspace variant of the card already in that slot
3. We do NOT pull from a separate hyperspace belt

This ensures the upgrade is a variant of a card that was "supposed to be there" rather than introducing a random card.

## Regenerating Belt Assignments

To regenerate the belt assignments from card data:

```bash
node scripts/writeBeltAssignments.cjs
```

This will:
1. Read all commons from each set
2. Assign them to belts based on aspects
3. Balance belt sizes
4. Write the assignments to `src/belts/data/commonBeltAssignments.js`

## Testing

Belt tests are in:
- `src/belts/CommonBelt.test.js`
- `src/qa/packGeneration.test.js`

Key test scenarios:
- Belt assignment sizes match targets
- No duplicates within dedup window
- Slot patterns are correct for each block
- Hyperspace upgrades happen in correct slot
