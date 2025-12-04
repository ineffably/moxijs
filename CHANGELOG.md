# Changelog

All notable feature changes to MOXIJS will be documented in this file.

## 2025-12-03

- Added MSDF font generation and documentation
- Added MSDF font rendering support for PixiJS v8

## 2025-12-02

- BREAKING: Extracted UI components from core into new @moxijs/ui package
- Added CardPanel component with theming support
- Added checkbox and radio button types to UI exports
- Removed deprecated UI component system from core
- Added GitHub Pages deployment workflow
- Improved UI component type safety and consistency

## 2025-12-01

- Added palette color selection persistence in project state
- Added pixel explosion effect to sprite editor
- Added Noodle font integration and refactored font management
- Added pixel font supersampling example and bitmap font generator lab
- Added undo manager and shape drawer utility to pikcell
- Improved animated character example
- Refactored UI controls with services and improved theming consistency

## 2025-11-30

- Introduced standalone @moxijs/mini-gui package with data-driven architecture
- Added undo manager and shape drawer utility to pikcell
- Refactored pikcell theme and palette logic with unit tests
- Centralized and deduplicated card content redraw/cleanup patterns
- Cleaned up pikcell components and core modules

## 2025-11-29

- Added sprite library tool to examples
- Added Newton's Cradle and Stacking Tower physics demos
- Added Planck.js debug renderer and body logic to core module
- Added experimental tilemap editor foundation
- Moved main ECS/core modules from core/* to main/* directory
- Restructured example source files into semantic folders by topic
- Released @moxijs/core@0.2.3

## 2025-11-28

- Migrated moxijs package structure to packages/core/
- Renamed moxi-examples to moxijs-examples
- Added particle emitter sandbox with custom emitters and texture demos
- Added publishConfig to set package access to public
- Updated workflows and package files for improvements

## 2025-11-27

- Added toolbar card component with shape selection popup
- Added Vita the Dinosaur sprite animation data
- Updated CC29 Dark theme background color
- Restructured sprite editor architecture with improved separation of concerns

## 2025-11-26

- Added CI/CD workflows and npm package configuration
- Centralized card ID management and improved UI state handling
- Extracted card drag and resize logic into separate handler classes
- Extracted component interfaces and modernized card architecture
- Extracted layout and sprite card factory managers

## 2025-11-25

- Completed sprite editor framework implementation
- Restructured project layouts and improved build organization

## 2025-11-24

- Added pikcell sprite editor package with comprehensive UI and logic components
- Added FallingSquaresAnimation loading indicator
- Added loading scene with customizable animations and documentation
- Added ActionManager and refactored event handling across Logic components
- Added event system tests and improved event handling
- Enhanced sprite editor with scale card and layout state management
- Fixed critical memory leaks and type safety issues across core modules
- Refactored sprite editor with Moxi Logic components and manager pattern

## 2025-11-23

- Added project state management and sprite sheet controller enhancements
- Added SpriteSheetController for pixel-perfect sprite editor
- Completed sprite editor implementation with full UI system
- Enhanced sprite editor with improved controller state management
- Integrated pixel grid utilities and SVG icon support
- Refactored sprite editor components with improved pixel-perfect alignment

## 2025-11-22

- Major sprite editor overhaul with pixel-perfect UI
- Added comprehensive font rendering support
- Added customizable animated loading scene to Moxi library
- Added PixiProps interface and refactored PIXI component options
- Added sprite library example and UI improvements
- Added comprehensive unit test suite for moxi package
- Added particle texture assets and presets for particle emitter system
- Added type definitions test for moxi package

## 2025-11-16

- Added spaceShooter2 spritesheet assets and documentation
- Added UITextArea and UIFocusManager
- Introduced text inputs showcase and animated character assets

## 2025-11-15

- Added comprehensive UI button showcase and new spritesheets
- Added initial FlexBox-inspired UI system with sample components and asset integration

## 2025-11-12

- Added animated action label and floating damage/heal/miss numbers to character demo
- Added animated mechanical odometer counter and rainbow digit coloring to text rendering demo
- Added comprehensive text rendering examples with odometer
- Improved text rendering guides with BitmapText vs Text advisories
- Relocated AI state logic files to behavior-logic directory

## 2025-11-09

- Enhanced core engine structure, asset loader and event handling
- Added physics engine integration with Planck.js
- Added dino AI behaviors example with supporting logic (patrol, wander, follow, flee, hide, radar, animation, FSM)
- Added playwright test for Parallax Grid zoom invariance
- Added parallax space shooter container hierarchy diagram
- Fixed font path and alias for progress bar example

## 2025-11-08

- Added parallax scrolling system with space shooter example
- Added VS Code-style code viewer using CodeMirror for MOXI examples
- Fixed parallax space shooter example

## 2025-11-07

- Added comprehensive examples and improved core logic system
- Added tilemap metadata files and enhanced bunny adventure with varied terrain
- Moved grid generator to core library
- Reorganized examples into structured src/examples directory

## 2025-11-06

- Added comprehensive moxi-examples package with assets and demos
- Added PIXI-only comparison example and animated character demo
- Reorganized core architecture and removed deprecated behavior system
- Removed code-4 and moxi-edit packages

## 2025-05-08

- Created state-machine and state-behavior
- Fixed build issues with circular dependencies

## 2025-05-05

- Moved texture-frame-sequence into the moxi package

## 2025-04-19

- Added event emitter for communicating between behaviors
- Organized moxi codebase structure
- Updated movement behavior to use texture-frame-sequences for animations
- Used velocity with vectors to limit diagonal movement speed

## 2025-04-18

- Fixed camera implementation
- Centered the renderer
- Added grid generator

## 2025-04-11

- Added camera to moxi
- Added example01
- Implemented new behavior system with asEntity concept
- Added texture frames (later rolled into moxi)
- Added readme and typedocs for moxi alpha

## 2025-04-10

- BREAKING: Totally refactored how behaviors are added
- Implemented unobtrusive behavior system with minimal moving parts

## 2025-04-09

- Started scene editor (barely started)

## 2025-04-08

- Added true debounce to fix PIXI/chrome WebGL issues when rapidly reloading canvas

## 2025-03-30

- Major refactor: behavior model improved over inheritance
- Introduced progress bar example for behaviors

## 2025-03-23

- Created project format
- Hooked up better samples to moxi editor
- Added ability to switch between examples
- Direct project mode working
- Project player working (single file limitation)

## 2025-03-20

- Brought back to MVP basics with code4 editor
- Enabled better DOM model with iframe sent as ref
- Externalized virtual files, render target and dependencies
- Exposed moxi, pixi.js, react and react-dom to monaco

## 2025-03-19

- Bookmarked with code4 working in examples
- Removed editor from moxi edit

## 2025-03-18

- Added eslint for better formatting

## 2025-03-07

- First commit for moxi - bringing back old toy project to life

