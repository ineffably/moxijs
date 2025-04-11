import { PIXI } from '.';

export abstract class Behavior<T> {
  active: boolean = true;
  
  init(entity?: T, renderer?: PIXI.Renderer<HTMLCanvasElement>, ...args: any[]) {
    // Implement in subclass
  }

  update(entity?: T, deltaTime?: number) {
    // Implement in subclass
  }
}

export class InstancedBehavior<T> extends Behavior<T> {}
