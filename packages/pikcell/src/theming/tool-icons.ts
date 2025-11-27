/**
 * Tool icons for the sprite editor
 * Creates simple pixel art icons and bakes them to textures
 */
import * as PIXI from 'pixi.js';

export type ToolType = 'pencil' | 'eraser' | 'fill' | 'eyedrop' | 'selection' | 'shape';
export type ShapeType = 'circle' | 'circle-filled' | 'square' | 'square-filled';

// Cache for generated textures
const textureCache: Map<string, PIXI.Texture> = new Map();

// SVG icon data (kept for reference, but we use Graphics-based icons)
const SVG_ICONS: Record<ToolType, string> = {
  pencil: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 2h-2v2h-2v2h-2v2h-2v2H8v2H6v2H4v2H2v6h6v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2V8h2V6h-2V4h-2V2zm0 8h-2v2h-2v2h-2v2h-2v2H8v-2H6v-2h2v-2h2v-2h2V8h2V6h2v2h2v2zM6 16H4v4h4v-2H6v-2z" fill="currentColor"/></svg>`,
  eraser: '',
  fill: '',
  eyedrop: '',
  selection: '',
  shape: ''
};

/**
 * Draws a tool icon as Graphics at native size (24x24)
 */
function drawToolGraphic(tool: ToolType, color: number): PIXI.Graphics {
  const g = new PIXI.Graphics();
  g.roundPixels = true;

  switch (tool) {
    case 'pencil':
      // Pixel art pencil from SVG - native 24x24 size, 2px blocks
      g.rect(16, 0, 2, 2);
      g.fill({ color });
      g.rect(14, 2, 2, 2);
      g.fill({ color });
      g.rect(12, 4, 2, 2);
      g.fill({ color });
      g.rect(10, 6, 2, 2);
      g.fill({ color });
      g.rect(8, 8, 2, 2);
      g.fill({ color });
      g.rect(6, 10, 2, 2);
      g.fill({ color });
      g.rect(4, 12, 2, 2);
      g.fill({ color });
      g.rect(2, 14, 2, 2);
      g.fill({ color });
      g.rect(0, 16, 2, 6);
      g.fill({ color });
      g.rect(2, 18, 4, 2);
      g.fill({ color });
      // Inner detail
      g.rect(14, 8, 2, 2);
      g.fill({ color });
      g.rect(12, 10, 2, 2);
      g.fill({ color });
      g.rect(10, 12, 2, 2);
      g.fill({ color });
      g.rect(8, 14, 2, 2);
      g.fill({ color });
      g.rect(6, 14, 2, 2);
      g.fill({ color });
      // Bottom square detail
      g.rect(4, 16, 2, 4);
      g.fill({ color });
      g.rect(2, 16, 2, 2);
      g.fill({ color });
      break;

    case 'eraser':
      // Eraser at 24x24
      g.rect(6, 10, 12, 8);
      g.fill({ color: 0xeeeeee });
      g.rect(6, 10, 12, 2);
      g.fill({ color });
      g.rect(6, 16, 12, 2);
      g.fill({ color });
      g.rect(6, 10, 2, 8);
      g.fill({ color });
      g.rect(16, 10, 2, 8);
      g.fill({ color });
      break;

    case 'fill':
      // Fill bucket at 24x24
      g.rect(8, 10, 8, 6);
      g.fill({ color });
      g.rect(14, 8, 4, 4);
      g.fill({ color });
      g.rect(10, 18, 4, 4);
      g.fill({ color });
      g.rect(11, 22, 2, 2);
      g.fill({ color });
      break;

    case 'eyedrop':
      // Eyedropper at 24x24
      g.rect(8, 4, 8, 4);
      g.fill({ color });
      g.rect(10, 8, 4, 6);
      g.fill({ color });
      g.rect(11, 14, 2, 6);
      g.fill({ color });
      break;

    case 'selection':
      // Selection/marquee tool - dashed rectangle at 24x24
      // Top edge (dashed)
      g.rect(4, 4, 4, 2);
      g.fill({ color });
      g.rect(12, 4, 4, 2);
      g.fill({ color });
      // Bottom edge (dashed)
      g.rect(4, 18, 4, 2);
      g.fill({ color });
      g.rect(12, 18, 4, 2);
      g.fill({ color });
      // Left edge (dashed)
      g.rect(4, 4, 2, 4);
      g.fill({ color });
      g.rect(4, 12, 2, 4);
      g.fill({ color });
      // Right edge (dashed)
      g.rect(18, 4, 2, 4);
      g.fill({ color });
      g.rect(18, 12, 2, 4);
      g.fill({ color });
      // Corners
      g.rect(4, 4, 2, 2);
      g.fill({ color });
      g.rect(18, 4, 2, 2);
      g.fill({ color });
      g.rect(4, 18, 2, 2);
      g.fill({ color });
      g.rect(18, 18, 2, 2);
      g.fill({ color });
      break;

    case 'shape':
      // Shape tool icon - overlapping shapes at 24x24
      // Square outline (back)
      g.rect(2, 8, 12, 2);
      g.fill({ color });
      g.rect(2, 18, 12, 2);
      g.fill({ color });
      g.rect(2, 8, 2, 12);
      g.fill({ color });
      g.rect(12, 8, 2, 12);
      g.fill({ color });
      // Circle outline (front) - simplified pixel circle
      g.rect(14, 2, 6, 2);
      g.fill({ color });
      g.rect(12, 4, 2, 2);
      g.fill({ color });
      g.rect(20, 4, 2, 2);
      g.fill({ color });
      g.rect(10, 6, 2, 6);
      g.fill({ color });
      g.rect(22, 6, 2, 6);
      g.fill({ color });
      g.rect(12, 12, 2, 2);
      g.fill({ color });
      g.rect(20, 12, 2, 2);
      g.fill({ color });
      g.rect(14, 14, 6, 2);
      g.fill({ color });
      break;
  }

  return g;
}

/**
 * Draws a shape icon as Graphics at native size (24x24)
 */
function drawShapeGraphic(shape: ShapeType, color: number): PIXI.Graphics {
  const g = new PIXI.Graphics();
  g.roundPixels = true;

  switch (shape) {
    case 'circle':
      // Circle outline at 24x24
      g.rect(8, 2, 8, 2);
      g.fill({ color });
      g.rect(6, 4, 2, 2);
      g.fill({ color });
      g.rect(16, 4, 2, 2);
      g.fill({ color });
      g.rect(4, 6, 2, 4);
      g.fill({ color });
      g.rect(18, 6, 2, 4);
      g.fill({ color });
      g.rect(2, 10, 2, 4);
      g.fill({ color });
      g.rect(20, 10, 2, 4);
      g.fill({ color });
      g.rect(4, 14, 2, 4);
      g.fill({ color });
      g.rect(18, 14, 2, 4);
      g.fill({ color });
      g.rect(6, 18, 2, 2);
      g.fill({ color });
      g.rect(16, 18, 2, 2);
      g.fill({ color });
      g.rect(8, 20, 8, 2);
      g.fill({ color });
      break;

    case 'circle-filled':
      // Filled circle at 24x24
      g.rect(8, 2, 8, 2);
      g.fill({ color });
      g.rect(6, 4, 12, 2);
      g.fill({ color });
      g.rect(4, 6, 16, 4);
      g.fill({ color });
      g.rect(2, 10, 20, 4);
      g.fill({ color });
      g.rect(4, 14, 16, 4);
      g.fill({ color });
      g.rect(6, 18, 12, 2);
      g.fill({ color });
      g.rect(8, 20, 8, 2);
      g.fill({ color });
      break;

    case 'square':
      // Square outline at 24x24
      g.rect(4, 4, 16, 2);
      g.fill({ color });
      g.rect(4, 18, 16, 2);
      g.fill({ color });
      g.rect(4, 4, 2, 16);
      g.fill({ color });
      g.rect(18, 4, 2, 16);
      g.fill({ color });
      break;

    case 'square-filled':
      // Filled square at 24x24
      g.rect(4, 4, 16, 16);
      g.fill({ color });
      break;
  }

  return g;
}

/**
 * Creates a tool icon sprite from cached or newly generated texture
 * Icons are rendered at native 24x24 and scaled to fit the target size
 * @param tool - The tool type
 * @param size - Target size in pixels (icon will scale to fit with padding)
 * @param color - Icon color
 * @param renderer - PIXI renderer for texture generation
 */
export function createToolIcon(tool: ToolType, size: number, color: number, renderer: PIXI.Renderer): PIXI.Sprite {
  const cacheKey = `${tool}_${color}`;

  // Check cache
  if (!textureCache.has(cacheKey)) {
    const graphic = drawToolGraphic(tool, color);
    graphic.roundPixels = true;

    const texture = renderer.generateTexture({
      target: graphic,
      resolution: 1,
      antialias: false
    });

    texture.source.scaleMode = 'nearest';
    graphic.destroy();
    textureCache.set(cacheKey, texture);
  }

  const sprite = new PIXI.Sprite(textureCache.get(cacheKey)!);
  sprite.roundPixels = true;
  sprite.texture.source.scaleMode = 'nearest';

  // Scale to fit target size (icon is 24x24 native)
  const scale = size / 24;
  sprite.scale.set(scale);

  return sprite;
}

/**
 * Creates a shape icon sprite from cached or newly generated texture
 * Icons are rendered at native 24x24 and scaled to fit the target size
 * @param shape - The shape type
 * @param size - Target size in pixels (icon will scale to fit)
 * @param color - Icon color
 * @param renderer - PIXI renderer for texture generation
 */
export function createShapeIcon(shape: ShapeType, size: number, color: number, renderer: PIXI.Renderer): PIXI.Sprite {
  const cacheKey = `shape_${shape}_${color}`;

  // Check cache
  if (!textureCache.has(cacheKey)) {
    const graphic = drawShapeGraphic(shape, color);
    graphic.roundPixels = true;

    const texture = renderer.generateTexture({
      target: graphic,
      resolution: 1,
      antialias: false
    });

    texture.source.scaleMode = 'nearest';
    graphic.destroy();
    textureCache.set(cacheKey, texture);
  }

  const sprite = new PIXI.Sprite(textureCache.get(cacheKey)!);
  sprite.roundPixels = true;
  sprite.texture.source.scaleMode = 'nearest';

  // Scale to fit target size (icon is 24x24 native)
  const scale = size / 24;
  sprite.scale.set(scale);

  return sprite;
}
