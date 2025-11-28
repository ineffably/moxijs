/**
 * CardDragHandler - Handles card dragging logic
 *
 * Extracted from PixelCard to follow Single Responsibility Principle.
 * Manages pointer capture, screen-to-canvas coordinate conversion, and drag state.
 */
import * as PIXI from 'pixi.js';

export interface DragState {
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
  cardStartX: number;
  cardStartY: number;
}

export interface DragHandlerOptions {
  renderer: PIXI.Renderer;
  container: PIXI.Container;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

/**
 * Handles drag operations for a card container
 */
export class CardDragHandler {
  private renderer: PIXI.Renderer;
  private container: PIXI.Container;
  private state: DragState;
  private capturedPointerId: number | null = null;
  private onDragStart?: () => void;
  private onDragEnd?: () => void;

  // Bound event handlers for cleanup
  private boundHandleMove: (e: PointerEvent) => void;
  private boundHandleUp: () => void;

  constructor(options: DragHandlerOptions) {
    this.renderer = options.renderer;
    this.container = options.container;
    this.onDragStart = options.onDragStart;
    this.onDragEnd = options.onDragEnd;

    this.state = {
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      cardStartX: 0,
      cardStartY: 0,
    };

    // Bind handlers
    this.boundHandleMove = this.handleMove.bind(this);
    this.boundHandleUp = this.handleUp.bind(this);

    // Setup global listeners
    this.setupEventListeners();
  }

  /**
   * Check if currently dragging
   */
  get isDragging(): boolean {
    return this.state.isDragging;
  }

  /**
   * Start a drag operation
   * Call this from title bar pointerdown event
   */
  startDrag(event: PIXI.FederatedPointerEvent): void {
    this.state.isDragging = true;
    this.state.cardStartX = this.container.x;
    this.state.cardStartY = this.container.y;
    this.state.dragStartX = event.client.x;
    this.state.dragStartY = event.client.y;

    // Capture pointer
    const canvas = this.renderer.canvas as HTMLCanvasElement;
    if (canvas && event.pointerId !== undefined) {
      canvas.setPointerCapture(event.pointerId);
      this.capturedPointerId = event.pointerId;
    }

    if (this.onDragStart) {
      this.onDragStart();
    }
  }

  /**
   * Handle pointer move during drag
   */
  private handleMove(e: PointerEvent): void {
    if (!this.state.isDragging) return;

    const canvas = this.renderer.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const deltaScreenX = e.clientX - this.state.dragStartX;
    const deltaScreenY = e.clientY - this.state.dragStartY;

    const deltaX = deltaScreenX * scaleX;
    const deltaY = deltaScreenY * scaleY;

    this.container.x = this.state.cardStartX + deltaX;
    this.container.y = this.state.cardStartY + deltaY;
  }

  /**
   * Handle pointer up to end drag
   */
  private handleUp(): void {
    if (!this.state.isDragging) return;

    const wasDragging = this.state.isDragging;
    this.state.isDragging = false;

    // Release pointer capture
    this.releasePointerCapture();

    if (wasDragging && this.onDragEnd) {
      this.onDragEnd();
    }
  }

  /**
   * Release pointer capture
   */
  private releasePointerCapture(): void {
    if (this.capturedPointerId !== null) {
      const canvas = this.renderer.canvas as HTMLCanvasElement;
      if (canvas) {
        try {
          canvas.releasePointerCapture(this.capturedPointerId);
        } catch {
          // Ignore errors if pointer was already released
        }
      }
      this.capturedPointerId = null;
    }
  }

  /**
   * Setup global event listeners
   */
  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', this.boundHandleMove);
      window.addEventListener('pointerup', this.boundHandleUp);
    }
  }

  /**
   * Get current card start position (for resize handlers that need this)
   */
  getCardStartPosition(): { x: number; y: number } {
    return {
      x: this.state.cardStartX,
      y: this.state.cardStartY,
    };
  }

  /**
   * Update card start position (called when resize starts)
   */
  setCardStartPosition(x: number, y: number): void {
    this.state.cardStartX = x;
    this.state.cardStartY = y;
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointermove', this.boundHandleMove);
      window.removeEventListener('pointerup', this.boundHandleUp);
    }
    this.releasePointerCapture();
  }
}
