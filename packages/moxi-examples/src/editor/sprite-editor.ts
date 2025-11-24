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
import { getTheme } from './theming/theme';
import { PICO8_PALETTE } from './theming/palettes';
import { GRID, BORDER, px } from 'moxi';

// Card imports
import { createPaletteCard, PaletteCardResult } from './cards/palette-card';
import { createToolCard, ToolCardResult } from './cards/tool-card';
import { createSPTToolbarCard, SPTToolbarCardResult } from './cards/spt-toolbar-card';
import { createInfoBarCard, InfoBarCardResult } from './cards/info-bar-card';
import { createCommanderBarCard, CommanderBarCardResult } from './cards/commander-bar-card';
import { createCardZoomHandler } from './utilities/card-zoom-handler';

/**
 * State for sprite sheets and editing
 */
interface SpriteSheetInstance {
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

  // Sprite sheets
  private spriteSheetInstances: SpriteSheetInstance[] = [];
  private activeSpriteSheetInstance: SpriteSheetInstance | null = null;

  // State
  private currentPalette: number[] = PICO8_PALETTE;
  private selectedColorIndex: number = 0;

  // Card registry for UI state persistence
  private cardRegistry = new Map<string, PixelCard>();
  private uiStateSaveTimer: number | null = null;

  constructor(options: SpriteEditorOptions) {
    this.renderer = options.renderer;
    this.scene = options.scene;
    this.maxSpriteSheets = options.maxSpriteSheets ?? 2;
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
    const margin = 20;
    const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24;
    const topOffset = commanderBarHeight + 10;

    // Position commander bar at top (y=0, x=0)
    const commanderCard = this.cardRegistry.get('commander');
    if (commanderCard) {
      commanderCard.container.position.set(0, 0);
    }

    // Position palette card below commander on the left
    const paletteCard = this.cardRegistry.get('palette');
    if (paletteCard) {
      paletteCard.container.position.set(margin, topOffset);
    }

    // Position info bar at bottom left
    const infoCard = this.cardRegistry.get('info');
    if (infoCard) {
      const bottomMargin = 20;
      const barHeight = 8;
      const y = this.renderer.height - px(barHeight) - px(BORDER.total * 2) - bottomMargin - 24;
      infoCard.container.position.set(margin, y);
    }

    // Position sprite sheets at their default location (bottom right, minimap style)
    this.cardRegistry.forEach((card, id) => {
      if (id.startsWith('sprite-sheet-')) {
        // Get the sprite sheet's default position (bottom right)
        const cardBounds = card.container.getBounds();
        const defaultX = this.renderer.width - cardBounds.width - margin;
        const defaultY = this.renderer.height - cardBounds.height - margin;
        card.container.position.set(defaultX, defaultY);
      }
    });

    // Position sprite cards centered below commander bar
    this.cardRegistry.forEach((card, id) => {
      if (id.startsWith('sprite-card-')) {
        const cardBounds = card.container.getBounds();
        const gapBelowCommander = 10;
        const x = (this.renderer.width - cardBounds.width) / 2;
        const y = margin + commanderBarHeight + gapBelowCommander;
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
  private createNewSpriteSheet(type: SpriteSheetType, showGrid: boolean): void {
    // Check if we've hit the limit
    if (this.spriteSheetInstances.length >= this.maxSpriteSheets) {
      // Show dialog telling user they've hit the limit
      const dialog = createPixelDialog({
        title: 'Sprite Sheet Limit',
        message: `Maximum ${this.maxSpriteSheets} sprite sheets allowed.`,
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

    // Create the instance object
    const instance: SpriteSheetInstance = {
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
        // Create sprite card at default position - just below commander bar, centered horizontally
        const spriteCardDims = spriteController.getScaledDimensions();
        const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24; // Title bar height
        const topMargin = 20;
        const gapBelowCommander = 10;

        spriteCardX = (this.renderer.width - spriteCardDims.width) / 2;
        spriteCardY = topMargin + commanderBarHeight + gapBelowCommander;
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
      renderer: this.renderer,
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

    this.scene.addChild(spriteSheetResult.card.container);
    instance.sheetCard = spriteSheetResult;

    // Register sprite sheet card for state persistence
    const sheetIndex = this.spriteSheetInstances.length;
    this.registerCard(`sprite-sheet-${sheetIndex}`, spriteSheetResult.card);

    // Add to instances array
    this.spriteSheetInstances.push(instance);

    // Set as active sprite sheet
    this.activeSpriteSheetInstance = instance;

    // Update palette to match this sprite sheet
    this.updatePaletteForActiveSheet();

    // Automatically select top-left cell (0, 0) and show sprite card
    spriteSheetResult.controller.selectCell(0, 0);
    createSpriteCardForCell(0, 0);

    console.log(`Created ${type} sprite sheet`, spriteSheetResult.controller);
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

    // Recreate commander bar at top
    const margin = 20;
    this.commanderBarCard = createCommanderBarCard({
      x: margin,
      y: margin,
      renderer: this.renderer,
      scene: this.scene,
      callbacks: {
        onNewSpriteSheet: (type, showGrid) => this.createNewSpriteSheet(type, showGrid),
        onApplyLayout: () => this.applyDefaultLayout(),
        onThemeChange: () => this.updateTheme()
      }
    });
    this.scene.addChild(this.commanderBarCard.card.container);
    this.registerCard('commander', this.commanderBarCard.card);

    // Calculate top offset for cards below commander bar
    const commanderBarHeight = px(12) + px(BORDER.total * 2) + 24;
    const topOffset = margin + commanderBarHeight + 10;

    // Recreate palette card with current palette
    this.paletteCard = createPaletteCard({
      x: margin,
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

    // Recreate info bar
    const bottomMargin = 20;
    const barHeight = 8;
    const infoY = this.renderer.height - px(barHeight) - px(BORDER.total * 2) - bottomMargin - 24;
    this.infoBarCard = createInfoBarCard({
      x: margin,
      y: infoY,
      renderer: this.renderer
    });
    this.scene.addChild(this.infoBarCard.card.container);
    this.registerCard('info', this.infoBarCard.card);

    // Restore UI state if available
    this.restoreUIState();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.uiStateSaveTimer) {
      clearTimeout(this.uiStateSaveTimer);
    }
    this.cardRegistry.clear();
    this.spriteSheetInstances = [];
    this.activeSpriteSheetInstance = null;
  }
}
