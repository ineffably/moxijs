# MOXI : AN EXPERIMENT IN PLAY

## MOXI

MOXI is a lightweight API and/or wrapper around [PIXIJS](https://pixijs.download/release/docs/index.html) objects with interfaces that create a surface area to build behaviors, plugins, and event signals. It provides an Entity-Component architecture that makes it easy to create interactive 2D experiences while leveraging the power of PixiJS.

![Prototype Status](https://img.shields.io/badge/Status-Prototype-orange)

### Core Features

- 🧩 **Entity-Component System**: Add behaviors to PixiJS objects to create modular, reusable game logic
- 🎮 **Input Management**: Simplified keyboard, mouse, and touch input handling
- 📦 **Asset Loading**: Streamlined texture and resource management
- 📹 **Camera System**: Built-in camera with follow behavior and smooth transitions
- ⚡ **Performance**: Built on PixiJS's optimized WebGL rendering
- 🧰 **TypeScript Support**: Full type definitions and intelligent autocompletion

### Quick Example

```typescript
import { prepMoxi, asEntity, Behavior } from 'moxi';
import * as PIXI from 'pixi.js';

// Define a behavior
class RotationBehavior extends Behavior<PIXI.Sprite> {
  speed = 0.02;
  
  update(entity, deltaTime) {
    entity.rotation += this.speed * deltaTime;
  }
}

async function start() {
  // Setup Moxi
  const { scene, engine } = await prepMoxi({ 
    hostElement: document.getElementById('game')
  });
  
  // Create an entity with a behavior
  const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
  sprite.anchor.set(0.5);
  sprite.position.set(400, 300);
  
  const entity = asEntity(sprite);
  entity.moxiEntity.addBehavior(new RotationBehavior());
  
  scene.addChild(entity);
  scene.init();
  engine.start();
}
```

See the [Moxi package README](./packages/moxi/README.md) for more detailed documentation and examples.

## MOXI-EDIT : THE SPIKE PHASE

MOXI-EDIT is an experiment to play with browser based sandboxes while building an extensible stage editor around PIXI containers. 

The Stage Editor should be simple but extensible and would have a built in code editor environment for JavaScript and TypeScript based behaviors and games. 

no written mvp, no docs yet, it's very fluid 

[There is a demo of the basic real-time code editor here](https://ineffably.github.io/moxi/packages/moxi-edit/) 

[More Details in the Tasks List](./tasks.md)

## Project Structure

- **packages/moxi**: Core engine with Entity-Component System
- **packages/moxi-edit**: Real-time editor for building and testing Moxi applications
- **packages/moxi-behaviors**: (Coming soon) Collection of behaviors for common game mechanics

## Development Status

This project is in active prototype development. The API may change significantly between versions as we refine the architecture and feature set.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the packages: `npm run build:clean`
4. Run the editor: `npm run editor`

## License

MIT
