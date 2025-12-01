# PIKCELL

> **ALPHA** - This project is under active development and APIs may change rapidly.

A pixel-perfect sprite editor built on [MoxiJS](https://github.com/ineffably/moxijs) and [PIXI.js](https://pixijs.com/). Designed for creating retro-style pixel art with support for PICO-8 and TIC-80 sprite sheet formats.

## Features

- **Sprite Sheet Support**: PICO-8 (128x128) and TIC-80 (256x256) formats
- **Drawing Tools**: Pencil, eraser, fill bucket, eyedropper, selection, shapes
- **Shape Tools**: Line, circle, filled circle, rectangle, filled rectangle
- **Undo/Redo**: Full history support with Ctrl+Z / Ctrl+Shift+Z
- **Theming**: Multiple color themes (Dark, Light, Seasonal variants)
- **State Persistence**: Auto-saves project and UI state to localStorage
- **Responsive UI**: Draggable, resizable cards with layout presets

## Grid-Based UI System

PIKCELL uses a **grid unit system** for all UI measurements, ensuring pixel-perfect rendering at any scale. This system is provided by `@moxijs/core`.

### How It Works

Instead of using raw pixel values, all measurements are specified in **grid units** that scale consistently:

```typescript
import { px, GRID, BORDER } from '@moxijs/core';

// Convert grid units to pixels (default 4x scale)
const width = px(10);        // 10 units = 40px
const padding = px(GRID.padding);  // 1 unit = 4px
const gap = px(GRID.gap);          // 1 unit = 4px
const margin = px(GRID.margin);    // 5 units = 20px

// Border system (triple-layer borders)
const borderTotal = px(BORDER.total);  // 3 units = 12px
```

### Grid Constants

| Constant | Default | Description |
|----------|---------|-------------|
| `GRID.scale` | 4 | Base scale multiplier |
| `GRID.unit` | 1 | Base unit size |
| `GRID.border` | 1 | Standard border width |
| `GRID.padding` | 1 | Standard padding |
| `GRID.gap` | 1 | Standard gap between elements |
| `GRID.margin` | 5 | Standard margin (20px at 4x) |
| `GRID.fontScale` | 0.25 | Font scale (64px font renders at 16px) |

### Border System

PIKCELL uses a triple-layer border system for depth:

```typescript
import { BORDER, px } from '@moxijs/core';

// Draw card borders
graphics.rect(0, 0, width, height);
graphics.fill({ color: theme.cardBorder });  // Outer

graphics.rect(px(BORDER.outer), px(BORDER.outer), ...);
graphics.fill({ color: theme.buttonBackground });  // Middle

graphics.rect(px(BORDER.outer + BORDER.middle), ...);
graphics.fill({ color: theme.cardBorder });  // Inner
```

## Dependencies from @moxijs/core

PIKCELL leverages several utilities from the MoxiJS core library:

| Export | Usage |
|--------|-------|
| `px()` | Convert grid units to pixels |
| `units()` | Convert pixels to grid units |
| `GRID` | Grid system constants |
| `BORDER` | Border configuration constants |
| `PixelGrid` | Custom grid configurations |

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

# Run tests
npm test

# Run E2E tests
npm run test:e2e
```

## Project Structure

```
src/
├── cards/           # UI card components (palette, toolbar, info bar)
├── components/      # Reusable UI components (buttons, dialogs)
├── config/          # Configuration files (themes, palettes, layouts)
├── controllers/     # Sprite sheet and sprite controllers
├── interfaces/      # TypeScript interfaces
├── logic/           # UI interaction logic (drag, resize, zoom)
├── managers/        # State and lifecycle managers
├── state/           # State management (project, UI, undo)
├── theming/         # Theme system and color palettes
└── utilities/       # Helper functions (shape drawing, etc.)
```

## State Persistence

PIKCELL automatically saves:

- **Project State**: Sprite data, selected color, tool, shape, palette
- **UI State**: Card positions, sizes, visibility
- **Layout State**: Named layout presets

All state is stored in `localStorage` and restored on page reload.

## License

MIT
