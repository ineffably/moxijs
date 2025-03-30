import { AssetLoader, PIXI } from '.';
import { Engine } from './engine';
import { RenderManager } from './render-manager';
import { Scene } from './scene';

export interface PrepareArgs {
  hostElement: HTMLElement;
  renderOptions?: Partial<PIXI.AutoDetectOptions>;
}

export const defaultRenderOptions = { width: 1280, height: 720, backgroundColor: 0x1099bb } as Partial<PIXI.AutoDetectOptions>;

export async function prepMoxi({ hostElement, renderOptions = defaultRenderOptions } = {} as PrepareArgs) {
  const { renderer } = await RenderManager.create(hostElement, renderOptions);
  const scene = new Scene(renderer);
  const engine = new Engine(scene);
  const { PIXIAssets, loadAssets } = new AssetLoader();

  return {
    scene,
    engine,
    PIXIAssets,
    loadAssets
  };
}

