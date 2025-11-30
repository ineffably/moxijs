# Changelog

All notable changes to `@moxijs/examples` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

