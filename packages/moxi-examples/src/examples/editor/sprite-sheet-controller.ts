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
  private texture: PIXI.Texture | null = null;
  private sprite: PIXI.Sprite | null = null;
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
   * Based on: https://stackoverflow.com/questions/75969167/pixi-js-zoom-to-mouse-position
   */
  private setupMouseWheelZoom() {
    if (typeof window !== 'undefined') {
      const handleWheel = (e: WheelEvent) => {
        if (!this.sprite) return;

        // Get canvas bounds
        const canvas = this.renderer.canvas as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const canvasScaleX = canvas.width / rect.width;
        const canvasScaleY = canvas.height / rect.height;

        // Convert client coordinates to canvas coordinates
        const mouseX = (e.clientX - rect.left) * canvasScaleX;
        const mouseY = (e.clientY - rect.top) * canvasScaleY;

        // Get sprite sheet bounds
        const bounds = this.sprite.getBounds();

        // Check if mouse is over the sprite sheet
        if (mouseX >= bounds.x && mouseX <= bounds.x + bounds.width &&
            mouseY >= bounds.y && mouseY <= bounds.y + bounds.height) {
          e.preventDefault();

          // Get parent container offset
          const parentBounds = this.sprite.parent.getBounds();

          // Calculate mouse position relative to sprite center (accounting for anchor 0.5, 0.5)
          const spriteCenterX = parentBounds.x + this.sprite.x;
          const spriteCenterY = parentBounds.y + this.sprite.y;

          // Current scale
          const oldScale = this.sprite.scale.x;

          // Mouse position in sprite's local space (unscaled, relative to center due to anchor)
          const localX = (mouseX - spriteCenterX) / oldScale;
          const localY = (mouseY - spriteCenterY) / oldScale;

          // Calculate new scale
          const zoomDelta = e.deltaY > 0 ? -0.5 : 0.5;
          const newScale = Math.max(1, Math.min(16, this.scale + zoomDelta));

          if (newScale !== this.scale) {
            // Reposition sprite so the local point under mouse stays at same screen position
            this.sprite.x = mouseX - parentBounds.x - (localX * newScale);
            this.sprite.y = mouseY - parentBounds.y - (localY * newScale);

            // Update scale
            this.setScale(newScale);
          }
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
   * Update the texture from pixel data
   */
  private updateTexture() {
    // Create canvas to draw pixel data
    const canvas = document.createElement('canvas');
    canvas.width = this.config.width;
    canvas.height = this.config.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw each pixel to canvas
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        const colorIndex = this.pixels[y][x];
        const color = this.config.palette[colorIndex];

        // Convert color to CSS format
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Bake grid into texture if enabled
    if (this.showGrid) {
      const gridSize = 8;
      ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)'; // Gray with 30% opacity
      ctx.lineWidth = 1;

      // Draw vertical grid lines
      for (let x = gridSize; x < this.config.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.config.height);
        ctx.stroke();
      }

      // Draw horizontal grid lines
      for (let y = gridSize; y < this.config.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.config.width, y);
        ctx.stroke();
      }
    }

    // Destroy old texture if exists
    if (this.texture) {
      this.texture.destroy(true);
    }

    // Create texture from canvas with nearest neighbor scaling
    this.texture = PIXI.Texture.from(canvas);
    this.texture.source.scaleMode = 'nearest';
  }

  /**
   * Render the sprite sheet
   */
  public render(container: PIXI.Container) {
    // Preserve position if sprite already exists
    const preservedX = this.sprite?.x;
    const preservedY = this.sprite?.y;

    // Remove old sprite if it exists
    if (this.sprite) {
      container.removeChild(this.sprite);
    }

    // Update texture from pixel data (with grid baked in if enabled)
    this.updateTexture();

    if (!this.texture) return;

    // Create sprite from texture
    this.sprite = new PIXI.Sprite(this.texture);
    this.sprite.anchor.set(0.5, 0.5); // Center origin for zoom
    this.sprite.scale.set(this.scale);

    // Use preserved position if available, otherwise center it
    if (preservedX !== undefined && preservedY !== undefined) {
      this.sprite.x = preservedX;
      this.sprite.y = preservedY;
    } else {
      // Initial position at center of texture dimensions
      this.sprite.x = (this.config.width * this.scale) / 2;
      this.sprite.y = (this.config.height * this.scale) / 2;
    }

    container.addChild(this.sprite);
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
