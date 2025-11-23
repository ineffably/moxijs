import PIXI from 'pixi.js';
import { AssetLoader } from '../core/asset-loader';
import { Camera } from '../core/camera';
import { Engine } from '../core/engine';
import { RenderManager } from '../core/render-manager';
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

export const defaultRenderOptions = {
  width: 1280,
  height: 720,
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  antialias: true
} as Partial<PIXI.AutoDetectOptions>;

export async function setupMoxi({ 
  hostElement, 
  renderOptions = defaultRenderOptions, 
  physics,
  showLoadingScene = false,
  loadingSceneOptions = {}
} = {} as SetupMoxiArgs) {
  const { renderer } = await RenderManager.create(hostElement, renderOptions);
  const scene = new Scene(renderer);
  const engine = new Engine(scene);

  // Get the AssetLoader instance
  const assetLoader = new AssetLoader();
  const { PIXIAssets, loadAssets } = assetLoader;

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

  // Setup loading scene if requested
  let loadingScene: LoadingScene | undefined;
  if (showLoadingScene) {
    loadingScene = new LoadingScene(loadingSceneOptions);
    loadingScene.zIndex = 10000; // Ensure it's on top
    loadingScene.init(renderer);
    scene.addChild(loadingScene);
    loadingScene.hide();

    // Hook into asset loading events
    assetLoader.on('loading:start', () => {
      if (loadingScene) {
        loadingScene.show();
      }
    });

    assetLoader.on('loading:end', () => {
      if (loadingScene) {
        loadingScene.hide();
      }
    });
  }

  return {
    scene,
    engine,
    PIXIAssets,
    renderer,
    loadAssets,
    camera,
    physicsWorld,
    loadingScene
  };
}

