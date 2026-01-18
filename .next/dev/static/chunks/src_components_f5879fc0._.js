(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/LandingPage.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function LandingPage({ onSealedClick }) {
    _s();
    const { user, loading, signIn } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    // Debug: Log auth state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LandingPage.useEffect": ()=>{
            console.log('LandingPage: Auth state - user:', user, 'loading:', loading);
        }
    }["LandingPage.useEffect"], [
        user,
        loading
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "landing-page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "landing-content",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: "Protect the Pod"
                    }, void 0, false, {
                        fileName: "[project]/src/components/LandingPage.jsx",
                        lineNumber: 18,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "subtitle",
                        children: [
                            "The Fan-Made Open Source",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/src/components/LandingPage.jsx",
                                lineNumber: 20,
                                columnNumber: 35
                            }, this),
                            "Star Wars Unlimited Limited Simulator"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/LandingPage.jsx",
                        lineNumber: 19,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mode-selection",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "mode-button sealed-button",
                                onClick: onSealedClick,
                                children: "Sealed"
                            }, void 0, false, {
                                fileName: "[project]/src/components/LandingPage.jsx",
                                lineNumber: 24,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "mode-button draft-button",
                                disabled: true,
                                children: [
                                    "Draft",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "coming-soon",
                                        children: "(Coming Soon)"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/LandingPage.jsx",
                                        lineNumber: 29,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/LandingPage.jsx",
                                lineNumber: 27,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/LandingPage.jsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this),
                    !loading && !user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "landing-login",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "landing-login-button",
                            onClick: signIn,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    width: "20",
                                    height: "20",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    xmlns: "http://www.w3.org/2000/svg",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
                                        fill: "currentColor"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/LandingPage.jsx",
                                        lineNumber: 42,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/LandingPage.jsx",
                                    lineNumber: 35,
                                    columnNumber: 15
                                }, this),
                                "Login with Discord"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/LandingPage.jsx",
                            lineNumber: 34,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/LandingPage.jsx",
                        lineNumber: 33,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/LandingPage.jsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "landing-disclaimer",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: "Protect the Pod is in no way affiliated with Disney or Fantasy Flight Games. Star Wars characters, cards, logos, and art are property of Disney and/or Fantasy Flight Games."
                }, void 0, false, {
                    fileName: "[project]/src/components/LandingPage.jsx",
                    lineNumber: 53,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/LandingPage.jsx",
                lineNumber: 52,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/LandingPage.jsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
_s(LandingPage, "ofGPPAoEi2+9sjC17PJEtPK7kGY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = LandingPage;
const __TURBOPACK__default__export__ = LandingPage;
var _c;
__turbopack_context__.k.register(_c, "LandingPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/SetSelection.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/api.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
function SetSelection({ onSetSelect, onBack }) {
    _s();
    const [sets, setSets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [imageFallbacks, setImageFallbacks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [failedImages, setFailedImages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [isVertical, setIsVertical] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Map set codes to their set numbers for sorting
    const getSetNumber = (setCode)=>{
        const setCodeMap = {
            'SOR': 1,
            'SHD': 2,
            'TWI': 3,
            'JTL': 4,
            'LOF': 5,
            'SEC': 6
        };
        return setCodeMap[setCode] || 999 // Unknown sets go to end
        ;
    };
    // Sort sets in display order: [7, 8, 9, 4, 5, 6, 1, 2, 3]
    // This creates the layout: Row 1: [7, 8, 9] or [4, 5, 6], Row 2: [1, 2, 3]
    // When vertical (single column), sort in reverse set number order (6, 5, 4, 3, 2, 1)
    const sortSetsForDisplay = (sets, vertical = false)=>{
        return [
            ...sets
        ].sort((a, b)=>{
            const numA = getSetNumber(a.code);
            const numB = getSetNumber(b.code);
            // When vertical, reverse order by set number
            if (vertical) {
                return numB - numA // Reverse: highest number first
                ;
            }
            // Define display order: [7, 8, 9, 4, 5, 6, 1, 2, 3]
            // Future-proof: when 7, 8, 9 come out, they'll be at the top
            const displayOrder = [
                7,
                8,
                9,
                4,
                5,
                6,
                1,
                2,
                3
            ];
            const indexA = displayOrder.indexOf(numA);
            const indexB = displayOrder.indexOf(numB);
            // If not in display order, put at end
            if (indexA === -1 && indexB === -1) return numA - numB;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    };
    // Check if we're in vertical (single column) mode
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SetSelection.useEffect": ()=>{
            const checkVertical = {
                "SetSelection.useEffect.checkVertical": ()=>{
                    setIsVertical(window.innerWidth <= 500);
                }
            }["SetSelection.useEffect.checkVertical"];
            checkVertical();
            window.addEventListener('resize', checkVertical);
            return ({
                "SetSelection.useEffect": ()=>window.removeEventListener('resize', checkVertical)
            })["SetSelection.useEffect"];
        }
    }["SetSelection.useEffect"], []);
    const [rawSets, setRawSets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SetSelection.useEffect": ()=>{
            const loadSets = {
                "SetSelection.useEffect.loadSets": async ()=>{
                    try {
                        setLoading(true);
                        const setsData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchSets"])();
                        setRawSets(setsData);
                    } catch (err) {
                        setError(err.message);
                    } finally{
                        setLoading(false);
                    }
                }
            }["SetSelection.useEffect.loadSets"];
            loadSets();
        }
    }["SetSelection.useEffect"], []);
    // Sort sets whenever rawSets or isVertical changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SetSelection.useEffect": ()=>{
            if (rawSets.length > 0) {
                const sortedSets = sortSetsForDisplay(rawSets, isVertical);
                setSets(sortedSets);
            }
        }
    }["SetSelection.useEffect"], [
        rawSets,
        isVertical
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "set-selection",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "loading"
            }, void 0, false, {
                fileName: "[project]/src/components/SetSelection.jsx",
                lineNumber: 94,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/SetSelection.jsx",
            lineNumber: 93,
            columnNumber: 7
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "set-selection",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "error",
                    children: [
                        "Error: ",
                        error
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/SetSelection.jsx",
                    lineNumber: 102,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onBack,
                    children: "Go Back"
                }, void 0, false, {
                    fileName: "[project]/src/components/SetSelection.jsx",
                    lineNumber: 103,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/SetSelection.jsx",
            lineNumber: 101,
            columnNumber: 7
        }, this);
    }
    const handleImageError = (setCode, e)=>{
        // Try fallback URLs if primary pack art fails
        const fallbacks = [
            `https://swudb.com/images/packs/${setCode.toLowerCase()}.jpg`,
            `https://swudb.com/images/booster/${setCode}.jpg`,
            `https://swudb.com/images/sets/${setCode}.jpg`
        ];
        const currentAttempt = imageFallbacks[setCode] || 0;
        if (currentAttempt < fallbacks.length) {
            // Try next fallback URL
            e.target.src = fallbacks[currentAttempt];
            setImageFallbacks((prev)=>({
                    ...prev,
                    [setCode]: currentAttempt + 1
                }));
        } else {
            // All fallbacks failed, mark as failed to show placeholder
            setFailedImages((prev)=>new Set([
                    ...prev,
                    setCode
                ]));
            e.target.style.display = 'none';
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "set-selection",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "back-button",
                onClick: onBack,
                children: "← Back"
            }, void 0, false, {
                fileName: "[project]/src/components/SetSelection.jsx",
                lineNumber: 131,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                children: "Select a Set"
            }, void 0, false, {
                fileName: "[project]/src/components/SetSelection.jsx",
                lineNumber: 134,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sets-grid",
                children: sets.map((set)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "set-card",
                        onClick: ()=>onSetSelect(set.code),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "set-image-container",
                                children: [
                                    set.imageUrl && !failedImages.has(set.code) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: set.imageUrl,
                                        alt: `${set.name} booster pack`,
                                        className: "set-image",
                                        onError: (e)=>handleImageError(set.code, e)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SetSelection.jsx",
                                        lineNumber: 144,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "set-image-placeholder",
                                        style: {
                                            display: !set.imageUrl || failedImages.has(set.code) ? 'flex' : 'none'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "placeholder-text",
                                                children: set.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SetSelection.jsx",
                                                lineNumber: 152,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "placeholder-code",
                                                children: set.code
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SetSelection.jsx",
                                                lineNumber: 153,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/SetSelection.jsx",
                                        lineNumber: 151,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/SetSelection.jsx",
                                lineNumber: 142,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "set-info",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    children: set.name
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SetSelection.jsx",
                                    lineNumber: 157,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SetSelection.jsx",
                                lineNumber: 156,
                                columnNumber: 13
                            }, this)
                        ]
                    }, set.code, true, {
                        fileName: "[project]/src/components/SetSelection.jsx",
                        lineNumber: 137,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/SetSelection.jsx",
                lineNumber: 135,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/SetSelection.jsx",
        lineNumber: 130,
        columnNumber: 5
    }, this);
}
_s(SetSelection, "JHHjBKdePDZGP66KeiIlMvdNXiI=");
_c = SetSelection;
const __TURBOPACK__default__export__ = SetSelection;
var _c;
__turbopack_context__.k.register(_c, "SetSelection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/CostIcon.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
// Reusable cost icon component
function CostIcon({ cost, size = 32 }) {
    if (cost === null || cost === undefined) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: `${size}px`,
            height: `${size}px`
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: "/icons/cost.png",
                alt: "Cost",
                style: {
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }
            }, void 0, false, {
                fileName: "[project]/src/components/CostIcon.jsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: `${Math.round(size * 0.625)}px`,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1
                },
                children: cost
            }, void 0, false, {
                fileName: "[project]/src/components/CostIcon.jsx",
                lineNumber: 19,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/CostIcon.jsx",
        lineNumber: 6,
        columnNumber: 5
    }, this);
}
_c = CostIcon;
const __TURBOPACK__default__export__ = CostIcon;
var _c;
__turbopack_context__.k.register(_c, "CostIcon");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/CardModal.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$textParser$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/textParser.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$CostIcon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/CostIcon.jsx [app-client] (ecmascript)");
;
;
;
;
;
;
// Get aspect symbol for modal using individual icon files (same as DeckBuilder)
const getAspectSymbol = (aspect, size = 'medium')=>{
    const aspectMap = {
        'Command': 'command',
        'Villainy': 'villainy',
        'Heroism': 'heroism',
        'Cunning': 'cunning',
        'Vigilance': 'vigilance',
        'Aggression': 'aggression'
    };
    const aspectName = aspectMap[aspect];
    if (!aspectName) return null;
    const sizeMap = {
        'small': 16,
        'medium': 32,
        'large': 48
    };
    const iconSize = sizeMap[size] || 32;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
        src: `/icons/${aspectName}.png`,
        alt: aspect,
        style: {
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            display: 'block'
        }
    }, void 0, false, {
        fileName: "[project]/src/components/CardModal.jsx",
        lineNumber: 30,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
function CardModal({ card, onClose }) {
    if (!card) return null;
    const hasBackImage = card.backImageUrl && card.isLeader;
    const getRarityColor = (rarity)=>{
        switch(rarity){
            case 'Common':
                return '#999';
            case 'Uncommon':
                return '#4CAF50';
            case 'Rare':
                return '#2196F3';
            case 'Legendary':
                return '#FF9800';
            default:
                return '#666';
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "modal-overlay",
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "modal-content",
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "modal-close",
                    onClick: onClose,
                    children: "×"
                }, void 0, false, {
                    fileName: "[project]/src/components/CardModal.jsx",
                    lineNumber: 61,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "modal-body",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "modal-image-container",
                            children: card.isLeader && hasBackImage ? // For leaders with back image, show both stacked vertically
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "modal-leader-images",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `modal-image-wrapper ${card.isFoil ? 'foil' : ''}`,
                                        children: card.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: card.imageUrl,
                                            alt: `${card.name || 'Card'} - Front`,
                                            className: "modal-card-image unrotated"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 70,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "modal-placeholder",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "modal-card-name",
                                                    children: card.name || 'Card'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 77,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "modal-card-rarity",
                                                    style: {
                                                        color: getRarityColor(card.rarity)
                                                    },
                                                    children: [
                                                        card.rarity,
                                                        " - Front"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 78,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 76,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/CardModal.jsx",
                                        lineNumber: 68,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `modal-image-wrapper ${card.isFoil ? 'foil' : ''}`,
                                        children: card.backImageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: card.backImageUrl,
                                            alt: `${card.name || 'Card'} - Back`,
                                            className: "modal-card-image unrotated"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 86,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "modal-placeholder",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "modal-card-name",
                                                    children: card.name || 'Card'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 93,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "modal-card-rarity",
                                                    style: {
                                                        color: getRarityColor(card.rarity)
                                                    },
                                                    children: [
                                                        card.rarity,
                                                        " - Back"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 94,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 92,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/CardModal.jsx",
                                        lineNumber: 84,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/CardModal.jsx",
                                lineNumber: 67,
                                columnNumber: 15
                            }, this) : // For non-leaders or leaders without back image, show single image
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `modal-image-wrapper ${card.isFoil ? 'foil' : ''}`,
                                children: card.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: card.imageUrl,
                                    alt: card.name || 'Card',
                                    className: `modal-card-image ${card.isLeader || card.isBase ? 'unrotated' : ''}`
                                }, void 0, false, {
                                    fileName: "[project]/src/components/CardModal.jsx",
                                    lineNumber: 105,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "modal-placeholder",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "modal-card-name",
                                            children: card.name || 'Card'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 112,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "modal-card-rarity",
                                            style: {
                                                color: getRarityColor(card.rarity)
                                            },
                                            children: card.rarity
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 113,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/CardModal.jsx",
                                    lineNumber: 111,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/CardModal.jsx",
                                lineNumber: 103,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/CardModal.jsx",
                            lineNumber: 64,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "modal-details",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "modal-title",
                                    children: card.name
                                }, void 0, false, {
                                    fileName: "[project]/src/components/CardModal.jsx",
                                    lineNumber: 123,
                                    columnNumber: 13
                                }, this),
                                card.subtitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "modal-subtitle",
                                    children: card.subtitle
                                }, void 0, false, {
                                    fileName: "[project]/src/components/CardModal.jsx",
                                    lineNumber: 124,
                                    columnNumber: 31
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "modal-stats",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "stat-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-label",
                                                    children: "Set:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 128,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-value",
                                                    children: card.set
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 129,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 127,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "stat-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-label",
                                                    children: "Rarity:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 133,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-value",
                                                    style: {
                                                        color: getRarityColor(card.rarity)
                                                    },
                                                    children: card.rarity
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 134,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 132,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "stat-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-label",
                                                    children: "Type:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 140,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-value",
                                                    children: card.type
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 141,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 139,
                                            columnNumber: 15
                                        }, this),
                                        card.aspects && card.aspects.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "stat-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-label",
                                                    children: "Aspects:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 146,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-value",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "modal-aspects",
                                                        children: card.aspects.map((aspect, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "aspect-symbol-wrapper",
                                                                children: getAspectSymbol(aspect, 'medium')
                                                            }, i, false, {
                                                                fileName: "[project]/src/components/CardModal.jsx",
                                                                lineNumber: 150,
                                                                columnNumber: 25
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/CardModal.jsx",
                                                        lineNumber: 148,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 147,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 145,
                                            columnNumber: 17
                                        }, this),
                                        card.cost !== null && card.cost !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "stat-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-label",
                                                    children: "Cost:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 161,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-value",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginLeft: '-5px'
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$CostIcon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            cost: card.cost,
                                                            size: 32
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/CardModal.jsx",
                                                            lineNumber: 164,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/CardModal.jsx",
                                                        lineNumber: 163,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 162,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 160,
                                            columnNumber: 17
                                        }, this),
                                        card.power !== null && card.power !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "stat-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-label",
                                                    children: "Power:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 172,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-value",
                                                    children: card.power
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 173,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 171,
                                            columnNumber: 17
                                        }, this),
                                        card.hp !== null && card.hp !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "stat-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-label",
                                                    children: "Health:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 179,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-value",
                                                    children: card.hp
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 180,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 178,
                                            columnNumber: 17
                                        }, this),
                                        card.traits && card.traits.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "stat-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-label",
                                                    children: "Traits:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 186,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-value",
                                                    children: card.traits.join(', ')
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 187,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 185,
                                            columnNumber: 17
                                        }, this),
                                        card.keywords && card.keywords.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "stat-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-label",
                                                    children: "Keywords:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 193,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-value",
                                                    children: card.keywords.join(', ')
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 194,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 192,
                                            columnNumber: 17
                                        }, this),
                                        card.unique && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "stat-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-label",
                                                    children: "Unique:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 200,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-value",
                                                    children: "Yes"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 201,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 199,
                                            columnNumber: 17
                                        }, this),
                                        card.frontText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "stat-row full-width",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-label",
                                                    children: "Text:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 207,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-value card-text",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$textParser$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseCardText"])(card.frontText) || card.frontText
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 208,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 206,
                                            columnNumber: 17
                                        }, this),
                                        card.backText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "stat-row full-width",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-label",
                                                    children: "Back Text:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 216,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-value card-text",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$textParser$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseCardText"])(card.backText) || card.backText
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 217,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 215,
                                            columnNumber: 17
                                        }, this),
                                        card.epicAction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "stat-row full-width",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-label",
                                                    children: "Epic Action:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 225,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-value card-text",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$textParser$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseCardText"])(card.epicAction) || card.epicAction
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 226,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 224,
                                            columnNumber: 17
                                        }, this),
                                        card.artist && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "stat-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-label",
                                                    children: "Artist:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 234,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-value",
                                                    children: card.artist
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 235,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 233,
                                            columnNumber: 17
                                        }, this),
                                        card.number && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "stat-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-label",
                                                    children: "Number:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 241,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "stat-value",
                                                    children: card.number
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CardModal.jsx",
                                                    lineNumber: 242,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CardModal.jsx",
                                            lineNumber: 240,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/CardModal.jsx",
                                    lineNumber: 126,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/CardModal.jsx",
                            lineNumber: 122,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/CardModal.jsx",
                    lineNumber: 63,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/CardModal.jsx",
            lineNumber: 60,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/CardModal.jsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
_c = CardModal;
const __TURBOPACK__default__export__ = CardModal;
var _c;
__turbopack_context__.k.register(_c, "CardModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/SealedPod.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cardCache$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/cardCache.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/api.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$boosterPack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/boosterPack.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rarityConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/rarityConfig.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$poolApi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/poolApi.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$setConfigs$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/setConfigs/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$packArt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/packArt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$CardModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/CardModal.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
;
;
// Helper function to get set name from set code
function getSetName(setCode) {
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$setConfigs$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSetConfig"])(setCode);
    return config?.setName || setCode;
}
// Helper function to get set color from set code
function getSetColor(setCode) {
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$setConfigs$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSetConfig"])(setCode);
    return config?.color || '#ffffff';
}
function SealedPod({ setCode, onBack, onBuildDeck, onPacksGenerated, initialPacks = null, shareId = null, poolType = 'sealed', setName = null, isLoading = false }) {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [cards, setCards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [packs, setPacks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedCard, setSelectedCard] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [hoveredCardPreview, setHoveredCardPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null) // { card, x, y } for enlarged preview
    ;
    const [savedShareId, setSavedShareId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(shareId);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const previewTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [tooltip, setTooltip] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        show: false,
        text: '',
        x: 0,
        y: 0
    });
    const tooltipTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SealedPod.useEffect": ()=>{
            // Skip loading cards if we have initialPacks (pool data from URL)
            if (initialPacks && initialPacks.length > 0) {
                // Extract cards from packs for card lookup/display purposes
                const allCardsFromPacks = initialPacks.flat();
                setCards(allCardsFromPacks);
                setError(null); // Clear any error since we have pool data
                setLoading(false);
                return;
            }
            const loadCards = {
                "SealedPod.useEffect.loadCards": async ()=>{
                    try {
                        setLoading(true);
                        // First try to get from cache (fast, no loading)
                        let cardsData = [];
                        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cardCache$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCacheInitialized"])()) {
                            cardsData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cardCache$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCachedCards"])(setCode);
                        }
                        // If cache doesn't have cards, try API as fallback
                        if (cardsData.length === 0) {
                            cardsData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchSetCards"])(setCode);
                        }
                        if (cardsData.length === 0) {
                            // Only set error if we don't have initialPacks (which means we have pool data)
                            // If we have initialPacks, we don't need cards from cache/API
                            if (!initialPacks || initialPacks.length === 0) {
                                setError(`No card data available for set ${setCode}. Please populate src/data/cards.json with card data.`);
                            }
                            setCards([]);
                        } else {
                            setCards(cardsData);
                        }
                    } catch (err) {
                        // Only set error if we don't have initialPacks
                        if (!initialPacks || initialPacks.length === 0) {
                            setError(err.message);
                        }
                        setCards([]);
                    } finally{
                        setLoading(false);
                    }
                }
            }["SealedPod.useEffect.loadCards"];
            loadCards();
        }
    }["SealedPod.useEffect"], [
        setCode,
        initialPacks
    ]);
    // Cleanup preview timeout
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SealedPod.useEffect": ()=>{
            return ({
                "SealedPod.useEffect": ()=>{
                    if (previewTimeoutRef.current) {
                        clearTimeout(previewTimeoutRef.current);
                    }
                    if (tooltipTimeoutRef.current) {
                        clearTimeout(tooltipTimeoutRef.current);
                    }
                }
            })["SealedPod.useEffect"];
        }
    }["SealedPod.useEffect"], []);
    // Tooltip handlers
    const showTooltip = (text, event)=>{
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
        }
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltip({
            show: true,
            text,
            x: rect.left,
            y: rect.top + rect.height / 2,
            alignLeft: true
        });
        // Auto-hide after 2 seconds
        tooltipTimeoutRef.current = setTimeout(()=>{
            setTooltip({
                show: false,
                text: '',
                x: 0,
                y: 0,
                alignLeft: false
            });
        }, 2000);
    };
    const hideTooltip = ()=>{
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
            tooltipTimeoutRef.current = null;
        }
        setTooltip({
            show: false,
            text: '',
            x: 0,
            y: 0,
            alignLeft: false
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SealedPod.useEffect": ()=>{
            // If initialPacks provided (from URL), use those
            if (initialPacks && initialPacks.length > 0) {
                setPacks(initialPacks);
                setLoading(false);
                return;
            }
            // Check if we have saved packs in sessionStorage
            const savedSealedPod = sessionStorage.getItem('sealedPod');
            if (savedSealedPod) {
                try {
                    const data = JSON.parse(savedSealedPod);
                    if (data.setCode === setCode && data.packs) {
                        setPacks(data.packs);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    console.error('Failed to load saved sealed pod:', e);
                }
            }
            // Generate new packs if no saved data
            if (cards.length > 0) {
                const generatedPacks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$boosterPack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateSealedPod"])(cards, setCode);
                setPacks(generatedPacks);
                // Notify parent to save
                if (onPacksGenerated) {
                    onPacksGenerated(generatedPacks, setCode);
                }
                // Auto-save to database if user is logged in
                autoSavePool(generatedPacks, setCode);
            }
        }
    }["SealedPod.useEffect"], [
        cards,
        setCode,
        onPacksGenerated,
        initialPacks
    ]);
    // Auto-save pool to database when packs are generated
    const autoSavePool = async (generatedPacks, setCode)=>{
        if (!user || savedShareId) {
            // Don't save if not logged in or already saved
            return;
        }
        try {
            setSaving(true);
            const allCards = generatedPacks.flat();
            const poolData = {
                setCode,
                cards: allCards,
                packs: generatedPacks,
                isPublic: false
            };
            const saved = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$poolApi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["savePool"])(poolData);
            setSavedShareId(saved.shareId);
            // Update URL without page reload
            const newUrl = `/pool/${saved.shareId}`;
            window.history.replaceState({}, '', newUrl);
            console.log('Pool saved:', saved.shareId);
        } catch (error) {
            console.error('Failed to auto-save pool:', error);
        // Don't show error to user - silent fail is okay
        } finally{
            setSaving(false);
        }
    };
    const getRarityColor = (rarity)=>{
        switch(rarity){
            case 'Common':
                return '#999';
            case 'Uncommon':
                return '#4CAF50';
            case 'Rare':
                return '#2196F3';
            case 'Legendary':
                return '#FF9800';
            default:
                return '#666';
        }
    };
    // Show loading placeholder for packs if isLoading prop is true
    const showPacksLoading = isLoading && (!packs || packs.length === 0);
    const packArtUrl = setCode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$packArt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPackArtUrl"])(setCode) : null;
    const setArtStyle = packArtUrl ? {
        backgroundImage: `url("${packArtUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat'
    } : {};
    // Only show full loading screen if we're loading cards AND don't have initialPacks
    if (loading && !initialPacks && !isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "sealed-pod",
            children: [
                packArtUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "set-art-header",
                    style: setArtStyle
                }, void 0, false, {
                    fileName: "[project]/src/components/SealedPod.jsx",
                    lineNumber: 228,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "sealed-pod-content",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "loading"
                    }, void 0, false, {
                        fileName: "[project]/src/components/SealedPod.jsx",
                        lineNumber: 231,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/SealedPod.jsx",
                    lineNumber: 230,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/SealedPod.jsx",
            lineNumber: 226,
            columnNumber: 7
        }, this);
    }
    // Don't show error if:
    // 1. We have initialPacks (pool data from URL)
    // 2. We're still loading (isLoading)
    // 3. We have packs already loaded
    // Only show error if we don't have packs AND we're not loading AND we don't have initialPacks
    if ((error || cards.length === 0) && (!packs || packs.length === 0) && !isLoading && !initialPacks) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "sealed-pod",
            children: [
                packArtUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "set-art-header",
                    style: setArtStyle
                }, void 0, false, {
                    fileName: "[project]/src/components/SealedPod.jsx",
                    lineNumber: 246,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "sealed-pod-content",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "back-button",
                            onClick: onBack,
                            children: "← Back to Sets"
                        }, void 0, false, {
                            fileName: "[project]/src/components/SealedPod.jsx",
                            lineNumber: 249,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "error",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    children: "No Card Data Available"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SealedPod.jsx",
                                    lineNumber: 253,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: error || `No cards found for set ${setCode}.`
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SealedPod.jsx",
                                    lineNumber: 254,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: [
                                        "To use this app, you need to populate ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            children: "src/data/cards.json"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SealedPod.jsx",
                                            lineNumber: 255,
                                            columnNumber: 54
                                        }, this),
                                        " with card data."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/SealedPod.jsx",
                                    lineNumber: 255,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "Each card should have the following structure:"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SealedPod.jsx",
                                    lineNumber: 256,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                    style: {
                                        textAlign: 'left',
                                        background: 'rgba(0,0,0,0.3)',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        overflow: 'auto'
                                    },
                                    children: `{
  "id": "unique-card-id",
  "name": "Card Name",
  "set": "SOR",
  "rarity": "Common",
  "type": "Unit",
  "aspects": ["Villainy", "Command"],
  "cost": 3,
  "isLeader": false,
  "isBase": false,
  "imageUrl": "https://..."
}`
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SealedPod.jsx",
                                    lineNumber: 257,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/SealedPod.jsx",
                            lineNumber: 252,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onBack,
                            children: "Go Back"
                        }, void 0, false, {
                            fileName: "[project]/src/components/SealedPod.jsx",
                            lineNumber: 272,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/SealedPod.jsx",
                    lineNumber: 248,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/SealedPod.jsx",
            lineNumber: 244,
            columnNumber: 7
        }, this);
    }
    const handleRefresh = ()=>{
        // Navigate to /pools/new?set=SETCODE to generate a new pool
        if (setCode) {
            window.location.href = `/pools/new?set=${setCode}`;
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "sealed-pod",
        children: [
            packArtUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "set-art-header",
                style: setArtStyle
            }, void 0, false, {
                fileName: "[project]/src/components/SealedPod.jsx",
                lineNumber: 288,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sealed-pod-content",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "top-buttons",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "back-button",
                                onClick: onBack,
                                children: "← Back to Sets"
                            }, void 0, false, {
                                fileName: "[project]/src/components/SealedPod.jsx",
                                lineNumber: 292,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "refresh-button",
                                onClick: handleRefresh,
                                title: "Refresh Pool",
                                "aria-label": "Refresh Pool",
                                children: "↻"
                            }, void 0, false, {
                                fileName: "[project]/src/components/SealedPod.jsx",
                                lineNumber: 295,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/SealedPod.jsx",
                        lineNumber: 291,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sealed-pod-header",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                children: poolType === 'draft' ? 'Draft Pod' : 'Sealed Pod'
                            }, void 0, false, {
                                fileName: "[project]/src/components/SealedPod.jsx",
                                lineNumber: 305,
                                columnNumber: 9
                            }, this),
                            saving && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "saving-indicator"
                            }, void 0, false, {
                                fileName: "[project]/src/components/SealedPod.jsx",
                                lineNumber: 308,
                                columnNumber: 20
                            }, this),
                            packs.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "build-deck-button",
                                onClick: ()=>{
                                    const allCards = packs.flat();
                                    if (savedShareId) {
                                        // Navigate to deck builder with share ID
                                        window.location.href = `/pool/${savedShareId}/deck`;
                                    } else {
                                        onBuildDeck(allCards, setCode);
                                    }
                                },
                                children: "Build Deck"
                            }, void 0, false, {
                                fileName: "[project]/src/components/SealedPod.jsx",
                                lineNumber: 310,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/SealedPod.jsx",
                        lineNumber: 304,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "packs-container",
                        children: showPacksLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "loading"
                        }, void 0, false, {
                            fileName: "[project]/src/components/SealedPod.jsx",
                            lineNumber: 329,
                            columnNumber: 11
                        }, this) : packs.map((pack, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pack-details",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        children: [
                                            "Pack ",
                                            index + 1
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/SealedPod.jsx",
                                        lineNumber: 333,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "cards-grid",
                                        children: pack.map((card, cardIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `card-item ${card.isLeader ? 'leader' : ''} ${card.isBase ? 'base' : ''} ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''}`,
                                                onClick: ()=>setSelectedCard(card),
                                                onMouseEnter: (e)=>{
                                                    // Clear any existing timeout
                                                    if (previewTimeoutRef.current) {
                                                        clearTimeout(previewTimeoutRef.current);
                                                    }
                                                    // Capture the rect immediately (before timeout)
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    // Set timeout to show preview after 1 second
                                                    previewTimeoutRef.current = setTimeout(()=>{
                                                        // Position the preview near the card (to the right, or left if too close to right edge)
                                                        let previewX = rect.right + 20;
                                                        const previewY = rect.top;
                                                        // Calculate preview dimensions based on card type
                                                        // Leaders and bases are landscape: 168px x 120px, so 3x = 504px x 360px
                                                        // Regular cards are portrait: 120px x 168px, so 3x = 360px x 504px
                                                        // Leaders with back: front horizontal (504x360) + back vertical (360x504) side by side
                                                        const isHorizontal = card.isLeader || card.isBase;
                                                        const hasBackImage = card.backImageUrl && card.isLeader;
                                                        let previewWidth, previewHeight;
                                                        if (hasBackImage) {
                                                            // Leader with back: side by side (horizontal front + vertical back)
                                                            previewWidth = 504 + 360 + 20; // 504px front + 360px back + 20px gap
                                                            previewHeight = 504; // Max height (vertical back is 504px)
                                                        } else {
                                                            previewWidth = isHorizontal ? 504 : 360;
                                                            previewHeight = isHorizontal ? 360 : 504;
                                                        }
                                                        // Ensure preview stays within viewport bounds
                                                        // Check right edge
                                                        if (previewX + previewWidth > window.innerWidth) {
                                                            // Try positioning to the left of the card
                                                            previewX = rect.left - previewWidth - 20;
                                                            // If still off screen to the left, clamp to left edge
                                                            if (previewX < 0) {
                                                                previewX = 10; // Small margin from left edge
                                                            }
                                                        }
                                                        // Check left edge
                                                        if (previewX < 0) {
                                                            previewX = 10; // Small margin from left edge
                                                        }
                                                        // Adjust vertical position to keep preview within viewport
                                                        // previewY is the center point (due to translateY(-50%))
                                                        const previewTop = previewY - previewHeight / 2;
                                                        const previewBottom = previewY + previewHeight / 2;
                                                        let adjustedY = previewY;
                                                        // Check top edge
                                                        if (previewTop < 0) {
                                                            adjustedY = previewHeight / 2 + 10; // Position so top is 10px from top
                                                        }
                                                        // Check bottom edge
                                                        if (previewBottom > window.innerHeight) {
                                                            adjustedY = window.innerHeight - previewHeight / 2 - 10; // Position so bottom is 10px from bottom
                                                        }
                                                        setHoveredCardPreview({
                                                            card,
                                                            x: previewX,
                                                            y: adjustedY
                                                        });
                                                    }, 1000);
                                                },
                                                onMouseLeave: ()=>{
                                                    if (previewTimeoutRef.current) {
                                                        clearTimeout(previewTimeoutRef.current);
                                                        previewTimeoutRef.current = null;
                                                    }
                                                    setHoveredCardPreview(null);
                                                },
                                                children: [
                                                    card.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: card.imageUrl,
                                                        alt: card.name || 'Card',
                                                        className: "card-image"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SealedPod.jsx",
                                                        lineNumber: 415,
                                                        columnNumber: 21
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "card-placeholder",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "card-name",
                                                                children: card.name || 'Card'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SealedPod.jsx",
                                                                lineNumber: 422,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "card-rarity",
                                                                style: {
                                                                    color: getRarityColor(card.rarity)
                                                                },
                                                                children: card.rarity
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SealedPod.jsx",
                                                                lineNumber: 423,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/SealedPod.jsx",
                                                        lineNumber: 421,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "card-badges",
                                                        children: card.isShowcase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "badge showcase-badge",
                                                            children: "Showcase"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 429,
                                                            columnNumber: 41
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SealedPod.jsx",
                                                        lineNumber: 428,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, cardIndex, true, {
                                                fileName: "[project]/src/components/SealedPod.jsx",
                                                lineNumber: 336,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SealedPod.jsx",
                                        lineNumber: 334,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, index, true, {
                                fileName: "[project]/src/components/SealedPod.jsx",
                                lineNumber: 332,
                                columnNumber: 11
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/SealedPod.jsx",
                        lineNumber: 327,
                        columnNumber: 7
                    }, this),
                    packs.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rate-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "Pack Rate Card"
                            }, void 0, false, {
                                fileName: "[project]/src/components/SealedPod.jsx",
                                lineNumber: 442,
                                columnNumber: 11
                            }, this),
                            (()=>{
                                // Analyze all packs
                                const stats = {
                                    totalPacks: packs.length,
                                    rarityCounts: {
                                        Legendary: 0,
                                        Rare: 0,
                                        Uncommon: 0,
                                        Common: 0,
                                        Special: 0
                                    },
                                    hyperspaceCount: 0,
                                    foilCount: 0,
                                    hyperspaceFoilCount: 0,
                                    showcaseCount: 0,
                                    upgradeSlotHyperspace: 0,
                                    foilPositions: [],
                                    specialRarity: {
                                        inFoilSlot: 0,
                                        inFoilSlotStandard: 0,
                                        inFoilSlotHyperspace: 0,
                                        inUpgradeSlot: 0
                                    },
                                    leaders: {
                                        total: 0,
                                        common: 0,
                                        rare: 0,
                                        legendary: 0
                                    },
                                    foilSlotRarities: {
                                        Legendary: 0,
                                        Rare: 0,
                                        Uncommon: 0,
                                        Common: 0,
                                        Special: 0
                                    },
                                    upgradeSlotRarities: {
                                        Legendary: 0,
                                        Rare: 0,
                                        Uncommon: 0,
                                        Common: 0,
                                        Special: 0
                                    }
                                };
                                packs.forEach((pack, packIndex)=>{
                                    let uncommonCount = 0;
                                    let nonLeaderBaseFoilCount = 0;
                                    pack.forEach((card, cardIndex)=>{
                                        // Count rarities
                                        if (card.rarity) {
                                            stats.rarityCounts[card.rarity] = (stats.rarityCounts[card.rarity] || 0) + 1;
                                        }
                                        // Count leaders
                                        if (card.isLeader) {
                                            stats.leaders.total++;
                                            if (card.rarity === 'Common') {
                                                stats.leaders.common++;
                                            } else if (card.rarity === 'Rare') {
                                                stats.leaders.rare++;
                                            } else if (card.rarity === 'Legendary') {
                                                stats.leaders.legendary++;
                                            }
                                        }
                                        // Count hyperspace
                                        if (card.isHyperspace) {
                                            stats.hyperspaceCount++;
                                        }
                                        // Count foils and track foil slot rarities
                                        if (card.isFoil) {
                                            stats.foilCount++;
                                            if (card.isHyperspace) {
                                                stats.hyperspaceFoilCount++;
                                            }
                                            // Track rarity distribution in foil slot
                                            if (card.rarity) {
                                                stats.foilSlotRarities[card.rarity] = (stats.foilSlotRarities[card.rarity] || 0) + 1;
                                            }
                                            stats.foilPositions.push({
                                                pack: packIndex + 1,
                                                position: cardIndex + 1,
                                                rarity: card.rarity,
                                                isHyperspace: card.isHyperspace,
                                                name: card.name
                                            });
                                        }
                                        // Check for showcase
                                        if (card.isShowcase) {
                                            stats.showcaseCount++;
                                        }
                                        // Track non-leader, non-base, non-foil cards
                                        // The upgrade slot is around position 13-14 (after 1 leader, 1 base, 9 commons, 2 uncommons)
                                        if (!card.isLeader && !card.isBase && !card.isFoil) {
                                            nonLeaderBaseFoilCount++;
                                            // The upgrade slot is typically the 13th card (position 12 in 0-indexed)
                                            // It can be a hyperspace variant of any rarity
                                            if (nonLeaderBaseFoilCount === 12) {
                                                // This is the upgrade slot
                                                if (card.isHyperspace) {
                                                    stats.upgradeSlotHyperspace++;
                                                    // Track rarity distribution only for hyperspace upgrade slots
                                                    if (card.rarity) {
                                                        stats.upgradeSlotRarities[card.rarity] = (stats.upgradeSlotRarities[card.rarity] || 0) + 1;
                                                        // Track Special rarity in upgrade slot
                                                        if (card.rarity === 'Special') {
                                                            stats.specialRarity.inUpgradeSlot++;
                                                        }
                                                    }
                                                }
                                            }
                                            // Also track uncommons for reference
                                            if (card.rarity === 'Uncommon') {
                                                uncommonCount++;
                                            }
                                        }
                                        // Track Special rarity in foil slot
                                        if (card.rarity === 'Special' && card.isFoil) {
                                            stats.specialRarity.inFoilSlot++;
                                            if (card.isHyperspace) {
                                                stats.specialRarity.inFoilSlotHyperspace++;
                                            } else {
                                                stats.specialRarity.inFoilSlotStandard++;
                                            }
                                        }
                                    });
                                });
                                const distributionPeriod = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rarityConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDistributionPeriod"])(setCode);
                                const isPreLawlessTime = distributionPeriod === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rarityConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DISTRIBUTION_PERIODS"].PRE_LAWLESS_TIME;
                                const allowsSpecial = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rarityConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["allowsSpecialInFoil"])(setCode);
                                // Format foil rate
                                const foilRatePercent = stats.foilCount / stats.totalPacks * 100;
                                const foilRateText = foilRatePercent === 100 ? `1 foil per pack` : `${stats.foilCount} foils in ${stats.totalPacks} packs (${foilRatePercent.toFixed(1)}% per pack)`;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rate-card-content",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rate-card-section",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: "Pack Structure"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 574,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: "Each pack contains: 1 Leader, 1 Base, 9 Commons, 3 Uncommons, 1 Rare/Legendary, 1 Foil"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 575,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: "Total: 16 cards per pack"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 576,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SealedPod.jsx",
                                            lineNumber: 573,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rate-card-section",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: "Leader Distribution"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 580,
                                                    columnNumber: 19
                                                }, this),
                                                stats.leaders.total > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "Common Leaders:"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 583,
                                                                    columnNumber: 26
                                                                }, this),
                                                                " ",
                                                                stats.leaders.common,
                                                                " (",
                                                                (stats.leaders.common / stats.leaders.total * 100).toFixed(1),
                                                                "%, ~83.3% expected)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 583,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "Rare/Legendary Leaders:"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 584,
                                                                    columnNumber: 26
                                                                }, this),
                                                                " ",
                                                                stats.leaders.rare + stats.leaders.legendary,
                                                                " (",
                                                                ((stats.leaders.rare + stats.leaders.legendary) / stats.leaders.total * 100).toFixed(1),
                                                                "%, ~16.7% expected)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 584,
                                                            columnNumber: 23
                                                        }, this),
                                                        stats.leaders.legendary > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            style: {
                                                                marginLeft: '1em',
                                                                fontSize: '0.9em',
                                                                opacity: 0.8
                                                            },
                                                            children: [
                                                                "Including ",
                                                                stats.leaders.legendary,
                                                                " Legendary leader(s)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 586,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SealedPod.jsx",
                                            lineNumber: 579,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rate-card-section",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: [
                                                        "Rarity Distribution (across all ",
                                                        stats.totalPacks,
                                                        " packs)"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 593,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "rarity-stats",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "Legendary (L):"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 595,
                                                                    columnNumber: 26
                                                                }, this),
                                                                " ",
                                                                stats.rarityCounts.Legendary,
                                                                " (",
                                                                (stats.rarityCounts.Legendary / (stats.totalPacks * 16) * 100).toFixed(1),
                                                                "% observed, ~6.25% expected)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 595,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "Rare (R):"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 596,
                                                                    columnNumber: 26
                                                                }, this),
                                                                " ",
                                                                stats.rarityCounts.Rare,
                                                                " (",
                                                                (stats.rarityCounts.Rare / (stats.totalPacks * 16) * 100).toFixed(1),
                                                                "% observed, ~6.25% expected)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 596,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "Uncommon (U):"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 597,
                                                                    columnNumber: 26
                                                                }, this),
                                                                " ",
                                                                stats.rarityCounts.Uncommon,
                                                                " (",
                                                                (stats.rarityCounts.Uncommon / (stats.totalPacks * 16) * 100).toFixed(1),
                                                                "% observed, ~18.75% expected)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 597,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "Common (C):"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 598,
                                                                    columnNumber: 26
                                                                }, this),
                                                                " ",
                                                                stats.rarityCounts.Common,
                                                                " (",
                                                                (stats.rarityCounts.Common / (stats.totalPacks * 16) * 100).toFixed(1),
                                                                "% observed, ~56.25% expected)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 598,
                                                            columnNumber: 21
                                                        }, this),
                                                        stats.rarityCounts.Special > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "Special (S):"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 600,
                                                                    columnNumber: 28
                                                                }, this),
                                                                " ",
                                                                stats.rarityCounts.Special,
                                                                " (",
                                                                (stats.rarityCounts.Special / (stats.totalPacks * 16) * 100).toFixed(1),
                                                                "% observed, ~0.1% expected)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 600,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 594,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SealedPod.jsx",
                                            lineNumber: 592,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rate-card-section",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: "Foil Information"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 606,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: "Foil Rate:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 607,
                                                            columnNumber: 22
                                                        }, this),
                                                        " ",
                                                        foilRateText
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 607,
                                                    columnNumber: 19
                                                }, this),
                                                isPreLawlessTime ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "Standard Foil:"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 610,
                                                                    columnNumber: 26
                                                                }, this),
                                                                " ",
                                                                stats.foilCount - stats.hyperspaceFoilCount,
                                                                " (",
                                                                ((stats.foilCount - stats.hyperspaceFoilCount) / stats.foilCount * 100).toFixed(1),
                                                                "% of foils, ~83.3% expected)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 610,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "Hyperspace Foil:"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 611,
                                                                    columnNumber: 26
                                                                }, this),
                                                                " ",
                                                                stats.hyperspaceFoilCount,
                                                                " (",
                                                                (stats.hyperspaceFoilCount / stats.foilCount * 100).toFixed(1),
                                                                "% of foils, ~16.7% expected)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 611,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: "Hyperspace Foil:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 614,
                                                            columnNumber: 24
                                                        }, this),
                                                        " ",
                                                        stats.hyperspaceFoilCount,
                                                        " (100% expected - all foils are hyperspace)"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 614,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    style: {
                                                        marginTop: '0.75em'
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Foil Slot Rarity Distribution:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SealedPod.jsx",
                                                        lineNumber: 617,
                                                        columnNumber: 54
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 617,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                    style: {
                                                        marginTop: '0.25em',
                                                        marginLeft: '1.5em'
                                                    },
                                                    children: [
                                                        stats.foilSlotRarities.Legendary > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: [
                                                                "Legendary (L): ",
                                                                stats.foilSlotRarities.Legendary,
                                                                " (",
                                                                (stats.foilSlotRarities.Legendary / stats.foilCount * 100).toFixed(1),
                                                                "% observed)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 620,
                                                            columnNumber: 23
                                                        }, this),
                                                        stats.foilSlotRarities.Rare > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: [
                                                                "Rare (R): ",
                                                                stats.foilSlotRarities.Rare,
                                                                " (",
                                                                (stats.foilSlotRarities.Rare / stats.foilCount * 100).toFixed(1),
                                                                "% observed)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 623,
                                                            columnNumber: 23
                                                        }, this),
                                                        stats.foilSlotRarities.Uncommon > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: [
                                                                "Uncommon (U): ",
                                                                stats.foilSlotRarities.Uncommon,
                                                                " (",
                                                                (stats.foilSlotRarities.Uncommon / stats.foilCount * 100).toFixed(1),
                                                                "% observed)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 626,
                                                            columnNumber: 23
                                                        }, this),
                                                        stats.foilSlotRarities.Common > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: [
                                                                "Common (C): ",
                                                                stats.foilSlotRarities.Common,
                                                                " (",
                                                                (stats.foilSlotRarities.Common / stats.foilCount * 100).toFixed(1),
                                                                "% observed)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 629,
                                                            columnNumber: 23
                                                        }, this),
                                                        stats.foilSlotRarities.Special > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: [
                                                                "Special (S): ",
                                                                stats.foilSlotRarities.Special,
                                                                " (",
                                                                (stats.foilSlotRarities.Special / stats.foilCount * 100).toFixed(1),
                                                                "% observed)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 632,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 618,
                                                    columnNumber: 19
                                                }, this),
                                                allowsSpecial && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    style: {
                                                        marginTop: '0.5em',
                                                        fontSize: '0.9em',
                                                        fontStyle: 'italic',
                                                        opacity: 0.9
                                                    },
                                                    children: "Special rarity (S) can appear in foil/hyperfoil slots (~1-2% of foils when applicable)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 636,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SealedPod.jsx",
                                            lineNumber: 605,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rate-card-section",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: "Hyperspace Variants"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 643,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: "Total Hyperspace Cards:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 644,
                                                            columnNumber: 22
                                                        }, this),
                                                        " ",
                                                        stats.hyperspaceCount,
                                                        " (",
                                                        (stats.hyperspaceCount / (stats.totalPacks * 16) * 100).toFixed(1),
                                                        "% of all cards)"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 644,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: "Hyperspace Rate:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 645,
                                                            columnNumber: 22
                                                        }, this),
                                                        " ",
                                                        (stats.hyperspaceCount / stats.totalPacks).toFixed(1),
                                                        " per pack (~66.7% expected per pack)"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 645,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SealedPod.jsx",
                                            lineNumber: 642,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rate-card-section",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: [
                                                        "Uncommon Upgrade Slot - ",
                                                        getSetName(setCode)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 649,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: "The 3rd Uncommon slot can be upgraded to a Hyperspace variant of any rarity."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 650,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: "Upgrade Slot Hyperspace:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 651,
                                                            columnNumber: 22
                                                        }, this),
                                                        " ",
                                                        stats.upgradeSlotHyperspace,
                                                        " out of ",
                                                        stats.totalPacks,
                                                        " packs (",
                                                        (stats.upgradeSlotHyperspace / stats.totalPacks * 100).toFixed(1),
                                                        "%, ~25% expected)"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 651,
                                                    columnNumber: 19
                                                }, this),
                                                stats.upgradeSlotHyperspace > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            style: {
                                                                marginTop: '0.75em'
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                children: "Upgrade Slot Rarity Distribution (when hyperspace):"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SealedPod.jsx",
                                                                lineNumber: 655,
                                                                columnNumber: 58
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 655,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                            style: {
                                                                marginTop: '0.25em',
                                                                marginLeft: '1.5em'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                    children: [
                                                                        "Legendary (L): ",
                                                                        stats.upgradeSlotRarities.Legendary || 0,
                                                                        " (",
                                                                        stats.upgradeSlotHyperspace > 0 ? ((stats.upgradeSlotRarities.Legendary || 0) / stats.upgradeSlotHyperspace * 100).toFixed(1) : 0,
                                                                        "% observed, ~3% expected)"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 657,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                    children: [
                                                                        "Rare (R): ",
                                                                        stats.upgradeSlotRarities.Rare || 0,
                                                                        " (",
                                                                        stats.upgradeSlotHyperspace > 0 ? ((stats.upgradeSlotRarities.Rare || 0) / stats.upgradeSlotHyperspace * 100).toFixed(1) : 0,
                                                                        "% observed, ~12% expected)"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 658,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                    children: [
                                                                        "Uncommon (U): ",
                                                                        stats.upgradeSlotRarities.Uncommon || 0,
                                                                        " (",
                                                                        stats.upgradeSlotHyperspace > 0 ? ((stats.upgradeSlotRarities.Uncommon || 0) / stats.upgradeSlotHyperspace * 100).toFixed(1) : 0,
                                                                        "% observed, ~25% expected)"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 659,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                    children: [
                                                                        "Common (C): ",
                                                                        stats.upgradeSlotRarities.Common || 0,
                                                                        " (",
                                                                        stats.upgradeSlotHyperspace > 0 ? ((stats.upgradeSlotRarities.Common || 0) / stats.upgradeSlotHyperspace * 100).toFixed(1) : 0,
                                                                        "% observed, ~60% expected)"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 660,
                                                                    columnNumber: 25
                                                                }, this),
                                                                stats.upgradeSlotRarities.Special > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                    children: [
                                                                        "Special (S): ",
                                                                        stats.upgradeSlotRarities.Special,
                                                                        " (",
                                                                        (stats.upgradeSlotRarities.Special / stats.upgradeSlotHyperspace * 100).toFixed(1),
                                                                        "% observed)"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 662,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 656,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true),
                                                !allowsSpecial && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    style: {
                                                        marginTop: '0.5em',
                                                        fontSize: '0.9em',
                                                        fontStyle: 'italic',
                                                        opacity: 0.9
                                                    },
                                                    children: "Special (S) does not appear in upgrade slot (only in foil/hyperfoil slots)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 668,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SealedPod.jsx",
                                            lineNumber: 648,
                                            columnNumber: 17
                                        }, this),
                                        stats.showcaseCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rate-card-section",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: "Showcase Leaders"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 676,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: "Showcase Count:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 677,
                                                            columnNumber: 24
                                                        }, this),
                                                        " ",
                                                        stats.showcaseCount,
                                                        " (",
                                                        (stats.showcaseCount / stats.totalPacks * 100).toFixed(2),
                                                        "%, ~0.35% expected per pack)"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 677,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SealedPod.jsx",
                                            lineNumber: 675,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rate-card-section",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: "Special Rarity (S)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 682,
                                                    columnNumber: 19
                                                }, this),
                                                allowsSpecial ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        stats.specialRarity.inFoilSlot > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                            children: "Foil Slot:"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                                            lineNumber: 688,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        " ",
                                                                        stats.specialRarity.inFoilSlot,
                                                                        " out of ",
                                                                        stats.foilCount,
                                                                        " foils (",
                                                                        (stats.specialRarity.inFoilSlot / stats.foilCount * 100).toFixed(2),
                                                                        "% observed, ~1-2% expected)"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 687,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                                    style: {
                                                                        marginLeft: '1.5em',
                                                                        marginTop: '0.25em'
                                                                    },
                                                                    children: [
                                                                        stats.specialRarity.inFoilSlotStandard > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                            children: [
                                                                                "Standard Foil: ",
                                                                                stats.specialRarity.inFoilSlotStandard,
                                                                                " (",
                                                                                (stats.specialRarity.inFoilSlotStandard / stats.specialRarity.inFoilSlot * 100).toFixed(1),
                                                                                "% of Special foils observed)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                                            lineNumber: 692,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        stats.specialRarity.inFoilSlotHyperspace > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                            children: [
                                                                                "Hyperspace Foil: ",
                                                                                stats.specialRarity.inFoilSlotHyperspace,
                                                                                " (",
                                                                                (stats.specialRarity.inFoilSlotHyperspace / stats.specialRarity.inFoilSlot * 100).toFixed(1),
                                                                                "% of Special foils observed)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                                            lineNumber: 695,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 690,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true),
                                                        stats.specialRarity.inUpgradeSlot > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            style: {
                                                                marginTop: stats.specialRarity.inFoilSlot > 0 ? '0.5em' : '0'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "Upgrade Slot:"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 702,
                                                                    columnNumber: 27
                                                                }, this),
                                                                " ",
                                                                stats.specialRarity.inUpgradeSlot,
                                                                " out of ",
                                                                stats.upgradeSlotHyperspace,
                                                                " upgrade slots (",
                                                                (stats.specialRarity.inUpgradeSlot / stats.upgradeSlotHyperspace * 100).toFixed(2),
                                                                "% observed)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 701,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: "This set does not include Special rarity cards in booster packs."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 707,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SealedPod.jsx",
                                            lineNumber: 681,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rate-card-section",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    children: "Pack Building Rules"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 712,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: "Leaders can ONLY appear in leader slot (position 1)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 714,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "Leader Rarity:"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 715,
                                                                    columnNumber: 25
                                                                }, this),
                                                                " Common leaders appear ~83.3% of the time (5/6), Rare/Legendary leaders appear ~16.7% of the time (1/6)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 715,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: "Common bases can ONLY appear in base slot (position 2)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 716,
                                                            columnNumber: 21
                                                        }, this),
                                                        [
                                                            'SOR',
                                                            'SHD',
                                                            'TWI',
                                                            'JTL',
                                                            'LOF',
                                                            'SEC'
                                                        ].includes(setCode) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: "Rare bases CAN appear in rare slot"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 718,
                                                            columnNumber: 23
                                                        }, this),
                                                        allowsSpecial && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                    children: "Special rarity cards do NOT appear in regular slots"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 722,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                    children: "Special rarity cards can ONLY appear in foil/hyperfoil slots"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 723,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                    children: "Foil slot can be any rarity, including Special"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                                    lineNumber: 724,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true),
                                                        !allowsSpecial && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: "Foil slot can be any rarity (L, R, U, C)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 728,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: "Foil slot can be a duplicate of another card in the pack"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 730,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: "Upgrade slot (3rd uncommon) can be a duplicate"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 731,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: "Leaders are NEVER foil or hyperfoil"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SealedPod.jsx",
                                                            lineNumber: 732,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 713,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SealedPod.jsx",
                                            lineNumber: 711,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/SealedPod.jsx",
                                    lineNumber: 572,
                                    columnNumber: 15
                                }, this);
                            })()
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/SealedPod.jsx",
                        lineNumber: 441,
                        columnNumber: 9
                    }, this),
                    selectedCard && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$CardModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        card: selectedCard,
                        onClose: ()=>setSelectedCard(null)
                    }, void 0, false, {
                        fileName: "[project]/src/components/SealedPod.jsx",
                        lineNumber: 742,
                        columnNumber: 9
                    }, this),
                    hoveredCardPreview && (()=>{
                        const card = hoveredCardPreview.card;
                        const hasBackImage = card.backImageUrl && card.isLeader;
                        const isHorizontal = card.isLeader || card.isBase;
                        const borderRadius = '23px' // Slightly smaller than 24px to reduce clipping
                        ;
                        // Calculate dimensions
                        let previewWidth, previewHeight;
                        if (hasBackImage) {
                            // Leader with back: side by side (horizontal front + vertical back)
                            previewWidth = 504 + 360 + 20; // 504px front + 360px back + 20px gap
                            previewHeight = 504; // Max height (vertical back is 504px)
                        } else {
                            // Leaders and bases are landscape: 168px x 120px, so 3x = 504px x 360px
                            // Regular cards are portrait: 120px x 168px, so 3x = 360px x 504px
                            previewWidth = isHorizontal ? 504 : 360;
                            previewHeight = isHorizontal ? 360 : 504;
                        }
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "card-preview-enlarged",
                            style: {
                                position: 'fixed',
                                left: `${hoveredCardPreview.x}px`,
                                top: `${hoveredCardPreview.y}px`,
                                zIndex: 10000,
                                pointerEvents: 'auto',
                                transform: 'translateY(-50%)',
                                width: `${previewWidth}px`,
                                height: `${previewHeight}px`,
                                borderRadius: borderRadius,
                                overflow: 'visible',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
                                border: 'none',
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '20px'
                            },
                            onMouseLeave: ()=>setHoveredCardPreview(null),
                            children: hasBackImage ? // Show both front (horizontal) and back (vertical) side by side for leaders
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: card.isFoil && (!card.isLeader || card.isShowcase) ? 'card-preview-foil' : '',
                                        style: {
                                            width: '504px',
                                            height: '360px',
                                            overflow: 'hidden',
                                            borderRadius: borderRadius,
                                            boxShadow: card.isFoil && (!card.isLeader || card.isShowcase) ? '0 0 15px rgba(255, 255, 255, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.8)',
                                            border: '2px solid rgba(255, 255, 255, 0.3)',
                                            alignSelf: 'center',
                                            position: 'relative'
                                        },
                                        children: card.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: card.imageUrl,
                                            alt: `${card.name || 'Card'} - Front`,
                                            style: {
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SealedPod.jsx",
                                            lineNumber: 802,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                width: '100%',
                                                height: '100%',
                                                background: 'rgba(26, 26, 46, 0.95)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                padding: '1rem',
                                                color: 'white'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: '1.2rem',
                                                        marginBottom: '0.5rem'
                                                    },
                                                    children: [
                                                        card.name || 'Card',
                                                        " - Front"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 824,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        color: getRarityColor(card.rarity)
                                                    },
                                                    children: card.rarity
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 827,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SealedPod.jsx",
                                            lineNumber: 813,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SealedPod.jsx",
                                        lineNumber: 791,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: card.isFoil && (!card.isLeader || card.isShowcase) ? 'card-preview-foil' : '',
                                        style: {
                                            width: '360px',
                                            height: '504px',
                                            overflow: 'hidden',
                                            borderRadius: borderRadius,
                                            boxShadow: card.isFoil && (!card.isLeader || card.isShowcase) ? '0 0 15px rgba(255, 255, 255, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.8)',
                                            border: '2px solid rgba(255, 255, 255, 0.3)',
                                            position: 'relative'
                                        },
                                        children: card.backImageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: card.backImageUrl,
                                            alt: `${card.name || 'Card'} - Back`,
                                            style: {
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SealedPod.jsx",
                                            lineNumber: 844,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                width: '100%',
                                                height: '100%',
                                                background: 'rgba(26, 26, 46, 0.95)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                padding: '1rem',
                                                color: 'white'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: '1.2rem',
                                                        marginBottom: '0.5rem'
                                                    },
                                                    children: [
                                                        card.name || 'Card',
                                                        " - Back"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 866,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        color: getRarityColor(card.rarity)
                                                    },
                                                    children: card.rarity
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SealedPod.jsx",
                                                    lineNumber: 869,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SealedPod.jsx",
                                            lineNumber: 855,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SealedPod.jsx",
                                        lineNumber: 834,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true) : // Single card (non-leader, base, or leader without back)
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: card.isFoil && (!card.isLeader || card.isShowcase) ? 'card-preview-foil' : '',
                                style: {
                                    width: `${previewWidth}px`,
                                    height: `${previewHeight}px`,
                                    overflow: 'hidden',
                                    borderRadius: borderRadius,
                                    boxShadow: card.isFoil && (!card.isLeader || card.isShowcase) ? '0 0 15px rgba(255, 255, 255, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.8)',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    position: 'relative'
                                },
                                children: card.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: card.imageUrl,
                                    alt: card.name || 'Card',
                                    style: {
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SealedPod.jsx",
                                    lineNumber: 888,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: '100%',
                                        height: '100%',
                                        background: 'rgba(26, 26, 46, 0.95)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        color: 'white'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '1.2rem',
                                                marginBottom: '0.5rem'
                                            },
                                            children: card.name || 'Card'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SealedPod.jsx",
                                            lineNumber: 910,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                color: getRarityColor(card.rarity)
                                            },
                                            children: card.rarity
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SealedPod.jsx",
                                            lineNumber: 913,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/SealedPod.jsx",
                                    lineNumber: 899,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SealedPod.jsx",
                                lineNumber: 878,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/SealedPod.jsx",
                            lineNumber: 766,
                            columnNumber: 11
                        }, this);
                    })(),
                    tooltip.show && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "tooltip",
                        style: {
                            position: 'fixed',
                            left: `${tooltip.x}px`,
                            top: `${tooltip.y}px`,
                            transform: tooltip.alignLeft ? 'translateX(-100%) translateY(-50%)' : 'translateX(-50%) translateY(-100%)',
                            zIndex: 10000,
                            pointerEvents: 'none',
                            marginRight: '20px',
                            marginTop: tooltip.alignLeft ? '0' : '-8px'
                        },
                        children: tooltip.text
                    }, void 0, false, {
                        fileName: "[project]/src/components/SealedPod.jsx",
                        lineNumber: 924,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/SealedPod.jsx",
                lineNumber: 290,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/SealedPod.jsx",
        lineNumber: 286,
        columnNumber: 5
    }, this);
}
_s(SealedPod, "DmT/WkCWZ9i60/ctf15gMVCohJE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = SealedPod;
const __TURBOPACK__default__export__ = SealedPod;
var _c;
__turbopack_context__.k.register(_c, "SealedPod");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/DeckBuilder.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cardCache$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/cardCache.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/api.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$CardModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/CardModal.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$aspectColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/aspectColors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$CostIcon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/CostIcon.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$poolApi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/poolApi.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
// Get aspect symbol for list view using individual icon files
const getAspectSymbol = (aspect, size = 'medium')=>{
    const aspectMap = {
        'Command': 'command',
        'Villainy': 'villainy',
        'Heroism': 'heroism',
        'Cunning': 'cunning',
        'Vigilance': 'vigilance',
        'Aggression': 'aggression'
    };
    const aspectName = aspectMap[aspect];
    if (!aspectName) return null;
    const sizeMap = {
        'small': 16,
        'medium': 18,
        'large': 39 // Match cost icon size (39px)
    };
    const iconSize = sizeMap[size] || 18;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
        src: `/icons/${aspectName}.png`,
        alt: aspect,
        style: {
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            display: 'block'
        }
    }, void 0, false, {
        fileName: "[project]/src/components/DeckBuilder.jsx",
        lineNumber: 34,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const ASPECTS = [
    'Vigilance',
    'Command',
    'Aggression',
    'Cunning',
    'Villainy',
    'Heroism'
];
const NO_ASPECT_LABEL = 'Neutral';
const SORT_OPTIONS = [
    'aspect',
    'cost'
];
// getAspectColor is now imported from utils/aspectColors
function DeckBuilder({ cards, setCode, onBack, savedState, onStateChange, shareId = null, poolCreatedAt = null, poolType = 'sealed', poolName = null, poolOwnerUsername = null }) {
    _s();
    // Helper function to format card type for display
    const getFormattedType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DeckBuilder.useCallback[getFormattedType]": (card)=>{
            if (card.type === 'Unit') {
                if (card.arenas && card.arenas.includes('Ground')) {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: "Unit"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 55,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: '0.7em',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    marginTop: '-2px'
                                },
                                children: "Ground"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 56,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 54,
                        columnNumber: 11
                    }, this);
                } else if (card.arenas && card.arenas.includes('Space')) {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: "Unit"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 62,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: '0.7em',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    marginTop: '-2px'
                                },
                                children: "Space"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 63,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 61,
                        columnNumber: 11
                    }, this);
                }
                return 'Unit';
            }
            return card.type || 'Unknown';
        }
    }["DeckBuilder.useCallback[getFormattedType]"], []);
    const [cardPositions, setCardPositions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [draggedCard, setDraggedCard] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dragOffset, setDragOffset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    });
    const [canvasHeight, setCanvasHeight] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [allSetCards, setAllSetCards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [sectionLabels, setSectionLabels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [sectionBounds, setSectionBounds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [hoveredCard, setHoveredCard] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [viewMode, setViewMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('grid') // 'grid' or 'list'
    ;
    const [filterDrawerOpen, setFilterDrawerOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [aspectFilters, setAspectFilters] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        Vigilance: true,
        Command: true,
        Aggression: true,
        Cunning: true,
        Villainy: true,
        Heroism: true,
        [NO_ASPECT_LABEL]: true
    });
    const [sortOption, setSortOption] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('aspect');
    const [tableSort, setTableSort] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({}) // Per-section sorting: { sectionId: { field, direction } }
    ;
    const [leadersExpanded, setLeadersExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [basesExpanded, setBasesExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [deckExpanded, setDeckExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [sideboardExpanded, setSideboardExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [deckAspectSectionsExpanded, setDeckAspectSectionsExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({}) // Track expanded aspect combination sections
    ;
    const [sideboardAspectSectionsExpanded, setSideboardAspectSectionsExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({}) // Track expanded aspect combination sections for sideboard
    ;
    const [deckCostSectionsExpanded, setDeckCostSectionsExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({}) // Track expanded cost sections (default all expanded)
    ;
    const [sideboardCostSectionsExpanded, setSideboardCostSectionsExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({}) // Track expanded cost sections for sideboard
    ;
    const [selectedCards, setSelectedCards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [selectionBox, setSelectionBox] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isSelecting, setIsSelecting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isShiftDrag, setIsShiftDrag] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [touchingCards, setTouchingCards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [zIndexCounter, setZIndexCounter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1000);
    const deckBlocksRowRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [activeLeader, setActiveLeader] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeBase, setActiveBase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [errorMessage, setErrorMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [messageType, setMessageType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null) // 'error' or 'success'
    ;
    const [isInfoBarSticky, setIsInfoBarSticky] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Function to get aspect color name
    const getAspectColorName = (aspect)=>{
        const aspectColorMap = {
            'Vigilance': 'Blue',
            'Command': 'Green',
            'Aggression': 'Red',
            'Cunning': 'Yellow',
            'Villainy': 'Purple',
            'Heroism': 'Orange'
        };
        return aspectColorMap[aspect] || aspect;
    };
    // Function to update pool name when leader or base changes
    const updatePoolName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DeckBuilder.useCallback[updatePoolName]": async (leaderCard, baseCard)=>{
            if (!shareId || !setCode) return;
            try {
                const formatType = poolType === 'draft' ? 'Draft' : 'Sealed';
                const leaderName = leaderCard?.name || '';
                // For base: if common, use aspect color name; if rare, use base name
                let baseName = '';
                if (baseCard) {
                    if (baseCard.rarity === 'Common') {
                        // Get the first aspect and convert to color name
                        const aspects = baseCard.aspects || [];
                        if (aspects.length > 0) {
                            baseName = getAspectColorName(aspects[0]);
                        } else {
                            baseName = baseCard.name || '';
                        }
                    } else {
                        // Rare or other rarities: use the base name
                        baseName = baseCard.name || '';
                    }
                }
                // Format: {Set Abbrv} {Format} ({Leader Name} {Base Name})
                const parts = [
                    setCode,
                    formatType
                ];
                // Add leader/base in parentheses if they exist
                const leaderBaseParts = [];
                if (leaderName) leaderBaseParts.push(leaderName);
                if (baseName) leaderBaseParts.push(baseName);
                if (leaderBaseParts.length > 0) {
                    parts.push('(' + leaderBaseParts.join(' ') + ')');
                }
                const name = parts.join(' ');
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$poolApi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updatePool"])(shareId, {
                    name
                });
            } catch (err) {
                console.error('Failed to update pool name:', err);
            // Don't show error to user - this is a background operation
            }
        }
    }["DeckBuilder.useCallback[updatePoolName]"], [
        shareId,
        poolType,
        setCode
    ]);
    // Update pool name when leader or base changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeckBuilder.useEffect": ()=>{
            if (!shareId || !poolCreatedAt) return;
            const leaderCard = activeLeader && cardPositions[activeLeader] ? cardPositions[activeLeader].card : null;
            const baseCard = activeBase && cardPositions[activeBase] ? cardPositions[activeBase].card : null;
            // Only update if at least one is selected
            if (leaderCard || baseCard) {
                updatePoolName(leaderCard, baseCard);
            }
        }
    }["DeckBuilder.useEffect"], [
        activeLeader,
        activeBase,
        cardPositions,
        shareId,
        poolCreatedAt,
        updatePoolName
    ]);
    const [selectedCard, setSelectedCard] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [deckImageModal, setDeckImageModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null) // URL for deck image modal
    ;
    const [hoveredCardPreview, setHoveredCardPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null) // { card, x, y } for enlarged preview
    ;
    const [tooltip, setTooltip] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        show: false,
        text: '',
        x: 0,
        y: 0
    });
    const tooltipTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const longPressTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const modalHoverTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const previewTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const infoBarRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Tooltip handlers
    const showTooltip = (text, event)=>{
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
        }
        tooltipTimeoutRef.current = setTimeout(()=>{
            const rect = event.currentTarget.getBoundingClientRect();
            setTooltip({
                show: true,
                text,
                x: rect.left + rect.width / 2,
                y: rect.top - 10,
                alignLeft: false
            });
        }, 1000);
    };
    // Tooltip for right nav buttons (no delay)
    const showNavTooltip = (text, event)=>{
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltip({
            show: true,
            text,
            x: rect.left,
            y: rect.top + rect.height / 2,
            alignLeft: true
        });
    };
    const hideTooltip = ()=>{
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
            tooltipTimeoutRef.current = null;
        }
        setTooltip({
            show: false,
            text: '',
            x: 0,
            y: 0,
            alignLeft: false
        });
    };
    // Mobile long press handler
    const handleLongPress = (text, event, onClick)=>{
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (!isMobile) return;
        longPressTimeoutRef.current = setTimeout(()=>{
            const rect = event.currentTarget.getBoundingClientRect();
            setTooltip({
                show: true,
                text,
                x: rect.left + rect.width / 2,
                y: rect.top - 10,
                alignLeft: false
            });
        }, 1000);
    };
    const cancelLongPress = ()=>{
        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
        }
    };
    // Enlarged preview hover handlers
    const handleCardMouseEnter = (card, event)=>{
        if (!event) return;
        // Clear any existing timeout
        if (previewTimeoutRef.current) {
            clearTimeout(previewTimeoutRef.current);
        }
        // Capture the rect immediately (before timeout)
        const rect = event.currentTarget.getBoundingClientRect();
        // Set timeout to show preview after 1 second
        previewTimeoutRef.current = setTimeout(()=>{
            // Position the preview near the card (to the right, or left if too close to right edge)
            let previewX = rect.right + 20;
            const previewY = rect.top;
            // Calculate preview dimensions based on card type
            // Leaders and bases are landscape: 168px x 120px, so 3x = 504px x 360px
            // Regular cards are portrait: 120px x 168px, so 3x = 360px x 504px
            // Leaders with back: front horizontal (504x360) + back vertical (360x504) side by side
            const isHorizontal = card.isLeader || card.isBase;
            const hasBackImage = card.backImageUrl && card.isLeader;
            let previewWidth, previewHeight;
            if (hasBackImage) {
                // Leader with back: side by side (horizontal front + vertical back)
                previewWidth = 504 + 360 + 20; // 504px front + 360px back + 20px gap
                previewHeight = 504; // Max height (vertical back is 504px)
            } else {
                previewWidth = isHorizontal ? 504 : 360;
                previewHeight = isHorizontal ? 360 : 504;
            }
            // Ensure preview stays within viewport bounds
            // Check right edge
            if (previewX + previewWidth > window.innerWidth) {
                // Try positioning to the left of the card
                previewX = rect.left - previewWidth - 20;
                // If still off screen to the left, clamp to left edge
                if (previewX < 0) {
                    previewX = 10; // Small margin from left edge
                }
            }
            // Check left edge
            if (previewX < 0) {
                previewX = 10; // Small margin from left edge
            }
            // Adjust vertical position to keep preview within viewport
            // previewY is the center point (due to translateY(-50%))
            const previewTop = previewY - previewHeight / 2;
            const previewBottom = previewY + previewHeight / 2;
            let adjustedY = previewY;
            // Check top edge
            if (previewTop < 0) {
                adjustedY = previewHeight / 2 + 10; // Position so top is 10px from top
            }
            // Check bottom edge
            if (previewBottom > window.innerHeight) {
                adjustedY = window.innerHeight - previewHeight / 2 - 10; // Position so bottom is 10px from bottom
            }
            setHoveredCardPreview({
                card,
                x: previewX,
                y: adjustedY
            });
        }, 1000);
    };
    const handleCardMouseLeave = ()=>{
        // Clear the timeout if it exists (preview hasn't shown yet)
        if (previewTimeoutRef.current) {
            clearTimeout(previewTimeoutRef.current);
            previewTimeoutRef.current = null;
        }
    // Don't clear the preview if it's already showing
    // This allows the mouse to move from the card to the preview without the preview disappearing
    // The preview's own onMouseLeave will handle clearing it when you move away
    // Only clear if the preview was never shown (timeout was still pending)
    };
    const handlePreviewMouseEnter = ()=>{
    // Keep preview visible when hovering over it
    // Don't clear the timeout or preview
    };
    const handlePreviewMouseLeave = ()=>{
        setHoveredCardPreview(null);
    };
    // Cleanup tooltip timeouts
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeckBuilder.useEffect": ()=>{
            return ({
                "DeckBuilder.useEffect": ()=>{
                    if (tooltipTimeoutRef.current) {
                        clearTimeout(tooltipTimeoutRef.current);
                    }
                    if (longPressTimeoutRef.current) {
                        clearTimeout(longPressTimeoutRef.current);
                    }
                    if (modalHoverTimeoutRef.current) {
                        clearTimeout(modalHoverTimeoutRef.current);
                    }
                    if (previewTimeoutRef.current) {
                        clearTimeout(previewTimeoutRef.current);
                    }
                }
            })["DeckBuilder.useEffect"];
        }
    }["DeckBuilder.useEffect"], []);
    // Load all cards from the set - optimize for speed
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeckBuilder.useEffect": ()=>{
            const loadSetCards = {
                "DeckBuilder.useEffect.loadSetCards": async ()=>{
                    try {
                        // Initialize cache first if not already initialized (should be instant from JSON)
                        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cardCache$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCacheInitialized"])()) {
                            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cardCache$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initializeCardCache"])();
                        }
                        // Get cards from cache (instant)
                        let cardsData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cardCache$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCachedCards"])(setCode);
                        // If cache doesn't have cards, try API as fallback
                        if (cardsData.length === 0) {
                            cardsData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchSetCards"])(setCode);
                        }
                        if (cardsData.length > 0) {
                            setAllSetCards(cardsData);
                        }
                    } catch (error) {
                        console.error('Failed to load set cards:', error);
                    }
                }
            }["DeckBuilder.useEffect.loadSetCards"];
            if (setCode) {
                loadSetCards();
            }
        }
    }["DeckBuilder.useEffect"], [
        setCode
    ]);
    // Check if card matches aspect filters (used for export, not for display filtering)
    const cardMatchesFilters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DeckBuilder.useCallback[cardMatchesFilters]": (card)=>{
            const cardAspects = card.aspects || [];
            // If card has no aspects, check "No Aspect" filter
            if (cardAspects.length === 0) {
                return aspectFilters[NO_ASPECT_LABEL] || false;
            }
            // Card must have at least one aspect that's checked
            return cardAspects.some({
                "DeckBuilder.useCallback[cardMatchesFilters]": (aspect)=>aspectFilters[aspect]
            }["DeckBuilder.useCallback[cardMatchesFilters]"]);
        }
    }["DeckBuilder.useCallback[cardMatchesFilters]"], [
        aspectFilters
    ]);
    // Get aspect combination key for default sorting
    // EXACT ORDER (DO NOT CHANGE):
    // VIG VILL, VIG HERO, VIG VIG, VIG
    // COMM VILL, COMM HERO, COMM COMM, COMM
    // AGG VILL, AGG HERO, AGG AGG, AGG
    // CUNN VILL, CUNN HERO, CUNN CUNN, CUNN
    // VILL, HERO, NEUTRAL
    const getDefaultAspectSortKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DeckBuilder.useCallback[getDefaultAspectSortKey]": (card)=>{
            const aspects = card.aspects || [];
            if (aspects.length === 0) return 'E_99_Neutral';
            const hasVillainy = aspects.includes('Villainy');
            const hasHeroism = aspects.includes('Heroism');
            const primaryAspects = [
                'Vigilance',
                'Command',
                'Aggression',
                'Cunning'
            ];
            const primaryAspect = aspects.find({
                "DeckBuilder.useCallback[getDefaultAspectSortKey].primaryAspect": (a)=>primaryAspects.includes(a)
            }["DeckBuilder.useCallback[getDefaultAspectSortKey].primaryAspect"]);
            // Primary aspect order: Vigilance=1, Command=2, Aggression=3, Cunning=4
            const primaryOrder = {
                'Vigilance': '1',
                'Command': '2',
                'Aggression': '3',
                'Cunning': '4'
            };
            // Single aspect
            if (aspects.length === 1) {
                const aspect = aspects[0];
                if (aspect === 'Villainy') return 'E_01_Villainy';
                if (aspect === 'Heroism') return 'E_02_Heroism';
                // Single primary aspect - comes after all combinations for that primary
                return `${primaryOrder[aspect] || '9'}_04_${aspect}`;
            }
            // Two aspects
            if (aspects.length === 2) {
                if (primaryAspect) {
                    const prefix = primaryOrder[primaryAspect] || '9';
                    // Check if it's double primary (e.g., Vigilance Vigilance)
                    const primaryCount = aspects.filter({
                        "DeckBuilder.useCallback[getDefaultAspectSortKey]": (a)=>a === primaryAspect
                    }["DeckBuilder.useCallback[getDefaultAspectSortKey]"]).length;
                    if (hasVillainy) {
                        // Primary + Villainy - comes first (01)
                        return `${prefix}_01_${primaryAspect}_Villainy`;
                    } else if (hasHeroism) {
                        // Primary + Heroism - comes second (02)
                        return `${prefix}_02_${primaryAspect}_Heroism`;
                    } else if (primaryCount === 2) {
                        // Double primary (e.g., Vig Vig) - comes third (03)
                        return `${prefix}_03_${primaryAspect}_${primaryAspect}`;
                    }
                } else {
                    // Villainy + Heroism (no primary) - treat as Villainy only
                    return 'E_01_Villainy_Heroism';
                }
            }
            // More than 2 aspects - use first primary aspect
            if (primaryAspect) {
                const prefix = primaryOrder[primaryAspect] || '9';
                // Sort aspects with Villainy first, then Heroism, then others
                const sortedAspects = [
                    ...aspects
                ].sort({
                    "DeckBuilder.useCallback[getDefaultAspectSortKey].sortedAspects": (a, b)=>{
                        if (a === 'Villainy') return -1;
                        if (b === 'Villainy') return 1;
                        if (a === 'Heroism') return -1;
                        if (b === 'Heroism') return 1;
                        return a.localeCompare(b);
                    }
                }["DeckBuilder.useCallback[getDefaultAspectSortKey].sortedAspects"]);
                // Use 01 if has Villainy, 02 if has Heroism, else 05
                let subOrder = '05';
                if (hasVillainy) subOrder = '01';
                else if (hasHeroism) subOrder = '02';
                return `${prefix}_${subOrder}_${sortedAspects.join('_')}`;
            }
            // No primary aspect found - check for Villainy or Heroism
            if (hasVillainy) return 'E_01_Villainy_Multi';
            if (hasHeroism) return 'E_02_Heroism_Multi';
            return 'E_99_Neutral';
        }
    }["DeckBuilder.useCallback[getDefaultAspectSortKey]"], []);
    // Get aspect combination grouping key and display name for deck sections
    const getAspectCombinationKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DeckBuilder.useCallback[getAspectCombinationKey]": (card)=>{
            const aspects = card.aspects || [];
            if (aspects.length === 0) return 'neutral';
            const hasVillainy = aspects.includes('Villainy');
            const hasHeroism = aspects.includes('Heroism');
            const primaryAspects = [
                'Vigilance',
                'Command',
                'Aggression',
                'Cunning'
            ];
            const primaryAspect = aspects.find({
                "DeckBuilder.useCallback[getAspectCombinationKey].primaryAspect": (a)=>primaryAspects.includes(a)
            }["DeckBuilder.useCallback[getAspectCombinationKey].primaryAspect"]);
            // Single aspect
            if (aspects.length === 1) {
                const aspect = aspects[0];
                // Single primary aspect (includes double primary like Vig Vig)
                if (primaryAspects.includes(aspect)) {
                    return aspect.toLowerCase() // e.g., "vigilance", "command"
                    ;
                }
                if (aspect === 'Villainy') return 'villainy';
                if (aspect === 'Heroism') return 'heroism';
                return 'neutral';
            }
            // Two aspects
            if (aspects.length === 2) {
                if (primaryAspect) {
                    // Check if it's double primary (e.g., Vigilance Vigilance)
                    const primaryCount = aspects.filter({
                        "DeckBuilder.useCallback[getAspectCombinationKey]": (a)=>a === primaryAspect
                    }["DeckBuilder.useCallback[getAspectCombinationKey]"]).length;
                    if (primaryCount === 2) {
                        // Double primary - separate key (e.g., "command_command")
                        return `${primaryAspect.toLowerCase()}_${primaryAspect.toLowerCase()}`;
                    }
                    if (hasVillainy) {
                        return `${primaryAspect.toLowerCase()}_villainy` // e.g., "vigilance_villainy"
                        ;
                    }
                    if (hasHeroism) {
                        return `${primaryAspect.toLowerCase()}_heroism` // e.g., "vigilance_heroism"
                        ;
                    }
                } else {
                    // Villainy + Heroism
                    return 'villainy_heroism';
                }
            }
            // More than 2 aspects - use first primary aspect
            if (primaryAspect) {
                const sortedAspects = [
                    ...aspects
                ].sort();
                return sortedAspects.join('_').toLowerCase();
            }
            return 'neutral';
        }
    }["DeckBuilder.useCallback[getAspectCombinationKey]"], []);
    // Get display name for aspect combination
    const getAspectCombinationDisplayName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DeckBuilder.useCallback[getAspectCombinationDisplayName]": (key)=>{
            const parts = key.split('_');
            if (parts.length === 1) {
                // Single aspect
                const aspect = parts[0];
                const displayNames = {
                    'vigilance': 'Vigilance',
                    'command': 'Command',
                    'aggression': 'Aggression',
                    'cunning': 'Cunning',
                    'villainy': 'Villainy',
                    'heroism': 'Heroism',
                    'neutral': 'Neutral'
                };
                return displayNames[aspect] || aspect.charAt(0).toUpperCase() + aspect.slice(1);
            } else if (parts.length === 2) {
                // Two aspects
                const [first, second] = parts;
                const displayNames = {
                    'vigilance': 'Vigilance',
                    'command': 'Command',
                    'aggression': 'Aggression',
                    'cunning': 'Cunning',
                    'villainy': 'Villainy',
                    'heroism': 'Heroism'
                };
                const firstDisplay = displayNames[first] || first.charAt(0).toUpperCase() + first.slice(1);
                const secondDisplay = displayNames[second] || second.charAt(0).toUpperCase() + second.slice(1);
                return `${firstDisplay} ${secondDisplay}`;
            }
            // More than 2 aspects - capitalize each part
            return parts.map({
                "DeckBuilder.useCallback[getAspectCombinationDisplayName]": (p)=>p.charAt(0).toUpperCase() + p.slice(1)
            }["DeckBuilder.useCallback[getAspectCombinationDisplayName]"]).join(' ');
        }
    }["DeckBuilder.useCallback[getAspectCombinationDisplayName]"], []);
    // Get aspect icons for deck area headers (replaces text with icons)
    const getAspectCombinationIcons = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DeckBuilder.useCallback[getAspectCombinationIcons]": (key)=>{
            const parts = key.split('_');
            const aspectMap = {
                'vigilance': 'vigilance',
                'command': 'command',
                'aggression': 'aggression',
                'cunning': 'cunning',
                'villainy': 'villainy',
                'heroism': 'heroism'
            };
            if (parts.length === 1) {
                // Single aspect or neutral
                if (parts[0] === 'neutral') {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: '#999'
                        },
                        children: "Neutral"
                    }, void 0, false, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 592,
                        columnNumber: 16
                    }, this);
                }
                const aspectName = aspectMap[parts[0]];
                if (!aspectName) return null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: `/icons/${aspectName}.png`,
                    alt: parts[0],
                    style: {
                        width: '1em',
                        height: '1em',
                        verticalAlign: 'middle'
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/DeckBuilder.jsx",
                    lineNumber: 597,
                    columnNumber: 9
                }, this);
            } else {
                // Multiple aspects - show all icons
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        display: 'flex',
                        gap: '4px',
                        alignItems: 'center'
                    },
                    children: parts.map({
                        "DeckBuilder.useCallback[getAspectCombinationIcons]": (part, i)=>{
                            const aspectName = aspectMap[part];
                            if (!aspectName) return null;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: `/icons/${aspectName}.png`,
                                alt: part,
                                style: {
                                    width: '1em',
                                    height: '1em',
                                    display: 'block',
                                    verticalAlign: 'middle'
                                }
                            }, i, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 611,
                                columnNumber: 15
                            }, this);
                        }
                    }["DeckBuilder.useCallback[getAspectCombinationIcons]"]).filter(Boolean)
                }, void 0, false, {
                    fileName: "[project]/src/components/DeckBuilder.jsx",
                    lineNumber: 606,
                    columnNumber: 9
                }, this);
            }
        }
    }["DeckBuilder.useCallback[getAspectCombinationIcons]"], []);
    // Get aspect combination key for sorting (legacy, used for 'aspect' sort option)
    const getAspectKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DeckBuilder.useCallback[getAspectKey]": (card)=>{
            const aspects = card.aspects || [];
            if (aspects.length === 0) return 'ZZZ_Neutral';
            // Single aspects - sort by priority (alphabetical of colors: Blue, Green, Red, Yellow)
            if (aspects.length === 1) {
                const aspect = aspects[0];
                const priority = {
                    'Vigilance': 'A_Vigilance',
                    'Command': 'B_Command',
                    'Aggression': 'C_Aggression',
                    'Cunning': 'D_Cunning',
                    'Villainy': 'E_Villainy',
                    'Heroism': 'F_Heroism'
                };
                return priority[aspect] || `G_${aspect}`;
            }
            // Two aspects - return sorted combination with prefix
            const sortedAspects = [
                ...aspects
            ].sort();
            return `H_${sortedAspects.join(' ')}`;
        }
    }["DeckBuilder.useCallback[getAspectKey]"], []);
    // Sort cards (only from deck section, excluding bases and leaders)
    // Note: No longer filtering - cards are moved between deck/sideboard via filter checkboxes
    const getFilteredAndSortedCards = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DeckBuilder.useCallback[getFilteredAndSortedCards]": ()=>{
            const allCards = Object.values(cardPositions).filter({
                "DeckBuilder.useCallback[getFilteredAndSortedCards].allCards": (pos)=>pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader
            }["DeckBuilder.useCallback[getFilteredAndSortedCards].allCards"]).map({
                "DeckBuilder.useCallback[getFilteredAndSortedCards].allCards": (pos)=>pos.card
            }["DeckBuilder.useCallback[getFilteredAndSortedCards].allCards"]);
            if (sortOption === 'aspect') {
                // Sort by aspect key directly
                return allCards.sort({
                    "DeckBuilder.useCallback[getFilteredAndSortedCards]": (a, b)=>{
                        const keyA = getAspectKey(a);
                        const keyB = getAspectKey(b);
                        return keyA.localeCompare(keyB);
                    }
                }["DeckBuilder.useCallback[getFilteredAndSortedCards]"]);
            } else if (sortOption === 'cost') {
                // Sort by cost (will be grouped by cost segments in rendering)
                return allCards.sort({
                    "DeckBuilder.useCallback[getFilteredAndSortedCards]": (a, b)=>(a.cost || 0) - (b.cost || 0)
                }["DeckBuilder.useCallback[getFilteredAndSortedCards]"]);
            }
            return allCards;
        }
    }["DeckBuilder.useCallback[getFilteredAndSortedCards]"], [
        cardPositions,
        sortOption,
        getAspectKey,
        getDefaultAspectSortKey
    ]);
    // Group cards by base name (ignoring treatments like foil, hyperspace, showcase)
    // Returns an array of groups, where each group contains cards with the same base name
    const groupCardsByName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DeckBuilder.useCallback[groupCardsByName]": (cardEntries)=>{
            const groups = new Map();
            cardEntries.forEach({
                "DeckBuilder.useCallback[groupCardsByName]": ({ cardId, position })=>{
                    const card = position.card;
                    const baseName = card.name || 'Unknown';
                    if (!groups.has(baseName)) {
                        groups.set(baseName, []);
                    }
                    groups.get(baseName).push({
                        cardId,
                        position
                    });
                }
            }["DeckBuilder.useCallback[groupCardsByName]"]);
            // Convert to array and sort groups by first card's order
            return Array.from(groups.entries()).map({
                "DeckBuilder.useCallback[groupCardsByName]": ([name, cards])=>({
                        name,
                        cards
                    })
            }["DeckBuilder.useCallback[groupCardsByName]"]);
        }
    }["DeckBuilder.useCallback[groupCardsByName]"], []);
    // Render a card stack (for identical cards)
    const renderCardStack = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DeckBuilder.useCallback[renderCardStack]": (group, renderCard)=>{
            // Render all cards individually, no stacking
            return group.cards.map({
                "DeckBuilder.useCallback[renderCardStack]": (cardEntry, index)=>renderCard(cardEntry, 0, false)
            }["DeckBuilder.useCallback[renderCardStack]"]);
        }
    }["DeckBuilder.useCallback[renderCardStack]"], []);
    // Restore saved state on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeckBuilder.useEffect": ()=>{
            if (savedState && Object.keys(cardPositions).length === 0) {
                try {
                    // Handle both string and object savedState
                    const state = typeof savedState === 'string' ? JSON.parse(savedState) : savedState;
                    if (state.cardPositions && Object.keys(state.cardPositions).length > 0) {
                        // Ensure all cards have enabled property (default to true)
                        // Also remove any bases/leaders that might have been in 'main' section
                        const positionsWithEnabled = {};
                        Object.entries(state.cardPositions).forEach({
                            "DeckBuilder.useEffect": ([id, pos])=>{
                                // Remove bases and leaders from 'main' section
                                if ((pos.section === 'deck' || pos.section === 'sideboard') && (pos.card?.isBase || pos.card?.isLeader)) {
                                    return; // Skip this card - it shouldn't be in main section
                                }
                                positionsWithEnabled[id] = {
                                    ...pos,
                                    enabled: pos.enabled !== undefined ? pos.enabled : true
                                };
                            }
                        }["DeckBuilder.useEffect"]);
                        setCardPositions(positionsWithEnabled);
                        setSectionLabels(state.sectionLabels || []);
                        setSectionBounds(state.sectionBounds || {});
                        setCanvasHeight(state.canvasHeight);
                        setAspectFilters(state.aspectFilters || {
                            Vigilance: true,
                            Villainy: true,
                            Heroism: true,
                            Command: true,
                            Cunning: true,
                            Aggression: true
                        });
                        setSortOption(state.sortOption || 'aspect');
                        // Restore active leader and base
                        if (state.activeLeader) {
                            setActiveLeader(state.activeLeader);
                        }
                        if (state.activeBase) {
                            setActiveBase(state.activeBase);
                        }
                    }
                } catch (e) {
                    console.error('Failed to restore deck builder state:', e);
                }
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["DeckBuilder.useEffect"], [
        savedState
    ]); // Run when savedState changes
    // Detect when deck-info-bar becomes sticky
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeckBuilder.useEffect": ()=>{
            const infoBar = infoBarRef.current;
            if (!infoBar) return;
            const checkSticky = {
                "DeckBuilder.useEffect.checkSticky": ()=>{
                    if (!infoBar) return;
                    const rect = infoBar.getBoundingClientRect();
                    // Check if element is stuck at top: 20px
                    const isSticky = Math.abs(rect.top - 20) < 5;
                    setIsInfoBarSticky(isSticky);
                }
            }["DeckBuilder.useEffect.checkSticky"];
            // Check on scroll and resize
            const handleScroll = {
                "DeckBuilder.useEffect.handleScroll": ()=>requestAnimationFrame(checkSticky)
            }["DeckBuilder.useEffect.handleScroll"];
            window.addEventListener('scroll', handleScroll, {
                passive: true
            });
            window.addEventListener('resize', handleScroll, {
                passive: true
            });
            checkSticky(); // Initial check
            return ({
                "DeckBuilder.useEffect": ()=>{
                    window.removeEventListener('scroll', handleScroll);
                    window.removeEventListener('resize', handleScroll);
                }
            })["DeckBuilder.useEffect"];
        }
    }["DeckBuilder.useEffect"], []);
    // Handle ESC key to close modal
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeckBuilder.useEffect": ()=>{
            const handleKeyDown = {
                "DeckBuilder.useEffect.handleKeyDown": (e)=>{
                    if (e.key === 'Escape') {
                        if (modalHoverTimeoutRef.current) {
                            clearTimeout(modalHoverTimeoutRef.current);
                            modalHoverTimeoutRef.current = null;
                        }
                        setSelectedCard(null);
                    }
                }
            }["DeckBuilder.useEffect.handleKeyDown"];
            window.addEventListener('keydown', handleKeyDown);
            return ({
                "DeckBuilder.useEffect": ()=>{
                    window.removeEventListener('keydown', handleKeyDown);
                }
            })["DeckBuilder.useEffect"];
        }
    }["DeckBuilder.useEffect"], [
        selectedCard
    ]);
    // Initialize card positions in sections
    // Can initialize with just pool cards, then enhance when all set cards load
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeckBuilder.useEffect": ()=>{
            // Don't initialize if we have saved state to restore (it will be restored in the other useEffect)
            if (savedState) return;
            // Initialize immediately with pool cards if we have them
            // We only need allSetCards for the common bases, which can be added later
            if (cards.length > 0 && Object.keys(cardPositions).length === 0) {
                const poolCards = cards.filter({
                    "DeckBuilder.useEffect.poolCards": (card)=>!card.isBase && !card.isLeader
                }["DeckBuilder.useEffect.poolCards"]);
                const poolLeaders = cards.filter({
                    "DeckBuilder.useEffect.poolLeaders": (card)=>card.isLeader
                }["DeckBuilder.useEffect.poolLeaders"]);
                // Get common bases from all set cards if available, otherwise skip (will be added later)
                const commonBasesMap = new Map();
                if (allSetCards.length > 0) {
                    allSetCards.filter({
                        "DeckBuilder.useEffect": (card)=>card.isBase && card.rarity === 'Common'
                    }["DeckBuilder.useEffect"]).forEach({
                        "DeckBuilder.useEffect": (card)=>{
                            const key = card.name;
                            if (!commonBasesMap.has(key)) {
                                commonBasesMap.set(key, card);
                            }
                        }
                    }["DeckBuilder.useEffect"]);
                }
                // Sort bases by aspect: Vigilance, Command, Aggression, Cunning
                const aspectOrder = [
                    'Vigilance',
                    'Command',
                    'Aggression',
                    'Cunning'
                ];
                const getAspectSortValue = {
                    "DeckBuilder.useEffect.getAspectSortValue": (card)=>{
                        const aspects = card.aspects || [];
                        if (aspects.length === 0) return 999 // Neutral/no aspect goes last
                        ;
                        // Get the first aspect that matches our order
                        for(let i = 0; i < aspectOrder.length; i++){
                            if (aspects.includes(aspectOrder[i])) {
                                return i;
                            }
                        }
                        return 999 // Other aspects go last
                        ;
                    }
                }["DeckBuilder.useEffect.getAspectSortValue"];
                const uniqueCommonBases = Array.from(commonBasesMap.values()).sort({
                    "DeckBuilder.useEffect.uniqueCommonBases": (a, b)=>{
                        const aValue = getAspectSortValue(a);
                        const bValue = getAspectSortValue(b);
                        if (aValue !== bValue) {
                            return aValue - bValue;
                        }
                        // If same aspect, sort by name
                        return (a.name || '').localeCompare(b.name || '');
                    }
                }["DeckBuilder.useEffect.uniqueCommonBases"]);
                const initialPositions = {};
                const labels = [];
                const bounds = {};
                const cardWidth = 120;
                const cardHeight = 168;
                const leaderBaseWidth = 168;
                const leaderBaseHeight = 120;
                const spacing = 20;
                const padding = 50;
                const sectionSpacing = 20;
                const labelHeight = 30;
                let currentY = padding;
                // Get rare bases from pack cards
                const rareBasesFromPacks = cards.filter({
                    "DeckBuilder.useEffect.rareBasesFromPacks": (card)=>card.isBase && card.rarity === 'Rare'
                }["DeckBuilder.useEffect.rareBasesFromPacks"]);
                const rareBasesMap = new Map();
                rareBasesFromPacks.forEach({
                    "DeckBuilder.useEffect": (card)=>{
                        const key = card.name;
                        if (!rareBasesMap.has(key)) {
                            rareBasesMap.set(key, card);
                        }
                    }
                }["DeckBuilder.useEffect"]);
                const uniqueRareBases = Array.from(rareBasesMap.values()).sort({
                    "DeckBuilder.useEffect.uniqueRareBases": (a, b)=>{
                        const aValue = getAspectSortValue(a);
                        const bValue = getAspectSortValue(b);
                        if (aValue !== bValue) {
                            return aValue - bValue;
                        }
                        return (a.name || '').localeCompare(b.name || '');
                    }
                }["DeckBuilder.useEffect.uniqueRareBases"]);
                // Combine rare bases (first) and common bases (second)
                const allBases = [
                    ...uniqueRareBases,
                    ...uniqueCommonBases
                ];
                // Combine leaders and bases into one section
                const leadersAndBases = [
                    ...poolLeaders,
                    ...allBases
                ];
                if (leadersAndBases.length > 0) {
                    const sectionStartY = currentY + labelHeight + 10;
                    currentY = sectionStartY;
                    labels.push({
                        text: 'Leaders & Bases',
                        y: currentY - labelHeight - 5
                    });
                    const itemsPerRow = Math.floor((window.innerWidth - 100) / (leaderBaseWidth + spacing));
                    leadersAndBases.forEach({
                        "DeckBuilder.useEffect": (card, index)=>{
                            const row = Math.floor(index / itemsPerRow);
                            const col = index % itemsPerRow;
                            // Use unique ID that always includes index to handle duplicates
                            const cardId = card.isLeader ? `leader-${index}-${card.id || `${card.name}-${card.set}`}` : `base-${index}-${card.id || `${card.name}-${card.set}`}`;
                            initialPositions[cardId] = {
                                x: padding + col * (leaderBaseWidth + spacing),
                                y: currentY + row * (leaderBaseHeight + spacing),
                                card: card,
                                section: 'leaders-bases',
                                visible: true,
                                zIndex: 1
                            };
                        }
                    }["DeckBuilder.useEffect"]);
                    const totalRows = Math.ceil(leadersAndBases.length / itemsPerRow);
                    // Calculate end Y as the bottom of the last row of cards (no extra spacing)
                    // For last row: (totalRows - 1) rows of spacing + last row's cards
                    const sectionEndY = currentY + (totalRows - 1) * (leaderBaseHeight + spacing) + leaderBaseHeight;
                    bounds['leaders-bases'] = {
                        minY: sectionStartY,
                        maxY: sectionEndY,
                        minX: padding,
                        maxX: window.innerWidth - padding
                    };
                    // Start pool section right after leaders/bases with minimal gap (just for label)
                    currentY = sectionEndY + 20; // Small gap for visual separation
                }
                if (poolCards.length > 0) {
                    // Deck section
                    const deckStartY = currentY + labelHeight;
                    labels.push({
                        text: 'Deck',
                        y: deckStartY - labelHeight
                    });
                    currentY = deckStartY;
                    const cardsPerRow = Math.floor((window.innerWidth - 100) / (cardWidth + spacing));
                    poolCards.forEach({
                        "DeckBuilder.useEffect": (card, index)=>{
                            const row = Math.floor(index / cardsPerRow);
                            const col = index % cardsPerRow;
                            // Always include index to ensure uniqueness for duplicate cards
                            const cardId = `pool-${index}-${card.id || `${card.name}-${card.set}`}`;
                            initialPositions[cardId] = {
                                x: padding + col * (cardWidth + spacing),
                                y: currentY + row * (cardHeight + spacing),
                                card: card,
                                section: 'deck',
                                visible: true,
                                enabled: true,
                                zIndex: 1
                            };
                        }
                    }["DeckBuilder.useEffect"]);
                    const mainRows = Math.ceil(poolCards.length / cardsPerRow);
                    const deckEndY = currentY + mainRows * (cardHeight + spacing);
                    bounds.deck = {
                        minY: deckStartY,
                        maxY: deckEndY,
                        minX: padding,
                        maxX: window.innerWidth - padding
                    };
                    currentY = deckEndY;
                    // Sideboard section (empty initially, but with space reserved)
                    const sideboardStartY = currentY + labelHeight + 10;
                    labels.push({
                        text: 'Sideboard',
                        y: sideboardStartY - labelHeight
                    });
                    bounds.sideboard = {
                        minY: sideboardStartY,
                        maxY: sideboardStartY + 200,
                        minX: padding,
                        maxX: window.innerWidth - padding
                    };
                    currentY = sideboardStartY + 200;
                }
                const calculatedHeight = currentY + padding;
                setCanvasHeight(calculatedHeight);
                setCardPositions(initialPositions);
                setSectionLabels(labels);
                setSectionBounds(bounds);
            }
        }
    }["DeckBuilder.useEffect"], [
        cards,
        allSetCards,
        savedState
    ]);
    // Add common bases when allSetCards loads (even if cardPositions already exist)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeckBuilder.useEffect": ()=>{
            // Only run if we have allSetCards, cardPositions exist, and we haven't added common bases yet
            if (allSetCards.length > 0 && Object.keys(cardPositions).length > 0 && setCode) {
                // Check if common bases are already in cardPositions
                const hasCommonBases = Object.values(cardPositions).some({
                    "DeckBuilder.useEffect.hasCommonBases": (pos)=>pos.card.isBase && pos.card.rarity === 'Common'
                }["DeckBuilder.useEffect.hasCommonBases"]);
                // If no common bases found, add them
                if (!hasCommonBases) {
                    // Get common bases from all set cards
                    const commonBasesMap = new Map();
                    allSetCards.filter({
                        "DeckBuilder.useEffect": (card)=>card.isBase && card.rarity === 'Common'
                    }["DeckBuilder.useEffect"]).forEach({
                        "DeckBuilder.useEffect": (card)=>{
                            const key = card.name;
                            if (!commonBasesMap.has(key)) {
                                commonBasesMap.set(key, card);
                            }
                        }
                    }["DeckBuilder.useEffect"]);
                    // Sort bases by aspect
                    const aspectOrder = [
                        'Vigilance',
                        'Command',
                        'Aggression',
                        'Cunning'
                    ];
                    const getAspectSortValue = {
                        "DeckBuilder.useEffect.getAspectSortValue": (card)=>{
                            const aspects = card.aspects || [];
                            if (aspects.length === 0) return 999;
                            for(let i = 0; i < aspectOrder.length; i++){
                                if (aspects.includes(aspectOrder[i])) {
                                    return i;
                                }
                            }
                            return 999;
                        }
                    }["DeckBuilder.useEffect.getAspectSortValue"];
                    const uniqueCommonBases = Array.from(commonBasesMap.values()).sort({
                        "DeckBuilder.useEffect.uniqueCommonBases": (a, b)=>{
                            const aValue = getAspectSortValue(a);
                            const bValue = getAspectSortValue(b);
                            if (aValue !== bValue) {
                                return aValue - bValue;
                            }
                            return (a.name || '').localeCompare(b.name || '');
                        }
                    }["DeckBuilder.useEffect.uniqueCommonBases"]);
                    // Find the leaders-bases section bounds
                    const leadersBasesBounds = sectionBounds['leaders-bases'];
                    if (leadersBasesBounds && uniqueCommonBases.length > 0) {
                        const updatedPositions = {
                            ...cardPositions
                        };
                        const leaderBaseWidth = 168;
                        const leaderBaseHeight = 120;
                        const spacing = 20;
                        const padding = 50;
                        // Find existing bases to determine starting position
                        const existingBases = Object.values(cardPositions).filter({
                            "DeckBuilder.useEffect.existingBases": (pos)=>pos.section === 'leaders-bases' && pos.card.isBase
                        }["DeckBuilder.useEffect.existingBases"]);
                        // Calculate starting position: after existing bases or at section start
                        let startY = leadersBasesBounds.minY;
                        let startX = padding;
                        const itemsPerRow = Math.floor((window.innerWidth - 100) / (leaderBaseWidth + spacing));
                        if (existingBases.length > 0) {
                            // Find the bottom-right position of existing bases
                            const maxY = Math.max(...existingBases.map({
                                "DeckBuilder.useEffect.maxY": (pos)=>pos.y + leaderBaseHeight
                            }["DeckBuilder.useEffect.maxY"]));
                            const maxX = Math.max(...existingBases.map({
                                "DeckBuilder.useEffect.maxX": (pos)=>pos.x + leaderBaseWidth
                            }["DeckBuilder.useEffect.maxX"]));
                            startY = maxY + spacing;
                            // If we need a new row, reset X
                            if (maxX + leaderBaseWidth + spacing > window.innerWidth - padding) {
                                startX = padding;
                            } else {
                                startX = maxX + spacing;
                            }
                        }
                        // Add common bases
                        uniqueCommonBases.forEach({
                            "DeckBuilder.useEffect": (card, index)=>{
                                const row = Math.floor(index / itemsPerRow);
                                const col = index % itemsPerRow;
                                const cardId = `base-common-${index}-${card.id || `${card.name}-${card.set}`}`;
                                // Check if this base already exists (avoid duplicates)
                                const baseExists = Object.values(cardPositions).some({
                                    "DeckBuilder.useEffect.baseExists": (pos)=>pos.card.isBase && pos.card.name === card.name && pos.card.rarity === 'Common'
                                }["DeckBuilder.useEffect.baseExists"]);
                                if (!baseExists) {
                                    updatedPositions[cardId] = {
                                        x: startX + col * (leaderBaseWidth + spacing),
                                        y: startY + row * (leaderBaseHeight + spacing),
                                        card: card,
                                        section: 'leaders-bases',
                                        visible: true,
                                        zIndex: 1
                                    };
                                }
                            }
                        }["DeckBuilder.useEffect"]);
                        // Update bounds if needed
                        const updatedBounds = {
                            ...sectionBounds
                        };
                        if (uniqueCommonBases.length > 0) {
                            const totalRows = Math.ceil(uniqueCommonBases.length / itemsPerRow);
                            const newMaxY = startY + (totalRows - 1) * (leaderBaseHeight + spacing) + leaderBaseHeight;
                            if (updatedBounds['leaders-bases']) {
                                updatedBounds['leaders-bases'].maxY = Math.max(updatedBounds['leaders-bases'].maxY, newMaxY);
                            }
                        }
                        setCardPositions(updatedPositions);
                        setSectionBounds(updatedBounds);
                    }
                }
            }
        }
    }["DeckBuilder.useEffect"], [
        allSetCards,
        cardPositions,
        sectionBounds,
        setCode
    ]);
    // Save deck builder state to sessionStorage and database whenever it changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeckBuilder.useEffect": ()=>{
            // Save state if we have card positions OR if leader/base selection changes
            // This ensures state is saved even when only leader/base changes
            if (Object.keys(cardPositions).length > 0 || activeLeader || activeBase) {
                // Determine which cards are in deck vs sideboard
                const deckCardIds = Object.entries(cardPositions).filter({
                    "DeckBuilder.useEffect.deckCardIds": ([_, pos])=>pos.section === 'deck'
                }["DeckBuilder.useEffect.deckCardIds"]).map({
                    "DeckBuilder.useEffect.deckCardIds": ([cardId, _])=>cardId
                }["DeckBuilder.useEffect.deckCardIds"]);
                const sideboardCardIds = Object.entries(cardPositions).filter({
                    "DeckBuilder.useEffect.sideboardCardIds": ([_, pos])=>pos.section === 'sideboard'
                }["DeckBuilder.useEffect.sideboardCardIds"]).map({
                    "DeckBuilder.useEffect.sideboardCardIds": ([cardId, _])=>cardId
                }["DeckBuilder.useEffect.sideboardCardIds"]);
                const stateToSave = {
                    cardPositions: Object.keys(cardPositions).length > 0 ? cardPositions : {},
                    sectionLabels,
                    sectionBounds,
                    canvasHeight,
                    aspectFilters,
                    sortOption,
                    activeLeader,
                    activeBase,
                    deckCardIds,
                    sideboardCardIds
                };
                const stateJson = JSON.stringify(stateToSave);
                sessionStorage.setItem('deckBuilderState', stateJson);
                // Also save to pool if onStateChange callback is provided
                if (onStateChange) {
                    onStateChange(stateToSave);
                }
            }
        }
    }["DeckBuilder.useEffect"], [
        cardPositions,
        sectionLabels,
        sectionBounds,
        canvasHeight,
        aspectFilters,
        sortOption,
        activeLeader,
        activeBase,
        onStateChange
    ]);
    // Cleanup: Remove any bases/leaders from deck/sideboard sections and move cards based on enabled state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeckBuilder.useEffect": ()=>{
            setCardPositions({
                "DeckBuilder.useEffect": (prev)=>{
                    const updated = {
                        ...prev
                    };
                    const toRemove = [];
                    Object.keys(updated).forEach({
                        "DeckBuilder.useEffect": (cardId)=>{
                            const pos = updated[cardId];
                            // Remove bases and leaders from deck/sideboard sections
                            if ((pos.section === 'deck' || pos.section === 'sideboard') && (pos.card.isBase || pos.card.isLeader)) {
                                toRemove.push(cardId);
                                return;
                            }
                            // Move cards between deck and sideboard based on enabled state
                            if (pos.section === 'deck' || pos.section === 'sideboard') {
                                const isEnabled = pos.enabled !== false;
                                const shouldBeInDeck = isEnabled;
                                if (shouldBeInDeck && pos.section === 'sideboard') {
                                    // Move from sideboard to deck (card is enabled)
                                    updated[cardId] = {
                                        ...pos,
                                        section: 'deck',
                                        enabled: true
                                    };
                                } else if (!shouldBeInDeck && pos.section === 'deck') {
                                    // Move from deck to sideboard (card is disabled)
                                    updated[cardId] = {
                                        ...pos,
                                        section: 'sideboard',
                                        enabled: false
                                    };
                                } else {
                                // Keep in current section, enabled state already matches section
                                // No change needed
                                }
                            }
                        }
                    }["DeckBuilder.useEffect"]);
                    // Remove invalid cards
                    toRemove.forEach({
                        "DeckBuilder.useEffect": (cardId)=>{
                            delete updated[cardId];
                        }
                    }["DeckBuilder.useEffect"]);
                    return updated;
                }
            }["DeckBuilder.useEffect"]);
        }
    }["DeckBuilder.useEffect"], [
        aspectFilters,
        cardMatchesFilters
    ]);
    // Find cards that are touching a given card
    const findTouchingCards = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DeckBuilder.useCallback[findTouchingCards]": (cardId, positions)=>{
            const card = positions[cardId];
            if (!card) return new Set();
            const touching = new Set([
                cardId
            ]);
            const cardWidth = card.card.isLeader || card.card.isBase ? 168 : 120;
            const cardHeight = card.card.isLeader || card.card.isBase ? 120 : 168;
            const threshold = 5 // Pixels of overlap/adjacency to consider "touching"
            ;
            const cardLeft = card.x;
            const cardRight = card.x + cardWidth;
            const cardTop = card.y;
            const cardBottom = card.y + cardHeight;
            // Check all other cards in the same section
            Object.entries(positions).forEach({
                "DeckBuilder.useCallback[findTouchingCards]": ([otherId, otherPos])=>{
                    if (otherId === cardId || !otherPos.visible) return;
                    if (otherPos.section !== card.section) return;
                    const otherWidth = otherPos.card.isLeader || otherPos.card.isBase ? 168 : 120;
                    const otherHeight = otherPos.card.isLeader || otherPos.card.isBase ? 120 : 168;
                    const otherLeft = otherPos.x;
                    const otherRight = otherPos.x + otherWidth;
                    const otherTop = otherPos.y;
                    const otherBottom = otherPos.y + otherHeight;
                    // Check if cards are touching (overlapping or adjacent within threshold)
                    const horizontalOverlap = !(cardRight < otherLeft - threshold || cardLeft > otherRight + threshold);
                    const verticalOverlap = !(cardBottom < otherTop - threshold || cardTop > otherBottom + threshold);
                    if (horizontalOverlap && verticalOverlap) {
                        touching.add(otherId);
                    }
                }
            }["DeckBuilder.useCallback[findTouchingCards]"]);
            return touching;
        }
    }["DeckBuilder.useCallback[findTouchingCards]"], []);
    // Apply sorting - separate deck and sideboard
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeckBuilder.useEffect": ()=>{
            if (sortOption === 'aspect') return; // Aspect sorting is handled in rendering, not here
            setCardPositions({
                "DeckBuilder.useEffect": (prev)=>{
                    // Separate deck and sideboard cards
                    const deckCards = Object.entries(prev).filter({
                        "DeckBuilder.useEffect.deckCards": ([_, pos])=>pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader
                    }["DeckBuilder.useEffect.deckCards"]).map({
                        "DeckBuilder.useEffect.deckCards": ([id, pos])=>({
                                id,
                                ...pos
                            })
                    }["DeckBuilder.useEffect.deckCards"]);
                    const sideboardCards = Object.entries(prev).filter({
                        "DeckBuilder.useEffect.sideboardCards": ([_, pos])=>pos.section === 'sideboard' && pos.visible && !pos.card.isBase && !pos.card.isLeader
                    }["DeckBuilder.useEffect.sideboardCards"]).map({
                        "DeckBuilder.useEffect.sideboardCards": ([id, pos])=>({
                                id,
                                ...pos
                            })
                    }["DeckBuilder.useEffect.sideboardCards"]);
                    // Get sorted deck cards (only deck section)
                    // Note: No longer filtering - cards are moved between deck/sideboard via filter checkboxes
                    const deckSorted = deckCards.map({
                        "DeckBuilder.useEffect.deckSorted": ({ card })=>card
                    }["DeckBuilder.useEffect.deckSorted"]);
                    const sortedDeckIds = deckSorted.map({
                        "DeckBuilder.useEffect.sortedDeckIds": (card)=>{
                            const entry = deckCards.find({
                                "DeckBuilder.useEffect.sortedDeckIds.entry": ({ card: c })=>c.id === card.id || c.name === card.name
                            }["DeckBuilder.useEffect.sortedDeckIds.entry"]);
                            return entry?.id;
                        }
                    }["DeckBuilder.useEffect.sortedDeckIds"]).filter(Boolean);
                    // Get sorted sideboard cards
                    // Note: No longer filtering - cards are moved between deck/sideboard via filter checkboxes
                    const sideboardSorted = sideboardCards.map({
                        "DeckBuilder.useEffect.sideboardSorted": ({ card })=>card
                    }["DeckBuilder.useEffect.sideboardSorted"]);
                    const sortedSideboardIds = sideboardSorted.map({
                        "DeckBuilder.useEffect.sortedSideboardIds": (card)=>{
                            const entry = sideboardCards.find({
                                "DeckBuilder.useEffect.sortedSideboardIds.entry": ({ card: c })=>c.id === card.id || c.name === card.name
                            }["DeckBuilder.useEffect.sortedSideboardIds.entry"]);
                            return entry?.id;
                        }
                    }["DeckBuilder.useEffect.sortedSideboardIds"]).filter(Boolean);
                    const updated = {
                        ...prev
                    };
                    const cardWidth = 120;
                    const cardHeight = 168;
                    const spacing = 20;
                    const padding = 50;
                    const sectionSpacing = 80;
                    const cardsPerRow = Math.floor((window.innerWidth - 100) / (cardWidth + spacing));
                    // Get deck section bounds
                    const deckBounds = sectionBounds.deck || {
                        minY: padding,
                        maxY: padding + 500,
                        minX: padding,
                        maxX: window.innerWidth - padding
                    };
                    let deckY = deckBounds.minY;
                    // Get sideboard section bounds (after deck)
                    const sideboardStartY = deckBounds.maxY + sectionSpacing + 30;
                    let sideboardY = sideboardStartY;
                    // Helper function to sort cards
                    const sortCards = {
                        "DeckBuilder.useEffect.sortCards": (cards)=>{
                            if (sortOption === 'cost') {
                                return [
                                    ...cards
                                ].sort({
                                    "DeckBuilder.useEffect.sortCards": (a, b)=>(a.cost || 0) - (b.cost || 0)
                                }["DeckBuilder.useEffect.sortCards"]);
                            } else if (sortOption === 'aspect') {
                                // Sort by aspect key directly
                                return [
                                    ...cards
                                ].sort({
                                    "DeckBuilder.useEffect.sortCards": (a, b)=>{
                                        const keyA = getAspectKey(a);
                                        const keyB = getAspectKey(b);
                                        return keyA.localeCompare(keyB);
                                    }
                                }["DeckBuilder.useEffect.sortCards"]);
                            } else if (sortOption === 'type') {
                                // Handle both "Unit" and "Ground Unit"/"Space Unit" types
                                const getTypeOrder = {
                                    "DeckBuilder.useEffect.sortCards.getTypeOrder": (type)=>{
                                        if (type === 'Unit' || type === 'Ground Unit') return 1;
                                        if (type === 'Space Unit') return 2;
                                        if (type === 'Upgrade') return 3;
                                        if (type === 'Event') return 4;
                                        return 99;
                                    }
                                }["DeckBuilder.useEffect.sortCards.getTypeOrder"];
                                return [
                                    ...cards
                                ].sort({
                                    "DeckBuilder.useEffect.sortCards": (a, b)=>{
                                        const aOrder = getTypeOrder(a.type || '');
                                        const bOrder = getTypeOrder(b.type || '');
                                        if (aOrder !== bOrder) return aOrder - bOrder;
                                        return (a.cost || 0) - (b.cost || 0);
                                    }
                                }["DeckBuilder.useEffect.sortCards"]);
                            }
                            return cards;
                        }
                    }["DeckBuilder.useEffect.sortCards"];
                    // Helper function to position cards in a section
                    const positionCards = {
                        "DeckBuilder.useEffect.positionCards": (cardIds, startY, sectionName)=>{
                            if (cardIds.length === 0) return startY;
                            const cards = cardIds.map({
                                "DeckBuilder.useEffect.positionCards.cards": (id)=>updated[id]?.card
                            }["DeckBuilder.useEffect.positionCards.cards"]).filter(Boolean);
                            const sortedCards = sortCards(cards);
                            const sortedCardIds = sortedCards.map({
                                "DeckBuilder.useEffect.positionCards.sortedCardIds": (card)=>{
                                    return cardIds.find({
                                        "DeckBuilder.useEffect.positionCards.sortedCardIds": (id)=>{
                                            const c = updated[id]?.card;
                                            return c && (c.id === card.id || c.name === card.name);
                                        }
                                    }["DeckBuilder.useEffect.positionCards.sortedCardIds"]);
                                }
                            }["DeckBuilder.useEffect.positionCards.sortedCardIds"]).filter(Boolean);
                            if (sortOption === 'cost') {
                                // Vertical columns by cost
                                const costGroups = {};
                                sortedCardIds.forEach({
                                    "DeckBuilder.useEffect.positionCards": (cardId)=>{
                                        const card = updated[cardId]?.card;
                                        if (!card) return;
                                        const cost = card.cost || 0;
                                        if (!costGroups[cost]) costGroups[cost] = [];
                                        costGroups[cost].push(cardId);
                                    }
                                }["DeckBuilder.useEffect.positionCards"]);
                                let col = 0;
                                let maxRow = 0;
                                Object.keys(costGroups).sort({
                                    "DeckBuilder.useEffect.positionCards": (a, b)=>a - b
                                }["DeckBuilder.useEffect.positionCards"]).forEach({
                                    "DeckBuilder.useEffect.positionCards": (cost)=>{
                                        costGroups[cost].forEach({
                                            "DeckBuilder.useEffect.positionCards": (cardId, idx)=>{
                                                if (updated[cardId]) {
                                                    const row = idx;
                                                    maxRow = Math.max(maxRow, row);
                                                    updated[cardId] = {
                                                        ...updated[cardId],
                                                        x: padding + col * (cardWidth + spacing),
                                                        y: startY + row * (cardHeight + spacing),
                                                        section: sectionName
                                                    };
                                                }
                                            }
                                        }["DeckBuilder.useEffect.positionCards"]);
                                        col++;
                                    }
                                }["DeckBuilder.useEffect.positionCards"]);
                                return startY + (maxRow + 1) * (cardHeight + spacing);
                            } else if (sortOption === 'aspect') {
                                // Group by aspect combination
                                const aspectGroups = {};
                                sortedCardIds.forEach({
                                    "DeckBuilder.useEffect.positionCards": (cardId)=>{
                                        const card = updated[cardId]?.card;
                                        if (!card) return;
                                        const key = getAspectKey(card);
                                        if (!aspectGroups[key]) aspectGroups[key] = [];
                                        aspectGroups[key].push(cardId);
                                    }
                                }["DeckBuilder.useEffect.positionCards"]);
                                let currentY = startY;
                                const sortedKeys = Object.keys(aspectGroups).sort();
                                sortedKeys.forEach({
                                    "DeckBuilder.useEffect.positionCards": (key)=>{
                                        const group = aspectGroups[key];
                                        group.forEach({
                                            "DeckBuilder.useEffect.positionCards": (cardId, idx)=>{
                                                if (updated[cardId]) {
                                                    updated[cardId] = {
                                                        ...updated[cardId],
                                                        x: padding,
                                                        y: currentY + idx * (cardHeight + spacing),
                                                        section: sectionName
                                                    };
                                                }
                                            }
                                        }["DeckBuilder.useEffect.positionCards"]);
                                        const groupHeight = group.length * (cardHeight + spacing);
                                        currentY += groupHeight + sectionSpacing;
                                    }
                                }["DeckBuilder.useEffect.positionCards"]);
                                return currentY;
                            } else {
                                // Grid layout - compact layout (fill gaps)
                                sortedCardIds.forEach({
                                    "DeckBuilder.useEffect.positionCards": (cardId, index)=>{
                                        if (cardId && updated[cardId]) {
                                            const row = Math.floor(index / cardsPerRow);
                                            const col = index % cardsPerRow;
                                            updated[cardId] = {
                                                ...updated[cardId],
                                                x: padding + col * (cardWidth + spacing),
                                                y: startY + row * (cardHeight + spacing),
                                                section: sectionName
                                            };
                                        }
                                    }
                                }["DeckBuilder.useEffect.positionCards"]);
                                const rows = Math.ceil(sortedCardIds.length / cardsPerRow);
                                return startY + rows * (cardHeight + spacing);
                            }
                        }
                    }["DeckBuilder.useEffect.positionCards"];
                    // Position deck cards
                    const deckEndY = positionCards(sortedDeckIds, deckY, 'deck');
                    // Position sideboard cards
                    const sideboardEndY = positionCards(sortedSideboardIds, sideboardY, 'sideboard');
                    // Update section bounds and canvas height
                    const newDeckBounds = {
                        ...deckBounds,
                        maxY: deckEndY
                    };
                    const newSideboardBounds = {
                        minY: sideboardY,
                        maxY: sideboardEndY,
                        minX: padding,
                        maxX: window.innerWidth - padding
                    };
                    setSectionBounds({
                        "DeckBuilder.useEffect": (prev)=>({
                                ...prev,
                                deck: newDeckBounds,
                                sideboard: newSideboardBounds
                            })
                    }["DeckBuilder.useEffect"]);
                    // Update canvas height to include both sections
                    const maxY = Math.max(deckEndY, sideboardEndY);
                    setCanvasHeight(maxY + padding);
                    return updated;
                }
            }["DeckBuilder.useEffect"]);
        }
    }["DeckBuilder.useEffect"], [
        sortOption,
        cardMatchesFilters,
        getAspectKey,
        sectionBounds
    ]);
    const handleMouseDown = (e, cardId)=>{
        if (e.button !== 0) return; // Only left click
        e.preventDefault();
        e.stopPropagation();
        if (!cardId) return;
        const card = cardPositions[cardId];
        if (!card) return;
        // Reset drag flag at start of mouse down
        hasDraggedRef.current = false;
        // Handle leaders and bases - they can't be dragged, only selected
        if (card.section === 'leaders-bases' && card.card.isLeader) {
            // Toggle selection - clicking same card deselects
            setActiveLeader(cardId === activeLeader ? null : cardId);
            return;
        }
        if (card.section === 'leaders-bases' && card.card.isBase) {
            // Toggle selection - clicking same card deselects
            setActiveBase(cardId === activeBase ? null : cardId);
            return;
        }
        // For other cards, allow normal dragging and selection
        const isModifierPressed = e.metaKey || e.ctrlKey;
        if (isModifierPressed) {
            // Multi-select (only within same section)
            // Bring to front
            setZIndexCounter((prev)=>{
                const newZ = prev + 1;
                setCardPositions((prevPos)=>({
                        ...prevPos,
                        [cardId]: {
                            ...prevPos[cardId],
                            zIndex: newZ
                        }
                    }));
                return newZ;
            });
            setSelectedCards((prev)=>{
                const newSet = new Set(prev);
                // If selecting a card from a different section, clear and start new selection
                if (prev.size > 0) {
                    const firstCard = cardPositions[Array.from(prev)[0]];
                    if (firstCard && firstCard.section !== card.section) {
                        newSet.clear();
                    }
                }
                if (newSet.has(cardId)) {
                    newSet.delete(cardId);
                } else {
                    newSet.add(cardId);
                }
                return newSet;
            });
            return;
        }
        // Bring to front
        setZIndexCounter((prev)=>{
            const newZ = prev + 1;
            setCardPositions((prevPos)=>({
                    ...prevPos,
                    [cardId]: {
                        ...prevPos[cardId],
                        zIndex: newZ
                    }
                }));
            return newZ;
        });
        const rect = canvasRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left - card.x;
        const offsetY = e.clientY - rect.top - card.y;
        // Check if shift is pressed for group drag
        const isShiftPressed = e.shiftKey;
        setIsShiftDrag(isShiftPressed);
        // If shift is pressed, find all touching cards
        if (isShiftPressed) {
            const touching = findTouchingCards(cardId, cardPositions);
            setTouchingCards(touching);
            setSelectedCards(touching);
        } else {
            setTouchingCards(new Set());
            if (!isModifierPressed && !selectedCards.has(cardId)) {
                setSelectedCards(new Set([
                    cardId
                ]));
            }
        }
        setDraggedCard(cardId);
        setDragOffset({
            x: offsetX,
            y: offsetY
        });
        hasDraggedRef.current = false;
    };
    const handleCanvasMouseDown = (e)=>{
        if (e.button !== 0) return;
        if (e.target === canvasRef.current || e.target.classList.contains('deck-canvas')) {
            const rect = canvasRef.current.getBoundingClientRect();
            const startX = e.clientX - rect.left;
            const startY = e.clientY - rect.top;
            setIsSelecting(true);
            setSelectionBox({
                startX,
                startY,
                endX: startX,
                endY: startY
            });
            setSelectedCards(new Set());
        }
    };
    const handleMouseMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DeckBuilder.useCallback[handleMouseMove]": (e)=>{
            if (isSelecting && selectionBox) {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;
                const endX = e.clientX - rect.left;
                const endY = e.clientY - rect.top;
                setSelectionBox({
                    "DeckBuilder.useCallback[handleMouseMove]": (prev)=>prev ? {
                            ...prev,
                            endX,
                            endY
                        } : null
                }["DeckBuilder.useCallback[handleMouseMove]"]);
                // Select cards in box
                const minX = Math.min(selectionBox.startX, endX);
                const maxX = Math.max(selectionBox.startX, endX);
                const minY = Math.min(selectionBox.startY, endY);
                const maxY = Math.max(selectionBox.startY, endY);
                const newSelected = new Set();
                Object.entries(cardPositions).forEach({
                    "DeckBuilder.useCallback[handleMouseMove]": ([cardId, pos])=>{
                        if (!pos.visible) return;
                        const cardWidth = pos.card.isLeader || pos.card.isBase ? 168 : 120;
                        const cardHeight = pos.card.isLeader || pos.card.isBase ? 120 : 168;
                        const cardRight = pos.x + cardWidth;
                        const cardBottom = pos.y + cardHeight;
                        if (pos.x < maxX && cardRight > minX && pos.y < maxY && cardBottom > minY) {
                            newSelected.add(cardId);
                        }
                    }
                }["DeckBuilder.useCallback[handleMouseMove]"]);
                // Only select cards from the same section if multiple are selected
                if (newSelected.size > 1) {
                    const sections = new Set(Array.from(newSelected).map({
                        "DeckBuilder.useCallback[handleMouseMove]": (id)=>cardPositions[id]?.section
                    }["DeckBuilder.useCallback[handleMouseMove]"]));
                    if (sections.size > 1) {
                        // If multiple sections, only keep cards from the first section found
                        const firstSection = Array.from(newSelected)[0] ? cardPositions[Array.from(newSelected)[0]]?.section : null;
                        const filtered = new Set();
                        newSelected.forEach({
                            "DeckBuilder.useCallback[handleMouseMove]": (id)=>{
                                if (cardPositions[id]?.section === firstSection) {
                                    filtered.add(id);
                                }
                            }
                        }["DeckBuilder.useCallback[handleMouseMove]"]);
                        setSelectedCards(filtered);
                        return;
                    }
                }
                setSelectedCards(newSelected);
            } else if (draggedCard) {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;
                hasDraggedRef.current = true;
                setCardPositions({
                    "DeckBuilder.useCallback[handleMouseMove]": (prev)=>{
                        const currentCard = prev[draggedCard];
                        if (!currentCard) return prev;
                        const newX = e.clientX - rect.left - dragOffset.x;
                        const newY = e.clientY - rect.top - dragOffset.y;
                        const cardWidth = currentCard.card.isLeader || currentCard.card.isBase ? 168 : 120;
                        const cardHeight = currentCard.card.isLeader || currentCard.card.isBase ? 120 : 168;
                        // Get section bounds for this card
                        const section = currentCard.section;
                        const bounds = sectionBounds[section];
                        if (!bounds) return prev;
                        // Constrain to section boundaries
                        const minX = bounds.minX;
                        const maxX = bounds.maxX - cardWidth;
                        const minY = bounds.minY;
                        const maxY = bounds.maxY - cardHeight;
                        const constrainedX = Math.max(minX, Math.min(newX, maxX));
                        const constrainedY = Math.max(minY, Math.min(newY, maxY));
                        const updates = {
                            ...prev
                        };
                        // Determine which cards to move
                        let cardsToMove = new Set([
                            draggedCard
                        ]);
                        if (isShiftDrag && touchingCards.size > 0) {
                            // Shift+drag: move all touching cards
                            cardsToMove = touchingCards;
                        } else if (selectedCards.has(draggedCard) && selectedCards.size > 1) {
                            // Normal multi-select: move all selected cards
                            cardsToMove = selectedCards;
                        }
                        // Move all cards together (only if they're in the same section)
                        if (cardsToMove.size > 1) {
                            const deltaX = constrainedX - currentCard.x;
                            const deltaY = constrainedY - currentCard.y;
                            cardsToMove.forEach({
                                "DeckBuilder.useCallback[handleMouseMove]": (id)=>{
                                    if (updates[id] && updates[id].section === section) {
                                        const cardW = updates[id].card.isLeader || updates[id].card.isBase ? 168 : 120;
                                        const cardH = updates[id].card.isLeader || updates[id].card.isBase ? 120 : 168;
                                        const newCardX = Math.max(minX, Math.min(updates[id].x + deltaX, bounds.maxX - cardW));
                                        const newCardY = Math.max(minY, Math.min(updates[id].y + deltaY, bounds.maxY - cardH));
                                        updates[id] = {
                                            ...updates[id],
                                            x: newCardX,
                                            y: newCardY
                                        };
                                    }
                                }
                            }["DeckBuilder.useCallback[handleMouseMove]"]);
                        } else {
                            updates[draggedCard] = {
                                ...currentCard,
                                x: constrainedX,
                                y: constrainedY
                            };
                            // Store final position for cleanup
                            finalDragPositionRef.current = {
                                x: constrainedX,
                                y: constrainedY
                            };
                        }
                        return updates;
                    }
                }["DeckBuilder.useCallback[handleMouseMove]"]);
            }
        }
    }["DeckBuilder.useCallback[handleMouseMove]"], [
        draggedCard,
        dragOffset,
        selectedCards,
        cardPositions,
        isSelecting,
        selectionBox,
        sectionBounds,
        isShiftDrag,
        touchingCards,
        findTouchingCards
    ]);
    const handleMouseUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DeckBuilder.useCallback[handleMouseUp]": ()=>{
            if (isSelecting) {
                setIsSelecting(false);
                setSelectionBox(null);
            }
            // Handle click-toggle for deck/sideboard cards if no drag occurred
            if (draggedCard && !hasDraggedRef.current) {
                const card = cardPositions[draggedCard];
                if (card && (card.section === 'deck' || card.section === 'sideboard')) {
                    // Simple click (no drag) - toggle between deck and sideboard
                    setHoveredCard(null); // Clear hover state when card is moved
                    setCardPositions({
                        "DeckBuilder.useCallback[handleMouseUp]": (prev)=>({
                                ...prev,
                                [draggedCard]: {
                                    ...prev[draggedCard],
                                    section: prev[draggedCard].section === 'deck' ? 'sideboard' : 'deck',
                                    enabled: prev[draggedCard].section === 'deck' ? false : true
                                }
                            })
                    }["DeckBuilder.useCallback[handleMouseUp]"]);
                    setDraggedCard(null);
                    setDragOffset({
                        x: 0,
                        y: 0
                    });
                    return;
                }
            }
            if (draggedCard) {
                const currentDraggedCard = draggedCard;
                const finalPos = finalDragPositionRef.current;
                // Cleanup overlap
                setCardPositions({
                    "DeckBuilder.useCallback[handleMouseUp]": (prev)=>{
                        const draggedCardPos = prev[currentDraggedCard];
                        if (!draggedCardPos) return prev;
                        // Use final position from ref if available, otherwise use current position
                        const dragX = finalPos ? finalPos.x : draggedCardPos.x;
                        const dragY = finalPos ? finalPos.y : draggedCardPos.y;
                        const draggedWidth = draggedCardPos.card.isLeader || draggedCardPos.card.isBase ? 168 : 120;
                        const draggedHeight = draggedCardPos.card.isLeader || draggedCardPos.card.isBase ? 120 : 168;
                        const draggedLeft = dragX;
                        const draggedRight = dragX + draggedWidth;
                        const draggedTop = dragY;
                        const draggedBottom = dragY + draggedHeight;
                        const draggedCenterX = dragX + draggedWidth / 2;
                        const draggedCenterY = dragY + draggedHeight / 2;
                        // Find all cards that the dragged card overlaps with (in the same section)
                        const overlappingCards = [];
                        Object.entries(prev).forEach({
                            "DeckBuilder.useCallback[handleMouseUp]": ([cardId, pos])=>{
                                if (cardId === currentDraggedCard || !pos.visible || pos.section !== draggedCardPos.section) return;
                                const cardWidth = pos.card.isLeader || pos.card.isBase ? 168 : 120;
                                const cardHeight = pos.card.isLeader || pos.card.isBase ? 120 : 168;
                                const cardLeft = pos.x;
                                const cardRight = pos.x + cardWidth;
                                const cardTop = pos.y;
                                const cardBottom = pos.y + cardHeight;
                                // Check if dragged card's center is inside this card (more reliable)
                                const centerOverlap = draggedCenterX >= cardLeft && draggedCenterX <= cardRight && draggedCenterY >= cardTop && draggedCenterY <= cardBottom;
                                // Also check if cards have significant overlap (at least 20% area overlap)
                                const overlapX = Math.max(0, Math.min(draggedRight, cardRight) - Math.max(draggedLeft, cardLeft));
                                const overlapY = Math.max(0, Math.min(draggedBottom, cardBottom) - Math.max(draggedTop, cardTop));
                                const overlapArea = overlapX * overlapY;
                                const draggedArea = draggedWidth * draggedHeight;
                                const significantOverlap = overlapArea > draggedArea * 0.2;
                                if (centerOverlap || significantOverlap) {
                                    overlappingCards.push({
                                        cardId,
                                        pos
                                    });
                                }
                            }
                        }["DeckBuilder.useCallback[handleMouseUp]"]);
                        // If there are overlapping cards, cleanup
                        if (overlappingCards.length > 0) {
                            const updates = {
                                ...prev
                            };
                            // First, update the dragged card's position to its final position
                            updates[currentDraggedCard] = {
                                ...draggedCardPos,
                                x: dragX,
                                y: dragY
                            };
                            // Create updated position object for sorting
                            const updatedDraggedPos = {
                                ...draggedCardPos,
                                x: dragX,
                                y: dragY
                            };
                            // Include the dragged card and all overlapping cards
                            const allCardsToCleanup = [
                                {
                                    cardId: currentDraggedCard,
                                    pos: updatedDraggedPos
                                },
                                ...overlappingCards
                            ];
                            // Remove duplicates by cardId
                            const uniqueCardsMap = new Map();
                            allCardsToCleanup.forEach({
                                "DeckBuilder.useCallback[handleMouseUp]": ({ cardId, pos })=>{
                                    uniqueCardsMap.set(cardId, {
                                        cardId,
                                        pos
                                    });
                                }
                            }["DeckBuilder.useCallback[handleMouseUp]"]);
                            const uniqueCardsArray = Array.from(uniqueCardsMap.values());
                            // Sort by current Y position, then X position to maintain visual order
                            uniqueCardsArray.sort({
                                "DeckBuilder.useCallback[handleMouseUp]": (a, b)=>{
                                    const yDiff = a.pos.y - b.pos.y;
                                    if (Math.abs(yDiff) < 50) {
                                        return a.pos.x - b.pos.x;
                                    }
                                    return yDiff;
                                }
                            }["DeckBuilder.useCallback[handleMouseUp]"]);
                            // Find the leftmost X position of all cards
                            const leftmostX = Math.min(...uniqueCardsArray.map({
                                "DeckBuilder.useCallback[handleMouseUp].leftmostX": (c)=>c.pos.x
                            }["DeckBuilder.useCallback[handleMouseUp].leftmostX"]));
                            // Get the topmost Y position
                            const topmostY = Math.min(...uniqueCardsArray.map({
                                "DeckBuilder.useCallback[handleMouseUp].topmostY": (c)=>c.pos.y
                            }["DeckBuilder.useCallback[handleMouseUp].topmostY"]));
                            // Get section bounds
                            const section = draggedCardPos.section;
                            const bounds = sectionBounds[section];
                            if (bounds) {
                                // Left align and stack vertically with 15px spacing
                                const stackSpacing = 15;
                                let currentY = topmostY;
                                uniqueCardsArray.forEach({
                                    "DeckBuilder.useCallback[handleMouseUp]": ({ cardId, pos })=>{
                                        const cardHeight = pos.card.isLeader || pos.card.isBase ? 120 : 168;
                                        const cardWidth = pos.card.isLeader || pos.card.isBase ? 168 : 120;
                                        const constrainedX = Math.max(bounds.minX, Math.min(leftmostX, bounds.maxX - cardWidth));
                                        const constrainedY = Math.max(bounds.minY, Math.min(currentY, bounds.maxY - cardHeight));
                                        // Preserve all properties from the current position
                                        updates[cardId] = {
                                            ...updates[cardId] || pos,
                                            x: constrainedX,
                                            y: constrainedY
                                        };
                                        currentY = constrainedY + cardHeight + stackSpacing;
                                    }
                                }["DeckBuilder.useCallback[handleMouseUp]"]);
                                return updates;
                            }
                        }
                        return prev;
                    }
                }["DeckBuilder.useCallback[handleMouseUp]"]);
                // Clear the final position ref
                finalDragPositionRef.current = null;
                hasDraggedRef.current = false;
                setDraggedCard(null);
                setDragOffset({
                    x: 0,
                    y: 0
                });
                setIsShiftDrag(false);
                setTouchingCards(new Set());
            }
        }
    }["DeckBuilder.useCallback[handleMouseUp]"], [
        isSelecting,
        draggedCard,
        sectionBounds,
        cardPositions
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeckBuilder.useEffect": ()=>{
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return ({
                "DeckBuilder.useEffect": ()=>{
                    window.removeEventListener('mousemove', handleMouseMove);
                    window.removeEventListener('mouseup', handleMouseUp);
                }
            })["DeckBuilder.useEffect"];
        }
    }["DeckBuilder.useEffect"], [
        handleMouseMove,
        handleMouseUp
    ]);
    // Mark the last block in each row to expand
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeckBuilder.useEffect": ()=>{
            if (!deckExpanded || !deckBlocksRowRef.current) return;
            const markLastInRow = {
                "DeckBuilder.useEffect.markLastInRow": ()=>{
                    const blocks = deckBlocksRowRef.current?.querySelectorAll('.card-block');
                    if (!blocks || blocks.length === 0) return;
                    // Remove previous markers
                    blocks.forEach({
                        "DeckBuilder.useEffect.markLastInRow": (block)=>block.classList.remove('last-in-row')
                    }["DeckBuilder.useEffect.markLastInRow"]);
                    // Group blocks by row (same top position)
                    const rows = new Map();
                    blocks.forEach({
                        "DeckBuilder.useEffect.markLastInRow": (block)=>{
                            const rect = block.getBoundingClientRect();
                            const top = Math.round(rect.top);
                            if (!rows.has(top)) {
                                rows.set(top, []);
                            }
                            rows.get(top).push(block);
                        }
                    }["DeckBuilder.useEffect.markLastInRow"]);
                    // Mark the last block in each row
                    rows.forEach({
                        "DeckBuilder.useEffect.markLastInRow": (rowBlocks)=>{
                            if (rowBlocks.length > 0) {
                                rowBlocks[rowBlocks.length - 1].classList.add('last-in-row');
                            }
                        }
                    }["DeckBuilder.useEffect.markLastInRow"]);
                }
            }["DeckBuilder.useEffect.markLastInRow"];
            // Run after a short delay to ensure layout is complete
            const timeoutId = setTimeout(markLastInRow, 100);
            // Also run on resize
            window.addEventListener('resize', markLastInRow);
            return ({
                "DeckBuilder.useEffect": ()=>{
                    clearTimeout(timeoutId);
                    window.removeEventListener('resize', markLastInRow);
                }
            })["DeckBuilder.useEffect"];
        }
    }["DeckBuilder.useEffect"], [
        deckExpanded,
        cardPositions,
        sortOption
    ]);
    const getRarityColor = (rarity)=>{
        switch(rarity){
            case 'Common':
                return '#999';
            case 'Uncommon':
                return '#4CAF50';
            case 'Rare':
                return '#2196F3';
            case 'Legendary':
                return '#FF9800';
            default:
                return '#666';
        }
    };
    // Table sorting functions - per section
    const handleTableSort = (sectionId, field)=>{
        setTableSort((prev)=>{
            const sectionSort = prev[sectionId] || {
                field: null,
                direction: 'asc'
            };
            if (sectionSort.field === field) {
                return {
                    ...prev,
                    [sectionId]: {
                        field,
                        direction: sectionSort.direction === 'asc' ? 'desc' : 'asc'
                    }
                };
            }
            return {
                ...prev,
                [sectionId]: {
                    field,
                    direction: 'asc'
                }
            };
        });
    };
    const getSortArrow = (sectionId, field)=>{
        const sectionSort = tableSort[sectionId] || {
            field: null,
            direction: 'asc'
        };
        if (sectionSort.field !== field) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "sort-arrow",
                children: "↕"
            }, void 0, false, {
                fileName: "[project]/src/components/DeckBuilder.jsx",
                lineNumber: 1842,
                columnNumber: 14
            }, this);
        }
        return sectionSort.direction === 'asc' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "sort-arrow",
            children: "↑"
        }, void 0, false, {
            fileName: "[project]/src/components/DeckBuilder.jsx",
            lineNumber: 1844,
            columnNumber: 46
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "sort-arrow",
            children: "↓"
        }, void 0, false, {
            fileName: "[project]/src/components/DeckBuilder.jsx",
            lineNumber: 1844,
            columnNumber: 86
        }, this);
    };
    // Default sort function: aspect combinations, then type, then cost
    const defaultSort = (a, b)=>{
        // First: sort by aspect combination
        const aspectKeyA = getDefaultAspectSortKey(a);
        const aspectKeyB = getDefaultAspectSortKey(b);
        const aspectCompare = aspectKeyA.localeCompare(aspectKeyB);
        if (aspectCompare !== 0) return aspectCompare;
        // Second: sort by type (Unit, then Upgrade, then Event)
        // Handle both "Unit" and "Ground Unit"/"Space Unit" types
        const getTypeOrder = (type)=>{
            if (type === 'Unit' || type === 'Ground Unit') return 1;
            if (type === 'Space Unit') return 2;
            if (type === 'Upgrade') return 3;
            if (type === 'Event') return 4;
            return 99;
        };
        const aOrder = getTypeOrder(a.type || '');
        const bOrder = getTypeOrder(b.type || '');
        if (aOrder !== bOrder) return aOrder - bOrder;
        // Third: sort by cost (low to high)
        const costA = a.cost !== null && a.cost !== undefined ? a.cost : 999;
        const costB = b.cost !== null && b.cost !== undefined ? b.cost : 999;
        if (costA !== costB) return costA - costB;
        // Fourth: sort alphabetically (a before b down to z)
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
    };
    const sortTableData = (a, b, field, direction)=>{
        let aVal, bVal;
        switch(field){
            case 'name':
                aVal = (a.name || '').toLowerCase();
                bVal = (b.name || '').toLowerCase();
                break;
            case 'cost':
                aVal = a.cost !== null && a.cost !== undefined ? a.cost : -1;
                bVal = b.cost !== null && b.cost !== undefined ? b.cost : -1;
                break;
            case 'aspects':
                aVal = (a.aspects || []).join(', ').toLowerCase();
                bVal = (b.aspects || []).join(', ').toLowerCase();
                break;
            case 'rarity':
                const rarityOrder = {
                    'Common': 1,
                    'Uncommon': 2,
                    'Rare': 3,
                    'Legendary': 4
                };
                aVal = rarityOrder[a.rarity] || 0;
                bVal = rarityOrder[b.rarity] || 0;
                break;
            default:
                return 0;
        }
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    };
    // Convert card ID from hyphen format (SOR-015) to underscore format (SOR_015)
    const convertIdFormat = (id)=>{
        if (!id) return id;
        return id.replace(/-/g, '_');
    };
    // Build deck data structure
    const buildDeckData = ()=>{
        const leaderCard = activeLeader && cardPositions[activeLeader] ? cardPositions[activeLeader].card : null;
        const baseCard = activeBase && cardPositions[activeBase] ? cardPositions[activeBase].card : null;
        // Cards in deck section go to deck, cards in sideboard section go to sideboard
        // Exclude bases and leaders from pool
        const enabledCards = Object.values(cardPositions).filter((pos)=>pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader).map((pos)=>pos.card);
        const disabledCards = Object.values(cardPositions).filter((pos)=>pos.section === 'sideboard' && pos.visible && !pos.card.isBase && !pos.card.isLeader).map((pos)=>pos.card);
        // Count enabled cards by ID for deck
        const deckCounts = new Map();
        enabledCards.forEach((card)=>{
            const id = convertIdFormat(card.id);
            deckCounts.set(id, (deckCounts.get(id) || 0) + 1);
        });
        // Count disabled cards by ID for sideboard
        const sideboardCounts = new Map();
        disabledCards.forEach((card)=>{
            const id = convertIdFormat(card.id);
            sideboardCounts.set(id, (sideboardCounts.get(id) || 0) + 1);
        });
        const deck = Array.from(deckCounts.entries()).map(([id, count])=>({
                id,
                count
            }));
        const sideboard = Array.from(sideboardCounts.entries()).map(([id, count])=>({
                id,
                count
            }));
        return {
            leader: leaderCard ? {
                id: convertIdFormat(leaderCard.id),
                count: 1
            } : null,
            base: baseCard ? {
                id: convertIdFormat(baseCard.id),
                count: 1
            } : null,
            deck,
            sideboard
        };
    };
    // Export as JSON
    const exportJSON = ()=>{
        if (!activeLeader || !activeBase) {
            const missing = [];
            if (!activeLeader) missing.push('leader');
            if (!activeBase) missing.push('base');
            setErrorMessage(`Please select a ${missing.join(' and ')} before exporting.`);
            setMessageType('error');
            setTimeout(()=>{
                setErrorMessage(null);
                setMessageType(null);
                setMessageType(null);
            }, 5000);
            return;
        }
        setErrorMessage(null);
        setMessageType(null);
        const deckData = buildDeckData();
        const exportData = {
            metadata: {
                name: `Deck - ${setCode}`,
                author: "Protect the Pod"
            },
            leader: deckData.leader,
            base: deckData.base,
            deck: deckData.deck,
            sideboard: deckData.sideboard
        };
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([
            jsonString
        ], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${setCode} Sealed Deck by Protect the Pod.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    // Copy JSON to clipboard
    const copyJSON = async ()=>{
        if (!activeLeader || !activeBase) {
            const missing = [];
            if (!activeLeader) missing.push('leader');
            if (!activeBase) missing.push('base');
            setErrorMessage(`Please select a ${missing.join(' and ')} before copying.`);
            setMessageType('error');
            setTimeout(()=>{
                setErrorMessage(null);
                setMessageType(null);
                setMessageType(null);
            }, 5000);
            return;
        }
        setErrorMessage(null);
        setMessageType(null);
        const deckData = buildDeckData();
        const exportData = {
            metadata: {
                name: `Deck - ${setCode}`,
                author: "Protect the Pod"
            },
            leader: deckData.leader,
            base: deckData.base,
            deck: deckData.deck,
            sideboard: deckData.sideboard
        };
        const jsonString = JSON.stringify(exportData, null, 2);
        try {
            await navigator.clipboard.writeText(jsonString);
            setErrorMessage('JSON copied to clipboard!');
            setMessageType('success');
            setTimeout(()=>{
                setErrorMessage(null);
                setMessageType(null);
                setMessageType(null);
            }, 3000);
        } catch (err) {
            setErrorMessage('Failed to copy to clipboard');
            setMessageType('error');
            setTimeout(()=>{
                setErrorMessage(null);
                setMessageType(null);
                setMessageType(null);
            }, 3000);
        }
    };
    // Export deck as image
    const exportDeckImage = async ()=>{
        try {
            setErrorMessage('Generating image...');
            setMessageType('success');
            // Get selected leader and base
            const selectedLeader = activeLeader ? cardPositions[activeLeader]?.card : null;
            const selectedBase = activeBase ? cardPositions[activeBase]?.card : null;
            // Get deck cards (in color) - sorted by default sort
            const deckCards = Object.values(cardPositions).filter((pos)=>pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader).map((pos)=>pos.card).sort((a, b)=>defaultSort(a, b));
            // Get sideboard cards (will be grayscale) - sorted by default sort
            const sideboardCards = Object.values(cardPositions).filter((pos)=>pos.section === 'sideboard' && pos.visible && !pos.card.isBase && !pos.card.isLeader).map((pos)=>pos.card).sort((a, b)=>defaultSort(a, b));
            // Get unused leaders and bases (will be grayscale) - sorted by default sort
            const unusedLeaders = Object.entries(cardPositions).filter(([cardId, pos])=>pos.section === 'leaders-bases' && pos.visible && pos.card.isLeader && cardId !== activeLeader).map(([_, pos])=>pos.card).sort((a, b)=>defaultSort(a, b));
            const unusedBases = Object.entries(cardPositions).filter(([cardId, pos])=>{
                const card = pos.card;
                const rarity = card.rarity;
                // Only include rare bases (Rare, Legendary, or Special) - exclude common bases
                const isRareBase = rarity === 'Rare' || rarity === 'Legendary' || rarity === 'Special';
                return pos.section === 'leaders-bases' && pos.visible && card.isBase && cardId !== activeBase && isRareBase;
            }).map(([_, pos])=>pos.card).sort((a, b)=>defaultSort(a, b));
            // Card dimensions
            const cardWidth = 120;
            const cardHeight = 168;
            const leaderBaseWidth = 168;
            const leaderBaseHeight = 120;
            const spacing = 20;
            const padding = 50;
            const sectionSpacing = 40;
            const labelHeight = 30;
            const titleHeight = 50;
            const cardsPerRow = 12;
            // Calculate dimensions based on total cards (including duplicates)
            const deckRows = Math.ceil(deckCards.length / cardsPerRow);
            const sideboardRows = Math.ceil(sideboardCards.length / cardsPerRow);
            // Unused leaders - calculate how many fit per row
            const width = padding * 2 + cardsPerRow * (cardWidth + spacing) - spacing;
            const leadersPerRow = Math.floor((width - 2 * padding + spacing) / (leaderBaseWidth + spacing));
            const unusedLeadersRows = unusedLeaders.length > 0 ? Math.ceil(unusedLeaders.length / leadersPerRow) : 0;
            let currentY = padding;
            // Title at top
            currentY += titleHeight + sectionSpacing;
            // Selected leader and base at top (1 row, centered)
            if (selectedLeader || selectedBase) {
                currentY += leaderBaseHeight + sectionSpacing;
            }
            // Deck section (label + cards)
            currentY += labelHeight + deckRows * (cardHeight + spacing) + sectionSpacing;
            // Sideboard section (label + cards)
            currentY += labelHeight + sideboardRows * (cardHeight + spacing) + sectionSpacing;
            // Unused leaders section (all on one row, wraps if needed)
            currentY += unusedLeadersRows * (leaderBaseHeight + spacing) + sectionSpacing;
            // Add space for Protect the Pod stamp
            const stampHeight = 40;
            const totalHeight = currentY + stampHeight + padding;
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = totalHeight;
            const ctx = canvas.getContext('2d');
            // Draw black background
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, totalHeight);
            const cardRadius = 13 // Border radius matching app style
            ;
            // Helper to draw rounded rectangle
            const drawRoundedRect = (x, y, width, height, radius)=>{
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + width - radius, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                ctx.lineTo(x + width, y + height - radius);
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                ctx.lineTo(x + radius, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
            };
            // Helper to load and draw card image
            const drawCard = async (card, x, y, width, height, count = null, grayscale = false)=>{
                return new Promise((resolve)=>{
                    // Helper to draw placeholder
                    const drawPlaceholder = ()=>{
                        ctx.save();
                        ctx.fillStyle = grayscale ? 'rgba(50, 50, 50, 0.8)' : 'rgba(26, 26, 46, 0.8)';
                        drawRoundedRect(x, y, width, height, cardRadius);
                        ctx.fill();
                        ctx.restore();
                        ctx.fillStyle = grayscale ? 'rgba(200, 200, 200, 0.5)' : 'white';
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(card.name || 'Card', x + width / 2, y + height / 2);
                        resolve();
                    };
                    if (!card.imageUrl) {
                        drawPlaceholder();
                        return;
                    }
                    // Try to fetch image as blob first to avoid CORS issues
                    const loadImageViaBlob = async ()=>{
                        try {
                            // Try using a CORS proxy if direct fetch fails
                            let imageUrl = card.imageUrl;
                            // First try direct fetch
                            let response;
                            try {
                                response = await fetch(imageUrl, {
                                    mode: 'cors'
                                });
                            } catch (error) {
                                // If CORS fails, try using a CORS proxy
                                // Using crossorigin.me as a fallback (free CORS proxy)
                                imageUrl = `https://corsproxy.io/?${encodeURIComponent(card.imageUrl)}`;
                                response = await fetch(imageUrl, {
                                    mode: 'cors'
                                });
                            }
                            if (!response.ok) throw new Error('Failed to fetch');
                            const blob = await response.blob();
                            const objectUrl = URL.createObjectURL(blob);
                            const img = new Image();
                            img.onload = ()=>{
                                URL.revokeObjectURL(objectUrl);
                                try {
                                    // Save context state
                                    ctx.save();
                                    // Clip to rounded rectangle
                                    drawRoundedRect(x, y, width, height, cardRadius);
                                    ctx.clip();
                                    if (grayscale) {
                                        // Apply grayscale filter
                                        ctx.filter = 'grayscale(100%)';
                                    }
                                    // Draw card image
                                    ctx.drawImage(img, x, y, width, height);
                                    // Restore context (removes filter and clip)
                                    ctx.restore();
                                    // Draw count badge if count > 1
                                    if (count && count > 1) {
                                        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                                        ctx.beginPath();
                                        ctx.arc(x + width - 15, y + height - 15, 12, 0, Math.PI * 2);
                                        ctx.fill();
                                        ctx.fillStyle = 'white';
                                        ctx.font = 'bold 14px Arial';
                                        ctx.textAlign = 'center';
                                        ctx.textBaseline = 'middle';
                                        ctx.fillText(count.toString(), x + width - 15, y + height - 15);
                                    }
                                    resolve();
                                } catch (error) {
                                    console.error(`Error drawing card ${card.name}:`, error);
                                    drawPlaceholder();
                                }
                            };
                            img.onerror = ()=>{
                                URL.revokeObjectURL(objectUrl);
                                drawPlaceholder();
                            };
                            img.src = objectUrl;
                        } catch (error) {
                            // If fetch fails, try direct image load
                            console.warn(`Failed to fetch image as blob for ${card.name}, trying direct load:`, error);
                            loadImageDirect();
                        }
                    };
                    // Fallback: direct image load (may fail due to CORS)
                    const loadImageDirect = ()=>{
                        const img = new Image();
                        const timeoutId = setTimeout(()=>{
                            console.warn(`Image load timeout for ${card.name}: ${card.imageUrl}`);
                            drawPlaceholder();
                        }, 10000);
                        img.onload = ()=>{
                            clearTimeout(timeoutId);
                            try {
                                // Save context state
                                ctx.save();
                                // Clip to rounded rectangle
                                drawRoundedRect(x, y, width, height, cardRadius);
                                ctx.clip();
                                if (grayscale) {
                                    // Apply grayscale filter
                                    ctx.filter = 'grayscale(100%)';
                                }
                                // Draw card image
                                ctx.drawImage(img, x, y, width, height);
                                // Restore context (removes filter and clip)
                                ctx.restore();
                                // Draw count badge if count > 1
                                if (count && count > 1) {
                                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                                    ctx.beginPath();
                                    ctx.arc(x + width - 15, y + height - 15, 12, 0, Math.PI * 2);
                                    ctx.fill();
                                    ctx.fillStyle = 'white';
                                    ctx.font = 'bold 14px Arial';
                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'middle';
                                    ctx.fillText(count.toString(), x + width - 15, y + height - 15);
                                }
                                resolve();
                            } catch (error) {
                                console.error(`Error drawing card ${card.name}:`, error);
                                drawPlaceholder();
                            }
                        };
                        img.onerror = ()=>{
                            clearTimeout(timeoutId);
                            console.warn(`Image load error for ${card.name}: ${card.imageUrl}`);
                            drawPlaceholder();
                        };
                        // Try with CORS first
                        img.crossOrigin = 'anonymous';
                        img.src = card.imageUrl;
                    };
                    // Try blob method first (better for CORS)
                    loadImageViaBlob();
                });
            };
            currentY = padding;
            // Draw title at top
            ctx.fillStyle = 'white';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(`Sealed Pod (${setCode})`, width / 2, currentY);
            currentY += titleHeight + sectionSpacing;
            // Draw selected leader and base at top, centered in one row
            if (selectedLeader || selectedBase) {
                const totalWidth = (selectedLeader ? leaderBaseWidth : 0) + (selectedBase ? leaderBaseWidth : 0) + (selectedLeader && selectedBase ? spacing : 0);
                const startX = (width - totalWidth) / 2;
                let x = startX;
                if (selectedLeader) {
                    await drawCard(selectedLeader, x, currentY, leaderBaseWidth, leaderBaseHeight, null, false);
                    x += leaderBaseWidth + spacing;
                }
                if (selectedBase) {
                    await drawCard(selectedBase, x, currentY, leaderBaseWidth, leaderBaseHeight, null, false);
                }
                currentY += leaderBaseHeight + sectionSpacing;
            }
            // Draw "Deck" section label
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText('Deck', padding, currentY);
            currentY += labelHeight;
            // Draw deck cards (in color) - sorted by default sort, including duplicates
            let col = 0;
            let row = 0;
            for (const card of deckCards){
                const x = padding + col * (cardWidth + spacing);
                const y = currentY + row * (cardHeight + spacing);
                await drawCard(card, x, y, cardWidth, cardHeight, null, false);
                col++;
                if (col >= cardsPerRow) {
                    col = 0;
                    row++;
                }
            }
            currentY += deckRows * (cardHeight + spacing) + sectionSpacing;
            // Draw "Sideboard" section label
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText('Sideboard', padding, currentY);
            currentY += labelHeight;
            // Draw sideboard cards (in grayscale) - sorted by default sort, including duplicates
            col = 0;
            row = 0;
            for (const card of sideboardCards){
                const x = padding + col * (cardWidth + spacing);
                const y = currentY + row * (cardHeight + spacing);
                await drawCard(card, x, y, cardWidth, cardHeight, null, true);
                col++;
                if (col >= cardsPerRow) {
                    col = 0;
                    row++;
                }
            }
            currentY += sideboardRows * (cardHeight + spacing) + sectionSpacing;
            // Draw unused leaders (in grayscale) - all on one row (wraps if needed)
            if (unusedLeaders.length > 0) {
                const leadersPerRow = Math.floor((width - 2 * padding + spacing) / (leaderBaseWidth + spacing));
                col = 0;
                row = 0;
                for (const leader of unusedLeaders){
                    const x = padding + col * (leaderBaseWidth + spacing);
                    const y = currentY + row * (leaderBaseHeight + spacing);
                    await drawCard(leader, x, y, leaderBaseWidth, leaderBaseHeight, null, true);
                    col++;
                    if (col >= leadersPerRow) {
                        col = 0;
                        row++;
                    }
                }
                const unusedLeadersRows = Math.ceil(unusedLeaders.length / leadersPerRow);
                currentY += unusedLeadersRows * (leaderBaseHeight + spacing) + sectionSpacing;
            }
            // Draw pool name and timestamp at bottom
            const now = new Date();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const timeStr = `${month}/${day} ${hours}:${minutes} ${ampm}`;
            const displayName = poolName || `${setCode} ${poolType === 'draft' ? 'Draft' : 'Sealed'}`;
            // Draw pool name
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(displayName, width / 2, totalHeight - padding / 2 - 40);
            // Draw "by {username}" if available
            if (poolOwnerUsername) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = '20px Arial';
                ctx.fillText(`by ${poolOwnerUsername}`, width / 2, totalHeight - padding / 2 - 15);
            }
            // Draw timestamp below name (or below "by username" if present)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '18px Arial';
            ctx.fillText(timeStr, width / 2, totalHeight - padding / 2);
            // Show image in modal instead of downloading
            canvas.toBlob((blob)=>{
                const url = URL.createObjectURL(blob);
                setDeckImageModal(url);
                setErrorMessage('Image generated!');
                setMessageType('success');
                setTimeout(()=>{
                    setErrorMessage(null);
                    setMessageType(null);
                }, 3000);
            }, 'image/png');
        } catch (error) {
            console.error('Error generating deck image:', error);
            setErrorMessage('Failed to generate image');
            setMessageType('error');
            setTimeout(()=>{
                setErrorMessage(null);
                setMessageType(null);
            }, 3000);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "deck-builder",
        ref: containerRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "deck-builder-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "back-button",
                        onClick: onBack,
                        children: "← Back to Sealed Pod"
                    }, void 0, false, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 2478,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: "Deck Builder"
                    }, void 0, false, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 2481,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `header-buttons ${isInfoBarSticky ? 'hidden' : ''}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "export-button",
                                onClick: copyJSON,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "20",
                                        height: "20",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: "9",
                                                y: "9",
                                                width: "13",
                                                height: "13",
                                                rx: "2",
                                                ry: "2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2486,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2487,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2485,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Copy JSON"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2489,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2484,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "export-button",
                                onClick: exportJSON,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "20",
                                        height: "20",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2493,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                points: "7 10 12 15 17 10"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2494,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                x1: "12",
                                                y1: "15",
                                                x2: "12",
                                                y2: "3"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2495,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2492,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Download"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2497,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2491,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "export-button",
                                onClick: exportDeckImage,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "20",
                                        height: "20",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: "3",
                                                y: "3",
                                                width: "18",
                                                height: "18",
                                                rx: "2",
                                                ry: "2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2501,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                cx: "8.5",
                                                cy: "8.5",
                                                r: "1.5"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2502,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                points: "21 15 16 10 5 21"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2503,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2500,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Deck Image"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2505,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2499,
                                columnNumber: 11
                            }, this),
                            shareId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "export-button",
                                onClick: async ()=>{
                                    try {
                                        await navigator.clipboard.writeText(`${window.location.origin}/pool/${shareId}`);
                                        setErrorMessage('Share URL copied to clipboard!');
                                        setMessageType('success');
                                        setTimeout(()=>{
                                            setErrorMessage(null);
                                            setMessageType(null);
                                        }, 3000);
                                    } catch (err) {
                                        setErrorMessage('Failed to copy to clipboard');
                                        setMessageType('error');
                                        setTimeout(()=>{
                                            setErrorMessage(null);
                                            setMessageType(null);
                                        }, 3000);
                                    }
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "20",
                                        height: "20",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2530,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2531,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2529,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Share URL"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2533,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2508,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 2483,
                        columnNumber: 9
                    }, this),
                    errorMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "error-message",
                        style: {
                            marginTop: '1rem',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            padding: '0.5rem 1rem',
                            background: messageType === 'error' ? 'rgba(255, 0, 0, 0.2)' : errorMessage.includes('Generating') ? 'rgba(138, 43, 226, 0.2)' : 'rgba(0, 100, 255, 0.2)',
                            border: messageType === 'error' ? '1px solid #ff0000' : errorMessage.includes('Generating') ? '1px solid #8a2be2' : '1px solid #0066ff',
                            borderRadius: '4px',
                            color: messageType === 'error' ? '#ffcccc' : errorMessage.includes('Generating') ? '#dda0dd' : '#cce5ff',
                            width: 'fit-content',
                            fontSize: '0.875rem'
                        },
                        children: errorMessage
                    }, void 0, false, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 2538,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/DeckBuilder.jsx",
                lineNumber: 2477,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `deck-info-bar ${isInfoBarSticky ? 'sticky' : ''}`,
                ref: infoBarRef,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "selected-cards-info",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `selected-card-container ${!activeLeader ? 'select-card-placeholder' : ''} ${isInfoBarSticky ? 'sticky-layout' : 'inline-layout'}`,
                                onClick: ()=>{
                                    // Expand leaders section if collapsed
                                    const wasCollapsed = !leadersExpanded;
                                    if (wasCollapsed) {
                                        setLeadersExpanded(true);
                                    }
                                    // Find the leaders block in the new structure
                                    const leadersBlock = document.querySelector('.blocks-leaders-row .card-block');
                                    if (leadersBlock) {
                                        const headerHeight = document.querySelector('.deck-info-bar')?.offsetHeight || 0;
                                        const topOffset = 20 // matches top: 20px from sticky header
                                        ;
                                        const scrollOffset = headerHeight + topOffset + 10 // extra 10px for spacing
                                        ;
                                        // Wait for expansion animation if it was collapsed
                                        setTimeout(()=>{
                                            const elementPosition = leadersBlock.getBoundingClientRect().top + window.pageYOffset;
                                            window.scrollTo({
                                                top: elementPosition - scrollOffset,
                                                behavior: 'smooth'
                                            });
                                        }, wasCollapsed ? 400 : 0);
                                    }
                                },
                                style: {
                                    cursor: 'pointer'
                                },
                                children: activeLeader && cardPositions[activeLeader] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "selected-card-name",
                                            style: {
                                                color: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$aspectColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAspectColor"])(cardPositions[activeLeader].card)
                                            },
                                            onMouseEnter: (e)=>{
                                                if (isInfoBarSticky) {
                                                    handleCardMouseEnter(cardPositions[activeLeader].card, e);
                                                }
                                            },
                                            onMouseLeave: ()=>{
                                                if (isInfoBarSticky) {
                                                    handleCardMouseLeave();
                                                }
                                            },
                                            onTouchStart: (e)=>{
                                                if (isInfoBarSticky) {
                                                    longPressTimeoutRef.current = setTimeout(()=>{
                                                        handleCardMouseEnter(cardPositions[activeLeader].card, e);
                                                    }, 500);
                                                }
                                            },
                                            onTouchEnd: ()=>{
                                                if (longPressTimeoutRef.current) {
                                                    clearTimeout(longPressTimeoutRef.current);
                                                    longPressTimeoutRef.current = null;
                                                }
                                            },
                                            onTouchCancel: ()=>{
                                                if (longPressTimeoutRef.current) {
                                                    clearTimeout(longPressTimeoutRef.current);
                                                    longPressTimeoutRef.current = null;
                                                }
                                            },
                                            children: cardPositions[activeLeader].card.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 2586,
                                            columnNumber: 17
                                        }, this),
                                        cardPositions[activeLeader].card.subtitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "selected-card-subtitle",
                                            children: cardPositions[activeLeader].card.subtitle
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 2622,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "selected-card-name",
                                    children: "(Select a Leader)"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 2626,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2558,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "separator"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2629,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `selected-card-container ${!activeBase ? 'select-card-placeholder' : ''}`,
                                onClick: ()=>{
                                    // Expand bases section if collapsed
                                    const wasCollapsed = !basesExpanded;
                                    if (wasCollapsed) {
                                        setBasesExpanded(true);
                                    }
                                    // Find the bases block in the new structure
                                    const basesBlock = document.querySelector('.blocks-bases-row .card-block');
                                    if (basesBlock) {
                                        const headerHeight = document.querySelector('.deck-info-bar')?.offsetHeight || 0;
                                        const topOffset = 20 // matches top: 20px from sticky header
                                        ;
                                        const scrollOffset = headerHeight + topOffset + 10 // extra 10px for spacing
                                        ;
                                        // Wait for expansion animation if it was collapsed
                                        setTimeout(()=>{
                                            const elementPosition = basesBlock.getBoundingClientRect().top + window.pageYOffset;
                                            window.scrollTo({
                                                top: elementPosition - scrollOffset,
                                                behavior: 'smooth'
                                            });
                                        }, wasCollapsed ? 400 : 0);
                                    }
                                },
                                style: {
                                    cursor: 'pointer'
                                },
                                children: activeBase && cardPositions[activeBase] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "selected-card-name",
                                    style: {
                                        color: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$aspectColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAspectColor"])(cardPositions[activeBase].card)
                                    },
                                    onMouseEnter: (e)=>{
                                        if (isInfoBarSticky) {
                                            handleCardMouseEnter(cardPositions[activeBase].card, e);
                                        }
                                    },
                                    onMouseLeave: ()=>{
                                        if (isInfoBarSticky) {
                                            handleCardMouseLeave();
                                        }
                                    },
                                    onTouchStart: (e)=>{
                                        if (isInfoBarSticky) {
                                            longPressTimeoutRef.current = setTimeout(()=>{
                                                handleCardMouseEnter(cardPositions[activeBase].card, e);
                                            }, 500);
                                        }
                                    },
                                    onTouchEnd: ()=>{
                                        if (longPressTimeoutRef.current) {
                                            clearTimeout(longPressTimeoutRef.current);
                                            longPressTimeoutRef.current = null;
                                        }
                                    },
                                    onTouchCancel: ()=>{
                                        if (longPressTimeoutRef.current) {
                                            clearTimeout(longPressTimeoutRef.current);
                                            longPressTimeoutRef.current = null;
                                        }
                                    },
                                    children: cardPositions[activeBase].card.name
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 2657,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "selected-card-name",
                                    children: "(Select a Base)"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 2693,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2630,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 2557,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "deck-counts-info",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "section-link",
                                onClick: ()=>{
                                    // Expand deck section if collapsed
                                    const wasCollapsed = !deckExpanded;
                                    if (wasCollapsed) {
                                        setDeckExpanded(true);
                                    }
                                    // Find the deck header
                                    const deckHeader = document.querySelector('#deck-header');
                                    if (deckHeader) {
                                        const headerHeight = document.querySelector('.deck-info-bar')?.offsetHeight || 0;
                                        const topOffset = 20 // matches top: 20px from sticky header
                                        ;
                                        const scrollOffset = headerHeight + topOffset + 10 // extra 10px for spacing
                                        ;
                                        // Wait for expansion animation if it was collapsed
                                        setTimeout(()=>{
                                            const elementPosition = deckHeader.getBoundingClientRect().top + window.pageYOffset;
                                            window.scrollTo({
                                                top: elementPosition - scrollOffset,
                                                behavior: 'smooth'
                                            });
                                        }, wasCollapsed ? 400 : 0);
                                    }
                                },
                                style: {
                                    cursor: 'pointer'
                                },
                                children: [
                                    "Deck (",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: (()=>{
                                                const deckCount = Object.values(cardPositions).filter((pos)=>pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader).length;
                                                if (deckCount < 30) return '#E74C3C' // Red
                                                ;
                                                if (deckCount === 30) return '#27AE60' // Green
                                                ;
                                                return '#F1C40F' // Yellow
                                                ;
                                            })()
                                        },
                                        children: (()=>{
                                            const deckCards = Object.values(cardPositions).filter((pos)=>pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader);
                                            return deckCards.length;
                                        })()
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2724,
                                        columnNumber: 21
                                    }, this),
                                    "/30)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2698,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "separator"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2738,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "section-link",
                                onClick: ()=>{
                                    // Expand sideboard section if collapsed
                                    const wasCollapsed = !sideboardExpanded;
                                    if (wasCollapsed) {
                                        setSideboardExpanded(true);
                                    }
                                    // Find the sideboard header
                                    const sideboardHeader = document.querySelector('#sideboard-header');
                                    if (sideboardHeader) {
                                        const headerHeight = document.querySelector('.deck-info-bar')?.offsetHeight || 0;
                                        const topOffset = 20 // matches top: 20px from sticky header
                                        ;
                                        const scrollOffset = headerHeight + topOffset + 10 // extra 10px for spacing
                                        ;
                                        // Wait for expansion animation if it was collapsed
                                        setTimeout(()=>{
                                            const elementPosition = sideboardHeader.getBoundingClientRect().top + window.pageYOffset;
                                            window.scrollTo({
                                                top: elementPosition - scrollOffset,
                                                behavior: 'smooth'
                                            });
                                        }, wasCollapsed ? 400 : 0);
                                    }
                                },
                                style: {
                                    cursor: 'pointer'
                                },
                                children: [
                                    "Sideboard (",
                                    (()=>{
                                        const sideboardCards = Object.values(cardPositions).filter((pos)=>pos.section === 'sideboard' && pos.visible && !pos.card.isBase && !pos.card.isLeader);
                                        return sideboardCards.length;
                                    })(),
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2739,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 2697,
                        columnNumber: 9
                    }, this),
                    isInfoBarSticky && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "header-buttons-in-nav",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "export-button-icon",
                                onClick: copyJSON,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "20",
                                        height: "20",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: "9",
                                                y: "9",
                                                width: "13",
                                                height: "13",
                                                rx: "2",
                                                ry: "2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2776,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2777,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2775,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "button-tooltip",
                                        children: "Copy JSON"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2779,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2774,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "export-button-icon",
                                onClick: exportJSON,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "20",
                                        height: "20",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2783,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                points: "7 10 12 15 17 10"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2784,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                x1: "12",
                                                y1: "15",
                                                x2: "12",
                                                y2: "3"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2785,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2782,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "button-tooltip",
                                        children: "Download"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2787,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2781,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "export-button-icon",
                                onClick: exportDeckImage,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "20",
                                        height: "20",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: "3",
                                                y: "3",
                                                width: "18",
                                                height: "18",
                                                rx: "2",
                                                ry: "2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2791,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                cx: "8.5",
                                                cy: "8.5",
                                                r: "1.5"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2792,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                points: "21 15 16 10 5 21"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2793,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2790,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "button-tooltip",
                                        children: "Deck Image"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2795,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2789,
                                columnNumber: 13
                            }, this),
                            shareId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "export-button-icon",
                                onClick: async ()=>{
                                    try {
                                        await navigator.clipboard.writeText(`${window.location.origin}/pool/${shareId}`);
                                        setErrorMessage('Share URL copied to clipboard!');
                                        setMessageType('success');
                                        setTimeout(()=>{
                                            setErrorMessage(null);
                                            setMessageType(null);
                                        }, 3000);
                                    } catch (err) {
                                        setErrorMessage('Failed to copy to clipboard');
                                        setMessageType('error');
                                        setTimeout(()=>{
                                            setErrorMessage(null);
                                            setMessageType(null);
                                        }, 3000);
                                    }
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "20",
                                        height: "20",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2820,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2821,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2819,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "button-tooltip",
                                        children: "Share URL"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2823,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2798,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 2773,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/DeckBuilder.jsx",
                lineNumber: 2556,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "view-controls",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "view-toggle-button",
                        onClick: ()=>setViewMode(viewMode === 'grid' ? 'list' : 'grid'),
                        onMouseEnter: (e)=>showNavTooltip(viewMode === 'grid' ? 'Table View' : 'Playmat View', e),
                        onMouseLeave: hideTooltip,
                        children: viewMode === 'grid' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            width: "20",
                            height: "20",
                            viewBox: "0 0 20 20",
                            fill: "none",
                            xmlns: "http://www.w3.org/2000/svg",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                    x: "2",
                                    y: "3",
                                    width: "16",
                                    height: "2",
                                    fill: "currentColor"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 2839,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                    x: "2",
                                    y: "7",
                                    width: "16",
                                    height: "2",
                                    fill: "currentColor"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 2840,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                    x: "2",
                                    y: "11",
                                    width: "16",
                                    height: "2",
                                    fill: "currentColor"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 2841,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                    x: "2",
                                    y: "15",
                                    width: "16",
                                    height: "2",
                                    fill: "currentColor"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 2842,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/DeckBuilder.jsx",
                            lineNumber: 2838,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            width: "20",
                            height: "20",
                            viewBox: "0 0 20 20",
                            fill: "none",
                            xmlns: "http://www.w3.org/2000/svg",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M2 2H8V8H2V2Z",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    fill: "none"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 2846,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M12 2H18V8H12V2Z",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    fill: "none"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 2847,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M2 12H8V18H2V12Z",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    fill: "none"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 2848,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M12 12H18V18H12V12Z",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    fill: "none"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 2849,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/DeckBuilder.jsx",
                            lineNumber: 2845,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 2831,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "filter-button",
                        onClick: ()=>setFilterDrawerOpen(!filterDrawerOpen),
                        onMouseEnter: (e)=>showNavTooltip('Filter by Aspect', e),
                        onMouseLeave: hideTooltip,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            width: "20",
                            height: "20",
                            viewBox: "0 0 20 20",
                            fill: "none",
                            xmlns: "http://www.w3.org/2000/svg",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M3 5H17M5 10H15M7 15H13",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                strokeLinecap: "round"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2860,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/DeckBuilder.jsx",
                            lineNumber: 2859,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 2853,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "sort-button-icon",
                        onClick: ()=>{
                            setSortOption(sortOption === 'aspect' ? 'cost' : 'aspect');
                            // In list view, also set tableSort to match
                            if (viewMode === 'list') {
                                if (sortOption === 'aspect') {
                                    setTableSort({
                                        field: 'cost',
                                        direction: 'asc'
                                    });
                                } else {
                                    setTableSort({
                                        field: 'aspects',
                                        direction: 'asc'
                                    });
                                }
                            }
                        },
                        onMouseEnter: (e)=>showNavTooltip(`Sort by ${sortOption === 'aspect' ? 'Cost' : 'Aspect'}`, e),
                        onMouseLeave: hideTooltip,
                        children: sortOption === 'aspect' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                position: 'relative',
                                display: 'inline-block',
                                width: '32px',
                                height: '32px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: "/icons/cost.png",
                                    alt: "Cost",
                                    style: {
                                        width: '32px',
                                        height: '32px',
                                        display: 'block'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 2881,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '18px',
                                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                    },
                                    children: "3"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 2886,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/DeckBuilder.jsx",
                            lineNumber: 2880,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/icons/heroism.png",
                            alt: "Aspect",
                            style: {
                                width: '32px',
                                height: '32px',
                                display: 'block'
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/components/DeckBuilder.jsx",
                            lineNumber: 2900,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 2863,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/DeckBuilder.jsx",
                lineNumber: 2830,
                columnNumber: 7
            }, this),
            filterDrawerOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "filter-drawer-overlay",
                        onClick: ()=>setFilterDrawerOpen(false),
                        style: {
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1999,
                            background: 'transparent'
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 2911,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "filter-drawer",
                        onClick: (e)=>e.stopPropagation(),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "filter-drawer-header",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        children: "Filters"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2926,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setFilterDrawerOpen(false),
                                        children: "×"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2927,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2925,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "filter-section",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "Aspects"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2930,
                                        columnNumber: 13
                                    }, this),
                                    ASPECTS.map((aspect, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "filter-checkbox",
                                            style: aspect === 'Villainy' ? {
                                                marginTop: '1rem'
                                            } : {},
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "checkbox",
                                                    checked: aspectFilters[aspect],
                                                    onChange: (e)=>{
                                                        const isChecked = e.target.checked;
                                                        setAspectFilters((prev)=>({
                                                                ...prev,
                                                                [aspect]: isChecked
                                                            }));
                                                        // Move cards between deck and sideboard based on filter
                                                        setCardPositions((prev)=>{
                                                            const updated = {
                                                                ...prev
                                                            };
                                                            Object.entries(updated).forEach(([cardId, position])=>{
                                                                // Skip leaders and bases
                                                                if (position.card.isLeader || position.card.isBase) return;
                                                                // Only process cards in deck or sideboard sections
                                                                if (position.section !== 'deck' && position.section !== 'sideboard') return;
                                                                const cardAspects = position.card.aspects || [];
                                                                const matchesFilter = aspect === NO_ASPECT_LABEL ? cardAspects.length === 0 : cardAspects.includes(aspect);
                                                                if (matchesFilter) {
                                                                    if (isChecked) {
                                                                        // Move from sideboard to deck (enable)
                                                                        if (position.section === 'sideboard' || !position.enabled) {
                                                                            updated[cardId] = {
                                                                                ...position,
                                                                                section: 'deck',
                                                                                enabled: true,
                                                                                x: 0,
                                                                                y: 0
                                                                            };
                                                                        }
                                                                    } else {
                                                                        // Move from deck to sideboard (disable)
                                                                        if (position.section === 'deck' && position.enabled !== false) {
                                                                            updated[cardId] = {
                                                                                ...position,
                                                                                section: 'sideboard',
                                                                                enabled: false,
                                                                                x: 0,
                                                                                y: 0
                                                                            };
                                                                        }
                                                                    }
                                                                }
                                                            });
                                                            return updated;
                                                        });
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                    lineNumber: 2937,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    },
                                                    children: [
                                                        getAspectSymbol(aspect, 'medium'),
                                                        aspect
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                    lineNumber: 2988,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, aspect, true, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 2932,
                                            columnNumber: 15
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "filter-checkbox",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                checked: aspectFilters[NO_ASPECT_LABEL],
                                                onChange: (e)=>{
                                                    const isChecked = e.target.checked;
                                                    setAspectFilters((prev)=>({
                                                            ...prev,
                                                            [NO_ASPECT_LABEL]: isChecked
                                                        }));
                                                    // Move cards between deck and sideboard based on filter
                                                    setCardPositions((prev)=>{
                                                        const updated = {
                                                            ...prev
                                                        };
                                                        Object.entries(updated).forEach(([cardId, position])=>{
                                                            // Skip leaders and bases
                                                            if (position.card.isLeader || position.card.isBase) return;
                                                            // Only process cards in deck or sideboard sections
                                                            if (position.section !== 'deck' && position.section !== 'sideboard') return;
                                                            const cardAspects = position.card.aspects || [];
                                                            const matchesFilter = cardAspects.length === 0;
                                                            if (matchesFilter) {
                                                                if (isChecked) {
                                                                    // Move from sideboard to deck (enable)
                                                                    if (position.section === 'sideboard' || !position.enabled) {
                                                                        updated[cardId] = {
                                                                            ...position,
                                                                            section: 'deck',
                                                                            enabled: true,
                                                                            x: 0,
                                                                            y: 0
                                                                        };
                                                                    }
                                                                } else {
                                                                    // Move from deck to sideboard (disable)
                                                                    if (position.section === 'deck' && position.enabled !== false) {
                                                                        updated[cardId] = {
                                                                            ...position,
                                                                            section: 'sideboard',
                                                                            enabled: false,
                                                                            x: 0,
                                                                            y: 0
                                                                        };
                                                                    }
                                                                }
                                                            }
                                                        });
                                                        return updated;
                                                    });
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 2995,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: NO_ASPECT_LABEL
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 3044,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, NO_ASPECT_LABEL, true, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 2994,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 2929,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 2924,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            viewMode === 'grid' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "blocks-container",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginTop: '1.5rem',
                            marginBottom: '0.75rem',
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            color: 'rgba(255, 255, 255, 0.9)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            paddingBottom: '0.25rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                            cursor: 'pointer',
                            userSelect: 'none'
                        },
                        onClick: ()=>{
                            const bothExpanded = leadersExpanded && basesExpanded;
                            setLeadersExpanded(!bothExpanded);
                            setBasesExpanded(!bothExpanded);
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: leadersExpanded && basesExpanded ? '▼' : '▶'
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 3078,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Leaders & Bases"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 3079,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 3056,
                        columnNumber: 11
                    }, this),
                    leadersExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "blocks-leaders-row",
                        children: (()=>{
                            const leadersCards = Object.entries(cardPositions).filter(([_, position])=>position.section === 'leaders-bases' && position.visible && position.card.isLeader).map(([cardId, position])=>({
                                    cardId,
                                    position
                                })).sort((a, b)=>defaultSort(a.position.card, b.position.card));
                            return leadersCards.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "card-block",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "card-block-header",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                "Leaders (",
                                                leadersCards.length,
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 3095,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 3094,
                                        columnNumber: 19
                                    }, this),
                                    leadersExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-block-content",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "leaders-bases-container",
                                            children: leadersCards.map(({ cardId, position })=>{
                                                const card = position.card;
                                                const isSelected = selectedCards.has(cardId);
                                                const isHovered = hoveredCard === cardId;
                                                const isActiveLeader = activeLeader === cardId;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `canvas-card leader ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isActiveLeader ? 'active-leader' : ''}`,
                                                    style: {
                                                        cursor: 'pointer',
                                                        position: 'relative'
                                                    },
                                                    onClick: (e)=>{
                                                        const newActiveLeader = activeLeader === cardId ? null : cardId;
                                                        setActiveLeader(newActiveLeader);
                                                    },
                                                    onMouseEnter: (e)=>{
                                                        setHoveredCard(cardId);
                                                        handleCardMouseEnter(card, e);
                                                    },
                                                    onMouseLeave: ()=>{
                                                        setHoveredCard(null);
                                                        handleCardMouseLeave();
                                                    },
                                                    children: [
                                                        card.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: card.imageUrl,
                                                            alt: card.name || 'Card',
                                                            className: "card-image",
                                                            draggable: false
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 3128,
                                                            columnNumber: 33
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "card-placeholder",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "card-name",
                                                                    children: card.name || 'Card'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                    lineNumber: 3136,
                                                                    columnNumber: 35
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "card-rarity",
                                                                    style: {
                                                                        color: getRarityColor(card.rarity)
                                                                    },
                                                                    children: card.rarity
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                    lineNumber: 3137,
                                                                    columnNumber: 35
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 3135,
                                                            columnNumber: 33
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "card-badges",
                                                            children: card.isShowcase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "badge showcase-badge",
                                                                children: "Showcase"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 3143,
                                                                columnNumber: 53
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 3142,
                                                            columnNumber: 31
                                                        }, this)
                                                    ]
                                                }, cardId, true, {
                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                    lineNumber: 3107,
                                                    columnNumber: 29
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 3099,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 3098,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 3093,
                                columnNumber: 17
                            }, this) : null;
                        })()
                    }, void 0, false, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 3084,
                        columnNumber: 13
                    }, this),
                    basesExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "blocks-bases-row",
                        children: (()=>{
                            const basesCards = Object.entries(cardPositions).filter(([_, position])=>position.section === 'leaders-bases' && position.visible && position.card.isBase).map(([cardId, position])=>({
                                    cardId,
                                    position
                                })).sort((a, b)=>{
                                // Sort by rarity (rare first)
                                const aRarity = a.position.card.rarity;
                                const bRarity = b.position.card.rarity;
                                const aIsRare = aRarity === 'Rare' || aRarity === 'Legendary' || aRarity === 'Special';
                                const bIsRare = bRarity === 'Rare' || bRarity === 'Legendary' || bRarity === 'Special';
                                if (aIsRare && !bIsRare) return -1;
                                if (!aIsRare && bIsRare) return 1;
                                // Then by aspect
                                const keyA = getAspectKey(a.position.card);
                                const keyB = getAspectKey(b.position.card);
                                return keyA.localeCompare(keyB);
                            });
                            return basesCards.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "card-block",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "card-block-header",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                "Bases (",
                                                basesCards.length,
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 3183,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 3182,
                                        columnNumber: 19
                                    }, this),
                                    basesExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-block-content",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "leaders-bases-container bases-only",
                                            children: basesCards.map(({ cardId, position })=>{
                                                const card = position.card;
                                                const isSelected = selectedCards.has(cardId);
                                                const isHovered = hoveredCard === cardId;
                                                const isActiveBase = activeBase === cardId;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `canvas-card base ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isActiveBase ? 'active-base' : ''}`,
                                                    style: {
                                                        cursor: 'pointer',
                                                        position: 'relative'
                                                    },
                                                    onClick: (e)=>{
                                                        const newActiveBase = activeBase === cardId ? null : cardId;
                                                        setActiveBase(newActiveBase);
                                                    },
                                                    onMouseEnter: (e)=>{
                                                        setHoveredCard(cardId);
                                                        handleCardMouseEnter(card, e);
                                                    },
                                                    onMouseLeave: ()=>{
                                                        setHoveredCard(null);
                                                        handleCardMouseLeave();
                                                    },
                                                    children: [
                                                        card.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: card.imageUrl,
                                                            alt: card.name || 'Card',
                                                            className: "card-image",
                                                            draggable: false
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 3216,
                                                            columnNumber: 33
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "card-placeholder",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "card-name",
                                                                    children: card.name || 'Card'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                    lineNumber: 3224,
                                                                    columnNumber: 35
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "card-rarity",
                                                                    style: {
                                                                        color: getRarityColor(card.rarity)
                                                                    },
                                                                    children: card.rarity
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                    lineNumber: 3225,
                                                                    columnNumber: 35
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 3223,
                                                            columnNumber: 33
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "card-badges",
                                                            children: card.isShowcase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "badge showcase-badge",
                                                                children: "Showcase"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 3231,
                                                                columnNumber: 53
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 3230,
                                                            columnNumber: 31
                                                        }, this)
                                                    ]
                                                }, cardId, true, {
                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                    lineNumber: 3195,
                                                    columnNumber: 29
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 3187,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 3186,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 3181,
                                columnNumber: 17
                            }, this) : null;
                        })()
                    }, void 0, false, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 3159,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "deck-header",
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginTop: '1.5rem',
                            marginBottom: '0.75rem',
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            color: 'rgba(255, 255, 255, 0.9)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            paddingBottom: '0.25rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                            cursor: 'pointer',
                            userSelect: 'none'
                        },
                        onClick: ()=>setDeckExpanded(!deckExpanded),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: deckExpanded ? '▼' : '▶'
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 3266,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "Deck (",
                                    Object.values(cardPositions).filter((pos)=>pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader && pos.enabled !== false).length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 3267,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    const deckCards = Object.entries(cardPositions).filter(([_, position])=>position.section === 'deck' && position.visible && !position.card.isBase && !position.card.isLeader);
                                    const activeDeckCards = deckCards.filter(([_, position])=>position.enabled !== false);
                                    const shouldMoveToSideboard = activeDeckCards.length > 0;
                                    if (shouldMoveToSideboard) {
                                        // Remove all: move cards from deck to sideboard
                                        setCardPositions((prev)=>{
                                            const updated = {
                                                ...prev
                                            };
                                            deckCards.forEach(([cardId])=>{
                                                if (updated[cardId]) {
                                                    updated[cardId] = {
                                                        ...updated[cardId],
                                                        section: 'sideboard',
                                                        enabled: false
                                                    };
                                                }
                                            });
                                            return updated;
                                        });
                                    } else {
                                        // Add all: move cards from sideboard to deck
                                        const sideboardCards = Object.entries(cardPositions).filter(([_, position])=>position.section === 'sideboard' && position.visible && !position.card.isBase && !position.card.isLeader);
                                        setCardPositions((prev)=>{
                                            const updated = {
                                                ...prev
                                            };
                                            sideboardCards.forEach(([cardId])=>{
                                                if (updated[cardId]) {
                                                    updated[cardId] = {
                                                        ...updated[cardId],
                                                        section: 'deck',
                                                        enabled: true
                                                    };
                                                }
                                            });
                                            return updated;
                                        });
                                    }
                                },
                                style: {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    textDecoration: 'underline'
                                },
                                onMouseEnter: (e)=>e.target.style.color = 'rgba(255, 255, 255, 1)',
                                onMouseLeave: (e)=>e.target.style.color = 'rgba(255, 255, 255, 0.7)',
                                children: (()=>{
                                    const deckCards = Object.entries(cardPositions).filter(([_, position])=>position.section === 'deck' && position.visible && !position.card.isBase && !position.card.isLeader);
                                    const activeDeckCards = deckCards.filter(([_, position])=>position.enabled !== false);
                                    return activeDeckCards.length === 0 ? 'ADD ALL' : 'Remove All';
                                })()
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 3269,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 3246,
                        columnNumber: 11
                    }, this),
                    deckExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "blocks-deck-row",
                        ref: deckBlocksRowRef,
                        children: (()=>{
                            // Get all deck cards
                            const deckCards = Object.entries(cardPositions).filter(([_, position])=>position.section === 'deck' && position.visible && !position.card.isBase && !position.card.isLeader).map(([cardId, position])=>({
                                    cardId,
                                    position
                                }));
                            // Note: No longer filtering - cards are moved between deck/sideboard via filter checkboxes
                            if (sortOption === 'cost') {
                                // Group by cost segments: 0, 1, 2, 3, 4, 5, 6, 7, 8+
                                const costSegments = [
                                    0,
                                    1,
                                    2,
                                    3,
                                    4,
                                    5,
                                    6,
                                    7,
                                    '8+'
                                ];
                                const groupedByCost = {};
                                // Initialize all cost segments (even if empty)
                                costSegments.forEach((segment)=>{
                                    groupedByCost[segment] = [];
                                });
                                // Group cards by cost segment
                                deckCards.forEach(({ cardId, position })=>{
                                    const cost = position.card.cost;
                                    let segment;
                                    if (cost === null || cost === undefined || cost === 0) {
                                        segment = 0;
                                    } else if (cost >= 8) {
                                        segment = '8+';
                                    } else if (cost >= 1 && cost <= 7) {
                                        segment = cost;
                                    } else {
                                        segment = 0; // Default to 0 for any other edge cases
                                    }
                                    if (!groupedByCost[segment]) {
                                        groupedByCost[segment] = [];
                                    }
                                    groupedByCost[segment].push({
                                        cardId,
                                        position
                                    });
                                });
                                // Render cost segments as blocks, with empty ones at the end
                                const blocksWithContent = [];
                                const blocksEmpty = [];
                                costSegments.forEach((costSegment)=>{
                                    const cards = groupedByCost[costSegment] || [];
                                    const activeCards = cards.filter(({ position })=>position.enabled !== false);
                                    // For 0 and 8+ only, don't show if there are no cards
                                    if ((costSegment === 0 || costSegment === '8+') && cards.length === 0) {
                                        return;
                                    }
                                    const sortedCards = [
                                        ...activeCards
                                    ].sort((a, b)=>{
                                        return defaultSort(a.position.card, b.position.card);
                                    });
                                    const block = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-block cost-block-full-width",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "card-block-header",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            position: 'relative',
                                                            display: 'inline-block',
                                                            width: '32px',
                                                            height: '32px'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                src: "/icons/cost.png",
                                                                alt: "cost",
                                                                style: {
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'contain'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 3392,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    position: 'absolute',
                                                                    top: '50%',
                                                                    left: '50%',
                                                                    transform: 'translate(-50%, -50%)',
                                                                    color: 'white',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '18px',
                                                                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                                                },
                                                                children: costSegment
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 3397,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 3391,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            "(",
                                                            sortedCards.length,
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 3410,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 3390,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "card-block-content",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "cards-grid",
                                                    children: (()=>{
                                                        const groupedCards = groupCardsByName(sortedCards);
                                                        return groupedCards.map((group)=>renderCardStack(group, (cardEntry, stackIndex, isStacked)=>{
                                                                const { cardId, position } = cardEntry;
                                                                const card = position.card;
                                                                const isSelected = selectedCards.has(cardId);
                                                                const isHovered = hoveredCard === cardId;
                                                                const isDisabled = !position.enabled;
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: `canvas-card ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isDisabled ? 'disabled' : ''} ${isStacked ? 'stacked' : ''}`,
                                                                    style: isStacked && stackIndex > 0 ? {
                                                                        left: `${stackIndex * 24}px`,
                                                                        zIndex: stackIndex
                                                                    } : {},
                                                                    onClick: (e)=>{
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        if (!e.shiftKey) {
                                                                            // Regular click: Toggle deck/sideboard
                                                                            setHoveredCard(null); // Clear hover state when card is moved
                                                                            setCardPositions((prev)=>{
                                                                                const newSection = prev[cardId].section === 'deck' ? 'sideboard' : 'deck';
                                                                                const newEnabled = newSection === 'deck';
                                                                                return {
                                                                                    ...prev,
                                                                                    [cardId]: {
                                                                                        ...prev[cardId],
                                                                                        section: newSection,
                                                                                        enabled: newEnabled,
                                                                                        x: 0,
                                                                                        y: 0
                                                                                    }
                                                                                };
                                                                            });
                                                                        }
                                                                    },
                                                                    onMouseEnter: (e)=>{
                                                                        setHoveredCard(cardId);
                                                                        handleCardMouseEnter(position.card, e);
                                                                    },
                                                                    onMouseLeave: ()=>{
                                                                        setHoveredCard(null);
                                                                        handleCardMouseLeave();
                                                                    },
                                                                    children: [
                                                                        card.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                            src: card.imageUrl,
                                                                            alt: card.name || 'Card',
                                                                            className: "card-image",
                                                                            draggable: false
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                            lineNumber: 3463,
                                                                            columnNumber: 35
                                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "card-placeholder",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "card-name",
                                                                                    children: card.name || 'Card'
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                    lineNumber: 3471,
                                                                                    columnNumber: 37
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "card-rarity",
                                                                                    style: {
                                                                                        color: getRarityColor(card.rarity)
                                                                                    },
                                                                                    children: card.rarity
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                    lineNumber: 3472,
                                                                                    columnNumber: 37
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                            lineNumber: 3470,
                                                                            columnNumber: 35
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "card-badges",
                                                                            children: card.isShowcase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "badge showcase-badge",
                                                                                children: "Showcase"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                lineNumber: 3478,
                                                                                columnNumber: 55
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                            lineNumber: 3477,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, cardId, true, {
                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                    lineNumber: 3424,
                                                                    columnNumber: 31
                                                                }, this);
                                                            }));
                                                    })()
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                    lineNumber: 3413,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 3412,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, `cost-${costSegment}`, true, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 3386,
                                        columnNumber: 17
                                    }, this);
                                    if (sortedCards.length > 0) {
                                        blocksWithContent.push(block);
                                    } else {
                                        blocksEmpty.push(block);
                                    }
                                });
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        blocksWithContent,
                                        blocksEmpty.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "blocks-empty-row",
                                            children: blocksEmpty
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 3500,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true);
                            } else {
                                // Define all possible aspect combinations in order
                                const aspectOrder = [
                                    'vigilance_villainy',
                                    'vigilance_heroism',
                                    'vigilance_vigilance',
                                    'vigilance',
                                    'command_villainy',
                                    'command_heroism',
                                    'command_command',
                                    'command',
                                    'aggression_villainy',
                                    'aggression_heroism',
                                    'aggression_aggression',
                                    'aggression',
                                    'cunning_villainy',
                                    'cunning_heroism',
                                    'cunning_cunning',
                                    'cunning',
                                    'villainy',
                                    'heroism',
                                    'villainy_heroism',
                                    'neutral'
                                ];
                                // Initialize all aspect combinations (even if empty) - this ensures blocks remain visible
                                const groupedByAspect = {};
                                aspectOrder.forEach((key)=>{
                                    groupedByAspect[key] = [];
                                });
                                // Group cards by aspect combination
                                deckCards.forEach(({ cardId, position })=>{
                                    const aspectKey = getAspectCombinationKey(position.card);
                                    if (!groupedByAspect[aspectKey]) {
                                        groupedByAspect[aspectKey] = [];
                                    }
                                    groupedByAspect[aspectKey].push({
                                        cardId,
                                        position
                                    });
                                });
                                // Use the predefined order (all segments, even empty ones)
                                const sortedAspectKeys = aspectOrder;
                                const blocksWithContent = [];
                                const blocksEmpty = [];
                                sortedAspectKeys.forEach((aspectKey)=>{
                                    const cards = groupedByAspect[aspectKey] || [];
                                    const activeCards = cards.filter(({ position })=>position.enabled !== false);
                                    // Always show aspect blocks, even if empty (so they remain visible after "Remove All")
                                    const sortedCards = [
                                        ...activeCards
                                    ].sort((a, b)=>{
                                        return defaultSort(a.position.card, b.position.card);
                                    });
                                    const getTypeOrder = (type)=>{
                                        if (type === 'Unit' || type === 'Ground Unit') return 1;
                                        if (type === 'Space Unit') return 2;
                                        if (type === 'Upgrade') return 3;
                                        if (type === 'Event') return 4;
                                        return 99;
                                    };
                                    const groupedByType = {};
                                    sortedCards.forEach(({ cardId, position })=>{
                                        const typeOrder = getTypeOrder(position.card.type || '');
                                        const typeKey = typeOrder === 1 || typeOrder === 2 ? 'Unit' : position.card.type || 'Other';
                                        if (!groupedByType[typeKey]) {
                                            groupedByType[typeKey] = [];
                                        }
                                        groupedByType[typeKey].push({
                                            cardId,
                                            position
                                        });
                                    });
                                    const unitsCards = groupedByType['Unit'] || [];
                                    const upgradesCards = groupedByType['Upgrade'] || [];
                                    const eventsCards = groupedByType['Event'] || [];
                                    const block = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-block",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "card-block-header",
                                                children: [
                                                    getAspectCombinationIcons(aspectKey),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            "(",
                                                            sortedCards.length,
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 3576,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        onClick: (e)=>{
                                                            e.stopPropagation();
                                                            setCardPositions((prev)=>{
                                                                const updated = {
                                                                    ...prev
                                                                };
                                                                cards.forEach(({ cardId })=>{
                                                                    if (updated[cardId]) {
                                                                        updated[cardId] = {
                                                                            ...updated[cardId],
                                                                            enabled: sortedCards.length === 0 ? true : false
                                                                        };
                                                                    }
                                                                });
                                                                return updated;
                                                            });
                                                        },
                                                        style: {
                                                            color: 'rgba(255, 255, 255, 0.7)',
                                                            cursor: 'pointer',
                                                            fontSize: '0.9rem',
                                                            textDecoration: 'underline'
                                                        },
                                                        onMouseEnter: (e)=>e.target.style.color = 'rgba(255, 255, 255, 1)',
                                                        onMouseLeave: (e)=>e.target.style.color = 'rgba(255, 255, 255, 0.7)',
                                                        children: sortedCards.length === 0 ? 'ADD ALL' : 'Remove All'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 3577,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 3574,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "card-block-content",
                                                children: [
                                                    unitsCards.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    marginTop: '1rem',
                                                                    marginBottom: '0.5rem',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            fontSize: '0.9rem',
                                                                            color: 'rgba(255, 255, 255, 0.8)',
                                                                            textTransform: 'uppercase',
                                                                            letterSpacing: '0.5px'
                                                                        },
                                                                        children: `UNITS (${unitsCards.length})`
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 3616,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    (()=>{
                                                                        const groundCount = unitsCards.filter(({ position })=>{
                                                                            const card = position.card;
                                                                            return card.arenas && card.arenas.includes('Ground');
                                                                        }).length;
                                                                        const spaceCount = unitsCards.filter(({ position })=>{
                                                                            const card = position.card;
                                                                            return card.arenas && card.arenas.includes('Space');
                                                                        }).length;
                                                                        const subtitleParts = [];
                                                                        if (groundCount > 0) {
                                                                            subtitleParts.push(`GROUND (${groundCount})`);
                                                                        }
                                                                        if (spaceCount > 0) {
                                                                            subtitleParts.push(`SPACE (${spaceCount})`);
                                                                        }
                                                                        return subtitleParts.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                fontSize: '0.75rem',
                                                                                color: 'rgba(255, 255, 255, 0.8)',
                                                                                textTransform: 'uppercase',
                                                                                letterSpacing: '0.5px'
                                                                            },
                                                                            children: subtitleParts.join(', ')
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                            lineNumber: 3643,
                                                                            columnNumber: 33
                                                                        }, this) : null;
                                                                    })()
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 3609,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "cards-grid",
                                                                children: (()=>{
                                                                    const groupedCards = groupCardsByName(unitsCards);
                                                                    return groupedCards.map((group)=>renderCardStack(group, (cardEntry, stackIndex, isStacked)=>{
                                                                            const { cardId, position } = cardEntry;
                                                                            const card = position.card;
                                                                            const isSelected = selectedCards.has(cardId);
                                                                            const isHovered = hoveredCard === cardId;
                                                                            const isDisabled = !position.enabled;
                                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: `canvas-card ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isDisabled ? 'disabled' : ''} ${isStacked ? 'stacked' : ''}`,
                                                                                style: isStacked && stackIndex > 0 ? {
                                                                                    left: `${stackIndex * 24}px`,
                                                                                    zIndex: stackIndex
                                                                                } : {},
                                                                                onClick: (e)=>{
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    if (!e.shiftKey) {
                                                                                        setHoveredCard(null); // Clear hover state when card is moved
                                                                                        setCardPositions((prev)=>{
                                                                                            const newSection = prev[cardId].section === 'deck' ? 'sideboard' : 'deck';
                                                                                            const newEnabled = newSection === 'deck';
                                                                                            return {
                                                                                                ...prev,
                                                                                                [cardId]: {
                                                                                                    ...prev[cardId],
                                                                                                    section: newSection,
                                                                                                    enabled: newEnabled,
                                                                                                    x: 0,
                                                                                                    y: 0
                                                                                                }
                                                                                            };
                                                                                        });
                                                                                    }
                                                                                },
                                                                                onMouseEnter: (e)=>{
                                                                                    setHoveredCard(cardId);
                                                                                    handleCardMouseEnter(position.card, e);
                                                                                },
                                                                                onMouseLeave: ()=>{
                                                                                    setHoveredCard(null);
                                                                                    handleCardMouseLeave();
                                                                                },
                                                                                children: [
                                                                                    card.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                                        src: card.imageUrl,
                                                                                        alt: card.name || 'Card',
                                                                                        className: "card-image",
                                                                                        draggable: false
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 3703,
                                                                                        columnNumber: 39
                                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "card-placeholder",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "card-name",
                                                                                                children: card.name || 'Card'
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                lineNumber: 3711,
                                                                                                columnNumber: 41
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "card-rarity",
                                                                                                style: {
                                                                                                    color: getRarityColor(card.rarity)
                                                                                                },
                                                                                                children: card.rarity
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                lineNumber: 3712,
                                                                                                columnNumber: 41
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 3710,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "card-badges",
                                                                                        children: card.isShowcase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "badge showcase-badge",
                                                                                            children: "Showcase"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 3718,
                                                                                            columnNumber: 59
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 3717,
                                                                                        columnNumber: 37
                                                                                    }, this)
                                                                                ]
                                                                            }, cardId, true, {
                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                lineNumber: 3665,
                                                                                columnNumber: 35
                                                                            }, this);
                                                                        }));
                                                                })()
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 3654,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 3608,
                                                        columnNumber: 25
                                                    }, this),
                                                    upgradesCards.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            unitsCards.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    margin: '1.5rem 0'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 3732,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    marginTop: unitsCards.length === 0 ? '1rem' : '0',
                                                                    marginBottom: '0.5rem'
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        fontSize: '0.9rem',
                                                                        color: 'rgba(255, 255, 255, 0.8)',
                                                                        textTransform: 'uppercase',
                                                                        letterSpacing: '0.5px'
                                                                    },
                                                                    children: `UPGRADES (${upgradesCards.length})`
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                    lineNumber: 3738,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 3734,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "cards-grid",
                                                                children: (()=>{
                                                                    const groupedCards = groupCardsByName(upgradesCards);
                                                                    return groupedCards.map((group)=>renderCardStack(group, (cardEntry, stackIndex, isStacked)=>{
                                                                            const { cardId, position } = cardEntry;
                                                                            const card = position.card;
                                                                            const isSelected = selectedCards.has(cardId);
                                                                            const isHovered = hoveredCard === cardId;
                                                                            const isDisabled = !position.enabled;
                                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: `canvas-card ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isDisabled ? 'disabled' : ''} ${isStacked ? 'stacked' : ''}`,
                                                                                style: isStacked && stackIndex > 0 ? {
                                                                                    left: `${stackIndex * 24}px`,
                                                                                    zIndex: stackIndex
                                                                                } : {},
                                                                                onClick: (e)=>{
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    if (!e.shiftKey) {
                                                                                        setHoveredCard(null); // Clear hover state when card is moved
                                                                                        setCardPositions((prev)=>{
                                                                                            const newSection = prev[cardId].section === 'deck' ? 'sideboard' : 'deck';
                                                                                            const newEnabled = newSection === 'deck';
                                                                                            return {
                                                                                                ...prev,
                                                                                                [cardId]: {
                                                                                                    ...prev[cardId],
                                                                                                    section: newSection,
                                                                                                    enabled: newEnabled,
                                                                                                    x: 0,
                                                                                                    y: 0
                                                                                                }
                                                                                            };
                                                                                        });
                                                                                    }
                                                                                },
                                                                                onMouseEnter: (e)=>{
                                                                                    setHoveredCard(cardId);
                                                                                    handleCardMouseEnter(position.card, e);
                                                                                },
                                                                                onMouseLeave: ()=>{
                                                                                    setHoveredCard(null);
                                                                                    handleCardMouseLeave();
                                                                                },
                                                                                children: [
                                                                                    card.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                                        src: card.imageUrl,
                                                                                        alt: card.name || 'Card',
                                                                                        className: "card-image",
                                                                                        draggable: false
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 3796,
                                                                                        columnNumber: 39
                                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "card-placeholder",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "card-name",
                                                                                                children: card.name || 'Card'
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                lineNumber: 3804,
                                                                                                columnNumber: 41
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "card-rarity",
                                                                                                style: {
                                                                                                    color: getRarityColor(card.rarity)
                                                                                                },
                                                                                                children: card.rarity
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                lineNumber: 3805,
                                                                                                columnNumber: 41
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 3803,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "card-badges",
                                                                                        children: card.isShowcase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "badge showcase-badge",
                                                                                            children: "Showcase"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 3811,
                                                                                            columnNumber: 59
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 3810,
                                                                                        columnNumber: 37
                                                                                    }, this)
                                                                                ]
                                                                            }, cardId, true, {
                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                lineNumber: 3758,
                                                                                columnNumber: 35
                                                                            }, this);
                                                                        }));
                                                                })()
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 3747,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 3730,
                                                        columnNumber: 25
                                                    }, this),
                                                    eventsCards.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            (unitsCards.length > 0 || upgradesCards.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    margin: '1.5rem 0'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 3825,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    marginTop: unitsCards.length === 0 && upgradesCards.length === 0 ? '1rem' : '0',
                                                                    marginBottom: '0.5rem'
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        fontSize: '0.9rem',
                                                                        color: 'rgba(255, 255, 255, 0.8)',
                                                                        textTransform: 'uppercase',
                                                                        letterSpacing: '0.5px'
                                                                    },
                                                                    children: `EVENTS (${eventsCards.length})`
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                    lineNumber: 3831,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 3827,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "cards-grid",
                                                                children: (()=>{
                                                                    const groupedCards = groupCardsByName(eventsCards);
                                                                    return groupedCards.map((group)=>renderCardStack(group, (cardEntry, stackIndex, isStacked)=>{
                                                                            const { cardId, position } = cardEntry;
                                                                            const card = position.card;
                                                                            const isSelected = selectedCards.has(cardId);
                                                                            const isHovered = hoveredCard === cardId;
                                                                            const isDisabled = !position.enabled;
                                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: `canvas-card ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isDisabled ? 'disabled' : ''} ${isStacked ? 'stacked' : ''}`,
                                                                                style: isStacked && stackIndex > 0 ? {
                                                                                    left: `${stackIndex * 24}px`,
                                                                                    zIndex: stackIndex
                                                                                } : {},
                                                                                onClick: (e)=>{
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    if (!e.shiftKey) {
                                                                                        setHoveredCard(null); // Clear hover state when card is moved
                                                                                        setCardPositions((prev)=>{
                                                                                            const newSection = prev[cardId].section === 'deck' ? 'sideboard' : 'deck';
                                                                                            const newEnabled = newSection === 'deck';
                                                                                            return {
                                                                                                ...prev,
                                                                                                [cardId]: {
                                                                                                    ...prev[cardId],
                                                                                                    section: newSection,
                                                                                                    enabled: newEnabled,
                                                                                                    x: 0,
                                                                                                    y: 0
                                                                                                }
                                                                                            };
                                                                                        });
                                                                                    }
                                                                                },
                                                                                onMouseEnter: (e)=>{
                                                                                    setHoveredCard(cardId);
                                                                                    handleCardMouseEnter(position.card, e);
                                                                                },
                                                                                onMouseLeave: ()=>{
                                                                                    setHoveredCard(null);
                                                                                    handleCardMouseLeave();
                                                                                },
                                                                                children: [
                                                                                    card.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                                        src: card.imageUrl,
                                                                                        alt: card.name || 'Card',
                                                                                        className: "card-image",
                                                                                        draggable: false
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 3889,
                                                                                        columnNumber: 39
                                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "card-placeholder",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "card-name",
                                                                                                children: card.name || 'Card'
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                lineNumber: 3897,
                                                                                                columnNumber: 41
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "card-rarity",
                                                                                                style: {
                                                                                                    color: getRarityColor(card.rarity)
                                                                                                },
                                                                                                children: card.rarity
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                lineNumber: 3898,
                                                                                                columnNumber: 41
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 3896,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "card-badges",
                                                                                        children: card.isShowcase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "badge showcase-badge",
                                                                                            children: "Showcase"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 3904,
                                                                                            columnNumber: 59
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 3903,
                                                                                        columnNumber: 37
                                                                                    }, this)
                                                                                ]
                                                                            }, cardId, true, {
                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                lineNumber: 3851,
                                                                                columnNumber: 35
                                                                            }, this);
                                                                        }));
                                                                })()
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 3840,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 3823,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 3605,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, aspectKey, true, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 3570,
                                        columnNumber: 17
                                    }, this);
                                    if (sortedCards.length > 0) {
                                        blocksWithContent.push(block);
                                    } else {
                                        blocksEmpty.push(block);
                                    }
                                });
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        blocksWithContent,
                                        blocksEmpty.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "blocks-empty-row",
                                            children: blocksEmpty
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 3928,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true);
                            }
                        })()
                    }, void 0, false, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 3331,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "sideboard-header",
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginTop: '1.5rem',
                            marginBottom: '0.75rem',
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            color: 'rgba(255, 255, 255, 0.9)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            paddingBottom: '0.25rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                            cursor: 'pointer',
                            userSelect: 'none'
                        },
                        onClick: ()=>setSideboardExpanded(!sideboardExpanded),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: sideboardExpanded ? '▼' : '▶'
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 3960,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "Sideboard (",
                                    Object.entries(cardPositions).filter(([_, position])=>position.section === 'sideboard' && position.visible && !position.card.isBase && !position.card.isLeader).filter(([_, position])=>cardMatchesFilters(position.card)).length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 3961,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 3940,
                        columnNumber: 11
                    }, this),
                    (()=>{
                        const sideboardCards = Object.entries(cardPositions).filter(([_, position])=>position.section === 'sideboard' && position.visible && !position.card.isBase && !position.card.isLeader).filter(([_, position])=>cardMatchesFilters(position.card));
                        if (sideboardCards.length === 0) {
                            return null;
                        }
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "blocks-sideboard-row",
                            children: sideboardExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "card-block",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "card-block-content",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "cards-grid",
                                        children: (()=>{
                                            const sideboardCards = Object.entries(cardPositions).filter(([_, position])=>position.section === 'sideboard' && position.visible && !position.card.isBase && !position.card.isLeader).map(([cardId, position])=>({
                                                    cardId,
                                                    position
                                                })).filter(({ position })=>cardMatchesFilters(position.card)).sort((a, b)=>defaultSort(a.position.card, b.position.card));
                                            const groupedCards = groupCardsByName(sideboardCards);
                                            return groupedCards.map((group)=>renderCardStack(group, (cardEntry, stackIndex, isStacked)=>{
                                                    const { cardId, position } = cardEntry;
                                                    const card = position.card;
                                                    const isSelected = selectedCards.has(cardId);
                                                    const isHovered = hoveredCard === cardId;
                                                    const isDisabled = !position.enabled;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `canvas-card ${card.isFoil ? 'foil' : ''} ${card.isHyperspace ? 'hyperspace' : ''} ${card.isShowcase ? 'showcase' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isDisabled ? 'disabled' : ''} ${isStacked ? 'stacked' : ''}`,
                                                        style: isStacked && stackIndex > 0 ? {
                                                            left: `${stackIndex * 24}px`,
                                                            zIndex: stackIndex
                                                        } : {},
                                                        onClick: (e)=>{
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (!e.shiftKey) {
                                                                setHoveredCard(null); // Clear hover state when card is moved
                                                                setCardPositions((prev)=>{
                                                                    const newSection = prev[cardId].section === 'deck' ? 'sideboard' : 'deck';
                                                                    const newEnabled = newSection === 'deck';
                                                                    return {
                                                                        ...prev,
                                                                        [cardId]: {
                                                                            ...prev[cardId],
                                                                            section: newSection,
                                                                            enabled: newEnabled,
                                                                            x: 0,
                                                                            y: 0
                                                                        }
                                                                    };
                                                                });
                                                            }
                                                        },
                                                        onMouseEnter: (e)=>{
                                                            setHoveredCard(cardId);
                                                            handleCardMouseEnter(position.card, e);
                                                        },
                                                        onMouseLeave: ()=>{
                                                            setHoveredCard(null);
                                                            handleCardMouseLeave();
                                                        },
                                                        children: [
                                                            card.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                src: card.imageUrl,
                                                                alt: card.name || 'Card',
                                                                className: "card-image",
                                                                draggable: false
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 4037,
                                                                columnNumber: 21
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "card-placeholder",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "card-name",
                                                                        children: card.name || 'Card'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4045,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "card-rarity",
                                                                        style: {
                                                                            color: getRarityColor(card.rarity)
                                                                        },
                                                                        children: card.rarity
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4046,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 4044,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "card-badges",
                                                                children: card.isShowcase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "badge showcase-badge",
                                                                    children: "Showcase"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                    lineNumber: 4052,
                                                                    columnNumber: 41
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 4051,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, cardId, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 3999,
                                                        columnNumber: 17
                                                    }, this);
                                                }));
                                        })()
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                        lineNumber: 3982,
                                        columnNumber: 23
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 3981,
                                    columnNumber: 21
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 3980,
                                columnNumber: 19
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/DeckBuilder.jsx",
                            lineNumber: 3978,
                            columnNumber: 15
                        }, this);
                    })()
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/DeckBuilder.jsx",
                lineNumber: 3054,
                columnNumber: 9
            }, this),
            viewMode === 'list' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "list-view",
                style: {
                    minHeight: '200px'
                },
                children: [
                    (()=>{
                        const leaderPositions = Object.entries(cardPositions).filter(([_, pos])=>pos.section === 'leaders-bases' && pos.visible && pos.card.isLeader).map(([cardId, pos])=>({
                                cardId,
                                card: pos.card,
                                enabled: pos.enabled !== false
                            }));
                        // Always render the section, even if empty
                        const sectionId = 'leaders';
                        const sectionSort = tableSort[sectionId] || {
                            field: null,
                            direction: 'asc'
                        };
                        const sortedLeaders = [
                            ...leaderPositions
                        ].sort((a, b)=>{
                            if (!sectionSort.field) {
                                return defaultSort(a.card, b.card);
                            }
                            return sortTableData(a.card, b.card, sectionSort.field, sectionSort.direction);
                        });
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "list-section",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "list-section-title",
                                    onClick: ()=>setLeadersExpanded(!leadersExpanded),
                                    style: {
                                        cursor: 'pointer',
                                        userSelect: 'none'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                marginRight: '0.5rem'
                                            },
                                            children: leadersExpanded ? '▼' : '▶'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 4095,
                                            columnNumber: 19
                                        }, this),
                                        "Leaders (",
                                        leaderPositions.length,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 4090,
                                    columnNumber: 17
                                }, this),
                                leadersExpanded && leaderPositions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    className: "list-table",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "checkbox-col",
                                                        style: {
                                                            visibility: 'hidden'
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            disabled: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 4103,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 4102,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "sortable",
                                                        onClick: ()=>handleTableSort('leaders', 'name'),
                                                        children: [
                                                            "Title ",
                                                            getSortArrow('leaders', 'name')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 4105,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "sortable",
                                                        onClick: ()=>handleTableSort('leaders', 'cost'),
                                                        children: [
                                                            "Cost ",
                                                            getSortArrow('leaders', 'cost')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 4108,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "sortable",
                                                        onClick: ()=>handleTableSort('leaders', 'aspects'),
                                                        children: [
                                                            "Aspects ",
                                                            getSortArrow('leaders', 'aspects')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 4111,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "sortable",
                                                        onClick: ()=>handleTableSort('leaders', 'rarity'),
                                                        children: [
                                                            "Rarity ",
                                                            getSortArrow('leaders', 'rarity')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 4114,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 4101,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 4100,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: sortedLeaders.map(({ cardId, card, enabled }, idx)=>{
                                                const aspectSymbols = card.aspects && card.aspects.length > 0 ? card.aspects.map((aspect, i)=>{
                                                    const symbol = getAspectSymbol(aspect, 'large');
                                                    return symbol ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "aspect-symbol-wrapper",
                                                        children: symbol
                                                    }, i, false, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 4124,
                                                        columnNumber: 45
                                                    }, this) : null;
                                                }).filter(Boolean) : null;
                                                const isSelected = activeLeader === cardId;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    onMouseEnter: (e)=>{
                                                        setHoveredCard(cardId);
                                                        handleCardMouseEnter(card, e);
                                                    },
                                                    onMouseLeave: ()=>{
                                                        setHoveredCard(null);
                                                        handleCardMouseLeave();
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "radio",
                                                                name: "leader-selection",
                                                                checked: isSelected,
                                                                onChange: (e)=>{
                                                                    if (e.target.checked) {
                                                                        setActiveLeader(cardId);
                                                                    } else {
                                                                        setActiveLeader(null);
                                                                    }
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 4141,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 4140,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "card-name-cell",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "card-name-main",
                                                                        style: {
                                                                            cursor: 'pointer'
                                                                        },
                                                                        onClick: (e)=>{
                                                                            if (e.metaKey || e.ctrlKey) {
                                                                                setSelectedCard(card);
                                                                            }
                                                                        },
                                                                        children: card.name || 'Unknown'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4156,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    card.subtitle && !card.isBase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "card-name-subtitle",
                                                                        children: card.subtitle
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4168,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 4155,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 4154,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: card.cost !== null && card.cost !== undefined ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    position: 'relative',
                                                                    display: 'inline-block',
                                                                    width: '39px',
                                                                    height: '39px'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                        src: "/icons/cost.png",
                                                                        alt: "cost",
                                                                        style: {
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'contain'
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4175,
                                                                        columnNumber: 33
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            position: 'absolute',
                                                                            top: '50%',
                                                                            left: '50%',
                                                                            transform: 'translate(-50%, -50%)',
                                                                            color: 'white',
                                                                            fontWeight: 'bold',
                                                                            fontSize: '16px',
                                                                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                                                        },
                                                                        children: card.cost
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4180,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 4174,
                                                                columnNumber: 31
                                                            }, this) : '-'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 4172,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "aspects-cell",
                                                            children: aspectSymbols && aspectSymbols.length > 0 ? aspectSymbols : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "Neutral"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 4196,
                                                                columnNumber: 90
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 4195,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                color: getRarityColor(card.rarity)
                                                            },
                                                            children: card.rarity || 'Unknown'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 4198,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, `leader-${cardId}-${idx}`, true, {
                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                    lineNumber: 4129,
                                                    columnNumber: 25
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 4119,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 4099,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/DeckBuilder.jsx",
                            lineNumber: 4089,
                            columnNumber: 15
                        }, this);
                    })(),
                    (()=>{
                        const basePositions = Object.entries(cardPositions).filter(([_, pos])=>pos.section === 'leaders-bases' && pos.visible && pos.card.isBase).map(([cardId, pos])=>({
                                cardId,
                                card: pos.card,
                                enabled: pos.enabled !== false
                            }));
                        // Always render the section, even if empty
                        const sectionId = 'bases';
                        const sectionSort = tableSort[sectionId] || {
                            field: null,
                            direction: 'asc'
                        };
                        const sortedBases = [
                            ...basePositions
                        ].sort((a, b)=>{
                            if (!sectionSort.field) {
                                return defaultSort(a.card, b.card);
                            }
                            return sortTableData(a.card, b.card, sectionSort.field, sectionSort.direction);
                        });
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "list-section",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "list-section-title",
                                    onClick: ()=>setBasesExpanded(!basesExpanded),
                                    style: {
                                        cursor: 'pointer',
                                        userSelect: 'none'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                marginRight: '0.5rem'
                                            },
                                            children: basesExpanded ? '▼' : '▶'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 4233,
                                            columnNumber: 19
                                        }, this),
                                        "Bases (",
                                        basePositions.length,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 4228,
                                    columnNumber: 17
                                }, this),
                                basesExpanded && basePositions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    className: "list-table",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "checkbox-col",
                                                        style: {
                                                            visibility: 'hidden'
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            disabled: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 4241,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 4240,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "sortable",
                                                        onClick: ()=>handleTableSort('name'),
                                                        children: [
                                                            "Title ",
                                                            getSortArrow('name')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 4243,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "sortable",
                                                        onClick: ()=>handleTableSort('cost'),
                                                        children: [
                                                            "Cost ",
                                                            getSortArrow('cost')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 4246,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "sortable",
                                                        onClick: ()=>handleTableSort('aspects'),
                                                        children: [
                                                            "Aspects ",
                                                            getSortArrow('aspects')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 4249,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "sortable",
                                                        onClick: ()=>handleTableSort('rarity'),
                                                        children: [
                                                            "Rarity ",
                                                            getSortArrow('rarity')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 4252,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 4239,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 4238,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: sortedBases.map(({ cardId, card, enabled }, idx)=>{
                                                const aspectSymbols = card.aspects && card.aspects.length > 0 ? card.aspects.map((aspect, i)=>{
                                                    const symbol = getAspectSymbol(aspect, 'large');
                                                    return symbol ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "aspect-symbol-wrapper",
                                                        children: symbol
                                                    }, i, false, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 4262,
                                                        columnNumber: 45
                                                    }, this) : null;
                                                }).filter(Boolean) : null;
                                                const isSelected = activeBase === cardId;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    onMouseEnter: (e)=>{
                                                        setHoveredCard(cardId);
                                                        handleCardMouseEnter(card, e);
                                                    },
                                                    onMouseLeave: ()=>{
                                                        setHoveredCard(null);
                                                        handleCardMouseLeave();
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "radio",
                                                                name: "base-selection",
                                                                checked: isSelected,
                                                                onChange: (e)=>{
                                                                    if (e.target.checked) {
                                                                        setActiveBase(cardId);
                                                                    } else {
                                                                        setActiveBase(null);
                                                                    }
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 4279,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 4278,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "card-name-cell",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "card-name-main",
                                                                        style: {
                                                                            cursor: 'pointer'
                                                                        },
                                                                        children: card.name || 'Unknown'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4294,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    card.subtitle && !card.isBase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "card-name-subtitle",
                                                                        children: card.subtitle
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4301,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 4293,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 4292,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: card.cost !== null && card.cost !== undefined ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    position: 'relative',
                                                                    display: 'inline-block',
                                                                    width: '39px',
                                                                    height: '39px'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                        src: "/icons/cost.png",
                                                                        alt: "cost",
                                                                        style: {
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'contain'
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4308,
                                                                        columnNumber: 33
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            position: 'absolute',
                                                                            top: '50%',
                                                                            left: '50%',
                                                                            transform: 'translate(-50%, -50%)',
                                                                            color: 'white',
                                                                            fontWeight: 'bold',
                                                                            fontSize: '16px',
                                                                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                                                        },
                                                                        children: card.cost
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4313,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 4307,
                                                                columnNumber: 31
                                                            }, this) : '-'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 4305,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "aspects-cell",
                                                            children: aspectSymbols && aspectSymbols.length > 0 ? aspectSymbols : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "Neutral"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 4329,
                                                                columnNumber: 90
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 4328,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                color: getRarityColor(card.rarity)
                                                            },
                                                            children: card.rarity || 'Unknown'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 4331,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, `base-${cardId}-${idx}`, true, {
                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                    lineNumber: 4267,
                                                    columnNumber: 25
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 4257,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 4237,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/DeckBuilder.jsx",
                            lineNumber: 4227,
                            columnNumber: 15
                        }, this);
                    })(),
                    (()=>{
                        const deckCardPositions = Object.entries(cardPositions).filter(([_, pos])=>pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader).map(([cardId, pos])=>({
                                cardId,
                                card: pos.card
                            }));
                        const sideboardCardPositions = Object.entries(cardPositions).filter(([_, pos])=>pos.section === 'sideboard' && pos.visible && !pos.card.isBase && !pos.card.isLeader).map(([cardId, pos])=>({
                                cardId,
                                card: pos.card
                            }));
                        // Always render the pool section container, even if empty
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "list-section",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "list-section-title",
                                    children: "Pool"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 4355,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "pool-subsection",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "pool-subsection-title",
                                            style: {
                                                userSelect: 'none'
                                            },
                                            children: [
                                                "Deck (",
                                                deckCardPositions.length,
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 4359,
                                            columnNumber: 19
                                        }, this),
                                        deckCardPositions.length > 0 && (()=>{
                                            if (sortOption === 'cost') {
                                                // Group by cost segments: 1, 2, 3, 4, 5, 6, 7, 8+
                                                const costSegments = [
                                                    1,
                                                    2,
                                                    3,
                                                    4,
                                                    5,
                                                    6,
                                                    7,
                                                    '8+'
                                                ];
                                                const groupedByCost = {};
                                                // Initialize all cost segments (even if empty)
                                                costSegments.forEach((segment)=>{
                                                    groupedByCost[segment] = [];
                                                });
                                                // Group cards by cost segment
                                                deckCardPositions.forEach(({ cardId, card })=>{
                                                    const cost = card.cost;
                                                    let segment;
                                                    if (cost === null || cost === undefined || cost === 0) {
                                                        segment = 1; // Default to 1 for cost 0 or null
                                                    } else if (cost >= 8) {
                                                        segment = '8+';
                                                    } else if (cost >= 1 && cost <= 7) {
                                                        segment = cost;
                                                    } else {
                                                        segment = 1; // Default to 1 for any other edge cases
                                                    }
                                                    if (!groupedByCost[segment]) {
                                                        groupedByCost[segment] = [];
                                                    }
                                                    groupedByCost[segment].push({
                                                        cardId,
                                                        card
                                                    });
                                                });
                                                // Render cost segments
                                                return costSegments.map((costSegment)=>{
                                                    const cards = groupedByCost[costSegment] || [];
                                                    const isExpanded = deckCostSectionsExpanded[costSegment] !== false // Default to expanded
                                                    ;
                                                    // Sort cards within this cost segment by aspect
                                                    const sectionId = `deck-cost-${costSegment}`;
                                                    const sectionSort = tableSort[sectionId] || {
                                                        field: null,
                                                        direction: 'asc'
                                                    };
                                                    const sortedCards = [
                                                        ...cards
                                                    ].sort((a, b)=>{
                                                        if (sectionSort.field) {
                                                            return sortTableData(a.card, b.card, sectionSort.field, sectionSort.direction);
                                                        }
                                                        // Sort by aspect within cost segment
                                                        const keyA = getDefaultAspectSortKey(a.card);
                                                        const keyB = getDefaultAspectSortKey(b.card);
                                                        if (keyA !== keyB) return keyA.localeCompare(keyB);
                                                        return defaultSort(a.card, b.card);
                                                    });
                                                    // Check if all cards in this segment are enabled (in deck)
                                                    const allEnabled = sortedCards.length > 0 && sortedCards.every(({ cardId })=>{
                                                        const position = cardPositions[cardId];
                                                        return position && position.section === 'deck' && position.enabled !== false;
                                                    });
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "deck-aspect-subsection",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                className: "pool-subsection-title",
                                                                onClick: ()=>setDeckCostSectionsExpanded((prev)=>({
                                                                            ...prev,
                                                                            [costSegment]: !isExpanded
                                                                        })),
                                                                style: {
                                                                    cursor: 'pointer',
                                                                    userSelect: 'none',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.5rem'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: isExpanded ? '▼' : '▶'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4424,
                                                                        columnNumber: 33
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            position: 'relative',
                                                                            display: 'inline-block',
                                                                            width: '32px',
                                                                            height: '32px'
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                                src: "/icons/cost.png",
                                                                                alt: "cost",
                                                                                style: {
                                                                                    width: '100%',
                                                                                    height: '100%',
                                                                                    objectFit: 'contain'
                                                                                }
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                lineNumber: 4426,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                style: {
                                                                                    position: 'absolute',
                                                                                    top: '50%',
                                                                                    left: '50%',
                                                                                    transform: 'translate(-50%, -50%)',
                                                                                    color: 'white',
                                                                                    fontWeight: 'bold',
                                                                                    fontSize: '18px',
                                                                                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                                                                },
                                                                                children: costSegment
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                lineNumber: 4431,
                                                                                columnNumber: 35
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4425,
                                                                        columnNumber: 33
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: [
                                                                            "(",
                                                                            cards.length,
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4444,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 4419,
                                                                columnNumber: 31
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `list-section-content-wrapper ${isExpanded ? '' : 'collapsed'}`,
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                                    className: "list-table",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                        className: "checkbox-col",
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                            type: "checkbox",
                                                                                            checked: allEnabled,
                                                                                            onChange: (e)=>{
                                                                                                const shouldEnable = e.target.checked;
                                                                                                setCardPositions((prev)=>{
                                                                                                    const updated = {
                                                                                                        ...prev
                                                                                                    };
                                                                                                    sortedCards.forEach(({ cardId })=>{
                                                                                                        updated[cardId] = {
                                                                                                            ...prev[cardId],
                                                                                                            section: shouldEnable ? 'deck' : 'sideboard',
                                                                                                            enabled: shouldEnable,
                                                                                                            x: 0,
                                                                                                            y: 0
                                                                                                        };
                                                                                                    });
                                                                                                    return updated;
                                                                                                });
                                                                                            }
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 4451,
                                                                                            columnNumber: 41
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 4450,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                        className: "sortable",
                                                                                        onClick: ()=>handleTableSort(`deck-cost-${costSegment}`, 'name'),
                                                                                        children: [
                                                                                            "Title ",
                                                                                            getSortArrow(`deck-cost-${costSegment}`, 'name')
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 4472,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                        className: "sortable",
                                                                                        onClick: ()=>handleTableSort(`deck-cost-${costSegment}`, 'type'),
                                                                                        children: [
                                                                                            "Type ",
                                                                                            getSortArrow(`deck-cost-${costSegment}`, 'type')
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 4475,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                        className: "sortable",
                                                                                        onClick: ()=>handleTableSort(`deck-cost-${costSegment}`, 'cost'),
                                                                                        children: [
                                                                                            "Cost ",
                                                                                            getSortArrow(`deck-cost-${costSegment}`, 'cost')
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 4478,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                        className: "sortable",
                                                                                        onClick: ()=>handleTableSort(`deck-cost-${costSegment}`, 'aspects'),
                                                                                        children: [
                                                                                            "Aspects ",
                                                                                            getSortArrow(`deck-cost-${costSegment}`, 'aspects')
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 4481,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                        className: "sortable",
                                                                                        onClick: ()=>handleTableSort(`deck-cost-${costSegment}`, 'rarity'),
                                                                                        children: [
                                                                                            "Rarity ",
                                                                                            getSortArrow(`deck-cost-${costSegment}`, 'rarity')
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 4484,
                                                                                        columnNumber: 39
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                lineNumber: 4449,
                                                                                columnNumber: 37
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                            lineNumber: 4448,
                                                                            columnNumber: 35
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                                            children: sortedCards.map(({ cardId, card }, idx)=>{
                                                                                const aspectSymbols = card.aspects && card.aspects.length > 0 ? card.aspects.map((aspect, i)=>{
                                                                                    const symbol = getAspectSymbol(aspect, 'large');
                                                                                    return symbol ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "aspect-symbol-wrapper",
                                                                                        children: symbol
                                                                                    }, i, false, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 4494,
                                                                                        columnNumber: 61
                                                                                    }, this) : null;
                                                                                }).filter(Boolean) : null;
                                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                checked: true,
                                                                                                onChange: (e)=>{
                                                                                                    setCardPositions((prev)=>({
                                                                                                            ...prev,
                                                                                                            [cardId]: {
                                                                                                                ...prev[cardId],
                                                                                                                section: 'sideboard',
                                                                                                                enabled: false
                                                                                                            }
                                                                                                        }));
                                                                                                }
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                lineNumber: 4502,
                                                                                                columnNumber: 45
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 4501,
                                                                                            columnNumber: 43
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "card-name-cell",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        className: "card-name-main",
                                                                                                        onMouseEnter: (e)=>{
                                                                                                            setHoveredCard(cardId);
                                                                                                            handleCardMouseEnter(card, e);
                                                                                                        },
                                                                                                        onMouseLeave: ()=>{
                                                                                                            setHoveredCard(null);
                                                                                                            handleCardMouseLeave();
                                                                                                        },
                                                                                                        onClick: (e)=>{
                                                                                                            if (e.metaKey || e.ctrlKey) {
                                                                                                                setSelectedCard(card);
                                                                                                            }
                                                                                                        },
                                                                                                        children: card.name || 'Unknown'
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                        lineNumber: 4515,
                                                                                                        columnNumber: 47
                                                                                                    }, this),
                                                                                                    card.subtitle && !card.isBase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        className: "card-name-subtitle",
                                                                                                        children: card.subtitle
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                        lineNumber: 4534,
                                                                                                        columnNumber: 49
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                lineNumber: 4514,
                                                                                                columnNumber: 45
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 4513,
                                                                                            columnNumber: 43
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                            children: getFormattedType(card)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 4538,
                                                                                            columnNumber: 43
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                            children: card.cost !== null && card.cost !== undefined ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                style: {
                                                                                                    position: 'relative',
                                                                                                    display: 'inline-block',
                                                                                                    width: '39px',
                                                                                                    height: '39px'
                                                                                                },
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                                                        src: "/icons/cost.png",
                                                                                                        alt: "cost",
                                                                                                        style: {
                                                                                                            width: '100%',
                                                                                                            height: '100%',
                                                                                                            objectFit: 'contain'
                                                                                                        }
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                        lineNumber: 4544,
                                                                                                        columnNumber: 49
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        style: {
                                                                                                            position: 'absolute',
                                                                                                            top: '50%',
                                                                                                            left: '50%',
                                                                                                            transform: 'translate(-50%, -50%)',
                                                                                                            color: 'white',
                                                                                                            fontWeight: 'bold',
                                                                                                            fontSize: '20px',
                                                                                                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                                                                                        },
                                                                                                        children: card.cost
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                        lineNumber: 4549,
                                                                                                        columnNumber: 49
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                lineNumber: 4543,
                                                                                                columnNumber: 47
                                                                                            }, this) : '-'
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 4541,
                                                                                            columnNumber: 43
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                            className: "aspects-cell",
                                                                                            children: aspectSymbols && aspectSymbols.length > 0 ? aspectSymbols : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                children: "Neutral"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                lineNumber: 4565,
                                                                                                columnNumber: 106
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 4564,
                                                                                            columnNumber: 43
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                            style: {
                                                                                                color: getRarityColor(card.rarity)
                                                                                            },
                                                                                            children: card.rarity || 'Unknown'
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 4567,
                                                                                            columnNumber: 43
                                                                                        }, this)
                                                                                    ]
                                                                                }, `deck-cost-${costSegment}-${cardId}-${idx}`, true, {
                                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                    lineNumber: 4498,
                                                                                    columnNumber: 41
                                                                                }, this);
                                                                            })
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                            lineNumber: 4489,
                                                                            columnNumber: 35
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                    lineNumber: 4447,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 4446,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, `cost-${costSegment}`, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 4418,
                                                        columnNumber: 29
                                                    }, this);
                                                });
                                            } else {
                                                // Aspect sort
                                                // Define all possible aspect combinations in order
                                                const aspectOrder = [
                                                    'vigilance_villainy',
                                                    'vigilance_heroism',
                                                    'vigilance_vigilance',
                                                    'vigilance',
                                                    'command_villainy',
                                                    'command_heroism',
                                                    'command_command',
                                                    'command',
                                                    'aggression_villainy',
                                                    'aggression_heroism',
                                                    'aggression_aggression',
                                                    'aggression',
                                                    'cunning_villainy',
                                                    'cunning_heroism',
                                                    'cunning_cunning',
                                                    'cunning',
                                                    'villainy',
                                                    'heroism',
                                                    'villainy_heroism',
                                                    'neutral'
                                                ];
                                                // Initialize all aspect combinations (even if empty)
                                                const groupedByAspect = {};
                                                aspectOrder.forEach((key)=>{
                                                    groupedByAspect[key] = [];
                                                });
                                                // Group cards by aspect combination
                                                deckCardPositions.forEach(({ cardId, card })=>{
                                                    const aspectKey = getAspectCombinationKey(card);
                                                    if (!groupedByAspect[aspectKey]) {
                                                        groupedByAspect[aspectKey] = [];
                                                    }
                                                    groupedByAspect[aspectKey].push({
                                                        cardId,
                                                        card
                                                    });
                                                });
                                                // Filter to only show segments that have cards
                                                const sortedAspectKeys = aspectOrder.filter((aspectKey)=>{
                                                    const cards = groupedByAspect[aspectKey] || [];
                                                    return cards.length > 0;
                                                });
                                                return sortedAspectKeys.map((aspectKey)=>{
                                                    const cards = groupedByAspect[aspectKey] || [];
                                                    const isExpanded = deckAspectSectionsExpanded[aspectKey] !== false // Default to expanded
                                                    ;
                                                    const displayName = getAspectCombinationDisplayName(aspectKey);
                                                    // Sort cards within this aspect combination
                                                    // Create a copy to avoid mutating the original array
                                                    const sectionId = `deck-aspect-${aspectKey}`;
                                                    const sectionSort = tableSort[sectionId] || {
                                                        field: null,
                                                        direction: 'asc'
                                                    };
                                                    const sortedCards = [
                                                        ...cards
                                                    ].sort((a, b)=>{
                                                        if (sectionSort.field) {
                                                            return sortTableData(a.card, b.card, sectionSort.field, sectionSort.direction);
                                                        }
                                                        return defaultSort(a.card, b.card);
                                                    });
                                                    // Check if all cards in this segment are enabled (in deck)
                                                    const allEnabled = sortedCards.length > 0 && sortedCards.every(({ cardId })=>{
                                                        const position = cardPositions[cardId];
                                                        return position && position.section === 'deck' && position.enabled !== false;
                                                    });
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "deck-aspect-subsection",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                className: "pool-subsection-title",
                                                                onClick: ()=>setDeckAspectSectionsExpanded((prev)=>({
                                                                            ...prev,
                                                                            [aspectKey]: !isExpanded
                                                                        })),
                                                                style: {
                                                                    cursor: 'pointer',
                                                                    userSelect: 'none',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.5rem'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: isExpanded ? '▼' : '▶'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4638,
                                                                        columnNumber: 33
                                                                    }, this),
                                                                    getAspectCombinationIcons(aspectKey),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            textTransform: 'uppercase'
                                                                        },
                                                                        children: getAspectCombinationDisplayName(aspectKey)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4640,
                                                                        columnNumber: 33
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: [
                                                                            "(",
                                                                            cards.length,
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4641,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 4633,
                                                                columnNumber: 31
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `list-section-content-wrapper ${isExpanded ? '' : 'collapsed'}`,
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                                    className: "list-table",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                        className: "checkbox-col",
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                            type: "checkbox",
                                                                                            checked: allEnabled,
                                                                                            onChange: (e)=>{
                                                                                                const shouldEnable = e.target.checked;
                                                                                                setCardPositions((prev)=>{
                                                                                                    const updated = {
                                                                                                        ...prev
                                                                                                    };
                                                                                                    // If section is empty and we're enabling, restore all cards from sideboard
                                                                                                    if (sortedCards.length === 0 && shouldEnable) {
                                                                                                        // Find all cards in sideboard that match this aspect combination
                                                                                                        Object.entries(prev).forEach(([cardId, position])=>{
                                                                                                            if (position.section === 'sideboard' && position.visible && !position.card.isBase && !position.card.isLeader && getAspectCombinationKey(position.card) === aspectKey) {
                                                                                                                updated[cardId] = {
                                                                                                                    ...position,
                                                                                                                    section: 'deck',
                                                                                                                    enabled: true,
                                                                                                                    x: 0,
                                                                                                                    y: 0
                                                                                                                };
                                                                                                            }
                                                                                                        });
                                                                                                    } else {
                                                                                                        // Normal behavior: toggle existing cards
                                                                                                        sortedCards.forEach(({ cardId })=>{
                                                                                                            updated[cardId] = {
                                                                                                                ...prev[cardId],
                                                                                                                section: shouldEnable ? 'deck' : 'sideboard',
                                                                                                                enabled: shouldEnable,
                                                                                                                x: 0,
                                                                                                                y: 0
                                                                                                            };
                                                                                                        });
                                                                                                    }
                                                                                                    return updated;
                                                                                                });
                                                                                            }
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 4648,
                                                                                            columnNumber: 41
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 4647,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                        className: "sortable",
                                                                                        onClick: ()=>handleTableSort(`deck-aspect-${aspectKey}`, 'name'),
                                                                                        children: [
                                                                                            "Title ",
                                                                                            getSortArrow(`deck-aspect-${aspectKey}`, 'name')
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 4692,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                        className: "sortable",
                                                                                        onClick: ()=>handleTableSort(`deck-aspect-${aspectKey}`, 'type'),
                                                                                        children: [
                                                                                            "Type ",
                                                                                            getSortArrow(`deck-aspect-${aspectKey}`, 'type')
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 4695,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                        className: "sortable",
                                                                                        onClick: ()=>handleTableSort(`deck-aspect-${aspectKey}`, 'cost'),
                                                                                        children: [
                                                                                            "Cost ",
                                                                                            getSortArrow(`deck-aspect-${aspectKey}`, 'cost')
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 4698,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                        className: "sortable",
                                                                                        onClick: ()=>handleTableSort(`deck-aspect-${aspectKey}`, 'aspects'),
                                                                                        children: [
                                                                                            "Aspects ",
                                                                                            getSortArrow(`deck-aspect-${aspectKey}`, 'aspects')
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 4701,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                        className: "sortable",
                                                                                        onClick: ()=>handleTableSort(`deck-aspect-${aspectKey}`, 'rarity'),
                                                                                        children: [
                                                                                            "Rarity ",
                                                                                            getSortArrow(`deck-aspect-${aspectKey}`, 'rarity')
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 4704,
                                                                                        columnNumber: 39
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                lineNumber: 4646,
                                                                                columnNumber: 37
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                            lineNumber: 4645,
                                                                            columnNumber: 35
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                                            children: sortedCards.map(({ cardId, card }, idx)=>{
                                                                                const aspectSymbols = card.aspects && card.aspects.length > 0 ? card.aspects.map((aspect, i)=>{
                                                                                    const symbol = getAspectSymbol(aspect, 'large');
                                                                                    return symbol ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "aspect-symbol-wrapper",
                                                                                        children: symbol
                                                                                    }, i, false, {
                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                        lineNumber: 4714,
                                                                                        columnNumber: 61
                                                                                    }, this) : null;
                                                                                }).filter(Boolean) : null;
                                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                checked: true,
                                                                                                onChange: (e)=>{
                                                                                                    setCardPositions((prev)=>({
                                                                                                            ...prev,
                                                                                                            [cardId]: {
                                                                                                                ...prev[cardId],
                                                                                                                section: 'sideboard',
                                                                                                                enabled: false
                                                                                                            }
                                                                                                        }));
                                                                                                }
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                lineNumber: 4722,
                                                                                                columnNumber: 45
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 4721,
                                                                                            columnNumber: 43
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "card-name-cell",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        className: "card-name-main",
                                                                                                        onMouseEnter: (e)=>{
                                                                                                            setHoveredCard(cardId);
                                                                                                            handleCardMouseEnter(card, e);
                                                                                                        },
                                                                                                        onMouseLeave: ()=>{
                                                                                                            setHoveredCard(null);
                                                                                                            handleCardMouseLeave();
                                                                                                        },
                                                                                                        onClick: (e)=>{
                                                                                                            if (e.metaKey || e.ctrlKey) {
                                                                                                                setSelectedCard(card);
                                                                                                            }
                                                                                                        },
                                                                                                        children: card.name || 'Unknown'
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                        lineNumber: 4735,
                                                                                                        columnNumber: 47
                                                                                                    }, this),
                                                                                                    card.subtitle && !card.isBase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        className: "card-name-subtitle",
                                                                                                        children: card.subtitle
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                        lineNumber: 4754,
                                                                                                        columnNumber: 49
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                lineNumber: 4734,
                                                                                                columnNumber: 45
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 4733,
                                                                                            columnNumber: 43
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                            children: getFormattedType(card)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 4758,
                                                                                            columnNumber: 43
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                            children: card.cost !== null && card.cost !== undefined ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                style: {
                                                                                                    position: 'relative',
                                                                                                    display: 'inline-block',
                                                                                                    width: '39px',
                                                                                                    height: '39px'
                                                                                                },
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                                                        src: "/icons/cost.png",
                                                                                                        alt: "cost",
                                                                                                        style: {
                                                                                                            width: '100%',
                                                                                                            height: '100%',
                                                                                                            objectFit: 'contain'
                                                                                                        }
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                        lineNumber: 4764,
                                                                                                        columnNumber: 49
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        style: {
                                                                                                            position: 'absolute',
                                                                                                            top: '50%',
                                                                                                            left: '50%',
                                                                                                            transform: 'translate(-50%, -50%)',
                                                                                                            color: 'white',
                                                                                                            fontWeight: 'bold',
                                                                                                            fontSize: '20px',
                                                                                                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                                                                                        },
                                                                                                        children: card.cost
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                        lineNumber: 4769,
                                                                                                        columnNumber: 49
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                lineNumber: 4763,
                                                                                                columnNumber: 47
                                                                                            }, this) : '-'
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 4761,
                                                                                            columnNumber: 43
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                            className: "aspects-cell",
                                                                                            children: aspectSymbols && aspectSymbols.length > 0 ? aspectSymbols : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                children: "Neutral"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                                lineNumber: 4785,
                                                                                                columnNumber: 106
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 4784,
                                                                                            columnNumber: 43
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                            style: {
                                                                                                color: getRarityColor(card.rarity)
                                                                                            },
                                                                                            children: card.rarity || 'Unknown'
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                            lineNumber: 4787,
                                                                                            columnNumber: 43
                                                                                        }, this)
                                                                                    ]
                                                                                }, `deck-${aspectKey}-${cardId}-${idx}`, true, {
                                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                    lineNumber: 4718,
                                                                                    columnNumber: 41
                                                                                }, this);
                                                                            })
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                            lineNumber: 4709,
                                                                            columnNumber: 35
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                    lineNumber: 4644,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 4643,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, aspectKey, true, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 4632,
                                                        columnNumber: 29
                                                    }, this);
                                                });
                                            }
                                        })()
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 4358,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "pool-subsection",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "pool-subsection-title",
                                            style: {
                                                userSelect: 'none'
                                            },
                                            children: [
                                                "Sideboard (",
                                                sideboardCardPositions.length,
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 4803,
                                            columnNumber: 19
                                        }, this),
                                        (()=>{
                                            const sectionId = 'sideboard';
                                            const sectionSort = tableSort[sectionId] || {
                                                field: null,
                                                direction: 'asc'
                                            };
                                            const sortedSideboard = [
                                                ...sideboardCardPositions
                                            ].sort((a, b)=>{
                                                if (!sectionSort.field) {
                                                    return defaultSort(a.card, b.card);
                                                }
                                                return sortTableData(a.card, b.card, sectionSort.field, sectionSort.direction);
                                            });
                                            return sortedSideboard.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                className: "list-table",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "checkbox-col",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "checkbox",
                                                                        checked: false,
                                                                        onChange: (e)=>{
                                                                            const shouldEnable = e.target.checked;
                                                                            setCardPositions((prev)=>{
                                                                                const updated = {
                                                                                    ...prev
                                                                                };
                                                                                sideboardCardPositions.forEach(({ cardId })=>{
                                                                                    updated[cardId] = {
                                                                                        ...prev[cardId],
                                                                                        section: shouldEnable ? 'deck' : 'sideboard',
                                                                                        enabled: shouldEnable,
                                                                                        x: 0,
                                                                                        y: 0
                                                                                    };
                                                                                });
                                                                                return updated;
                                                                            });
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4821,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                    lineNumber: 4820,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "sortable",
                                                                    onClick: ()=>handleTableSort('sideboard', 'name'),
                                                                    children: [
                                                                        "Title ",
                                                                        getSortArrow('sideboard', 'name')
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                    lineNumber: 4842,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "sortable",
                                                                    onClick: ()=>handleTableSort('sideboard', 'cost'),
                                                                    children: [
                                                                        "Cost ",
                                                                        getSortArrow('sideboard', 'cost')
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                    lineNumber: 4845,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "sortable",
                                                                    onClick: ()=>handleTableSort('sideboard', 'aspects'),
                                                                    children: [
                                                                        "Aspects ",
                                                                        getSortArrow('sideboard', 'aspects')
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                    lineNumber: 4848,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "sortable",
                                                                    onClick: ()=>handleTableSort('sideboard', 'rarity'),
                                                                    children: [
                                                                        "Rarity ",
                                                                        getSortArrow('sideboard', 'rarity')
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                    lineNumber: 4851,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                            lineNumber: 4819,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 4818,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                        children: sortedSideboard.map(({ cardId, card }, idx)=>{
                                                            const aspectSymbols = card.aspects && card.aspects.length > 0 ? card.aspects.map((aspect, i)=>{
                                                                const symbol = getAspectSymbol(aspect, 'large');
                                                                return symbol ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "aspect-symbol-wrapper",
                                                                    children: symbol
                                                                }, i, false, {
                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                    lineNumber: 4861,
                                                                    columnNumber: 49
                                                                }, this) : null;
                                                            }).filter(Boolean) : null;
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                onMouseEnter: (e)=>{
                                                                    setHoveredCard(cardId);
                                                                    handleCardMouseEnter(card, e);
                                                                },
                                                                onMouseLeave: ()=>{
                                                                    setHoveredCard(null);
                                                                    handleCardMouseLeave();
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "checkbox",
                                                                            checked: false,
                                                                            onChange: (e)=>{
                                                                                setCardPositions((prev)=>({
                                                                                        ...prev,
                                                                                        [cardId]: {
                                                                                            ...prev[cardId],
                                                                                            section: 'deck',
                                                                                            enabled: true,
                                                                                            x: 0,
                                                                                            y: 0
                                                                                        }
                                                                                    }));
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                            lineNumber: 4877,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4876,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "card-name-cell",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "card-name-main",
                                                                                    style: {
                                                                                        cursor: 'pointer'
                                                                                    },
                                                                                    onClick: (e)=>{
                                                                                        if (e.metaKey || e.ctrlKey) {
                                                                                            setSelectedCard(card);
                                                                                        }
                                                                                    },
                                                                                    children: card.name || 'Unknown'
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                    lineNumber: 4890,
                                                                                    columnNumber: 35
                                                                                }, this),
                                                                                card.subtitle && !card.isBase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "card-name-subtitle",
                                                                                    children: card.subtitle
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                    lineNumber: 4902,
                                                                                    columnNumber: 37
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                            lineNumber: 4889,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4888,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        children: card.cost !== null && card.cost !== undefined ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                position: 'relative',
                                                                                display: 'inline-block',
                                                                                width: '39px',
                                                                                height: '39px'
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                                    src: "/icons/cost.png",
                                                                                    alt: "cost",
                                                                                    style: {
                                                                                        width: '100%',
                                                                                        height: '100%',
                                                                                        objectFit: 'contain'
                                                                                    }
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                    lineNumber: 4909,
                                                                                    columnNumber: 37
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    style: {
                                                                                        position: 'absolute',
                                                                                        top: '50%',
                                                                                        left: '50%',
                                                                                        transform: 'translate(-50%, -50%)',
                                                                                        color: 'white',
                                                                                        fontWeight: 'bold',
                                                                                        fontSize: '16px',
                                                                                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                                                                    },
                                                                                    children: card.cost
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                                    lineNumber: 4914,
                                                                                    columnNumber: 37
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                            lineNumber: 4908,
                                                                            columnNumber: 35
                                                                        }, this) : '-'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4906,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "aspects-cell",
                                                                        children: aspectSymbols && aspectSymbols.length > 0 ? aspectSymbols : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: "Neutral"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                            lineNumber: 4930,
                                                                            columnNumber: 94
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4929,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        style: {
                                                                            color: getRarityColor(card.rarity)
                                                                        },
                                                                        children: card.rarity || 'Unknown'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                        lineNumber: 4932,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, `sideboard-${cardId}-${idx}`, true, {
                                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                                lineNumber: 4865,
                                                                columnNumber: 29
                                                            }, this);
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DeckBuilder.jsx",
                                                        lineNumber: 4856,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                                lineNumber: 4817,
                                                columnNumber: 23
                                            }, this) : null;
                                        })()
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 4802,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/DeckBuilder.jsx",
                            lineNumber: 4354,
                            columnNumber: 15
                        }, this);
                    })()
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/DeckBuilder.jsx",
                lineNumber: 4070,
                columnNumber: 9
            }, this),
            selectedCard && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$CardModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                card: selectedCard,
                onClose: ()=>setSelectedCard(null)
            }, void 0, false, {
                fileName: "[project]/src/components/DeckBuilder.jsx",
                lineNumber: 4948,
                columnNumber: 9
            }, this),
            hoveredCardPreview && (()=>{
                const card = hoveredCardPreview.card;
                const hasBackImage = card.backImageUrl && card.isLeader;
                const isHorizontal = card.isLeader || card.isBase;
                const borderRadius = '23px' // Slightly smaller than 24px to reduce clipping
                ;
                // Calculate dimensions
                let previewWidth, previewHeight;
                if (hasBackImage) {
                    // Leader with back: side by side (horizontal front + vertical back)
                    previewWidth = 504 + 360 + 20; // 504px front + 360px back + 20px gap
                    previewHeight = 504; // Max height (vertical back is 504px)
                } else {
                    // Leaders and bases are landscape: 168px x 120px, so 3x = 504px x 360px
                    // Regular cards are portrait: 120px x 168px, so 3x = 360px x 504px
                    previewWidth = isHorizontal ? 504 : 360;
                    previewHeight = isHorizontal ? 360 : 504;
                }
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "card-preview-enlarged",
                    style: {
                        position: 'fixed',
                        left: `${hoveredCardPreview.x}px`,
                        top: `${hoveredCardPreview.y}px`,
                        zIndex: 10000,
                        pointerEvents: 'auto',
                        transform: 'translateY(-50%)',
                        width: `${previewWidth}px`,
                        height: `${previewHeight}px`,
                        borderRadius: borderRadius,
                        overflow: 'visible',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '20px'
                    },
                    onMouseEnter: handlePreviewMouseEnter,
                    onMouseLeave: handlePreviewMouseLeave,
                    children: hasBackImage ? // Show both front (horizontal) and back (vertical) side by side for leaders
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: card.isFoil && (!card.isLeader || card.isShowcase) ? 'card-preview-foil' : '',
                                style: {
                                    width: '504px',
                                    height: '360px',
                                    overflow: 'hidden',
                                    borderRadius: borderRadius,
                                    boxShadow: card.isFoil && (!card.isLeader || card.isShowcase) ? '0 0 15px rgba(255, 255, 255, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.8)',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    position: 'relative'
                                },
                                children: card.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: card.imageUrl,
                                    alt: `${card.name || 'Card'} - Front`,
                                    style: {
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 5008,
                                    columnNumber: 21
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: '100%',
                                        height: '100%',
                                        background: 'rgba(26, 26, 46, 0.95)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        color: 'white'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '1.2rem',
                                                marginBottom: '0.5rem'
                                            },
                                            children: [
                                                card.name || 'Card',
                                                " - Front"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 5030,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                color: getRarityColor(card.rarity)
                                            },
                                            children: card.rarity
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 5033,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 5019,
                                    columnNumber: 21
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 4998,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: card.isFoil && (!card.isLeader || card.isShowcase) ? 'card-preview-foil' : '',
                                style: {
                                    width: '360px',
                                    height: '504px',
                                    overflow: 'hidden',
                                    borderRadius: borderRadius,
                                    boxShadow: card.isFoil && (!card.isLeader || card.isShowcase) ? '0 0 15px rgba(255, 255, 255, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.8)',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    position: 'relative'
                                },
                                children: card.backImageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: card.backImageUrl,
                                    alt: `${card.name || 'Card'} - Back`,
                                    style: {
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 5050,
                                    columnNumber: 21
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: '100%',
                                        height: '100%',
                                        background: 'rgba(26, 26, 46, 0.95)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        color: 'white'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '1.2rem',
                                                marginBottom: '0.5rem'
                                            },
                                            children: [
                                                card.name || 'Card',
                                                " - Back"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 5072,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                color: getRarityColor(card.rarity)
                                            },
                                            children: card.rarity
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DeckBuilder.jsx",
                                            lineNumber: 5075,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 5061,
                                    columnNumber: 21
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 5040,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true) : // Single card (non-leader, base, or leader without back)
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: card.isFoil && (!card.isLeader || card.isShowcase) ? 'card-preview-foil' : '',
                        style: {
                            width: `${previewWidth}px`,
                            height: `${previewHeight}px`,
                            overflow: 'hidden',
                            borderRadius: borderRadius,
                            boxShadow: card.isFoil && (!card.isLeader || card.isShowcase) ? '0 0 15px rgba(255, 255, 255, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.8)',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            position: 'relative'
                        },
                        children: card.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: card.imageUrl,
                            alt: card.name || 'Card',
                            style: {
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/components/DeckBuilder.jsx",
                            lineNumber: 5094,
                            columnNumber: 19
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: '100%',
                                height: '100%',
                                background: 'rgba(26, 26, 46, 0.95)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '1rem',
                                color: 'white'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: '1.2rem',
                                        marginBottom: '0.5rem'
                                    },
                                    children: card.name || 'Card'
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 5116,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        color: getRarityColor(card.rarity)
                                    },
                                    children: card.rarity
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DeckBuilder.jsx",
                                    lineNumber: 5119,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/DeckBuilder.jsx",
                            lineNumber: 5105,
                            columnNumber: 19
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/DeckBuilder.jsx",
                        lineNumber: 5084,
                        columnNumber: 15
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/DeckBuilder.jsx",
                    lineNumber: 4972,
                    columnNumber: 11
                }, this);
            })(),
            tooltip.show && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tooltip",
                style: {
                    position: 'fixed',
                    left: `${tooltip.x}px`,
                    top: `${tooltip.y}px`,
                    transform: tooltip.alignLeft ? 'translateX(-100%) translateY(-50%)' : 'translateX(-50%) translateY(-100%)',
                    zIndex: 10000,
                    pointerEvents: 'none',
                    marginTop: tooltip.alignLeft ? '0' : '-8px',
                    ...tooltip.marginRight && {
                        marginRight: tooltip.marginRight
                    }
                },
                children: tooltip.text
            }, void 0, false, {
                fileName: "[project]/src/components/DeckBuilder.jsx",
                lineNumber: 5131,
                columnNumber: 9
            }, this),
            deckImageModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "deck-image-modal-overlay",
                onClick: ()=>{
                    URL.revokeObjectURL(deckImageModal);
                    setDeckImageModal(null);
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "deck-image-modal-content",
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "deck-image-modal-close",
                            onClick: ()=>{
                                URL.revokeObjectURL(deckImageModal);
                                setDeckImageModal(null);
                            },
                            children: "×"
                        }, void 0, false, {
                            fileName: "[project]/src/components/DeckBuilder.jsx",
                            lineNumber: 5156,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: deckImageModal,
                            alt: "Deck Export",
                            className: "deck-image-modal-image"
                        }, void 0, false, {
                            fileName: "[project]/src/components/DeckBuilder.jsx",
                            lineNumber: 5165,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "deck-image-modal-actions",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "deck-image-modal-download",
                                onClick: ()=>{
                                    const a = document.createElement('a');
                                    a.href = deckImageModal;
                                    // Generate filename with pool name and timestamp
                                    const now = new Date();
                                    const month = String(now.getMonth() + 1).padStart(2, '0');
                                    const day = String(now.getDate()).padStart(2, '0');
                                    let hours = now.getHours();
                                    const minutes = String(now.getMinutes()).padStart(2, '0');
                                    const ampm = hours >= 12 ? 'PM' : 'AM';
                                    hours = hours % 12;
                                    hours = hours ? hours : 12;
                                    const timeStr = `${month}${day}_${hours}${minutes}${ampm}`;
                                    const displayName = poolName || `${setCode} ${poolType === 'draft' ? 'Draft' : 'Sealed'}`;
                                    // Sanitize filename - remove invalid characters
                                    const sanitizedName = displayName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                                    a.download = `${sanitizedName}_${timeStr}.png`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                },
                                children: "Download Image"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DeckBuilder.jsx",
                                lineNumber: 5171,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/DeckBuilder.jsx",
                            lineNumber: 5170,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/DeckBuilder.jsx",
                    lineNumber: 5155,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/DeckBuilder.jsx",
                lineNumber: 5151,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/DeckBuilder.jsx",
        lineNumber: 2476,
        columnNumber: 5
    }, this);
}
_s(DeckBuilder, "plx/kNTAubJiCCjVF1DuOzZMb18=");
_c = DeckBuilder;
const __TURBOPACK__default__export__ = DeckBuilder;
var _c;
__turbopack_context__.k.register(_c, "DeckBuilder");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/TermsOfService.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
;
function TermsOfService({ onBack }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "legal-page",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "legal-content",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "back-button",
                    onClick: onBack,
                    children: "← Back"
                }, void 0, false, {
                    fileName: "[project]/src/components/TermsOfService.jsx",
                    lineNumber: 7,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    children: "Terms of Service"
                }, void 0, false, {
                    fileName: "[project]/src/components/TermsOfService.jsx",
                    lineNumber: 10,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "last-updated",
                    children: [
                        "Last Updated: ",
                        new Date().toLocaleDateString()
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TermsOfService.jsx",
                    lineNumber: 11,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "1. Acceptance of Terms"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 14,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: 'By accessing and using Protect the Pod ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.'
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 15,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TermsOfService.jsx",
                    lineNumber: 13,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "2. Description of Service"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 21,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "Protect the Pod is a web application that simulates opening sealed pods of Star Wars: Unlimited booster packs. The Service allows users to generate virtual booster packs, build decks, and share card pools."
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 22,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TermsOfService.jsx",
                    lineNumber: 20,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "3. User Accounts"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 29,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "You may use the Service with or without creating an account. When you create an account using Discord OAuth, you are responsible for maintaining the security of your account. You are responsible for all activities that occur under your account."
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 30,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TermsOfService.jsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "4. User Content"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 37,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "You retain ownership of any content you create or share through the Service, including card pools and deck configurations. By sharing content, you grant us a license to display and distribute that content through the Service."
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 38,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TermsOfService.jsx",
                    lineNumber: 36,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "5. Intellectual Property"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 45,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "The Service and its original content, features, and functionality are owned by Protect the Pod and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws."
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 46,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "Star Wars: Unlimited is a trademark of Fantasy Flight Games and The Walt Disney Company. This Service is not affiliated with, endorsed by, or sponsored by Fantasy Flight Games or The Walt Disney Company."
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 50,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TermsOfService.jsx",
                    lineNumber: 44,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "6. Prohibited Uses"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 57,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "You may not use the Service:"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 58,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "For any unlawful purpose or to solicit others to perform unlawful acts"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TermsOfService.jsx",
                                    lineNumber: 60,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TermsOfService.jsx",
                                    lineNumber: 61,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "To infringe upon or violate our intellectual property rights or the intellectual property rights of others"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TermsOfService.jsx",
                                    lineNumber: 62,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TermsOfService.jsx",
                                    lineNumber: 63,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "To submit false or misleading information"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TermsOfService.jsx",
                                    lineNumber: 64,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "To upload or transmit viruses or any other type of malicious code"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TermsOfService.jsx",
                                    lineNumber: 65,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 59,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TermsOfService.jsx",
                    lineNumber: 56,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "7. Disclaimer"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 70,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: 'The Service is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not guarantee that the Service will be available at all times or that it will be error-free.'
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 71,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TermsOfService.jsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "8. Limitation of Liability"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "In no event shall Protect the Pod, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses."
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 79,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TermsOfService.jsx",
                    lineNumber: 77,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "9. Changes to Terms"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 86,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect."
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 87,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TermsOfService.jsx",
                    lineNumber: 85,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "10. Contact Information"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 94,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "If you have any questions about these Terms of Service, please contact us through the Service."
                        }, void 0, false, {
                            fileName: "[project]/src/components/TermsOfService.jsx",
                            lineNumber: 95,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TermsOfService.jsx",
                    lineNumber: 93,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/TermsOfService.jsx",
            lineNumber: 6,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/TermsOfService.jsx",
        lineNumber: 5,
        columnNumber: 5
    }, this);
}
_c = TermsOfService;
const __TURBOPACK__default__export__ = TermsOfService;
var _c;
__turbopack_context__.k.register(_c, "TermsOfService");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/PrivacyPolicy.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
;
function PrivacyPolicy({ onBack }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "legal-page",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "legal-content",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "back-button",
                    onClick: onBack,
                    children: "← Back"
                }, void 0, false, {
                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                    lineNumber: 7,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    children: "Privacy Policy"
                }, void 0, false, {
                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                    lineNumber: 10,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "last-updated",
                    children: [
                        "Last Updated: ",
                        new Date().toLocaleDateString()
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                    lineNumber: 11,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "1. Information We Collect"
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 14,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "When you use Protect the Pod, we may collect the following information:"
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 15,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Account Information:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                            lineNumber: 19,
                                            columnNumber: 17
                                        }, this),
                                        " If you sign in with Discord, we collect your Discord user ID, username, and email address (if provided by Discord)."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                    lineNumber: 19,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Usage Data:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                            lineNumber: 20,
                                            columnNumber: 17
                                        }, this),
                                        " We may collect information about how you use the Service, including card pools you create, decks you build, and content you share."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                    lineNumber: 20,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Technical Data:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                            lineNumber: 21,
                                            columnNumber: 17
                                        }, this),
                                        " We automatically collect certain technical information, such as your IP address, browser type, and device information."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                    lineNumber: 21,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 18,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                    lineNumber: 13,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "2. How We Use Your Information"
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 26,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "We use the information we collect to:"
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 27,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "Provide, maintain, and improve the Service"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                    lineNumber: 29,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "Authenticate your account and manage your user session"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                    lineNumber: 30,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "Store and display your card pools and deck configurations"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                    lineNumber: 31,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "Enable sharing features when you choose to make content public"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                    lineNumber: 32,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "Respond to your requests and provide customer support"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                    lineNumber: 33,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "Monitor and analyze usage patterns to improve the Service"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                    lineNumber: 34,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 28,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "3. Data Storage"
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 39,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "Your data is stored securely using industry-standard practices. Card pools and deck configurations are stored in our database and associated with your account (if you are signed in) or stored temporarily in your browser session (if you are not signed in)."
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 40,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                    lineNumber: 38,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "4. Data Sharing"
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 47,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:"
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 48,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Public Content:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                            lineNumber: 52,
                                            columnNumber: 17
                                        }, this),
                                        " If you choose to make a card pool or deck public, it will be accessible to anyone with the share link."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                    lineNumber: 52,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Service Providers:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                            lineNumber: 53,
                                            columnNumber: 17
                                        }, this),
                                        " We may share information with third-party service providers who assist us in operating the Service (e.g., hosting providers, database services)."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                    lineNumber: 53,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Legal Requirements:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                            lineNumber: 54,
                                            columnNumber: 17
                                        }, this),
                                        " We may disclose information if required by law or in response to valid legal requests."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                    lineNumber: 54,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 51,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                    lineNumber: 46,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "5. Cookies and Tracking"
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 59,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "We use cookies and similar technologies to maintain your session and remember your preferences. We do not use third-party tracking cookies or advertising cookies."
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 60,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                    lineNumber: 58,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "6. Third-Party Services"
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 67,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "The Service uses Discord OAuth for authentication. When you sign in with Discord, you are subject to Discord's Privacy Policy. We only receive the information that Discord provides through their OAuth API."
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 68,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                    lineNumber: 66,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "7. Data Security"
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 75,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure."
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 76,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                    lineNumber: 74,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "8. Your Rights"
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 83,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "You have the right to:"
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 84,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "Access the personal information we hold about you"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                    lineNumber: 86,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "Request correction of inaccurate information"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                    lineNumber: 87,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "Request deletion of your account and associated data"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                    lineNumber: 88,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "Opt out of certain data collection practices"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                                    lineNumber: 89,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 85,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "To exercise these rights, please contact us through the Service."
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 91,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "9. Children's Privacy"
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 97,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "The Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13."
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 98,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                    lineNumber: 96,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "10. Changes to This Privacy Policy"
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 104,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.'
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 105,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                    lineNumber: 103,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "11. Contact Us"
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 112,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "If you have any questions about this Privacy Policy, please contact us through the Service."
                        }, void 0, false, {
                            fileName: "[project]/src/components/PrivacyPolicy.jsx",
                            lineNumber: 113,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/PrivacyPolicy.jsx",
                    lineNumber: 111,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/PrivacyPolicy.jsx",
            lineNumber: 6,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/PrivacyPolicy.jsx",
        lineNumber: 5,
        columnNumber: 5
    }, this);
}
_c = PrivacyPolicy;
const __TURBOPACK__default__export__ = PrivacyPolicy;
var _c;
__turbopack_context__.k.register(_c, "PrivacyPolicy");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_f5879fc0._.js.map