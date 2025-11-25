import * as PIXI from 'pixi.js';
import { MoxiEntity, AsEntity } from '../core/moxi-entity';
import { Logic } from '../core/logic';
import { Camera } from '../core/camera';
import { ParallaxLayer } from './parallax-layer';
export interface ParallaxBackgroundOptions {
    camera?: Camera;
    scrollOffset?: PIXI.Point;
    scrollBaseScale?: PIXI.Point;
    scrollIgnoreCameraZoom?: boolean;
    autoscroll?: PIXI.Point;
}
/**
 * Container for all parallax layers that manages global parallax behavior
 * and coordinates with the Camera system.
 *
 * Inspired by Godot's ParallaxBackground node.
 *
 * @example
 * ```typescript
 * const parallax = new ParallaxBackground();
 * const skyLayer = new TilingParallaxLayer({
 *   texture: skyTexture,
 *   scrollScale: new PIXI.Point(0.2, 0.2)
 * });
 * parallax.addLayer(skyLayer);
 * scene.addChild(parallax);
 * ```
 */
export declare class ParallaxBackground extends PIXI.Container implements AsEntity<PIXI.Container> {
    moxiEntity: MoxiEntity<PIXI.Container>;
    camera: Camera | null;
    scrollOffset: PIXI.Point;
    scrollBaseScale: PIXI.Point;
    scrollIgnoreCameraZoom: boolean;
    autoscroll: PIXI.Point;
    constructor(options?: ParallaxBackgroundOptions);
    /**
     * Adds a ParallaxLayer to the background
     */
    addLayer(layer: ParallaxLayer): void;
    /**
     * Auto-detect camera from scene hierarchy
     */
    private detectCamera;
    /**
     * Get the effective camera position for parallax calculation
     */
    getCameraPosition(): PIXI.Point;
    /**
     * Get the effective camera scale/zoom for parallax calculation
     */
    getCameraScale(): PIXI.Point;
}
/**
 * Logic component that updates the parallax background based on camera movement and autoscroll.
 */
export declare class ParallaxBackgroundLogic extends Logic<ParallaxBackground> {
    name: string;
    update(entity: ParallaxBackground, deltaTime: number): void;
}
