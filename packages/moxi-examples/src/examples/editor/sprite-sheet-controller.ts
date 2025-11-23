/**
 * Sprite sheet controller - manages sprite data and interactions independently of the card
 */
import * as PIXI from 'pixi.js';
import { px } from './pixel-card';

export type SpriteSheetType = 'PICO-8' | 'TIC-80';

export interface SpriteSheetConfig {
  type: SpriteSheetType;
  width: number;   // In pixels
  height: number;  // In pixels
  palette: number[]; // Array of color values
}

export interface SpriteSheetControllerOptions {
  config: SpriteSheetConfig;
  renderer: PIXI.Renderer;
  showGrid?: boolean;
  onScaleChange?: (scale: number) => void;
}

/**
 * Controller for managing sprite sheet state and rendering
 */
export class SpriteSheetController {
  private config: SpriteSheetConfig;
  private renderer: PIXI.Renderer;
  private scale: number = 1;
  private pixels: number[][]; // 2D array of color indices
  private canvas: PIXI.Graphics | null = null;
  private showGrid: boolean;
  private onScaleChange?: (scale: number) => void;

  constructor(options: SpriteSheetControllerOptions) {
    this.config = options.config;
    this.renderer = options.renderer;
    this.showGrid = options.showGrid ?? false;
    this.onScaleChange = options.onScaleChange;

    // Calculate initial scale to fit nicely (50% of viewport height)
    const targetHeight = this.renderer.height * 0.5;
    this.scale = Math.max(1, Math.floor(targetHeight / this.config.height));

    // Initialize pixel data (all set to first palette color)
    this.pixels = [];
    for (let y = 0; y < this.config.height; y++) {
      this.pixels[y] = [];
      for (let x = 0; x < this.config.width; x++) {
        this.pixels[y][x] = 0; // Default to first palette color
      }
    }

    // Setup mouse wheel zoom
    this.setupMouseWheelZoom();
  }

  /**
   * Setup mouse wheel zoom handler
   */
  private setupMouseWheelZoom() {
    if (typeof window !== 'undefined') {
      const handleWheel = (e: WheelEvent) => {
        if (!this.canvas) return;

        // Get canvas bounds
        const canvas = this.renderer.canvas as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Convert client coordinates to canvas coordinates
        const canvasX = (e.clientX - rect.left) * scaleX;
        const canvasY = (e.clientY - rect.top) * scaleY;

        // Get sprite sheet bounds
        const bounds = this.canvas.getBounds();

        // Check if mouse is over the sprite sheet
        if (canvasX >= bounds.x && canvasX <= bounds.x + bounds.width &&
            canvasY >= bounds.y && canvasY <= bounds.y + bounds.height) {
          e.preventDefault();

          // Zoom in/out based on wheel direction
          const zoomDelta = e.deltaY > 0 ? -0.25 : 0.25;
          const newScale = this.scale + zoomDelta;
          this.setScale(newScale);
        }
      };

      window.addEventListener('wheel', handleWheel, { passive: false });
    }
  }

  /**
   * Get the current scale
   */
  public getScale(): number {
    return this.scale;
  }

  /**
   * Set the scale (supports smooth/fractional scaling)
   */
  public setScale(newScale: number) {
    const clampedScale = Math.max(1, Math.min(16, newScale));
    // Allow smooth scaling - no rounding to integers
    if (clampedScale !== this.scale) {
      this.scale = clampedScale;
      if (this.onScaleChange) {
        this.onScaleChange(this.scale);
      }
    }
  }

  /**
   * Get the sprite sheet config
   */
  public getConfig(): SpriteSheetConfig {
    return this.config;
  }

  /**
   * Get the scaled dimensions
   */
  public getScaledDimensions(): { width: number; height: number } {
    return {
      width: this.config.width * this.scale,
      height: this.config.height * this.scale
    };
  }

  /**
   * Get pixel color at coordinates
   */
  public getPixel(x: number, y: number): number {
    if (x < 0 || x >= this.config.width || y < 0 || y >= this.config.height) {
      return 0;
    }
    return this.pixels[y][x];
  }

  /**
   * Set pixel color at coordinates
   */
  public setPixel(x: number, y: number, colorIndex: number) {
    if (x < 0 || x >= this.config.width || y < 0 || y >= this.config.height) {
      return;
    }
    if (colorIndex < 0 || colorIndex >= this.config.palette.length) {
      return;
    }
    this.pixels[y][x] = colorIndex;
  }

  /**
   * Render the sprite sheet
   */
  public render(container: PIXI.Container) {
    // Remove old canvas if it exists
    if (this.canvas) {
      container.removeChild(this.canvas);
    }

    // Create new canvas
    this.canvas = new PIXI.Graphics();
    this.canvas.roundPixels = true;

    // Draw each pixel at current scale
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        const colorIndex = this.pixels[y][x];
        const color = this.config.palette[colorIndex];

        this.canvas.rect(
          x * this.scale,
          y * this.scale,
          this.scale,
          this.scale
        );
        this.canvas.fill({ color });
      }
    }

    // Draw 8x8 grid if enabled
    if (this.showGrid) {
      const gridSize = 8; // 8x8 grid
      const gridColor = 0x808080; // Gray color for grid lines
      const gridAlpha = 0.3;

      // Draw vertical grid lines
      for (let x = gridSize; x < this.config.width; x += gridSize) {
        this.canvas.moveTo(x * this.scale, 0);
        this.canvas.lineTo(x * this.scale, this.config.height * this.scale);
        this.canvas.stroke({ width: 1, color: gridColor, alpha: gridAlpha });
      }

      // Draw horizontal grid lines
      for (let y = gridSize; y < this.config.height; y += gridSize) {
        this.canvas.moveTo(0, y * this.scale);
        this.canvas.lineTo(this.config.width * this.scale, y * this.scale);
        this.canvas.stroke({ width: 1, color: gridColor, alpha: gridAlpha });
      }
    }

    container.addChild(this.canvas);
  }

  /**
   * Clear all pixels to a specific color
   */
  public clear(colorIndex: number = 0) {
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        this.pixels[y][x] = colorIndex;
      }
    }
  }

  /**
   * Convert screen coordinates to sprite pixel coordinates
   */
  public screenToPixel(screenX: number, screenY: number): { x: number; y: number } | null {
    const pixelX = Math.floor(screenX / this.scale);
    const pixelY = Math.floor(screenY / this.scale);

    if (pixelX < 0 || pixelX >= this.config.width || pixelY < 0 || pixelY >= this.config.height) {
      return null;
    }

    return { x: pixelX, y: pixelY };
  }
}
