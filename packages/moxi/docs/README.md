**Moxi v0.1.0**

***

# Moxi

![Prototype Status](https://img.shields.io/badge/Status-Prototype-orange)

A lightweight Entity-Component framework for building 2D games with [PixiJS](https://pixijs.com/).

> ⚠️ **Prototype Stage**: Moxi is currently in early prototype development. API may change significantly between versions.

## Overview

Moxi provides a simple but powerful architecture for building 2D experiences by extending PixiJS with an Entity-Component System. It handles common game development patterns while maintaining PixiJS's performance and flexibility. The PIXI API is still used to draw all the game elements, but, behaviors can be added to rapidly create experiences.

```typescript
// Create a simple game entity
const player = asEntity(new PIXI.Sprite(texture));
player.moxiEntity.addBehavior(new PlayerMovementBehavior());
scene.addChild(player);
```

## Core Concepts

### Entities

Entities are game objects that can be rendered, have behaviors, and interact with other objects. In Moxi, entities are created by wrapping PixiJS ViewContainrs:

```typescript
// Create an entity from a PIXI sprite
const sprite = new PIXI.Sprite(texture);
const entity = asEntity(sprite);
```

### Behaviors

Behaviors are reusable components that define how entities act. They make it easy to share functionality between different game objects:

```typescript
// Define a custom behavior
class MovementBehavior extends Behavior<PIXI.Sprite> {
  speed = 5;
  
  update(entity, deltaTime) {
    entity.x += this.speed * deltaTime;
  }
}

// Add it to an entity
pixiDisplayObject.moxiEntity.addBehavior(new MovementBehavior());
```

### Scene and Camera

Moxi provides built-in scene management and camera controls for creating complex 2D worlds:

```typescript
// Set up a scene with camera
const { scene, engine, camera } = await prepMoxi({ hostElement: document.getElementById('game') });

// Configure camera
camera.desiredScale.set(2, 2); // 2x zoom
// you can also access the behaviors directly
camera.moxiEntity.getBehavior<CameraBehavior>('CameraBehavior').target = playerEntity;

// Start the engine
scene.init();
engine.start();
```

## Features

- 🧩 **Entity-Component Architecture**: Create modular, reusable game code
- 🎮 **Input Handling**: Simplified keyboard, mouse and touch input
- 📦 **Asset Management**: Easy texture loading and management
- 📹 **Camera System**: Viewport management with follow behavior
- ⚡ **Performance**: Built on PixiJS's optimized rendering
- 🧰 **TypeScript Support**: Full type definitions for better development experience

## Installation

```bash
npm install moxi
```

## Basic Usage

```typescript
import { prepMoxi, asEntity, Behavior } from 'moxi';
import * as PIXI from 'pixi.js';

// Define a simple rotation behavior
class RotationBehavior extends Behavior<PIXI.Sprite> {
  speed = 0.02;
  
  update(entity, deltaTime) {
    // Rotate the entity based on delta time
    entity.rotation += this.speed * deltaTime;
  }
}

async function startGame() {
  // Initialize Moxi
  const { scene, engine, PIXIAssets, loadAssets } = await prepMoxi({ 
    hostElement: document.getElementById('game')
  });
  
  // Load assets
  await loadAssets([
    { src: './assets/player.png', alias: 'player' }
  ]);
  
  // Create an entity
  const playerSprite = new PIXI.Sprite(PIXIAssets.get('player').texture);
  playerSprite.anchor.set(0.5);
  playerSprite.x = scene.renderer.width / 2;
  playerSprite.y = scene.renderer.height / 2;
  
  // Convert to entity and add a behavior
  const player = asEntity(playerSprite);
  player.moxiEntity.addBehavior(new RotationBehavior());
  
  // Add to scene
  scene.addChild(player);
  
  // Start the game
  scene.init();
  engine.start();
}

startGame();
```

## Project Status

Moxi is currently in active prototype development. While core functionality is working, expect frequent changes as the API is refined. We welcome feedback and contributions but don't recommend using it in production projects yet.

Planned upcoming features:
- Physics integration
- Animation state management
- Particle system
- Tilemap support
- Audio management
- UI components


## License

MIT
