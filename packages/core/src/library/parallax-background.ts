import * as PIXI from 'pixi.js';
import { MoxiEntity, AsEntity, asEntity } from '../main/moxi-entity';
import { Logic } from '../main/logic';
import { Camera } from '../main/camera';
import { ParallaxLayer } from './parallax-layer';

export interface ParallaxBackgroundOptions {
  camera?: Camera;                    // Reference to camera (auto-detected if not provided)
  scrollOffset?: PIXI.Point;          // Base scroll offset
  scrollBaseScale?: PIXI.Point;       // Base scale multiplier
  scrollIgnoreCameraZoom?: boolean;   // Disable zoom affecting parallax
  autoscroll?: PIXI.Point;            // Automatic scrolling independent of camera
}

/**
 * Container for all parallax layers that manages global parallax behavior
 * and coordinates with the Camera system.
 *
 * Inspired by Godot's ParallaxBackground node.
 *
 * @example
 * ```typescript
 * const parallax = new ParallaxBackground();
 * const skyLayer = new TilingParallaxLayer({
 *   texture: skyTexture,
 *   scrollScale: new PIXI.Point(0.2, 0.2)
 * });
 * parallax.addLayer(skyLayer);
 * scene.addChild(parallax);
 * ```
 */
export class ParallaxBackground extends PIXI.Container implements AsEntity<PIXI.Container> {
  public moxiEntity: MoxiEntity<PIXI.Container>;
  public camera: Camera | null = null;
  public scrollOffset: PIXI.Point = new PIXI.Point(0, 0);
  public scrollBaseScale: PIXI.Point = new PIXI.Point(1, 1);
  public scrollIgnoreCameraZoom: boolean = false;
  public autoscroll: PIXI.Point = new PIXI.Point(0, 0);

  constructor(options: ParallaxBackgroundOptions = {}) {
    super();

    // Apply options
    this.camera = options.camera ?? null;
    this.scrollOffset = options.scrollOffset ?? new PIXI.Point(0, 0);
    this.scrollBaseScale = options.scrollBaseScale ?? new PIXI.Point(1, 1);
    this.scrollIgnoreCameraZoom = options.scrollIgnoreCameraZoom ?? false;
    this.autoscroll = options.autoscroll ?? new PIXI.Point(0, 0);

    // Convert to Moxi entity with ParallaxBackgroundLogic
    const entity = asEntity(this);
    entity.moxiEntity.addLogic(new ParallaxBackgroundLogic());
    this.moxiEntity = entity.moxiEntity;
  }

  /**
   * Adds a ParallaxLayer to the background
   */
  addLayer(layer: ParallaxLayer): void {
    this.addChild(layer);
  }

  /**
   * Auto-detect camera from scene hierarchy
   */
  private detectCamera(): Camera | null {
    let current = this.parent;
    while (current) {
      if (current instanceof Camera) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }

  /**
   * Get the effective camera position for parallax calculation
   */
  getCameraPosition(): PIXI.Point {
    const camera = this.camera ?? this.detectCamera();
    if (!camera) {
      return new PIXI.Point(0, 0);
    }

    // In MOXI's camera system, camera.position represents where the camera is looking
    // The scene is positioned at -camera.position to create the camera effect
    return new PIXI.Point(
      camera.position.x,
      camera.position.y
    );
  }

  /**
   * Get the effective camera scale/zoom for parallax calculation
   */
  getCameraScale(): PIXI.Point {
    if (this.scrollIgnoreCameraZoom) {
      return new PIXI.Point(1, 1);
    }

    const camera = this.camera ?? this.detectCamera();
    if (!camera) {
      return new PIXI.Point(1, 1);
    }

    return new PIXI.Point(camera.scale.x, camera.scale.y);
  }
}

/**
 * Logic component that updates the parallax background based on camera movement and autoscroll.
 */
export class ParallaxBackgroundLogic extends Logic<ParallaxBackground> {
  name = 'ParallaxBackgroundLogic';

  update(entity: ParallaxBackground, deltaTime: number) {
    // Apply autoscroll
    if (entity.autoscroll.x !== 0 || entity.autoscroll.y !== 0) {
      entity.scrollOffset.x += entity.autoscroll.x * deltaTime;
      entity.scrollOffset.y += entity.autoscroll.y * deltaTime;
    }

    // Get camera position for child layers to reference
    const cameraPos = entity.getCameraPosition();
    const cameraScale = entity.getCameraScale();

    // Position the ParallaxBackground to stay screen-aligned
    // Since ParallaxBackground is a child of scene with pivot at viewport center,
    // we need to counter-scale to keep layers at 1:1 screen scale
    const scene = entity.parent;
    if (scene) {
      // Position to stay centered on viewport despite camera movement
      // Account for scene scale since scene.position is scaled
      entity.position.x = cameraPos.x / scene.scale.x;
      entity.position.y = cameraPos.y / scene.scale.y;

      // Counter-scale to cancel inherited scene scale
      // This keeps TilingSprite sizing in screen-space coordinates
      entity.scale.x = 1 / scene.scale.x;
      entity.scale.y = 1 / scene.scale.y;
    } else {
      entity.position.x = cameraPos.x;
      entity.position.y = cameraPos.y;
      entity.scale.set(1, 1);
    }

    // Update all child ParallaxLayers
    entity.children.forEach((child: any) => {
      if (child instanceof ParallaxLayer) {
        child.updateParallax(cameraPos, cameraScale, entity.scrollOffset);
      }
    });
  }
}
