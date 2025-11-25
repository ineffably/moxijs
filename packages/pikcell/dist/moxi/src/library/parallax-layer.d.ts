import * as PIXI from 'pixi.js';
import { MoxiEntity, AsEntity } from '../core/moxi-entity';
export interface ParallaxLayerOptions {
    scrollScale?: PIXI.Point;
    scrollOffset?: PIXI.Point;
    repeatSize?: PIXI.Point;
    mirroring?: boolean;
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
export declare class ParallaxLayer extends PIXI.Container implements AsEntity<PIXI.Container> {
    moxiEntity: MoxiEntity<PIXI.Container>;
    scrollScale: PIXI.Point;
    scrollOffset: PIXI.Point;
    repeatSize: PIXI.Point;
    mirroring: boolean;
    private _lastCameraPos;
    constructor(options?: ParallaxLayerOptions);
    /**
     * Update layer position based on camera movement.
     * Called by ParallaxBackgroundLogic each frame.
     *
     * @param cameraPos - Current camera position in world space
     * @param cameraScale - Current camera scale/zoom
     * @param backgroundOffset - Global background scroll offset
     */
    updateParallax(cameraPos: PIXI.Point, cameraScale: PIXI.Point, backgroundOffset: PIXI.Point): void;
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
export declare class TilingParallaxLayer extends ParallaxLayer {
    tilingSprite: PIXI.TilingSprite;
    private _autoSized;
    constructor(options: TilingParallaxLayerOptions);
    /**
     * Auto-detect renderer dimensions from the scene hierarchy
     */
    private autoDetectDimensions;
    /**
     * Override updateParallax to use tilePosition instead of container position.
     * This provides seamless infinite scrolling without visible seams.
     *
     * Since the ParallaxBackground container now follows the camera, layers inside
     * stay at (0,0) and only use tilePosition for the parallax scrolling effect.
     *
     * Camera scale is used to resize the TilingSprite to cover the viewport at different zoom levels.
     */
    updateParallax(cameraPos: PIXI.Point, cameraScale: PIXI.Point, backgroundOffset: PIXI.Point): void;
    /**
     * Update TilingSprite dimensions (e.g., on window resize)
     */
    resize(width: number, height: number): void;
}
