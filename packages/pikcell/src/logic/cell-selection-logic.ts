/**
 * CellSelectionLogic - Moxi Logic component for sprite sheet cell selection
 *
 * Implements cell hover, click, and selection behavior for sprite sheet grids
 * following the Moxi ECS pattern.
 */
import * as PIXI from 'pixi.js';
import { Logic } from 'moxi-kit';
import { SPRITE_SHEET_CONSTANTS, COLOR_CONSTANTS } from '../config/constants';

export interface CellSelectionOptions {
  /** Grid cell size in pixels */
  cellSize?: number;

  /** Sheet width in cells */
  sheetWidth: number;

  /** Sheet height in cells */
  sheetHeight: number;

  /** Current scale of the sheet */
  scale?: number;

  /** Click threshold to distinguish from drag */
  clickThreshold?: number;

  /** Callback when cell is hovered */
  onCellHover?: (cellX: number, cellY: number) => void;

  /** Callback when cell is clicked */
  onCellClick?: (cellX: number, cellY: number) => void;

  /** Callback when cell is selected (confirms selection) */
  onCellSelect?: (cellX: number, cellY: number) => void;
}

/**
 * Logic component for cell selection in sprite sheets
 */
export class CellSelectionLogic extends Logic<PIXI.Container> {
  name = 'CellSelectionLogic';

  private options: Required<CellSelectionOptions>;

  // Selection state
  private hoveredCellX = -1;
  private hoveredCellY = -1;
  private selectedCellX = -1;
  private selectedCellY = -1;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;

  // Visual overlay
  private cellOverlay: PIXI.Graphics | null = null;

  // Entity references
  private entity: PIXI.Container | null = null;
  private sprite: PIXI.Sprite | null = null;

  constructor(options: CellSelectionOptions) {
    super();

    this.options = {
      cellSize: options.cellSize ?? 8,
      sheetWidth: options.sheetWidth,
      sheetHeight: options.sheetHeight,
      scale: options.scale ?? 1,
      clickThreshold: options.clickThreshold ?? SPRITE_SHEET_CONSTANTS.CLICK_THRESHOLD_PX,
      onCellHover: options.onCellHover ?? (() => {}),
      onCellClick: options.onCellClick ?? (() => {}),
      onCellSelect: options.onCellSelect ?? (() => {})
    };
  }

  /**
   * Initialize cell selection logic
   */
  init(entity?: PIXI.Container, renderer?: PIXI.Renderer, sprite?: PIXI.Sprite) {
    if (!entity) return;

    this.entity = entity;
    this.sprite = sprite || null;

    // Create cell overlay graphics
    this.cellOverlay = new PIXI.Graphics();
    this.cellOverlay.roundPixels = true;
    entity.addChild(this.cellOverlay);

    // Make entity interactive
    entity.eventMode = 'static';
    entity.cursor = 'pointer';

    // Setup interaction handlers
    entity.on('pointermove', this.handlePointerMove.bind(this));
    entity.on('pointerout', this.handlePointerOut.bind(this));
    entity.on('pointerdown', this.handlePointerDown.bind(this));
    entity.on('globalpointermove', this.handleGlobalPointerMove.bind(this));
    entity.on('pointerup', this.handlePointerUp.bind(this));
    entity.on('pointerupoutside', this.handlePointerUpOutside.bind(this));
  }

  /**
   * Update cell selection (called every frame)
   */
  update(entity?: PIXI.Container, deltaTime?: number) {
    // Continuously update overlay to follow sprite when panning
    this.drawCellOverlay();
  }

  /**
   * Set the current scale
   */
  setScale(scale: number) {
    this.options.scale = scale;
  }

  /**
   * Set the sprite reference
   */
  setSprite(sprite: PIXI.Sprite) {
    this.sprite = sprite;
  }

  /**
   * Programmatically select a cell
   */
  selectCell(cellX: number, cellY: number) {
    this.selectedCellX = cellX;
    this.selectedCellY = cellY;
    this.drawCellOverlay();
    this.options.onCellSelect(cellX, cellY);
  }

  /**
   * Get selected cell
   */
  getSelectedCell(): { x: number; y: number } {
    return { x: this.selectedCellX, y: this.selectedCellY };
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.cellOverlay && this.entity) {
      this.entity.removeChild(this.cellOverlay);
      this.cellOverlay.destroy();
    }
  }

  /**
   * Draw cell overlay (selection and hover highlights)
   */
  private drawCellOverlay() {
    if (!this.cellOverlay || !this.sprite || !this.entity) return;

    this.cellOverlay.clear();

    const cellSize = this.options.cellSize * this.options.scale;

    // Sprite has anchor (0.5, 0.5), adjust for centered origin
    const spriteX = this.sprite.x - (this.options.sheetWidth * this.options.cellSize * this.options.scale) / 2;
    const spriteY = this.sprite.y - (this.options.sheetHeight * this.options.cellSize * this.options.scale) / 2;

    // Draw selected cell first (strong highlight) - behind hover
    if (this.selectedCellX >= 0 && this.selectedCellY >= 0) {
      this.cellOverlay.rect(
        spriteX + this.selectedCellX * cellSize,
        spriteY + this.selectedCellY * cellSize,
        cellSize,
        cellSize
      );
      this.cellOverlay.stroke({
        color: COLOR_CONSTANTS.CELL_SELECTION_COLOR,
        width: COLOR_CONSTANTS.CELL_SELECTION_WIDTH
      });
    }

    // Draw hovered cell on top (subtle highlight)
    if (this.hoveredCellX >= 0 && this.hoveredCellY >= 0) {
      this.cellOverlay.rect(
        spriteX + this.hoveredCellX * cellSize,
        spriteY + this.hoveredCellY * cellSize,
        cellSize,
        cellSize
      );
      this.cellOverlay.stroke({
        color: COLOR_CONSTANTS.CELL_HOVER_COLOR,
        width: COLOR_CONSTANTS.CELL_HOVER_WIDTH,
        alpha: COLOR_CONSTANTS.CELL_HOVER_ALPHA
      });
    }
  }

  /**
   * Handle pointer move over sprite
   */
  private handlePointerMove(event: PIXI.FederatedPointerEvent) {
    if (!this.sprite) return;

    // Convert to sprite-local coordinates (unscaled, centered at origin)
    const spriteLocal = event.getLocalPosition(this.sprite);
    const cellSize = this.options.cellSize;

    // Adjust for centered anchor (sprite origin is at center)
    const adjustedX = spriteLocal.x + (this.options.sheetWidth * cellSize / 2);
    const adjustedY = spriteLocal.y + (this.options.sheetHeight * cellSize / 2);

    const cellX = Math.floor(adjustedX / cellSize);
    const cellY = Math.floor(adjustedY / cellSize);

    const maxCellX = this.options.sheetWidth - 1;
    const maxCellY = this.options.sheetHeight - 1;

    if (cellX >= 0 && cellX <= maxCellX && cellY >= 0 && cellY <= maxCellY) {
      if (cellX !== this.hoveredCellX || cellY !== this.hoveredCellY) {
        this.hoveredCellX = cellX;
        this.hoveredCellY = cellY;
        this.drawCellOverlay();
        this.options.onCellHover(cellX, cellY);
      }
    } else {
      if (this.hoveredCellX !== -1 || this.hoveredCellY !== -1) {
        this.hoveredCellX = -1;
        this.hoveredCellY = -1;
        this.drawCellOverlay();
      }
    }
  }

  /**
   * Handle pointer out
   */
  private handlePointerOut() {
    this.hoveredCellX = -1;
    this.hoveredCellY = -1;
    this.drawCellOverlay();
  }

  /**
   * Handle pointer down (start potential drag or click)
   */
  private handlePointerDown(event: PIXI.FederatedPointerEvent) {
    if (!this.sprite) return;

    this.isDragging = false;
    this.dragStartX = event.global.x;
    this.dragStartY = event.global.y;
  }

  /**
   * Handle global pointer move (detect drag)
   */
  private handleGlobalPointerMove(event: PIXI.FederatedPointerEvent) {
    if (!this.sprite || this.dragStartX === 0 || this.dragStartY === 0) return;

    // Check if moved beyond click threshold
    const dx = event.global.x - this.dragStartX;
    const dy = event.global.y - this.dragStartY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.options.clickThreshold) {
      this.isDragging = true;
    }
  }

  /**
   * Handle pointer up (complete click or drag)
   */
  private handlePointerUp() {
    // If we didn't drag, it's a click - select the cell
    if (!this.isDragging) {
      if (this.hoveredCellX >= 0 && this.hoveredCellY >= 0) {
        this.selectedCellX = this.hoveredCellX;
        this.selectedCellY = this.hoveredCellY;
        this.drawCellOverlay();
        this.options.onCellClick(this.selectedCellX, this.selectedCellY);
      }
    }

    // Reset drag state
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
  }

  /**
   * Handle pointer up outside
   */
  private handlePointerUpOutside() {
    // Reset drag state
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
  }
}
