# Refactoring Progress Tracker

**Started:** TBD
**Target Completion:** TBD

---

## Phase 1: Foundation

### 1.1 Utility Layer
- [ ] Create `src/utils/json.js` - Safe JSON parsing utility
  - [ ] Write characterization tests
  - [ ] Implement `jsonParse(value, fallback)`
  - [ ] Replace 171 inline occurrences
  - [ ] Unit tests passing

- [ ] Create `src/repositories/httpClient.js` - HTTP client wrapper
  - [ ] Write characterization tests for existing fetch patterns
  - [ ] Implement `HttpClient` class with `get`, `post`, `put`, `delete`
  - [ ] Standardized error handling
  - [ ] Unit tests passing

- [ ] Create `src/hooks/common/useLocalStorage.js`
  - [ ] Write characterization tests
  - [ ] Implement hook with SSR safety
  - [ ] Unit tests passing

- [ ] Create `src/hooks/common/useIsMobile.js`
  - [ ] Implement mobile detection hook
  - [ ] Unit tests passing

### 1.2 Service Layer Structure
- [ ] Create `src/services/` directory structure
- [ ] Create empty service files with JSDoc interfaces

---

## Phase 2: Extract Pure Business Logic

### 2.1 Card Sorting Service
- [ ] Write characterization tests for current sorting
- [ ] Create `src/services/cards/cardSorting.js`
- [ ] Extract `getDefaultAspectSortKey()` from play/page.js
- [ ] Extract `defaultSort()` from play/page.js
- [ ] Update play/page.js to use service
- [ ] All tests passing
- [ ] Write unit tests (target: 15+ tests)
- [ ] Coverage: ____%

### 2.2 Aspect Penalty Service
- [ ] Write characterization tests for penalty calculations
- [ ] Create `src/services/deck/aspectPenalties.js`
- [ ] Extract leader ability registry
- [ ] Extract `calculateAspectPenalty()` from DeckBuilder
- [ ] Update DeckBuilder to use service
- [ ] All tests passing
- [ ] Write unit tests (target: 10+ tests)
- [ ] Coverage: ____%

### 2.3 Card Filtering Service
- [ ] Write characterization tests for filtering
- [ ] Create `src/services/cards/cardFiltering.js`
- [ ] Extract aspect filtering logic
- [ ] Extract type filtering logic
- [ ] Extract cost filtering logic
- [ ] Update DeckBuilder to use service
- [ ] All tests passing
- [ ] Write unit tests (target: 20+ tests)
- [ ] Coverage: ____%

---

## Phase 3: Extract Repository Layer

### 3.1 HTTP Client
- [ ] Create `src/repositories/httpClient.js`
- [ ] Implement base client with error handling
- [ ] Unit tests passing

### 3.2 Draft Repository
- [ ] Create `src/repositories/draftRepository.js`
- [ ] Extract methods from `src/utils/draftApi.js`
- [ ] Update all callers
- [ ] Integration tests passing

### 3.3 Pool Repository
- [ ] Create `src/repositories/poolRepository.js`
- [ ] Extract from `src/utils/poolApi.js`
- [ ] Update all callers
- [ ] Integration tests passing

### 3.4 Storage Repository
- [ ] Create `src/repositories/storageRepository.js`
- [ ] Abstract localStorage access
- [ ] Unit tests passing

---

## Phase 4: Extract Custom Hooks

### 4.1 Deck Hooks
- [ ] Create `src/hooks/deck/useDeckState.js`
- [ ] Create `src/hooks/deck/useDeckFilters.js`
- [ ] Create `src/hooks/deck/useDeckSort.js`
- [ ] Create `src/hooks/deck/useDragDrop.js`
- [ ] Create `src/hooks/deck/useExpansionState.js`
- [ ] Hook tests passing

### 4.2 Draft Hooks
- [ ] Create `src/hooks/draft/useDraftRoom.js`
- [ ] Create `src/hooks/draft/useDraftSelection.js`
- [ ] Create `src/hooks/draft/useLeaderPreview.js`
- [ ] Hook tests passing

### 4.3 Common Hooks
- [ ] Create `src/hooks/common/useHoverPreview.js`
- [ ] Create `src/hooks/common/usePagination.js`
- [ ] Hook tests passing

---

## Phase 5: Component Decomposition

### 5.1 DeckBuilder Decomposition
**Starting lines:** 7,042
**Target lines (main):** <300

- [ ] Write integration tests for DeckBuilder
- [ ] Extract `PoolSection.jsx`
- [ ] Extract `DeckSection.jsx`
- [ ] Extract `SideboardSection.jsx`
- [ ] Extract `LeadersBasesSection.jsx`
- [ ] Extract `FilterPanel.jsx`
- [ ] Extract `SortControls.jsx`
- [ ] Extract `CardGrid.jsx`
- [ ] Extract `DragDropCanvas.jsx`
- [ ] Extract `DeckStats.jsx`
- [ ] Extract `AspectPenaltyDisplay.jsx`
- [ ] Integration tests passing
- [ ] Main component lines: ____

### 5.2 Stats Page Decomposition
**Starting lines:** 1,345
**Target lines (main):** <100

- [ ] Write integration tests for stats page
- [ ] Extract `ReferenceTab.jsx`
- [ ] Extract `QATab.jsx`
- [ ] Extract `TestTab.jsx`
- [ ] Extract `GenerationStatsTab/index.jsx`
- [ ] Extract `GenerationStatsTab/CardsSubTab.jsx`
- [ ] Extract `GenerationStatsTab/PacksSubTab.jsx`
- [ ] Integration tests passing
- [ ] Main component lines: ____

### 5.3 Play Page Decomposition
**Starting lines:** 1,115
**Target lines (main):** <200

- [ ] Write integration tests
- [ ] Extract sub-components
- [ ] Integration tests passing
- [ ] Main component lines: ____

---

## Phase 6: API Route Refactoring

### 6.1 Stats Route
- [ ] Create `StatsService`
- [ ] Create `StatsRepository`
- [ ] Refactor `app/api/stats/generations/route.js`
- [ ] Tests passing

### 6.2 Draft Routes
- [ ] Refactor `app/api/draft/[shareId]/route.js`
- [ ] Refactor `app/api/draft/[shareId]/select/route.js`
- [ ] Tests passing

---

## Phase 7: Belt System Refactoring

### 7.1 Belt Factory
- [ ] Create `src/belts/beltFactory.js`
- [ ] Implement dependency injection for cache
- [ ] Tests passing

### 7.2 Remove Global State
- [ ] Replace `beltCache` with injected cache
- [ ] Replace `botBehaviors` global
- [ ] Tests passing

---

## Metrics Tracking

| Metric | Before | After Phase 1 | After Phase 2 | After Phase 3 | After Phase 4 | After Phase 5 | Final |
|--------|--------|---------------|---------------|---------------|---------------|---------------|-------|
| Largest file (lines) | 7,042 | | | | | | |
| Files >500 lines | 7 | | | | | | |
| Avg component lines | ~400 | | | | | | |
| Duplicated patterns | 171 | | | | | | |
| Service test coverage | 0% | | | | | | |
| useState in DeckBuilder | 68 | | | | | | |

---

## Notes & Decisions

### Phase 1
-

### Phase 2
-

### Phase 3
-

---

## Blockers & Issues

| Issue | Phase | Status | Resolution |
|-------|-------|--------|------------|
| | | | |

---

*Update this document after each significant extraction.*
