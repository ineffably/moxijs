import { Point } from 'pixi.js';
import { Behavior, PIXI } from '.';
import { Scene } from './scene';
import { AsEntity } from './moxi-entity';
import { MoxiBehaviors, MoxiEntity } from './moxi-entity';
import { lerp } from './utils';

export class CameraBehavior extends Behavior<PIXI.Container> {
  public speed: number = 0.1;
  public target: PIXI.Container = null;
  entity: PIXI.Container<PIXI.ContainerChild>;
  renderer: PIXI.Renderer<HTMLCanvasElement>;

  init(entity: PIXI.Container, renderer: PIXI.Renderer) {
    this.entity = entity;
    this.renderer = renderer;
  }

  update(entity: Camera, deltaTime: number) {
    const { speed } = this;
    const deltaSpeed = Math.min(deltaTime * speed, 1);

    if (this.target) {
      const pos = this.target.position;
      entity.desiredPosition.set(pos.x - this.renderer.width / 2, pos.y - this.renderer.height / 2)
    }

    if (entity.desiredScale !== entity.scale) {
      entity.scale.x = lerp(entity.scale.x, entity.desiredScale.x, deltaSpeed);
      entity.scale.y = lerp(entity.scale.y, entity.desiredScale.y, deltaSpeed);
    }

    if (entity.desiredPosition !== entity.position) {
      // TODO: create a virtual keyhole that allows the camrea to settle in a position
      entity.position.x = lerp(entity.position.x, entity.desiredPosition.x, deltaSpeed);
      entity.position.y = lerp(entity.position.y, entity.desiredPosition.y, deltaSpeed);
    }
    
    entity.scene.scale.set(entity.desiredScale.x, entity.desiredScale.y);
    entity.scene.position.set(-entity.desiredPosition.x, -entity.desiredPosition.y);  
  }
}

export class Camera extends PIXI.Container implements AsEntity<PIXI.Container> {
  public scene: Scene;
  public renderer: PIXI.Renderer;
  public speed: number = 0.1;
  public moxiEntity: MoxiEntity<PIXI.Container>;
  public desiredScale: Point = new Point(1, 1);
  public desiredPosition: Point = new Point(0, 0); 
  
  constructor(scene: Scene, renderer: PIXI.Renderer, behaviors: MoxiBehaviors<PIXI.Container> = {}) {
    super();
    this.scene = scene;
    this.renderer = renderer;

    const cameraBehavior = new CameraBehavior();
    cameraBehavior.init(this, renderer);
    this.moxiEntity = new MoxiEntity<PIXI.Container>(this, behaviors);
    this.moxiEntity.addBehavior(cameraBehavior);
    this.scene.addChild(this);
  }
 }  
