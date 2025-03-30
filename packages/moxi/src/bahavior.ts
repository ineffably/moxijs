import { Entity } from './entity';

export abstract class Behavior {
  entity: Entity;
  active: boolean = true;
  
  constructor(entity?: Entity) {
    if(entity){
      this.entity = entity;
    }
  }

  setEntity(entity: Entity) {
    this.entity = entity;
  }

  init(...args) {}

  update(deltaTime: number, entity?: Entity) {
    // Implement in subclass
  }
}

export class InstancedBehavior extends Behavior {}
