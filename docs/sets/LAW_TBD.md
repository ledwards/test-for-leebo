# LAW (A Lawless Time) - TBD Items

This document tracks things we don't know yet about Set 7 pack collation and need to verify once we have physical packs and more data.

## Pack Collation TBDs

### 1. Guaranteed Hyperspace Common Slot Position
**Current assumption:** Slot 9 (last common)
**Why:** Minimizes duplicates by placing it at the end of common sequence
**To verify:** Open physical packs and track which slot has the HS common
**File:** `src/belts/data/commonBeltAssignments.ts` - Block B `hyperspaceSlot`

### 2. Hyperspace Foil (HSF) Rarity Distribution
**Current assumption:** Falls back to Normal variants with `isHyperspace: true` flag when no HSF variant data exists
**Unknown:** Actual HSF rarity weights in the foil slot
**To verify:** Track HSF pulls from physical packs, compare rarity distribution
**File:** `src/belts/HyperfoilBelt.ts`

### 3. Can Rare Bases Appear as Hyperspace Foil?
**Current assumption:** Unknown - currently rare bases can appear in foil slot but unclear if HSF versions exist
**To verify:** Check if HSF rare bases exist in card data or physical packs
**Related:** LAW is the LAST set where rare bases go in the rare slot (per `rareBasesInRareSlot: true`)

### 4. Prestige Cards in Standard Packs
**Current assumption:** ~1 in 18 packs, replaces rare slot
**Implementation:** Currently placeholder/TODO in `boosterPack.ts`
**To verify:** Prestige pull rate from physical boxes
**File:** `src/utils/boosterPack.ts` - search for "Prestige"

### 5. Common Belt Assignments
**Current assumption:** Auto-assign based on first aspect (same as Block A)
**Unknown:** Physical belt assignments for LAW commons
**To verify:** Analyze common patterns from physical pack openings
**File:** `src/belts/data/commonBeltAssignments.ts` - LAW entry uses `autoAssign: true`

### 6. Triple-Aspect Card Belt Assignment
**Current assumption:** If card has ANY Belt A aspect (Vigilance, Command, Villainy) → Belt A
**Unknown:** How FFG actually assigns double/triple-aspect cards to print belts
**To verify:** Track triple-aspect card positions in physical packs
**File:** `src/belts/data/commonBeltAssignments.ts` - `assignCardToBelt()`

### 7. Showcase Leader Pull Rate
**Current assumption:** Same as previous sets (~1 in 288 packs)
**FFG announcement:** "Showcase leaders are significantly rarer" in LAW
**To verify:** Actual showcase leader rate from box openings
**File:** `src/utils/packConstants.ts` - may need LAW-specific rate

## Assets TBDs

### 8. Promotional Wallpaper Art
**Current status:** Using placeholder/standin image
**Location:** `public/background-images/` or similar
**Needed:** Final promotional art for LAW landing page/backgrounds

### 9. Pack Art
**Current status:** Using `public/pack-images/law-pack.png`
**To verify:** Is this the final pack art or placeholder?

## Data TBDs

### 10. Card Data Completeness
**Current status:** Card data from swuapi.com (partial/beta)
**To verify:** Run `npm run fetch-cards` when full data is available
**Note:** Card counts in `src/utils/setConfigs/LAW.ts` are preliminary

### 11. Special Rarity Cards
**Current count:** 10 Special cards (starter deck leaders/bases)
**To verify:** Final count of Special rarity cards in LAW

---

## How to Update

When a TBD is resolved:
1. Update the relevant code file
2. Add a note here with the resolution
3. Move the item to a "Resolved" section at the bottom
4. Update release notes if user-facing

## Resolved

(None yet - add items here as they're verified)
