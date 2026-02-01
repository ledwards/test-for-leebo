/**
 * Powerful Cards by Set
 *
 * Cards that AI bots should prefer when drafting if they're in-color.
 * Easy to edit: just add or remove card names from each set's array.
 *
 * These get a bonus in the scoring algorithm when the bot sees them.
 */

export const POWERFUL_CARDS = {
  // Spark of Rebellion
  SOR: [
    'Vanquish',
    'Takedown',
    'Force Choke',
    'Open Fire',
    'Superlaser Blast',
    'Asteroid Sanctuary',
    'Snowspeeder',
    'Wing Leader',
    'Fleet Lieutenant',
    'Viper Probe Droid',
    'Cantina Bouncer',
    'Battlefield Marine',
    'Cell Block Guard',
    'Frontier AT-RT',
    'Wolffe',
    'Coordinate',
    'Repair',
    'Strike True',
    'For a Cause I Believe In',
  ],

  // Shadows of the Galaxy
  SHD: [
    'Viper Probe Droid',
    'Cantina Bouncer',
    'Coordinate',
  ],

  // Twilight of the Republic
  TWI: [
    'Viper Probe Droid',
    'Coordinate',
  ],

  // Jump to Lightspeed
  JTL: [
    'Coordinate',
  ],

  // Legacies of the Force
  LOF: [
    'Coordinate',
  ],

  // Secrets and Conspiracies
  SEC: [
    // Top tier units
    'Imperial Dark Trooper',
    'Imperial Occupier',
    'Sith Assassin',
    'Viper Probe Droid',
    'Warrior of Clan Ordo',
    'Outer Rim Constable',
    'Chandrilan Sponsor',
    'Death Trooper',
    'Hunting Assassin Droid',
    'Lurking Snub Fighter',
    'Populist Champion',
    'Daro Commando',
    'Academy Disciplinarian',
    'Rotunda Senate Guards',
    'Heroic ARC-170',
    'Enforcer Squadron',
    'Nubian Star Skiff',
    'Cruel Commandos',
    'FN Trooper Corps',
    'Dressellian Commando',
    'Dogmatic Shock Squad',
    'Naboo Security Force',
    'Jade Squadron Patrol',
    'Shadow Crawler',
    'Screeching TIE Fighter',
    'Muckraker Crab Droid',
    'Rebel Propagandist',
    'Umbaran Mobile Cannon',
    'Taylander Shuttle',

    // Key events and upgrades
    'Sudden Ferocity',
    'Beguile',
    "Let's Call it War",
    'Loan Shark',
    'Ando Commission',
    'Unveiled Might',
    'Grass Roots Resistance',
    'Trade Federation Delegates',
    'Aggressive Negotiations',
    'Emergency Powers',

    // Strong named characters
    'Mina Bonteri',
    'Bail Organa',
    'Hired Slicer',
    'Cikatro Vizago',
    'Senator Chuchi',
    'Mas Ameda',
    'Kazuda Xiono',
    'Elia Kane',
    'Dedra Meero',
    'Renowned Dignitaries',
    'Cantwell Arrestor Cruiser',
    'Darth Nihilus',
    'Chancellor Palpatine',
    'Alexsandr Kallus',
    'The Mandalorian',
    'Queen Amidala',
    'Mon Mothma',
    'Captain Rex',
    'Bo Katan',
    'Karis Nemik',
    "Darth Scion",

    // Ships
    'Lightmaker',
    'First Light',
    'Crucible',
    'Fulminatrix',
  ],
}

// Default bonus score for powerful cards (used by bot behavior)
export const POWERFUL_CARD_BONUS = 25
