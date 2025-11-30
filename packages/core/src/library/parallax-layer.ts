import * as PIXI from 'pixi.js';
import { MoxiEntity, AsEntity, asEntity } from '../main/moxi-entity';

export interface ParallaxLayerOptions {
  scrollScale?: PIXI.Point;      // Motion multiplier (0.5 = half speed, like Godot's motion_scale)
  scrollOffset?: PIXI.Point;     // Layer offset for positioning (like Godot's motion_offset)
  repeatSize?: PIXI.Point;       // Mirroring/repeat interval (0 = no repeat, like Godot's motion_mirroring)
  mirroring?: boolean;           // Enable automatic mirroring (requires repeatSize)
}

/**
 * Individual parallax layer that scrolls at a different speed based on scrollScale.
 *
 * Inspired by Godot's ParallaxLayer node.
 *
 * The scrollScale property controls how fast the layer moves relative to the camera:
 * - 0.0 = Static (doesn't move with camera, good for UI/HUD)
 * - 0.2 = Slow (appears far away, like sky)
 * - 0.5 = Medium (mid-ground elements)
 * - 0.9 = Fast (foreground elements)
 * - 1.0 = Moves with camera (game entities)
 * - >1.0 = Faster than camera (reverse parallax effect)
 *
 * @example
 * ```typescript
 * const layer = new ParallaxLayer({
 *   scrollScale: new PIXI.Point(0.5, 0.5), // Half camera speed
 *   scrollOffset: new PIXI.Point(0, 0)
 * });
 *
 * // Add sprites to the layer
 * const sprite = new PIXI.Sprite(texture);
 * layer.addChild(sprite);
 * ```
 */
export class ParallaxLayer extends PIXI.Container implements AsEntity<PIXI.Container> {
  public moxiEntity: MoxiEntity<PIXI.Container>;
  public scrollScale: PIXI.Point = new PIXI.Point(1, 1);
  public scrollOffset: PIXI.Point = new PIXI.Point(0, 0);
  public repeatSize: PIXI.Point = new PIXI.Point(0, 0);
  public mirroring: boolean = false;

  // Internal state
  private _lastCameraPos: PIXI.Point = new PIXI.Point(0, 0);

  constructor(options: ParallaxLayerOptions = {}) {
    super();

    this.scrollScale = options.scrollScale ?? new PIXI.Point(1, 1);
    this.scrollOffset = options.scrollOffset ?? new PIXI.Point(0, 0);
    this.repeatSize = options.repeatSize ?? new PIXI.Point(0, 0);
    this.mirroring = options.mirroring ?? false;

    // Convert to Moxi entity
    const entity = asEntity(this);
    this.moxiEntity = entity.moxiEntity;
  }

  /**
   * Update layer position based on camera movement.
   * Called by ParallaxBackgroundLogic each frame.
   *
   * @param cameraPos - Current camera position in world space
   * @param cameraScale - Current camera scale/zoom
   * @param backgroundOffset - Global background scroll offset
   */
  updateParallax(
    cameraPos: PIXI.Point,
    cameraScale: PIXI.Point,
    backgroundOffset: PIXI.Point
  ): void {
    // Calculate effective scroll offset
    const scrollX = (cameraPos.x + backgroundOffset.x) * this.scrollScale.x;
    const scrollY = (cameraPos.y + backgroundOffset.y) * this.scrollScale.y;

    // Apply to layer position
    this.position.x = -scrollX + this.scrollOffset.x;
    this.position.y = -scrollY + this.scrollOffset.y;

    // Handle mirroring/wrapping if enabled
    if (this.mirroring) {
      if (this.repeatSize.x > 0) {
        this.position.x = this.position.x % this.repeatSize.x;
        if (this.position.x > 0) this.position.x -= this.repeatSize.x;
      }
      if (this.repeatSize.y > 0) {
        this.position.y = this.position.y % this.repeatSize.y;
        if (this.position.y > 0) this.position.y -= this.repeatSize.y;
      }
    }

    this._lastCameraPos.copyFrom(cameraPos);
  }
}

export interface TilingParallaxLayerOptions extends ParallaxLayerOptions {
  texture: PIXI.Texture;
  width?: number;
  height?: number;
}

/**
 * Specialized parallax layer using PIXI.TilingSprite for efficient infinite scrolling.
 *
 * This is the recommended approach for large, repeating backgrounds like sky, clouds,
 * or ground textures. TilingSprite is optimized for repeating patterns and uses
 * tilePosition for seamless scrolling without repositioning the container.
 *
 * @example
 * ```typescript
 * const skyLayer = new TilingParallaxLayer({
 *   texture: skyTexture,
 *   scrollScale: new PIXI.Point(0.2, 0.2)
 *   // width/height auto-detected from renderer
 * });
 * parallaxBackground.addLayer(skyLayer);
 * ```
 */
export class TilingParallaxLayer extends ParallaxLayer {
  public tilingSprite: PIXI.TilingSprite;
  private _autoSized: boolean = false;

  constructor(options: TilingParallaxLayerOptions) {
    super(options);

    // Ensure texture wraps for seamless tiling
    options.texture.source.style.addressMode = 'repeat';

    // If dimensions not provided, use temporary values and auto-detect on first update
    const width = options.width ?? 1;
    const height = options.height ?? 1;

    // Create TilingSprite as child
    this.tilingSprite = new PIXI.TilingSprite({
      texture: options.texture,
      width: width,
      height: height,
    });

    // Position TilingSprite to start from origin (0, 0) to cover the viewport
    this.tilingSprite.position.set(0, 0);

    this.addChild(this.tilingSprite);

    // Mark if we need to auto-detect dimensions
    this._autoSized = !options.width && !options.height;
  }

  /**
   * Auto-detect renderer dimensions from the scene hierarchy
   */
  private autoDetectDimensions(): void {
    if (!this._autoSized) return;

    // Walk up parent chain to find a node with a renderer
    let current: any = this.parent;
    while (current) {
      if (current.renderer) {
        // Found a renderer (usually on Scene)
        this.resize(current.renderer.width, current.renderer.height);
        this._autoSized = false; // Only need to do this once
        return;
      }
      current = current.parent;
    }
  }

  /**
   * Override updateParallax to use tilePosition instead of container position.
   * This provides seamless infinite scrolling without visible seams.
   *
   * Since the ParallaxBackground container now follows the camera, layers inside
   * stay at (0,0) and only use tilePosition for the parallax scrolling effect.
   *
   * Camera scale is used to resize the TilingSprite to cover the viewport at different zoom levels.
   */
  updateParallax(
    cameraPos: PIXI.Point,
    cameraScale: PIXI.Point,
    backgroundOffset: PIXI.Point
  ): void {
    // Auto-detect dimensions on first update if not manually specified
    this.autoDetectDimensions();
    // console.log('updateParallax', cameraScale);

    // Get renderer dimensions to use as base size
    const renderer = this.parent?.parent as any; // Get renderer from scene
    if (renderer?.renderer) {
      const baseWidth = renderer.renderer.width;
      const baseHeight = renderer.renderer.height;

      // ParallaxBackground counter-scales, so we're in screen-space
      // Just set to renderer size - no zoom adjustment needed
      this.tilingSprite.width = baseWidth;
      this.tilingSprite.height = baseHeight;

      // Keep sprite at origin
      this.tilingSprite.pivot.set(0, 0);
      this.tilingSprite.position.set(0, 0);
    }

    // Calculate effective scroll offset for tilePosition
    const scrollX = (cameraPos.x + backgroundOffset.x) * this.scrollScale.x;
    const scrollY = (cameraPos.y + backgroundOffset.y) * this.scrollScale.y;

    // Apply to tilePosition (with layer's own scrollOffset for positioning)
    this.tilingSprite.tilePosition.x = -scrollX + this.scrollOffset.x;
    this.tilingSprite.tilePosition.y = -scrollY + this.scrollOffset.y;

    // Layer container stays at origin - scene pivot handles zoom anchoring
    this.position.set(0, 0);
  }

  /**
   * Update TilingSprite dimensions (e.g., on window resize)
   */
  resize(width: number, height: number): void {
    this.tilingSprite.width = width;
    this.tilingSprite.height = height;
  }
}
