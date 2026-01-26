# Pack Collation Findings

Based on analysis of real TWI booster pack data (24 packs opened and documented).

## Pack Structure

A booster pack contains 16 cards in the following slots:

| Slot Type | Count | Notes |
|-----------|-------|-------|
| Leader | 1 | Dual-aspect |
| Base | 1 | Single-aspect |
| Common | 9 | Split across two belts |
| Uncommon | 3 | U1, U2, U3 |
| Rare/Legendary | 1 | Not analyzed in this data |
| Foil | 1 | Any rarity |

## Common Slot Belt Structure

Commons are distributed across two belts with a **6:3 slot split** (not alternating):

### Belt A (Slots 1-6)
- **Aspects:** Aggression (R) + Vigilance (B) + Command (G) + Neutrals
- **Card count:** ~60 cards per set

### Belt B (Slots 7-9)
- **Aspects:** Cunning (Y) + Villainy-only (V) + Heroism-only (H)
- **Card count:** ~30 cards per set

### Ratio Justification
The 2:1 ratio holds across all sets:

| Set | Belt A Cards | Belt B Cards | Ratio |
|-----|--------------|--------------|-------|
| SOR | 58 | 32 | 1.81 |
| SHD | 60 | 30 | 2.00 |
| TWI | 60 | 30 | 2.00 |
| JTL | 63 | 27 | 2.33 |
| LOF | 60 | 30 | 2.00 |
| SEC | 60 | 30 | 2.00 |

## Leader Patterns

### Aspect Distribution
- **Always dual-aspect:** One of R/G/B/Y paired with either H or V
- Examples: RH, GV, BH, YV, GH, BV, YH, RV

### Rarity Distribution
- Common: ~87%
- Rare: ~13%

### H vs V Split
- Heroism (H): ~52%
- Villainy (V): ~48%
- Nearly balanced 50/50

### Independence
- Leader aspect does NOT correlate with Base aspect
- They are drawn from independent belts

## Base Patterns

### Aspect Distribution
- **Always single-aspect:** R, G, B, or Y only
- **Never:** H, V, or multi-aspect

### Distribution
Roughly even across the four aspects (~25% each)

## Hyperspace (HS) Upgrade Rules

**Key insight:** HS upgrades have dedicated slot positions - they don't randomly replace any card of that rarity.

### HS Upgrade Slots (Sets 4-6)

| Slot Type | Position | Rate |
|-----------|----------|------|
| HS Leader | Replaces Leader | ~1/6 (17%) |
| Showcase Leader | Replaces Leader | ~1/288 |
| HS Base | Replaces Base | ~1/4 (25%) |
| HS Common | Replaces Common slot 6 | ~1/3 (33%) |
| HS Uncommon (U1, U2) | Replaces Uncommon slots 1-2 | ~1/8.5 each |
| HS Rare/Legendary (U3) | Replaces Uncommon slot 3 | ~1/5.5 |
| HS Rare Slot | Never | 0% |

### Independence
- Each HS upgrade is independent
- A single pack can have multiple HS cards (0-4+)
- Example: Pack 19 had 3 HS cards (Leader + Common + Uncommon)

### Implementation Reference
See `src/utils/packConstants.js` for all exact rates per set.

## Foil Slot Rarity Distribution

The foil slot can contain any rarity with weighted probabilities:

### Sets 1-3 (SOR, SHD, TWI)
| Rarity | Weight | Approx Rate |
|--------|--------|-------------|
| Common | 70 | 70% |
| Uncommon | 20 | 20% |
| Rare | 8 | 8% |
| Legendary | 2 | 2% |
| Special | 0 | 0% |

### Sets 4-6 (JTL, LOF, SEC)
| Rarity | Weight | Approx Rate |
|--------|--------|-------------|
| Common | 54 | 68.4% |
| Uncommon | 18 | 22.8% |
| Rare | 6 | 7.6% |
| Legendary | 1 | 1.2% |
| Special | (in slot) | See note |

**Note:** In Sets 4+, Special (promo) cards can appear in the foil slot.

### Hyperfoil Rate
- ~1/50 packs contain a hyperfoil (hyperspace + foil)

## Aspect Guarantees Per Pack

Based on common slot analysis:

| Aspect Type | Guaranteed? | Observed Rate |
|-------------|-------------|---------------|
| Heroism (H) | Yes | 100% |
| Villainy (V) | No | 83% |
| Neutral (N) | No | 38% |
| All 4 standalone (R,G,B,Y) | No | 50% |

### Implementation: 6-Aspect Coverage

The current implementation guarantees that all 6 aspects (Aggression, Vigilance, Command, Cunning, Heroism, Villainy) appear in every pack's common slots. This is enforced by `ensureAspectCoverage()` which runs:
1. After initial card selection
2. After hyperspace upgrade pass (to maintain coverage if HS cards don't have the required aspects)

## Duplicate Prevention

A deduplication window of 12 positions is used within each belt to prevent the same card from appearing too close together. This ensures variety within a pack's commons.

## Implementation Notes

1. **Belt structure:** Implement 6:3 split, not alternating belts
2. **HS upgrades:** Use fixed slot positions, not random replacement
3. **Leader/Base independence:** No need to coordinate between these belts
4. **Foil pool:** Draw from combined rarity pool, naturally weighted by card count
5. **Constants:** All pack generation rates are centralized in `src/utils/packConstants.js`
6. **Set configs:** Per-set configurations in `src/utils/setConfigs/*.js`

## Related Files

- `src/utils/packConstants.js` - All probability constants
- `src/utils/boosterPack.js` - Pack generation logic
- `src/utils/upgradePass.js` - Hyperspace upgrade logic
- `src/belts/*.js` - Belt implementations
