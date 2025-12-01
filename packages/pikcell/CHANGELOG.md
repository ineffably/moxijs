# Changelog

All notable changes to `pikcell` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2025-12-01

### Added
- Line tool in shapes popup for drawing straight lines (Bresenham's algorithm)
- `bevelColor` property to theme system for button bevel styling
- Palette selection persistence in project state
- Selected color index now restores on page reload
- `verticalAnchor` option for popup toolbar positioning

### Changed
- Shapes popup now anchors to bottom of toolbar for better UX
- Themes are now data-driven from JSON files (`config/themes/cc29.json`)
- Circle drawing algorithm improved with pixel-center distance approach
- Theme interface now has 8 properties (added `bevelColor`)

### Fixed
- Selected color not visually restoring when loading saved project
- Circle tool producing square shapes at small sizes
- Autumn theme bevel color matching border (now distinct)

## [0.1.0] - 2025-11-29

### Added
- Initial pikcell sprite editor package release
- Comprehensive UI and logic components for pixel art editing
- Toolbar card component with shape selection popup
- Vita the Dinosaur sprite animation data
- CC29 Dark theme with updated background color
- MIT license
- Index.html for browser dev and demo viewing
- ActionManager for refactored event handling across Logic components
- FallingSquaresAnimation loading indicator
- Loading scene with customizable animations

### Changed
- Restructured sprite editor architecture with improved separation of concerns
- Extracted component interfaces and modernized card architecture
- Extracted layout and sprite card factory managers
- Extracted card drag and resize logic into separate handler classes
- Centralized card ID management and improved UI state handling
- Restructured webpack configs and HTML
- Updated package metadata and dependencies

### Fixed
- Critical memory leaks and type safety issues across core modules
- Dependencies in sub-packages

