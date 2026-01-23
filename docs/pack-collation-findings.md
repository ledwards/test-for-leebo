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

### HS Upgrade Slots

| Slot Type | Position | Observed Rate |
|-----------|----------|---------------|
| HS Leader | Replaces Leader | ~17% |
| HS Base | Replaces Base | ~17% |
| HS Common | Replaces Common slot 6 | ~33% |
| HS Uncommon | Replaces Uncommon slot 3 (U3) | ~17% |

### Independence
- Each HS upgrade is independent
- A single pack can have multiple HS cards (0-4+)
- Example: Pack 19 had 3 HS cards (Leader + Common + Uncommon)

## Foil Slot Rarity Distribution

The foil slot can contain any rarity, weighted by card population:

| Rarity | Rate |
|--------|------|
| Common | ~65% |
| Uncommon | ~25% |
| Rare | ~10% |
| Legendary | ~0% (none observed in 20 samples) |

## Aspect Guarantees Per Pack

Based on common slot analysis:

| Aspect Type | Guaranteed? | Observed Rate |
|-------------|-------------|---------------|
| Heroism (H) | Yes | 100% |
| Villainy (V) | No | 83% |
| Neutral (N) | No | 38% |
| All 4 standalone (R,G,B,Y) | No | 50% |

## Implementation Notes

1. **Belt structure:** Implement 6:3 split, not alternating belts
2. **HS upgrades:** Use fixed slot positions, not random replacement
3. **Leader/Base independence:** No need to coordinate between these belts
4. **Foil pool:** Draw from combined rarity pool, naturally weighted by card count
