# LAW - A Lawless Time

> **LLM INSTRUCTION**: Keep this document up to date whenever LAW-related pack generation logic, belt assignments, rarity weights, or configurations change.

## Overview

| Property | Value |
|----------|-------|
| Set Code | LAW |
| Set Number | 7 |
| Set Name | A Lawless Time |
| Release Date | 2026-03-13 |
| Block | B |
| Color | `#8B4513` (Brown) |
| Status | **Pre-Release** |

## Major Changes from Previous Sets

LAW introduces significant pack construction changes per [official FFG announcement](https://starwarsunlimited.com/articles/a-shift-from-what-was):

| Feature | Sets 1-6 | LAW (Set 7+) |
|---------|----------|--------------|
| Foil slot | Regular foil (upgrades to HS Foil) | **Always Hyperspace Foil** |
| HS common | ~1 in 3 packs | **Guaranteed every pack** |
| Prestige cards | Carbonite only | **~1 in 18 standard packs** |
| Showcase leaders | ~1 in 288 | ~1 in 576 (rarer) |
| Triple-aspect cards | None | **Introduced** |
| Rare bases | In rare slot | In rare slot (last set) |

## Card Counts (Preliminary)

> Note: Card data is preliminary from swuapi.com. Update when full data available.

| Category | Count |
|----------|-------|
| Total Cards | ~121 (partial data) |
| Leaders (Common) | 4 |
| Leaders (Rare) | 5 |
| Leaders (Special) | 2 |
| Leaders (Total) | 11 |
| Bases (Common) | 4 |
| Bases (Rare) | 3 |
| Bases (Special) | 1 |
| Bases (Total) | 8 |
| Commons | 19 |
| Uncommons | 34 |
| Rares | 28 |
| Legendaries | 13 |
| Specials | 10 |

## Pack Construction

### Standard Pack (16 cards)
1. **Leader** (1) - From LeaderBelt, alternating Common/Rare
2. **Base** (1) - Common from BaseBelt
3. **Commons** (9) - Slots 1-4 from Belt A, slot 5 **always Hyperspace**, slots 6-9 from Belt B
4. **Uncommons** (3) - From UncommonBelt
5. **Rare/Legendary/Prestige** (1) - 5:1 ratio, ~1/18 Prestige
6. **Hyperspace Foil** (1) - **Always Hyperspace Foil** (no regular foils)

### Belt Configuration (Block B)

| Belt | Aspects | Target Size | Slots |
|------|---------|-------------|-------|
| A | Vigilance, Command, Villainy | 50 | 1-4, alternating 5 |
| B | Aggression, Cunning, Heroism, Neutral | 50 | alternating 5, 6-9 |

### Guaranteed Hyperspace Slot
- Position: Slot 5 (1-indexed)
- Pack Index: 6 (after leader + base + 4 commons)
- **ALWAYS** upgraded to Hyperspace variant (not probabilistic)

## Upgrade Probabilities

| Upgrade | Rate | Notes |
|---------|------|-------|
| Leader → Hyperspace | 1/6 (~16.7%) | ~4 per box |
| Leader → Showcase | **1/576 (~0.17%)** | Significantly rarer |
| Base → Hyperspace | 1/4 (25%) | ~6 per box |
| Foil → Hyperfoil | **N/A** | Foil IS Hyperspace Foil |
| Common → Hyperspace | **100%** | Slot 5 always HS |
| Additional Common → HS | 1/6 (~16.7%) | Beyond guaranteed |
| UC Slot 3 → HS R/L | 1/5 (20%) | Rarity upgrade |
| UC → Hyperspace UC | 1/8 (12.5%) | Slots 1-2 |
| Rare → Hyperspace | 0% | Never |
| Rare → Prestige | **1/18 (~5.5%)** | New in LAW |

## Rarity Weights

### Hyperspace Foil Slot (Replaces Regular Foil)
| Rarity | Weight | Percentage |
|--------|--------|------------|
| Common | 65 | 65% |
| Uncommon | 20 | 20% |
| Rare | 8 | 8% |
| Special | 4 | 4% |
| Legendary | 3 | 3% |

### UC Slot 3 (When Upgraded)
| Rarity | Weight | Percentage |
|--------|--------|------------|
| Uncommon | 60 | 60% |
| Rare | 25 | 25% |
| Special | 10 | 10% |
| Legendary | 5 | 5% |

### Hyperspace Non-Foil
| Rarity | Weight | Percentage |
|--------|--------|------------|
| Common | 85 | 85% |
| Uncommon | 7 | 7% |
| Rare | 4 | 4% |
| Special | 3 | 3% |
| Legendary | 1 | 1% |

## Belt Assignments

Belt assignments use **auto-assignment** based on aspects until static assignments are created.

### Auto-Assignment Rules
Cards are assigned to belts based on their aspects:
- If card has ANY Belt A aspect (Vigilance, Command, Villainy) → **Belt A**
- Otherwise → **Belt B**

This handles triple-aspect cards (see below).

### Belt A Aspects
- Vigilance (Blue)
- Command (Green)
- Villainy

### Belt B Aspects
- Aggression (Red)
- Cunning (Yellow)
- Heroism
- Neutral

## Triple-Aspect Cards

LAW introduces cards with **three aspects** (double primary aspect):
- Example: Zeb Orellios has Vigilance + Aggression + Heroism
- Example: Maul has multiple aspects

### Belt Assignment Strategy
Configurable in `LAW_CONFIG.tripleAspect`:

```javascript
tripleAspect: {
  enabled: true,
  beltAssignment: 'primaryAspectPriority',
  // Options: 'primaryAspectPriority', 'randomBelt', 'splitEvenly'
}
```

**Primary Aspect Priority** (current):
- If card has ANY Belt A aspect → Belt A
- Otherwise → Belt B

This ensures cards like Zeb (Vig+Agg+Hero) go to Belt A (has Vigilance).

## Special Rules

### No Regular Foils
- The foil slot is **always** a Hyperspace Foil card
- Regular black-border foils are eliminated
- `packRules.foilSlotIsHyperspaceFoil: true`

### Guaranteed Hyperspace Common
- Every pack contains at least 1 Hyperspace common
- Slot 5 (middle common) is always upgraded
- `packRules.guaranteedHyperspaceCommon: true`

### Prestige Cards in Standard Packs
- ~1 in 18 packs contains a non-foil Prestige variant
- Appears in the rare slot (replaces R/L)
- `packRules.prestigeInStandardPacks: true`
- Note: Foil/serialized Prestige remain Carbonite-exclusive

### Rare Bases (Last Set)
- LAW is the **last set** where rare bases appear in the rare slot
- Future sets (8+) will have rare bases in the base slot
- `packRules.rareBasesInRareSlot: true`

### Credit Tokens
- New token type introduced in LAW
- Can be defeated to help pay resource costs
- Does not count as a resource for deployment

## Implementation Details

### Pack Generation Flow
1. Generate base pack (leader, base, commons, uncommons, R/L)
2. Use HyperfoilBelt for foil slot (not FoilBelt)
3. Always upgrade slot 5 to Hyperspace (guaranteed)
4. Apply other upgrades (leader HS, base HS, etc.)
5. Skip foil→hyperfoil upgrade (already HS)
6. (TODO) Handle Prestige in rare slot

### Code Checks
```javascript
// Check if set uses LAW+ rules
usesLawPackRules(setCode)  // Returns true for LAW

// Belt configuration
getBlockForSet('LAW')  // Returns 'B'
getBeltConfig('B')     // Returns config with guaranteedHyperspace: true
```

## Limited/Draft Play

> Note: LAW is currently in pre-release (available to beta testers). Leader rankings and powerful cards will be added after the set releases and community data is available.

### Leader Rankings

_To be determined after set release._

### Powerful Cards

_To be determined after set release._

## Sources

- [A Shift from What Was](https://starwarsunlimited.com/articles/a-shift-from-what-was) - Pack rule changes
- [A Lawless Time](https://starwarsunlimited.com/articles/a-lawless-time) - Set announcement
- [Hints of Lawlessness](https://starwarsunlimited.com/articles/hints-of-lawlessness) - Mechanic previews

## Related Files

- `src/utils/setConfigs/LAW.js` - Set configuration
- `src/belts/data/commonBeltAssignments.js` - Belt assignments and helpers
- `src/utils/packConstants.js` - `SET_7_PLUS_CONSTANTS`
- `src/utils/boosterPack.js` - `usesLawPackRules()` function
