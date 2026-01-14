// Booster pack generation logic based on:
// https://starwarsunlimited.com/articles/boosting-ahead-of-release

import { getDistributionForSet, getDistributionPeriod, DISTRIBUTION_PERIODS, RARITY_DISTRIBUTIONS } from './rarityConfig.js'

/**
 * Generate a single booster pack according to SWU rules
 * 
 * Pack contents:
 * - 1 Leader card (guaranteed, in leader slot only)
 * - 1 Base card (guaranteed, in base slot only - unless rare base in rare slot)
 * - 9 Common cards
 * - 3 Uncommon cards
 * - 1 Rare or Legendary card (can be rare base for sets 1-6)
 * - 1 Foil card (can be any rarity, including Special for sets 4-6)
 * 
 * Total: 16 cards
 * 
 * Rules:
 * - Leaders can ONLY appear in leader slot
 * - Common bases can ONLY appear in base slot
 * - Rare bases CAN appear in rare slot (sets 1-6: SOR, SHD, TWI, JTL, LOF, SEC)
 * - Special rarity cards do NOT appear in packs EXCEPT in foil slot (sets 4-6: JTL, LOF, SEC only)
 * 
 * Variants:
 * - Hyperspace variant: ~1 in 288 cards (~0.35% per card)
 * - Showcase variant: 1 in 288 packs (~0.35% per leader)
 */
export function generateBoosterPack(cards, setCode) {
  if (!cards || cards.length === 0) {
    return []
  }

  // Get distribution configuration for this set
  const distribution = getDistributionForSet(setCode)
  const distributionPeriod = getDistributionPeriod(setCode)
  const isPreLawlessTime = distributionPeriod === DISTRIBUTION_PERIODS.PRE_LAWLESS_TIME

  // Determine if this is set 4-6 (JTL, LOF, SEC) for Special rarity in foil slot
  const sets4to6 = ['JTL', 'LOF', 'SEC']
  const isSet4to6 = sets4to6.includes(setCode)

  // Separate cards by type and rarity
  // Leaders: exclude Special rarity (Special leaders can only appear in foil slot)
  const leaders = cards.filter((card) => card.isLeader && card.rarity !== 'Special')
  const bases = cards.filter((card) => card.isBase)
  const standardCards = cards.filter(
    (card) => !card.isLeader && !card.isBase
  )

  // Separate bases by rarity
  const commonBases = bases.filter((card) => card.rarity === 'Common')
  const rareBases = bases.filter((card) => card.rarity === 'Rare')

  // Standard cards by rarity (excluding Special)
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
  if (leaders.length > 0) {
    // Filter to normal leaders only (variants are separate cards)
    const normalLeaders = leaders.filter((l) => l.variantType === 'Normal')
    const leader = normalLeaders.length > 0 
      ? randomSelectNoDuplicate(normalLeaders)
      : randomSelectNoDuplicate(leaders)
    
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
      
      const isHyperspace = rollHyperspace(distribution)
      let finalBase = { ...base }
      
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
  }

  // 3. 9 Common cards (non-leader, non-base)
  // Filter to normal cards only
  const normalCommons = commons.filter((c) => c.variantType === 'Normal')
  const commonsPool = normalCommons.length > 0 ? normalCommons : commons
  
  for (let i = 0; i < 9 && commonsPool.length > 0; i++) {
    const common = randomSelectNoDuplicate(commonsPool)
    if (!common) break // No more available cards
    
    markSelected(common)
    
      const isHyperspace = rollHyperspace(distribution)
      let finalCommon = { ...common }
    
    // If hyperspace, use hyperspace variant card
    if (isHyperspace) {
      const hyperspaceCard = findVariantCard(common, 'Hyperspace', cards)
      if (hyperspaceCard) {
        finalCommon = hyperspaceCard
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
  
  // More conservative: Upgrade slot is hyperspace ~25% of the time
  const isHyperspaceUpgrade = Math.random() < 0.25 // 25% chance for upgrade slot to be hyperspace
  
  if (isHyperspaceUpgrade) {
    // Upgrade slot: Hyperspace variant of any rarity (C, U, R, or L)
    // Distribution within hyperspace upgrades (approximate):
    // - Common: ~60% of hyperspace upgrades
    // - Uncommon: ~25% of hyperspace upgrades
    // - Rare: ~12% of hyperspace upgrades  
    // - Legendary: ~3% of hyperspace upgrades
    const upgradeRoll = Math.random()
    let upgradeCard = null
    
    if (upgradeRoll < 0.60) {
      // ~60% - Common hyperspace
      const hyperspaceCommons = cards.filter(
        (c) => c.rarity === 'Common' && 
        c.variantType === 'Hyperspace' && 
        !c.isLeader && 
        !c.isBase
      )
      if (hyperspaceCommons.length > 0) {
        upgradeCard = randomSelect(hyperspaceCommons)
      }
    } else if (upgradeRoll < 0.60 + 0.25) {
      // ~25% - Uncommon hyperspace
      const hyperspaceUncommons = cards.filter(
        (c) => c.rarity === 'Uncommon' && 
        c.variantType === 'Hyperspace' && 
        !c.isLeader && 
        !c.isBase
      )
      if (hyperspaceUncommons.length > 0) {
        upgradeCard = randomSelect(hyperspaceUncommons)
      }
    } else if (upgradeRoll < 0.60 + 0.25 + 0.12) {
      // ~12% - Rare hyperspace
      const hyperspaceRares = cards.filter(
        (c) => c.rarity === 'Rare' && 
        c.variantType === 'Hyperspace' && 
        !c.isLeader && 
        !c.isBase
      )
      if (hyperspaceRares.length > 0) {
        upgradeCard = randomSelect(hyperspaceRares)
      }
    } else {
      // ~3% - Legendary hyperspace
      const hyperspaceLegendaries = cards.filter(
        (c) => c.rarity === 'Legendary' && 
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
    // Rare slot: can be rare card OR rare base (for sets 1-6)
    // Filter to normal rares only
    const normalRares = rares.filter((r) => r.variantType === 'Normal')
    const rarePool = normalRares.length > 0 ? [...normalRares] : [...rares]
    
    // Add rare bases to the pool for sets 1-6 (normal variants only)
    if (rareBases.length > 0) {
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
    
    const isHyperspace = rollHyperspace(distribution)
    let finalRare = { ...rareOrLegendary }
    
    // If hyperspace, use hyperspace variant card
    if (isHyperspace) {
      const hyperspaceCard = findVariantCard(rareOrLegendary, 'Hyperspace', cards)
      if (hyperspaceCard) {
        finalRare = hyperspaceCard
      }
    }
    
    pack.push({
      ...finalRare,
      isFoil: false,
      isHyperspace: isHyperspace,
    })
  }

  // 6. 1 Foil card (can be any rarity, including Special for sets 4-6)
  // Foil can be from any card pool (including bases, but NOT leaders)
  // BUT: Common bases CANNOT appear in foil slot
  // Leaders CANNOT appear in foil slot
  // Special rarity can ONLY appear in foil slot and ONLY in sets 4-6
  // Special should appear at roughly the same rate as rare cards would naturally
  let foilPool = [...cards]
  
  // Remove leaders from foil pool (leaders cannot be foil)
  foilPool = foilPool.filter((card) => !card.isLeader)
  
  // Remove common bases from foil pool (common bases cannot be foil)
  foilPool = foilPool.filter((card) => !(card.isBase && card.rarity === 'Common'))
  
  // Remove Special rarity cards if not sets 4-6
  if (!isSet4to6) {
    foilPool = foilPool.filter((card) => card.rarity !== 'Special')
  }
  
  if (foilPool.length > 0) {
    let foilCard = null
    
    if (isSet4to6 && specials.length > 0) {
      // For sets 4-6, Special can appear in foil slot
      // Special should appear at roughly the same rate as rare cards in foil slot
      // Since rares are ~22% of sets 4-6, weight Special to appear ~20% of the time
      if (Math.random() < 0.20) {
        // ~20% chance to get Special in foil slot (similar to rare frequency)
        // Filter to normal Special cards only
        const normalSpecials = specials.filter((s) => s.variantType === 'Normal')
        // Foil can be duplicate, so don't check for duplicates
        foilCard = normalSpecials.length > 0
          ? randomSelect(normalSpecials)
          : randomSelect(specials)
      } else {
        // Otherwise, random from all cards (excluding Special from natural selection)
        const nonSpecialPool = foilPool.filter((c) => c.rarity !== 'Special' && c.variantType === 'Normal')
        // Foil can be duplicate, so don't check for duplicates
        foilCard = nonSpecialPool.length > 0
          ? randomSelect(nonSpecialPool)
          : randomSelect(foilPool.filter((c) => c.rarity !== 'Special'))
      }
    } else {
      // For sets 1-3, no Special cards in foil
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
        if (hyperspaceCard) {
          finalFoil = hyperspaceCard
          isHyperspace = true
        }
      } else {
        // Standard foil: may still be hyperspace variant (rare case)
        // Use the normal hyperspace roll for standard foils
        isHyperspace = rollHyperspace(distribution)
        if (isHyperspace) {
          const hyperspaceCard = findVariantCard(foilCard, 'Hyperspace', cards)
          if (hyperspaceCard) {
            finalFoil = hyperspaceCard
          }
        }
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
  // Pre-A Lawless Time: ~50% chance per pack (1/2 packs)
  // A Lawless Time Onward: Guaranteed at least 1 per pack (100%)
  // For individual non-upgrade-slot cards, we use a lower rate
  // Pre-A Lawless Time: ~2% per card (approximately 1 in 50)
  // A Lawless Time Onward: Higher rate since guaranteed in pack
  if (distribution === RARITY_DISTRIBUTIONS[DISTRIBUTION_PERIODS.A_LAWLESS_TIME_ONWARD]) {
    // A Lawless Time Onward: Higher hyperspace rate
    // Since at least 1 hyperspace is guaranteed per pack, individual cards have higher chance
    return Math.random() < 0.05 // ~5% chance per card
  } else {
    // Pre-A Lawless Time: Lower hyperspace rate
    return Math.random() < 0.02 // ~2% chance per card
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
