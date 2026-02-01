/**
 * Popular Leader Behavior
 *
 * A smarter bot that:
 * 1. Drafts leaders based on community-sourced power rankings
 * 2. Picks a secondary color not in the leader's aspects
 * 3. Drafts cards in-color with smart scoring:
 *    - Rarity bonus (Legendary > Rare > Uncommon > Common)
 *    - Heavy preference for units
 *    - Bonus for dual-aspect cards
 *    - Bonus for high-value cards from community lists
 *    - Bonus for set-specific powerful cards
 *
 * Leader rankings sourced from:
 * - Dexerto tier lists
 * - GarbageRollers draft guides
 * - swumetastats.com tournament data
 * - Community consensus from limited play
 *
 * Powerful cards per set are defined in:
 * - src/bots/data/powerfulCards.js (easily editable)
 */

import { POWERFUL_CARDS, POWERFUL_CARD_BONUS } from '../data/powerfulCards.js'

// Leader power rankings per set (best to worst for LIMITED/DRAFT play)
// These differ from constructed rankings - limited favors:
// - Leaders that deploy early
// - Straightforward abilities
// - Aggro/midrange over control
const LEADER_RANKINGS = {
  SOR: [
    'Sabine Wren',        // Dominates limited, fast aggro
    'Boba Fett',          // Most formidable overall
    'Darth Vader',        // Strong aggression
    'Han Solo',           // Solid cunning value
    'Grand Moff Tarkin',  // Straightforward, solid in limited
    'Luke Skywalker',     // Good vigilance option
    'Leia Organa',        // Solid command
    'Hera Syndulla',      // Command/heroism
    'Cassian Andor',      // Aggression/heroism
    'Grand Inquisitor',   // Aggression/villainy
    'Emperor Palpatine',  // Command/villainy
    'Chewbacca',          // Vigilance/heroism
    'Director Krennic',   // Vigilance/villainy
    'IG-88',              // Aggression/villainy
    'Chirrut Îmwe',       // Vigilance/heroism
    'Grand Admiral Thrawn', // Cunning/villainy
    'Iden Versio',        // Vigilance/villainy
    'Jyn Erso',           // Cunning/heroism
  ],

  SHD: [
    'Han Solo',           // 55.2% win rate, aggression/heroism
    'Cad Bane',           // Excels in limited, Underworld synergy
    'Qi\'ra',             // Vigilance/villainy
    'Boba Fett',          // Strong in limited, command/heroism
    'Bossk',              // Bounties mechanic, strong limited
    'Gar Saxon',          // Vigilance/villainy
    'Rey',                // Vigilance/heroism
    'Kylo Ren',           // Aggression/villainy
    'Bo-Katan Kryze',     // Aggression/heroism
    'Fennec Shand',       // Cunning/heroism
    'Jabba the Hutt',     // Command/villainy
    'Finn',               // Vigilance/heroism
    'Hondo Ohnaka',       // Command/villainy
    'Doctor Aphra',       // Cunning/villainy
    'Lando Calrissian',   // Cunning/heroism
    'Hunter',             // Command/heroism
  ],

  TWI: [
    'Yoda',               // 51% win rate, vigilance/heroism
    'Anakin Skywalker',   // Excellent design, units trade up
    'Quinlan Vos',        // Clear upgrade on deployment
    'Obi-Wan Kenobi',     // Solid vigilance/heroism
    'Captain Rex',        // Command/heroism
    'Mace Windu',         // Aggression/heroism
    'Maul',               // Aggression/villainy
    'Asajj Ventress',     // Cunning/villainy
    'Jango Fett',         // Cunning/villainy
    'Ahsoka Tano',        // Aggression/heroism
    'Count Dooku',        // Command/villainy
    'Padmé Amidala',      // Command/heroism
    'Nala Se',            // Vigilance/villainy
    'Nute Gunray',        // Vigilance/villainy
    'General Grievous',   // Cunning/villainy
    'Wat Tambor',         // Beast in limited, command/villainy
    'Pre Vizsla',         // Aggression/villainy
    'Chancellor Palpatine', // Complex but powerful
  ],

  JTL: [
    'Poe Dameron',        // Top 8 appearances, aggression/heroism
    'Darth Vader',        // Command/villainy powerhouse
    'Admiral Piett',      // Top 8 appearances, command/villainy
    'Han Solo',           // Cunning/heroism
    'Lando Calrissian',   // Buying Time, vigilance/heroism
    'Asajj Ventress',     // Vigilance/villainy
    'Luke Skywalker',     // Aggression/heroism
    'Wedge Antilles',     // Command/heroism
    'Boba Fett',          // Aggression/villainy
    'Grand Admiral Thrawn', // Vigilance/villainy
    'Admiral Ackbar',     // Cunning/heroism
    'Admiral Holdo',      // Command/heroism
    'Captain Phasma',     // Aggression/villainy
    'Admiral Trench',     // Cunning/villainy
    'Major Vonreg',       // Aggression/villainy
    'Rose Tico',          // Vigilance/heroism
    'Kazuda Xiono',       // Cunning/heroism
    'Rio Durant',         // Cunning/villainy
  ],

  LOF: [
    'Rey',                // Aggression/heroism, strong
    'Darth Maul',         // Aggression/villainy
    'Ahsoka Tano',        // Vigilance/heroism
    'Obi-Wan Kenobi',     // Command/heroism
    'Kylo Ren',           // Vigilance/villainy
    'Cal Kestis',         // Cunning/heroism
    'Kit Fisto',          // Aggression/heroism
    'Third Sister',       // Aggression/villainy
    'Kanan Jarrus',       // Vigilance/heroism
    'Supreme Leader Snoke', // Command/villainy
    'Grand Inquisitor',   // Cunning/villainy
    'Mother Talzin',      // Vigilance/villainy
    'Morgan Elsbeth',     // Command/villainy
    'Avar Kriss',         // Command/heroism
    'Qui-Gon Jinn',       // Cunning/heroism
    'Barriss Offee',      // Cunning/villainy
    'Anakin Skywalker',   // Heroism only
    'Darth Revan',        // Villainy only
  ],

  SEC: [
    'Leia Organa',        // Vigilance/heroism - top pick
    'Sly Moore',          // Cunning/villainy
    'Colonel Yularen',    // Command/villainy
    'Jabba the Hutt',     // Vigilance/villainy
    'Mon Mothma',         // Command/heroism
    'Dedra Meero',        // Aggression/villainy
    'Sabé',               // Cunning/heroism
    'Chancellor Palpatine', // Vigilance/villainy, versatile
    'Cassian Andor',      // Aggression/heroism
    'Governor Pryce',     // Aggression/villainy
    'Luthen Rael',        // Aggression/heroism
    'Dryden Vos',         // Command/villainy
    'Bail Organa',        // Command/heroism
    'Satine Kryze',       // Vigilance/heroism
    'Padmé Amidala',      // Cunning/heroism
    'Lama Su',            // Vigilance/villainy
    'C-3P0',              // Cunning/heroism
    'DJ',                 // Cunning/cunning (unique)
  ],
}

// High-value cards for limited play (format: cardName -> bonus score)
// These are cards that consistently overperform in draft/sealed
const HIGH_VALUE_CARDS = {
  // Strong removal
  'Vanquish': 30,
  'Takedown': 25,
  'Force Choke': 25,
  'Open Fire': 20,
  'Superlaser Blast': 35,
  'Asteroid Sanctuary': 20,

  // Strong units
  'Darth Vader': 30,
  'Luke Skywalker': 30,
  'Obi-Wan Kenobi': 25,
  'Yoda': 25,
  'Emperor Palpatine': 25,
  'General Grievous': 20,

  // Efficient units
  'Snowspeeder': 15,
  'Wing Leader': 15,
  'Fleet Lieutenant': 15,
  'Viper Probe Droid': 15,
  'Cantina Bouncer': 10,
  'Battlefield Marine': 10,
  'Cell Block Guard': 10,
  'Frontier AT-RT': 10,
  'Wolffe': 15,

  // Value cards
  'Coordinate': 15,
  'Repair': 10,
  'Strike True': 10,
  'For a Cause I Believe In': 10,
}

// All aspects in the game
const ALL_ASPECTS = ['Vigilance', 'Command', 'Aggression', 'Cunning', 'Heroism', 'Villainy']

// Color aspects (non-alignment)
const COLOR_ASPECTS = ['Vigilance', 'Command', 'Aggression', 'Cunning']

export class PopularLeaderBehavior {
  constructor() {
    this.name = 'popularLeader'
    this.secondaryColor = null // Chosen after first leader pick
  }

  /**
   * Select a leader from available options based on power rankings
   * @param {Array} leaders - Available leaders to pick from
   * @param {Object} context - Draft context (draftedLeaders, setCode, etc.)
   * @returns {Object} Selected leader
   */
  selectLeader(leaders, context = {}) {
    if (!leaders || leaders.length === 0) return null

    const setCode = context.setCode || this._inferSetCode(leaders)
    const rankings = LEADER_RANKINGS[setCode] || []

    // Sort leaders by their ranking position (lower index = better)
    const sorted = [...leaders].sort((a, b) => {
      const rankA = rankings.indexOf(a.name)
      const rankB = rankings.indexOf(b.name)

      // Unranked leaders go to the end
      const posA = rankA >= 0 ? rankA : 999
      const posB = rankB >= 0 ? rankB : 999

      return posA - posB
    })

    return sorted[0]
  }

  /**
   * Select a card from the current pack using smart scoring
   * @param {Array} pack - Current pack of cards
   * @param {Object} context - Draft context (draftedCards, draftedLeaders, setCode, etc.)
   * @returns {Object} Selected card
   */
  selectCard(pack, context = {}) {
    if (!pack || pack.length === 0) return null

    const draftedLeaders = context.draftedLeaders || []

    // Determine our colors from drafted leaders
    const myColors = this._getColorsFromLeaders(draftedLeaders)

    // If we haven't picked a secondary color yet, choose one
    if (!this.secondaryColor && myColors.length > 0) {
      this._chooseSecondaryColor(myColors)
    }

    // Score all cards and pick the best
    const scored = pack.map(card => ({
      card,
      score: this._scoreCard(card, myColors, context)
    }))

    scored.sort((a, b) => b.score - a.score)

    return scored[0].card
  }

  /**
   * Get color aspects from drafted leaders
   */
  _getColorsFromLeaders(leaders) {
    const colors = new Set()
    for (const leader of leaders) {
      if (leader.aspects) {
        for (const aspect of leader.aspects) {
          if (COLOR_ASPECTS.includes(aspect) || aspect === 'Heroism' || aspect === 'Villainy') {
            colors.add(aspect)
          }
        }
      }
    }
    return Array.from(colors)
  }

  /**
   * Choose a secondary color not represented in our leaders
   */
  _chooseSecondaryColor(leaderColors) {
    // Find color aspects not in our leaders
    const missingColors = COLOR_ASPECTS.filter(c => !leaderColors.includes(c))

    if (missingColors.length > 0) {
      // Pick a random missing color as secondary
      this.secondaryColor = missingColors[Math.floor(Math.random() * missingColors.length)]
    }
  }

  /**
   * Score a card based on multiple factors
   * @param {Object} card - Card to score
   * @param {Array} myColors - Bot's color aspects
   * @param {Object} context - Draft context including setCode
   */
  _scoreCard(card, myColors, context) {
    const setCode = context.setCode || this._inferSetCode([card])
    let score = 0

    // 1. RARITY BONUS (Legendary > Rare > Uncommon > Common)
    const rarityScores = {
      'Legendary': 100,
      'Rare': 60,
      'Uncommon': 30,
      'Common': 10
    }
    score += rarityScores[card.rarity] || 0

    // 2. IN-COLOR BONUS - massive bonus for being in our colors
    const cardAspects = card.aspects || []
    const inColorCount = this._countMatchingAspects(cardAspects, myColors)

    if (inColorCount > 0) {
      score += 50 * inColorCount // 50 points per matching aspect
    } else if (this.secondaryColor && cardAspects.includes(this.secondaryColor)) {
      score += 40 // Secondary color bonus (slightly less than primary)
    } else if (cardAspects.length === 0) {
      // Neutral cards - small bonus (always playable)
      score += 20
    } else {
      // Off-color penalty
      score -= 30
    }

    // 3. DUAL-ASPECT BONUS - cards with 2 aspects in our colors
    if (inColorCount >= 2) {
      score += 25 // Extra bonus for dual-aspect in color
    }

    // 4. UNIT PREFERENCE - heavily favor units
    if (card.type === 'Unit') {
      score += 40
    } else if (card.type === 'Upgrade') {
      score += 15
    } else if (card.type === 'Event') {
      score += 10
    }

    // 5. HIGH-VALUE CARD BONUS (generic high-value cards)
    const highValueBonus = HIGH_VALUE_CARDS[card.name] || 0
    if (highValueBonus > 0 && (inColorCount > 0 || cardAspects.length === 0)) {
      score += highValueBonus
    }

    // 6. SET-SPECIFIC POWERFUL CARDS BONUS
    const powerfulCardsForSet = POWERFUL_CARDS[setCode] || []
    if (powerfulCardsForSet.includes(card.name) && (inColorCount > 0 || cardAspects.length === 0)) {
      score += POWERFUL_CARD_BONUS
    }

    // 7. COST CURVE CONSIDERATION - slight preference for 2-4 cost cards
    const cost = card.cost || 0
    if (cost >= 2 && cost <= 4) {
      score += 10
    } else if (cost >= 5 && cost <= 6) {
      score += 5
    }

    // 8. STATS EFFICIENCY (for units)
    if (card.type === 'Unit' && card.power && card.hp) {
      const statTotal = card.power + card.hp
      const efficiency = statTotal / Math.max(card.cost, 1)
      score += Math.min(efficiency * 3, 15) // Cap at 15 bonus
    }

    return score
  }

  /**
   * Count how many card aspects match our colors
   */
  _countMatchingAspects(cardAspects, myColors) {
    return cardAspects.filter(a => myColors.includes(a)).length
  }

  /**
   * Infer set code from card data
   */
  _inferSetCode(cards) {
    if (!cards || cards.length === 0) return 'SOR'
    // Use the set from the first card, or parse from ID
    const firstCard = cards[0]
    if (firstCard.set) return firstCard.set
    if (firstCard.id) {
      const match = firstCard.id.match(/^([A-Z]+)-/)
      if (match) return match[1]
    }
    return 'SOR'
  }

  /**
   * Reset state for a new draft
   */
  reset() {
    this.secondaryColor = null
  }
}
