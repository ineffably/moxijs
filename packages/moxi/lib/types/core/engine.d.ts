import PIXI from 'pixi.js';
import { Scene } from './scene';
import type { PhysicsWorld } from '../library/physics';
export declare class Engine {
    ticker: PIXI.Ticker;
    root: Scene;
    physicsWorld?: PhysicsWorld;
    logger: (msg: string) => void;
    loggerFrequencyMs: number;
    nextLogTime: number;
    constructor(stage?: Scene);
    start(): this;
    stop(): this;
    addPhysicsWorld(physicsWorld: PhysicsWorld): this;
    gameLoop: (tikerTime: PIXI.Ticker) => void;
    loadStage(stage: Scene): this;
}
