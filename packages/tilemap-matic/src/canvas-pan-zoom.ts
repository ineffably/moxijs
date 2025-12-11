/**
 * Canvas Pan/Zoom Handler
 * Provides mouse wheel zoom and middle-click pan for a PIXI Container
 */
import { Container, Renderer } from 'pixi.js';

export interface PanZoomOptions {
  /** Minimum scale (default: 0.25) */
  minScale?: number;
  /** Maximum scale (default: 8) */
  maxScale?: number;
  /** Zoom speed multiplier (default: 0.1) */
  zoomSpeed?: number;
  /** Initial scale (default: 1) */
  initialScale?: number;
  /** Callback when zoom changes */
  onZoomChange?: (scale: number) => void;
  /** Callback when pan changes */
  onPanChange?: (x: number, y: number) => void;
}

/**
 * Manages pan and zoom for a PIXI Container
 * - Mouse wheel: zoom toward cursor
 * - Middle mouse drag: pan
 */
export class CanvasPanZoom {
  private container: Container;
  private renderer: Renderer;
  private options: Required<PanZoomOptions>;

  // State
  private currentScale: number;
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private containerStartX = 0;
  private containerStartY = 0;

  // Bound handlers for cleanup
  private boundWheel: (e: WheelEvent) => void;
  private boundMouseDown: (e: MouseEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;

  constructor(container: Container, renderer: Renderer, options: PanZoomOptions = {}) {
    this.container = container;
    this.renderer = renderer;

    this.options = {
      minScale: options.minScale ?? 0.25,
      maxScale: options.maxScale ?? 8,
      zoomSpeed: options.zoomSpeed ?? 0.1,
      initialScale: options.initialScale ?? 1,
      onZoomChange: options.onZoomChange ?? (() => {}),
      onPanChange: options.onPanChange ?? (() => {})
    };

    this.currentScale = this.options.initialScale;
    this.container.scale.set(this.currentScale);

    // Bind handlers
    this.boundWheel = this.handleWheel.bind(this);
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const canvas = this.renderer.canvas as HTMLCanvasElement;

    // Wheel for zoom (on canvas only)
    canvas.addEventListener('wheel', this.boundWheel, { passive: false });

    // Middle mouse for pan
    canvas.addEventListener('mousedown', this.boundMouseDown);
    window.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('mouseup', this.boundMouseUp);
  }

  /**
   * Handle mouse wheel for zoom toward cursor
   */
  private handleWheel(e: WheelEvent): void {
    const canvas = this.renderer.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    // Get mouse position relative to canvas
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Scale factor for CSS vs canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Mouse position in canvas coordinates
    const canvasMouseX = mouseX * scaleX;
    const canvasMouseY = mouseY * scaleY;

    // Check if mouse is roughly over our container area
    const bounds = this.container.getBounds();
    if (canvasMouseX < bounds.x - 50 || canvasMouseX > bounds.x + bounds.width + 50 ||
        canvasMouseY < bounds.y - 50 || canvasMouseY > bounds.y + bounds.height + 50) {
      return; // Mouse not over container
    }

    e.preventDefault();

    // Calculate zoom
    const zoomDelta = e.deltaY > 0 ? -this.options.zoomSpeed : this.options.zoomSpeed;
    const newScale = Math.max(
      this.options.minScale,
      Math.min(this.options.maxScale, this.currentScale + zoomDelta * this.currentScale)
    );

    if (newScale === this.currentScale) return;

    // Get mouse position relative to container's parent (for proper positioning)
    const localMouseX = canvasMouseX - this.container.parent.x;
    const localMouseY = canvasMouseY - this.container.parent.y;

    // Calculate position in container's local space before zoom
    const beforeZoomX = (localMouseX - this.container.x) / this.currentScale;
    const beforeZoomY = (localMouseY - this.container.y) / this.currentScale;

    // Apply new scale
    this.currentScale = newScale;
    this.container.scale.set(this.currentScale);

    // Adjust position so point under mouse stays in same place
    this.container.x = localMouseX - beforeZoomX * this.currentScale;
    this.container.y = localMouseY - beforeZoomY * this.currentScale;

    this.options.onZoomChange(this.currentScale);
  }

  /**
   * Handle middle mouse button down for pan start
   */
  private handleMouseDown(e: MouseEvent): void {
    // Middle mouse button
    if (e.button !== 1) return;

    e.preventDefault();
    this.isPanning = true;
    this.panStartX = e.clientX;
    this.panStartY = e.clientY;
    this.containerStartX = this.container.x;
    this.containerStartY = this.container.y;

    // Change cursor
    document.body.style.cursor = 'grabbing';
  }

  /**
   * Handle mouse move for panning
   */
  private handleMouseMove(e: MouseEvent): void {
    if (!this.isPanning) return;

    const canvas = this.renderer.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Calculate delta in canvas coordinates
    const deltaX = (e.clientX - this.panStartX) * scaleX;
    const deltaY = (e.clientY - this.panStartY) * scaleY;

    this.container.x = this.containerStartX + deltaX;
    this.container.y = this.containerStartY + deltaY;

    this.options.onPanChange(this.container.x, this.container.y);
  }

  /**
   * Handle mouse up to end panning
   */
  private handleMouseUp(e: MouseEvent): void {
    if (e.button === 1 && this.isPanning) {
      this.isPanning = false;
      document.body.style.cursor = '';
    }
  }

  /**
   * Get current scale
   */
  getScale(): number {
    return this.currentScale;
  }

  /**
   * Set scale programmatically
   */
  setScale(scale: number): void {
    this.currentScale = Math.max(
      this.options.minScale,
      Math.min(this.options.maxScale, scale)
    );
    this.container.scale.set(this.currentScale);
    this.options.onZoomChange(this.currentScale);
  }

  /**
   * Reset to initial scale and position
   */
  reset(): void {
    this.currentScale = this.options.initialScale;
    this.container.scale.set(this.currentScale);
    this.container.position.set(0, 0);
    this.options.onZoomChange(this.currentScale);
    this.options.onPanChange(0, 0);
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    const canvas = this.renderer.canvas as HTMLCanvasElement;
    canvas.removeEventListener('wheel', this.boundWheel);
    canvas.removeEventListener('mousedown', this.boundMouseDown);
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('mouseup', this.boundMouseUp);
  }
}
