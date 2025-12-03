# MoxiJS Package Structure

## Overview

MoxiJS is organized into two main packages:

- **`@moxijs/core`** - Core engine utilities, rendering, physics, and PIXI helpers
- **`@moxijs/ui`** - Complete UI system with components, theming, and layout

---

## @moxijs/core

Core engine and utilities for game/application development.

```
packages/core/src/
├── index.ts                          # Main entry point & exports
│
├── main/                             # Core Engine
│   ├── engine.ts                     # Engine - Main game loop & lifecycle
│   ├── scene.ts                      # Scene - Scene management
│   ├── render-manager.ts             # RenderManager - PIXI rendering
│   ├── asset-loader.ts               # AssetLoader - Asset loading & caching
│   ├── camera.ts                     # Camera, CameraLogic - Viewport control
│   ├── event-system.ts               # EventEmitter - Event pub/sub
│   ├── logic.ts                      # Logic - Base logic class
│   └── moxi-entity.ts                # MoxiEntity, asEntity - Entity system
│
├── library/                          # Utilities & Systems
│   ├── as-pixi.ts                    # PIXI Helpers
│   │                                 #   - asTextDPR (DPR-scaled text)
│   │                                 #   - asBitmapText, asText
│   │                                 #   - asSprite, asGraphics, asContainer
│   │
│   ├── state-machine.ts              # StateMachine - FSM implementation
│   ├── state-logic.ts                # StateLogic - State-based logic
│   ├── action-manager.ts             # ActionManager - Input action mapping
│   ├── client-events.ts              # ClientEvents - Mouse/keyboard events
│   │
│   ├── texture-frames.ts             # asTextureFrames - Spritesheet frames
│   ├── texture-frame-sequences.ts    # TextureFrameSequences - Animation
│   ├── grid-generator.ts             # createTileGrid, getTextureRange
│   │
│   ├── parallax-background.ts        # ParallaxBackground - Parallax effects
│   ├── parallax-layer.ts             # ParallaxLayer, TilingParallaxLayer
│   ├── loading-scene.ts              # LoadingScene - Loading screens
│   ├── falling-squares-animation.ts  # FallingSquaresAnimation
│   │
│   ├── font-loader.ts                # loadFonts - Web font loading
│   ├── resize-handler.ts             # createResizeHandler, setupResponsiveCanvas
│   ├── setup.ts                      # setupMoxi, defaultRenderOptions
│   ├── utils.ts                      # General utilities
│   ├── pixel-grid.ts                 # PixelGrid - Pixel-perfect measurements
│   │                                 #   - px(), units(), GRID, BORDER
│   │
│   ├── physics/                      # Physics System (Planck.js)
│   │   ├── index.ts                  # Physics exports
│   │   ├── physics-world.ts          # PhysicsWorld - World management
│   │   ├── physics-body-logic.ts     # PhysicsBodyLogic - Body behavior
│   │   ├── physics-collision.ts      # CollisionRegistry, CollisionManager
│   │   ├── physics-debug-renderer.ts # PhysicsDebugRenderer
│   │   ├── physics-materials.ts      # PhysicsMaterials, applyMaterial
│   │   ├── physics-types.ts          # Type definitions
│   │   ├── physics-utils.ts          # asPhysicsEntity, hasPhysics, etc.
│   │   └── physics-graphics-parser.ts# createShapeFromSprite
│   │
│   └── svg-utils/
│       └── svg-to-texture.ts         # svgToTexture - SVG to PIXI texture
```

### Key Exports from @moxijs/core

| Category | Exports |
|----------|---------|
| **Engine** | `Engine`, `Scene`, `RenderManager`, `AssetLoader` |
| **Entity** | `MoxiEntity`, `asEntity`, `Logic` |
| **Camera** | `Camera`, `CameraLogic` |
| **Events** | `EventEmitter`, `ClientEvents`, `ActionManager` |
| **State** | `StateMachine`, `StateLogic` |
| **PIXI Helpers** | `asTextDPR`, `asBitmapText`, `asText`, `asSprite`, `asGraphics`, `asContainer` |
| **Animation** | `asTextureFrames`, `TextureFrameSequences` |
| **Effects** | `ParallaxBackground`, `ParallaxLayer`, `LoadingScene` |
| **Physics** | `PhysicsWorld`, `PhysicsBodyLogic`, `CollisionManager`, `PhysicsMaterials` |
| **Utilities** | `loadFonts`, `createResizeHandler`, `svgToTexture`, `utils` |
| **Pixel Grid** | `PixelGrid`, `px`, `units`, `GRID`, `BORDER`, `createBorderConfig` |

---

## @moxijs/ui

Complete UI system for building user interfaces.

**Depends on:** `@moxijs/core` (for `asTextDPR` and other utilities)

```
packages/moxi-ui/src/
├── index.ts                          # Main entry point & exports
│
├── core/                             # UI Foundation
│   ├── ui-component.ts               # UIComponent - Base class for all UI
│   ├── ui-focus-manager.ts           # UIFocusManager - Keyboard focus & tab nav
│   ├── box-model.ts                  # BoxModel, ComputedLayout, MeasuredSize
│   └── edge-insets.ts                # EdgeInsets - Padding/margin helper
│
├── layout/                           # Layout System
│   └── flex-container.ts             # FlexContainer - Flexbox-style layout
│                                     #   - FlexDirection, FlexJustify, FlexAlign
│
├── components/                       # UI Components
│   ├── ui-box.ts                     # UIBox - Basic rectangle
│   ├── ui-panel.ts                   # UIPanel - Background panel (9-slice)
│   ├── ui-label.ts                   # UILabel - Text display
│   ├── ui-button.ts                  # UIButton - Clickable button
│   ├── button-background-strategy.ts # Button background strategies
│   │
│   ├── ui-checkbox.ts                # UICheckbox - Toggle checkbox
│   ├── ui-checkbox-with-label.ts     # UICheckboxWithLabel - Checkbox + label
│   ├── ui-radio-button.ts            # UIRadioButton - Radio button
│   ├── ui-radio-group.ts             # UIRadioGroup - Radio button group
│   ├── ui-radio-option.ts            # UIRadioOption - Radio + label
│   │
│   ├── ui-text-input.ts              # UITextInput - Single-line text input
│   ├── ui-textarea.ts                # UITextArea - Multi-line text input
│   ├── ui-select.ts                  # UISelect - Dropdown select
│   │
│   ├── ui-scroll-container.ts        # UIScrollContainer - Scrollable area
│   ├── ui-tabs.ts                    # UITabs - Tab navigation
│   │
│   └── card-panel/                   # Card Panel System
│       ├── index.ts                  # CardPanel exports
│       ├── card-panel.ts             # CardPanel - Flexible card component
│       ├── card-style.ts             # CardStyle - Card styling
│       └── flat-card-style.ts        # FlatCardStyle - Flat card variant
│
├── theming/                          # Theming System
│   ├── index.ts                      # Theme exports
│   ├── theme-manager.ts              # ThemeManager - Theme registration
│   ├── theme-resolver.ts             # ThemeResolver - Color resolution
│   ├── theme-data.ts                 # DefaultUITheme, theme factories
│   ├── themes/                       # Built-in themes
│   ├── README.md                     # Theming documentation
│   └── USAGE.md                      # Usage examples
│
├── services/                         # Composition Services
│   ├── index.ts                      # Service exports
│   ├── layout-engine.ts              # LayoutEngine - Layout calculations
│   ├── form-state-manager.ts         # FormStateManager - Form state
│   ├── text-input-handler.ts         # TextInputHandler - Text input logic
│   └── theme-applier.ts              # ThemeApplier - Apply themes to components
│
├── UILayer.ts                        # UILayer - UI rendering layer
└── UIScaleMode.ts                    # UIScaleMode - Scaling modes
```

### Key Exports from @moxijs/ui

| Category | Exports |
|----------|---------|
| **Core** | `UIComponent`, `UIFocusManager`, `EdgeInsets`, `BoxModel` |
| **Layout** | `FlexContainer`, `FlexDirection`, `FlexJustify`, `FlexAlign` |
| **Basic** | `UIBox`, `UIPanel`, `UILabel` |
| **Buttons** | `UIButton`, `ButtonState`, `SpriteBackgroundConfig` |
| **Form Controls** | `UICheckbox`, `UICheckboxWithLabel`, `UIRadioButton`, `UIRadioGroup` |
| **Text Input** | `UITextInput`, `UITextArea` |
| **Selection** | `UISelect`, `SelectOption` |
| **Containers** | `UIScrollContainer`, `UITabs`, `CardPanel` |
| **Theming** | `ThemeManager`, `ThemeResolver`, `createDefaultDarkTheme`, `createDefaultLightTheme` |
| **Services** | `LayoutEngine`, `FormStateManager`, `TextInputHandler` |
| **Layer** | `UILayer`, `UIScaleMode` |
| **Re-exports** | `PixelGrid`, `px`, `units`, `asTextDPR` (from @moxijs/core) |

---

## Package Relationship

```
┌─────────────────────────────────────────────────────────────┐
│                        @moxijs/ui                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  UI Components, Layout, Theming, Services           │   │
│  │  - UIButton, UICheckbox, UISelect, UITextInput...   │   │
│  │  - FlexContainer, EdgeInsets, BoxModel              │   │
│  │  - ThemeManager, ThemeResolver                      │   │
│  │  - PixelGrid, UILayer                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│                            │ depends on                     │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    @moxijs/core                      │   │
│  │  - asTextDPR (DPR-scaled text rendering)            │   │
│  │  - PixelGrid, px, units (pixel-perfect grid)        │   │
│  │  - PixiProps, TextDPROptions                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       @moxijs/core                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Engine, Rendering, Physics, Utilities              │   │
│  │  - Engine, Scene, RenderManager, AssetLoader        │   │
│  │  - StateMachine, StateLogic, ActionManager          │   │
│  │  - PhysicsWorld, CollisionManager                   │   │
│  │  - ParallaxBackground, LoadingScene                 │   │
│  │  - PIXI helpers (asTextDPR, asSprite, etc.)         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Usage Example

```typescript
// Import from core for engine and utilities
import { 
  Engine, 
  Scene, 
  AssetLoader,
  asTextDPR,
  StateMachine 
} from '@moxijs/core';

// Import from ui for UI components
import { 
  UIButton, 
  UITextInput, 
  FlexContainer,
  ThemeManager,
  createDefaultDarkTheme 
} from '@moxijs/ui';

// Setup theming
const themeManager = new ThemeManager();
themeManager.registerTheme('dark', createDefaultDarkTheme());
themeManager.setActiveTheme('dark');

// Create UI
const container = new FlexContainer({
  direction: FlexDirection.Column,
  gap: 10,
  padding: EdgeInsets.all(20)
});

const input = new UITextInput({
  placeholder: 'Enter your name...',
  width: 200
});

const button = new UIButton({
  label: 'Submit',
  onClick: () => console.log(input.getValue())
});

container.addChild(input);
container.addChild(button);
```

