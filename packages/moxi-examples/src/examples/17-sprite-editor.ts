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

/**
 * Creates a pixel-perfect palette card
 */
function createPaletteCard(x: number, y: number, renderer: PIXI.Renderer): PixelCard {
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
 * State for current sprite sheet and sprite being edited
 */
let currentSpriteSheetCard: ReturnType<typeof createSpriteSheetCard> | null = null;
let currentSpriteCard: ReturnType<typeof createSpriteCard> | null = null;
let selectedColorIndex = 0; // Currently selected palette color

/**
 * Creates a new sprite sheet and sprite card
 */
function createNewSpriteSheet(type: 'PICO-8' | 'TIC-80', showGrid: boolean) {
  // Remove old sprite sheet and sprite card if they exist
  if (currentSpriteSheetCard) {
    (window as any).scene.removeChild(currentSpriteSheetCard.card.container);
  }
  if (currentSpriteCard) {
    (window as any).scene.removeChild(currentSpriteCard.card.container);
  }

  const renderer = (window as any).renderer;
  const scene = (window as any).scene;

  // Helper function to create sprite card for a cell
  const createSpriteCardForCell = (cellX: number, cellY: number) => {
    console.log(`Selected cell: ${cellX}, ${cellY}`);

    // Create or update sprite controller for this cell
    const spriteController = new SpriteController({
      spriteSheetController: spriteSheetResult.controller,
      cellX,
      cellY,
      scale: 32 // Large scale for editing (twice as large)
    });

    // Remove old sprite card if it exists
    if (currentSpriteCard) {
      scene.removeChild(currentSpriteCard.card.container);
    }

    // Create sprite card - just below commander bar, centered horizontally
    const spriteCardDims = spriteController.getScaledDimensions();
    const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24; // Title bar height
    const topMargin = 20;
    const gapBelowCommander = 10;

    const spriteCardX = (renderer.width - spriteCardDims.width) / 2;
    const spriteCardY = topMargin + commanderBarHeight + gapBelowCommander;

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
        spriteSheetResult.controller.render(spriteSheetResult.card.getContentContainer());
      }
    });

    scene.addChild(spriteCardResult.card.container);
    currentSpriteCard = spriteCardResult;
  };

  // Create sprite sheet card
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
    }
  });

  scene.addChild(spriteSheetResult.card.container);
  currentSpriteSheetCard = spriteSheetResult;

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
    }
  });

  const contentContainer = card.getContentContainer();

  function drawCommands() {
    contentContainer.removeChildren();

    const buttonWidth = 20; // Grid units
    const buttonHeight = 12; // Grid units (same as bar height for full height button)
    const buttonSpacing = px(2);

    // Left side buttons (starting at x=0)
    let currentX = 0;

    // New button - shows dialog to choose sprite sheet type
    const newButton = createPixelButton({
      width: buttonWidth,
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

    // Right side button (Theme) - positioned at the far right
    const themeButtonWidth = 24; // Grid units
    const themeButton = createPixelButton({
      width: themeButtonWidth,
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
              // Use global recreateUI function
              (window as any).recreateUI();
            }
          })),
          renderer
        });
        scene.addChild(dialog);
      }
    });
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

  // Function to recreate all UI with current theme
  async function recreateUI() {
    // Remove all UI
    scene.removeChildren();

    // Update renderer background
    renderer.background.color = getTheme().backgroundRoot;

    // Recreate commander bar at top
    const commanderBar = createCommanderBar(renderer, scene);
    scene.addChild(commanderBar.container);

    // Calculate top offset for cards below commander bar
    const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24;
    const topOffset = 20 + commanderBarHeight + 10;

    // Recreate palette card
    const paletteCard = createPaletteCard(20, topOffset, renderer);
    scene.addChild(paletteCard.container);

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
    const infoBar = createInfoBar(renderer);
    scene.addChild(infoBar.container);
  }

  // Make renderer, scene, and recreateUI available globally
  (window as any).renderer = renderer;
  (window as any).scene = scene;
  (window as any).recreateUI = recreateUI;

  // Initial UI creation
  await recreateUI();

  scene.init();
  engine.start();

  console.log('✅ Pixel Perfect Sprite Editor loaded');
  console.log(`Grid: ${GRID.unit}px base × ${GRID.scale}x scale = ${px(1)}px per grid unit`);
}
