# Changelog

All notable changes to `@moxijs/core` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.5] - 2025-12-11

### LLM Documentation Enhancement

### Added

#### Documentation (`llms.txt`)
- **API Quick Reference TOC**: Auto-generated table of contents at top of llms.txt
  - Lists all exported classes with their key methods
  - Lists all exported interfaces
  - Generated via `node scripts/generate-llm-toc.js`
  - Wrapped in `<!-- TOC:START -->` / `<!-- TOC:END -->` markers for easy regeneration

## [0.3.4] - 2025-12-09

### MSDF Font System Improvements

This release fixes a critical compatibility issue with PixiJS v8's bitmap font loader and adds comprehensive LLM-friendly documentation with practical code patterns.

**Key Fix**: PixiJS v8.14 only recognizes `.fnt` and `.xml` extensions for bitmap fonts (not `.json`). The MSDF font generator now automatically renames generated files to ensure compatibility and proper texture loading.

### Added

#### setupMoxi
- `width` and `height` top-level props for convenient canvas sizing (alternative to `renderOptions.width/height`)
- `scaleMode` option ('none' | 'fit' | 'fill' | 'stretch') for automatic canvas scaling with CSS injection

#### Entity Helpers
- `asEntityGraphics(props)` - Creates Graphics wrapped with `asEntity()` for Logic support
- `asEntitySprite(constructorArgs, props)` - Creates Sprite wrapped with `asEntity()`
- `asEntityContainer(props)` - Creates Container wrapped with `asEntity()`
- `asEntityText(constructorArgs, props)` - Creates Text wrapped with `asEntity()`

#### MSDF Font Generator (`scripts/generate-msdf-font.mjs`)
- **Critical Fix**: Auto-renames generated `.json` files to `.fnt` for PixiJS v8 compatibility
  - PixiJS v8's bitmap font loader (`loadBitmapFont.mjs`) only recognizes `.fnt` and `.xml` extensions
  - Without this, PNG textures referenced in the font data won't load automatically
- Updated all documentation and console output to reference `.fnt` files
- Added explanatory comments about PixiJS v8 extension requirements
- Generator now displays: `Renamed MyFont.json → MyFont.fnt (PixiJS v8 requirement)`

### Changed

#### ClientEvents
- Enhanced JSDoc documentation clarifying key format uses `event.key` (e.g., 'a', 'ArrowRight', ' ') not `event.code`
- Added common key values table and MDN reference link

#### ActionManager
- Enhanced JSDoc with comprehensive examples for adding/removing listeners
- Documented common event targets (window, document, canvas) and event types
- Added cleanup pattern documentation for Logic components

#### Documentation (`llms.txt`)
- **Major Enhancement**: Added 7 comprehensive gameplay patterns with complete, copy-paste ready code examples:
  - Player with Physics and Animation (movement, physics body, input handling)
  - Enemy AI with State Machine (patrol, chase, attack states)
  - Physics Platformer with Collision (ground detection, player control)
  - Camera Follow with Smooth Lerp (smooth tracking, camera logic)
  - Particle System (spawn, update, cleanup patterns)
  - Asset Loading with Progress (batch loading, progress callbacks)
  - MSDF Text for UI (crisp scalable text rendering)
- Each pattern is 20-50 lines, focused on a single concept
- Real-world examples extracted from working demos
- Demonstrates ECS architecture, physics integration, and state management

## [0.3.2] - 2025-12-06

### Changed
- No functional changes; version bump for monorepo consistency with `@moxijs/ui`

## [0.3.1] - 2025-12-05

### Added
- `suppressContextMenu` option in `setupMoxi()` to prevent right-click context menu on canvas
- Tests for `suppressContextMenu` functionality

## [0.3.0] - 2025-12-04

### Added
- `asTextDPR()` function for Canvas 2D Device Pixel Ratio (DPR) text rendering
  - Renders text at higher resolution (e.g., 2×) then scales down for crisp, pixel-perfect text
  - Supports custom DPR scale factors (default: 2)
  - Enables pixel-perfect rendering by default
  - Handles scale props correctly with DPR scaling
- Comprehensive tests for `asTextDPR()` function
- Re-implemented MSDF font rendering with proper integration

### Changed
- Renamed `src/core/` directory to `src/main/` for clearer project structure
- Updated test imports to use new `src/main/` paths
- UI components moved to separate `@moxijs/ui` package

## [0.2.3] - 2025-11-29

### Added
- Sprite library tool with browsable sprite/texture viewer
- Newton's Cradle and Stacking Tower physics demos
- Comprehensive test coverage improvements

### Fixed
- Correctly export `PhysicsMaterials` and `asPhysicsEntity` in core package
- Example links in documentation

### Changed
- Reorganized example source files into semantic folders by topic

## [0.2.2] - 2025-11-29

### Added
- Particle emitter sandbox with custom emitters and texture demos

## [0.1.1] - 2025-11-29

### Changed
- Migrated moxijs package structure to `packages/core/`
- Updated pikcell package metadata and dependencies

## [0.1.0] - 2025-11-28

### Added
- Initial public release
- Core ECS architecture (Entity, Logic, Scene, Engine)
- Physics integration with planck.js
- UI component library (UILabel, UIButton, UITextInput, UIScrollContainer, etc.)
- Asset loading system
- State machine utilities
- Texture frame extraction utilities
- Parallax background support
- Loading scene with customizable animations

