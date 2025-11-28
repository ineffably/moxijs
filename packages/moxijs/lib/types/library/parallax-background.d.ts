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
export declare class ParallaxBackground extends PIXI.Container implements AsEntity<PIXI.Container> {
    moxiEntity: MoxiEntity<PIXI.Container>;
    camera: Camera | null;
    scrollOffset: PIXI.Point;
    scrollBaseScale: PIXI.Point;
    scrollIgnoreCameraZoom: boolean;
    autoscroll: PIXI.Point;
    constructor(options?: ParallaxBackgroundOptions);
    addLayer(layer: ParallaxLayer): void;
    private detectCamera;
    getCameraPosition(): PIXI.Point;
    getCameraScale(): PIXI.Point;
}
export declare class ParallaxBackgroundLogic extends Logic<ParallaxBackground> {
    name: string;
    update(entity: ParallaxBackground, deltaTime: number): void;
}
