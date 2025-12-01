/**
 * SpriteCardFactory - Creates and manages sprite cards
 *
 * Extracted from SpriteEditor to follow Single Responsibility Principle.
 * Handles sprite card creation, updates, zoom handlers, and card pairing.
 */
import * as PIXI from 'pixi.js';
import { GRID, BORDER, px } from '@moxijs/core';
import { SpriteController } from '../controllers/sprite-controller';
import { createSpriteEditorCard, SpriteEditorCardResult } from '../components/sprite-editor-card';
import { PixelCard } from '../components/pixel-card';
import { createCardZoomHandler } from '../utilities/card-zoom-handler';
import { calculateCommanderBarHeight } from '../utilities/card-utils';
import { SpriteSheetInstance } from '../interfaces/managers';
import { getSpriteCardId } from '../config/card-ids';
import { SPRITE_CONSTANTS } from '../config/constants';
import { MainToolType } from '../cards/toolbar-card';
import { ShapeType } from '../theming/tool-icons';
import { UndoManager } from '../state/undo-manager';
import { Point, getFloodFillPixels } from '../utilities/shape-drawer';

export interface SpriteCardFactoryOptions {
  renderer: PIXI.Renderer;
  scene: PIXI.Container;
  registerCard: (id: string, card: PixelCard) => void;
  getSelectedColorIndex: () => number;
  getSelectedColorHex: () => number;
  getCurrentTool: () => MainToolType;
  getCurrentShape: () => ShapeType;
  undoManager: UndoManager;
  onPixelChange: () => void;
  onFocus: (instance: SpriteSheetInstance) => void;
  getSheetIndex: (instance: SpriteSheetInstance) => number;
}

export interface CreateSpriteCardOptions {
  instance: SpriteSheetInstance;
  cellX: number;
  cellY: number;
  savedScale?: number;
}

/**
 * Factory for creating and managing sprite cards
 */
export class SpriteCardFactory {
  private renderer: PIXI.Renderer;
  private scene: PIXI.Container;
  private registerCard: (id: string, card: any) => void;
  private getSelectedColorIndex: () => number;
  private getSelectedColorHex: () => number;
  private getCurrentTool: () => MainToolType;
  private getCurrentShape: () => ShapeType;
  private undoManager: UndoManager;
  private onPixelChange: () => void;
  private onFocus: (instance: SpriteSheetInstance) => void;
  private getSheetIndex: (instance: SpriteSheetInstance) => number;

  // Track zoom handlers for cleanup
  private zoomHandlers: Map<string, (e: WheelEvent) => void> = new Map();

  constructor(options: SpriteCardFactoryOptions) {
    this.renderer = options.renderer;
    this.scene = options.scene;
    this.registerCard = options.registerCard;
    this.getSelectedColorIndex = options.getSelectedColorIndex;
    this.getSelectedColorHex = options.getSelectedColorHex;
    this.getCurrentTool = options.getCurrentTool;
    this.getCurrentShape = options.getCurrentShape;
    this.undoManager = options.undoManager;
    this.onPixelChange = options.onPixelChange;
    this.onFocus = options.onFocus;
    this.getSheetIndex = options.getSheetIndex;
  }

  /**
   * Create or update a sprite card for a cell
   *
   * If the instance already has a sprite card, it updates the cell.
   * Otherwise, it creates a new sprite card.
   */
  createOrUpdate(options: CreateSpriteCardOptions): void {
    const { instance, cellX, cellY, savedScale } = options;

    // If sprite card already exists, just update the cell
    if (instance.spriteCard && instance.spriteController) {
      this.updateCell(instance, cellX, cellY);
      return;
    }

    // Create new sprite card
    this.createNew(instance, cellX, cellY, savedScale);
  }

  /**
   * Update an existing sprite card to show a different cell
   */
  private updateCell(instance: SpriteSheetInstance, cellX: number, cellY: number): void {
    if (!instance.spriteCard || !instance.spriteController) return;

    console.log(`Updating sprite card to cell: ${cellX}, ${cellY}`);
    instance.spriteController.setCell(cellX, cellY);
    instance.spriteCard.redraw();
    instance.sheetCard.controller.render(instance.sheetCard.card.getContentContainer());
    this.onFocus(instance);
  }

  /**
   * Create a new sprite card for an instance
   */
  private createNew(
    instance: SpriteSheetInstance,
    cellX: number,
    cellY: number,
    savedScale?: number
  ): void {
    console.log(`Creating sprite card for cell: ${cellX}, ${cellY}`);
    this.onFocus(instance);

    // Create sprite controller
    const spriteController = new SpriteController({
      spriteSheetController: instance.sheetCard.controller,
      cellX,
      cellY,
      scale: savedScale ?? 32
    });

    // Calculate position
    const position = this.calculatePosition(instance, spriteController);

    // Remove old sprite card if exists
    if (instance.spriteCard) {
      this.scene.removeChild(instance.spriteCard.card.container);
    }

    // Create the sprite card
    const spriteCardResult = createSpriteEditorCard({
      x: position.x,
      y: position.y,
      renderer: this.renderer,
      spriteController,
      getCurrentTool: () => this.getCurrentTool(),
      getCurrentShape: () => this.getCurrentShape(),
      getPreviewColor: () => this.getSelectedColorHex(),
      onPixelClick: (x, y, oldColorIndex) => {
        // Use color index 0 for eraser, otherwise use selected color
        const tool = this.getCurrentTool();
        const newColorIndex = tool === 'eraser' ? 0 : this.getSelectedColorIndex();

        // Record the pixel change for undo
        this.undoManager.recordPixelChange(x, y, oldColorIndex, newColorIndex);

        spriteController.setPixel(x, y, newColorIndex);

        // Re-render
        spriteController.render(spriteCardResult.card.getContentContainer().children[0] as PIXI.Container);
        instance.sheetCard.controller.render(instance.sheetCard.card.getContentContainer());

        this.onPixelChange();
      },
      onShapeDraw: (pixels, oldColors) => {
        // Use color index 0 for eraser, otherwise use selected color
        const tool = this.getCurrentTool();
        const newColorIndex = tool === 'eraser' ? 0 : this.getSelectedColorIndex();

        // Record all pixel changes for undo
        for (const pixel of pixels) {
          const key = `${pixel.x},${pixel.y}`;
          const oldColorIndex = oldColors.get(key) ?? 0;
          this.undoManager.recordPixelChange(pixel.x, pixel.y, oldColorIndex, newColorIndex);
          spriteController.setPixel(pixel.x, pixel.y, newColorIndex);
        }

        // Re-render
        spriteController.render(spriteCardResult.card.getContentContainer().children[0] as PIXI.Container);
        instance.sheetCard.controller.render(instance.sheetCard.card.getContentContainer());

        this.onPixelChange();
      },
      onFill: (x, y) => {
        const newColorIndex = this.getSelectedColorIndex();
        const targetColorIndex = spriteController.getPixel(x, y);

        // Don't fill if clicking on same color
        if (newColorIndex === targetColorIndex) {
          return;
        }

        // Sprite dimensions are always 8x8
        const size = SPRITE_CONSTANTS.CELL_SIZE;

        // Get all pixels to fill using flood fill algorithm
        const pixelsToFill = getFloodFillPixels(
          x, y, size, size,
          (px, py) => spriteController.getPixel(px, py)
        );

        if (pixelsToFill.length === 0) {
          return;
        }

        // Begin undo stroke
        this.undoManager.beginStroke(instance.id);

        // Record all pixel changes for undo and apply them
        for (const pixel of pixelsToFill) {
          this.undoManager.recordPixelChange(pixel.x, pixel.y, targetColorIndex, newColorIndex);
          spriteController.setPixel(pixel.x, pixel.y, newColorIndex);
        }

        // End undo stroke
        this.undoManager.endStroke();

        // Re-render
        spriteController.render(spriteCardResult.card.getContentContainer().children[0] as PIXI.Container);
        instance.sheetCard.controller.render(instance.sheetCard.card.getContentContainer());

        this.onPixelChange();
      },
      onDrawStart: () => {
        this.undoManager.beginStroke(instance.id);
      },
      onDrawEnd: () => {
        this.undoManager.endStroke();
      },
      onFocus: () => this.onFocus(instance)
    });

    // Add to scene
    this.scene.addChild(spriteCardResult.card.container);

    // Store references
    instance.spriteCard = spriteCardResult;
    instance.spriteController = spriteController;

    // Register with UI manager
    const sheetIndex = this.getSheetIndex(instance);
    this.registerCard(getSpriteCardId(sheetIndex), spriteCardResult.card);

    // Link paired cards
    spriteCardResult.card.setPairedCard(instance.sheetCard.card);
    instance.sheetCard.card.setPairedCard(spriteCardResult.card);

    // Setup zoom handler
    this.setupZoomHandler(instance, spriteController, spriteCardResult);
  }

  /**
   * Calculate the initial position for a sprite card
   */
  private calculatePosition(
    instance: SpriteSheetInstance,
    spriteController: SpriteController
  ): { x: number; y: number } {
    // Preserve position if sprite card already exists
    if (instance.spriteCard) {
      return {
        x: instance.spriteCard.card.container.x,
        y: instance.spriteCard.card.container.y
      };
    }

    // Calculate default center position
    const dims = spriteController.getScaledDimensions();
    const commanderBarHeight = calculateCommanderBarHeight();

    return {
      x: (this.renderer.width - dims.width) / 2,
      y: px(GRID.margin) + commanderBarHeight + px(GRID.gap * 2)
    };
  }

  /**
   * Setup zoom handler for a sprite card
   */
  private setupZoomHandler(
    instance: SpriteSheetInstance,
    spriteController: SpriteController,
    spriteCardResult: SpriteEditorCardResult
  ): void {
    const handleZoom = createCardZoomHandler(this.renderer, spriteCardResult.card, (delta) => {
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

    // Store handler for cleanup
    const handlerId = instance.id;
    this.zoomHandlers.set(handlerId, handleZoom);

    if (typeof window !== 'undefined') {
      window.addEventListener('wheel', handleZoom, { passive: false });

      spriteCardResult.card.container.on('destroyed', () => {
        window.removeEventListener('wheel', handleZoom);
        this.zoomHandlers.delete(handlerId);
      });
    }
  }

  /**
   * Restore sprite card scale from saved state
   */
  restoreScale(instance: SpriteSheetInstance, scale: number): void {
    if (!instance.spriteController || !instance.spriteCard) return;

    instance.spriteController.setScale(scale);
    instance.spriteCard.card.setTitle(`Sprite (${scale}x)`);

    const dims = instance.spriteController.getScaledDimensions();
    const newContentWidth = Math.ceil(dims.width / px(1));
    const newContentHeight = Math.ceil(dims.height / px(1));
    instance.spriteCard.card.setContentSize(newContentWidth, newContentHeight);
    instance.spriteCard.redraw();
  }

  /**
   * Remove a sprite card from an instance
   */
  remove(instance: SpriteSheetInstance): void {
    if (instance.spriteCard) {
      this.scene.removeChild(instance.spriteCard.card.container);
      instance.spriteCard = null;
    }
    if (instance.spriteController) {
      instance.spriteController = null;
    }

    // Clean up zoom handler
    const handleZoom = this.zoomHandlers.get(instance.id);
    if (handleZoom && typeof window !== 'undefined') {
      window.removeEventListener('wheel', handleZoom);
      this.zoomHandlers.delete(instance.id);
    }
  }

  /**
   * Clean up all zoom handlers
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      this.zoomHandlers.forEach((handler) => {
        window.removeEventListener('wheel', handler);
      });
    }
    this.zoomHandlers.clear();
  }
}

