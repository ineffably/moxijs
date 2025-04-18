import { Behavior } from 'moxi';
import PIXI from 'pixi.js';
export declare const DIRECTION: {
    readonly DOWN: 0;
    readonly UP: 1;
    readonly LEFT: 2;
    readonly RIGHT: 3;
};
export type Direction = typeof DIRECTION[keyof typeof DIRECTION];
export interface MovementOptions {
    speed: number;
    animationSpeed: number;
    framesPerDirection: number;
    allowDiagonal?: boolean;
}
export declare const DEFAULT_MOVEMENT_OPTIONS: MovementOptions;
export declare class MovementBehavior extends Behavior<PIXI.AnimatedSprite> {
    private clientEvents;
    private direction;
    private moving;
    private animationTimer;
    private textures;
    private options;
    constructor(options?: Partial<MovementOptions>);
    init(entity: PIXI.AnimatedSprite, renderer: PIXI.Renderer<HTMLCanvasElement>, textures: PIXI.Texture[]): void;
    update(entity: PIXI.AnimatedSprite, deltaTime: number): void;
    getDirection(): Direction;
    isMoving(): boolean;
    private updateAnimation;
    private updateTexture;
}
