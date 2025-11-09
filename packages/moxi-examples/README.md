# MOXI Examples

Working demos that show you what MOXI can do. Each example is self-contained and builds on the previous ones, so you can see how things actually work instead of just reading about it.

## Running the examples

```bash
npm install
npm start
```

Open http://localhost:9000 and click through the examples in the sidebar. No page reloads needed - they switch live.

## What's in here

### 01 - Basic MOXI
The absolute basics. Sets up MOXI, creates an entity, adds it to the scene. If this doesn't make sense, start here.

### 02 - Camera System
Camera that follows a target around. Shows bounds constraints and smooth following. Move the bunny with arrow keys.

### 03 - Bunny Adventure
Full tilemap platformer with animations. Multiple terrain types, character movement, proper collision. Uses the Sproutlands asset pack.

### 04 - State Machines
Character behavior using finite state machines. Idle, walking, jumping states with proper transitions.

### 05 - Font Loading
How to load custom fonts and use them in MOXI. Uses the Kenvector Future font.

### 06 - Parallax Fantasy
Multi-layer parallax scrolling with the Fantasy High Forest assets. Different layers scroll at different speeds for depth.

### 07 - Parallax Space Shooter
Top-down space shooter with parallax starfields. Mouse wheel zooms, arrow keys move the ship.

### 08 - Physics Basic
Physics simulation with Planck.js. Falling boxes, bouncing balls, static ground. Click to spawn more boxes. Press 'P' to see physics debug view.

## Project layout

```
moxi-examples/
├── src/
│   ├── index.ts              # Example selector and loader
│   ├── index.html            # HTML template
│   ├── assets-config.ts      # All asset paths in one place
│   └── examples/             # Individual example files
│       ├── 01-basic-moxi.ts
│       ├── 02-camera-system.ts
│       ├── 03-bunny-adventure.ts
│       ├── 04-state-machines.ts
│       ├── 05-font-loading.ts
│       ├── 06-parallax-fantasy.ts
│       ├── 07-parallax-space-shooter.ts
│       └── 08-physics-basic.ts
├── assets/                   # All the game assets
├── webpack.config.js
└── package.json
```

## Available assets

We've got a bunch of asset packs included:

**Characters**
- Robot sprite
- Sproutlands characters, chicken, cow
- Fantasy High Forest character with animations

**Environments**
- Sproutlands tilesets (grass, water, hills)
- Fantasy forest backgrounds
- Space backgrounds (nebulas, stars)

**Objects**
- Furniture, plants, tools
- Space ships and meteors
- Two complete UI packs

All paths are in `assets-config.ts` so you don't have to hunt around for them.

## Building for production

```bash
npm run build
```

Outputs to the `dist/` folder. Everything gets bundled and minified.

## Adding your own example

1. Create a new file in `src/examples/` - call it whatever
2. Export an async function called `init` + your example name:
   ```typescript
   export async function initYourExample() {
     // Your code here
   }
   ```
3. Add it to the registry in `src/index.ts`
4. Refresh the page - it'll show up in the sidebar

That's it. No webpack config changes, no build setup, just write code.

## What this shows you

These examples demonstrate:
- Entity-Component System basics
- Camera system with following and bounds
- Tilemap generation and rendering
- Sprite animation and frame sequences
- State machines for game logic
- Custom font loading
- Multi-layer parallax scrolling
- Physics simulation with collision detection
- Input handling (keyboard, mouse, wheel)

Each one is meant to be readable. If you see something confusing, that's probably a bug in the example, not you.

## Stack

- Webpack 5 for bundling
- TypeScript 5 with strict mode
- PixiJS 8 for rendering
- Local moxi build (from `../moxi`)
- Planck.js for physics (example 08)

Hot reload works in dev mode, so you can edit examples and see changes immediately.
