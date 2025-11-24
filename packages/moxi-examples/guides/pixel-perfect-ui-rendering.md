# Pixel-Perfect UI Rendering Guide

## Overview

This guide documents the patterns, techniques, and lessons learned from building the sprite editor's pixel-perfect UI system. It covers grid-based layouts, component design, state management, and common pitfalls.

## Core Concepts

### The Pixel Grid System

All UI elements align to a consistent pixel grid defined by `GRID` constants:

```typescript
export const GRID = {
  unit: 1,           // Base unit in pixels (1px)
  scale: 4,          // Scale multiplier (4x)
  border: 1,         // Border width in grid units
  padding: 1,        // Padding in grid units
  gap: 1,            // Gap between elements in grid units
  fontScale: 0.25    // Font scale (64px bitmap font * 0.25 = 16px)
};

// Helper: Convert grid units to pixels
export function px(gridUnits: number): number {
  return gridUnits * GRID.unit * GRID.scale; // gridUnits * 1 * 4
}
```

**Key principle**: `px(1) = 4 pixels` at default scale. Always use `px()` for positioning and sizing.

### Border System

Cards and buttons use nested borders for depth:

```typescript
export const BORDER = {
  outer: 1,          // Outer border in grid units
  inner: 1,          // Inner border in grid units
  total: 2           // Total border width (outer + inner)
};
```

**Example**: A button in "press" mode has:
- 1 grid unit outer border (strong)
- 1 grid unit inner border (subtle)
- Total: 2 grid units of border on each side = 4 grid units total width

## Component Patterns

### Auto-Sizing Buttons with Text Labels

Buttons should automatically calculate their width based on text content plus padding:

```typescript
// Calculate button width for text labels
if (label && !width && !size) {
  const tempText = new PIXI.BitmapText({
    text: label,
    style: {
      fontFamily: 'PixelOperator8Bitmap',
      fontSize: 64,
      fill: 0xffffff,
    }
  });
  tempText.scale.set(GRID.fontScale);

  // Account for:
  // - Text width
  // - 2 border layers on each side (GRID.border * 4 total)
  // - 1 grid unit padding on each side (2 total)
  const textWidthInGridUnits = Math.ceil(tempText.width / px(1));
  const bordersWidth = GRID.border * 4; // 2 borders × 2 sides
  const paddingWidth = 2; // 1 grid unit × 2 sides
  buttonWidth = textWidthInGridUnits + bordersWidth + paddingWidth;

  tempText.destroy();
}
```

**Standard**: All text buttons should have 1 grid unit (4px) padding between text and inner border.

### Content Clipping (Overflow: Hidden)

Cards can clip their content to prevent overflow:

```typescript
// In PixelCard options
clipContent: true  // Like CSS overflow: hidden

// Implementation (reuse mask, don't recreate each redraw!)
if (this.options.clipContent) {
  if (!this.contentMask) {
    this.contentMask = new PIXI.Graphics();
  }

  this.contentMask.clear();
  this.contentMask.rect(
    px(BORDER.total + GRID.padding),
    px(BORDER.total) + this.titleBarHeightPx + px(GRID.padding),
    px(this.state.contentWidth),
    px(this.state.contentHeight)
  );
  this.contentMask.fill({ color: 0xffffff });
  this.container.addChild(this.contentMask);
  this.contentContainer.mask = this.contentMask;
}
```

**Critical**: Reuse the mask Graphics object! Creating a new mask on every redraw causes clipping to fail.

### Resize Callbacks

When card content needs to adapt to size changes:

```typescript
const card = new PixelCard({
  // ...
  onResize: (newWidth, newHeight) => {
    // Recalculate layout
    // Redraw content
  }
});

// IMPORTANT: setContentSize() must trigger onResize
public setContentSize(width: number, height: number) {
  this.state.contentWidth = width;
  this.state.contentHeight = height;
  this.redraw();

  // Trigger callback so content can adapt
  if (this.options.onResize) {
    this.options.onResize(width, height);
  }
}
```

**Why**: This ensures content recalculates when state is restored from localStorage.

## State Persistence

### UI State Management

Save and restore card positions and sizes between sessions:

```typescript
// 1. Define state interfaces
export interface CardState {
  id: string;
  x: number;
  y: number;
  contentWidth: number;
  contentHeight: number;
  visible: boolean;
}

export interface UIState {
  version: string;
  timestamp: number;
  canvasWidth: number;
  canvasHeight: number;
  cards: CardState[];
}

// 2. Implement state manager
export class UIStateManager {
  private static readonly STORAGE_KEY = 'sprite-editor-ui-state';

  static saveState(
    cards: Map<string, CardState>,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    const state: UIState = {
      version: '1.0.0',
      timestamp: Date.now(),
      canvasWidth,
      canvasHeight,
      cards: Array.from(cards.values())
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  static loadState(): UIState | null {
    const json = localStorage.getItem(this.STORAGE_KEY);
    return json ? JSON.parse(json) : null;
  }

  // Handle window resize between sessions
  static adjustForCanvasSize(
    state: UIState,
    newWidth: number,
    newHeight: number
  ): UIState {
    const scaleX = newWidth / state.canvasWidth;
    const scaleY = newHeight / state.canvasHeight;
    return {
      ...state,
      canvasWidth: newWidth,
      canvasHeight: newHeight,
      cards: state.cards.map(card => ({
        ...card,
        x: Math.round(card.x * scaleX),
        y: Math.round(card.y * scaleY)
      }))
    };
  }
}
```

### Card State Export/Import

Cards must support state serialization:

```typescript
// Export current state
public exportState(id: string): CardState {
  return {
    id,
    x: this.container.x,
    y: this.container.y,
    contentWidth: this.state.contentWidth,
    contentHeight: this.state.contentHeight,
    visible: this.container.visible
  };
}

// Restore from state
public importState(state: CardState): void {
  this.container.position.set(state.x, state.y);
  this.container.visible = state.visible;

  if (state.contentWidth !== this.state.contentWidth ||
      state.contentHeight !== this.state.contentHeight) {
    this.setContentSize(state.contentWidth, state.contentHeight);
  }
}
```

### Auto-Save Pattern

Use debounced saves to prevent excessive writes:

```typescript
const cardRegistry = new Map<string, PixelCard>();
let uiStateSaveTimer: number | null = null;

function saveUIState() {
  if (uiStateSaveTimer) clearTimeout(uiStateSaveTimer);

  uiStateSaveTimer = window.setTimeout(() => {
    const stateMap = new Map<string, CardState>();
    cardRegistry.forEach((card, id) => {
      stateMap.set(id, card.exportState(id));
    });

    const renderer = (window as any).renderer;
    UIStateManager.saveState(stateMap, renderer.width, renderer.height);
  }, 500); // 500ms debounce
}

function registerCard(id: string, card: PixelCard) {
  cardRegistry.set(id, card);
  card.onStateChanged(() => saveUIState());
}
```

**Pattern**: Save 500ms after last drag/resize ends.

## Mouse Interaction Patterns

### Zoom Handler Pattern

Encapsulate common zoom logic to avoid duplication:

```typescript
function createCardZoomHandler(
  renderer: PIXI.Renderer,
  card: PixelCard,
  onZoom: (delta: number, event: WheelEvent) => void
): (e: WheelEvent) => void {
  return (e: WheelEvent) => {
    // Transform client coords to canvas coords
    const canvas = renderer.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const cardBounds = card.container.getBounds();

    // Check if mouse is over card
    if (mouseX >= cardBounds.x && mouseX <= cardBounds.x + cardBounds.width &&
        mouseY >= cardBounds.y && mouseY <= cardBounds.y + cardBounds.height) {
      e.preventDefault();

      const delta = e.deltaY > 0 ? -1 : 1;
      onZoom(delta, e);
    }
  };
}

// Usage
const handleWheel = createCardZoomHandler(renderer, card, (delta) => {
  swatchSize = Math.max(2, Math.min(32, swatchSize + delta));
  // Update card...
});

window.addEventListener('wheel', handleWheel, { passive: false });
card.container.on('destroyed', () => {
  window.removeEventListener('wheel', handleWheel);
});
```

**Key points**:
- Always transform clientX/Y to canvas coordinates
- Prevent default to stop page scrolling
- Clean up event listeners when card is destroyed

### Event Listener Cleanup

Always remove event listeners when cards are destroyed:

```typescript
const handleWheel = (e: WheelEvent) => { /* ... */ };

if (typeof window !== 'undefined') {
  window.addEventListener('wheel', handleWheel, { passive: false });

  card.container.on('destroyed', () => {
    window.removeEventListener('wheel', handleWheel);
  });
}
```

## Layout Patterns

### Default Layout System

Provide a reset function to restore default positions:

```typescript
function applyDefaultLayout() {
  const renderer = (window as any).renderer;
  const margin = 20;
  const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24;

  // Commander bar - top left, full width
  const commanderCard = cardRegistry.get('commander');
  if (commanderCard) {
    commanderCard.container.position.set(0, 0);
  }

  // Palette - below commander, left side
  const paletteCard = cardRegistry.get('palette');
  if (paletteCard) {
    const topOffset = commanderBarHeight + 10;
    paletteCard.container.position.set(margin, topOffset);
  }

  // Sprite sheets - bottom right (minimap style)
  cardRegistry.forEach((card, id) => {
    if (id.startsWith('sprite-sheet-')) {
      const cardBounds = card.container.getBounds();
      const x = renderer.width - cardBounds.width - margin;
      const y = renderer.height - cardBounds.height - margin;
      card.container.position.set(x, y);
    }
  });

  // Save the new layout
  saveUIState();
}
```

## Common Pitfalls

### ❌ Creating New Masks on Every Redraw

```typescript
// BAD - creates new mask each time
function redraw() {
  const mask = new PIXI.Graphics(); // Don't do this!
  mask.rect(...);
  this.contentContainer.mask = mask;
}
```

**Problem**: Old masks aren't cleaned up, clipping fails.

**Solution**: Reuse a single mask instance:

```typescript
// GOOD - reuse mask
if (!this.contentMask) {
  this.contentMask = new PIXI.Graphics();
}
this.contentMask.clear();
this.contentMask.rect(...);
this.contentContainer.mask = this.contentMask;
```

### ❌ Not Triggering onResize from setContentSize

```typescript
// BAD - content doesn't adapt to restored size
public setContentSize(width: number, height: number) {
  this.state.contentWidth = width;
  this.state.contentHeight = height;
  this.redraw();
  // Missing: this.options.onResize?.(width, height);
}
```

**Problem**: When state is restored, cards resize but content doesn't recalculate.

**Solution**: Always trigger the callback:

```typescript
// GOOD
public setContentSize(width: number, height: number) {
  this.state.contentWidth = width;
  this.state.contentHeight = height;
  this.redraw();

  if (this.options.onResize) {
    this.options.onResize(width, height);
  }
}
```

### ❌ Forgetting Border Width in Size Calculations

```typescript
// BAD - text touches border
buttonWidth = textWidthInGridUnits + 2; // Only padding, no borders!
```

**Problem**: Doesn't account for the 2 border layers on each side.

**Solution**: Include borders in calculation:

```typescript
// GOOD
const textWidthInGridUnits = Math.ceil(tempText.width / px(1));
const bordersWidth = GRID.border * 4; // 2 borders × 2 sides
const paddingWidth = 2; // 1 grid unit × 2 sides
buttonWidth = textWidthInGridUnits + bordersWidth + paddingWidth;
```

### ❌ Using Client Coordinates for Mouse Events

```typescript
// BAD - incorrect on scaled canvases
const mouseX = e.clientX;
const mouseY = e.clientY;
if (mouseX >= cardBounds.x && ...) // Wrong!
```

**Problem**: Canvas may be scaled (e.g., 1280×720 displayed at different size).

**Solution**: Transform to canvas coordinates:

```typescript
// GOOD
const canvas = renderer.canvas as HTMLCanvasElement;
const rect = canvas.getBoundingClientRect();
const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;

const mouseX = (e.clientX - rect.left) * scaleX;
const mouseY = (e.clientY - rect.top) * scaleY;
```

## Best Practices

### 1. Always Use px() for Measurements

```typescript
// GOOD
button.position.set(px(10), px(20));
card.setContentSize(30, 40); // Already in grid units

// BAD
button.position.set(10, 20); // Wrong scale!
```

### 2. Use Grid Units for API Parameters

```typescript
// GOOD - API uses grid units
interface PixelCardOptions {
  contentWidth: number;  // In grid units
  contentHeight: number; // In grid units
}

// Convert to pixels internally
const widthPx = px(this.state.contentWidth);
```

### 3. Centralize Coordinate Transformation

```typescript
// Create a helper to avoid repeating this logic
function getCanvasMousePosition(e: MouseEvent, renderer: PIXI.Renderer) {
  const canvas = renderer.canvas as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}
```

### 4. Clean Up Resources

```typescript
// Always destroy temporary objects
const tempText = new PIXI.BitmapText({ ... });
const width = tempText.width;
tempText.destroy(); // Don't forget!

// Remove event listeners
card.container.on('destroyed', () => {
  window.removeEventListener('wheel', handleWheel);
});
```

### 5. Debounce Expensive Operations

```typescript
// Don't save on every mouse move
let saveTimer: number | null = null;

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => saveToLocalStorage(), 500);
}
```

## Architecture Overview

```
┌─────────────────────────────────────────┐
│           Application Layer             │
│  - Sprite Editor (17-sprite-editor.ts)  │
│  - Creates cards, manages state         │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         Component Layer                 │
│  - PixelCard (draggable/resizable)      │
│  - PixelButton (auto-sizing)            │
│  - PixelDialog (modal dialogs)          │
│  - SpriteCard, PaletteCard, etc.        │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│          Core Systems                   │
│  - GRID (px() helper)                   │
│  - UIStateManager (localStorage)        │
│  - Theme System                         │
│  - createCardZoomHandler (utils)        │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│           PIXI.js Layer                 │
│  - Graphics, Containers, Text           │
│  - Event system, bounds checking        │
└─────────────────────────────────────────┘
```

## Summary

**Core Principles**:
1. Everything aligns to the grid using `px()` helper
2. Components auto-calculate sizes (text + borders + padding)
3. Reuse Graphics objects (especially masks)
4. Always trigger callbacks on programmatic changes
5. Transform mouse coordinates to canvas space
6. Clean up event listeners and objects
7. Debounce expensive operations
8. Save state to localStorage with version management

**Result**: A consistent, pixel-perfect UI that feels crisp, responsive, and preserves user layouts between sessions.
