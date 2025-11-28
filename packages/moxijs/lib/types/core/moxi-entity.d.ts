import PIXI from 'pixi.js';
import { Logic } from './logic';
interface MoxiEntityClass<T> {
    logic: MoxiLogic<T>;
    update: (delta: number, entity: T) => void;
    init: (...args: any[]) => void;
    addLogic: (logic: Logic<T>) => void;
    getLogic: (name: string) => Logic<T> | undefined;
}
export type AsEntity<T> = PIXI.Container & {
    moxiEntity: MoxiEntity<T>;
};
export type MoxiLogic<T> = Record<string, Logic<T>>;
export declare class MoxiEntity<T> implements MoxiEntityClass<T> {
    logic: MoxiLogic<T>;
    entity: T;
    constructor(entity: T, logic?: MoxiLogic<T>);
    update(deltaTime: number): void;
    init(renderer: PIXI.Renderer<HTMLCanvasElement>, ...args: any[]): void;
    addLogic(logic: Logic<T>): void;
    getLogic<L extends Logic<T>>(name: string): L | undefined;
}
export declare function asEntity<T extends PIXI.Container>(entity: T, logic?: MoxiLogic<T>): AsEntity<T>;
export {};
