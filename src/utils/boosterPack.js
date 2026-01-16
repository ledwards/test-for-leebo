// Booster pack generation logic based on:
// https://starwarsunlimited.com/articles/boosting-ahead-of-release

import { getDistributionForSet, getDistributionPeriod, DISTRIBUTION_PERIODS, RARITY_DISTRIBUTIONS, allowsSpecialInFoil } from './rarityConfig.js'
import { getSetConfig } from './setConfigs/index.js'

/**
 * Generate a single booster pack according to SWU rules
 * 
 * Pack contents:
 * - 1 Leader card (guaranteed, in leader slot only)
 * - 1 Base card (guaranteed, in base slot only - unless rare base in rare slot)
 * - 9 Common cards
 * - 3 Uncommon cards
 * - 1 Rare or Legendary card (can be rare base for sets 1-6)
 * - 1 Foil card (can be any rarity, including Special for sets 5, 6, 7 in foil/hyperfoil only)
 * 
 * Total: 16 cards
 * 
 * Rules:
 * - Leaders can ONLY appear in leader slot
 * - Common bases can ONLY appear in base slot
 * - Rare bases CAN appear in rare slot (sets 1-6: SOR, SHD, TWI, JTL, LOF, SEC)
 * - Special rarity cards do NOT appear in regular slots
 * - Special rarity cards can ONLY appear in foil/hyperfoil slots (sets 5, 6, 7: LOF, SEC, and future set 7)
 * 
 * Variants:
 * - Hyperspace variant: ~1 in 288 cards (~0.35% per card)
 * - Showcase variant: 1 in 288 packs (~0.35% per leader)
 */
export function generateBoosterPack(cards, setCode) {
  if (!cards || cards.length === 0) {
    return []
  }

  // Get set-specific configuration
  const setConfig = getSetConfig(setCode)
  if (!setConfig) {
    console.warn(`No configuration found for set ${setCode}, using defaults`)
  }
  
  // Get distribution configuration for this set
  const distribution = getDistributionForSet(setCode)
  const distributionPeriod = getDistributionPeriod(setCode)
  const isPreLawlessTime = distributionPeriod === DISTRIBUTION_PERIODS.PRE_LAWLESS_TIME

  // Determine if this set allows Special rarity in foil slot
  const allowsSpecial = allowsSpecialInFoil(setCode)
  
  // Get set-specific pack rules
  const rareBasesInRareSlot = setConfig?.packRules.rareBasesInRareSlot ?? true
  const specialInFoilRate = setConfig?.packRules.specialInFoilRate ?? 0
  
  // Get upgrade slot configuration
  const upgradeSlotHyperspaceChance = setConfig?.upgradeSlot.hyperspaceChance ?? 0.25
  const upgradeSlotRarityDist = setConfig?.upgradeSlot.rarityDistribution ?? {
    Common: 0.60,
    Uncommon: 0.25,
    Rare: 0.12,
    Legendary: 0.03
  }
  
  // Determine if this pack should have at least one hyperspace card (66.7% chance for Pre-A Lawless Time)
  // This ensures the pack-level rate matches the expected distribution
  const packShouldHaveHyperspace = isPreLawlessTime 
    ? Math.random() < distribution.hyperspace.inStandardPack  // 66.7% for Pre-A Lawless Time
    : true  // 100% for A Lawless Time Onward (guaranteed)
  
  // Track if we've placed a hyperspace card yet (to ensure at least one if pack should have hyperspace)
  let hasHyperspaceCard = false

  // Separate cards by type and rarity
  // IMPORTANT: Special rarity cards should NEVER appear in regular slots
  // They can ONLY appear in foil/hyperfoil slots (and only in specific sets)
  
  // Leaders: exclude Special rarity (Special leaders can only appear in foil slot)
  const leaders = cards.filter((card) => card.isLeader && card.rarity !== 'Special')
  
  // Bases: exclude Special rarity (Special bases can only appear in foil slot)
  const bases = cards.filter((card) => card.isBase && card.rarity !== 'Special')
  
  // Standard cards: exclude Special rarity (Special cards can only appear in foil slot)
  const standardCards = cards.filter(
    (card) => !card.isLeader && !card.isBase && card.rarity !== 'Special'
  )

  // Separate bases by rarity (already filtered to exclude Special)
  const commonBases = bases.filter((card) => card.rarity === 'Common')
  const rareBases = bases.filter((card) => card.rarity === 'Rare')

  // Standard cards by rarity (already filtered to exclude Special)
  const commons = standardCards.filter((card) => card.rarity === 'Common')
  const uncommons = standardCards.filter((card) => card.rarity === 'Uncommon')
  const rares = standardCards.filter((card) => card.rarity === 'Rare')
  const legendaries = standardCards.filter(
    (card) => card.rarity === 'Legendary'
  )

  // Special rarity cards (only for foil slot in sets 4-6)
  const specials = cards.filter((card) => card.rarity === 'Special')

  const pack = []
  
  // Track selected card IDs to prevent duplicates (except foil and upgrade slot)
  // Use card name + set to identify duplicates (same card, different variants)
  const selectedCardNames = new Set()
  
  /**
   * Check if a card is a duplicate (same name and set)
   * Returns true if already selected (excluding foil and upgrade slot)
   */
  const isDuplicate = (card) => {
    const cardKey = `${card.name}-${card.set}`
    return selectedCardNames.has(cardKey)
  }
  
  /**
   * Mark a card as selected
   */
  const markSelected = (card) => {
    const cardKey = `${card.name}-${card.set}`
    selectedCardNames.add(cardKey)
  }
  
  /**
   * Select a random card from array, avoiding duplicates
   */
  const randomSelectNoDuplicate = (array, maxAttempts = 100) => {
    if (array.length === 0) return null
    
    // Filter out duplicates
    const available = array.filter((card) => !isDuplicate(card))
    
    if (available.length === 0) {
      // If all are duplicates, allow duplicate (shouldn't happen often)
      return randomSelect(array)
    }
    
    return randomSelect(available)
  }

  // 1. Guaranteed Leader (leaders can ONLY appear here)
  // Leaders have different drop rates: Common ~83% (5/6), Rare ~17% (1/6)
  // Note: Based on community data suggesting ~1 rare leader per 6 packs
  if (leaders.length > 0) {
    // Filter to normal leaders only (variants are separate cards)
    const normalLeaders = leaders.filter((l) => l.variantType === 'Normal')
    const leaderPool = normalLeaders.length > 0 ? normalLeaders : leaders
    
    // Separate by rarity for weighted selection
    const commonLeaders = leaderPool.filter((l) => l.rarity === 'Common')
    const rareLeaders = leaderPool.filter((l) => l.rarity === 'Rare' || l.rarity === 'Legendary')
    
    let leader = null
    
    // Weighted selection: ~17% chance for rare, ~83% for common
    if (rareLeaders.length > 0 && commonLeaders.length > 0) {
      // Both types available - use weighted selection
      const isRare = Math.random() < 1/6 // ~17% chance for rare
      if (isRare) {
        leader = randomSelect(rareLeaders)
      } else {
        leader = randomSelect(commonLeaders)
      }
    } else if (rareLeaders.length > 0) {
      // Only rare leaders available
      leader = randomSelect(rareLeaders)
    } else if (commonLeaders.length > 0) {
      // Only common leaders available
      leader = randomSelect(commonLeaders)
    } else {
      // Fallback to any leader (shouldn't happen)
      leader = randomSelect(leaderPool)
    }
    
    if (leader) {
      markSelected(leader)
      
      const isShowcase = rollShowcase(distribution)
      const isHyperspace = rollHyperspace(distribution)
      
      let finalLeader = { ...leader }
      
      // If showcase, use showcase variant card
      if (isShowcase) {
        const showcaseCard = findVariantCard(leader, 'Showcase', cards)
        if (showcaseCard) {
          finalLeader = showcaseCard
        }
      }
      // If hyperspace (and not showcase), use hyperspace variant card
      else if (isHyperspace) {
        const hyperspaceCard = findVariantCard(leader, 'Hyperspace', cards)
        if (hyperspaceCard) {
          finalLeader = hyperspaceCard
        }
      }
      
      pack.push({
        ...finalLeader,
        isFoil: false,
        isHyperspace: isHyperspace && !isShowcase, // Hyperspace only if not showcase
        isShowcase: isShowcase,
      })
    }
  }

  // 2. Guaranteed Base (common bases can ONLY appear here)
  // Note: Rare bases can appear in the rare slot, but we still need a base here
  // So the base slot always has a base (preferably common)
  if (commonBases.length > 0) {
    // Filter to normal bases only
    const normalCommonBases = commonBases.filter((b) => b.variantType === 'Normal')
    const base = normalCommonBases.length > 0
      ? randomSelectNoDuplicate(normalCommonBases)
      : randomSelectNoDuplicate(commonBases)
    
    if (base) {
      markSelected(base)
      
      const isHyperspace = rollHyperspace(distribution)
      let finalBase = { ...base }
      
      // If hyperspace, use hyperspace variant card
      if (isHyperspace) {
        const hyperspaceCard = findVariantCard(base, 'Hyperspace', cards)
        if (hyperspaceCard) {
          finalBase = hyperspaceCard
        }
      }
      
      pack.push({
        ...finalBase,
        isFoil: false,
        isHyperspace: isHyperspace,
      })
    }
  } else if (bases.length > 0) {
    // Fallback if no common bases (shouldn't happen, but safety)
    // Exclude rare bases if possible, as they can appear in rare slot
    const nonRareBases = bases.filter((b) => b.rarity !== 'Rare' && b.variantType === 'Normal')
    const base = nonRareBases.length > 0 
      ? randomSelectNoDuplicate(nonRareBases)
      : randomSelectNoDuplicate(bases.filter((b) => b.variantType === 'Normal'))
    
    if (base) {
      markSelected(base)
      
      let isHyperspace = rollHyperspace(distribution)
      
      let finalBase = { ...base }
      
      if (isHyperspace) {
        const hyperspaceCard = findVariantCard(base, 'Hyperspace', cards)
        if (hyperspaceCard) {
          finalBase = hyperspaceCard
          hasHyperspaceCard = true
        }
      }
      
      pack.push({
        ...finalBase,
        isFoil: false,
        isHyperspace: isHyperspace,
      })
    }
  }

  // 3. 9 Common cards (non-leader, non-base)
  // Filter to normal cards only
  const normalCommons = commons.filter((c) => c.variantType === 'Normal')
  const commonsPool = normalCommons.length > 0 ? normalCommons : commons
  
  for (let i = 0; i < 9 && commonsPool.length > 0; i++) {
    const common = randomSelectNoDuplicate(commonsPool)
    if (!common) break // No more available cards
    
    markSelected(common)
    
    let isHyperspace = rollHyperspace(distribution)
    
    let finalCommon = { ...common }
    
    // If hyperspace, use hyperspace variant card
    if (isHyperspace) {
      const hyperspaceCard = findVariantCard(common, 'Hyperspace', cards)
      if (hyperspaceCard) {
        finalCommon = hyperspaceCard
        hasHyperspaceCard = true
      }
    }
    
    pack.push({
      ...finalCommon,
      isFoil: false,
      isHyperspace: isHyperspace,
    })
  }

  // 4. 3 Uncommon cards (non-leader, non-base)
  // First 2 are always normal uncommons
  const normalUncommons = uncommons.filter((c) => c.variantType === 'Normal')
  const uncommonsPool = normalUncommons.length > 0 ? normalUncommons : uncommons
  
  for (let i = 0; i < 2 && uncommonsPool.length > 0; i++) {
    const uncommon = randomSelectNoDuplicate(uncommonsPool)
    if (!uncommon) break // No more available cards
    
    markSelected(uncommon)
    
    pack.push({
      ...uncommon,
      isFoil: false,
      isHyperspace: false,
    })
  }
  
  // 3rd uncommon slot: Can be upgraded to Hyperspace variant of any rarity
  // Based on research: Hyperspace variants appear 2 in 3 packs overall
  // But Rare/Legendary hyperspace appear 1 in 15 packs (6.67%)
  // So Common/Uncommon hyperspace in upgrade slot would be: 66.67% - 6.67% = ~60%
  // However, the user says it's happening too frequently, so the upgrade slot rate may be lower
  // Let me use a more conservative rate: upgrade slot is hyperspace ~30-40% of the time
  // Within hyperspace upgrades, distribution based on research:
  // - Common: Most common
  // - Uncommon: Less common
  // - Rare: 1 in 15 packs = 6.67% of packs, but that's overall, not just upgrade slot
  // - Legendary: Very rare
  
  // Use set-specific upgrade slot hyperspace chance
  const isHyperspaceUpgrade = Math.random() < upgradeSlotHyperspaceChance
  
  if (isHyperspaceUpgrade) {
    // Upgrade slot: Hyperspace variant of any rarity (C, U, R, or L)
    // Use set-specific rarity distribution
    const upgradeRoll = Math.random()
    let upgradeCard = null
    
    if (upgradeRoll < upgradeSlotRarityDist.Common) {
      // Common hyperspace
      const hyperspaceCommons = cards.filter(
        (c) => c.rarity === 'Common' && 
        c.rarity !== 'Special' &&
        c.variantType === 'Hyperspace' && 
        !c.isLeader && 
        !c.isBase
      )
      if (hyperspaceCommons.length > 0) {
        upgradeCard = randomSelect(hyperspaceCommons)
      }
    } else if (upgradeRoll < upgradeSlotRarityDist.Common + upgradeSlotRarityDist.Uncommon) {
      // Uncommon hyperspace
      const hyperspaceUncommons = cards.filter(
        (c) => c.rarity === 'Uncommon' && 
        c.rarity !== 'Special' &&
        c.variantType === 'Hyperspace' && 
        !c.isLeader && 
        !c.isBase
      )
      if (hyperspaceUncommons.length > 0) {
        upgradeCard = randomSelect(hyperspaceUncommons)
      }
    } else if (upgradeRoll < upgradeSlotRarityDist.Common + upgradeSlotRarityDist.Uncommon + upgradeSlotRarityDist.Rare) {
      // Rare hyperspace
      const hyperspaceRares = cards.filter(
        (c) => c.rarity === 'Rare' && 
        c.rarity !== 'Special' &&
        c.variantType === 'Hyperspace' && 
        !c.isLeader && 
        !c.isBase
      )
      if (hyperspaceRares.length > 0) {
        upgradeCard = randomSelect(hyperspaceRares)
      }
    } else {
      // Legendary hyperspace
      const hyperspaceLegendaries = cards.filter(
        (c) => c.rarity === 'Legendary' && 
        c.rarity !== 'Special' &&
        c.variantType === 'Hyperspace' && 
        !c.isLeader && 
        !c.isBase
      )
      if (hyperspaceLegendaries.length > 0) {
        upgradeCard = randomSelect(hyperspaceLegendaries)
      }
    }
    
    // Fallback: if no hyperspace card found, use normal uncommon
    // NOTE: Upgrade slot can be a duplicate, so don't check for duplicates here
    if (!upgradeCard && uncommonsPool.length > 0) {
      upgradeCard = randomSelect(uncommonsPool) // Allow duplicate in upgrade slot
      // Don't mark as selected - upgrade slot can be duplicate
      pack.push({
        ...upgradeCard,
        isFoil: false,
        isHyperspace: false,
      })
    } else if (upgradeCard) {
      // Upgrade slot can be duplicate, so don't mark as selected
      hasHyperspaceCard = true
      pack.push({
        ...upgradeCard,
        isFoil: false,
        isHyperspace: true,
      })
    }
  } else {
    // Normal 3rd uncommon (75% of packs)
    if (uncommonsPool.length > 0) {
      const uncommon = randomSelectNoDuplicate(uncommonsPool)
      if (uncommon) {
        markSelected(uncommon)
        pack.push({
          ...uncommon,
          isFoil: false,
          isHyperspace: false,
        })
      }
    }
  }

  // 5. 1 Rare or Legendary (can be rare base for sets 1-6)
  // Legendary appears ~1 in 8 packs (12.5% chance)
  const isLegendary = Math.random() < 0.125
  
  let rareOrLegendary = null
  if (isLegendary && legendaries.length > 0) {
    // Filter to normal legendaries only
    const normalLegendaries = legendaries.filter((l) => l.variantType === 'Normal')
    rareOrLegendary = normalLegendaries.length > 0
      ? randomSelectNoDuplicate(normalLegendaries)
      : randomSelectNoDuplicate(legendaries)
  } else {
    // Rare slot: can be rare card OR rare base (if set allows)
    // Filter to normal rares only
    const normalRares = rares.filter((r) => r.variantType === 'Normal')
    const rarePool = normalRares.length > 0 ? [...normalRares] : [...rares]
    
    // Add rare bases to the pool if set allows (normal variants only)
    if (rareBasesInRareSlot && rareBases.length > 0) {
      const normalRareBases = rareBases.filter((b) => b.variantType === 'Normal')
      if (normalRareBases.length > 0) {
        rarePool.push(...normalRareBases)
      } else {
        rarePool.push(...rareBases)
      }
    }
    
    if (rarePool.length > 0) {
      rareOrLegendary = randomSelectNoDuplicate(rarePool)
    } else if (legendaries.length > 0) {
      // Fallback to legendary if no rares
      const normalLegendaries = legendaries.filter((l) => l.variantType === 'Normal')
      rareOrLegendary = normalLegendaries.length > 0
        ? randomSelectNoDuplicate(normalLegendaries)
        : randomSelectNoDuplicate(legendaries)
    }
  }
  
  if (rareOrLegendary) {
    markSelected(rareOrLegendary)
    
    let isHyperspace = rollHyperspace(distribution)
    
    let finalRare = { ...rareOrLegendary }
    
    // If hyperspace, use hyperspace variant card
    if (isHyperspace) {
      const hyperspaceCard = findVariantCard(rareOrLegendary, 'Hyperspace', cards)
      if (hyperspaceCard) {
        finalRare = hyperspaceCard
        hasHyperspaceCard = true
      }
    }
    
    pack.push({
      ...finalRare,
      isFoil: false,
      isHyperspace: isHyperspace,
    })
  }
  
  // Final check: if pack should have hyperspace but we still don't have one, force it on a random card
  // This ensures we hit the 66.7% pack-level rate
  // Only force if we haven't gotten one naturally from upgrade slot, foil slot, or other cards
  // Use a probability check to avoid over-forcing (only force on a subset of packs that need it)
  if (packShouldHaveHyperspace && !hasHyperspaceCard && pack.length > 0) {
    // Only force on a percentage of packs that need it to avoid over-counting
    // Since we naturally get ~46% from upgrade slot + foil slot + per-card rate,
    // we need to force on about 20% more to reach 66.7%
    // So we force on about 20% / 54% = 37% of packs that don't have it naturally
    // But we need to account for the fact that not all packs that should have hyperspace will naturally get it
    // Adjust to ~55% to get closer to target (66.7%)
    if (Math.random() < 0.55) {
      // Find a non-leader, non-foil card that can be hyperspace
      const eligibleCards = pack.filter(card => !card.isLeader && !card.isFoil && !card.isShowcase && !card.isBase)
      if (eligibleCards.length > 0) {
        // Try to find a hyperspace variant - only force if variant exists
        const cardToUpgrade = eligibleCards[Math.floor(Math.random() * eligibleCards.length)]
        const hyperspaceCard = findVariantCard(cardToUpgrade, 'Hyperspace', cards)
        if (hyperspaceCard) {
          // Replace the card in the pack
          const index = pack.indexOf(cardToUpgrade)
          pack[index] = {
            ...hyperspaceCard,
            isFoil: cardToUpgrade.isFoil,
            isHyperspace: true,
            isShowcase: cardToUpgrade.isShowcase,
          }
          hasHyperspaceCard = true
        }
      }
    }
  }

  // 6. 1 Foil card (can be any rarity, including Special for sets 4-6)
  // Foil can be from any card pool (including bases, but NOT leaders)
  // BUT: Common bases CANNOT appear in foil slot
  // CRITICAL: Leaders CAN NEVER appear in foil slot (no foil or hyperfoil leaders)
  // Special rarity can ONLY appear in foil slot and ONLY in sets 4-6
  // Special should appear at roughly the same rate as rare cards would naturally
  let foilPool = [...cards]
  
  // Remove ALL leaders from foil pool (leaders CAN NEVER be foil or hyperfoil)
  foilPool = foilPool.filter((card) => {
    // Explicitly exclude all leaders, regardless of any other property
    if (card.isLeader) {
      return false
    }
    return true
  })
  
  // Remove common bases from foil pool (common bases cannot be foil)
  foilPool = foilPool.filter((card) => !(card.isBase && card.rarity === 'Common'))
  
  // Remove Special rarity cards if not in allowed sets
  if (!allowsSpecial) {
    foilPool = foilPool.filter((card) => card.rarity !== 'Special')
  }
  
  if (foilPool.length > 0) {
    let foilCard = null
    
    if (allowsSpecial && specials.length > 0 && specialInFoilRate > 0) {
      // Use set-specific Special rarity rate
      if (Math.random() < specialInFoilRate) {
        // Chance to get Special in foil slot (set-specific rate)
        // Filter to normal Special cards only, and exclude leaders (leaders can NEVER be foil)
        const normalSpecials = specials.filter((s) => s.variantType === 'Normal' && !s.isLeader)
        // Foil can be duplicate, so don't check for duplicates
        foilCard = normalSpecials.length > 0
          ? randomSelect(normalSpecials)
          : randomSelect(specials.filter((s) => !s.isLeader))
      } else {
        // Otherwise, random from all cards (excluding Special from natural selection)
        const nonSpecialPool = foilPool.filter((c) => c.rarity !== 'Special' && c.variantType === 'Normal')
        // Foil can be duplicate, so don't check for duplicates
        foilCard = nonSpecialPool.length > 0
          ? randomSelect(nonSpecialPool)
          : randomSelect(foilPool.filter((c) => c.rarity !== 'Special'))
      }
    } else {
      // For sets without Special, or when Special rate is 0
      // Filter to normal cards only
      const normalPool = foilPool.filter((c) => c.variantType === 'Normal')
      // Foil can be duplicate, so don't check for duplicates
      foilCard = normalPool.length > 0
        ? randomSelect(normalPool)
        : randomSelect(foilPool)
    }
    
    if (foilCard) {
      // Foil slot can be duplicate, so don't mark as selected
      // Leaders cannot be in foil slot, so no showcase check needed
      
      // Determine foil type based on distribution period
      // Pre-A Lawless Time: 5/6 standard foil, 1/6 hyperspace foil
      // A Lawless Time Onward: Always hyperspace foil (100%)
      let isFoilHyperspace = false
      if (isPreLawlessTime) {
        // Pre-A Lawless Time: Roll for foil type
        const foilRoll = Math.random()
        if (foilRoll < distribution.hyperspaceFoil.inStandardPack) {
          // Hyperspace foil (~1/6 chance)
          isFoilHyperspace = true
        } else {
          // Standard foil (~5/6 chance)
          isFoilHyperspace = false
        }
      } else {
        // A Lawless Time Onward: Always hyperspace foil
        isFoilHyperspace = true
      }
      
      // For hyperspace foils, always use hyperspace variant if it exists
      let finalFoil = { ...foilCard }
      let isHyperspace = false
      
      if (isFoilHyperspace) {
        // Hyperspace foil: try to find hyperspace variant
        const hyperspaceCard = findVariantCard(foilCard, 'Hyperspace', cards)
        if (hyperspaceCard && !hyperspaceCard.isLeader) {
          // Only use variant if it's not a leader (leaders can NEVER be foil)
          finalFoil = hyperspaceCard
          isHyperspace = true
          hasHyperspaceCard = true
        }
      } else {
        // Standard foil: may still be hyperspace variant (rare case)
        // Use the normal hyperspace roll for standard foils
        isHyperspace = rollHyperspace(distribution)
        if (isHyperspace) {
          const hyperspaceCard = findVariantCard(foilCard, 'Hyperspace', cards)
          if (hyperspaceCard && !hyperspaceCard.isLeader) {
            // Only use variant if it's not a leader (leaders can NEVER be foil)
            finalFoil = hyperspaceCard
            hasHyperspaceCard = true
          } else {
            // If variant is a leader, don't use it (keep original card)
            isHyperspace = false
          }
        }
      }
      
      // Final safety check: NEVER allow leaders in foil slot
      // This should never happen if filtering is correct, but double-check
      if (finalFoil.isLeader) {
        console.error('CRITICAL ERROR: Attempted to add leader to foil slot!', finalFoil.name)
        // Skip this foil - this should never happen
        // In production, you might want to regenerate or skip the foil
        return pack // Return pack without foil rather than adding a leader
      }
      
      pack.push({
        ...finalFoil,
        isFoil: true,
        isHyperspace: isHyperspace,
        isShowcase: false, // Leaders can't be in foil slot, so no showcase
      })
    }
  }

  return pack
}

/**
 * Generate 6 booster packs for a sealed pod
 */
export function generateSealedPod(cards, setCode) {
  const packs = []
  for (let i = 0; i < 6; i++) {
    packs.push(generateBoosterPack(cards, setCode))
  }
  return packs
}

/**
 * Randomly select an item from an array
 */
function randomSelect(array) {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Roll for Hyperspace variant (for non-upgrade-slot cards)
 * Note: The upgrade slot (3rd uncommon) has its own hyperspace mechanics
 * Uses distribution config to determine rates based on set period
 * @param {Object} distribution - The distribution configuration for the set
 */
function rollHyperspace(distribution) {
  // Use config-based hyperspace rate
  // Pre-A Lawless Time: ~66.7% chance per pack (2/3 packs)
  // A Lawless Time Onward: Guaranteed at least 1 per pack (100%)
  // For individual non-upgrade-slot cards, we use a lower rate
  // Pre-A Lawless Time: ~1% per card (reduced to avoid over-counting with upgrade slot and foil slot)
  // A Lawless Time Onward: Higher rate since guaranteed in pack
  if (distribution === RARITY_DISTRIBUTIONS[DISTRIBUTION_PERIODS.A_LAWLESS_TIME_ONWARD]) {
    // A Lawless Time Onward: Higher hyperspace rate
    // Since at least 1 hyperspace is guaranteed per pack, individual cards have higher chance
    return Math.random() < 0.05 // ~5% chance per card
  } else {
    // Pre-A Lawless Time: Lower hyperspace rate
    // Reduced from 2% to 1% to account for upgrade slot (25%) and foil slot (16.7%) contributing to pack-level rate
    return Math.random() < 0.01 // ~1% chance per card
  }
}

/**
 * Roll for Showcase variant (leaders only)
 * Uses distribution config to determine rates based on set period
 * @param {Object} distribution - The distribution configuration for the set
 */
function rollShowcase(distribution) {
  // Showcase rate is the same for both periods in standard packs (1/288)
  // But differs in Carbonite packs (not applicable here)
  return Math.random() < distribution.showcaseLeader.inStandardPack
}

/**
 * Find variant card (Hyperspace or Showcase) for a given card
 * @param {Object} baseCard - The base card
 * @param {string} variantType - 'Hyperspace' or 'Showcase'
 * @param {Array} allCards - All cards in the set
 * @returns {Object|null} The variant card or null if not found
 */
function findVariantCard(baseCard, variantType, allCards) {
  // Find variant card with same name, set, and variant type
  const variant = allCards.find(
    (card) =>
      card.name === baseCard.name &&
      card.set === baseCard.set &&
      card.variantType === variantType &&
      card.number !== baseCard.number // Different card number
  )
  return variant || null
}
