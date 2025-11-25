import PIXI, { Point } from 'pixi.js';
import { Logic } from './logic';
import { Scene } from './scene';
import { AsEntity, MoxiLogic, MoxiEntity } from './moxi-entity';
/**
 * Logic that handles camera movement, following targets, and smooth transitions.
 *
 * @category Logic
 * @implements {Logic<PIXI.Container>}
 */
export declare class CameraLogic extends Logic<PIXI.Container> {
    /**
     * Explicit name for the logic component (survives minification)
     */
    name: string;
    /**
     * Speed at which the camera transitions to its target position and scale
     * @default 0.1
     */
    speed: number;
    /**
     * The entity that the camera will follow
     * @default null
     */
    target: PIXI.Container;
    /**
     * The entity this logic is attached to
     */
    entity: PIXI.Container<PIXI.ContainerChild>;
    /**
     * Reference to the renderer for viewport calculations
     */
    renderer: PIXI.Renderer<HTMLCanvasElement>;
    /**
     * Initialize the camera logic
     * @param entity - The container (camera) this logic is attached to
     * @param renderer - The PIXI renderer instance
     */
    init(entity: PIXI.Container, renderer: PIXI.Renderer): void;
    /**
     * Updates the camera position and scale based on targets and desired values
     * @param entity - The Camera entity
     * @param deltaTime - Time elapsed since last update in seconds
     */
    update(entity: Camera, deltaTime: number): void;
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
 * camera.moxiEntity.getLogic<CameraLogic>('CameraLogic').target = player;
 *
 * // Set the camera zoom level
 * camera.desiredScale.set(2, 2); // 2x zoom
 * ```
 */
export declare class Camera extends PIXI.Container implements AsEntity<PIXI.Container> {
    /**
     * Reference to the scene being viewed by this camera
     */
    scene: Scene;
    /**
     * Reference to the renderer
     */
    renderer: PIXI.Renderer;
    /**
     * Speed at which the camera transitions
     * @default 0.1
     */
    speed: number;
    /**
     * MoxiEntity reference as required by the AsEntity interface
     */
    moxiEntity: MoxiEntity<PIXI.Container>;
    /**
     * The target scale (zoom) for the camera
     * @default new Point(1, 1)
     */
    desiredScale: Point;
    /**
     * The target position for the camera
     * @default new Point(0, 0)
     */
    desiredPosition: Point;
    /**
     * Creates a new Camera instance
     * @param scene - The scene being viewed by this camera
     * @param renderer - The PIXI renderer
     * @param logic - Additional logic to attach to this camera
     */
    constructor(scene: Scene, renderer: PIXI.Renderer, logic?: MoxiLogic<PIXI.Container>);
}
