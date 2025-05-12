import { Behavior, TextureFrameSequences } from 'moxi';
import PIXI from 'pixi.js';
export declare const DIRECTION: {
    readonly DOWN: "down";
    readonly UP: "up";
    readonly LEFT: "left";
    readonly RIGHT: "right";
};
export type Direction = typeof DIRECTION[keyof typeof DIRECTION];
export declare const ANIMATION_STATE: {
    readonly IDLE: "idle";
    readonly WALK: "walk";
};
export type AnimationState = typeof ANIMATION_STATE[keyof typeof ANIMATION_STATE];
export interface MovementOptions {
    speed: number;
    allowDiagonal?: boolean;
}
export declare const DEFAULT_MOVEMENT_OPTIONS: MovementOptions;
export declare class PlayerMovementBehavior extends Behavior<PIXI.AnimatedSprite> {
    private clientEvents;
    private direction;
    private animationState;
    private moving;
    private animationTimer;
    private frameIndex;
    private options;
    private frameSequences;
    private currentSequenceName;
    private velocity;
    constructor(options: Partial<MovementOptions>, frameSequences: TextureFrameSequences);
    init(entity: PIXI.AnimatedSprite, renderer: PIXI.Renderer<HTMLCanvasElement>): void;
    private getSequenceKey;
    private setAnimationState;
    private getDirectionFromVelocity;
    private normalizeVelocity;
    update(entity: PIXI.AnimatedSprite, deltaTime: number): void;
    getDirection(): Direction;
    getAnimationState(): AnimationState;
    isMoving(): boolean;
    getVelocity(): PIXI.Point;
    private updateAnimation;
    private updateTexture;
}
