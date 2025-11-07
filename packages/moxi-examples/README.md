# Moxi Examples

Interactive examples showcasing the Moxi game engine capabilities.

## 🎯 Structure

```
moxi-examples/
├── src/
│   ├── index.ts              # Main entry point with example selector
│   ├── index.html            # HTML template with styling
│   ├── assets-config.ts      # Centralized asset path configuration
│   └── examples/             # Individual examples
│       ├── 01-basic-sprite.ts
│       ├── 02-rotating-sprite.ts
│       └── 03-camera-follow.ts
├── assets/                   # All game assets (preserved)
├── webpack.config.js         # Webpack configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts

```

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open http://localhost:9000

### Build for Production
```bash
npm run build
```

## 📦 What's New

### ✅ Completed

1. **Unified Build System**
   - Single webpack bundle using local moxi build
   - Hot reload development server
   - Asset copying handled automatically

2. **Simplified Structure**
   - Centralized asset configuration (`assets-config.ts`)
   - Clean example structure in `/src/examples/`
   - No more complex loader logic

3. **Interactive UI**
   - Beautiful sidebar with example selector
   - Live switching between examples
   - No page reloads needed

4. **New Examples**
   - `01-basic-sprite` - Simplest possible example
   - `02-rotating-sprite` - Adding logic to entities
   - `03-camera-follow` - Camera system demo

### 📋 TODO

1. **Update Existing Examples**
   - Migrate bunny-adventure with corrected asset paths
   - Simplify character-state example
   - Update progress-bar example

2. **New Examples to Create**
   - Space shooter using space-sprite-sheets
   - Fantasy platformer using LegacyFantasy assets
   - UI showcase using ui-pack assets
   - Particle effects example
   - State machine example

3. **Asset Corrections**
   - Current examples reference `./assets/sproutlands/` 
   - Actual folder is `./assets/sprout-lands-basic/`
   - All paths now corrected in `assets-config.ts`

## 🎮 Available Assets

### Characters
- Robot (single sprite)
- Sproutlands characters (spritesheet)
- Fantasy High Forest character (multiple animations)
- Chicken & Cow sprites

### Environments
- Grass, Water, Hills tilesets
- Fantasy forest assets
- Space backgrounds (nebulas, stars)

### Objects
- Furniture, Plants, Tools
- Space ships (spritesheet with JSON)
- UI elements (2 complete UI packs)

## 🔧 Key Improvements

1. **No More Boilerplate**
   - Removed 50+ lines of resize handling per example
   - Simplified asset loading
   - Cleaner initialization

2. **Better Organization**
   - Assets centrally managed
   - Examples self-contained
   - TypeScript strict mode enabled

3. **Modern Development**
   - Webpack 5
   - TypeScript 5
   - PIXI.js 8
   - Local moxi build integration

## 📝 Next Steps

Run `npm install` then `npm run dev` to see the examples in action!

For adding new examples:
1. Create a new file in `src/examples/`
2. Export an `init` function
3. Add it to the registry in `src/index.ts`

