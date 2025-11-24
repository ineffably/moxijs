/**
 * Example 17: Sprite Editor - Scaled Pixel Perfect UI
 * All UI elements align to a consistent pixel grid
 */
import { setupMoxi } from 'moxi';
import * as PIXI from 'pixi.js';
import { Assets } from 'pixi.js';
import { ASSETS } from '../assets-config';
import {
  PixelCard,
  GRID,
  px,
  UI_COLORS,
  BORDER,
  createPixelButton,
  createPixelDialog,
  createSpriteSheetCard,
  createSpriteCard,
  SpriteController,
  SPRITESHEET_CONFIGS,
  createSVGIconButton,
  SVG_ICONS,
  createToolIcon,
  ToolType,
  AERUGO_PALETTE,
  PICO8_PALETTE,
  getTheme,
  setThemeByMetadata,
  getAllThemes
} from '../editor';
import { UIStateManager, CardState } from '../editor/state/ui-state-manager';

/**
 * Helper: Creates a mouse wheel zoom handler for a card
 * Encapsulates the common zoom logic used by palette, tools, and sprite cards
 */
function createCardZoomHandler(
  renderer: PIXI.Renderer,
  card: PixelCard,
  onZoom: (delta: number, event: WheelEvent) => void
): (e: WheelEvent) => void {
  return (e: WheelEvent) => {
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
      onZoom(delta, e);
    }
  };
}

/**
 * Creates a pixel-perfect palette card
 */
function createPaletteCard(x: number, y: number, renderer: PIXI.Renderer, palette: number[]): PixelCard {
  // State
  let colorsPerRow = 4;
  let rows = 4;
  let swatchSize = 12; // Grid units (8 * 1.5 = 12)

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
      const totalColors = palette.length;

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
    },
    onRefresh: () => {
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
    for (let i = 0; i < Math.min(totalSwatches, palette.length); i++) {
      const color = palette[i];
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
  const handleWheel = createCardZoomHandler(renderer, card, (delta) => {
    swatchSize = Math.max(2, Math.min(32, swatchSize + delta));

    // Update card content size to match new swatch size
    const newContentWidth = colorsPerRow * swatchSize + (colorsPerRow - 1) * GRID.gap;
    const newContentHeight = rows * swatchSize + (rows - 1) * GRID.gap;
    card.setContentSize(newContentWidth, newContentHeight);

    redrawContent();
  });

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
  let fontScale = GRID.fontScale; // Local font scale that can be modified
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
      fontScale = Math.max(0.1, Math.min(0.5, 0.25 * (toolHeight / 12)));

      drawTools();
    },
    onRefresh: () => {
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
  const handleWheel = createCardZoomHandler(renderer, card, (delta) => {
    // Adjust both width and height proportionally
    toolWidth = Math.max(23, Math.min(86, toolWidth + delta * 2));
    toolHeight = Math.max(4, Math.min(20, toolHeight + delta));

    // Scale font proportionally with button height
    fontScale = Math.max(0.1, Math.min(0.5, 0.25 * (toolHeight / 12)));

    // Update card content size
    const newContentWidth = toolWidth;
    const newContentHeight = rows * toolHeight + (rows - 1) * GRID.gap;
    card.setContentSize(newContentWidth, newContentHeight);

    drawTools();
  });

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
 * Creates a sprite sheet tools toolbar (SPT)
 */
async function createSPTToolbar(renderer: PIXI.Renderer): Promise<PixelCard> {
  const canvasWidth = renderer.width;
  const canvasHeight = renderer.height;

  // Position on left side below palette
  const margin = 20;
  const buttonSize = 16; // Grid units - square buttons (4px = 1 grid unit, so +4px = +1 grid unit)
  const buttonSpacing = 1; // Grid units between buttons
  const numButtons = 2; // Pan and Zoom

  const barWidth = buttonSize; // Single column
  const barHeight = numButtons * buttonSize + (numButtons - 1) * buttonSpacing; // Stack vertically

  const x = margin;
  const y = margin + 200; // Below palette (approximate)

  // Create the card
  const card = new PixelCard({
    title: 'SPT',
    x,
    y,
    contentWidth: barWidth,
    contentHeight: barHeight,
    renderer,
    minContentSize: true,
    onRefresh: () => {
      updateButtons();
    }
  });

  const contentContainer = card.getContentContainer();

  let selectedTool = 'pan'; // Default selected tool

  // Create pan button
  const panButton = await createSVGIconButton({
    size: buttonSize,
    svgString: SVG_ICONS.PAN,
    iconColor: 0x000000,
    backgroundColor: UI_COLORS.buttonBg,
    selected: selectedTool === 'pan',
    selectionMode: 'press',
    actionMode: 'toggle',
    onClick: () => {
      selectedTool = 'pan';
      console.log('Pan tool selected');
      updateButtons();
    }
  });

  // Create zoom cursor button
  const zoomButton = await createSVGIconButton({
    size: buttonSize,
    svgString: SVG_ICONS.ZOOM_CURSOR,
    iconColor: 0x000000,
    backgroundColor: UI_COLORS.buttonBg,
    selected: selectedTool === 'zoom',
    selectionMode: 'press',
    actionMode: 'toggle',
    onClick: () => {
      selectedTool = 'zoom';
      console.log('Zoom tool selected');
      updateButtons();
    }
  });

  function updateButtons() {
    // Remove all buttons
    contentContainer.removeChildren();

    // Re-add with updated selection
    createSVGIconButton({
      size: buttonSize,
      svgString: SVG_ICONS.PAN,
      iconColor: 0x000000,
      backgroundColor: UI_COLORS.buttonBg,
      selected: selectedTool === 'pan',
      selectionMode: 'press',
      actionMode: 'toggle',
      onClick: () => {
        selectedTool = 'pan';
        console.log('Pan tool selected');
        updateButtons();
      }
    }).then(btn => {
      btn.position.set(0, 0);
      contentContainer.addChild(btn);
    });

    createSVGIconButton({
      size: buttonSize,
      svgString: SVG_ICONS.ZOOM_CURSOR,
      iconColor: 0x000000,
      backgroundColor: UI_COLORS.buttonBg,
      selected: selectedTool === 'zoom',
      selectionMode: 'press',
      actionMode: 'toggle',
      onClick: () => {
        selectedTool = 'zoom';
        console.log('Zoom tool selected');
        updateButtons();
      }
    }).then(btn => {
      btn.position.set(0, px(buttonSize + buttonSpacing));
      contentContainer.addChild(btn);
    });
  }

  panButton.position.set(0, 0);
  zoomButton.position.set(0, px(buttonSize + buttonSpacing));

  contentContainer.addChild(panButton);
  contentContainer.addChild(zoomButton);

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

  // Calculate initial width based on content
  const sections = [
    { label: 'Tool:', value: 'Pencil' },
    { label: 'Color:', value: '#000000' },
    { label: 'Scale:', value: '1x' }
  ];

  // Estimate width: each section takes roughly 20 grid units
  const barWidth = sections.length * 20;

  const x = 20;
  const y = canvasHeight - px(barHeight) - px(BORDER.total * 2) - bottomMargin - 24; // Account for title bar height

  // Create the card (uses default card background from theme)
  const card = new PixelCard({
    title: 'Info',
    x,
    y,
    contentWidth: barWidth,
    contentHeight: barHeight,
    renderer,
    minContentSize: true, // Prevent resizing below content's actual size
    onResize: (newWidth, newHeight) => {
      // Only update if the resize maintains horizontal layout
      if (newWidth >= barHeight) {
        updateInfoSections();
      }
    },
    onRefresh: () => {
      // Redraw content when theme changes
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
      { label: 'Scale:', value: '1x' }
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
          fill: getTheme().textSecondary, // Use theme secondary text
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
          fill: getTheme().textPrimary, // Use theme primary text
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
 * State for sprite sheets and editing
 */
interface SpriteSheetInstance {
  sheetCard: ReturnType<typeof createSpriteSheetCard>;
  spriteCard: ReturnType<typeof createSpriteCard> | null;
  spriteController: SpriteController | null;
}

let spriteSheetInstances: SpriteSheetInstance[] = [];
let activeSpriteSheetInstance: SpriteSheetInstance | null = null;
let currentPaletteCard: PixelCard | null = null;
let selectedColorIndex = 0; // Currently selected palette color
let currentPalette: number[] = PICO8_PALETTE; // Active palette (from active sprite sheet)

// Card registry for UI state persistence
const cardRegistry = new Map<string, PixelCard>();
let uiStateSaveTimer: number | null = null;

/**
 * Apply default layout positions to all cards
 */
function applyDefaultLayout() {
  const renderer = (window as any).renderer;
  if (!renderer) return;

  const margin = 20;
  const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24;
  const topOffset = commanderBarHeight + 10;

  // Position commander bar at top (y=0, x=0)
  const commanderCard = cardRegistry.get('commander');
  if (commanderCard) {
    commanderCard.container.position.set(0, 0);
  }

  // Position palette card below commander on the left
  const paletteCard = cardRegistry.get('palette');
  if (paletteCard) {
    paletteCard.container.position.set(margin, topOffset);
  }

  // Position info bar at bottom left
  const infoCard = cardRegistry.get('info');
  if (infoCard) {
    const bottomMargin = 20;
    const barHeight = 8;
    const y = renderer.height - px(barHeight) - px(BORDER.total * 2) - bottomMargin - 24;
    infoCard.container.position.set(margin, y);
  }

  // Position sprite sheets at their default location (bottom right, minimap style)
  cardRegistry.forEach((card, id) => {
    if (id.startsWith('sprite-sheet-')) {
      // Get the sprite sheet's default position (bottom right)
      const cardBounds = card.container.getBounds();
      const defaultX = renderer.width - cardBounds.width - margin;
      const defaultY = renderer.height - cardBounds.height - margin;
      card.container.position.set(defaultX, defaultY);
    }
  });

  // Position sprite cards centered below commander bar
  cardRegistry.forEach((card, id) => {
    if (id.startsWith('sprite-card-')) {
      const cardBounds = card.container.getBounds();
      const gapBelowCommander = 10;
      const x = (renderer.width - cardBounds.width) / 2;
      const y = margin + commanderBarHeight + gapBelowCommander;
      card.container.position.set(x, y);
    }
  });

  // Save the new layout
  saveUIState();

  console.log('✅ Default layout applied');
}

/**
 * Save current UI state to localStorage (debounced)
 */
function saveUIState() {
  // Debounce: wait 500ms after last change before saving
  if (uiStateSaveTimer) {
    clearTimeout(uiStateSaveTimer);
  }

  uiStateSaveTimer = window.setTimeout(() => {
    const stateMap = new Map<string, CardState>();

    // Export all card states
    cardRegistry.forEach((card, id) => {
      stateMap.set(id, card.exportState(id));
    });

    const renderer = (window as any).renderer;
    UIStateManager.saveState(stateMap, renderer.width, renderer.height);
  }, 500);
}

/**
 * Register a card and setup auto-save on state changes
 */
function registerCard(id: string, card: PixelCard) {
  cardRegistry.set(id, card);
  card.onStateChanged(() => saveUIState());
}

/**
 * Updates the palette card to match the active sprite sheet
 */
function updatePaletteForActiveSheet() {
  if (!activeSpriteSheetInstance) return;

  const renderer = (window as any).renderer;
  const scene = (window as any).scene;

  // Remove old palette card
  if (currentPaletteCard) {
    scene.removeChild(currentPaletteCard.container);
  }

  // Get palette from active sprite sheet
  currentPalette = activeSpriteSheetInstance.sheetCard.controller.getConfig().palette;

  // Recreate palette card with the correct palette
  const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24;
  const topOffset = 20 + commanderBarHeight + 10;
  const paletteCard = createPaletteCard(20, topOffset, renderer, currentPalette);
  scene.addChild(paletteCard.container);
  currentPaletteCard = paletteCard;

  // Also update the reference used for theme updates
  (window as any).paletteCardRef = paletteCard;
}

/**
 * Creates a new sprite sheet and sprite card
 */
function createNewSpriteSheet(type: 'PICO-8' | 'TIC-80', showGrid: boolean) {
  const renderer = (window as any).renderer;
  const scene = (window as any).scene;

  // Check if we've hit the limit
  const MAX_SPRITE_SHEETS = 2;
  if (spriteSheetInstances.length >= MAX_SPRITE_SHEETS) {
    // Show dialog telling user they've hit the limit
    const dialog = createPixelDialog({
      title: 'Sprite Sheet Limit',
      message: `Maximum ${MAX_SPRITE_SHEETS} sprite sheets allowed.`,
      buttons: [
        {
          label: 'OK',
          onClick: () => {
            // Dialog will close automatically
          }
        }
      ],
      renderer
    });
    scene.addChild(dialog);
    return;
  }

  // Create the instance object
  const instance: SpriteSheetInstance = {
    sheetCard: null as any, // Will be set below
    spriteCard: null,
    spriteController: null
  };

  // Function to make this sprite sheet active and bring to front
  const makeThisSheetActive = () => {
    // Set as active
    activeSpriteSheetInstance = instance;

    // Update palette to match this sheet
    updatePaletteForActiveSheet();

    // Bring both sprite sheet and sprite card to front
    // Strategy: Remove both, then re-add in order (sheet first, sprite second)
    // This ensures they're on top and sprite card is above sprite sheet
    if (instance.sheetCard) {
      scene.removeChild(instance.sheetCard.card.container);
    }
    if (instance.spriteCard) {
      scene.removeChild(instance.spriteCard.card.container);
    }

    // Re-add in order - sprite sheet first, then sprite card
    if (instance.sheetCard) {
      scene.addChild(instance.sheetCard.card.container);
    }
    if (instance.spriteCard) {
      scene.addChild(instance.spriteCard.card.container);
    }

    console.log(`Activated ${type} sprite sheet - brought to front`);
  };

  // Helper function to create sprite card for a cell
  const createSpriteCardForCell = (cellX: number, cellY: number) => {
    console.log(`Selected cell: ${cellX}, ${cellY}`);

    // Make sure this sheet is active when selecting a cell
    makeThisSheetActive();

    // Create or update sprite controller for this cell
    const spriteController = new SpriteController({
      spriteSheetController: instance.sheetCard.controller,
      cellX,
      cellY,
      scale: 32 // Large scale for editing (twice as large)
    });

    // Save existing sprite card position if it exists
    let spriteCardX: number;
    let spriteCardY: number;

    if (instance.spriteCard) {
      // Reuse existing position
      spriteCardX = instance.spriteCard.card.container.x;
      spriteCardY = instance.spriteCard.card.container.y;
      scene.removeChild(instance.spriteCard.card.container);
    } else {
      // Create sprite card at default position - just below commander bar, centered horizontally
      const spriteCardDims = spriteController.getScaledDimensions();
      const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24; // Title bar height
      const topMargin = 20;
      const gapBelowCommander = 10;

      spriteCardX = (renderer.width - spriteCardDims.width) / 2;
      spriteCardY = topMargin + commanderBarHeight + gapBelowCommander;
    }

    const spriteCardResult = createSpriteCard({
      x: spriteCardX,
      y: spriteCardY,
      renderer,
      spriteController,
      onPixelClick: (x, y) => {
        // Draw with currently selected color
        spriteController.setPixel(x, y, selectedColorIndex);

        // Re-render both cards
        spriteController.render(spriteCardResult.card.getContentContainer().children[0] as PIXI.Container);
        instance.sheetCard.controller.render(instance.sheetCard.card.getContentContainer());
      },
      onFocus: makeThisSheetActive
    });

    scene.addChild(spriteCardResult.card.container);
    instance.spriteCard = spriteCardResult;
    instance.spriteController = spriteController;

    // Register sprite card for state persistence
    const sheetIndex = spriteSheetInstances.indexOf(instance);
    registerCard(`sprite-card-${sheetIndex}`, spriteCardResult.card);

    // Link the paired cards
    spriteCardResult.card.setPairedCard(instance.sheetCard.card);
    instance.sheetCard.card.setPairedCard(spriteCardResult.card);

    // Setup mouse wheel zoom for sprite card
    const handleSpriteZoom = createCardZoomHandler(renderer, spriteCardResult.card, (delta) => {
      const currentScale = spriteController.getScale();
      const newScale = Math.max(1, Math.min(32, currentScale + delta));

      if (newScale !== currentScale) {
        spriteController.setScale(newScale);

        // Update card title
        spriteCardResult.card.setTitle(`Sprite (${newScale}x)`);

        // Update card content size to match new scale
        const dims = spriteController.getScaledDimensions();
        const newContentWidth = Math.ceil(dims.width / px(1));
        const newContentHeight = Math.ceil(dims.height / px(1));
        spriteCardResult.card.setContentSize(newContentWidth, newContentHeight);

        // Re-render sprite
        spriteCardResult.redraw();
      }
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('wheel', handleSpriteZoom, { passive: false });

      spriteCardResult.card.container.on('destroyed', () => {
        window.removeEventListener('wheel', handleSpriteZoom);
      });
    }
  };

  // Create sprite sheet card with focus callback
  const spriteSheetResult = createSpriteSheetCard({
    config: SPRITESHEET_CONFIGS[type],
    renderer,
    showGrid,
    onCellHover: (cellX, cellY) => {
      // Update info bar or show tooltip with cell coordinates
      console.log(`Hovering cell: ${cellX}, ${cellY}`);
    },
    onCellClick: (cellX, cellY) => {
      createSpriteCardForCell(cellX, cellY);
    },
    onFocus: makeThisSheetActive
  });

  scene.addChild(spriteSheetResult.card.container);
  instance.sheetCard = spriteSheetResult;

  // Register sprite sheet card for state persistence
  const sheetIndex = spriteSheetInstances.length;
  registerCard(`sprite-sheet-${sheetIndex}`, spriteSheetResult.card);

  // Add to instances array
  spriteSheetInstances.push(instance);

  // Set as active sprite sheet
  activeSpriteSheetInstance = instance;

  // Update palette to match this sprite sheet
  updatePaletteForActiveSheet();

  // Automatically select top-left cell (0, 0) and show sprite card
  spriteSheetResult.controller.selectCell(0, 0);
  createSpriteCardForCell(0, 0);

  console.log(`Created ${type} sprite sheet`, spriteSheetResult.controller);
}

/**
 * Creates a commander bar for actions and options
 */
function createCommanderBar(renderer: PIXI.Renderer, scene: PIXI.Container): PixelCard {
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
    },
    onRefresh: () => {
      drawCommands();
    }
  });

  const contentContainer = card.getContentContainer();

  function drawCommands() {
    contentContainer.removeChildren();

    const buttonHeight = 12; // Grid units (same as bar height for full height button)
    const buttonSpacing = px(2);

    // Left side buttons (starting at x=0)
    let currentX = 0;

    // New button - shows dialog to choose sprite sheet type
    const newButton = createPixelButton({
      height: buttonHeight,
      label: 'New',
      selectionMode: 'press',
      actionMode: 'click',
      onClick: () => {
        // Show dialog to choose sprite sheet type
        const dialog = createPixelDialog({
          title: 'New Sprite Sheet',
          message: 'Choose sprite sheet type:',
          checkboxes: [
            {
              name: 'showGrid',
              label: 'Show 8x8 Grid',
              defaultValue: true
            }
          ],
          buttons: [
            {
              label: 'PICO-8',
              onClick: (checkboxStates) => {
                createNewSpriteSheet('PICO-8', checkboxStates?.showGrid ?? false);
              }
            },
            {
              label: 'TIC-80',
              onClick: (checkboxStates) => {
                createNewSpriteSheet('TIC-80', checkboxStates?.showGrid ?? false);
              }
            }
          ],
          renderer
        });
        scene.addChild(dialog);
      }
    });
    newButton.position.set(currentX, 0);
    contentContainer.addChild(newButton);

    // Right side buttons - positioned at the far right
    const rightButtonsSpacing = px(2);

    // Layout button (auto-sized based on text)
    const layoutButton = createPixelButton({
      height: buttonHeight,
      label: 'Layout',
      selectionMode: 'press',
      actionMode: 'click',
      onClick: () => {
        // Show layout dialog
        const dialog = createPixelDialog({
          title: 'Layout',
          message: 'Choose layout preset:',
          buttons: [
            {
              label: 'Default',
              onClick: () => {
                applyDefaultLayout();
              }
            }
          ],
          renderer
        });
        scene.addChild(dialog);
      }
    });

    // Theme button (auto-sized based on text)
    const themeButton = createPixelButton({
      height: buttonHeight,
      label: 'Theme',
      selectionMode: 'press',
      actionMode: 'click',
      onClick: () => {
        // Show theme selection dialog
        // Dynamically create buttons from all available themes
        const allThemes = getAllThemes();
        const dialog = createPixelDialog({
          title: 'Choose Theme',
          message: 'Select a theme:',
          buttons: allThemes.map(themeMetadata => ({
            label: themeMetadata.name,
            onClick: () => {
              setThemeByMetadata(themeMetadata);
              // Update theme without recreating UI (preserves state)
              (window as any).updateTheme();
            }
          })),
          renderer
        });
        scene.addChild(dialog);
      }
    });

    // Position right-side buttons (get their widths after creation)
    const layoutButtonWidth = layoutButton.width / px(1); // Convert from pixels to grid units
    const themeButtonWidth = themeButton.width / px(1);

    // Position before theme button (content width - both buttons - spacing)
    layoutButton.position.set(px(barWidth - layoutButtonWidth - themeButtonWidth) - rightButtonsSpacing, 0);
    contentContainer.addChild(layoutButton);

    // Position at far right (content width - button width)
    themeButton.position.set(px(barWidth - themeButtonWidth), 0);
    contentContainer.addChild(themeButton);
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
      backgroundColor: getTheme().backgroundRoot, // Use theme root background
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

  // Keep references to all UI cards for theme updates
  let commanderBarCard: PixelCard;
  let paletteCardRef: PixelCard;
  let infoBarCard: PixelCard;

  /**
   * Restore UI state from localStorage
   */
  function restoreUIState() {
    const savedState = UIStateManager.loadState();
    if (!savedState) return false;

    // Adjust for canvas size changes
    const adjustedState = UIStateManager.adjustForCanvasSize(
      savedState,
      renderer.width,
      renderer.height
    );

    // Restore each card's state
    adjustedState.cards.forEach(cardState => {
      const card = cardRegistry.get(cardState.id);
      if (card) {
        card.importState(cardState);
      }
    });

    console.log('✅ UI state restored');
    return true;
  }

  // Function to update theme without losing state
  function updateTheme() {
    // Update renderer background
    renderer.background.color = getTheme().backgroundRoot;

    // Refresh all cards to apply new theme colors
    if (commanderBarCard) commanderBarCard.refresh();

    // Get current palette card reference (may be updated by updatePaletteForActiveSheet)
    const currentPalette = (window as any).paletteCardRef || paletteCardRef;
    if (currentPalette) currentPalette.refresh();

    if (infoBarCard) infoBarCard.refresh();

    // Refresh all sprite sheet instance cards
    spriteSheetInstances.forEach(instance => {
      if (instance.sheetCard) {
        instance.sheetCard.card.refresh();
      }
      if (instance.spriteCard) {
        instance.spriteCard.card.refresh();
      }
    });

    console.log('✨ Theme updated without losing state');
  }

  // Function to recreate all UI with current theme
  async function recreateUI() {
    // Remove all UI
    scene.removeChildren();

    // Update renderer background
    renderer.background.color = getTheme().backgroundRoot;

    // Recreate commander bar at top
    commanderBarCard = createCommanderBar(renderer, scene);
    scene.addChild(commanderBarCard.container);
    registerCard('commander', commanderBarCard);

    // Calculate top offset for cards below commander bar
    const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24;
    const topOffset = 20 + commanderBarHeight + 10;

    // Recreate palette card with current palette
    paletteCardRef = createPaletteCard(20, topOffset, renderer, currentPalette);
    scene.addChild(paletteCardRef.container);
    registerCard('palette', paletteCardRef);

    // Recreate SPT toolbar - HIDDEN
    // const paletteCardHeight = paletteCard.container.getBounds().height;
    // const sptToolbar = await createSPTToolbar(renderer);
    // sptToolbar.container.y = topOffset + paletteCardHeight + 10;
    // scene.addChild(sptToolbar.container);

    // Recreate tool card - HIDDEN
    // const toolCardWidth = px(46) + px(BORDER.total * 2) + px(GRID.padding * 2);
    // const toolCard = createToolCard(renderer.width - toolCardWidth - 20, topOffset, renderer);
    // scene.addChild(toolCard.container);

    // Recreate info bar
    infoBarCard = createInfoBar(renderer);
    scene.addChild(infoBarCard.container);
    registerCard('info', infoBarCard);

    // Restore UI state if available
    restoreUIState();
  }

  // Make renderer, scene, and functions available globally
  (window as any).renderer = renderer;
  (window as any).scene = scene;
  (window as any).recreateUI = recreateUI;
  (window as any).updateTheme = updateTheme;

  // Initial UI creation
  await recreateUI();

  scene.init();
  engine.start();

  console.log('✅ Pixel Perfect Sprite Editor loaded');
  console.log(`Grid: ${GRID.unit}px base × ${GRID.scale}x scale = ${px(1)}px per grid unit`);
}
