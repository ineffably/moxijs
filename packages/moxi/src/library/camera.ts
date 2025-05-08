import PIXI, { Point } from 'pixi.js';
import { Behavior } from '../core/bahavior';
import { Scene } from '../core/scene';
import { AsEntity, MoxiBehaviors, MoxiEntity } from '../core/moxi-entity';
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
    if (entity.desiredPosition !== entity.position) {
      entity.position.x = lerp(entity.position.x, entity.desiredPosition.x, deltaSpeed);
      entity.position.y = lerp(entity.position.y, entity.desiredPosition.y, deltaSpeed);
    }
    
    // Apply camera transformations to the scene
    // In PIXI, the "camera" effect is created by transforming the scene in the opposite direction
    entity.scene.scale.set(entity.scale.x, entity.scale.y);
    
    // Position the scene at the negative of the camera position to create camera movement effect
    entity.scene.position.set(-entity.position.x, -entity.position.y);
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
