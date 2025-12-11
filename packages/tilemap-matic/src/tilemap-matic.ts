/**
 * TileMapMatic
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
  EdgeInsets
} from '@moxijs/ui';
import { Sprite, Container, Graphics, Texture, Assets } from 'pixi.js';
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
import { GridSettings } from './sprite-sheet-data';
import { SpriteCarousel, CarouselItem } from './sprite-carousel';
import { CanvasPanZoom } from './canvas-pan-zoom';

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
  /** Font asset path (optional - will use system font if not provided) */
  fontPath?: string;
}

/**
 * Initialize TileMapMatic
 */
export async function initTileMapMatic(options: TileMapMaticOptions = {}): Promise<CleanupFunction> {
  const root = options.hostElement || document.getElementById('app');
  if (!root) throw new Error('Host element not found');

  const width = options.width ?? 1280;
  const height = options.height ?? 720;
  const backgroundColor = options.backgroundColor ?? 0x1a1a2e;

  const { scene, engine, renderer } = await setupMoxi({
    hostElement: root,
    showLoadingScene: false,
    renderOptions: {
      width,
      height,
      backgroundColor,
    }
  });

  // Load required fonts if path provided
  if (options.fontPath) {
    await Assets.load({
      alias: 'PixelOperator8',
      src: options.fontPath,
      data: { family: 'PixelOperator8' }
    });
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
  const contentWidth = renderer.width - CAROUSEL_WIDTH - CONFIG_PANEL_WIDTH - CONTENT_PADDING;
  const contentHeight = renderer.height - HEADER_HEIGHT;

  // === HEADER ===
  const headerContainer = new FlexContainer({
    direction: FlexDirection.Row,
    justify: FlexJustify.SpaceBetween,
    align: FlexAlign.Center,
    padding: EdgeInsets.symmetric(0, 20),
    width: renderer.width,
    height: HEADER_HEIGHT,
    backgroundColor: 0x252538
  });

  const titleLabel = new UILabel({
    text: 'TileMapMatic',
    fontSize: 22,
    color: 0x00d4ff,
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

  // === CAROUSEL (Left Side) ===
  const carousel = new SpriteCarousel({
    width: CAROUSEL_WIDTH,
    height: renderer.height - HEADER_HEIGHT,
    orientation: 'vertical',
    showAddButton: true,
    showLabels: true,
    thumbnailSize: 80,
    itemSpacing: 12,
    backgroundColor: 0x1e1e2e,
    reticleColor: 0x00d4ff
  });
  carousel.position.set(0, HEADER_HEIGHT);
  scene.addChild(carousel);

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
  canvasBg.fill({ color: 0x1a1a2e });
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

  // === DROP ZONE HINT ===
  const dropHint = new Graphics();
  function drawDropHint(active: boolean = false) {
    dropHint.clear();
    if (!projectManager.hasSheets()) {
      const w = contentWidth - 100;
      const h = 300;
      const x = 50;
      const y = 100;

      dropHint.roundRect(x, y, w, h, 12);
      dropHint.stroke({
        color: active ? 0x00d4ff : 0x444466,
        width: 2,
        alpha: 0.8
      });

      // Dashed effect via multiple segments
      const dashLen = 15;
      const gapLen = 10;

      // Top edge
      for (let i = 0; i < w; i += dashLen + gapLen) {
        dropHint.moveTo(x + i, y);
        dropHint.lineTo(x + Math.min(i + dashLen, w), y);
      }
      dropHint.stroke({ color: active ? 0x00d4ff : 0x444466, width: 2 });
    }
  }
  canvasArea.addChild(dropHint);
  drawDropHint();

  // === PAN/ZOOM ===
  let panZoom: CanvasPanZoom | null = null;

  function initPanZoom(): void {
    if (panZoom) {
      panZoom.destroy();
    }
    panZoom = new CanvasPanZoom(canvasArea, renderer, {
      minScale: 0.25,
      maxScale: 10,
      zoomSpeed: 0.15,
      onZoomChange: (scale) => {
        const pct = Math.round(scale * 100);
        const activeSheet = projectManager.getActiveSheet();
        if (activeSheet) {
          const gs = activeSheet.gridSettings;
          infoLabel.setText(
            `${activeSheet.name} | ${activeSheet.width}x${activeSheet.height}px | Grid: ${gs.columns}x${gs.rows} | Zoom: ${pct}%`
          );
        }
      }
    });
  }

  // === JSON DIALOG ===
  const JSON_DIALOG_WIDTH = 600;
  const JSON_DIALOG_HEIGHT = 500;
  const jsonDialog = new Container();
  jsonDialog.visible = false;

  // Backdrop
  const jsonBackdrop = new Graphics();
  jsonBackdrop.rect(0, 0, renderer.width, renderer.height);
  jsonBackdrop.fill({ color: 0x000000, alpha: 0.6 });
  jsonBackdrop.eventMode = 'static';
  jsonBackdrop.cursor = 'default';
  jsonBackdrop.on('pointerdown', () => { jsonDialog.visible = false; });
  jsonDialog.addChild(jsonBackdrop);

  // Dialog box
  const jsonBox = new Container();
  jsonBox.position.set(
    (renderer.width - JSON_DIALOG_WIDTH) / 2,
    (renderer.height - JSON_DIALOG_HEIGHT) / 2
  );

  const jsonBoxBg = new Graphics();
  jsonBoxBg.roundRect(0, 0, JSON_DIALOG_WIDTH, JSON_DIALOG_HEIGHT, 8);
  jsonBoxBg.fill({ color: 0x2a2a3a });
  jsonBoxBg.stroke({ color: 0x505060, width: 2 });
  jsonBox.addChild(jsonBoxBg);

  // Title
  const jsonTitle = new UILabel({
    text: 'Sheet JSON',
    fontSize: 16,
    color: 0xffffff,
    fontWeight: 'bold'
  });
  jsonTitle.layout(200, 30);
  jsonTitle.container.position.set(20, 15);
  jsonBox.addChild(jsonTitle.container);

  // JSON viewer background
  const jsonViewerBg = new Graphics();
  jsonViewerBg.rect(0, 0, JSON_DIALOG_WIDTH - 40, JSON_DIALOG_HEIGHT - 70);
  jsonViewerBg.fill({ color: 0x1a1a2e });
  jsonViewerBg.position.set(20, 55);
  jsonBox.addChild(jsonViewerBg);

  // Close button
  const closeBtn = new UIButton({
    label: '×',
    width: 32,
    height: 32,
    backgroundColor: 0x444455,
    textColor: 0xffffff,
    fontSize: 20,
    onClick: () => { jsonDialog.visible = false; }
  });
  closeBtn.container.position.set(JSON_DIALOG_WIDTH - 44, 10);
  jsonBox.addChild(closeBtn.container);

  // JSON text content - placeholder for now
  const jsonViewer = { setValue: (_s: string) => { /* TODO: implement text rendering */ } };

  jsonDialog.addChild(jsonBox);
  scene.addChild(jsonDialog);

  function showJSONDialog(): void {
    const activeSheet = projectManager.getActiveSheet();
    if (activeSheet) {
      const json = projectManager.exportSheetJSON(activeSheet.id);
      jsonViewer.setValue(JSON.stringify(json, null, 2));
      jsonTitle.setText(`${activeSheet.name} - JSON`);
    } else {
      jsonViewer.setValue('// Select a sprite sheet to see its JSON');
      jsonTitle.setText('Sheet JSON');
    }
    jsonDialog.visible = true;
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
      onViewJSON: () => {
        showJSONDialog();
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
  async function displaySpriteSheet(entry: SpriteSheetEntry): Promise<void> {
    clearCanvasDisplay();
    drawDropHint();
    if (panZoom) panZoom.reset(); // Reset pan/zoom when switching sheets

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
    cellHighlight.fill({ color: 0x00d4ff, alpha: 0.3 });
    cellHighlight.stroke({ color: 0x00d4ff, width: 2, alpha: 1 });

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
    // Remove all children except dropHint
    const children = [...canvasArea.children];
    for (const child of children) {
      if (child !== dropHint) {
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
    jsonViewer.setValue('');
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
      }
    } else {
      clearCanvasDisplay();
      drawDropHint();
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

  // === KEYBOARD SHORTCUTS ===
  function handleKeyDown(e: KeyboardEvent): void {
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

    // Escape: Clear selection
    if (e.key === 'Escape') {
      clearSelection();
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
      await displaySpriteSheet(activeSheet);
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
