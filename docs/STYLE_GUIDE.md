# SWU Pod Style Guide

This document codifies the UI/UX patterns used throughout the application to ensure consistency in future development.

**Last Updated:** January 2025

## Design Tokens (Consolidated)

These are the canonical values. Do not introduce variations.

| Token | Value | Usage |
|-------|-------|-------|
| Border Radius (small) | `4px` | Badges, tooltips, checkboxes |
| Border Radius (default) | `6px` | Buttons, cards, inputs |
| Border Radius (medium) | `8px` | Containers, panels, mobile cards |
| Border Radius (large) | `12px` | Sections, modals |
| Muted Text | `rgba(255,255,255,0.6)` | Subtitles, secondary info |
| Secondary Text | `rgba(255,255,255,0.8)` | Less prominent but readable |
| Disabled Text | `#ccc` or `0.5 opacity` | Disabled/timestamp text |
| Transition (fast) | `0.1s ease` | Card transforms |
| Transition (interactive) | `0.2s ease` | Hover states, toggles |
| Transition (standard) | `0.3s ease` | Buttons, modals |
| Modal Overlay | `rgba(0,0,0,0.8)` | All modal backgrounds |
| Modal Background | `linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)` | All modal content |
| Hover Lift | `translateY(-2px)` | All button hovers |

## Table of Contents
- [Colors](#colors)
- [Typography](#typography)
- [Spacing](#spacing)
- [Buttons](#buttons)
- [Cards](#cards)
- [Modals](#modals)
- [Forms & Inputs](#forms--inputs)
- [Backgrounds](#backgrounds)
- [Animations](#animations)
- [Responsive Design](#responsive-design)
- [Z-Index Scale](#z-index-scale)

---

## Colors

### Background Colors
```css
/* App root / containers */
--bg-root: #242424;
--bg-dark: rgb(9, 9, 9);           /* Darkest, used for overlays */
--bg-medium: rgb(76, 77, 81);      /* Medium gray base */
--bg-box: #1a1a1a;                 /* Dark boxes, cards */
--bg-box-gradient: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);

/* Overlay backgrounds */
--bg-overlay: rgba(0, 0, 0, 0.7);  /* Standard overlay */
--bg-overlay-dark: rgba(0, 0, 0, 0.9);  /* Modal overlays */
--bg-glass: rgba(0, 0, 0, 0.5);    /* Semi-transparent panels */
```

### Text Colors
```css
--text-primary: rgba(255, 255, 255, 0.87);  /* Main text */
--text-secondary: #ccc;                      /* Muted text */
--text-subtle: rgba(255, 255, 255, 0.6);    /* Subtle/disabled */
--text-disabled: #999;
```

### Accent Colors
```css
/* Interactive */
--accent-blue: #2196F3;
--accent-blue-hover: rgba(33, 150, 243, 1);
--accent-blue-glow: rgba(33, 150, 243, 0.6);

/* Positive/Success */
--accent-green: rgba(0, 255, 0, 0.8);
--accent-green-glow: rgba(0, 255, 0, 0.6);
--accent-green-bg: rgba(0, 100, 0, 0.3);

/* Danger/Destructive */
--accent-red: rgba(255, 0, 0, 0.8);
--accent-red-glow: rgba(255, 0, 0, 0.6);
--accent-red-text: rgba(255, 100, 100, 1);

/* Warning */
--accent-gold: #ffd700;

/* Discord */
--discord-blue: #5865F2;
--discord-blue-hover: #4752C4;
```

### Card Variant Colors
```css
/* Hyperspace cards */
--hyperspace-purple: #9C27B0;
--hyperspace-glow: rgba(156, 39, 176, 0.5);

/* Showcase cards */
--showcase-orange: #FF9800;
--showcase-glow: rgba(255, 152, 0, 0.7);

/* Foil cards - white glow */
--foil-glow: rgba(255, 255, 255, 0.5);
```

### Rarity Colors
```css
--rarity-common: #aaa;
--rarity-uncommon: #4CAF50;
--rarity-rare: #2196F3;
--rarity-legendary: #FFD700;
--rarity-special: #9C27B0;
```

---

## Typography

### Font Family
```css
font-family: 'Barlow', system-ui, Avenir, Helvetica, Arial, sans-serif;
```

### Font Weights
```css
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;  /* Used for headings */
```

### Heading Styles
```css
h1, h2, h3, h4, h5, h6 {
  font-family: 'Barlow', system-ui, Avenir, Helvetica, Arial, sans-serif;
  font-weight: 800;
  line-height: 1.1;
}

/* Size scale */
h1 { font-size: 3.2em; }       /* Large pages */
h1 { font-size: 2.5rem; }      /* Standard pages */
h1 { font-size: 1.8rem; }      /* Mobile */

h2 { font-size: 1.5rem; }
h3 { font-size: 1.2rem; }
```

### Body Text
```css
p {
  font-family: 'Barlow', system-ui, Avenir, Helvetica, Arial, sans-serif;
  font-weight: 400;
  line-height: 1.5;
}
```

### Section Headers (Uppercase)
```css
.section-header {
  font-size: 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}
```

---

## Spacing

### Standard Scale
```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 0.75rem;   /* 12px */
--space-lg: 1rem;      /* 16px */
--space-xl: 1.5rem;    /* 24px */
--space-2xl: 2rem;     /* 32px */
--space-3xl: 3rem;     /* 48px */
```

### Common Uses
```css
/* Section padding */
.section { padding: 2rem; }

/* Card gaps */
.cards-grid { gap: 0.5rem; }

/* Button padding */
.button { padding: 0.75rem 1.5rem; }

/* Mobile adjustments */
@media (max-width: 768px) {
  .section { padding: 0.5rem; }
}
```

---

## Buttons

### Base Button
```css
.button {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}
```

### Button Hover States

**Green (Primary/Positive actions)**
```css
.button-primary:hover {
  background: rgba(0, 0, 0, 0.85);
  border-color: rgba(0, 255, 0, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 255, 0, 0.6);
}
```

**Red (Back/Destructive)**
```css
.button-back:hover,
.button-danger:hover {
  background: rgba(0, 0, 0, 0.85);
  border-color: rgba(255, 0, 0, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 0, 0, 0.6);
}
```

**Blue (Interactive/Info)**
```css
.button-interactive:hover {
  background: rgba(0, 0, 0, 0.85);
  border-color: rgba(33, 150, 243, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.6);
}
```

### Icon Buttons
```css
.icon-button {
  width: 44px;
  height: 44px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}
```

### Disabled State
```css
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #666;
}
```

### Discord Button
```css
.discord-button {
  background: #5865F2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
}

.discord-button:hover {
  background: #4752C4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
```

---

## Cards

### Card Dimensions
```css
/* Portrait cards (units, events, upgrades) */
.card {
  width: 120px;
  aspect-ratio: 2.5 / 3.5;
}

/* Landscape cards (leaders, bases) */
.card.leader,
.card.base {
  width: 168px;
  aspect-ratio: 3.5 / 2.5;
}
```

### Card Base Style
```css
.card {
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 6px;
  position: relative;
  cursor: pointer;
  isolation: isolate;
  transition: transform 0.1s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.card:hover {
  transform: scale(1.05);
  z-index: 10;
}
```

### Rainbow Selection Border
```css
.card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 7px;
  background: linear-gradient(
    45deg,
    #ff0000, #ff7f00, #ffff00,
    #00ff00, #0000ff, #4b0082,
    #9400d3, #ff0000
  );
  background-size: 400% 400%;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: rainbow-border 3s linear infinite;
}

.card.selected::before {
  opacity: 1;
}

@keyframes rainbow-border {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### Foil Effect
```css
.card.foil::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    125deg,
    rgba(255, 0, 0, 0.3) 0%,
    rgba(255, 127, 0, 0.3) 15%,
    rgba(255, 255, 0, 0.3) 30%,
    rgba(0, 255, 0, 0.3) 45%,
    rgba(0, 0, 255, 0.3) 60%,
    rgba(75, 0, 130, 0.3) 75%,
    rgba(148, 0, 211, 0.3) 90%,
    rgba(255, 0, 0, 0.3) 100%
  );
  background-size: 200% 200%;
  mix-blend-mode: overlay;
  pointer-events: none;
  z-index: 2;
  animation: foil-shimmer 3s ease-in-out infinite;
}

@keyframes foil-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

### Card Badges
```css
.card-badges {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge {
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  backdrop-filter: blur(4px);
}

.foil-badge {
  background: rgba(255, 255, 255, 0.8);
  color: #000;
}

.hyperspace-badge {
  background: rgba(156, 39, 176, 0.8);
  color: white;
}
```

---

## Modals

### Modal Overlay (Consolidated)
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);  /* Always 0.8, not 0.7 or 0.9 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}
```

### Modal Content (Consolidated)
```css
.modal-content {
  /* Always use this neutral gradient - no blue tint */
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}
```

**Do not use:** `#1a1a2e` (has blue tint), `rgba(20, 20, 25, 0.95)` (inconsistent)

### Modal Close Button
```css
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: white;
  width: 48px;
  height: 48px;
  font-size: 2.5rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.modal-close:hover {
  opacity: 0.7;
}
```

---

## Forms & Inputs

### Checkbox
```css
input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}
```

### Filter Checkbox Row
```css
.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
  color: white;
}

.filter-checkbox:hover {
  background: rgba(33, 150, 243, 0.2);
}
```

---

## Backgrounds

### Standard Page Background
```css
.page {
  min-height: 100vh;
  background-color: rgb(76, 77, 81);
  background-image:
    linear-gradient(rgb(9, 9, 9) 0%, rgba(0, 0, 0, 0) 18.23%),
    linear-gradient(rgba(0, 0, 0, 0) 78.12%, rgb(9, 9, 9) 93.23%),
    linear-gradient(0deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)),
    url("/background-images/bg-texture-crop.png");
  background-size: 100% 100%, 100% 100%, 100% 100%, 150% auto;
  background-repeat: no-repeat, no-repeat, no-repeat, repeat-y;
  background-position: center center;
}

/* Mobile - larger pattern */
@media (max-width: 768px) {
  .page {
    background-size: 100% 100%, 100% 100%, 100% 100%, 300% auto;
  }
}
```

### Set Art Header
```css
.set-art-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 400px;
  z-index: 0;
  pointer-events: none;
  background-size: cover;
  background-position: center center;
}

/* Fade overlays */
.set-art-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgb(9, 9, 9) 0%, transparent 18.23%),
    linear-gradient(transparent 78.12%, rgb(9, 9, 9) 93.23%),
    linear-gradient(0deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8));
}
```

### Glass Panel
```css
.glass-panel {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
}
```

---

## Animations

### Transitions (Consolidated)
```css
/* Fast - card transforms, quick feedback */
transition: all 0.1s ease;

/* Interactive - hover states, toggles */
transition: all 0.2s ease;

/* Standard - buttons, modals, most UI */
transition: all 0.3s ease;
```

**Do not use:** `0.15s`, `0.25s`, `300ms`, `0.4s` (use the three values above)

### Hover Lift
```css
/* Standard lift for all buttons */
.button:hover {
  transform: translateY(-2px);
}
```

**Do not use:** `translateY(-1px)` - always use `-2px` for consistency

### Scale on Hover
```css
.scale:hover {
  transform: scale(1.05);
}
```

---

## Responsive Design

### Breakpoints
```css
/* Mobile */
@media (max-width: 768px) { }

/* Small screens */
@media (max-width: 600px) { }

/* Desktop */
@media (min-width: 1024px) { }
```

### Mobile Patterns
```css
@media (max-width: 768px) {
  /* Prevent horizontal scroll */
  html, body {
    overflow-x: hidden;
    max-width: 100vw;
  }

  /* Disable hover effects on touch */
  .card:hover {
    transform: none !important;
  }

  /* Stack buttons vertically */
  .button-group {
    flex-direction: column;
  }

  /* 2 cards per row */
  .cards-grid {
    grid-template-columns: repeat(2, 48%);
  }
}
```

---

## Z-Index Scale

```css
/* Base content */
z-index: 0;

/* Card hover */
z-index: 10;

/* Selection box */
z-index: 500;

/* Fixed nav / sticky header */
z-index: 1000;

/* View controls */
z-index: 1000-1500;

/* Filter drawer */
z-index: 2000;

/* Modals */
z-index: 10000;

/* Tooltips */
z-index: 10001;
```

---

## Component Sections

### Section Container
```css
.section {
  margin: 0.25rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  overflow: visible;
}
```

### Section Header
```css
.section-header {
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
```

---

---

## Reusable Components

### Modal Component (`src/components/Modal.jsx`)

Use for all modal dialogs instead of creating custom modal markup.

```jsx
import Modal from './components/Modal'

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Action"
  variant="danger"  // 'default' | 'danger' | 'image'
>
  <Modal.Body>
    <p>Are you sure you want to proceed?</p>
  </Modal.Body>
  <Modal.Actions>
    <button className="modal-btn-cancel" onClick={handleCancel}>Cancel</button>
    <button className="modal-btn-danger" onClick={handleConfirm}>Confirm</button>
  </Modal.Actions>
</Modal>
```

### Button Component (`src/components/Button.jsx`)

Use for consistent button styling across the app.

```jsx
import Button from './components/Button'

<Button variant="primary" onClick={handleSave}>Save</Button>
<Button variant="danger" size="sm">Delete</Button>
<Button variant="back" onClick={goBack}>← Back</Button>
```

Variants: `primary`, `danger`, `back`, `secondary`, `ghost`, `interactive`, `discord`
Sizes: `sm`, `md`, `lg`

### Shared CSS

**Animations** (`src/styles/animations.css`)
```css
@import '../styles/animations.css';
/* Provides: rainbow-border, foil-shimmer keyframes */
```

**Backgrounds** (`src/styles/backgrounds.css`)
```css
@import '../styles/backgrounds.css';
/* Provides: .page-background, .page-background-with-art classes */
```

---

## Usage Examples

### Primary Action Button
```jsx
<button className="button button-primary">
  Build Deck
</button>
```

### Back Button
```jsx
<button className="button button-back">
  ← Back
</button>
```

### Card with Selection
```jsx
<div className={`card ${isSelected ? 'selected' : ''} ${isFoil ? 'foil' : ''}`}>
  <img src={cardImage} className="card-image" />
  <div className="card-badges">
    {isFoil && <span className="badge foil-badge">Foil</span>}
  </div>
</div>
```

### Modal
```jsx
<div className="modal-overlay">
  <div className="modal-content">
    <button className="modal-close">×</button>
    <h2>Modal Title</h2>
    <p>Modal content...</p>
  </div>
</div>
```
