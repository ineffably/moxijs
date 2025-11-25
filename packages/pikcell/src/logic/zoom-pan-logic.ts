/**
 * ZoomPanLogic - Moxi Logic component for zoom and pan behavior
 *
 * Implements zoom (mouse wheel) and pan (middle mouse button) functionality
 * following the Moxi ECS pattern.
 */
import * as PIXI from 'pixi.js';
import { Logic, ActionManager } from 'moxi';
import { SPRITE_SHEET_CONSTANTS } from '../config/constants';

export interface ZoomPanOptions {
  /** Whether zoom is enabled */
  zoomEnabled?: boolean;

  /** Whether pan is enabled */
  panEnabled?: boolean;

  /** Minimum scale */
  minScale?: number;

  /** Maximum scale */
  maxScale?: number;

  /** Zoom increment per wheel notch */
  zoomIncrement?: number;

  /** Initial scale */
  initialScale?: number;

  /** Callback when zoom changes */
  onZoomChange?: (scale: number) => void;

  /** Callback when pan changes */
  onPanChange?: (x: number, y: number) => void;
}

/**
 * Logic component for zoom and pan behavior
 */
export class ZoomPanLogic extends Logic<PIXI.Container> {
  name = 'ZoomPanLogic';

  private options: Required<ZoomPanOptions>;
  private actionManager: ActionManager;

  // Zoom/Pan state
  private currentScale: number;
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private entityStartX = 0;
  private entityStartY = 0;

  // Entity references
  private entity: PIXI.Container | null = null;
  private renderer: PIXI.Renderer | null = null;

  constructor(options: ZoomPanOptions = {}) {
    super();

    this.options = {
      zoomEnabled: options.zoomEnabled ?? true,
      panEnabled: options.panEnabled ?? true,
      minScale: options.minScale ?? SPRITE_SHEET_CONSTANTS.MIN_SCALE,
      maxScale: options.maxScale ?? SPRITE_SHEET_CONSTANTS.MAX_SCALE,
      zoomIncrement: options.zoomIncrement ?? SPRITE_SHEET_CONSTANTS.ZOOM_INCREMENT,
      initialScale: options.initialScale ?? 1,
      onZoomChange: options.onZoomChange ?? (() => {}),
      onPanChange: options.onPanChange ?? (() => {})
    };

    this.currentScale = this.options.initialScale;
    this.actionManager = new ActionManager();
  }

  /**
   * Initialize zoom/pan logic on the entity
   */
  init(entity?: PIXI.Container, renderer?: PIXI.Renderer) {
    if (!entity || !renderer) return;

    this.entity = entity;
    this.renderer = renderer;

    // Make entity interactive
    entity.eventMode = 'static';

    // Setup wheel zoom
    if (this.options.zoomEnabled) {
      this.actionManager.add(
        window as any,
        'wheel',
        this.handleWheel.bind(this) as EventListener,
        { passive: false }
      );
    }

    // Setup middle mouse pan
    if (this.options.panEnabled) {
      this.actionManager.add(
        window as any,
        'mousedown',
        this.handleMouseDown.bind(this) as EventListener
      );

      this.actionManager.add(
        window as any,
        'mousemove',
        this.handleMouseMove.bind(this) as EventListener
      );

      this.actionManager.add(
        window as any,
        'mouseup',
        this.handleMouseUp.bind(this) as EventListener
      );
    }
  }

  /**
   * Update zoom/pan logic
   */
  update(entity?: PIXI.Container, deltaTime?: number) {
    // Zoom/pan logic is event-driven
  }

  /**
   * Get current scale
   */
  getScale(): number {
    return this.currentScale;
  }

  /**
   * Set scale
   */
  setScale(scale: number) {
    const clampedScale = Math.max(
      this.options.minScale,
      Math.min(this.options.maxScale, scale)
    );

    if (clampedScale !== this.currentScale) {
      this.currentScale = clampedScale;
      this.options.onZoomChange(this.currentScale);
    }
  }

  /**
   * Enable zoom
   */
  enableZoom() {
    this.options.zoomEnabled = true;
  }

  /**
   * Disable zoom
   */
  disableZoom() {
    this.options.zoomEnabled = false;
  }

  /**
   * Enable pan
   */
  enablePan() {
    this.options.panEnabled = true;
  }

  /**
   * Disable pan
   */
  disablePan() {
    this.options.panEnabled = false;
    this.isPanning = false;
  }

  /**
   * Cleanup event listeners
   */
  destroy() {
    this.actionManager.removeAll();
  }

  /**
   * Handle mouse wheel for zoom
   * Based on: https://stackoverflow.com/questions/75969167/pixi-js-zoom-to-mouse-position
   */
  private handleWheel(e: WheelEvent) {
    if (!this.entity || !this.renderer || !this.options.zoomEnabled) return;

    // Get canvas bounds
    const canvas = this.renderer.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const canvasScaleX = canvas.width / rect.width;
    const canvasScaleY = canvas.height / rect.height;

    // Convert client coordinates to canvas coordinates
    const mouseX = (e.clientX - rect.left) * canvasScaleX;
    const mouseY = (e.clientY - rect.top) * canvasScaleY;

    // Get entity bounds
    const bounds = this.entity.getBounds();

    // Check if mouse is over the entity
    if (mouseX >= bounds.x && mouseX <= bounds.x + bounds.width &&
        mouseY >= bounds.y && mouseY <= bounds.y + bounds.height) {
      e.preventDefault();

      // Get parent container offset
      const parentBounds = this.entity.parent.getBounds();

      // Calculate mouse position relative to entity center
      const entityCenterX = parentBounds.x + this.entity.x;
      const entityCenterY = parentBounds.y + this.entity.y;

      // Current scale
      const oldScale = this.entity.scale.x;

      // Mouse position in entity's local space (unscaled)
      const localX = (mouseX - entityCenterX) / oldScale;
      const localY = (mouseY - entityCenterY) / oldScale;

      // Calculate new scale
      const zoomDelta = e.deltaY > 0 ? -this.options.zoomIncrement : this.options.zoomIncrement;
      const newScale = Math.max(
        this.options.minScale,
        Math.min(this.options.maxScale, this.currentScale + zoomDelta)
      );

      if (newScale !== this.currentScale) {
        // Reposition entity so the local point under mouse stays at same screen position
        this.entity.x = mouseX - parentBounds.x - (localX * newScale);
        this.entity.y = mouseY - parentBounds.y - (localY * newScale);

        // Update scale
        this.setScale(newScale);
        this.entity.scale.set(newScale);
      }
    }
  }

  /**
   * Handle mouse down for middle mouse pan
   */
  private handleMouseDown(e: MouseEvent) {
    if (e.button !== 1 || !this.entity || !this.renderer || !this.options.panEnabled) return;

    // Get canvas bounds
    const canvas = this.renderer.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Convert client coordinates to canvas coordinates
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    // Get entity bounds
    const bounds = this.entity.getBounds();

    // Check if mouse is over the entity
    if (canvasX >= bounds.x && canvasX <= bounds.x + bounds.width &&
        canvasY >= bounds.y && canvasY <= bounds.y + bounds.height) {
      e.preventDefault();
      this.isPanning = true;
      this.panStartX = e.clientX;
      this.panStartY = e.clientY;
      this.entityStartX = this.entity.x;
      this.entityStartY = this.entity.y;
    }
  }

  /**
   * Handle mouse move for panning
   */
  private handleMouseMove(e: MouseEvent) {
    if (!this.isPanning || !this.entity || !this.renderer) return;

    e.preventDefault();

    // Get canvas bounds for scaling
    const canvas = this.renderer.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Calculate delta in screen space, then convert to canvas space
    const deltaScreenX = e.clientX - this.panStartX;
    const deltaScreenY = e.clientY - this.panStartY;
    const deltaX = deltaScreenX * scaleX;
    const deltaY = deltaScreenY * scaleY;

    // Update entity position
    const newX = this.entityStartX + deltaX;
    const newY = this.entityStartY + deltaY;

    this.entity.x = newX;
    this.entity.y = newY;

    this.options.onPanChange(newX, newY);
  }

  /**
   * Handle mouse up to end panning
   */
  private handleMouseUp(e: MouseEvent) {
    if (e.button === 1) {
      this.isPanning = false;
    }
  }
}
