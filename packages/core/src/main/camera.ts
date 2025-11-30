import PIXI, { Point } from 'pixi.js';
import { Logic } from './logic';
import { Scene } from './scene';
import { AsEntity, MoxiLogic, MoxiEntity } from './moxi-entity';
import { lerp } from '../library/utils';

/**
 * Logic handling camera following and smooth transitions.
 * Attached automatically to Camera. Access via camera.moxiEntity.getLogic('CameraLogic').
 */
export class CameraLogic extends Logic<PIXI.Container> {
  name = 'CameraLogic';

  /** Interpolation speed (0-1). Higher = snappier. */
  public speed: number = 0.1;

  /** Entity to follow. Set to enable tracking. */
  public target: PIXI.Container = null;

  entity: PIXI.Container<PIXI.ContainerChild>;
  renderer: PIXI.Renderer<HTMLCanvasElement>;

  init(entity: PIXI.Container, renderer: PIXI.Renderer) {
    this.entity = entity;
    this.renderer = renderer;
  }

  /** @internal Smoothly updates camera position/scale each frame. */
  update(entity: Camera, deltaTime: number) {
    const { speed } = this;
    const deltaSpeed = Math.min(deltaTime * speed, 1);

    // Track if scale is actively changing (zooming)
    const isZooming = Math.abs(entity.scale.x - entity.desiredScale.x) > 0.01 ||
                      Math.abs(entity.scale.y - entity.desiredScale.y) > 0.01;

    // Interpolate scale values first
    if (entity.desiredScale !== entity.scale) {
      entity.scale.x = lerp(entity.scale.x, entity.desiredScale.x, deltaSpeed);
      entity.scale.y = lerp(entity.scale.y, entity.desiredScale.y, deltaSpeed);
    }

    // Update desired position if camera has a target
    if (this.target) {
      // In a PIXI.js camera system, we need to position the camera (scene)
      // so that the target appears centered in the viewport

      // Get the center of the viewport in screen coordinates
      const screenCenterX = this.renderer.width / 2;
      const screenCenterY = this.renderer.height / 2;

      // Calculate where the scene should be positioned
      // The formula is: -(targetPosition * scale) + screenCenter
      // This ensures the target is at the center of the screen
      const desiredX = -(this.target.position.x * entity.scale.x) + screenCenterX;
      const desiredY = -(this.target.position.y * entity.scale.y) + screenCenterY;

      // Set desired position for the scene (using negative values for camera coordinates)
      entity.desiredPosition.set(-desiredX, -desiredY);
    }

    // Interpolate position values
    // When actively zooming, update position instantly to keep target centered
    // Otherwise, interpolate smoothly for camera following
    if (entity.desiredPosition !== entity.position) {
      if (isZooming) {
        // Instant position update during zoom to prevent target drift
        entity.position.copyFrom(entity.desiredPosition);
      } else {
        // Smooth interpolation for normal camera following
        entity.position.x = lerp(entity.position.x, entity.desiredPosition.x, deltaSpeed);
        entity.position.y = lerp(entity.position.y, entity.desiredPosition.y, deltaSpeed);
      }
    }
    
    // Apply camera transformations to the scene
    // In PIXI, the "camera" effect is created by transforming the scene in the opposite direction
    entity.scene.scale.set(entity.scale.x, entity.scale.y);

    // Position the scene at the negative of the camera position to create camera movement effect
    entity.scene.position.set(-entity.position.x, -entity.position.y);
  }
}

/**
 * Viewport camera with smooth following and zoom.
 *
 * @example
 * ```ts
 * const { camera } = await setupMoxi({...});
 *
 * // Follow a target
 * camera.moxiEntity.getLogic<CameraLogic>('CameraLogic').target = player;
 *
 * // Zoom to 2x
 * camera.desiredScale.set(2, 2);
 *
 * // Pan to position
 * camera.desiredPosition.set(500, 300);
 * ```
 */
export class Camera extends PIXI.Container implements AsEntity<PIXI.Container> {
  /** Scene being viewed. */
  public scene: Scene;

  /** Renderer reference. */
  public renderer: PIXI.Renderer;

  /** Transition speed (0-1). */
  public speed: number = 0.1;

  /** MoxiEntity for attaching logic. */
  public moxiEntity: MoxiEntity<PIXI.Container>;

  /** Target zoom level. Set to animate zoom. */
  public desiredScale: Point = new Point(1, 1);

  /** Target position. Set to animate pan. */
  public desiredPosition: Point = new Point(0, 0);

  constructor(scene: Scene, renderer: PIXI.Renderer, logic: MoxiLogic<PIXI.Container> = {}) {
    super();
    this.scene = scene;
    this.renderer = renderer;

    // Initialize and attach the camera logic
    const cameraLogic = new CameraLogic();
    cameraLogic.init(this, renderer);
    this.moxiEntity = new MoxiEntity<PIXI.Container>(this, logic);
    this.moxiEntity.addLogic(cameraLogic);
    this.scene.addChild(this);
  }
}  

