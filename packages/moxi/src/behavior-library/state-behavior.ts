import { Behavior } from '../core/bahavior';
import { Container, Renderer } from 'pixi.js';

export class StateBehavior extends Behavior<Container> {
  private _entity: Container;
  private _name: string;

  constructor(name: string) {
    super();
    this._name = name;
  }

  get name() {
    return this._name;
  }

  get entity() {
    return this._entity;
  }

  init(entity: Container, renderer: Renderer) {
    this._entity = entity;
    super.init(entity, renderer);
  }

  onEnter(state: string) {
  }

  onExit(state: string) {
  }

  update(entity: Container, deltaTime: number) {
  }
  
}
