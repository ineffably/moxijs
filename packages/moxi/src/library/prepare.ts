import { AssetLoader, Camera, CameraBehavior, PIXI } from '..';
import { Engine } from '../core/engine';
import { RenderManager } from '../core/render-manager';
import { Scene } from '../core/scene';

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

export const defaultRenderOptions = { 
  width: 1280, 
  height: 720, 
  backgroundColor: 0x1099bb 
} as Partial<PIXI.AutoDetectOptions>;

export async function prepMoxi({ hostElement, renderOptions = defaultRenderOptions } = {} as PrepareArgs) {
  const { renderer } = await RenderManager.create(hostElement, renderOptions);
  const scene = new Scene(renderer);
  const engine = new Engine(scene);
  
  // Get the singleton AssetLoader instance
  const { PIXIAssets, loadAssets } = new AssetLoader();
  
  const camera = new Camera(scene, renderer);

  return {
    scene,
    engine,
    PIXIAssets,
    renderer,
    loadAssets,
    camera
  };
}

