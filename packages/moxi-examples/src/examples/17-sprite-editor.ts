/**
 * Example 17: Sprite Editor - Scaled Pixel Perfect UI
 * All UI elements align to a consistent pixel grid
 */
import { setupMoxi } from 'moxi';
import * as PIXI from 'pixi.js';
import { Assets } from 'pixi.js';
import { ASSETS } from '../assets-config';

// Pixel Perfect Grid System
const GRID = {
  unit: 1,        // Base pixel unit at 1x scale
  scale: 3,       // Scale everything by 3x for visibility
  border: 1,      // Border width in grid units (will be 3px at 3x scale)
  padding: 2,     // Standard padding (will be 6px at 3x scale)
  gap: 1,         // Gap between elements (will be 3px at 3x scale)
};

// Triple border system: black/white/black
const BORDER = {
  outer: 1,       // Outer black border (1 grid unit)
  middle: 1,      // Middle white border (1 grid unit)
  inner: 1,       // Inner black border (1 grid unit)
  total: 3        // Total border width (3 grid units = 9px at 3x scale)
};

// Helper to convert grid units to pixels
const px = (units: number) => units * GRID.unit * GRID.scale;

// Color palette - PICO-8 colors
const PICO8_PALETTE = [
  0x000000, 0x1d2b53, 0x7e2553, 0x008751,
  0xab5236, 0x5f574f, 0xc2c3c7, 0xfff1e8,
  0xff004d, 0xffa300, 0xffec27, 0x00e436,
  0x29adff, 0x83769c, 0xff77a8, 0xffccaa
];

// UI Colors
const UI_COLORS = {
  cardBg: 0xe5e5e5,
  cardBorder: 0x000000,
  text: 0x000000,
  selected: 0xffffff,
};

/**
 * Creates a pixel-perfect palette card
 */
function createPaletteCard(x: number, y: number, renderer: PIXI.Renderer): PIXI.Container {
  const card = new PIXI.Container();
  card.position.set(x, y);

  // State
  let colorsPerRow = 4;
  let rows = 4;
  let swatchSize = 8; // Grid units
  const titleBarHeightPx = px(5) + 2; // 5 grid units (15px) + 2px = 17px

  // Dragging state
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let cardStartX = 0;
  let cardStartY = 0;

  // Resizing state
  let isResizing = false;
  let resizeStartX = 0;
  let resizeStartY = 0;
  let resizeStartCols = 0;
  let resizeStartRows = 0;
  let resizeDirection: 'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw' | null = null;

  // Redraw function
  function redraw() {
    // Clear all children
    card.removeChildren();

    const contentWidth = colorsPerRow * swatchSize + (colorsPerRow - 1) * GRID.gap;
    const contentHeight = rows * swatchSize + (rows - 1) * GRID.gap;
    const cardWidth = BORDER.total * 2 + GRID.padding * 2 + contentWidth;
    const cardHeight = px(BORDER.total * 2) + titleBarHeightPx + px(GRID.padding * 2) + px(contentHeight);

    // Card background with triple border
    const bg = new PIXI.Graphics();
    bg.roundPixels = true;

    // Layer 1: Outer black border
    bg.rect(0, 0, px(cardWidth), cardHeight);
    bg.fill({ color: 0x000000 });

    // Layer 2: Middle white border
    bg.rect(px(BORDER.outer), px(BORDER.outer),
            px(cardWidth - BORDER.outer * 2), cardHeight - px(BORDER.outer * 2));
    bg.fill({ color: 0xffffff });

    // Layer 3: Inner black border
    bg.rect(px(BORDER.outer + BORDER.middle), px(BORDER.outer + BORDER.middle),
            px(cardWidth - (BORDER.outer + BORDER.middle) * 2),
            cardHeight - px((BORDER.outer + BORDER.middle) * 2));
    bg.fill({ color: 0x000000 });

    // Layer 4: Content background
    bg.rect(px(BORDER.total), px(BORDER.total),
            px(cardWidth - BORDER.total * 2), cardHeight - px(BORDER.total * 2));
    bg.fill({ color: UI_COLORS.cardBg });

    card.addChild(bg);

    // Title bar
    const titleBar = new PIXI.Graphics();
    titleBar.roundPixels = true;
    titleBar.eventMode = 'static';
    titleBar.cursor = 'move';
    titleBar.rect(px(BORDER.total), px(BORDER.total),
                  px(cardWidth - BORDER.total * 2), titleBarHeightPx);
    titleBar.fill({ color: 0x666666 });

    // Title bar dragging
    titleBar.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
      isDragging = true;
      cardStartX = card.x;
      cardStartY = card.y;

      // Store screen coordinates
      const canvas = renderer.canvas as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      dragStartX = e.client.x;
      dragStartY = e.client.y;

      e.stopPropagation();
    });

    card.addChild(titleBar);

    // Title text
    const titleText = new PIXI.Text({
      text: 'Palette',
      style: {
        fontFamily: 'PixelOperator8',
        fontSize: px(3),
        fill: 0xffffff,
      },
      resolution: 1,
      roundPixels: true
    });

    const textHeight = titleText.height;
    const verticalCenter = px(BORDER.total) + (titleBarHeightPx - textHeight) / 2;
    titleText.position.set(px(BORDER.total) + 2, Math.floor(verticalCenter));
    card.addChild(titleText);

    // Color swatches - only draw what fits in the grid
    const totalSwatches = colorsPerRow * rows;
    for (let i = 0; i < Math.min(totalSwatches, PICO8_PALETTE.length); i++) {
      const color = PICO8_PALETTE[i];
      const col = i % colorsPerRow;
      const row = Math.floor(i / colorsPerRow);

      const swatchX = px(BORDER.total + GRID.padding + col * (swatchSize + GRID.gap));
      const swatchY = px(BORDER.total) + titleBarHeightPx + px(GRID.padding + row * (swatchSize + GRID.gap));

      const swatch = new PIXI.Graphics();
      swatch.roundPixels = true;
      swatch.eventMode = 'static';
      swatch.cursor = 'pointer';

      // Swatch border
      swatch.rect(0, 0, px(swatchSize), px(swatchSize));
      swatch.fill({ color: 0x000000 });

      // Swatch color fill
      swatch.rect(px(GRID.border), px(GRID.border),
                  px(swatchSize - GRID.border * 2), px(swatchSize - GRID.border * 2));
      swatch.fill({ color });

      swatch.position.set(swatchX, swatchY);

      swatch.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
        console.log(`Selected color: #${color.toString(16).padStart(6, '0')}`);
        e.stopPropagation();
      });

      card.addChild(swatch);
    }

    // Resize handles - all edges and corners
    const handleThickness = px(1);
    const cornerSize = px(2);

    // Helper to create resize handle
    const createResizeHandle = (
      x: number,
      y: number,
      width: number,
      height: number,
      cursor: string,
      direction: 'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw'
    ) => {
      const handle = new PIXI.Graphics();
      handle.roundPixels = true;
      handle.eventMode = 'static';
      handle.cursor = cursor;
      handle.rect(0, 0, width, height);
      handle.fill({ color: 0x000000, alpha: 0.01 }); // Nearly invisible but interactive
      handle.position.set(x, y);

      handle.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
        isResizing = true;
        resizeDirection = direction;
        resizeStartX = e.client.x;
        resizeStartY = e.client.y;
        resizeStartCols = colorsPerRow;
        resizeStartRows = rows;
        e.stopPropagation();
      });

      card.addChild(handle);
    };

    // Corners (larger hit area)
    createResizeHandle(0, 0, cornerSize, cornerSize, 'nwse-resize', 'nw');
    createResizeHandle(px(cardWidth) - cornerSize, 0, cornerSize, cornerSize, 'nesw-resize', 'ne');
    createResizeHandle(0, cardHeight - cornerSize, cornerSize, cornerSize, 'nesw-resize', 'sw');
    createResizeHandle(px(cardWidth) - cornerSize, cardHeight - cornerSize, cornerSize, cornerSize, 'nwse-resize', 'se');

    // Edges
    createResizeHandle(cornerSize, 0, px(cardWidth) - cornerSize * 2, handleThickness, 'ns-resize', 'n');
    createResizeHandle(cornerSize, cardHeight - handleThickness, px(cardWidth) - cornerSize * 2, handleThickness, 'ns-resize', 's');
    createResizeHandle(0, cornerSize, handleThickness, cardHeight - cornerSize * 2, 'ew-resize', 'w');
    createResizeHandle(px(cardWidth) - handleThickness, cornerSize, handleThickness, cardHeight - cornerSize * 2, 'ew-resize', 'e');
  }

  // Global pointer events for dragging and resizing
  const handleGlobalMove = (e: PointerEvent) => {
    if (isDragging) {
      // Convert screen coordinates to canvas coordinates
      const canvas = renderer.canvas as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const deltaScreenX = e.clientX - dragStartX;
      const deltaScreenY = e.clientY - dragStartY;

      const deltaX = deltaScreenX * scaleX;
      const deltaY = deltaScreenY * scaleY;

      card.x = cardStartX + deltaX;
      card.y = cardStartY + deltaY;
    } else if (isResizing && resizeDirection) {
      const canvas = renderer.canvas as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const deltaScreenX = e.clientX - resizeStartX;
      const deltaScreenY = e.clientY - resizeStartY;
      const deltaX = deltaScreenX * scaleX;
      const deltaY = deltaScreenY * scaleY;

      // Calculate column/row changes based on direction
      const swatchWithGap = px(swatchSize + GRID.gap);

      // Horizontal resizing (columns)
      if (resizeDirection.includes('e')) {
        const deltaGridUnits = Math.round(deltaX / swatchWithGap);
        colorsPerRow = Math.max(1, resizeStartCols + deltaGridUnits);
      } else if (resizeDirection.includes('w')) {
        const deltaGridUnits = Math.round(-deltaX / swatchWithGap);
        colorsPerRow = Math.max(1, resizeStartCols + deltaGridUnits);
      }

      // Vertical resizing (rows)
      if (resizeDirection.includes('s')) {
        const deltaGridUnits = Math.round(deltaY / swatchWithGap);
        rows = Math.max(1, resizeStartRows + deltaGridUnits);
      } else if (resizeDirection.includes('n')) {
        const deltaGridUnits = Math.round(-deltaY / swatchWithGap);
        rows = Math.max(1, resizeStartRows + deltaGridUnits);
      }

      redraw();
    }
  };

  const handleGlobalUp = () => {
    isDragging = false;
    isResizing = false;
    resizeDirection = null;
  };

  // Mouse wheel zoom for swatch size
  const handleWheel = (e: WheelEvent) => {
    // Check if mouse is over the card
    const canvas = renderer.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const cardBounds = card.getBounds();

    if (mouseX >= cardBounds.x && mouseX <= cardBounds.x + cardBounds.width &&
        mouseY >= cardBounds.y && mouseY <= cardBounds.y + cardBounds.height) {

      e.preventDefault();

      // Scroll up = increase size, scroll down = decrease size
      const delta = e.deltaY > 0 ? -1 : 1;
      swatchSize = Math.max(4, Math.min(16, swatchSize + delta));
      redraw();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('pointermove', handleGlobalMove);
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('wheel', handleWheel, { passive: false });

    card.on('destroyed', () => {
      window.removeEventListener('pointermove', handleGlobalMove);
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('wheel', handleWheel);
    });
  }

  // Initial draw
  redraw();

  return card;
}

export async function initSpriteEditor() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  // Setup with pixel-perfect rendering
  const { scene, engine, renderer } = await setupMoxi({
    hostElement: root,
    showLoadingScene: false,
    renderOptions: {
      width: 1280,
      height: 720,
      backgroundColor: 0x999999,
      resolution: 1,
      antialias: false,
      roundPixels: true
    }
  });

  // Set pixel perfect rendering on canvas
  const canvas = renderer.canvas as HTMLCanvasElement;
  canvas.style.imageRendering = 'pixelated';
  canvas.style.imageRendering = '-moz-crisp-edges';
  canvas.style.imageRendering = 'crisp-edges';

  // Load pixel font
  await Assets.load([ASSETS.PIXEL_OPERATOR8_FONT]);

  // Create palette card
  const paletteCard = createPaletteCard(20, 20, renderer);
  scene.addChild(paletteCard);

  scene.init();
  engine.start();

  console.log('✅ Pixel Perfect Palette loaded');
  console.log(`Grid: ${GRID.unit}px base × ${GRID.scale}x scale = ${px(1)}px per grid unit`);
}
