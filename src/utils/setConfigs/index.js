/**
 * Set Configuration Index
 * 
 * Central registry for all set configurations
 */

import { SOR_CONFIG } from './SOR.js'
import { SHD_CONFIG } from './SHD.js'
import { TWI_CONFIG } from './TWI.js'
import { JTL_CONFIG } from './JTL.js'
import { LOF_CONFIG } from './LOF.js'
import { SEC_CONFIG } from './SEC.js'

/**
 * All set configurations
 */
export const SET_CONFIGS = {
  'SOR': SOR_CONFIG,
  'SHD': SHD_CONFIG,
  'TWI': TWI_CONFIG,
  'JTL': JTL_CONFIG,
  'LOF': LOF_CONFIG,
  'SEC': SEC_CONFIG,
}

/**
 * Get configuration for a specific set
 * @param {string} setCode - The set code (e.g., 'SOR', 'JTL')
 * @returns {Object} The set configuration
 */
export function getSetConfig(setCode) {
  return SET_CONFIGS[setCode] || null
}

/**
 * Get all set codes
 * @returns {string[]} Array of set codes
 */
export function getAllSetCodes() {
  return Object.keys(SET_CONFIGS)
}
