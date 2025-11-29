# MOXI Examples

Working demos that show you what MOXI can do. Each example is self-contained and builds on the previous ones, so you can see how things actually work instead of just reading about it.

## 🎮 [**View Live Examples**](https://ineffably.github.io/moxi/packages/moxijs-examples/dist/)

Click the link above to explore all examples in an interactive viewer on GitHub Pages, or build locally and open `dist/index.html` in your browser.

## Running the examples

```bash
npm install
npm start
```

Open http://localhost:9000 and click through the examples in the sidebar. No page reloads needed - they switch live.

**Or build and view offline:**
```bash
npm run build
open dist/index.html  # macOS
# or just open dist/index.html in your browser
```

## What's in here

### 01 - Basic Sprite
The absolute basics. Displays a single sprite using MOXI. If you're new, start here.

### 02 - Rotating Sprite
Sprite rotation with a label showing the current angle. Demonstrates continuous animation and text rendering.

### 03 - PIXI.js Only
Pure PixiJS example without MOXI - rotating bunny grid. Shows the difference between vanilla PixiJS and MOXI.

### 04 - Animated Character
Sprite animation with camera following. Uses sprite sheets and frame sequences from the Sproutlands pack.

### 05 - Progress Bar
Custom Logic component creating an animated progress bar. Shows how to encapsulate behavior in reusable components.

### 06 - Bunny Adventure
Full tilemap platformer with keyboard controls. Multiple terrain types, character movement, tile-based world generation.

### 07 - Parallax Space Shooter
Top-down space shooter with multi-layer parallax scrolling. Different layers move at different speeds for depth. Mouse wheel zooms, arrow keys move the ship.

### 08 - Physics Basic
Physics simulation with Planck.js. Falling boxes, bouncing balls, mouse dragging. Click to spawn boxes, drag objects with mouse. Press 'P' to toggle physics debug view.

### 09 - Dino AI Behaviors
AI behavior system using finite state machines and Logic components. Demonstrates:
- **Follow**: Dinos chase the player within detection range
- **Flee**: Dinos run away when player gets too close
- **Patrol**: Dinos walk back and forth between waypoints
- **Wander**: Random movement with occasional direction changes
- **Radar**: Visual detection radius indicators
- **Animations**: Synchronized sprite animations with behavior states

Click dinos to cycle through behaviors. Uses state machines for clean AI logic.

### 10 - Text Rendering
Comprehensive text rendering showcase featuring:
- **BitmapText counters**: High-performance text that updates every frame
- **Rainbow digit counter**: Each digit colored based on its value
- **Mechanical odometer**: Scrolling digits like a vintage car odometer
- **FPS counter**: Real-time performance metrics
- **Animated text**: HSL color cycling for rainbow effects
- **Floating damage numbers**: MMO-style damage/heal numbers with physics
- **Styled text examples**: Gradients, strokes, shadows, word wrapping

Demonstrates MOXI Logic components for text behaviors. Click the character to spawn damage numbers.

**📚 See [guides/text-rendering.md](./guides/text-rendering.md) for the complete text rendering guide.**

## Available assets

We've got a bunch of asset packs included:

**Characters**
- Robot sprite
- Sproutlands characters (basic character, chicken, cow)
- Dino sprites (Doux, Mort, Tard, Vita) with animations
- Fantasy High Forest character with animations

**Environments**
- Sproutlands tilesets (grass, water, hills)
- Space backgrounds (nebulas, stars, multiple layers)

**Objects**
- Furniture, plants, tools (Sproutlands pack)
- Space ships, meteors, bullets (Space Shooter pack)
- Two complete UI packs (regular + sci-fi)

**Fonts**
- Kenney Future (regular + thin variants)
- Kenney Blocks (pixel art font)
- PixelFont Sproutlands

All paths are in `assets-config.ts` so you don't have to hunt around for them.

## Building for production

```bash
npm run build
```

Outputs to the `dist/` folder. Everything gets bundled and minified.

## Adding your own example

1. Create a new file in `src/examples/`, e.g., `11-your-example.ts`
2. Export an async function called `init` + your example name:
   ```typescript
   export async function initYourExample() {
     const root = document.getElementById('canvas-container');
     if (!root) throw new Error('Canvas container not found');

     const { scene, engine } = await setupMoxi({ hostElement: root });

     // Your code here

     scene.init();
     engine.start();
   }
   ```
3. Add it to the registry in `src/index.ts`:
   ```typescript
   // Add the import
   import { initYourExample } from './examples/11-your-example';
   import yourExampleSource from './examples/11-your-example.ts?raw';

   // Add to the examples object
   'your-example': {
     name: '11 - Your Example',
     description: 'What your example does',
     init: initYourExample,
     source: yourExampleSource
   }
   ```
4. Refresh the page - it'll show up in the sidebar with viewable source code

That's it. No webpack config changes, no complex setup, just write code.

## What this shows you

These examples demonstrate:
- **Entity-Component System**: MOXI's core architecture with Logic components
- **Sprite rendering**: Basic sprites, rotation, animation, sprite sheets
- **Text rendering**: BitmapText, styled text, gradients, shadows, performance
- **Text behaviors**: Counters, FPS display, fading, floating numbers, mechanical odometers
- **Camera system**: Following, bounds constraints, smooth movement
- **Tilemap generation**: Procedural tile-based worlds with multiple terrain types
- **Animation**: Frame sequences, sprite sheet animations, synchronized with state
- **State machines**: AI behaviors, character states, clean transitions
- **AI behaviors**: Follow, flee, patrol, wander with detection/radar systems
- **Custom font loading**: TTF fonts, BitmapFont generation, font atlases
- **Multi-layer parallax**: Depth effects with different scroll speeds
- **Physics simulation**: Planck.js integration, collision detection, mouse interaction
- **Input handling**: Keyboard, mouse clicks, mouse dragging, wheel events
- **Interactive viewer**: CodeMirror integration, source code viewing, tab navigation

Each example is meant to be readable and educational. If you see something confusing, that's probably a bug in the example, not you.

## Guides

In-depth guides for specific topics:
- **[Text Rendering Guide](./guides/text-rendering.md)**: Complete guide to PixiJS text rendering (Text, BitmapText, HTMLText) and creating text behaviors with MOXI Logic components. Includes practical patterns for counters, FPS displays, fading text, floating damage numbers, and more.

## Stack

- **Webpack 5** for bundling with hot reload
- **TypeScript 5** with strict mode
- **PixiJS 8** for rendering
- **MOXI** (local build from `../moxijs`)
- **Planck.js** for physics (example 08)
- **CodeMirror 6** for interactive source code viewer
- **Vite's ?raw loader** for bundling source code as strings

Hot reload works in dev mode, so you can edit examples and see changes immediately.
