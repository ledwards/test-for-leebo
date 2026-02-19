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
| Rare bases | In rare slot | **In base slot (~1/6 rate)** |

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
2. **Base** (1) - Common from BaseBelt (~5/6), Rare from BaseBelt (~1/6)
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

LAW uses a **HyperspaceUpgradeBelt** (same as Sets 1-6) with `budget-0 = 0`, guaranteeing every pack has at least 1 HS card. The common slot fills the gap when no other slot upgrades.

| Upgrade | Rate | Belt | Notes |
|---------|------|------|-------|
| Leader → Hyperspace | 1/6 (~16.7%) | 10/60 | Same as Sets 1-6 |
| Leader → Showcase | **1/576 (~0.17%)** | independent | Significantly rarer |
| Base → Hyperspace | 1/6 (~16.7%) | 10/60 | Same as Sets 1-6 |
| Foil → Hyperfoil | **N/A** | — | Foil IS Hyperspace Foil |
| Common → Hyperspace | ~47% | 28/60 | Fills the gap for guaranteed ≥1 HS |
| UC Slot 3 → HS R/L | ~13% | 8/60 | Same as Sets 1-6 |
| UC1 → Hyperspace UC | ~7% | 4/60 | Same as Sets 1-6 |
| UC2 → Hyperspace UC | ~3% | 2/60 | Same as Sets 1-6 |
| Rare → Hyperspace | 1/15 (~6.7%) | 4/60 | Same as Sets 1-6 |
| Rare → Prestige | **1/18 (~5.5%)** | independent | New in LAW |

**Belt stats:** μ = 1.1 HS/pack, 90% budget-1 (exactly 1 HS), 10% budget-2 (2 HS)

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

## Multi-Aspect Cards

LAW introduces cards with **multiple primary aspects**:

### Double-Aspect Cards
Cards with two primary color aspects (e.g., Vigilance+Command, Vigilance+Cunning).

### Triple-Aspect Cards
Cards with three aspects — double primary + faction (e.g., Vigilance+Aggression+Heroism).

### Belt Assignment Strategy (Common Belts Only)

**First-Listed-Aspect Rule** (current assumption — see TBD):
- Use the **first aspect** in the card's aspects array to determine belt
- If first aspect is Belt A (Vigilance, Command, Villainy) → Belt A
- Otherwise → Belt B

Example: Vigilance+Cunning → first is Vigilance → Belt A

## Special Rules

### No Regular Foils
- The foil slot is **always** a Hyperspace Foil card
- Regular black-border foils are eliminated
- `packRules.foilSlotIsHyperspaceFoil: true`

### Guaranteed Hyperspace Card
- Every pack contains at least 1 Hyperspace card (not counting HSF)
- Enforced by HyperspaceUpgradeBelt with `budget-0 = 0`
- The upgrade may be leader, base, common, UC, or R/L — the belt decides
- Common slot 5 fills the gap when no other slot upgrades (~47% of packs)

### Prestige Cards in Standard Packs
- ~1 in 18 packs contains a non-foil Prestige variant
- Appears in the rare slot (replaces R/L)
- `packRules.prestigeInStandardPacks: true`
- Note: Foil/serialized Prestige remain Carbonite-exclusive

### Rare Bases in Base Slot
- LAW is the **first set** where rare bases appear in the **base slot** (not the rare slot)
- Sets 1-6: rare bases go in the rare slot (via RareLegendaryBelt)
- Set 7+ (LAW): rare bases go in the base slot (via BaseBelt) at ~1/6 rate
- `packRules.rareBasesInRareSlot: false`
- 3 rare bases: Alliance Outpost, Shipbreaking Yard, Citadel Research Center

### Credit Tokens
- New token type introduced in LAW
- Can be defeated to help pay resource costs
- Does not count as a resource for deployment

## Implementation Details

### Pack Generation Flow
1. Generate base pack (leader, base, commons, uncommons, R/L)
2. Use HyperfoilBelt for foil slot (not FoilBelt)
3. HyperspaceUpgradeBelt ('LAW' config) determines which slots get HS upgrades
4. Belt guarantees ≥1 HS per pack (budget-0 = 0)
5. Skip foil→hyperfoil upgrade (already HS)
6. (TODO) Handle Prestige in rare slot

### HSF & HS Variant Data Fallback
LAW currently has no Hyperspace or Hyperspace Foil variant card data. Two fallback mechanisms handle this:
- **HyperfoilBelt**: Falls back to Normal variants when no `variantType === 'Hyperspace Foil'` cards exist. Cards are marked `isFoil: true, isHyperspace: true` as placeholders.
- **findHyperspaceVariant()**: Falls back to returning the original card with `isHyperspace: true` when no `variantType === 'Hyperspace'` variant exists (only for LAW+ sets).

When real HS/HSF data is loaded (via `npm run fetch-cards`), the fallbacks are automatically bypassed.

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

## TBD / Unknowns

Things we don't know yet or are making assumptions about:

| Item | Current Assumption | Status |
|------|-------------------|--------|
| **Double-aspect belt assignment** | First-listed-aspect determines belt (A or B) for common cards | Assumption — no data on how FFG actually collates these |
| **Triple-aspect belt assignment** | Same first-listed-aspect rule | Assumption — same as above |
| **Hyperspace Foil card data** | Using Normal variants as placeholders, marked `isFoil+isHyperspace` | Waiting for swuapi.com to add HSF data |
| **Hyperspace card data** | Using Normal variants with `isHyperspace` flag as placeholders | Waiting for swuapi.com to add HS data |
| **Exact HS rates** | Matching Sets 1-6 (leader 1/6, base 1/6, R/L 1/15) with belt guaranteeing ≥1 | No official data; real rates TBD |
| **HS belt budget distribution** | 90% budget-1, 10% budget-2, μ=1.1 | Tunable — real distribution unknown |
| **Prestige card implementation** | Placeholder only (commented out) | Waiting for Prestige variant data |
| **Prestige rate** | ~1/18 in rare slot | Estimated from FFG announcement |
| **Showcase leader rate** | ~1/576 ("significantly rarer" than 1/288) | Estimated — exact multiplier unknown |
| **Common belt assignments** | Auto-assigned by aspect (no static list yet) | Need to finalize static assignments from actual print data |
| **Card counts** | Preliminary from partial swuapi.com data | Will change when full data is available |
| **Rare base behavior** | In base slot at ~1/6 rate | First set for this rule (sets 1-6 use rare slot) |

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
