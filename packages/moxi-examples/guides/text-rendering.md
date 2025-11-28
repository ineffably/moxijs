# Text Rendering in PixiJS: A Comprehensive Guide

This guide covers the three main text rendering methods in PixiJS v8 and when to use each one.

## Overview

PixiJS v8 provides three distinct text rendering systems:

| Method | Performance | Styling | Best For |
|--------|-------------|---------|----------|
| **Text** | Moderate | Rich | Dynamic content with style variety |
| **BitmapText** | Fast | Limited | High-volume, performance-critical text |
| **HTMLText** | Slower | Complex | HTML markup, formatted documents |

---

## 1. Text: Rich Dynamic Text

### How It Works
The `Text` class uses the browser's native text engine to render text to a texture. This provides maximum flexibility for styling but comes with a performance cost when text changes frequently.

### Code Example

```typescript
import { Text } from 'pixi.js';

// Basic text
const basicText = new Text({
  text: 'Hello World',
  style: {
    fontSize: 32,
    fill: 0xffffff
  }
});

// Rich styled text
const styledText = new Text({
  text: 'Styled Text',
  style: {
    fontFamily: 'Arial',
    fontSize: 48,
    fontWeight: 'bold',
    fill: 0xff6b35,
    stroke: { color: 0x000000, width: 4 },
    dropShadow: {
      alpha: 0.8,
      angle: Math.PI / 4,
      blur: 4,
      color: 0x000000,
      distance: 5
    }
  },
  resolution: 2  // Higher resolution for crisp rendering
});

// Gradient text
const gradientText = new Text({
  text: 'Gradient',
  style: {
    fontSize: 36,
    fill: ['#ff00ff', '#00ffff']  // Gradient from magenta to cyan
  }
});
```

### Styling Options

**Typography:**
- `fontFamily`: Font name (e.g., 'Arial', 'Georgia')
- `fontSize`: Size in pixels
- `fontStyle`: 'normal', 'italic', 'oblique'
- `fontWeight`: 'normal', 'bold', '100'-'900'

**Colors & Effects:**
- `fill`: Color (hex) or gradient array
- `stroke`: Object with `color` and `width`
- `dropShadow`: Object with `color`, `blur`, `angle`, `distance`, `alpha`

**Layout:**
- `align`: 'left', 'center', 'right'
- `wordWrap`: Enable word wrapping (boolean)
- `wordWrapWidth`: Max width before wrapping
- `lineHeight`: Spacing between lines
- `padding`: Extra space around text

### Resolution and Quality

**Critical for crisp text:**
```typescript
const text = new Text({
  text: 'Crisp Text',
  style: { fontSize: 24 },
  resolution: 2  // 2x resolution for high DPI displays
});

// For camera-scaled scenes, match camera zoom:
resolution: 3  // If camera scale is 3x
```

**Rule of thumb:** Set `resolution` to match your camera scale or device pixel ratio for optimal clarity.

### When to Use Text

✅ **Good for:**
- UI labels and buttons that change occasionally
- Title screens and menus
- Narrative/story text
- When you need rich styling (shadows, strokes, gradients)
- Small to moderate amounts of text (< 100 instances)

❌ **Avoid for:**
- Text that updates every frame (FPS counters, timers)
- Hundreds of simultaneous text instances
- Performance-critical mobile applications

### Performance Tips

1. **Reuse text objects** instead of creating new ones
2. **Cache static text** - don't update if value hasn't changed
3. **Use texture caching** for repeated text values
4. **Batch similar styled text** together

---

## 2. BitmapText: High-Performance Text

### How It Works
BitmapText uses pre-rendered bitmap font atlases, bypassing the browser's text engine entirely. This makes it extremely fast but requires preparing font files ahead of time.

### Setting Up Bitmap Fonts

**Option 1: Using existing bitmap fonts**
```typescript
import { BitmapText, Assets } from 'pixi.js';

// Load bitmap font (typically .fnt + .png)
await Assets.load('path/to/font.fnt');

// Create bitmap text
const bitmapText = new BitmapText({
  text: 'Fast Text!',
  style: {
    fontFamily: 'Desyrel',  // Name from .fnt file
    fontSize: 55,
    tint: 0xff6b35  // Color tinting
  }
});
```

**Option 2: Generating bitmap fonts**

Tools for creating bitmap fonts:
- [BMFont (Windows)](https://www.angelcode.com/products/bmfont/)
- [Hiero (Cross-platform)](https://github.com/libgdx/libgdx/wiki/Hiero)
- [msdf-bmfont-xml (CLI)](https://github.com/soimy/msdf-bmfont-xml)

### Code Example

```typescript
import { BitmapText, Assets } from 'pixi.js';

// Load multiple bitmap fonts
await Assets.load([
  'fonts/arial-32.fnt',
  'fonts/digital-clock.fnt'
]);

// Scores and counters
const scoreText = new BitmapText({
  text: '0',
  style: {
    fontFamily: 'digital-clock',
    fontSize: 48,
    tint: 0x00ff00
  }
});

// Update frequently without performance hit
gameLoop(() => {
  scoreText.text = score.toString();  // Very fast!
});

// Multiple instances
for (let i = 0; i < 1000; i++) {
  const label = new BitmapText({
    text: 'Label ' + i,
    style: { fontFamily: 'arial-32', fontSize: 24 }
  });
  container.addChild(label);
}
```

### Styling Options (Limited)

BitmapText supports:
- `fontSize`: Scale the base font size
- `tint`: Apply color overlay (single color only)
- `align`: Text alignment
- `letterSpacing`: Space between characters
- `maxWidth`: Maximum width before wrapping

**No support for:**
- Gradients
- Drop shadows
- Stroke/outline (must be baked into font)
- Dynamic font styles

### When to Use BitmapText

✅ **Perfect for:**
- FPS counters and performance metrics
- Score displays that update every frame
- Chat messages and logs (hundreds of lines)
- Retro/pixel art games
- Mobile games (better performance)
- Any scenario with 100+ text instances

❌ **Not ideal for:**
- Rich formatted text
- Dynamic font styling
- Small amounts of text where setup overhead isn't worth it
- When you need gradients or complex effects

### Performance Benefits

**Benchmark example:**
```
Text (100 instances, updated every frame):     ~45 FPS
BitmapText (100 instances, updated every frame): ~60 FPS

Text (1000 instances):    ~15 FPS
BitmapText (1000 instances): ~58 FPS
```

### Pixel-Perfect BitmapText Rendering

For retro-style games and pixel art UIs, you need **pixel-perfect rendering** to avoid blurry text. This requires specific configuration at three levels: renderer, canvas, and font installation.

#### Why Pixel-Perfect Rendering Matters

Without proper configuration, bitmap text can appear blurry due to:
1. **Anti-aliasing** - Smooths edges, creating blur
2. **Subpixel positioning** - Positions text between pixels
3. **Browser scaling** - Default bilinear filtering creates blur when scaling

**Blurry vs Crisp:**
```
❌ Blurry: Default rendering with antialiasing
✅ Crisp: Pixel-perfect with nearest-neighbor scaling
```

#### Step 1: Configure Renderer

Set up the renderer for pixel-perfect rendering:

```typescript
const { scene, engine, renderer } = await setupMoxi({
  hostElement: root,
  renderOptions: {
    width: 1280,
    height: 720,
    backgroundColor: 0x1a1a2e,
    resolution: 1,        // CRITICAL: No upscaling
    antialias: false,     // CRITICAL: Disable anti-aliasing
    roundPixels: true     // CRITICAL: Round all positions
  }
});
```

**Key settings:**
- `resolution: 1` - Prevents texture upscaling
- `antialias: false` - Disables smoothing
- `roundPixels: true` - Snaps positions to whole pixels

#### Step 2: Configure Canvas CSS

Tell the browser to use nearest-neighbor scaling:

```typescript
const canvas = renderer.canvas as HTMLCanvasElement;
canvas.style.imageRendering = 'pixelated';
canvas.style.imageRendering = '-moz-crisp-edges';  // Firefox
canvas.style.imageRendering = 'crisp-edges';        // Others
```

This prevents the browser from applying bilinear filtering when the canvas is displayed.

#### Step 3: Install Bitmap Font

Use `BitmapFont.install()` to generate bitmap fonts from TTF at specific sizes:

```typescript
import { Assets, BitmapFont } from 'pixi.js';

// Load the TTF font first
await Assets.load('fonts/PixelOperator8.ttf');

// Install bitmap font for pixel-perfect rendering
BitmapFont.install({
  name: 'PixelOperator8Bitmap',
  style: {
    fontFamily: 'PixelOperator8',
    fontSize: 16,           // Base size (will be scaled by 3x in UI)
    fill: 0xffffff,
  }
});
```

**Important:** The `fontSize` in `BitmapFont.install()` is the base size used to generate the texture. You can scale it when creating text.

#### Step 4: Create Pixel-Perfect Text

Create bitmap text using the installed font:

```typescript
const pixelText = new BitmapText({
  text: 'PIXEL PERFECT',
  style: {
    fontFamily: 'PixelOperator8Bitmap',
    fontSize: 48,        // 3x scale of base 16px
    fill: 0x00ff00
  }
});
```

#### Using with MOXI's asBitmapText Helper

MOXI provides a `pixelPerfect` flag for convenience:

```typescript
import { asBitmapText } from 'moxi-kit';

const label = asBitmapText(
  {
    text: 'CRISP TEXT',
    style: {
      fontFamily: 'PixelOperator8Bitmap',
      fontSize: 24,
      fill: 0xffffff
    },
    pixelPerfect: true  // Enables roundPixels automatically
  },
  { x: 100, y: 50, anchor: 0.5 }
);
```

The `pixelPerfect: true` flag automatically sets `roundPixels` on the BitmapText instance.

#### Grid-Based UI System

For pixel-perfect UIs, use a consistent grid system:

```typescript
export const GRID = {
  unit: 1,        // Base pixel unit at 1x scale
  scale: 3,       // Scale everything by 3x for visibility
  border: 1,      // Border width in grid units (3px at 3x)
  padding: 2,     // Standard padding (6px at 3x)
  gap: 1,         // Gap between elements (3px at 3x)
};

// Helper to convert grid units to pixels
export const px = (units: number) => units * GRID.unit * GRID.scale;

// Usage:
const titleText = new BitmapText({
  text: 'HP: 250/300',
  style: {
    fontFamily: 'PixelOperator8Bitmap',
    fontSize: px(3),  // 3 grid units = 9px
    fill: 0xff4444
  }
});
titleText.position.set(px(2), px(1)); // Position on grid
```

#### Complete Pixel-Perfect Setup

Here's a complete example combining all steps:

```typescript
import { setupMoxi, asBitmapText } from 'moxi-kit';
import { Assets, BitmapFont } from 'pixi.js';

async function initPixelPerfectUI() {
  // Step 1: Configure renderer
  const { scene, engine, renderer } = await setupMoxi({
    hostElement: document.getElementById('app')!,
    renderOptions: {
      width: 1280,
      height: 720,
      backgroundColor: 0x1a1a2e,
      resolution: 1,
      antialias: false,
      roundPixels: true
    }
  });

  // Step 2: Configure canvas
  const canvas = renderer.canvas as HTMLCanvasElement;
  canvas.style.imageRendering = 'pixelated';
  canvas.style.imageRendering = '-moz-crisp-edges';
  canvas.style.imageRendering = 'crisp-edges';

  // Step 3: Load and install bitmap font
  await Assets.load('fonts/PixelOperator8.ttf');
  BitmapFont.install({
    name: 'PixelOperator8Bitmap',
    style: {
      fontFamily: 'PixelOperator8',
      fontSize: 16,
      fill: 0xffffff,
    }
  });

  // Step 4: Create pixel-perfect UI
  const title = asBitmapText(
    {
      text: 'PIXEL PERFECT GAME',
      style: {
        fontFamily: 'PixelOperator8Bitmap',
        fontSize: 48,
        fill: 0x00ff00
      },
      pixelPerfect: true
    },
    { x: 640, y: 20, anchor: 0.5 }
  );
  scene.addChild(title);

  const hpLabel = asBitmapText(
    {
      text: 'HP: 250/300',
      style: {
        fontFamily: 'PixelOperator8Bitmap',
        fontSize: 24,
        fill: 0xff4444
      },
      pixelPerfect: true
    },
    { x: 20, y: 20 }
  );
  scene.addChild(hpLabel);

  scene.init();
  engine.start();
}
```

#### Scaling Guidelines

**Font size relationships for pixel-perfect rendering:**
```typescript
// Base font generated at 16px
BitmapFont.install({
  name: 'PixelFont',
  style: { fontSize: 16 }
});

// Text at different scales:
fontSize: 16  // 1x scale (original size)
fontSize: 32  // 2x scale (double size)
fontSize: 48  // 3x scale (triple size)
fontSize: 64  // 4x scale (quadruple size)
```

**Rule:** Always use multiples of the base size to maintain pixel-perfect alignment.

#### Common Pitfalls

**❌ Pitfall 1: Forgetting roundPixels**
```typescript
// Will be blurry even with correct renderer settings
const text = new BitmapText({ text: 'Blurry' });
text.position.set(100.5, 50.3); // Subpixel position!
```

**✅ Solution: Enable roundPixels**
```typescript
text.roundPixels = true; // Or use pixelPerfect: true in asBitmapText
```

**❌ Pitfall 2: Non-integer font sizes**
```typescript
// Breaks pixel alignment
fontSize: 23.5  // Not a clean multiple
```

**✅ Solution: Use multiples of base size**
```typescript
fontSize: 24  // Clean 1.5x multiple of 16px base
```

**❌ Pitfall 3: Missing canvas CSS**
```typescript
// Renderer is configured but canvas still applies bilinear filtering
```

**✅ Solution: Always set imageRendering**
```typescript
canvas.style.imageRendering = 'pixelated';
```

#### Visual Comparison

**Example from text-rendering demo (Example 10):**

The demo showcases pixel-perfect text at multiple scales:
```typescript
// 1x scale (16px)
'PIXEL PERFECT 1x' - Green, sharp edges

// 2x scale (32px)
'PIXEL PERFECT 2x' - Orange, crisp scaling

// Retro game UI example
HP: 250/300  (red, 24px)
MP: 80/100   (blue, 24px)
LV: 42       (orange, 24px)
```

All text maintains perfectly crisp edges with no anti-aliasing blur.

#### When to Use Pixel-Perfect Rendering

✅ **Perfect for:**
- Retro/pixel art games
- 8-bit/16-bit style UIs
- Pixel art fonts
- Grid-based interfaces
- Games with intentional low-resolution aesthetic

❌ **Not ideal for:**
- Modern smooth UIs
- High-resolution photorealistic games
- When you need anti-aliased text
- Mixed-resolution interfaces

#### Performance Notes

Pixel-perfect rendering actually **improves performance**:
- Simpler rendering (no anti-aliasing)
- Smaller textures (lower resolution fonts)
- Faster blitting (nearest-neighbor vs bilinear)
- Better for mobile devices

#### Advanced Technique: Supersampling for Ultra-Crisp Text

For the **crispest possible pixel font rendering**, use this supersampling technique discovered during the sprite editor development:

**The Problem:** Even with pixel-perfect settings, fonts can look slightly soft or lose detail when scaled.

**The Solution:** Install the BitmapFont at 4x the desired display size, then scale down:

```typescript
// Install bitmap font at 4x the target size (64px for 16px display)
PIXI.BitmapFont.install({
  name: 'PixelOperator8Bitmap',
  style: {
    fontFamily: 'PixelOperator8',
    fontSize: 64,  // 4x supersampling
    fill: 0xffffff,
  }
});

// Create text and scale down to target size
const text = new PIXI.BitmapText({
  text: 'Super Crisp!',
  style: {
    fontFamily: 'PixelOperator8Bitmap',
    fontSize: 64,
  }
});
text.roundPixels = true;
text.scale.set(0.25);  // Scale 64px down to 16px
```

**Why this works:**
1. Font rasterizes at high resolution (64px) with clean pixel boundaries
2. Downscaling with nearest-neighbor filtering (from `imageRendering: 'pixelated'`) preserves sharp edges
3. Result is significantly crisper than rendering directly at 16px
4. Works especially well for pixel fonts like PixelOperator8, Minecraft, Dogica Pixel, etc.

**Recommendations:**
- Use 2x-4x supersampling (32px-64px for 8px-16px display)
- Store scale factor in a constant for dynamic UI scaling
- Essential for pixel fonts that need to scale with UI elements
- Test with different pixel fonts to find optimal supersampling ratio

**Dynamic Font Scaling Example:**
```typescript
// Store font scale in a shared constant
export const GRID = {
  scale: 4,
  fontScale: 0.25  // 64px * 0.25 = 16px
};

// Use in text creation
const text = new PIXI.BitmapText({
  text: 'Scales with UI',
  style: {
    fontFamily: 'PixelOperator8Bitmap',
    fontSize: 64,
  }
});
text.scale.set(GRID.fontScale);

// Adjust font scale when resizing UI
function onResize(newHeight) {
  // Scale font proportionally with UI
  GRID.fontScale = Math.max(0.1, Math.min(0.5, 0.25 * (newHeight / 12)));
  // Redraw text with new scale...
}
```

This technique was battle-tested in the sprite editor (Example 17) and produces noticeably sharper text than direct rendering.

---

## 3. HTMLText: Formatted Markup

### How It Works
HTMLText renders actual HTML markup inside your PixiJS scene, supporting tags like `<b>`, `<i>`, `<img>`, and more.

### Code Example

```typescript
import { HTMLText } from 'pixi.js';

const htmlText = new HTMLText({
  text: `
    <h1>Title</h1>
    <p>This is <b>bold</b> and <i>italic</i> text.</p>
    <p>You can use <span style="color: red;">colored text</span>.</p>
    <ul>
      <li>List item 1</li>
      <li>List item 2</li>
    </ul>
  `,
  style: {
    fontSize: 16,
    fontFamily: 'Arial'
  }
});
```

### Supported Tags

- `<b>`, `<strong>`: Bold text
- `<i>`, `<em>`: Italic text
- `<u>`: Underline
- `<span>`: Inline styling with `style` attribute
- `<h1>` - `<h6>`: Headers
- `<p>`: Paragraphs
- `<br>`: Line breaks
- `<ul>`, `<ol>`, `<li>`: Lists
- `<img>`: Inline images

### When to Use HTMLText

✅ **Good for:**
- Story/dialogue boxes with rich formatting
- Help text and tutorials
- Narrative content
- Document-like layouts
- Emoji and special characters
- Right-to-left (RTL) text

❌ **Avoid for:**
- Performance-critical rendering
- Hundreds of instances
- Frequently updating text
- When Text class styling is sufficient

---

## Decision Tree: Which Method to Use?

```
Do you need to update text every frame?
├─ YES → BitmapText
└─ NO
   ├─ Do you need HTML markup/complex formatting?
   │  ├─ YES → HTMLText
   │  └─ NO → Text
   └─ Do you have 100+ text instances?
      ├─ YES → BitmapText
      └─ NO → Text
```

---

## Common Use Cases

### Scenario 1: Game UI

**HUD Elements (Score, Health, Timer):**
```typescript
// Use BitmapText for frequently updating values
const scoreText = new BitmapText({
  text: '0',
  style: { fontFamily: 'digital', fontSize: 32 }
});

// Use Text for static labels
const scoreLabel = new Text({
  text: 'SCORE:',
  style: { fontSize: 24, fill: 0xffffff },
  resolution: 2
});
```

### Scenario 2: Mechanical Odometer Counter (Like Example 10)

A mechanical odometer counter creates a scrolling digit effect like vintage car odometers or slot machines. This is more complex than a simple counter and requires careful consideration of scroll direction.

#### Key Requirements:
1. **Unidirectional scrolling**: When counting UP, always scroll in ONE direction (no backward jumps)
2. **Visual downward movement**: Numbers should appear to move DOWN when counting UP
3. **Seamless wrapping**: Transition from 9→0 should continue forward, not jump backward

#### Implementation Strategy:

**Step 1: Digit Strip with Duplication**
```typescript
// Render digits 0-9 TWICE for seamless wrapping: 0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9
for (let i = 0; i < 20; i++) {
  const displayDigit = i % 10; // Creates: 0,1,2,3...9,0,1,2,3...9
  const digitText = new BitmapText({
    text: displayDigit.toString(),
    style: { fontFamily: 'MyFont', fontSize: 64 }
  });
  digitText.anchor.y = 0.5; // Center vertically in slot
  digitText.y = i * digitHeight + digitHeight / 2;
  scrollContainer.addChild(digitText);
}
```

**Step 2: Mask for Viewing Window**
```typescript
const mask = new Graphics();
mask.rect(0, 0, 45, 64); // Shows only one digit at a time
mask.fill(0xffffff);
scrollContainer.mask = mask;
```

**Step 3: Scroll Logic (CRITICAL)**
```typescript
// Map digit value to position
let targetPos = digitValue;
const normalTargetY = -targetPos * digitHeight;

// CRITICAL: Detect ANY backward scroll and use second occurrence instead
// This handles: 9→0 wrapping, fast counting (8→0), and all edge cases
if (normalTargetY > slot.currentY) {
  targetPos = digitValue + 10; // Use second occurrence (positions 10-19)
}

slot.targetY = -targetPos * digitHeight;
```

**Step 4: Snap-back After Wrap**
```typescript
// After reaching position 10 (second "0"), snap back to position 0
if (Math.abs(slot.currentY - (-10 * digitHeight)) < 1) {
  slot.currentY = 0;
  slot.targetY = 0;
}
```

#### Common Pitfalls:

**❌ Pitfall #1: Only checking for 9→0 transition**
```typescript
// BAD: Misses edge cases when counting fast
if (digitValue === 0 && currentDisplayedDigit === 9) {
  targetPos = 10;
}
```
**Problem**: When incrementing rapidly (e.g., +1234 per frame), you might skip from 8→0 or 7→0, missing digit 9 entirely. This causes backward scrolling.

**✅ Solution: Check if ANY target would scroll backward**
```typescript
// GOOD: Handles all cases including skipped digits
if (normalTargetY > slot.currentY) {
  targetPos = digitValue + 10;
}
```

**❌ Pitfall #2: Reversing digit order**
```typescript
// BAD: Renders 9,8,7,6,5,4,3,2,1,0...
const displayDigit = 9 - (i % 10);
```
**Problem**: This creates a situation where counting 0→1→2 requires scrolling backward in positions.

**✅ Solution: Use normal order**
```typescript
// GOOD: Renders 0,1,2,3,4,5,6,7,8,9...
const displayDigit = i % 10;
```

**❌ Pitfall #3: Using positive scroll for downward visual movement**
```typescript
// BAD: Positive y moves container down, hiding digits below mask
slot.targetY = targetPos * digitHeight; // Positive values
```
**Problem**: Mask is fixed at y=0-64. Moving container down (positive y) moves digits out of view.

**✅ Solution: Use negative scroll (move container UP to reveal digits below)**
```typescript
// GOOD: Negative y moves container up, revealing digits positioned below
slot.targetY = -targetPos * digitHeight; // Negative values
```

#### How It Works:

**Scroll Direction Explanation:**
- Digits are positioned at y = 32, 96, 160, 224, ... (below each other)
- Mask shows parent y from 0 to 64 (fixed window)
- To show digit at position N: `scrollY = -N * digitHeight`
- More negative scrollY = scroll container UP = reveals digits from below
- Visually appears as downward movement of numbers

**Example Scroll Values:**
- Digit 0 (position 0): scrollY = 0
- Digit 1 (position 1): scrollY = -64
- Digit 2 (position 2): scrollY = -128
- ...
- Digit 9 (position 9): scrollY = -576
- Digit 0 (position 10, second occurrence): scrollY = -640
- **All transitions go more negative** = unidirectional scroll ✓

#### Complete Working Example:
See `examples/10-text-rendering.ts` (lines 144-245) for full implementation with smooth lerp animation.

### Scenario 3: Chat System

```typescript
// Use BitmapText for chat messages (many instances)
const chatMessages = [];

function addChatMessage(message: string) {
  const text = new BitmapText({
    text: message,
    style: { fontFamily: 'chat-font', fontSize: 16 }
  });
  text.y = chatMessages.length * 20;
  chatMessages.push(text);
  chatContainer.addChild(text);
}

// Efficient even with hundreds of messages
```

### Scenario 4: Story Dialog

```typescript
// Use HTMLText for rich narrative content
const dialog = new HTMLText({
  text: `
    <h2>Chapter 1</h2>
    <p><b>Hero:</b> "What happened here?"</p>
    <p><i>The old wizard sighs deeply...</i></p>
  `,
  style: { fontSize: 18 }
});
```

---

## Best Practices

### 1. Resolution Management

**Always set resolution for scaled scenes:**
```typescript
// If your camera scales by 3x
const text = new Text({
  text: 'Example',
  style: { fontSize: 24 },
  resolution: 3  // Prevents blurriness
});
```

### 2. Text Updates

**Batch text updates:**
```typescript
// ❌ Bad: Update in tight loop
for (let i = 0; i < items.length; i++) {
  labels[i].text = items[i].name;  // Triggers texture regeneration each time
}

// ✅ Good: Update only changed text
items.forEach((item, i) => {
  if (labels[i].text !== item.name) {
    labels[i].text = item.name;
  }
});
```

### 3. Memory Management

**Destroy unused text:**
```typescript
// Clean up text objects when done
text.destroy({ texture: true, baseTexture: true });
```

### 4. Font Loading

**Preload fonts before use:**
```typescript
// Load all fonts during initialization
await Assets.load([
  'fonts/arial.ttf',
  'fonts/bitmap-font.fnt'
]);

// Then create text objects
```

### 5. Padding for Effects

**Add padding when using strokes/shadows:**
```typescript
const text = new Text({
  text: 'Shadow Text',
  style: {
    fontSize: 32,
    dropShadow: { distance: 5, blur: 4 },
    padding: 10  // Prevents clipping of shadow
  }
});
```

---

## Performance Comparison

### Rendering Cost (Lower is better)

| Operation | Text | BitmapText | HTMLText |
|-----------|------|------------|----------|
| Initial creation | Medium | Low | High |
| Update text | High | Very Low | High |
| 100 instances | Medium | Low | High |
| 1000 instances | High | Medium | Very High |
| Style changes | High | N/A | Medium |

### Memory Usage

- **Text**: Medium (texture per unique text + style)
- **BitmapText**: Low (shared texture atlas)
- **HTMLText**: High (DOM elements + textures)

---

## Migration Tips

### From Text to BitmapText

**Before:**
```typescript
const text = new Text({
  text: counter.toString(),
  style: { fontSize: 32, fill: 0xffffff }
});
```

**After:**
```typescript
// 1. Generate bitmap font from your desired font
// 2. Load the bitmap font
await Assets.load('fonts/counter.fnt');

// 3. Replace with BitmapText
const text = new BitmapText({
  text: counter.toString(),
  style: { fontFamily: 'counter', fontSize: 32 }
});
```

---

## Troubleshooting

### Blurry Text
**Problem:** Text appears blurry when scene is scaled

**Solution:** Set resolution to match scale
```typescript
resolution: cameraScale  // e.g., 3 for 3x zoom
```

### Text Clipping
**Problem:** Stroke or shadow gets cut off

**Solution:** Add padding
```typescript
style: {
  stroke: { color: 0x000000, width: 4 },
  padding: 10
}
```

### BitmapText Not Showing
**Problem:** BitmapText is invisible

**Solution:** Ensure font is loaded and name matches
```typescript
// Check font name in .fnt file
await Assets.load('font.fnt');
// Use exact name from file
fontFamily: 'ExactFontName'
```

### Poor Performance
**Problem:** FPS drops with many text objects

**Solution:** Switch to BitmapText for dynamic text
```typescript
// If updating frequently: use BitmapText
// If mostly static: use Text with proper resolution
```

---

## Text Behaviors with MOXI Logic

MOXI's entity-component architecture provides an elegant way to encapsulate text animations and behaviors. By extending the `Logic<T>` class, you can create reusable components that update text in response to game state, time, or user input.

### Core Concept: Logic Components

The `Logic<T>` base class provides two key lifecycle methods:
- `init(entity?, renderer?, ...args)`: Called once when entity is initialized
- `update(entity?, deltaTime?)`: Called every frame with delta time in seconds

**Basic Pattern:**
```typescript
import { Logic } from 'moxi-kit';
import { BitmapText } from 'pixi.js';

class MyTextLogic extends Logic<BitmapText> {
  private text: BitmapText;

  constructor(text: BitmapText) {
    super();
    this.text = text;
  }

  update(entity?: BitmapText, deltaTime?: number): void {
    if (!deltaTime) return;
    // Update text behavior here
  }
}
```

### Pattern 1: Counter Logic

Create an incrementing counter that updates text every frame:

```typescript
class CounterLogic extends Logic<PIXI.BitmapText> {
  private currentValue = 0;
  private incrementSpeed: number;
  private text: PIXI.BitmapText;

  constructor(text: PIXI.BitmapText, incrementSpeed: number) {
    super();
    this.text = text;
    this.incrementSpeed = incrementSpeed;
  }

  update(entity?: PIXI.BitmapText, deltaTime?: number): void {
    if (!deltaTime) return;
    this.currentValue += this.incrementSpeed;
    this.text.text = this.currentValue.toString();
  }
}

// Usage:
const counter = new PIXI.BitmapText({
  text: '0',
  style: { fontFamily: 'MyFont', fontSize: 32 }
});

const counterEntity = asEntity(counter);
counterEntity.moxiEntity.addLogic(new CounterLogic(counter, 1234));
scene.addChild(counterEntity);

// Update in game loop:
engine.ticker.add((ticker) => {
  const deltaTime = ticker.deltaTime / 60; // Convert to seconds
  counterEntity.moxiEntity.update(deltaTime);
});
```

**Key Insights:**
- Store both the text reference and state (currentValue) in the Logic component
- `deltaTime` is frame-independent time, but for frame-locked behavior (like counters), you can ignore it
- Use BitmapText for frequently updating counters (better performance)

### Pattern 2: FPS Counter Logic

Calculate and display real-time performance metrics:

```typescript
class FPSCounterLogic extends Logic<PIXI.BitmapText> {
  private text: PIXI.BitmapText;
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;

  constructor(text: PIXI.BitmapText) {
    super();
    this.text = text;
  }

  init(entity?: PIXI.BitmapText, renderer?: PIXI.Renderer, ...args: any[]): void {
    // Initialize timestamp on first frame
    this.lastTime = performance.now();
  }

  update(entity?: PIXI.BitmapText, deltaTime?: number): void {
    this.frameCount++;
    const currentTime = performance.now();
    const delta = currentTime - this.lastTime;

    // Update FPS once per second
    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.text.text = `FPS: ${this.fps}`;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }
}

// Usage:
const fpsCounter = new PIXI.BitmapText({
  text: 'FPS: 60',
  style: { fontFamily: 'MyFont', fontSize: 24 }
});
fpsCounter.anchor.set(1, 0); // Top-right anchor
fpsCounter.position.set(1260, 20);

const fpsEntity = asEntity(fpsCounter);
fpsEntity.moxiEntity.addLogic(new FPSCounterLogic(fpsCounter));
```

**Techniques:**
- Use `performance.now()` for accurate timing
- Calculate average FPS over a window (1 second) instead of per-frame
- Initialize state in `init()` method when you need renderer context

### Pattern 3: Animated Tint Logic

Cycle through HSL colors for rainbow effects:

```typescript
class AnimatedTintLogic extends Logic<PIXI.Text> {
  private hue = 0;
  private text: PIXI.Text;

  constructor(text: PIXI.Text) {
    super();
    this.text = text;
  }

  update(entity?: PIXI.Text, deltaTime?: number): void {
    if (!deltaTime) return;
    this.hue = (this.hue + 1) % 360;
    this.text.tint = this.hslToHex(this.hue, 100, 50);
  }

  private hslToHex(h: number, s: number, l: number): number {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color);
    };
    return (f(0) << 16) | (f(8) << 8) | f(4);
  }
}

// Usage:
const animatedText = new PIXI.Text({
  text: 'RAINBOW',
  style: { fontSize: 36, fill: 0xffffff }
});

const animatedEntity = asEntity(animatedText);
animatedEntity.moxiEntity.addLogic(new AnimatedTintLogic(animatedText));
```

**Techniques:**
- Store animation state (hue) in the Logic component
- Use `.tint` for efficient color changes (no texture regeneration)
- Modulo operator (`%`) for smooth looping animations

### Pattern 4: Fading Text Logic

Create text that fades out over time with a trigger mechanism:

```typescript
class FadingTextLogic extends Logic<PIXI.BitmapText> {
  private text: PIXI.BitmapText;
  private lifetime = 0;
  private maxLifetime = 0;
  private fadeStartPercent = 0.5; // Start fading at 50% of lifetime

  constructor(text: PIXI.BitmapText) {
    super();
    this.text = text;
  }

  /**
   * Trigger a new fade cycle
   */
  trigger(maxLifetime: number) {
    this.lifetime = 0;
    this.maxLifetime = maxLifetime;
    this.text.alpha = 1; // Reset to fully visible
  }

  update(entity?: PIXI.BitmapText, deltaTime?: number): void {
    if (!deltaTime || this.text.alpha === 0) return;

    this.lifetime += deltaTime;
    const fadeStart = this.maxLifetime * this.fadeStartPercent;

    // Start fading after fadeStart threshold
    if (this.lifetime > fadeStart) {
      const fadeProgress = (this.lifetime - fadeStart) / (this.maxLifetime - fadeStart);
      this.text.alpha = Math.max(0, 1 - fadeProgress);
    }

    // Fully fade out at max lifetime
    if (this.lifetime >= this.maxLifetime) {
      this.text.alpha = 0;
    }
  }
}

// Usage:
const actionLabel = new PIXI.BitmapText({
  text: 'CRITICAL!',
  style: { fontFamily: 'MyFont', fontSize: 24 }
});
actionLabel.alpha = 0; // Start invisible

const labelEntity = asEntity(actionLabel);
const fadeLogic = new FadingTextLogic(actionLabel);
labelEntity.moxiEntity.addLogic(fadeLogic);

// Trigger fade when needed
character.on('attack', () => {
  actionLabel.text = 'ATTACK!';
  fadeLogic.trigger(1.5); // Fade over 1.5 seconds
});
```

**Techniques:**
- Use `trigger()` method to restart animations
- Track normalized progress with `fadeProgress` (0 to 1)
- Early return when `alpha === 0` to skip unnecessary calculations
- Configurable `fadeStartPercent` allows fade to start partway through lifetime

### Pattern 5: Floating Damage Numbers

Create floating numbers that move upward and fade out:

```typescript
class FloatingNumberLogic extends Logic<PIXI.BitmapText> {
  private text: PIXI.BitmapText;
  private velocity: { x: number; y: number };
  private lifetime = 0;
  private maxLifetime: number;
  private fadeStart: number;
  private isCritical: boolean;
  private onDestroy?: () => void;

  constructor(
    text: PIXI.BitmapText,
    velocity: { x: number; y: number },
    maxLifetime: number,
    isCritical: boolean,
    onDestroy?: () => void
  ) {
    super();
    this.text = text;
    this.velocity = velocity;
    this.maxLifetime = maxLifetime;
    this.isCritical = isCritical;
    this.fadeStart = maxLifetime * 0.3; // Start fading at 30% of lifetime
    this.onDestroy = onDestroy;
  }

  update(entity?: PIXI.BitmapText, deltaTime?: number): void {
    if (!deltaTime) return;
    this.lifetime += deltaTime;

    // Update position
    this.text.x += this.velocity.x;
    this.text.y += this.velocity.y;

    // Apply horizontal drag
    this.velocity.x *= 0.95;

    // Scale animation for critical hits
    if (this.isCritical && this.lifetime < 0.2) {
      const scaleProgress = this.lifetime / 0.2;
      this.text.scale.set(0.5 + scaleProgress * 0.5);
    }

    // Fade out
    if (this.lifetime > this.fadeStart) {
      const fadeProgress = (this.lifetime - fadeStart) / (this.maxLifetime - this.fadeStart);
      this.text.alpha = 1 - fadeProgress;
    }

    // Remove when expired
    if (this.lifetime >= this.maxLifetime && this.onDestroy) {
      this.onDestroy();
    }
  }
}

// Usage:
function spawnDamageNumber(x: number, y: number, value: number, isCritical: boolean) {
  const damageText = new PIXI.BitmapText({
    text: isCritical ? `${value}!` : value.toString(),
    style: {
      fontFamily: 'MyFont',
      fontSize: isCritical ? 48 : 32
    }
  });
  damageText.tint = isCritical ? 0xffaa00 : 0xff4444;
  damageText.position.set(x, y);
  damageText.anchor.set(0.5);

  if (isCritical) {
    damageText.scale.set(0.5); // Will animate to 1.0
  }

  const entity = asEntity(damageText);
  const velocity = {
    x: (Math.random() - 0.5) * 2,
    y: isCritical ? -3 : -2
  };

  entity.moxiEntity.addLogic(
    new FloatingNumberLogic(
      damageText,
      velocity,
      isCritical ? 1.0 : 0.8,
      isCritical,
      () => {
        container.removeChild(entity);
        entity.destroy();
      }
    )
  );

  entity.moxiEntity.init(renderer);
  container.addChild(entity);
}
```

**Techniques:**
- Callback pattern with `onDestroy` for cleanup
- Combine multiple effects: movement, fading, scaling
- Apply physics-like behavior (drag with `velocity.x *= 0.95`)
- Different behavior based on state (`isCritical`)

### Pattern 6: Rainbow Digit Counter

Update individual digit colors based on their value:

```typescript
class RainbowCounterLogic extends Logic<PIXI.Container> {
  private currentValue = 0;
  private incrementSpeed: number;
  private container: PIXI.Container;
  private digits: PIXI.BitmapText[] = [];

  constructor(container: PIXI.Container, incrementSpeed: number) {
    super();
    this.container = container;
    this.incrementSpeed = incrementSpeed;
  }

  update(entity?: PIXI.Container, deltaTime?: number): void {
    if (!deltaTime) return;
    this.currentValue += this.incrementSpeed;
    this.updateDigits(this.currentValue);
  }

  private getRainbowColor(digit: number): number {
    const rainbowColors = [
      0xff0000, 0xff9900, 0xffff00, 0xaaff00, 0x00ff00,
      0x00ffaa, 0x00ddff, 0x0088ff, 0xaa00ff, 0xff00ff
    ];
    return rainbowColors[digit] || 0xffffff;
  }

  private updateDigits(value: number): void {
    const digitStrings = value.toString().split('');

    // Remove excess digits if number shrinks
    while (this.digits.length > digitStrings.length) {
      const digit = this.digits.pop();
      if (digit) this.container.removeChild(digit);
    }

    // Update or create digits
    for (let i = 0; i < digitStrings.length; i++) {
      const digitValue = parseInt(digitStrings[i]);

      if (!this.digits[i]) {
        // Create new digit
        const digitText = new PIXI.BitmapText({
          text: digitStrings[i],
          style: { fontFamily: 'MyFont', fontSize: 64 }
        });
        this.digits.push(digitText);
        this.container.addChild(digitText);
      } else {
        // Update existing digit
        this.digits[i].text = digitStrings[i];
      }

      // Color based on digit value
      this.digits[i].tint = this.getRainbowColor(digitValue);
      this.digits[i].x = i * 45; // Spacing
    }
  }
}
```

**Techniques:**
- Dynamic digit creation/removal based on value
- Array management for variable-length numbers
- Reuse text objects instead of recreating
- Separate color mapping logic into helper method

### Best Practices for Text Logic Components

#### 1. Store References, Not Entity Parameters

**❌ Don't rely on optional entity parameter:**
```typescript
update(entity?: PIXI.BitmapText, deltaTime?: number): void {
  // BAD: entity parameter might be undefined
  entity.text = 'value';
}
```

**✅ Store reference in constructor:**
```typescript
class MyLogic extends Logic<PIXI.BitmapText> {
  private text: PIXI.BitmapText;

  constructor(text: PIXI.BitmapText) {
    super();
    this.text = text; // Store reliable reference
  }

  update(entity?: PIXI.BitmapText, deltaTime?: number): void {
    this.text.text = 'value'; // Always available
  }
}
```

#### 2. Use BitmapText for Frequently Updated Text

Text that updates every frame should use BitmapText:
```typescript
// ✅ Good: BitmapText for frame-by-frame updates
class CounterLogic extends Logic<PIXI.BitmapText> { /* ... */ }

// ❌ Bad: Regular Text regenerates texture every frame
class CounterLogic extends Logic<PIXI.Text> { /* slow! */ }
```

#### 3. Handle DeltaTime Correctly

Understand when to use `deltaTime`:

```typescript
// Frame-independent movement (smooth at any FPS)
this.text.x += this.velocity.x * deltaTime;

// Frame-locked behavior (same at 60 FPS)
this.currentValue += this.incrementSpeed; // No deltaTime
```

#### 4. Clean Up with Callbacks

Use callbacks for self-destroying entities:

```typescript
constructor(text: PIXI.BitmapText, onComplete?: () => void) {
  super();
  this.onComplete = onComplete;
}

update(entity?: PIXI.BitmapText, deltaTime?: number): void {
  if (this.shouldDestroy && this.onComplete) {
    this.onComplete(); // Let parent handle cleanup
  }
}
```

#### 5. Initialize State in Constructor or init()

**Use constructor** for simple state:
```typescript
constructor(text: PIXI.BitmapText) {
  super();
  this.text = text;
  this.value = 0; // Simple initialization
}
```

**Use init()** for renderer-dependent setup:
```typescript
init(entity?: PIXI.BitmapText, renderer?: PIXI.Renderer, ...args: any[]): void {
  this.lastTime = performance.now(); // Timing initialization
  // Access renderer if needed
}
```

### Combining Multiple Logic Components

You can add multiple Logic components to a single entity:

```typescript
const text = new PIXI.BitmapText({ text: 'Hello', style: { /* ... */ } });
const entity = asEntity(text);

// Add multiple behaviors
entity.moxiEntity.addLogic(new FadingTextLogic(text));
entity.moxiEntity.addLogic(new AnimatedTintLogic(text));
entity.moxiEntity.addLogic(new FloatingNumberLogic(text, velocity, lifetime, false));

// All Logic components update on each frame
entity.moxiEntity.update(deltaTime);
```

**Note:** Be careful with conflicting behaviors (e.g., two Logic components both setting alpha).

### Complete Working Example

See `examples/10-text-rendering.ts` for a complete implementation featuring:
- CounterLogic (line 17)
- RainbowCounterLogic (line 38)
- AnimatedTintLogic (line 97)
- OdometerLogic (line 127)
- FPSCounterLogic (line 236)
- FadingTextLogic (line 268)
- FloatingNumberLogic (line 308)

---

## Resources

- [PixiJS v8 Text Guide](https://pixijs.com/8.x/guides/components/scene-objects/text)
- [PixiJS Examples - Text](https://pixijs.com/8.x/examples/text)
- [BMFont Generator](https://www.angelcode.com/products/bmfont/)
- [MSDF Bitmap Font Generator](https://github.com/soimy/msdf-bmfont-xml)
- [MOXI Documentation](../../README.md)

---

## Summary

- **Use Text** for UI elements with rich styling that don't update frequently
- **Use BitmapText** for performance-critical text, counters, and large volumes
- **Use HTMLText** for complex formatted content and markup
- **Use MOXI Logic components** to encapsulate text behaviors and animations
- **Always set resolution** appropriately to prevent blurriness in scaled scenes
- **Profile your application** to identify text rendering bottlenecks

Remember: The best method depends on your specific use case. Start with Text for prototyping, optimize with BitmapText for performance, and use MOXI Logic to organize complex behaviors.
