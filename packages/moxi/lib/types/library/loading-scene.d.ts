import PIXI from 'pixi.js';
import { Container, Text } from 'pixi.js';
import { FallingSquaresAnimation, FallingSquaresOptions } from './falling-squares-animation';
export { FallingSquaresAnimation };
export type { FallingSquaresOptions };
export interface LoadingAnimation {
    init(container: Container): void;
    update(context: LoadingAnimationContext): void;
    reset(): void;
    destroy(): void;
}
export interface LoadingAnimationContext {
    time: number;
    deltaTime: number;
    width: number;
    height: number;
    textElement: Text;
}
export interface LoadingSceneOptions {
    backgroundColor?: number;
    text?: string;
    textStyle?: Partial<PIXI.TextStyle>;
    animation?: LoadingAnimation;
    fallingSquaresOptions?: FallingSquaresOptions;
}
export declare class LoadingScene extends Container {
    private text;
    private background;
    private animationContainer;
    private animation;
    private ticker;
    private renderer;
    private time;
    private backgroundColor;
    constructor(options?: LoadingSceneOptions);
    private update;
    init(renderer: PIXI.Renderer): void;
    show(): void;
    hide(): void;
    destroy(): void;
}
