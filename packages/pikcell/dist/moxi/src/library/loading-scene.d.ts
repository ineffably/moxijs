import PIXI from 'pixi.js';
import { Container } from 'pixi.js';
export interface LoadingSceneOptions {
    backgroundColor?: number;
    squareSize?: number;
    numSquares?: number;
    text?: string;
    textStyle?: Partial<PIXI.TextStyle>;
}
/**
 * Default loading scene component for Moxi
 * Displays animated pixel squares falling above loading text
 *
 * @category Library
 */
export declare class LoadingScene extends Container {
    private particles;
    private text;
    private background;
    private ticker;
    private renderer;
    private time;
    private nextSpawn;
    private maxParticles;
    private baseSize;
    private backgroundColor;
    constructor(options?: LoadingSceneOptions);
    private spawnParticle;
    private update;
    init(renderer: PIXI.Renderer): void;
    show(): void;
    hide(): void;
    destroy(): void;
}
