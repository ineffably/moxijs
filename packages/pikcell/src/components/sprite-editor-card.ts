/**
 * Sprite editor card - displays and allows editing of a single 8x8 sprite
 * 
 * ⚠️ IMPORTANT: This component bridges pixel-based sprite content and grid-based UI
 * - Sprite dimensions are in ACTUAL PIXELS (8x8 pixels)
 * - Card UI wrapper uses GRID UNITS (converted from pixels for content size)
 * - The sprite content itself is rendered at pixel scale, not grid scale
 * 
 * @see ../utilities/README.md for grid system documentation
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from './pixel-card';
import { px, GRID } from '@moxijs/core';
import { SpriteController } from '../controllers/sprite-controller';
import { CardResult, ControllableComponent, RefreshableComponent } from '../interfaces/components';
import { ShapeType, drawToolIconInto, drawShapeIconInto, ToolType } from '../theming/tool-icons';
import { getShapePixels, Point } from '../utilities/shape-drawer';
import { MainToolType } from '../cards/toolbar-card';
import { SPRITE_CONSTANTS } from '../config/constants';

/** Selection rectangle in pixel coordinates */
export interface Selection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface SpriteEditorCardOptions {
  x: number;
  y: number;
  renderer: PIXI.Renderer;
  spriteController: SpriteController;
  showGrid?: boolean;  // Show pixel grid overlay (default: true)
  onPixelClick?: (x: number, y: number, oldColorIndex: number) => void;
  onShapeDraw?: (pixels: Point[], oldColors: Map<string, number>) => void;  // Called when shape is drawn
  onFill?: (x: number, y: number) => void;  // Called when fill tool is used
  onDrawStart?: () => void;  // Called when user starts drawing
  onDrawEnd?: () => void;    // Called when user stops drawing
  getCurrentTool?: () => MainToolType;  // Get current tool type
  getCurrentShape?: () => ShapeType;    // Get current shape type
  getPreviewColor?: () => number;       // Get color for shape preview (hex)
  onSelectionChange?: (selection: Selection | null) => void;  // Called when selection changes
  onFocus?: () => void;
}

export interface SpriteEditorCardResult extends CardResult, ControllableComponent<SpriteController>, RefreshableComponent {
  getSelection: () => Selection | null;
  setSelection: (selection: Selection | null) => void;
  clearSelection: () => void;
  /** Update title bar with tool icon, coordinates, size, and scale */
  updateTitle: (tool: MainToolType, shapeType?: ShapeType) => void;
}

/** Grid line color (semi-transparent) */
const GRID_LINE_COLOR = 0x888888;
const GRID_LINE_ALPHA = 0.4;

/**
 * Creates a sprite editor card for editing a single 8x8 sprite
 */
export function createSpriteEditorCard(options: SpriteEditorCardOptions): SpriteEditorCardResult {
  const { x, y, renderer, spriteController, onPixelClick, onShapeDraw, onFill, onDrawStart, onDrawEnd, getCurrentTool, getCurrentShape, getPreviewColor, onSelectionChange, onFocus } = options;
  const showGrid = options.showGrid ?? true;

  // Get scaled dimensions
  const dims = spriteController.getScaledDimensions();
  const contentWidth = Math.ceil(dims.width / px(1));
  const contentHeight = Math.ceil(dims.height / px(1));

  // Create the card
  const card = new PixelCard({
    title: `(${spriteController.getScale()}x)`,
    x,
    y,
    contentWidth,
    contentHeight,
    renderer,
    minContentSize: true,
    clipContent: true, // Enable clipping for sprite canvas (overflow: hidden)
    onResize: (width, height) => {
      // Re-render sprite when card resizes
      drawSprite();
      if (showGrid) drawGrid();
    },
    onFocus
  });

  const contentContainer = card.getContentContainer();

  // Container for the sprite
  const spriteContainer = new PIXI.Container();
  contentContainer.addChild(spriteContainer);

  // Container for grid overlay (on top of sprite)
  const gridContainer = new PIXI.Container();
  contentContainer.addChild(gridContainer);

  // Container for shape preview (on top of grid)
  const previewContainer = new PIXI.Container();
  contentContainer.addChild(previewContainer);

  // Container for selection overlay (on top of everything)
  const selectionContainer = new PIXI.Container();
  contentContainer.addChild(selectionContainer);

  // Selection state
  let currentSelection: Selection | null = null;
  let selectionAnimationFrame = 0;
  let selectionAnimationId: number | null = null;

  // Draw the sprite
  function drawSprite() {
    spriteContainer.removeChildren();
    spriteController.render(spriteContainer);
  }

  // Draw the grid overlay
  function drawGrid() {
    gridContainer.removeChildren();
    if (!showGrid) return;

    const scale = spriteController.getScale();
    const cellSize = 8; // 8x8 sprite
    const totalSize = cellSize * scale;

    const g = new PIXI.Graphics();
    g.roundPixels = true;

    // Draw vertical lines
    for (let i = 0; i <= cellSize; i++) {
      const lineX = i * scale;
      g.moveTo(lineX, 0);
      g.lineTo(lineX, totalSize);
    }

    // Draw horizontal lines
    for (let i = 0; i <= cellSize; i++) {
      const lineY = i * scale;
      g.moveTo(0, lineY);
      g.lineTo(totalSize, lineY);
    }

    g.stroke({ color: GRID_LINE_COLOR, alpha: GRID_LINE_ALPHA, width: 1 });
    gridContainer.addChild(g);
  }

  // Draw shape preview (ghost outline)
  function drawShapePreview(startX: number, startY: number, endX: number, endY: number) {
    previewContainer.removeChildren();

    const shapeType = getCurrentShape?.() ?? 'square';
    const pixels = getShapePixels(shapeType, startX, startY, endX, endY);
    const validPixels = pixels.filter(p => p.x >= 0 && p.x < 8 && p.y >= 0 && p.y < 8);

    if (validPixels.length === 0) return;

    const scale = spriteController.getScale();
    const previewColor = getPreviewColor?.() ?? 0xFFFFFF;

    const g = new PIXI.Graphics();
    g.roundPixels = true;

    // Draw semi-transparent preview pixels
    for (const pixel of validPixels) {
      g.rect(pixel.x * scale, pixel.y * scale, scale, scale);
    }
    g.fill({ color: previewColor, alpha: 0.5 });

    // Draw outline around each pixel for clarity
    for (const pixel of validPixels) {
      g.rect(pixel.x * scale, pixel.y * scale, scale, scale);
    }
    g.stroke({ color: previewColor, alpha: 0.8, width: 1 });

    previewContainer.addChild(g);
  }

  // Clear shape preview
  function clearShapePreview() {
    previewContainer.removeChildren();
  }

  // Draw selection with marching ants (dotted animated border)
  function drawSelection() {
    selectionContainer.removeChildren();
    if (!currentSelection) return;

    const scale = spriteController.getScale();
    const { x1, y1, x2, y2 } = currentSelection;

    // Normalize coordinates (ensure x1,y1 is top-left)
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    // Calculate pixel positions
    const left = minX * scale;
    const top = minY * scale;
    const right = (maxX + 1) * scale;
    const bottom = (maxY + 1) * scale;
    const width = right - left;
    const height = bottom - top;

    const g = new PIXI.Graphics();
    g.roundPixels = true;

    // Draw marching ants pattern
    const dashLength = 4;
    const offset = selectionAnimationFrame % (dashLength * 2);

    // Helper to draw a dashed line
    const drawDashedLine = (x1: number, y1: number, x2: number, y2: number, isHorizontal: boolean) => {
      const length = isHorizontal ? Math.abs(x2 - x1) : Math.abs(y2 - y1);
      const dir = isHorizontal ? (x2 > x1 ? 1 : -1) : (y2 > y1 ? 1 : -1);
      let pos = -offset;
      let drawing = true;

      while (pos < length) {
        const start = Math.max(0, pos);
        const end = Math.min(length, pos + dashLength);

        if (drawing && end > start) {
          if (isHorizontal) {
            g.moveTo(x1 + start * dir, y1);
            g.lineTo(x1 + end * dir, y1);
          } else {
            g.moveTo(x1, y1 + start * dir);
            g.lineTo(x1, y1 + end * dir);
          }
        }

        pos += dashLength;
        drawing = !drawing;
      }
    };

    // Draw white background for contrast
    g.rect(left, top, width, height);
    g.stroke({ color: 0xFFFFFF, alpha: 0.5, width: 1 });

    // Draw black marching ants
    drawDashedLine(left, top, right, top, true);      // Top
    drawDashedLine(right, top, right, bottom, false); // Right
    drawDashedLine(right, bottom, left, bottom, true); // Bottom
    drawDashedLine(left, bottom, left, top, false);   // Left

    g.stroke({ color: 0x000000, alpha: 1, width: 1 });

    selectionContainer.addChild(g);
  }

  // Start selection animation
  function startSelectionAnimation() {
    if (selectionAnimationId !== null) return;

    const animate = () => {
      selectionAnimationFrame++;
      drawSelection();
      selectionAnimationId = requestAnimationFrame(animate);
    };

    // Slow down the animation (every 5 frames)
    const slowAnimate = () => {
      selectionAnimationFrame++;
      drawSelection();
      setTimeout(() => {
        if (currentSelection) {
          selectionAnimationId = requestAnimationFrame(slowAnimate);
        }
      }, 100);
    };

    slowAnimate();
  }

  // Stop selection animation
  function stopSelectionAnimation() {
    if (selectionAnimationId !== null) {
      cancelAnimationFrame(selectionAnimationId);
      selectionAnimationId = null;
    }
  }

  // Set selection
  function setSelection(selection: Selection | null) {
    currentSelection = selection;
    if (selection) {
      drawSelection();
      startSelectionAnimation();
    } else {
      stopSelectionAnimation();
      selectionContainer.removeChildren();
    }
    onSelectionChange?.(selection);
  }

  // Clear selection
  function clearSelection() {
    setSelection(null);
  }

  // Handle clicks for drawing
  if (onPixelClick || onShapeDraw) {
    spriteContainer.eventMode = 'static';
    spriteContainer.cursor = 'crosshair';

    let isDrawing = false;
    let lastPixelX = -1;
    let lastPixelY = -1;
    // Shape drawing state
    let shapeStartX = -1;
    let shapeStartY = -1;

    spriteContainer.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
      isDrawing = true;
      onDrawStart?.();
      const local = e.getLocalPosition(spriteContainer);
      const pixel = spriteController.screenToPixel(local.x, local.y);

      if (pixel) {
        const currentTool = getCurrentTool?.() ?? 'pencil';

        if (currentTool === 'selection') {
          // Selection mode: record start position and clear previous selection
          shapeStartX = pixel.x;
          shapeStartY = pixel.y;
          clearSelection();
        } else if (currentTool === 'shape') {
          // Shape mode: record start position
          shapeStartX = pixel.x;
          shapeStartY = pixel.y;
        } else if (currentTool === 'fill') {
          // Fill mode: flood fill from clicked pixel
          if (onFill) {
            onFill(pixel.x, pixel.y);
          }
        } else {
          // Pencil/eraser mode: draw immediately
          lastPixelX = pixel.x;
          lastPixelY = pixel.y;
          if (onPixelClick) {
            const oldColorIndex = spriteController.getPixel(pixel.x, pixel.y);
            onPixelClick(pixel.x, pixel.y, oldColorIndex);
          }
        }
      }
    });

    spriteContainer.on('pointermove', (e: PIXI.FederatedPointerEvent) => {
      if (isDrawing) {
        const local = e.getLocalPosition(spriteContainer);
        const pixel = spriteController.screenToPixel(local.x, local.y);
        const currentTool = getCurrentTool?.() ?? 'pencil';

        if (currentTool === 'selection') {
          // Selection mode: track position and draw selection preview
          if (pixel) {
            lastPixelX = pixel.x;
            lastPixelY = pixel.y;
            // Draw temporary selection preview (without animation)
            if (shapeStartX >= 0 && shapeStartY >= 0) {
              // Temporarily set selection to show preview
              currentSelection = {
                x1: shapeStartX,
                y1: shapeStartY,
                x2: pixel.x,
                y2: pixel.y
              };
              drawSelection();
            }
          }
        } else if (currentTool === 'shape') {
          // Shape mode: track position and draw preview
          if (pixel) {
            lastPixelX = pixel.x;
            lastPixelY = pixel.y;
            // Draw shape preview
            if (shapeStartX >= 0 && shapeStartY >= 0) {
              drawShapePreview(shapeStartX, shapeStartY, pixel.x, pixel.y);
            }
          }
        } else if (pixel && onPixelClick) {
          // Pencil/eraser mode: draw as you move
          if (pixel.x !== lastPixelX || pixel.y !== lastPixelY) {
            lastPixelX = pixel.x;
            lastPixelY = pixel.y;
            const oldColorIndex = spriteController.getPixel(pixel.x, pixel.y);
            onPixelClick(pixel.x, pixel.y, oldColorIndex);
          }
        }
      }
    });

    const endDraw = (e?: PIXI.FederatedPointerEvent) => {
      if (isDrawing) {
        const currentTool = getCurrentTool?.() ?? 'pencil';

        if (currentTool === 'selection' && shapeStartX >= 0 && shapeStartY >= 0) {
          // Finalize selection
          let endX = lastPixelX;
          let endY = lastPixelY;

          // If we have an event, get the exact position
          if (e) {
            const local = e.getLocalPosition(spriteContainer);
            const pixel = spriteController.screenToPixel(local.x, local.y);
            if (pixel) {
              endX = pixel.x;
              endY = pixel.y;
            }
          }

          // If no movement, use start position (single pixel selection)
          if (endX < 0) endX = shapeStartX;
          if (endY < 0) endY = shapeStartY;

          // Clamp to bounds
          endX = Math.max(0, Math.min(7, endX));
          endY = Math.max(0, Math.min(7, endY));

          // Set the final selection and start animation
          setSelection({
            x1: shapeStartX,
            y1: shapeStartY,
            x2: endX,
            y2: endY
          });
        } else if (currentTool === 'shape' && shapeStartX >= 0 && shapeStartY >= 0) {
          // Get the end position
          let endX = lastPixelX;
          let endY = lastPixelY;

          // If we have an event, get the exact position
          if (e) {
            const local = e.getLocalPosition(spriteContainer);
            const pixel = spriteController.screenToPixel(local.x, local.y);
            if (pixel) {
              endX = pixel.x;
              endY = pixel.y;
            }
          }

          // If no movement, use start position (single pixel)
          if (endX < 0) endX = shapeStartX;
          if (endY < 0) endY = shapeStartY;

          // Get shape type and calculate pixels
          const shapeType = getCurrentShape?.() ?? 'square';
          const pixels = getShapePixels(shapeType, shapeStartX, shapeStartY, endX, endY);

          // Filter to only pixels within bounds (0-7)
          const validPixels = pixels.filter(p => p.x >= 0 && p.x < 8 && p.y >= 0 && p.y < 8);

          if (validPixels.length > 0 && onShapeDraw) {
            // Collect old colors for undo
            const oldColors = new Map<string, number>();
            for (const p of validPixels) {
              const key = `${p.x},${p.y}`;
              if (!oldColors.has(key)) {
                oldColors.set(key, spriteController.getPixel(p.x, p.y));
              }
            }
            onShapeDraw(validPixels, oldColors);
          }

          // Clear the preview after drawing
          clearShapePreview();
        }

        isDrawing = false;
        lastPixelX = -1;
        lastPixelY = -1;
        shapeStartX = -1;
        shapeStartY = -1;
        onDrawEnd?.();
      }
    };

    spriteContainer.on('pointerup', endDraw);
    spriteContainer.on('pointerupoutside', endDraw);
  }

  // Initial draw
  drawSprite();
  if (showGrid) drawGrid();

  /**
   * Update the title bar with tool icon and info
   * Format: [icon] (x,y) 8x8 Nx
   */
  function updateTitle(tool: MainToolType, shapeType?: ShapeType) {
    const cell = spriteController.getCell();
    const scale = spriteController.getScale();
    const size = SPRITE_CONSTANTS.CELL_SIZE;

    // Build info string: (x,y) 8x8 Nx
    const infoText = `(${cell.x},${cell.y}) ${size}x${size} ${scale}x`;

    // Choose the icon drawing function based on tool
    let drawIcon: (g: PIXI.Graphics, x: number, y: number, color: number, pixelSize: number) => void;

    if (tool === 'shape' && shapeType) {
      drawIcon = (g, x, y, color, pixelSize) => drawShapeIconInto(g, shapeType, x, y, color, pixelSize);
    } else {
      // Map MainToolType to ToolType (they're mostly the same)
      const toolType = tool as ToolType;
      drawIcon = (g, x, y, color, pixelSize) => drawToolIconInto(g, toolType, x, y, color, pixelSize);
    }

    // Icon dimensions: 10x9 grid units, rendered at 2x = 20x18 pixels
    const scaledIconWidth = 20;
    card.setTitleWithIcon(drawIcon, infoText, scaledIconWidth);
  }

  return {
    card,
    container: card.container,
    controller: spriteController,
    redraw: () => {
      drawSprite();
      if (showGrid) drawGrid();
    },
    getSelection: () => currentSelection,
    setSelection: (selection: Selection | null) => setSelection(selection),
    clearSelection: () => clearSelection(),
    updateTitle,
    destroy: () => {
      stopSelectionAnimation();
      spriteContainer.removeAllListeners();
      gridContainer.removeChildren();
      selectionContainer.removeChildren();
      card.container.destroy({ children: true });
    }
  };
}

