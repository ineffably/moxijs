import { AssetLoader, Camera, PIXI } from '.';
import { Engine } from './core/engine';
import { Scene } from './core/scene';
export interface PrepareArgs {
    hostElement: HTMLElement;
    renderOptions?: Partial<PIXI.AutoDetectOptions>;
}
export interface PrepMoxiResult {
    scene: Scene;
    engine: Engine;
    PIXIAssets: AssetLoader['PIXIAssets'];
    renderer: PIXI.Renderer;
    loadAssets: AssetLoader['loadAssets'];
}
export declare const defaultRenderOptions: Partial<PIXI.AutoDetectOptions>;
export declare function prepMoxi({ hostElement, renderOptions }?: PrepareArgs): Promise<{
    scene: Scene;
    engine: Engine;
    PIXIAssets: PIXI.AssetsClass;
    renderer: PIXI.Renderer<HTMLCanvasElement>;
    loadAssets: (assets: import(".").Asset[]) => Promise<AssetLoader>;
    camera: Camera;
}>;
