/**
 * Sprite controller - manages a single 8x8 sprite cell from the sprite sheet
 */
import * as PIXI from 'pixi.js';
import { SpriteSheetController } from './sprite-sheet-controller';

export interface SpriteControllerOptions {
  spriteSheetController: SpriteSheetController;
  cellX: number;  // Cell X coordinate (0-based, in 8x8 cells)
  cellY: number;  // Cell Y coordinate (0-based, in 8x8 cells)
  scale?: number; // Display scale
}

/**
 * Controller for managing a single 8x8 sprite cell
 * References the sprite sheet controller and updates it directly
 * 
 * ⚠️ IMPORTANT: Sprite dimensions are in ACTUAL PIXELS, not grid units
 * - Sprites are 8x8 pixels
 * - Scale is applied to pixels (e.g., scale 4 = 32x32 pixel display)
 * - UI cards convert these pixel dimensions to grid units for content sizing
 */
export class SpriteController {
  private spriteSheetController: SpriteSheetController;
  private cellX: number;
  private cellY: number;
  private scale: number;
  private sprite: PIXI.Sprite | null = null;
  private texture: PIXI.Texture | null = null;

  constructor(options: SpriteControllerOptions) {
    this.spriteSheetController = options.spriteSheetController;
    this.cellX = options.cellX;
    this.cellY = options.cellY;
    this.scale = options.scale ?? 8; // Default 8x zoom for editing
  }

  /**
   * Get the current cell coordinates
   */
  public getCell(): { x: number; y: number } {
    return { x: this.cellX, y: this.cellY };
  }

  /**
   * Set which cell to edit
   */
  public setCell(cellX: number, cellY: number) {
    this.cellX = cellX;
    this.cellY = cellY;
  }

  /**
   * Get the scale
   */
  public getScale(): number {
    return this.scale;
  }

  /**
   * Set the scale
   */
  public setScale(newScale: number) {
    this.scale = Math.max(1, Math.min(64, newScale));
  }

  /**
   * Get pixel color at local sprite coordinates (0-7, 0-7)
   */
  public getPixel(localX: number, localY: number): number {
    // Convert local coordinates to global sheet coordinates
    const globalX = this.cellX * 8 + localX;
    const globalY = this.cellY * 8 + localY;
    return this.spriteSheetController.getPixel(globalX, globalY);
  }

  /**
   * Set pixel color at local sprite coordinates (0-7, 0-7)
   */
  public setPixel(localX: number, localY: number, colorIndex: number) {
    // Convert local coordinates to global sheet coordinates
    const globalX = this.cellX * 8 + localX;
    const globalY = this.cellY * 8 + localY;
    this.spriteSheetController.setPixel(globalX, globalY, colorIndex);
  }

  /**
   * Render the sprite (shows the 8x8 cell from sprite sheet)
   */
  public render(container: PIXI.Container) {
    // Remove old sprite if it exists
    if (this.sprite) {
      container.removeChild(this.sprite);
    }

    // Get the sprite sheet's texture
    const sheetConfig = this.spriteSheetController.getConfig();

    // For now, we'll render our own texture from pixel data
    // This ensures we always show the latest pixel data
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the 8x8 sprite from sprite sheet data
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const colorIndex = this.getPixel(x, y);
        const color = sheetConfig.palette[colorIndex];

        // Convert color to CSS format
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Destroy old texture if exists
    if (this.texture) {
      this.texture.destroy(true);
    }

    // Create texture from canvas with nearest neighbor scaling
    this.texture = PIXI.Texture.from(canvas);
    this.texture.source.scaleMode = 'nearest';

    // Create sprite
    this.sprite = new PIXI.Sprite(this.texture);
    this.sprite.scale.set(this.scale);
    this.sprite.position.set(0, 0);

    container.addChild(this.sprite);
  }

  /**
   * Convert screen coordinates (relative to sprite) to pixel coordinates
   */
  public screenToPixel(screenX: number, screenY: number): { x: number; y: number } | null {
    const pixelX = Math.floor(screenX / this.scale);
    const pixelY = Math.floor(screenY / this.scale);

    if (pixelX < 0 || pixelX >= 8 || pixelY < 0 || pixelY >= 8) {
      return null;
    }

    return { x: pixelX, y: pixelY };
  }

  /**
   * Get the scaled dimensions
   */
  public getScaledDimensions(): { width: number; height: number } {
    return {
      width: 8 * this.scale,
      height: 8 * this.scale
    };
  }

  /**
   * Get the sprite sheet controller this sprite belongs to
   */
  public getSpriteSheetController(): SpriteSheetController {
    return this.spriteSheetController;
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.texture) {
      this.texture.destroy(true);
      this.texture = null;
    }
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}
