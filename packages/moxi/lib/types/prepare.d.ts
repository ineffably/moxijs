import { AssetLoader, PIXI } from '.';
import { Engine } from './engine';
import { Scene } from './scene';
export interface PrepareArgs {
    hostElement: HTMLElement;
    renderOptions?: Partial<PIXI.AutoDetectOptions>;
}
export declare const defaultRenderOptions: Partial<PIXI.AutoDetectOptions>;
export declare function prepMoxi({ hostElement, renderOptions }?: PrepareArgs): Promise<{
    scene: Scene;
    engine: Engine;
    PIXIAssets: PIXI.AssetsClass;
    loadAssets: (assets: import(".").Asset[]) => Promise<AssetLoader>;
}>;
