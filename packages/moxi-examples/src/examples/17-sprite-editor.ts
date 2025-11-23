/**
 * Example 17: Sprite Editor - Scaled Pixel Perfect UI
 * All UI elements align to a consistent pixel grid
 */
import { setupMoxi } from 'moxi';
import * as PIXI from 'pixi.js';
import { Assets } from 'pixi.js';
import { ASSETS } from '../assets-config';
import { PixelCard, GRID, px, UI_COLORS, BORDER } from './editor/pixel-card';
import { createPixelButton } from './editor/pixel-button';
import { createToolIcon, ToolType } from './editor/tool-icons';

// Aerugo palette - for editor UI (32 colors)
const AERUGO_PALETTE = [
  0x2f1e1a, 0x4f3322, 0x723627, 0x95392c,
  0xc75533, 0xe76d46, 0x934e28, 0xa2663c,
  0xc87d40, 0xf5a95b, 0x6b8b8c, 0x81a38e,
  0xaac39e, 0xffffff, 0xd1d0ce, 0xbab7b2,
  0x898a8a, 0x686461, 0x554d4b, 0x3c3d3b,
  0x343230, 0x87d1ef, 0x64a1c2, 0x466480,
  0x2f485c, 0x242e35, 0x1b2026, 0xaa9c8a,
  0x917f6d, 0x86624a, 0x715b48, 0x5e4835
];

// PICO-8 palette - for user painting (16 colors)
const PICO8_PALETTE = [
  0x000000, 0x1d2b53, 0x7e2553, 0x008751,
  0xab5236, 0x5f574f, 0xc2c3c7, 0xfff1e8,
  0xff004d, 0xffa300, 0xffec27, 0x00e436,
  0x29adff, 0x83769c, 0xff77a8, 0xffccaa
];

/**
 * Creates a pixel-perfect palette card
 */
function createPaletteCard(x: number, y: number, renderer: PIXI.Renderer): PixelCard {
  // State
  let colorsPerRow = 4;
  let rows = 4;
  let swatchSize = 12; // Grid units (8 * 1.5 = 12)
  let selectedColorIndex = 0; // Track selected color

  // Calculate initial content size
  const contentWidth = colorsPerRow * swatchSize + (colorsPerRow - 1) * GRID.gap;
  const contentHeight = rows * swatchSize + (rows - 1) * GRID.gap;

  // Create the card
  const card = new PixelCard({
    title: 'Palette',
    x,
    y,
    contentWidth,
    contentHeight,
    renderer,
    onResize: (newWidth, newHeight) => {
      // Calculate new swatch size to fit the available space while showing all colors
      const totalColors = PICO8_PALETTE.length; // 16 colors

      // Try different column layouts and pick the best fitting size
      let bestSize = 2;
      let bestCols = 1;
      let bestRows = totalColors;

      for (let cols = 1; cols <= totalColors; cols++) {
        const rowsNeeded = Math.ceil(totalColors / cols);

        // Calculate max swatch size that fits in this layout
        const maxWidthPerSwatch = Math.floor((newWidth - (cols - 1) * GRID.gap) / cols);
        const maxHeightPerSwatch = Math.floor((newHeight - (rowsNeeded - 1) * GRID.gap) / rowsNeeded);
        const maxSize = Math.min(maxWidthPerSwatch, maxHeightPerSwatch);

        if (maxSize > bestSize) {
          bestSize = maxSize;
          bestCols = cols;
          bestRows = rowsNeeded;
        }
      }

      // Update layout
      swatchSize = Math.max(2, Math.min(32, bestSize));
      colorsPerRow = bestCols;
      rows = bestRows;
      redrawContent();
    }
  });

  const contentContainer = card.getContentContainer();

  // Redraw function - only updates content, not the whole card
  function redrawContent() {
    // Clear content container
    contentContainer.removeChildren();

    const totalSwatches = colorsPerRow * rows;

    // Draw color swatches
    for (let i = 0; i < Math.min(totalSwatches, PICO8_PALETTE.length); i++) {
      const color = PICO8_PALETTE[i];
      const col = i % colorsPerRow;
      const row = Math.floor(i / colorsPerRow);

      // Position relative to content container
      const swatchX = px(col * (swatchSize + GRID.gap));
      const swatchY = px(row * (swatchSize + GRID.gap));

      const swatch = createPixelButton({
        size: swatchSize,
        selected: i === selectedColorIndex,
        backgroundColor: color,
        selectionMode: 'highlight',
        actionMode: 'toggle',
        onClick: () => {
          selectedColorIndex = i;
          console.log(`Selected color #${i}: #${color.toString(16).padStart(6, '0')}`);
          redrawContent();
        }
      });

      swatch.position.set(swatchX, swatchY);
      contentContainer.addChild(swatch);
    }
  }

  // Mouse wheel zoom for swatch size
  const handleWheel = (e: WheelEvent) => {
    const canvas = renderer.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const cardBounds = card.container.getBounds();

    if (mouseX >= cardBounds.x && mouseX <= cardBounds.x + cardBounds.width &&
        mouseY >= cardBounds.y && mouseY <= cardBounds.y + cardBounds.height) {
      e.preventDefault();

      const delta = e.deltaY > 0 ? -1 : 1;
      swatchSize = Math.max(2, Math.min(32, swatchSize + delta));

      // Update card content size to match new swatch size
      const newContentWidth = colorsPerRow * swatchSize + (colorsPerRow - 1) * GRID.gap;
      const newContentHeight = rows * swatchSize + (rows - 1) * GRID.gap;
      card.setContentSize(newContentWidth, newContentHeight);

      redrawContent();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('wheel', handleWheel, { passive: false });

    card.container.on('destroyed', () => {
      window.removeEventListener('wheel', handleWheel);
    });
  }

  // Initial draw
  redrawContent();

  return card;
}

/**
 * Creates a tool selection card
 */
function createToolCard(x: number, y: number, renderer: PIXI.Renderer): PixelCard {
  // Tool state
  let selectedToolIndex = 0;
  const tools: ToolType[] = ['pencil', 'eraser', 'fill', 'eyedrop'];
  const toolNames: Record<ToolType, string> = {
    pencil: 'Pencil',
    eraser: 'Eraser',
    fill: 'Fill Bucket',
    eyedrop: 'Eye Dropper'
  };

  let toolWidth = 46; // Grid units per tool button width (38 * 1.2 = 45.6, rounded to 46)
  let toolHeight = 12; // Grid units per tool button height
  let toolsPerRow = 1; // One button per row (vertical layout)
  let rows = 4; // Four tools stacked vertically

  // Calculate content size
  const contentWidth = toolWidth;
  const contentHeight = rows * toolHeight + (rows - 1) * GRID.gap;

  // Create the card
  const card = new PixelCard({
    title: 'Tools',
    x,
    y,
    contentWidth,
    contentHeight,
    renderer,
    onResize: (newWidth, newHeight) => {
      // Update tool dimensions to fit the new size
      // Keep vertical layout (1 column, 4 rows)
      const maxHeight = Math.floor((newHeight - (rows - 1) * GRID.gap) / rows);
      toolHeight = Math.max(4, Math.min(20, maxHeight));
      toolWidth = Math.max(23, Math.min(86, newWidth)); // Updated min/max to reflect 44% wider (1.2 * 1.2)

      // Scale font proportionally with button height
      // Base: toolHeight=12 → fontScale=0.25 (16px)
      // Scale font linearly: fontScale = 0.25 * (toolHeight / 12)
      GRID.fontScale = Math.max(0.1, Math.min(0.5, 0.25 * (toolHeight / 12)));

      drawTools();
    }
  });

  const contentContainer = card.getContentContainer();

  // Draw tools
  function drawTools() {
    contentContainer.removeChildren();

    for (let i = 0; i < tools.length; i++) {
      const tool = tools[i];
      const row = i; // Vertical layout, one per row

      const toolX = 0;
      const toolY = px(row * (toolHeight + GRID.gap));

      const toolButton = createPixelButton({
        width: toolWidth,
        height: toolHeight,
        selected: i === selectedToolIndex,
        label: toolNames[tool],
        selectionMode: 'press',
        actionMode: 'toggle',
        tooltip: toolNames[tool],
        onClick: () => {
          selectedToolIndex = i;
          console.log(`Selected tool: ${tool}`);
          drawTools();
        }
      });

      toolButton.position.set(toolX, toolY);
      contentContainer.addChild(toolButton);
    }
  }

  // Mouse wheel zoom for tool size
  const handleWheel = (e: WheelEvent) => {
    const canvas = renderer.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const cardBounds = card.container.getBounds();

    if (mouseX >= cardBounds.x && mouseX <= cardBounds.x + cardBounds.width &&
        mouseY >= cardBounds.y && mouseY <= cardBounds.y + cardBounds.height) {
      e.preventDefault();

      const delta = e.deltaY > 0 ? -1 : 1;

      // Adjust both width and height proportionally
      toolWidth = Math.max(23, Math.min(86, toolWidth + delta * 2));
      toolHeight = Math.max(4, Math.min(20, toolHeight + delta));

      // Scale font proportionally with button height
      GRID.fontScale = Math.max(0.1, Math.min(0.5, 0.25 * (toolHeight / 12)));

      // Update card content size
      const newContentWidth = toolWidth;
      const newContentHeight = rows * toolHeight + (rows - 1) * GRID.gap;
      card.setContentSize(newContentWidth, newContentHeight);

      drawTools();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('wheel', handleWheel, { passive: false });

    card.container.on('destroyed', () => {
      window.removeEventListener('wheel', handleWheel);
    });
  }

  // Initial draw
  drawTools();

  return card;
}

/**
 * Creates an info bar for displaying contextual information in horizontal sections
 */
function createInfoBar(renderer: PIXI.Renderer): PixelCard {
  const canvasWidth = renderer.width;
  const canvasHeight = renderer.height;

  // Position near bottom with some margin
  const bottomMargin = 20;
  const barHeight = 8; // Grid units for a slim horizontal bar
  const barWidth = 10; // Grid units - will auto-size to content with minContentSize

  const x = 20;
  const y = canvasHeight - px(barHeight) - px(BORDER.total * 2) - bottomMargin - 24; // Account for title bar height

  // Create the card with custom background color
  const card = new PixelCard({
    title: 'Info',
    x,
    y,
    contentWidth: barWidth,
    contentHeight: barHeight,
    renderer,
    minContentSize: true, // Prevent resizing below content's actual size
    backgroundColor: 0xaac39e, // Light green background
    onResize: (newWidth, newHeight) => {
      updateInfoSections();
    }
  });

  const contentContainer = card.getContentContainer();

  function updateInfoSections() {
    contentContainer.removeChildren();

    // Define sections with labels and values
    const sections = [
      { label: 'Tool:', value: 'Pencil' },
      { label: 'Color:', value: '#000000' },
      { label: 'Position:', value: '0, 0' }
    ];

    let currentX = px(2);
    const sectionSpacing = px(4);

    sections.forEach((section, index) => {
      // Label text
      const labelText = new PIXI.BitmapText({
        text: section.label,
        style: {
          fontFamily: 'PixelOperator8Bitmap',
          fontSize: 64,
          fill: 0x81a38e, // Medium green for labels
        }
      });
      labelText.roundPixels = true;
      labelText.scale.set(GRID.fontScale);
      labelText.position.set(currentX, px(2));
      contentContainer.addChild(labelText);

      currentX += labelText.width + px(1);

      // Value text
      const valueText = new PIXI.BitmapText({
        text: section.value,
        style: {
          fontFamily: 'PixelOperator8Bitmap',
          fontSize: 64,
          fill: 0x686461, // Medium gray for values
        }
      });
      valueText.roundPixels = true;
      valueText.scale.set(GRID.fontScale);
      valueText.position.set(currentX, px(2));
      contentContainer.addChild(valueText);

      currentX += valueText.width + sectionSpacing;
    });
  }

  // Initial draw
  updateInfoSections();

  // Update minimum content size based on actual content
  card.updateMinContentSize();

  return card;
}

/**
 * Creates a commander bar for actions and options
 */
function createCommanderBar(renderer: PIXI.Renderer): PixelCard {
  const canvasWidth = renderer.width;
  const canvasHeight = renderer.height;

  // Position at top, docked left, almost full width
  const margin = 20;
  const barHeight = 12; // Grid units for commander bar

  // Calculate width in grid units (canvas width - margins, converted to grid units)
  const barWidth = Math.floor((canvasWidth - margin * 2 - px(BORDER.total * 2)) / px(1));

  const x = margin;
  const y = margin;

  // Create the card
  const card = new PixelCard({
    title: 'Commander',
    x,
    y,
    contentWidth: barWidth,
    contentHeight: barHeight,
    renderer,
    minContentSize: true, // Prevent resizing below content's actual size
    onResize: (newWidth, newHeight) => {
      drawCommands();
    }
  });

  const contentContainer = card.getContentContainer();

  function drawCommands() {
    contentContainer.removeChildren();

    const buttonWidth = 20; // Grid units
    const buttonHeight = 12; // Grid units (same as bar height for full height button)
    const buttonSpacing = px(2);

    let currentX = 0;

    // New button
    const newButton = createPixelButton({
      width: buttonWidth,
      height: buttonHeight,
      label: 'New',
      selectionMode: 'press',
      actionMode: 'click',
      onClick: () => {
        console.log('New button clicked');
      }
    });
    newButton.position.set(currentX, 0);
    contentContainer.addChild(newButton);
    currentX += px(buttonWidth) + buttonSpacing;
  }

  // Initial draw
  drawCommands();

  // Update minimum content size based on actual content
  card.updateMinContentSize();

  return card;
}

export async function initSpriteEditor() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  // Setup with pixel-perfect rendering
  const { scene, engine, renderer } = await setupMoxi({
    hostElement: root,
    showLoadingScene: false,
    pixelPerfect: true, // Enable all pixel-perfect settings
    renderOptions: {
      width: 1280,
      height: 720,
      backgroundColor: 0x3c3d3b, // Aerugo dark gray
    }
  });

  // Load pixel font
  await Assets.load([ASSETS.PIXEL_OPERATOR8_FONT]);

  // Install bitmap font at 64px for high quality, will scale down to 16px
  PIXI.BitmapFont.install({
    name: 'PixelOperator8Bitmap',
    style: {
      fontFamily: 'PixelOperator8',
      fontSize: 64,
      fill: 0xffffff,
    }
  });

  // Create commander bar at top
  const commanderBar = createCommanderBar(renderer);
  scene.addChild(commanderBar.container);

  // Calculate top offset for cards below commander bar
  const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24; // Commander bar total height
  const topOffset = 20 + commanderBarHeight + 10; // Margin + commander height + gap

  // Create palette card (left side)
  const paletteCard = createPaletteCard(20, topOffset, renderer);
  scene.addChild(paletteCard.container);

  // Create tool card (docked right)
  // Tool width (46) + borders + padding
  const toolCardWidth = px(46) + px(BORDER.total * 2) + px(GRID.padding * 2);
  const toolCard = createToolCard(renderer.width - toolCardWidth - 20, topOffset, renderer);
  scene.addChild(toolCard.container);

  // Create info bar
  const infoBar = createInfoBar(renderer);
  scene.addChild(infoBar.container);

  scene.init();
  engine.start();

  console.log('✅ Pixel Perfect Sprite Editor loaded');
  console.log(`Grid: ${GRID.unit}px base × ${GRID.scale}x scale = ${px(1)}px per grid unit`);
}
