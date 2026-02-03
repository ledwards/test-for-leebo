/**
 * Card Services
 *
 * Pure functions for card-related business logic.
 */

export {
  getAspectSortKey,
  getTypeOrder,
  compareByAspectTypeCostName,
  compareByCostName,
  compareByName,
  sortByAspect,
  sortByCost,
  sortByName,
  sortCards,
  getDefaultAspectSortKey,
  defaultSort,
} from './cardSorting.js'

export {
  calculateAspectPenalty,
  leaderIgnoresPenalty,
  getLeaderAbilityDescription,
  isInAspect,
  getEffectiveCost,
  getRelevantAspects,
  PENALTY_PER_ASPECT,
  LEADER_PENALTY_ABILITIES,
} from './aspectPenalties.js'

export {
  NO_ASPECT_LABEL,
  ALL_ASPECTS,
  matchesAspectFilters,
  matchesPenaltyFilter,
  filterByAspects,
  filterByType,
  filterByRarity,
  filterLeaders,
  filterBases,
  filterMainDeckCards,
  filterByCostRange,
  filterByName,
  createDefaultAspectFilters,
} from './cardFiltering.js'
