/**
 * SpriteSheetController with Logic Components (Example/Future Implementation)
 *
 * This demonstrates how SpriteSheetController could be refactored to use Moxi Logic
 * components for zoom/pan and cell selection instead of handling these behaviors internally.
 *
 * Benefits:
 * - Separation of concerns (data management vs interaction behavior)
 * - Reusable interaction logic
 * - Easier to test
 * - Can swap out behaviors dynamically
 */
import * as PIXI from 'pixi.js';
import { asEntity } from 'moxijs';
import { ZoomPanLogic } from '../logic/zoom-pan-logic';
import { CellSelectionLogic } from '../logic/cell-selection-logic';
import { PixelRenderer } from '../utilities/pixel-renderer';
import { SpriteSheetConfig, SpriteSheetType } from './sprite-sheet-controller';

export interface SpriteSheetControllerWithLogicOptions {
  config: SpriteSheetConfig;
  renderer: PIXI.Renderer;
  showGrid?: boolean;
  onScaleChange?: (scale: number) => void;
  onCellHover?: (cellX: number, cellY: number) => void;
  onCellClick?: (cellX: number, cellY: number) => void;
}

/**
 * Example of SpriteSheetController using Moxi Logic components
 *
 * This shows how to separate data (pixels, palette) from behavior (zoom, pan, selection)
 */
export class SpriteSheetControllerWithLogic {
  private config: SpriteSheetConfig;
  private renderer: PIXI.Renderer;
  private showGrid: boolean;
  private scale: number = 1;
  private pixels: number[][];
  private texture: PIXI.Texture | null = null;
  private sprite: PIXI.Sprite | null = null;

  // Moxi entity with Logic
  private container: PIXI.Container;
  private entity: any; // AsEntity type

  constructor(options: SpriteSheetControllerWithLogicOptions) {
    this.config = options.config;
    this.renderer = options.renderer;
    this.showGrid = options.showGrid ?? false;

    // Initialize pixel data (all set to first palette color)
    this.pixels = [];
    for (let y = 0; y < this.config.height; y++) {
      this.pixels[y] = [];
      for (let x = 0; x < this.config.width; x++) {
        this.pixels[y][x] = 0;
      }
    }

    // Create container
    this.container = new PIXI.Container();

    // Calculate initial scale
    const targetHeight = this.renderer.height * 0.5;
    this.scale = Math.max(1, Math.floor(targetHeight / this.config.height));

    // Apply Moxi Logic components
    this.entity = asEntity(this.container, {
      // Zoom and pan behavior
      'ZoomPan': new ZoomPanLogic({
        zoomEnabled: true,
        panEnabled: true,
        initialScale: this.scale,
        minScale: 1,
        maxScale: 16,
        zoomIncrement: 0.5,
        onZoomChange: (newScale) => {
          this.scale = newScale;
          if (this.sprite) {
            this.sprite.scale.set(newScale);
          }
          if (options.onScaleChange) {
            options.onScaleChange(newScale);
          }
        }
      }),

      // Cell selection behavior
      'CellSelection': new CellSelectionLogic({
        cellSize: 8,
        sheetWidth: Math.floor(this.config.width / 8),
        sheetHeight: Math.floor(this.config.height / 8),
        scale: this.scale,
        onCellHover: options.onCellHover,
        onCellClick: options.onCellClick,
        onCellSelect: (cellX, cellY) => {
          console.log(`Cell selected: ${cellX}, ${cellY}`);
        }
      })
    });

    // Initialize entity
    this.entity.moxiEntity.init(this.renderer);
  }

  /**
   * Get the current scale
   */
  getScale(): number {
    return this.scale;
  }

  /**
   * Set the scale
   */
  setScale(newScale: number) {
    const zoomPanLogic = this.entity.moxiEntity.getLogic('ZoomPan') as ZoomPanLogic | undefined;
    if (zoomPanLogic) {
      zoomPanLogic.setScale(newScale);
    }
  }

  /**
   * Get sprite sheet config
   */
  getConfig(): SpriteSheetConfig {
    return this.config;
  }

  /**
   * Get scaled dimensions
   */
  getScaledDimensions(): { width: number; height: number } {
    return {
      width: this.config.width * this.scale,
      height: this.config.height * this.scale
    };
  }

  /**
   * Get pixel color at coordinates
   */
  getPixel(x: number, y: number): number {
    if (x < 0 || x >= this.config.width || y < 0 || y >= this.config.height) {
      return 0;
    }
    return this.pixels[y][x];
  }

  /**
   * Set pixel color at coordinates
   */
  setPixel(x: number, y: number, colorIndex: number) {
    if (x < 0 || x >= this.config.width || y < 0 || y >= this.config.height) {
      return;
    }
    if (colorIndex < 0 || colorIndex >= this.config.palette.length) {
      return;
    }
    this.pixels[y][x] = colorIndex;
  }

  /**
   * Update texture from pixel data using PixelRenderer utility
   */
  private updateTexture() {
    // Destroy old texture if exists
    if (this.texture) {
      this.texture.destroy(true);
    }

    // Use PixelRenderer utility instead of manual rendering
    this.texture = PixelRenderer.renderToTexture({
      width: this.config.width,
      height: this.config.height,
      pixels: this.pixels,
      palette: this.config.palette,
      grid: this.showGrid ? {
        enabled: true,
        size: 8,
        color: 'rgba(128, 128, 128, 0.3)',
        lineWidth: 1
      } : undefined
    });
  }

  /**
   * Render the sprite sheet
   */
  render(container: PIXI.Container) {
    // Preserve position if sprite already exists
    const preservedX = this.sprite?.x;
    const preservedY = this.sprite?.y;

    // Remove old sprite if it exists
    if (this.sprite) {
      container.removeChild(this.sprite);
    }

    // Update texture using PixelRenderer
    this.updateTexture();

    if (!this.texture) return;

    // Create sprite from texture
    this.sprite = new PIXI.Sprite(this.texture);
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.scale.set(this.scale);

    // Restore or set initial position
    if (preservedX !== undefined && preservedY !== undefined) {
      this.sprite.x = preservedX;
      this.sprite.y = preservedY;
    } else {
      this.sprite.x = (this.config.width * this.scale) / 2;
      this.sprite.y = (this.config.height * this.scale) / 2;
    }

    container.addChild(this.sprite);

    // Update CellSelectionLogic with new sprite and scale
    const cellSelectionLogic = this.entity.moxiEntity.getLogic('CellSelection') as CellSelectionLogic | undefined;
    if (cellSelectionLogic) {
      cellSelectionLogic.setSprite(this.sprite);
      cellSelectionLogic.setScale(this.scale);
    }
  }

  /**
   * Programmatically select a cell
   */
  selectCell(cellX: number, cellY: number) {
    const cellSelectionLogic = this.entity.moxiEntity.getLogic('CellSelection') as CellSelectionLogic | undefined;
    if (cellSelectionLogic) {
      cellSelectionLogic.selectCell(cellX, cellY);
    }
  }

  /**
   * Get selected cell
   */
  getSelectedCell(): { x: number; y: number } {
    const cellSelectionLogic = this.entity.moxiEntity.getLogic('CellSelection') as CellSelectionLogic | undefined;
    return cellSelectionLogic?.getSelectedCell() || { x: -1, y: -1 };
  }

  /**
   * Get all pixel data (for saving)
   */
  getPixelData(): number[][] {
    return this.pixels.map(row => [...row]);
  }

  /**
   * Set all pixel data (for loading)
   */
  setPixelData(pixels: number[][]): void {
    if (pixels.length !== this.config.height) {
      console.error('Pixel data height mismatch');
      return;
    }
    if (pixels[0]?.length !== this.config.width) {
      console.error('Pixel data width mismatch');
      return;
    }
    this.pixels = pixels.map(row => [...row]);
  }

  /**
   * Clear all pixels to a specific color
   */
  clear(colorIndex: number = 0) {
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        this.pixels[y][x] = colorIndex;
      }
    }
  }

  /**
   * Get the container (for adding to scene)
   */
  getContainer(): PIXI.Container {
    return this.container;
  }

  /**
   * Update logic components (called every frame)
   */
  update(deltaTime: number) {
    this.entity.moxiEntity.update(deltaTime);
  }

  /**
   * Enable/disable zoom
   */
  enableZoom() {
    const logic = this.entity.moxiEntity.getLogic('ZoomPan') as ZoomPanLogic | undefined;
    logic?.enableZoom();
  }

  disableZoom() {
    const logic = this.entity.moxiEntity.getLogic('ZoomPan') as ZoomPanLogic | undefined;
    logic?.disableZoom();
  }

  /**
   * Enable/disable pan
   */
  enablePan() {
    const logic = this.entity.moxiEntity.getLogic('ZoomPan') as ZoomPanLogic | undefined;
    logic?.enablePan();
  }

  disablePan() {
    const logic = this.entity.moxiEntity.getLogic('ZoomPan') as ZoomPanLogic | undefined;
    logic?.disablePan();
  }
}

/**
 * USAGE EXAMPLE:
 *
 * const controller = new SpriteSheetControllerWithLogic({
 *   config: {
 *     type: 'PICO-8',
 *     width: 128,
 *     height: 128,
 *     palette: PICO8_PALETTE
 *   },
 *   renderer,
 *   showGrid: true,
 *   onScaleChange: (scale) => console.log(`Zoom: ${scale}x`),
 *   onCellHover: (x, y) => console.log(`Hover: ${x}, ${y}`),
 *   onCellClick: (x, y) => console.log(`Click: ${x}, ${y}`)
 * });
 *
 * // Render to container
 * controller.render(contentContainer);
 *
 * // Update each frame
 * app.ticker.add((delta) => {
 *   controller.update(delta);
 * });
 *
 * // Dynamically control behaviors
 * controller.disableZoom(); // Prevent zooming
 * controller.enablePan();   // Allow panning
 */
