import PIXI from 'pixi.js';
import { AssetLoader } from '../core/asset-loader';
import { Camera } from '../core/camera';
import { Engine } from '../core/engine';
import { RenderManager } from '../core/render-manager';
import { Scene } from '../core/scene';
import { PhysicsWorld, type PhysicsWorldOptions } from './physics';

export interface SetupMoxiArgs {
  hostElement: HTMLElement;
  renderOptions?: Partial<PIXI.AutoDetectOptions>;
  physics?: PhysicsWorldOptions | boolean;
}

export interface SetupMoxiResult {
  scene: Scene;
  engine: Engine;
  PIXIAssets: AssetLoader['PIXIAssets'];
  renderer: PIXI.Renderer;
  loadAssets: AssetLoader['loadAssets'];
  camera: Camera;
  physicsWorld?: PhysicsWorld;
}

export const defaultRenderOptions = {
  width: 1280,
  height: 720,
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  antialias: true
} as Partial<PIXI.AutoDetectOptions>;

export async function setupMoxi({ hostElement, renderOptions = defaultRenderOptions, physics } = {} as SetupMoxiArgs) {
  const { renderer } = await RenderManager.create(hostElement, renderOptions);
  const scene = new Scene(renderer);
  const engine = new Engine(scene);

  // Get the singleton AssetLoader instance
  const { PIXIAssets, loadAssets } = new AssetLoader();

  const camera = new Camera(scene, renderer);

  // Setup physics if requested
  let physicsWorld: PhysicsWorld | undefined;

  if (physics) {
    const physicsOptions = typeof physics === 'boolean'
      ? {}
      : physics;

    physicsWorld = new PhysicsWorld(physicsOptions);
    engine.addPhysicsWorld(physicsWorld);
  }

  return {
    scene,
    engine,
    PIXIAssets,
    renderer,
    loadAssets,
    camera,
    physicsWorld
  };
}

