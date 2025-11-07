import PIXI, { Point } from 'pixi.js';
import { Logic } from '../core/logic';
import { Scene } from '../core/scene';
import { AsEntity, MoxiLogic, MoxiEntity } from '../core/moxi-entity';
export declare class CameraLogic extends Logic<PIXI.Container> {
    speed: number;
    target: PIXI.Container;
    entity: PIXI.Container<PIXI.ContainerChild>;
    renderer: PIXI.Renderer<HTMLCanvasElement>;
    init(entity: PIXI.Container, renderer: PIXI.Renderer): void;
    update(entity: Camera, deltaTime: number): void;
}
export declare class Camera extends PIXI.Container implements AsEntity<PIXI.Container> {
    scene: Scene;
    renderer: PIXI.Renderer;
    speed: number;
    moxiEntity: MoxiEntity<PIXI.Container>;
    desiredScale: Point;
    desiredPosition: Point;
    constructor(scene: Scene, renderer: PIXI.Renderer, logic?: MoxiLogic<PIXI.Container>);
}
