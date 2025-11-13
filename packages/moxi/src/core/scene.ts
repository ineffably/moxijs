import PIXI from 'pixi.js';
import { AsEntity } from './moxi-entity';

function isMoxiEntity<T extends PIXI.Container>(entity: unknown): entity is AsEntity<T> {
  return entity != null && typeof entity === 'object' && 'moxiEntity' in entity;
}

export class Scene extends PIXI.Container {
  renderer: PIXI.Renderer<HTMLCanvasElement>;

  constructor(renderer: PIXI.Renderer<HTMLCanvasElement>) {
    super();
    this.renderer = renderer;
  }

  init() {
    this.children.forEach((child) => {
      if (isMoxiEntity(child)) {
        child.moxiEntity.init(this.renderer);
      }
    });
  }


  update(deltaTime: number) {
    this.children.forEach((child) => {
      if (isMoxiEntity(child)) {
        child.moxiEntity.update(deltaTime);
      }
    });
  }

  draw(deltaTime: number) {
    this.renderer.render(this);
  }
}