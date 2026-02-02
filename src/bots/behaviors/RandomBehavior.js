/**
 * Random Behavior
 *
 * The simplest behavior - picks randomly from available options.
 * Leaders: random selection
 * Cards: prefers higher rarity (Legendary > Rare > Uncommon > Common)
 */

export class RandomBehavior {
  constructor() {
    this.name = 'random'
  }

  /**
   * Select a leader from available options
   * @param {Array} leaders - Available leaders to pick from
   * @param {Object} context - Draft context (draftedLeaders, setCode, etc.)
   * @returns {Object} Selected leader
   */
  selectLeader(leaders, context = {}) {
    if (!leaders || leaders.length === 0) return null
    const pickIndex = Math.floor(Math.random() * leaders.length)
    return leaders[pickIndex]
  }

  /**
   * Select a card from the current pack
   * @param {Array} pack - Current pack of cards
   * @param {Object} context - Draft context (draftedCards, draftedLeaders, setCode, etc.)
   * @returns {Object} Selected card
   */
  selectCard(pack, context = {}) {
    if (!pack || pack.length === 0) return null

    // Sort by rarity and pick the best
    const rarityOrder = { 'Legendary': 0, 'Rare': 1, 'Uncommon': 2, 'Common': 3 }
    const sorted = [...pack].sort(
      (a, b) => (rarityOrder[a.rarity] ?? 4) - (rarityOrder[b.rarity] ?? 4)
    )

    return sorted[0]
  }
}
