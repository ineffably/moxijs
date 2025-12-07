import PIXI from 'pixi.js';
import { AssetLoader } from '../main/asset-loader';
import { Camera } from '../main/camera';
import { Engine } from '../main/engine';
import { RenderManager } from '../main/render-manager';
import { Scene } from '../main/scene';
import { PhysicsWorld, type PhysicsWorldOptions } from './physics';
import { LoadingScene, type LoadingSceneOptions } from './loading-scene';

/** Options for pixel-perfect rendering (pixel art games). */
export interface PixelPerfectOptions {
  /** Enable resolution:1, antialias:false, roundPixels:true. Default true. */
  enabled?: boolean;
  /** Apply CSS imageRendering:pixelated to canvas. Default true. */
  imageRendering?: boolean;
}

/** Scale mode for canvas scaling within the host element. */
export type ScaleMode = 'none' | 'fit' | 'fill' | 'stretch';

/** Configuration for setupMoxi(). */
export interface SetupMoxiArgs {
  /** Container element to attach the canvas. */
  hostElement: HTMLElement;
  /**
   * Canvas width in pixels. Convenience option (alternative to renderOptions.width).
   * If both are provided, this takes precedence.
   */
  width?: number;
  /**
   * Canvas height in pixels. Convenience option (alternative to renderOptions.height).
   * If both are provided, this takes precedence.
   */
  height?: number;
  /**
   * How to scale the canvas within the host element.
   * - 'none': No scaling, canvas uses its native size (default)
   * - 'fit': Scale to fit within host while maintaining aspect ratio (letterbox/pillarbox)
   * - 'fill': Scale to fill host while maintaining aspect ratio (may crop)
   * - 'stretch': Stretch to fill host (distorts aspect ratio)
   */
  scaleMode?: ScaleMode;
  /** PIXI render options (width, height, backgroundColor, etc). */
  renderOptions?: Partial<PIXI.AutoDetectOptions>;
  /** Background color (hex number like 0x1a1a2e). Convenience option. */
  backgroundColor?: number;
  /** Enable physics. Pass true for defaults or PhysicsWorldOptions. */
  physics?: PhysicsWorldOptions | boolean;
  /** Show loading overlay during asset loading. */
  showLoadingScene?: boolean;
  /** Customize loading scene appearance. */
  loadingSceneOptions?: LoadingSceneOptions;
  /** Enable pixel-perfect rendering. Pass true for defaults. */
  pixelPerfect?: boolean | PixelPerfectOptions;
  /** Suppress right-click context menu on the canvas. Default false. */
  suppressContextMenu?: boolean;
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
 * import { setupMoxi, asEntity, Logic } from '@moxijs/core';
 * import { Assets } from 'pixi.js';
 *
 * // Simple rotation logic
 * class RotateLogic extends Logic<PIXI.Sprite> {
 *   speed = 0.02;
 *   update(entity: PIXI.Sprite, deltaTime: number) {
 *     entity.rotation += this.speed * deltaTime;
 *   }
 * }
 *
 * const { scene, engine, camera } = await setupMoxi({
 *   hostElement: document.getElementById('app'),
 *   renderOptions: { width: 1280, height: 720 },
 *   physics: true,
 *   pixelPerfect: true
 * });
 *
 * // Load texture
 * const texture = await Assets.load('./sprite.png');
 *
 * // Create entity with rotation logic
 * const sprite = asEntity(new PIXI.Sprite(texture));
 * sprite.anchor.set(0.5);
 * sprite.position.set(640, 360);
 * sprite.moxiEntity.addLogic(new RotateLogic());
 * scene.addChild(sprite);
 * scene.init();
 * engine.start();
 * ```
 */
export async function setupMoxi({
  hostElement,
  width,
  height,
  scaleMode = 'none',
  renderOptions = defaultRenderOptions,
  backgroundColor,
  physics,
  showLoadingScene = false,
  loadingSceneOptions = {},
  pixelPerfect,
  suppressContextMenu = false
} = {} as SetupMoxiArgs) {
  // Process pixel-perfect options
  let finalRenderOptions = { ...renderOptions };

  // Apply top-level width/height if provided (takes precedence over renderOptions)
  if (width !== undefined) {
    finalRenderOptions.width = width;
  }
  if (height !== undefined) {
    finalRenderOptions.height = height;
  }

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

  // Apply background color if specified
  if (backgroundColor !== undefined) {
    renderer.background.color = backgroundColor;
  }

  const canvas = renderer.canvas as HTMLCanvasElement;

  // Apply canvas CSS for pixel-perfect scaling if requested
  if (applyImageRendering) {
    canvas.style.imageRendering = 'pixelated';
    canvas.style.imageRendering = '-moz-crisp-edges';
    canvas.style.imageRendering = 'crisp-edges';
  }

  // Apply scale mode CSS
  if (scaleMode !== 'none') {
    applyScaleMode(hostElement, canvas, scaleMode, finalRenderOptions.width as number, finalRenderOptions.height as number);
  }

  // Suppress right-click context menu if requested
  if (suppressContextMenu) {
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
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

/**
 * Apply CSS styling for canvas scaling within host element.
 * @internal
 */
function applyScaleMode(
  hostElement: HTMLElement,
  canvas: HTMLCanvasElement,
  scaleMode: ScaleMode,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Host element styles for centering
  hostElement.style.display = 'flex';
  hostElement.style.alignItems = 'center';
  hostElement.style.justifyContent = 'center';
  hostElement.style.overflow = 'hidden';

  // Canvas styles based on scale mode
  switch (scaleMode) {
    case 'fit':
      // Letterbox/pillarbox: fit within container while maintaining aspect ratio
      canvas.style.maxWidth = '100%';
      canvas.style.maxHeight = '100%';
      canvas.style.width = 'auto';
      canvas.style.height = 'auto';
      canvas.style.aspectRatio = `${canvasWidth} / ${canvasHeight}`;
      canvas.style.objectFit = 'contain';
      break;

    case 'fill':
      // Fill container while maintaining aspect ratio (may crop)
      canvas.style.minWidth = '100%';
      canvas.style.minHeight = '100%';
      canvas.style.width = 'auto';
      canvas.style.height = 'auto';
      canvas.style.aspectRatio = `${canvasWidth} / ${canvasHeight}`;
      canvas.style.objectFit = 'cover';
      break;

    case 'stretch':
      // Stretch to fill (distorts)
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      break;
  }
}

