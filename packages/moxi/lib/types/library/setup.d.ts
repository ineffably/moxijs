import PIXI from 'pixi.js';
import { AssetLoader } from '../core/asset-loader';
import { Camera } from '../core/camera';
import { Engine } from '../core/engine';
import { Scene } from '../core/scene';
export interface SetupMoxiArgs {
    hostElement: HTMLElement;
    renderOptions?: Partial<PIXI.AutoDetectOptions>;
}
export interface SetupMoxiResult {
    scene: Scene;
    engine: Engine;
    PIXIAssets: AssetLoader['PIXIAssets'];
    renderer: PIXI.Renderer;
    loadAssets: AssetLoader['loadAssets'];
}
export declare const defaultRenderOptions: Partial<PIXI.AutoDetectOptions>;
export declare function setupMoxi({ hostElement, renderOptions }?: SetupMoxiArgs): Promise<{
    scene: Scene;
    engine: Engine;
    PIXIAssets: PIXI.AssetsClass;
    renderer: PIXI.Renderer<HTMLCanvasElement>;
    loadAssets: (assets: import("..").Asset[]) => Promise<AssetLoader>;
    camera: Camera;
}>;
