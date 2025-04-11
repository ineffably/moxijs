import { Point } from 'pixi.js';
import { Behavior, PIXI } from '.';
import { Scene } from './scene';
import { AsEntity } from './moxi-entity';
import { MoxiBehaviors, MoxiEntity } from './moxi-entity';
import { lerp } from './utils';

/**
 * Behavior that handles camera movement, following targets, and smooth transitions.
 * 
 * @category Behaviors
 * @implements {Behavior<PIXI.Container>}
 */
export class CameraBehavior extends Behavior<PIXI.Container> {
  /**
   * Speed at which the camera transitions to its target position and scale
   * @default 0.1
   */
  public speed: number = 0.1;
  
  /**
   * The entity that the camera will follow
   * @default null
   */
  public target: PIXI.Container = null;
  
  /**
   * The entity this behavior is attached to
   */
  entity: PIXI.Container<PIXI.ContainerChild>;
  
  /**
   * Reference to the renderer for viewport calculations
   */
  renderer: PIXI.Renderer<HTMLCanvasElement>;

  /**
   * Initialize the camera behavior
   * @param entity - The container (camera) this behavior is attached to
   * @param renderer - The PIXI renderer instance
   */
  init(entity: PIXI.Container, renderer: PIXI.Renderer) {
    this.entity = entity;
    this.renderer = renderer;
  }

  /**
   * Updates the camera position and scale based on targets and desired values
   * @param entity - The Camera entity
   * @param deltaTime - Time elapsed since last update in seconds
   */
  update(entity: Camera, deltaTime: number) {
    const { speed } = this;
    const deltaSpeed = Math.min(deltaTime * speed, 1);

    // Update desired position if camera has a target
    if (this.target) {
      const pos = this.target.position;
      entity.desiredPosition.set(pos.x - this.renderer.width / 2, pos.y - this.renderer.height / 2)
    }

    // Interpolate scale values
    if (entity.desiredScale !== entity.scale) {
      entity.scale.x = lerp(entity.scale.x, entity.desiredScale.x, deltaSpeed);
      entity.scale.y = lerp(entity.scale.y, entity.desiredScale.y, deltaSpeed);
    }

    // Interpolate position values
    if (entity.desiredPosition !== entity.position) {
      // TODO: create a virtual keyhole that allows the camera to settle in a position
      entity.position.x = lerp(entity.position.x, entity.desiredPosition.x, deltaSpeed);
      entity.position.y = lerp(entity.position.y, entity.desiredPosition.y, deltaSpeed);
    }
    
    // Apply camera transformations to the scene
    entity.scene.scale.set(entity.desiredScale.x, entity.desiredScale.y);
    entity.scene.position.set(-entity.desiredPosition.x, -entity.desiredPosition.y);  
  }
}

/**
 * Camera entity for controlling the viewport and following game objects.
 * The Camera applies transformations to the scene to simulate camera movement.
 * 
 * @category Core
 * @implements {AsEntity<PIXI.Container>}
 * 
 * @example
 * ```typescript
 * // Make the camera follow a player entity
 * camera.moxiEntity.getBehavior<CameraBehavior>('CameraBehavior').target = player;
 * 
 * // Set the camera zoom level
 * camera.desiredScale.set(2, 2); // 2x zoom
 * ```
 */
export class Camera extends PIXI.Container implements AsEntity<PIXI.Container> {
  /**
   * Reference to the scene being viewed by this camera
   */
  public scene: Scene;
  
  /**
   * Reference to the renderer
   */
  public renderer: PIXI.Renderer;
  
  /**
   * Speed at which the camera transitions
   * @default 0.1
   */
  public speed: number = 0.1;
  
  /**
   * MoxiEntity reference as required by the AsEntity interface
   */
  public moxiEntity: MoxiEntity<PIXI.Container>;
  
  /**
   * The target scale (zoom) for the camera
   * @default new Point(1, 1)
   */
  public desiredScale: Point = new Point(1, 1);
  
  /**
   * The target position for the camera
   * @default new Point(0, 0)
   */
  public desiredPosition: Point = new Point(0, 0); 
  
  /**
   * Creates a new Camera instance
   * @param scene - The scene being viewed by this camera
   * @param renderer - The PIXI renderer
   * @param behaviors - Additional behaviors to attach to this camera
   */
  constructor(scene: Scene, renderer: PIXI.Renderer, behaviors: MoxiBehaviors<PIXI.Container> = {}) {
    super();
    this.scene = scene;
    this.renderer = renderer;

    // Initialize and attach the camera behavior
    const cameraBehavior = new CameraBehavior();
    cameraBehavior.init(this, renderer);
    this.moxiEntity = new MoxiEntity<PIXI.Container>(this, behaviors);
    this.moxiEntity.addBehavior(cameraBehavior);
    this.scene.addChild(this);
  }
}  
