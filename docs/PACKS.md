# Pack Generation Documentation

This document describes how booster packs are generated.

## Pack Structure

Each booster pack contains 16 cards:

| Slot | Card Type | Count |
|------|-----------|-------|
| 1 | Leader | 1 |
| 2 | Base | 1 |
| 3-11 | Commons | 9 |
| 12-14 | Uncommons | 3 |
| 15 | Rare/Legendary | 1 |
| 16 | Foil | 1 |

## Common Slot Distribution

Commons are drawn from two belts (A and B) based on the set's block.

### Block 0 (SOR, SHD, TWI)

```
Slot 1: Belt A
Slot 2: Belt A
Slot 3: Belt A
Slot 4: Belt A
Slot 5: Belt A
Slot 6: Belt A  ← Hyperspace upgrade slot
Slot 7: Belt B
Slot 8: Belt B
Slot 9: Belt B
```

### Block A (JTL, LOF, SEC)

```
Slot 1: Belt A
Slot 2: Belt A
Slot 3: Belt A
Slot 4: Belt A  ← Hyperspace upgrade slot
Slot 5: Alternates (A or B each pack)
Slot 6: Belt B
Slot 7: Belt B
Slot 8: Belt B
Slot 9: Belt B
```

## Upgrade System

After the base pack is assembled, an upgrade pass may modify certain slots based on probabilities.

### Upgrade Types

| Upgrade | Description | Probability Source |
|---------|-------------|-------------------|
| Leader → Showcase | Find showcase variant of same leader | `leaderToShowcase` |
| Leader → Hyperspace | Find HS variant of same leader | `leaderToHyperspace` |
| Base → Hyperspace | Find HS variant of same base | `baseToHyperspace` |
| Rare → Hyperspace | Find HS variant of same rare | `rareToHyperspaceRL` |
| Foil → Hyperfoil | Draw random HS foil | `foilToHyperfoil` |
| UC1 → HS Uncommon | Find HS variant of 1st uncommon | `firstUCToHyperspaceUC` |
| UC2 → HS Uncommon | Find HS variant of 2nd uncommon | `secondUCToHyperspaceUC` |
| UC3 → HS Rare/Legendary | Draw random HS R/L | `thirdUCToHyperspaceRL` |
| Common → Hyperspace | Find HS variant of common in slot | `commonToHyperspace` |

### Common Hyperspace Upgrade

The common hyperspace upgrade works differently from other upgrades:

1. **Fixed Slot**: The upgrade always happens at a specific slot
   - Block 0: Slot 6
   - Block A: Slot 4

2. **Variant of Existing Card**: We find the hyperspace variant of the card that's already in that slot, NOT a random hyperspace card

3. **No Belt Pull**: We don't pull from a hyperspace common belt

This ensures the hyperspace card is a variant of something that was "supposed to be there" based on the belt system.

## Aspect Coverage

The belt system is designed to ensure all 6 aspects appear in every pack's commons:

### Block 0
- Belt A covers: Vigilance, Command, Aggression
- Belt B covers: Cunning, Villainy, Heroism, Neutral
- Combined: All aspects covered

### Block A
- Belt A covers: Vigilance, Command, Villainy
- Belt B covers: Aggression, Cunning, Heroism, Neutral
- Combined: All aspects covered

### Safety Net

After drawing commons, `ensureAspectCoverage()` runs as a safety net:
1. Checks which aspects are present in the pack's commons
2. If any aspect is missing, replaces a redundant common with one that has the missing aspect
3. Runs again after upgrades in case they broke aspect coverage

## Sealed Pod Generation

A sealed pod consists of 6 booster packs:

```javascript
generateSealedPod(cards, setCode, packCount = 6)
```

Key behaviors:
1. Belt cache is cleared before generating a pod
2. This ensures each sealed pool starts with a fresh belt state
3. Packs are generated sequentially, with belts advancing between packs

## Configuration

Pack generation constants are in:
```
src/utils/packConstants.js
```

Set-specific configurations are in:
```
src/utils/setConfigs/
```

## Testing

Pack tests are in:
- `src/utils/boosterPack.test.js` - Unit tests
- `src/qa/packGeneration.test.js` - Statistical QA tests

Key test scenarios:
- All packs have exactly 16 cards
- No duplicate base treatment cards within a pack
- Aspect coverage validation
- Hyperspace upgrade rates
- Card variety distribution

## Known Learnings

### From Physical Box Opens

1. **Belt Sizes**: Block 0 uses 60/30 split, Block A uses 50/50 split
2. **Slot Patterns**: Physical packs follow consistent slot-to-belt patterns
3. **Hyperspace Slots**: Fixed slots for hyperspace upgrades (not random)
4. **Alternating Slot**: Block A slot 5 alternates between belts

### Edge Cases

1. **Small Belt**: If belt is smaller than dedup window, cards may appear closer together
2. **Missing Cards**: If a card name in assignments doesn't match the database, it's skipped with a warning
3. **Aspect Coverage**: Rare cases where all cards of an aspect are already in the pack - skip the fix rather than create duplicates

## File Locations

| File | Purpose |
|------|---------|
| `src/utils/boosterPack.js` | Main pack generation logic |
| `src/utils/packConstants.js` | Pack structure constants |
| `src/belts/CommonBelt.js` | Common belt implementation |
| `src/belts/data/commonBeltAssignments.js` | Static belt assignments |
| `scripts/writeBeltAssignments.cjs` | Regenerate belt assignments |
