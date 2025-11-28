# PIKCELL UI Utilities

## ⚠️ CRITICAL: GRID-BASED UI SYSTEM

**THIS CODEBASE USES A GRID-BASED MEASUREMENT SYSTEM FOR UI ELEMENTS, NOT RAW PIXELS.**

### Important Distinction:

**GRID UNITS are used for:**
- ✅ UI elements (cards, buttons, spacing, margins, padding, borders)
- ✅ Card dimensions and positioning
- ✅ Layout spacing between UI components

**ACTUAL PIXELS are used for:**
- ✅ Sprite dimensions (8x8 pixels per sprite)
- ✅ Sprite sheet dimensions (128x128, 256x256 pixels)
- ✅ Pixel art content itself
- ✅ Canvas/texture dimensions for sprite rendering

**When displaying sprite content in cards:**
- Sprite content is measured in actual pixels (e.g., 8x8 sprite)
- Card content size converts pixel dimensions to grid units: `Math.ceil(pixelWidth / px(1))`
- The card UI wrapper uses grid units, but the content inside is pixel-based

### Key Principles:

1. **ALWAYS use `px(gridUnits)` to convert grid units to pixels for UI**
   - The grid scale is **configurable** (not hardcoded) - can be 1x, 2x, 3x, or 4x
   - Default scale is 4x, but can be changed at runtime
   - `px(1)` = 1 grid unit = 4 pixels (at 4x scale) = 3 pixels (at 3x scale) = 2 pixels (at 2x scale) = 1 pixel (at 1x scale)
   - `px(2)` = 2 grid units = 8 pixels (at 4x) = 6 pixels (at 3x) = 4 pixels (at 2x) = 2 pixels (at 1x)
   - **NEVER use raw pixel values like `24`, `16`, etc. for UI measurements**

2. **Grid scale is configured at the outer layer (PixelGrid):**
   - The scale affects ALL UI elements proportionally
   - Changing `GRID.scale` scales the entire UI (cards, buttons, spacing, fonts)
   - Scale is typically set during initialization or via user preference
   - See `scale-card.ts` for an example of dynamic scale control

3. **Grid units are defined in `GRID` constants:**
   - `GRID.padding` - padding in grid units
   - `GRID.gap` - gap between elements in grid units
   - `GRID.margin` - margin in grid units
   - `GRID.border` - border width in grid units
   - `GRID.scale` - current scale multiplier (1, 2, 3, or 4)

3. **Common patterns:**
   ```typescript
   // ✅ CORRECT - UI uses grid units
   const spacing = px(GRID.gap);
   const margin = px(GRID.margin);
   const buttonSpacing = px(2);
   
   // ✅ CORRECT - Sprite content uses actual pixels
   const spriteWidth = 8;  // 8 pixels
   const spriteSheetWidth = 128;  // 128 pixels
   
   // ✅ CORRECT - Converting sprite pixels to grid units for card content
   const contentWidth = Math.ceil(spriteWidth / px(1));
   
   // ❌ WRONG - Using raw pixels for UI
   const spacing = 8;  // DON'T DO THIS for UI
   const margin = 20;  // DON'T DO THIS for UI
   ```

4. **When calculating dimensions:**
   - Card heights: Use `calculateTitleBarHeight()` for title bars
   - Commander bar: Use `calculateCommanderBarHeight()` 
   - Always convert grid units to pixels using `px()` for UI
   - Sprite/sprite sheet dimensions remain in actual pixels

### Why Grid Units for UI?

- Ensures pixel-perfect rendering at any scale
- Maintains consistent spacing across the UI
- Makes the UI scalable - change `GRID.scale` (1x, 2x, 3x, 4x) to scale entire UI proportionally
- The scale is configurable at the outer layer (PixelGrid), not hardcoded
- All UI elements automatically adapt when scale changes
- Prevents sub-pixel rendering issues

### Examples:

```typescript
// Sprite sheet config - uses actual pixels
const config: SpriteSheetConfig = {
  width: 128,   // 128 pixels
  height: 128,  // 128 pixels
  palette: [...]
};

// Card content size - converts pixels to grid units
// Note: px(1) value depends on current GRID.scale
const contentWidth = Math.ceil(config.width / px(1));  // 128px / px(1) = varies by scale

// UI spacing - uses grid units (automatically scales with GRID.scale)
const cardSpacing = px(GRID.gap);  // 1 grid unit = 4px (at 4x) = 3px (at 3x) = 2px (at 2x) = 1px (at 1x)

// Grid scale examples:
// At 4x scale: px(1) = 4px, px(2) = 8px, px(GRID.margin) = 20px
// At 3x scale: px(1) = 3px, px(2) = 6px, px(GRID.margin) = 15px
// At 2x scale: px(1) = 2px, px(2) = 4px, px(GRID.margin) = 10px
// At 1x scale: px(1) = 1px, px(2) = 2px, px(GRID.margin) = 5px
```

**If you see hardcoded pixel values in UI code (cards, buttons, spacing), they are likely bugs that need to be fixed!**
**But pixel values for sprite/sprite sheet dimensions are correct and expected.**

