# Changelog

All notable changes to `@moxijs/ui` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.2] - 2025-12-06

### Added
- `fontWeight` property to `UIFontConfig` interface for font weight inheritance
- `UILayoutConfig` interface for inheritable layout configuration (padding, margin, borderRadius, controlHeight)
- `LayoutEngine.getInstance()` singleton pattern for shared layout engine instance
- `UIComponent` now implements `IFlexLayoutParticipant` for flex layout tree integration
- New flex layout system exports: `FlexLayoutEngine`, `LayoutTree`, `LayoutWrapper`, `LayoutDebugOverlay`
- Package exports test to catch broken re-exports during refactoring
- Tests for focus ring theming, fontWeight inheritance, and LayoutEngine singleton

### Changed
- Flattened layout folder structure (removed `core/`, `engine/`, `tree/`, `integration/`, `debug/` subfolders)
- Focus ring now uses theme colors via `resolveColor('focus')` instead of hardcoded values
- Refactored `resolveInheritedFont` and `resolveInheritedLayoutParam` to use generic helper

### Fixed
- Broken exports in `src/index.ts` after layout folder restructure

### Breaking Changes
- `UIComponent` now implements `IFlexLayoutParticipant`, adding required `id` and `layoutNode` properties
- Subclasses extending `UIComponent` will inherit these new properties automatically

## [0.3.1] - 2025-12-05

### Added
- `fontSize` option in `CardPanelTitle` for customizable title font size (default: 14)
- `fontFamily` option in `CardPanelTitle` for customizable title font (default: 'Arial')
- `setBackgroundColor()` method on `UIScrollContainer` for dynamic background color updates

## [0.3.0] - 2025-12-04

### Added
- Initial release as separate `@moxijs/ui` package (previously part of `@moxijs/core`)
- UI Components:
  - `UILabel` - Text labels with MSDF font support
  - `UIButton` - Interactive buttons with hover/press states
  - `UITextInput` - Text input fields with cursor and selection
  - `UICheckbox` - Checkbox controls
  - `UIRadioGroup` - Radio button groups
  - `UISelect` - Dropdown select controls
  - `UISlider` - Range slider controls
  - `UIPanel` - Container panels with 9-slice texture support
  - `UIScrollContainer` - Scrollable content areas
  - `UITabs` - Tabbed interface component
  - `CardPanel` - Styled card panels with title bar, body, and footer
  - `FlexContainer` - Flexbox-style layout container
  - `UILayer` - Scaled UI layer with multiple scale modes
- Theming system with `ThemeManager` for runtime theme switching
- CSS-like font inheritance for MSDF fonts
- Focus management with `UIFocusManager`
