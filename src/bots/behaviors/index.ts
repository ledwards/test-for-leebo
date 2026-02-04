// @ts-nocheck
/**
 * Bot Behavior System
 *
 * Behaviors define how bots make draft picks.
 * Each behavior implements selectLeader() and selectCard() methods.
 */

import { RandomBehavior } from './RandomBehavior'
import { PopularLeaderBehavior } from './PopularLeaderBehavior'

// Behavior class type
type BehaviorClass = typeof RandomBehavior | typeof PopularLeaderBehavior

// Behavior instance type
type BehaviorInstance = RandomBehavior | PopularLeaderBehavior

// Registry of available behaviors
export const behaviors: Record<string, BehaviorClass> = {
  random: RandomBehavior,
  popularLeader: PopularLeaderBehavior,
}

// Default behavior for all bots
export const DEFAULT_BEHAVIOR = 'popularLeader'

/**
 * Get a behavior instance by name
 * @param name - Behavior name
 * @returns Behavior instance
 */
export function getBehavior(name: string = DEFAULT_BEHAVIOR): BehaviorInstance {
  const BehaviorClass = behaviors[name]
  if (!BehaviorClass) {
    console.warn(`[BOT] Unknown behavior "${name}", falling back to random`)
    return new RandomBehavior()
  }
  return new BehaviorClass()
}
