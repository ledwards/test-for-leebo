# Plan: Long Press Card Preview on Mobile

## Goal
On mobile (including Safari dev tools simulator), long press shows enlarged card preview. Desktop hover unchanged. Long press must NOT trigger the normal onClick (e.g. moving cards between pool/deck).

## What's Already Done
- `useCardPreview.ts` — exports `handleCardTouchStart`, `handleCardTouchEnd`, `dismissPreview`; has `longPressTriggeredRef` to track if long press fired; `handleCardTouchEnd` calls `e.preventDefault()` when long press was triggered to block synthetic click
- `CardPreview.tsx` — accepts `isMobile` and `onDismiss`; when `isMobile`, renders fullscreen overlay with card scaled to fit viewport; tap overlay to dismiss
- `Card.tsx` — `onTouchStart`/`onTouchEnd` in interface (passed via `...rest`)
- `ResizableCard.tsx` — `onTouchStart`/`onTouchEnd` in interface AND on the div
- `DeckBuilder.tsx` — destructures all touch handlers, passes to ArenaView, LeaderBaseSelector, StickyInfoBar; CardPreview gets `isMobile`/`onDismiss`
- `ArenaView.tsx` — accepts and passes touch props to LeaderBaseSelector, ArenaPoolSection, ArenaDeckSection
- `ArenaPoolSection.tsx` — passes touch to ResizableCard
- `ArenaDeckSection.tsx` — passes touch to ArenaCardStack
- `ArenaCardStack.tsx` — passes touch to ResizableCard

## Remaining Steps (3 edits)

### Step 1: Card.tsx — pass touch events to div
Card.tsx has `onTouchStart`/`onTouchEnd` in its interface but does NOT pass them to the rendered `<div>`. The `...rest` spread should handle it, but we should verify `onTouchStart`/`onTouchEnd` are included in `...rest` destructuring (they are — anything not explicitly destructured goes into `...rest`). **Actually this is already working** because `...rest` catches them and `{...rest}` spreads them onto the div. No change needed.

### Step 2: LeaderBaseSelector.tsx — pass touch handlers to Card renders
Lines ~280 and ~326 render `<Card>` components but only pass `onMouseEnter`/`onMouseLeave`. Need to add `onTouchStart`/`onTouchEnd` using the existing `handleTouchStart`/`handleTouchEnd` wrappers.

Two spots:
```tsx
// Leaders card (~line 280)
<Card ... onTouchStart={() => handleTouchStart(card)} onTouchEnd={handleTouchEnd} />

// Bases card (~line 326)
<Card ... onTouchStart={() => handleTouchStart(card)} onTouchEnd={handleTouchEnd} />
```

### Step 3: pack-wars page — wire up all touch handlers
`app/casual/pack-wars/[shareId]/page.tsx`:
1. Destructure `handleCardTouchStart`, `handleCardTouchEnd`, `dismissPreview` from `useCardPreview()`
2. Add `onTouchStart`/`onTouchEnd` to leader Card renders (~line 137)
3. Add `onTouchStart`/`onTouchEnd` to base Card renders (~line 151)
4. Add `isMobile`/`onDismiss` to CardPreview render (~line 178)

## Verification
- `npm run build` to check no TypeScript/build errors
- Manual test in Safari mobile simulator: long press shows preview, tap overlay dismisses, short tap moves card normally
