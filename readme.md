# MOXI

**A game framework written in TypeScript built to work with PixiJS**

Moxi is designed for rapid development of WebGL-based games, POCs, and prototypes. It's also LLM-friendly - clean, well-documented code that AI assistants can easily understand and help you build with.

PixiJS is great for rendering, but sometimes you just want to make a game without writing the same boilerplate every time. That's MOXI. It's an Entity-Component-System wrapper around PixiJS that gives you the structure to build games faster while keeping all the PixiJS power under the hood.

![Prototype Status](https://img.shields.io/badge/Status-Prototype-orange)

> **Fair warning**: This thing is still in prototype mode. The API might change. Things might break. If you're building something critical, maybe wait. If you're experimenting and don't mind things being a little rough around the edges, let's go.

---

## What is this thing?

MOXI wraps PixiJS with an Entity-Component-System architecture. You get all the rendering performance of PixiJS, but with reusable components, a built-in game loop, and utilities for physics, camera work, parallax, input handling, and all that stuff you'd end up writing yourself anyway.

Think of it like this: PixiJS handles the "draw stuff fast" part. MOXI handles the "organize your game logic so it doesn't turn into spaghetti" part.

🎮 **[View Live Examples](https://ineffably.github.io/moxi/packages/moxi-examples/dist/)** to see it in action.

## Why would I use this?

- If you know PixiJS, you'll feel right at home with MOXI
- The Entity-Component pattern keeps your code modular instead of one giant pile
- Comes with physics (Planck.js), camera system, parallax scrolling, state machines
- Full TypeScript support with autocomplete
- You're not locked in - it's still just PixiJS objects underneath

---

## The basics

Here's what MOXI gives you out of the box:

### Entity-Component System

Attach logic components to PixiJS objects. No inheritance hierarchy nonsense.

```typescript
import { asEntity, Logic } from 'moxi';
import { Sprite } from 'pixi.js';

class RotateLogic extends Logic<Sprite> {
  update(entity: Sprite, deltaTime: number) {
    entity.rotation += 0.01 * deltaTime;
  }
}

const sprite = new Sprite(texture);
const entity = asEntity(sprite);
entity.moxiEntity.addLogic(new RotateLogic());
```

### Physics Engine

Real physics via Planck.js. The cool part? If you draw a box with Graphics, MOXI automatically figures out the collision shape. No manual setup.

```typescript
import { setupMoxi, asPhysicsEntity, PhysicsMaterials } from 'moxi';
import { Graphics } from 'pixi.js';

const { scene, physicsWorld } = await setupMoxi({
  physics: { gravity: { x: 0, y: 9.8 } }
});

// Draw a box - collision shape is auto-detected
const box = new Graphics().rect(-25, -25, 50, 50).fill(0xFF6B6B);
const boxEntity = asPhysicsEntity(box, physicsWorld, {
  type: 'dynamic',
  ...PhysicsMaterials.wood
});

scene.addChild(boxEntity);
```

### Parallax Scrolling

Multi-layer backgrounds with different scroll speeds. Handles zoom compensation automatically.

```typescript
import { ParallaxBackground, TilingParallaxLayer } from 'moxi';

const background = new ParallaxBackground(camera);

// Distant stars move slower than close clouds
background.addLayer(new TilingParallaxLayer(starsTexture, {
  scrollScale: { x: 0.1, y: 0.1 }
}));

background.addLayer(new TilingParallaxLayer(cloudsTexture, {
  scrollScale: { x: 0.5, y: 0.5 }
}));
```

### Camera System

Camera that follows your player, with smooth movement and boundaries.

```typescript
import { Camera, CameraLogic } from 'moxi';

const camera = new Camera(renderer);
camera.setTarget(player);
camera.setBounds(0, 0, 2000, 1500);
camera.setSmoothing(0.1);

scene.addChild(asEntity(camera).moxiEntity.addLogic(new CameraLogic()));
```

### Input Handling

One place for all your keyboard, mouse, and wheel input.

```typescript
import { ClientEvents } from 'moxi';

const input = new ClientEvents();

if (input.isKeyDown('Space')) {
  player.jump();
}

const mousePos = input.movePosition;
const zoom = input.wheelOffsets.y;
```

### State Machines

For character AI, game states, UI flows, whatever.

```typescript
import { StateMachine, StateLogic } from 'moxi';

const fsm = new StateMachine('idle');
fsm.addTransition('idle', 'jump', 'jumping');
fsm.addTransition('jumping', 'land', 'idle');

const stateLogic = new StateLogic(fsm);
entity.moxiEntity.addLogic(stateLogic);

fsm.transition('jump'); // idle → jumping
```

### Animation System

Slice up spritesheets and manage frame sequences.

```typescript
import { asTextureFrames, TextureFrameSequences } from 'moxi';

const frames = asTextureFrames(texture.source, {
  frameWidth: 64,
  frameHeight: 64,
  columns: 8,
  rows: 4
});

const sequences = new TextureFrameSequences(frames);
sequences.addSequence('walk', [0, 1, 2, 3]);
sequences.addSequence('jump', [4, 5, 6]);

const sprite = new Sprite(sequences.getFrame('walk', 0));
```

### Grid Generator

Generate tile maps from spritesheets.

```typescript
import { createTileGrid } from 'moxi';

const grid = createTileGrid({
  gridWidth: 10,
  gridHeight: 10,
  cellWidth: 64,
  cellHeight: 64,
  textures: grassTextures,
  onCellCreate: (sprite, x, y) => {
    // Do whatever you want with each tile
  }
});

scene.addChild(grid);
```

### Responsive Canvas

Keep your aspect ratio when the window resizes.

```typescript
import { setupResponsiveCanvas } from 'moxi';

setupResponsiveCanvas(renderer, {
  onResize: (width, height) => {
    console.log(`Canvas resized: ${width}x${height}`);
  }
});
```

### UI System

Production-ready UI components with flexbox layout.

```typescript
import { FlexContainer, FlexDirection, UIButton, UILabel, UIPanel } from 'moxi';

const menu = new FlexContainer({
  direction: FlexDirection.Column,
  justify: FlexJustify.Center,
  gap: 16
});

menu.addChild(new UILabel({ text: 'Main Menu', fontSize: 24 }));
menu.addChild(new UIButton({
  text: 'Start Game',
  onClick: () => startGame()
}));
menu.addChild(new UIButton({
  text: 'Options',
  onClick: () => showOptions()
}));
```

Includes: `UIButton`, `UILabel`, `UIPanel`, `UITextInput`, `UITextArea`, `UISelect`, `UITabs`, `UIScrollContainer`, and `FlexContainer` for layout.

### Pixel Grid System

Pixel-perfect positioning for retro-style games.

```typescript
import { px, units, GRID } from 'moxi';

// Position sprites in grid units (default 4x scale)
sprite.x = px(10);  // 10 grid units = 40 pixels
sprite.y = px(5);

// Convert pixels back to grid units
const gridX = units(sprite.x);
```

---

## Getting started

### Install it

```bash
npm install moxi pixi.js
```

### Basic example

```typescript
import { setupMoxi, asEntity, Logic } from 'moxi';
import { Sprite, Assets } from 'pixi.js';

class RotateLogic extends Logic<Sprite> {
  name = 'RotateLogic';
  speed = 0.02;

  update(entity: Sprite, deltaTime: number) {
    entity.rotation += this.speed * deltaTime;
  }
}

async function init() {
  const { scene, engine } = await setupMoxi({
    hostElement: document.getElementById('game')!,
  });

  const texture = await Assets.load('path/to/sprite.png');

  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5);
  sprite.position.set(640, 360);

  const entity = asEntity(sprite);
  entity.moxiEntity.addLogic(new RotateLogic());

  scene.addChild(entity);
  scene.init();
  engine.start();
}

init();
```

### Physics example

```typescript
import { setupMoxi, asPhysicsEntity, PhysicsMaterials } from 'moxi';
import { Graphics } from 'pixi.js';

async function initPhysics() {
  const { scene, engine, physicsWorld } = await setupMoxi({
    hostElement: document.getElementById('game')!,
    physics: {
      gravity: { x: 0, y: 9.8 },
      pixelsPerMeter: 30
    }
  });

  // Ground
  const ground = new Graphics()
    .rect(-400, -25, 800, 50)
    .fill(0x8B4513);

  const groundEntity = asPhysicsEntity(ground, physicsWorld!, {
    type: 'static',
    ...PhysicsMaterials.terrain
  });
  groundEntity.position.set(640, 650);
  scene.addChild(groundEntity);

  // Falling box
  const box = new Graphics()
    .rect(-25, -25, 50, 50)
    .fill(0xFF6B6B);

  const boxEntity = asPhysicsEntity(box, physicsWorld!, {
    type: 'dynamic',
    ...PhysicsMaterials.wood
  });
  boxEntity.position.set(640, 100);
  scene.addChild(boxEntity);

  // Press 'P' to see physics debug view
  physicsWorld!.enableDebugRenderer(scene);

  scene.init();
  engine.start();
}

initPhysics();
```

---

## Examples

### 🎮 [**View Live Examples**](https://ineffably.github.io/moxi/packages/moxi-examples/dist/)

Interactive examples with source code viewer - see MOXI in action right in your browser.

### All Examples

Check out [`packages/moxi-examples`](packages/moxi-examples/) for working demos:

- **01 - Basic Sprite** - The absolute basics with a single sprite
- **02 - Rotating Sprite** - Animation and text rendering
- **03 - PIXI.js Only** - Pure PixiJS example (no MOXI) for comparison
- **04 - Animated Character** - Sprite sheets and camera following
- **05 - Progress Bar** - Custom Logic components
- **06 - Bunny Adventure** - Tilemap platformer with keyboard controls
- **07 - Parallax Space Shooter** - Multi-layer parallax scrolling
- **08 - Physics Basic** - Physics simulation with Planck.js
- **09 - Dino AI Behaviors** - AI systems with state machines (Follow, Flee, Patrol, Wander)
- **10 - Text Rendering** - Comprehensive text showcase (BitmapText, counters, floating damage numbers)

**📚 [Full Examples Documentation](packages/moxi-examples/README.md)** | **📖 [Text Rendering Guide](packages/moxi-examples/guides/text-rendering.md)**

### Run Locally

```bash
cd packages/moxi-examples
npm install
npm start
```

Open http://localhost:9000 for live examples with hot reload.

---

## What's in the box

### Core stuff

| Thing | What it does |
|-------|--------------|
| `setupMoxi()` | Sets up your engine, scene, renderer, and optionally physics |
| `asEntity()` | Converts a PixiJS Container into a MOXI entity |
| `Logic<T>` | Base class for your game logic components |
| `Engine` | The game loop that updates everything |
| `Scene` | A PixiJS Container that manages entity lifecycles |

### Physics

| Thing | What it does |
|-------|--------------|
| `PhysicsWorld` | Wraps Planck.js and handles pixel/meter conversions |
| `asPhysicsEntity()` | Makes a physics-enabled entity |
| `PhysicsMaterials` | Presets like wood, metal, bouncy, terrain |
| `getPhysicsBody()` | Gets the underlying Planck body if you need it |

### Rendering and camera

| Thing | What it does |
|-------|--------------|
| `Camera` | 2D camera with target following |
| `CameraLogic` | The update logic for the camera |
| `ParallaxBackground` | Container for parallax layers |
| `ParallaxLayer` | Single parallax layer |
| `TilingParallaxLayer` | Infinitely repeating parallax layer |

### Input

| Thing | What it does |
|-------|--------------|
| `ClientEvents` | Manages keyboard, mouse, and wheel events |
| `ActionManager` | Tracks DOM event listeners for automatic cleanup |

### UI Components

| Thing | What it does |
|-------|--------------|
| `FlexContainer` | Flexbox-style layout container |
| `UIButton` | Interactive button with states |
| `UILabel` | Text display |
| `UIPanel` | Container with optional 9-slice backgrounds |
| `UITextInput` | Single-line text input |
| `UITextArea` | Multi-line text input |
| `UISelect` | Dropdown selection |
| `UITabs` | Tabbed interface |
| `UIScrollContainer` | Scrollable content area |
| `UILayer` | Responsive scaling container |
| `px()` / `units()` | Pixel grid positioning helpers |

### Utilities

| Thing | What it does |
|-------|--------------|
| `StateMachine` | Finite state machine |
| `asTextureFrames()` | Slices spritesheets into frames |
| `TextureFrameSequences` | Manages animation sequences |
| `createTileGrid()` | Generates tile grids |
| `AssetLoader` | Loads and caches textures |

---

## Development

### Building from source

```bash
# Install everything
npm install

# Build all packages
npm run build:clean

# Watch mode for development
npm run watch

# Run the examples
cd packages/moxi-examples
npm start
```

### Running the editor (experimental)

```bash
npm run editor
# Open https://localhost:8788/
```

The editor is still pretty experimental. It works, but don't expect polish yet.

---

## What's next

Things I'm thinking about adding:

- Particle system
- Audio engine integration
- Pathfinding utilities
- Networking/multiplayer helpers
- Better visual scene editor
- More physics examples (joints, constraints, that kind of stuff)
- Performance profiling tools

---

## Contributing

Prototype stage - not ready for contributions yet.

---

## How I'm thinking about this

A few principles I'm trying to stick to:

**PixiJS first** - You're working with actual PixiJS objects, not some abstraction layer that fights you. If you know PixiJS, you know most of MOXI already.

**Opt-in complexity** - Start simple. Add the stuff you need when you need it. Don't want physics? Don't use physics. Don't need parallax? Skip it.

**TypeScript native** - Types should help you, not get in your way. Autocomplete should just work.

**Pragmatic** - If it works and the code reads clearly, it's good enough. This isn't a dissertation.

**Experimental** - It's a prototype. We're trying stuff. Some things will stick, some won't.

---

## License

MIT © 2025

Do whatever you want with it.

---

## Credits

Built on [PixiJS](https://pixijs.com/) for rendering.

Physics by [Planck.js](https://piqnt.com/planck.js/).

Inspired by how Unity and Godot handle things, mixed with some frustration about writing the same game code over and over.

---

## Asset Credits

The examples use assets from these talented creators:

### Sprites & UI

- **[Kenney.nl](https://www.kenney.nl/)** - UI Pack, UI Pack: Sci-fi, and Space Shooter sprites (CC0)
  - Support: [Patreon](https://www.patreon.com/kenney/) | [Donate](http://support.kenney.nl)

- **[Cup Nooble](https://cupnooble.itch.io/)** - Sprout Lands Basic and Sprout Lands UI asset packs
  - [Sprout Lands Basic](https://cupnooble.itch.io/sprout-lands-asset-pack) | [Twitter](https://twitter.com/Sprout_Lands)

### Fonts

- **[PixelOperator](https://github.com/thinkofdeath/Minecraft-Font)** - PixelOperator and PixelOperator8 fonts (CC0)

- **[Roberto Mocci](https://www.patreon.com/rmocci)** - Dogica Pixel font (SIL Open Font License)

- **[Spottie Leonard](https://fontstruct.com/fontstructions/show/2330337)** - VHS Gothic font (CC BY-SA 3.0)

- **Minecraft Font** - Faithful OpenType recreation (Public Domain)

---

Made for people who like TypeScript and want to make games without the ceremony.
