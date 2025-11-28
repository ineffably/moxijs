import PIXI from 'pixi.js';
import { AssetLoader } from '../core/asset-loader';
import { Camera } from '../core/camera';
import { Engine } from '../core/engine';
import { RenderManager } from '../core/render-manager';
import { Scene } from '../core/scene';
import { PhysicsWorld, type PhysicsWorldOptions } from './physics';
import { LoadingScene, type LoadingSceneOptions } from './loading-scene';

/** Options for pixel-perfect rendering (pixel art games). */
export interface PixelPerfectOptions {
  /** Enable resolution:1, antialias:false, roundPixels:true. Default true. */
  enabled?: boolean;
  /** Apply CSS imageRendering:pixelated to canvas. Default true. */
  imageRendering?: boolean;
}

/** Configuration for setupMoxi(). */
export interface SetupMoxiArgs {
  /** Container element to attach the canvas. */
  hostElement: HTMLElement;
  /** PIXI render options (width, height, backgroundColor, etc). */
  renderOptions?: Partial<PIXI.AutoDetectOptions>;
  /** Enable physics. Pass true for defaults or PhysicsWorldOptions. */
  physics?: PhysicsWorldOptions | boolean;
  /** Show loading overlay during asset loading. */
  showLoadingScene?: boolean;
  /** Customize loading scene appearance. */
  loadingSceneOptions?: LoadingSceneOptions;
  /** Enable pixel-perfect rendering. Pass true for defaults. */
  pixelPerfect?: boolean | PixelPerfectOptions;
}

/** Return value from setupMoxi(). */
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

/** Default PIXI render options. */
export const defaultRenderOptions = {
  width: 1280,
  height: 720,
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  antialias: true
} as Partial<PIXI.AutoDetectOptions>;

/**
 * Initialize Moxi. Main entry point.
 *
 * @example
 * ```ts
 * const { scene, engine, loadAssets, camera } = await setupMoxi({
 *   hostElement: document.getElementById('app'),
 *   renderOptions: { width: 1280, height: 720 },
 *   physics: true,
 *   pixelPerfect: true
 * });
 *
 * await loadAssets([{ src: './sprite.png', alias: 'sprite' }]);
 * scene.addChild(asEntity(new PIXI.Sprite(PIXIAssets.get('sprite'))));
 * scene.init();
 * engine.start();
 * ```
 */
export async function setupMoxi({
  hostElement,
  renderOptions = defaultRenderOptions,
  physics,
  showLoadingScene = false,
  loadingSceneOptions = {},
  pixelPerfect
} = {} as SetupMoxiArgs) {
  // Process pixel-perfect options
  let finalRenderOptions = { ...renderOptions };
  let applyImageRendering = false;

  if (pixelPerfect) {
    const ppOptions = typeof pixelPerfect === 'boolean'
      ? { enabled: true, imageRendering: true }
      : pixelPerfect;

    if (ppOptions.enabled !== false) {
      // Apply pixel-perfect render settings
      finalRenderOptions = {
        ...finalRenderOptions,
        resolution: 1,
        antialias: false,
        roundPixels: true
      };
    }

    applyImageRendering = ppOptions.imageRendering !== false;
  }

  const { renderer } = await RenderManager.create(hostElement, finalRenderOptions);

  // Apply canvas CSS for pixel-perfect scaling if requested
  if (applyImageRendering) {
    const canvas = renderer.canvas as HTMLCanvasElement;
    canvas.style.imageRendering = 'pixelated';
    canvas.style.imageRendering = '-moz-crisp-edges';
    canvas.style.imageRendering = 'crisp-edges';
  }

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

