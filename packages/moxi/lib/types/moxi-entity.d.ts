import PIXI from 'pixi.js';
import { Behavior } from './bahavior';
interface MoxiEntityClass<T> {
    behaviors: MoxiBehaviors<T>;
    update: (delta: number, entity: T) => void;
    init: (...args: any[]) => void;
    addBehavior: (behavior: Behavior<T>) => void;
    getBehavior: (name: string) => Behavior<T> | undefined;
}
export type AsEntity<T> = PIXI.Container & {
    moxiEntity: MoxiEntity<T>;
};
export type MoxiBehaviors<T> = Record<string, Behavior<T>>;
export declare class MoxiEntity<T> implements MoxiEntityClass<T> {
    behaviors: MoxiBehaviors<T>;
    entity: T;
    constructor(entity: T, behaviors?: MoxiBehaviors<T>);
    update(deltaTime: number): void;
    init(renderer: PIXI.Renderer<HTMLCanvasElement>, ...args: any[]): void;
    addBehavior(behavior: Behavior<T>): void;
    getBehavior<T>(name: string): T;
}
export declare function asEntity<T extends PIXI.Container>(entity: T, behaviors?: MoxiBehaviors<T>): AsEntity<T>;
export {};
