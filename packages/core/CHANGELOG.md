# Changelog

All notable changes to `@moxijs/core` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

