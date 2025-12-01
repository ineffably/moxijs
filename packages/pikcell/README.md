# PIKCELL

**[Try PIKCELL Now](https://ineffably.github.io/moxijs/pikcell/)** - No installation required!

> **ALPHA** - This project is under active development. APIs and features may change rapidly.

## What is PIKCELL?

PIKCELL is a pixel-perfect sprite editor designed for creating retro-style pixel art. Built on [MoxiJS](https://github.com/ineffably/moxijs) and [PIXI.js](https://pixijs.com/), it provides a fast, browser-based workflow for pixel artists and game developers.

### MVP Focus

The current MVP targets **PICO-8** and **TIC-80** fantasy console developers:
- Native support for PICO-8 (128x128, 16 colors) and TIC-80 (256x256, 16 colors) sprite sheet formats
- Palettes matched to each console's color restrictions
- Export-ready sprite data

### Coming Soon

- Custom sprite sheet dimensions
- Custom color palettes
- Tile library management
- Animation preview
- Layer support

---

## Quick Start

1. **Select a color** from the palette on the left
2. **Choose a tool** from the toolbar (Pencil is default)
3. **Click and drag** on the canvas to draw
4. **Use the sprite sheet** view to navigate between sprites

Your work is **automatically saved** to browser storage.

---

## Keyboard Shortcuts

### Editing

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+Y` | Redo (alternate) |
| `Ctrl+C` | Copy selection |
| `Ctrl+X` | Cut selection |
| `Ctrl+V` | Paste |
| `Delete` / `Backspace` | Clear selection |

### Selection Movement

| Shortcut | Action |
|----------|--------|
| `Arrow Up` | Move selection up 1 pixel |
| `Arrow Down` | Move selection down 1 pixel |
| `Arrow Left` | Move selection left 1 pixel |
| `Arrow Right` | Move selection right 1 pixel |

### Tools

| Shortcut | Tool |
|----------|------|
| `P` | Pencil |
| `E` | Eraser |
| `F` | Fill (bucket) |
| `I` | Eyedropper (color picker) |
| `S` | Selection |
| `U` | Shapes |

---

## Features

### Drawing Tools
- **Pencil** - Draw individual pixels
- **Eraser** - Remove pixels (set to transparent)
- **Fill** - Flood fill connected areas of the same color
- **Eyedropper** - Pick a color from the canvas
- **Selection** - Select rectangular regions for copy/cut/paste/move

### Shape Tools
- **Line** - Draw straight lines (Bresenham's algorithm)
- **Rectangle** - Draw rectangle outlines
- **Filled Rectangle** - Draw solid rectangles
- **Circle/Ellipse** - Draw circle/ellipse outlines
- **Filled Circle/Ellipse** - Draw solid circles/ellipses

### UI Features
- **Draggable Cards** - Arrange your workspace
- **Resizable Panels** - Customize card sizes
- **Layout Presets** - Save and restore layouts
- **Zoom** - Mouse wheel to zoom sprite view
- **Pan** - Middle-click drag to pan

### Theming
Multiple color themes available:
- **Classic**: Dark, Light
- **Seasonal**: Spring, Summer, Autumn, Winter

---

## Grid-Based UI System

PIKCELL uses a **grid unit system** for all UI measurements, ensuring pixel-perfect rendering. This system is provided by `@moxijs/core`.

### How It Works

Instead of raw pixel values, measurements use **grid units** that scale consistently:

```typescript
import { px, GRID, BORDER } from '@moxijs/core';

// Convert grid units to pixels (default 4x scale)
const width = px(10);              // 10 units = 40px
const padding = px(GRID.padding);  // 1 unit = 4px
const margin = px(GRID.margin);    // 5 units = 20px

// Triple-layer border system
const borderTotal = px(BORDER.total);  // 3 units = 12px
```

### Grid Constants

| Constant | Default | Description |
|----------|---------|-------------|
| `GRID.scale` | 4 | Base scale multiplier |
| `GRID.border` | 1 | Standard border width |
| `GRID.padding` | 1 | Standard padding |
| `GRID.gap` | 1 | Gap between elements |
| `GRID.margin` | 5 | Standard margin (20px at 4x) |
| `GRID.fontScale` | 0.25 | Font scale (64px renders at 16px) |

---

## Dependencies from @moxijs/core

| Export | Usage |
|--------|-------|
| `px()` | Convert grid units to pixels |
| `units()` | Convert pixels to grid units |
| `GRID` | Grid system constants |
| `BORDER` | Border configuration |
| `PixelGrid` | Custom grid configurations |

---

## Installation

```bash
# Clone the monorepo
git clone https://github.com/ineffably/moxijs.git
cd moxijs

# Install dependencies
npm install

# Run pikcell dev server
cd packages/pikcell
npm run dev
```

## Development

```bash
# Start dev server (port 9001)
npm run dev

# Production build
npm run build

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

---

## State Persistence

PIKCELL automatically saves to `localStorage`:

- **Project State**: Sprite pixel data, selected color, tool, shape, palette
- **UI State**: Card positions, sizes, visibility
- **Layout State**: Named layout presets

All state restores automatically on page reload.

---

## Project Structure

```
src/
├── cards/           # UI card components
├── components/      # Reusable UI components
├── config/          # Configuration (themes, palettes, layouts)
├── controllers/     # Sprite sheet controllers
├── logic/           # Interaction logic (drag, resize, zoom)
├── managers/        # State and lifecycle managers
├── state/           # State management
├── theming/         # Theme system
└── utilities/       # Helpers (shape drawing, etc.)
```

---

## License

MIT
