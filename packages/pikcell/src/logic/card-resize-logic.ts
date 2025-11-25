/**
 * CardResizeLogic - Moxi Logic component for resizable card behavior
 *
 * Implements resize functionality following the Moxi ECS pattern.
 * Handles edge and corner resize with visual feedback.
 */
import * as PIXI from 'pixi.js';
import { Logic, ActionManager } from 'moxi';
import { CARD_CONSTANTS } from '../config/constants';

export type ResizeDirection = 'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw' | null;

export interface CardResizeOptions {
  /** Whether resizing is enabled */
  enabled?: boolean;

  /** Size of resize handles in pixels */
  handleSize?: number;

  /** Size of corner resize handles in pixels */
  cornerHandleSize?: number;

  /** Minimum width in pixels */
  minWidth?: number;

  /** Minimum height in pixels */
  minHeight?: number;

  /** Callback when resize starts */
  onResizeStart?: (direction: ResizeDirection) => void;

  /** Callback during resize */
  onResize?: (width: number, height: number, direction: ResizeDirection) => void;

  /** Callback when resize ends */
  onResizeEnd?: (width: number, height: number) => void;
}

/**
 * Logic component for card resize behavior
 */
export class CardResizeLogic extends Logic<PIXI.Container> {
  name = 'CardResizeLogic';

  private options: Required<CardResizeOptions>;
  private actionManager: ActionManager;

  // Resize state
  private isResizing = false;
  private resizeDirection: ResizeDirection = null;
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartWidth = 0;
  private resizeStartHeight = 0;

  // Entity references
  private entity: PIXI.Container | null = null;
  private renderer: PIXI.Renderer | null = null;

  constructor(options: CardResizeOptions = {}) {
    super();

    this.options = {
      enabled: options.enabled ?? true,
      handleSize: options.handleSize ?? CARD_CONSTANTS.RESIZE_HANDLE_SIZE,
      cornerHandleSize: options.cornerHandleSize ?? CARD_CONSTANTS.CORNER_RESIZE_HANDLE_SIZE,
      minWidth: options.minWidth ?? 50,
      minHeight: options.minHeight ?? 50,
      onResizeStart: options.onResizeStart ?? (() => {}),
      onResize: options.onResize ?? (() => {}),
      onResizeEnd: options.onResizeEnd ?? (() => {})
    };

    this.actionManager = new ActionManager();
  }

  /**
   * Initialize resize logic on the entity
   */
  init(entity?: PIXI.Container, renderer?: PIXI.Renderer) {
    if (!entity || !renderer) return;

    this.entity = entity;
    this.renderer = renderer;

    // Make entity interactive
    entity.eventMode = 'static';

    // Setup resize handlers
    entity.on('pointermove', this.handlePointerMove.bind(this));
    entity.on('pointerdown', this.handlePointerDown.bind(this));

    // Register global listeners
    this.actionManager.add(
      window as any,
      'pointermove',
      this.handleGlobalPointerMove.bind(this) as EventListener
    );

    this.actionManager.add(
      window as any,
      'pointerup',
      this.handlePointerUp.bind(this) as EventListener
    );
  }

  /**
   * Update resize logic (called every frame)
   */
  update(entity?: PIXI.Container, deltaTime?: number) {
    // Resize logic is event-driven
  }

  /**
   * Enable resizing
   */
  enable() {
    this.options.enabled = true;
  }

  /**
   * Disable resizing
   */
  disable() {
    this.options.enabled = false;
    this.isResizing = false;
  }

  /**
   * Check if currently resizing
   */
  isActive(): boolean {
    return this.isResizing;
  }

  /**
   * Cleanup event listeners
   */
  destroy() {
    this.actionManager.removeAll();
  }

  /**
   * Detect which resize handle is under the pointer
   */
  private detectResizeHandle(localX: number, localY: number, bounds: PIXI.Bounds): ResizeDirection {
    const { handleSize, cornerHandleSize } = this.options;
    const width = bounds.width;
    const height = bounds.height;

    // Check corners first (higher priority)
    if (localX >= width - cornerHandleSize && localY >= height - cornerHandleSize) {
      return 'se'; // Southeast corner
    }
    if (localX <= cornerHandleSize && localY >= height - cornerHandleSize) {
      return 'sw'; // Southwest corner
    }
    if (localX >= width - cornerHandleSize && localY <= cornerHandleSize) {
      return 'ne'; // Northeast corner
    }
    if (localX <= cornerHandleSize && localY <= cornerHandleSize) {
      return 'nw'; // Northwest corner
    }

    // Check edges
    if (localX >= width - handleSize) return 'e'; // East edge
    if (localX <= handleSize) return 'w'; // West edge
    if (localY >= height - handleSize) return 's'; // South edge
    if (localY <= handleSize) return 'n'; // North edge

    return null;
  }

  /**
   * Get cursor for resize direction
   */
  private getCursorForDirection(direction: ResizeDirection): string {
    switch (direction) {
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'n':
      case 's':
        return 'ns-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'nw':
      case 'se':
        return 'nwse-resize';
      default:
        return 'default';
    }
  }

  /**
   * Handle pointer move over entity
   */
  private handlePointerMove(event: PIXI.FederatedPointerEvent) {
    if (!this.options.enabled || this.isResizing || !this.entity) return;

    const bounds = this.entity.getBounds();
    const local = event.getLocalPosition(this.entity);

    const direction = this.detectResizeHandle(local.x, local.y, bounds);
    this.entity.cursor = direction ? this.getCursorForDirection(direction) : 'default';
  }

  /**
   * Handle pointer down on entity
   */
  private handlePointerDown(event: PIXI.FederatedPointerEvent) {
    if (!this.options.enabled || !this.entity) return;

    const bounds = this.entity.getBounds();
    const local = event.getLocalPosition(this.entity);

    const direction = this.detectResizeHandle(local.x, local.y, bounds);

    if (direction) {
      this.isResizing = true;
      this.resizeDirection = direction;
      this.resizeStartX = event.global.x;
      this.resizeStartY = event.global.y;
      this.resizeStartWidth = bounds.width;
      this.resizeStartHeight = bounds.height;

      this.options.onResizeStart(direction);
      event.stopPropagation(); // Prevent drag
    }
  }

  /**
   * Handle global pointer move during resize
   */
  private handleGlobalPointerMove(event: PointerEvent) {
    if (!this.isResizing || !this.entity || !this.resizeDirection) return;

    const deltaX = event.clientX - this.resizeStartX;
    const deltaY = event.clientY - this.resizeStartY;

    let newWidth = this.resizeStartWidth;
    let newHeight = this.resizeStartHeight;

    // Calculate new dimensions based on direction
    switch (this.resizeDirection) {
      case 'e':
      case 'se':
      case 'ne':
        newWidth = Math.max(this.options.minWidth, this.resizeStartWidth + deltaX);
        break;
      case 'w':
      case 'sw':
      case 'nw':
        newWidth = Math.max(this.options.minWidth, this.resizeStartWidth - deltaX);
        break;
    }

    switch (this.resizeDirection) {
      case 's':
      case 'se':
      case 'sw':
        newHeight = Math.max(this.options.minHeight, this.resizeStartHeight + deltaY);
        break;
      case 'n':
      case 'ne':
      case 'nw':
        newHeight = Math.max(this.options.minHeight, this.resizeStartHeight - deltaY);
        break;
    }

    this.options.onResize(newWidth, newHeight, this.resizeDirection);
  }

  /**
   * Handle pointer up to end resize
   */
  private handlePointerUp(event: PointerEvent) {
    if (!this.isResizing || !this.entity) return;

    const bounds = this.entity.getBounds();
    this.options.onResizeEnd(bounds.width, bounds.height);

    this.isResizing = false;
    this.resizeDirection = null;
    this.entity.cursor = 'default';
  }
}
