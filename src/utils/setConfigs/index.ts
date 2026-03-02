// @ts-nocheck
/**
 * Set Configuration Index
 *
 * Central registry for all set configurations
 */

import { SOR_CONFIG } from './SOR'
import { SHD_CONFIG } from './SHD'
import { TWI_CONFIG } from './TWI'
import { JTL_CONFIG } from './JTL'
import { LOF_CONFIG } from './LOF'
import { SEC_CONFIG } from './SEC'
import { LAW_CONFIG } from './LAW'
import type { SetCode } from '../../types'

export interface LeaderBaseCounts {
  common: number
  rare: number
  total: number
}

export interface CardCounts {
  leaders: LeaderBaseCounts
  bases: LeaderBaseCounts
  commons: number
  uncommons: number
  rares: number
  legendaries: number
  specials: number
}

export interface PackRules {
  rareBasesInRareSlot: boolean
  specialInFoilSlot: boolean
  foilSlotIsHyperspaceFoil?: boolean
  guaranteedHyperspaceCommon?: boolean
  hyperspaceCommonSlot?: number
  prestigeInStandardPacks?: boolean
}

export interface RarityWeights {
  Common?: number
  Uncommon?: number
  Rare?: number
  Legendary?: number
  Special?: number
}

export interface SetRarityWeights {
  foilSlot?: RarityWeights | null
  hyperfoil?: RarityWeights
  hyperspaceFoilSlot?: RarityWeights
  ucSlot3Upgraded: RarityWeights
  hyperspaceNonFoil: RarityWeights
}

export interface BeltRatios {
  rareToLegendary: number
}

export interface UpgradeProbabilities {
  leaderToHyperspace: number
  leaderToShowcase: number
  baseToHyperspace: number
  foilToHyperfoil: number
  thirdUCToHyperspaceRL: number
  firstUCToHyperspaceUC: number
  secondUCToHyperspaceUC: number
  commonToHyperspace: number
  // NOTE: Rare slot NEVER upgrades to HS. HS rares only appear via UC3 upgrade.
  rareToPrestige?: number
  uc3ToPrestige?: number
}

export interface TripleAspectConfig {
  enabled: boolean
  beltAssignment: 'primaryAspectPriority' | 'randomBelt' | 'splitEvenly'
}

export interface SetConfig {
  setCode: SetCode | string
  setName: string
  setNumber: number
  color: string
  beta?: boolean
  prerelease?: boolean // Pre-release set with estimated collation
  cardCounts: CardCounts
  packRules: PackRules
  rarityWeights: SetRarityWeights
  beltRatios: BeltRatios
  upgradeProbabilities: UpgradeProbabilities
  tripleAspect?: TripleAspectConfig
}

/**
 * All set configurations
 */
export const SET_CONFIGS: Record<string, SetConfig> = {
  'SOR': SOR_CONFIG,
  'SHD': SHD_CONFIG,
  'TWI': TWI_CONFIG,
  'JTL': JTL_CONFIG,
  'LOF': LOF_CONFIG,
  'SEC': SEC_CONFIG,
  'LAW': LAW_CONFIG,
}

/**
 * Get configuration for a specific set
 * @param setCode - The set code (e.g., 'SOR', 'JTL')
 * @returns The set configuration
 */
export function getSetConfig(setCode: SetCode | string): SetConfig | null {
  return SET_CONFIGS[setCode] || null
}

/**
 * Get all set codes
 * @returns Array of set codes
 */
export function getAllSetCodes(): string[] {
  return Object.keys(SET_CONFIGS)
}
