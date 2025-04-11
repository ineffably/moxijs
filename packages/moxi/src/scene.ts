import PIXI from 'pixi.js';
import { AsEntity } from './moxi-entity';

function isMoxiEntity(entity: any): entity is AsEntity<any> {
  if(entity?.moxiEntity) {
    return true;
  }
  return false;
}

export class Scene extends PIXI.Container {
  renderer: PIXI.Renderer<HTMLCanvasElement>;

  constructor(renderer: PIXI.Renderer<HTMLCanvasElement>) {
    super();
    this.renderer = renderer;
  }

  init() {
    this.children.forEach((child: any) => {
      if (isMoxiEntity(child)) {
        child.moxiEntity.init(this.renderer);
      }
    });
  }


  update(deltaTime: number) {
    this.children.forEach((child: any) => { 
      if (isMoxiEntity(child)) {
        child.moxiEntity.update(deltaTime);
      }
    });
  }

  draw(deltaTime: number) {
    this.renderer.render(this);
  }
}