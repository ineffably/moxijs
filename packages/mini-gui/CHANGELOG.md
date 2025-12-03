# Changelog

All notable changes to `@moxijs/mini-gui` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-11-30

### Added
- Initial mini-gui package
- `GUI` class - collapsible, draggable debug panel container
- `Control` abstract base class for control widgets
- `addFolder()` for nested GUI panels
- 2x PixelGrid scale for pixel-perfect rendering
- Dark theme color palette
- Drag support for panels
- Collapse/expand with click on header
- `onChange`/`onFinishChange`/`onOpenClose` callbacks
- `save()`/`load()` state persistence
- `reset()` to restore initial values

### Not Yet Implemented
- `gui.add()` - control type detection (Phase 2)
- NumberControl, ToggleControl, TextControl, ButtonControl
- OptionControl, ColorControl (Phase 3)
