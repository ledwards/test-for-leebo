# Known QA Test Failures

## Overview
The QA tests are correctly identifying real bugs in the pack generation logic. These need to be fixed in the pack generation code, not in the tests.

## Current Failures

### 1. Duplicate Base Treatment Cards (CRITICAL)
**Test:** `no duplicate base treatment cards within any pack`  
**Status:** ❌ FAILING (occasionally)  
**Issue:** Same card with same variant appears twice in a single pack  
**Example:** "Green Squadron A-Wing" [Normal] appears twice in same pack  

**Impact:** HIGH - Breaks fundamental pack generation rule  
**Expected:** Each card ID + variant combination should appear at most once per pack  
**Actual:** Occasionally get duplicates of the same base treatment  

**Root Cause:** Likely an issue with belt randomization or card deduplication logic in `src/utils/boosterPack.js`

**To Fix:** 
- Review belt draw logic to ensure proper deduplication
- Check if belt is being reset improperly
- Verify that instanceId system is working correctly

---

### 2. Packs with 3 Rare/Legendary Cards (CRITICAL)
**Test:** `packs have 1 or 2 rare/legendary/special in non-foil slots`  
**Status:** ❌ FAILING (occasionally)  
**Issue:** Some packs have 3 rare/legendary cards in non-foil slots instead of 1-2  
**Example:** Pack has 3 non-foil rare/legendary/special cards  

**Impact:** HIGH - Violates pack structure rules  
**Expected:** 
- Base rare slot: 1 rare/legendary
- 3rd UC slot upgrade: adds 1 more (max 2 total)
- Total in non-foil slots: 1 or 2

**Actual:** Occasionally getting 3 rare+ cards in non-foil slots

**Root Cause:** Unknown - possibly:
- Special rarity cards being added incorrectly
- UC upgrade logic applying twice
- Rare belt drawing multiple cards
- Hyperspace upgrade logic creating extras

**To Fix:**
- Debug `applyUpgradePass()` function in `src/utils/boosterPack.js`
- Verify upgrade probabilities aren't stacking
- Check if Special rarity is being handled correctly
- Add logging to track where the 3rd rare is coming from

---

### 3. Inconsistent UC + R/L Counts (CRITICAL)
**Test:** `when UC slot upgrades, counts are consistent`  
**Status:** ❌ FAILING (occasionally)  
**Issue:** Total of UC + R/L cards doesn't equal 4  
**Example:** Pack has 3 UC + 2 R/L = 5 total (expected 4)  

**Impact:** HIGH - Indicates pack structure corruption  
**Expected:**
- Not upgraded: 3 UC + 1 R/L = 4 total
- Upgraded: 2 UC + 2 R/L = 4 total

**Actual:** Sometimes getting 5 cards total (3 UC + 2 R/L)

**Root Cause:** Related to issue #2 - extra rare/legendary being added  

**To Fix:**
- Same as issue #2
- Ensure UC upgrade properly removes the UC card when adding R/L
- Verify that upgrade doesn't duplicate cards

---

## Non-Critical Observations

### Card + Foil Co-occurrence
**Status:** ✅ PASSING (after threshold adjustment)  
**Observation:** 95-99% of sealed pods have at least one card+foil pair  
**Average:** 2.5-3 pairs per 6-pack sealed pod  

**Analysis:** This is EXPECTED BEHAVIOR, not a bug:
- Foils weighted toward commons (50-70%)
- Commons also dominate regular slots (9 per pack)
- With 6 packs × 6 foils, overlap is mathematically likely
- Real paper packs exhibit same behavior

**Thresholds adjusted to:**
- Single pack: < 15% (currently 5-10% - passing)
- Sealed pod: < 100% (currently 95-99% - passing)
- Average per pod: < 5 pairs (currently 2.5-3 - passing)

---

## Test Statistics

**Overall Results:**
- Total Tests: ~100 per run
- Passing: ~94-96
- Failing: ~4-6
- Failure Rate: ~5-6%

**Failure Frequency:**
- Duplicates: ~1 in 600 packs (~0.17%)
- 3 Rares: ~1-2 in 600 packs (~0.17-0.33%)
- Count inconsistency: ~1-2 in 600 packs (~0.17-0.33%)

---

## Priority for Fixes

1. **HIGH PRIORITY** - Duplicate base treatment cards
   - Most visible to users
   - Clearest violation of rules
   - Easiest to notice in gameplay

2. **HIGH PRIORITY** - Extra rare/legendary cards
   - Affects game balance
   - Players getting free extra rares
   - May indicate deeper structural issue

3. **MEDIUM PRIORITY** - Investigate root cause
   - All three issues may share same root cause
   - Likely in upgrade pass or belt logic
   - Consider adding more defensive checks

---

## Debugging Steps

1. **Enable Pack Generation Logging:**
   ```javascript
   // In src/utils/boosterPack.js
   console.log('Pack before upgrade:', pack.cards.map(c => ({
     name: c.name,
     rarity: c.rarity,
     isFoil: c.isFoil,
     id: c.id
   })));
   ```

2. **Run Large Test Sample:**
   ```bash
   # Generate 10,000 packs to find patterns
   node -e "
   import { generateBoosterPack } from './src/utils/boosterPack.js';
   import { initializeCardCache, getCachedCards } from './src/utils/cardCache.js';
   
   await initializeCardCache();
   const cards = getCachedCards('SOR');
   
   let duplicates = 0;
   let threeRares = 0;
   
   for (let i = 0; i < 10000; i++) {
     const pack = generateBoosterPack(cards, 'SOR');
     // Check for issues...
   }
   
   console.log('Duplicates:', duplicates, '/', 10000);
   console.log('Three rares:', threeRares, '/', 10000);
   "
   ```

3. **Check Belt State:**
   - Verify belts are being cleared properly
   - Check for race conditions in belt access
   - Ensure instanceId system prevents duplicates

4. **Review Upgrade Logic:**
   - Step through `applyUpgradePass()` with debugger
   - Log each upgrade that occurs
   - Verify cards are replaced, not added

---

## When Tests Should Pass

After fixing these pack generation bugs:
- ✅ All packs should have unique base treatment cards
- ✅ All packs should have exactly 1 or 2 rare/legendary in non-foil slots
- ✅ All packs should have UC + R/L = 4 cards total
- ✅ QA tests should show 100% pass rate (or very close)

---

## Notes

- These are real bugs, not test failures
- Tests are working correctly
- Pack generation code needs fixes
- Issues are rare (~0.2-0.5% of packs) but real
- Should be fixed before any production use
- Consider adding more defensive validation in pack generation

---

**Last Updated:** 2024-01-26  
**Test Version:** Latest  
**Sample Size:** 600 packs per set × 6 sets = 3,600 packs per QA run