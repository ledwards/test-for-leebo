# SWUPOD Style Guide

This document describes the UI component library and design patterns used in SWUPOD.

## Button Component

The primary Button component (`src/components/Button.jsx`) should be used for all interactive button elements.

### Import

```jsx
import Button from '@/src/components/Button'
// or
import { Button } from '@/src/components/Button'
```

### Variants

| Variant | Description | Use Case |
|---------|-------------|----------|
| `secondary` | Default. Black background, white border, white text | General actions, Cancel buttons |
| `primary` | Green glow on hover | Main CTAs, confirmations, "Continue" |
| `danger` | Red glow on hover | Destructive actions, warnings |
| `back` | Red glow on hover (alias for danger) | Navigation back |
| `interactive` | Blue glow on hover | Interactive/info actions |
| `discord` | Discord purple (#5865F2) | Discord-related actions |
| `icon` | Square icon-only button | Toolbar icons, close buttons |
| `toggle` | For toggleable options | Sort/filter toggles |

### Sizes

| Size | Description |
|------|-------------|
| `sm` | Small - compact UI, toolbars |
| `md` | Medium (default) - standard buttons |
| `lg` | Large - prominent CTAs |

### Props

```jsx
<Button
  variant="primary"       // Button style variant
  size="md"               // Size: 'sm' | 'md' | 'lg'
  disabled={false}        // Disabled state
  active={false}          // Active state (for toggle variant)
  textOnly={false}        // Text-only mode (no background/border)
  className=""            // Additional CSS classes
  onClick={handleClick}   // Click handler
>
  Button Text
</Button>
```

### Examples

```jsx
// Primary CTA
<Button variant="primary" onClick={handleSave}>Save Changes</Button>

// Cancel/Secondary
<Button variant="secondary" onClick={handleCancel}>Cancel</Button>

// Danger action
<Button variant="danger" onClick={handleDelete}>Delete</Button>

// Back navigation
<Button variant="back" onClick={goBack}>Go Back</Button>

// Icon button (close)
<Button variant="icon" size="sm" onClick={onClose}>&times;</Button>

// Toggle button
<Button variant="toggle" active={isActive} onClick={toggleSort}>
  Sort by Name
</Button>

// Text-only primary (green text, no background)
<Button variant="primary" textOnly onClick={addAll}>Add All</Button>

// Text-only danger (red text, no background)
<Button variant="danger" textOnly onClick={removeAll}>Remove All</Button>

// Discord login
<Button variant="discord" onClick={signIn}>
  <DiscordIcon /> Login with Discord
</Button>
```

### Using with Anchors

For anchor elements styled as buttons, use the CSS classes directly:

```jsx
<a href="/page" className="btn btn--discord">
  Link styled as Discord button
</a>
```

## TimerButton Component

Specialized button for pause/play timer controls.

### Import

```jsx
import TimerButton from '@/src/components/TimerButton'
```

### Props

```jsx
<TimerButton
  isPaused={false}        // Whether timer is paused
  onClick={handleToggle}  // Click handler
  disabled={false}        // Disabled state
/>
```

### Behavior

- Shows pause icon when `isPaused={false}` (timer running)
- Shows play icon when `isPaused={true}` (timer paused)
- Has amber/yellow styling when paused

## Modal Component

Standard modal/dialog component.

### Import

```jsx
import Modal from '@/src/components/Modal'
```

### Usage

```jsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Action"
  variant="default"       // 'default' | 'danger' | 'image'
  showCloseButton={true}
>
  <Modal.Body>
    <p>Are you sure you want to proceed?</p>
  </Modal.Body>
  <Modal.Actions>
    <Button variant="danger" onClick={handleConfirm}>Yes</Button>
    <Button variant="secondary" onClick={() => setShowModal(false)}>No</Button>
  </Modal.Actions>
</Modal>
```

## Design Tokens

### Colors

| Token | Value | Use |
|-------|-------|-----|
| Background (dark) | `rgba(0, 0, 0, 0.7)` | Button backgrounds |
| Border (default) | `rgba(255, 255, 255, 0.3)` | Subtle borders |
| Border (hover) | `rgba(255, 255, 255, 0.5)` | Hover state borders |
| Primary (green) | `rgba(0, 255, 0, 0.8)` | Primary glow |
| Danger (red) | `rgba(255, 0, 0, 0.8)` | Danger glow |
| Interactive (blue) | `rgba(33, 150, 243, 0.8)` | Interactive glow |
| Discord purple | `#5865F2` | Discord branding |
| Timer amber | `#FFC107` | Paused timer state |

### Typography

- **Font Family**: `'Barlow', sans-serif`
- **Font Weights**: 400 (normal), 600 (semibold), 700 (bold)

### Spacing

Button padding by size:
- Small: `0.5rem 1rem`
- Medium: `0.75rem 1.5rem`
- Large: `1rem 2.5rem`

### Effects

#### Hover Lift
Buttons lift on hover with `transform: translateY(-2px)`

#### Glow Effect
Primary/danger/interactive buttons have colored box-shadow on hover:
```css
box-shadow: 0 6px 16px rgba(COLOR, 0.6);
```

#### Rainbow Border
Used for special emphasis (showcases, badges):
```css
background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000);
background-size: 400% 400%;
animation: rainbow-border 3s linear infinite;
```

## Component Patterns

### Keep Custom (Do Not Replace)

These components have unique designs that should remain custom:
- Landing page mode buttons (large card-like CTAs)
- Deselect button (card overlay X button)
- Editable title button (inline edit pencil)
- Auth widget avatar button (circular avatar trigger)
- Showcase share button (circular icon)

### Standard Patterns

| Pattern | Component/Approach |
|---------|-------------------|
| Close buttons | `<Button variant="icon" size="sm">&times;</Button>` |
| Back navigation | `<Button variant="back">Go Back</Button>` |
| Primary CTA | `<Button variant="primary">Action</Button>` |
| Cancel/Secondary | `<Button variant="secondary">Cancel</Button>` |
| Danger/Delete | `<Button variant="danger">Delete</Button>` |
| Toggle options | `<Button variant="toggle" active={isActive}>Option</Button>` |
| Text actions | `<Button variant="primary" textOnly>Add</Button>` |

## File Organization

```
src/components/
├── Button.jsx          # Core button component
├── Button.css          # Button styles
├── TimerButton.jsx     # Timer pause/play button
├── TimerButton.css     # Timer button styles
├── Modal.jsx           # Modal/dialog component
└── Modal.css           # Modal styles
```
