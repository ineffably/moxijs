import * as PIXI from 'pixi.js';
import { MoxiEntity, AsEntity } from '../main/moxi-entity';
export interface ParallaxLayerOptions {
    scrollScale?: PIXI.Point;
    scrollOffset?: PIXI.Point;
    repeatSize?: PIXI.Point;
    mirroring?: boolean;
}
export declare class ParallaxLayer extends PIXI.Container implements AsEntity<PIXI.Container> {
    moxiEntity: MoxiEntity<PIXI.Container>;
    scrollScale: PIXI.Point;
    scrollOffset: PIXI.Point;
    repeatSize: PIXI.Point;
    mirroring: boolean;
    private _lastCameraPos;
    constructor(options?: ParallaxLayerOptions);
    updateParallax(cameraPos: PIXI.Point, cameraScale: PIXI.Point, backgroundOffset: PIXI.Point): void;
}
export interface TilingParallaxLayerOptions extends ParallaxLayerOptions {
    texture: PIXI.Texture;
    width?: number;
    height?: number;
}
export declare class TilingParallaxLayer extends ParallaxLayer {
    tilingSprite: PIXI.TilingSprite;
    private _autoSized;
    constructor(options: TilingParallaxLayerOptions);
    private autoDetectDimensions;
    updateParallax(cameraPos: PIXI.Point, cameraScale: PIXI.Point, backgroundOffset: PIXI.Point): void;
    resize(width: number, height: number): void;
}
