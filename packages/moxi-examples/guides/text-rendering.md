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

## Resources

- [PixiJS v8 Text Guide](https://pixijs.com/8.x/guides/components/scene-objects/text)
- [PixiJS Examples - Text](https://pixijs.com/8.x/examples/text)
- [BMFont Generator](https://www.angelcode.com/products/bmfont/)
- [MSDF Bitmap Font Generator](https://github.com/soimy/msdf-bmfont-xml)

---

## Summary

- **Use Text** for UI elements with rich styling that don't update frequently
- **Use BitmapText** for performance-critical text, counters, and large volumes
- **Use HTMLText** for complex formatted content and markup
- **Always set resolution** appropriately to prevent blurriness in scaled scenes
- **Profile your application** to identify text rendering bottlenecks

Remember: The best method depends on your specific use case. Start with Text for prototyping, then optimize with BitmapText or HTMLText as needed.
