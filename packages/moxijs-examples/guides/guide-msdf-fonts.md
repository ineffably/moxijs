# Guide: MSDF Fonts for Crisp Text at Any Scale

This guide explains MSDF (Multi-channel Signed Distance Field) fonts - what they are, why you'd use them, and how to prepare and use them in MoxiJS.

## What is MSDF?

MSDF stands for **Multi-channel Signed Distance Field**. It's a technique for rendering vector-quality text using bitmap textures. The same approach is used by Unity's TextMesh Pro.

### How It Works

Instead of storing pixel colors, an MSDF texture stores **distance values** - how far each pixel is from the nearest edge of a glyph. The GPU shader uses these distances to calculate sharp edges at render time.

```
Traditional Bitmap Font:           MSDF Font:
┌─────────────────┐                ┌─────────────────┐
│  ████████       │                │  Gradient data  │
│  █      █       │  Fixed pixels  │  encodes edge   │
│  ████████       │  = Blurry      │  distances      │
│  █      █       │  when scaled   │  = Sharp at     │
│  █      █       │                │    any scale    │
└─────────────────┘                └─────────────────┘
```

The "multi-channel" part means RGB channels store different edge information, allowing sharp corners that single-channel SDF can't achieve.

## When to Use MSDF

### Use MSDF When:
- Text needs to look crisp at multiple sizes
- UI text that may be scaled (zoom, responsive layouts)
- You want Unity TextMesh Pro quality
- Font file size matters (one MSDF texture covers all sizes)
- GPU performance matters (shader-based, very fast)

### Don't Use MSDF When:
- Pixel-perfect retro aesthetic is required (MSDF smooths edges)
- Text is always displayed at one fixed size
- You need rich text styling (gradients, shadows, strokes)

## Comparison: Text Rendering Methods

| Feature | Canvas Text | BitmapText | MSDF Text |
|---------|-------------|------------|-----------|
| Crisp at any scale | No | No | **Yes** |
| Performance | Slow | Fast | Fast |
| Gradients/effects | Yes | No | No |
| Pixel-perfect edges | Yes | Yes | No (smoothed) |
| Memory per size | High | Medium | **Low** |
| Setup required | None | Font install | MSDF generation |

## Preparing MSDF Fonts

### Prerequisites

The MSDF generator uses `msdf-bmfont-xml` which is already installed as a dev dependency.

### Step 1: Generate MSDF Font

Use the provided script:

```bash
cd packages/moxijs-examples

# Basic usage
node scripts/generate-msdf-font.mjs <input-font.ttf> [output-name]

# Examples
node scripts/generate-msdf-font.mjs assets/fonts/pixel_operator/PixelOperator8.ttf PixelOperator8-MSDF
node scripts/generate-msdf-font.mjs assets/fonts/Roboto-Regular.ttf Roboto
```

### Step 2: Output Files

The script generates two files in `assets/fonts/msdf/`:

```
assets/fonts/msdf/
├── PixelOperator8-MSDF.json   # Font metrics (glyph positions, kerning)
└── PixelOperator8-MSDF.png    # MSDF texture atlas
```

The JSON file contains a `distanceField` property that tells PixiJS this is an MSDF font:

```json
{
  "pages": ["PixelOperator8-MSDF.png"],
  "chars": [...],
  "info": {
    "face": "PixelOperator8",
    "size": 48
  },
  "distanceField": {
    "fieldType": "msdf",
    "distanceRange": 4
  }
}
```

### Generator Options

The script uses these defaults (modify `generate-msdf-font.mjs` if needed):

```javascript
{
  format: 'json',        // PixiJS reads JSON format
  fieldType: 'msdf',     // Multi-channel SDF
  fontSize: 48,          // Size in atlas (higher = more detail)
  distanceRange: 4,      // Edge sharpness range
  textureSize: [2048, 2048],  // Max texture dimensions
  padding: 2,            // Glyph padding
  charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 !@#$%^&*()...'
}
```

## Using MSDF Fonts in Code

### Loading the Font

```typescript
import { Assets } from 'pixi.js';

// Load MSDF font (PixiJS auto-detects MSDF from distanceField in JSON)
await Assets.load({
  alias: 'PixelOperator8-MSDF',
  src: 'assets/fonts/msdf/PixelOperator8-MSDF.json'
});
```

### Method 1: Using asMSDFText Helper (Recommended)

```typescript
import { asMSDFText } from '@moxijs/core';

const label = asMSDFText({
  text: 'Hello World!',
  style: {
    fontFamily: 'PixelOperator8',  // Matches "info.face" in JSON
    fontSize: 24
  }
}, { x: 100, y: 50 });

scene.addChild(label);
```

### Method 2: Using PIXI.BitmapText Directly

```typescript
import { BitmapText } from 'pixi.js';

const text = new BitmapText({
  text: 'Score: 1000',
  style: {
    fontFamily: 'PixelOperator8',
    fontSize: 32
  }
});
```

### Method 3: Using UILabel with msdfFontFamily

```typescript
import { UILabel } from '@moxijs/ui';

const label = new UILabel({
  text: 'Settings',
  fontSize: 20,
  color: 0xffffff,
  msdfFontFamily: 'PixelOperator8'  // Enables MSDF rendering
});
```

### Method 4: Using UIButton with msdfFontFamily

```typescript
import { UIButton } from '@moxijs/ui';

const button = new UIButton({
  label: 'Start Game',
  width: 200,
  height: 50,
  msdfFontFamily: 'PixelOperator8'
});
```

## Mixing MSDF Text with Pixel Art Sprites

MSDF requires `antialias: true` for sharp rendering, but pixel art needs `scaleMode: 'nearest'`. Here's how to use both:

```typescript
// Setup with MSDF-friendly settings
const { scene, engine } = await setupMoxi({
  hostElement: root,
  pixelPerfect: false,  // Required for MSDF
  renderOptions: {
    antialias: true,    // MSDF needs smooth filtering
  }
});

// Load pixel art with nearest-neighbor filtering
const pixelTexture = await Assets.load({
  src: 'player.png',
  data: { scaleMode: 'nearest' }  // Pixel-perfect sprites!
});

// Or set it after loading
const texture = Assets.get('player');
texture.source.scaleMode = 'nearest';

// Sprites use roundPixels for crisp positioning
const sprite = new PIXI.Sprite(pixelTexture);
sprite.roundPixels = true;

// MSDF text works alongside pixel sprites
const scoreLabel = asMSDFText({
  text: 'Score: 0',
  style: { fontFamily: 'PixelOperator8', fontSize: 16 }
});
```

**Key insight**: Texture filtering is per-texture, not global. This allows MSDF (linear filtering) and pixel art (nearest filtering) to coexist.

## Best Practices

### 1. Generate at High Resolution

Generate MSDF fonts at 48px or higher for best quality:

```bash
# In generate-msdf-font.mjs, the default is:
'-s', '48',  // Font size in atlas
```

### 2. Include All Needed Characters

Edit the charset in the script if you need additional characters:

```javascript
const CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 !@#$%^&*()...';
```

### 3. Use Consistent Font Family Names

The `fontFamily` in your code must match `info.face` in the JSON file:

```json
// In PixelOperator8-MSDF.json
{
  "info": {
    "face": "PixelOperator8"  // <-- Use this name
  }
}
```

```typescript
// In your code
style: { fontFamily: 'PixelOperator8' }  // <-- Must match
```

### 4. Tinting Works Normally

MSDF text can be tinted like any PixiJS display object:

```typescript
const text = asMSDFText({
  text: 'Warning!',
  style: { fontFamily: 'PixelOperator8', fontSize: 24 }
});
text.tint = 0xff0000;  // Red tint
```

### 5. Dynamic Text Updates

MSDF text updates are fast (no texture regeneration):

```typescript
let score = 0;
const scoreText = asMSDFText({
  text: '0',
  style: { fontFamily: 'PixelOperator8', fontSize: 28 }
});

engine.ticker.add(() => {
  score += 10;
  scoreText.text = score.toString();  // Fast update!
});
```

## Troubleshooting

### Text Looks Blurry

**Cause**: Renderer antialiasing is disabled.

**Fix**: Ensure your setup uses:
```typescript
setupMoxi({
  pixelPerfect: false,
  renderOptions: { antialias: true }
});
```

### Font Not Found Error

**Cause**: Font family name mismatch.

**Fix**: Check the `info.face` value in your MSDF JSON and use that exact name.

### Characters Missing

**Cause**: Characters not included in MSDF generation charset.

**Fix**: Edit `CHAR_SET` in `generate-msdf-font.mjs` and regenerate.

### Text Has Artifacts at Small Sizes

**Cause**: Distance range too small or font size in atlas too low.

**Fix**: Regenerate with higher values:
```javascript
'-s', '64',   // Higher atlas font size
'-r', '6',    // Higher distance range
```

## File Structure

```
packages/moxijs-examples/
├── scripts/
│   └── generate-msdf-font.mjs     # MSDF generation script
├── assets/fonts/
│   ├── msdf/                      # Generated MSDF fonts
│   │   ├── PixelOperator8-MSDF.json
│   │   └── PixelOperator8-MSDF.png
│   └── pixel_operator/            # Source TTF files
│       └── PixelOperator8.ttf
└── src/examples/
    └── 02-ui/
        ├── msdf-text-rendering.ts      # MSDF demo
        └── font-rendering-comparison.ts # Side-by-side comparison
```

## API Reference

### asMSDFText(options, props?)

Creates an MSDF BitmapText instance.

```typescript
interface MSDFTextOptions {
  text?: string | number;
  style?: {
    fontFamily: string;    // MSDF font family name
    fontSize?: number;     // Display size (any value works)
    letterSpacing?: number;
    align?: 'left' | 'center' | 'right';
  };
}

interface PixiProps {
  x?: number;
  y?: number;
  anchor?: number | { x: number; y: number };
  scale?: number | { x: number; y: number };
  alpha?: number;
  rotation?: number;
  // ... other PIXI.BitmapText properties
}
```

### UILabel with msdfFontFamily

```typescript
new UILabel({
  text: 'Label Text',
  fontSize: 16,
  color: 0xffffff,
  msdfFontFamily: 'PixelOperator8'  // Enables MSDF
});
```

### UIButton with msdfFontFamily

```typescript
new UIButton({
  label: 'Button',
  msdfFontFamily: 'PixelOperator8'  // Enables MSDF for button label
});
```

## Summary

MSDF fonts provide:
- **Crisp text at any scale** - No more blurry zoomed text
- **Small file size** - One texture atlas for all sizes
- **GPU efficiency** - Shader-based rendering
- **Easy integration** - Works with PixiJS BitmapText

Trade-offs:
- **Setup required** - Must generate MSDF files from TTF
- **No pixel-perfect edges** - Edges are smoothed (not ideal for retro pixel fonts)
- **Limited styling** - No gradients, shadows, or strokes

Use MSDF for UI text that needs to look sharp at any scale. Use BitmapText for pixel-perfect retro aesthetics.
