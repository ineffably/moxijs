import * as PIXI from 'pixi.js';
import { UIScaleMode } from './UIScaleMode';

export interface UILayerOptions {
  /**
   * Scaling mode for this UI layer
   * @default UIScaleMode.None
   */
  scaleMode?: UIScaleMode;

  /**
   * Target width for the UI layer (used as reference for scaling)
   * If not provided, uses the first child's width
   */
  targetWidth?: number;

  /**
   * Target height for the UI layer (used as reference for scaling)
   * If not provided, uses the first child's height
   */
  targetHeight?: number;
}

/**
 * UILayer is a container that manages scaling behavior for all its children
 *
 * @example
 * ```typescript
 * const hudLayer = new UILayer({ scaleMode: UIScaleMode.ScaleUI });
 * scene.addChild(hudLayer);
 * hudLayer.addChild(tabs.container);
 * ```
 */
export class UILayer extends PIXI.Container {
  private scaleMode: UIScaleMode;
  private targetWidth?: number;
  private targetHeight?: number;
  private initialBoundsRecorded = false;

  constructor(options: UILayerOptions = {}) {
    super();
    this.scaleMode = options.scaleMode ?? UIScaleMode.None;
    this.targetWidth = options.targetWidth;
    this.targetHeight = options.targetHeight;
  }

  /**
   * Update the layer's scale based on the current canvas size
   */
  updateScale(canvasWidth: number, canvasHeight: number): void {
    if (this.scaleMode === UIScaleMode.None) {
      this.scale.set(1, 1);
      return;
    }

    // Record initial bounds from first child if not explicitly set
    if (!this.initialBoundsRecorded && this.children.length > 0) {
      if (!this.targetWidth || !this.targetHeight) {
        const bounds = this.getLocalBounds();
        this.targetWidth = this.targetWidth ?? bounds.width;
        this.targetHeight = this.targetHeight ?? bounds.height;
      }
      this.initialBoundsRecorded = true;
    }

    if (!this.targetWidth || !this.targetHeight) {
      // No dimensions to scale from yet
      return;
    }

    const scaleX = canvasWidth / this.targetWidth;
    const scaleY = canvasHeight / this.targetHeight;

    switch (this.scaleMode) {
      case UIScaleMode.ScaleUI:
        // Scale to fill, stretching if necessary
        this.scale.set(scaleX, scaleY);
        break;

      case UIScaleMode.LockRatio:
        // Scale maintaining aspect ratio
        const scale = Math.min(scaleX, scaleY);
        this.scale.set(scale, scale);
        // Center the content
        this.position.set(
          (canvasWidth - this.targetWidth * scale) / 2,
          (canvasHeight - this.targetHeight * scale) / 2
        );
        break;
    }
  }

  /**
   * Add a child and trigger scale update if needed
   */
  override addChild<T extends PIXI.Container[]>(...children: T): T[0] {
    const result = super.addChild(...children);
    this.initialBoundsRecorded = false;
    return result;
  }
}
