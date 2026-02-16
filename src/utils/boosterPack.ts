// @ts-nocheck
/**
 * Booster Pack Generation
 *
 * Uses belts to provide cards for pack slots.
 *
 * Pack structure:
 * - 1 Leader (from LeaderBelt)
 * - 1 Base (common)
 * - 9 Commons
 * - 3 Uncommons
 * - 1 Rare or Legendary
 * - 1 Foil (any rarity)
 *
 * Total: 16 cards
 */

import type { SetCode } from '../types';
import type { RawCard } from './cardData';

import { LeaderBelt } from '../belts/LeaderBelt';
import { BaseBelt } from '../belts/BaseBelt';
import { FoilBelt } from '../belts/FoilBelt';
import { RareLegendaryBelt } from '../belts/RareLegendaryBelt';
import { UncommonBelt } from '../belts/UncommonBelt';
import { CommonBelt } from '../belts/CommonBelt';
import { getBlockForSet, getBeltConfig } from '../belts/data/commonBeltAssignments';
import { ShowcaseLeaderBelt } from '../belts/ShowcaseLeaderBelt';
import { HyperfoilBelt } from '../belts/HyperfoilBelt';
import { HyperspaceLeaderBelt } from '../belts/HyperspaceLeaderBelt';
import { HyperspaceBaseBelt } from '../belts/HyperspaceBaseBelt';
import { HyperspaceUncommonBelt } from '../belts/HyperspaceUncommonBelt';
import { HyperspaceCommonBelt } from '../belts/HyperspaceCommonBelt';
import { HyperspaceRareLegendaryBelt } from '../belts/HyperspaceRareLegendaryBelt';
import { HyperspaceUpgradeBelt, type UpgradePlan } from '../belts/HyperspaceUpgradeBelt';
import { getSetConfig } from './setConfigs/index';
import { getCachedCards } from './cardCache';

// === TYPES ===

/** A booster pack containing cards */
interface Pack {
  cards: RawCard[];
}

/** Upgrade probabilities from set config */
interface UpgradeProbabilities {
  leaderToShowcase?: number;
  leaderToHyperspace?: number;
  baseToHyperspace?: number;
  rareToHyperspaceRL?: number;
  foilToHyperfoil?: number;
  firstUCToHyperspaceUC?: number;
  secondUCToHyperspaceUC?: number;
  thirdUCToHyperspaceRL?: number;
  commonToHyperspace?: number;
  rareToPrestige?: number;
}

/** Belt configuration from commonBeltAssignments */
interface BeltConfig {
  hyperspaceSlot: number;
  guaranteedHyperspace?: boolean;
}

/** Generic belt interface for type safety */
interface Belt {
  next(): RawCard | null;
}

/** Set configuration (partial - just what we need) */
interface SetConfig {
  packRules?: {
    foilSlotIsHyperspaceFoil?: boolean;
  };
  upgradeProbabilities?: UpgradeProbabilities;
}

// === MODULE STATE ===

// Cache belts by set code so we reuse the same belt across pack generation
const beltCache = new Map<string, Belt>();

// Track which common belt to start with for alternating (true = start with A)
let startWithBeltA = true;

// === HELPER FUNCTIONS ===

/**
 * Check if a set uses LAW+ pack rules (Set 7 onwards)
 * - Foil slot is always Hyperspace Foil
 * - Guaranteed Hyperspace common in every pack
 * - Prestige cards can appear in rare slot
 */
function usesLawPackRules(setCode: SetCode | string): boolean {
  const config = getSetConfig(setCode) as SetConfig | null;
  return config?.packRules?.foilSlotIsHyperspaceFoil === true;
}

/**
 * Find the Hyperspace variant of a specific card
 * Returns the HS version if found, null otherwise
 */
function findHyperspaceVariant(card: RawCard | null, setCode: SetCode | string): RawCard | null {
  if (!card || !card.name) return null;

  const allCards = getCachedCards(setCode);

  // Find a card with the same name but Hyperspace variantType
  // Must also match type to avoid Leader/Unit confusion (e.g., "Leia Organa" exists as both)
  const hsVariant = allCards.find(c =>
    c.name === card.name &&
    c.variantType === 'Hyperspace' &&
    c.rarity === card.rarity && // Same rarity (Common leaders stay Common, etc.)
    c.type === card.type // Same type to avoid Leader/Unit confusion
  );

  if (hsVariant) {
    return { ...hsVariant, isHyperspace: true };
  }

  // Fallback: if no Hyperspace variant exists in the card data,
  // return the original card marked as Hyperspace.
  // This ensures upgrades always succeed even if card data is incomplete.
  return { ...card, variantType: 'Hyperspace', isHyperspace: true };
}

/**
 * Find the Showcase variant of a specific card
 * Returns the Showcase version if found, null otherwise
 */
function findShowcaseVariant(card: RawCard | null, setCode: SetCode | string): RawCard | null {
  if (!card || !card.name) return null;

  const allCards = getCachedCards(setCode);

  // Must also match type to avoid Leader/Unit confusion
  const showcaseVariant = allCards.find(c =>
    c.name === card.name &&
    c.variantType === 'Showcase' &&
    c.type === card.type
  );

  if (showcaseVariant) {
    return { ...showcaseVariant, isShowcase: true };
  }
  return null;
}

// === BELT GETTERS ===

/**
 * Get or create a LeaderBelt for a set
 */
function getLeaderBelt(setCode: SetCode | string): Belt {
  const key = `leader-${setCode}`;
  if (!beltCache.has(key)) {
    beltCache.set(key, new LeaderBelt(setCode));
  }
  return beltCache.get(key)!;
}

/**
 * Get or create a BaseBelt for a set
 */
function getBaseBelt(setCode: SetCode | string): Belt {
  const key = `base-${setCode}`;
  if (!beltCache.has(key)) {
    beltCache.set(key, new BaseBelt(setCode));
  }
  return beltCache.get(key)!;
}

/**
 * Get or create a FoilBelt for a set
 */
function getFoilBelt(setCode: SetCode | string): Belt {
  const key = `foil-${setCode}`;
  if (!beltCache.has(key)) {
    beltCache.set(key, new FoilBelt(setCode));
  }
  return beltCache.get(key)!;
}

/**
 * Get or create a RareLegendaryBelt for a set
 */
function getRareLegendaryBelt(setCode: SetCode | string): Belt {
  const key = `rarelegendary-${setCode}`;
  if (!beltCache.has(key)) {
    beltCache.set(key, new RareLegendaryBelt(setCode));
  }
  return beltCache.get(key)!;
}

/**
 * Get or create an UncommonBelt for a set
 */
function getUncommonBelt(setCode: SetCode | string): Belt {
  const key = `uncommon-${setCode}`;
  if (!beltCache.has(key)) {
    beltCache.set(key, new UncommonBelt(setCode));
  }
  return beltCache.get(key)!;
}

/**
 * Get or create CommonBelts A and B for a set
 *
 * Block 0 (SOR, SHD, TWI):
 * - Belt A: Vigilance, Command, Aggression (60 cards)
 * - Belt B: Cunning, Villainy, Heroism, Neutral (30 cards)
 *
 * Block A (JTL, LOF, SEC):
 * - Belt A: Vigilance, Command, Villainy (50 cards)
 * - Belt B: Aggression, Cunning, Heroism, Neutral (50 cards)
 */
function getCommonBelts(setCode: SetCode | string): { beltA: Belt; beltB: Belt } {
  const keyA = `common-a-${setCode}`;
  const keyB = `common-b-${setCode}`;

  if (!beltCache.has(keyA) || !beltCache.has(keyB)) {
    beltCache.set(keyA, new CommonBelt(setCode, 'A'));
    beltCache.set(keyB, new CommonBelt(setCode, 'B'));
  }

  return {
    beltA: beltCache.get(keyA)!,
    beltB: beltCache.get(keyB)!
  };
}

// === Variant Belt Getters ===

/** Get ShowcaseLeaderBelt - exported for testing/future use */
export function getShowcaseLeaderBelt(setCode: SetCode | string): Belt {
  const key = `showcase-leader-${setCode}`;
  if (!beltCache.has(key)) {
    beltCache.set(key, new ShowcaseLeaderBelt(setCode));
  }
  return beltCache.get(key)!;
}

function getHyperfoilBelt(setCode: SetCode | string): Belt {
  const key = `hyperfoil-${setCode}`;
  if (!beltCache.has(key)) {
    beltCache.set(key, new HyperfoilBelt(setCode));
  }
  return beltCache.get(key)!;
}

/** Get HyperspaceLeaderBelt - exported for testing/future use */
export function getHyperspaceLeaderBelt(setCode: SetCode | string): Belt {
  const key = `hyperspace-leader-${setCode}`;
  if (!beltCache.has(key)) {
    beltCache.set(key, new HyperspaceLeaderBelt(setCode));
  }
  return beltCache.get(key)!;
}

/** Get HyperspaceBaseBelt - exported for testing/future use */
export function getHyperspaceBaseBelt(setCode: SetCode | string): Belt {
  const key = `hyperspace-base-${setCode}`;
  if (!beltCache.has(key)) {
    beltCache.set(key, new HyperspaceBaseBelt(setCode));
  }
  return beltCache.get(key)!;
}

/** Get HyperspaceUncommonBelt - exported for testing/future use */
export function getHyperspaceUncommonBelt(setCode: SetCode | string): Belt {
  const key = `hyperspace-uncommon-${setCode}`;
  if (!beltCache.has(key)) {
    beltCache.set(key, new HyperspaceUncommonBelt(setCode));
  }
  return beltCache.get(key)!;
}

/** Get HyperspaceCommonBelt - exported for testing/future use */
export function getHyperspaceCommonBelt(setCode: SetCode | string): Belt {
  const key = `hyperspace-common-${setCode}`;
  if (!beltCache.has(key)) {
    beltCache.set(key, new HyperspaceCommonBelt(setCode));
  }
  return beltCache.get(key)!;
}

function getHyperspaceRareLegendaryBelt(setCode: SetCode | string): Belt {
  const key = `hyperspace-rarelegendary-${setCode}`;
  if (!beltCache.has(key)) {
    beltCache.set(key, new HyperspaceRareLegendaryBelt(setCode));
  }
  return beltCache.get(key)!;
}

/**
 * Get the set group key for HS belt config ('1-3', '4-6', 'LAW')
 * All sets use the HyperspaceUpgradeBelt for controlled variance.
 * LAW+ belt guarantees ≥1 HS per pack (budget-0 = 0).
 */
function getHSBeltGroup(setCode: SetCode | string): string | null {
  const config = getSetConfig(setCode);
  if (!config) return null;
  const n = config.setNumber;
  if (n >= 1 && n <= 3) return '1-3';
  if (n >= 4 && n <= 6) return '4-6';
  if (n >= 7) return 'LAW';
  return null;
}

function getHyperspaceUpgradeBelt(setCode: SetCode | string): HyperspaceUpgradeBelt | null {
  const group = getHSBeltGroup(setCode);
  if (!group) return null;
  const key = `hs-upgrade-${setCode}`;
  if (!beltCache.has(key)) {
    beltCache.set(key, new HyperspaceUpgradeBelt(group));
  }
  return beltCache.get(key) as HyperspaceUpgradeBelt;
}

/**
 * Clear belt cache (useful for testing or resetting state)
 */
export function clearBeltCache(): void {
  beltCache.clear();
  startWithBeltA = true; // Reset alternating state
}

/**
 * Check if an upgrade should happen based on probability
 */
function shouldUpgrade(probability: number): boolean {
  return Math.random() < probability;
}

/**
 * Apply upgrade pass to a pack
 * Checks each slot for possible upgrades based on set-level probabilities
 *
 * @param pack - Pack with cards array
 * @param setCode - Set code
 * @returns Pack with upgraded cards
 */
function applyUpgradePass(pack: Pack, setCode: SetCode | string): Pack {
  const config = getSetConfig(setCode) as SetConfig | null;
  const probs: UpgradeProbabilities = config?.upgradeProbabilities || {};

  // Find card indices by type
  const leaderIndex = pack.cards.findIndex(c => c.isLeader);
  const baseIndex = pack.cards.findIndex(c => c.isBase);
  const foilIndex = pack.cards.findIndex(c => c.isFoil);

  // Find uncommon indices (cards with Uncommon rarity, not leaders/bases/foils)
  const uncommonIndices: number[] = [];
  pack.cards.forEach((c, i) => {
    if (c.rarity === 'Uncommon' && !c.isLeader && !c.isBase && !c.isFoil) {
      uncommonIndices.push(i);
    }
  });

  // Find rare/legendary slot (Rare or Legendary, not foil)
  const rareIndex = pack.cards.findIndex(c =>
    (c.rarity === 'Rare' || c.rarity === 'Legendary') &&
    !c.isFoil && !c.isLeader && !c.isBase
  );

  // Find common indices (Common rarity, not leaders/bases)
  const commonIndices: number[] = [];
  pack.cards.forEach((c, i) => {
    if (c.rarity === 'Common' && !c.isLeader && !c.isBase && !c.isFoil) {
      commonIndices.push(i);
    }
  });

  // Get HS upgrade plan from belt (sets 1-6) or null (LAW+)
  const hsBelt = getHyperspaceUpgradeBelt(setCode);
  const hsPlan: UpgradePlan | null = hsBelt ? hsBelt.next() : null;

  // 1. Leader upgrades
  // Showcase takes precedence (independent coin flip — too rare to affect variance)
  // HS upgrade is belt-driven for sets 1-6, coin-flip for LAW+
  if (leaderIndex >= 0) {
    const currentLeader = pack.cards[leaderIndex];
    if (currentLeader && probs.leaderToShowcase && shouldUpgrade(probs.leaderToShowcase)) {
      const upgraded = findShowcaseVariant(currentLeader, setCode);
      if (upgraded) pack.cards[leaderIndex] = upgraded;
    } else if (currentLeader) {
      const shouldUpgradeLeader = hsPlan ? hsPlan.leader : (probs.leaderToHyperspace && shouldUpgrade(probs.leaderToHyperspace));
      if (shouldUpgradeLeader) {
        const upgraded = findHyperspaceVariant(currentLeader, setCode);
        if (upgraded) pack.cards[leaderIndex] = upgraded;
      }
    }
  }

  // 2. Base upgrade - find HS version of THIS base
  if (baseIndex >= 0) {
    const shouldUpgradeBase = hsPlan ? hsPlan.base : (probs.baseToHyperspace && shouldUpgrade(probs.baseToHyperspace));
    if (shouldUpgradeBase) {
      const currentBase = pack.cards[baseIndex];
      if (currentBase) {
        const upgraded = findHyperspaceVariant(currentBase, setCode);
        if (upgraded) pack.cards[baseIndex] = upgraded;
      }
    }
  }

  // 3. Rare slot upgrade to Hyperspace R/L - find HS version of THIS card
  if (rareIndex >= 0) {
    const shouldUpgradeRare = hsPlan ? hsPlan.rare : (probs.rareToHyperspaceRL && shouldUpgrade(probs.rareToHyperspaceRL));
    if (shouldUpgradeRare) {
      const currentRare = pack.cards[rareIndex];
      if (currentRare) {
        const upgraded = findHyperspaceVariant(currentRare, setCode);
        if (upgraded) pack.cards[rareIndex] = upgraded;
      }
    }
  }

  // 4. Foil upgrade to Hyperfoil - replace with a Hyperspace Foil card from belt
  // Independent coin flip (too rare to affect variance). LAW+ skips entirely.
  const skipFoilUpgrade = usesLawPackRules(setCode);
  if (!skipFoilUpgrade && foilIndex >= 0 && probs.foilToHyperfoil && shouldUpgrade(probs.foilToHyperfoil)) {
    const hyperfoilBelt = getHyperfoilBelt(setCode);
    const upgraded = hyperfoilBelt.next();
    if (upgraded) {
      pack.cards[foilIndex] = upgraded;
    }
  }

  // 5. First UC upgrade to Hyperspace UC - find HS version of THIS uncommon
  // IMPORTANT: Apply UC->HS_UC upgrades BEFORE UC->HS_R/L to avoid index corruption
  const firstUCIndex = uncommonIndices[0];
  if (firstUCIndex !== undefined) {
    const shouldUpgradeUC1 = hsPlan ? hsPlan.uc1 : (probs.firstUCToHyperspaceUC && shouldUpgrade(probs.firstUCToHyperspaceUC));
    if (shouldUpgradeUC1) {
      const currentUC = pack.cards[firstUCIndex];
      if (currentUC) {
        const upgraded = findHyperspaceVariant(currentUC, setCode);
        if (upgraded) pack.cards[firstUCIndex] = upgraded;
      }
    }
  }

  // 6. Second UC upgrade to Hyperspace UC - find HS version of THIS uncommon
  const secondUCIndex = uncommonIndices[1];
  if (secondUCIndex !== undefined) {
    const shouldUpgradeUC2 = hsPlan ? hsPlan.uc2 : (probs.secondUCToHyperspaceUC && shouldUpgrade(probs.secondUCToHyperspaceUC));
    if (shouldUpgradeUC2) {
      const currentUC = pack.cards[secondUCIndex];
      if (currentUC) {
        const upgraded = findHyperspaceVariant(currentUC, setCode);
        if (upgraded) pack.cards[secondUCIndex] = upgraded;
      }
    }
  }

  // 7. Third UC upgrade to Hyperspace R/L (RARITY change - uses belt for random R/L)
  // This is intentionally a random R/L card, not the same UC in HS form
  // This MUST happen after UC->HS_UC upgrades since it changes rarity and corrupts uncommonIndices
  // IMPORTANT: Must avoid picking a card whose Normal version is already in the pack
  const thirdUCIndex = uncommonIndices[2];
  if (thirdUCIndex !== undefined) {
    const shouldUpgradeUC3 = hsPlan ? hsPlan.uc3 : (probs.thirdUCToHyperspaceRL && shouldUpgrade(probs.thirdUCToHyperspaceRL));
    if (shouldUpgradeUC3) {
      const hsRLBelt = getHyperspaceRareLegendaryBelt(setCode);
      const upgraded = hsRLBelt.next();
      if (upgraded) pack.cards[thirdUCIndex] = upgraded;
    }
  }

  // 8. Common upgrade - find HS version of the card in the specific hyperspace slot
  const block = getBlockForSet(setCode);
  const blockConfig: BeltConfig = getBeltConfig(block);
  const isLawPlus = usesLawPackRules(setCode);

  // For LAW+, slot 5 is always Hyperspace (guaranteed) — but only as fallback when no belt
  if (isLawPlus && blockConfig.guaranteedHyperspace && !hsPlan) {
    const hyperspaceIndex = 1 + blockConfig.hyperspaceSlot;
    if (hyperspaceIndex < pack.cards.length) {
      const currentCommon = pack.cards[hyperspaceIndex];
      if (currentCommon && currentCommon.rarity === 'Common' && !currentCommon.isLeader && !currentCommon.isBase) {
        const upgraded = findHyperspaceVariant(currentCommon, setCode);
        if (upgraded) pack.cards[hyperspaceIndex] = upgraded;
      }
    }
  } else {
    const shouldUpgradeCommon = hsPlan ? hsPlan.common : (probs.commonToHyperspace && shouldUpgrade(probs.commonToHyperspace));
    if (shouldUpgradeCommon) {
      const hyperspaceIndex = 1 + blockConfig.hyperspaceSlot;
      if (hyperspaceIndex < pack.cards.length) {
        const currentCommon = pack.cards[hyperspaceIndex];
        if (currentCommon && currentCommon.rarity === 'Common' && !currentCommon.isLeader && !currentCommon.isBase) {
          const upgraded = findHyperspaceVariant(currentCommon, setCode);
          if (upgraded) pack.cards[hyperspaceIndex] = upgraded;
        }
      }
    }
  }

  // 9. Prestige card in rare slot (LAW+ only, ~1 in 18 packs)
  // TODO: Implement when Prestige variant data is available
  // For now, this is a placeholder - Prestige cards have their own variantType
  // if (isLawPlus && probs.rareToPrestige && shouldUpgrade(probs.rareToPrestige)) {
  //   const prestigeBelt = getPrestigeBelt(setCode)
  //   if (prestigeBelt && rareIndex >= 0) {
  //     const prestige = prestigeBelt.next()
  //     if (prestige) pack.cards[rareIndex] = prestige
  //   }
  // }

  return pack;
}


/**
 * Generate a single booster pack
 * @param cards - All cards (unused, kept for API compatibility)
 * @param setCode - Set code (SOR, SHD, etc.)
 * @returns Pack object with cards array
 */
export function generateBoosterPack(_cards: RawCard[], setCode: SetCode | string): Pack {
  // Get belts
  const leaderBelt = getLeaderBelt(setCode);
  const baseBelt = getBaseBelt(setCode);
  const rareLegendaryBelt = getRareLegendaryBelt(setCode);
  const uncommonBelt = getUncommonBelt(setCode);
  const { beltA: commonBeltA, beltB: commonBeltB } = getCommonBelts(setCode);

  // LAW+ uses HyperfoilBelt for foil slot (always Hyperspace Foil)
  // Earlier sets use regular FoilBelt
  const isLawPlus = usesLawPackRules(setCode);
  const foilBelt = isLawPlus ? getHyperfoilBelt(setCode) : getFoilBelt(setCode);

  // Build pack
  const packCards: RawCard[] = [];
  const currentStartWithA = startWithBeltA;

  // 1 Leader (from belt)
  const leader = leaderBelt.next();
  if (leader) packCards.push(leader);

  // 1 Base (from belt)
  const base = baseBelt.next();
  if (base) packCards.push(base);

  // 9 Commons - slot pattern depends on block
  // Block 0 (SOR, SHD, TWI): Belt A for slots 1-6, Belt B for slots 7-9
  // Block A (JTL, LOF, SEC): Belt A for slots 1-4, slot 5 alternates, Belt B for slots 6-9
  const block = getBlockForSet(setCode);
  // Note: BeltConfig is used in applyUpgradePass for hyperspace slot position

  for (let slot = 1; slot <= 9; slot++) {
    let belt: Belt;
    if (block === 0) {
      // Block 0: Belt A for slots 1-6, Belt B for slots 7-9
      belt = (slot <= 6) ? commonBeltA : commonBeltB;
    } else {
      // Block A: Belt A for slots 1-4, slot 5 alternates, Belt B for slots 6-9
      if (slot <= 4) {
        belt = commonBeltA;
      } else if (slot === 5) {
        // Slot 5 alternates between Belt A and Belt B
        belt = startWithBeltA ? commonBeltA : commonBeltB;
      } else {
        belt = commonBeltB;
      }
    }
    const common = belt.next();
    if (common) packCards.push(common);
  }

  // Toggle alternating slot for next pack
  startWithBeltA = !startWithBeltA;

  // Dedup commons - belt cycling can rarely produce duplicates
  // Replace any duplicate commons with fresh cards from the appropriate belt
  const commonNames = new Set<string>();
  for (let i = 2; i < 11; i++) { // Commons are at indices 2-10 (after leader/base)
    const card = packCards[i];
    if (!card) continue;

    if (commonNames.has(card.name)) {
      // Duplicate found - get a replacement from the belt this slot came from
      const slot = i - 1; // Convert index to slot (1-indexed)
      let replacementBelt: Belt;
      if (block === 0) {
        replacementBelt = (slot <= 6) ? commonBeltA : commonBeltB;
      } else {
        if (slot <= 4) {
          replacementBelt = commonBeltA;
        } else if (slot === 5) {
          replacementBelt = currentStartWithA ? commonBeltA : commonBeltB;
        } else {
          replacementBelt = commonBeltB;
        }
      }

      // Try to find a non-duplicate replacement
      for (let attempt = 0; attempt < 10; attempt++) {
        const replacement = replacementBelt.next();
        if (replacement && !commonNames.has(replacement.name)) {
          packCards[i] = replacement;
          commonNames.add(replacement.name);
          break;
        }
      }
    } else {
      commonNames.add(card.name);
    }
  }

  // 3 Uncommons (from belt)
  for (let i = 0; i < 3; i++) {
    const uncommon = uncommonBelt.next();
    if (uncommon) packCards.push(uncommon);
  }

  // 1 Rare or Legendary (from belt)
  const rareOrLegendary = rareLegendaryBelt.next();
  if (rareOrLegendary) packCards.push(rareOrLegendary);

  // 1 Foil (from belt, already marked as foil)
  const foilCard = foilBelt.next();
  if (foilCard) packCards.push(foilCard);

  // Check for duplicates in pack (for debugging)
  // A duplicate is defined as same ID AND same foil status
  interface SeenCard {
    index: number;
    isFoil: boolean;
  }
  const seen = new Map<string, SeenCard[]>(); // Map of card.id to array of {index, isFoil}
  const duplicates: Array<{
    id: string;
    name: string;
    positions: number[];
    isFoil: boolean;
  }> = [];

  packCards.forEach((card, index) => {
    const id = card.id;

    if (!seen.has(id)) {
      seen.set(id, []);
    }

    const seenCards = seen.get(id)!;
    // Check if we've seen this card with the same foil status
    const matchingCards = seenCards.filter(c => c.isFoil === card.isFoil);

    if (matchingCards.length > 0) {
      // True duplicate found (same ID and same foil status)
      const firstMatch = matchingCards[0];
      if (firstMatch) {
        duplicates.push({
          id: id,
          name: card.name,
          positions: [firstMatch.index, index],
          isFoil: card.isFoil
        });
      }
    }

    seenCards.push({ index: index, isFoil: card.isFoil });
  });



  // Create pack and apply upgrade pass
  const pack: Pack = { cards: packCards };
  const upgradedPack = applyUpgradePass(pack, setCode);

  // Final dedup pass - check for same-treatment duplicates after all upgrades
  // A duplicate is same card ID + variant type + foil status
  const getTreatmentKey = (card: RawCard): string => {
    const variant = card.variantType || 'Normal';
    const foilSuffix = card.isFoil ? '-Foil' : '';
    return `${card.id}-${variant}${foilSuffix}`;
  };

  const seenTreatments = new Set<string>();
  const cleanedCards: RawCard[] = [];

  for (const card of upgradedPack.cards) {
    const key = getTreatmentKey(card);
    if (!seenTreatments.has(key)) {
      seenTreatments.add(key);
      cleanedCards.push(card);
    }
    // Duplicate found - skip it (pack will have fewer cards, but no duplicates)
  }

  // If we removed any duplicates, fill back to 16 cards with fresh commons
  while (cleanedCards.length < 16) {
    const replacement = commonBeltA.next() || commonBeltB.next();
    if (replacement) {
      const repKey = getTreatmentKey(replacement);
      if (!seenTreatments.has(repKey)) {
        seenTreatments.add(repKey);
        cleanedCards.push(replacement);
      }
    } else {
      break; // Belts exhausted
    }
  }

  return { cards: cleanedCards };
}

/**
 * Generate a sealed pod (6 booster packs)
 * @param cards - All cards (unused, kept for API compatibility)
 * @param setCode - Set code
 * @param packCount - Number of packs (default 6)
 * @returns Array of pack objects (each with cards array)
 */
export function generateSealedPod(_cards: RawCard[], setCode: SetCode | string, packCount: number = 6): Pack[] {
  // Clear belt cache for fresh pod generation
  // This ensures each sealed pod starts with a fresh belt at random position
  clearBeltCache();

  const packs: Pack[] = [];
  for (let i = 0; i < packCount; i++) {
    packs.push(generateBoosterPack(_cards, setCode));
  }
  return packs;
}
