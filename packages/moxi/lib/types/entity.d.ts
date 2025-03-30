import PIXI from 'pixi.js';
import { Behavior } from './bahavior';
export declare class Entity extends PIXI.Sprite {
    behaviors: Record<string, Behavior>;
    constructor(texture?: any);
    init(...args: any[]): void;
    update(deltaTime: number): void;
    getBehavior(name: string): Behavior | undefined;
    addBehavior(behavior: Behavior): void;
}
