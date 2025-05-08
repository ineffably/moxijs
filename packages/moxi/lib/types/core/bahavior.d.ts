import PIXI from 'pixi.js';
export declare abstract class Behavior<T> {
    active: boolean;
    init(entity?: T, renderer?: PIXI.Renderer<HTMLCanvasElement>, ...args: any[]): void;
    update(entity?: T, deltaTime?: number): void;
}
export declare class InstancedBehavior<T> extends Behavior<T> {
}
