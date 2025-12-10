# Changelog

All notable changes to `@moxijs/ui` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.4] - 2025-12-09

### Font Standardization & MSDF Fixes

This release introduces a unified font system across all UI components and fixes critical MSDF font loading issues with PixiJS v8.

### Added

#### Font Standardization
- `FontType` type: `'canvas' | 'msdf' | 'bitmap'` for specifying font rendering method
- `FontProps` interface with `fontFamily` and `fontType` properties
- Unified font configuration across all text-based components:
  - `UILabel` - Now supports `fontFamily` and `fontType` props with inheritance
  - `UIButton` - Now supports `fontFamily` and `fontType` props with inheritance
  - `UITextInput` - Added `fontFamily` and `fontType` props with inheritance
  - `UITextArea` - Added `fontFamily` and `fontType` props with inheritance
  - `UISelect` - Added `fontFamily` and `fontType` props with inheritance
  - `UITabs` - Added `fontFamily` and `fontType` props (inherited by tab labels)
- Font inheritance system: child components inherit font settings from parent containers
- `base/font-config.ts` - New centralized font configuration module

#### UIComponent
- `x` and `y` getters/setters for convenient positioning (no need to access `.container` directly)
- `getInheritedFontFamily()` - Resolves font family from parent chain
- `getInheritedFontType()` - Resolves font type from parent chain

#### UITextInput
- `setSize(width, height?)` method for dynamic resizing
- `setWidth(width)`, `getWidth()`, `getHeight()` convenience methods

#### UITextArea
- `setSize(width, height?)` method for dynamic resizing
- `setWidth(width)`, `getWidth()`, `getHeight()` convenience methods

#### UIScrollContainer
- Smooth scrolling enabled by default with new props:
  - `smoothScroll` - Enable/disable eased scrolling (default: `true`)
  - `scrollEasing` - Easing factor, 0.1=slow, 0.3=snappy (default: `0.15`)
  - `scrollSpeed` - Wheel event multiplier (default: `1`)
- `scrollPaddingBottom` - Extra scrollable height at bottom (useful for chat UIs)
- `setScrollPaddingBottom(padding)` and `getScrollPaddingBottom()` methods
- `scrollTo(y, animate?)` now accepts optional `animate` parameter
- `fontConfig` prop for font inheritance to nested children

#### FlexContainer
- `removeAllChildren()` method for clearing all children at once

### Changed
- **Breaking**: Standardized font properties across all components
  - Removed `msdfFontFamily` from `UILabel` (use `fontFamily` + `fontType: 'msdf'`)
  - Removed `useBitmapText`, `bitmapFontFamily`, `msdfFontFamily` from `UIButton` (use `fontFamily` + `fontType`)
- `UILabel` now creates `PIXI.BitmapText` when `fontType` is `'msdf'` or `'bitmap'`, otherwise uses `PIXI.Text`
- Font inheritance now works through deeply nested containers

### Fixed
- Font inheritance now works correctly through deeply nested containers (FlexContainer → UIScrollContainer → UILabel)
- Removed unnecessary `as any` cast in UIScrollContainer parent assignment
- `UISelect` now properly requests focus when clicked (using `UIFocusManager`)

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
