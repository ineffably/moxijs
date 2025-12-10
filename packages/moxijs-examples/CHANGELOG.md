# Changelog

All notable changes to `@moxijs/examples` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.1] - 2025-12-09

### Added
- Enhanced `llms.txt` in UI package with 7 UI-focused patterns (HUD, forms, dialogs, inventory, tabs, chat)
- Common patterns section added to root LLMS.txt with cross-package examples

### Changed
- **MSDF Font Files**: Renamed all `.json` font descriptors to `.fnt` for PixiJS v8 compatibility
  - `PixelOperator8.json` → `PixelOperator8.fnt`
  - `kenvector_future.json` → `kenvector_future.fnt`
- Updated all examples to use `.fnt` extension for MSDF fonts
- `ui-showcase.ts` - Updated to pass font configuration to `UITabs` component
- `msdf-text-rendering.ts` - Added texture load verification to prevent race conditions
- `buttons-showcase.ts` - Updated to use new `fontFamily` + `fontType` properties
- `panels-showcase.ts` - Updated to use new `fontType` property
- `font-rendering-comparison.ts` - Renamed `bitmapFontFamily`/`cssFontFamily` to `fontBitmap`/`fontCanvas` for clarity
- Asset configuration updated to use `_FNT` suffix instead of `_JSON` for MSDF fonts

### Fixed
- MSDF fonts now load correctly with PNG textures (PixiJS v8 requires `.fnt` or `.xml` extensions)
- Race condition eliminated where MSDF text could render before texture was ready
- Tab labels now properly inherit MSDF fonts when configured on parent

## [0.2.1] - 2025-12-06

### Removed
- Mini-GUI example from catalog (package being rewritten)
- Dead code: unused UI helper files (`basics.ts`, `components.ts`, `form-elements.ts`, `sprite-buttons.ts`)

### Changed
- Sprite Library preview now shows sprites in fixed, centered position with auto-fit scaling
- Removed mouse-based panning from sprite preview (zoom via scroll wheel still works)
- Examples UI: moved GitHub and npm badges to right side of tabs
- Examples UI: header title changed to "MOXIJS EXAMPLES" (all caps)
- Examples UI: aligned header height with tabs (41px)

### Fixed
- Newton's Cradle: updated deprecated planck.js joint signatures
- Newton's Cradle: refactored to use Moxi utilities (`asGraphics()`, `asText()`, etc.)

## [0.2.0] - 2025-11-29

### Added
- Sprite Library tool for browsing all loaded sprites and textures
- Experimental tilemap editor foundation
- Newton's Cradle physics demo
- Stacking Tower physics demo
- Particle emitter sandbox with custom emitters and texture demos
- MOXIJS and Pikcell example index.html files for browser dev/demo viewing

### Changed
- Restructured example source files into semantic folders by topic (01-basics, 02-animation, etc.)
- Expanded dino AI behaviors example with improved tilemap and random plant placement
- Updated webpack config for moxijs-examples
- Renamed from moxi-examples to moxijs-examples

### Fixed
- Bad example links in documentation
- Dino behavior minor updates

## [0.1.0] - 2025-11-28

### Added
- Initial examples release
- Basic sprite rendering examples
- Animation examples (sprite sheets, frame sequences)
- UI component demos (buttons, text inputs, scroll containers)
- Physics examples (basic collisions)
- Text rendering examples (BitmapText, custom fonts)

