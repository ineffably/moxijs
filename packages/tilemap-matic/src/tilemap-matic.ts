/**
 * [T]ile[Map]Matic
 * Full-featured sprite sheet / tile map management with project persistence
 *
 * Features:
 * - Drag and drop sprite sheet loading
 * - Project persistence via localStorage
 * - Multi-sheet library with carousel navigation
 * - Per-sheet grid configuration
 * - Tile region merging (Ctrl+J) and splitting (Ctrl+K)
 * - Individual and project export
 * - Tab view: Sheet (visual) and JSON (export preview)
 */
import { setupMoxi } from '@moxijs/core';
import {
  UILabel,
  UILayer,
  UIFocusManager,
  UIButton,
  FlexContainer,
  FlexDirection,
  FlexJustify,
  FlexAlign,
  EdgeInsets,
  CardPanel,
  FlatCardStyle
} from '@moxijs/ui';
import { Sprite, Container, Graphics, Texture, Assets, BitmapFont, AnimatedSprite, Rectangle, Text } from 'pixi.js';
import {
  SpriteSheetProjectManager,
  SpriteSheetEntry
} from './sprite-sheet-project';
import {
  SpriteSheetConfigPanel
} from './sprite-sheet-config-panel';
import {
  createGridOverlay,
  createCellHighlight,
  pixelToCell,
  cellToIndex
} from './sprite-sheet-grid';
import { GridSettings, AnimationSequence, TileRegion } from './sprite-sheet-data';
import { SpriteCarousel, CarouselItem } from './sprite-carousel';
import { CanvasPanZoom } from './canvas-pan-zoom';
import { AnimationRegionLibraryPanel } from './animation-region-library-panel';

type CleanupFunction = () => void;

/**
 * TileMapMatic configuration options
 */
export interface TileMapMaticOptions {
  /** Host element to render into (default: looks for #app) */
  hostElement?: HTMLElement;
  /** Canvas width (default: 1280) */
  width?: number;
  /** Canvas height (default: 720) */
  height?: number;
  /** Background color (default: 0x1a1a2e) */
  backgroundColor?: number;
  /** Font asset path (optional - will use default bundled font if not provided) */
  fontPath?: string;
  /** Skip font loading (useful when fonts are already loaded by parent app) */
  skipFontLoading?: boolean;
}

/**
 * Initialize TileMapMatic
 */
export async function initTileMapMatic(options: TileMapMaticOptions = {}): Promise<CleanupFunction> {
  const root = options.hostElement || document.getElementById('app');
  if (!root) throw new Error('Host element not found');

  const width = options.width ?? 1280;
  const height = options.height ?? 720;
  const backgroundColor = options.backgroundColor ?? 0x18181b; // Neutral dark gray

  const { scene, engine, renderer } = await setupMoxi({
    hostElement: root,
    showLoadingScene: false,
    renderOptions: {
      width,
      height,
      backgroundColor,
    }
  });

  // Load fonts (unless skipped - e.g., when parent app already loaded them)
  if (!options.skipFontLoading) {
    const fontPath = options.fontPath || './assets/fonts/pixel_operator/PixelOperator8.ttf';
    await Assets.load({
      alias: 'PixelOperator8',
      src: fontPath,
      data: { family: 'PixelOperator8' }
    });

    // Install as BitmapFont for pixel-perfect text rendering
    BitmapFont.install({
      name: 'PixelOperator8Bitmap',
      style: {
        fontFamily: 'PixelOperator8',
        fontSize: 16,
        fill: 0xffffff,
      }
    });

    console.log('🔤 TileMapMatic: PixelOperator8 font loaded');
  }

  // Initialize project manager (loads from localStorage)
  const projectManager = new SpriteSheetProjectManager();

  // Create focus manager for keyboard navigation
  const focusManager = new UIFocusManager();

  // Create UI Layer
  const uiLayer = new UILayer({
    targetWidth: renderer.width,
    targetHeight: renderer.height
  });
  scene.addChild(uiLayer);

  // Layout constants
  const HEADER_HEIGHT = 50;
  const CAROUSEL_WIDTH = 140;
  const CONFIG_PANEL_WIDTH = 200;
  const CONTENT_PADDING = 10;

  // Calculate content area dimensions
  const contentX = CAROUSEL_WIDTH;
  const contentY = HEADER_HEIGHT;
  const contentWidth = renderer.width - CAROUSEL_WIDTH; // Fill to right edge, panels overlay
  const contentHeight = renderer.height - HEADER_HEIGHT;

  // === HEADER ===
  const headerContainer = new FlexContainer({
    direction: FlexDirection.Row,
    justify: FlexJustify.SpaceBetween,
    align: FlexAlign.Center,
    padding: EdgeInsets.symmetric(0, 20),
    width: renderer.width,
    height: HEADER_HEIGHT,
    backgroundColor: 0x2a2a2f
  });

  // Brackets highlight key letters: [T]ile[Map]Matic - intentional styling
  const titleLabel = new UILabel({
    text: '[T]ile[Map]Matic (ALPHA!)',
    fontSize: 22,
    color: 0x9acd32, // Muted lime green (yellowgreen)
    fontWeight: 'bold'
  });
  headerContainer.addChild(titleLabel);

  const infoLabel = new UILabel({
    text: 'Drop sprite sheets to add to project',
    fontSize: 13,
    color: 0xaaaaaa
  });
  headerContainer.addChild(infoLabel);

  headerContainer.layout(renderer.width, HEADER_HEIGHT);
  headerContainer.container.position.set(0, 0);
  uiLayer.addChild(headerContainer.container);

  // === LIBRARY CARD PANEL (Left Side - contains carousel) ===
  const LIBRARY_TITLE_HEIGHT = 28; // Approximate title bar height
  const libraryCardPanel = new CardPanel({
    title: { text: 'Library', fontSize: 12 },
    bodyWidth: CAROUSEL_WIDTH,
    bodyHeight: renderer.height - HEADER_HEIGHT - LIBRARY_TITLE_HEIGHT,
    draggable: false,
    style: new FlatCardStyle({
      showShadow: true,
      shadowOffset: 6,
      shadowAlpha: 0.4
    }),
    colors: {
      background: 0x222226,
      border: 0x404045,
      titleBar: 0x2a2a2e,
      titleText: 0x9acd32 // Muted lime green to match app title
    }
  });
  libraryCardPanel.container.position.set(0, HEADER_HEIGHT);
  scene.addChild(libraryCardPanel.container);

  // Carousel inside the library card panel body
  const carousel = new SpriteCarousel({
    width: CAROUSEL_WIDTH,
    height: renderer.height - HEADER_HEIGHT - LIBRARY_TITLE_HEIGHT,
    orientation: 'vertical',
    showAddButton: true,
    showLabels: true,
    thumbnailSize: 80,
    itemSpacing: 12,
    backgroundColor: 0x222226,
    reticleColor: 0x9acd32
  });
  // Add carousel to the card panel body (no shadow since panel has it)
  libraryCardPanel.getBodyContainer().addChild(carousel);

  // Hidden file input for add button
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  carousel.onAddClick(() => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      await loadImageFile(file);
      fileInput.value = ''; // Reset for next selection
    }
  });

  // === SHEET VIEW (Canvas Area with mask for clipping) ===
  const canvasContainer = new Container();
  canvasContainer.position.set(contentX, contentY);
  uiLayer.addChild(canvasContainer);

  // Background
  const canvasBg = new Graphics();
  canvasBg.rect(0, 0, contentWidth, contentHeight);
  canvasBg.fill({ color: 0x18181b }); // Neutral dark gray
  canvasContainer.addChild(canvasBg);

  // Canvas area (holds sprite, grid, etc)
  const canvasArea = new Container();
  canvasContainer.addChild(canvasArea);

  // Mask to clip content to bounds
  const canvasMask = new Graphics();
  canvasMask.rect(0, 0, contentWidth, contentHeight);
  canvasMask.fill({ color: 0xffffff });
  canvasContainer.addChild(canvasMask);
  canvasArea.mask = canvasMask;

  // Sprite display state
  let spriteDisplay: Sprite | null = null;
  let gridOverlay: Graphics | null = null;
  let cellHighlight: Graphics | null = null;
  let selectedCells: Array<{ col: number; row: number }> = []; // Multi-select support
  let displayedSheetId: string | null = null; // Track which sheet is currently displayed
  let regionOverlays: Graphics[] = []; // Visual overlays for tile regions

  // Animation creation mode state
  let animationCreationMode = false;
  let animationFrames: Array<{ col: number; row: number }> = []; // Ordered frames for animation
  let animationNumberOverlays: Container[] = []; // Number badges showing frame order
  let animationPreviewSprite: AnimatedSprite | null = null; // Live preview of animation being created
  let animationPreviewContainer: Container | null = null; // Container for preview

  // === DROP ZONE HINT ===
  const dropHintContainer = new Container();
  const dropHint = new Graphics();
  const dropHintText = new Text({
    text: 'Drag your spritesheets here',
    style: {
      fontSize: 18,
      fill: 0x4a5a28, // Very muted lime green
      fontFamily: 'Arial'
    }
  });
  dropHintText.anchor.set(0.5, 0.5);
  dropHintContainer.addChild(dropHint);
  dropHintContainer.addChild(dropHintText);

  function drawDropHint(active: boolean = false) {
    dropHint.clear();
    dropHintContainer.visible = !projectManager.hasSheets();

    if (!projectManager.hasSheets()) {
      const margin = 50;
      const w = 400;
      const h = 150;
      const x = margin;
      const y = margin;
      const dashLen = 12;
      const gapLen = 8;
      const color = active ? 0x9acd32 : 0x4a5a28; // Muted lime green when inactive

      // Draw dashed rectangle
      // Top edge
      for (let i = 0; i < w; i += dashLen + gapLen) {
        dropHint.moveTo(x + i, y);
        dropHint.lineTo(x + Math.min(i + dashLen, w), y);
      }
      // Bottom edge
      for (let i = 0; i < w; i += dashLen + gapLen) {
        dropHint.moveTo(x + i, y + h);
        dropHint.lineTo(x + Math.min(i + dashLen, w), y + h);
      }
      // Left edge
      for (let i = 0; i < h; i += dashLen + gapLen) {
        dropHint.moveTo(x, y + i);
        dropHint.lineTo(x, y + Math.min(i + dashLen, h));
      }
      // Right edge
      for (let i = 0; i < h; i += dashLen + gapLen) {
        dropHint.moveTo(x + w, y + i);
        dropHint.lineTo(x + w, y + Math.min(i + dashLen, h));
      }
      dropHint.stroke({ color, width: 2 });

      // Center the text
      dropHintText.x = x + w / 2;
      dropHintText.y = y + h / 2;
      dropHintText.style.fill = color;
    }
  }
  canvasArea.addChild(dropHintContainer);
  drawDropHint();

  // === PAN/ZOOM STATE PERSISTENCE ===
  const ZOOM_STATE_KEY = 'tilemap-matic-zoom-state';
  let zoomSaveTimeout: ReturnType<typeof setTimeout> | null = null;

  function saveZoomState(scale: number, x: number, y: number): void {
    // Debounce saves to avoid excessive writes
    if (zoomSaveTimeout) {
      clearTimeout(zoomSaveTimeout);
    }
    zoomSaveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(ZOOM_STATE_KEY, JSON.stringify({ scale, x, y }));
      } catch (e) {
        // Silently fail
      }
    }, 300);
  }

  function loadZoomState(): { scale: number; x: number; y: number } | null {
    try {
      const saved = localStorage.getItem(ZOOM_STATE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Silently fail
    }
    return null;
  }

  // === PAN/ZOOM ===
  let panZoom: CanvasPanZoom | null = null;

  function initPanZoom(): void {
    if (panZoom) {
      panZoom.destroy();
    }

    const savedState = loadZoomState();

    panZoom = new CanvasPanZoom(canvasArea, renderer, {
      minScale: 0.25,
      maxScale: 10,
      zoomSpeed: 0.15,
      initialScale: savedState?.scale ?? 1,
      onZoomChange: (scale) => {
        const pct = Math.round(scale * 100);
        const activeSheet = projectManager.getActiveSheet();
        if (activeSheet) {
          const gs = activeSheet.gridSettings;
          infoLabel.setText(
            `${activeSheet.name} | ${activeSheet.width}x${activeSheet.height}px | Grid: ${gs.columns}x${gs.rows} | Zoom: ${pct}%`
          );
        }
        // Save zoom state lazily
        saveZoomState(scale, canvasArea.x, canvasArea.y);
      },
      onPanChange: (x, y) => {
        // Save pan state lazily
        if (panZoom) {
          saveZoomState(panZoom.getScale(), x, y);
        }
      }
    });

    // Restore pan position if we have saved state
    if (savedState) {
      canvasArea.position.set(savedState.x, savedState.y);
    }
  }

  // Init pan/zoom
  initPanZoom();

  // === CONFIG PANEL (Right Side) ===
  const configPanel = new SpriteSheetConfigPanel({
    callbacks: {
      onGridChange: (cellWidth, cellHeight) => {
        const activeSheet = projectManager.getActiveSheet();
        if (activeSheet) {
          projectManager.updateGridSettings(activeSheet.id, cellWidth, cellHeight);
        }
      },
      onExportSheet: () => {
        const activeSheet = projectManager.getActiveSheet();
        if (activeSheet) {
          projectManager.downloadSheetJSON(activeSheet.id);
        }
      },
      onExportProject: () => {
        projectManager.downloadProjectBundle();
      },
      onRemoveSheet: () => {
        const activeSheet = projectManager.getActiveSheet();
        if (activeSheet) {
          carousel.removeItem(activeSheet.id);
          projectManager.removeSheet(activeSheet.id);
        }
      },
      onClearProject: () => {
        if (confirm('Clear entire project? This cannot be undone.')) {
          carousel.setItems([]);
          projectManager.clearProject();
          clearCanvasDisplay();
        }
      },
      onCopyJSON: async () => {
        const activeSheet = projectManager.getActiveSheet();
        if (activeSheet) {
          const json = projectManager.exportSheetJSON(activeSheet.id);
          const jsonString = JSON.stringify(json, null, 2);
          try {
            await navigator.clipboard.writeText(jsonString);
            // Brief visual feedback on the button
            configPanel.showCopyFeedback();
          } catch (err) {
            console.error('Failed to copy JSON:', err);
          }
        }
      }
    },
    x: renderer.width - CONFIG_PANEL_WIDTH - 10,
    y: HEADER_HEIGHT + 10
  });
  scene.addChild(configPanel.getPanel().container);
  scene.addChild(configPanel.getMenuDropdown()); // Add menu dropdown on top for z-order

  // Register focusable inputs with focus manager
  for (const input of configPanel.getFocusableInputs()) {
    focusManager.register(input);
  }

  // === LIBRARY PANEL (Animations & Regions) - Docked to left of config panel ===
  const LIBRARY_PANEL_WIDTH = 180;
  const libraryPanel = new AnimationRegionLibraryPanel({
    x: renderer.width - CONFIG_PANEL_WIDTH - LIBRARY_PANEL_WIDTH - 30,
    y: HEADER_HEIGHT + 10,
    width: LIBRARY_PANEL_WIDTH,
    height: 350,
    callbacks: {
      onSelectAnimation: (anim: AnimationSequence) => {
        // Highlight animation frames on the grid
        const activeSheet = projectManager.getActiveSheet();
        if (activeSheet) {
          selectedCells = [...anim.frames];
          updateSelectionHighlight(activeSheet.gridSettings);
        }
      },
      onSelectRegion: (region: TileRegion) => {
        // Highlight region cells on the grid
        const activeSheet = projectManager.getActiveSheet();
        if (activeSheet) {
          selectedCells = [];
          for (let r = region.row; r < region.row + region.rowSpan; r++) {
            for (let c = region.col; c < region.col + region.colSpan; c++) {
              selectedCells.push({ col: c, row: r });
            }
          }
          updateSelectionHighlight(activeSheet.gridSettings);
        }
      },
      onClearSelection: () => {
        clearSelection();
      },
      onRenameAnimation: (animationId: string, newName: string) => {
        const activeSheet = projectManager.getActiveSheet();
        if (activeSheet) {
          projectManager.updateAnimation(activeSheet.id, animationId, { name: newName });
        }
      },
      onRenameRegion: (regionId: string, newName: string) => {
        const activeSheet = projectManager.getActiveSheet();
        if (activeSheet) {
          projectManager.updateRegionName(activeSheet.id, regionId, newName);
        }
      },
      onDeleteAnimation: (animationId: string) => {
        const activeSheet = projectManager.getActiveSheet();
        if (activeSheet) {
          projectManager.removeAnimation(activeSheet.id, animationId);
          updateLibraryPanel();
          clearSelection();
        }
      },
      onDeleteRegion: (regionId: string) => {
        const activeSheet = projectManager.getActiveSheet();
        if (activeSheet) {
          projectManager.splitRegion(activeSheet.id, regionId);
          updateLibraryPanel();
          drawTileRegions(activeSheet.gridSettings);
          clearSelection();
        }
      }
    }
  });
  scene.addChild(libraryPanel.getPanel().container);

  // Update library panel when sheet changes
  function updateLibraryPanel(): void {
    const activeSheet = projectManager.getActiveSheet();
    if (activeSheet && spriteDisplay) {
      const animations = projectManager.getAnimations(activeSheet.id);
      const regions = projectManager.getTileRegions(activeSheet.id);
      libraryPanel.updateWithData(
        animations,
        regions,
        spriteDisplay.texture,
        activeSheet.gridSettings
      );
    } else {
      libraryPanel.updateWithData([], [], null, null);
    }
  }

  // === LOAD IMAGE FILE ===
  async function loadImageFile(file: File): Promise<void> {
    if (!file.type.startsWith('image/')) {
      console.warn('Please drop an image file');
      return;
    }

    try {
      // Read file as data URL for persistence
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      // Create image to get dimensions
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = dataUrl;
      });

      // Add to project
      const name = file.name.replace(/\.[^/.]+$/, '');
      const entry = projectManager.addSheet({
        name,
        imageDataUrl: dataUrl,
        width: img.width,
        height: img.height
      });

      // Add to carousel
      const texture = Texture.from(img);
      carousel.addItem({
        id: entry.id,
        texture,
        label: entry.name
      });

      // Select the new sheet
      carousel.selectById(entry.id);

      console.log(`Added sheet: ${entry.name} (${entry.width}x${entry.height})`);
    } catch (error) {
      console.error('Error loading image:', error);
    }
  }

  // === DISPLAY SPRITE SHEET ===
  async function displaySpriteSheet(entry: SpriteSheetEntry, restoreZoom: boolean = false): Promise<void> {
    clearCanvasDisplay();
    drawDropHint();

    // Reset or restore pan/zoom based on context
    if (restoreZoom) {
      // Restore saved zoom state (on initial load)
      const savedState = loadZoomState();
      if (savedState && panZoom) {
        panZoom.setScale(savedState.scale);
        canvasArea.position.set(savedState.x, savedState.y);
      }
    } else {
      // Reset pan/zoom when switching sheets
      if (panZoom) panZoom.reset();
    }

    // Create texture from data URL
    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = entry.imageDataUrl;
    });

    const texture = Texture.from(img);

    // Create sprite
    spriteDisplay = new Sprite(texture);
    spriteDisplay.texture.source.scaleMode = 'nearest';
    spriteDisplay.eventMode = 'static';

    // Add interaction handlers
    spriteDisplay.on('pointermove', (event) => {
      const activeSheet = projectManager.getActiveSheet();
      if (!activeSheet || !spriteDisplay) return;

      const localPos = spriteDisplay.toLocal(event.global);
      const gridSettings = activeSheet.gridSettings;
      const cell = pixelToCell(
        localPos.x,
        localPos.y,
        gridSettings.cellWidth,
        gridSettings.cellHeight
      );

      if (
        cell.col >= 0 && cell.col < gridSettings.columns &&
        cell.row >= 0 && cell.row < gridSettings.rows
      ) {
        if (selectedCells.length === 0) {
          updateCellHighlight(cell.col, cell.row, true, gridSettings);
        }

        const cellIdx = cellToIndex(cell.col, cell.row, gridSettings.columns);
        const totalCells = gridSettings.columns * gridSettings.rows;
        infoLabel.setText(
          `${activeSheet.name} | ${activeSheet.width}x${activeSheet.height}px | Grid: ${gridSettings.columns}x${gridSettings.rows} (${totalCells} cells) | Cell ${cellIdx}`
        );
      }
    });

    spriteDisplay.on('pointerout', () => {
      if (selectedCells.length === 0) {
        clearCellHighlight();
      }
      updateInfoLabel();
    });

    spriteDisplay.on('pointerdown', (event) => {
      const activeSheet = projectManager.getActiveSheet();
      if (!activeSheet || !spriteDisplay) return;

      const localPos = spriteDisplay.toLocal(event.global);
      const gridSettings = activeSheet.gridSettings;
      const cell = pixelToCell(
        localPos.x,
        localPos.y,
        gridSettings.cellWidth,
        gridSettings.cellHeight
      );

      if (
        cell.col >= 0 && cell.col < gridSettings.columns &&
        cell.row >= 0 && cell.row < gridSettings.rows
      ) {
        // Animation creation mode - add frame to sequence
        if (animationCreationMode) {
          addAnimationFrame(cell.col, cell.row);
          return;
        }

        const nativeEvent = event.nativeEvent as PointerEvent;

        if (nativeEvent.shiftKey) {
          // Shift+click: toggle cell in selection
          const existingIdx = selectedCells.findIndex(
            c => c.col === cell.col && c.row === cell.row
          );
          if (existingIdx >= 0) {
            selectedCells.splice(existingIdx, 1);
          } else {
            selectedCells.push(cell);
          }
        } else {
          // Normal click: replace selection
          selectedCells = [cell];
        }
        updateSelectionHighlight(gridSettings);
      }
    });

    canvasArea.addChild(spriteDisplay);

    // Draw grid overlay
    drawGridOverlay(entry.gridSettings);

    // Draw tile region overlays
    drawTileRegions(entry.gridSettings);

    // Track displayed sheet
    displayedSheetId = entry.id;

    // Update config panel
    configPanel.setActiveSheet(entry);
    configPanel.setHasSheets(true);
    updateInfoLabel();

    // Update library panel with animations and regions
    updateLibraryPanel();
  }

  // === GRID OVERLAY ===
  function drawGridOverlay(gridSettings: { cellWidth: number; cellHeight: number; columns: number; rows: number }): void {
    // Clear existing grid
    if (gridOverlay) {
      canvasArea.removeChild(gridOverlay);
      gridOverlay.destroy();
      gridOverlay = null;
    }

    // Don't draw grid if cell dimensions are too small
    if (gridSettings.cellWidth < 5 || gridSettings.cellHeight < 5) {
      return;
    }

    gridOverlay = createGridOverlay(gridSettings, {
      gridColor: 0xcccccc,
      gridAlpha: 0.5,
      gridWidth: 1,
      dashed: true
    });
    canvasArea.addChild(gridOverlay);
  }

  // === CELL HIGHLIGHT ===
  function updateCellHighlight(
    col: number,
    row: number,
    isHover: boolean,
    gridSettings: { cellWidth: number; cellHeight: number }
  ): void {
    clearCellHighlight();

    const color = isHover ? 0xffffff : 0xffff00;
    const alpha = isHover ? 0.2 : 0.3;

    cellHighlight = createCellHighlight(
      col,
      row,
      gridSettings.cellWidth,
      gridSettings.cellHeight,
      color,
      alpha
    );
    canvasArea.addChild(cellHighlight);

    if (spriteDisplay) {
      const spriteIndex = canvasArea.children.indexOf(spriteDisplay);
      if (spriteIndex !== -1) {
        canvasArea.setChildIndex(cellHighlight, spriteIndex + 1);
      }
    }
  }

  function clearCellHighlight(): void {
    if (cellHighlight) {
      canvasArea.removeChild(cellHighlight);
      cellHighlight.destroy();
      cellHighlight = null;
    }
  }

  // === SELECTION HIGHLIGHT (Multi-cell) ===
  function updateSelectionHighlight(gridSettings: GridSettings): void {
    // Clear existing highlight
    clearCellHighlight();

    if (selectedCells.length === 0) {
      configPanel.clearRegionPreview();
      return;
    }

    // Create a combined graphics for all selected cells
    cellHighlight = new Graphics();

    for (const cell of selectedCells) {
      cellHighlight.rect(
        cell.col * gridSettings.cellWidth,
        cell.row * gridSettings.cellHeight,
        gridSettings.cellWidth,
        gridSettings.cellHeight
      );
    }
    cellHighlight.fill({ color: 0x9acd32, alpha: 0.3 });
    cellHighlight.stroke({ color: 0x9acd32, width: 2, alpha: 1 });

    canvasArea.addChild(cellHighlight);

    // Position after sprite but before grid
    if (spriteDisplay) {
      const spriteIndex = canvasArea.children.indexOf(spriteDisplay);
      if (spriteIndex !== -1) {
        canvasArea.setChildIndex(cellHighlight, spriteIndex + 1);
      }
    }

    // Update config panel preview
    configPanel.updateRegionPreview(selectedCells, gridSettings);
  }

  // === CLEAR SELECTION ===
  function clearSelection(): void {
    selectedCells = [];
    clearCellHighlight();
    configPanel.clearRegionPreview();
  }

  // === CLEAR CANVAS ===
  function clearCanvasDisplay(): void {
    // Remove all children except dropHintContainer
    const children = [...canvasArea.children];
    for (const child of children) {
      if (child !== dropHintContainer) {
        canvasArea.removeChild(child);
        child.destroy();
      }
    }

    // Reset references
    spriteDisplay = null;
    gridOverlay = null;
    cellHighlight = null;
    selectedCells = [];
    regionOverlays = [];
    displayedSheetId = null;
    configPanel.setActiveSheet(null);
    updateInfoLabel();
  }

  // === UPDATE INFO LABEL ===
  function updateInfoLabel(): void {
    const activeSheet = projectManager.getActiveSheet();
    if (!activeSheet) {
      const count = projectManager.getSheetCount();
      infoLabel.setText(
        count > 0
          ? `${count} sheet(s) in project - Select from carousel`
          : 'Drop sprite sheets to add to project'
      );
      return;
    }

    const gs = activeSheet.gridSettings;
    const totalCells = gs.columns * gs.rows;
    infoLabel.setText(
      `${activeSheet.name} | ${activeSheet.width}x${activeSheet.height}px | Grid: ${gs.columns}x${gs.rows} (${totalCells} cells)`
    );
  }

  // === CAROUSEL SELECTION ===
  carousel.onSelect((item) => {
    projectManager.setActiveSheet(item.id);
  });

  // === PROJECT MANAGER SUBSCRIPTION ===
  projectManager.subscribe((project) => {
    const activeSheet = projectManager.getActiveSheet();
    if (activeSheet) {
      // Only re-display if switching to a different sheet
      // Otherwise just update the grid overlay (much faster)
      if (displayedSheetId !== activeSheet.id) {
        displaySpriteSheet(activeSheet);
      } else {
        // Same sheet - just update grid, regions, and config panel
        drawGridOverlay(activeSheet.gridSettings);
        drawTileRegions(activeSheet.gridSettings);
        configPanel.setActiveSheet(activeSheet);
        updateInfoLabel();
        updateLibraryPanel();
      }
    } else {
      clearCanvasDisplay();
      drawDropHint();
      updateLibraryPanel();
    }
    configPanel.setHasSheets(project.sheets.length > 0);
  });

  // === DRAG AND DROP ===
  function setupDragAndDrop(): void {
    root.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      drawDropHint(true);
    });

    root.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      drawDropHint(false);
    });

    root.addEventListener('drop', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      drawDropHint(false);

      const files = e.dataTransfer?.files;
      if (!files) return;

      // Load all dropped files
      for (let i = 0; i < files.length; i++) {
        await loadImageFile(files[i]);
      }
    });
  }

  setupDragAndDrop();

  // === TILE REGION VISUALIZATION ===
  function drawTileRegions(gridSettings: { cellWidth: number; cellHeight: number }): void {
    // Clear existing region overlays
    for (const overlay of regionOverlays) {
      canvasArea.removeChild(overlay);
      overlay.destroy();
    }
    regionOverlays = [];

    const activeSheet = projectManager.getActiveSheet();
    if (!activeSheet) return;

    const regions = projectManager.getTileRegions(activeSheet.id);
    for (const region of regions) {
      const overlay = new Graphics();
      const x = region.col * gridSettings.cellWidth;
      const y = region.row * gridSettings.cellHeight;
      const w = region.colSpan * gridSettings.cellWidth;
      const h = region.rowSpan * gridSettings.cellHeight;

      // Draw filled rectangle with border
      overlay.rect(x, y, w, h);
      overlay.fill({ color: 0xff9900, alpha: 0.25 });
      overlay.stroke({ color: 0xff9900, width: 2, alpha: 1 });

      canvasArea.addChild(overlay);
      regionOverlays.push(overlay);
    }
  }

  // === JOIN SELECTED CELLS ===
  function joinSelectedCells(): void {
    const activeSheet = projectManager.getActiveSheet();
    if (!activeSheet || selectedCells.length < 2) {
      console.log('Select at least 2 cells to join (Shift+click to multi-select)');
      return;
    }

    const region = projectManager.joinCells(activeSheet.id, selectedCells);
    if (region) {
      console.log(`Created tile region: ${region.colSpan}x${region.rowSpan} cells`);
      clearSelection();
      drawTileRegions(activeSheet.gridSettings);
    } else {
      console.log('Cannot join cells: selection must form a complete rectangle with no overlapping regions');
    }
  }

  // === SPLIT REGION AT SELECTION ===
  function splitRegionAtSelection(): void {
    const activeSheet = projectManager.getActiveSheet();
    if (!activeSheet || selectedCells.length === 0) {
      console.log('Select a cell within a region to split it');
      return;
    }

    // Find region at first selected cell
    const cell = selectedCells[0];
    const region = projectManager.getRegionAtCell(activeSheet.id, cell.col, cell.row);
    if (region) {
      projectManager.splitRegion(activeSheet.id, region.id);
      console.log('Split region back to individual cells');
      clearSelection();
      drawTileRegions(activeSheet.gridSettings);
    } else {
      console.log('No tile region at selected cell');
    }
  }

  // === ANIMATION CREATION MODE ===
  function enterAnimationMode(): void {
    if (animationCreationMode) return;

    const activeSheet = projectManager.getActiveSheet();
    if (!activeSheet) return;

    animationCreationMode = true;
    animationFrames = [];
    clearAnimationOverlays();
    clearSelection();

    // Update config panel indicator
    configPanel.setAnimationMode(true, 0);

    infoLabel.setText('🎬 Animation Mode: Click cells in order | Enter to save | Escape to cancel');
  }

  function exitAnimationMode(save: boolean = false): void {
    if (!animationCreationMode) return;

    if (save && animationFrames.length > 0) {
      const activeSheet = projectManager.getActiveSheet();
      if (activeSheet) {
        // Prompt for animation name
        const name = prompt('Animation name:', `animation_${projectManager.getAnimations(activeSheet.id).length + 1}`);
        if (name) {
          const animation = projectManager.addAnimation(activeSheet.id, animationFrames, name);
          if (animation) {
            console.log(`Created animation: ${animation.name} with ${animationFrames.length} frames`);
            updateLibraryPanel();
          }
        }
      }
    }

    animationCreationMode = false;
    animationFrames = [];
    clearAnimationOverlays();
    hideAnimationPreview();

    // Hide config panel indicator
    configPanel.setAnimationMode(false);

    updateInfoLabel();
  }

  function clearAnimationOverlays(): void {
    for (const overlay of animationNumberOverlays) {
      canvasArea.removeChild(overlay);
      overlay.destroy({ children: true });
    }
    animationNumberOverlays = [];
  }

  function addAnimationFrame(col: number, row: number): void {
    if (!animationCreationMode) return;

    const activeSheet = projectManager.getActiveSheet();
    if (!activeSheet) return;

    const { cellWidth, cellHeight } = activeSheet.gridSettings;

    // Check if already in sequence
    const existingIdx = animationFrames.findIndex(f => f.col === col && f.row === row);
    if (existingIdx >= 0) {
      // Remove this frame and all after it
      animationFrames = animationFrames.slice(0, existingIdx);
      // Rebuild overlays
      clearAnimationOverlays();
      animationFrames.forEach((f, i) => {
        createFrameNumberOverlay(f.col, f.row, i + 1, cellWidth, cellHeight);
      });
      // Update config panel indicator with new frame count
      configPanel.setAnimationMode(true, animationFrames.length);
      infoLabel.setText(`🎬 Animation Mode: ${animationFrames.length} frame(s) | Enter to save | Escape to cancel`);
      updateAnimationPreview();
      return;
    }

    // Add new frame
    animationFrames.push({ col, row });
    createFrameNumberOverlay(col, row, animationFrames.length, cellWidth, cellHeight);

    // Update config panel indicator with frame count
    configPanel.setAnimationMode(true, animationFrames.length);

    infoLabel.setText(`🎬 Animation Mode: ${animationFrames.length} frame(s) | Enter to save | Escape to cancel`);
    updateAnimationPreview();
  }

  function createFrameNumberOverlay(col: number, row: number, frameNum: number, cellWidth: number, cellHeight: number): void {
    const container = new Container();

    // Simple semi-transparent overlay
    const overlay = new Graphics();
    overlay.rect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
    overlay.fill({ color: 0x000000, alpha: 0.4 });
    container.addChild(overlay);

    // Number text centered in cell
    const numText = new Text({
      text: String(frameNum),
      style: {
        fontSize: Math.min(cellWidth, cellHeight) * 0.6,
        fill: 0xffffff,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 3 }
      }
    });
    numText.anchor.set(0.5, 0.5);
    numText.x = col * cellWidth + cellWidth / 2;
    numText.y = row * cellHeight + cellHeight / 2;
    container.addChild(numText);

    canvasArea.addChild(container);
    animationNumberOverlays.push(container);
  }

  /**
   * Update the animation preview with current frames
   */
  function updateAnimationPreview(): void {
    // Clean up existing preview
    if (animationPreviewSprite) {
      animationPreviewSprite.stop();
      animationPreviewSprite.destroy();
      animationPreviewSprite = null;
    }

    if (!animationPreviewContainer) {
      // Create preview container (positioned in bottom-left of canvas area)
      animationPreviewContainer = new Container();

      // Background
      const bg = new Graphics();
      bg.roundRect(0, 0, 100, 120, 6);
      bg.fill({ color: 0x222226, alpha: 0.95 });
      bg.stroke({ color: 0x9acd32, width: 2 });
      animationPreviewContainer.addChild(bg);

      // Label
      const label = new Text({
        text: 'Preview',
        style: { fontSize: 10, fill: 0x9acd32, fontFamily: 'Arial' }
      });
      label.x = 6;
      label.y = 4;
      animationPreviewContainer.addChild(label);

      // Position at bottom-left of content area
      animationPreviewContainer.x = 10;
      animationPreviewContainer.y = contentHeight - 130;
      scene.addChild(animationPreviewContainer);
    }

    // Need at least 1 frame to show preview
    if (animationFrames.length === 0 || !spriteDisplay) {
      animationPreviewContainer.visible = false;
      return;
    }

    animationPreviewContainer.visible = true;

    const activeSheet = projectManager.getActiveSheet();
    if (!activeSheet) return;

    const { cellWidth, cellHeight } = activeSheet.gridSettings;
    const sheetTexture = spriteDisplay.texture;

    // Create textures for each frame
    const textures: Texture[] = [];
    for (const frame of animationFrames) {
      const frameRect = new Rectangle(
        frame.col * cellWidth,
        frame.row * cellHeight,
        cellWidth,
        cellHeight
      );
      const frameTexture = new Texture({
        source: sheetTexture.source,
        frame: frameRect
      });
      textures.push(frameTexture);
    }

    // Create animated sprite
    animationPreviewSprite = new AnimatedSprite(textures);
    animationPreviewSprite.animationSpeed = 0.1;
    animationPreviewSprite.play();

    // Scale to fit preview area (80x80 max)
    const maxSize = 80;
    const scale = Math.min(maxSize / cellWidth, maxSize / cellHeight, 2);
    animationPreviewSprite.scale.set(scale);

    // Center in preview box
    animationPreviewSprite.x = 50 - (cellWidth * scale) / 2;
    animationPreviewSprite.y = 65 - (cellHeight * scale) / 2;

    animationPreviewContainer.addChild(animationPreviewSprite);
  }

  /**
   * Hide and clean up animation preview
   */
  function hideAnimationPreview(): void {
    if (animationPreviewSprite) {
      animationPreviewSprite.stop();
      animationPreviewSprite.destroy();
      animationPreviewSprite = null;
    }
    if (animationPreviewContainer) {
      animationPreviewContainer.visible = false;
    }
  }

  // === KEYBOARD SHORTCUTS ===
  function handleKeyDown(e: KeyboardEvent): void {
    // Ctrl+A (or Cmd+A on Mac): Enter animation creation mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      enterAnimationMode();
      return;
    }

    // Enter: Save animation (in animation mode)
    if (e.key === 'Enter' && animationCreationMode) {
      e.preventDefault();
      exitAnimationMode(true);
      return;
    }

    // Ctrl+J: Join selected cells
    if (e.ctrlKey && e.key === 'j') {
      e.preventDefault();
      joinSelectedCells();
      return;
    }

    // Ctrl+K: Split region
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      splitRegionAtSelection();
      return;
    }

    // Escape: Cancel animation mode or clear selection
    if (e.key === 'Escape') {
      if (animationCreationMode) {
        exitAnimationMode(false);
      } else {
        clearSelection();
      }
      return;
    }
  }

  document.addEventListener('keydown', handleKeyDown);

  // === RESTORE PROJECT FROM STORAGE ===
  async function restoreProject(): Promise<void> {
    const sheets = projectManager.getAllSheets();
    if (sheets.length === 0) return;

    // Restore carousel items
    const carouselItems: CarouselItem[] = [];
    for (const sheet of sheets) {
      try {
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Skip failed images
          img.src = sheet.imageDataUrl;
        });

        if (img.width > 0) {
          const texture = Texture.from(img);
          carouselItems.push({
            id: sheet.id,
            texture,
            label: sheet.name
          });
        }
      } catch (err) {
        console.warn(`Failed to restore sheet: ${sheet.name}`);
      }
    }

    carousel.setItems(carouselItems);

    // Select active sheet
    const activeSheet = projectManager.getActiveSheet();
    if (activeSheet) {
      carousel.selectById(activeSheet.id);
      await displaySpriteSheet(activeSheet, true); // Restore zoom on initial load
    }

    configPanel.setHasSheets(sheets.length > 0);
    console.log(`Restored project with ${sheets.length} sheet(s)`);
  }

  // Initialize scene
  scene.init();
  engine.start();

  // Restore project
  await restoreProject();

  console.log('TileMapMatic loaded');

  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    focusManager.destroy();
    if (panZoom) panZoom.destroy();
    fileInput.remove();
    engine.stop();
    scene.destroy({ children: true });
  };
}
