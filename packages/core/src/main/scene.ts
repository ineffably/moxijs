import PIXI from 'pixi.js';
import { AsEntity } from './moxi-entity';

function isMoxiEntity<T extends PIXI.Container>(entity: unknown): entity is AsEntity<T> {
  return entity != null && typeof entity === 'object' && 'moxiEntity' in entity;
}

/**
 * Root container for game objects. Extends PIXI.Container.
 * Automatically calls init/update on child entities created with asEntity().
 *
 * @example
 * ```ts
 * const scene = new Scene(renderer);
 * scene.addChild(asEntity(sprite));
 * scene.init();  // Calls init() on all entity logic
 * ```
 */
export class Scene extends PIXI.Container {
  renderer: PIXI.Renderer<HTMLCanvasElement>;

  constructor(renderer: PIXI.Renderer<HTMLCanvasElement>) {
    super();
    this.renderer = renderer;
  }

  /** Initialize all entity logic. Call once after adding entities. */
  init() {
    this.children.forEach((child) => {
      if (isMoxiEntity(child)) {
        child.moxiEntity.init(this.renderer);
      }
    });
  }

  /** Update all entity logic. Called automatically by Engine each frame. */
  update(deltaTime: number) {
    this.children.forEach((child) => {
      if (isMoxiEntity(child)) {
        child.moxiEntity.update(deltaTime);
      }
    });
  }

  /** Render the scene. Called automatically by Engine each frame. */
  draw(deltaTime: number) {
    try {
      this.renderer.render(this);
    } catch (err) {
      // Catch render errors (e.g., destroyed objects still in tree)
      console.warn('Scene render error:', err);
    }
  }
}