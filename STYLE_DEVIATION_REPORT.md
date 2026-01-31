# Style Deviation Report

This document audits all UI components that deviate from the standard `Button` component (`src/components/Button.jsx`).

## Standard Button Reference

The standard `Button` component provides:
- **Variants**: `primary` (green glow), `secondary` (default), `danger`/`back` (red glow), `interactive` (blue glow), `discord`, `icon`, `toggle`
- **Note**: `ghost` variant has been **removed** - use `secondary` instead (nearest match with similar subtle styling)
- **Sizes**: `sm`, `md`, `lg`
- **Consistent styling**: Black translucent background (`rgba(0,0,0,0.7)`), white text, colored glow on hover, `translateY(-2px)` lift effect

---

## Deviation Categories

### Category A: Modal Buttons
**Files**: `src/App.jsx`, `src/components/Modal.jsx`

| Class | Current Style | Standard Equivalent | Recommendation |
|-------|--------------|---------------------|----------------|
| `modal-btn-danger` | Red background, dark hover | `variant="danger"` | Replace |
| `modal-btn-cancel` | Gray background, lighter hover | `variant="secondary"` | Replace |
| `modal-close` | Transparent, × icon | `variant="ghost"` + icon | Replace |

**Decision needed**: Replace with Button component? (Lines: App.jsx:148-151, Modal.jsx:67)
YES

---

### Category B: Landing Page Buttons
**File**: `src/components/LandingPage.jsx`

| Class | Current Style | Description | Recommendation |
|-------|--------------|-------------|----------------|
| `mode-button sealed-button` | Custom gradient, large card-like | Main CTA for Sealed mode | Keep as custom (unique design) |
| `mode-button draft-button` | Custom gradient, large card-like | Main CTA for Draft mode | Keep as custom (unique design) |
| `rejoin-button` | Green highlight, glow effect | Session rejoin CTA | Could be `variant="primary"` |
| `landing-login-button` | Discord-style with icon | Discord login | Could be `variant="discord"` |

**Decision needed**:
- `rejoin-button` (line 58): Replace with `<Button variant="primary">`?
- `landing-login-button` (lines 75, 95): Replace with `<Button variant="discord">`?
- YES ALL

---

### Category C: Authentication Buttons
**Files**: `src/components/AuthButton.jsx`, `src/components/AuthWidget.jsx`

| Class | Current Style | Description | Recommendation |
|-------|--------------|-------------|----------------|
| `sign-in-button` | Discord purple (#5865F2) | Login button | `variant="discord"` |
| `sign-out-button` | Subtle gray | Logout action | `variant="ghost"` |
| `auth-widget-login-button` | Anchor styled as button | Widget login | Convert to Button |
| `auth-widget-avatar-button` | Circular avatar trigger | Dropdown trigger | Keep custom (avatar UI) |

**Decision needed**:
- `sign-in-button` (line 34): Replace with `<Button variant="discord">`?
- `sign-out-button` (line 25): Replace with `<Button variant="ghost">`?
YES ALL
---

### Category D: DeckBuilder Buttons (18 custom patterns)
**File**: `src/components/DeckBuilder.jsx`

#### D1: Export/Action Buttons
| Class | Lines | Description | Recommendation |
|-------|-------|-------------|----------------|
| `export-button` | 3093, 3164, 3212 | Text buttons for export actions | `variant="secondary"` |
| `export-button-icon` | 3480, 3551, 3600 | Icon-only export buttons | New `icon` variant |
| `ready-to-play-button` | 3146 | Green glow CTA | `variant="primary"` |
| `ready-to-play-icon` | 3533 | Icon version of above | `variant="primary"` + icon |

#### D2: Sort/Filter Buttons
| Class | Lines | Description | Recommendation |
|-------|-------|-------------|----------------|
| `sort-button-icon` | 3890-3935, 4834-4879 | Toggle sort options | New `toggle` variant |
| `filter-button` | 3935, 4879 | Opens filter dropdown | `variant="ghost"` |

#### D3: Card Action Buttons
| Class | Lines | Description | Recommendation |
|-------|-------|-------------|----------------|
| `add-all-button` | 4281, 4707, 5209, 5687 | Green text, adds cards | New `text-primary` variant |
| `remove-all-button` | 4263, 4690, 5228, 5704 | Red text, removes cards | New `text-danger` variant |
| `aspect-penalty-button` | 4206, 5151 | Toggle aspect penalties | `variant="ghost"` |
| `aspect-penalty-button-active` | Same | Active state | `variant="ghost"` + active |
| `aspect-penalty-warning-button` | 4229, 5174 | Warning indicator | Keep custom (warning UI) |

#### D4: View/Navigation
| Class | Lines | Description | Recommendation |
|-------|-------|-------------|----------------|
| `view-toggle-button` | 3633 | Toggle grid/list view | `variant="ghost"` + icon |
| `delete-deck-button` | 6928 | Danger action | `variant="danger"` |

#### D5: Inline Close Buttons
| Location | Lines | Description | Recommendation |
|----------|-------|-------------|----------------|
| Filter dropdown × | 3961, 4905 | Inline close | Keep inline (minimal UI) |

**Decision needed**: DeckBuilder has the most deviations. Options:
1. Create new variants: `icon`, `toggle`, `text-primary`, `text-danger`
2. Gradually replace with existing variants where possible
3. Keep custom for complex interactive states

DO OPT 1 for icon and toggle. text-primaru and text-danger should be special cases of primary and danger where we can insert the custom behavior via param
---

### Category E: Timer/Control Buttons
**Files**: `src/components/TimerPanel.jsx`, `src/components/HostControls.jsx`

| Class | File | Description | Recommendation |
|-------|------|-------------|----------------|
| `pause-button` | TimerPanel:144,177 | Play/pause toggle | Keep custom (timer-specific) |
| `control-button primary` | HostControls:172 | Start draft CTA | `variant="primary"` |
| `control-button secondary` | HostControls:149,158 | Secondary actions | `variant="secondary"` |
| `control-button cancel` | HostControls:193 | Cancel action | `variant="danger"` |

**Decision needed**:
- HostControls buttons (lines 149-218): Replace with Button component? YES
- Timer pause button: Keep custom for animation states?
- 
Timer button should be its own component used twice on this page

---

### Category F: Draft Phase Buttons
**Files**: `src/components/LeaderDraftPhase.jsx`, `src/components/PackDraftPhase.jsx`, `src/components/DraftLobby.jsx`

| Class | File | Description | Recommendation |
|-------|------|-------------|----------------|
| `deselect-button` | LeaderDraft:255, PackDraft:361 | × to deselect card | Keep custom (card overlay) |
| `review-button` | PackDraft:325 | Opens review modal | `variant="secondary"` |
| `copy-url-button` | DraftLobby:62 | Copy share URL | `variant="ghost"` + icon |
| `leave-button` | DraftLobby:91 | Leave draft | `variant="danger"` |

**Decision needed**:
- `review-button`, `copy-url-button`, `leave-button`: Replace with Button? YES ALL
- `deselect-button`: Keep custom (overlays card)? YES

---

### Category G: Draft Review Modal
**File**: `src/components/DraftReviewModal.jsx`

| Class | Lines | Description | Recommendation |
|-------|-------|-------------|----------------|
| `sort-button` | 260-278 | Sort/group toggles | New `toggle` variant or keep |
| `modal-close` | 290 | × close button | `variant="ghost"` |

---

### Category H: Sealed Pod
**File**: `src/components/SealedPod.jsx`

| Class | Lines | Description | Recommendation |
|-------|-------|-------------|----------------|
| Plain `<button>` | 283 | "Go Back" | `<Button variant="back">` |
| `build-deck-button` | 327 | Main CTA | `<Button variant="primary">` |

**Decision needed**: Both can likely be replaced with standard Button.
YES

---

### Category I: Set Selection
**File**: `src/components/SetSelection.jsx`

| Class | Lines | Description | Recommendation |
|-------|-------|-------------|----------------|
| Plain `<button>` | 103 | "Go Back" | `<Button variant="back">` |

**Decision needed**: Direct replacement candidate. YES

---

### Category J: Pack Opening Animation
**File**: `src/components/PackOpeningAnimation.jsx`

| Class | Lines | Description | Recommendation |
|-------|-------|-------------|----------------|
| `skip-button` | 375 | Skip animation | `variant="ghost"` |
| `continue-button` | 384 | Continue after opening | `variant="primary"` |
| `open-all-button` | 384 | Open remaining packs | `variant="secondary"` |

**Decision needed**: Replace with Button component?
YES ALL

---

### Category K: Showcases Page
**File**: `app/showcases/page.jsx`

| Class | Lines | Description | Recommendation |
|-------|-------|-------------|----------------|
| `showcases-back-button` | 288 | Back navigation | `<Button variant="back">` |
| `showcases-share-button` | 384 | Export trigger (circular icon) | Keep custom (circular icon) |
| `showcase-image-modal-close` | 483 | Modal × close | `variant="ghost"` |
| `showcase-image-modal-download` | 492 | Download action | `variant="primary"` |

---

### Category L: Editable Title
**File**: `src/components/EditableTitle.jsx`

| Class | Lines | Description | Recommendation |
|-------|-------|-------------|----------------|
| `editable-title-edit-button` | 87 | Pencil icon to edit | Keep custom (inline edit UI) |

---

### Category M: Release Notes
**File**: `src/components/ReleaseNotes.jsx`

| Class | Lines | Description | Recommendation |
|-------|-------|-------------|----------------|
| Plain buttons | 78, 97 | Expand/collapse toggle | `variant="ghost"` |

---

### Category N: Error Page
**File**: `app/error.jsx`

| Class | Lines | Description | Recommendation |
|-------|-------|-------------|----------------|
| Plain `<button>` | 50 | "Try again" | `<Button variant="primary">` |

---

## Summary: Quick Wins (Direct Replacements)

These can be replaced immediately with no visual change:

1. `SetSelection.jsx:103` - Go Back → `<Button variant="back">`
2. `SealedPod.jsx:283` - Go Back → `<Button variant="back">`
3. `SealedPod.jsx:327` - Build Deck → `<Button variant="primary">`
4. `error.jsx:50` - Try Again → `<Button variant="primary">`
5. `AuthButton.jsx:34` - Sign In → `<Button variant="discord">`
6. `AuthButton.jsx:25` - Sign Out → `<Button variant="ghost">`
7. `DraftLobby.jsx:91` - Leave → `<Button variant="danger">`

## Summary: New Variants Needed

If you want full consistency, consider these new Button variants:

1. **`icon`** - Square button with icon only (for export-button-icon, sort-button-icon)
2. **`toggle`** - For sort/filter toggles with active state
3. **`text-primary`** - Text-only green button (add-all-button)
4. **`text-danger`** - Text-only red button (remove-all-button)
5. **`circular`** - For circular icon buttons (showcases-share-button)

## Summary: Keep Custom

These should likely remain custom due to unique design needs:

1. Landing page mode buttons (large card-like CTAs)
2. Timer pause button (animation states)
3. Deselect button (card overlay)
4. Editable title button (inline edit)
5. Auth widget avatar button (circular avatar)

---

## Next Steps

For each category above, indicate your preference:
- **R** = Replace with standard Button
- **N** = Create new variant
- **K** = Keep custom

Example response:
```
A: R (all modal buttons)
B: K (mode buttons), R (rejoin, landing-login)
C: R (sign-in, sign-out), K (avatar)
...
```
