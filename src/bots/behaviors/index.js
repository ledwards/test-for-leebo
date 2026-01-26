/**
 * Bot Behavior System
 *
 * Behaviors define how bots make draft picks.
 * Each behavior implements selectLeader() and selectCard() methods.
 */

import { RandomBehavior } from './RandomBehavior.js'
import { PopularLeaderBehavior } from './PopularLeaderBehavior.js'

// Registry of available behaviors
export const behaviors = {
  random: RandomBehavior,
  popularLeader: PopularLeaderBehavior,
}

// Default behavior for all bots
export const DEFAULT_BEHAVIOR = 'popularLeader'

/**
 * Get a behavior instance by name
 * @param {string} name - Behavior name
 * @returns {Object} Behavior instance
 */
export function getBehavior(name = DEFAULT_BEHAVIOR) {
  const BehaviorClass = behaviors[name]
  if (!BehaviorClass) {
    console.warn(`[BOT] Unknown behavior "${name}", falling back to random`)
    return new RandomBehavior()
  }
  return new BehaviorClass()
}
