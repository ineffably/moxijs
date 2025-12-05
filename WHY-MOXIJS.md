# Why MoxiJS?

MoxiJS is a game framework written in TypeScript built to work with PixiJS, designed for rapid development of WebGL-based games, POCs, and prototypes. It's split into modular packages (`@moxijs/core` for game logic, `@moxijs/ui` for interface components) so you only import what you need. It's also LLM-friendly - clean, well-documented code that AI assistants can easily understand and help you build with.

## The Problem

Building games with raw PixiJS requires:
- Boilerplate for game loops, scene management, and input handling
- Manual memory management for event listeners
- Custom solutions for common patterns (state machines, cameras, physics)
- Building UI systems from scratch
- Repetitive sprite/text setup code

## What MoxiJS Provides

### 1. One-Liner Initialization

```typescript
const { scene, engine, renderer, camera, loadAssets } = await setupMoxi({
  width: 1280,
  height: 720,
  pixelPerfect: true,
  suppressContextMenu: true,  // Prevent right-click menu
  physics: { gravity: { x: 0, y: 9.8 } }
});
```

No manual renderer setup, no ticker configuration, no canvas management.

### 2. Entity-Component Architecture

Attach reusable behaviors to any PIXI object:

```typescript
const player = asEntity(asSprite({ texture: 'hero' }), [
  new MovementLogic({ speed: 200 }),
  new PhysicsBodyLogic({ type: 'dynamic' }),
  new AnimationLogic({ sequences: heroAnimations })
]);

scene.addChild(player);
```

**Why it matters**: Composition over inheritance. Mix and match behaviors without class hierarchies.

### 3. Input Handling That Just Works

```typescript
// Polling-based (check in update loop)
if (ClientEvents.keydown?.ArrowRight) {
  player.x += speed * deltaTime;
}

// Or use ActionManager for DOM events with automatic cleanup
const actions = new ActionManager();
actions.add(window, 'resize', handleResize);
// Later: actions.removeAll() - no memory leaks
```

### 4. State Machines Built-In

```typescript
const fsm = new StateMachine(entity, {
  idle: new IdleState(),
  run: new RunState(),
  jump: new JumpState()
});

fsm.setState('run');
```

No external library needed. Perfect for character AI, game states, menu flows.

### 5. Camera System

```typescript
camera.follow(player, { speed: 0.1 });
camera.zoom(2);
camera.shake(0.5, 10); // duration, intensity
```

Smooth interpolation, target following, viewport bounds - all handled.

### 6. Physics Integration (Planck.js)

```typescript
const crate = asPhysicsEntity(asSprite({ texture: 'crate' }), {
  type: 'dynamic',
  shape: 'box'
});

CollisionRegistry.onCollision('player', 'enemy', (a, b) => {
  // Handle collision
});
```

2D physics with tag-based collision system. Toggle debug rendering with one flag.

### 7. Production-Ready UI (via @moxijs/ui)

```typescript
import { FlexContainer, FlexDirection, UIButton, ThemeManager } from '@moxijs/ui';

// Theming system with CSS-like inheritance
const themeManager = new ThemeManager(darkTheme);

const menu = new FlexContainer({
  direction: FlexDirection.Column,
  justify: FlexJustify.Center,
  gap: 16
});

menu.addChild(new UIButton({
  text: 'Start Game',
  onClick: () => startGame()
}));

// Switch themes at runtime
themeManager.setTheme(lightTheme);
```

Flexbox layout, theming, scroll containers, focus management, responsive scaling - all in PixiJS.

### 8. MSDF Text Rendering

```typescript
// High-quality text at any scale using MSDF fonts
const label = new UILabel({
  text: 'Crisp Text',
  fontFamily: 'PixelOperator8',  // MSDF font
  fontSize: 24
});
```

Generate MSDF fonts with the included script. Text stays sharp when scaled - perfect for UI.

### 9. Pixel-Perfect Helpers

```typescript
// Grid-based positioning
sprite.x = px(10);  // 10 grid units = 40 pixels (at 4x scale)
sprite.y = px(5);

// Texture frame sequences from spritesheets
const walkFrames = TextureFrameSequences.getFrameSequence('hero', 'walk');
```

## Why MoxiJS for POCs & Prototypes

### Speed
- **Minutes to playable**: `setupMoxi()` gets you rendering immediately
- **Pre-built patterns**: Don't reinvent state machines, cameras, or UI
- **TypeScript throughout**: Autocomplete guides you, catches errors early

### Flexibility
- **Use what you need**: Physics, UI, parallax - all optional
- **Full PIXI access**: MoxiJS wraps, doesn't hide. Drop to raw PIXI anytime
- **Swap behaviors**: Entity-component model makes iteration fast

### No Lock-In
- **Standard PixiJS**: Your sprites, textures, and rendering knowledge transfers
- **Clean abstractions**: Understand what MoxiJS does by reading the source
- **Eject gradually**: Start with MoxiJS helpers, replace with custom code as needed

## When to Use MoxiJS

**Good fit:**
- 2D games (platformers, top-down, puzzle)
- Interactive prototypes and POCs
- Game jams where speed matters
- Projects needing UI + game rendering
- Pixel art games with precise scaling

**Consider alternatives if:**
- You need 3D (use Three.js, Babylon)
- You're building a simple animation (raw PixiJS is fine)
- You need multiplayer networking (add Colyseus/Socket.io separately)

## Getting Started

```typescript
import { setupMoxi, asSprite } from '@moxijs/core';
import { UIButton, FlexContainer } from '@moxijs/ui';  // Optional UI package

const { scene, engine, loadAssets } = await setupMoxi({
  width: 800,
  height: 600
});

await loadAssets([{ src: 'sprites.json' }]);

const sprite = asSprite({ texture: 'hero', x: 400, y: 300 });
scene.addChild(sprite);

// You're rendering. Now build your game.
```

## Summary

MoxiJS removes the friction between "I have an idea" and "I have a playable prototype." It's not a game engine - it's a toolkit that handles the boring parts so you can focus on what makes your game unique.

Built for developers who know JavaScript/TypeScript and want to ship games, not fight boilerplate.
