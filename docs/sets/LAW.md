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
| HS common | ~1 in 3 packs (upgrade) | **Dedicated belt (slot 5, always HS)** |
| Prestige cards | Carbonite only | **~1/18 packs in UC3 slot** |
| Showcase leaders | ~1 in 288 | ~1 in 576 (rarer) |
| Triple-aspect cards | None | **Introduced** |
| Rare bases | In rare slot | In rare slot (same) |

## Card Counts

> See [LAW_TBD.md](LAW_TBD.md) for preliminary data notes.

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
2. **Base** (1) - Common from BaseBelt (always common)
3. **Commons** (4) - Slots 1-4 from Belt A (NO HS upgrade)
4. **HS Common** (1) - Slot 5 from dedicated HyperspaceCommonBelt (always HS, equal distribution)
5. **Commons** (4) - Slots 6-9 from Belt B (NO HS upgrade)
6. **Hyperspace Foil** (1) - **Always Hyperspace Foil** (no regular foils)
7. **Uncommons** (3) - UC1, UC2 can upgrade to HS UC; UC3 can upgrade to Prestige (~1/18) OR HS R/L
8. **Rare/Legendary** (1) - 5:1 ratio, CANNOT upgrade

> **Note:** In sets 1-6, the foil is at the end of the pack (index 15). In LAW+, the HS Foil is at index 11 (after 9 commons), before the 3 uncommons and R/L.
> **Note:** UC3 prestige check runs FIRST; if it misses, HS R/L check runs. Cannot be both.

### Belt Configuration (Block B) — Verified from Physical Packs

| Belt | Assignment Rule | Target Size | Slots |
|------|----------------|-------------|-------|
| A | Vigilance first, Aggression first, Villainy-only, Heroism-only, + Hidden Hand Supplier | 50 | 1-4 |
| HS Common | All commons (equal) | — | 5 (dedicated HyperspaceCommonBelt) |
| B | Cunning first, Command first, Neutral (no aspects) − Hidden Hand Supplier | 50 | 6-9 |

### Dedicated HS Common Slot
- Position: Slot 5 (1-indexed), Pack Index: 6 (after leader + base + 4 commons)
- Drawn from `HyperspaceCommonBelt` — always HS, equal distribution across all HS commons
- NOT an upgrade of a normal common — it's a dedicated belt
- The other 8 common spots (Belt A slots 1-4, Belt B slots 6-9) do NOT upgrade to HS
- No alternating slot in Block B (slot 5 is always HS common)

## Upgrade Probabilities

LAW uses a **HyperspaceUpgradeBelt** with `common: 0` (HS common comes from dedicated belt, not upgrade). Slot 5 is always HS common.

| Upgrade | Rate | Belt | Notes |
|---------|------|------|-------|
| Leader → Hyperspace | 1/6 (~16.7%) | 10/60 | Same as Sets 1-6 |
| Leader → Showcase | **1/576 (~0.17%)** | independent | Significantly rarer |
| Base → Hyperspace | 1/6 (~16.7%) | 10/60 | Same as Sets 1-6 |
| Foil → Hyperfoil | **N/A** | — | Foil IS Hyperspace Foil |
| Common → Hyperspace | **0** | — | HS common is dedicated belt (slot 5), not an upgrade |
| UC3 → Prestige | **~1/18 (~5.6%)** | independent | Checked FIRST before HS R/L |
| UC3 → HS R/L/S | ~13% | 8/60 | Fallback if prestige misses |
| UC1 → Hyperspace UC | ~7% | 4/60 | Same as Sets 1-6 |
| UC2 → Hyperspace UC | ~3% | 2/60 | Same as Sets 1-6 |
| R/L → Prestige | **0** | — | R/L slot CANNOT upgrade |
| R/L → Hyperspace | **0** | — | R/L slot NEVER upgrades to HS |

**Belt stats:** μ = 34/60 ≈ 0.57 belt upgrades + 1 dedicated HS common = ~1.57 HS/pack

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

## Belt Assignments — Verified from Physical Packs

Belt assignments use **aspect-based auto-assignment** with rules verified from physical LAW pack openings.

### Belt A Rules (50 cards)
- **Vigilance (Blue) as first aspect** — 22 cards (includes multi-aspect like Vigilance+Cunning)
- **Aggression (Red) as first aspect** — 21 cards (includes multi-aspect like Aggression+Villainy)
- **Villainy-only** (mono-aspect) — 3 cards
- **Heroism-only** (mono-aspect) — 3 cards
- **Override**: Hidden Hand Supplier (neutral, manually assigned to Belt A) — 1 card

### Belt B Rules (50 cards)
- **Cunning (Yellow) as first aspect** — 21 cards (includes multi-aspect like Cunning+Villainy)
- **Command (Green) as first aspect** — 22 cards (includes multi-aspect like Command+Aggression)
- **Neutral** (no aspects) — 7 cards (8 total minus Hidden Hand Supplier override)

### Key Differences from Block A (Sets 4-6)
Block A used Vigilance/Command/Villainy vs Aggression/Cunning/Heroism/Neutral. LAW's physical belt assignment is different: it groups by **color axis** (blue+red vs yellow+green) with mono-faction cards (Villainy-only, Heroism-only) on Belt A.

## Multi-Aspect Cards

LAW introduces cards with **multiple primary aspects**:

### Double-Aspect Cards
Cards with two primary color aspects (e.g., Vigilance+Command, Vigilance+Cunning). Assigned by **first-listed aspect**.

### Triple-Aspect Cards
Cards with three aspects — double primary + faction (e.g., Vigilance+Aggression+Heroism). Assigned by **first-listed aspect**.

Example: Vigilance+Cunning → first is Vigilance → Belt A

## Special Rules

### No Regular Foils
- The foil slot is **always** a Hyperspace Foil card
- Regular black-border foils are eliminated
- `packRules.foilSlotIsHyperspaceFoil: true`

### Dedicated HS Common
- Slot 5 is always an HS common from `HyperspaceCommonBelt` (equal distribution)
- NOT an upgrade — comes directly from a dedicated belt
- The other 8 commons (Belt A slots 1-4, Belt B slots 6-9) do NOT upgrade to HS
- Additional HS upgrades (leader, base, UC, etc.) are belt-driven as usual

### Prestige Cards in Standard Packs
- ~1/18 packs contains a non-foil Prestige tier 1 variant
- Appears in the **UC3 slot** (replaces the 3rd uncommon)
- Prestige check runs FIRST, takes priority over HS R/L upgrade
- `packRules.prestigeInStandardPacks: true`
- R/L slot CANNOT upgrade to Prestige (unlike earlier implementation)
- Note: Foil/serialized Prestige remain Carbonite-exclusive

### Rare Bases in Rare Slot
- LAW rare bases go in the **rare slot** (same as all previous sets)
- `packRules.rareBasesInRareSlot: true`
- 3 rare bases: Alliance Outpost, Shipbreaking Yard, Citadel Research Center

### Credit Tokens
- New token type introduced in LAW
- Can be defeated to help pay resource costs
- Does not count as a resource for deployment

## Implementation Details

### Pack Generation Flow
1. Generate base pack: leader, base, 4 commons (Belt A), 1 HS common (HyperspaceCommonBelt), 4 commons (Belt B)
2. Insert HS Foil (from HyperfoilBelt) at index 11 (after commons, before uncommons)
3. Generate 3 uncommons, then R/L
4. Upgrade pass:
   - Leader: Showcase (independent) or HS (belt-driven)
   - Base: HS (belt-driven)
   - UC1, UC2: HS UC (belt-driven)
   - UC3: Prestige tier 1 (~1/18, checked first) OR HS R/L (belt-driven fallback)
   - R/L: CANNOT upgrade
   - Common: NO upgrades (slot 5 is already HS from dedicated belt)
5. Skip foil→hyperfoil upgrade (already HS)

> **Note:** HSF/HS variant data and Prestige cards use placeholder implementations. See [LAW_TBD.md](LAW_TBD.md) for details.

### Code Checks
```javascript
// Check if set uses LAW+ rules
usesLawPackRules(setCode)  // Returns true for LAW

// Belt configuration
getBlockForSet('LAW')  // Returns 'B'
getBeltConfig('B')     // Returns config with alternatingSlot: null, hyperspaceSlot: 5
```

## Limited/Draft Play

Leader rankings and powerful cards will be added post-release. See [LAW_TBD.md](LAW_TBD.md).

## Placeholders & Unknowns

See **[LAW_TBD.md](LAW_TBD.md)** for all temporary placeholders, estimated rates, and assumptions.

## Sources

- [A Shift from What Was](https://starwarsunlimited.com/articles/a-shift-from-what-was) - Pack rule changes
- [A Lawless Time](https://starwarsunlimited.com/articles/a-lawless-time) - Set announcement
- [Hints of Lawlessness](https://starwarsunlimited.com/articles/hints-of-lawlessness) - Mechanic previews

## Related Files

- `src/utils/setConfigs/LAW.ts` - Set configuration
- `src/belts/data/commonBeltAssignments.ts` - Belt assignments and helpers
- `src/belts/HyperfoilBelt.ts` - HSF belt (with Normal variant fallback for LAW)
- `src/utils/packConstants.ts` - `SET_7_PLUS_CONSTANTS`
- `src/utils/boosterPack.ts` - `usesLawPackRules()`, `findHyperspaceVariant()` (with LAW fallback)
- `src/qa/hyperspaceDistribution.test.ts` - LAW HS distribution QA tests
