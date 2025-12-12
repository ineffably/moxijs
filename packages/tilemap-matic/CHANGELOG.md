# Changelog

All notable changes to `@moxijs/tilemap-matic` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-12-11

### Initial Release

TileMapMatic is a sprite sheet and tilemap management tool built on MoxiJS and PIXI.js. This initial release provides a complete workflow for importing sprite sheets, defining tile regions and animations, and exporting PIXI.js-compatible JSON.

### Added

#### Core Application
- Full-featured sprite sheet editor with pan/zoom canvas
- Drag-and-drop sprite sheet import (PNG, JPG, GIF, WebP)
- Slate/gray theme with muted lime green accents
- Persistent session state (panel positions, zoom levels, selections)
- GitHub Pages deployment at `/tilemap-matic/`

#### Sprite Sheet Grid
- Configurable grid overlay (tile width, height, offset, spacing)
- Cell selection with click and drag
- Multi-cell region creation
- Visual highlighting for selected cells and regions

#### Animation System
- **Ctrl+A** animation creation mode
- Click cells in order to define frame sequence
- Numbered overlay shows frame order (1, 2, 3...)
- **Enter** to finalize animation with name prompt
- **Escape** to cancel animation creation
- Frame duration configuration (default: 100ms)
- Loop toggle for animations
- Input binding support (left, right, up, down, action1, action2)

#### Library Panel
- Vertical carousel of loaded sprite sheets
- Thumbnail previews with selection indicator
- Add (+) button for importing new sheets
- Delete button per sheet with confirmation
- Drag-and-drop reordering support

#### Animation/Region Library Panel
- Collapsible sections for Animations and Regions
- Animation previews using PIXI.AnimatedSprite
- Region previews showing actual sprite texture
- Click to select and highlight on grid
- Pan/zoom navigation (0.5x to 4x)
- CardPanel wrapper with drag/resize support

#### Configuration Panel
- Dynamic form based on selection context
- Grid settings (tile size, offset, spacing)
- Region naming with real-time grid label updates
- Animation editing (name, duration, loop, input binding)
- Delete buttons for regions and animations

#### Export System
- PIXI.js Spritesheet JSON format export
- MoxiJS extensions in `meta.moxiExtensions`:
  - `namedCells` - Named tile regions with coordinates
  - `animations` - Animation sequences with frame references
- Copy to clipboard functionality
- JSON viewer panel with syntax highlighting

#### Canvas Controls
- Pan with middle mouse or Ctrl+drag
- Zoom with mouse wheel (0.25x to 8x range)
- Grid snapping for region creation
- Keyboard shortcuts:
  - **Ctrl+A** - Enter animation creation mode
  - **Enter** - Confirm animation
  - **Escape** - Cancel animation mode
  - **Delete** - Remove selected region/animation

#### UI Components
- CardPanel wrappers with SE drop shadows
- Draggable, resizable panels
- Collapsible sections
- Pixel font support (PixelOperator8)
- Drop zone indicator when library is empty

### Technical Details

#### Files
- `tilemap-matic.ts` - Main application orchestrator
- `sprite-carousel.ts` - Sprite sheet library carousel
- `sprite-sheet-grid.ts` - Grid overlay and cell selection
- `sprite-sheet-config-panel.ts` - Dynamic configuration form
- `animation-region-library-panel.ts` - Animation/region browser
- `sprite-sheet-project.ts` - Project state management
- `sprite-sheet-data.ts` - Data types and export functions
- `canvas-pan-zoom.ts` - Pan/zoom controller
- `json-viewer.ts` - JSON export viewer

#### Dependencies
- `@moxijs/core` - Entity system, asset management
- `@moxijs/ui` - CardPanel, FlexContainer, UI components
- PIXI.js v8.14 (external)

#### Build
- Webpack with TypeScript
- Development server on port 9002
- Production build outputs to `dist/bundle.js`
