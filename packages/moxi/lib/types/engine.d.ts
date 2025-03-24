import PIXI, { Ticker } from 'pixi.js';
import { Scene } from './scene';
export declare class Engine {
    ticker: PIXI.Ticker;
    root: Scene;
    logger: (msg: string) => void;
    loggerFrequencyMs: number;
    nextLogTime: number;
    constructor(stage?: Scene);
    start(): this;
    stop(): this;
    gameLoop: (tikerTime: Ticker) => void;
    loadStage(stage: Scene): this;
}
