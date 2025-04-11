import PIXI from 'pixi.js';
import { Behavior } from './bahavior';

interface MoxiEntityClass<T> {
  behaviors: MoxiBehaviors<T>;
  update: (delta: number, entity: T) => void;
  init: (...args: any[]) => void;
  addBehavior: (behavior: Behavior<T>) => void;
  getBehavior: (name: string) => Behavior<T> | undefined;
}

export type AsEntity<T> = PIXI.Container & {
  moxiEntity: MoxiEntity<T>;
};

type MoxiBehaviors<T> = Record<string, Behavior<T>>;

export class MoxiEntity<T> implements MoxiEntityClass<T> {
  behaviors: MoxiBehaviors<T> = {};
  entity: T;

  constructor(entity: T, behaviors: MoxiBehaviors<T> = {}) {
    this.behaviors = behaviors;
    this.entity = entity;
  }

  update(deltaTime: number) { 
    for (const className in this.behaviors) {
      const behavior = this.behaviors[className];
      if(behavior.update && this.entity && behavior.active){
        behavior.update(this.entity, deltaTime); 
      }
    }
  }
  
  init(renderer: PIXI.Renderer<HTMLCanvasElement>, ...args: any[]) {
    for (const className in this.behaviors) {
      const behavior = this.behaviors[className];
      if(behavior.init && this.entity){
        behavior.init(this.entity, renderer, ...args);
      }
    }
  } 

  addBehavior(behavior: Behavior<T>) {
    this.behaviors[behavior.constructor.name] = behavior;
  }

  getBehavior(name: string) {
    return this.behaviors[name];
  }
}

export function asEntity<T extends PIXI.Container>(entity: T, behaviors: MoxiBehaviors<T> = {}): AsEntity<T> {
  const target = entity;
  (target as unknown as AsEntity<T>).moxiEntity = new MoxiEntity<T>(target, behaviors);
  return entity as unknown as AsEntity<T>;
}



