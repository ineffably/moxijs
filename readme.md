# MOXIJS

**A game framework kit written in TypeScript built to work with PixiJS**

PixiJS has a pretty great api for handling rendering beautifully, but, when I start adding game logic, if I want to take it past a toy phase, it got messy fast. So, I wanted to build a final framework that had the utilities and objects I would write around PIXIJS. 

![Alpha Status](https://img.shields.io/badge/Status-ALPHA-blue)
[![npm version](https://img.shields.io/npm/v/@moxijs/core.svg)](https://www.npmjs.com/package/@moxijs/core)

### 🎮 [View Live Examples](https://ineffably.github.io/moxijs/) - See it in action with source code viewer

> **Fair warning**: I am currently building this for me for my utility and for fun. I've enjoyed making little web games here and there, I've written disposable utilities in the past, and, I finally wanted to preserve them. This thing is still in alpha. The API might change. Things might break. Yes, this is agentically enhanced, mostly using Claude Code and Anthropic LLMs. Feel free to try it out and give feedback...if you're curious and don't mind things being a little rough around the edges. 

### 📚 Documentation
- **[Core API Docs](https://ineffably.github.io/moxijs/packages/core/docs/)** - Complete API reference for `@moxijs/core`
- **[UI API Docs](https://ineffably.github.io/moxijs/packages/ui/docs/)** - Complete API reference for `@moxijs/ui`

---

## Why 

* I like to quickly prototype experiences and games and share them with folks.
* I wanted a rapid development framework for doing just that.
* A framework I can iterate on and create editors and useful tools and QoL toys for fun and enhancing development experience. 
* I've written a lot of typescript and web interfaces for many years, so, this feels very natural to me.
* I'm trying to solve some frustrating issues with web canvas and text and capturing those utilties and techniques in a re-usable package. 
* What if could get this working smoothly in three.js? 
* I wanted an editorless framework to work with LLMs to rapidly prototype 2D games and experimental user interfaces.
* the ui components are many times a hurdle when writing game UI so I wanted to make that SUPER easy for me and an LLM to write. 
* I figured others might think the same? 

## Loose Feature Plan

- Easy Setup and Management
- Text rendering utilies and more Text options
- QoL Utilities
- Entitiy objects
- Camera and Parallax Scrolling
- PIXIJS / PhaserJS plugins
- Flexible User Interface Components
  - Themable
  - Panels
  - Input Components
  - Tab Manager
- Editors
  - Sprite
  - TileMap
  - Particle Emitter
  - Sound
  - Music
  - Scene
  - Project

BETA: don't even consider a BETA until late Jan. I'm going to keep it fluid while I solve issues and make things happen.

Most of this was written for myself while writing the examples and games.
Ever since the first publish I've been testing it writing examples and games with it, so that feedback look is tight. 

I plan to keep this mostly "editor free", I like everything to be in code. 
If/When get to the point of having `moxijs.project.json` files, there will always be code based loaders/exporters. 

Why not PhaserJS? I really like PhaserJS and have used it a lot in the past. I just wanted to compose my own ECS from a drawing, physics, text and other libraries to form opinions and/or provide flexibility to swap out one for another as things evolve.

I move pretty fast so keep an eye out for updates. 

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


