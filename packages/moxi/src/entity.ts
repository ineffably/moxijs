import PIXI from 'pixi.js';
import { Behavior } from './bahavior';

export class Entity extends PIXI.Sprite {
  behaviors: Record<string, Behavior> = {};

  constructor(texture = undefined) {
    super(texture);
  }

  init(...args) {
    for (const className in this.behaviors) {
      const behavior = this.behaviors[className];
      if(behavior.init && this){
        behavior.init(...args);
      }
    }
  }

  update(deltaTime: number) {
    for (const className in this.behaviors) {
      const behavior = this.behaviors[className];
      if(behavior.update && this && behavior.active){
        behavior.update(deltaTime, this); // Call the update method of each behavior
      }
    }
    
    this.children.forEach((child: any) => {
      if (child.update) {
        child.update(deltaTime);
      }
    });
  };

  getBehavior(name: string): Behavior | undefined {
    return this.behaviors[name];
  }

  addBehavior(behavior: Behavior) {
    console.log(behavior.constructor.name, 'added to entity');
    behavior.setEntity(this);
    const name = behavior.constructor.name as string;
    this.behaviors[name] = behavior; // Store the behavior class in the behaviors record
  }
}

