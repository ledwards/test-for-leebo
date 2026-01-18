/**
 * Prose Description Generator
 * 
 * Generates human-readable descriptions of sheet configurations
 * and pack generation parameters for display on pool pages.
 */

import { getSetConfig } from './setConfigs/index.js'

/**
 * Generate prose description of sheet configuration
 * @param {string} setCode - Set code
 * @returns {string} Human-readable description
 */
export function generateSheetDescription(setCode) {
  const config = getSetConfig(setCode)
  if (!config || !config.sheetConfig) {
    return `No sheet configuration available for ${setCode}.`
  }
  
  const lines = []
  const sc = config.sheetConfig
  const cc = config.cardCounts
  
  lines.push(`# ${config.setName} (${setCode}) - Sheet Configuration`)
  lines.push('')
  
  // Card counts
  lines.push(`## Card Counts`)
  lines.push(`- **Total Unique Cards**: ${cc.commons + cc.uncommons + cc.rares + cc.legendaries + (cc.specials || 0)} standard cards`)
  lines.push(`- **Leaders**: ${cc.leaders.total} (${cc.leaders.common} Common, ${cc.leaders.rare} Rare+)`)
  lines.push(`- **Bases**: ${cc.bases.total}`)
  lines.push(`- **Commons**: ${cc.commons}`)
  lines.push(`- **Uncommons**: ${cc.uncommons}`)
  lines.push(`- **Rares**: ${cc.rares}`)
  lines.push(`- **Legendaries**: ${cc.legendaries}`)
  if (cc.specials > 0) {
    lines.push(`- **Specials**: ${cc.specials}`)
  }
  lines.push('')
  
  // Sheet layout
  lines.push(`## Print Sheet Layout`)
  lines.push('')
  
  // Rare/Legendary sheet
  const rl = sc.rareLegendary
  lines.push(`### Rare/Legendary Sheet (11×11 = 121 cards)`)
  lines.push(`- ${rl.layout.rares.count} Rares × ${rl.layout.rares.copies} copies = ${rl.layout.rares.count * rl.layout.rares.copies} cards`)
  lines.push(`- ${rl.layout.legendaries.count} Legendaries × ${rl.layout.legendaries.copies} copy = ${rl.layout.legendaries.count * rl.layout.legendaries.copies} cards`)
  lines.push(`- ${rl.layout.blanks} blank slots`)
  lines.push(`- **Legendary Drop Rate**: ~${(rl.legendaryRate * 100).toFixed(1)}% (1 in ${Math.round(1/rl.legendaryRate)} packs)`)
  lines.push('')
  
  // Uncommon sheet
  const u = sc.uncommon
  lines.push(`### Uncommon Sheet${u.sheets > 1 ? 's' : ''} (${u.sheets} × 121 = ${u.sheets * 121} cards)`)
  lines.push(`- ${u.layout.uncommons.count} Uncommons × ${u.layout.uncommons.copies} copies = ${u.layout.uncommons.count * u.layout.uncommons.copies} cards`)
  lines.push(`- ${u.layout.blanks * u.sheets} blank slots total`)
  lines.push('')
  
  // Common sheets
  const c = sc.common
  lines.push(`### Common Sheets (${c.sheets} × 121 = ${c.totalCards} cards)`)
  lines.push(`- ${c.layout.commons.count} Commons × ${c.layout.commons.copies} copies = ${c.layout.commons.count * c.layout.commons.copies} cards`)
  lines.push(`- ${c.layout.blanks} blank slots total`)
  lines.push('')
  lines.push(`**Belt System** (for aspect balance and duplicate prevention):`)
  lines.push(`- **Belt A**: ${c.belts.beltA.approximateCount} cards - ${c.belts.beltA.description}`)
  lines.push(`- **Belt B**: ${c.belts.beltB.approximateCount} cards - ${c.belts.beltB.description}`)
  lines.push(`- Belt A contains all Vigilance/Command cards + ~50% of Neutral/Hero/Villain cards`)
  lines.push(`- Belt B contains all Aggression/Cunning cards + ~50% of Neutral/Hero/Villain cards (different from Belt A)`)
  lines.push(`- Belts are completely disjoint - zero overlap ensures no duplicate commons`)
  lines.push(`- Packs alternate 4-5 cards from each belt (A-B-A-B-A-B-A-B-A), guaranteeing balanced blue/green and red/yellow distribution`)
  lines.push('')
  
  // Leader sheet
  const l = sc.leader
  lines.push(`### Leader Sheet (11×11 = 121 cards)`)
  lines.push(`- ${l.layout.commonLeaders.count} Common Leaders × ${l.layout.commonLeaders.copies} copies = ${l.layout.commonLeaders.count * l.layout.commonLeaders.copies} cards`)
  lines.push(`- ${l.layout.rareLeaders.count} Rare Leaders × ${l.layout.rareLeaders.copies} copies = ${l.layout.rareLeaders.count * l.layout.rareLeaders.copies} cards`)
  lines.push(`- ${l.layout.blanks} blank slots`)
  lines.push(`- **Rare Leader Rate**: ~${(l.rareLeaderRate * 100).toFixed(1)}% (1 in ${Math.round(1/l.rareLeaderRate)} packs)`)
  lines.push('')
  
  // Base sheet
  const b = sc.base
  lines.push(`### Base Sheet (11×11 = 121 cards)`)
  lines.push(`- ${b.layout.commonBases.count} Common Bases × ${b.layout.commonBases.copies} copies = ${b.layout.commonBases.count * b.layout.commonBases.copies} cards`)
  lines.push(`- ${b.layout.blanks} blank slots`)
  lines.push('')
  
  // Foil sheet
  const f = sc.foil
  lines.push(`### Foil Sheet (11×11 = 121 cards)`)
  lines.push(`Distribution matches overall rarity distribution:`)
  lines.push(`- Commons: ~${f.layout.commons.approximate} cards`)
  lines.push(`- Uncommons: ~${f.layout.uncommons.approximate} cards`)
  lines.push(`- Rares: ~${f.layout.rares.approximate} cards`)
  lines.push(`- Legendaries: ~${f.layout.legendaries.approximate} cards`)
  lines.push('')
  
  // Pack rules
  lines.push(`## Pack Construction`)
  lines.push('')
  lines.push(`Each pack contains 16 cards:`)
  lines.push(`1. **1 Leader** (pulled from leader sheet)`)
  lines.push(`2. **1 Base** (pulled from base sheet)`)
  lines.push(`3. **9 Commons** (pulled alternating from Belt A and Belt B sheets)`)
  lines.push(`4. **3 Uncommons** (pulled from uncommon sheets)`)
  lines.push(`   - 3rd slot can be upgraded to hyperspace variant (~${(config.upgradeSlot.hyperspaceChance * 100).toFixed(0)}% chance)`)
  lines.push(`5. **1 Rare or Legendary** (pulled from rare/legendary sheet)`)
  lines.push(`6. **1 Foil** (standard foil ~83%, hyperspace foil ~17%)`)
  lines.push('')
  lines.push(`**Hyperspace Cards**: ~${(config.packRules.hyperspacePackRate * 100).toFixed(0)}% of packs contain at least one hyperspace card`)
  lines.push(`**Showcase Leaders**: ~1 in 288 packs`)
  if (config.packRules.specialInFoilSlot) {
    lines.push(`**Special Rarity**: Can appear in foil slot (~${(config.packRules.specialInFoilRate * 100).toFixed(1)}% of foils)`)
  }
  lines.push('')
  
  // Methodology
  lines.push(`## Methodology`)
  lines.push('')
  lines.push(`This pool uses a **sheet-based pack generation** system that simulates realistic TCG printing and collation:`)
  lines.push('')
  lines.push(`1. **Sheet Generation**: Cards are arranged on 11×11 print sheets (121 cards each) with appropriate copy counts based on rarity`)
  lines.push(`2. **Sequential Pulls**: Each sheet has a pointer that advances sequentially, simulating how packs are filled from cut sheets`)
  lines.push(`3. **Belt System**: Commons are separated into Belt A (Vigilance/Command + neutral) and Belt B (Aggression/Cunning + neutral), alternating pulls to ensure aspect balance`)
  lines.push(`4. **Box Collation**: Packs are filled sequentially to create realistic box-level distribution`)
  lines.push('')
  lines.push(`This approach produces more realistic pack-to-pack variation and eliminates unrealistic duplicates that would occur with pure random generation.`)
  
  return lines.join('\n')
}

/**
 * Generate HTML version of sheet description
 * @param {string} setCode - Set code
 * @returns {string} HTML description
 */
export function generateSheetDescriptionHTML(setCode) {
  const markdown = generateSheetDescription(setCode)
  
  // Simple markdown to HTML conversion
  let html = markdown
    .replace(/^# (.*)/gm, '<h1>$1</h1>')
    .replace(/^## (.*)/gm, '<h2>$1</h2>')
    .replace(/^### (.*)/gm, '<h3>$1</h3>')
    .replace(/^\*\*(.*?)\*\*/gm, '<strong>$1</strong>')
    .replace(/^- (.*)/gm, '<li>$1</li>')
    .replace(/\n\n/g, '<br><br>')
  
  // Wrap lists
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
  
  return html
}

/**
 * Generate short description for display on pool page
 * @param {string} setCode - Set code
 * @returns {string} Short description
 */
export function generateShortDescription(setCode) {
  const config = getSetConfig(setCode)
  if (!config || !config.sheetConfig) {
    return `No configuration available for ${setCode}.`
  }
  
  const rl = config.sheetConfig.rareLegendary
  const c = config.sheetConfig.common
  
  return `This ${config.setName} pool uses sheet-based generation with ${c.layout.commons.count} commons (×${c.layout.commons.copies} each on ${c.sheets} sheets), ${config.cardCounts.uncommons} uncommons (×2), ${config.cardCounts.rares} rares (×${rl.layout.rares.copies}), and ${config.cardCounts.legendaries} legendaries (×${rl.layout.legendaries.copies}). Commons are distributed using a two-belt system: Belt A (Vigilance/Command + neutral) and Belt B (Aggression/Cunning + neutral), with completely disjoint card sets. Alternating pulls from belts guarantees no duplicate commons while ensuring balanced blue/green and red/yellow aspect distribution. Legendary drop rate is ~${(rl.legendaryRate * 100).toFixed(1)}% (1 in ${Math.round(1/rl.legendaryRate)} packs).`
}
