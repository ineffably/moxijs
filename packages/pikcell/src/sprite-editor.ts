/**
 * Sprite Editor (Refactored) - Main orchestrator class
 *
 * REFACTORED to use manager pattern for better separation of concerns:
 * - SpriteSheetManager: Sprite sheet lifecycle
 * - UIManager: Card registry and z-ordering
 * - LayoutManager: Positioning and layouts
 * - FileOperationsManager: Save/load/export
 *
 * This reduces the class from 1040 lines to ~400 lines with clear responsibilities.
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from './components/pixel-card';
import { createPixelDialog } from './components/pixel-dialog';
import { createSpriteSheetCard, SPRITESHEET_CONFIGS } from './components/spritesheet-card';
import { createSpriteCard } from './components/sprite-card';
import { SpriteController } from './controllers/sprite-controller';
import { SpriteSheetType } from './controllers/sprite-sheet-controller';
import { UIStateManager } from './state/ui-state-manager';
import { ProjectStateManager, ProjectState, SpriteSheetState } from './state/project-state-manager';
import { LayoutStateManager, LayoutSlotState } from './state/layout-state-manager';
import { getTheme } from './theming/theme';
import { PICO8_PALETTE } from './theming/palettes';
import { GRID, BORDER, px } from 'moxi';

// Card imports
import { createPaletteCard, PaletteCardResult } from './cards/palette-card';
import { createInfoBarCard, InfoBarCardResult } from './cards/info-bar-card';
import { createCommanderBarCard, CommanderBarCardResult } from './cards/commander-bar-card';
import { createCardZoomHandler } from './utilities/card-zoom-handler';

// Manager imports
import { SpriteSheetManager } from './managers/sprite-sheet-manager';
import { UIManager } from './managers/ui-manager';
import { LayoutManager } from './managers/layout-manager';
import { FileOperationsManager } from './managers/file-operations-manager';
import { SpriteSheetInstance } from './interfaces/managers';

// Utility imports
import { PixelRenderer } from './utilities/pixel-renderer';

export interface SpriteEditorOptions {
  renderer: PIXI.Renderer;
  scene: PIXI.Container;
  maxSpriteSheets?: number;
}

/**
 * Main Sprite Editor class (Refactored)
 * Now acts as a lightweight orchestrator that delegates to specialized managers
 */
export class SpriteEditor {
  // Managers
  private spriteSheetManager: SpriteSheetManager;
  private uiManager: UIManager;
  private layoutManager: LayoutManager;
  private fileOperationsManager: FileOperationsManager;

  // Core dependencies
  private renderer: PIXI.Renderer;
  private scene: PIXI.Container;

  // UI Cards (only persistent cards stored here)
  private commanderBarCard?: CommanderBarCardResult;
  private paletteCard?: PaletteCardResult;
  private infoBarCard?: InfoBarCardResult;

  // Editor state
  private currentPalette: number[] = PICO8_PALETTE;
  private selectedColorIndex: number = 0;
  private projectState: ProjectState;
  private hasUnsavedChanges: boolean = false;

  // Timers for debounced saves
  private uiStateSaveTimer: number | null = null;
  private projectSaveTimer: number | null = null;

  constructor(options: SpriteEditorOptions) {
    this.renderer = options.renderer;
    this.scene = options.scene;

    // Initialize managers
    this.spriteSheetManager = new SpriteSheetManager();
    this.uiManager = new UIManager(this.scene);
    this.layoutManager = new LayoutManager(this.renderer);
    this.fileOperationsManager = new FileOperationsManager();

    // Initialize or load project state
    const savedProject = ProjectStateManager.loadProject();
    this.projectState = savedProject ?? ProjectStateManager.createEmptyProject();

    // Subscribe to sprite sheet manager events
    this.spriteSheetManager.on('activeChanged', (id) => {
      this.updatePaletteForActiveSheet();
    });
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
    this.uiManager.registerCard(id, card);
    card.onStateChanged(() => this.saveUIState());
  }

  /**
   * Save current UI state to localStorage (debounced)
   */
  private saveUIState(): void {
    if (this.uiStateSaveTimer) {
      clearTimeout(this.uiStateSaveTimer);
    }

    this.uiStateSaveTimer = window.setTimeout(() => {
      const stateMap = this.uiManager.exportAllStates();
      UIStateManager.saveState(stateMap, this.renderer.width, this.renderer.height);
    }, 500);
  }

  /**
   * Restore UI state from localStorage
   */
  private restoreUIState(): boolean {
    const savedState = UIStateManager.loadState();
    if (!savedState) return false;

    const adjustedState = UIStateManager.adjustForCanvasSize(
      savedState,
      this.renderer.width,
      this.renderer.height
    );

    // Use UIManager to import states
    this.uiManager.importStates(new Map(adjustedState.cards.map(cs => [cs.id, cs])));

    console.log('✅ UI state restored');
    return true;
  }

  /**
   * Apply default layout positions to all cards
   */
  private applyDefaultLayout(): void {
    // Delegate to LayoutManager
    this.layoutManager.applyDefaultLayout(this.uiManager.getAllCards());

    // Position sprite sheet instances
    const spriteSheets = this.spriteSheetManager.getAll();
    const infoCard = this.uiManager.getCard('info');

    spriteSheets.forEach((instance, index) => {
      if (instance.sheetCard) {
        const card = instance.sheetCard.card;

        // Set minimap size and scale
        const desiredContentWidth = 50;
        const desiredContentHeight = 50;

        instance.sheetCard.controller.setScale(5);
        instance.sheetCard.controller.selectCell(0, 0);
        instance.sheetCard.controller.positionCell00AtTopLeft();

        card.setContentSize(desiredContentWidth, desiredContentHeight);
        instance.sheetCard.controller.render(card.getContentContainer());

        // Position at bottom right
        const defaultX = this.renderer.width - card.getPixelWidth();
        const defaultY = infoCard
          ? infoCard.container.y - card.getPixelHeight() - px(GRID.gap)
          : this.renderer.height - card.getPixelHeight();

        card.container.position.set(defaultX, defaultY);
      }
    });

    // Center sprite cards
    const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24;
    this.uiManager.getAllCards().forEach((card, id) => {
      if (id.startsWith('sprite-card-')) {
        const x = (this.renderer.width - card.getPixelWidth()) / 2;
        const y = px(GRID.margin) + commanderBarHeight + px(GRID.gap * 2);
        card.container.position.set(x, y);
      }
    });

    this.saveUIState();
    console.log('✅ Default layout applied');
  }

  /**
   * Updates the palette card to match the active sprite sheet
   */
  private updatePaletteForActiveSheet(): void {
    const activeSheet = this.spriteSheetManager.getActive();
    if (!activeSheet || !this.paletteCard) return;

    this.currentPalette = activeSheet.sheetCard.controller.getConfig().palette;
    this.paletteCard.setPalette(this.currentPalette);
  }

  /**
   * Creates a new sprite sheet and sprite card
   */
  private createNewSpriteSheet(type: SpriteSheetType, showGrid: boolean, savedState?: SpriteSheetState): void {
    // Validate using SpriteSheetManager
    if (!savedState) {
      const validation = this.spriteSheetManager.validate(type);
      if (!validation.valid) {
        const dialog = createPixelDialog({
          title: 'Cannot Create Sprite Sheet',
          message: validation.message || 'Validation failed',
          buttons: [{ label: 'OK', onClick: () => {} }],
          renderer: this.renderer
        });
        this.scene.addChild(dialog);
        return;
      }
    }

    // Create instance via manager (with saved ID if available)
    const instance = this.spriteSheetManager.create(type, savedState?.id);

    // Function to make this sprite sheet active
    const makeThisSheetActive = () => {
      this.spriteSheetManager.setActive(instance.id);

      // Bring cards to front using UIManager
      if (instance.sheetCard) {
        const sheetIndex = this.spriteSheetManager.getAll().indexOf(instance);
        this.uiManager.bringGroupToFront([
          `sprite-sheet-${sheetIndex}`,
          `sprite-card-${sheetIndex}`
        ]);
      }

      console.log(`Activated ${type} sprite sheet`);
    };

    // Helper to create sprite card for a cell
    const createSpriteCardForCell = (cellX: number, cellY: number) => {
      // If sprite card already exists, update it instead of creating a new one
      if (instance.spriteCard && instance.spriteController) {
        console.log(`Updating sprite card to cell: ${cellX}, ${cellY}`);
        instance.spriteController.setCell(cellX, cellY);
        instance.spriteCard.redraw();
        instance.sheetCard.controller.render(instance.sheetCard.card.getContentContainer());
        makeThisSheetActive();
        return;
      }

      console.log(`Creating sprite card for cell: ${cellX}, ${cellY}`);
      makeThisSheetActive();

      const spriteController = new SpriteController({
        spriteSheetController: instance.sheetCard.controller,
        cellX,
        cellY,
        scale: 32
      });

      // Calculate position
      let spriteCardX: number;
      let spriteCardY: number;

      if (instance.spriteCard) {
        spriteCardX = instance.spriteCard.card.container.x;
        spriteCardY = instance.spriteCard.card.container.y;
        this.scene.removeChild(instance.spriteCard.card.container);
      } else {
        const dims = spriteController.getScaledDimensions();
        const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24;
        spriteCardX = (this.renderer.width - dims.width) / 2;
        spriteCardY = px(GRID.margin) + commanderBarHeight + px(GRID.gap * 2);
      }

      const spriteCardResult = createSpriteCard({
        x: spriteCardX,
        y: spriteCardY,
        renderer: this.renderer,
        spriteController,
        onPixelClick: (x, y) => {
          spriteController.setPixel(x, y, this.selectedColorIndex);

          // Re-render using PixelRenderer utility in the future
          spriteController.render(spriteCardResult.card.getContentContainer().children[0] as PIXI.Container);
          instance.sheetCard.controller.render(instance.sheetCard.card.getContentContainer());

          this.saveProjectState();
        },
        onFocus: makeThisSheetActive
      });

      this.scene.addChild(spriteCardResult.card.container);
      instance.spriteCard = spriteCardResult;
      instance.spriteController = spriteController;

      const sheetIndex = this.spriteSheetManager.getAll().indexOf(instance);
      this.registerCard(`sprite-card-${sheetIndex}`, spriteCardResult.card);

      // Link paired cards
      spriteCardResult.card.setPairedCard(instance.sheetCard.card);
      instance.sheetCard.card.setPairedCard(spriteCardResult.card);

      // Setup zoom handler
      const handleSpriteZoom = createCardZoomHandler(this.renderer, spriteCardResult.card, (delta) => {
        const currentScale = spriteController.getScale();
        const zoomIncrement = delta * 2;
        const newScale = Math.max(1, Math.min(64, currentScale + zoomIncrement));

        if (newScale !== currentScale) {
          spriteController.setScale(newScale);
          spriteCardResult.card.setTitle(`Sprite (${newScale}x)`);

          const dims = spriteController.getScaledDimensions();
          const newContentWidth = Math.ceil(dims.width / px(1));
          const newContentHeight = Math.ceil(dims.height / px(1));
          spriteCardResult.card.setContentSize(newContentWidth, newContentHeight);

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

    // Create sprite sheet card
    const spriteSheetResult = createSpriteSheetCard({
      config: SPRITESHEET_CONFIGS[type],
      renderer: this.renderer,
      showGrid,
      onCellHover: (cellX, cellY) => {
        console.log(`Hovering cell: ${cellX}, ${cellY}`);
      },
      onCellClick: (cellX, cellY) => {
        createSpriteCardForCell(cellX, cellY);
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
      spriteSheetResult.controller.render(spriteSheetResult.card.getContentContainer());
    }

    // Register with UIManager
    const sheetIndex = this.spriteSheetManager.count() - 1;
    this.registerCard(`sprite-sheet-${sheetIndex}`, spriteSheetResult.card);

    // Set as active
    this.spriteSheetManager.setActive(instance.id);

    // Default zoom if new
    if (!savedState) {
      spriteSheetResult.controller.setScale(4);
      const dims = spriteSheetResult.controller.getScaledDimensions();
      const newContentWidth = Math.ceil(dims.width / px(1));
      const newContentHeight = Math.ceil(dims.height / px(1));
      spriteSheetResult.card.setContentSize(newContentWidth, newContentHeight);
      spriteSheetResult.controller.render(spriteSheetResult.card.getContentContainer());
    }

    // Create sprite card for initial cell
    // Note: selectCell() triggers onCellClick which calls createSpriteCardForCell
    const cellX = savedState?.selectedCellX ?? 0;
    const cellY = savedState?.selectedCellY ?? 0;
    spriteSheetResult.controller.selectCell(cellX, cellY);

    if (savedState) {
      const contentState = spriteSheetResult.card.getContentSize();
      const contentWidthPx = px(contentState.width);
      const contentHeightPx = px(contentState.height);
      spriteSheetResult.controller.centerCell(cellX, cellY, contentWidthPx, contentHeightPx);
    }

    // Restore sprite card scale if saved
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

    console.log(`Created ${type} sprite sheet`);
    this.saveProjectState();
  }

  /**
   * Update theme without losing state
   */
  updateTheme(): void {
    this.renderer.background.color = getTheme().backgroundRoot;

    // Refresh all cards
    if (this.commanderBarCard) this.commanderBarCard.card.refresh();
    if (this.paletteCard) this.paletteCard.card.refresh();
    if (this.infoBarCard) this.infoBarCard.card.refresh();

    this.spriteSheetManager.getAll().forEach(instance => {
      if (instance.sheetCard) instance.sheetCard.card.refresh();
      if (instance.spriteCard) instance.spriteCard.card.refresh();
    });

    console.log('✨ Theme updated');
  }

  /**
   * Recreate all UI with current theme
   */
  async recreateUI(): Promise<void> {
    this.scene.removeChildren();
    this.renderer.background.color = getTheme().backgroundRoot;

    // Create commander bar
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
        onScaleChange: (scale) => this.handleScaleChange(scale)
      }
    });
    this.scene.addChild(this.commanderBarCard.card.container);
    this.registerCard('commander', this.commanderBarCard.card);

    // Create palette card
    const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24;
    const topOffset = px(GRID.margin) + commanderBarHeight + px(GRID.gap * 2);

    this.paletteCard = createPaletteCard({
      x: px(GRID.margin),
      y: topOffset,
      renderer: this.renderer,
      palette: this.currentPalette,
      selectedColorIndex: this.selectedColorIndex,
      onColorSelect: (colorIndex) => {
        this.selectedColorIndex = colorIndex;
      }
    });
    this.scene.addChild(this.paletteCard.card.container);
    this.registerCard('palette', this.paletteCard.card);

    // Create info bar using LayoutManager
    const barHeight = 8;
    const cardTotalHeight = this.layoutManager.calculateCardHeightFromContent(barHeight);
    const infoY = this.renderer.height - cardTotalHeight;
    const infoBarWidth = this.layoutManager.calculateFullWidthContentSize(this.renderer.width);

    this.infoBarCard = createInfoBarCard({
      x: 0,
      y: infoY,
      renderer: this.renderer,
      width: infoBarWidth
    });
    this.scene.addChild(this.infoBarCard.card.container);
    this.registerCard('info', this.infoBarCard.card);

    // Load project state
    this.loadProjectState();

    // Restore UI state
    this.restoreUIState();
  }

  /**
   * Save current project state (debounced)
   */
  private saveProjectState(): void {
    this.hasUnsavedChanges = true;

    if (this.projectSaveTimer) {
      clearTimeout(this.projectSaveTimer);
    }

    this.projectSaveTimer = window.setTimeout(() => {
      this.projectState.spriteSheets = this.spriteSheetManager.getAll().map(instance => {
        const cell = instance.sheetCard.controller.getSelectedCell();
        const state: SpriteSheetState = {
          id: instance.id,
          type: instance.sheetCard.controller.getConfig().type,
          showGrid: false,
          pixels: instance.sheetCard.controller.getPixelData(),
          selectedCellX: cell.x,
          selectedCellY: cell.y,
          scale: instance.sheetCard.controller.getScale(),
          spriteCardScale: instance.spriteController?.getScale()
        };
        return state;
      });

      const activeSheet = this.spriteSheetManager.getActive();
      this.projectState.activeSpriteSheetId = activeSheet?.id ?? null;
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

    this.selectedColorIndex = this.projectState.selectedColorIndex ?? 0;

    this.projectState.spriteSheets.forEach(sheetState => {
      this.createNewSpriteSheet(sheetState.type, sheetState.showGrid, sheetState);
    });

    console.log('📂 Project state loaded');
  }

  /**
   * Handle "New" button
   */
  private async handleNew(): Promise<void> {
    if (this.spriteSheetManager.count() > 0) {
      const dialog = createPixelDialog({
        title: 'Save Current Project?',
        message: 'You have unsaved work. Save before creating new project?',
        buttons: [
          {
            label: 'Save',
            onClick: () => {
              this.handleSave();
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
            onClick: () => {}
          }
        ],
        renderer: this.renderer
      });
      this.scene.addChild(dialog);
    } else {
      this.createNewProject();
    }
  }

  /**
   * Create a new project
   */
  private createNewProject(): void {
    // Clear using managers
    this.spriteSheetManager.getAll().forEach(instance => {
      if (instance.sheetCard) this.scene.removeChild(instance.sheetCard.card.container);
      if (instance.spriteCard) this.scene.removeChild(instance.spriteCard.card.container);
    });

    this.spriteSheetManager.clear();
    this.projectState = ProjectStateManager.createEmptyProject();
    this.hasUnsavedChanges = false;

    // Show sprite sheet type dialog
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
   * Handle "Save" button - uses FileOperationsManager
   */
  private handleSave(): void {
    if (this.projectSaveTimer) {
      clearTimeout(this.projectSaveTimer);
    }

    // Update project state
    this.projectState.spriteSheets = this.spriteSheetManager.getAll().map(instance => {
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

    const activeSheet = this.spriteSheetManager.getActive();
    this.projectState.activeSpriteSheetId = activeSheet?.id ?? null;
    this.projectState.selectedColorIndex = this.selectedColorIndex;

    // Delegate to FileOperationsManager
    this.fileOperationsManager.saveProject(this.projectState);
    this.hasUnsavedChanges = false;
  }

  /**
   * Handle "Load" button - uses FileOperationsManager
   */
  private async handleLoad(): Promise<void> {
    if (this.spriteSheetManager.count() > 0 && this.hasUnsavedChanges) {
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
            onClick: () => {}
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
   * Load a project file
   */
  private async loadProjectFile(): Promise<void> {
    // Delegate to FileOperationsManager
    const loadedState = await this.fileOperationsManager.loadProject();
    if (!loadedState) {
      console.log('No file selected or failed to load');
      return;
    }

    // Clear existing work
    this.spriteSheetManager.getAll().forEach(instance => {
      if (instance.sheetCard) this.scene.removeChild(instance.sheetCard.card.container);
      if (instance.spriteCard) this.scene.removeChild(instance.spriteCard.card.container);
    });

    this.spriteSheetManager.clear();
    this.projectState = loadedState;
    this.hasUnsavedChanges = false;

    ProjectStateManager.saveProject(this.projectState);
    this.loadProjectState();
  }

  /**
   * Handle "Export" button - uses FileOperationsManager
   */
  private handleExport(): void {
    const activeSheet = this.spriteSheetManager.getActive();
    if (!activeSheet) {
      const dialog = createPixelDialog({
        title: 'No Sprite Sheet',
        message: 'Please create a sprite sheet first.',
        buttons: [{ label: 'OK', onClick: () => {} }],
        renderer: this.renderer
      });
      this.scene.addChild(dialog);
      return;
    }

    // Delegate to FileOperationsManager
    this.fileOperationsManager.exportPNG(activeSheet.sheetCard.controller);
  }

  /**
   * Handle saving layout to slot
   */
  private handleSaveLayoutSlot(slot: 'A' | 'B' | 'C'): void {
    const layoutState: LayoutSlotState = { cards: [] };

    this.uiManager.getAllCards().forEach((card, id) => {
      const contentSize = card.getContentSize();
      layoutState.cards.push({
        id,
        x: card.container.x,
        y: card.container.y,
        width: contentSize.width,
        height: contentSize.height
      });
    });

    LayoutStateManager.saveLayoutSlot(slot, layoutState);
    console.log(`Layout saved to slot ${slot}`);
  }

  /**
   * Handle loading layout from slot
   */
  private handleLoadLayoutSlot(slot: 'A' | 'B' | 'C'): void {
    const layoutState = LayoutStateManager.loadLayoutSlot(slot);
    if (!layoutState) {
      console.warn(`No layout found in slot ${slot}`);
      return;
    }

    layoutState.cards.forEach(cardLayout => {
      const card = this.uiManager.getCard(cardLayout.id);
      if (card) {
        card.container.position.set(cardLayout.x, cardLayout.y);
        card.setContentSize(cardLayout.width, cardLayout.height);
      }
    });

    console.log(`Layout loaded from slot ${slot}`);
  }

  /**
   * Handle scale change (temporary)
   */
  private handleScaleChange(scale: number): void {
    const dialog = createPixelDialog({
      title: 'Scale Change',
      message: `Changing scale to ${scale}x requires reloading the page.`,
      buttons: [
        {
          label: 'Reload',
          onClick: () => {
            localStorage.setItem('temp-grid-scale', scale.toString());
            window.location.reload();
          }
        },
        {
          label: 'Cancel',
          onClick: () => {}
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
    this.uiManager.clear();
    this.spriteSheetManager.clear();
  }
}
