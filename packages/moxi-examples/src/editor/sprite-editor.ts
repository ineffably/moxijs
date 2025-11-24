/**
 * Sprite Editor - Main orchestrator class
 * Manages all sprite editor UI components and state
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from './components/pixel-card';
import { createPixelDialog } from './components/pixel-dialog';
import { createSpriteSheetCard, SPRITESHEET_CONFIGS, SpriteSheetCardResult } from './components/spritesheet-card';
import { createSpriteCard, SpriteCardResult } from './components/sprite-card';
import { SpriteController } from './controllers/sprite-controller';
import { SpriteSheetType } from './controllers/sprite-sheet-controller';
import { UIStateManager, CardState } from './state/ui-state-manager';
import { ProjectStateManager, ProjectState, SpriteSheetState } from './state/project-state-manager';
import { LayoutStateManager, LayoutSlotState, CardLayoutState } from './state/layout-state-manager';
import { getTheme } from './theming/theme';
import { PICO8_PALETTE } from './theming/palettes';
import { GRID, BORDER, px } from 'moxi';

// Card imports
import { createPaletteCard, PaletteCardResult } from './cards/palette-card';
import { createToolCard, ToolCardResult } from './cards/tool-card';
import { createSPTToolbarCard, SPTToolbarCardResult } from './cards/spt-toolbar-card';
import { createInfoBarCard, InfoBarCardResult } from './cards/info-bar-card';
import { createCommanderBarCard, CommanderBarCardResult } from './cards/commander-bar-card';
import { createScaleCard, ScaleCardResult } from './cards/scale-card';
import { createCardZoomHandler } from './utilities/card-zoom-handler';

/**
 * Card dimension utilities
 */

/**
 * Calculate the title bar height dynamically based on GRID.fontScale
 */
function calculateTitleBarHeight(): number {
  const fontHeight = 64 * GRID.fontScale;
  const verticalPadding = px(GRID.padding * 2);
  return Math.ceil(fontHeight + verticalPadding);
}

/**
 * Calculate content width needed for edge-to-edge card (full viewport width)
 * Formula: contentWidth = (rendererWidth / px(1)) - (BORDER.total * 2) - (GRID.padding * 2)
 */
function calculateFullWidthContentSize(rendererWidth: number): number {
  return Math.floor(rendererWidth / px(1)) - (BORDER.total * 2) - (GRID.padding * 2);
}

/**
 * Calculate total card height in pixels given content height in grid units
 * Formula: cardHeight = px(contentHeight) + px(BORDER.total * 2) + titleBarHeight + px(GRID.padding * 2)
 */
function calculateCardHeight(contentHeightGridUnits: number): number {
  const titleBarHeightPx = calculateTitleBarHeight();
  return px(contentHeightGridUnits) + px(BORDER.total * 2) + titleBarHeightPx + px(GRID.padding * 2);
}

/**
 * Calculate total card width in pixels given content width in grid units
 * Formula: cardWidth = px(contentWidth + BORDER.total * 2 + GRID.padding * 2)
 */
function calculateCardWidth(contentWidthGridUnits: number): number {
  const cardWidthGridUnits = contentWidthGridUnits + BORDER.total * 2 + GRID.padding * 2;
  return px(cardWidthGridUnits);
}

/**
 * State for sprite sheets and editing
 */
interface SpriteSheetInstance {
  id: string; // Unique identifier for this sprite sheet
  sheetCard: SpriteSheetCardResult;
  spriteCard: SpriteCardResult | null;
  spriteController: SpriteController | null;
}

export interface SpriteEditorOptions {
  renderer: PIXI.Renderer;
  scene: PIXI.Container;
  maxSpriteSheets?: number;
}

/**
 * Main Sprite Editor class
 * Coordinates all UI cards and manages sprite editing state
 */
export class SpriteEditor {
  private renderer: PIXI.Renderer;
  private scene: PIXI.Container;
  private maxSpriteSheets: number;

  // UI Cards
  private commanderBarCard?: CommanderBarCardResult;
  private paletteCard?: PaletteCardResult;
  private toolCard?: ToolCardResult;
  private sptToolbarCard?: SPTToolbarCardResult;
  private infoBarCard?: InfoBarCardResult;
  private scaleCard?: ScaleCardResult;

  // Sprite sheets
  private spriteSheetInstances: SpriteSheetInstance[] = [];
  private activeSpriteSheetInstance: SpriteSheetInstance | null = null;

  // State
  private currentPalette: number[] = PICO8_PALETTE;
  private selectedColorIndex: number = 0;

  // Card registry for UI state persistence
  private cardRegistry = new Map<string, PixelCard>();
  private uiStateSaveTimer: number | null = null;

  // Project state
  private projectState: ProjectState;
  private projectSaveTimer: number | null = null;
  private hasUnsavedChanges: boolean = false;

  constructor(options: SpriteEditorOptions) {
    this.renderer = options.renderer;
    this.scene = options.scene;
    this.maxSpriteSheets = options.maxSpriteSheets ?? 2;

    // Initialize or load project state
    const savedProject = ProjectStateManager.loadProject();
    this.projectState = savedProject ?? ProjectStateManager.createEmptyProject();
  }

  /**
   * Initialize and create all UI elements
   */
  async initialize(): Promise<void> {
    await this.recreateUI();
  }

  /**
   * Register a card and setup auto-save on state changes
   */
  private registerCard(id: string, card: PixelCard): void {
    this.cardRegistry.set(id, card);
    card.onStateChanged(() => this.saveUIState());
  }

  /**
   * Save current UI state to localStorage (debounced)
   */
  private saveUIState(): void {
    // Debounce: wait 500ms after last change before saving
    if (this.uiStateSaveTimer) {
      clearTimeout(this.uiStateSaveTimer);
    }

    this.uiStateSaveTimer = window.setTimeout(() => {
      const stateMap = new Map<string, CardState>();

      // Export all card states
      this.cardRegistry.forEach((card, id) => {
        stateMap.set(id, card.exportState(id));
      });

      UIStateManager.saveState(stateMap, this.renderer.width, this.renderer.height);
    }, 500);
  }

  /**
   * Restore UI state from localStorage
   */
  private restoreUIState(): boolean {
    const savedState = UIStateManager.loadState();
    if (!savedState) return false;

    // Adjust for canvas size changes
    const adjustedState = UIStateManager.adjustForCanvasSize(
      savedState,
      this.renderer.width,
      this.renderer.height
    );

    // Restore each card's state
    adjustedState.cards.forEach(cardState => {
      const card = this.cardRegistry.get(cardState.id);
      if (card) {
        card.importState(cardState);
      }
    });

    console.log('✅ UI state restored');
    return true;
  }

  /**
   * Apply default layout positions to all cards
   */
  private applyDefaultLayout(): void {
    const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24;
    const topOffset = commanderBarHeight + px(GRID.gap * 2);

    // Position PIKCELL bar at top (y=0, x=0)
    const commanderCard = this.cardRegistry.get('commander');
    if (commanderCard) {
      commanderCard.container.position.set(0, 0);
    }

    // Position palette card below PIKCELL, docked to left edge
    const paletteCard = this.cardRegistry.get('palette');
    if (paletteCard) {
      paletteCard.container.position.set(0, topOffset);
    }

    // Position info bar at bottom (edge to edge, full width)
    const infoCard = this.cardRegistry.get('info');
    if (infoCard) {
      const barHeight = 8;
      const cardTotalHeight = calculateCardHeight(barHeight);
      const y = this.renderer.height - cardTotalHeight;
      infoCard.container.position.set(0, y);
    }

    // Position sprite sheets at their default location (bottom right, minimap style)
    this.spriteSheetInstances.forEach((instance, index) => {
      if (instance.sheetCard) {
        const card = instance.sheetCard.card;

        // Set desired card width (minimap size) - content dimensions in grid units
        const desiredContentWidth = 50; // Grid units for minimap
        const desiredContentHeight = 50; // Grid units for minimap

        // Zoom to 5x, select cell 0,0, and position sprite sheet so cell 0,0 is at top-left
        instance.sheetCard.controller.setScale(5);
        instance.sheetCard.controller.selectCell(0, 0); // This will trigger onCellClick and update title
        instance.sheetCard.controller.positionCell00AtTopLeft();

        // Set the card's content size
        card.setContentSize(desiredContentWidth, desiredContentHeight);
        instance.sheetCard.controller.render(card.getContentContainer());

        // Get card dimensions in pixels
        const cardWidthPx = card.getPixelWidth();
        const cardHeightPx = card.getPixelHeight();

        // Position at bottom right (touch right edge, above info bar)
        const defaultX = this.renderer.width - cardWidthPx;

        // Position above info bar with gap
        const infoCardFromRegistry = this.cardRegistry.get('info');
        const defaultY = infoCardFromRegistry
          ? infoCardFromRegistry.container.y - cardHeightPx - px(GRID.gap)
          : this.renderer.height - cardHeightPx;

        card.container.position.set(defaultX, defaultY);
      }
    });

    // Position sprite cards centered below PIKCELL bar
    this.cardRegistry.forEach((card, id) => {
      if (id.startsWith('sprite-card-')) {
        const cardBounds = card.container.getBounds();
        const x = (this.renderer.width - cardBounds.width) / 2;
        const y = px(GRID.margin) + commanderBarHeight + px(GRID.gap * 2);
        card.container.position.set(x, y);
      }
    });

    // Save the new layout
    this.saveUIState();

    console.log('✅ Default layout applied');
  }

  /**
   * Updates the palette card to match the active sprite sheet
   */
  private updatePaletteForActiveSheet(): void {
    if (!this.activeSpriteSheetInstance || !this.paletteCard) return;

    // Get palette from active sprite sheet
    this.currentPalette = this.activeSpriteSheetInstance.sheetCard.controller.getConfig().palette;

    // Update palette card with the correct palette
    this.paletteCard.setPalette(this.currentPalette);
  }

  /**
   * Creates a new sprite sheet and sprite card
   */
  private createNewSpriteSheet(type: SpriteSheetType, showGrid: boolean, savedState?: SpriteSheetState): void {
    // Enforce single sprite sheet type per project (unless loading from saved state)
    if (!savedState && this.spriteSheetInstances.length > 0) {
      const existingType = this.spriteSheetInstances[0].sheetCard.controller.getConfig().type;
      const dialog = createPixelDialog({
        title: 'One Sprite Sheet Per Project',
        message: `This project already contains a ${existingType} sprite sheet. Create a new project to use ${type}.`,
        buttons: [
          {
            label: 'OK',
            onClick: () => {
              // Dialog will close automatically
            }
          }
        ],
        renderer: this.renderer
      });
      this.scene.addChild(dialog);
      return;
    }

    // Generate unique ID for this sprite sheet
    const sheetId = savedState?.id ?? `sheet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the instance object
    const instance: SpriteSheetInstance = {
      id: sheetId,
      sheetCard: null as any, // Will be set below
      spriteCard: null,
      spriteController: null
    };

    // Function to make this sprite sheet active and bring to front
    const makeThisSheetActive = () => {
      // Set as active
      this.activeSpriteSheetInstance = instance;

      // Update palette to match this sheet
      this.updatePaletteForActiveSheet();

      // Bring both sprite sheet and sprite card to front
      // Strategy: Remove both, then re-add in order (sheet first, sprite second)
      // This ensures they're on top and sprite card is above sprite sheet
      if (instance.sheetCard) {
        this.scene.removeChild(instance.sheetCard.card.container);
      }
      if (instance.spriteCard) {
        this.scene.removeChild(instance.spriteCard.card.container);
      }

      // Re-add in order - sprite sheet first, then sprite card
      if (instance.sheetCard) {
        this.scene.addChild(instance.sheetCard.card.container);
      }
      if (instance.spriteCard) {
        this.scene.addChild(instance.spriteCard.card.container);
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
        this.scene.removeChild(instance.spriteCard.card.container);
      } else {
        // Create sprite card at default position - just below PIKCELL bar, centered horizontally
        const spriteCardDims = spriteController.getScaledDimensions();
        const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24; // Title bar height

        spriteCardX = (this.renderer.width - spriteCardDims.width) / 2;
        spriteCardY = px(GRID.margin) + commanderBarHeight + px(GRID.gap * 2);
      }

      const spriteCardResult = createSpriteCard({
        x: spriteCardX,
        y: spriteCardY,
        renderer: this.renderer,
        spriteController,
        onPixelClick: (x, y) => {
          // Draw with currently selected color
          spriteController.setPixel(x, y, this.selectedColorIndex);

          // Re-render both cards
          spriteController.render(spriteCardResult.card.getContentContainer().children[0] as PIXI.Container);
          instance.sheetCard.controller.render(instance.sheetCard.card.getContentContainer());

          // Save project state after pixel change
          this.saveProjectState();
        },
        onFocus: makeThisSheetActive
      });

      this.scene.addChild(spriteCardResult.card.container);
      instance.spriteCard = spriteCardResult;
      instance.spriteController = spriteController;

      // Register sprite card for state persistence
      const sheetIndex = this.spriteSheetInstances.indexOf(instance);
      this.registerCard(`sprite-card-${sheetIndex}`, spriteCardResult.card);

      // Link the paired cards
      spriteCardResult.card.setPairedCard(instance.sheetCard.card);
      instance.sheetCard.card.setPairedCard(spriteCardResult.card);

      // Setup mouse wheel zoom for sprite card
      const handleSpriteZoom = createCardZoomHandler(this.renderer, spriteCardResult.card, (delta) => {
        const currentScale = spriteController.getScale();
        // Use larger increments for more responsive zooming (2x per scroll)
        const zoomIncrement = delta * 2;
        const newScale = Math.max(1, Math.min(64, currentScale + zoomIncrement));

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
      renderer: this.renderer,
      showGrid,
      onCellHover: (cellX, cellY) => {
        // Update info bar or show tooltip with cell coordinates
        console.log(`Hovering cell: ${cellX}, ${cellY}`);
      },
      onCellClick: (cellX, cellY) => {
        createSpriteCardForCell(cellX, cellY);
        // Save project state so selected cell is persisted
        this.saveProjectState();
      },
      onFocus: makeThisSheetActive
    });

    this.scene.addChild(spriteSheetResult.card.container);
    instance.sheetCard = spriteSheetResult;

    // Restore pixel data if loading from saved state
    if (savedState) {
      spriteSheetResult.controller.setPixelData(savedState.pixels);
      if (savedState.scale) {
        spriteSheetResult.controller.setScale(savedState.scale);
      }
      // Re-render with loaded data
      spriteSheetResult.controller.render(spriteSheetResult.card.getContentContainer());
    }

    // Register sprite sheet card for state persistence
    const sheetIndex = this.spriteSheetInstances.length;
    this.registerCard(`sprite-sheet-${sheetIndex}`, spriteSheetResult.card);

    // Add to instances array
    this.spriteSheetInstances.push(instance);

    // Set as active sprite sheet
    this.activeSpriteSheetInstance = instance;

    // Update palette to match this sprite sheet
    this.updatePaletteForActiveSheet();

    // If creating a new spritesheet (not loading from saved state), zoom to 4x
    if (!savedState) {
      spriteSheetResult.controller.setScale(4);
      const dims = spriteSheetResult.controller.getScaledDimensions();
      const newContentWidth = Math.ceil(dims.width / px(1));
      const newContentHeight = Math.ceil(dims.height / px(1));
      spriteSheetResult.card.setContentSize(newContentWidth, newContentHeight);
      spriteSheetResult.controller.render(spriteSheetResult.card.getContentContainer());
    }

    // Automatically select saved cell or default to (0, 0) and show sprite card
    const cellX = savedState?.selectedCellX ?? 0;
    const cellY = savedState?.selectedCellY ?? 0;
    spriteSheetResult.controller.selectCell(cellX, cellY);

    // Center the selected cell in the sprite sheet view (if loading from saved state)
    if (savedState) {
      // Get content dimensions in pixels from the card
      const contentState = spriteSheetResult.card.getContentSize();
      const contentWidthPx = px(contentState.width);
      const contentHeightPx = px(contentState.height);
      spriteSheetResult.controller.centerCell(cellX, cellY, contentWidthPx, contentHeightPx);
    }

    createSpriteCardForCell(cellX, cellY);

    // If loading from saved state with sprite card scale, apply it
    if (savedState?.spriteCardScale && instance.spriteController) {
      instance.spriteController.setScale(savedState.spriteCardScale);
      if (instance.spriteCard) {
        instance.spriteCard.card.setTitle(`Sprite (${savedState.spriteCardScale}x)`);
        const dims = instance.spriteController.getScaledDimensions();
        const newContentWidth = Math.ceil(dims.width / px(1));
        const newContentHeight = Math.ceil(dims.height / px(1));
        instance.spriteCard.card.setContentSize(newContentWidth, newContentHeight);
        instance.spriteCard.redraw();
      }
    }

    console.log(`Created ${type} sprite sheet`, spriteSheetResult.controller);

    // Save project state after creating new sheet
    this.saveProjectState();
  }

  /**
   * Update theme without losing state
   */
  updateTheme(): void {
    // Update renderer background
    this.renderer.background.color = getTheme().backgroundRoot;

    // Refresh all cards to apply new theme colors
    if (this.commanderBarCard) this.commanderBarCard.card.refresh();
    if (this.paletteCard) this.paletteCard.card.refresh();
    if (this.infoBarCard) this.infoBarCard.card.refresh();

    // Refresh all sprite sheet instance cards
    this.spriteSheetInstances.forEach(instance => {
      if (instance.sheetCard) {
        instance.sheetCard.card.refresh();
      }
      if (instance.spriteCard) {
        instance.spriteCard.card.refresh();
      }
    });

    console.log('✨ Theme updated without losing state');
  }

  /**
   * Recreate all UI with current theme
   */
  async recreateUI(): Promise<void> {
    // Remove all UI
    this.scene.removeChildren();

    // Update renderer background
    this.renderer.background.color = getTheme().backgroundRoot;

    // Recreate PIKCELL bar at top
    this.commanderBarCard = createCommanderBarCard({
      x: px(GRID.margin),
      y: px(GRID.margin),
      renderer: this.renderer,
      scene: this.scene,
      callbacks: {
        onNew: () => this.handleNew(),
        onSave: () => this.handleSave(),
        onLoad: () => this.handleLoad(),
        onExport: () => this.handleExport(),
        onApplyLayout: () => this.applyDefaultLayout(),
        onSaveLayoutSlot: (slot) => this.handleSaveLayoutSlot(slot),
        onLoadLayoutSlot: (slot) => this.handleLoadLayoutSlot(slot),
        hasLayoutSlot: (slot) => LayoutStateManager.hasLayoutSlot(slot),
        onThemeChange: () => this.updateTheme(),
        onScaleChange: (scale) => this.handleScaleChange(scale) // TEMPORARY
      }
    });
    this.scene.addChild(this.commanderBarCard.card.container);
    this.registerCard('commander', this.commanderBarCard.card);

    // Calculate top offset for cards below PIKCELL bar
    const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24;
    const topOffset = px(GRID.margin) + commanderBarHeight + px(GRID.gap * 2);

    // Recreate palette card with current palette
    this.paletteCard = createPaletteCard({
      x: px(GRID.margin),
      y: topOffset,
      renderer: this.renderer,
      palette: this.currentPalette,
      selectedColorIndex: this.selectedColorIndex,
      onColorSelect: (colorIndex, color) => {
        this.selectedColorIndex = colorIndex;
      }
    });
    this.scene.addChild(this.paletteCard.card.container);
    this.registerCard('palette', this.paletteCard.card);

    // Recreate info bar (full width, edge to edge)
    const barHeight = 8;
    const cardTotalHeight = calculateCardHeight(barHeight);
    const infoY = this.renderer.height - cardTotalHeight;
    const infoBarWidth = calculateFullWidthContentSize(this.renderer.width);

    this.infoBarCard = createInfoBarCard({
      x: 0,
      y: infoY,
      renderer: this.renderer,
      width: infoBarWidth
    });
    this.scene.addChild(this.infoBarCard.card.container);
    this.registerCard('info', this.infoBarCard.card);

    // Create scale card (TEMPORARY: for testing GRID scaling)
    // HIDDEN: Uncomment to enable scale testing controls
    // this.scaleCard = createScaleCard({
    //   x: px(GRID.margin),
    //   y: px(GRID.margin) * 2 + commanderBarHeight,
    //   renderer: this.renderer,
    //   onScaleChange: (scale) => this.handleScaleChange(scale)
    // });
    // this.scene.addChild(this.scaleCard.card.container);
    // this.registerCard('scale', this.scaleCard.card);

    // Load project state (sprite sheets and pixel data)
    this.loadProjectState();

    // Restore UI state (card positions) if available
    this.restoreUIState();
  }

  /**
   * Save current project state to localStorage (debounced)
   */
  private saveProjectState(): void {
    this.hasUnsavedChanges = true;

    // Debounce: wait 1000ms after last change before saving
    if (this.projectSaveTimer) {
      clearTimeout(this.projectSaveTimer);
    }

    this.projectSaveTimer = window.setTimeout(() => {
      // Update project state with current sprite sheet data
      this.projectState.spriteSheets = this.spriteSheetInstances.map(instance => {
        const cell = instance.sheetCard.controller.getSelectedCell();
        const state: SpriteSheetState = {
          id: instance.id,
          type: instance.sheetCard.controller.getConfig().type,
          showGrid: false, // TODO: track this
          pixels: instance.sheetCard.controller.getPixelData(),
          selectedCellX: cell.x,
          selectedCellY: cell.y,
          scale: instance.sheetCard.controller.getScale(),
          spriteCardScale: instance.spriteController?.getScale()
        };
        return state;
      });

      this.projectState.activeSpriteSheetId = this.activeSpriteSheetInstance?.id ?? null;
      this.projectState.selectedColorIndex = this.selectedColorIndex;

      ProjectStateManager.saveProject(this.projectState);
    }, 1000);
  }

  /**
   * Load project state and recreate sprite sheets
   */
  private loadProjectState(): void {
    if (this.projectState.spriteSheets.length === 0) {
      console.log('No sprite sheets in project state');
      return;
    }

    // Restore selected color
    this.selectedColorIndex = this.projectState.selectedColorIndex ?? 0;

    // Recreate each sprite sheet
    this.projectState.spriteSheets.forEach(sheetState => {
      this.createNewSpriteSheet(
        sheetState.type,
        sheetState.showGrid,
        sheetState
      );
    });

    console.log('📂 Project state loaded');
  }

  /**
   * Handle "New" button - Check for unsaved work, then create new project
   */
  private async handleNew(): Promise<void> {
    // If there's existing work, prompt to save
    if (this.spriteSheetInstances.length > 0) {
      const dialog = createPixelDialog({
        title: 'Save Current Project?',
        message: 'You have unsaved work. Save before creating new project?',
        buttons: [
          {
            label: 'Save',
            onClick: () => {
              this.handleSave();
              // Then create new project
              setTimeout(() => this.createNewProject(), 100);
            }
          },
          {
            label: 'Discard',
            onClick: () => {
              this.createNewProject();
            }
          },
          {
            label: 'Cancel',
            onClick: () => {
              // Do nothing, just close dialog
            }
          }
        ],
        renderer: this.renderer
      });
      this.scene.addChild(dialog);
    } else {
      // No existing work, just show the new project dialog
      this.createNewProject();
    }
  }

  /**
   * Create a new project - show sprite sheet type dialog
   */
  private createNewProject(): void {
    // Clear existing work
    this.spriteSheetInstances.forEach(instance => {
      if (instance.sheetCard) {
        this.scene.removeChild(instance.sheetCard.card.container);
      }
      if (instance.spriteCard) {
        this.scene.removeChild(instance.spriteCard.card.container);
      }
    });

    this.spriteSheetInstances = [];
    this.activeSpriteSheetInstance = null;
    this.projectState = ProjectStateManager.createEmptyProject();
    this.hasUnsavedChanges = false;

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
            this.createNewSpriteSheet('PICO-8', checkboxStates?.showGrid ?? false);
          }
        },
        {
          label: 'TIC-80',
          onClick: (checkboxStates) => {
            this.createNewSpriteSheet('TIC-80', checkboxStates?.showGrid ?? false);
          }
        }
      ],
      renderer: this.renderer
    });
    this.scene.addChild(dialog);
  }

  /**
   * Handle "Save" button - Download project file
   */
  private handleSave(): void {
    // Force immediate save to project state
    if (this.projectSaveTimer) {
      clearTimeout(this.projectSaveTimer);
    }

    // Update project state with current data
    this.projectState.spriteSheets = this.spriteSheetInstances.map(instance => {
      const cell = instance.sheetCard.controller.getSelectedCell();
      return {
        id: instance.id,
        type: instance.sheetCard.controller.getConfig().type,
        showGrid: false,
        pixels: instance.sheetCard.controller.getPixelData(),
        selectedCellX: cell.x,
        selectedCellY: cell.y,
        scale: instance.sheetCard.controller.getScale(),
        spriteCardScale: instance.spriteController?.getScale()
      };
    });

    this.projectState.activeSpriteSheetId = this.activeSpriteSheetInstance?.id ?? null;
    this.projectState.selectedColorIndex = this.selectedColorIndex;

    // Download as .moxi file
    ProjectStateManager.downloadProject(this.projectState);
    this.hasUnsavedChanges = false;
  }

  /**
   * Handle "Load" button - Load project from file
   */
  private async handleLoad(): Promise<void> {
    // If there's existing work, warn user
    if (this.spriteSheetInstances.length > 0 && this.hasUnsavedChanges) {
      const dialog = createPixelDialog({
        title: 'Unsaved Changes',
        message: 'Loading will replace current project. Continue?',
        buttons: [
          {
            label: 'Continue',
            onClick: async () => {
              await this.loadProjectFile();
            }
          },
          {
            label: 'Cancel',
            onClick: () => {
              // Do nothing
            }
          }
        ],
        renderer: this.renderer
      });
      this.scene.addChild(dialog);
    } else {
      await this.loadProjectFile();
    }
  }

  /**
   * Load a project file and recreate the UI
   */
  private async loadProjectFile(): Promise<void> {
    const loadedState = await ProjectStateManager.loadProjectFromFile();
    if (!loadedState) {
      console.log('No file selected or failed to load');
      return;
    }

    // Clear existing work
    this.spriteSheetInstances.forEach(instance => {
      if (instance.sheetCard) {
        this.scene.removeChild(instance.sheetCard.card.container);
      }
      if (instance.spriteCard) {
        this.scene.removeChild(instance.spriteCard.card.container);
      }
    });

    this.spriteSheetInstances = [];
    this.activeSpriteSheetInstance = null;

    // Set the loaded state
    this.projectState = loadedState;
    this.hasUnsavedChanges = false;

    // Save to localStorage and recreate UI
    ProjectStateManager.saveProject(this.projectState);
    this.loadProjectState();
  }

  /**
   * Handle "Export" button - Export sprite sheet as PNG
   */
  private handleExport(): void {
    // Get the active sprite sheet instance
    if (!this.activeSpriteSheetInstance) {
      const dialog = createPixelDialog({
        title: 'No Sprite Sheet',
        message: 'No sprite sheet available. Please create a sprite sheet first.',
        buttons: [
          {
            label: 'OK',
            onClick: () => {}
          }
        ],
        renderer: this.renderer
      });
      this.scene.addChild(dialog);
      return;
    }

    const spriteSheetController = this.activeSpriteSheetInstance.sheetCard.controller;
    const config = spriteSheetController.getConfig();

    // Create a temporary canvas at the sprite sheet's full dimensions
    const canvas = document.createElement('canvas');
    canvas.width = config.width;
    canvas.height = config.height;
    const ctx = canvas.getContext('2d')!;

    // Get the sprite sheet's full pixel data (2D array)
    const pixelData = spriteSheetController.getPixelData();
    const palette = config.palette;

    // Draw all pixels to canvas
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        const colorIndex = pixelData[y][x];
        const color = palette[colorIndex];

        // Convert hex color to RGB
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spritesheet-${config.type.toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  /**
   * Handle saving current layout to a slot
   */
  private handleSaveLayoutSlot(slot: 'A' | 'B' | 'C'): void {
    const layoutState: LayoutSlotState = {
      cards: []
    };

    // Capture all card positions and sizes
    this.cardRegistry.forEach((card, id) => {
      const contentSize = card.getContentSize();
      layoutState.cards.push({
        id,
        x: card.container.x,
        y: card.container.y,
        width: contentSize.width,
        height: contentSize.height
      });
    });

    // Save to localStorage
    LayoutStateManager.saveLayoutSlot(slot, layoutState);

    console.log(`Layout saved to slot ${slot}`);
  }

  /**
   * Handle loading layout from a slot
   */
  private handleLoadLayoutSlot(slot: 'A' | 'B' | 'C'): void {
    const layoutState = LayoutStateManager.loadLayoutSlot(slot);
    if (!layoutState) {
      console.warn(`No layout found in slot ${slot}`);
      return;
    }

    // Apply the layout to all cards
    layoutState.cards.forEach(cardLayout => {
      const card = this.cardRegistry.get(cardLayout.id);
      if (card) {
        // Set position
        card.container.position.set(cardLayout.x, cardLayout.y);

        // Set size
        card.setContentSize(cardLayout.width, cardLayout.height);
      }
    });

    console.log(`Layout loaded from slot ${slot}`);
  }

  /**
   * TEMPORARY: Handle scale change for testing
   */
  private handleScaleChange(scale: number): void {
    console.log(`🔧 TEMPORARY: Changing GRID scale to ${scale}x`);

    // Show a dialog explaining that this requires page reload
    const dialog = createPixelDialog({
      title: 'Scale Change',
      message: `Changing scale to ${scale}x requires reloading the page. This is TEMPORARY for testing the GRID system.`,
      buttons: [
        {
          label: 'Reload',
          onClick: () => {
            // Store the desired scale in localStorage
            localStorage.setItem('temp-grid-scale', scale.toString());
            window.location.reload();
          }
        },
        {
          label: 'Cancel',
          onClick: () => {
            // Do nothing
          }
        }
      ],
      renderer: this.renderer
    });
    this.scene.addChild(dialog);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.uiStateSaveTimer) {
      clearTimeout(this.uiStateSaveTimer);
    }
    if (this.projectSaveTimer) {
      clearTimeout(this.projectSaveTimer);
    }
    this.cardRegistry.clear();
    this.spriteSheetInstances = [];
    this.activeSpriteSheetInstance = null;
  }
}
