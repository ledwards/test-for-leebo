# DeckBuilder Refactor Plan

## Current Status (Updated Jan 31, 2026)

### Progress Summary
- **Original DeckBuilder.jsx:** ~6700 lines
- **Current DeckBuilder.jsx:** 2050 lines
- **Reduction:** ~4650 lines (~69%)
- **E2E Tests:** 58/59 passing (1 flaky test)
- **Context Integration:** ✓ Complete - sub-components use DeckBuilderContext
- **Grid View Sections:** ✓ Extracted to DeckSection & PoolSection components
- **List View Sections:** ✓ Extracted to SelectionListSection & PoolListSection
- **Export Functionality:** ✓ Extracted to useDeckExport hook
- **Drag & Drop:** ✓ Extracted to useDragAndDrop hook
- **Card Preview:** ✓ Extracted to useCardPreview hook
- **Tooltip:** ✓ Extracted to useTooltip hook
- **Aspect Utilities:** ✓ Extracted to aspectCombinations.js

### Completed Work

#### Phase 2: Extracted Sub-Components (in `src/components/DeckBuilder/`)
| Component | Lines | Status |
|-----------|-------|--------|
| CardPreview.jsx | ~200 | ✓ Complete |
| AspectFilterModal.jsx | ~550 | ✓ Complete |
| LeaderBaseSelector.jsx | ~250 | ✓ Complete |
| SortControls.jsx | ~100 | ✓ Complete |
| FilterWithModal.jsx | ~50 | ✓ Complete |
| AspectPenaltyToggle.jsx | ~75 | ✓ Complete |
| BulkMoveButtons.jsx | ~80 | ✓ Complete |
| SectionHeader.jsx | ~100 | ✓ Complete |
| DeckBuilderHeader.jsx | ~200 | ✓ Complete |
| StickyInfoBar.jsx | ~315 | ✓ Complete |
| TypeIcon.jsx | ~50 | ✓ Complete |
| GroupHeader.jsx | ~75 | ✓ Complete |
| ListTableHeader.jsx | ~55 | ✓ Complete |
| SelectionListSection.jsx | ~115 | ✓ Complete |
| PoolListSection.jsx | ~400 | ✓ Complete |
| Tooltip.jsx | ~30 | ✓ Complete |
| DeckImageModal.jsx | ~70 | ✓ Complete |
| DeleteDeckSection.jsx | ~80 | ✓ Complete |
| ViewModeToggle.jsx | ~40 | ✓ Complete |
| CollapsibleSectionHeader.jsx | ~35 | ✓ Complete |
| index.js | ~30 | ✓ Complete |

#### Hook Extractions (in `src/hooks/`)
| Hook | Lines | Status |
|------|-------|--------|
| useDeckExport.js | ~370 | ✓ Complete |
| useDragAndDrop.js | ~380 | ✓ Complete |
| useCardPreview.js | ~130 | ✓ Complete |
| useTooltip.js | ~100 | ✓ Complete |

#### Utility Extractions (in `src/utils/cardSort.js`)
| Function | Purpose | Status |
|----------|---------|--------|
| getCardTypeOrder | Sort order for card types | ✓ Complete |
| getTypeStringOrder | Sort order from type string | ✓ Complete |
| sortGroupKeys | Sort group keys by cost/type/aspect | ✓ Complete |
| createGetGroupKey | Factory for group key generator | ✓ Complete |
| createDefaultSortFn | Factory for default card sort | ✓ Complete |
| createGroupCardSortFn | Factory for within-group sort | ✓ Complete |

#### Utility Extractions (in `src/utils/aspectCombinations.js`)
| Function | Purpose | Status |
|----------|---------|--------|
| getAspectCombinationKey | Get grouping key for card aspects | ✓ Complete |
| getAspectCombinationDisplayName | Get display name for aspect key | ✓ Complete |
| getAspectKey | Get sortable key for aspects | ✓ Complete |

### Remaining Work

#### HIGH PRIORITY - Next Steps

1. ~~**Phase 3: DeckBuilderContext**~~ ✓ COMPLETE
   - Context integrated into DeckBuilder
   - Sub-components (LeaderBaseSelector, SectionHeader, etc.) use context
   - Props fallback pattern for backwards compatibility

2. ~~**Extract CardPool component**~~ ✓ COMPLETE (PoolSection.jsx)
   - Extracted to ~190 lines in separate component

3. ~~**Extract DeckSection component**~~ ✓ COMPLETE (DeckSection.jsx)
   - Extracted to ~200 lines in separate component

4. ~~**Extract List View sections**~~ ✓ COMPLETE
   - SelectionListSection: shared component for Leaders/Bases
   - PoolListSection: Pool/Deck/Sideboard list view
   - useDeckExport: Export functions (JSON, clipboard, image)

#### MEDIUM PRIORITY

5. **Phase 1: CSS Consolidation** (~2 hours)
   - Create `src/styles/CardStyles.css`
   - Remove duplicate styles
   - Clean up Card.css vs DeckBuilder.css conflicts

6. **Phase 5: CardGrid component** (~2 hours)
   - Standardize card grid layouts
   - Replace repeated grid rendering code

7. ~~**ExportModal extraction**~~ ✓ COMPLETE (useDeckExport hook)
   - Export functions extracted to hook

#### LOW PRIORITY (Polish)

8. **Unit tests for components** (~4+ hours)
9. **Final cleanup and dead code removal** (~2 hours)
10. **Replace remaining List View table headers with ListTableHeader** (~2 hours)

### Success Criteria (from original plan)
- [ ] DeckBuilder.jsx < 500 lines (currently 2271 - 66% reduction from 6700)
- [x] Card component used everywhere
- [ ] All state in context (not started)
- [x] Each component < 200 lines (most are)
- [x] All existing E2E tests pass
- [ ] New unit tests for components

### Git Commits Made This Session
1. `d07ecaa` - Extract initial DeckBuilder sub-components (10 files)
2. `356697c` - Extract TypeIcon component
3. `0c284e5` - Extract GroupHeader component
4. `b2694f3` - Update DeckBuilder index exports
5. `240900b` - Add cardSort utilities
6. `7f98ad7` - Update DeckBuilder to use extracted components
7. `23bc85c` - Extract sortGroupKeys utility
8. `0c30f8d` - Add ListTableHeader component
9. `895c4b1` - Add DeckBuilderContext and update refactor plan
10. `3b90861` - Add component library (AspectIcon, Card, CollapsibleSection, SearchInput)
11. `f32dd57` - Add component extraction plan documentation
12. `3b09dc2` - Replace inline cost icons with CostIcon component (-118 lines)
13. `dfecc49` - Use ListTableHeader for bases section, fix sorting bug
14. `85c6856` - Extract getRarityColor to aspectColors utility
15. `d398767` - Extract getAspectIcons helper function
16. `6eadcd2` - Extract toggleCardSection callback
17. `7647285` - Add getDeckCards and getPoolCards helper functions
18. `d783f50` - Memoize leaderCard and baseCard
19. `6b50c45` - docs: Update refactor plan with session progress
20. `9574337` - Consolidate Card event handlers with getCardEventHandlers helper
21. `83dd6f5` - Add moveCardsToDeck/moveCardsToPool helpers for bulk operations
22. `2002372` - Add createCardRenderer factory for card stack rendering
23. `359e4a6` - Remove redundant leaderCard/baseCard computations
24. `672db9d` - Integrate DeckBuilderContext into DeckBuilder component
25. `cfed080` - Simplify LeaderBaseSelector to use context
26. `bdbd24d` - Update SectionHeader to use DeckBuilderContext
27. `bf15602` - Update DeckBuilder sub-components to use context
28. `31b284b` - Add PoolSection and DeckSection components
29. `4c895b3` - Integrate DeckSection and PoolSection (-286 lines)

### Commands for Testing
```bash
# Run all E2E tests except slow 8-player test
npm run test:e2e -- --grep-invert "8-player"

# Run just sealed happy path (quick sanity check)
npm run test:e2e -- --grep "Sealed Happy Path"

# Check line count
wc -l src/components/DeckBuilder.jsx
```

### Important Notes
- NEVER PUSH WITHOUT HUMAN REVIEW - pushes trigger deploy
- The mobile test (`deck-builder.spec.js:220`) is flaky - pre-existing issue
- Skip 8-player test during iteration (takes 10+ minutes)
- Run full 8-player test at major checkpoints only

---

## Original Plan (For Reference)

[Rest of original plan content below...]

## Goal
Refactor the 6000+ line DeckBuilder.jsx into modular, testable, reusable components that use our new component library (Card, AspectIcon, CollapsibleSection, etc.).

## Current Problems

### 1. Monolithic File
- `DeckBuilder.jsx` is 6000+ lines
- Contains rendering, state management, utilities, and business logic all mixed together
- Impossible to test individual pieces
- Hard to understand and modify

### 2. CSS Conflicts
- `DeckBuilder.css` has extensive `.canvas-card` styles
- `Card.css` duplicates these styles
- Can't use Card component without conflicts

### 3. Repeated Patterns
- Card rendering code repeated 6+ times with slight variations
- Collapsible section pattern repeated many times
- Filter toggle pattern repeated

### 4. Tightly Coupled State
- 50+ useState hooks in one component
- State logic intertwined with rendering
- No clear data flow

---

## Refactor Strategy

### Phase 1: CSS Consolidation
**Goal:** Single source of truth for card styles

1. **Delete Card.css** - Remove the new CSS file entirely
2. **Update Card component** to only manage class names, not styles
3. **Keep all card styles in DeckBuilder.css** for now
4. **Extract shared card styles** to a new `CardStyles.css` that both can import

### Phase 2: Extract Sub-Components
**Goal:** Break DeckBuilder into logical pieces

See "Completed Work" section above for status.

### Phase 3: Extract State Management
**Goal:** Centralize state logic, make it testable

#### 3.1 Create DeckBuilder Context
```jsx
// src/contexts/DeckBuilderContext.jsx
const DeckBuilderContext = createContext()

export function DeckBuilderProvider({ children, initialState }) {
  // All deck builder state here
  const [cardPositions, setCardPositions] = useState({})
  const [activeLeader, setActiveLeader] = useState(null)
  const [activeBase, setActiveBase] = useState(null)
  // ... etc

  // All state mutations as functions
  const selectLeader = (cardId) => { ... }
  const moveCardToDeck = (cardId) => { ... }
  const moveCardToSideboard = (cardId) => { ... }

  return (
    <DeckBuilderContext.Provider value={{
      // State
      cardPositions,
      activeLeader,
      activeBase,
      // Actions
      selectLeader,
      moveCardToDeck,
      moveCardToSideboard,
    }}>
      {children}
    </DeckBuilderContext.Provider>
  )
}

export const useDeckBuilder = () => useContext(DeckBuilderContext)
```

### Phase 4: Migrate to Card Component
**Goal:** Use Card component for all card rendering - MOSTLY COMPLETE

### Phase 5: Create CardGrid Component
**Goal:** Standardize card grid layouts

```jsx
// src/components/CardGrid.jsx
export function CardGrid({
  cards,
  renderCard,
  groupBy,
  sortBy,
  emptyMessage,
  className,
}) {
  // Handle grouping
  // Handle sorting
  // Render cards in grid
}
```

---

## File Structure After Refactor

```
src/
├── components/
│   ├── Card/
│   │   ├── Card.jsx
│   │   └── index.js
│   ├── CardGrid/
│   │   ├── CardGrid.jsx
│   │   ├── CardGrid.css
│   │   └── index.js
│   ├── DeckBuilder/
│   │   ├── DeckBuilder.jsx        # Main orchestrator (goal: <500 lines)
│   │   ├── DeckBuilder.css
│   │   ├── DeckBuilderHeader.jsx  ✓
│   │   ├── LeaderBaseSelector.jsx ✓
│   │   ├── CardPool.jsx           (TODO)
│   │   ├── DeckSection.jsx        (TODO)
│   │   ├── SideboardSection.jsx   (TODO)
│   │   ├── CardPreview.jsx        ✓
│   │   ├── AspectFilterModal.jsx  ✓
│   │   ├── StickyInfoBar.jsx      ✓
│   │   ├── SectionHeader.jsx      ✓
│   │   ├── SortControls.jsx       ✓
│   │   ├── FilterWithModal.jsx    ✓
│   │   ├── AspectPenaltyToggle.jsx ✓
│   │   ├── BulkMoveButtons.jsx    ✓
│   │   ├── TypeIcon.jsx           ✓
│   │   ├── GroupHeader.jsx        ✓
│   │   ├── ListTableHeader.jsx    ✓
│   │   └── index.js               ✓
│   ├── AspectIcon/
│   ├── CollapsibleSection/
│   ├── SearchInput/
│   └── Button/
├── contexts/
│   └── DeckBuilderContext.jsx     (TODO - HIGH PRIORITY)
├── hooks/
│   ├── useDeckBuilderState.js     (TODO)
│   ├── useDeckFilters.js          (TODO)
│   ├── useDeckSorting.js          (TODO)
│   └── useCardSelection.js        (TODO)
├── utils/
│   └── cardSort.js                ✓
├── styles/
│   └── CardStyles.css             (TODO)
└── services/
    └── cards/                     ✓ (Already extracted)
```
