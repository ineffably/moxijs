import PIXI from 'pixi.js';
import { AssetLoader } from '../core/asset-loader';
import { Camera } from '../core/camera';
import { Engine } from '../core/engine';
import { Scene } from '../core/scene';
import { PhysicsWorld, type PhysicsWorldOptions } from './physics';
import { LoadingScene, type LoadingSceneOptions } from './loading-scene';
export interface SetupMoxiArgs {
    hostElement: HTMLElement;
    renderOptions?: Partial<PIXI.AutoDetectOptions>;
    physics?: PhysicsWorldOptions | boolean;
    showLoadingScene?: boolean;
    loadingSceneOptions?: LoadingSceneOptions;
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
export declare function setupMoxi({ hostElement, renderOptions, physics, showLoadingScene, loadingSceneOptions }?: SetupMoxiArgs): Promise<{
    scene: Scene;
    engine: Engine;
    PIXIAssets: PIXI.AssetsClass;
    renderer: PIXI.Renderer<HTMLCanvasElement>;
    loadAssets: (assets: import("..").Asset[]) => Promise<AssetLoader>;
    camera: Camera;
    physicsWorld: PhysicsWorld;
    loadingScene: LoadingScene;
}>;
