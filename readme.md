# MOXIJS

**A game framework written in TypeScript built to work with PixiJS**

PixiJS handles rendering beautifully, but game logic can get messy fast. MoxiJS adds structure - an ECS architecture, reusable components, and game-ready utilities - so you can focus on building instead of boilerplate.

![Alpha Status](https://img.shields.io/badge/Status-ALPHA-blue)
[![npm version](https://img.shields.io/npm/v/@moxijs/core.svg)](https://www.npmjs.com/package/@moxijs/core)

### 🎮 [View Live Examples](https://ineffably.github.io/moxijs/) - See it in action with source code viewer

> **Fair warning**: This thing is still in alpha. The API might change. Things might break. If you're building something critical, maybe wait. If you're experimenting and don't mind things being a little rough around the edges, let's go.

---

## Why would I use this?

- You know PixiJS and want structure without learning a new paradigm
- Entity-Component pattern keeps code modular instead of one giant pile
- Comes with physics (Planck.js), camera system, parallax scrolling, state machines
- Full TypeScript support with autocomplete
- Not locked in - it's still just PixiJS objects underneath

---

## Getting started

### Install

```bash
npm install @moxijs/core pixi.js
```

### Basic example

```typescript
import { setupMoxi, asEntity, Logic } from '@moxijs/core';
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

---

## Features

### Entity-Component System

Attach logic components to PixiJS objects. No inheritance hierarchy nonsense.

```typescript
const sprite = new Sprite(texture);
const entity = asEntity(sprite);
entity.moxiEntity.addLogic(new RotateLogic());
```

### Physics Engine

Real physics via Planck.js. Draw shapes with Graphics and MOXIJS auto-detects collision shapes.

```typescript
const { scene, physicsWorld } = await setupMoxi({
  physics: { gravity: { x: 0, y: 9.8 } }
});

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
const background = new ParallaxBackground(camera);
background.addLayer(new TilingParallaxLayer(starsTexture, { scrollScale: { x: 0.1, y: 0.1 } }));
background.addLayer(new TilingParallaxLayer(cloudsTexture, { scrollScale: { x: 0.5, y: 0.5 } }));
```

### Camera System

Camera that follows your player, with smooth movement and boundaries.

```typescript
const camera = new Camera(renderer);
camera.setTarget(player);
camera.setBounds(0, 0, 2000, 1500);
camera.setSmoothing(0.1);
```

### Input Handling

One place for all your keyboard, mouse, and wheel input.

```typescript
const input = new ClientEvents();
if (input.isKeyDown('Space')) player.jump();
const mousePos = input.movePosition;
```

### State Machines

For character AI, game states, UI flows, whatever.

```typescript
const fsm = new StateMachine('idle');
fsm.addTransition('idle', 'jump', 'jumping');
fsm.addTransition('jumping', 'land', 'idle');
fsm.transition('jump'); // idle → jumping
```

### UI System

Production-ready UI components with flexbox layout: `UIButton`, `UILabel`, `UIPanel`, `UITextInput`, `UITextArea`, `UISelect`, `UITabs`, `UIScrollContainer`, and `FlexContainer`.

```typescript
const menu = new FlexContainer({ direction: FlexDirection.Column, gap: 16 });
menu.addChild(new UILabel({ text: 'Main Menu', fontSize: 24 }));
menu.addChild(new UIButton({ text: 'Start Game', onClick: () => startGame() }));
```

### Animation System

Slice up spritesheets and manage frame sequences.

```typescript
const frames = asTextureFrames(texture.source, { frameWidth: 64, frameHeight: 64, columns: 8, rows: 4 });
const sequences = new TextureFrameSequences(frames);
sequences.addSequence('walk', [0, 1, 2, 3]);
```

---

## API Reference

### Core

| Thing | What it does |
|-------|--------------|
| `setupMoxi()` | Sets up engine, scene, renderer, and optionally physics |
| `asEntity()` | Converts a PixiJS Container into a MOXIJS entity |
| `Logic<T>` | Base class for game logic components |
| `Engine` | The game loop that updates everything |
| `Scene` | Container that manages entity lifecycles |

### Physics

| Thing | What it does |
|-------|--------------|
| `PhysicsWorld` | Wraps Planck.js with pixel/meter conversions |
| `asPhysicsEntity()` | Makes a physics-enabled entity |
| `PhysicsMaterials` | Presets: wood, metal, bouncy, terrain |
| `getPhysicsBody()` | Gets the underlying Planck body |

### Rendering

| Thing | What it does |
|-------|--------------|
| `Camera` / `CameraLogic` | 2D camera with target following |
| `ParallaxBackground` | Container for parallax layers |
| `TilingParallaxLayer` | Infinitely repeating parallax layer |

### Input & Utilities

| Thing | What it does |
|-------|--------------|
| `ClientEvents` | Keyboard, mouse, and wheel events |
| `StateMachine` | Finite state machine |
| `asTextureFrames()` | Slices spritesheets into frames |
| `createTileGrid()` | Generates tile grids |

---

## Examples

Check out [`packages/moxijs-examples`](packages/moxijs-examples/) for working demos:

- **Basics** - Sprites, rotation, text rendering
- **Gameplay** - Platformer, parallax shooter, physics
- **NPC Behaviors** - AI with state machines (Follow, Flee, Patrol, Wander)
- **UI & Tools** - Text rendering, particle sandbox

```bash
cd packages/moxijs-examples && npm start
# Open http://localhost:9000
```

---

## Development

```bash
npm install           # Install everything
npm run build:clean   # Build all packages
npm run watch         # Watch mode
npm run editor        # Experimental editor (https://localhost:8788/)
```

---

## What's next

- Particle system
- Audio engine integration
- Pathfinding utilities
- Networking/multiplayer helpers
- Better visual scene editor

---

## Philosophy

**PixiJS first** - Working with actual PixiJS objects, not abstractions that fight you.

**Opt-in complexity** - Start simple. Add what you need when you need it.

**TypeScript native** - Types should help, not hinder. Autocomplete just works.

**Pragmatic** - If it works and reads clearly, it's good enough.

---

## License

MIT © 2025

---

## Credits

Built on [PixiJS](https://pixijs.com/) for rendering and [Planck.js](https://piqnt.com/planck.js/) for physics.

### Asset Credits

- **[Kenney.nl](https://www.kenney.nl/)** - UI packs and Space Shooter sprites (CC0)
- **[Cup Nooble](https://cupnooble.itch.io/)** - Sprout Lands asset packs
- **Fonts** - PixelOperator (CC0), Dogica Pixel (SIL OFL), VHS Gothic (CC BY-SA 3.0)

---

Made for people who like TypeScript and want to make games without the ceremony.
