import { Container } from 'pixi.js';
import type { LoadingAnimation, LoadingAnimationContext } from './loading-scene';
export interface FallingSquaresOptions {
    squareSize?: number;
    maxParticles?: number;
    palette?: number[];
    spawnInterval?: number;
}
export declare class FallingSquaresAnimation implements LoadingAnimation {
    private particles;
    private container;
    private nextSpawn;
    private time;
    private squareSize;
    private maxParticles;
    private palette;
    private spawnInterval;
    constructor(options?: FallingSquaresOptions);
    init(container: Container): void;
    update(context: LoadingAnimationContext): void;
    private spawnParticle;
    reset(): void;
    destroy(): void;
}
