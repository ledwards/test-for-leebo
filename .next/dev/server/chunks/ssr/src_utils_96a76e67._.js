module.exports = [
"[project]/src/utils/cardData.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "filterByRarity",
    ()=>filterByRarity,
    "filterByType",
    ()=>filterByType,
    "getAllCards",
    ()=>getAllCards,
    "getBases",
    ()=>getBases,
    "getCardsBySet",
    ()=>getCardsBySet,
    "getLeaders",
    ()=>getLeaders
]);
// Card data utilities
// This module handles loading and managing card data from the definition file
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$cards$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/src/data/cards.json (json)");
;
function getCardsBySet(setCode) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$cards$2e$json__$28$json$29$__["default"].cards || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$cards$2e$json__$28$json$29$__["default"].cards.length === 0) {
        return [];
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$cards$2e$json__$28$json$29$__["default"].cards.filter((card)=>card.set === setCode);
}
function getAllCards() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$cards$2e$json__$28$json$29$__["default"].cards || [];
}
function filterByRarity(cards, rarity) {
    return cards.filter((card)=>card.rarity === rarity);
}
function filterByType(cards, type) {
    return cards.filter((card)=>card.type === type);
}
function getLeaders(cards) {
    return cards.filter((card)=>card.isLeader === true || card.type === 'Leader');
}
function getBases(cards) {
    return cards.filter((card)=>card.isBase === true || card.type === 'Base');
} /**
 * Card schema:
 * {
 *   id: string (unique identifier)
 *   name: string (card name)
 *   set: string (set code: SOR, SHD, TWI, JTL, LOF, SEC)
 *   rarity: string (Common, Uncommon, Rare, Legendary)
 *   type: string (Leader, Base, Unit, Event, Upgrade, etc.)
 *   aspects: Array<string> (e.g., ["Villainy", "Command"])
 *   cost: number (resource cost)
 *   isLeader: boolean
 *   isBase: boolean
 *   imageUrl: string (optional, URL to card image)
 *   // ... other metadata as needed
 * }
 */ 
}),
"[project]/src/utils/packArt.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getPackArtUrl",
    ()=>getPackArtUrl,
    "setPackArtUrl",
    ()=>setPackArtUrl
]);
// Pack art URL mappings for Star Wars Unlimited sets
// 
// To find pack art URLs:
// 1. Visit official Star Wars Unlimited website: https://starwarsunlimited.com
// 2. Check product pages on Fantasy Flight Games website
// 3. Look for images on retailer sites (Amazon, etc.) - right-click and "Copy Image Address"
// 4. Check image hosting services (Imgur, etc.) for community-uploaded pack art
// 5. Look for CDN URLs from official sources
//
// Once you find a working URL, update the corresponding entry below.
// URLs should point directly to image files (.jpg, .png, etc.)
/**
 * Pack art URL mappings for each set
 * Images sourced from https://starwarsunlimited.com/products
 * Using key art images from the official Star Wars Unlimited website
 */ const PACK_ART_URLS = {
    // Spark of Rebellion - Set 1
    SOR: '/pack-art/sor.jpg',
    // Shadows of the Galaxy - Set 2
    SHD: '/pack-art/shd.jpg',
    // Twilight of the Republic - Set 3
    TWI: '/pack-art/twi.png',
    // Jump to Lightspeed - Set 4
    JTL: '/pack-art/jtl.jpg',
    // Legends of the Force - Set 5
    LOF: '/pack-art/lof.png',
    // Secrets of Power - Set 6
    SEC: '/pack-art/sec.png'
};
function getPackArtUrl(setCode) {
    return PACK_ART_URLS[setCode] || null;
}
function setPackArtUrl(setCode, url) {
    PACK_ART_URLS[setCode] = url;
}
}),
"[project]/src/utils/api.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchSetCards",
    ()=>fetchSetCards,
    "fetchSets",
    ()=>fetchSets
]);
// API utilities for fetching data from swu-db.com
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cardData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/cardData.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$packArt$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/packArt.js [app-ssr] (ecmascript)");
;
;
const SWUDB_BASE_URL = 'https://swudb.com';
const SWU_DB_API_BASE = 'https://api.swu-db.com';
async function fetchSets() {
    try {
        // Try GraphQL API first
        const response = await fetch(`${SWUDB_BASE_URL}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `
          query {
            sets {
              code
              name
              releaseDate
            }
          }
        `
            })
        });
        if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.sets) {
                return data.data.sets.map((set)=>({
                        ...set,
                        imageUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$packArt$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPackArtUrl"])(set.code)
                    }));
            }
        }
    } catch (error) {
        console.warn('GraphQL API failed, trying alternative method', error);
    }
    // Fallback: Use hardcoded set data for the first 6 sets
    // Based on actual SWU expansion sets from swudb.com
    // The 6 expansion sets are:
    // 1. Spark of Rebellion, 2. Shadows of the Galaxy, 3. Twilight of the Republic,
    // 4. Jump to Lightspeed, 5. Legends of the Force, 6. Secrets of Power
    const knownSets = [
        {
            code: 'SOR',
            name: 'Spark of Rebellion',
            releaseDate: '2024-03-08'
        },
        {
            code: 'SHD',
            name: 'Shadows of the Galaxy',
            releaseDate: '2024-07-12'
        },
        {
            code: 'TWI',
            name: 'Twilight of the Republic',
            releaseDate: '2024-11-08'
        },
        {
            code: 'JTL',
            name: 'Jump to Lightspeed',
            releaseDate: '2025-03-14'
        },
        {
            code: 'LOF',
            name: 'Legends of the Force',
            releaseDate: '2025-07-11'
        },
        {
            code: 'SEC',
            name: 'Secrets of Power',
            releaseDate: '2025-11-07'
        }
    ];
    return knownSets.map((set)=>({
            ...set,
            imageUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$packArt$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPackArtUrl"])(set.code)
        }));
}
async function fetchSetCards(setCode) {
    // Try swu-db.com API first (the official API)
    try {
        const response = await fetch(`${SWU_DB_API_BASE}/cards/${setCode.toLowerCase()}?format=json`);
        if (response.ok) {
            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
                // Transform API response to our card schema
                return data.data.map((card)=>({
                        id: `${card.Set}-${card.Number}`,
                        name: card.Name,
                        subtitle: card.Subtitle || null,
                        set: card.Set,
                        number: card.Number,
                        rarity: card.Rarity,
                        type: card.Type,
                        aspects: card.Aspects || [],
                        traits: card.Traits || [],
                        arenas: card.Arenas || [],
                        cost: card.Cost ? parseInt(card.Cost) : null,
                        power: card.Power ? parseInt(card.Power) : null,
                        hp: card.HP ? parseInt(card.HP) : null,
                        frontText: card.FrontText || null,
                        backText: card.BackText || null,
                        epicAction: card.EpicAction || null,
                        keywords: card.Keywords || [],
                        artist: card.Artist || null,
                        unique: card.Unique || false,
                        doubleSided: card.DoubleSided || false,
                        variantType: card.VariantType || 'Normal',
                        marketPrice: card.MarketPrice ? parseFloat(card.MarketPrice) : null,
                        lowPrice: card.LowPrice ? parseFloat(card.LowPrice) : null,
                        isLeader: card.Type === 'Leader',
                        isBase: card.Type === 'Base',
                        imageUrl: card.FrontArt || null,
                        backImageUrl: card.BackArt || null
                    }));
            }
        }
    } catch (error) {
        console.warn('swu-db.com API failed, trying local data', error);
    }
    // Fallback: Load from local card data file
    try {
        const localCards = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cardData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCardsBySet"])(setCode);
        if (localCards.length > 0) {
            console.log(`Loaded ${localCards.length} cards from local data for set ${setCode}`);
            return localCards;
        }
    } catch (error) {
        console.warn('Failed to load local card data', error);
    }
    // If all methods fail, return empty array
    // The component should handle this gracefully
    console.warn(`Unable to fetch card data for set ${setCode}. Card data file may need to be populated.`);
    return [];
}
}),
"[project]/src/utils/cardCache.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCacheStats",
    ()=>getCacheStats,
    "getCachedCards",
    ()=>getCachedCards,
    "initializeCardCache",
    ()=>initializeCardCache,
    "isCacheInitialized",
    ()=>isCacheInitialized
]);
// Card cache utility - preloads all cards for fast access
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cardData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/cardData.js [app-ssr] (ecmascript)");
;
// Cache for all cards organized by set
const cardCache = new Map();
// Flag to track if cache is initialized
let cacheInitialized = false;
function initializeCardCache() {
    if (cacheInitialized) {
        return Promise.resolve();
    }
    try {
        const allCards = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cardData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAllCards"])();
        // Organize cards by set
        const sets = [
            'SOR',
            'SHD',
            'TWI',
            'JTL',
            'LOF',
            'SEC'
        ];
        sets.forEach((setCode)=>{
            const setCards = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cardData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCardsBySet"])(setCode);
            cardCache.set(setCode, setCards);
        });
        cacheInitialized = true;
        console.log('Card cache initialized with', allCards.length, 'total cards');
        // Return resolved promise immediately since data is already loaded
        return Promise.resolve();
    } catch (error) {
        console.error('Failed to initialize card cache:', error);
        return Promise.reject(error);
    }
}
function getCachedCards(setCode) {
    return cardCache.get(setCode) || [];
}
function isCacheInitialized() {
    return cacheInitialized;
}
function getCacheStats() {
    const stats = {
        initialized: cacheInitialized,
        sets: {},
        totalCards: 0
    };
    cardCache.forEach((cards, setCode)=>{
        stats.sets[setCode] = cards.length;
        stats.totalCards += cards.length;
    });
    return stats;
}
}),
"[project]/src/utils/rarityConfig.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Rarity Distribution Configuration
 * 
 * Defines the distribution rates for foils, hyperspace variants, showcase leaders,
 * and other special card types for different time periods in Star Wars Unlimited.
 * 
 * Based on official distribution rates from FFG/Asmodee.
 */ /**
 * Distribution periods
 */ __turbopack_context__.s([
    "DISTRIBUTION_PERIODS",
    ()=>DISTRIBUTION_PERIODS,
    "RARITY_DISTRIBUTIONS",
    ()=>RARITY_DISTRIBUTIONS,
    "SETS_WITH_SPECIAL_IN_FOIL",
    ()=>SETS_WITH_SPECIAL_IN_FOIL,
    "SET_DISTRIBUTIONS",
    ()=>SET_DISTRIBUTIONS,
    "getDistributionForSet",
    ()=>getDistributionForSet,
    "getDistributionPeriod",
    ()=>getDistributionPeriod
]);
const DISTRIBUTION_PERIODS = {
    PRE_LAWLESS_TIME: 'pre-lawless-time',
    A_LAWLESS_TIME_ONWARD: 'a-lawless-time-onward'
};
const RARITY_DISTRIBUTIONS = {
    [DISTRIBUTION_PERIODS.PRE_LAWLESS_TIME]: {
        // Standard Foils: In ~ 5/6 standard packs, 7 in each Carbonite pack
        standardFoil: {
            inStandardPack: 5 / 6,
            inCarbonitePack: 7 // Fixed count
        },
        // Hyperspace Foils: In ~ 1/6 standard packs, 2 in each Carbonite pack
        hyperspaceFoil: {
            inStandardPack: 1 / 6,
            inCarbonitePack: 2 // Fixed count
        },
        // Hyperspace: In ~ 2/3 standard packs, 5-6 in each Carbonite pack
        hyperspace: {
            inStandardPack: 2 / 3,
            inCarbonitePack: {
                min: 5,
                max: 6
            } // Random between 5-6
        },
        // Non-foil Prestige: Only in Carbonite packs
        nonFoilPrestige: {
            inStandardPack: 0,
            inCarbonitePack: true
        },
        // Serialized Prestige: Only in Carbonite packs, All serialized X/250 cards
        serializedPrestige: {
            inStandardPack: 0,
            inCarbonitePack: true,
            serializationTypes: [
                'X/250'
            ]
        },
        // Showcase Leaders: In ~ 1/288 standard packs, In ~ 1/20 Carbonite packs
        showcaseLeader: {
            inStandardPack: 1 / 288,
            inCarbonitePack: 1 / 20 // ~5% chance per pack
        },
        // Rare Variants: Hyperspace in ~ 1/21 standard packs, Hyperspace foil in ~ 1/72 standard packs
        rareVariants: {
            hyperspace: {
                inStandardPack: 1 / 21 // ~4.76% chance per pack
            },
            hyperspaceFoil: {
                inStandardPack: 1 / 72 // ~1.39% chance per pack
            }
        },
        // Legendary Variants: Hyperspace in ~ 1/53 standard packs, Hyperspace foil in ~ 1/181 standard packs
        legendaryVariants: {
            hyperspace: {
                inStandardPack: 1 / 53 // ~1.89% chance per pack
            },
            hyperspaceFoil: {
                inStandardPack: 1 / 181 // ~0.55% chance per pack
            }
        }
    },
    [DISTRIBUTION_PERIODS.A_LAWLESS_TIME_ONWARD]: {
        // Standard Foils: Eliminated entirely
        standardFoil: {
            inStandardPack: 0,
            inCarbonitePack: 0
        },
        // Hyperspace Foils: 1 in every standard pack, 6 in each Carbonite pack
        hyperspaceFoil: {
            inStandardPack: 1,
            inCarbonitePack: 6 // Fixed count
        },
        // Hyperspace: At least 1 in every standard pack, 8-9 in each Carbonite pack
        hyperspace: {
            inStandardPack: 1,
            inCarbonitePack: {
                min: 8,
                max: 9
            } // Random between 8-9
        },
        // Non-foil Prestige: In 1/18 standard packs, In Carbonite packs
        nonFoilPrestige: {
            inStandardPack: 1 / 18,
            inCarbonitePack: true
        },
        // Serialized Prestige: Only in Carbonite packs, Serialized X/250, X/100, X/50 cards
        serializedPrestige: {
            inStandardPack: 0,
            inCarbonitePack: true,
            serializationTypes: [
                'X/250',
                'X/100',
                'X/50'
            ]
        },
        // Showcase Leaders: In ~ 1/288 standard packs, In ~ 1/48 Carbonite packs
        showcaseLeader: {
            inStandardPack: 1 / 288,
            inCarbonitePack: 1 / 48 // ~2.08% chance per pack
        },
        // Rare Variants: Hyperspace in ~ 1/12 standard packs, Hyperspace foil in ~ 1/24 standard packs
        rareVariants: {
            hyperspace: {
                inStandardPack: 1 / 12 // ~8.33% chance per pack
            },
            hyperspaceFoil: {
                inStandardPack: 1 / 24 // ~4.17% chance per pack
            }
        },
        // Legendary Variants: Hyperspace in ~ 1/48 standard packs, Hyperspace foil in ~ 1/96 standard packs
        legendaryVariants: {
            hyperspace: {
                inStandardPack: 1 / 48 // ~2.08% chance per pack
            },
            hyperspaceFoil: {
                inStandardPack: 1 / 96 // ~1.04% chance per pack
            }
        }
    }
};
const SET_DISTRIBUTIONS = {
    'SOR': DISTRIBUTION_PERIODS.PRE_LAWLESS_TIME,
    'SHD': DISTRIBUTION_PERIODS.PRE_LAWLESS_TIME,
    'TWI': DISTRIBUTION_PERIODS.PRE_LAWLESS_TIME,
    'JTL': DISTRIBUTION_PERIODS.PRE_LAWLESS_TIME,
    'LOF': DISTRIBUTION_PERIODS.PRE_LAWLESS_TIME,
    'SEC': DISTRIBUTION_PERIODS.PRE_LAWLESS_TIME
};
const SETS_WITH_SPECIAL_IN_FOIL = [
    'LOF',
    'SEC'
] // Add future set 7 code here when available
;
function getDistributionForSet(setCode) {
    const period = SET_DISTRIBUTIONS[setCode] || DISTRIBUTION_PERIODS.PRE_LAWLESS_TIME;
    return RARITY_DISTRIBUTIONS[period];
}
function getDistributionPeriod(setCode) {
    return SET_DISTRIBUTIONS[setCode] || DISTRIBUTION_PERIODS.PRE_LAWLESS_TIME;
}
}),
"[project]/src/utils/boosterPack.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateBoosterPack",
    ()=>generateBoosterPack,
    "generateSealedPod",
    ()=>generateSealedPod
]);
// Booster pack generation logic based on:
// https://starwarsunlimited.com/articles/boosting-ahead-of-release
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rarityConfig$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/rarityConfig.js [app-ssr] (ecmascript)");
;
function generateBoosterPack(cards, setCode) {
    if (!cards || cards.length === 0) {
        return [];
    }
    // Get distribution configuration for this set
    const distribution = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rarityConfig$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDistributionForSet"])(setCode);
    const distributionPeriod = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rarityConfig$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDistributionPeriod"])(setCode);
    const isPreLawlessTime = distributionPeriod === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rarityConfig$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DISTRIBUTION_PERIODS"].PRE_LAWLESS_TIME;
    // Determine if this set allows Special rarity in foil slot (sets 5, 6, 7: LOF, SEC, and future set 7)
    const allowsSpecialInFoil = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rarityConfig$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SETS_WITH_SPECIAL_IN_FOIL"].includes(setCode);
    // Separate cards by type and rarity
    // IMPORTANT: Special rarity cards should NEVER appear in regular slots
    // They can ONLY appear in foil/hyperfoil slots (and only in specific sets)
    // Leaders: exclude Special rarity (Special leaders can only appear in foil slot)
    const leaders = cards.filter((card)=>card.isLeader && card.rarity !== 'Special');
    // Bases: exclude Special rarity (Special bases can only appear in foil slot)
    const bases = cards.filter((card)=>card.isBase && card.rarity !== 'Special');
    // Standard cards: exclude Special rarity (Special cards can only appear in foil slot)
    const standardCards = cards.filter((card)=>!card.isLeader && !card.isBase && card.rarity !== 'Special');
    // Separate bases by rarity (already filtered to exclude Special)
    const commonBases = bases.filter((card)=>card.rarity === 'Common');
    const rareBases = bases.filter((card)=>card.rarity === 'Rare');
    // Standard cards by rarity (already filtered to exclude Special)
    const commons = standardCards.filter((card)=>card.rarity === 'Common');
    const uncommons = standardCards.filter((card)=>card.rarity === 'Uncommon');
    const rares = standardCards.filter((card)=>card.rarity === 'Rare');
    const legendaries = standardCards.filter((card)=>card.rarity === 'Legendary');
    // Special rarity cards (only for foil slot in sets 4-6)
    const specials = cards.filter((card)=>card.rarity === 'Special');
    const pack = [];
    // Track selected card IDs to prevent duplicates (except foil and upgrade slot)
    // Use card name + set to identify duplicates (same card, different variants)
    const selectedCardNames = new Set();
    /**
   * Check if a card is a duplicate (same name and set)
   * Returns true if already selected (excluding foil and upgrade slot)
   */ const isDuplicate = (card)=>{
        const cardKey = `${card.name}-${card.set}`;
        return selectedCardNames.has(cardKey);
    };
    /**
   * Mark a card as selected
   */ const markSelected = (card)=>{
        const cardKey = `${card.name}-${card.set}`;
        selectedCardNames.add(cardKey);
    };
    /**
   * Select a random card from array, avoiding duplicates
   */ const randomSelectNoDuplicate = (array, maxAttempts = 100)=>{
        if (array.length === 0) return null;
        // Filter out duplicates
        const available = array.filter((card)=>!isDuplicate(card));
        if (available.length === 0) {
            // If all are duplicates, allow duplicate (shouldn't happen often)
            return randomSelect(array);
        }
        return randomSelect(available);
    };
    // 1. Guaranteed Leader (leaders can ONLY appear here)
    // Leaders have different drop rates: Common ~83% (5/6), Rare ~17% (1/6)
    // Note: Based on community data suggesting ~1 rare leader per 6 packs
    if (leaders.length > 0) {
        // Filter to normal leaders only (variants are separate cards)
        const normalLeaders = leaders.filter((l)=>l.variantType === 'Normal');
        const leaderPool = normalLeaders.length > 0 ? normalLeaders : leaders;
        // Separate by rarity for weighted selection
        const commonLeaders = leaderPool.filter((l)=>l.rarity === 'Common');
        const rareLeaders = leaderPool.filter((l)=>l.rarity === 'Rare' || l.rarity === 'Legendary');
        let leader = null;
        // Weighted selection: ~17% chance for rare, ~83% for common
        if (rareLeaders.length > 0 && commonLeaders.length > 0) {
            // Both types available - use weighted selection
            const isRare = Math.random() < 1 / 6 // ~17% chance for rare
            ;
            if (isRare) {
                leader = randomSelect(rareLeaders);
            } else {
                leader = randomSelect(commonLeaders);
            }
        } else if (rareLeaders.length > 0) {
            // Only rare leaders available
            leader = randomSelect(rareLeaders);
        } else if (commonLeaders.length > 0) {
            // Only common leaders available
            leader = randomSelect(commonLeaders);
        } else {
            // Fallback to any leader (shouldn't happen)
            leader = randomSelect(leaderPool);
        }
        if (leader) {
            markSelected(leader);
            const isShowcase = rollShowcase(distribution);
            const isHyperspace = rollHyperspace(distribution);
            let finalLeader = {
                ...leader
            };
            // If showcase, use showcase variant card
            if (isShowcase) {
                const showcaseCard = findVariantCard(leader, 'Showcase', cards);
                if (showcaseCard) {
                    finalLeader = showcaseCard;
                }
            } else if (isHyperspace) {
                const hyperspaceCard = findVariantCard(leader, 'Hyperspace', cards);
                if (hyperspaceCard) {
                    finalLeader = hyperspaceCard;
                }
            }
            pack.push({
                ...finalLeader,
                isFoil: false,
                isHyperspace: isHyperspace && !isShowcase,
                isShowcase: isShowcase
            });
        }
    }
    // 2. Guaranteed Base (common bases can ONLY appear here)
    // Note: Rare bases can appear in the rare slot, but we still need a base here
    // So the base slot always has a base (preferably common)
    if (commonBases.length > 0) {
        // Filter to normal bases only
        const normalCommonBases = commonBases.filter((b)=>b.variantType === 'Normal');
        const base = normalCommonBases.length > 0 ? randomSelectNoDuplicate(normalCommonBases) : randomSelectNoDuplicate(commonBases);
        if (base) {
            markSelected(base);
            const isHyperspace = rollHyperspace(distribution);
            let finalBase = {
                ...base
            };
            // If hyperspace, use hyperspace variant card
            if (isHyperspace) {
                const hyperspaceCard = findVariantCard(base, 'Hyperspace', cards);
                if (hyperspaceCard) {
                    finalBase = hyperspaceCard;
                }
            }
            pack.push({
                ...finalBase,
                isFoil: false,
                isHyperspace: isHyperspace
            });
        }
    } else if (bases.length > 0) {
        // Fallback if no common bases (shouldn't happen, but safety)
        // Exclude rare bases if possible, as they can appear in rare slot
        const nonRareBases = bases.filter((b)=>b.rarity !== 'Rare' && b.variantType === 'Normal');
        const base = nonRareBases.length > 0 ? randomSelectNoDuplicate(nonRareBases) : randomSelectNoDuplicate(bases.filter((b)=>b.variantType === 'Normal'));
        if (base) {
            markSelected(base);
            const isHyperspace = rollHyperspace(distribution);
            let finalBase = {
                ...base
            };
            if (isHyperspace) {
                const hyperspaceCard = findVariantCard(base, 'Hyperspace', cards);
                if (hyperspaceCard) {
                    finalBase = hyperspaceCard;
                }
            }
            pack.push({
                ...finalBase,
                isFoil: false,
                isHyperspace: isHyperspace
            });
        }
    }
    // 3. 9 Common cards (non-leader, non-base)
    // Filter to normal cards only
    const normalCommons = commons.filter((c)=>c.variantType === 'Normal');
    const commonsPool = normalCommons.length > 0 ? normalCommons : commons;
    for(let i = 0; i < 9 && commonsPool.length > 0; i++){
        const common = randomSelectNoDuplicate(commonsPool);
        if (!common) break; // No more available cards
        markSelected(common);
        const isHyperspace = rollHyperspace(distribution);
        let finalCommon = {
            ...common
        };
        // If hyperspace, use hyperspace variant card
        if (isHyperspace) {
            const hyperspaceCard = findVariantCard(common, 'Hyperspace', cards);
            if (hyperspaceCard) {
                finalCommon = hyperspaceCard;
            }
        }
        pack.push({
            ...finalCommon,
            isFoil: false,
            isHyperspace: isHyperspace
        });
    }
    // 4. 3 Uncommon cards (non-leader, non-base)
    // First 2 are always normal uncommons
    const normalUncommons = uncommons.filter((c)=>c.variantType === 'Normal');
    const uncommonsPool = normalUncommons.length > 0 ? normalUncommons : uncommons;
    for(let i = 0; i < 2 && uncommonsPool.length > 0; i++){
        const uncommon = randomSelectNoDuplicate(uncommonsPool);
        if (!uncommon) break; // No more available cards
        markSelected(uncommon);
        pack.push({
            ...uncommon,
            isFoil: false,
            isHyperspace: false
        });
    }
    // 3rd uncommon slot: Can be upgraded to Hyperspace variant of any rarity
    // Based on research: Hyperspace variants appear 2 in 3 packs overall
    // But Rare/Legendary hyperspace appear 1 in 15 packs (6.67%)
    // So Common/Uncommon hyperspace in upgrade slot would be: 66.67% - 6.67% = ~60%
    // However, the user says it's happening too frequently, so the upgrade slot rate may be lower
    // Let me use a more conservative rate: upgrade slot is hyperspace ~30-40% of the time
    // Within hyperspace upgrades, distribution based on research:
    // - Common: Most common
    // - Uncommon: Less common
    // - Rare: 1 in 15 packs = 6.67% of packs, but that's overall, not just upgrade slot
    // - Legendary: Very rare
    // More conservative: Upgrade slot is hyperspace ~25% of the time
    const isHyperspaceUpgrade = Math.random() < 0.25 // 25% chance for upgrade slot to be hyperspace
    ;
    if (isHyperspaceUpgrade) {
        // Upgrade slot: Hyperspace variant of any rarity (C, U, R, or L)
        // Distribution within hyperspace upgrades (approximate):
        // - Common: ~60% of hyperspace upgrades
        // - Uncommon: ~25% of hyperspace upgrades
        // - Rare: ~12% of hyperspace upgrades  
        // - Legendary: ~3% of hyperspace upgrades
        const upgradeRoll = Math.random();
        let upgradeCard = null;
        if (upgradeRoll < 0.60) {
            // ~60% - Common hyperspace
            const hyperspaceCommons = cards.filter((c)=>c.rarity === 'Common' && c.rarity !== 'Special' && c.variantType === 'Hyperspace' && !c.isLeader && !c.isBase);
            if (hyperspaceCommons.length > 0) {
                upgradeCard = randomSelect(hyperspaceCommons);
            }
        } else if (upgradeRoll < 0.60 + 0.25) {
            // ~25% - Uncommon hyperspace
            const hyperspaceUncommons = cards.filter((c)=>c.rarity === 'Uncommon' && c.rarity !== 'Special' && c.variantType === 'Hyperspace' && !c.isLeader && !c.isBase);
            if (hyperspaceUncommons.length > 0) {
                upgradeCard = randomSelect(hyperspaceUncommons);
            }
        } else if (upgradeRoll < 0.60 + 0.25 + 0.12) {
            // ~12% - Rare hyperspace
            const hyperspaceRares = cards.filter((c)=>c.rarity === 'Rare' && c.rarity !== 'Special' && c.variantType === 'Hyperspace' && !c.isLeader && !c.isBase);
            if (hyperspaceRares.length > 0) {
                upgradeCard = randomSelect(hyperspaceRares);
            }
        } else {
            // ~3% - Legendary hyperspace
            const hyperspaceLegendaries = cards.filter((c)=>c.rarity === 'Legendary' && c.rarity !== 'Special' && c.variantType === 'Hyperspace' && !c.isLeader && !c.isBase);
            if (hyperspaceLegendaries.length > 0) {
                upgradeCard = randomSelect(hyperspaceLegendaries);
            }
        }
        // Fallback: if no hyperspace card found, use normal uncommon
        // NOTE: Upgrade slot can be a duplicate, so don't check for duplicates here
        if (!upgradeCard && uncommonsPool.length > 0) {
            upgradeCard = randomSelect(uncommonsPool); // Allow duplicate in upgrade slot
            // Don't mark as selected - upgrade slot can be duplicate
            pack.push({
                ...upgradeCard,
                isFoil: false,
                isHyperspace: false
            });
        } else if (upgradeCard) {
            // Upgrade slot can be duplicate, so don't mark as selected
            pack.push({
                ...upgradeCard,
                isFoil: false,
                isHyperspace: true
            });
        }
    } else {
        // Normal 3rd uncommon (75% of packs)
        if (uncommonsPool.length > 0) {
            const uncommon = randomSelectNoDuplicate(uncommonsPool);
            if (uncommon) {
                markSelected(uncommon);
                pack.push({
                    ...uncommon,
                    isFoil: false,
                    isHyperspace: false
                });
            }
        }
    }
    // 5. 1 Rare or Legendary (can be rare base for sets 1-6)
    // Legendary appears ~1 in 8 packs (12.5% chance)
    const isLegendary = Math.random() < 0.125;
    let rareOrLegendary = null;
    if (isLegendary && legendaries.length > 0) {
        // Filter to normal legendaries only
        const normalLegendaries = legendaries.filter((l)=>l.variantType === 'Normal');
        rareOrLegendary = normalLegendaries.length > 0 ? randomSelectNoDuplicate(normalLegendaries) : randomSelectNoDuplicate(legendaries);
    } else {
        // Rare slot: can be rare card OR rare base (for sets 1-6)
        // Filter to normal rares only
        const normalRares = rares.filter((r)=>r.variantType === 'Normal');
        const rarePool = normalRares.length > 0 ? [
            ...normalRares
        ] : [
            ...rares
        ];
        // Add rare bases to the pool for sets 1-6 (normal variants only)
        if (rareBases.length > 0) {
            const normalRareBases = rareBases.filter((b)=>b.variantType === 'Normal');
            if (normalRareBases.length > 0) {
                rarePool.push(...normalRareBases);
            } else {
                rarePool.push(...rareBases);
            }
        }
        if (rarePool.length > 0) {
            rareOrLegendary = randomSelectNoDuplicate(rarePool);
        } else if (legendaries.length > 0) {
            // Fallback to legendary if no rares
            const normalLegendaries = legendaries.filter((l)=>l.variantType === 'Normal');
            rareOrLegendary = normalLegendaries.length > 0 ? randomSelectNoDuplicate(normalLegendaries) : randomSelectNoDuplicate(legendaries);
        }
    }
    if (rareOrLegendary) {
        markSelected(rareOrLegendary);
        const isHyperspace = rollHyperspace(distribution);
        let finalRare = {
            ...rareOrLegendary
        };
        // If hyperspace, use hyperspace variant card
        if (isHyperspace) {
            const hyperspaceCard = findVariantCard(rareOrLegendary, 'Hyperspace', cards);
            if (hyperspaceCard) {
                finalRare = hyperspaceCard;
            }
        }
        pack.push({
            ...finalRare,
            isFoil: false,
            isHyperspace: isHyperspace
        });
    }
    // 6. 1 Foil card (can be any rarity, including Special for sets 4-6)
    // Foil can be from any card pool (including bases, but NOT leaders)
    // BUT: Common bases CANNOT appear in foil slot
    // CRITICAL: Leaders CAN NEVER appear in foil slot (no foil or hyperfoil leaders)
    // Special rarity can ONLY appear in foil slot and ONLY in sets 4-6
    // Special should appear at roughly the same rate as rare cards would naturally
    let foilPool = [
        ...cards
    ];
    // Remove ALL leaders from foil pool (leaders CAN NEVER be foil or hyperfoil)
    foilPool = foilPool.filter((card)=>{
        // Explicitly exclude all leaders, regardless of any other property
        if (card.isLeader) {
            return false;
        }
        return true;
    });
    // Remove common bases from foil pool (common bases cannot be foil)
    foilPool = foilPool.filter((card)=>!(card.isBase && card.rarity === 'Common'));
    // Remove Special rarity cards if not in allowed sets
    if (!allowsSpecialInFoil) {
        foilPool = foilPool.filter((card)=>card.rarity !== 'Special');
    }
    if (foilPool.length > 0) {
        let foilCard = null;
        if (allowsSpecialInFoil && specials.length > 0) {
            // For sets 4-6, Special can appear in foil slot
            // Special should appear at roughly the same rate as rare cards in foil slot
            // Since rares are ~22% of sets 4-6, weight Special to appear ~20% of the time
            if (Math.random() < 0.20) {
                // ~20% chance to get Special in foil slot (similar to rare frequency)
                // Filter to normal Special cards only, and exclude leaders (leaders can NEVER be foil)
                const normalSpecials = specials.filter((s)=>s.variantType === 'Normal' && !s.isLeader);
                // Foil can be duplicate, so don't check for duplicates
                foilCard = normalSpecials.length > 0 ? randomSelect(normalSpecials) : randomSelect(specials.filter((s)=>!s.isLeader));
            } else {
                // Otherwise, random from all cards (excluding Special from natural selection)
                const nonSpecialPool = foilPool.filter((c)=>c.rarity !== 'Special' && c.variantType === 'Normal');
                // Foil can be duplicate, so don't check for duplicates
                foilCard = nonSpecialPool.length > 0 ? randomSelect(nonSpecialPool) : randomSelect(foilPool.filter((c)=>c.rarity !== 'Special'));
            }
        } else {
            // For sets 1-3, no Special cards in foil
            // Filter to normal cards only
            const normalPool = foilPool.filter((c)=>c.variantType === 'Normal');
            // Foil can be duplicate, so don't check for duplicates
            foilCard = normalPool.length > 0 ? randomSelect(normalPool) : randomSelect(foilPool);
        }
        if (foilCard) {
            // Foil slot can be duplicate, so don't mark as selected
            // Leaders cannot be in foil slot, so no showcase check needed
            // Determine foil type based on distribution period
            // Pre-A Lawless Time: 5/6 standard foil, 1/6 hyperspace foil
            // A Lawless Time Onward: Always hyperspace foil (100%)
            let isFoilHyperspace = false;
            if (isPreLawlessTime) {
                // Pre-A Lawless Time: Roll for foil type
                const foilRoll = Math.random();
                if (foilRoll < distribution.hyperspaceFoil.inStandardPack) {
                    // Hyperspace foil (~1/6 chance)
                    isFoilHyperspace = true;
                } else {
                    // Standard foil (~5/6 chance)
                    isFoilHyperspace = false;
                }
            } else {
                // A Lawless Time Onward: Always hyperspace foil
                isFoilHyperspace = true;
            }
            // For hyperspace foils, always use hyperspace variant if it exists
            let finalFoil = {
                ...foilCard
            };
            let isHyperspace = false;
            if (isFoilHyperspace) {
                // Hyperspace foil: try to find hyperspace variant
                const hyperspaceCard = findVariantCard(foilCard, 'Hyperspace', cards);
                if (hyperspaceCard && !hyperspaceCard.isLeader) {
                    // Only use variant if it's not a leader (leaders can NEVER be foil)
                    finalFoil = hyperspaceCard;
                    isHyperspace = true;
                }
            } else {
                // Standard foil: may still be hyperspace variant (rare case)
                // Use the normal hyperspace roll for standard foils
                isHyperspace = rollHyperspace(distribution);
                if (isHyperspace) {
                    const hyperspaceCard = findVariantCard(foilCard, 'Hyperspace', cards);
                    if (hyperspaceCard && !hyperspaceCard.isLeader) {
                        // Only use variant if it's not a leader (leaders can NEVER be foil)
                        finalFoil = hyperspaceCard;
                    } else {
                        // If variant is a leader, don't use it (keep original card)
                        isHyperspace = false;
                    }
                }
            }
            // Final safety check: NEVER allow leaders in foil slot
            // This should never happen if filtering is correct, but double-check
            if (finalFoil.isLeader) {
                console.error('CRITICAL ERROR: Attempted to add leader to foil slot!', finalFoil.name);
                // Skip this foil - this should never happen
                // In production, you might want to regenerate or skip the foil
                return pack // Return pack without foil rather than adding a leader
                ;
            }
            pack.push({
                ...finalFoil,
                isFoil: true,
                isHyperspace: isHyperspace,
                isShowcase: false
            });
        }
    }
    return pack;
}
function generateSealedPod(cards, setCode) {
    const packs = [];
    for(let i = 0; i < 6; i++){
        packs.push(generateBoosterPack(cards, setCode));
    }
    return packs;
}
/**
 * Randomly select an item from an array
 */ function randomSelect(array) {
    return array[Math.floor(Math.random() * array.length)];
}
/**
 * Roll for Hyperspace variant (for non-upgrade-slot cards)
 * Note: The upgrade slot (3rd uncommon) has its own hyperspace mechanics
 * Uses distribution config to determine rates based on set period
 * @param {Object} distribution - The distribution configuration for the set
 */ function rollHyperspace(distribution) {
    // Use config-based hyperspace rate
    // Pre-A Lawless Time: ~66.7% chance per pack (2/3 packs)
    // A Lawless Time Onward: Guaranteed at least 1 per pack (100%)
    // For individual non-upgrade-slot cards, we use a lower rate
    // Pre-A Lawless Time: ~2% per card (approximately 1 in 50)
    // A Lawless Time Onward: Higher rate since guaranteed in pack
    if (distribution === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rarityConfig$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RARITY_DISTRIBUTIONS"][__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rarityConfig$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DISTRIBUTION_PERIODS"].A_LAWLESS_TIME_ONWARD]) {
        // A Lawless Time Onward: Higher hyperspace rate
        // Since at least 1 hyperspace is guaranteed per pack, individual cards have higher chance
        return Math.random() < 0.05 // ~5% chance per card
        ;
    } else {
        // Pre-A Lawless Time: Lower hyperspace rate
        return Math.random() < 0.02 // ~2% chance per card
        ;
    }
}
/**
 * Roll for Showcase variant (leaders only)
 * Uses distribution config to determine rates based on set period
 * @param {Object} distribution - The distribution configuration for the set
 */ function rollShowcase(distribution) {
    // Showcase rate is the same for both periods in standard packs (1/288)
    // But differs in Carbonite packs (not applicable here)
    return Math.random() < distribution.showcaseLeader.inStandardPack;
}
/**
 * Find variant card (Hyperspace or Showcase) for a given card
 * @param {Object} baseCard - The base card
 * @param {string} variantType - 'Hyperspace' or 'Showcase'
 * @param {Array} allCards - All cards in the set
 * @returns {Object|null} The variant card or null if not found
 */ function findVariantCard(baseCard, variantType, allCards) {
    // Find variant card with same name, set, and variant type
    const variant = allCards.find((card)=>card.name === baseCard.name && card.set === baseCard.set && card.variantType === variantType && card.number !== baseCard.number // Different card number
    );
    return variant || null;
}
}),
"[project]/src/utils/textParser.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseCardText",
    ()=>parseCardText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
;
// Utility to parse card text and replace aspect symbols and styled numbers
/**
 * Get CSS-based icon for an aspect using the sprite sheet
 */ function getAspectSymbol(aspect, size = 'small') {
    const aspectMap = {
        'Command': 'command',
        'Villainy': 'villainy',
        'Heroism': 'heroism',
        'Cunning': 'cunning',
        'Vigilance': 'vigilance',
        'Aggression': 'aggression'
    };
    const aspectClass = aspectMap[aspect];
    if (!aspectClass) return null;
    const sizeClass = size === 'small' ? 'aspect-icon-small' : size === 'large' ? 'aspect-icon-large' : 'aspect-icon-medium';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `aspect-icon aspect-icon-${aspectClass} ${sizeClass}`,
        "aria-label": aspect
    }, void 0, false, {
        fileName: "[project]/src/utils/textParser.jsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
function parseCardText(text) {
    if (!text) return null;
    // Split by newlines to preserve line breaks
    const lines = text.split('\n');
    const result = [];
    lines.forEach((line, lineIndex)=>{
        if (lineIndex > 0) {
            result.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, `br-${lineIndex}`, false, {
                fileName: "[project]/src/utils/textParser.jsx",
                lineNumber: 42,
                columnNumber: 19
            }, this));
        }
        const parts = [];
        let lastIndex = 0;
        // Match patterns like [C=4 Command Villainy] or [C=3 Cunning] or [C=4]
        const pattern = /\[C=(\d+)(?:\s+([A-Za-z\s]+))?\]/g;
        let match;
        while((match = pattern.exec(line)) !== null){
            // Add text before the match
            if (match.index > lastIndex) {
                const textBefore = line.substring(lastIndex, match.index);
                if (textBefore) {
                    parts.push(textBefore);
                }
            }
            const number = match[1];
            const aspects = match[2] ? match[2].trim().split(/\s+/) : [];
            // Add opening bracket
            parts.push('[');
            // Add styled number
            parts.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "resource-number",
                children: number
            }, `num-${lineIndex}-${match.index}`, false, {
                fileName: "[project]/src/utils/textParser.jsx",
                lineNumber: 69,
                columnNumber: 9
            }, this));
            // Add aspect symbols
            if (aspects.length > 0) {
                aspects.forEach((aspect, idx)=>{
                    const symbol = getAspectSymbol(aspect);
                    if (symbol) {
                        parts.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "aspect-symbol-wrapper",
                            children: symbol
                        }, `aspect-${lineIndex}-${match.index}-${idx}`, false, {
                            fileName: "[project]/src/utils/textParser.jsx",
                            lineNumber: 80,
                            columnNumber: 15
                        }, this));
                    }
                    // Add space between aspects except for the last one
                    if (idx < aspects.length - 1) {
                        parts.push(' ');
                    }
                });
            }
            // Add closing bracket
            parts.push(']');
            lastIndex = pattern.lastIndex;
        }
        // Add remaining text
        if (lastIndex < line.length) {
            parts.push(line.substring(lastIndex));
        }
        // If no matches, add the whole line
        if (parts.length === 0) {
            parts.push(line);
        }
        result.push(...parts);
    });
    return result.length > 0 ? result : text;
}
}),
"[project]/src/utils/aspectColors.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ASPECT_COLORS",
    ()=>ASPECT_COLORS,
    "getAspectColor",
    ()=>getAspectColor,
    "getSingleAspectColor",
    ()=>getSingleAspectColor
]);
// Global aspect color mappings (SWU standard colors)
const ASPECT_COLORS = {
    'Vigilance': '#4A90E2',
    'Command': '#27AE60',
    'Aggression': '#E74C3C',
    'Cunning': '#F1C40F',
    'Villainy': '#9B59B6',
    'Heroism': '#E67E22' // Orange
};
/**
 * Converts hex color to RGB
 */ function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
/**
 * Converts RGB to hex color
 */ function rgbToHex(r, g, b) {
    return "#" + [
        r,
        g,
        b
    ].map((x)=>{
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}
/**
 * Lightens a color by a percentage (0-1)
 */ function lightenColor(hex, percent) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * percent));
    const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * percent));
    const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * percent));
    return rgbToHex(r, g, b);
}
/**
 * Darkens a color by a percentage (0-1)
 */ function darkenColor(hex, percent) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const r = Math.max(0, Math.round(rgb.r * (1 - percent)));
    const g = Math.max(0, Math.round(rgb.g * (1 - percent)));
    const b = Math.max(0, Math.round(rgb.b * (1 - percent)));
    return rgbToHex(r, g, b);
}
function getAspectColor(card) {
    if (!card || !card.aspects || card.aspects.length === 0) {
        return 'white';
    }
    const aspects = card.aspects;
    const hasHeroism = aspects.includes('Heroism');
    const hasVillainy = aspects.includes('Villainy');
    // Find the primary aspect (first non-Heroism/Villainy aspect, or first if only Heroism/Villainy)
    const primaryAspect = aspects.find((a)=>a !== 'Heroism' && a !== 'Villainy') || aspects[0];
    const baseColor = ASPECT_COLORS[primaryAspect] || 'white';
    // If only Heroism or Villainy, return their color
    if (aspects.length === 1) {
        return baseColor;
    }
    // Apply darkening/lightening for combinations
    if (hasVillainy && !hasHeroism) {
        // Villainy combination: darken by 25%
        return darkenColor(baseColor, 0.25);
    } else if (hasHeroism && !hasVillainy) {
        // Heroism combination: lighten by 20%
        return lightenColor(baseColor, 0.20);
    } else if (hasHeroism && hasVillainy) {
        // Both Heroism and Villainy: slight darken (10%) since Villainy takes precedence
        return darkenColor(baseColor, 0.10);
    }
    // Multiple aspects but no Heroism/Villainy: return first aspect color
    return baseColor;
}
function getSingleAspectColor(aspect) {
    return ASPECT_COLORS[aspect] || 'white';
}
;
}),
];

//# sourceMappingURL=src_utils_96a76e67._.js.map