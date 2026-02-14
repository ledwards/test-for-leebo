// @ts-nocheck
/**
 * Leader Power Rankings for Limited/Draft Play
 *
 * These rankings are based on:
 * - Dexerto tier lists
 * - GarbageRollers draft guides
 * - swumetastats.com tournament data
 * - Community consensus from limited play
 *
 * Rankings differ from constructed - limited favors:
 * - Leaders that deploy early
 * - Straightforward abilities
 * - Aggro/midrange over control
 */

export const LEADER_RANKINGS: Record<string, string[]> = {
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

  LAW: [
    // LAW is new, using placeholder rankings based on early impressions
    'Darth Vader',
    'Luke Skywalker',
    'Obi-Wan Kenobi',
    'Yoda',
    'Emperor Palpatine',
    'Ahsoka Tano',
    'Anakin Skywalker',
    'Han Solo',
    'Leia Organa',
    'Boba Fett',
  ],
}

export default LEADER_RANKINGS
