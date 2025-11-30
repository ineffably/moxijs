import PIXI from 'pixi.js';
import { AssetLoader } from '../main/asset-loader';
import { Camera } from '../main/camera';
import { Engine } from '../main/engine';
import { Scene } from '../main/scene';
import { PhysicsWorld, type PhysicsWorldOptions } from './physics';
import { LoadingScene, type LoadingSceneOptions } from './loading-scene';
export interface PixelPerfectOptions {
    enabled?: boolean;
    imageRendering?: boolean;
}
export interface SetupMoxiArgs {
    hostElement: HTMLElement;
    renderOptions?: Partial<PIXI.AutoDetectOptions>;
    backgroundColor?: number;
    physics?: PhysicsWorldOptions | boolean;
    showLoadingScene?: boolean;
    loadingSceneOptions?: LoadingSceneOptions;
    pixelPerfect?: boolean | PixelPerfectOptions;
}
export interface SetupMoxiResult {
    scene: Scene;
    engine: Engine;
    PIXIAssets: AssetLoader['PIXIAssets'];
    renderer: PIXI.Renderer;
    loadAssets: AssetLoader['loadAssets'];
    camera: Camera;
    physicsWorld?: PhysicsWorld;
    loadingScene?: LoadingScene;
}
export declare const defaultRenderOptions: Partial<PIXI.AutoDetectOptions>;
export declare function setupMoxi({ hostElement, renderOptions, backgroundColor, physics, showLoadingScene, loadingSceneOptions, pixelPerfect }?: SetupMoxiArgs): Promise<{
    scene: Scene;
    engine: Engine;
    PIXIAssets: PIXI.AssetsClass;
    renderer: PIXI.Renderer<HTMLCanvasElement>;
    loadAssets: (assets: import("..").Asset[]) => Promise<AssetLoader>;
    camera: Camera;
    physicsWorld: PhysicsWorld;
    loadingScene: LoadingScene;
}>;
