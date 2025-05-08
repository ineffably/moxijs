import PIXI, { Point } from 'pixi.js';
import { Behavior } from '../core/bahavior';
import { Scene } from '../core/scene';
import { AsEntity, MoxiBehaviors, MoxiEntity } from '../core/moxi-entity';
export declare class CameraBehavior extends Behavior<PIXI.Container> {
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
    constructor(scene: Scene, renderer: PIXI.Renderer, behaviors?: MoxiBehaviors<PIXI.Container>);
}
