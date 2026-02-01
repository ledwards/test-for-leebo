# Component Extraction Plan - Phase 2

This document outlines opportunities to extract reusable components from the codebase, consolidate duplicated patterns, and improve code organization.

## Progress

### Completed Components
- **AspectIcon** - Created and integrated into DeckBuilder (replaces inline `getAspectSymbol`)
- **Card** - Created with variant system (default, selectable, preview), states (selected, hovered, disabled, stacked), and penalty display
  - Available for use in NEW code
  - Note: Migration of existing DeckBuilder canvas-card code was attempted but reverted due to CSS conflicts between Card.css and DeckBuilder.css styles
- **CollapsibleSection** - Created with controlled/uncontrolled modes, block variant, header actions
- **SearchInput** - Created with debounce, clear button, size variants
- **Component Index** - Created `src/components/index.js` for easy imports

### Migration Notes
The Card component exists and works standalone, but migrating existing DeckBuilder code requires careful CSS refactoring:
- DeckBuilder.css has extensive `.canvas-card` styles with pseudo-elements
- Card.css duplicates some of these styles, causing conflicts
- Safe migration would require either:
  1. Remove Card.css and only use canvas-card styles from DeckBuilder.css
  2. Or refactor DeckBuilder.css to not conflict with Card.css

### Next Steps
1. Use Card component for any NEW card displays (not in DeckBuilder)
2. Consider refactoring DeckBuilder.css before attempting migration
3. CollapsibleSection can be used for new expandable sections

## Overview

The codebase has grown organically with several patterns being repeated across components. This plan identifies extraction opportunities that will:
- Reduce code duplication
- Improve maintainability
- Create a consistent component library
- Make future development faster

---

## 1. Card Component

**Current State:** Card rendering is implemented differently across multiple files:
- `DeckBuilder.jsx` - Canvas-based card rendering with `canvas-card` class
- `SealedPod.jsx` - Image-based cards with `card-item` class
- `DraftView.jsx` - Draftable cards with selection states
- `PackOpeningAnimation.jsx` - Animated flying cards

**Extraction Plan:**

### `<Card>` Component
A unified card component with multiple rendering modes and configuration options.

```jsx
// Proposed API
<Card
  card={cardData}
  variant="default" | "selectable" | "draftable" | "preview"
  size="sm" | "md" | "lg" | "xl"  // Predefined sizes
  orientation="portrait" | "landscape" // Auto-detected from isLeader/isBase
  selected={boolean}
  disabled={boolean}
  showBadges={boolean}  // Foil, hyperspace, showcase badges
  showQuantity={number}
  onClick={handler}
  onHover={handler}
  className={string}
/>
```

**Props:**
- `card` - Card data object (id, name, imageUrl, backImageUrl, isLeader, isBase, isFoil, etc.)
- `variant` - Rendering variant
  - `default` - Static display
  - `selectable` - Click to select, shows selected state
  - `draftable` - For draft picking with count display
  - `preview` - Enlarged preview mode
- `size` - Consistent sizing across the app
- `orientation` - Portrait/landscape (auto-detected for leaders/bases)
- `selected` - Selection state
- `disabled` - Disable interactions
- `showBadges` - Show foil/hyperspace/showcase badges
- `showQuantity` - Show quantity badge (for deck builder)

**Files to Consolidate:**
- `src/components/DeckBuilder.jsx:353-400` - Canvas card rendering
- `src/components/SealedPod.jsx:353-453` - Card item rendering
- `src/components/DraftView.jsx` - Draftable card handling
- `src/components/PackOpeningAnimation.jsx:457-494` - Flying card rendering

---

## 2. AspectIcon Component

**Current State:** Aspect icons are rendered using the `getAspectSymbol()` function in multiple places with inconsistent sizing.

**Locations:**
- `DeckBuilder.jsx:134-146` - `getAspectSymbol(aspect)` function
- `DeckBuilder.jsx` - Multiple usages with different sizes

**Extraction Plan:**

### `<AspectIcon>` Component

```jsx
// Proposed API
<AspectIcon
  aspect="Vigilance" | "Command" | "Aggression" | "Cunning" | "Villainy" | "Heroism"
  size="xs" | "sm" | "md" | "lg"
  withLabel={boolean}
  className={string}
/>
```

**Props:**
- `aspect` - One of the 6 aspects
- `size` - Icon size (xs=12px, sm=16px, md=20px, lg=24px)
- `withLabel` - Show aspect name next to icon
- `className` - Additional styling

**Mapping:**
| Aspect | Symbol |
|--------|--------|
| Vigilance | ⬡ |
| Command | ⬢ |
| Aggression | ◢ |
| Cunning | ◇ |
| Villainy | ▼ |
| Heroism | △ |

---

## 3. FilterToggle Component

**Current State:** Toggle filters are implemented inline in multiple places with similar patterns.

**Locations:**
- `DeckBuilder.jsx` - Aspect filters, cost mode toggle, type filters
- Various filter UIs throughout the app

**Extraction Plan:**

### `<FilterToggle>` Component

```jsx
// Proposed API
<FilterToggle
  label="Vigilance"
  icon={<AspectIcon aspect="Vigilance" />}
  active={boolean}
  onChange={handler}
  variant="default" | "aspect" | "type"
  size="sm" | "md"
/>

// Group wrapper
<FilterToggleGroup
  filters={[{ key, label, icon, active }]}
  onChange={(key, active) => {}}
  exclusive={boolean}  // Single selection vs multi
/>
```

**Files to Update:**
- `src/components/DeckBuilder.jsx` - Extract filter toggle logic

---

## 4. CardGrid Component

**Current State:** Card grids are implemented differently in each component with varied layouts.

**Locations:**
- `DeckBuilder.jsx` - Pool grid, deck grid
- `SealedPod.jsx` - Pack cards grid
- `DraftView.jsx` - Available cards grid

**Extraction Plan:**

### `<CardGrid>` Component

```jsx
// Proposed API
<CardGrid
  cards={cardArray}
  columns={number | "auto"}  // Fixed or responsive
  gap="sm" | "md" | "lg"
  renderCard={(card, index) => <Card ... />}
  emptyState={<EmptyMessage />}
  groupBy="aspect" | "type" | "cost" | null
  sortBy="name" | "cost" | "aspect" | null
/>
```

---

## 5. CollapsibleSection Component

**Current State:** Collapsible/expandable sections exist in DeckBuilder but are implemented inline.

**Extraction Plan:**

### `<CollapsibleSection>` Component

```jsx
// Proposed API
<CollapsibleSection
  title="Pool Cards"
  defaultExpanded={true}
  badge={cardCount}
  headerActions={<Button>+ All</Button>}
  onToggle={handler}
>
  {children}
</CollapsibleSection>
```

**Props:**
- `title` - Section header text
- `defaultExpanded` - Initial state
- `badge` - Optional count/badge in header
- `headerActions` - Buttons/actions in header
- `onToggle` - Callback on expand/collapse

---

## 6. DeckInfoBar Component

**Current State:** The deck info bar (leader/base display, card count, export buttons) is tightly coupled to DeckBuilder.

**Extraction Plan:**

### `<DeckInfoBar>` Component

```jsx
// Proposed API
<DeckInfoBar
  leader={leaderCard}
  base={baseCard}
  deckCount={number}
  isValid={boolean}
  onLeaderClick={handler}
  onBaseClick={handler}
  actions={<ExportButtons />}
/>
```

---

## 7. SearchInput Component

**Current State:** Search functionality is implemented inline in DeckBuilder.

**Extraction Plan:**

### `<SearchInput>` Component

```jsx
// Proposed API
<SearchInput
  value={string}
  onChange={handler}
  placeholder="Search cards..."
  debounce={300}
  clearable={boolean}
  size="sm" | "md"
/>
```

---

## 8. CostModeSelector Component

**Current State:** The cost mode toggle (aspect vs cost grouping) is implemented inline.

**Extraction Plan:**

### `<CostModeSelector>` Component

```jsx
// Proposed API
<CostModeSelector
  mode="aspect" | "cost"
  onChange={handler}
  showLabels={boolean}
/>
```

---

## 9. PoolSelector Component (Draft/Sealed)

**Current State:** Leader and base selection is implemented inline in DeckBuilder.

**Extraction Plan:**

### `<PoolSelector>` Component

```jsx
// Proposed API
<PoolSelector
  type="leader" | "base"
  options={cardArray}
  selected={card}
  onSelect={handler}
  aspectConstraint={aspectArray}  // For highlighting in/out of aspect
/>
```

---

## 10. ExportButtons Component

**Current State:** Export functionality (JSON, download, image) is scattered.

**Extraction Plan:**

### `<ExportButtons>` Component

```jsx
// Proposed API
<ExportButtons
  deck={deckData}
  pool={poolData}
  onExportJson={handler}
  onDownload={handler}
  onGenerateImage={handler}
  variant="full" | "compact"
/>
```

---

## Implementation Priority

### High Priority (Core Components)
1. **Card** - Most reused, biggest impact ✅ CREATED (src/components/Card.jsx)
2. **AspectIcon** - Simple, high reuse ✅ CREATED & INTEGRATED (src/components/AspectIcon.jsx)
3. **FilterToggle** - Used in multiple places

### Medium Priority (DeckBuilder Extraction)
4. **CardGrid** - Standardizes layouts
5. **CollapsibleSection** - Common pattern ✅ CREATED (src/components/CollapsibleSection.jsx)
6. **SearchInput** - Reusable utility ✅ CREATED (src/components/SearchInput.jsx)

### Lower Priority (Specialized)
7. **DeckInfoBar** - DeckBuilder specific
8. **CostModeSelector** - DeckBuilder specific
9. **PoolSelector** - DeckBuilder specific
10. **ExportButtons** - Play page specific

---

## File Structure

After extraction, the component structure would be:

```
src/components/
├── Button/
│   ├── Button.jsx
│   └── Button.css
├── Card/
│   ├── Card.jsx
│   ├── Card.css
│   └── index.js
├── AspectIcon/
│   ├── AspectIcon.jsx
│   └── index.js
├── FilterToggle/
│   ├── FilterToggle.jsx
│   ├── FilterToggleGroup.jsx
│   └── FilterToggle.css
├── CardGrid/
│   ├── CardGrid.jsx
│   └── CardGrid.css
├── CollapsibleSection/
│   ├── CollapsibleSection.jsx
│   └── CollapsibleSection.css
├── SearchInput/
│   ├── SearchInput.jsx
│   └── SearchInput.css
├── DeckBuilder/
│   ├── DeckBuilder.jsx
│   ├── DeckBuilder.css
│   ├── DeckInfoBar.jsx
│   ├── CostModeSelector.jsx
│   └── PoolSelector.jsx
├── SealedPod/
│   ├── SealedPod.jsx
│   └── SealedPod.css
├── DraftView/
│   ├── DraftView.jsx
│   └── DraftView.css
└── ...
```

---

## Migration Strategy

1. **Create new components** without removing existing code
2. **Add tests** for new components
3. **Migrate one usage at a time** to verify behavior
4. **Remove old inline code** after all usages are migrated
5. **Update imports** in consuming files

---

## Notes

- Maintain backwards compatibility during migration
- Keep component APIs simple and focused
- Use composition over configuration where possible
- Ensure accessibility (ARIA labels, keyboard navigation)
- Consider mobile responsiveness in all components
