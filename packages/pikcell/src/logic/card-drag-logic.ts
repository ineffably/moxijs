/**
 * CardDragLogic - Moxi Logic component for draggable card behavior
 *
 * Implements drag functionality following the Moxi ECS pattern.
 * Can be attached to any PIXI.Container to make it draggable.
 */
import * as PIXI from 'pixi.js';
import { Logic } from 'moxi';
import { EventManager } from '../utilities/event-manager';
import { CARD_CONSTANTS } from '../config/constants';

export interface CardDragOptions {
  /** Whether dragging is enabled */
  enabled?: boolean;

  /** Minimum drag distance to distinguish from click */
  clickThreshold?: number;

  /** Callback when drag starts */
  onDragStart?: (x: number, y: number) => void;

  /** Callback during drag */
  onDrag?: (x: number, y: number, deltaX: number, deltaY: number) => void;

  /** Callback when drag ends */
  onDragEnd?: (x: number, y: number) => void;

  /** Callback when clicked (not dragged) */
  onClick?: () => void;
}

/**
 * Logic component for card dragging behavior
 */
export class CardDragLogic extends Logic<PIXI.Container> {
  name = 'CardDragLogic';

  private options: Required<CardDragOptions>;
  private eventManager: EventManager;

  // Drag state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private cardStartX = 0;
  private cardStartY = 0;
  private hasMoved = false;

  constructor(options: CardDragOptions = {}) {
    super();

    this.options = {
      enabled: options.enabled ?? true,
      clickThreshold: options.clickThreshold ?? CARD_CONSTANTS.MIN_DRAG_DISTANCE,
      onDragStart: options.onDragStart ?? (() => {}),
      onDrag: options.onDrag ?? (() => {}),
      onDragEnd: options.onDragEnd ?? (() => {}),
      onClick: options.onClick ?? (() => {})
    };

    this.eventManager = new EventManager();
  }

  /**
   * Initialize drag logic on the entity
   */
  init(entity?: PIXI.Container, renderer?: PIXI.Renderer) {
    if (!entity) return;

    // Make entity interactive
    entity.eventMode = 'static';
    entity.cursor = 'grab';

    // Setup drag handlers
    entity.on('pointerdown', this.handlePointerDown.bind(this, entity));

    // Register global listeners via EventManager
    this.eventManager.register(
      window as any,
      'pointermove',
      this.handlePointerMove.bind(this, entity) as EventListener
    );

    this.eventManager.register(
      window as any,
      'pointerup',
      this.handlePointerUp.bind(this, entity) as EventListener
    );
  }

  /**
   * Update drag logic (called every frame)
   */
  update(entity?: PIXI.Container, deltaTime?: number) {
    // Drag logic is event-driven, no frame updates needed
  }

  /**
   * Enable dragging
   */
  enable() {
    this.options.enabled = true;
  }

  /**
   * Disable dragging
   */
  disable() {
    this.options.enabled = false;
    this.isDragging = false;
  }

  /**
   * Check if currently dragging
   */
  isActive(): boolean {
    return this.isDragging;
  }

  /**
   * Cleanup event listeners
   */
  destroy() {
    this.eventManager.unregisterAll();
  }

  /**
   * Handle pointer down event
   */
  private handlePointerDown(entity: PIXI.Container, event: PIXI.FederatedPointerEvent) {
    if (!this.options.enabled) return;

    this.isDragging = true;
    this.hasMoved = false;
    this.dragStartX = event.global.x;
    this.dragStartY = event.global.y;
    this.cardStartX = entity.x;
    this.cardStartY = entity.y;

    entity.cursor = 'grabbing';
  }

  /**
   * Handle pointer move event
   */
  private handlePointerMove(entity: PIXI.Container, event: PointerEvent) {
    if (!this.isDragging || !this.options.enabled) return;

    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Check if moved beyond click threshold
    if (!this.hasMoved && distance > this.options.clickThreshold) {
      this.hasMoved = true;
      this.options.onDragStart(this.cardStartX, this.cardStartY);
    }

    if (this.hasMoved) {
      // Update entity position
      const newX = this.cardStartX + deltaX;
      const newY = this.cardStartY + deltaY;

      entity.x = newX;
      entity.y = newY;

      this.options.onDrag(newX, newY, deltaX, deltaY);
    }
  }

  /**
   * Handle pointer up event
   */
  private handlePointerUp(entity: PIXI.Container, event: PointerEvent) {
    if (!this.isDragging) return;

    if (this.hasMoved) {
      // Was a drag
      this.options.onDragEnd(entity.x, entity.y);
    } else {
      // Was a click
      this.options.onClick();
    }

    this.isDragging = false;
    this.hasMoved = false;
    entity.cursor = 'grab';
  }
}
